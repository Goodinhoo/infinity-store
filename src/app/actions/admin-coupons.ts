'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'
import { revalidatePath } from 'next/cache'

export async function createCoupon(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Não autorizado' }
  }

  const code = formData.get('code') as string
  const discountPct = parseInt(formData.get('discountPct') as string)
  const maxUsesRaw = formData.get('maxUses') as string
  const maxUses = maxUsesRaw ? parseInt(maxUsesRaw) : null
  const expiresAtRaw = formData.get('expiresAt') as string
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null

  const categoryIds = formData.getAll('categoryIds').map(id => parseInt(id as string))
  const productIds = formData.getAll('productIds').map(id => parseInt(id as string))

  if (!code || isNaN(discountPct) || discountPct <= 0 || discountPct > 100) {
    return { success: false, error: 'Dados inválidos' }
  }

  try {
    await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        discountPct,
        maxUses,
        expiresAt,
        categories: { connect: categoryIds.map(id => ({ id })) },
        products: { connect: productIds.map(id => ({ id })) }
      }
    })
    revalidatePath('/admin/store/coupons')
    return { success: true }
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002') {
      return { success: false, error: 'Este código já existe!' }
    }
    return { success: false, error: 'Erro ao criar cupão' }
  }
}

export async function updateCoupon(id: number, formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Não autorizado' }
  }

  const code = formData.get('code') as string
  const discountPct = parseInt(formData.get('discountPct') as string)
  const maxUsesRaw = formData.get('maxUses') as string
  const maxUses = maxUsesRaw ? parseInt(maxUsesRaw) : null
  const expiresAtRaw = formData.get('expiresAt') as string
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null

  const categoryIds = formData.getAll('categoryIds').map(id => parseInt(id as string))
  const productIds = formData.getAll('productIds').map(id => parseInt(id as string))

  if (!code || isNaN(discountPct) || discountPct <= 0 || discountPct > 100) {
    return { success: false, error: 'Dados inválidos' }
  }

  try {
    await prisma.coupon.update({
      where: { id },
      data: {
        code: code.trim().toUpperCase(),
        discountPct,
        maxUses,
        expiresAt,
        categories: { set: categoryIds.map(catId => ({ id: catId })) },
        products: { set: productIds.map(prodId => ({ id: prodId })) }
      }
    })
    revalidatePath('/admin/store/coupons')
    return { success: true }
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002') {
      return { success: false, error: 'Este código já existe!' }
    }
    return { success: false, error: 'Erro ao atualizar cupão' }
  }
}

export async function deleteCoupon(id: number) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    await prisma.coupon.delete({ where: { id } })
    revalidatePath('/admin/store/coupons')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao eliminar cupão' }
  }
}

export async function toggleCoupon(id: number, isActive: boolean) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    await prisma.coupon.update({
      where: { id },
      data: { isActive }
    })
    revalidatePath('/admin/store/coupons')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao atualizar cupão' }
  }
}

export async function validateCoupon(code: string) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        categories: { select: { id: true } },
        products: { select: { id: true } }
      }
    })

    if (!coupon) return { valid: false, error: 'Cupão não encontrado' }
    if (!coupon.isActive) return { valid: false, error: 'Este cupão está inativo' }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return { valid: false, error: 'Este cupão já expirou' }
    if (coupon.maxUses !== null && coupon.uses >= coupon.maxUses) return { valid: false, error: 'Este cupão atingiu o limite de utilizações' }

    return { 
      valid: true, 
      discountPct: coupon.discountPct, 
      couponId: coupon.id,
      applicableCategoryIds: coupon.categories.map(c => c.id),
      applicableProductIds: coupon.products.map(p => p.id)
    }
  } catch {
    return { valid: false, error: 'Erro ao validar cupão' }
  }
}
