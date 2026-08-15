import { prisma } from '@/lib/prisma'
import { getModules } from '@/app/actions/settings'
import { ShieldAlert, Table, Check, X } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Tabela VIP - Infinity Nexus',
  description: 'Compara as vantagens de cada Rank na nossa loja.',
}

export default async function VipsPage() {
  const modules = await getModules()
  
  if (!modules.MODULE_VIPTABLE) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center gap-6 animate-fade-in">
        <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
          <ShieldAlert size={48} />
        </div>
        <h1 className="text-3xl font-black text-white">Tabela Desativada</h1>
        <p className="text-gray-400 max-w-md">
          A tabela comparativa de VIPs encontra-se desativada de momento.
        </p>
        <Link href="/loja" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold mt-4 transition-colors">
          Ir para a Loja
        </Link>
      </div>
    )
  }

  // Obter Produtos VIP e Features
  const products = await prisma.product.findMany({
    where: { showInVipTable: true, isHidden: false },
    include: { vipFeatureValues: true },
    orderBy: { price: 'asc' }
  })

  const features = await prisma.vipFeature.findMany({
    orderBy: [
      { group: 'asc' },
      { order: 'asc' }
    ]
  })

  if (products.length === 0 || features.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center gap-6">
        <Table size={48} className="text-gray-600 opacity-50" />
        <h1 className="text-3xl font-black text-white">Tabela em Construção</h1>
        <p className="text-gray-400">Em breve teremos aqui a comparação dos nossos ranks.</p>
        <Link href="/loja" className="px-6 py-3 bg-neon-blue text-white rounded-xl font-bold mt-4">
          Ir para a Loja
        </Link>
      </div>
    )
  }

  // Agrupar Features
  const groupedFeatures = features.reduce((acc, feat) => {
    if (!acc[feat.group]) acc[feat.group] = []
    acc[feat.group].push(feat)
    return acc
  }, {} as Record<string, typeof features>)

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 flex flex-col gap-12 animate-fade-in">
      <div className="text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 flex items-center justify-center text-yellow-500 shadow-[0_0_30px_-5px_rgba(234,179,8,0.4)]">
          <Table size={32} />
        </div>
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Compara os VIPs</h1>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto">Vê lado a lado todas as vantagens exclusivas e comandos que cada rank te oferece no servidor.</p>
        </div>
      </div>

      <div className="gale-panel border border-white/10 overflow-x-auto rounded-3xl hide-scrollbar bg-black/40 shadow-2xl">
        <div className="min-w-[800px]">
          
          {/* Cabeçalho da Tabela (Produtos) */}
          <div className="flex bg-black/60 sticky top-0 z-20 backdrop-blur-md border-b border-white/10">
            <div className="w-[300px] flex-shrink-0 p-6 flex flex-col justify-end">
              <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Funcionalidades</span>
            </div>
            <div className="flex-1 flex">
              {products.map(p => (
                <div key={p.id} className="flex-1 p-6 flex flex-col items-center text-center justify-between border-l border-white/5 group hover:bg-white/5 transition-colors">
                  <div className="flex flex-col items-center gap-2 mb-6">
                    <h2 className="text-xl font-black text-white group-hover:text-yellow-500 transition-colors drop-shadow-md">{p.name}</h2>
                    <span className="text-sm font-bold text-gray-400">{p.price.toFixed(2)}€</span>
                  </div>
                  <Link href={`/loja/produto/${p.id}`} className="px-6 py-2.5 w-full max-w-[140px] rounded-xl bg-neon-blue text-white text-sm font-bold shadow-[0_0_15px_-5px_rgba(59,130,246,0.5)] hover:bg-neon-blue/80 transition-colors flex items-center justify-center gap-2">
                    Comprar
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Corpo da Tabela (Features) */}
          <div className="flex flex-col">
            {Object.entries(groupedFeatures).map(([groupName, groupFeats]) => (
              <div key={groupName}>
                {/* Linha Divisora do Grupo */}
                <div className="bg-white/5 border-b border-t border-white/10 py-3 px-6 sticky left-0 z-10">
                  <span className="text-xs font-black text-neon-purple uppercase tracking-widest">{groupName}</span>
                </div>

                {groupFeats.map((feat, idx) => (
                  <div key={feat.id} className={`flex border-b border-white/5 ${idx % 2 === 0 ? 'bg-black/20' : ''} hover:bg-white/[0.02] transition-colors`}>
                    <div className="w-[300px] flex-shrink-0 p-4 pl-6 border-r border-white/5 flex flex-col justify-center sticky left-0 bg-black/80 backdrop-blur-sm z-10">
                      <span className="text-sm font-bold text-white">{feat.name}</span>
                      {feat.description && (
                        <span className="text-[10px] text-gray-500 mt-1">{feat.description}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 flex">
                      {products.map(p => {
                        const val = p.vipFeatureValues.find(v => v.featureId === feat.id)
                        const isText = val?.type === 'TEXT'
                        const isTrue = val?.booleanValue === true
                        const textVal = val?.textValue

                        return (
                          <div key={`${p.id}-${feat.id}`} className="flex-1 p-4 border-l border-white/5 flex items-center justify-center text-center">
                            {isText ? (
                              <span className="text-sm font-bold text-gray-300">
                                {textVal || '-'}
                              </span>
                            ) : (
                              isTrue ? (
                                <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shadow-[0_0_10px_-2px_rgba(34,197,94,0.3)]">
                                  <Check size={16} strokeWidth={3} />
                                </div>
                              ) : (
                                <div className="text-gray-600/50">
                                  <X size={16} strokeWidth={3} />
                                </div>
                              )
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Rodapé da Tabela (Botões de Comprar novamente) */}
          <div className="flex bg-black/60 border-t border-white/10 p-6">
             <div className="w-[300px] flex-shrink-0"></div>
             <div className="flex-1 flex">
              {products.map(p => (
                <div key={`footer-${p.id}`} className="flex-1 flex justify-center">
                   <Link href={`/loja/produto/${p.id}`} className="px-6 py-2.5 w-full max-w-[140px] rounded-xl border border-neon-blue/30 text-neon-blue text-sm font-bold hover:bg-neon-blue hover:text-white transition-colors flex items-center justify-center gap-2">
                    Comprar
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
