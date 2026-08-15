'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPublicSuggestions, createSuggestion, voteSuggestion } from '@/app/actions/suggestions'
import { useModules } from '@/components/Providers'
import { Lightbulb, ThumbsUp, ThumbsDown, MessageSquarePlus, CheckCircle2, AlertCircle } from 'lucide-react'
import { Toast } from '@/lib/toast'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

type SuggestionType = {
  id: number;
  title: string;
  content: string;
  status: string;
  score: number;
  createdAt: Date;
  author: { name: string | null; username: string | null; avatar: string | null; };
  votes: { userId: number; isUpvote: boolean; }[];
}

export default function SugestoesPage() {
  const router = useRouter()
  const modules = useModules()
  const { data: session } = useSession()
  
  const [suggestions, setSuggestions] = useState<SuggestionType[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal state for new suggestion
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // If module is disabled, kick them out
    if (modules.MODULE_SUGGESTIONS === false) {
      router.push('/')
      return
    }

    if (modules.MODULE_SUGGESTIONS) {
      loadSuggestions()
    }
  }, [modules.MODULE_SUGGESTIONS, router])

  async function loadSuggestions() {
    const data = await getPublicSuggestions()
    setSuggestions(data)
    setLoading(false)
  }

  const handleVote = async (id: number, isUpvote: boolean) => {
    if (!session) {
      Toast.fire({ icon: 'error', title: 'Inicia sessão para votar.' })
      return
    }

    const res = await voteSuggestion(id, isUpvote)
    if (res.error) {
      Toast.fire({ icon: 'error', title: res.error })
    } else {
      loadSuggestions() // Reload to get updated scores
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return
    
    setSubmitting(true)
    const res = await createSuggestion(title, content)
    setSubmitting(false)
    
    if (res.error) {
      Toast.fire({ icon: 'error', title: res.error })
    } else {
      Toast.fire({ icon: 'success', title: 'Sugestão enviada para aprovação!' })
      setIsModalOpen(false)
      setTitle('')
      setContent('')
    }
  }

  if (loading) {
    return <div className="min-h-[80vh] flex items-center justify-center text-gray-400">A carregar...</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-3">
            <Lightbulb size={36} className="text-neon-purple" />
            Ideias & Sugestões
          </h1>
          <p className="text-gray-400">Ajuda-nos a melhorar a rede! Vota nas ideias da comunidade ou sugere algo novo.</p>
        </div>
        
        <button 
          onClick={() => {
            if (!session) Toast.fire({ icon: 'error', title: 'Inicia sessão para sugerir.' })
            else setIsModalOpen(true)
          }}
          className="h-12 px-6 rounded-xl bg-neon-purple text-white font-bold flex items-center gap-2 hover:bg-neon-blue transition-colors shadow-[0_0_20px_rgba(188,19,254,0.3)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] whitespace-nowrap"
        >
          <MessageSquarePlus size={20} />
          Nova Sugestão
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="gale-panel p-12 text-center border border-white/10 flex flex-col items-center">
            <Lightbulb size={48} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhuma sugestão encontrada</h3>
            <p className="text-gray-400">Sê o primeiro a dar uma ideia fantástica para a nossa rede!</p>
          </div>
        ) : (
          suggestions.map(s => {
            // Check if current user voted
            const myVote = session?.user?.id 
              ? s.votes.find((v) => v.userId === Number(session.user.id))
              : null

            const isImplemented = s.status === 'IMPLEMENTED'

            return (
              <div key={s.id} className={`p-6 rounded-2xl border flex flex-col md:flex-row gap-6 transition-all ${isImplemented ? 'bg-green-500/5 border-green-500/20' : 'bg-[#050508] border-white/10 hover:border-white/20'}`}>
                
                {/* Vote Counter */}
                <div className="flex md:flex-col items-center gap-2 bg-black/40 p-2 rounded-xl h-fit border border-white/5">
                  <button 
                    onClick={() => handleVote(s.id, true)}
                    className={`p-2 rounded-lg transition-colors ${myVote?.isUpvote ? 'bg-neon-purple/20 text-neon-purple' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <ThumbsUp size={20} />
                  </button>
                  <span className={`font-black text-lg ${s.score > 0 ? 'text-green-400' : s.score < 0 ? 'text-red-400' : 'text-white'}`}>
                    {s.score > 0 ? `+${s.score}` : s.score}
                  </span>
                  <button 
                    onClick={() => handleVote(s.id, false)}
                    className={`p-2 rounded-lg transition-colors ${myVote && !myVote.isUpvote ? 'bg-red-500/20 text-red-500' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <ThumbsDown size={20} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {isImplemented && (
                      <span className="bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1">
                        <CheckCircle2 size={12} /> Implementado
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-white">{s.title}</h3>
                  </div>
                  
                  <p className="text-gray-300 text-sm whitespace-pre-wrap mb-4">{s.content}</p>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg">
                      <Image 
                        src={s.author.avatar || `https://minotar.net/helm/${s.author.username || 'Steve'}/64.png`}
                        alt="Avatar"
                        width={20} height={20}
                        className="rounded-md"
                      />
                      <span className="text-gray-300">{s.author.name || s.author.username}</span>
                    </div>
                    <span>•</span>
                    <span>{new Date(s.createdAt).toLocaleDateString('pt-PT')}</span>
                  </div>
                </div>

              </div>
            )
          })
        )}
      </div>

      {/* Modal Nova Sugestão */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#08080c] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center text-neon-purple">
                <Lightbulb size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Criar Sugestão</h3>
                <p className="text-xs text-gray-400">A tua ideia será enviada para aprovação.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Título</label>
                <input 
                  type="text" 
                  maxLength={100}
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple transition-colors"
                  placeholder="Ex: Adicionar modo BedWars"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Detalhes</label>
                <textarea 
                  required
                  rows={5}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple transition-colors resize-none"
                  placeholder="Explica a tua ideia detalhadamente..."
                />
              </div>

              <div className="bg-white/5 p-3 rounded-lg flex items-start gap-2 border border-white/5 mb-6">
                <AlertCircle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-400">A tua sugestão precisará de ser aprovada por um membro da equipa antes de ficar visível para votos.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-neon-purple text-white font-bold text-sm hover:bg-neon-blue transition-colors disabled:opacity-50"
                >
                  {submitting ? 'A Enviar...' : 'Enviar Sugestão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
