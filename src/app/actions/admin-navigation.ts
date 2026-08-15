'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user) throw new Error('Não autorizado')
  
  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) }
  })
  if (!user || user.role !== 'ADMIN') throw new Error('Não autorizado')
  return user
}
import { revalidatePath } from 'next/cache'

// Inicializar itens se estiver vazio baseado nos links atuais
const globalForSeed = global as unknown as { hasSeededNavigation?: boolean }

export async function seedNavigation() {
  if (globalForSeed.hasSeededNavigation) return
  globalForSeed.hasSeededNavigation = true

  const count = await prisma.navigationItem.count()
  if (count === 0) {
    const defaultItems = [
      { label: 'Início', url: '/', icon: 'Home', order: 0, isSystem: true },
      { label: 'VIPs', url: '/vips', icon: 'Table', order: 1, isSystem: true },
      { label: 'Loja', url: '/loja', icon: 'ShoppingBag', order: 2, isSystem: true },
      { label: 'Notícias', url: '/blog', icon: 'BookOpen', order: 3, isSystem: true },
      { label: 'Suporte', url: '/suporte', icon: 'LifeBuoy', order: 4, isSystem: true },
      { label: 'Punições', url: '/punicoes', icon: 'ShieldAlert', order: 5, isSystem: true },
      { label: 'Sugestões', url: '/sugestoes', icon: 'Lightbulb', order: 6, isSystem: true },
      { label: 'Downloads', url: '/downloads', icon: 'DownloadCloud', order: 7, isSystem: true },
      { label: 'Votos', url: '/votos', icon: 'MousePointerClick', order: 8, isSystem: true },
      { label: 'Roleta', url: '/roleta', icon: 'CircleDot', order: 9, isSystem: true },
    ]
    await prisma.navigationItem.createMany({ data: defaultItems })
  }
}

export async function getNavigationItems() {
  await seedNavigation()
  return await prisma.navigationItem.findMany({
    orderBy: { order: 'asc' }
  })
}

export async function createNavigationItem(label: string, url: string, icon: string | null) {
  const user = await checkAdmin()
  if (!user) return { error: 'Não autorizado' }

  try {
    const maxOrder = await prisma.navigationItem.aggregate({
      _max: { order: true }
    })
    const order = (maxOrder._max.order ?? -1) + 1

    await prisma.navigationItem.create({
      data: { label, url, icon, order }
    })
    
    revalidatePath('/')
    revalidatePath('/admin/navigation')
    return { success: true }
  } catch {
    return { error: 'Erro ao criar item de navegação' }
  }
}

export async function updateNavigationItem(id: number, data: { label?: string, url?: string, icon?: string | null, isActive?: boolean }) {
  const user = await checkAdmin()
  if (!user) return { error: 'Não autorizado' }

  try {
    const item = await prisma.navigationItem.findUnique({ where: { id } })
    if (item?.isSystem && (data.url !== undefined || data.label !== undefined)) {
      // Itens de sistema só podem mudar ícone e status
      delete data.url
      delete data.label
    }

    await prisma.navigationItem.update({
      where: { id },
      data
    })
    
    revalidatePath('/')
    revalidatePath('/admin/navigation')
    return { success: true }
  } catch {
    return { error: 'Erro ao atualizar item de navegação' }
  }
}

export async function deleteNavigationItem(id: number) {
  const user = await checkAdmin()
  if (!user) return { error: 'Não autorizado' }

  try {
    const item = await prisma.navigationItem.findUnique({ where: { id } })
    if (item?.isSystem) {
      return { error: 'Não podes apagar links do sistema (apenas ocultá-los)' }
    }

    await prisma.navigationItem.delete({ where: { id } })
    
    revalidatePath('/')
    revalidatePath('/admin/navigation')
    return { success: true }
  } catch {
    return { error: 'Erro ao apagar item' }
  }
}

export async function reorderNavigationItems(items: { id: number, order: number }[]) {
  const user = await checkAdmin()
  if (!user) return { error: 'Não autorizado' }

  try {
    await prisma.$transaction(
      items.map(item => 
        prisma.navigationItem.update({
          where: { id: item.id },
          data: { order: item.order }
        })
      )
    )
    
    revalidatePath('/')
    revalidatePath('/admin/navigation')
    return { success: true }
  } catch {
    return { error: 'Erro ao reordenar itens' }
  }
}
