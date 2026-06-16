import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationService } from '../services/notification.service';

const router = Router();
const notifRepo = new NotificationRepository();
const notifService = new NotificationService();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page, limit } = req.query as Record<string, string | undefined>;
    const data = await notifRepo.findByUser(req.user!.userId, Number(page) || 1, Number(limit) || 20);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await notifRepo.getUnreadCount(req.user!.userId);
    res.json({ success: true, data: { count } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    await notifRepo.markAsRead(req.params.id as string, req.user!.userId);
    res.json({ success: true, message: 'Marked as read' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await notifRepo.markAllAsRead(req.user!.userId);
    res.json({ success: true, message: 'All marked as read' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

router.post('/trigger', authMiddleware, async (req, res) => {
  try {
    const { targetUserId, title, content, type } = req.body;
    if (!targetUserId || !title || !content || !type) {
      return res.status(400).json({ success: false, error: { message: 'Missing required fields' } });
    }
    const notification = await notifService.triggerNotification({
      userId: targetUserId,
      title,
      content,
      type
    });
    res.json({ success: true, data: notification });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e.message } });
  }
});

export default router;
