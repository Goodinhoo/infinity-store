'use client'

import { useState } from 'react'
import TipTapEditor from '@/components/TipTapEditor'
import { Save, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PageForm({ 
  onSubmit, 
  initialData,
  submitLabel = 'Criar Página'
}: { 
  onSubmit: (title: string, slug: string, content: string) => Promise<{success?: boolean, error?: string}>, 
  initialData?: { title: string, slug: string, content: string },
  submitLabel?: string
}) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (!initialData) {
      setSlug(newTitle.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!title || !slug || !content) {
      setError('Preenche todos os campos.')
      return
    }

    setIsSubmitting(true)
    const result = await onSubmit(title, slug, content)
    
    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      router.push('/admin/pages')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold flex items-center gap-3">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400">Título da Página</label>
          <input 
            type="text" 
            value={title}
            onChange={handleTitleChange}
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-neon-purple/50 transition-colors"
            placeholder="Ex: Regras do Servidor"
            required
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400">URL (Slug)</label>
          <div className="flex relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">/</span>
            <input 
              type="text" 
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full pl-8 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-neon-purple/50 transition-colors font-mono"
              placeholder="regras"
              required
            />
          </div>
          <p className="text-[10px] text-gray-500 font-bold">Esta página ficará acessível em <span className="text-neon-purple">oteusite.com/{slug || 'slug'}</span></p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Conteúdo (HTML Rich Text)</label>
        <div className="rounded-xl overflow-hidden border border-white/10 focus-within:border-neon-purple/50 transition-colors">
          <TipTapEditor content={content} onChange={setContent} />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-8 py-3 bg-neon-purple/20 text-neon-purple hover:bg-neon-purple/30 border border-neon-purple/30 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Save size={20} />
          {isSubmitting ? 'A Guardar...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
