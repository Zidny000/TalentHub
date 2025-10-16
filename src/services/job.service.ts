import { jobRepository } from '../repositories/job.repository';
import { AppError } from '../utils/errors';
import { paymentService } from './payment.service';

// Maximum number of free job posts allowed per employer
const MAX_FREE_JOB_POSTS = 3;

export class JobService {
  /**
   * Create a new job posting
   */
  async createJob(userId: string, userRole: string, jobData: any) {
    // Check if user is authenticated
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }
    
    // Check if user is an employer
    if (userRole !== 'EMPLOYER' && userRole !== 'ADMIN') {
      throw new AppError('Only employers can post jobs', 403);
    }
    
    const {
      title,
      description,
      requirements,
      location,
      type,
      salaryMin,
      salaryMax,
      isPaidPost = false
    } = jobData;
    
    // Check free job post quota if this is not a paid post
    if (!isPaidPost) {
      const freeJobCount = await jobRepository.countFreeJobsByUser(userId);
      
      if (freeJobCount >= MAX_FREE_JOB_POSTS) {
        // Convert this to a paid post since free quota is exceeded
        jobData.isPaidPost = true;
      }
    }
    
    // Create the job
    const job = await jobRepository.create({
      title,
      description,
      requirements,
      location,
      type,
      salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
      salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
      isPaidPost: jobData.isPaidPost,
      postedById: userId,
      // If paid post, it starts as inactive until payment is confirmed
      isActive: !jobData.isPaidPost || userRole === 'ADMIN'
    });
    
    // For paid posts, inform user that payment is required
    let message = 'Job posted successfully';
    let paymentRequired = false;
    let paymentSession = null;
    
    if (jobData.isPaidPost && userRole !== 'ADMIN') {
      message = 'Job created but requires payment to activate';
      paymentRequired = true;
      
      // Return job ID for payment flow
      return { 
        job, 
        message, 
        paymentRequired, 
        paymentSession: null  // Will be created separately
      };
    }
    
    return { job, message, paymentRequired, paymentSession };
  }
  
  /**
   * List jobs with filters and pagination
   */
  async listJobs(queryParams: any) {
    const {
      q,
      type,
      location,
      minSalary,
      maxSalary,
      active = 'true',
      page = '1',
      pageSize = '20'
    } = queryParams;
    
    return await jobRepository.findJobs({
      q: q as string,
      type: type as any,
      location: location as string,
      minSalary: minSalary ? parseInt(minSalary as string) : undefined,
      maxSalary: maxSalary ? parseInt(maxSalary as string) : undefined,
      active: active === 'true',
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string)
    });
  }
  
  /**
   * Get job by ID
   */
  async getJobById(jobId: string) {
    const job = await jobRepository.findById(jobId);
    
    if (!job) {
      throw new AppError('Job not found', 404);
    }
    
    return job;
  }
  
  /**
   * Update job
   */
  async updateJob(jobId: string, userId: string, userRole: string, updateData: any) {
    // Check if user is authenticated
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }
    
    // Retrieve the job
    const job = await jobRepository.findById(jobId);
    
    if (!job) {
      throw new AppError('Job not found', 404);
    }
    
    // Check if user is the owner or an admin
    if (job.postedById !== userId && userRole !== 'ADMIN') {
      throw new AppError('You are not authorized to update this job', 403);
    }
    
    const {
      title,
      description,
      requirements,
      location,
      type,
      salaryMin,
      salaryMax
    } = updateData;
    
    // Update the job
    const updatedJob = await jobRepository.update(jobId, {
      title,
      description,
      requirements,
      location,
      type,
      salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
      salaryMax: salaryMax ? parseInt(salaryMax) : undefined
    });
    
    return updatedJob;
  }
  
  /**
   * Delete job (soft delete)
   */
  async deleteJob(jobId: string, userId: string, userRole: string) {
    // Check if user is authenticated
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }
    
    // Retrieve the job
    const job = await jobRepository.findById(jobId);
    
    if (!job) {
      throw new AppError('Job not found', 404);
    }
    
    // Check if user is the owner or an admin
    if (job.postedById !== userId && userRole !== 'ADMIN') {
      throw new AppError('You are not authorized to delete this job', 403);
    }
    
    // Soft delete the job
    await jobRepository.softDelete(jobId);
    
    return true;
  }
  
  /**
   * List jobs posted by a specific user
   */
  async getJobsByUser(userId: string) {
    // Check if user is authenticated
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }
    
    const jobs = await jobRepository.findByUserId(userId);
    
    return jobs;
  }
}

export const jobService = new JobService();