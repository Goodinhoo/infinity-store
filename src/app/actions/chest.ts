'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'
import { revalidatePath } from 'next/cache'
import { RconClient } from '@/lib/rcon'
import { logRcon } from '@/lib/audit'

export async function redeemChestItem(itemId: number, targetPlayer: string) {
  if (!targetPlayer || targetPlayer.trim() === '') {
    return { success: false, error: 'Nick do jogador é obrigatório.' }
  }

  const session = await auth()
  if (!session?.user) return { success: false, error: 'Não autenticado.' }
  
  const userId = Number(session.user.id)

  try {
    const item = await prisma.chestItem.findUnique({
      where: { id: itemId }
    })

    if (!item) return { success: false, error: 'Item não encontrado.' }
    if (item.userId !== userId) return { success: false, error: 'Não tens permissão para resgatar este item.' }
    if (item.status !== 'PENDING') return { success: false, error: 'Este item já foi resgatado.' }

    // Start transaction to safely process the redeem
    await prisma.$transaction(async (tx) => {
      // 1. Mark item as redeemed
      await tx.chestItem.update({
        where: { id: itemId },
        data: {
          status: 'REDEEMED',
          redeemedAt: new Date(),
          redeemedBy: targetPlayer.trim()
        }
      })

      // 2. Execute effects based on item type
      if (item.type === 'CREDITS' && item.amount) {
        // Find if targetPlayer has an account on the website (by username)
        const targetUser = await tx.user.findUnique({
          where: { username: targetPlayer.trim() }
        })

        if (targetUser) {
          // Give credits to the website user
          await tx.user.update({
            where: { id: targetUser.id },
            data: { balance: { increment: item.amount } }
          })
        } else {
          // Se for créditos e o user não tiver conta, não conseguimos adicionar saldo ao site.
          // Reverte a transação (isto falha a transação e vai para o bloco catch)
          throw new Error(`Para enviar créditos, o jogador "${targetPlayer}" tem de ter o seu nick registado neste site.`)
        }
      } else if ((item.type === 'COMMAND' || item.type === 'PRODUCT') && item.command) {
        const servers = await tx.minecraftServer.findMany({ where: { isActive: true } })
        if (servers.length > 0) {
          const targetServer = servers[0]
          const rawCmd = item.command.replace(/\{player\}/g, targetPlayer.trim())
          const commands = rawCmd.split(/;|\n/).map(c => c.trim()).filter(Boolean)

          for (const cmd of commands) {
            try {
              const output = await RconClient.executeCommand(
                targetServer.ip,
                targetServer.rconPort,
                targetServer.rconPassword,
                cmd
              )
              await logRcon({
                serverName: targetServer.name,
                player: targetPlayer.trim(),
                command: cmd,
                status: 'SUCCESS',
                response: output || 'OK'
              })
            } catch (rconErr) {
              const msg = rconErr instanceof Error ? rconErr.message : 'Erro RCON'
              await logRcon({
                serverName: targetServer.name,
                player: targetPlayer.trim(),
                command: cmd,
                status: 'FAILED',
                response: msg
              })
              throw new Error(`Falha no servidor RCON (${targetServer.name}): ${msg}`)
            }
          }
        }
      }
    })

    revalidatePath('/profile/bau')
    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error(error)
    const errMessage = error instanceof Error ? error.message : 'Ocorreu um erro ao resgatar o item.'
    return { success: false, error: errMessage }
  }
}
