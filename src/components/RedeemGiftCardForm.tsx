"use client"

import { useState } from "react"
import { redeemGiftCard } from "@/app/actions/user-giftcards"
import { Gift } from "lucide-react"
import { Toast } from "@/lib/toast"

export function RedeemGiftCardForm() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    try {
      const res = await redeemGiftCard(code)
      if (res.success) {
        Toast.fire({ icon: 'success', title: res.message || "Cartão resgatado com sucesso!" })
        setCode("")
      } else {
        Toast.fire({ icon: 'error', title: res.error || "Erro ao resgatar o cartão." })
      }
    } catch (error) {
      console.error(error)
      Toast.fire({ icon: 'error', title: "Ocorreu um erro inesperado." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full mt-4 bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase mb-1">
        <Gift size={14} className="text-neon-purple" />
        Resgatar Cartão Presente
      </div>
      <form onSubmit={handleRedeem} className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Ex: INFINITY-XXXX-XXXX"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          className="w-full bg-[#050508] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-purple transition-colors placeholder:text-gray-600"
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full py-2 bg-neon-purple/20 text-neon-purple border border-neon-purple/30 rounded-lg font-bold text-xs transition-all hover:bg-neon-purple/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "A resgatar..." : "Resgatar Código"}
        </button>
      </form>
    </div>
  )
}
