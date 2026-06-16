import { prisma } from '../lib/prisma';

export class MessageRepository {
  async getConversations(userId: string) {
    const userConvos = await prisma.userConversation.findMany({
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

    const result = await Promise.all(userConvos.map(async (uc) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: uc.conversation.id,
          senderId: { not: userId },
          createdAt: uc.lastReadAt ? { gt: uc.lastReadAt } : undefined
        }
      });

      return {
        id: uc.conversation.id,
        lastMessage: uc.conversation.messages[0] || null,
        participants: uc.conversation.users.map((u) => u.user).filter((u) => u.id !== userId),
        unreadCount,
        updatedAt: uc.conversation.updatedAt,
      };
    }));
    return result;
  }

  async markAsRead(conversationId: string, userId: string) {
    return prisma.userConversation.update({
      where: {
        userId_conversationId: {
          userId,
          conversationId
        }
      },
      data: {
        lastReadAt: new Date()
      }
    });
  }

  async getMessages(conversationId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  async sendMessage(data: { conversationId: string; senderId: string; content: string }) {
    const message = await prisma.message.create({
      data,
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });
    return message;
  }

  async createConversation(userIds: string[]) {
    if (userIds.length >= 2) {
      const existingUserConvos = await prisma.userConversation.findMany({
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

      const matchingConvo = existingUserConvos.find(uc => 
        uc.conversation.users.some(u => u.userId === userIds[1])
      );

      if (matchingConvo) {
        return matchingConvo.conversation;
      }
    }

    const conversation = await prisma.conversation.create({
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

  async deleteConversation(conversationId: string, userId: string) {
    return prisma.userConversation.delete({
      where: {
        userId_conversationId: {
          userId,
          conversationId
        }
      }
    });
  }
}
