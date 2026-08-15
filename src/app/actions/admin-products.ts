'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return { success: false, error: 'Não autorizado' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const categoryId = parseInt(formData.get('categoryId') as string)
  const imageUrl = formData.get('imageUrl') as string || null
  const command = formData.get('command') as string || null
  const isFeatured = formData.get('isFeatured') === 'on'
  const isHidden = formData.get('isHidden') === 'on'
  
  const discountRaw = formData.get('discountPercentage') as string
  const discountPercentage = discountRaw ? parseInt(discountRaw) : null
  const serverIdRaw = formData.get('serverId') as string
  const serverId = serverIdRaw ? parseInt(serverIdRaw) : null

  if (!name || !description || isNaN(price) || isNaN(categoryId)) {
    return { success: false, error: 'Preenche todos os campos obrigatórios.' }
  }

  try {
    await prisma.product.create({
      data: { 
        name: name.trim(), 
        description, 
        price, 
        categoryId, 
        serverId,
        imageUrl, 
        isFeatured, 
        isHidden,
        command: command?.trim() || null,
        discountPercentage
      }
    })
    revalidatePath('/admin/store/products')
    revalidatePath('/loja')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao criar produto.' }
  }
}

export async function updateProduct(id: number, formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return { success: false, error: 'Não autorizado' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const categoryId = parseInt(formData.get('categoryId') as string)
  const imageUrl = formData.get('imageUrl') as string || null
  const command = formData.get('command') as string || null
  const isFeatured = formData.get('isFeatured') === 'on'
  const isHidden = formData.get('isHidden') === 'on'
  
  const discountRaw = formData.get('discountPercentage') as string
  const discountPercentage = discountRaw ? parseInt(discountRaw) : null
  const serverIdRaw = formData.get('serverId') as string
  const serverId = serverIdRaw ? parseInt(serverIdRaw) : null

  if (!name || !description || isNaN(price) || isNaN(categoryId)) {
    return { success: false, error: 'Preenche todos os campos obrigatórios.' }
  }

  try {
    await prisma.product.update({
      where: { id },
      data: { 
        name: name.trim(), 
        description, 
        price, 
        categoryId, 
        serverId,
        imageUrl, 
        isFeatured, 
        isHidden,
        command: command?.trim() || null,
        discountPercentage
      }
    })
    revalidatePath('/admin/store/products')
    revalidatePath('/loja')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao atualizar produto.' }
  }
}

export async function deleteProduct(id: number) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return { success: false, error: 'Não autorizado' }

  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath('/admin/store/products')
    revalidatePath('/loja')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao eliminar produto.' }
  }
}
