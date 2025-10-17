import { Router } from 'express';
import messageController from '../controllers/message.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { 
  sendMessageValidator, 
  conversationParamsValidator, 
  markAsReadValidator
} from '../middlewares/validators/message.validators';

const router = Router();

/**
 * @route   POST /api/messages
 * @desc    Send a message to another user
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  sendMessageValidator,
  validate,
  messageController.sendMessage
);

/**
 * @route   GET /api/messages/conversation/:userId
 * @desc    Get conversation history with another user
 * @access  Private
 */
router.get(
  '/conversation/:userId',
  authenticate,
  conversationParamsValidator,
  validate,
  messageController.getConversation
);

/**
 * @route   GET /api/messages/conversations
 * @desc    Get all user conversations
 * @access  Private
 */
router.get(
  '/conversations',
  authenticate,
  messageController.getUserConversations
);

/**
 * @route   PUT /api/messages/read/:senderId
 * @desc    Mark messages from a specific user as read
 * @access  Private
 */
router.put(
  '/read/:senderId',
  authenticate,
  markAsReadValidator,
  validate,
  messageController.markAsRead
);

/**
 * @route   GET /api/messages/unread/count
 * @desc    Get count of unread messages
 * @access  Private
 */
router.get(
  '/unread/count',
  authenticate,
  messageController.getUnreadCount
);

export default router;