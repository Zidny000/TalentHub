import { PrismaClient } from '@prisma/client';
import prisma from '../config/prisma';

class InterviewRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Create a new interview
   */
  async create(interviewData: any) {
    return this.prisma.interview.create({
      data: interviewData,
      include: {
        application: {
          include: {
            job: true
          }
        }
      }
    });
  }

  /**
   * Find interview by ID
   */
  async findById(id: string) {
    return this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            job: true,
            applicant: true
          }
        },
        employer: true,
        candidate: true
      }
    });
  }

  /**
   * Find interviews for an employer
   */
  async findByEmployerId(employerId: string, options?: { 
    status?: 'SCHEDULED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED', 
    page?: number, 
    limit?: number 
  }) {
    const { status, page = 1, limit = 10 } = options || {};

    const skip = (page - 1) * limit;

    return this.prisma.interview.findMany({
      where: {
        employerId,
        ...(status && { status })
      },
      include: {
        application: {
          include: {
            job: true,
            applicant: true
          }
        },
        candidate: true
      },
      skip,
      take: limit,
      orderBy: { scheduledAt: 'desc' }
    });
  }

  /**
   * Find interviews for a candidate
   */
  async findByCandidateId(candidateId: string, options?: { 
    status?: 'SCHEDULED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED', 
    page?: number, 
    limit?: number 
  }) {
    const { status, page = 1, limit = 10 } = options || {};

    const skip = (page - 1) * limit;

    return this.prisma.interview.findMany({
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
        employer: true
      },
      skip,
      take: limit,
      orderBy: { scheduledAt: 'desc' }
    });
  }

  /**
   * Find interviews for a specific application
   */
  async findByApplicationId(applicationId: string) {
    return this.prisma.interview.findMany({
      where: { applicationId },
      include: {
        employer: true,
        candidate: true
      },
      orderBy: { scheduledAt: 'desc' }
    });
  }

  /**
   * Update an interview
   */
  async update(id: string, data: any) {
    return this.prisma.interview.update({
      where: { id },
      data,
      include: {
        application: {
          include: {
            job: true
          }
        },
        employer: true,
        candidate: true
      }
    });
  }

  /**
   * Delete an interview
   */
  async delete(id: string) {
    return this.prisma.interview.delete({
      where: { id }
    });
  }

  /**
   * Count interviews by employer ID
   */
  async countByEmployerId(employerId: string, status?: 'SCHEDULED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED') {
    return this.prisma.interview.count({
      where: {
        employerId,
        ...(status && { status })
      }
    });
  }

  /**
   * Count interviews by candidate ID
   */
  async countByCandidateId(candidateId: string, status?: 'SCHEDULED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED') {
    return this.prisma.interview.count({
      where: {
        candidateId,
        ...(status && { status })
      }
    });
  }
}

export const interviewRepository = new InterviewRepository();