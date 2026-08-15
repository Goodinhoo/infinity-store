"use client"

import { useState } from "react"
import { createGiftCards, deleteGiftCard } from "@/app/actions/admin-giftcards"
import { Trash2, Copy, Check, Plus } from "lucide-react"
import { Toast, ConfirmAlert } from "@/lib/toast"

interface GiftCard {
  id: number
  code: string
  amount: number
  isUsed: boolean
  usedAt: Date | null
  createdAt: Date
  usedBy?: {
    username: string | null
  } | null
}

export default function GiftCardManager({ initialGiftCards }: { initialGiftCards: GiftCard[] }) {
  const [cards, setCards] = useState<GiftCard[]>(initialGiftCards)
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  // Form states
  const [amount, setAmount] = useState<number>(10)
  const [count, setCount] = useState<number>(1)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (amount <= 0 || count <= 0) return

    setLoading(true)
    try {
      const res = await createGiftCards(amount, count)
      if (res.success) {
        Toast.fire({ icon: 'success', title: res.message || "Cartões gerados!" })
        window.location.reload()
      } else {
        Toast.fire({ icon: 'error', title: res.error || "Erro ao gerar cartões." })
      }
    } catch (error) {
      console.error(error)
      Toast.fire({ icon: 'error', title: "Ocorreu um erro inesperado." })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    const isConfirmed = await ConfirmAlert.fire("Tens a certeza?", "Queres eliminar este cartão? (Só possível se não tiver sido usado)")
    if (!isConfirmed) return
    
    setLoading(true)
    try {
      const res = await deleteGiftCard(id)
      if (res.success) {
        Toast.fire({ icon: 'success', title: res.message || "Eliminado com sucesso!" })
        setCards(cards.filter(c => c.id !== id))
      } else {
        Toast.fire({ icon: 'error', title: res.error || "Erro ao eliminar." })
      }
    } catch (error) {
      console.error(error)
      Toast.fire({ icon: 'error', title: "Ocorreu um erro inesperado." })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (id: number, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    Toast.fire({ icon: 'success', title: "Código copiado!" })
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Generate Form */}
      <div className="gale-panel p-6 rounded-2xl border border-white/5">
        <h2 className="text-lg font-bold text-white mb-4">Gerar Novos Cartões</h2>
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Valor (€) de cada cartão</label>
            <input 
              type="number" 
              min="1"
              step="0.01"
              required
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Quantidade a gerar</label>
            <input 
              type="number" 
              min="1"
              max="100"
              required
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto h-[48px] px-6 rounded-xl bg-neon-purple text-white font-bold hover:bg-neon-purple/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus size={18} />
            Gerar
          </button>
        </form>
      </div>

      {/* List */}
      <div className="gale-panel rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Código</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Valor</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Estado</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Utilizado Por</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {cards.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Nenhum cartão presente gerado ainda.
                  </td>
                </tr>
              ) : cards.map((card) => (
                <tr key={card.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <code className="text-neon-blue font-mono bg-neon-blue/10 px-2 py-1 rounded text-sm">
                        {card.code}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(card.id, card.code)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {copiedId === card.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-white">{card.amount.toFixed(2)}€</td>
                  <td className="p-4">
                    {card.isUsed ? (
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">USADO</span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">VÁLIDO</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {card.isUsed ? (
                      <div className="flex flex-col">
                        <span className="text-white">{card.usedBy?.username || "Desconhecido"}</span>
                        <span className="text-[10px]">
                          {card.usedAt ? new Date(card.usedAt).toLocaleDateString('pt-PT') : ''}
                        </span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(card.id)}
                      disabled={loading || card.isUsed}
                      className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-red-500/10 disabled:hover:text-red-500"
                      title={card.isUsed ? "Não é possível eliminar um cartão usado" : "Eliminar cartão"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
