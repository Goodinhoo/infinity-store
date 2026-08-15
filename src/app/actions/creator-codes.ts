'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/../auth'

export async function getCreatorCodes() {
  return await prisma.creatorCode.findMany({
    include: {
      creator: {
        select: { username: true, id: true, name: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createCreatorCode(data: {
  code: string
  discountPercent: number
  rewardPercent: number
  creatorId: number
}) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado.' }
    }

    const code = data.code.toUpperCase()

    const exists = await prisma.creatorCode.findUnique({
      where: { code }
    })
    
    if (exists) {
      return { success: false, error: 'Já existe um código de criador com este nome.' }
    }

    await prisma.creatorCode.create({
      data: {
        code,
        discountPercent: data.discountPercent,
        rewardPercent: data.rewardPercent,
        creatorId: data.creatorId
      }
    })

    revalidatePath('/admin/creators')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Ocorreu um erro ao criar o código.' }
  }
}

export async function toggleCreatorCode(id: number) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado.' }
    }

    const code = await prisma.creatorCode.findUnique({ where: { id } })
    if (!code) return { success: false, error: 'Código não encontrado.' }

    await prisma.creatorCode.update({
      where: { id },
      data: { isActive: !code.isActive }
    })

    revalidatePath('/admin/creators')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Erro ao alterar estado do código.' }
  }
}

export async function deleteCreatorCode(id: number) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Não autorizado.' }
    }

    await prisma.creatorCode.delete({ where: { id } })
    
    revalidatePath('/admin/creators')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Erro ao apagar o código.' }
  }
}

// Para usar no checkout
export async function verifyCreatorCode(codeStr: string) {
  const code = codeStr.toUpperCase()
  
  const creatorCode = await prisma.creatorCode.findUnique({
    where: { code },
    include: { creator: true }
  })
  
  if (!creatorCode) {
    return { success: false, error: 'Código inválido.' }
  }
  
  if (!creatorCode.isActive) {
    return { success: false, error: 'Este código não está ativo.' }
  }
  
  return { 
    success: true, 
    code: creatorCode 
  }
}
