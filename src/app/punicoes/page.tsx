import { prisma } from '@/lib/prisma'
import { ShieldAlert, ShieldX, Clock, Layers } from 'lucide-react'

export const metadata = {
  title: 'Punições & Bans - Infinity Nexus',
  description: 'Lista pública de punições aplicadas no servidor.',
}

export default async function PunishmentsPage() {
  const punishments = await prisma.punishment.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'BAN':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-red-500/10 text-red-400 border border-red-500/20">BAN</span>
      case 'MUTE':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">MUTE</span>
      case 'WARN':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">AVISO</span>
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">{type}</span>
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in my-6">
      <header className="gale-panel p-8 border border-white/10 bg-gradient-to-r from-[#0d0d18] via-[#150a25] to-[#08080c]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Lista de Punições</h1>
            <p className="text-sm text-gray-400">Registo transparente de penalizações aplicadas aos jogadores</p>
          </div>
        </div>
      </header>

      {punishments.length === 0 ? (
        <div className="gale-panel p-16 text-center text-gray-400">
          <ShieldX size={48} className="mx-auto mb-3 opacity-20 text-red-400" />
          <p className="font-bold">Nenhuma punição registada de momento.</p>
          <p className="text-xs text-gray-500 mt-1">O servidor encontra-se limpo de infrações recentes.</p>
        </div>
      ) : (
        <div className="gale-panel overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-black/50 text-xs uppercase text-gray-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-bold">Tipo</th>
                  <th className="px-6 py-4 font-bold">Jogador</th>
                  <th className="px-6 py-4 font-bold">Motivo</th>
                  <th className="px-6 py-4 font-bold">Aplicado por</th>
                  <th className="px-6 py-4 font-bold">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {punishments.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">{getTypeBadge(item.type)}</td>
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-black/40 border border-white/10 flex items-center justify-center text-[9px]">
                        🎮
                      </div>
                      {item.player}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">{item.reason}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-neon-purple">{item.operator}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
