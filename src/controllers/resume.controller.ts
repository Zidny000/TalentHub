import { Request, Response } from 'express';
import { resumeRepository } from '../repositories/resume.repository';
import { pdfService } from '../services/pdf.service';
import { AppError } from '../utils/errors';
import { ResponseFormatter } from '../utils/response';

export class ResumeController {
  /**
   * Create a new resume
   */
  async create(req: Request, res: Response) {
    try {
      const userId = req.user?.userId; // Authentication middleware sets req.user
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }
      
      const { title, summary, experiences, skills } = req.body;
      
      // Create resume
      const resume = await resumeRepository.create({
        userId,
        title,
        summary,
        experiences: experiences ? JSON.stringify(experiences) : null,
        skills
      });
      
      return ResponseFormatter.success(res, 'Resume created successfully', resume);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to create resume', error);
    }
  }
  
  /**
   * Get resume by ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const resume = await resumeRepository.findById(id);
      
      if (!resume) {
        throw new AppError('Resume not found', 404);
      }
      
      // Ensure user has permission to access this resume
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      if (resume.userId !== userId && userRole !== 'ADMIN') {
        throw new AppError('You do not have permission to access this resume', 403);
      }
      
      // Parse experiences if it's a string
      let formattedResume: any = { ...resume };
      if (typeof resume.experiences === 'string') {
        try {
          formattedResume.experiences = JSON.parse(resume.experiences);
        } catch (e) {
          formattedResume.experiences = [];
        }
      }
      
      return ResponseFormatter.success(res, 'Resume retrieved successfully', formattedResume);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to retrieve resume', error);
    }
  }
  
  /**
   * Get resumes by user ID
   */
  async getByUserId(req: Request, res: Response) {
    try {
      const userId = req.user?.userId; // Use the authenticated user's ID
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }
      
      const resumes = await resumeRepository.findByUserId(userId);
      
      return ResponseFormatter.success(res, 'Resumes retrieved successfully', resumes);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to retrieve resumes', error);
    }
  }
  
  /**
   * Update resume
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, summary, experiences, skills } = req.body;
      
      // Check if resume exists and user has permission
      const existingResume = await resumeRepository.findById(id);
      
      if (!existingResume) {
        throw new AppError('Resume not found', 404);
      }
      
      // Ensure user has permission to update this resume
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      if (existingResume.userId !== userId && userRole !== 'ADMIN') {
        throw new AppError('You do not have permission to update this resume', 403);
      }
      
      // Update resume
      const resume = await resumeRepository.update(id, {
        title,
        summary,
        experiences: experiences ? JSON.stringify(experiences) : undefined,
        skills
      });
      
      return ResponseFormatter.success(res, 'Resume updated successfully', resume);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to update resume', error);
    }
  }
  
  /**
   * Delete resume
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Check if resume exists and user has permission
      const existingResume = await resumeRepository.findById(id);
      
      if (!existingResume) {
        throw new AppError('Resume not found', 404);
      }
      
      // Ensure user has permission to delete this resume
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      if (existingResume.userId !== userId && userRole !== 'ADMIN') {
        throw new AppError('You do not have permission to delete this resume', 403);
      }
      
      // Delete PDF if it exists
      if (existingResume.pdfUrl) {
        await pdfService.deleteResumePdf(existingResume.pdfUrl);
      }
      
      // Delete resume
      await resumeRepository.delete(id);
      
      return ResponseFormatter.success(res, 'Resume deleted successfully');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to delete resume', error);
    }
  }
  
  /**
   * Generate/return PDF
   */
  async getPdf(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Check if resume exists
      const resume = await resumeRepository.findById(id);
      
      if (!resume) {
        throw new AppError('Resume not found', 404);
      }
      
      // Ensure user has permission to access this resume
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      if (resume.userId !== userId && userRole !== 'ADMIN') {
        throw new AppError('You do not have permission to access this resume', 403);
      }
      
      // If PDF already exists, return it
      if (resume.pdfUrl) {
        return res.sendFile(process.cwd() + resume.pdfUrl);
      }
      
      // Parse experiences if it's a string
      let experiences = resume.experiences;
      if (typeof experiences === 'string') {
        try {
          experiences = JSON.parse(experiences);
        } catch (e) {
          experiences = null;
        }
      }
      
      // Generate PDF
      const pdfUrl = await pdfService.generateResumePdf({
        ...resume,
        experiences
      });
      
      // Update resume with PDF URL
      await resumeRepository.update(id, { pdfUrl });
      
      // Send PDF file
      return res.sendFile(process.cwd() + pdfUrl);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseFormatter.error(res, error.message, error.errorDetails, error.statusCode);
      }
      return ResponseFormatter.error(res, 'Failed to generate PDF', error);
    }
  }
}

export const resumeController = new ResumeController();