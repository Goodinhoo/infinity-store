'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getChangelogsAdmin() {
  return await prisma.changelog.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function getChangelogsPublic() {
  return await prisma.changelog.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function createChangelog(data: {
  title: string
  version: string
  content: string
  type: string
}) {
  const changelog = await prisma.changelog.create({
    data: {
      title: data.title,
      version: data.version,
      content: data.content,
      type: data.type || 'UPDATE'
    }
  })

  revalidatePath('/changelog')
  revalidatePath('/admin/changelogs')
  return changelog
}

export async function updateChangelog(id: number, data: {
  title: string
  version: string
  content: string
  type: string
}) {
  const changelog = await prisma.changelog.update({
    where: { id },
    data: {
      title: data.title,
      version: data.version,
      content: data.content,
      type: data.type
    }
  })

  revalidatePath('/changelog')
  revalidatePath('/admin/changelogs')
  return changelog
}

export async function deleteChangelog(id: number) {
  await prisma.changelog.delete({
    where: { id }
  })

  revalidatePath('/changelog')
  revalidatePath('/admin/changelogs')
  return true
}
