import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Only create Prisma client if DATABASE_URL is available
// This allows the build to succeed even without a database connection
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    // Return a mock client for build time if DATABASE_URL is not set
    // This prevents build failures when DATABASE_URL is not configured
    return null as any
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma
}
