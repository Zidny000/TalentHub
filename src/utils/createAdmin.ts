// src/utils/createAdmin.ts
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import logger from './logger';

const prisma = new PrismaClient();

/**
 * Creates an admin user if one doesn't already exist
 */
export const createAdminUser = async (): Promise<void> => {
  try {
    // Check if admin user already exists
    const adminExists = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN }
    });

    if (adminExists) {
      logger.info('Admin user already exists');
      return;
    }

    // Admin doesn't exist, create one
    const adminEmail = 'admin@talenthub.com';
    const adminPassword = 'Admin123!';
    
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // Create the admin user
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        passwordHash,
        role: UserRole.ADMIN,
        twoFactorEnabled: false
      }
    });

    logger.info(`Admin user created with email: ${adminEmail}`);
  } catch (error) {
    logger.error('Failed to create admin user:', error);
  }
};