'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/../auth'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user) throw new Error('Não autorizado')
  
  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) }
  })
  
  if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
    throw new Error('Sem permissão')
  }
}

export async function getVoteSitesAdmin() {
  await checkAdmin()
  return await prisma.voteSite.findMany({
    orderBy: { order: 'asc' }
  })
}

export async function getVoteSitesPublic() {
  return await prisma.voteSite.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  })
}

export async function createVoteSite(data: { name: string; url: string; imageUrl?: string; reward?: string; order?: number }) {
  await checkAdmin()
  const site = await prisma.voteSite.create({
    data: {
      name: data.name,
      url: data.url,
      imageUrl: data.imageUrl,
      reward: data.reward,
      order: data.order ?? 0,
      isActive: true,
    }
  })
  revalidatePath('/admin/votes')
  revalidatePath('/votos')
  return site
}

export async function updateVoteSite(id: number, data: { name?: string; url?: string; imageUrl?: string; reward?: string; order?: number; isActive?: boolean }) {
  await checkAdmin()
  const site = await prisma.voteSite.update({
    where: { id },
    data
  })
  revalidatePath('/admin/votes')
  revalidatePath('/votos')
  return site
}

export async function deleteVoteSite(id: number) {
  await checkAdmin()
  await prisma.voteSite.delete({
    where: { id }
  })
  revalidatePath('/admin/votes')
  revalidatePath('/votos')
  return { success: true }
}
