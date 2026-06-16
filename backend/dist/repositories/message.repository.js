"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRepository = void 0;
const prisma_1 = require("../lib/prisma");
class MessageRepository {
    async getConversations(userId) {
        const userConvos = await prisma_1.prisma.userConversation.findMany({
            where: { userId },
            include: {
                conversation: {
                    include: {
                        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                        users: {
                            include: {
                                user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                            },
                        },
                    },
                },
            },
        });
        return userConvos.map((uc) => ({
            id: uc.conversation.id,
            lastMessage: uc.conversation.messages[0] || null,
            participants: uc.conversation.users.map((u) => u.user).filter((u) => u.id !== userId),
            updatedAt: uc.conversation.updatedAt,
        }));
    }
    async getMessages(conversationId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        return prisma_1.prisma.message.findMany({
            where: { conversationId },
            include: {
                sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
    }
    async sendMessage(data) {
        const message = await prisma_1.prisma.message.create({
            data,
            include: {
                sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            },
        });
        await prisma_1.prisma.conversation.update({
            where: { id: data.conversationId },
            data: { updatedAt: new Date() },
        });
        return message;
    }
    async createConversation(userIds) {
        if (userIds.length >= 2) {
            const existingUserConvos = await prisma_1.prisma.userConversation.findMany({
                where: {
                    userId: userIds[0],
                },
                include: {
                    conversation: {
                        include: {
                            users: {
                                include: {
                                    user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
                                }
                            }
                        }
                    }
                }
            });
            const matchingConvo = existingUserConvos.find(uc => uc.conversation.users.some(u => u.userId === userIds[1]));
            if (matchingConvo) {
                return matchingConvo.conversation;
            }
        }
        const conversation = await prisma_1.prisma.conversation.create({
            data: {
                users: {
                    create: userIds.map((userId) => ({ userId })),
                },
            },
            include: {
                users: {
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                    },
                },
            },
        });
        return conversation;
    }
}
exports.MessageRepository = MessageRepository;
