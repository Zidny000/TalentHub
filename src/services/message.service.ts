import { Prisma } from '@prisma/client';
import messageRepository from '../repositories/message.repository';
import { AppError } from '../utils/errors';
import websocketService from './websocket.service';

class MessageService {
  async sendMessage(senderId: string, receiverId: string, content: string, attachmentUrl?: string): Promise<any> {
    if (senderId === receiverId) {
      throw new AppError('Cannot send messages to yourself', 400);
    }

    if (!content && !attachmentUrl) {
      throw new AppError('Message must have content or attachment', 400);
    }

    // Create message in the database
    const message = await messageRepository.create({
      sender: { connect: { id: senderId } },
      receiver: { connect: { id: receiverId } },
      content,
      attachmentUrl,
      status: 'SENT'
    });
    
    // Emit the message via WebSocket if the user is online
    if (websocketService.isUserOnline(receiverId)) {
      websocketService.emitToUser(receiverId, 'new_message', {
        id: message.id,
        senderId,
        content,
        attachmentUrl,
        createdAt: message.createdAt
      });
      
      // If recipient is online, mark as delivered
      await messageRepository.markAsDelivered(senderId, receiverId);
      message.status = 'DELIVERED';
    }
    
    return message;
  }

  async getConversation(user1Id: string, user2Id: string, limit = 50, offset = 0): Promise<any[]> {
    const messages = await messageRepository.getConversation(user1Id, user2Id, limit, offset);
    
    // Mark messages as read if the current user is the receiver
    await messageRepository.markAsRead(user2Id, user1Id);
    
    return messages;
  }

  async getUserConversations(userId: string): Promise<any[]> {
    return messageRepository.getUserConversations(userId);
  }

  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    await messageRepository.markAsRead(senderId, receiverId);
    
    // Notify the sender that their messages have been read
    if (websocketService.isUserOnline(senderId)) {
      websocketService.emitToUser(senderId, 'messages_read', {
        by: receiverId,
        at: new Date()
      });
    }
  }

  async getUnreadMessagesCount(userId: string): Promise<number> {
    return messageRepository.countUnreadMessages(userId);
  }
}

export default new MessageService();