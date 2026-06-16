"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const prisma_1 = require("../lib/prisma");
class NotificationRepository {
    async findByUser(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            prisma_1.prisma.notification.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.prisma.notification.count({ where: { userId } }),
        ]);
        return { notifications, total, page, limit };
    }
    async markAsRead(id, userId) {
        return prisma_1.prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        return prisma_1.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
    async create(data) {
        return prisma_1.prisma.notification.create({ data });
    }
}
exports.NotificationRepository = NotificationRepository;
