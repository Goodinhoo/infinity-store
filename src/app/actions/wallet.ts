'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'
import { revalidatePath } from 'next/cache'

export async function getUserBalance() {
  const session = await auth()
  const userId = session?.user?.id ? Number(session.user.id) : undefined

  if (!userId) return 0

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true }
  })
  return user?.balance || 0
}

export async function addBalance(amount: number) {
  try {
    const session = await auth()
    const userId = session?.user?.id ? Number(session.user.id) : undefined

    if (!userId) {
      return { error: 'Precisas de iniciar sessão.' }
    }

    if (amount <= 0 || amount > 500) {
      return { error: 'Valor inválido. Podes adicionar entre 1€ e 500€.' }
    }

    // Como é uma simulação, adicionamos diretamente o saldo
    await prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: amount
        }
      }
    })

    revalidatePath('/profile')
    revalidatePath('/checkout')

    return { success: true }
  } catch (error) {
    console.error('Erro ao adicionar saldo:', error)
    return { error: 'Ocorreu um erro ao processar o pagamento.' }
  }
}
