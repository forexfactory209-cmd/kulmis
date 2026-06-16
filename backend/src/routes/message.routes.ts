import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { MessageRepository } from '../repositories/message.repository';
import { NotificationService } from '../services/notification.service';
import { prisma } from '../lib/prisma';

const router = Router();
const msgRepo = new MessageRepository();
const notifService = new NotificationService();

router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const conversations = await msgRepo.getConversations(req.user!.userId);
    res.json({ success: true, data: conversations });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

router.get('/conversations/:conversationId/details', authMiddleware, async (req, res) => {
  try {
    const convo = await prisma.conversation.findUnique({
      where: { id: req.params.conversationId as string },
      include: {
        users: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
          }
        }
      }
    });
    if (!convo) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    
    // Format to match msgRepo.getConversations format for the other user
    const participants = convo.users.map((u: any) => ({
      id: u.user.id,
      firstName: u.user.firstName,
      lastName: u.user.lastName,
      avatarUrl: u.user.avatarUrl
    })).filter((u: any) => u.id !== req.user!.userId);

    res.json({ success: true, data: { ...convo, participants } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

router.get('/:conversationId', authMiddleware, async (req, res) => {
  try {
    const { page, limit } = req.query as Record<string, string | undefined>;
    const messages = await msgRepo.getMessages(req.params.conversationId as string, Number(page) || 1, Number(limit) || 50);
    res.json({ success: true, data: messages });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

router.post('/:conversationId', authMiddleware, async (req, res) => {
  try {
    const message = await msgRepo.sendMessage({
      conversationId: req.params.conversationId as string,
      senderId: req.user!.userId,
      content: req.body.content,
    });

    // Notify the other participant via push notification
    try {
      const convo = await prisma.conversation.findUnique({
        where: { id: req.params.conversationId as string },
        include: { users: { include: { user: true } } },
      });
      if (convo) {
        const otherUser = convo.users.find((u) => u.userId !== req.user!.userId);
        const senderUser = convo.users.find((u) => u.userId === req.user!.userId);
        if (otherUser) {
          const senderName = senderUser?.user?.firstName || 'Someone';
          await notifService.triggerNotification({
            userId: otherUser.userId,
            title: `New message from ${senderName}`,
            content: req.body.content,
            type: `MESSAGE|${req.params.conversationId}`,
          });
        }
      }
    } catch (notifErr) {
      console.warn('Failed to send message notification:', notifErr);
    }

    res.status(201).json({ success: true, data: message });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

router.post('/conversations/create', authMiddleware, async (req, res) => {
  try {
    const { participantId } = req.body;
    const conversation = await msgRepo.createConversation([req.user!.userId, participantId]);
    res.status(201).json({ success: true, data: conversation });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

router.put('/:conversationId/read', authMiddleware, async (req, res) => {
  try {
    await msgRepo.markAsRead(req.params.conversationId as string, req.user!.userId);
    res.json({ success: true, message: 'Conversation marked as read' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

router.delete('/conversations/:conversationId', authMiddleware, async (req, res) => {
  try {
    await msgRepo.deleteConversation(req.params.conversationId as string, req.user!.userId);
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

export default router;
