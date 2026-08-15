import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, PackageOpen, History, Gift } from 'lucide-react'
import ChestItemCard from '@/components/ChestItemCard'

export const metadata = {
  title: 'O Meu Baú - Infinity Nexus',
}

export default async function ChestPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  const userId = Number(session.user.id)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, name: true }
  })
  const currentUsername = user?.username || user?.name || ''

  const chestItems = await prisma.chestItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  const pendingItems = chestItems.filter(item => item.status === 'PENDING')
  const redeemedItems = chestItems.filter(item => item.status === 'REDEEMED')

  return (
    <div className="max-w-7xl 2xl:max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in flex flex-col gap-6">
      
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <Link href="/profile" className="text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 w-fit mb-3">
            <ArrowLeft size={14} /> Voltar ao Perfil
          </Link>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <PackageOpen className="text-neon-pink" size={32} /> O Meu Baú
          </h1>
          <p className="text-sm text-gray-400 mt-1">Aqui ficam guardados todos os teus prémios e compras.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Itens Pendentes (Para Resgatar) */}
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
            <Gift className="text-neon-blue" />
            Itens Disponíveis
            <span className="text-xs font-normal text-gray-400 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10 ml-2">
              {pendingItems.length}
            </span>
          </h2>

          {pendingItems.length === 0 ? (
            <div className="gale-panel p-12 text-center border border-white/10 text-gray-400">
              <PackageOpen size={48} className="mx-auto mb-4 opacity-20 text-neon-blue" />
              <p className="font-bold">O teu baú está vazio.</p>
              <p className="text-xs mt-2">Visita a loja ou roda a roleta para ganhares prémios!</p>
              <div className="flex gap-3 justify-center mt-6">
                <Link href="/loja" className="px-4 py-2 bg-neon-purple/20 text-neon-purple text-xs font-bold rounded-lg hover:bg-neon-purple hover:text-white transition-colors">
                  Ir para a Loja
                </Link>
                <Link href="/roleta" className="px-4 py-2 bg-neon-blue/20 text-neon-blue text-xs font-bold rounded-lg hover:bg-neon-blue hover:text-white transition-colors">
                  Rodar a Roleta
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingItems.map(item => (
                <ChestItemCard key={item.id} item={item} currentUsername={currentUsername} />
              ))}
            </div>
          )}
        </div>

        {/* Histórico de Resgates */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2 border-b border-white/10 pb-3">
            <History size={18} className="text-gray-400" />
            Histórico
          </h2>

          {redeemedItems.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-8">Ainda não resgataste nenhum item.</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {redeemedItems.map(item => (
                <div key={item.id} className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-gray-300">{item.name}</span>
                    <span className="text-[9px] text-gray-500">
                      {item.redeemedAt ? new Date(item.redeemedAt).toLocaleDateString('pt-PT') : ''}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 flex flex-wrap gap-1">
                    <span>Resgatado para:</span>
                    <span className="font-bold text-neon-blue">{item.redeemedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
