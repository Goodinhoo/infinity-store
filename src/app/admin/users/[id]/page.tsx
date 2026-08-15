import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User as UserIcon, ShoppingCart } from 'lucide-react'
import { UserForms } from './UserForms'

export const metadata = {
  title: 'Gerir Utilizador - Admin Infinity Nexus',
}

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const userId = parseInt(resolvedParams.id)
  if (isNaN(userId)) redirect('/admin/users')

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) redirect('/admin/users')

  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' }
  })

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { userId: userId },
        ...(user.username ? [{ player: user.username }] : [])
      ]
    },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      <div className="border-b border-white/10 pb-4">
        <Link href="/admin/users" className="text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 w-fit mb-4">
          <ArrowLeft size={14} /> Voltar à lista
        </Link>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <UserIcon className="text-neon-blue" size={28} />
          Gerir: <span className="text-transparent bg-clip-text neon-bg-degrade">{user.name || user.username || 'Utilizador'}</span>
        </h1>
        <div className="flex gap-4 text-xs font-bold text-gray-400 mt-2">
          <span>Email: <span className="text-gray-300">{user.email || 'N/A'}</span></span>
          <span>•</span>
          <span>Nick: <span className="text-gray-300">{user.username || 'N/A'}</span></span>
          <span>•</span>
          <span>ID: <span className="text-neon-blue">#{user.id}</span></span>
        </div>
      </div>

      <UserForms user={user} products={products} />

      <div className="gale-panel p-5 border border-white/10 mt-2">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
          <ShoppingCart size={16} className="text-neon-blue" /> Histórico de Compras
        </h3>
        
        {orders.length === 0 ? (
          <p className="text-gray-400 text-sm py-4">Este jogador ainda não fez nenhuma compra.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map(order => (
              <div key={order.id} className="bg-black/50 border border-white/5 rounded-lg p-4 flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">
                    {new Date(order.createdAt).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                  </p>
                  <p className="text-sm text-gray-300">
                    <span className="font-bold text-white">ID da Encomenda:</span> #{order.id}
                  </p>
                  <div className="mt-2 text-sm text-gray-400">
                    {order.items.map((item, idx) => (
                      <div key={idx}>• {item.quantity}x {item.product.name}</div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    order.status === 'PAID' ? 'bg-green-500/20 text-green-400' :
                    order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {order.status === 'PAID' ? 'PAGO' : order.status === 'PENDING' ? 'PENDENTE' : 'CANCELADO'}
                  </div>
                  <div className="text-lg font-black text-white mt-2">{order.total.toFixed(2)}€</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
