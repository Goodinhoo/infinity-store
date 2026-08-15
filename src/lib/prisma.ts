import { PrismaClient } from '../generated/prisma'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma_v2: PrismaClient | undefined
}

function createPrismaClient() {
  // prisma.config.ts usa file:./dev.db → raiz do projeto
  const dbPath = path.resolve(process.cwd(), 'dev.db').replace(/\\/g, '/')
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  return new PrismaClient({ adapter })
}

export const prisma: PrismaClient = globalForPrisma.prisma_v2 ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_v2 = prisma
