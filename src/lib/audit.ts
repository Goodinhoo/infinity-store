import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'

export async function logAudit(action: string, details: string, targetUserId?: number) {
  try {
    const session = await auth()
    const sessionUserId = session?.user?.id ? Number(session.user.id) : undefined
    const sessionUsername = session?.user?.name || session?.user?.email || 'Sistema'

    await prisma.auditLog.create({
      data: {
        userId: sessionUserId,
        username: sessionUsername,
        action,
        details: targetUserId ? `${details} (Alvo: #${targetUserId})` : details,
      }
    })
  } catch (error) {
    console.error('Falha ao gravar audit log:', error)
  }
}

export async function logRcon(data: {
  orderId?: number
  serverName: string
  player: string
  command: string
  status: 'SUCCESS' | 'FAILED'
  response?: string
}) {
  try {
    await prisma.rconLog.create({
      data: {
        orderId: data.orderId,
        serverName: data.serverName,
        player: data.player,
        command: data.command,
        status: data.status,
        response: data.response
      }
    })
  } catch (error) {
    console.error('Falha ao gravar RCON log:', error)
  }
}
