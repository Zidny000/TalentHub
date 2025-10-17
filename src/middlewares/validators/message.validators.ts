import { body, param } from 'express-validator';

export const sendMessageValidator = [
  body('receiverId')
    .isString()
    .notEmpty()
    .withMessage('Receiver ID is required'),

  body('content')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Content must be a non-empty string'),

  body('attachmentUrl')
    .optional()
    .isString()
    .isURL()
    .withMessage('Attachment URL must be a valid URL'),

  // Ensure at least one of content or attachmentUrl is present
  body()
    .custom((body) => {
      if (!body.content && !body.attachmentUrl) {
        throw new Error('Either content or attachmentUrl must be provided');
      }
      return true;
    })
];

export const conversationParamsValidator = [
  param('userId')
    .isString()
    .notEmpty()
    .withMessage('User ID is required')
];

export const markAsReadValidator = [
  param('senderId')
    .isString()
    .notEmpty()
    .withMessage('Sender ID is required')
];

export const paginationValidator = [
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  body('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
];