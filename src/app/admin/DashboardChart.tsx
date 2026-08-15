'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Calendar, TrendingUp } from 'lucide-react'

type ChartData = { label: string; receita: number }

interface DashboardChartProps {
  dailyData: ChartData[]
  monthlyData: ChartData[]
  yearlyData: ChartData[]
}

export default function DashboardChart({ dailyData, monthlyData, yearlyData }: DashboardChartProps) {
  const [view, setView] = useState<'daily' | 'monthly' | 'yearly'>('daily')

  let data = dailyData
  let title = 'Receita (Este Mês)'
  
  if (view === 'monthly') {
    data = monthlyData
    title = 'Receita (Este Ano)'
  } else if (view === 'yearly') {
    data = yearlyData
    title = 'Receita (Total)'
  }

  return (
    <div className="gale-panel p-6 border border-white/10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center">
            <TrendingUp size={20} className="text-neon-purple" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <p className="text-xs text-gray-400">Evolução de ganhos na plataforma</p>
          </div>
        </div>

        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-bold overflow-x-auto max-w-full custom-scrollbar">
          <button
            onClick={() => setView('daily')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              view === 'daily' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Calendar size={14} /> Diário
          </button>
          <button
            onClick={() => setView('monthly')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              view === 'monthly' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Calendar size={14} /> Mensal
          </button>
          <button
            onClick={() => setView('yearly')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              view === 'yearly' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Calendar size={14} /> Anual
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#bc13fe" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#bc13fe" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="label" 
              stroke="#6b7280" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0d0d14', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              formatter={(value: unknown) => [`${Number(value || 0).toFixed(2)}€`, 'Receita']}
              labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="receita" 
              stroke="#bc13fe" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorReceita)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
