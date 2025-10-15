import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs-extra';

// Define the base directory for resume storage
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const RESUMES_DIR = path.join(UPLOADS_DIR, 'resumes');

// Ensure directories exist
fs.ensureDirSync(UPLOADS_DIR);
fs.ensureDirSync(RESUMES_DIR);

export interface ResumeData {
  id: string;
  title: string;
  summary?: string | null;
  experiences?: any | null;
  skills?: string | null;
  userId: string;
  name?: string; // Optional user name to include in resume
}

export class PdfService {
  /**
   * Generate PDF from resume data and save to local storage
   */
  async generateResumePdf(resumeData: ResumeData): Promise<string> {
    try {
      // Create HTML content
      const htmlContent = this.generateResumeHtml(resumeData);
      
      // Generate PDF using Puppeteer
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      
      // Set content to the page
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Define PDF path
      const pdfFileName = `resume-${resumeData.id}-${Date.now()}.pdf`;
      const pdfPath = path.join(RESUMES_DIR, pdfFileName);
      
      // Generate PDF
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      await browser.close();
      
      // Return relative URL for storage in database
      return `/uploads/resumes/${pdfFileName}`;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }
  
  /**
   * Generate HTML content for the resume
   */
  private generateResumeHtml(resume: ResumeData): string {
    // Parse experiences if it's a string
    let experiences = resume.experiences || [];
    if (typeof experiences === 'string') {
      try {
        experiences = JSON.parse(experiences);
      } catch (e) {
        experiences = [];
      }
    }
    
    // Generate HTML
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${resume.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
          }
          .resume-header {
            border-bottom: 2px solid #2a5885;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          h1 {
            color: #2a5885;
            margin-bottom: 5px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 18px;
            color: #2a5885;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .experience {
            margin-bottom: 15px;
          }
          .experience-header {
            display: flex;
            justify-content: space-between;
          }
          .experience-company {
            font-weight: bold;
          }
          .experience-date {
            color: #666;
          }
          .experience-position {
            font-style: italic;
            margin-bottom: 5px;
          }
          .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
          }
          .skill {
            background-color: #f0f7ff;
            border: 1px solid #d0e2ff;
            border-radius: 3px;
            padding: 2px 8px;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="resume-header">
          <h1>${resume.title}</h1>
          ${resume.name ? `<p>${resume.name}</p>` : ''}
        </div>
        
        ${resume.summary ? `
          <div class="section">
            <h2 class="section-title">Summary</h2>
            <p>${resume.summary}</p>
          </div>
        ` : ''}
        
        ${experiences.length > 0 ? `
          <div class="section">
            <h2 class="section-title">Experience</h2>
            ${experiences.map((exp: any) => `
              <div class="experience">
                <div class="experience-header">
                  <div class="experience-company">${exp.company || 'Company'}</div>
                  <div class="experience-date">${exp.startDate || ''} ${exp.endDate ? '- ' + exp.endDate : ''}</div>
                </div>
                <div class="experience-position">${exp.position || 'Position'}</div>
                <p>${exp.description || ''}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${resume.skills ? `
          <div class="section">
            <h2 class="section-title">Skills</h2>
            <div class="skills">
              ${resume.skills.split(',').map((skill: string) => `
                <div class="skill">${skill.trim()}</div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </body>
      </html>
    `;
  }
  
  /**
   * Delete PDF file
   */
  async deleteResumePdf(pdfUrl: string | null): Promise<boolean> {
    if (!pdfUrl) return true;
    
    try {
      const pdfPath = path.join(process.cwd(), pdfUrl);
      if (await fs.pathExists(pdfPath)) {
        await fs.unlink(pdfPath);
      }
      return true;
    } catch (error) {
      console.error('Error deleting PDF:', error);
      return false;
    }
  }
}

export const pdfService = new PdfService();