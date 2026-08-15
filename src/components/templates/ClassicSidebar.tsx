'use client'

import Link from 'next/link'
import DynamicIcon from '../DynamicIcon'
import ServerIPCard from '../ServerIPCard'
import { Layers, Zap } from 'lucide-react'

type CategoryProps = {
  id: number
  name: string
  slug: string
  icon: string | null
  products: { id: number }[]
}

export default function ClassicSidebar({
  categories,
  activeSlug,
  serverIp,
  serverVersions,
}: {
  categories: CategoryProps[]
  activeSlug?: string
  serverIp: string
  serverVersions: string
}) {
  return (
    <aside className="w-full lg:w-72 flex flex-col gap-6 flex-shrink-0">
      {/* Widget de Categorias */}
      <div className="gale-panel p-5 border border-white/10 space-y-4">
        <h3 className="font-bold text-white text-sm uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
          <Layers size={16} className="text-neon-purple" /> Categorias
        </h3>

        <div className="flex flex-col gap-1.5">
          <Link
            href="/loja"
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
              !activeSlug
                ? 'bg-neon-purple text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap size={14} className={!activeSlug ? 'text-white' : 'text-neon-purple'} />
              <span>Todas as Categorias</span>
            </div>
          </Link>

          {categories.map((cat) => {
            const isActive = activeSlug === cat.slug

            return (
              <Link
                key={cat.id}
                href={`/loja/${cat.slug}`}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  isActive
                    ? 'bg-neon-purple text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <DynamicIcon
                    name={cat.icon}
                    fallback={Zap}
                    size={14}
                    className={isActive ? 'text-white' : 'text-neon-purple'}
                  />
                  <span>{cat.name}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-gray-400 font-mono">
                  {cat.products.length}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Widget IP do Servidor na Sidebar */}
      <ServerIPCard ip={serverIp} versions={serverVersions} />
    </aside>
  )
}
