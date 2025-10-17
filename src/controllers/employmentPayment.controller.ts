import { Request, Response } from 'express';
import { AppError } from '../utils/errors';
import { ResponseFormatter } from '../utils/response';
import { employmentPaymentService } from '../services/employmentPayment.service';

export class EmploymentPaymentController {
  /**
   * Create a payment session for an employer to pay a candidate
   */
  async createEmploymentPaymentSession(req: Request, res: Response) {
    try {
      const { candidateId, jobOfferId, amount } = req.body;
      const { description } = req.body;
      const employerId = req.user?.userId as string;
      
      const paymentSession = await employmentPaymentService.createEmploymentPaymentSession(
        employerId,
        candidateId,
        jobOfferId,
        amount,
        description
      );
      
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
   * Verify payment session success
   */
  async verifyPaymentSuccess(req: Request, res: Response) {
    try {
      const { session_id } = req.query;
      
      if (!session_id || typeof session_id !== 'string') {
        throw new AppError('Invalid session ID', 400);
      }
      
      const result = await employmentPaymentService.handleSuccessfulEmploymentPayment(session_id);
      
      return ResponseFormatter.success(
        res,
        'Payment verified successfully',
        result
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
      return ResponseFormatter.error(res, 'Failed to verify payment', error);
    }
  }
  
  /**
   * Get payments made by an employer
   */
  async getEmployerPayments(req: Request, res: Response) {
    try {
      const employerId = req.user?.userId as string;
      
      const payments = await employmentPaymentService.getEmployerPayments(employerId);
      
      return ResponseFormatter.success(
        res,
        'Employer payments retrieved successfully',
        payments
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
      return ResponseFormatter.error(res, 'Failed to retrieve employer payments', error);
    }
  }
  
  /**
   * Get payments received by a candidate
   */
  async getCandidatePayments(req: Request, res: Response) {
    try {
      const candidateId = req.user?.userId as string;
      
      const payments = await employmentPaymentService.getCandidatePayments(candidateId);
      
      return ResponseFormatter.success(
        res,
        'Candidate payments retrieved successfully',
        payments
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
      return ResponseFormatter.error(res, 'Failed to retrieve candidate payments', error);
    }
  }
}

export const employmentPaymentController = new EmploymentPaymentController();