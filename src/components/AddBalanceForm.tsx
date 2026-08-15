'use client'

import { useState } from 'react'
import { Wallet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { addBalance } from '@/app/actions/wallet'

const PREDEFINED_AMOUNTS = [5, 10, 25, 50]

export function AddBalanceForm() {
  const [amount, setAmount] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || amount <= 0) return

    setLoading(true)
    setMessage('')
    setIsSuccess(false)

    const res = await addBalance(Number(amount))
    if (res.success) {
      setIsSuccess(true)
      setMessage(`Adicionaste ${amount}€ à tua carteira com sucesso!`)
      setAmount('')
    } else {
      setMessage(res.error || 'Erro ao adicionar saldo.')
    }
    
    setLoading(false)
  }

  return (
    <div className="gale-panel p-6 border border-white/10 mt-6">
      <h3 className="text-lg font-bold mb-4 text-white border-b border-white/10 pb-3 flex items-center gap-2">
        <Wallet size={18} className="text-neon-pink" />
        Adicionar Saldo
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {PREDEFINED_AMOUNTS.map(val => (
          <button
            key={val}
            type="button"
            onClick={() => setAmount(val)}
            className={`py-2 rounded-xl border text-sm font-bold transition-all ${
              amount === val
                ? 'bg-neon-pink/20 border-neon-pink text-neon-pink'
                : 'bg-black/50 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
            }`}
          >
            {val}€
          </button>
        ))}
      </div>

      <form onSubmit={handleTopUp} className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
          <input
            type="number"
            min="1"
            max="500"
            step="1"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
            placeholder="Outro valor..."
            className="w-full bg-black/50 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm text-white focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !amount || amount <= 0}
          className="px-6 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple text-white font-bold text-sm transition-all shadow-[0_0_15px_-5px_rgba(255,0,127,0.5)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Pagar'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 flex items-center gap-2 p-3.5 rounded-xl border text-xs font-semibold ${
          isSuccess 
            ? 'text-green-400 bg-green-400/10 border-green-400/20' 
            : 'text-red-400 bg-red-400/10 border-red-400/20'
        }`}>
          {isSuccess ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{message}</span>
        </div>
      )}
      
      <p className="text-[11px] text-gray-500 mt-4 text-center">
        * Esta é uma simulação para fins de teste. O saldo é atualizado instantaneamente.
      </p>
    </div>
  )
}
