import { Request, Response } from 'express';
import { jobService } from '../services/job.service';
import { AppError } from '../utils/errors';
import { ResponseFormatter } from '../utils/response';
import { paymentService } from '../services/payment.service';

export class JobController {
  /**
   * Create a new job posting
   */
  async create(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      // Call job service to create the job
      const { job, message, paymentRequired } = await jobService.createJob(
        userId as string, 
        userRole as string, 
        req.body
      );
      
      // If payment is required, return job with payment redirection info
      if (paymentRequired) {
        return ResponseFormatter.success(res, message, {
          job,
          paymentRequired: true,
          paymentUrl: `/api/payments/jobs/${job.id}/payment`
        }, 201);
      }
      
      return ResponseFormatter.success(res, message, job, 201);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to create job', error);
    }
  }
  
  /**
   * List jobs with filters and pagination
   */
  async list(req: Request, res: Response) {
    try {
      // Call job service to list jobs
      const result = await jobService.listJobs(req.query);
      
      return ResponseFormatter.success(res, 'Jobs retrieved successfully', result);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to retrieve jobs', error);
    }
  }
  
  /**
   * Get job by ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Call job service to get job by ID
      const job = await jobService.getJobById(id);
      
      return ResponseFormatter.success(res, 'Job retrieved successfully', job);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to retrieve job', error);
    }
  }
  
  /**
   * Update job
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      // Call job service to update the job
      const updatedJob = await jobService.updateJob(
        id,
        userId as string,
        userRole as string,
        req.body
      );
      
      return ResponseFormatter.success(res, 'Job updated successfully', updatedJob);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to update job', error);
    }
  }
  
  /**
   * Delete job (soft delete)
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      // Call job service to delete the job
      await jobService.deleteJob(
        id,
        userId as string,
        userRole as string
      );
      
      return ResponseFormatter.success(res, 'Job deleted successfully');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to delete job', error);
    }
  }
  
  /**
   * List jobs posted by the current user
   */
  async getMyJobs(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      // Call job service to get jobs by user
      const jobs = await jobService.getJobsByUser(userId as string);
      
      return ResponseFormatter.success(res, 'Jobs retrieved successfully', jobs);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to retrieve jobs', error);
    }
  }
}

export const jobController = new JobController();