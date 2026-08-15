import { getChangelogsPublic } from '@/app/actions/admin-changelogs'
import { getModules } from '@/app/actions/settings'
import { GitCommit, Calendar, Sparkles, ShieldAlert } from 'lucide-react'

export const metadata = {
  title: 'Changelog & Atualizações | Infinity Store',
  description: 'Acompanha todas as novidades, melhorias e correções efetuadas no servidor.'
}

const TYPE_CONFIG: Record<string, { label: string; color: string; badge: string }> = {
  NEW: { label: 'Novo', color: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  IMPROVEMENT: { label: 'Melhoria', color: 'text-neon-blue', badge: 'bg-neon-blue/10 text-neon-blue border-neon-blue/20' },
  FIX: { label: 'Correção', color: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  REMOVED: { label: 'Removido', color: 'text-red-400', badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
  UPDATE: { label: 'Atualização', color: 'text-neon-purple', badge: 'bg-neon-purple/10 text-neon-purple border-neon-purple/20' }
}

export default async function ChangelogPage() {
  const modules = await getModules()

  if (!modules.MODULE_CHANGELOG) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <ShieldAlert size={64} className="text-red-500 mb-6" />
        <h1 className="text-4xl font-black text-white uppercase tracking-widest mb-4 text-center">Acesso Restrito</h1>
        <p className="text-gray-400 text-center max-w-lg mb-8">
          O módulo de Notas de Atualização encontra-se desativado no momento.
        </p>
      </div>
    )
  }

  const changelogs = await getChangelogsPublic()

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 py-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-xs font-bold uppercase tracking-widest">
          <Sparkles size={14} />
          Histórico do Servidor
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-wider">
          Notas de Atualização
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
          Fica a par de todos os novos recursos, otimizações de performance e correções de bugs aplicadas no servidor.
        </p>
      </div>

      {/* Timeline Feed */}
      {changelogs.length === 0 ? (
        <div className="gale-panel p-12 text-center text-gray-500 rounded-2xl border border-white/10">
          <GitCommit size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="font-semibold text-lg">Nenhuma atualização registada ainda.</p>
          <p className="text-sm text-gray-500 mt-1">Volta mais tarde para veres as novidades do servidor!</p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-white/10 space-y-10 my-8">
          {changelogs.map((item) => {
            const conf = TYPE_CONFIG[item.type] || TYPE_CONFIG.UPDATE
            return (
              <div key={item.id} className="relative group">
                {/* Node Dot */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-5 h-5 rounded-full bg-[#08080c] border-2 border-neon-purple flex items-center justify-center group-hover:scale-125 group-hover:border-neon-blue transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-purple group-hover:bg-neon-blue transition-colors" />
                </div>

                {/* Card Container */}
                <div className="gale-panel p-6 sm:p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all space-y-4 shadow-xl">
                  {/* Card Top Line */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-white text-base bg-white/5 px-3 py-1 rounded-xl border border-white/10">
                        {item.version}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${conf.badge}`}>
                        {conf.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                      <Calendar size={14} className="text-gray-500" />
                      {new Date(item.createdAt).toLocaleDateString('pt-PT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Title & Body */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                      {item.title}
                    </h2>
                    <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                      {item.content}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
