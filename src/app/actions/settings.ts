'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getDonationGoal() {
  const [goalSetting, messageSetting] = await Promise.all([
    prisma.setting.findUnique({ where: { key: 'MONTHLY_GOAL_AMOUNT' } }),
    prisma.setting.findUnique({ where: { key: 'MONTHLY_GOAL_MESSAGE' } })
  ])

  return {
    amount: goalSetting ? parseFloat(goalSetting.value) : 100, // default 100
    message: messageSetting ? messageSetting.value : 'Ajude-nos a bater a meta deste mês!'
  }
}

// Módulos
export type ModuleKey = 'MODULE_FORTUNE_WHEEL' | 'MODULE_SUGGESTIONS' | 'MODULE_CASHBACK' | 'MODULE_LEADERBOARDS' | 'MODULE_CREATORS' | 'MODULE_DONATION_GOAL' | 'MODULE_LATEST_PURCHASES' | 'MODULE_DOWNLOADS' | 'MODULE_GIFTCARDS' | 'MODULE_VIPTABLE' | 'MODULE_VOTES' | 'MODULE_STAFF' | 'MODULE_CHANGELOG' | 'MODULE_APPLICATIONS' | 'MODULE_SLIDERS'

const defaultModules: Record<ModuleKey, boolean> = {
  MODULE_FORTUNE_WHEEL: true,
  MODULE_SUGGESTIONS: false,
  MODULE_CASHBACK: false,
  MODULE_LEADERBOARDS: false,
  MODULE_CREATORS: false,
  MODULE_DONATION_GOAL: true,
  MODULE_LATEST_PURCHASES: true,
  MODULE_DOWNLOADS: true,
  MODULE_GIFTCARDS: true,
  MODULE_VIPTABLE: true,
  MODULE_VOTES: true,
  MODULE_STAFF: true,
  MODULE_CHANGELOG: true,
  MODULE_APPLICATIONS: true,
  MODULE_SLIDERS: true,
}

export async function getModules(): Promise<Record<ModuleKey, boolean>> {
  const settings = await prisma.setting.findMany({
    where: { key: { startsWith: 'MODULE_' } }
  })
  
  const modules = { ...defaultModules }
  
  settings.forEach(s => {
    if (s.key in modules) {
      modules[s.key as ModuleKey] = s.value === 'true'
    }
  })
  
  return modules
}

export async function toggleModule(key: ModuleKey, enabled: boolean) {
  await prisma.setting.upsert({
    where: { key },
    update: { value: enabled.toString() },
    create: { key, value: enabled.toString() }
  })
  
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function getCashbackPercentage(): Promise<number> {
  const setting = await prisma.setting.findUnique({
    where: { key: 'CASHBACK_PERCENTAGE' }
  })
  return setting ? parseFloat(setting.value) : 2.5
}

export async function updateCashbackPercentage(percentage: number) {
  await prisma.setting.upsert({
    where: { key: 'CASHBACK_PERCENTAGE' },
    update: { value: percentage.toString() },
    create: { key: 'CASHBACK_PERCENTAGE', value: percentage.toString() }
  })
  revalidatePath('/admin/settings')
  return { success: true }
}

export async function updateDonationGoal(amount: number, message: string) {
  // Use upsert to create or update settings
  await prisma.$transaction([
    prisma.setting.upsert({
      where: { key: 'MONTHLY_GOAL_AMOUNT' },
      update: { value: amount.toString() },
      create: { key: 'MONTHLY_GOAL_AMOUNT', value: amount.toString() }
    }),
    prisma.setting.upsert({
      where: { key: 'MONTHLY_GOAL_MESSAGE' },
      update: { value: message },
      create: { key: 'MONTHLY_GOAL_MESSAGE', value: message }
    })
  ])

  revalidatePath('/')
  revalidatePath('/admin/settings')
  return { success: true }
}

export async function getCurrentMonthRevenue() {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const orders = await prisma.order.findMany({
    where: {
      status: 'PAID',
      createdAt: {
        gte: firstDayOfMonth
      }
    },
    select: {
      total: true
    }
  })

  const currentRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  return currentRevenue
}
