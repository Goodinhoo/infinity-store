import { getStaffMembersPublic } from '@/app/actions/admin-staff'
import { getModules } from '@/app/actions/settings'
import { ShieldCheck, MessageSquare, Crown, ShieldAlert } from 'lucide-react'
import Image from 'next/image'

export const metadata = {
  title: 'Equipa & Staff | Infinity Store',
  description: 'Conhece os membros da equipa responsáveis por manter a comunidade e os servidores seguros e divertidos.'
}

export default async function StaffPage() {
  const modules = await getModules()

  if (!modules.MODULE_STAFF) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <ShieldAlert size={64} className="text-red-500 mb-6" />
        <h1 className="text-4xl font-black text-white uppercase tracking-widest mb-4 text-center">Acesso Restrito</h1>
        <p className="text-gray-400 text-center max-w-lg mb-8">
          A página da Equipa/Staff encontra-se desativada no momento.
        </p>
      </div>
    )
  }

  const members = await getStaffMembersPublic()

  // Group members by roleGroup
  const groupedMembers = members.reduce((acc, member) => {
    const group = member.roleGroup || 'Equipa Geral'
    if (!acc[group]) acc[group] = []
    acc[group].push(member)
    return acc
  }, {} as Record<string, typeof members>)

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 py-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-xs font-bold uppercase tracking-widest">
          <Crown size={14} />
          Conhece a Nossa Equipa
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-wider">
          Equipa do Servidor
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
          Estes são os elementos dedicados a garantir a melhor experiência de jogo, suporte e desenvolvimento no nosso servidor.
        </p>
      </div>

      {/* Staff Groups */}
      {Object.keys(groupedMembers).length === 0 ? (
        <div className="gale-panel p-12 text-center text-gray-500 rounded-2xl border border-white/10">
          <ShieldCheck size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="font-semibold text-lg">Nenhum membro da equipa registado ainda.</p>
        </div>
      ) : (
        Object.entries(groupedMembers).map(([groupName, groupMembers]) => (
          <div key={groupName} className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-neon-purple shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                {groupName}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {groupMembers.map((m) => (
                <div
                  key={m.id}
                  className="gale-panel p-6 rounded-2xl border border-white/10 hover:border-neon-purple/40 transition-all flex flex-col items-center text-center space-y-4 group relative overflow-hidden shadow-xl"
                >
                  {/* Subtle Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Minecraft Avatar Head */}
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-black/60 border-2 border-white/10 group-hover:border-neon-purple group-hover:scale-105 transition-all shadow-xl">
                    <Image
                      src={`https://minotar.net/helm/${m.username}/150.png`}
                      alt={m.username}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-1 z-10">
                    <h3 className="text-lg font-black text-white group-hover:text-neon-purple transition-colors">
                      {m.username}
                    </h3>
                    {m.customTitle && (
                      <p className="text-xs font-semibold text-neon-blue uppercase tracking-wider">
                        {m.customTitle}
                      </p>
                    )}
                  </div>

                  {/* Discord Tag if exists */}
                  {m.discord && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/50 border border-white/10 rounded-full text-xs text-gray-400 font-mono z-10">
                      <MessageSquare size={12} className="text-indigo-400" />
                      <span>{m.discord}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
