'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getStaffMembersAdmin() {
  return await prisma.staffMember.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
  })
}

export async function getStaffMembersPublic() {
  return await prisma.staffMember.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
  })
}

export async function createStaffMember(data: {
  username: string
  roleGroup: string
  customTitle?: string
  discord?: string
  order?: number
}) {
  const staff = await prisma.staffMember.create({
    data: {
      username: data.username,
      roleGroup: data.roleGroup,
      customTitle: data.customTitle || null,
      discord: data.discord || null,
      order: data.order || 0
    }
  })

  revalidatePath('/staff')
  revalidatePath('/admin/staff')
  return staff
}

export async function updateStaffMember(id: number, data: {
  username: string
  roleGroup: string
  customTitle?: string
  discord?: string
  order?: number
}) {
  const staff = await prisma.staffMember.update({
    where: { id },
    data: {
      username: data.username,
      roleGroup: data.roleGroup,
      customTitle: data.customTitle || null,
      discord: data.discord || null,
      order: data.order || 0
    }
  })

  revalidatePath('/staff')
  revalidatePath('/admin/staff')
  return staff
}

export async function deleteStaffMember(id: number) {
  await prisma.staffMember.delete({
    where: { id }
  })

  revalidatePath('/staff')
  revalidatePath('/admin/staff')
  return true
}
