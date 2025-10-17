// WebSocket client documentation
/**
 * TalentHub WebSocket Client Documentation
 * 
 * This document describes how to use the WebSocket API for real-time messaging in the TalentHub platform.
 * The WebSocket server is built on socket.io, so you should use the socket.io client in your frontend application.
 * 
 * 1. SETUP
 * 
 * Install socket.io-client:
 * ```
 * npm install socket.io-client
 * ```
 * 
 * 2. CONNECTION & AUTHENTICATION
 * 
 * ```javascript
 * import { io } from 'socket.io-client';
 * 
 * // Create a connection
 * const socket = io('http://localhost:3000');
 * 
 * // Listen for connection events
 * socket.on('connect', () => {
 *   console.log('Connected to WebSocket server');
 *   
 *   // Authenticate with your user token
 *   socket.emit('authenticate', { 
 *     userId: 'your-user-id',
 *     token: 'your-jwt-token'
 *   });
 * });
 * 
 * // Handle authentication response
 * socket.on('authenticated', (response) => {
 *   if (response.success) {
 *     console.log('Successfully authenticated');
 *   } else {
 *     console.error('Authentication failed:', response.error);
 *   }
 * });
 * ```
 * 
 * 3. SENDING MESSAGES
 * 
 * ```javascript
 * // Send a private message
 * function sendMessage(receiverId, content, attachmentUrl = null) {
 *   socket.emit('private_message', {
 *     receiverId,
 *     content,
 *     attachmentUrl
 *   });
 * }
 * 
 * // Listen for message sent confirmation
 * socket.on('message_sent', (response) => {
 *   if (response.success) {
 *     console.log('Message sent successfully, ID:', response.messageId);
 *   } else {
 *     console.error('Failed to send message:', response.error);
 *   }
 * });
 * ```
 * 
 * 4. RECEIVING MESSAGES
 * 
 * ```javascript
 * // Listen for incoming messages
 * socket.on('new_message', (message) => {
 *   console.log('New message received:', message);
 *   // message = {id, senderId, content, attachmentUrl, createdAt}
 *   
 *   // Mark the message as read
 *   markAsRead(message.senderId);
 * });
 * ```
 * 
 * 5. MARKING MESSAGES AS READ
 * 
 * ```javascript
 * // Mark messages from a specific sender as read
 * function markAsRead(senderId) {
 *   socket.emit('mark_read', {
 *     senderId
 *   });
 * }
 * 
 * // Listen for read confirmation
 * socket.on('marked_read', (response) => {
 *   if (response.success) {
 *     console.log('Messages marked as read');
 *   } else {
 *     console.error('Failed to mark messages as read:', response.error);
 *   }
 * });
 * 
 * // Listen for when the other user reads your messages
 * socket.on('messages_read', (data) => {
 *   console.log(`Your messages were read by ${data.by} at ${data.at}`);
 * });
 * ```
 * 
 * 6. TYPING INDICATORS
 * 
 * ```javascript
 * // Show when you're typing
 * function sendTypingStatus(receiverId, isTyping) {
 *   socket.emit('typing', {
 *     receiverId,
 *     isTyping
 *   });
 * }
 * 
 * // Listen for typing indicators
 * socket.on('user_typing', (data) => {
 *   if (data.isTyping) {
 *     console.log(`User ${data.userId} is typing...`);
 *   } else {
 *     console.log(`User ${data.userId} stopped typing`);
 *   }
 * });
 * ```
 * 
 * 7. DISCONNECTION
 * 
 * ```javascript
 * // Handle disconnection
 * socket.on('disconnect', () => {
 *   console.log('Disconnected from WebSocket server');
 * });
 * 
 * // Manually disconnect
 * function disconnect() {
 *   socket.disconnect();
 * }
 * ```
 */