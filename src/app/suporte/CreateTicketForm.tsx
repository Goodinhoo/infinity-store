'use client'

import { useState } from 'react'
import { createTicket } from '@/app/actions/admin'
import { PlusCircle, X } from 'lucide-react'

export default function CreateTicketForm({ userId }: { userId: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await createTicket(title, content, userId)
    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setIsOpen(false)
      setTitle('')
      setContent('')
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-md hover:opacity-90 transition-all flex items-center gap-2"
      >
        <PlusCircle size={16} />
        Criar Novo Ticket
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="gale-panel p-6 sm:p-8 max-w-lg w-full bg-[#0c0c14] border border-white/10 flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white">Abrir Ticket de Suporte</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Assunto / Título *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Dúvida sobre ativação do VIP"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Descrição Detalhada *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Descreve detalhadamente o teu problema..."
                  rows={5}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple"
                  required
                />
              </div>

              {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-400 border border-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-md hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'A submeter...' : 'Submeter Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
