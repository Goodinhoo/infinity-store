import { getModules } from '@/app/actions/settings'
import { getVoteSitesPublic } from '@/app/actions/votes'
import { MousePointerClick, ExternalLink, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Votar | Infinity Store'
}

export default async function VotosPage() {
  const modules = await getModules()

  if (!modules.MODULE_VOTES) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <ShieldAlert size={64} className="text-red-500 mb-6" />
        <h1 className="text-4xl font-black text-white uppercase tracking-widest mb-4 text-center">Acesso Restrito</h1>
        <p className="text-gray-400 text-center max-w-lg mb-8">
          O módulo de Votos encontra-se desativado no momento.
        </p>
        <Link href="/" className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all">
          Voltar à Loja
        </Link>
      </div>
    )
  }

  const sites = await getVoteSitesPublic()

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in min-h-[80vh]">
      <div className="flex flex-col items-center text-center mb-16 mt-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <MousePointerClick size={32} />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest mb-4 drop-shadow-lg">
          Vota e <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Ganha</span>
        </h1>
        <p className="text-gray-400 max-w-2xl text-lg">
          Ajuda o servidor a crescer votando nos links abaixo e recebe recompensas exclusivas diretamente na tua conta!
        </p>
      </div>

      {sites.length === 0 ? (
        <div className="gale-panel p-16 text-center border border-white/10 flex flex-col items-center">
          <MousePointerClick size={48} className="text-white/10 mb-4" />
          <p className="text-xl font-bold text-gray-500">Nenhum site de votos disponível de momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site, idx) => (
            <div key={site.id} className="gale-panel p-6 border border-white/10 flex flex-col gap-5 hover:border-emerald-500/30 transition-colors group relative overflow-hidden">
              
              {/* Efeito de hover no background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Imagem do site */}
              <div className="h-32 w-full bg-black/40 rounded-xl flex items-center justify-center overflow-hidden border border-white/5 relative z-10">
                {site.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={site.imageUrl} alt={site.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500" />
                ) : (
                  <MousePointerClick className="text-white/10" size={48} />
                )}
                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-xs font-black text-white">
                  #{idx + 1}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 relative z-10 flex flex-col">
                <h3 className="font-bold text-white text-xl mb-1">{site.name}</h3>
                
                {site.reward ? (
                  <div className="mt-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
                    <p className="text-[10px] text-emerald-500/70 font-black uppercase tracking-widest mb-1">Recompensa</p>
                    <p className="text-sm text-emerald-400 font-bold">{site.reward}</p>
                  </div>
                ) : (
                  <div className="mt-2 text-gray-500 text-sm">Nenhuma recompensa especificada.</div>
                )}
              </div>

              {/* Botão */}
              <a 
                href={site.url} 
                target="_blank" 
                rel="noreferrer" 
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm flex justify-center items-center gap-2 hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 relative z-10"
              >
                Votar Agora <ExternalLink size={16} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
