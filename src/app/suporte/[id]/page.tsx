import { auth } from '@/../auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Shield } from 'lucide-react'
import TicketReplyInput from '@/app/suporte/[id]/TicketReplyInput'

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const ticketId = parseInt(id)
  if (isNaN(ticketId)) notFound()

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      replies: {
        include: { user: true },
        orderBy: { createdAt: 'asc' }
      },
      user: true
    }
  })

  if (!ticket) notFound()

  const currentUserId = Number(session.user.id)
  
  const dbUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { role: true }
  })

  const isStaff = dbUser?.role === 'ADMIN' || dbUser?.role === 'MODERATOR'

  if (ticket.userId !== currentUserId && !isStaff) {
    redirect('/suporte')
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in my-6">
      <Link href="/suporte" className="text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 w-fit">
        <ArrowLeft size={14} /> Voltar aos meus tickets
      </Link>

      <header className="gale-panel p-6 border border-white/10 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Ticket #{ticket.id} - {ticket.title}</h1>
          <p className="text-xs text-gray-400 mt-1">
            Criado por: <span className="text-neon-blue font-bold">{ticket.user.name || ticket.user.username}</span> • {new Date(ticket.createdAt).toLocaleDateString('pt-PT')}
          </p>
        </div>
        <span className="px-3 py-1 text-xs font-bold rounded-lg bg-neon-purple/10 text-neon-purple border border-neon-purple/30">
          {ticket.status}
        </span>
      </header>

      {/* Histórico de Mensagens */}
      <div className="flex flex-col gap-4">
        {ticket.replies.map((reply) => {
          const isStaffReply = reply.user.role === 'ADMIN' || reply.user.role === 'MODERATOR'

          return (
            <div
              key={reply.id}
              className={`gale-panel p-6 border ${
                isStaffReply ? 'border-neon-purple/40 bg-neon-purple/5' : 'border-white/10'
              }`}
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  {isStaffReply ? (
                    <Shield size={16} className="text-neon-purple" />
                  ) : (
                    <User size={16} className="text-neon-blue" />
                  )}
                  <span className={`font-bold text-sm ${isStaffReply ? 'text-neon-purple' : 'text-white'}`}>
                    {reply.user.name || reply.user.username}
                  </span>
                  {isStaffReply && (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
                      Staff
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(reply.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
                {reply.content}
              </div>
            </div>
          )
        })}
      </div>

      {/* Formulário de Resposta */}
      {ticket.status !== 'CLOSED' ? (
        <TicketReplyInput ticketId={ticket.id} userId={currentUserId} />
      ) : (
        <div className="p-4 rounded-xl bg-gray-500/10 text-gray-400 border border-gray-500/20 text-center text-xs font-bold">
          Este ticket encontra-se encerrado.
        </div>
      )}
    </div>
  )
}
