import { jobOfferRepository } from '../repositories/jobOffer.repository';
import { applicationRepository } from '../repositories/application.repository';
import { interviewRepository } from '../repositories/interview.repository';
import { jobRepository } from '../repositories/job.repository';
import { CacheService } from './cache.service';
import { AppError } from '../utils/errors';

export class JobOfferService {
  /**
   * Create a new job offer
   */
  async createJobOffer(employerId: string, applicationId: string, offerData: {
    interviewId?: string;
    title: string;
    description?: string;
    salary: number;
    benefits?: string;
    startDate?: Date;
    expirationDate: Date;
    notes?: string;
  }) {
    // Validate application exists
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      throw new AppError('Application not found', 404);
    }

    // Verify the job exists and belongs to employer
    const jobId = application.jobId;
    const job = await jobRepository.findById(jobId);
    
    if (!job) {
      throw new AppError('Job not found for this application', 404);
    }
    
    if (job.postedById !== employerId) {
      throw new AppError('Not authorized to create job offers for this application', 403);
    }

    // If interviewId is provided, verify it exists and belongs to the same application
    if (offerData.interviewId) {
      const interview = await interviewRepository.findById(offerData.interviewId);
      
      if (!interview) {
        throw new AppError('Interview not found', 404);
      }
      
      if (interview.applicationId !== applicationId) {
        throw new AppError('Interview does not match the application', 400);
      }
    }

    // Prepare job offer data
    const jobOfferInfo = {
      applicationId,
      employerId,
      candidateId: application.applicantId,
      interviewId: offerData.interviewId,
      title: offerData.title,
      description: offerData.description,
      salary: offerData.salary,
      benefits: offerData.benefits,
      startDate: offerData.startDate,
      expirationDate: offerData.expirationDate,
      notes: offerData.notes,
      status: 'PENDING' as const
    };

