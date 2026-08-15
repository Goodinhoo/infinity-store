import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  Package, Users, MessageSquare,
  ShoppingCart, Calendar, TrendingUp, DollarSign
} from 'lucide-react'
import DashboardChart from './DashboardChart'

export const metadata = {
  title: 'Painel de Administração - Infinity Nexus',
}

export default async function AdminDashboard() {
  const [
    totalProducts, totalCategories,
    totalTickets, openTickets,
    allOrders, allUsers
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: 'OPEN' } }),
    prisma.order.findMany({ where: { status: 'PAID' }, select: { total: true, createdAt: true } }),
    prisma.user.findMany({ select: { createdAt: true } }),
  ])

  // Datas atuais para comparação
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  // Cálculos Financeiros
  let totalRevenue = 0
  let monthlyRevenue = 0
  let dailyRevenue = 0

  // Agrupamentos para o Gráfico
  const dailyMap: Record<number, number> = {} // day of month -> revenue
  const monthlyMap: Record<number, number> = {} // month -> revenue
  const yearlyMap: Record<number, number> = {} // year -> revenue

  // Inicializar dias do mês (1 até último dia do mês)
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  for (let i = 1; i <= daysInMonth; i++) dailyMap[i] = 0
  // Inicializar meses do ano (0 a 11)
  for (let i = 0; i < 12; i++) monthlyMap[i] = 0

  allOrders.forEach(order => {
    totalRevenue += order.total

    const orderDate = order.createdAt
    
    // Hoje
    if (orderDate >= startOfDay) dailyRevenue += order.total
    
    // Este Mês
    if (orderDate >= startOfMonth) {
      monthlyRevenue += order.total
      dailyMap[orderDate.getDate()] += order.total
    }
    
    // Este Ano
    if (orderDate >= startOfYear) {
      monthlyMap[orderDate.getMonth()] += order.total
    }
    
    // Anual
    const year = orderDate.getFullYear()
    yearlyMap[year] = (yearlyMap[year] || 0) + order.total
  })

  // Formatar Arrays do Gráfico
  const dailyData = Object.entries(dailyMap).map(([day, val]) => ({
    label: `${day}/${now.getMonth() + 1}`,
    receita: val
  }))
  
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const monthlyData = Object.entries(monthlyMap).map(([month, val]) => ({
    label: monthNames[Number(month)],
    receita: val
  }))
  
  const yearlyData = Object.entries(yearlyMap).map(([year, val]) => ({
    label: year,
    receita: val
  }))

  // Cálculos de Registos (Utilizadores)
  const totalRegs = allUsers.length
  let monthlyRegs = 0
  let dailyRegs = 0

  allUsers.forEach(user => {
    const d = user.createdAt
    if (d >= startOfDay) dailyRegs++
    if (d >= startOfMonth) monthlyRegs++
  })

  // Cartões Inferiores
  const stats = [
    { label: 'Total Encomendas (Pagas)', value: allOrders.length, sub: 'Loja online', icon: ShoppingCart, color: 'from-neon-blue to-neon-purple', href: '/admin/store/orders' },
    { label: 'Produtos Ativos', value: totalProducts, sub: `${totalCategories} categorias`, icon: Package, color: 'from-neon-purple to-neon-pink', href: '/admin/store/products' },
    { label: 'Tickets Abertos', value: openTickets, sub: `${totalTickets} tickets no total`, icon: MessageSquare, color: 'from-amber-500 to-orange-500', href: '/admin/tickets' },
  ]

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-10">
      <header>
        <h1 className="text-3xl font-black text-white">Dashboard Financeiro</h1>
        <p className="text-sm text-gray-400 mt-1">Estatísticas, Receitas e Utilizadores da Infinity Nexus</p>
      </header>

      {/* Cartões Financeiros e de Registos (Estilo LeaderOS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-8 5xl:grid-cols-10 gap-5">
        
        {/* Receita Total */}
        <div className="gale-panel p-6 border border-white/10 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-neon-purple/20 rounded-full blur-2xl group-hover:bg-neon-purple/40 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Receita Total</p>
              <h3 className="text-2xl font-black text-white mt-1">{totalRevenue.toFixed(2)}€</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center">
              <DollarSign size={20} className="text-neon-purple" />
            </div>
          </div>
          <div className="text-[11px] text-gray-500 flex items-center gap-1">
            <span className="text-neon-purple font-bold">Vitalício</span> de fundos gerados
          </div>
        </div>

        {/* Receita Mensal & Diária */}
        <div className="gale-panel p-6 border border-white/10 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-neon-blue/20 rounded-full blur-2xl group-hover:bg-neon-blue/40 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Receita Mensal</p>
              <h3 className="text-2xl font-black text-white mt-1">{monthlyRevenue.toFixed(2)}€</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-neon-blue" />
            </div>
          </div>
          <div className="text-[11px] text-gray-500 flex items-center gap-1">
            Ganho hoje: <span className="text-neon-blue font-bold">+{dailyRevenue.toFixed(2)}€</span>
          </div>
        </div>

        {/* Registos Totais */}
        <div className="gale-panel p-6 border border-white/10 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registos Totais</p>
              <h3 className="text-2xl font-black text-white mt-1">{totalRegs}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Users size={20} className="text-green-500" />
            </div>
          </div>
          <div className="text-[11px] text-gray-500 flex items-center gap-1">
            <span className="text-green-400 font-bold">Total</span> de contas criadas
          </div>
        </div>

        {/* Registos Mensais */}
        <div className="gale-panel p-6 border border-white/10 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registos (Mês)</p>
              <h3 className="text-2xl font-black text-white mt-1">{monthlyRegs}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Calendar size={20} className="text-teal-500" />
            </div>
          </div>
          <div className="text-[11px] text-gray-500 flex items-center gap-1">
            Registos hoje: <span className="text-teal-400 font-bold">+{dailyRegs}</span>
          </div>
        </div>

      </div>

      {/* Secção do Gráfico */}
      <DashboardChart 
        dailyData={dailyData} 
        monthlyData={monthlyData} 
        yearlyData={yearlyData} 
      />

      {/* Cartões Estatísticos Restantes (Miniaturas) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-7 5xl:grid-cols-9 gap-5 mt-2">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.href} href={stat.href} className="gale-panel p-5 border border-white/10 hover:border-white/30 transition-all group flex items-center justify-between">
              <div>
                <p className="text-xl font-black text-white">{stat.value}</p>
                <p className="text-xs font-bold text-gray-300 mt-1">{stat.label}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-[1px] shadow-lg`}>
                <div className="w-full h-full bg-[#0d0d14] rounded-[10px] flex items-center justify-center">
                  <Icon size={20} className="text-white" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

    </div>
  )
}
