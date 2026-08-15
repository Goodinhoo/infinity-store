'use client'

import { useState, useEffect, useCallback } from 'react'
import { getLeaderboardPrizes, saveLeaderboardPrizes, distributePrizes } from '@/app/actions/leaderboards'
import { getProductsForWheel } from '@/app/actions/fortune-wheel' // We can reuse this as it gets all products
import { Trophy, Gift, ArrowLeft } from 'lucide-react'
import { Toast, ConfirmAlert } from '@/lib/toast'
import Link from 'next/link'
import CustomSelect from '@/components/CustomSelect'

type ProductOption = { id: number, name: string, category: { id: number, name: string } }

export default function AdminLeaderboards() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [distributing, setDistributing] = useState(false)
  const [products, setProducts] = useState<ProductOption[]>([])
  
  const [prizes, setPrizes] = useState({ top1: '', top2: '', top3: '' })

  const loadData = useCallback(async () => {
    try {
      const [prz, prods] = await Promise.all([getLeaderboardPrizes(), getProductsForWheel()])
      setPrizes(prz)
      setProducts(prods)
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao carregar dados' })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line
    loadData()
  }, [loadData])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await saveLeaderboardPrizes(prizes.top1, prizes.top2, prizes.top3)
    if (res.error) {
      Toast.fire({ icon: 'error', title: res.error })
    } else {
      Toast.fire({ icon: 'success', title: 'Prémios guardados!' })
    }
    setSaving(false)
  }

  const handleDistribute = async () => {
    const isConfirmed = await ConfirmAlert.fire('Tens a certeza?', 'Isto irá processar a entrega automática dos prémios aos Top 3 do mês anterior. Tens a certeza?')
    if (!isConfirmed) return
    setDistributing(true)
    const res = await distributePrizes()
    if (res.error) {
      Toast.fire({ icon: 'error', title: res.error })
    } else {
      Toast.fire({ icon: 'success', title: `Foram entregues prémios a ${res.count} heróis!` })
    }
    setDistributing(false)
  }

  const productOptions = [
    { value: '', label: 'Nenhum Prémio' },
    ...products.map(p => ({
      value: p.id.toString(),
      label: p.name,
      group: p.category.name
    }))
  ]

  if (loading) return <div className="p-8 text-center text-gray-400">A carregar...</div>

  return (
    <div className="p-8 w-full space-y-8 animate-fade-in">
      
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/modules" className="text-gray-400 hover:text-white transition-colors text-sm font-semibold flex items-center gap-2">
          <ArrowLeft size={16} /> Voltar aos Módulos
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black uppercase text-white mb-1 flex items-center gap-3">
            <Trophy size={24} className="text-white" />
            Heróis do Mês
          </h1>
          <p className="text-gray-400 text-sm">Configura as recompensas atribuídas aos Top 3 doadores.</p>
        </div>

        <button 
          onClick={handleDistribute}
          disabled={distributing}
          className="px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-blue rounded-xl font-bold text-white shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Gift size={18} />
          {distributing ? 'A Distribuir...' : 'Distribuir Prémios (Mês Passado)'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TOP 1 */}
        <div className="gale-panel p-6 border border-yellow-500/30 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)] border border-yellow-500/50">
            <Trophy size={32} />
          </div>
          <h2 className="text-xl font-black text-yellow-500 mb-2">1º Lugar</h2>
          <p className="text-sm text-gray-400 mb-6">O maior doador do mês.</p>
          
          <div className="w-full text-left">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Prémio (Produto)</label>
            <CustomSelect
              value={prizes.top1}
              onChange={(val) => setPrizes({ ...prizes, top1: val })}
              options={productOptions}
            />
          </div>
        </div>

        {/* TOP 2 */}
        <div className="gale-panel p-6 border border-gray-400/30 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-400/20 rounded-full flex items-center justify-center mb-4 text-gray-400 shadow-[0_0_20px_rgba(156,163,175,0.2)] border border-gray-400/50">
            <Trophy size={32} />
          </div>
          <h2 className="text-xl font-black text-gray-400 mb-2">2º Lugar</h2>
          <p className="text-sm text-gray-500 mb-6">O vice-campeão de doações.</p>
          
          <div className="w-full text-left">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Prémio (Produto)</label>
            <CustomSelect
              value={prizes.top2}
              onChange={(val) => setPrizes({ ...prizes, top2: val })}
              options={productOptions}
            />
          </div>
        </div>

        {/* TOP 3 */}
        <div className="gale-panel p-6 border border-amber-700/30 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-amber-700/20 rounded-full flex items-center justify-center mb-4 text-amber-700 shadow-[0_0_20px_rgba(180,83,9,0.2)] border border-amber-700/50">
            <Trophy size={32} />
          </div>
          <h2 className="text-xl font-black text-amber-700 mb-2">3º Lugar</h2>
          <p className="text-sm text-gray-500 mb-6">Para fechar o pódio em grande.</p>
          
          <div className="w-full text-left">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Prémio (Produto)</label>
            <CustomSelect
              value={prizes.top3}
              onChange={(val) => setPrizes({ ...prizes, top3: val })}
              options={productOptions}
            />
          </div>
        </div>

      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="h-[44px] px-8 bg-black/50 border border-white/10 hover:border-neon-purple hover:bg-white/5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
        >
          {saving ? 'A Guardar...' : 'Guardar Alterações'}
        </button>
      </div>

    </div>
  )
}
