'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'
import { revalidatePath } from 'next/cache'

export async function createCategory(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return { success: false, error: 'Não autorizado' }

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string || null
  const icon = formData.get('icon') as string || null
  const order = parseInt(formData.get('order') as string) || 0
  const isHidden = formData.get('isHidden') === 'on'

  if (!name || !slug) {
    return { success: false, error: 'Preenche o nome e o slug.' }
  }

  try {
    await prisma.category.create({
      data: { name: name.trim(), slug: slug.trim(), description, icon, order, isHidden }
    })
    revalidatePath('/admin/store/categories')
    revalidatePath('/loja')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao criar categoria.' }
  }
}

export async function updateCategory(id: number, formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return { success: false, error: 'Não autorizado' }

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string || null
  const icon = formData.get('icon') as string || null
  const order = parseInt(formData.get('order') as string) || 0
  const isHidden = formData.get('isHidden') === 'on'

  if (!name || !slug) {
    return { success: false, error: 'Preenche o nome e o slug.' }
  }

  try {
    await prisma.category.update({
      where: { id },
      data: { name: name.trim(), slug: slug.trim(), description, icon, order, isHidden }
    })
    revalidatePath('/admin/store/categories')
    revalidatePath('/loja')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao atualizar categoria.' }
  }
}

export async function deleteCategory(id: number) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return { success: false, error: 'Não autorizado' }

  try {
    await prisma.category.delete({ where: { id } })
    revalidatePath('/admin/store/categories')
    revalidatePath('/loja')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao eliminar categoria.' }
  }
}
