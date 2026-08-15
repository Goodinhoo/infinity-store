import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ClipboardList } from 'lucide-react'
import OrderActions from './OrderActions'

export const metadata = {
  title: 'Encomendas - Admin Infinity Nexus',
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      items: { include: { product: true } },
      user: true
    },
    orderBy: { createdAt: 'desc' }
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-green-500/10 text-green-400 border border-green-500/20">Paga</span>
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-red-500/10 text-red-400 border border-red-500/20">Cancelada</span>
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">Pendente</span>
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="border-b border-white/10 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestão de Encomendas</h1>
          <p className="text-gray-400 text-sm mt-1">Visualiza e altera o estado das compras</p>
        </div>
        <div className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-neon-blue">
          Total: {orders.length} encom.
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="gale-panel p-12 text-center text-gray-400 border border-white/10">
          <ClipboardList size={48} className="mx-auto mb-3 opacity-20" />
          <p className="font-bold">Sem encomendas registadas.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="gale-panel p-5 border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-black text-neon-blue">#{order.id}</span>
                  <span className="font-bold text-white bg-white/5 px-3 py-1 rounded-lg border border-white/10 text-sm">🎮 {order.player}</span>
                  {order.user && (
                    <span className="text-xs text-gray-400 bg-black/30 px-2.5 py-1 rounded-md border border-white/5">
                      Conta: {order.user.name || order.user.username || order.user.email}
                    </span>
                  )}
                  {getStatusBadge(order.status)}
                  <span className="text-xs text-gray-500 ml-auto md:ml-0">
                    {new Date(order.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-gray-300 bg-black/30 p-2.5 rounded-xl border border-white/5">
                  {order.items.map((item) => (
                    <span key={item.id} className="bg-white/5 px-2.5 py-1 rounded-lg">
                      <span className="font-bold text-neon-blue">{item.quantity}x</span> {item.product.name}
                      <span className="text-gray-400 ml-1">({(item.price * item.quantity).toFixed(2)}€)</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                <div>
                  <span className="text-xs text-gray-400 block">Total</span>
                  <span className="text-xl font-black text-neon-pink">{order.total.toFixed(2)}€</span>
                </div>
                <OrderActions orderId={order.id} currentStatus={order.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
