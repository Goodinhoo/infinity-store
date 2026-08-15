"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { randomBytes } from "crypto"

function generateCode(prefix: string) {
  const segment1 = randomBytes(2).toString('hex').toUpperCase()
  const segment2 = randomBytes(2).toString('hex').toUpperCase()
  return `${prefix}-${segment1}-${segment2}`
}

export async function getGiftCards() {
  try {
    const cards = await prisma.giftCard.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        usedBy: {
          select: {
            username: true
          }
        }
      }
    })
    return { success: true, cards }
  } catch (error) {
    console.error("Erro ao procurar cartões:", error)
    return { success: false, error: "Erro ao procurar cartões." }
  }
}

export async function createGiftCards(amount: number, count: number = 1) {
  try {
    const newCards: { code: string; amount: number }[] = []
    
    for (let i = 0; i < count; i++) {
      let code = generateCode('INFINITY')
      
      // Ensure unique code
      let exists = await prisma.giftCard.findUnique({ where: { code } })
      while (exists) {
        code = generateCode('INFINITY')
        exists = await prisma.giftCard.findUnique({ where: { code } })
      }
      
      newCards.push({ code, amount })
    }

    await prisma.giftCard.createMany({
      data: newCards
    })

    revalidatePath("/admin/store/giftcards")
    return { success: true, message: `${count} cartão(ões) gerados com sucesso!` }
  } catch (error) {
    console.error("Erro ao gerar cartões:", error)
    return { success: false, error: "Erro ao gerar os cartões." }
  }
}

export async function deleteGiftCard(id: number) {
  try {
    await prisma.giftCard.delete({
      where: { id }
    })
    
    revalidatePath("/admin/store/giftcards")
    return { success: true, message: "Cartão eliminado com sucesso!" }
  } catch (error) {
    console.error("Erro ao eliminar cartão:", error)
    return { success: false, error: "Erro ao eliminar o cartão." }
  }
}
