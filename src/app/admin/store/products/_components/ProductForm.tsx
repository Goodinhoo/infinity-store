'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createProduct, updateProduct } from '@/app/actions/admin-products'
import { ArrowLeft, Package, Save, Server, Sparkles, Image as ImageIcon, Terminal, Percent, Tag, DollarSign, EyeOff, Crown } from 'lucide-react'
import { Toast } from '@/lib/toast'
import RichTextEditor from '@/components/RichTextEditor'
import CustomSelect from '@/components/CustomSelect'

type CategoryProps = {
  id: number
  name: string
}

type ServerProps = {
  id: number
  name: string
}

type ProductProps = {
  id: number
  name: string
  description: string
  price: number
  categoryId: number
  serverId?: number | null
  imageUrl?: string | null
  isFeatured: boolean
  showInVipTable: boolean
  command?: string | null
  discountPercentage?: number | null
  isHidden: boolean
}

export function ProductForm({
  product,
  categories,
  servers
}: {
  product?: ProductProps
  categories: CategoryProps[]
  servers: ServerProps[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [descriptionContent, setDescriptionContent] = useState(product?.description || '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('description', descriptionContent)

    try {
      if (product) {
        const res = await updateProduct(product.id, formData)
        if (res.success) {
          Toast.fire({ icon: 'success', title: 'Produto atualizado com sucesso!' })
          router.push('/admin/store/products')
          router.refresh()
        } else {
          Toast.fire({ icon: 'error', title: res.error || 'Erro ao atualizar produto.' })
        }
      } else {
        const res = await createProduct(formData)
        if (res.success) {
          Toast.fire({ icon: 'success', title: 'Produto criado com sucesso!' })
          router.push('/admin/store/products')
          router.refresh()
        } else {
          Toast.fire({ icon: 'error', title: res.error || 'Erro ao criar produto.' })
        }
      }
    } catch {
      Toast.fire({ icon: 'error', title: 'Ocorreu um erro ao guardar o produto.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Link
            href="/admin/store/products"
            className="text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 w-fit mb-3"
          >
            <ArrowLeft size={14} /> Voltar à lista de produtos
          </Link>
          <h1 className="text-2xl font-black uppercase text-white flex items-center gap-3">
            <Package className="text-neon-purple" size={28} />
            {product ? `Editar Produto: ${product.name}` : 'Criar Novo Produto'}
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            {product ? 'Edita os detalhes, comandos RCON e definições do produto.' : 'Adiciona um novo produto ao catálogo da tua loja.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/store/products"
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
            {loading ? 'A guardar...' : (product ? 'Guardar Alterações' : 'Criar Produto')}
          </button>
        </div>
      </div>

      {/* Grid Principal de 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: Detalhes Principais & Descrição Ampliada (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="gale-panel p-6 border border-white/10 space-y-6">
            <h2 className="text-sm font-bold text-neon-blue uppercase tracking-widest border-b border-white/10 pb-3 flex items-center gap-2">
              <Package size={16} /> Informações Básicas
            </h2>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                name="name"
                defaultValue={product?.name || ''}
                required
                placeholder="Ex: Pacote VIP Supremus 30 Dias"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag size={14} className="text-neon-purple" /> Categoria *
                </label>
                <CustomSelect
                  name="categoryId"
                  defaultValue={product?.categoryId?.toString() || (categories[0]?.id.toString() || '')}
                  options={categories.map((c) => ({ value: c.id.toString(), label: c.name }))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <DollarSign size={14} className="text-emerald-400" /> Preço (€) *
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  defaultValue={product?.price || ''}
                  required
                  placeholder="15.00"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Percent size={14} className="text-amber-400" /> Desconto % (Opcional)
                </label>
                <input
                  type="number"
                  name="discountPercentage"
                  min="0"
                  max="100"
                  defaultValue={product?.discountPercentage || ''}
                  placeholder="Ex: 20"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Descrição Detalhada do Produto (Editor Rich Text) *
              </label>
              <div className="min-h-[300px]">
                <RichTextEditor
                  content={descriptionContent}
                  onChange={setDescriptionContent}
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-2">
                Usa o editor para formatar listas de vantagens, textos a negrito, cores e links.
              </p>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Servidor, RCON & Definições Globais (1/3) */}
        <div className="space-y-6">
          
          {/* Servidor RCON & Comandos */}
          <div className="gale-panel p-6 border border-white/10 space-y-6">
            <h2 className="text-sm font-bold text-neon-purple uppercase tracking-widest border-b border-white/10 pb-3 flex items-center gap-2">
              <Server size={16} /> Servidor & RCON
            </h2>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Servidor de Destino (RCON)
              </label>
              <CustomSelect
                name="serverId"
                defaultValue={product?.serverId?.toString() || ''}
                options={[
                  { value: '', label: 'Servidor Padrão / Todos os Ativos' },
                  ...servers.map((s) => ({ value: s.id.toString(), label: s.name }))
                ]}
              />
              <p className="text-[11px] text-gray-500 mt-1.5">
                Escolhe o servidor de Minecraft onde os comandos RCON devem ser executados ao comprar.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Terminal size={14} className="text-neon-blue" /> Comandos RCON (Ao Comprar)
              </label>
              <textarea
                name="command"
                rows={4}
                defaultValue={product?.command || ''}
                placeholder="Ex: lp user {player} parent addtemp vip 30d; eco give {player} 10000"
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-neon-blue font-mono focus:outline-none focus:border-neon-purple"
              />
              <p className="text-[11px] text-gray-500 mt-1.5">
                Usa <code className="text-white bg-black/40 px-1 py-0.5 rounded">{"{player}"}</code> para o nick. Podes separar múltiplos comandos por ponto e vírgula (<code className="text-white bg-black/40 px-1 py-0.5 rounded">;</code>).
              </p>
            </div>
          </div>

          {/* Imagem de Capa & Opções de Exibição */}
          <div className="gale-panel p-6 border border-white/10 space-y-6">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-white/10 pb-3 flex items-center gap-2">
              <ImageIcon size={16} className="text-amber-400" /> Imagem & Visibilidade
            </h2>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                URL da Imagem de Capa (Opcional)
              </label>
              <input
                type="url"
                name="imageUrl"
                defaultValue={product?.imageUrl || ''}
                placeholder="https://exemplo.com/imagem.png"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple font-mono text-xs"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 rounded-xl">
                <input
                  type="checkbox"
                  name="isFeatured"
                  id="isFeatured"
                  defaultChecked={product?.isFeatured}
                  className="w-4 h-4 rounded border-gray-300 text-neon-purple focus:ring-neon-purple bg-black/50 cursor-pointer"
                />
                <label htmlFor="isFeatured" className="text-xs font-bold text-white cursor-pointer select-none flex items-center gap-1.5">
                  <Sparkles size={14} className="text-yellow-400" /> Destaque na Homepage
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 rounded-xl">
                <input
                  type="checkbox"
                  name="showInVipTable"
                  id="showInVipTable"
                  defaultChecked={product?.showInVipTable}
                  className="w-4 h-4 rounded border-gray-300 text-neon-blue focus:ring-neon-blue bg-black/50 cursor-pointer"
                />
                <label htmlFor="showInVipTable" className="text-xs font-bold text-white cursor-pointer select-none flex items-center gap-1.5">
                  <Crown size={14} className="text-neon-blue" /> Exibir na Tabela Comparativa VIP
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <input
                  type="checkbox"
                  name="isHidden"
                  id="isHidden"
                  defaultChecked={product?.isHidden}
                  className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500 bg-black/50 cursor-pointer"
                />
                <label htmlFor="isHidden" className="text-xs font-bold text-red-300 cursor-pointer select-none flex items-center gap-1.5">
                  <EyeOff size={14} className="text-red-400" /> Ocultar Produto da Loja
                </label>
              </div>
            </div>
          </div>

          {/* Botão de Guardar Fixo/Final */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.35)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer select-none"
            >
              <Save size={18} />
              {loading ? 'A guardar...' : (product ? 'Guardar Alterações' : 'Criar Produto')}
            </button>
          </div>
        </div>

      </div>
    </form>
  )
}
