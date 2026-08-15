"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/../auth"

export async function redeemGiftCard(code: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Precisas de iniciar sessão para resgatar cartões." }
    }

    const userId = Number(session.user.id)
    const upperCode = code.toUpperCase().trim()

    // Encontrar o cartão
    const card = await prisma.giftCard.findUnique({
      where: { code: upperCode }
    })

    if (!card) {
      return { success: false, error: "Código inválido." }
    }

    if (card.isUsed) {
      return { success: false, error: "Este código já foi usado." }
    }

    // Iniciar a transação para evitar race conditions
    await prisma.$transaction(async (tx) => {
      // Marcar como usado
      await tx.giftCard.update({
        where: { id: card.id },
        data: {
          isUsed: true,
          usedById: userId,
          usedAt: new Date()
        }
      })

      // Adicionar o saldo ao utilizador
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: {
            increment: card.amount
          }
        }
      })
    })

    revalidatePath("/profile")
    return { success: true, message: `Resgataste com sucesso ${card.amount}€!` }
  } catch (error) {
    console.error("Erro ao resgatar cartão:", error)
    return { success: false, error: "Erro interno ao resgatar o código." }
  }
}
