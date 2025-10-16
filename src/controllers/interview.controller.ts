import { Request, Response } from 'express';
import { interviewService } from '../services/interview.service';
import { AppError } from '../utils/errors';
import { ResponseFormatter } from '../utils/response';

export class InterviewController {
  /**
   * Schedule a new interview
   */
  async scheduleInterview(req: Request, res: Response) {
    try {
      const { applicationId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      // Only employers can schedule interviews
      if (userRole !== 'EMPLOYER' && userRole !== 'ADMIN') {
        throw new AppError('Only employers can schedule interviews', 403);
      }
      
      const interview = await interviewService.scheduleInterview(
        userId as string,
        applicationId,
        req.body
      );
      
      return ResponseFormatter.success(res, 'Interview scheduled successfully', interview, 201);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to schedule interview', error);
    }
  }

  /**
   * Get interview details
   */
  async getInterview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      const interview = await interviewService.getInterviewById(
        id,
        userId as string,
        userRole as string
      );
      
      return ResponseFormatter.success(res, 'Interview details retrieved successfully', interview);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to retrieve interview details', error);
    }
  }

  /**
   * Get interviews for logged in user
   */
  async getMyInterviews(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const { status, page, limit } = req.query;
      
      let interviews;
      
      // Get interviews based on user role
      if (userRole === 'EMPLOYER') {
        // Validate status is a valid enum value
        const validStatus = status && ['SCHEDULED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED'].includes(status as string) 
          ? status as 'SCHEDULED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED'
          : undefined;
          
        interviews = await interviewService.getEmployerInterviews(
          userId as string, 
          { 
            status: validStatus,
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined
          }
        );
      } else if (userRole === 'CANDIDATE') {
        // Validate status is a valid enum value
        const validStatus = status && ['SCHEDULED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED'].includes(status as string) 
          ? status as 'SCHEDULED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED'
          : undefined;
          
        interviews = await interviewService.getCandidateInterviews(
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
      
      return ResponseFormatter.success(res, 'Interviews retrieved successfully', interviews);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to retrieve interviews', error);
    }
  }

  /**
   * Get interviews for an application
   */
  async getApplicationInterviews(req: Request, res: Response) {
    try {
      const { applicationId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      const interviews = await interviewService.getApplicationInterviews(
        applicationId,
        userId as string,
        userRole as string
      );
      
      return ResponseFormatter.success(res, 'Application interviews retrieved successfully', interviews);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to retrieve application interviews', error);
    }
  }

  /**
   * Update an interview
   */
  async updateInterview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      const interview = await interviewService.updateInterview(
        id,
        userId as string,
        userRole as string,
        req.body
      );
      
      return ResponseFormatter.success(res, 'Interview updated successfully', interview);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to update interview', error);
    }
  }

  /**
   * Cancel an interview
   */
  async cancelInterview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const { reason } = req.body;
      
      const interview = await interviewService.cancelInterview(
        id,
        userId as string,
        userRole as string,
        reason
      );
      
      return ResponseFormatter.success(res, 'Interview cancelled successfully', interview);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to cancel interview', error);
    }
  }

  /**
   * Complete an interview
   */
  async completeInterview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const { feedback } = req.body;
      
      const interview = await interviewService.completeInterview(
        id,
        userId as string,
        userRole as string,
        feedback
      );
      
      return ResponseFormatter.success(res, 'Interview completed successfully', interview);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to complete interview', error);
    }
  }
}

export const interviewController = new InterviewController();