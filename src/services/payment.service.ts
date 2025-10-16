import Stripe from 'stripe';
import { PaymentStatus } from '@prisma/client';
import prisma from '../config/prisma';
import { AppError } from '../utils/errors';
import { jobRepository } from '../repositories/job.repository';
import logger from '../utils/logger';

// Get Stripe API key from environment variables
const stripeApiKey = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe with proper error handling
let stripe: Stripe;

if (stripeApiKey) {
  stripe = new Stripe(stripeApiKey, {
    apiVersion: '2025-09-30.clover',
  });
} else {
  logger.warn('Stripe API key is missing. Payment functionality will be unavailable.');
}

// Job post price in cents (2 USD)
const JOB_POST_PRICE_USD = 2;
const JOB_POST_PRICE_CENTS = JOB_POST_PRICE_USD * 100;

export class PaymentService {

  // Create a payment session for a job posting
  async createJobPostPaymentSession(userId: string, jobId: string) {
    try {
      // Get job information
      const job = await jobRepository.findById(jobId);
      if (!job) {
        throw new AppError('Job not found', 404);
      }
      
      // Verify job belongs to user
      if (job.postedById !== userId) {
        throw new AppError('You are not authorized to pay for this job', 403);
      }
      
      // Check if job already has a successful payment
      const hasPayment = await jobRepository.hasSuccessfulPayment(jobId);
      if (hasPayment) {
        throw new AppError('This job post has already been paid for', 400);
      }
      
      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Job Post: ${job.title}`,
                description: 'Job posting fee on TalentHub',
              },
              unit_amount: JOB_POST_PRICE_CENTS,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/employer/jobs/${jobId}/payment-success`,
        cancel_url: `${process.env.FRONTEND_URL}/employer/jobs/${jobId}/payment-cancel`,
        metadata: {
          jobId,
          userId,
        },
      });
      
      // Create payment record in database
      await prisma.payment.create({
        data: {
          userId,
          jobId,
          amount: JOB_POST_PRICE_CENTS,
          currency: 'USD',
          provider: 'stripe',
          status: PaymentStatus.PENDING,
        },
      });
      
      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Payment session creation failed', 500);
    }
  }


  // Handle Stripe webhook events
  async handleStripeWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await this.handleSuccessfulPayment(
            session.metadata?.userId as string,
            session.metadata?.jobId as string
          );
          break;
        }
        
        case 'charge.failed': {
          const charge = event.data.object as Stripe.Charge;
          if (charge.metadata?.jobId) {
            await this.handleFailedPayment(
              charge.metadata?.userId as string,
              charge.metadata?.jobId as string
            );
          }
          break;
        }
      }
      
      return { received: true };
    } catch (error) {
      console.error('Webhook error:', error);
      throw new AppError('Webhook processing failed', 500);
    }
  }
  
  /**
   * Handle successful payment
   * @param userId User ID
   * @param jobId Job ID
   */
  private async handleSuccessfulPayment(userId: string, jobId: string) {
    // Update payment record
    await prisma.payment.updateMany({
      where: {
        userId,
        jobId,
        status: PaymentStatus.PENDING,
      },
      data: {
        status: PaymentStatus.SUCCESS,
      },
    });
    
    // Activate the job
    await jobRepository.update(jobId, {
      isActive: true,
    });
  }
  
  /**
   * Handle failed payment
   * @param userId User ID
   * @param jobId Job ID
   */
  private async handleFailedPayment(userId: string, jobId: string) {
    await prisma.payment.updateMany({
      where: {
        userId,
        jobId,
        status: PaymentStatus.PENDING,
      },
      data: {
        status: PaymentStatus.FAILED,
      },
    });
  }
  
  /**
   * Verify payment status for a job
   * @param jobId Job ID
   */
  async verifyJobPaymentStatus(jobId: string) {
    const payment = await prisma.payment.findFirst({
      where: {
        jobId,
        status: PaymentStatus.SUCCESS,
      },
    });
    
    return payment !== null;
  }
}

export const paymentService = new PaymentService();