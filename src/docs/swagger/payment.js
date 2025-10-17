/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentSession:
 *       type: object
 *       properties:
 *         sessionId:
 *           type: string
 *           description: Stripe session ID
 *         url:
 *           type: string
 *           description: URL to redirect user to for payment
 */

/**
 * @swagger
 * /api/v1/payments/jobs/{id}/payment:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Create payment session for job posting
 *     description: Creates a Stripe checkout session for a job posting payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Payment session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PaymentSession'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only employers can access this endpoint
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 *
 * /api/v1/payments/webhook/stripe:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Stripe webhook endpoint
 *     description: Endpoint for Stripe webhook events
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook signature
 *       500:
 *         description: Webhook processing error
 */