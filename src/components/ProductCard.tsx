'use client'

import Link from 'next/link'
import AddToCartButton from './AddToCartButton'
import { Info } from 'lucide-react'

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

export default function ProductCard({ product }: { product: Product }) {
  const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const productUrl = `/loja/produto/${product.id}-${slug}`

  return (
    <Link 
      href={productUrl}
      className="gale-panel p-5 flex flex-col justify-between gap-4 hover:border-neon-purple/40 hover:-translate-y-2 transition-all duration-300 group cursor-pointer block"
    >
        <div className="flex flex-col gap-3">
          <div className="w-full h-44 rounded-xl bg-black/50 border border-white/5 overflow-hidden flex items-center justify-center relative">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            ) : (
              <span className="text-xs font-bold text-gray-600">INFINITY STORE</span>
            )}
            <div className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
              <Info size={16} className="text-neon-blue" />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-neon-purple uppercase tracking-wider">{product.category.name}</span>
            <h3 className="font-bold text-base text-white group-hover:text-neon-blue transition-colors line-clamp-1">{product.name}</h3>
            <div 
              className="text-xs text-gray-400 line-clamp-2 mt-1 [&>p]:inline [&>ul]:hidden [&>ol]:hidden [&>h1]:inline [&>h2]:inline [&>blockquote]:inline [&>img]:hidden [&>a]:text-neon-blue [&>a]:underline" 
              dangerouslySetInnerHTML={{ __html: product.description }} 
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-3 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400 font-medium">Preço</span>
            <div className="flex flex-col items-end">
              {product.discountPercentage ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 line-through">
                      {product.price.toFixed(2)}€
                    </span>
                    <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">
                      -{product.discountPercentage}%
                    </span>
                  </div>
                  <span className="text-xl font-black text-neon-pink">{(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}€</span>
                </>
              ) : (
                <span className="text-xl font-black text-neon-pink">{product.price.toFixed(2)}€</span>
              )}
            </div>
          </div>
          <AddToCartButton product={product} />
        </div>
      </Link>
  )
}
