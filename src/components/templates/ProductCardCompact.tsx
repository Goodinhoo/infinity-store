'use client'

import Link from 'next/link'
import AddToCartButton from '../AddToCartButton'

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

export default function ProductCardCompact({ product }: { product: Product }) {
  const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const productUrl = `/loja/produto/${product.id}-${slug}`

  return (
    <div className="gale-panel p-4 border border-white/10 hover:border-neon-purple/50 transition-all duration-200 rounded-xl flex flex-col justify-between gap-3 group">
      <div>
        <Link href={productUrl} className="block relative w-full h-36 bg-black/40 rounded-lg overflow-hidden mb-3 border border-white/5">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-600">
              INFINITY STORE
            </div>
          )}
          {product.discountPercentage && (
            <span className="absolute top-2 right-2 bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow">
              -{product.discountPercentage}%
            </span>
          )}
        </Link>

        <span className="text-[9px] font-bold text-neon-purple uppercase tracking-wider">
          {product.category.name}
        </span>
        <Link href={productUrl}>
          <h3 className="font-bold text-sm text-white group-hover:text-neon-blue transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
      </div>

      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col">
          {product.discountPercentage ? (
            <span className="text-[10px] text-gray-500 line-through">
              {product.price.toFixed(2)}€
            </span>
          ) : null}
          <span className="text-base font-black text-neon-pink">
            {product.discountPercentage
              ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
              : product.price.toFixed(2)}
            €
          </span>
        </div>

        <AddToCartButton product={product} />
      </div>
    </div>
  )
}
