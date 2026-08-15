'use server'

import { prisma } from '@/lib/prisma'

export async function getDownloads() {
  return await prisma.downloadItem.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function incrementDownload(id: number) {
  try {
    await prisma.downloadItem.update({
      where: { id },
      data: { downloads: { increment: 1 } }
    })
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
