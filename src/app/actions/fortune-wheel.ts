'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'
import { revalidatePath } from 'next/cache'

// Configurações e Itens
export async function getWheelSettings() {
  const costSetting = await prisma.setting.findUnique({ where: { key: 'WHEEL_COST' } })
  const cooldownSetting = await prisma.setting.findUnique({ where: { key: 'WHEEL_COOLDOWN' } })

  return {
    cost: costSetting ? parseFloat(costSetting.value) : 50,
    cooldownMinutes: cooldownSetting ? parseInt(cooldownSetting.value) : 1440 // 24 hours
  }
}

export async function getWheelItems() {
  return await prisma.fortuneWheelItem.findMany({
    orderBy: { weight: 'desc' }
  })
}

export async function getProductsForWheel() {
  return await prisma.product.findMany({
    where: { isHidden: false },
    select: {
      id: true,
      name: true,
      category: {
        select: {
          id: true,
          name: true,
        }
      }
    },
    orderBy: [
      { category: { order: 'asc' } },
      { id: 'desc' }
    ]
  })
}

// Histórico
export async function getRecentWinners(limit = 10) {
  return await prisma.fortuneWheelHistory.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, username: true, name: true, avatar: true } },
      item: true
    }
  })
}

// Spin logic
export async function getUserNextSpinTime() {
  const session = await auth()
  if (!session?.user?.id) return null

  const userId = Number(session.user.id)
  const settings = await getWheelSettings()
  
  const lastSpin = await prisma.fortuneWheelHistory.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  if (lastSpin) {
    const nextSpinTime = new Date(lastSpin.createdAt.getTime() + settings.cooldownMinutes * 60000)
    if (new Date() < nextSpinTime) {
      return nextSpinTime
    }
  }

  return null
}

export async function spinWheel() {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'Não autenticado' }

  const userId = Number(session.user.id)
  
  const settings = await getWheelSettings()
  
  // Check Cooldown
  const lastSpin = await prisma.fortuneWheelHistory.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  if (lastSpin) {
    const nextSpinTime = new Date(lastSpin.createdAt.getTime() + settings.cooldownMinutes * 60000)
    if (new Date() < nextSpinTime) {
      return { success: false, error: 'Tens de esperar mais tempo para girar novamente.', nextSpinTime }
    }
  }

  // Check Balance and Deduct
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { success: false, error: 'Utilizador não encontrado' }

  if (settings.cost > 0 && user.balance < settings.cost) {
    return { success: false, error: `Saldo insuficiente. Precisas de ${settings.cost} moedas.` }
  }

  const items = await getWheelItems()
  if (items.length === 0) return { success: false, error: 'A roleta não tem prémios configurados.' }

  // Weighted random selection
  const totalWeight = items.reduce((acc, item) => acc + item.weight, 0)
  let random = Math.random() * totalWeight
  
  let selectedItem = items[items.length - 1]
  for (const item of items) {
    if (random < item.weight) {
      selectedItem = item
      break
    }
    random -= item.weight
  }

  // Transaction for deduction and reward
  try {
    await prisma.$transaction(async (tx) => {
      if (settings.cost > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { balance: { decrement: settings.cost } }
        })
      }

      // Retrieve product info if it's a PRODUCT prize
      let chestName = selectedItem.name
      let chestCommand = selectedItem.type === 'COMMAND' ? selectedItem.value : null
      let chestImage: string | null = null
      const chestAmount = selectedItem.type === 'CREDITS' ? parseFloat(selectedItem.value || '0') : null
      
      if (selectedItem.type === 'PRODUCT' && selectedItem.value) {
        const prodId = parseInt(selectedItem.value)
        const product = await tx.product.findUnique({ where: { id: prodId } })
        if (product) {
          chestName = product.name
          chestCommand = product.command
          chestImage = product.imageUrl
        }
      }

      await tx.chestItem.create({
        data: {
          userId,
          name: chestName,
          command: chestCommand,
          imageUrl: chestImage,
          type: selectedItem.type, // 'CREDITS', 'COMMAND', or 'PRODUCT'
          amount: chestAmount,
          source: 'FORTUNE_WHEEL',
          status: 'PENDING'
        }
      })

      await tx.fortuneWheelHistory.create({
        data: {
          userId,
          itemId: selectedItem.id
        }
      })
    })

    revalidatePath('/roleta')
    revalidatePath('/profile')

    return { success: true, item: selectedItem }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Ocorreu um erro ao processar o prémio.' }
  }
}

// Admin Actions
export async function updateWheelSettings(cost: number, cooldownMinutes: number) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { id: Number(session?.user?.id) } })
  if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'MODERATOR')) {
    return { success: false, error: 'Não autorizado' }
  }

  await prisma.setting.upsert({
    where: { key: 'WHEEL_COST' },
    update: { value: cost.toString() },
    create: { key: 'WHEEL_COST', value: cost.toString() }
  })

  await prisma.setting.upsert({
    where: { key: 'WHEEL_COOLDOWN' },
    update: { value: cooldownMinutes.toString() },
    create: { key: 'WHEEL_COOLDOWN', value: cooldownMinutes.toString() }
  })

  revalidatePath('/admin/roleta')
  revalidatePath('/roleta')
  return { success: true }
}

export async function addWheelItem(data: { name: string, type: string, value: string, weight: number, color: string, icon: string }) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { id: Number(session?.user?.id) } })
  if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'MODERATOR')) return { success: false }

  await prisma.fortuneWheelItem.create({ data })
  revalidatePath('/admin/roleta')
  revalidatePath('/roleta')
  return { success: true }
}

export async function updateWheelItem(id: number, data: { name: string, type: string, value: string, weight: number, color: string, icon: string }) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { id: Number(session?.user?.id) } })
  if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'MODERATOR')) return { success: false }

  await prisma.fortuneWheelItem.update({ where: { id }, data })
  revalidatePath('/admin/roleta')
  revalidatePath('/roleta')
  return { success: true }
}

export async function deleteWheelItem(id: number) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { id: Number(session?.user?.id) } })
  if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'MODERATOR')) return { success: false }

  await prisma.fortuneWheelItem.delete({ where: { id } })
  revalidatePath('/admin/roleta')
  revalidatePath('/roleta')
  return { success: true }
}
