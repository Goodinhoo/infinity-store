'use client'

import { useState } from 'react'
import { Package, Send, Gift, Loader2 } from 'lucide-react'
import { redeemChestItem } from '@/app/actions/chest'

type ChestItemType = {
  id: number
  name: string
  description: string | null
  imageUrl: string | null
  type: string
  source: string
}

export default function ChestItemCard({ item, currentUsername }: { item: ChestItemType, currentUsername: string }) {
  const [loading, setLoading] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [targetPlayer, setTargetPlayer] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleRedeem = async (target: string) => {
    if (!target) {
      setError('Por favor, indica o nick do jogador.')
      return
    }

    setLoading(true)
    setError(null)
    
    const res = await redeemChestItem(item.id, target)
    
    if (res.error) {
      setError(res.error)
      setLoading(false)
    }
    // Se sucesso, o revalidatePath vai tratar de remover o item do ecrã
  }

  return (
    <div className="gale-panel p-4 border border-white/10 hover:border-white/20 transition-all flex flex-col gap-4 relative overflow-hidden group">
      {/* Background glow base on source */}
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-20 blur-3xl -z-10 rounded-full ${
        item.source === 'FORTUNE_WHEEL' ? 'bg-amber-500' : 'bg-neon-blue'
      }`}></div>

      <div className="flex gap-4 items-start">
        <div className="w-16 h-16 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <Package size={24} className="text-gray-500" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-white text-lg">{item.name}</h3>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-400">
              {item.type}
            </span>
          </div>
          {item.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="text-[11px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {showSendModal ? (
        <div className="flex flex-col gap-2 pt-3 border-t border-white/10 mt-auto">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Enviar para (Nick)</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={targetPlayer}
              onChange={(e) => setTargetPlayer(e.target.value)}
              placeholder="Ex: Notch"
              className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neon-purple"
            />
            <button 
              onClick={() => handleRedeem(targetPlayer)}
              disabled={loading}
              className="bg-neon-purple hover:bg-neon-purple/90 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center min-w-[80px]"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : 'Confirmar'}
            </button>
          </div>
          <button 
            onClick={() => { setShowSendModal(false); setError(null); }}
            className="text-[11px] text-gray-500 hover:text-white transition-colors text-left"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 mt-auto">
          <button 
            onClick={() => handleRedeem(currentUsername)}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 hover:from-neon-blue/40 hover:to-neon-purple/40 border border-neon-blue/30 text-white py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : (
              <>
                <Send size={14} /> Resgatar p/ mim
              </>
            )}
          </button>
          <button 
            onClick={() => setShowSendModal(true)}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
          >
            <Gift size={14} /> Enviar p/ Amigo
          </button>
        </div>
      )}
    </div>
  )
}
