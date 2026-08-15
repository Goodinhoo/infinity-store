'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getModules, getCashbackPercentage } from '@/app/actions/settings'

// --- CATEGORIES ---
export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string || null
  const icon = formData.get('icon') as string || null
  const order = parseInt(formData.get('order') as string) || 0

  if (!name || !slug) return { error: 'Nome e Slug são obrigatórios.' }

  try {
    await prisma.category.create({
      data: { name: name.trim(), slug: slug.trim(), description, icon, order }
    })
    revalidatePath('/admin/store/categories')
    revalidatePath('/loja')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Erro ao criar categoria. Verifica se o slug já existe.' }
  }
}

export async function deleteCategory(id: number) {
  try {
    await prisma.category.delete({ where: { id } })
    revalidatePath('/admin/store/categories')
    revalidatePath('/loja')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Falha ao eliminar categoria.' }
  }
}

// --- PRODUCTS ---
export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const categoryId = parseInt(formData.get('categoryId') as string)
  const imageUrl = formData.get('imageUrl') as string || null
  const isFeatured = formData.get('isFeatured') === 'true'
  const command = formData.get('command') as string || null

  if (!name || !description || isNaN(price) || isNaN(categoryId)) {
    return { error: 'Todos os campos obrigatórios devem ser preenchidos.' }
  }

  try {
    await prisma.product.create({
      data: { name: name.trim(), description, price, categoryId, imageUrl, isFeatured, command: command?.trim() || null }
    })
    revalidatePath('/admin/store/products')
    revalidatePath('/loja')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Erro ao criar produto.' }
  }
}

export async function deleteProduct(id: number) {
  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath('/admin/store/products')
    revalidatePath('/loja')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Falha ao eliminar produto.' }
  }
}

// --- ORDERS ---
export async function updateOrderStatus(id: number, status: string) {
  try {
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } }
    })
    
    if (!currentOrder) return { error: 'Encomenda não encontrada' }

    if (status === 'PAID' && currentOrder.status !== 'PAID' && currentOrder.userId) {
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
      for (const item of currentOrder.items) {
        for (let i = 0; i < item.quantity; i++) {
          chestItemsData.push({
            userId: currentOrder.userId,
            name: item.product.name,
            description: item.product.description,
            imageUrl: item.product.imageUrl,
            command: item.product.command,
            type: 'PRODUCT',
            source: 'STORE',
            status: 'PENDING'
          })
        }
      }
      if (chestItemsData.length > 0) {
        await prisma.chestItem.createMany({ data: chestItemsData })
      }

      // CASHBACK MODULE
      const modules = await getModules()
      if (modules.MODULE_CASHBACK) {
        const cashbackPct = await getCashbackPercentage()
        const cashbackAmount = (currentOrder.total * cashbackPct) / 100
        
        if (cashbackAmount > 0) {
          await prisma.user.update({
            where: { id: currentOrder.userId },
            data: { balance: { increment: cashbackAmount } }
          })
          
          // Nota: Como não temos tabela Transaction, o saldo é atualizado diretamente.
          // Numa versão futura poder-se-ia criar um registo na tabela de notificações/transações.
        }
      }

      // CREATORS (AFFILIATES) MODULE
      if (currentOrder.creatorCodeId) {
        const creatorCode = await prisma.creatorCode.findUnique({
          where: { id: currentOrder.creatorCodeId }
        })

        if (creatorCode) {
          const rewardAmount = currentOrder.total * (creatorCode.rewardPercent / 100)
          await prisma.creatorCode.update({
            where: { id: creatorCode.id },
            data: {
              totalGenerated: { increment: currentOrder.total },
              totalRewarded: { increment: rewardAmount }
            }
          })
          await prisma.user.update({
            where: { id: creatorCode.creatorId },
            data: { balance: { increment: rewardAmount } }
          })
        }
      }
    }

    await prisma.order.update({
      where: { id },
      data: { status }
    })
    revalidatePath('/admin/store/orders')
    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Falha ao atualizar o estado da encomenda.' }
  }
}

export async function deleteOrder(id: number) {
  try {
    await prisma.order.delete({ where: { id } })
    revalidatePath('/admin/store/orders')
    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Falha ao eliminar encomenda.' }
  }
}

// --- USERS ---
export async function updateUserRole(userId: number, role: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role }
    })
    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Falha ao atualizar cargo do utilizador.' }
  }
}

export async function updateUserBalance(userId: number, balance: number) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { balance }
    })
    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Falha ao atualizar saldo.' }
  }
}

// --- BLOG ---
export async function createBlogPost(formData: FormData, authorId: number) {
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const content = formData.get('content') as string
  const imageUrl = formData.get('imageUrl') as string || null

  if (!title || !slug || !content) return { error: 'Título, Slug e Conteúdo são obrigatórios.' }

  try {
    await prisma.blogPost.create({
      data: { title: title.trim(), slug: slug.trim(), content, imageUrl, authorId }
    })
    revalidatePath('/admin/blog')
    revalidatePath('/blog')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Erro ao criar notícia.' }
  }
}

export async function deleteBlogPost(id: number) {
  try {
    await prisma.blogPost.delete({ where: { id } })
    revalidatePath('/admin/blog')
    revalidatePath('/blog')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Falha ao eliminar notícia.' }
  }
}

// --- TICKETS ---
export async function createTicket(title: string, content: string, userId: number) {
  if (!title || !content) return { error: 'Título e Mensagem são obrigatórios.' }

  try {
    const ticket = await prisma.ticket.create({
      data: {
        title: title.trim(),
        status: 'OPEN',
        userId,
        replies: {
          create: {
            content,
            userId
          }
        }
      }
    })
    revalidatePath('/suporte')
    revalidatePath('/admin/tickets')
    return { success: true, ticketId: ticket.id }
  } catch (error) {
    console.error(error)
    return { error: 'Erro ao criar ticket de suporte.' }
  }
}

export async function replyTicket(ticketId: number, content: string, userId: number) {
  if (!content) return { error: 'Conteúdo da resposta é obrigatório.' }

  try {
    await prisma.ticketReply.create({
      data: { ticketId, content, userId }
    })
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() }
    })
    revalidatePath(`/suporte/${ticketId}`)
    revalidatePath('/suporte')
    revalidatePath('/admin/tickets')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Erro ao enviar resposta.' }
  }
}

export async function updateTicketStatus(ticketId: number, status: string) {
  try {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status }
    })
    revalidatePath(`/suporte/${ticketId}`)
    revalidatePath('/admin/tickets')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Falha ao atualizar o estado do ticket.' }
  }
}

// --- PUNISHMENTS ---
export async function createPunishment(formData: FormData) {
  const player = formData.get('player') as string
  const type = formData.get('type') as string
  const operator = formData.get('operator') as string
  const reason = formData.get('reason') as string

  if (!player || !type || !reason) return { error: 'Campos obrigatórios em falta.' }

  try {
    await prisma.punishment.create({
      data: { player: player.trim(), type, operator: operator || 'Sistema', reason }
    })
    revalidatePath('/punicoes')
    revalidatePath('/admin/bans')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Erro ao registar punição.' }
  }
}

export async function deletePunishment(id: number) {
  try {
    await prisma.punishment.delete({ where: { id } })
    revalidatePath('/punicoes')
    revalidatePath('/admin/bans')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Falha ao remover punição.' }
  }
}
