'use client'

import { useState, useEffect } from 'react'
import { getAllSuggestions, updateSuggestionStatus, deleteSuggestion } from '@/app/actions/suggestions'
import { Lightbulb, CheckCircle2, XCircle, Trash2, Clock, Check } from 'lucide-react'
import { Toast, ConfirmAlert } from '@/lib/toast'
import Link from 'next/link'
import Image from 'next/image'

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

export default function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState<SuggestionType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await getAllSuggestions()
      setSuggestions(data)
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao carregar sugestões.' })
    }
    setLoading(false)
  }

  const handleStatus = async (id: number, status: string) => {
    const res = await updateSuggestionStatus(id, status)
    if (res.error) {
      Toast.fire({ icon: 'error', title: res.error })
    } else {
      Toast.fire({ icon: 'success', title: 'Estado atualizado!' })
      load()
    }
  }

  const handleDelete = async (id: number) => {
    const isConfirmed = await ConfirmAlert.fire('Tens a certeza?', 'Queres apagar esta sugestão definitivamente?')
    if (!isConfirmed) return
    
    const res = await deleteSuggestion(id)
    if (res.error) {
      Toast.fire({ icon: 'error', title: res.error })
    } else {
      Toast.fire({ icon: 'success', title: 'Sugestão apagada!' })
      load()
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING':
        return <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase px-2 py-1 rounded-md"><Clock size={12}/> Pendente</span>
      case 'APPROVED':
        return <span className="flex items-center gap-1 bg-neon-blue/20 text-neon-blue text-[10px] font-black uppercase px-2 py-1 rounded-md"><Check size={12}/> Aprovada</span>
      case 'REJECTED':
        return <span className="flex items-center gap-1 bg-red-500/20 text-red-500 text-[10px] font-black uppercase px-2 py-1 rounded-md"><XCircle size={12}/> Recusada</span>
      case 'IMPLEMENTED':
        return <span className="flex items-center gap-1 bg-green-500/20 text-green-400 text-[10px] font-black uppercase px-2 py-1 rounded-md"><CheckCircle2 size={12}/> Implementada</span>
      default:
        return null
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">A carregar...</div>

  return (
    <div className="p-8 w-full space-y-8 animate-fade-in">
      
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/modules" className="text-gray-400 hover:text-white transition-colors text-sm font-semibold">
          ← Voltar aos Módulos
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black uppercase text-white mb-1 flex items-center gap-3">
            <Lightbulb size={24} className="text-white" />
            Moderação de Sugestões
          </h1>
          <p className="text-gray-400 text-sm">Aprova ou recusa as ideias submetidas pela comunidade.</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-4">
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Total</p>
            <p className="text-lg font-black text-white">{suggestions.length}</p>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Pendentes</p>
            <p className="text-lg font-black text-yellow-500">{suggestions.filter(s => s.status === 'PENDING').length}</p>
          </div>
        </div>
      </div>

      <div className="gale-panel p-6 border border-white/10">
        <div className="space-y-4">
          {suggestions.length === 0 ? (
             <div className="text-center p-8 text-gray-400">Nenhuma sugestão encontrada no sistema.</div>
          ) : (
            suggestions.map(s => (
              <div key={s.id} className="bg-[#050508] border border-white/5 p-4 rounded-xl flex flex-col xl:flex-row gap-6">
                
                {/* Score */}
                <div className="hidden xl:flex flex-col items-center justify-center bg-white/5 w-16 rounded-xl border border-white/5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Votos</span>
                  <span className={`font-black text-xl ${s.score > 0 ? 'text-green-400' : s.score < 0 ? 'text-red-400' : 'text-white'}`}>
                    {s.score > 0 ? `+${s.score}` : s.score}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(s.status)}
                    <h3 className="text-lg font-bold text-white">{s.title}</h3>
                  </div>
                  <p className="text-sm text-gray-400 whitespace-pre-wrap mb-4">{s.content}</p>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg">
                      <Image 
                        src={s.author.avatar || `https://minotar.net/helm/${s.author.username || 'Steve'}/64.png`}
                        alt="Avatar"
                        width={16} height={16}
                        className="rounded-sm"
                      />
                      <span className="text-gray-300">{s.author.name || s.author.username}</span>
                    </div>
                    <span>•</span>
                    <span>{new Date(s.createdAt).toLocaleDateString('pt-PT')} às {new Date(s.createdAt).toLocaleTimeString('pt-PT', {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row xl:flex-col items-center justify-end gap-2 shrink-0 border-t xl:border-t-0 xl:border-l border-white/5 pt-4 xl:pt-0 xl:pl-6">
                  {s.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleStatus(s.id, 'APPROVED')} className="flex-1 xl:flex-none w-full px-4 py-2 bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
                        <Check size={14} /> Aprovar
                      </button>
                      <button onClick={() => handleStatus(s.id, 'REJECTED')} className="flex-1 xl:flex-none w-full px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
                        <XCircle size={14} /> Recusar
                      </button>
                    </>
                  )}

                  {s.status === 'APPROVED' && (
                    <button onClick={() => handleStatus(s.id, 'IMPLEMENTED')} className="flex-1 xl:flex-none w-full px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
                      <CheckCircle2 size={14} /> Implementada
                    </button>
                  )}

                  <button onClick={() => handleDelete(s.id)} className="flex-1 xl:flex-none w-full px-4 py-2 bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-500 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
                    <Trash2 size={14} /> Apagar
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
