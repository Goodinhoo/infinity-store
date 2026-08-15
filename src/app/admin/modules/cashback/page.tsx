'use client'

import { useState, useEffect } from 'react'
import { getCashbackPercentage, updateCashbackPercentage } from '@/app/actions/settings'
import { Banknote, Save, CheckCircle2 } from 'lucide-react'
import { Toast } from '@/lib/toast'
import Link from 'next/link'

export default function CashbackSettings() {
  const [cashbackPct, setCashbackPct] = useState<number>(2.5)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await getCashbackPercentage()
      setCashbackPct(res)
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    await updateCashbackPercentage(cashbackPct)
    
    setSaving(false)
    setSaved(true)
    
    Toast.fire({
      icon: 'success',
      title: 'Configurações guardadas!'
    })
    
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div className="p-8 text-center text-gray-400">A carregar...</div>

  return (
    <div className="p-8 w-full space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/modules" className="text-gray-400 hover:text-white transition-colors text-sm font-semibold">
          ← Voltar aos Módulos
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-black uppercase text-white mb-1">Configurações do Cashback</h1>
        <p className="text-gray-400 text-sm">Ajuste os valores de retorno de fidelidade para os jogadores.</p>
      </div>

      <div className="gale-panel p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
            <Banknote size={16} />
          </div>
          <h2 className="font-bold text-white uppercase tracking-wider text-sm">Opções de Cashback</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Percentagem de Cashback (%)</label>
              <input 
                type="number" 
                min="0"
                max="100"
                step="0.1"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-400 transition-colors" 
                value={cashbackPct} 
                onChange={(e) => setCashbackPct(parseFloat(e.target.value) || 0)} 
                required 
              />
              <p className="text-[10px] text-gray-500 mt-2">Valor devolvido em saldo após uma encomenda paga (ex: 2.5 = 2.5%).</p>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className="h-[44px] px-8 bg-black/50 border border-white/10 hover:border-green-400 hover:bg-white/5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {saved ? <CheckCircle2 size={16} className="text-green-400" /> : <Save size={16} />} 
              {saving ? 'A Guardar...' : saved ? 'Guardado' : 'Guardar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
