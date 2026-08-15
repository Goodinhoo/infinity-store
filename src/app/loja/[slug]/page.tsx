import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { ArrowLeft, Zap, Layers } from 'lucide-react'
import DynamicIcon from '@/components/DynamicIcon'
import { getGlobalSettings } from '@/app/actions/global-settings'
import ClassicSidebar from '@/components/templates/ClassicSidebar'
import ProductCardList from '@/components/templates/ProductCardList'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category || category.isHidden) {
    return { title: 'Categoria Não Encontrada' }
  }
  return {
    title: `${category.name} - Infinity Store`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isHidden: false },
        include: { category: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!category || category.isHidden) {
    notFound()
  }

  const allCategories = await prisma.category.findMany({ 
    where: { isHidden: false },
    include: { products: { where: { isHidden: false } } },
    orderBy: { order: 'asc' } 
  })

  const settings = await getGlobalSettings()

  if (settings.STORE_TEMPLATE === 'CLASSIC_PORTAL') {
    return (
      <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
        <ClassicSidebar
          categories={allCategories}
          activeSlug={slug}
          serverIp={settings.SERVER_IP}
          serverVersions={settings.SERVER_VERSIONS}
        />
        <div className="flex-1 space-y-6">
          <header className="gale-panel p-6 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-neon-purple/10 border border-neon-purple/20 text-neon-purple">
                <DynamicIcon name={category.icon} fallback={Zap} size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">{category.name}</h1>
                <p className="text-xs text-gray-400">Produtos da categoria {category.name}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-neon-purple px-3 py-1 bg-neon-purple/10 rounded-full border border-neon-purple/20">
              {category.products.length} produtos
            </span>
          </header>

          {category.products.length === 0 ? (
            <div className="gale-panel p-16 text-center text-gray-400">
              <Layers size={48} className="mx-auto mb-3 opacity-20 text-neon-blue" />
              <p className="font-bold text-white">Nenhum produto nesta categoria.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {category.products.map((product) => (
                <ProductCardList key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <Link href="/loja" className="text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 w-fit">
        <ArrowLeft size={14} /> Voltar a todas as categorias
      </Link>

      <header className="gale-panel p-8 border border-white/10 bg-gradient-to-r from-[#0d0d18] via-[#150a25] to-[#08080c] flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-neon-purple/10 border border-neon-purple/30 text-neon-purple">
            <DynamicIcon name={category.icon} fallback={Zap} size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">{category.name}</h1>
            {category.description ? (
              <div 
                className="text-sm text-gray-400 [&>p]:inline [&>ul]:hidden [&>ol]:hidden [&>h1]:inline [&>h2]:inline [&>img]:hidden [&>a]:text-neon-blue [&>a]:underline" 
                dangerouslySetInnerHTML={{ __html: category.description }} 
              />
            ) : (
              <p className="text-sm text-gray-400">Produtos exclusivos nesta categoria.</p>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
          <Link
            href="/loja"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
          >
            Todos os Produtos
          </Link>
          {allCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/loja/${cat.slug}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                cat.slug === slug
                  ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white border border-neon-purple/40 shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
              }`}
            >
              <DynamicIcon name={cat.icon} fallback={Zap} size={14} className={cat.slug === slug ? 'text-white' : 'text-neon-purple'} />
              {cat.name}
            </Link>
          ))}
        </div>
      </header>

      {/* Grid de Produtos */}
      <section>
        {category.products.length === 0 ? (
          <div className="gale-panel p-16 text-center text-gray-400">
            <Layers size={48} className="mx-auto mb-3 opacity-20 text-neon-purple" />
            <p className="font-bold">Nenhum produto encontrado nesta categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 min-[1920px]:grid-cols-6 min-[2560px]:grid-cols-7 gap-6">
            {category.products.map((product) => (
              <ProductCard key={product.id} product={{...product, category: {name: category.name}}} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
