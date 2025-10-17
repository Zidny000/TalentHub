import Stripe from 'stripe';
// Use the enum directly from prisma schema
// This is a workaround since the Prisma client might not have been generated yet
enum EmploymentPaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}
import prisma from '../config/prisma';
import { AppError } from '../utils/errors';
import { employmentPaymentRepository } from '../repositories/employmentPayment.repository';
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

export class EmploymentPaymentService {

  /**
   * Create a payment session for an employer to pay a candidate
   * @param employerId Employer user ID
   * @param candidateId Candidate user ID
   * @param jobOfferId Job offer ID
   * @param amount Payment amount in cents
   * @param description Optional payment description
   */
  async createEmploymentPaymentSession(
    employerId: string, 
    candidateId: string, 
    jobOfferId: string, 
    amount: number,
    description?: string
  ) {
    try {
      // Validate that the job offer exists and belongs to this employer and candidate
      const jobOffer = await prisma.jobOffer.findUnique({
        where: { id: jobOfferId },
        include: {
          candidate: {
            select: { name: true, email: true }
          },
          employer: {
            select: { name: true, email: true }
          }
        }
      });

      if (!jobOffer) {
        throw new AppError('Job offer not found', 404);
      }
      
      if (jobOffer.employerId !== employerId) {
        throw new AppError('You are not authorized to make this payment', 403);
      }
      
      if (jobOffer.candidateId !== candidateId) {
        throw new AppError('Candidate does not match the job offer', 400);
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Payment to ${jobOffer.candidate.name}`,
                description: description || `Payment for job: ${jobOffer.title}`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/employer/payments/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/employer/payments/cancel`,
        metadata: {
          jobOfferId,
          employerId,
          candidateId,
          paymentType: 'employment'
        },
      });
      
      // Create payment record in database
      await employmentPaymentRepository.create({
        employerId,
        candidateId,
        jobOfferId,
        amount,
        description,
        provider: 'stripe',
        stripeSessionId: session.id,
        status: EmploymentPaymentStatus.PENDING,
        currency: 'USD',
      });
      
      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Employment payment session creation failed', error);
      throw new AppError('Payment session creation failed', 500);
    }
  }

  /**
   * Handle successful employment payment
   * @param sessionId Stripe session ID
   */
  async handleSuccessfulEmploymentPayment(sessionId: string) {
    try {
      // Find the payment record
      const payment = await employmentPaymentRepository.findByStripeSessionId(sessionId);
      
      if (!payment) {
        throw new AppError('Payment record not found', 404);
      }
      
      // Update payment status
      await employmentPaymentRepository.updateStatus(payment.id, EmploymentPaymentStatus.SUCCESS);
      
      // You could trigger additional actions here, like:
      // - Send notification to the candidate
      // - Update job offer status
      // - Generate payment receipt
      
      return { success: true };
    } catch (error) {
      logger.error('Failed to handle successful employment payment', error);
      throw new AppError('Failed to process payment', 500);
    }
  }
  
  /**
   * Handle failed employment payment
   * @param sessionId Stripe session ID
   */
  async handleFailedEmploymentPayment(sessionId: string) {
    try {
      // Find the payment record
      const payment = await employmentPaymentRepository.findByStripeSessionId(sessionId);
      
      if (!payment) {
        throw new AppError('Payment record not found', 404);
      }
      
      // Update payment status
      await employmentPaymentRepository.updateStatus(payment.id, EmploymentPaymentStatus.FAILED);
      
      return { success: true };
    } catch (error) {
      logger.error('Failed to handle failed employment payment', error);
      throw new AppError('Failed to process payment failure', 500);
    }
  }
  
  /**
   * Get all payments made by an employer
   * @param employerId Employer user ID
   */
  async getEmployerPayments(employerId: string) {
    try {
      const payments = await employmentPaymentRepository.getEmployerPayments(employerId);
      return payments;
    } catch (error) {
      logger.error('Failed to get employer payments', error);
      throw new AppError('Failed to retrieve payments', 500);
    }
  }
  
  /**
   * Get all payments received by a candidate
   * @param candidateId Candidate user ID
   */
  async getCandidatePayments(candidateId: string) {
    try {
      const payments = await employmentPaymentRepository.getCandidatePayments(candidateId);
      return payments;
    } catch (error) {
      logger.error('Failed to get candidate payments', error);
      throw new AppError('Failed to retrieve payments', 500);
    }
  }
}

export const employmentPaymentService = new EmploymentPaymentService();