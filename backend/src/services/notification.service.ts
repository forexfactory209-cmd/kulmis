import { NotificationRepository } from '../repositories/notification.repository';
import { getIO } from '../lib/socket';

const notifRepo = new NotificationRepository();

export class NotificationService {
  async triggerNotification(data: {
    userId: string;
    title: string;
    content: string;
    type: string;
  }) {
    // 1. Persist to database
    const notification = await notifRepo.create(data);

    // 2. Broadcast via Socket.io to the user's specific room
    try {
      const io = getIO();
      io.to(data.userId).emit('new_notification', notification);
    } catch (e) {
      console.warn('Socket emit failed for notification:', e);
    }

    return notification;
  }
}
