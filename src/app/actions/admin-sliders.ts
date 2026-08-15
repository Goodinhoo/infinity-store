'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'
import { revalidatePath } from 'next/cache'

export async function getSlidersAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return []

  return await prisma.heroSlider.findMany({
    orderBy: { order: 'asc' }
  })
}

export async function createSlider(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return { success: false, error: 'Não autorizado' }

  const title = (formData.get('title') as string)?.trim()
  const subtitle = (formData.get('subtitle') as string)?.trim() || null
  const badge = (formData.get('badge') as string)?.trim() || null
  const imageUrl = (formData.get('imageUrl') as string)?.trim()
  const buttonText = (formData.get('buttonText') as string)?.trim() || null
  const buttonLink = (formData.get('buttonLink') as string)?.trim() || null
  const orderRaw = formData.get('order') as string
  const order = orderRaw ? parseInt(orderRaw) : 0
  const isActive = formData.get('isActive') === 'on'

  if (!title || !imageUrl) {
    return { success: false, error: 'Título e URL da Imagem são obrigatórios.' }
  }

  try {
    await prisma.heroSlider.create({
      data: {
        title,
        subtitle,
        badge,
        imageUrl,
        buttonText,
        buttonLink,
        order,
        isActive
      }
    })

    revalidatePath('/admin/sliders')
    revalidatePath('/')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao criar slide.' }
  }
}

export async function updateSlider(id: number, formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return { success: false, error: 'Não autorizado' }

  const title = (formData.get('title') as string)?.trim()
  const subtitle = (formData.get('subtitle') as string)?.trim() || null
  const badge = (formData.get('badge') as string)?.trim() || null
  const imageUrl = (formData.get('imageUrl') as string)?.trim()
  const buttonText = (formData.get('buttonText') as string)?.trim() || null
  const buttonLink = (formData.get('buttonLink') as string)?.trim() || null
  const orderRaw = formData.get('order') as string
  const order = orderRaw ? parseInt(orderRaw) : 0
  const isActive = formData.get('isActive') === 'on'

  if (!title || !imageUrl) {
    return { success: false, error: 'Título e URL da Imagem são obrigatórios.' }
  }

  try {
    await prisma.heroSlider.update({
      where: { id },
      data: {
        title,
        subtitle,
        badge,
        imageUrl,
        buttonText,
        buttonLink,
        order,
        isActive
      }
    })

    revalidatePath('/admin/sliders')
    revalidatePath('/')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao atualizar slide.' }
  }
}

export async function toggleSliderActive(id: number, isActive: boolean) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return { success: false, error: 'Não autorizado' }

  try {
    await prisma.heroSlider.update({
      where: { id },
      data: { isActive }
    })
    revalidatePath('/admin/sliders')
    revalidatePath('/')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao alterar estado do slide.' }
  }
}

export async function deleteSlider(id: number) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return { success: false, error: 'Não autorizado' }

  try {
    await prisma.heroSlider.delete({ where: { id } })
    revalidatePath('/admin/sliders')
    revalidatePath('/')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao eliminar slide.' }
  }
}

export async function getActiveSlidersFrontend() {
  if (!prisma.heroSlider) return []
  try {
    return await prisma.heroSlider.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })
  } catch {
    return []
  }
}
