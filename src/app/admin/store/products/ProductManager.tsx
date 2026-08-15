'use client'

import { useState } from 'react'
import { Package, PlusCircle, Edit } from 'lucide-react'
import { createProduct, updateProduct, deleteProduct } from '@/app/actions/admin-products'
import { Toast } from '@/lib/toast'
import Swal from 'sweetalert2'
import Modal from '@/components/Modal'
import RichTextEditor from '@/components/RichTextEditor'

type ProductProps = {
  id: number
  name: string
  description: string
  price: number
  categoryId: number
  imageUrl: string | null
  isFeatured: boolean
  command: string | null
  discountPercentage: number | null
  isHidden: boolean
  createdAt: Date
  category: {
    id: number
    name: string
  }
}

type CategoryProps = {
  id: number
  name: string
}

export default function ProductManager({ products, categories }: { products: ProductProps[], categories: CategoryProps[] }) {
  const [loading, setLoading] = useState(false)
  const [editingItem, setEditingItem] = useState<ProductProps | null>(null)
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
      const res = await updateProduct(editingItem.id, formData)
      if (res.success) {
        Toast.fire({ icon: 'success', title: 'Produto atualizado!' })
        setEditingItem(null)
        setIsModalOpen(false)
        form.reset()
      } else {
        Toast.fire({ icon: 'error', title: res.error || 'Erro ao atualizar' })
      }
    } else {
      const res = await createProduct(formData)
      if (res.success) {
        Toast.fire({ icon: 'success', title: 'Produto criado!' })
        setIsModalOpen(false)
        form.reset()
      } else {
        Toast.fire({ icon: 'error', title: res.error || 'Erro ao criar' })
      }
    }
    
    setLoading(false)
  }

  const handleEdit = (product: ProductProps) => {
    setEditingItem(product)
    setDescriptionContent(product.description || '')
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: 'Tem a certeza?',
      text: `Deseja eliminar o produto "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Sim, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#0d0d14',
      color: '#fff'
    })

    if (result.isConfirmed) {
      const res = await deleteProduct(id)
      if (res.success) {
        Toast.fire({ icon: 'success', title: 'Produto eliminado!' })
        if (editingItem?.id === id) {
          setEditingItem(null)
        }
      } else {
        Toast.fire({ icon: 'error', title: res.error || 'Erro ao eliminar' })
      }
    }
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
          <Package size={18} className="text-neon-blue" />
          Produtos Existentes ({products.length})
        </h2>
        <button 
          onClick={() => {
            setEditingItem(null)
            setDescriptionContent('')
            setIsModalOpen(true)
          }}
          className="bg-neon-purple text-white px-4 py-2 rounded-xl font-bold text-sm shadow-[0_0_15px_-3px_rgba(188,19,254,0.4)] hover:scale-105 transition-all flex items-center gap-2"
        >
          <PlusCircle size={16} /> Novo Produto
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCancel}
        title={
          <>
            {editingItem ? <Edit size={18} className="text-neon-pink" /> : <PlusCircle size={18} className="text-neon-purple" />}
            {editingItem ? 'Editar Produto' : 'Novo Produto'}
          </>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Nome do Produto *</label>
            <input name="name" type="text" placeholder="Ex: VIP Gold" required defaultValue={editingItem?.name || ''}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Categoria *</label>
            <div className="relative">
              <select name="categoryId" required defaultValue={editingItem?.categoryId || ''}
                className="w-full appearance-none bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple cursor-pointer">
                <option value="" disabled>Selecione uma categoria...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Preço Base (€) *</label>
              <input name="price" type="number" step="0.01" min="0" placeholder="Ex: 9.99" required defaultValue={editingItem?.price || ''}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Desconto (%)</label>
              <input name="discountPercentage" type="number" min="1" max="100" placeholder="Ex: 20 (opcional)" defaultValue={editingItem?.discountPercentage || ''}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Descrição *</label>
            <RichTextEditor 
              content={descriptionContent} 
              onChange={setDescriptionContent} 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Comandos (Ao comprar)</label>
            <textarea name="command" rows={2} placeholder="Ex: lp user {player} parent add vip" defaultValue={editingItem?.command || ''}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple font-mono text-xs" />
            <p className="text-[10px] text-gray-500 mt-1">Usa {"{player}"} para o nick. Deixa vazio se for item manual.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">URL da Imagem (Opcional)</label>
            <input name="imageUrl" type="url" placeholder="https://..." defaultValue={editingItem?.imageUrl || ''}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple" />
          </div>

          <div className="flex items-center gap-3 bg-black/50 border border-white/10 rounded-xl px-3 py-2.5">
            <input type="checkbox" name="isFeatured" id="isFeatured" defaultChecked={editingItem?.isFeatured}
              className="w-4 h-4 rounded border-gray-300 text-neon-purple focus:ring-neon-purple bg-black/50 cursor-pointer" />
            <label htmlFor="isFeatured" className="text-sm text-white font-bold cursor-pointer select-none">
              Destaque na Home?
            </label>
          </div>

          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 mt-2">
            <input type="checkbox" name="isHidden" id="isHidden" defaultChecked={editingItem?.isHidden}
              className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500 bg-black/50 cursor-pointer" />
            <label htmlFor="isHidden" className="text-sm text-red-200 font-bold cursor-pointer select-none">
              Ocultar Produto da Loja
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={loading} className="flex-1 h-[44px] bg-black/50 border border-white/10 hover:border-neon-purple hover:bg-white/5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
              {loading ? 'A processar...' : (editingItem ? 'Guardar Alterações' : 'Criar Produto')}
            </button>
            <button type="button" onClick={handleCancel} disabled={loading} className="px-6 h-[44px] bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl font-bold text-sm text-red-400 transition-all flex items-center justify-center shadow-sm disabled:opacity-50">
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Lista */}
      <div className="flex flex-col gap-4">

        {products.length === 0 ? (
          <div className="gale-panel p-12 text-center text-gray-400 border border-white/10">
            <Package size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-bold">Nenhum produto criado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className={`gale-panel p-5 border flex flex-col justify-between gap-4 transition-colors ${product.isHidden ? 'border-red-500/30 opacity-70' : (editingItem?.id === product.id ? 'border-neon-pink' : 'border-white/10 hover:border-neon-purple/50')}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {product.isHidden && (
                        <span className="text-[10px] uppercase font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                          Oculto
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                        {product.category.name}
                      </span>
                    </div>
                    <p className="font-bold text-white leading-tight mt-1 flex items-center gap-2">
                      {product.name}
                      {product.isFeatured && <span className="w-2 h-2 rounded-full bg-yellow-400" title="Destaque"></span>}
                    </p>
                    
                    <div className="mt-2 flex items-center gap-2">
                      {product.discountPercentage ? (
                        <>
                          <span className="text-red-400 font-black">{(product.price * (1 - product.discountPercentage/100)).toFixed(2)}€</span>
                          <span className="text-gray-500 text-xs line-through">{product.price.toFixed(2)}€</span>
                        </>
                      ) : (
                        <span className="text-neon-blue font-black">{product.price.toFixed(2)}€</span>
                      )}
                      
                      {product.discountPercentage && (
                        <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">-{product.discountPercentage}%</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end mt-2 pt-4 border-t border-white/5">
                  <button onClick={() => handleEdit(product)} className="w-[36px] h-[36px] flex items-center justify-center bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-all" title="Editar Produto">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(product.id, product.name)} className="w-[36px] h-[36px] flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all" title="Eliminar Produto">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
