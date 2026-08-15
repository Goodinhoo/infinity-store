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

export async function getPages() {
  await checkAdmin()
  return await prisma.customPage.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function getPage(id: number) {
  await checkAdmin()
  return await prisma.customPage.findUnique({
    where: { id }
  })
}

export async function getPageBySlug(slug: string) {
  return await prisma.customPage.findFirst({
    where: { slug, isActive: true }
  })
}

export async function createPage(title: string, slug: string, content: string) {
  await checkAdmin()
  try {
    const page = await prisma.customPage.create({
      data: {
        title: title.trim(),
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        content
      }
    })
    revalidatePath('/admin/pages')
    return { success: true, page }
  } catch (error) {
    console.error(error)
    return { error: 'Erro ao criar página. Verifica se o slug já existe.' }
  }
}

export async function updatePage(id: number, title: string, slug: string, content: string) {
  await checkAdmin()
  try {
    const page = await prisma.customPage.update({
      where: { id },
      data: {
        title: title.trim(),
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        content
      }
    })
    revalidatePath('/admin/pages')
    revalidatePath(`/${page.slug}`)
    return { success: true, page }
  } catch (error) {
    console.error(error)
    return { error: 'Erro ao atualizar página.' }
  }
}

export async function deletePage(id: number) {
  await checkAdmin()
  try {
    const page = await prisma.customPage.delete({
      where: { id }
    })
    revalidatePath('/admin/pages')
    revalidatePath(`/${page.slug}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Erro ao eliminar página.' }
  }
}
