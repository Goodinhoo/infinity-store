'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { hash } from 'bcryptjs'

export async function updateUserRole(userId: number, role: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role }
    })
    revalidatePath(`/admin/users/${userId}`)
    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Falha ao atualizar cargo do utilizador.' }
  }
}

export async function updateUserBalance(userId: number, balance: number) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { balance }
    })
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
