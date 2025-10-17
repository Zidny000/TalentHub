/**
 * @swagger
 * components:
 *  schemas:
 *    Message:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *          description: The message ID
 *        senderId:
 *          type: string
 *          description: The user who sent the message
 *        receiverId:
 *          type: string
 *          description: The user who received the message
 *        content:
 *          type: string
 *          description: The message content
 *        attachmentUrl:
 *          type: string
 *          description: URL to any attached file (optional)
 *        status:
 *          type: string
 *          enum: [SENT, DELIVERED, READ]
 *          description: The message status
 *        createdAt:
 *          type: string
 *          format: date-time
 *          description: The date the message was sent
 *        updatedAt:
 *          type: string
 *          format: date-time
 *          description: The date the message was last updated
 *      required:
 *        - id
 *        - senderId
 *        - receiverId
 *        - content
 *        - status
 *        - createdAt
 *        - updatedAt
 */

/**
 * @swagger
 * components:
 *  schemas:
 *    SendMessageRequest:
 *      type: object
 *      properties:
 *        receiverId:
 *          type: string
 *          description: User ID of the message recipient
 *        content:
 *          type: string
 *          description: Text content of the message
 *        attachmentUrl:
 *          type: string
 *          description: URL to an attachment (optional)
 *      required:
 *        - receiverId
 */

/**
 * @swagger
 * components:
 *  schemas:
 *    ConversationUser:
 *      type: object
 *      properties:
 *        user:
 *          type: object
 *          properties:
 *            id:
 *              type: string
 *            name:
 *              type: string
 *            email:
 *              type: string
 *            role:
 *              type: string
 *        lastMessageAt:
 *          type: string
 *          format: date-time
 */

/**
 * @swagger
 * tags:
 *  name: Messages
 *  description: Message management API
 */

/**
 * @swagger
 * /api/v1/messages:
 *   post:
 *     summary: Send a new message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Message sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/v1/messages/conversation/{userId}:
 *   get:
 *     summary: Get conversation history with a user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to get conversation with
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Maximum number of messages to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of messages to skip
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Conversation retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/v1/messages/conversations:
 *   get:
 *     summary: Get all conversations for the current user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User conversations retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     conversations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ConversationUser'
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/v1/messages/read/{senderId}:
 *   put:
 *     summary: Mark messages from a user as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: senderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose messages to mark as read
 *     responses:
 *       200:
 *         description: Messages marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Messages marked as read successfully
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/v1/messages/unread/count:
 *   get:
 *     summary: Get count of unread messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread message count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Unread message count retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Not authenticated
 */