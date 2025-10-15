import prisma from '../config/prisma';
import { UserInput } from '../models/user.model';

// Define TwoFactorMethod to match schema
type TwoFactorMethod = 'EMAIL';

/**
 * User repository for database operations
 */
class UserRepository {
  /**
   * Create a new user
   */
  async createUser(userData: UserInput) {
    const { password, ...otherData } = userData;
    
    return prisma.user.create({
      data: {
        ...otherData,
        passwordHash: password, // Note: This should be hashed before reaching here
      }
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  /**
   * Update user by ID
   */
  async updateUser(userId: string, data: Partial<UserInput>) {
    return prisma.user.update({
      where: { id: userId },
      data
    });
  }

  /**
   * Enable two-factor authentication for a user
   */
  async enableTwoFactor(userId: string, method: TwoFactorMethod = 'EMAIL') {
    // First update user to enable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true }
    });

    // Find existing two-factor record
    const existingTwoFactor = await prisma.twoFactor.findFirst({
      where: {
        userId,
        method
      }
    });

    if (existingTwoFactor) {
      // Update existing record
      return prisma.twoFactor.update({
        where: { id: existingTwoFactor.id },
        data: { enabled: true }
      });
    } else {
      // Create new record
      return prisma.twoFactor.create({
        data: {
          userId,
          method,
          enabled: true
        }
      });
    }
  }

  /**
   * Get user's two-factor authentication settings
   */
  async getUserTwoFactor(userId: string, method: TwoFactorMethod = 'EMAIL') {
    return prisma.twoFactor.findFirst({
      where: {
        userId,
        method
      }
    });
  }
}

export default new UserRepository();