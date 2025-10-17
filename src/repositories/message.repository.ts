import { Message, Prisma } from '@prisma/client';
import prisma from '../config/prisma';

class MessageRepository {
  async create(data: Prisma.MessageCreateInput): Promise<Message> {
    return prisma.message.create({ data });
  }

  async findById(id: string): Promise<Message | null> {
    return prisma.message.findUnique({ where: { id } });
  }

  async getConversation(user1Id: string, user2Id: string, limit = 50, offset = 0): Promise<Message[]> {
    return prisma.message.findMany({
      where: {
        OR: [
          { senderId: user1Id, receiverId: user2Id },
          { senderId: user2Id, receiverId: user1Id }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    });
  }

  async getUserConversations(userId: string): Promise<any[]> {
    // This query gets distinct users the current user has exchanged messages with
    const sentMessages = await prisma.message.findMany({
      where: { senderId: userId },
      select: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      distinct: ['receiverId']
    });

    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: userId },
      select: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      distinct: ['senderId']
    });

    // Combine and format the results
    const sentUsers = sentMessages.map(m => ({
      user: m.receiver,
      lastMessageAt: m.createdAt
    }));
    
    const receivedUsers = receivedMessages.map(m => ({
      user: m.sender,
      lastMessageAt: m.createdAt
    }));

    // Combine both arrays, remove duplicates and sort by most recent message
    const allUsers = [...sentUsers, ...receivedUsers]
      .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

    // Remove duplicates by user ID
    const seen = new Set();
    return allUsers.filter(item => {
      const duplicate = seen.has(item.user.id);
      seen.add(item.user.id);
      return !duplicate;
    });
  }

  async markAsRead(senderId: string, receiverId: string): Promise<Prisma.BatchPayload> {
    return prisma.message.updateMany({
      where: {
        senderId: senderId,
        receiverId: receiverId,
        status: { not: 'READ' }
      },
      data: {
        status: 'READ'
      }
    });
  }

  async markAsDelivered(senderId: string, receiverId: string): Promise<Prisma.BatchPayload> {
    return prisma.message.updateMany({
      where: {
        senderId: senderId,
        receiverId: receiverId,
        status: 'SENT'
      },
      data: {
        status: 'DELIVERED'
      }
    });
  }

  async countUnreadMessages(userId: string): Promise<number> {
    return prisma.message.count({
      where: {
        receiverId: userId,
        status: { not: 'READ' }
      }
    });
  }
}

export default new MessageRepository();