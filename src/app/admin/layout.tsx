import Link from 'next/link'
import { LayoutDashboard, ShoppingCart, Tags, Ticket as TicketIcon, BookOpen, LifeBuoy, ShieldAlert, Blocks, Users, Settings, Box, FileText, Menu, Palette, Server, History } from 'lucide-react'

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
  { title: 'Encomendas', href: '/admin/store/orders', icon: ShoppingCart, permission: 'MANAGE_ORDERS' },
  { title: 'Servidores RCON', href: '/admin/servers', icon: Server, permission: 'MANAGE_SERVERS' },

  { title: 'Comunidade & Suporte', isHeader: true },
  { title: 'Utilizadores', href: '/admin/users', icon: Users, permission: 'MANAGE_USERS' },
  { title: 'Blog & Notícias', href: '/admin/blog', icon: BookOpen, permission: 'MANAGE_BLOG' },
  { title: 'Páginas', href: '/admin/pages', icon: FileText, permission: 'MANAGE_PAGES' },
  { title: 'Suporte / Tickets', href: '/admin/tickets', icon: LifeBuoy, permission: 'MANAGE_TICKETS' },
  { title: 'Punições & Bans', href: '/admin/bans', icon: ShieldAlert, permission: 'MANAGE_BANS' },

  { title: 'Sistema & Definições', isHeader: true },
  { title: 'Módulos', href: '/admin/modules', icon: Blocks, permission: 'MANAGE_MODULES' },
  { title: 'Aparência & Temas', href: '/admin/appearance', icon: Palette, permission: 'MANAGE_APPEARANCE' },
  { title: 'Menu de Navegação', href: '/admin/navigation', icon: Menu, permission: 'MANAGE_NAVIGATION' },
  { title: 'Configurações Globais', href: '/admin/settings', icon: Settings, permission: 'MANAGE_SETTINGS' },
  { title: 'Logs & Auditoria', href: '/admin/logs', icon: History, permission: 'MANAGE_LOGS' },
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
    <div className="flex flex-col gap-4 h-full w-full overflow-hidden animate-fade-in">
      {/* Top Admin Header Bar (Estático no Topo, Sem Scroll) */}
      <header className="gale-panel p-4 border border-white/10 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neon-purple/10 border border-neon-purple/30 rounded-xl text-neon-purple font-black text-xs">
            ADMIN
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wider">Painel de Gestão & Administração</h1>
            <p className="text-[10px] text-gray-400">Ligado como <span className="text-neon-blue font-bold">{session.user.name || session.user.email}</span> ({dbUser?.role})</p>
          </div>
        </div>

        <Link
          href="/"
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all text-xs font-bold flex items-center gap-2"
        >
          <ShoppingCart size={16} className="text-neon-purple" />
          <span>Voltar à Loja</span>
        </Link>
      </header>

      {/* Main Container (Sidebar Fixa à Esquerda + Conteúdo Central com Scroll Próprio) */}
      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Sidebar (Totalmente Fixa à Esquerda) */}
        <aside className="w-64 flex-shrink-0 hidden lg:block h-full overflow-hidden">
          <div className="gale-panel p-4 border border-white/10 h-full flex flex-col gap-1 overflow-y-auto custom-scrollbar">
            <div className="px-3 py-2 mb-2 border-b border-white/10 flex-shrink-0">
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

        {/* Painel Central (ÚNICO Elemento que faz Scroll) */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto custom-scrollbar p-2">
          {children}
        </main>
      </div>
    </div>
  )
}
