import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Info } from 'lucide-react'
import AddToCartButton from '@/components/AddToCartButton'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const productId = parseInt(id)
  
  if (isNaN(productId)) {
    notFound()
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
    }
  })

  if (!product || product.isHidden) {
    notFound()
  }

  const finalPrice = product.discountPercentage 
    ? product.price * (1 - product.discountPercentage / 100)
    : product.price

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      <Link href={`/loja/${product.category.slug}`} className="text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 w-fit">
        <ArrowLeft size={14} /> Voltar para {product.category.name}
      </Link>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Description */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="gale-panel p-6 md:p-8 border border-white/5 rounded-3xl">
            
            {/* Top Section: Image + Title */}
            <div className="flex flex-col sm:flex-row gap-6 mb-8">
              {/* Product Image */}
              {product.imageUrl && (
                <div className="w-full sm:w-1/2 min-[1921px]:w-1/3 flex-shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0f] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.imageUrl} alt={product.name} className="w-full h-auto object-contain" />
                </div>
              )}

              {/* Title & Category */}
              <div className="flex flex-col justify-center">
                <span className="inline-block px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-[10px] font-bold text-neon-purple uppercase tracking-widest mb-3 w-fit">
                  {product.category.name}
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{product.name}</h1>
              </div>
            </div>
            
            <div className="h-px w-full bg-white/5 mb-8"></div>
            
            <div 
              className="prose prose-invert prose-sm md:prose-base max-w-none text-gray-300 leading-relaxed prose-img:rounded-2xl prose-img:border prose-img:border-white/10 prose-img:max-w-full prose-img:h-auto prose-a:text-neon-blue prose-a:underline hover:prose-a:text-white prose-a:transition-colors"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </div>

        {/* Right Column: Sticky Checkout Sidebar */}
        <div className="w-full lg:w-1/3 sticky top-24">
          <div className="gale-panel p-6 border border-white/10 rounded-3xl flex flex-col gap-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Resumo de Compra</span>
              <h2 className="text-2xl font-black text-white">{product.name}</h2>
            </div>

            <div className="flex flex-col gap-2 bg-white/5 p-5 rounded-2xl border border-white/5">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Preço Unitário</span>
              <div className="flex flex-col">
                {product.discountPercentage ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base text-gray-500 line-through">
                        {product.price.toFixed(2)}€
                      </span>
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md font-bold">
                        -{product.discountPercentage}%
                      </span>
                    </div>
                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink drop-shadow-md">
                      {finalPrice.toFixed(2)}€
                    </span>
                  </>
                ) : (
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink drop-shadow-md">
                    {finalPrice.toFixed(2)}€
                  </span>
                )}
              </div>
            </div>

            <ul className="flex flex-col gap-3 text-sm text-gray-400">
              <li className="flex items-center gap-2"><Check size={16} className="text-neon-blue" /> Entrega Automática</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-neon-blue" /> Pagamento Seguro</li>
              {product.discountPercentage && (
                <li className="flex items-center gap-2"><Info size={16} className="text-neon-pink" /> Promoção Limitada</li>
              )}
            </ul>

            <AddToCartButton 
              product={product} 
              className="w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider bg-gradient-to-r from-neon-purple to-neon-blue text-white hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(188,19,254,0.4)] mt-2" 
            />
          </div>
        </div>

      </div>
    </div>
  )
}
