'use client'

import Link from 'next/link'
import AddToCartButton from '../AddToCartButton'
import { Info, ShoppingBag } from 'lucide-react'

interface Product {
  id: number
  name: string
  description: string
  price: number
  imageUrl: string | null
  categoryId: number
  category: {
    name: string
  }
  discountPercentage?: number | null
}

export default function ProductCardList({ product }: { product: Product }) {
  const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const productUrl = `/loja/produto/${product.id}-${slug}`

  return (
    <div className="gale-panel p-5 border border-white/10 hover:border-neon-purple/40 transition-all duration-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 group">
      {/* Imagem do Produto */}
      <Link href={productUrl} className="w-full sm:w-36 h-36 rounded-xl bg-black/50 border border-white/5 overflow-hidden flex-shrink-0 relative group/img">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600">
            INFINITY STORE
          </div>
        )}
        <div className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg backdrop-blur-md opacity-0 group-hover/img:opacity-100 transition-opacity">
          <Info size={16} className="text-neon-blue" />
        </div>
      </Link>

      {/* Conteúdo Central */}
      <div className="flex-1 space-y-2 text-center sm:text-left">
        <span className="text-[10px] font-bold text-neon-purple uppercase tracking-wider px-2 py-0.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 inline-block">
          {product.category.name}
        </span>
        <Link href={productUrl} className="block">
          <h3 className="font-black text-lg text-white group-hover:text-neon-blue transition-colors">
            {product.name}
          </h3>
        </Link>
        <div
          className="text-xs text-gray-400 line-clamp-2 max-w-xl [&>p]:inline [&>ul]:hidden [&>ol]:hidden [&>h1]:inline [&>h2]:inline [&>a]:text-neon-blue [&>a]:underline"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      </div>

      {/* Preço e Botão à Direita */}
      <div className="w-full sm:w-auto flex flex-col sm:items-end justify-between gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5 flex-shrink-0">
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
          <span className="text-xs text-gray-400 font-medium sm:hidden">Preço</span>
          {product.discountPercentage ? (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 line-through">
                  {product.price.toFixed(2)}€
                </span>
                <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">
                  -{product.discountPercentage}%
                </span>
              </div>
              <span className="text-2xl font-black text-neon-pink">
                {(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}€
              </span>
            </div>
          ) : (
            <span className="text-2xl font-black text-neon-pink">
              {product.price.toFixed(2)}€
            </span>
          )}
        </div>

        <div className="w-full sm:w-auto">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  )
}
