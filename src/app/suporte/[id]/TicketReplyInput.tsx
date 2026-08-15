'use client'

import { useState } from 'react'
import { replyTicket } from '@/app/actions/admin'
import { Send } from 'lucide-react'

export default function TicketReplyInput({ ticketId, userId }: { ticketId: number, userId: number }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    await replyTicket(ticketId, content, userId)
    setContent('')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="gale-panel p-6 border border-white/10 flex flex-col gap-4">
      <h3 className="font-bold text-sm text-white">Responder ao Ticket</h3>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escreve a tua mensagem..."
        rows={4}
        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple"
        required
      />
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="self-end px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-md hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
      >
        <Send size={14} />
        {loading ? 'A enviar...' : 'Enviar Resposta'}
      </button>
    </form>
  )
}
