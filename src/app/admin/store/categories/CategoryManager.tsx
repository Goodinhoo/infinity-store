'use client'

import { useState } from 'react'
import { PlusCircle, Edit, Layers, EyeOff, Eye } from 'lucide-react'
import { createCategory, updateCategory, deleteCategory } from '@/app/actions/admin-categories'
import { Toast } from '@/lib/toast'
import DeleteButton from '@/components/DeleteButton'
import Modal from '@/components/Modal'
import RichTextEditor from '@/components/RichTextEditor'

type CategoryProps = {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  order: number
  isHidden: boolean
  createdAt: Date
  products: { id: number }[]
}

export default function CategoryManager({ categories }: { categories: CategoryProps[] }) {
  const [loading, setLoading] = useState(false)
  const [editingItem, setEditingItem] = useState<CategoryProps | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [descriptionContent, setDescriptionContent] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const form = e.currentTarget
    const formData = new FormData(form)
    
    // Append the rich text description explicitly
    formData.set('description', descriptionContent)
    
    if (editingItem) {
      const res = await updateCategory(editingItem.id, formData)
      if (res.success) {
        Toast.fire({ icon: 'success', title: 'Categoria atualizada!' })
        setEditingItem(null)
        setIsModalOpen(false)
        form.reset()
      } else {
        Toast.fire({ icon: 'error', title: res.error || 'Erro ao atualizar' })
      }
    } else {
      const res = await createCategory(formData)
      if (res.success) {
        Toast.fire({ icon: 'success', title: 'Categoria criada!' })
        setIsModalOpen(false)
        form.reset()
      } else {
        Toast.fire({ icon: 'error', title: res.error || 'Erro ao criar' })
      }
    }
    
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    setLoading(true)
    const res = await deleteCategory(id)
    if (res.success) {
      Toast.fire({ icon: 'success', title: 'Categoria eliminada!' })
    } else {
      Toast.fire({ icon: 'error', title: res.error || 'Erro ao eliminar' })
    }
    setLoading(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setEditingItem(null)
      setDescriptionContent('')
    }, 300)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-bold text-white flex items-center gap-2">
          <Layers size={18} className="text-neon-blue" />
          Categorias Existentes ({categories.length})
        </h2>
        <button 
          onClick={() => {
            setEditingItem(null)
            setDescriptionContent('')
            setIsModalOpen(true)
          }}
          className="bg-neon-purple text-white px-4 py-2 rounded-xl font-bold text-sm shadow-[0_0_15px_-3px_rgba(188,19,254,0.4)] hover:scale-105 transition-all flex items-center gap-2"
        >
          <PlusCircle size={16} /> Nova Categoria
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCancel}
        title={
          <>
            {editingItem ? <Edit size={18} className="text-neon-pink" /> : <PlusCircle size={18} className="text-neon-purple" />}
            {editingItem ? 'Editar Categoria' : 'Nova Categoria'}
          </>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Nome *</label>
            <input name="name" type="text" placeholder="Ex: Ranks" required defaultValue={editingItem?.name || ''}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Slug (URL) *</label>
            <input name="slug" type="text" placeholder="Ex: ranks" required defaultValue={editingItem?.slug || ''}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple font-mono" />
            <p className="text-[10px] text-gray-500 mt-1">Como vai aparecer no link: /loja/slug</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Descrição</label>
            <RichTextEditor 
              content={descriptionContent} 
              onChange={setDescriptionContent} 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Ícone</label>
            <input name="icon" type="text" placeholder="Ex: Shield, Star, Crown" defaultValue={editingItem?.icon || ''}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple" />
            <p className="text-[10px] text-gray-500 mt-1">Nome do ícone da biblioteca Lucide React</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Ordem</label>
            <input name="order" type="number" defaultValue={editingItem?.order ?? 0} required
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple" />
            <p className="text-[10px] text-gray-500 mt-1">Números menores aparecem primeiro (ex: 0, 1, 2...)</p>
          </div>

          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 mt-2">
            <input type="checkbox" name="isHidden" id="isHidden" defaultChecked={editingItem?.isHidden}
              className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500 bg-black/50 cursor-pointer" />
            <label htmlFor="isHidden" className="text-sm text-red-200 font-bold cursor-pointer select-none">
              Ocultar Categoria da Loja
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={loading} className="flex-1 h-[44px] bg-black/50 border border-white/10 hover:border-neon-purple hover:bg-white/5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
              {loading ? 'A processar...' : (editingItem ? 'Guardar Alterações' : 'Criar Categoria')}
            </button>
            <button type="button" onClick={handleCancel} disabled={loading} className="px-6 h-[44px] bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl font-bold text-sm text-red-400 transition-all flex items-center justify-center shadow-sm disabled:opacity-50">
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Lista */}
      <div className="flex flex-col gap-4">

        {categories.length === 0 ? (
          <div className="gale-panel p-12 text-center text-gray-400 border border-white/10">
            <Layers size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-bold">Nenhuma categoria criada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className={`gale-panel p-5 border flex flex-col justify-between gap-4 ${cat.isHidden ? 'border-red-500/30 opacity-70' : 'border-white/10'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {cat.isHidden ? (
                        <span className="text-[10px] uppercase font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 flex items-center gap-1">
                          <EyeOff size={10} /> Oculto
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 flex items-center gap-1">
                          <Eye size={10} /> Visível
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                        Ordem: {cat.order}
                      </span>
                    </div>
                    <p className="font-bold text-white text-lg leading-tight flex items-center gap-2">
                      {cat.name}
                    </p>
                    <p className="text-xs text-gray-400 font-mono mt-1">/{cat.slug}</p>
                    <p className="text-sm text-neon-blue font-semibold mt-2">{cat.products.length} Produtos</p>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end mt-2 pt-4 border-t border-white/5">
                  <button 
                    onClick={() => {
                      setEditingItem(cat)
                      setDescriptionContent(cat.description || '')
                      setIsModalOpen(true)
                    }}
                    className="px-3 py-1.5 rounded-lg font-bold text-xs bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 transition-colors flex items-center gap-1"
                  >
                    <Edit size={14} /> Editar
                  </button>
                  <form action={async () => { await handleDelete(cat.id) }}>
                    <DeleteButton confirmMessage={`Eliminar categoria "${cat.name}"?`} />
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
