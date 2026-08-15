'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'

// List suggestions (for public page: only APPROVED and IMPLEMENTED, sorted by votes)
export async function getPublicSuggestions() {
  const suggestions = await prisma.suggestion.findMany({
    where: {
      status: { in: ['APPROVED', 'IMPLEMENTED'] }
    },
    include: {
      author: { select: { name: true, username: true, avatar: true } },
      votes: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  // Calculate score (upvotes - downvotes)
  const formatted = suggestions.map(s => {
    const upvotes = s.votes.filter(v => v.isUpvote).length
    const downvotes = s.votes.filter(v => !v.isUpvote).length
    return {
      ...s,
      score: upvotes - downvotes
    }
  })

  // Sort by score
  return formatted.sort((a, b) => b.score - a.score)
}

// List all suggestions (for admin page)
export async function getAllSuggestions() {
  const session = await auth()
  if (!session?.user) throw new Error('Not authorized')

  const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } })
  if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') throw new Error('Not authorized')

  const suggestions = await prisma.suggestion.findMany({
    include: {
      author: { select: { name: true, username: true, avatar: true } },
      votes: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  return suggestions.map(s => {
    const upvotes = s.votes.filter(v => v.isUpvote).length
    const downvotes = s.votes.filter(v => !v.isUpvote).length
    return {
      ...s,
      score: upvotes - downvotes
    }
  })
}

// Submit a new suggestion
export async function createSuggestion(title: string, content: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Precisas de iniciar sessão para sugerir.' }
  
  if (!title || !content) return { error: 'Título e conteúdo são obrigatórios.' }

  await prisma.suggestion.create({
    data: {
      title,
      content,
      authorId: Number(session.user.id),
      status: 'PENDING'
    }
  })

  return { success: true }
}

// Vote on a suggestion
export async function voteSuggestion(suggestionId: number, isUpvote: boolean) {
  const session = await auth()
  if (!session?.user) return { error: 'Precisas de iniciar sessão para votar.' }

  const userId = Number(session.user.id)

  const existingVote = await prisma.suggestionVote.findUnique({
    where: {
      suggestionId_userId: {
        suggestionId,
        userId
      }
    }
  })

  if (existingVote) {
    if (existingVote.isUpvote === isUpvote) {
      // Removing the vote
      await prisma.suggestionVote.delete({
        where: { id: existingVote.id }
      })
      return { success: true }
    } else {
      // Changing vote
      await prisma.suggestionVote.update({
        where: { id: existingVote.id },
        data: { isUpvote }
      })
      return { success: true }
    }
  }

  // Creating new vote
  await prisma.suggestionVote.create({
    data: {
      suggestionId,
      userId,
      isUpvote
    }
  })

  return { success: true }
}

// Update suggestion status (Admin)
export async function updateSuggestionStatus(suggestionId: number, status: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Not authorized' }

  const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } })
  if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') return { error: 'Not authorized' }

  await prisma.suggestion.update({
    where: { id: suggestionId },
    data: { status }
  })

  return { success: true }
}

// Delete a suggestion (Admin)
export async function deleteSuggestion(suggestionId: number) {
  const session = await auth()
  if (!session?.user) return { error: 'Not authorized' }

  const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } })
  if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') return { error: 'Not authorized' }

  await prisma.suggestion.delete({
    where: { id: suggestionId }
  })

  return { success: true }
}
