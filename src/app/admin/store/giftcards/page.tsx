import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'
import { redirect } from 'next/navigation'
import GiftCardManager from './GiftCardManager'

export const metadata = {
  title: 'Cartões Presente - Admin Infinity Nexus',
}

export default async function AdminGiftCardsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  
  if (session.user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-gray-400">Não tens permissão para aceder a esta página.</p>
      </div>
    )
  }

  // Fetch initial gift cards to pass to the client component
  const giftCards = await prisma.giftCard.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      usedBy: {
        select: {
          username: true
        }
      }
    }
  })

  // We map the dates to strings if needed by Client Components, 
  // but since Next.js 14 server components can pass dates to client components directly,
  // we just pass them as is.

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Cartões Presente (Gift Cards)</h1>
        <p className="text-gray-400 text-sm mt-1">Gera códigos de saldo para oferecer aos jogadores ou Youtubers.</p>
      </div>

      <GiftCardManager initialGiftCards={giftCards} />
    </div>
  )
}
