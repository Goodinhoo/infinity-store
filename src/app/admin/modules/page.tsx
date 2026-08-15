'use client'

import { useState, useEffect } from 'react'
import { getModules, toggleModule, ModuleKey } from '@/app/actions/settings'
import { CircleDot, Lightbulb, Banknote, Trophy, Users, ToggleLeft, ToggleRight, Blocks, Target, ShoppingBag, DownloadCloud, Gift, Table, MousePointerClick } from 'lucide-react'
import { Toast } from '@/lib/toast'
import Link from 'next/link'

export default function AdminModules() {
  const [modules, setModules] = useState<Record<ModuleKey, boolean>>({
    MODULE_FORTUNE_WHEEL: true,
    MODULE_SUGGESTIONS: false,
    MODULE_CASHBACK: false,
    MODULE_LEADERBOARDS: false,
    MODULE_CREATORS: false,
    MODULE_DONATION_GOAL: true,
    MODULE_LATEST_PURCHASES: true,
    MODULE_DOWNLOADS: true,
    MODULE_GIFTCARDS: true,
    MODULE_VIPTABLE: true,
    MODULE_VOTES: true,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const modulesRes = await getModules()
      setModules(modulesRes)
      setLoading(false)
    }
    load()
  }, [])

  const handleToggleModule = async (e: React.MouseEvent, key: ModuleKey) => {
    e.preventDefault()
    e.stopPropagation()
    const newVal = !modules[key]
    setModules({ ...modules, [key]: newVal })
    await toggleModule(key, newVal)
    Toast.fire({
      icon: 'success',
      title: 'Módulo ' + (newVal ? 'ativado' : 'desativado') + '!'
    })
  }

  if (loading) return <div className="p-8 text-center text-gray-400">A carregar...</div>

  return (
    <div className="p-8 w-full space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black uppercase text-white mb-1">Central de Módulos</h1>
        <p className="text-gray-400 text-sm">Gere as funcionalidades extra da loja, como numa App Store.</p>
      </div>

      <div className="gale-panel p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-neon-purple/20 flex items-center justify-center text-neon-purple">
            <Blocks size={16} />
          </div>
          <h2 className="font-bold text-white uppercase tracking-wider text-sm">Módulos da Loja</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          
          <Link href="/admin/roleta" className="block bg-[#050508] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-neon-purple/50 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-white/10 flex items-center justify-center text-neon-purple">
                  <CircleDot size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-neon-purple transition-colors">Roleta da Sorte</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Fortune Wheel</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-6">Permite aos jogadores gastar créditos para girar a roleta e ganhar prémios.</p>
            <button 
              onClick={(e) => handleToggleModule(e, 'MODULE_FORTUNE_WHEEL')}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${modules.MODULE_FORTUNE_WHEEL ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/20' : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'}`}
            >
              {modules.MODULE_FORTUNE_WHEEL ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {modules.MODULE_FORTUNE_WHEEL ? 'Ativado' : 'Desativado'}
            </button>
          </Link>

          <Link href="/admin/modules/suggestions" className="block bg-[#050508] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-neon-purple/50 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-white/10 flex items-center justify-center text-white">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-white transition-colors">Sugestões</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Comunidade</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-6">Módulo para jogadores darem ideias com sistema de Upvotes/Downvotes.</p>
            <button 
              onClick={(e) => handleToggleModule(e, 'MODULE_SUGGESTIONS')}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${modules.MODULE_SUGGESTIONS ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/20' : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'}`}
            >
              {modules.MODULE_SUGGESTIONS ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {modules.MODULE_SUGGESTIONS ? 'Ativado' : 'Desativado'}
            </button>
          </Link>

          {/* META MENSAL */}
          <Link href="/admin/settings" className="block bg-[#050508] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-neon-purple/50 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-white/10 flex items-center justify-center text-white">
                  <Target size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-white transition-colors">Meta Mensal</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Doações</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-6">Barra de progresso de doações na página inicial.</p>
            <button 
              onClick={(e) => handleToggleModule(e, 'MODULE_DONATION_GOAL')}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${modules.MODULE_DONATION_GOAL ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/20' : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'}`}
            >
              {modules.MODULE_DONATION_GOAL ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {modules.MODULE_DONATION_GOAL ? 'Ativado' : 'Desativado'}
            </button>
          </Link>

          {/* ÚLTIMAS COMPRAS */}
          <div className="block bg-[#050508] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-neon-purple/50 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-white/10 flex items-center justify-center text-neon-blue">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-neon-blue transition-colors">Últimas Compras</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Feed</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-6">Mostra as 4 compras mais recentes em tempo real num widget elegante.</p>
            <button 
              onClick={(e) => handleToggleModule(e, 'MODULE_LATEST_PURCHASES')}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${modules.MODULE_LATEST_PURCHASES ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/20' : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'}`}
            >
              {modules.MODULE_LATEST_PURCHASES ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {modules.MODULE_LATEST_PURCHASES ? 'Ativado' : 'Desativado'}
            </button>
          </div>

          <Link href="/admin/modules/cashback" className="block bg-[#050508] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-green-400/50 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-white/10 flex items-center justify-center text-green-400">
                  <Banknote size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">Cashback</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Fidelidade</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-6">Devolve uma percentagem das compras em saldo na carteira (Store Credits).</p>
            <button 
              onClick={(e) => handleToggleModule(e, 'MODULE_CASHBACK')}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${modules.MODULE_CASHBACK ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/20' : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'}`}
            >
              {modules.MODULE_CASHBACK ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {modules.MODULE_CASHBACK ? 'Ativado' : 'Desativado'}
            </button>
          </Link>

          <Link href="/admin/modules/leaderboards" className="block bg-[#050508] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-yellow-500/50 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-white/10 flex items-center justify-center text-yellow-500">
                  <Trophy size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-yellow-500 transition-colors">Heróis do Mês</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Leaderboards</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-6">Lista dos top doadores/compradores com atribuição automática de prémios.</p>
            <button 
              onClick={(e) => handleToggleModule(e, 'MODULE_LEADERBOARDS')}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${modules.MODULE_LEADERBOARDS ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/20' : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'}`}
            >
              {modules.MODULE_LEADERBOARDS ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {modules.MODULE_LEADERBOARDS ? 'Ativado' : 'Desativado'}
            </button>
          </Link>

          <Link href="/admin/modules/creators" className="block bg-[#050508] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-neon-pink/50 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-white/10 flex items-center justify-center text-neon-pink">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-neon-pink transition-colors">Criadores</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Afiliados</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-6">Códigos de criadores que dão descontos e geram comissões aos Youtubers.</p>
            <button 
              onClick={(e) => handleToggleModule(e, 'MODULE_CREATORS')}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${modules.MODULE_CREATORS ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/20' : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'}`}
            >
              {modules.MODULE_CREATORS ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {modules.MODULE_CREATORS ? 'Ativado' : 'Desativado'}
            </button>
          </Link>

          <Link href="/admin/downloads" className="block bg-[#050508] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-400/50 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-white/10 flex items-center justify-center text-cyan-400">
                  <DownloadCloud size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Downloads</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Comunidade</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-6">Página de downloads oficiais para mods, texturas e launchers do servidor.</p>
            <button 
              onClick={(e) => handleToggleModule(e, 'MODULE_DOWNLOADS')}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${modules.MODULE_DOWNLOADS ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/20' : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'}`}
            >
              {modules.MODULE_DOWNLOADS ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {modules.MODULE_DOWNLOADS ? 'Ativado' : 'Desativado'}
            </button>
          </Link>

          <Link href="/admin/store/giftcards" className="block bg-[#050508] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-neon-pink/50 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 border border-white/10 flex items-center justify-center text-neon-pink">
                  <Gift size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-neon-pink transition-colors">Cartões Presente</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Loja</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-6">Permitir que os utilizadores resgatem códigos de presente no perfil.</p>
            <button 
              onClick={(e) => handleToggleModule(e, 'MODULE_GIFTCARDS')}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${modules.MODULE_GIFTCARDS ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/20' : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'}`}
            >
              {modules.MODULE_GIFTCARDS ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {modules.MODULE_GIFTCARDS ? 'Ativado' : 'Desativado'}
            </button>
          </Link>

          <Link href="/admin/vips" className="block bg-[#050508] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-yellow-500/50 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-white/10 flex items-center justify-center text-yellow-500">
                  <Table size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-yellow-500 transition-colors">Tabela VIP</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Loja</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-6">Página de comparação pública mostrando as vantagens de cada Rank/VIP.</p>
            <button 
              onClick={(e) => handleToggleModule(e, 'MODULE_VIPTABLE')}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${modules.MODULE_VIPTABLE ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/20' : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'}`}
            >
              {modules.MODULE_VIPTABLE ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {modules.MODULE_VIPTABLE ? 'Ativado' : 'Desativado'}
            </button>
          </Link>

          <Link href="/admin/votes" className="block bg-[#050508] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/50 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-white/10 flex items-center justify-center text-emerald-500">
                  <MousePointerClick size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-500 transition-colors">Votos</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Comunidade</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-6">Gere os sites de votação e direciona os jogadores para te darem visibilidade.</p>
            <button 
              onClick={(e) => handleToggleModule(e, 'MODULE_VOTES')}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${modules.MODULE_VOTES ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/20' : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'}`}
            >
              {modules.MODULE_VOTES ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {modules.MODULE_VOTES ? 'Ativado' : 'Desativado'}
            </button>
          </Link>

        </div>
      </div>
    </div>
  )
}
