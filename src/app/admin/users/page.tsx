import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Utilizadores - Admin Infinity Nexus',
}

import Link from 'next/link'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-500/10 text-red-400 border-red-500/20',
    MODERATOR: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    USER: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold text-white">Gestão de Utilizadores</h1>
        <p className="text-gray-400 text-sm mt-1">{users.length} contas registadas na plataforma</p>
      </div>

      <div className="gale-panel overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-black/50 text-xs uppercase text-gray-400 border-b border-white/10">
              <tr>
                <th className="px-5 py-4 font-bold">Utilizador</th>
                <th className="px-5 py-4 font-bold">Email</th>
                <th className="px-5 py-4 font-bold">Cargo</th>
                <th className="px-5 py-4 font-bold">Saldo</th>
                <th className="px-5 py-4 font-bold">Registado em</th>
                <th className="px-5 py-4 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-[10px] font-black text-neon-purple">
                        {(user.name || user.username || '?')[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-white">{user.name || user.username || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">{user.email || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${roleColors[user.role] || roleColors.USER}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs font-bold text-green-400">{user.balance.toFixed(2)} Coins</td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('pt-PT')}
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/users/${user.id}`} className="px-3 py-1.5 bg-neon-blue/10 text-neon-blue hover:bg-neon-blue hover:text-white border border-neon-blue/20 rounded-lg text-xs font-bold transition-all inline-block">
                      Gerir Conta
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
