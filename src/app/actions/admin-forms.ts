'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getFormsAdmin() {
  return await prisma.customForm.findMany({
    include: {
      questions: { orderBy: { order: 'asc' } },
      submissions: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getFormsPublic() {
  return await prisma.customForm.findMany({
    where: { isActive: true },
    include: {
      questions: { orderBy: { order: 'asc' } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getFormPublic(id: number) {
  return await prisma.customForm.findUnique({
    where: { id, isActive: true },
    include: {
      questions: { orderBy: { order: 'asc' } }
    }
  })
}

export async function createForm(data: {
  title: string
  description?: string
  questions: { question: string; type: string; options?: string; isRequired: boolean }[]
}) {
  const form = await prisma.customForm.create({
    data: {
      title: data.title,
      description: data.description || null,
      questions: {
        create: data.questions.map((q, idx) => ({
          question: q.question,
          type: q.type || 'TEXT',
          options: q.options || null,
          isRequired: q.isRequired !== false,
          order: idx
        }))
      }
    }
  })

  revalidatePath('/candidaturas')
  revalidatePath('/admin/candidaturas')
  return form
}

export async function deleteForm(id: number) {
  await prisma.customForm.delete({
    where: { id }
  })

  revalidatePath('/candidaturas')
  revalidatePath('/admin/candidaturas')
  return true
}

export async function submitForm(data: {
  formId: number
  player: string
  answers: Record<string, string>
  userId?: number
}) {
  const submission = await prisma.formSubmission.create({
    data: {
      formId: data.formId,
      player: data.player,
      answers: JSON.stringify(data.answers),
      userId: data.userId || null,
      status: 'PENDING'
    }
  })

  revalidatePath('/admin/candidaturas')
  return submission
}

export async function getSubmissionsAdmin(formId?: number) {
  return await prisma.formSubmission.findMany({
    where: formId ? { formId } : undefined,
    include: {
      form: true,
      user: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function updateSubmissionStatus(id: number, status: string) {
  const submission = await prisma.formSubmission.update({
    where: { id },
    data: { status }
  })

  revalidatePath('/admin/candidaturas')
  return submission
}
