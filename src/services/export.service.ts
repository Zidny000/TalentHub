import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs-extra';
import path from 'path';
import { applicationRepository } from '../repositories/application.repository';

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const EXPORTS_DIR = path.join(UPLOADS_DIR, 'exports');

// Create directories if they don't exist
fs.ensureDirSync(UPLOADS_DIR);
fs.ensureDirSync(EXPORTS_DIR);

export class ExportService {
  /**
   * Generate CSV file with applicants for a job
   * @param jobId - Job ID
   * @param jobTitle - Job Title (for filename)
   * @returns Path to the generated CSV file
   */
  async generateApplicantsCsv(jobId: string, jobTitle: string): Promise<string> {
    try {
      // Get all applications for the job
      const applications = await applicationRepository.getApplicationsForExport(jobId);
      
      if (applications.length === 0) {
        throw new Error('No applications found for this job');
      }
      
      // Prepare filename (sanitize job title for safe filename)
      const sanitizedJobTitle = jobTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `applicants_${sanitizedJobTitle}_${timestamp}.csv`;
      const filePath = path.join(EXPORTS_DIR, fileName);
      
      // Configure CSV writer
      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
          { id: 'name', title: 'Applicant Name' },
          { id: 'email', title: 'Email' },
          { id: 'phone', title: 'Phone' },
          { id: 'resumeUrl', title: 'Resume URL' },
          { id: 'applicationDate', title: 'Application Date' },
          { id: 'status', title: 'Status' }
        ]
      });
      
      // Format data for CSV
      const records = applications.map((app: any) => ({
        name: app.applicant.name,
        email: app.applicant.email,
        phone: app.applicant.phone || 'N/A',
        resumeUrl: app.resume?.pdfUrl ? `${process.env.BASE_URL}${app.resume.pdfUrl}` : 'No resume',
        applicationDate: app.createdAt.toISOString().split('T')[0],
        status: app.status
      }));
      
      // Write CSV file
      await csvWriter.writeRecords(records);
      
      // Return the relative path to the file
      return `/uploads/exports/${fileName}`;
    } catch (error) {
      console.error('Error generating CSV:', error);
      throw new Error('Failed to generate applicant data export');
    }
  }
}

export const exportService = new ExportService();