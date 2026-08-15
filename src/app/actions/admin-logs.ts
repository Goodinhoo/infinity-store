'use server'

import { prisma } from '@/lib/prisma'

export async function getAuditLogsAdmin(search?: string) {
  return await prisma.auditLog.findMany({
    where: search
      ? {
          OR: [
            { username: { contains: search } },
            { action: { contains: search } },
            { details: { contains: search } },
          ]
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100
  })
}

export async function getRconLogsAdmin(search?: string) {
  return await prisma.rconLog.findMany({
    where: search
      ? {
          OR: [
            { player: { contains: search } },
            { command: { contains: search } },
            { serverName: { contains: search } },
            { response: { contains: search } },
          ]
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100
  })
}
