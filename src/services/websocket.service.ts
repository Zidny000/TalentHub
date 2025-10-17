import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import logger from '../utils/logger';

// Interface for connected user data
interface ConnectedUser {
  socketId: string;
  userId: string;
}

class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, ConnectedUser> = new Map();

  // Initialize the WebSocket server with the HTTP server
  initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST']
      }
    });

    this.setupSocketEvents();
    logger.info('WebSocket server initialized');
  }

  // Set up socket event handlers
  private setupSocketEvents(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      logger.info(`New client connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', (data: { userId: string, token: string }) => {
        try {
          // In production, you'd verify the token here
          const { userId } = data;
          
          // Store user connection info
          this.connectedUsers.set(userId, {
            socketId: socket.id,
            userId
          });
          
          socket.join(`user:${userId}`); // Add user to their personal room
          logger.info(`User ${userId} authenticated and joined room`);
          
          socket.emit('authenticated', { success: true });
        } catch (error) {
          logger.error('Authentication error:', error);
          socket.emit('authenticated', { success: false, error: 'Authentication failed' });
        }
      });

      // Handle private messages
      socket.on('private_message', async (data: { receiverId: string, content: string, attachmentUrl?: string }) => {
        const { receiverId, content, attachmentUrl } = data;
        const senderInfo = this.getUserBySocketId(socket.id);
        
        if (!senderInfo) {
          socket.emit('error', { message: 'You must authenticate first' });
          return;
        }
        
        try {
          // Dynamically import to avoid circular dependency
          const messageService = (await import('./message.service')).default;
          
          // Save the message to database and notify recipient
          const message = await messageService.sendMessage(
            senderInfo.userId,
            receiverId,
            content,
            attachmentUrl
          );
          
          // Confirm to sender that message was sent
          socket.emit('message_sent', { 
            success: true, 
            messageId: message.id,
            status: message.status
          });
          
          logger.info(`WebSocket message from ${senderInfo.userId} to ${receiverId} processed`);
        } catch (error) {
          logger.error('Error sending message via WebSocket:', error);
          socket.emit('message_sent', { success: false, error: 'Failed to send message' });
        }
      });

      // Handle typing events
      socket.on('typing', (data: { receiverId: string, isTyping: boolean }) => {
        const { receiverId, isTyping } = data;
        const senderInfo = this.getUserBySocketId(socket.id);
        
        if (!senderInfo) return;
        
        // Emit to the receiver that someone is typing
        this.emitToUser(receiverId, 'user_typing', {
          userId: senderInfo.userId,
          isTyping
        });
      });
      
      // Handle read receipts
      socket.on('mark_read', async (data: { senderId: string }) => {
        const { senderId } = data;
        const receiverInfo = this.getUserBySocketId(socket.id);
        
        if (!receiverInfo) {
          socket.emit('error', { message: 'You must authenticate first' });
          return;
        }
        
        try {
          // Dynamically import to avoid circular dependency
          const messageService = (await import('./message.service')).default;
          
          // Mark messages as read
          await messageService.markMessagesAsRead(senderId, receiverInfo.userId);
          
          socket.emit('marked_read', { success: true });
          
          logger.info(`Messages from ${senderId} marked as read by ${receiverInfo.userId}`);
        } catch (error) {
          logger.error('Error marking messages as read:', error);
          socket.emit('marked_read', { success: false, error: 'Failed to mark messages as read' });
        }
      });

      // Handle user disconnection
      socket.on('disconnect', () => {
        const userId = this.removeSocketUser(socket.id);
        if (userId) {
          logger.info(`User ${userId} disconnected`);
        } else {
          logger.info(`Client disconnected: ${socket.id}`);
        }
      });
    });
  }

  // Get user info by socket id
  private getUserBySocketId(socketId: string): ConnectedUser | undefined {
    for (const [_, userData] of this.connectedUsers.entries()) {
      if (userData.socketId === socketId) {
        return userData;
      }
    }
    return undefined;
  }

  // Remove user when socket disconnects
  private removeSocketUser(socketId: string): string | undefined {
    let disconnectedUserId: string | undefined;
    
    for (const [userId, userData] of this.connectedUsers.entries()) {
      if (userData.socketId === socketId) {
        disconnectedUserId = userId;
        this.connectedUsers.delete(userId);
        break;
      }
    }
    
    return disconnectedUserId;
  }

  // Send a message to a specific user
  emitToUser(userId: string, event: string, data: any): boolean {
    if (!this.io) return false;
    
    const userRoom = `user:${userId}`;
    this.io.to(userRoom).emit(event, data);
    return true;
  }

  // Broadcast a message to all connected users
  broadcast(event: string, data: any): void {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  // Check if a user is online
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Get all online users
  getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }
}

export default new WebSocketService();