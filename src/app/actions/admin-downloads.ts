'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/../auth'

export async function getAdminDownloads() {
  return await prisma.downloadItem.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function createDownload(data: {
  name: string
  slug: string
  description: string
  downloadUrl: string
  imageUrl?: string
  icon?: string
}) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado.' }
    }

    const exists = await prisma.downloadItem.findUnique({ where: { slug: data.slug } })
    if (exists) return { success: false, error: 'Já existe um download com este slug.' }

    await prisma.downloadItem.create({ data })
    revalidatePath('/admin/downloads')
    revalidatePath('/downloads')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Erro ao criar o download.' }
  }
}

export async function updateDownload(id: number, data: {
  name: string
  slug: string
  description: string
  downloadUrl: string
  imageUrl?: string
  icon?: string
  isActive: boolean
}) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') return { success: false, error: 'Não autorizado.' }

    await prisma.downloadItem.update({ where: { id }, data })
    revalidatePath('/admin/downloads')
    revalidatePath('/downloads')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Erro ao atualizar.' }
  }
}

export async function deleteDownload(id: number) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') return { success: false, error: 'Não autorizado.' }

    await prisma.downloadItem.delete({ where: { id } })
    revalidatePath('/admin/downloads')
    revalidatePath('/downloads')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Erro ao apagar.' }
  }
}
