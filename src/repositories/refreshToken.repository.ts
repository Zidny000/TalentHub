import prisma from '../config/prisma';

/**
 * Refresh Token Repository
 */
class RefreshTokenRepository {
  /**
   * Create a new refresh token
   */
  async createRefreshToken(data: {
    token: string;
    userId: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.refreshToken.create({
      data
    });
  }

  /**
   * Find refresh token by token value
   */
  async findByToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token }
    });
  }

  /**
   * Revoke a refresh token
   */
  async revokeToken(tokenId: string) {
    return prisma.refreshToken.update({
      where: { id: tokenId },
      data: { isRevoked: true }
    });
  }

  /**
   * Delete expired refresh tokens (cleanup)
   */
  async deleteExpiredTokens() {
    return prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isRevoked: true }
        ]
      }
    });
  }
}

export default new RefreshTokenRepository();