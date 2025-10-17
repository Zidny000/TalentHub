import prisma from '../config/prisma';

// Define types and enums that match the schema
enum EmploymentPaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

// Basic type for EmploymentPayment
interface EmploymentPayment {
  id: string;
  employerId: string;
  candidateId: string;
  jobOfferId: string;
  amount: number;
  description?: string;
  currency: string;
  provider: string;
  stripeSessionId?: string;
  status: EmploymentPaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

class EmploymentPaymentRepository {
  /**
   * Create a new employment payment
   */
  async create(data: {
    employerId: string;
    candidateId: string;
    jobOfferId: string;
    amount: number;
    description?: string;
    currency?: string;
    provider: string;
    stripeSessionId?: string;
    status?: EmploymentPaymentStatus;
  }): Promise<EmploymentPayment> {
    // @ts-ignore - Prisma client might not have been regenerated yet
    return prisma.employmentPayment.create({
      data
    });
  }
  
  /**
   * Find employment payment by ID
   */
  async findById(id: string): Promise<EmploymentPayment | null> {
    // @ts-ignore - Prisma client might not have been regenerated yet
    return prisma.employmentPayment.findUnique({
      where: { id }
    });
  }
  
  /**
   * Find employment payment by Stripe session ID
   */
  async findByStripeSessionId(stripeSessionId: string): Promise<EmploymentPayment | null> {
    // @ts-ignore - Prisma client might not have been regenerated yet
    return prisma.employmentPayment.findFirst({
      where: { stripeSessionId }
    });
  }
  
  /**
   * Update employment payment status
   */
  async updateStatus(id: string, status: EmploymentPaymentStatus): Promise<EmploymentPayment> {
    // @ts-ignore - Prisma client might not have been regenerated yet
    return prisma.employmentPayment.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      }
    });
  }
  
  /**
   * Get payments sent by an employer
   */
  async getEmployerPayments(employerId: string): Promise<EmploymentPayment[]> {
    // @ts-ignore - Prisma client might not have been regenerated yet
    return prisma.employmentPayment.findMany({
      where: { employerId },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  /**
   * Get payments received by a candidate
   */
  async getCandidatePayments(candidateId: string): Promise<EmploymentPayment[]> {
    // @ts-ignore - Prisma client might not have been regenerated yet
    return prisma.employmentPayment.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  /**
   * Get payments for a job offer
   */
  async getJobOfferPayments(jobOfferId: string): Promise<EmploymentPayment[]> {
    // @ts-ignore - Prisma client might not have been regenerated yet
    return prisma.employmentPayment.findMany({
      where: { jobOfferId },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const employmentPaymentRepository = new EmploymentPaymentRepository();