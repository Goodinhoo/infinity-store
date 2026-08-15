import { auth } from '@/../auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { LifeBuoy, PlusCircle, MessageSquare, Lock, CheckCircle2 } from 'lucide-react'
import CreateTicketForm from './CreateTicketForm'

export const metadata = {
  title: 'Suporte & Ajuda - Infinity Nexus',
  description: 'Abre um ticket de suporte para tirares dúvidas ou resolveres problemas.',
}

export default async function SupportPage() {
  const session = await auth()

  if (!session?.user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center gale-panel my-8 max-w-xl mx-auto">
        <LifeBuoy size={64} className="text-neon-purple mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Acesso ao Suporte</h1>
        <p className="text-sm text-gray-400 mb-6">Precisas de iniciar sessão na tua conta para veres ou abrires tickets de suporte.</p>
        <Link href="/login" className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-md">
          Iniciar Sessão
        </Link>
      </div>
    )
  }

  const userId = Number(session.user.id)
  const tickets = await prisma.ticket.findMany({
    where: { userId },
    include: { replies: true },
    orderBy: { updatedAt: 'desc' }
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ANSWERED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-green-500/10 text-green-400 border border-green-500/20">Respondido</span>
      case 'CLOSED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-gray-500/10 text-gray-400 border border-gray-500/20">Fechado</span>
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">Aberto</span>
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in my-6">
      <header className="gale-panel p-8 border border-white/10 bg-gradient-to-r from-[#0d0d18] via-[#150a25] to-[#08080c] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-neon-purple/10 border border-neon-purple/30 text-neon-purple">
            <LifeBuoy size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Central de Suporte</h1>
            <p className="text-sm text-gray-400">Esclarece dúvidas com a equipa de suporte do servidor</p>
          </div>
        </div>

        <CreateTicketForm userId={userId} />
      </header>

      {/* Lista de Tickets */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white">Os Teus Tickets ({tickets.length})</h2>

        {tickets.length === 0 ? (
          <div className="gale-panel p-12 text-center text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-20 text-neon-blue" />
            <p className="font-bold">Ainda não criaste nenhum ticket de suporte.</p>
            <p className="text-xs text-gray-500 mt-1">Clica no botão "Criar Novo Ticket" acima para falares com a equipa.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tickets.map((ticket) => (
              <Link key={ticket.id} href={`/suporte/${ticket.id}`} className="gale-panel p-5 hover:border-neon-purple/40 transition-all flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-base">#{ticket.id} - {ticket.title}</span>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <span className="text-xs text-gray-400">
                    {ticket.replies.length} mensagens • Última atualização: {new Date(ticket.updatedAt).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className="text-xs font-bold text-neon-blue">Abrir conversa &rarr;</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
