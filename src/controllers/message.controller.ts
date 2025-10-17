import { Request, Response } from 'express';
import messageService from '../services/message.service';
import { ResponseFormatter } from '../utils/response';

class MessageController {
  async sendMessage(req: Request, res: Response): Promise<void> {
    const { receiverId, content, attachmentUrl } = req.body;
    const senderId = req.user?.userId;
    
    if (!senderId) {
      throw new Error('User not authenticated');
    }

    const message = await messageService.sendMessage(
      senderId,
      receiverId,
      content,
      attachmentUrl
    );

    ResponseFormatter.success(res, 'Message sent successfully', { message });
  }

  async getConversation(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const currentUserId = req.user?.userId;
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }
    
    const { limit, offset } = req.query;
    
    const messages = await messageService.getConversation(
      currentUserId,
      userId,
      limit ? parseInt(limit as string, 10) : 50,
      offset ? parseInt(offset as string, 10) : 0
    );

    ResponseFormatter.success(res, 'Conversation retrieved successfully', { messages });
  }

  async getUserConversations(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const conversations = await messageService.getUserConversations(userId);

    ResponseFormatter.success(res, 'User conversations retrieved successfully', { conversations });
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    const { senderId } = req.params;
    const currentUserId = req.user?.userId;
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }
    
    await messageService.markMessagesAsRead(senderId, currentUserId);

    ResponseFormatter.success(res, 'Messages marked as read successfully');
  }

  async getUnreadCount(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const count = await messageService.getUnreadMessagesCount(userId);

    ResponseFormatter.success(res, 'Unread message count retrieved successfully', { count });
  }
}

export default new MessageController();