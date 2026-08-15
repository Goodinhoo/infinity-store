'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createCategory, updateCategory } from '@/app/actions/admin-categories'
import { ArrowLeft, Layers, Save, EyeOff, Hash, Sparkles } from 'lucide-react'
import { Toast } from '@/lib/toast'
import RichTextEditor from '@/components/RichTextEditor'

type CategoryProps = {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  order: number
  isHidden: boolean
}

export function CategoryForm({ category }: { category?: CategoryProps }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [descriptionContent, setDescriptionContent] = useState(category?.description || '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('description', descriptionContent)

    try {
      if (category) {
        const res = await updateCategory(category.id, formData)
        if (res.success) {
          Toast.fire({ icon: 'success', title: 'Categoria atualizada com sucesso!' })
          router.push('/admin/store/categories')
          router.refresh()
        } else {
          Toast.fire({ icon: 'error', title: res.error || 'Erro ao atualizar categoria.' })
        }
      } else {
        const res = await createCategory(formData)
        if (res.success) {
          Toast.fire({ icon: 'success', title: 'Categoria criada com sucesso!' })
          router.push('/admin/store/categories')
          router.refresh()
        } else {
          Toast.fire({ icon: 'error', title: res.error || 'Erro ao criar categoria.' })
        }
      }
    } catch {
      Toast.fire({ icon: 'error', title: 'Ocorreu um erro ao guardar a categoria.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Link
            href="/admin/store/categories"
            className="text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 w-fit mb-3"
          >
            <ArrowLeft size={14} /> Voltar à lista de categorias
          </Link>
          <h1 className="text-2xl font-black uppercase text-white flex items-center gap-3">
            <Layers className="text-neon-blue" size={28} />
            {category ? `Editar Categoria: ${category.name}` : 'Criar Nova Categoria'}
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            {category ? 'Edita o nome, slug, ícone e visibilidade da categoria.' : 'Adiciona uma nova categoria para organizar produtos na loja.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/store/categories"
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-bold text-xs rounded-xl transition-all select-none"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            <Save size={18} />
            {loading ? 'A guardar...' : (category ? 'Guardar Alterações' : 'Criar Categoria')}
          </button>
        </div>
      </div>

      {/* Formulário Amplo */}
      <div className="gale-panel p-8 border border-white/10 space-y-6">
        <h2 className="text-sm font-bold text-neon-blue uppercase tracking-widest border-b border-white/10 pb-3 flex items-center gap-2">
          <Layers size={16} /> Detalhes da Categoria
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Nome da Categoria *
            </label>
            <input
              type="text"
              name="name"
              defaultValue={category?.name || ''}
              required
              placeholder="Ex: Pacotes VIP"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Slug / URL Única (Opcional)
            </label>
            <input
              type="text"
              name="slug"
              defaultValue={category?.slug || ''}
              placeholder="Ex: vips (Gerado automaticamente se deixares vazio)"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple font-mono text-xs"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-yellow-400" /> Ícone (Lucide-react)
              </label>
              <a
                href="https://lucide.dev/icons"
                target="_blank"
                rel="noreferrer"
                className="text-neon-purple hover:underline text-xs font-bold lowercase"
              >
                ver lista
              </a>
            </div>
            <input
              type="text"
              name="icon"
              defaultValue={category?.icon || ''}
              placeholder="Ex: Crown, Shield, Tag, Box, Gift..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Hash size={14} className="text-neon-purple" /> Ordem de Exibição (0, 1, 2...)
            </label>
            <input
              type="number"
              name="order"
              defaultValue={category?.order ?? 0}
              required
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
            Descrição da Categoria (Editor Rich Text - Opcional)
          </label>
          <div className="min-h-[220px]">
            <RichTextEditor
              content={descriptionContent}
              onChange={setDescriptionContent}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <input
            type="checkbox"
            name="isHidden"
            id="isHidden"
            defaultChecked={category?.isHidden}
            className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500 bg-black/50 cursor-pointer"
          />
          <label htmlFor="isHidden" className="text-xs font-bold text-red-300 cursor-pointer select-none flex items-center gap-1.5">
            <EyeOff size={14} className="text-red-400" /> Ocultar Categoria da Loja Pública
          </label>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.35)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            <Save size={18} />
            {loading ? 'A guardar...' : (category ? 'Guardar Categoria' : 'Criar Categoria')}
          </button>
        </div>
      </div>
    </form>
  )
}
