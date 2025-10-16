import { Request, Response } from 'express';
import { jobOfferService } from '../services/jobOffer.service';
import { AppError } from '../utils/errors';
import { ResponseFormatter } from '../utils/response';

export class JobOfferController {
  /**
   * Create a job offer
   */
  async createJobOffer(req: Request, res: Response) {
    try {
      const { applicationId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      // Only employers can create job offers
      if (userRole !== 'EMPLOYER' && userRole !== 'ADMIN') {
        throw new AppError('Only employers can create job offers', 403);
      }
      
      const jobOffer = await jobOfferService.createJobOffer(
        userId as string,
        applicationId,
        req.body
      );
      
      return ResponseFormatter.success(res, 'Job offer created successfully', jobOffer, 201);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to create job offer', error);
    }
  }

  /**
   * Get job offer details
   */
  async getJobOffer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      const jobOffer = await jobOfferService.getJobOfferById(
        id,
        userId as string,
        userRole as string
      );
      
      return ResponseFormatter.success(res, 'Job offer details retrieved successfully', jobOffer);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to retrieve job offer details', error);
    }
  }

  /**
   * Get job offers for logged in user
   */
  async getMyJobOffers(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const { status, page, limit } = req.query;
      
      let jobOffers;
      
      // Validate status is a valid enum value
      const validStatus = status && ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN'].includes(status as string) 
        ? status as 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'WITHDRAWN'
        : undefined;
      
      // Get job offers based on user role
      if (userRole === 'EMPLOYER') {
        jobOffers = await jobOfferService.getEmployerJobOffers(
          userId as string, 
          { 
            status: validStatus,
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined
          }
        );
      } else if (userRole === 'CANDIDATE') {
        jobOffers = await jobOfferService.getCandidateJobOffers(
          userId as string, 
          { 
            status: validStatus,
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined
          }
        );
      } else {
        throw new AppError('Invalid user role', 400);
      }
      
      return ResponseFormatter.success(res, 'Job offers retrieved successfully', jobOffers);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to retrieve job offers', error);
    }
  }

  /**
   * Get job offers for an application
   */
  async getApplicationJobOffers(req: Request, res: Response) {
    try {
      const { applicationId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      const jobOffers = await jobOfferService.getApplicationJobOffers(
        applicationId,
        userId as string,
        userRole as string
      );
      
      return ResponseFormatter.success(res, 'Application job offers retrieved successfully', jobOffers);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to retrieve application job offers', error);
    }
  }

  /**
   * Withdraw a job offer (employer only)
   */
  async withdrawJobOffer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const { reason } = req.body;
      
      const jobOffer = await jobOfferService.withdrawJobOffer(
        id,
        userId as string,
        userRole as string,
        reason
      );
      
      return ResponseFormatter.success(res, 'Job offer withdrawn successfully', jobOffer);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to withdraw job offer', error);
    }
  }

  /**
   * Accept a job offer (candidate only)
   */
  async acceptJobOffer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      const jobOffer = await jobOfferService.acceptJobOffer(
        id,
        userId as string,
        userRole as string
      );
      
      return ResponseFormatter.success(res, 'Job offer accepted successfully', jobOffer);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to accept job offer', error);
    }
  }

  /**
   * Reject a job offer (candidate only)
   */
  async rejectJobOffer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const { reason } = req.body;
      
      const jobOffer = await jobOfferService.rejectJobOffer(
        id,
        userId as string,
        userRole as string,
        reason
      );
      
      return ResponseFormatter.success(res, 'Job offer rejected successfully', jobOffer);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to reject job offer', error);
    }
  }
}

export const jobOfferController = new JobOfferController();