import { Request, Response } from 'express';
import { applicationService } from '../services/application.service';
import { AppError } from '../utils/errors';
import { ResponseFormatter } from '../utils/response';

export class ApplicationController {
  /**
   * Apply to a job
   */
  async applyToJob(req: Request, res: Response) {
    try {
      const { id: jobId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      // Call application service to apply to job
      const application = await applicationService.applyToJob(
        jobId,
        userId as string,
        userRole as string,
        req.body
      );
      
      return ResponseFormatter.success(res, 'Application submitted successfully', application, 201);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to submit application', error);
    }
  }

  /**
   * Get applications for a job
   */
  async getJobApplications(req: Request, res: Response) {
    try {
      const { id: jobId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      // Call application service to get job applications
      const applications = await applicationService.getJobApplications(
        jobId,
        userId as string,
        userRole as string
      );
      
      return ResponseFormatter.success(res, 'Applications retrieved successfully', applications);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to retrieve applications', error);
    }
  }

  /**
   * Get application details
   */
  async getApplicationDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      // Call application service to get application details
      const application = await applicationService.getApplicationDetails(
        id,
        userId as string,
        userRole as string
      );
      
      return ResponseFormatter.success(res, 'Application retrieved successfully', application);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to retrieve application', error);
    }
  }

  /**
   * Export job applications as CSV
   */
  async exportJobApplications(req: Request, res: Response) {
    try {
      const { id: jobId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      // Call application service to export job applications
      const filePath = await applicationService.exportJobApplications(
        jobId,
        userId as string,
        userRole as string
      );
      
      // Return file path for direct download
      return res.download(filePath);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to export applications', error);
    }
  }
}

export const applicationController = new ApplicationController();