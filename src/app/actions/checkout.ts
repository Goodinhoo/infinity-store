'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'

type CheckoutItem = {
  id: number
  quantity: number
  price: number
}

export async function createOrder(
  player: string, 
  items: CheckoutItem[], 
  total: number, 
  paymentMethod: 'EXTERNAL' | 'BALANCE' = 'EXTERNAL',
  couponId?: number | null,
  creatorCodeId?: number | null
) {
  if (!player || player.trim() === '') {
    return { error: 'O nick do jogador é obrigatório' }
  }

  if (!items || items.length === 0) {
    return { error: 'O carrinho está vazio' }
  }

  try {
    const session = await auth()
    const userId = session?.user?.id ? Number(session.user.id) : undefined

    if (!userId) {
      return { error: 'Tens de iniciar sessão para finalizar a tua encomenda' }
    }

    if (paymentMethod === 'BALANCE') {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { balance: true } })
      if (!user || user.balance < total) {
        return { error: 'Saldo insuficiente na tua carteira.' }
      }

      // Buscar info dos produtos reais para os enviar para o baú
      const productIds = items.map(i => i.id)
      const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
      
      const chestItemsData: {
        userId: number
        name: string
        description: string
        imageUrl: string | null
        command: string | null
        type: 'PRODUCT'
        source: 'STORE'
        status: 'PENDING'
      }[] = []
      for (const item of items) {
        const prod = products.find(p => p.id === item.id)
        if (prod) {
          for (let i = 0; i < item.quantity; i++) {
            chestItemsData.push({
              userId,
              name: prod.name,
              description: prod.description,
              imageUrl: prod.imageUrl,
              command: prod.command,
              type: 'PRODUCT',
              source: 'STORE',
              status: 'PENDING'
            })
          }
        }
      }

      // Fetch creator code se existir para dar a recompensa
      const creatorCode = creatorCodeId 
        ? await prisma.creatorCode.findUnique({ where: { id: creatorCodeId } })
        : null

      // Executa tudo como uma transação
      const [order] = await prisma.$transaction([
        prisma.order.create({
          data: {
            player: player.trim(),
            userId,
            total,
            status: 'PAID',
            couponId,
            creatorCodeId,
            items: {
              create: items.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price
              }))
            }
          }
        }),
        prisma.user.update({
          where: { id: userId },
          data: { balance: { decrement: total } }
        }),
        prisma.chestItem.createMany({
          data: chestItemsData
        }),
        ...(couponId ? [
          prisma.coupon.update({
            where: { id: couponId },
            data: { uses: { increment: 1 } }
          })
        ] : []),
        ...(creatorCode ? [
          prisma.creatorCode.update({
            where: { id: creatorCode.id },
            data: {
              uses: { increment: 1 },
              totalGenerated: { increment: total },
              totalRewarded: { increment: total * (creatorCode.rewardPercent / 100) }
            }
          }),
          prisma.user.update({
            where: { id: creatorCode.creatorId },
            data: { balance: { increment: total * (creatorCode.rewardPercent / 100) } }
          })
        ] : [])
      ])

      return { success: true, orderId: order.id }
    }

    // Fluxo Externo (MBWay / PayPal)
    const order = await prisma.order.create({
      data: {
        player: player.trim(),
        userId: userId || undefined,
        total,
        status: 'PENDING',
        couponId,
        creatorCodeId,
        items: {
          create: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    })

    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { uses: { increment: 1 } }
      })
    }
    
    if (creatorCodeId) {
      await prisma.creatorCode.update({
        where: { id: creatorCodeId },
        data: { uses: { increment: 1 } }
      })
    }

    return { success: true, orderId: order.id }
  } catch (error) {
    console.error('Erro ao criar encomenda:', error)
    return { error: 'Ocorreu um erro ao processar a tua encomenda.' }
  }
}
