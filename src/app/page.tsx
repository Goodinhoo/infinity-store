import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'
import { ShoppingBag, Sparkles, BookOpen, ArrowRight, Trophy, Gift } from 'lucide-react'
import { getDonationGoal, getCurrentMonthRevenue, getModules } from '@/app/actions/settings'
import { getGlobalSettings } from '@/app/actions/global-settings'
import ServerIPCard from '@/components/ServerIPCard'
import { getTopDonators, getLeaderboardPrizes } from '@/app/actions/leaderboards'
import Image from 'next/image'
import HeroSlider from '@/components/HeroSlider'
import { getActiveSlidersFrontend } from '@/app/actions/admin-sliders'

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: { 
      isFeatured: true,
      isHidden: false,
      category: { isHidden: false }
    },
    include: { category: true },
    take: 8
  })

  const latestPosts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3
  })

  const { amount: goalAmount, message: goalMessage } = await getDonationGoal()
  const currentRevenue = await getCurrentMonthRevenue()
  const progressPercentage = Math.min(100, Math.round((currentRevenue / goalAmount) * 100))
  const settings = await getGlobalSettings()

  const modules = await getModules()
  const isLeaderboardActive = modules.MODULE_LEADERBOARDS
  const isGoalActive = modules.MODULE_DONATION_GOAL !== false
  const isLatestPurchasesActive = modules.MODULE_LATEST_PURCHASES !== false
  const isSlidersActive = modules.MODULE_SLIDERS !== false

  const activeSliders = isSlidersActive ? await getActiveSlidersFrontend() : []
  
  let topDonators: { rank: number; player: string; total: number }[] = []
  let leaderboardPrizes: { top1: string; top2: string; top3: string } | null = null
  let prizeProducts: { id: number; name: string }[] = []
  
  if (isLeaderboardActive) {
    const now = new Date()
    topDonators = await getTopDonators(now.getMonth(), now.getFullYear(), 5) // Top 5
    leaderboardPrizes = await getLeaderboardPrizes()
    
    // Fetch products for prizes
    const prizeIds = [leaderboardPrizes.top1, leaderboardPrizes.top2, leaderboardPrizes.top3]
      .filter(id => id !== '')
      .map(id => Number(id))
      
    if (prizeIds.length > 0) {
      prizeProducts = await prisma.product.findMany({
        where: { id: { in: prizeIds } }
      })
    }
  }

  // Últimas compras - 4 jogadores únicos recentes
  const recentOrdersRaw = await prisma.order.findMany({
    where: { status: 'PAID' },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      items: {
        include: { product: true }
      }
    }
  })

  const seenPlayers = new Set<string>()
  const latestOrders: { id: number; player: string; items: { product: { name: string } }[] }[] = []
  
  for (const order of recentOrdersRaw) {
    if (!seenPlayers.has(order.player)) {
      seenPlayers.add(order.player)
      latestOrders.push(order)
      if (latestOrders.length >= 4) break
    }
  }

  const getPrizeForRank = (rank: number) => {
    if (!leaderboardPrizes) return null
    const prizeId = rank === 1 ? leaderboardPrizes.top1 : rank === 2 ? leaderboardPrizes.top2 : rank === 3 ? leaderboardPrizes.top3 : null
    if (!prizeId) return null
    return prizeProducts.find(p => p.id === Number(prizeId))
  }

  return (
    <div className="flex flex-col gap-12 w-full max-w-[2000px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      
      {/* Hero Section (Sliders or Static Hero) */}
      {isSlidersActive && activeSliders.length > 0 ? (
        <HeroSlider sliders={activeSliders} discordUrl={settings.DISCORD_URL} />
      ) : (
        <section className="relative w-full h-[400px] sm:h-[550px] rounded-3xl overflow-hidden shadow-2xl flex items-center justify-between px-8 sm:px-16 border border-white/10 group">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 z-10 mix-blend-overlay" />
          
          <Image
            src={settings.STORE_BANNER_URL}
            alt="Server Background"
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out"
            priority
          />

          <div className="relative z-20 flex flex-col gap-4 max-w-2xl animate-fade-in">
            <div className="mb-6 sm:mb-20 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md w-fit animate-float">
              <Sparkles size={16} className="text-neon-blue" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">Temporada 1 JÁ COMEÇOU</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Bem-vindo à <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue drop-shadow-[0_0_15px_rgba(188,19,254,0.4)]">{settings.STORE_NAME}</span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed opacity-90 drop-shadow-md">
              {settings.STORE_BANNER_DESC}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/loja"
                className="px-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-neon-purple to-neon-blue text-white hover:scale-105 transition-all flex items-center gap-2 animate-glow-pulse"
              >
                <ShoppingBag size={18} />
                Explorar a Loja
              </Link>
              <a
                href={settings.DISCORD_URL.startsWith('http') ? settings.DISCORD_URL : `https://${settings.DISCORD_URL}`}
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 hover:scale-105 transition-all flex items-center gap-2"
              >
                Comunidade Discord
              </a>
            </div>
          </div>

          {/* Server IP Card */}
          <ServerIPCard ip={settings.SERVER_IP} versions={settings.SERVER_VERSIONS} />
        </section>
      )}

      {/* Sessão Dupla: Conteúdo Principal + Sidebar */}
      <section className="flex flex-col lg:flex-row gap-6">
          
        {/* Coluna Esquerda: Conteúdo Principal */}
        <div className={`flex flex-col gap-12 ${(isLeaderboardActive || isLatestPurchasesActive) ? 'lg:w-3/4' : 'w-full'}`}>
          
          {/* Meta Mensal de Doações */}
          {isGoalActive && (
            <div className="relative rounded-3xl overflow-hidden gale-panel p-6 sm:p-8 border border-white/10 bg-[#0d0d14] flex flex-col justify-center gap-5 shadow-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center text-neon-purple border border-neon-purple/30 shadow-[0_0_15px_rgba(188,19,254,0.3)]">
                      <Trophy size={20} />
                    </div>
                      Meta Mensal
                  </h2>
                  <p className="text-sm text-gray-400 mt-2 font-medium">{goalMessage}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
                    {currentRevenue.toFixed(2)}€
                  </span>
                  <span className="text-sm text-gray-500 font-bold ml-2">
                    / {goalAmount.toFixed(2)}€
                  </span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="relative h-6 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                {/* Progress Bar Fill */}
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(168,85,247,0.6)] min-w-[2%]"
                  style={{ width: `${Math.max(2, progressPercentage)}%` }}
                >
                  {/* Brilho interior para dar mais volume */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
                </div>
              </div>
              
              <p className="text-xs font-black tracking-widest uppercase text-gray-500 text-right">{progressPercentage}% Atingido</p>
            </div>
          )}

          {/* Produtos em Destaque */}
          <section className="flex flex-col gap-6 relative">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Produtos em Destaque</h2>
                <p className="text-xs sm:text-sm text-neon-purple/80 mt-1 font-bold">OS ITENS MAIS PROCURADOS PELOS NOSSOS JOGADORES</p>
              </div>
            </div>

            {featuredProducts.length === 0 ? (
              <div className="gale-panel p-12 text-center text-gray-400">
                <Trophy size={48} className="mx-auto mb-3 opacity-30 text-neon-purple animate-float" />
                <p className="font-bold">Nenhum produto em destaque de momento.</p>
              </div>
            ) : (
              <div className="flex gap-6 overflow-x-auto pt-4 pb-6 px-4 -mx-4 snap-x snap-mandatory hide-scrollbar">
                {featuredProducts.map((product) => (
                  <div key={product.id} className="min-w-[280px] sm:min-w-[320px] snap-center">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Últimas Notícias do Blog */}
          {latestPosts.length > 0 && (
            <section className="flex flex-col gap-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">Últimas Notícias</h2>
                  <p className="text-xs text-gray-400 mt-1">Fica a par de todas as atualizações do servidor</p>
                </div>
                <Link href="/blog" className="text-xs font-bold text-neon-blue hover:text-neon-purple transition-colors flex items-center gap-1">
                  Ver Notícias <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {latestPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="gale-panel p-6 hover:border-white/20 transition-all flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <BookOpen size={14} className="text-neon-purple" />
                        <span>{new Date(post.createdAt).toLocaleDateString('pt-PT')}</span>
                      </div>
                      <h3 className="font-bold text-base text-white hover:text-neon-blue transition-colors">{post.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-3">{post.content}</p>
                    </div>
                    <span className="text-xs font-bold text-neon-blue flex items-center gap-1">
                      Ler artigo <ArrowRight size={12} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Coluna Direita: Heróis do Mês + Últimas Compras */}
        {(isLeaderboardActive || isLatestPurchasesActive) && (
          <div className={`flex flex-col gap-6 lg:w-1/4 ${!isGoalActive ? 'ml-auto' : ''}`}>
            
            {/* Heróis do Mês (Leaderboard) */}
            {isLeaderboardActive && (
              <div className="relative rounded-3xl overflow-hidden gale-panel p-6 border border-white/10 bg-[#0d0d14] flex flex-col gap-4 shadow-2xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500 border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-white uppercase">Heróis do Mês</h2>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Top Doadores</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-[220px] hide-scrollbar">
                  {topDonators.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      Ainda não há doadores este mês. Sê o primeiro!
                    </div>
                  ) : (
                    topDonators.map((donator) => {
                      const prize = getPrizeForRank(donator.rank)
                      const isTop3 = donator.rank <= 3
                      
                      return (
                        <div key={donator.rank} className={`flex items-center justify-between p-3 rounded-xl border ${donator.rank === 1 ? 'bg-yellow-500/10 border-yellow-500/30' : donator.rank === 2 ? 'bg-gray-400/10 border-gray-400/30' : donator.rank === 3 ? 'bg-amber-700/10 border-amber-700/30' : 'bg-white/5 border-transparent'} transition-colors`}>
                          <div className="flex items-center gap-3">
                            <div className={`font-black text-lg w-6 text-center ${donator.rank === 1 ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]' : donator.rank === 2 ? 'text-gray-400' : donator.rank === 3 ? 'text-amber-700' : 'text-gray-600'}`}>
                              #{donator.rank}
                            </div>
                            <div className="flex items-center gap-2">
                              <Image src={`https://minotar.net/helm/${donator.player}/32.png`} alt={donator.player} width={32} height={32} className="w-8 h-8 rounded-md" />
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-white leading-none">{donator.player}</span>
                                {isTop3 && prize && (
                                  <span className="text-[10px] text-neon-purple mt-1 flex items-center gap-1 font-semibold">
                                    <Gift size={10} /> {prize.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
                            {donator.total.toFixed(2)}€
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {/* Feed Últimas Compras */}
            {isLatestPurchasesActive && (
              <div className="relative rounded-3xl overflow-hidden gale-panel p-6 border border-white/10 bg-[#0d0d14] flex flex-col gap-4 shadow-2xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-neon-blue/20 flex items-center justify-center text-neon-blue border border-neon-blue/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-white uppercase">Últimas Compras</h2>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Feed Recente</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-[220px] hide-scrollbar">
                  {latestOrders.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      Nenhuma compra recente.
                    </div>
                  ) : (
                    latestOrders.map(order => (
                      <div key={order.id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3 hover:border-neon-blue/30 transition-colors">
                        <Image src={`https://minotar.net/helm/${order.player}/32.png`} alt={order.player} width={32} height={32} className="rounded-lg shadow-md min-w-[32px]" />
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-bold text-white text-sm truncate">{order.player}</span>
                          <span className="text-[10px] text-neon-blue font-medium uppercase tracking-wider truncate">
                            {order.items.length > 0 ? order.items[0].product.name : 'Vários itens'}
                            {order.items.length > 1 && ` +${order.items.length - 1}`}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

    </div>
  )
}
