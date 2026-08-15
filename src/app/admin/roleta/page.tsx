'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getWheelSettings, getWheelItems, updateWheelSettings, addWheelItem, updateWheelItem, deleteWheelItem, getProductsForWheel } from '@/app/actions/fortune-wheel'
import { getModules } from '@/app/actions/settings'
import { Plus, Settings, Trash2, Edit } from 'lucide-react'
import CustomSelect from '@/components/CustomSelect'
import { FortuneWheelItem } from '@/generated/prisma'
import Swal from 'sweetalert2'
import { Toast } from '@/lib/toast'

type ProductOption = { id: number, name: string, category: { id: number, name: string } }

export default function AdminRoletaPage() {
  const router = useRouter()
  const [settings, setSettings] = useState({ cost: 0, cooldownMinutes: 0 })
  const [items, setItems] = useState<FortuneWheelItem[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(true)

  // Edit State
  const [editingItem, setEditingItem] = useState<FortuneWheelItem | null>(null)
  const [formData, setFormData] = useState({ name: '', type: 'CREDITS', value: '', weight: 10, color: '#000000', icon: 'Gift' })

  const loadData = useCallback(async () => {
    const [sets, its, prods, modules] = await Promise.all([getWheelSettings(), getWheelItems(), getProductsForWheel(), getModules()])
    
    if (!modules.MODULE_FORTUNE_WHEEL) {
      router.push('/admin')
      return
    }

    setSettings(sets)
    setItems(its)
    setProducts(prods)
    setLoading(false)
  }, [router])

  useEffect(() => {
    // eslint-disable-next-line
    loadData()
  }, [loadData])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateWheelSettings(settings.cost, settings.cooldownMinutes)
    Toast.fire({
      icon: 'success',
      title: 'Configurações guardadas!'
    })
  }

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingItem) {
      await updateWheelItem(editingItem.id, formData)
    } else {
      await addWheelItem(formData)
    }
    setEditingItem(null)
    setFormData({ name: '', type: 'CREDITS', value: '', weight: 10, color: '#000000', icon: 'Gift' })
    setLoading(true)
    loadData()
    Toast.fire({
      icon: 'success',
      title: editingItem ? 'Prémio atualizado!' : 'Prémio adicionado!'
    })
  }

  const handleEdit = (item: FortuneWheelItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name, type: item.type, value: item.value || '',
      weight: item.weight, color: item.color, icon: item.icon || 'Gift'
    })
  }

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Tem a certeza?',
      text: 'Quer remover este prémio da roleta?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Sim, remover',
      cancelButtonText: 'Cancelar',
      background: '#0d0d14',
      color: '#fff'
    })

    if (result.isConfirmed) {
      await deleteWheelItem(id)
      setLoading(true)
      loadData()
      Toast.fire({
        icon: 'success',
        title: 'Prémio removido!'
      })
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">A carregar...</div>

  return (
    <div className="p-8 w-full space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black uppercase text-white mb-1">Roda da Fortuna</h1>
        <p className="text-gray-400 text-sm">Gerencie os prémios e os custos de utilização da roleta.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Configurações Globais */}
        <div className="gale-panel p-6 border border-white/10 md:col-span-1 h-fit">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-neon-purple/20 flex items-center justify-center text-neon-purple">
              <Settings size={16} />
            </div>
            <h2 className="font-bold text-white uppercase tracking-wider text-sm">Configurações</h2>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Custo (Moedas)</label>
              <input type="number" className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple" value={settings.cost} onChange={(e) => setSettings({ ...settings, cost: parseFloat(e.target.value) })} required />
              <p className="text-[10px] text-gray-500 mt-1">Custo para girar (0 = grátis)</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tempo de Espera (Minutos)</label>
              <input type="number" className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple" value={settings.cooldownMinutes} onChange={(e) => setSettings({ ...settings, cooldownMinutes: parseInt(e.target.value) })} required />
              <p className="text-[10px] text-gray-500 mt-1">Tempo até poder girar novamente (1440 = 1 dia)</p>
            </div>
            <button type="submit" className="w-full h-[44px] bg-black/50 border border-white/10 hover:border-neon-purple hover:bg-white/5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-sm">Guardar Configs</button>
          </form>
        </div>

        {/* Gestão de Itens */}
        <div className="md:col-span-2 space-y-6">
          <div className="gale-panel p-6 border border-white/10">
            <h2 className="font-bold text-white uppercase tracking-wider text-sm mb-6 pb-4 border-b border-white/5">
              {editingItem ? 'Editar Prémio' : 'Adicionar Prémio'}
            </h2>
            <form onSubmit={handleSaveItem} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nome</label>
                <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Cor (Hex)</label>
                <div className="flex gap-2">
                  <input type="color" className="w-10 h-10 rounded bg-transparent border-0 cursor-pointer" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                  <input type="text" className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} required />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Ícone (Lucide-react)</label>
                  <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="text-neon-purple hover:underline text-xs font-bold lowercase">ver lista</a>
                </div>
                <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple font-mono text-xs" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} placeholder="Ex: Gift, Coins, Trophy..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Tipo</label>
                <CustomSelect
                  value={formData.type}
                  onChange={(val) => setFormData({ ...formData, type: val })}
                  options={[
                    { value: 'CREDITS', label: 'Créditos/Moedas' },
                    { value: 'COMMAND', label: 'Comando In-Game' },
                    { value: 'PRODUCT', label: 'Produto da Loja' },
                    { value: 'EMPTY', label: 'Nada (Perdeu)' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                  {formData.type === 'PRODUCT' ? 'Produto' : 'Valor (Qtd Créditos ou Comando)'}
                </label>
                {formData.type === 'PRODUCT' ? (
                  <CustomSelect
                    value={formData.value}
                    onChange={(val) => setFormData({ ...formData, value: val })}
                    options={[
                      { value: '', label: 'Selecione um produto...' },
                      ...products.map(p => ({
                        value: p.id.toString(),
                        label: p.name,
                        group: p.category.name
                      }))
                    ]}
                  />
                ) : (
                  <input 
                    type="text" 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple" 
                    value={formData.value} 
                    onChange={e => setFormData({ ...formData, value: e.target.value })} 
                    placeholder="Ex: 100 ou /give %player% diamond" 
                    required={formData.type !== 'EMPTY'} 
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Probabilidade (Peso)</label>
                <input type="number" className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple" value={formData.weight} onChange={e => setFormData({ ...formData, weight: parseInt(e.target.value) })} required />
                <p className="text-[10px] text-gray-500 mt-1">Quanto maior, mais fácil de calhar.</p>
              </div>
              <div className="flex items-start pt-[24px] gap-4">
                <button type="submit" className="flex-1 h-[44px] bg-black/50 border border-white/10 hover:border-neon-purple hover:bg-white/5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-sm">
                  <Plus size={16} /> {editingItem ? 'Guardar' : 'Adicionar'}
                </button>
                {editingItem && (
                  <button type="button" onClick={() => setEditingItem(null)} className="px-4 h-[44px] bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center">Cancelar</button>
                )}
              </div>
            </form>
          </div>

          <div className="gale-panel p-6 border border-white/10">
            <h2 className="font-bold text-white uppercase tracking-wider text-sm mb-6 pb-4 border-b border-white/5">Prémios Existentes</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <div>
                      <p className="text-sm font-bold text-white">{item.name}</p>
                      <p className="text-xs text-gray-400">Tipo: {item.type} | Valor: {item.value || 'N/A'} | Peso: {item.weight}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(item)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Nenhum prémio configurado.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
