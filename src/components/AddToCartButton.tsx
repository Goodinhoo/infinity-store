'use client'

import { useCartStore } from '@/store/cartStore'
import { ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'

interface AddToCartButtonProps {
  product: {
    id: number
    name: string
    price: number
    imageUrl: string | null
    categoryId: number
    discountPercentage?: number | null
  }
  className?: string
}

export default function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const { addItem } = useCartStore()
  const [added, setAdded] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const finalPrice = product.discountPercentage 
      ? product.price * (1 - product.discountPercentage / 100)
      : product.price

    addItem({
      ...product,
      price: finalPrice
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleAdd}
      className={className || "w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-neon-purple to-neon-blue text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md"}
    >
      {added ? (
        <>
          <Check size={14} className="text-green-400" />
          Adicionado!
        </>
      ) : (
        <>
          <ShoppingCart size={14} />
          Adicionar ao Carrinho
        </>
      )}
    </button>
  )
}
