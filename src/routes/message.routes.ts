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

// Private - Send a message to another user
router.post(
  '/',
  authenticate,
  sendMessageValidator,
  validate,
  messageController.sendMessage
);


// Private -Get conversation history with another user
router.get(
  '/conversation/:userId',
  authenticate,
  conversationParamsValidator,
  validate,
  messageController.getConversation
);


// Private - Get all user conversations
router.get(
  '/conversations',
  authenticate,
  messageController.getUserConversations
);


// Private - Mark messages from a specific user as read

router.put(
  '/read/:senderId',
  authenticate,
  markAsReadValidator,
  validate,
  messageController.markAsRead
);

// Private - Get count of unread messages
router.get(
  '/unread/count',
  authenticate,
  messageController.getUnreadCount
);

export default router;