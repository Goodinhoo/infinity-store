import { auth } from "@/../auth"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { logoutAction } from "@/app/actions/user-auth"
import { prisma } from "@/lib/prisma"
import { ShoppingBag, Shield, PackageOpen, Wallet, ShieldCheck } from "lucide-react"
import { AddBalanceForm } from "@/components/AddBalanceForm"
import { RedeemGiftCardForm } from "@/components/RedeemGiftCardForm"
import { getModules } from "@/app/actions/settings"

export const metadata = {
  title: 'Meu Perfil - Infinity Nexus',
  description: 'Gere a tua conta na Infinity Nexus',
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  type SessionUser = {
    id?: number
    name?: string | null
    email?: string | null
    image?: string | null
    username?: string | null
    role?: string
    balance?: number
  }

  const sessionUser = session.user as SessionUser
  const sessionUserId = sessionUser.id ? Number(sessionUser.id) : undefined

  if (!sessionUserId) {
    redirect("/login")
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUserId }
  })

  if (!dbUser) {
    redirect("/login")
  }

  const user = {
    ...sessionUser,
    ...dbUser, // Override session data with latest DB data
    name: dbUser.name || dbUser.username,
  }

  const userId = dbUser.id
  const username = dbUser.username || dbUser.name || undefined

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        ...(userId ? [{ userId }] : []),
        ...(username ? [{ player: username }] : [])
      ]
    },
    include: {
      items: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const modules = await getModules()

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

  const avatarSrc = user.image || `https://minotar.net/helm/${user.username || user.name || 'steve'}/128.png`

  return (
    <div className="flex flex-col gap-6 my-8 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6">

        {/* Sidebar - Informações do utilizador */}
        <div className="w-full md:w-80 lg:w-96 flex-shrink-0">
          <div className="gale-panel p-6 flex flex-col items-center text-center gap-4 border border-white/10">
            <div className="relative w-28 h-28">
              <Image
                src={avatarSrc}
                alt="Avatar"
                fill
                className="rounded-2xl object-cover border-2 border-neon-purple/50 shadow-[0_0_20px_-5px_rgba(188,19,254,0.5)]"
              />
            </div>

            <div>
              <h2 className="text-xl font-black text-transparent bg-clip-text neon-bg-degrade">
                {user.name || user.username || 'Utilizador'}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">{user.email || 'Sem email associado'}</p>
            </div>

            <div className="w-full bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 flex items-center gap-1.5 text-xs font-bold">
                  <Shield size={14} className="text-neon-purple" /> Cargo
                </span>
                <span className="text-xs font-black uppercase px-2 py-0.5 bg-neon-purple/10 text-neon-purple border border-neon-purple/20 rounded-md">
                  {user.role || 'USER'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 flex items-center gap-1.5 text-xs font-bold">
                  <Wallet size={14} className="text-neon-pink" /> Saldo
                </span>
                <span className="text-sm font-black text-neon-pink">{user.balance.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/5 pt-3">
                <span className="text-gray-400 flex items-center gap-1.5 text-xs font-bold">
                  <ShoppingBag size={14} className="text-neon-blue" /> Compras
                </span>
                <span className="text-sm font-black text-neon-blue">{orders.length}</span>
              </div>
            </div>

            {modules.MODULE_GIFTCARDS && (
              <RedeemGiftCardForm />
            )}

            <Link href="/profile/bau" className="w-full py-3 px-4 bg-gradient-to-r from-neon-purple to-neon-blue text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_-5px_rgba(188,19,254,0.5)] flex items-center justify-center gap-2 hover:scale-[1.02] mt-2">
              <PackageOpen size={18} />
              Aceder ao Baú
            </Link>

            {user.role === 'ADMIN' && (
              <Link href="/admin" className="w-full py-3 px-4 bg-neon-purple/10 text-neon-purple border border-neon-purple/30 rounded-xl font-bold text-sm transition-all shadow-[0_0_10px_-3px_rgba(188,19,254,0.3)] flex items-center justify-center gap-2 hover:scale-[1.02] hover:bg-neon-purple/20">
                <ShieldCheck size={18} />
                Painel de Administração
              </Link>
            )}

            <form action={logoutAction} className="w-full">
              <button className="w-full py-2.5 px-4 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl font-bold text-xs transition-all">
                Terminar Sessão
              </button>
            </form>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col gap-6">

          <AddBalanceForm />

          {/* Histórico de Compras */}
          <div className="gale-panel p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-5 text-white border-b border-white/10 pb-3 flex justify-between items-center">
              <span className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-neon-blue" />
                Histórico de Compras
              </span>
              <span className="text-xs font-normal text-gray-400 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                {orders.length} encomendas
              </span>
            </h3>

            {orders.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <ShoppingBag size={48} className="mx-auto mb-3 opacity-20 text-neon-blue" />
                <p className="font-bold text-sm">Ainda não efetuaste nenhuma compra.</p>
                <p className="text-xs text-gray-500 mt-1">Explora a nossa <Link href="/loja" className="text-neon-blue hover:underline">loja</Link> e adquire produtos.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-neon-blue">Encomenda #{order.id}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="flex flex-col gap-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-xs text-gray-300">
                          <span>{item.quantity}x {item.product.name}</span>
                          <span className="font-semibold">{(item.price * item.quantity).toFixed(2)}€</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                      <span className="text-xs text-gray-400">Total pago</span>
                      <span className="text-neon-pink font-black">{order.total.toFixed(2)}€</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Segurança */}
          <div className="gale-panel p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-4 text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <Shield size={18} className="text-neon-purple" />
              Segurança
            </h3>
            <p className="text-sm text-gray-400">
              Para alterares a tua palavra-passe ou gerires contas vinculadas (Discord), contacta um administrador no servidor de Discord.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