    // Create the job offer
    return jobOfferRepository.create(jobOfferInfo);
  }

  /**
   * Get job offer details
   */
  async getJobOfferById(id: string, userId: string, userRole: string) {
    const jobOffer = await jobOfferRepository.findById(id);
    
    if (!jobOffer) {
      throw new AppError('Job offer not found', 404);
    }

    // Check permissions
    if (userRole === 'ADMIN' || 
        jobOffer.employerId === userId || 
        jobOffer.candidateId === userId) {
      return jobOffer;
    } else {
      throw new AppError('Not authorized to view this job offer', 403);
    }
  }

  /**
   * Get job offers for employer
   */
  async getEmployerJobOffers(employerId: string, options?: { 
    status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'WITHDRAWN',
    page?: number, 
    limit?: number 
  }) {
    // First check and update any expired offers
    await jobOfferRepository.checkAndUpdateExpiredOffers();
    
    return jobOfferRepository.findByEmployerId(employerId, options);
  }

  /**
   * Get job offers for candidate
   */
  async getCandidateJobOffers(candidateId: string, options?: { 
    status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'WITHDRAWN',
    page?: number, 
    limit?: number 
  }) {
    // First check and update any expired offers
    await jobOfferRepository.checkAndUpdateExpiredOffers();
    
    return jobOfferRepository.findByCandidateId(candidateId, options);
  }

  /**
   * Get job offers for a specific application
   */
  async getApplicationJobOffers(applicationId: string, userId: string, userRole: string) {
    // Get application to check permissions
    const application = await applicationRepository.findById(applicationId);
    
    if (!application) {
      throw new AppError('Application not found', 404);
    }

    // Get job to check permissions
    const jobId = application.jobId;
    const job = await jobRepository.findById(jobId);
    
    if (!job) {
      throw new AppError('Job not found for this application', 404);
    }
    
    // Check permissions
    if (userRole === 'ADMIN' || 
        job.postedById === userId || 
        application.applicantId === userId) {
      
      // Check and update any expired offers
      await jobOfferRepository.checkAndUpdateExpiredOffers();
      
      return jobOfferRepository.findByApplicationId(applicationId);
    } else {
      throw new AppError('Not authorized to view offers for this application', 403);
    }
  }

  /**
   * Withdraw job offer (employer only)
   */
  async withdrawJobOffer(id: string, userId: string, userRole: string, reason?: string) {
    const jobOffer = await jobOfferRepository.findById(id);
    
    if (!jobOffer) {
      throw new AppError('Job offer not found', 404);
    }

    // Only employer or admin can withdraw offers
    if (userRole !== 'ADMIN' && jobOffer.employerId !== userId) {
      throw new AppError('Not authorized to withdraw this job offer', 403);
    }

    // Ensure offer is still pending
    if (jobOffer.status !== 'PENDING') {
      throw new AppError(`Cannot withdraw job offer with status: ${jobOffer.status}`, 400);
    }

    // Update status to withdrawn
    const updateData: any = {
      status: 'WITHDRAWN'
    };

    if (reason) {
      updateData.notes = reason;
    }

    return jobOfferRepository.update(id, updateData);
  }

  /**
   * Accept job offer (candidate only)
   */
  async acceptJobOffer(id: string, userId: string, userRole: string) {
    const jobOffer = await jobOfferRepository.findById(id);
    
    if (!jobOffer) {
      throw new AppError('Job offer not found', 404);
    }

    // Only candidate can accept offers
    if (userRole !== 'ADMIN' && jobOffer.candidateId !== userId) {
      throw new AppError('Not authorized to accept this job offer', 403);
    }

    // Ensure offer is still pending
    if (jobOffer.status !== 'PENDING') {
      throw new AppError(`Cannot accept job offer with status: ${jobOffer.status}`, 400);
    }

    // Check if offer has expired
    const now = new Date();
    if (jobOffer.expirationDate < now) {
      // Mark as expired and return error
      await jobOfferRepository.update(id, { status: 'EXPIRED' });
      throw new AppError('This job offer has expired', 400);
    }

    // Update status to accepted
    const updatedOffer = await jobOfferRepository.update(id, { status: 'ACCEPTED' });

    // Update application status to HIRED
    await applicationRepository.updateStatus(jobOffer.applicationId, 'HIRED');
    
    // Invalidate application caches
    await this.invalidateApplicationCaches(jobOffer.applicationId, jobOffer.candidateId);

    return updatedOffer;
  }

  /**
   * Reject job offer (candidate only)
   */
  async rejectJobOffer(id: string, userId: string, userRole: string, reason?: string) {
    const jobOffer = await jobOfferRepository.findById(id);
    
    if (!jobOffer) {
      throw new AppError('Job offer not found', 404);
    }

    // Only candidate can reject offers
    if (userRole !== 'ADMIN' && jobOffer.candidateId !== userId) {
      throw new AppError('Not authorized to reject this job offer', 403);
    }

    // Ensure offer is still pending
    if (jobOffer.status !== 'PENDING') {
      throw new AppError(`Cannot reject job offer with status: ${jobOffer.status}`, 400);
    }

    // Update status to rejected
    const updateData: any = {
      status: 'REJECTED'
    };

    if (reason) {
      updateData.rejectionReason = reason;
    }

    const updatedOffer = await jobOfferRepository.update(id, updateData);
    
    // Invalidate application caches
    await this.invalidateApplicationCaches(jobOffer.applicationId, jobOffer.candidateId);
    
    return updatedOffer;
  }
  
  /**
   * Helper method to invalidate application-related caches
   */
  private async invalidateApplicationCaches(applicationId: string, candidateId: string): Promise<void> {
    try {
      // Find application to get related IDs
      const application = await applicationRepository.findById(applicationId);
      if (!application) return;
      
      // Invalidate application detail cache
      await CacheService.delete(`applications:detail:${applicationId}`);
      
      // Invalidate job's applications cache
      await CacheService.delete(`applications:job:${application.jobId}`);
      
      // Invalidate candidate's applications cache
      await CacheService.delete(`applications:user:${candidateId}`);
    } catch (error) {
      // Log error but don't interrupt the flow for cache issues
      console.error('Error invalidating application caches:', error);
    }
  }
}

export const jobOfferService = new JobOfferService();