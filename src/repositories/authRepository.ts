import { prisma } from '../config/database.js';

/**
 * Creates a new refresh token in the database.
 */
export const createRefreshToken = async (data: {
  token: string;
  userId: string;
  expiresAt: Date;
}) => {
  return await prisma.refreshToken.create({
    data,
  });
};

/**
 * Finds a refresh token in the database.
 */
export const findRefreshToken = async (token: string) => {
  return await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });
};

/**
 * Deletes a specific refresh token.
 */
export const deleteRefreshToken = async (token: string) => {
  return await prisma.refreshToken.delete({
    where: { token },
  });
};

/**
 * Deletes all refresh tokens for a specific user (revokes all sessions).
 */
export const deleteAllRefreshTokensForUser = async (userId: string) => {
  return await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};
