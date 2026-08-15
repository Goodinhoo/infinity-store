'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { RconClient } from '@/lib/rcon'
import { logRcon } from '@/lib/audit'

export async function getServersAdmin() {
  return await prisma.minecraftServer.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function getServersPublic() {
  return await prisma.minecraftServer.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })
}

function parseServerAddress(rawIp: string, rawPort?: number): { ip: string; port: number } {
  let ip = (rawIp || '').trim()
  let port = Number(rawPort) || 25575

  if (ip.includes(':')) {
    const parts = ip.split(':')
    ip = parts[0].trim()
    const extractedPort = parseInt(parts[1], 10)
    if (!isNaN(extractedPort) && extractedPort > 0) {
      if (!rawPort || rawPort === 25575) {
        port = extractedPort
      }
    }
  }

  return { ip, port }
}

export async function createMinecraftServer(data: {
  name: string
  ip: string
  rconPort: number
  rconPassword: string
}) {
  const parsed = parseServerAddress(data.ip, data.rconPort)
  const server = await prisma.minecraftServer.create({
    data: {
      name: data.name,
      ip: parsed.ip,
      rconPort: parsed.port,
      rconPassword: data.rconPassword,
      isActive: true
    }
  })

  revalidatePath('/admin/servers')
  return server
}

export async function updateMinecraftServer(id: number, data: {
  name: string
  ip: string
  rconPort: number
  rconPassword: string
  isActive?: boolean
}) {
  const parsed = parseServerAddress(data.ip, data.rconPort)
  const server = await prisma.minecraftServer.update({
    where: { id },
    data: {
      name: data.name,
      ip: parsed.ip,
      rconPort: parsed.port,
      rconPassword: data.rconPassword,
      isActive: data.isActive !== undefined ? data.isActive : true
    }
  })

  revalidatePath('/admin/servers')
  return server
}

export async function deleteMinecraftServer(id: number) {
  await prisma.minecraftServer.delete({
    where: { id }
  })

  revalidatePath('/admin/servers')
  return true
}

export async function testRconConnection(data: {
  ip: string
  rconPort: number
  rconPassword: string
}) {
  try {
    const parsed = parseServerAddress(data.ip, data.rconPort)
    const client = new RconClient(parsed.ip, parsed.port, data.rconPassword)
    await client.connect()
    
    // Send a safe test command
    let response = await client.send('version')
    if (!response) {
      response = await client.send('list')
    }
    client.disconnect()

    return {
      success: true,
      message: `Conectado com Sucesso! Resposta do Servidor: "${response || 'OK'}"`
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Falha ao ligar ao servidor RCON.'
    return {
      success: false,
      error: msg
    }
  }
}

export async function sendRconCommand(data: {
  ip: string
  rconPort: number
  rconPassword: string
  command: string
}) {
  const parsed = parseServerAddress(data.ip, data.rconPort)
  try {
    const client = new RconClient(parsed.ip, parsed.port, data.rconPassword)
    await client.connect()
    
    const response = await client.send(data.command)
    client.disconnect()

    await logRcon({
      serverName: parsed.ip,
      player: 'Admin Console',
      command: data.command,
      response: response || 'Executado com Sucesso',
      status: 'SUCCESS'
    })

    return {
      success: true,
      message: response || 'Comando enviado e executado no Minecraft!'
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Falha ao executar comando via RCON.'
    
    await logRcon({
      serverName: parsed.ip,
      player: 'Admin Console',
      command: data.command,
      response: msg,
      status: 'FAILED'
    })

    return {
      success: false,
      error: msg
    }
  }
}

export async function executeOrderRconCommands(orderId: number) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: { server: true }
            }
          }
        }
      }
    })

    if (!order || order.status !== 'PAID') return { success: false, error: 'Encomenda não encontrada ou não paga.' }

    const results: string[] = []
    const servers = await prisma.minecraftServer.findMany({ where: { isActive: true } })
    const defaultServer = servers.length > 0 ? servers[0] : null

    for (const item of order.items) {
      const product = item.product
      if (!product.command) continue

      const targetServer = product.server || defaultServer
      if (!targetServer || !targetServer.isActive) {
        results.push(`Aviso: Nenhum servidor RCON ativo configurado para o produto ${product.name}.`)
        continue
      }

      // Replaces placeholders in command: {player}, {quantity}, {order_id}
      let rawCmd = product.command
      rawCmd = rawCmd.replace(/\{player\}/g, order.player)
      rawCmd = rawCmd.replace(/\{quantity\}/g, item.quantity.toString())
      rawCmd = rawCmd.replace(/\{order_id\}/g, order.id.toString())

      // Split multiple commands separated by semicolon or newline
      const commands = rawCmd.split(/;|\n/).map(c => c.trim()).filter(Boolean)

      for (const cmd of commands) {
        try {
          const output = await RconClient.executeCommand(
            targetServer.ip,
            targetServer.rconPort,
            targetServer.rconPassword,
            cmd
          )
          results.push(`[${targetServer.name}] Executado: "${cmd}" → ${output || 'OK'}`)
          await logRcon({
            orderId: order.id,
            serverName: targetServer.name,
            player: order.player,
            command: cmd,
            status: 'SUCCESS',
            response: output || 'OK'
          })
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Erro ao executar comando.'
          results.push(`[${targetServer.name}] Erro ao executar "${cmd}": ${msg}`)
          await logRcon({
            orderId: order.id,
            serverName: targetServer.name,
            player: order.player,
            command: cmd,
            status: 'FAILED',
            response: msg
          })
        }
      }
    }

    return { success: true, results }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao processar RCON.'
    return { success: false, error: msg }
  }
}
