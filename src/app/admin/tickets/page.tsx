import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import CustomSelect from '@/components/CustomSelect'
import { LifeBuoy } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Suporte & Tickets - Admin Infinity Nexus',
}

async function handleStatusChange(formData: FormData) {
  'use server'
  const ticketId = parseInt(formData.get('ticketId') as string)
  const status = formData.get('status') as string
  if (!isNaN(ticketId) && status) {
    await prisma.ticket.update({ where: { id: ticketId }, data: { status } })
    revalidatePath('/admin/tickets')
  }
}

export default async function AdminTicketsPage() {
  const tickets = await prisma.ticket.findMany({
    include: {
      user: true,
      replies: { orderBy: { createdAt: 'desc' }, take: 1 }
    },
    orderBy: { updatedAt: 'desc' }
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ANSWERED':
        return <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-green-500/10 text-green-400 border border-green-500/20">Respondido</span>
      case 'CLOSED':
        return <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-gray-500/10 text-gray-400 border border-gray-500/20">Fechado</span>
      default:
        return <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">Aberto</span>
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="border-b border-white/10 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Central de Suporte</h1>
          <p className="text-gray-400 text-sm mt-1">Responde e gere os tickets dos jogadores</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl font-bold">
            {tickets.filter(t => t.status === 'OPEN').length} abertos
          </span>
          <span className="px-3 py-1.5 bg-black/40 text-gray-400 border border-white/10 rounded-xl font-bold">
            {tickets.length} total
          </span>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="gale-panel p-12 text-center text-gray-400 border border-white/10">
          <LifeBuoy size={48} className="mx-auto mb-3 opacity-20" />
          <p className="font-bold">Nenhum ticket de suporte registado.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="gale-panel p-5 border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/suporte/${ticket.id}`} className="font-bold text-white hover:text-neon-blue transition-colors">
                    #{ticket.id} - {ticket.title}
                  </Link>
                  {getStatusBadge(ticket.status)}
                </div>
                <p className="text-xs text-gray-400">
                  Por: <span className="text-neon-blue font-bold">{ticket.user.name || ticket.user.username}</span>
                  {' '}• {ticket.replies.length > 0 ? `Última msg: ${new Date(ticket.replies[0].createdAt).toLocaleDateString('pt-PT')}` : 'Sem respostas'}
                </p>
              </div>

              <form action={handleStatusChange} className="flex items-center gap-2">
                <input type="hidden" name="ticketId" value={ticket.id} />
                <CustomSelect
                  name="status"
                  defaultValue={ticket.status}
                  options={[
                    { value: 'OPEN', label: 'Aberto' },
                    { value: 'ANSWERED', label: 'Respondido' },
                    { value: 'CLOSED', label: 'Fechado' }
                  ]}
                  className="w-36"
                />
                <button type="submit" className="px-3 py-1.5 bg-neon-purple/10 text-neon-purple hover:bg-neon-purple hover:text-white border border-neon-purple/20 rounded-lg text-xs font-bold transition-all">
                  Atualizar
                </button>
                <Link href={`/suporte/${ticket.id}`} className="px-3 py-1.5 bg-white/5 text-gray-300 hover:text-white border border-white/10 rounded-lg text-xs font-bold transition-all">
                  Responder
                </Link>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
