import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton for Serverless Environments
 *
 * This singleton pattern ensures that only one PrismaClient instance is created
 * across all serverless function invocations, preventing connection pool exhaustion.
 *
 * Critical for Vercel deployment where each API route previously created its own
 * PrismaClient instance, leading to "too many connections" errors.
 *
 * @see https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 */

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

// Prevent multiple instances in development (hot reload)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Explicitly connect to database
 * Useful for testing and initialization
 */
export async function connectPrisma() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

/**
 * Explicitly disconnect from database
 * Use in cleanup or shutdown scenarios
 */
export async function disconnectPrisma() {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
    throw error;
  }
}

/**
 * Health check for database connection
 * Returns true if connection is healthy
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
