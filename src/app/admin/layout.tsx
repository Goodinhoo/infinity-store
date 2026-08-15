import Link from 'next/link'
import { LayoutDashboard, ShoppingCart, Tags, Ticket as TicketIcon, BookOpen, LifeBuoy, ShieldAlert, Blocks, Users, Settings, User, Box, FileText, Menu, Crown, MousePointerClick, Download, Palette, Server, History } from 'lucide-react'

import { ModuleKey } from '@/app/actions/settings'
import { ElementType } from 'react'

import { PermissionKey, hasPermission } from '@/lib/permissions'

type NavItem = {
  title: string
  href?: string
  icon?: ElementType
  module?: ModuleKey
  permission?: PermissionKey
  items?: NavItem[]
  isHeader?: boolean
}

const adminNav: NavItem[] = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Loja', isHeader: true },
  { title: 'Categorias', href: '/admin/store/categories', icon: Tags, permission: 'MANAGE_CATEGORIES' },
  { title: 'Produtos', href: '/admin/store/products', icon: Box, permission: 'MANAGE_PRODUCTS' },
  { title: 'Cupões', href: '/admin/store/coupons', icon: TicketIcon, permission: 'MANAGE_COUPONS' },
  { title: 'Cartões Presente', href: '/admin/store/giftcards', icon: TicketIcon, module: 'MODULE_GIFTCARDS', permission: 'MANAGE_GIFTCARDS' },
  { title: 'Encomendas', href: '/admin/store/orders', icon: ShoppingCart, permission: 'MANAGE_ORDERS' },
  { title: 'Servidores RCON', href: '/admin/servers', icon: Server, permission: 'MANAGE_SETTINGS' },
  { title: 'Comunidade', isHeader: true },
  { title: 'Páginas', href: '/admin/pages', icon: FileText, permission: 'MANAGE_PAGES' },
  { title: 'Utilizadores', href: '/admin/users', icon: Users, permission: 'MANAGE_USERS' },
  { title: 'VIPs', href: '/admin/vips', icon: Crown, module: 'MODULE_VIPTABLE', permission: 'MANAGE_VIPTABLE' },
  { title: 'Votos', href: '/admin/votes', icon: MousePointerClick, module: 'MODULE_VOTES', permission: 'MANAGE_VOTES' },
  { title: 'Downloads', href: '/admin/downloads', icon: Download, module: 'MODULE_DOWNLOADS', permission: 'MANAGE_DOWNLOADS' },
  { title: 'Criadores', href: '/admin/creators', icon: User, module: 'MODULE_CREATORS', permission: 'MANAGE_CREATORS' },
  { title: 'Blog', href: '/admin/blog', icon: BookOpen, permission: 'MANAGE_BLOG' },
  { title: 'Sliders (Banners)', href: '/admin/sliders', icon: Blocks, module: 'MODULE_SLIDERS', permission: 'MANAGE_SLIDERS' },
  { title: 'Suporte / Tickets', href: '/admin/tickets', icon: LifeBuoy, permission: 'MANAGE_TICKETS' },
  { title: 'Punições', href: '/admin/bans', icon: ShieldAlert, permission: 'MANAGE_BANS' },
  { title: 'Módulos', href: '/admin/modules', icon: Blocks, permission: 'MANAGE_MODULES' },
  { title: 'Navegação', href: '/admin/navigation', icon: Menu, permission: 'MANAGE_NAVIGATION' },
  { title: 'Aparência', href: '/admin/appearance', icon: Palette, permission: 'MANAGE_APPEARANCE' },
  { title: 'Logs & Auditoria', href: '/admin/logs', icon: History, permission: 'MANAGE_LOGS' },
  { title: 'Configurações', href: '/admin/settings', icon: Settings, permission: 'MANAGE_SETTINGS' },
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
    select: { role: true, permissions: true }
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
            if (item.permission && !hasPermission(dbUser?.role, dbUser?.permissions, item.permission)) return null
            
            if (item.isHeader) {
              return (
                <div key={idx} className="mt-4 mb-2">
                  <p className="px-3 text-[10px] font-black uppercase tracking-widest text-gray-500">{item.title}</p>
                </div>
              )
            }

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

            const Icon = item.icon
            return (
              <Link key={item.href || item.title} href={item.href || '#'} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all group">
                {Icon && <Icon size={15} className="text-neon-purple group-hover:text-neon-blue transition-colors" />}
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
