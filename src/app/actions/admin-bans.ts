'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createPunishment(formData: FormData) {
  const player = formData.get('player') as string
  const type = formData.get('type') as string
  const operator = formData.get('operator') as string
  const reason = formData.get('reason') as string

  if (!player || !type || !reason) {
    return { success: false, error: 'Campos obrigatórios em falta.' }
  }

  try {
    await prisma.punishment.create({
      data: { player: player.trim(), type, operator: operator.trim() || 'Sistema', reason }
    })
    revalidatePath('/admin/bans')
    revalidatePath('/punicoes')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Erro ao criar punição no servidor.' }
  }
}

export async function deletePunishment(id: number) {
  try {
    await prisma.punishment.delete({ where: { id } })
    revalidatePath('/admin/bans')
    revalidatePath('/punicoes')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Erro ao remover punição no servidor.' }
  }
}
