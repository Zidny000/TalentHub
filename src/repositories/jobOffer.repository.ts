import { PrismaClient } from '@prisma/client';
import prisma from '../config/prisma';

class JobOfferRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Create a new job offer
   */
  async create(offerData: any) {
    return this.prisma.jobOffer.create({
      data: offerData,
      include: {
        application: {
          include: {
            job: true
          }
        },
        interview: true
      }
    });
  }

  /**
   * Find job offer by ID
   */
  async findById(id: string) {
    return this.prisma.jobOffer.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            job: true,
            applicant: true
          }
        },
        interview: true,
        employer: true,
        candidate: true
      }
    });
  }

  /**
   * Find job offers by employer ID
   */
  async findByEmployerId(employerId: string, options?: { 
    status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'WITHDRAWN',
    page?: number, 
    limit?: number 
  }) {
    const { status, page = 1, limit = 10 } = options || {};
    const skip = (page - 1) * limit;

    return this.prisma.jobOffer.findMany({
      where: {
        employerId,
        ...(status && { status })
      },
      include: {
        application: {
          include: {
            job: true
          }
        },
        interview: true,
        candidate: true
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Find job offers by candidate ID
   */
  async findByCandidateId(candidateId: string, options?: { 
    status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'WITHDRAWN',
    page?: number, 
    limit?: number 
  }) {
    const { status, page = 1, limit = 10 } = options || {};
    const skip = (page - 1) * limit;

    return this.prisma.jobOffer.findMany({
      where: {
        candidateId,
        ...(status && { status })
      },
      include: {
        application: {
          include: {
            job: true
          }
        },
        interview: true,
        employer: true
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Find job offers for a specific application
   */
  async findByApplicationId(applicationId: string) {
    return this.prisma.jobOffer.findMany({
      where: { applicationId },
      include: {
        employer: true,
        candidate: true,
        interview: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Find job offers for a specific interview
   */
  async findByInterviewId(interviewId: string) {
    return this.prisma.jobOffer.findMany({
      where: { interviewId },
      include: {
        application: {
          include: {
            job: true
          }
        },
        employer: true,
        candidate: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Update a job offer
   */
  async update(id: string, data: any) {
    return this.prisma.jobOffer.update({
      where: { id },
      data,
      include: {
        application: {
          include: {
            job: true
          }
        },
        interview: true,
        employer: true,
        candidate: true
      }
    });
  }

  /**
   * Delete a job offer
   */
  async delete(id: string) {
    return this.prisma.jobOffer.delete({
      where: { id }
    });
  }

  /**
   * Count job offers by employer ID
   */
  async countByEmployerId(employerId: string, status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'WITHDRAWN') {
    return this.prisma.jobOffer.count({
      where: {
        employerId,
        ...(status && { status })
      }
    });
  }

  /**
   * Count job offers by candidate ID
   */
  async countByCandidateId(candidateId: string, status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'WITHDRAWN') {
    return this.prisma.jobOffer.count({
      where: {
        candidateId,
        ...(status && { status })
      }
    });
  }

  /**
   * Check for expired offers and mark them as EXPIRED
   */
  async checkAndUpdateExpiredOffers() {
    const now = new Date();
    
    return this.prisma.jobOffer.updateMany({
      where: {
        status: 'PENDING',
        expirationDate: {
          lt: now
        }
      },
      data: {
        status: 'EXPIRED'
      }
    });
  }
}

export const jobOfferRepository = new JobOfferRepository();