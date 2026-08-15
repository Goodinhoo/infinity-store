'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'
import { revalidatePath } from 'next/cache'

export async function createBlogPost(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'Não autorizado' }

  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const content = formData.get('content') as string
  const imageUrl = formData.get('imageUrl') as string || null
  const authorId = Number(session.user.id)

  if (!title || !slug || !content || isNaN(authorId)) {
    return { success: false, error: 'Preenche todos os campos obrigatórios' }
  }

  try {
    await prisma.blogPost.create({
      data: { title: title.trim(), slug: slug.trim(), content, imageUrl, authorId }
    })
    revalidatePath('/admin/blog')
    revalidatePath('/blog')
    return { success: true }
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') return { success: false, error: 'Este slug já existe!' }
    return { success: false, error: 'Erro ao criar artigo' }
  }
}

export async function updateBlogPost(id: number, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'Não autorizado' }

  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const content = formData.get('content') as string
  const imageUrl = formData.get('imageUrl') as string || null

  if (!title || !slug || !content) {
    return { success: false, error: 'Preenche todos os campos obrigatórios' }
  }

  try {
    await prisma.blogPost.update({
      where: { id },
      data: { title: title.trim(), slug: slug.trim(), content, imageUrl }
    })
    revalidatePath('/admin/blog')
    revalidatePath('/blog')
    return { success: true }
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') return { success: false, error: 'Este slug já existe!' }
    return { success: false, error: 'Erro ao atualizar artigo' }
  }
}

export async function deleteBlogPost(id: number) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'Não autorizado' }

  try {
    await prisma.blogPost.delete({ where: { id } })
    revalidatePath('/admin/blog')
    revalidatePath('/blog')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao eliminar artigo' }
  }
}
