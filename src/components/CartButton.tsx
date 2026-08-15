'use client'

import { useCartStore } from '@/store/cartStore'
import { ShoppingCart } from 'lucide-react'

export default function CartButton() {
  const { items, toggleCart } = useCartStore()
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <button
      onClick={toggleCart}
      className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all flex items-center gap-2 group"
      title="Ver Carrinho"
    >
      <ShoppingCart size={18} className="text-neon-blue group-hover:scale-110 transition-transform" />
      <span className="hidden sm:inline text-xs font-bold">Carrinho</span>

      {itemCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-r from-neon-purple to-neon-pink text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(188,19,254,0.8)] animate-pulse">
          {itemCount}
        </span>
      )}
    </button>
  )
}
