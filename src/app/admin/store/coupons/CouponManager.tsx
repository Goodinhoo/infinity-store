'use client'

import { useState } from 'react'
import { Ticket, PlusCircle, Power, PowerOff, Edit2 } from 'lucide-react'
import { createCoupon, updateCoupon, deleteCoupon, toggleCoupon } from '@/app/actions/admin-coupons'
import { Toast } from '@/lib/toast'
import Swal from 'sweetalert2'
import Modal from '@/components/Modal'

type CategoryRef = { id: number; name: string }
type ProductRef = { id: number; name: string; category?: { name: string } | null }

type CouponProps = {
  id: number
  code: string
  discountPct: number
  maxUses: number | null
  uses: number
  expiresAt: Date | null
  isActive: boolean
  createdAt: Date
  categories: CategoryRef[]
  products: ProductRef[]
}

export default function CouponManager({ 
  coupons, 
  allCategories, 
  allProducts 
}: { 
  coupons: CouponProps[],
  allCategories: CategoryRef[],
  allProducts: ProductRef[]
}) {
  const [loading, setLoading] = useState(false)
  const [editingItem, setEditingItem] = useState<CouponProps | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    code: '',
    discountPct: '',
    maxUses: '',
    expiresAt: ''
  })
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])

  const resetForm = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setEditingItem(null)
      setFormData({ code: '', discountPct: '', maxUses: '', expiresAt: '' })
      setSelectedCategories([])
      setSelectedProducts([])
    }, 300)
  }

  const handleEdit = (coupon: CouponProps) => {
    setEditingItem(coupon)
    setFormData({
      code: coupon.code,
      discountPct: coupon.discountPct.toString(),
      maxUses: coupon.maxUses ? coupon.maxUses.toString() : '',
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : ''
    })
    setSelectedCategories(coupon.categories.map(c => c.id))
    setSelectedProducts(coupon.products.map(p => p.id))
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const form = new FormData(e.currentTarget)
    selectedCategories.forEach(id => form.append('categoryIds', id.toString()))
    selectedProducts.forEach(id => form.append('productIds', id.toString()))

    let res
    if (editingItem) {
      res = await updateCoupon(editingItem.id, form)
    } else {
      res = await createCoupon(form)
    }
    
    if (res.success) {
      Toast.fire({ icon: 'success', title: editingItem ? 'Cupão atualizado!' : 'Cupão criado com sucesso!' })
      resetForm()
    } else {
      Toast.fire({ icon: 'error', title: res.error || 'Erro ao processar pedido' })
    }
    
    setLoading(false)
  }

  const handleDelete = async (id: number, code: string) => {
    const result = await Swal.fire({
      title: 'Tem a certeza?',
      text: `Deseja eliminar o cupão "${code}"?`,
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
      if (editingItem?.id === id) resetForm()
      const res = await deleteCoupon(id)
      if (res.success) {
        Toast.fire({ icon: 'success', title: 'Cupão eliminado!' })
      } else {
        Toast.fire({ icon: 'error', title: res.error || 'Erro ao eliminar' })
      }
    }
  }

  const handleToggle = async (id: number, currentStatus: boolean) => {
    const res = await toggleCoupon(id, !currentStatus)
    if (res.success) {
      Toast.fire({ icon: 'success', title: !currentStatus ? 'Cupão ativado!' : 'Cupão desativado!' })
    } else {
      Toast.fire({ icon: 'error', title: res.error || 'Erro ao atualizar' })
    }
  }

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  const toggleProduct = (id: number) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-bold text-white flex items-center gap-2">
          <Ticket size={18} className="text-neon-blue" />
          Cupões Existentes ({coupons.length})
        </h2>
        <button 
          onClick={() => {
            setEditingItem(null)
            setFormData({ code: '', discountPct: '', maxUses: '', expiresAt: '' })
            setSelectedCategories([])
            setSelectedProducts([])
            setIsModalOpen(true)
          }}
          className="bg-neon-purple text-white px-4 py-2 rounded-xl font-bold text-sm shadow-[0_0_15px_-3px_rgba(188,19,254,0.4)] hover:scale-105 transition-all flex items-center gap-2"
        >
          <PlusCircle size={16} /> Novo Cupão
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={resetForm}
        title={
          <>
            <PlusCircle size={18} className="text-neon-purple" /> {editingItem ? 'Editar Cupão' : 'Novo Cupão'}
          </>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Código do Cupão *</label>
            <input name="code" type="text" placeholder="Ex: VERAO20" required
              value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple uppercase" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Desconto (%) *</label>
            <input name="discountPct" type="number" min="1" max="100" placeholder="Ex: 20" required
              value={formData.discountPct} onChange={e => setFormData({...formData, discountPct: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Usos Máximos (Opcional)</label>
            <input name="maxUses" type="number" min="1" placeholder="Ex: 50"
              value={formData.maxUses} onChange={e => setFormData({...formData, maxUses: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Expira a (Opcional)</label>
            <input name="expiresAt" type="datetime-local"
              value={formData.expiresAt} onChange={e => setFormData({...formData, expiresAt: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple color-scheme-dark" />
          </div>

          <div className="border-t border-white/10 pt-4 mt-2">
            <label className="block text-xs font-bold text-gray-300 mb-2">Categorias Aplicáveis</label>
            <p className="text-[10px] text-gray-500 mb-2">Válido para todos os produtos destas categorias. (Se tudo estiver vazio, é válido para a loja inteira).</p>
            <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-2">
              {allCategories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={selectedCategories.includes(cat.id)} onChange={() => toggleCategory(cat.id)}
                    className="w-4 h-4 rounded border-white/10 bg-black/50 text-neon-purple focus:ring-neon-purple focus:ring-offset-black cursor-pointer" />
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 mt-2">
            <label className="block text-xs font-bold text-gray-300 mb-2">Produtos Específicos Aplicáveis</label>
            <p className="text-[10px] text-gray-500 mb-2">Podes adicionar produtos avulso de outras categorias que não marcaste acima.</p>
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
              {allProducts.map(prod => (
                <label key={prod.id} className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={selectedProducts.includes(prod.id)} onChange={() => toggleProduct(prod.id)}
                    className="w-4 h-4 rounded border-white/10 bg-black/50 text-neon-purple focus:ring-neon-purple focus:ring-offset-black cursor-pointer" />
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{prod.name}</span>
                    <span className="text-[9px] text-neon-blue uppercase">{prod.category?.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={loading} className="flex-1 h-[44px] bg-black/50 border border-white/10 hover:border-neon-purple hover:bg-white/5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
              {loading ? 'A processar...' : (editingItem ? 'Guardar Alterações' : 'Criar Cupão')}
            </button>
            <button type="button" onClick={resetForm} disabled={loading} className="px-6 h-[44px] bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl font-bold text-sm text-red-400 transition-all flex items-center justify-center shadow-sm disabled:opacity-50">
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Lista */}
      <div className="flex flex-col gap-4">

        {coupons.length === 0 ? (
          <div className="gale-panel p-12 text-center text-gray-400 border border-white/10">
            <Ticket size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-bold">Nenhum cupão criado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {coupons.map((coupon) => {
              const isGlobal = coupon.categories.length === 0 && coupon.products.length === 0;

              return (
                <div key={coupon.id} className={`gale-panel p-5 border flex flex-col justify-between gap-4 transition-colors ${editingItem?.id === coupon.id ? 'border-neon-pink' : (coupon.isActive ? 'border-white/10 hover:border-neon-purple/50' : 'border-red-500/20 opacity-75')}`}>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-black text-xl text-white tracking-wider flex items-center gap-2">
                        {coupon.code}
                        {isGlobal ? (
                          <span className="text-[9px] uppercase bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold">Global</span>
                        ) : (
                          <span className="text-[9px] uppercase bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold">Restrito</span>
                        )}
                      </p>
                      <span className="bg-neon-pink/20 text-neon-pink px-2 py-1 rounded-md text-xs font-bold">-{coupon.discountPct}%</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                      <span className="text-xs text-gray-400 bg-black/40 px-2 py-1 rounded">
                        Usos: <strong className="text-white">{coupon.uses}</strong> / {coupon.maxUses || 'Ilimitado'}
                      </span>
                      {coupon.expiresAt && (
                        <span className={`text-xs px-2 py-1 rounded ${new Date(coupon.expiresAt) < new Date() ? 'text-red-400 bg-red-400/10' : 'text-neon-blue bg-neon-blue/10'}`}>
                          Expira: <strong className="text-white">{new Date(coupon.expiresAt).toLocaleDateString('pt-PT')} {new Date(coupon.expiresAt).toLocaleTimeString('pt-PT', {hour: '2-digit', minute:'2-digit'})}</strong>
                        </span>
                      )}
                    </div>
                    {!isGlobal && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {coupon.categories.map(c => (
                          <span key={`c-${c.id}`} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">Cat: {c.name}</span>
                        ))}
                        {coupon.products.map(p => (
                          <span key={`p-${p.id}`} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">Prod: {p.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 justify-end mt-2 pt-4 border-t border-white/5">
                    <button onClick={() => handleToggle(coupon.id, coupon.isActive)} className={`w-[36px] h-[36px] flex items-center justify-center border rounded-lg transition-all ${coupon.isActive ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border-orange-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20'}`} title={coupon.isActive ? "Desativar Cupão" : "Ativar Cupão"}>
                      {coupon.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                    </button>
                    <button onClick={() => handleEdit(coupon)} className="w-[36px] h-[36px] flex items-center justify-center bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-all" title="Editar Cupão">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(coupon.id, coupon.code)} className="w-[36px] h-[36px] flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all" title="Eliminar Cupão">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
