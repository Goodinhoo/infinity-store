'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { hash } from 'bcryptjs'
import { logAudit } from '@/lib/audit'

export async function updateUserRole(userId: number, role: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role }
    })
    await logAudit('USER_ROLE_UPDATED', `Alterou o cargo do utilizador #${userId} para ${role}`)
    revalidatePath(`/admin/users/${userId}`)
    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Falha ao atualizar cargo do utilizador.' }
  }
}

export async function updateUserPermissions(userId: number, permissions: string[]) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { permissions: JSON.stringify(permissions) }
    })
    await logAudit('USER_PERMISSIONS_UPDATED', `Atualizou as permissões do utilizador #${userId} (${permissions.length} permissões ativas)`)
    revalidatePath(`/admin/users/${userId}`)
    revalidatePath('/admin/users')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Falha ao atualizar as permissões do utilizador.' }
  }
}

export async function updateUserBalance(userId: number, balance: number) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { balance }
    })
    await logAudit('USER_BALANCE_UPDATED', `Alterou o saldo do utilizador #${userId} para ${balance.toFixed(2)}€`)
    revalidatePath(`/admin/users/${userId}`)
    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Falha ao atualizar o saldo do utilizador.' }
  }
}

export async function updateUserPassword(userId: number, newPassword: string) {
  try {
    const hashedPassword = await hash(newPassword, 10)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })
    revalidatePath(`/admin/users/${userId}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Falha ao atualizar a palavra-passe.' }
  }
}

export async function sendItemToChest(userId: number, formData: FormData) {
  try {
    const productId = parseInt(formData.get('productId') as string)
    const description = formData.get('description') as string
    
    if (isNaN(productId)) {
      return { error: 'Produto inválido.' }
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return { error: 'Produto não encontrado.' }
    }

    await prisma.chestItem.create({
      data: {
        userId,
        name: product.name,
        command: product.command,
        imageUrl: product.imageUrl,
        description,
        type: 'PRODUCT',
        source: 'ADMIN',
        status: 'PENDING'
      }
    })
    
    revalidatePath(`/admin/users/${userId}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Falha ao enviar o item.' }
  }
}
