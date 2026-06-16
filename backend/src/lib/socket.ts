import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { redisOptions } from './redis';
import { config } from '../config';
import { MessageRepository } from '../repositories/message.repository';

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
    },
  });

  const pubClient = new Redis(redisOptions);
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

  const msgRepo = new MessageRepository();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Join a conversation room
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Global user room for personal notifications
    socket.on('join_user', async (userId: string) => {
      socket.join(userId);
      (socket as any).userId = userId;
      console.log(`Socket ${socket.id} joined user room ${userId}`);
      
      // Broadcast that this user is now online
      io.emit('user_status_changed', { userId, status: 'online' });
    });

    socket.on('check_presence', async (userIds: string[]) => {
      const presence: Record<string, boolean> = {};
      for (const id of userIds) {
        const sockets = await io.in(id).fetchSockets();
        presence[id] = sockets.length > 0;
      }
      socket.emit('presence_result', presence);
    });

    socket.on('send_message', async (data: { conversationId: string; senderId: string; content: string }) => {
      try {
        const savedMessage = await msgRepo.sendMessage({
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.content,
        });

        // Broadcast to conversation room (excluding sender)
        socket.to(data.conversationId).emit('receive_message', savedMessage);
        
        // Let the sender know it was successfully delivered to DB
        socket.emit('message_sent_ack', savedMessage);

        // Fetch conversation participants to notify the other user
        const { prisma } = require('./prisma');
        const notifService = require('../services/notification.service');
        const convo = await prisma.conversation.findUnique({
          where: { id: data.conversationId },
          include: { users: { include: { user: true } } }
        });
        
        if (convo) {
          const otherUser = convo.users.find((u: any) => u.userId !== data.senderId);
          const senderUser = convo.users.find((u: any) => u.userId === data.senderId);
          if (otherUser) {
            const senderName = senderUser?.user?.firstName || 'Someone';
            const ns = new notifService.NotificationService();
            await ns.triggerNotification({
              userId: otherUser.userId,
              title: `New message from ${senderName}`,
              content: data.content,
              type: `MESSAGE|${data.conversationId}`
            });
          }
        }
      } catch (error) {
        console.error('Failed to persist socket message:', error);
        socket.emit('message_error', { error: 'Failed to send message', conversationId: data.conversationId });
      }
    });

    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);
      const userId = (socket as any).userId;
      if (userId) {
        // Check if user has any other active connections
        const sockets = await io.in(userId).fetchSockets();
        if (sockets.length === 0) {
          io.emit('user_status_changed', { userId, status: 'offline' });
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};
