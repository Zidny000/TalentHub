import { applicationRepository } from '../repositories/application.repository';
import { jobRepository } from '../repositories/job.repository';
import { resumeRepository } from '../repositories/resume.repository';
import { exportService } from '../services/export.service';
import { AppError } from '../utils/errors';

export class ApplicationService {
  /**
   * Apply to a job
   */
  async applyToJob(jobId: string, userId: string, userRole: string, applicationData: any) {
    const { resumeId, coverLetter } = applicationData;
    
    // Check if user is authenticated
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }
    
    // Check if user is a candidate
    if (userRole !== 'CANDIDATE' && userRole !== 'ADMIN') {
      throw new AppError('Only candidates can apply to jobs', 403);
    }
    
    // Check if job exists
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', 404);
    }
    
    // Check if job is active
    if (!job.isActive) {
      throw new AppError('Cannot apply to inactive job', 400);
    }
    
    // Check if user has already applied
    const hasApplied = await applicationRepository.hasApplied(jobId, userId);
    if (hasApplied) {
      throw new AppError('You have already applied to this job', 400);
    }
    
    // Check if resume exists if provided
    if (resumeId) {
      const resume = await resumeRepository.findById(resumeId);
      
      if (!resume) {
        throw new AppError('Resume not found', 404);
      }
      
      if (resume.userId !== userId) {
        throw new AppError('You can only use your own resumes', 403);
      }
    }
    
    // Create application
    const application = await applicationRepository.create({
      jobId,
      applicantId: userId,
      resumeId,
      coverLetter
    });
    
    return application;
  }

  /**
   * Get applications for a job
   */
  async getJobApplications(jobId: string, userId: string, userRole: string) {
    // Check if user is authenticated
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }
    
    // Check if job exists
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', 404);
    }
    
    // Check if user has permission (job owner or admin)
    if (job.postedById !== userId && userRole !== 'ADMIN') {
      throw new AppError('You do not have permission to view these applications', 403);
    }
    
    // Get applications
    const applications = await applicationRepository.findByJobId(jobId);
    
    return applications;
  }

  /**
   * Get application details
   */
  async getApplicationDetails(applicationId: string, userId: string, userRole: string) {
    // Check if user is authenticated
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }
    
    // Get application
    const application = await applicationRepository.findById(applicationId);
    
    if (!application) {
      throw new AppError('Application not found', 404);
    }
    
    // Check if user has permission (applicant, job owner, or admin)
    const isApplicant = application.applicantId === userId;
    const isJobOwner = application.job.postedById === userId;
    const isAdmin = userRole === 'ADMIN';
    
    if (!isApplicant && !isJobOwner && !isAdmin) {
      throw new AppError('You do not have permission to view this application', 403);
    }
    
    return application;
  }

  /**
   * Export job applications as CSV
   */
  async exportJobApplications(jobId: string, userId: string, userRole: string) {
    // Check if user is authenticated
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }
    
    // Check if job exists
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', 404);
    }
    
    // Check if user has permission (job owner or admin)
    if (job.postedById !== userId && userRole !== 'ADMIN') {
      throw new AppError('You do not have permission to export these applications', 403);
    }
    
    // Generate CSV
    const filePath = await exportService.generateApplicantsCsv(jobId, job.title);
    
    return process.cwd() + filePath;
  }

  /**
   * Get application history for a user
   */
  async getApplicationHistory(userId: string, userRole: string) {
    // Check if user is authenticated
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }
    
    // Check if user is a candidate
    if (userRole !== 'CANDIDATE' && userRole !== 'ADMIN') {
      throw new AppError('Only candidates can view their application history', 403);
    }
    
    // Get applications by applicant ID
    const applications = await applicationRepository.findByApplicantId(userId);
    
    return applications;
  }
}

export const applicationService = new ApplicationService();