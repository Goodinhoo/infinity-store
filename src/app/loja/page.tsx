import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { ShoppingBag, Zap, Layers } from 'lucide-react'
import DynamicIcon from '@/components/DynamicIcon'
import { getGlobalSettings } from '@/app/actions/global-settings'
import ClassicSidebar from '@/components/templates/ClassicSidebar'
import ProductCardList from '@/components/templates/ProductCardList'
import ProductCardCompact from '@/components/templates/ProductCardCompact'

export const metadata = {
  title: 'Loja Oficial - Infinity Nexus',
  description: 'Adquire Ranks, Chaves, Coins e Caixas Misteriosas na loja oficial.',
}

export default async function StorePage() {
  const categories = await prisma.category.findMany({
    where: { isHidden: false },
    include: {
      products: {
        where: { isHidden: false }
      }
    },
    orderBy: { order: 'asc' }
  })

  const settings = await getGlobalSettings()

  const allProducts = await prisma.product.findMany({
    where: { 
      isHidden: false,
      category: { isHidden: false }
    },
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  })

  if (settings.STORE_TEMPLATE === 'CLASSIC_PORTAL') {
    return (
      <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
        <ClassicSidebar
          categories={categories}
          serverIp={settings.SERVER_IP}
          serverVersions={settings.SERVER_VERSIONS}
        />
        <div className="flex-1 space-y-6">
          <header className="gale-panel p-6 border border-white/10 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">Catálogo da Loja</h1>
              <p className="text-xs text-gray-400">Todos os produtos disponíveis no servidor</p>
            </div>
            <span className="text-xs font-bold text-neon-purple px-3 py-1 bg-neon-purple/10 rounded-full border border-neon-purple/20">
              {allProducts.length} itens
            </span>
          </header>

          {allProducts.length === 0 ? (
            <div className="gale-panel p-16 text-center text-gray-400">
              <Layers size={48} className="mx-auto mb-3 opacity-20 text-neon-blue" />
              <p className="font-bold text-white">Sem produtos no catálogo</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {allProducts.map((product) => (
                <ProductCardList key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (settings.STORE_TEMPLATE === 'COMPACT_STORE') {
    return (
      <div className="flex flex-col gap-8 animate-fade-in">
        <header className="gale-panel p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0a0a12] via-[#120820] to-[#06060a]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neon-purple">E-Commerce Rápido</span>
            <h1 className="text-2xl font-black text-white">Catálogo de Produtos</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/loja" className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neon-purple text-white">
              Todos ({allProducts.length})
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/loja/${cat.slug}`}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
              >
                {cat.name} ({cat.products.length})
              </Link>
            ))}
          </div>
        </header>

        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {allProducts.map((product) => (
            <ProductCardCompact key={product.id} product={product} />
          ))}
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      {/* Header Banner */}
      <header className="gale-panel p-8 sm:p-12 border border-white/10 bg-gradient-to-r from-[#0d0d18] via-[#150a25] to-[#08080c] flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-neon-purple/10 border border-neon-purple/30 text-neon-purple">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">Catálogo da Loja</h1>
            <p className="text-sm text-gray-400">Escolhe uma categoria ou explora todos os itens disponíveis</p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
          <Link
            href="/loja"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-neon-purple to-neon-blue text-white border border-neon-purple/40 shadow-md"
          >
            Todos os Produtos ({allProducts.length})
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/loja/${cat.slug}`}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all flex items-center gap-1.5"
            >
              <DynamicIcon name={cat.icon} fallback={Zap} size={14} className="text-neon-purple" />
              {cat.name} ({cat.products.length})
            </Link>
          ))}
        </div>
      </header>

      {/* Grid de Produtos */}
      <section className="flex flex-col gap-6">
        {allProducts.length === 0 ? (
          <div className="gale-panel p-16 text-center text-gray-400">
            <Layers size={64} className="mx-auto mb-4 opacity-20 text-neon-blue" />
            <h3 className="text-xl font-bold mb-2">Sem produtos no catálogo</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Ainda não existem produtos configurados. Acede ao painel de administração para criar novas categorias e produtos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-8 5xl:grid-cols-10 gap-6">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
