'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export type GlobalSettingsKeys = 
  | 'STORE_NAME'
  | 'STORE_DESC'
  | 'STORE_BANNER_DESC'
  | 'SERVER_IP'
  | 'SERVER_VERSIONS'
  | 'DISCORD_URL'
  | 'STORE_LOGO_URL'
  | 'STORE_FAVICON_URL'
  | 'STORE_BANNER_URL'
  | 'CUSTOM_CSS'

export type GlobalSettings = Record<GlobalSettingsKeys, string>

const defaultSettings: GlobalSettings = {
  STORE_NAME: 'Infinity Nexus',
  STORE_DESC: 'A melhor experiência de jogo em servidores de Minecraft. Adquire os teus Ranks, Vantagens e Chaves de forma 100% segura.',
  STORE_BANNER_DESC: 'Aqui poderá obter uma grande variedade de itens, Vips para que saia na vantagem',
  SERVER_IP: 'jogar.infinitynexus.pt',
  SERVER_VERSIONS: '1.16 - 1.21',
  DISCORD_URL: 'discord.gg/infinitynexus',
  STORE_LOGO_URL: '/logo.png',
  STORE_FAVICON_URL: '/favicon.ico',
  STORE_BANNER_URL: '/images/banner.png',
  CUSTOM_CSS: '/* Escreve aqui o teu CSS personalizado */\n\n'
}

export async function getGlobalSettings(): Promise<GlobalSettings> {
  const settings = await prisma.setting.findMany({
    where: { 
      key: { 
        in: Object.keys(defaultSettings) 
      } 
    }
  })
  
  const currentSettings = { ...defaultSettings }
  
  settings.forEach(s => {
    if (s.key in currentSettings) {
      currentSettings[s.key as GlobalSettingsKeys] = s.value
    }
  })
  
  return currentSettings
}

export async function saveGlobalSettings(data: Record<string, string>) {
  try {
    const promises = Object.entries(data).map(([key, value]) => {
      return prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      })
    })

    await Promise.all(promises)
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Erro ao guardar configurações.' }
  }
}

export async function uploadImage(formData: FormData, fieldName: string) {
  try {
    const file = formData.get(fieldName) as File | null
    if (!file) return { success: false, error: 'Nenhum ficheiro fornecido.' }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split('.').pop()
    const filename = `${fieldName}-${Date.now()}.${ext}`
    const uploadsDir = path.join(process.cwd(), 'public/uploads')
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const filepath = path.join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    return { success: true, url: `/uploads/${filename}` }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Erro ao fazer upload da imagem.' }
  }
}
