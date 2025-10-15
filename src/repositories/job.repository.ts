import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

// Get JobType from Prisma schema
type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'REMOTE' | 'INTERNSHIP';

export interface JobFilterParams {
  q?: string;          // Search query for title or description
  type?: JobType;      // Job type filter
  location?: string;   // Location filter
  minSalary?: number;  // Minimum salary
  maxSalary?: number;  // Maximum salary
  active?: boolean;    // Only active jobs
  page?: number;       // Page number for pagination
  pageSize?: number;   // Page size for pagination
}

export class JobRepository {
  /**
   * Create a new job
   */
  async create(data: {
    title: string;
    description: string;
    requirements?: string;
    location?: string;
    type: JobType;
    salaryMin?: number;
    salaryMax?: number;
    isPaidPost?: boolean;
    postedById: string;
    isActive?: boolean;
  }) {
    return prisma.job.create({
      data
    });
  }

  /**
   * Find job by ID
   */
  async findById(id: string) {
    return prisma.job.findUnique({
      where: { id },
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  /**
   * Find jobs with filters and pagination
   */
  async findJobs(params: JobFilterParams = {}) {
    const {
      q,
      type,
      location,
      minSalary,
      maxSalary,
      active = true,
      page = 1,
      pageSize = 20
    } = params;

    // Calculate pagination
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Build where clause
    const where: any = {};

    // Only show active jobs by default
    where.isActive = active;

    // Add search filter
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    // Add type filter
    if (type) {
      where.type = type;
    }

    // Add location filter
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // Add salary filters
    if (minSalary !== undefined) {
      where.salaryMin = { gte: minSalary };
    }

    if (maxSalary !== undefined) {
      where.salaryMax = { lte: maxSalary };
    }

    // Get total count for pagination
    const totalCount = await prisma.job.count({ where });

    // Execute query with pagination
    const jobs = await prisma.job.findMany({
      where,
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        applications: {
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      jobs,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages
      }
    };
  }

  /**
   * Find jobs posted by a user
   */
  async findByUserId(userId: string, active?: boolean) {
    const where: any = { postedById: userId };
    
    if (active !== undefined) {
      where.isActive = active;
    }

    return prisma.job.findMany({
      where,
      include: {
        applications: {
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Update job
   */
  async update(id: string, data: {
    title?: string;
    description?: string;
    requirements?: string;
    location?: string;
    type?: JobType;
    salaryMin?: number;
    salaryMax?: number;
    isPaidPost?: boolean;
    isActive?: boolean;
  }) {
    return prisma.job.update({
      where: { id },
      data
    });
  }

  /**
   * Delete job (set isActive = false)
   */
  async softDelete(id: string) {
    return prisma.job.update({
      where: { id },
      data: { isActive: false }
    });
  }
  
  /**
   * Count free job posts by a user
   */
  async countFreeJobsByUser(userId: string) {
    return prisma.job.count({
      where: {
        postedById: userId,
        isPaidPost: false
      }
    });
  }
  
  /**
   * Check if a job has a successful payment
   */
  async hasSuccessfulPayment(jobId: string) {
    const payment = await prisma.payment.findFirst({
      where: {
        jobId,
        status: 'SUCCESS'
      }
    });
    
    return payment !== null;
  }
}

export const jobRepository = new JobRepository();