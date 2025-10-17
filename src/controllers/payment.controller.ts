import { Request, Response } from 'express';
import { AppError } from '../utils/errors';
import { ResponseFormatter } from '../utils/response';
import { paymentService } from '../services/payment.service';
import Stripe from 'stripe';
import logger from '../utils/logger';

// Initialize Stripe with the secret key if available
let stripe: Stripe | null = null;

try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    });
  } else {
    logger.warn('Stripe API key is missing. Payment functionality will be unavailable.', { service: 'talenthub-api' });
  }
} catch (error) {
  logger.error('Error initializing Stripe client:', error);
}

export class PaymentController {
  /**
   * Create a payment session for job posting
   */
  async createJobPostPaymentSession(req: Request, res: Response) {
    try {
      // Check if Stripe is initialized
      if (!stripe) {
        throw new AppError('Payment service is not available', 503);
      }
      
      const { jobId } = req.params;
      const userId = req.user?.userId as string;
      
      const paymentSession = await paymentService.createJobPostPaymentSession(userId, jobId);
      
      return ResponseFormatter.success(
        res, 
        'Payment session created successfully', 
        paymentSession
      );
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(
          res, 
          error.message, 
          error.errorDetails, 
          error.statusCode
        );
      }
      return ResponseFormatter.error(res, 'Failed to create payment session', error);
    }
  }
  
  /**
   * Handle Stripe webhook
   */
  async handleStripeWebhook(req: Request, res: Response) {
    try {
      // Check if Stripe is initialized
      if (!stripe) {
        throw new AppError('Payment service is not available', 503);
      }
      
      // Verify webhook signature
      const signature = req.headers['stripe-signature'] as string;
      
      if (!signature) {
        throw new AppError('Webhook signature missing', 400);
      }
      
      let event: Stripe.Event;
      
      try {
        // Verify the signature using Stripe's utility
        event = stripe.webhooks.constructEvent(
          req.body, // Raw request body
          signature,
          process.env.STRIPE_WEBHOOK_SECRET || ''
        );
      } catch (err: any) {
        throw new AppError(`Webhook signature verification failed: ${err.message}`, 400);
      }
      
      // Handle webhook event
      await paymentService.handleStripeWebhook(event);
      
      // Return a 200 response to acknowledge receipt of the webhook
      return ResponseFormatter.success(res, 'Webhook processed successfully');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(
          res, 
          error.message, 
          error.errorDetails, 
          error.statusCode
        );
      }
      return ResponseFormatter.error(res, 'Failed to process webhook', error);
    }
  }
}

export const paymentController = new PaymentController();