import prisma from '../config/prisma';

export class ApplicationRepository {
  /**
   * Create a new job application
   */
  async create(data: {
    jobId: string;
    applicantId: string;
    resumeId?: string;
    coverLetter?: string;
  }) {
    return prisma.application.create({
      data
    });
  }

  /**
   * Find application by ID
   */
  async findById(id: string) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        resume: true
      }
    });
  }

  /**
   * Find applications for a specific job
   */
  async findByJobId(jobId: string) {
    return prisma.application.findMany({
      where: { jobId },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        resume: {
          select: {
            id: true,
            title: true,
            pdfUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Find applications submitted by a specific user
   */
  async findByApplicantId(applicantId: string) {
    return prisma.application.findMany({
      where: { applicantId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            type: true,
            postedBy: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        resume: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Check if user has already applied to a job
   */
  async hasApplied(jobId: string, applicantId: string): Promise<boolean> {
    const count = await prisma.application.count({
      where: {
        jobId,
        applicantId
      }
    });
    
    return count > 0;
  }

  /**
   * Update application status
   */
  async updateStatus(id: string, status: 'APPLIED' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED') {
    return prisma.application.update({
      where: { id },
      data: { status }
    });
  }

  /**
   * Get applications with detailed info for export
   */
  async getApplicationsForExport(jobId: string) {
    return prisma.application.findMany({
      where: { jobId },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        resume: {
          select: {
            id: true,
            title: true,
            pdfUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const applicationRepository = new ApplicationRepository();