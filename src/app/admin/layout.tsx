import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, Package, ClipboardList, Users, BookOpen, LifeBuoy, ShieldAlert, Settings, Ticket, Gift, Blocks, Star, Menu } from 'lucide-react'

import { ModuleKey } from '@/app/actions/settings'
import { ElementType } from 'react'

type NavItem = {
  title: string
  href?: string
  icon?: ElementType
  module?: ModuleKey
  items?: NavItem[]
}

const adminNav: NavItem[] = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  {
    title: 'Loja',
    items: [
      { title: 'Categorias', href: '/admin/store/categories', icon: ShoppingBag },
      { title: 'Produtos', href: '/admin/store/products', icon: Package },
      { title: 'Cupões', href: '/admin/store/coupons', icon: Ticket },
      { title: 'Cartões Presente', href: '/admin/store/giftcards', icon: Gift, module: 'MODULE_GIFTCARDS' },
      { title: 'Encomendas', href: '/admin/store/orders', icon: ClipboardList },
    ]
  },
  { title: 'Páginas', href: '/admin/pages', icon: BookOpen },
  { title: 'Utilizadores', href: '/admin/users', icon: Users },
  { title: 'Criadores', href: '/admin/creators', icon: Star, module: 'MODULE_CREATORS' },
  { title: 'Blog', href: '/admin/blog', icon: BookOpen },
  { title: 'Suporte / Tickets', href: '/admin/tickets', icon: LifeBuoy },
  { title: 'Punições', href: '/admin/bans', icon: ShieldAlert },
  { title: 'Módulos', href: '/admin/modules', icon: Blocks },
  { title: 'Navegação', href: '/admin/navigation', icon: Menu },
  { title: 'Configurações', href: '/admin/settings', icon: Settings },
]

import { auth } from '@/../auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getModules } from '@/app/actions/settings'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { role: true }
  })

  const modules = await getModules()

  if (dbUser?.role !== 'ADMIN' && dbUser?.role !== 'MODERATOR') {
    redirect('/')
  }

  return (
    <div className="flex gap-6 min-h-[80vh] animate-fade-in">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 hidden lg:block">
        <div className="gale-panel p-4 border border-white/10 sticky top-28 flex flex-col gap-1">
          <div className="px-3 py-2 mb-2 border-b border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-neon-purple">Admin Panel</p>
          </div>

          {adminNav.map((item, idx) => {
            if (item.module && !modules[item.module]) return null
            
            if (item.items) {
              return (
                <div key={idx} className="flex flex-col gap-1">
                  <p className="px-3 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-gray-500">{item.title}</p>
                  {item.items.map((sub) => {
                    if (sub.module && !modules[sub.module]) return null
                    const Icon = sub.icon!
                    return (
                      <Link key={sub.href || sub.title} href={sub.href || '#'} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all group">
                        <Icon size={15} className="text-neon-purple group-hover:text-neon-blue transition-colors" />
                        {sub.title}
                      </Link>
                    )
                  })}
                </div>
              )
            }

            const Icon = item.icon!
            return (
              <Link key={item.href || item.title} href={item.href || '#'} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all group">
                <Icon size={15} className="text-neon-purple group-hover:text-neon-blue transition-colors" />
                {item.title}
              </Link>
            )
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}
