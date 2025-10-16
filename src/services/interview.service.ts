import { interviewRepository } from '../repositories/interview.repository';
import { applicationRepository } from '../repositories/application.repository';
import { CacheService } from './cache.service';
import { AppError } from '../utils/errors';

// Cache TTL in seconds
const CACHE_TTL = {
  INTERVIEW_LIST: 300, // 5 minutes
  INTERVIEW_DETAIL: 600, // 10 minutes
  APPLICATION_INTERVIEWS: 300 // 5 minutes
};

export class InterviewService {
  /**
   * Schedule a new interview
   */
  async scheduleInterview(employerId: string, applicationId: string, interviewData: {
    scheduledAt: string;
    duration: number;
    location?: string;
    description?: string;
  }) {
    // Validate application exists
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      throw new AppError('Application not found', 404);
    }

    // Get the job to check authorization
    const jobId = application.jobId;
    const jobRepository = await import('../repositories/job.repository');
    const job = await jobRepository.jobRepository.findById(jobId);
    
    if (!job) {
      throw new AppError('Job not found for this application', 404);
    }
    
    if (job.postedById !== employerId) {
      throw new AppError('Not authorized to schedule interviews for this application', 403);
    }

    // Prepare interview data
    const interviewInfo = {
      applicationId,
      employerId,
      candidateId: application.applicantId,
      scheduledAt: new Date(interviewData.scheduledAt),
      duration: interviewData.duration,
      location: interviewData.location,
      description: interviewData.description,
      status: 'SCHEDULED' as const
    };

    // Create the interview
    return interviewRepository.create(interviewInfo);
  }

  /**
   * Get interview details
   */
  async getInterviewById(id: string, userId: string, userRole: string) {
    const interview = await interviewRepository.findById(id);
    
    if (!interview) {
      throw new AppError('Interview not found', 404);
    }

    // Check permissions
    if (userRole === 'ADMIN' || 
        interview.employerId === userId || 
        interview.candidateId === userId) {
      return interview;
    } else {
      throw new AppError('Not authorized to view this interview', 403);
    }
  }

  /**
   * Get interviews for employer
   */
  async getEmployerInterviews(employerId: string, options?: { 
    status?: 'SCHEDULED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED', 
    page?: number, 
    limit?: number 
  }) {
    return interviewRepository.findByEmployerId(employerId, options);
  }

  /**
   * Get interviews for candidate
   */
  async getCandidateInterviews(candidateId: string, options?: { 
    status?: 'SCHEDULED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED', 
    page?: number, 
    limit?: number 
  }) {
    return interviewRepository.findByCandidateId(candidateId, options);
  }

  /**
   * Get interviews for a specific application
   */
  async getApplicationInterviews(applicationId: string, userId: string, userRole: string) {
    // Get application to check permissions
    const application = await applicationRepository.findById(applicationId);
    
    if (!application) {
      throw new AppError('Application not found', 404);
    }

    // Get job to check permissions
    const jobId = application.jobId;
    const jobRepository = await import('../repositories/job.repository');
    const job = await jobRepository.jobRepository.findById(jobId);
    
    if (!job) {
      throw new AppError('Job not found for this application', 404);
    }
    
    // Check permissions
    if (userRole === 'ADMIN' || 
        job.postedById === userId || 
        application.applicantId === userId) {
      return interviewRepository.findByApplicationId(applicationId);
    } else {
      throw new AppError('Not authorized to view interviews for this application', 403);
    }
  }

  /**
   * Update interview
   */
  async updateInterview(id: string, userId: string, userRole: string, updateData: any) {
    const interview = await interviewRepository.findById(id);
    
    if (!interview) {
      throw new AppError('Interview not found', 404);
    }

    // Check permissions
    if (userRole !== 'ADMIN' && interview.employerId !== userId) {
      throw new AppError('Not authorized to update this interview', 403);
    }

    // Handle reschedule - update status
    if (updateData.scheduledAt && 
        updateData.scheduledAt !== interview.scheduledAt.toISOString()) {
      updateData.status = 'RESCHEDULED';
    }

    const updatedInterview = await interviewRepository.update(id, updateData);
    
    // Invalidate cache for this interview and related caches
    await this.invalidateInterviewCache(id, interview.employerId, interview.candidateId, interview.applicationId);
    
    return updatedInterview;
  }

  /**
   * Cancel interview
   */
  async cancelInterview(id: string, userId: string, userRole: string, reason?: string) {
    const interview = await interviewRepository.findById(id);
    
    if (!interview) {
      throw new AppError('Interview not found', 404);
    }

    // Check permissions - both employer and candidate can cancel
    if (userRole !== 'ADMIN' && 
        interview.employerId !== userId && 
        interview.candidateId !== userId) {
      throw new AppError('Not authorized to cancel this interview', 403);
    }

    // Update status to cancelled and add reason if provided
    const updateData: any = {
      status: 'CANCELLED'
    };

    if (reason) {
      updateData.feedback = reason;
    }

    const updatedInterview = await interviewRepository.update(id, updateData);
    
    // Invalidate cache for this interview and related caches
    await this.invalidateInterviewCache(id, interview.employerId, interview.candidateId, interview.applicationId);
    
    return updatedInterview;
  }

  /**
   * Complete interview and add feedback
   */
  async completeInterview(id: string, userId: string, userRole: string, feedback?: string) {
    const interview = await interviewRepository.findById(id);
    
    if (!interview) {
      throw new AppError('Interview not found', 404);
    }

    // Only employer can mark as completed
    if (userRole !== 'ADMIN' && interview.employerId !== userId) {
      throw new AppError('Not authorized to complete this interview', 403);
    }

    // Update status to completed and add feedback if provided
    const updateData: any = {
      status: 'COMPLETED'
    };

    if (feedback) {
      updateData.feedback = feedback;
    }

    const updatedInterview = await interviewRepository.update(id, updateData);
    
    // Invalidate cache for this interview and related caches
    await this.invalidateInterviewCache(id, interview.employerId, interview.candidateId, interview.applicationId);
    
    return updatedInterview;
  }
  
  /**
   * Helper method to invalidate interview-related cache entries
   */
  private async invalidateInterviewCache(
    interviewId: string, 
    employerId: string, 
    candidateId: string, 
    applicationId: string
  ): Promise<void> {
    try {
      // Invalidate specific interview cache
      await CacheService.delete(`interviews:detail:${interviewId}`);
      
      // Invalidate user's interviews caches (both employer and candidate)
      await CacheService.delete(`interviews:user:${employerId}`);
      await CacheService.delete(`interviews:user:${candidateId}`);
      
      // Invalidate application's interviews cache
      await CacheService.delete(`interviews:application:${applicationId}`);
    } catch (error) {
      // Log error but don't interrupt the flow for cache issues
      console.error('Error invalidating interview caches:', error);
    }
  }
}

export const interviewService = new InterviewService();