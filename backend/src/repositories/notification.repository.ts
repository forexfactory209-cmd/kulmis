import { prisma } from '../lib/prisma';

export class NotificationRepository {
  async findByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId } }),
    ]);
    return { notifications, total, page, limit };
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false }
    });
  }

  async create(data: { userId: string; title: string; content: string; type: string }) {
    return prisma.notification.create({ data });
  }

  async deleteByType(userId: string, typePrefix: string) {
    return prisma.notification.deleteMany({
      where: {
        userId,
        type: { startsWith: typePrefix }
      }
    });
  }
}
