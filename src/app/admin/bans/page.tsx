import { prisma } from '@/lib/prisma'
import BansManager from './BansManager'

export const metadata = {
  title: 'Punições - Admin Infinity Nexus',
}

export default async function AdminBansPage() {
  const punishments = await prisma.punishment.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold text-white">Gestão de Punições</h1>
        <p className="text-gray-400 text-sm mt-1">Regista e remove punições dos jogadores</p>
      </div>

      <BansManager punishments={punishments} />
    </div>
  )
}
