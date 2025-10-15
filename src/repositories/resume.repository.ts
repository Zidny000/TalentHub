import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export class ResumeRepository {
  /**
   * Create a new resume
   */
  async create(data: {
    userId: string;
    title: string;
    summary?: string;
    experiences?: any;
    skills?: string;
    pdfUrl?: string;
  }) {
    return prisma.resume.create({
      data
    });
  }

  /**
   * Find resume by ID
   */
  async findById(id: string) {
    return prisma.resume.findUnique({
      where: { id }
    });
  }

  /**
   * Find resumes by user ID
   */
  async findByUserId(userId: string) {
    return prisma.resume.findMany({
      where: { userId }
    });
  }

  /**
   * Update resume
   */
  async update(id: string, data: {
    title?: string;
    summary?: string;
    experiences?: any;
    skills?: string;
    pdfUrl?: string;
  }) {
    return prisma.resume.update({
      where: { id },
      data
    });
  }

  /**
   * Delete resume
   */
  async delete(id: string) {
    return prisma.resume.delete({
      where: { id }
    });
  }
}

export const resumeRepository = new ResumeRepository();