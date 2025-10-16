import { jobRepository } from '../repositories/job.repository';
import { AppError } from '../utils/errors';
import { paymentService } from './payment.service';
import { CacheService } from './cache.service';

// Maximum number of free job posts allowed per employer
const MAX_FREE_JOB_POSTS = 3;

// Cache TTL in seconds
const CACHE_TTL = {
  JOB_LIST: 300, // 5 minutes
  JOB_DETAIL: 600, // 10 minutes
  USER_JOBS: 600 // 10 minutes
};

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
    
    // Generate a cache key based on query parameters
    const cacheKey = `jobs:list:${JSON.stringify({
      q, type, location, minSalary, maxSalary, active, page, pageSize
    })}`;
    
    // Try to get from cache first
    const cachedJobs = await CacheService.get(cacheKey);
    if (cachedJobs) {
      return cachedJobs;
    }
    
    // If not in cache, fetch from database
    const jobsResult = await jobRepository.findJobs({
      q: q as string,
      type: type as any,
      location: location as string,
      minSalary: minSalary ? parseInt(minSalary as string) : undefined,
      maxSalary: maxSalary ? parseInt(maxSalary as string) : undefined,
      active: active === 'true',
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string)
    });
    
    // Store in cache
    await CacheService.set(cacheKey, jobsResult, CACHE_TTL.JOB_LIST);
    
    return jobsResult;
  }
  
  /**
   * Get job by ID
   */
  async getJobById(jobId: string) {
    // Generate cache key
    const cacheKey = `jobs:detail:${jobId}`;
    
    // Try to get from cache first
    const cachedJob = await CacheService.get(cacheKey);
    if (cachedJob) {
      return cachedJob;
    }
    
    // If not in cache, fetch from database
    const job = await jobRepository.findById(jobId);
    
    if (!job) {
      throw new AppError('Job not found', 404);
    }
    
    // Store in cache
    await CacheService.set(cacheKey, job, CACHE_TTL.JOB_DETAIL);
    
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
    
    // Invalidate related caches
    await this.invalidateJobCache(jobId, job.postedById);
    
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
  
  // Invalidate related caches
  await this.invalidateJobCache(jobId, job.postedById);
  
  return true;
}

/**
 * Helper method to invalidate job-related cache entries
 */
private async invalidateJobCache(jobId: string, userId: string): Promise<void> {
  try {
    // Invalidate specific job cache
    await CacheService.delete(`jobs:detail:${jobId}`);
    
    // Invalidate user's jobs cache
    await CacheService.delete(`jobs:user:${userId}`);
    
    // Clear job listing caches based on pattern
    await CacheService.deleteByPattern('jobs:list:*');
  } catch (error) {
    // Log error but don't interrupt the flow for cache issues
    console.error('Error invalidating job caches:', error);
  }
}  /**
   * List jobs posted by a specific user
   */
  async getJobsByUser(userId: string) {
    // Check if user is authenticated
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }
    
    // Generate cache key
    const cacheKey = `jobs:user:${userId}`;
    
    // Try to get from cache first
    const cachedJobs = await CacheService.get(cacheKey);
    if (cachedJobs) {
      return cachedJobs;
    }
    
    // If not in cache, fetch from database
    const jobs = await jobRepository.findByUserId(userId);
    
    // Store in cache
    await CacheService.set(cacheKey, jobs, CACHE_TTL.USER_JOBS);
    
    return jobs;
    
    return jobs;
  }
}

export const jobService = new JobService();