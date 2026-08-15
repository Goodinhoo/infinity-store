'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'
import { updateOrderStatus } from './admin'

// Read prizes
export async function getLeaderboardPrizes() {
  const keys = ['LEADERBOARD_PRIZE_1_PRODUCT_ID', 'LEADERBOARD_PRIZE_2_PRODUCT_ID', 'LEADERBOARD_PRIZE_3_PRODUCT_ID']
  
  const settings = await prisma.setting.findMany({
    where: { key: { in: keys } }
  })
  
  const prizes = {
    top1: settings.find(s => s.key === 'LEADERBOARD_PRIZE_1_PRODUCT_ID')?.value || '',
    top2: settings.find(s => s.key === 'LEADERBOARD_PRIZE_2_PRODUCT_ID')?.value || '',
    top3: settings.find(s => s.key === 'LEADERBOARD_PRIZE_3_PRODUCT_ID')?.value || '',
  }

  return prizes
}

// Save prizes
export async function saveLeaderboardPrizes(top1: string, top2: string, top3: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Not authorized' }
  const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } })
  if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') return { error: 'Not authorized' }

  const updates = [
    { key: 'LEADERBOARD_PRIZE_1_PRODUCT_ID', value: top1 },
    { key: 'LEADERBOARD_PRIZE_2_PRODUCT_ID', value: top2 },
    { key: 'LEADERBOARD_PRIZE_3_PRODUCT_ID', value: top3 },
  ]

  for (const item of updates) {
    const existing = await prisma.setting.findUnique({ where: { key: item.key } })
    if (existing) {
      await prisma.setting.update({ where: { key: item.key }, data: { value: item.value } })
    } else {
      await prisma.setting.create({ data: { key: item.key, value: item.value } })
    }
  }

  return { success: true }
}

// Get top donators for a specific month and year
export async function getTopDonators(month: number, year: number, limit = 10) {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 1)

  const orders = await prisma.order.findMany({
    where: {
      status: 'PAID',
      createdAt: {
        gte: startDate,
        lt: endDate
      }
    },
    select: {
      player: true,
      total: true
    }
  })

  // Group by player
  const playerTotals: Record<string, number> = {}
  for (const order of orders) {
    playerTotals[order.player] = (playerTotals[order.player] || 0) + order.total
  }

  // Sort and take limit
  const sorted = Object.entries(playerTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map((entry, index) => ({
      rank: index + 1,
      player: entry[0],
      total: entry[1]
    }))

  return sorted
}

// Distribute prizes for the LAST month
export async function distributePrizes() {
  const session = await auth()
  if (!session?.user) return { error: 'Not authorized' }
  const adminUser = await prisma.user.findUnique({ where: { id: Number(session.user.id) } })
  if (adminUser?.role !== 'ADMIN' && adminUser?.role !== 'MODERATOR') return { error: 'Not authorized' }

  const now = new Date()
  let targetMonth = now.getMonth() - 1
  let targetYear = now.getFullYear()
  
  if (targetMonth < 0) {
    targetMonth = 11
    targetYear -= 1
  }

  const topDonators = await getTopDonators(targetMonth, targetYear, 3)
  const prizes = await getLeaderboardPrizes()

  let distributed = 0

  for (const winner of topDonators) {
    const prizeProductId = winner.rank === 1 ? prizes.top1 : winner.rank === 2 ? prizes.top2 : winner.rank === 3 ? prizes.top3 : null
    
    if (prizeProductId && prizeProductId !== '') {
      // Find user by username
      const user = await prisma.user.findUnique({ where: { username: winner.player } })
      
      // We create a fake order to distribute the product (so it executes commands/cashback correctly)
      const order = await prisma.order.create({
        data: {
          player: winner.player,
          userId: user ? user.id : null,
          total: 0,
          status: 'PENDING',
          items: {
            create: [
              {
                productId: Number(prizeProductId),
                price: 0,
                quantity: 1
              }
            ]
          }
        }
      })

      // Update order to paid to trigger item distribution
      await updateOrderStatus(order.id, 'PAID')
      distributed++
    }
  }

  return { success: true, count: distributed }
}
