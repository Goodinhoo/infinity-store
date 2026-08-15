'use client'

import { useState, useEffect } from 'react'
import { getAuditLogsAdmin, getRconLogsAdmin } from '@/app/actions/admin-logs'
import { History, Shield, Terminal, Search, CheckCircle2, XCircle, User, Calendar, RefreshCw } from 'lucide-react'
import { Toast } from '@/lib/toast'

type AuditLogItem = {
  id: number
  userId?: number | null
  username?: string | null
  action: string
  details: string
  ipAddress?: string | null
  createdAt: Date
}

type RconLogItem = {
  id: number
  orderId?: number | null
  serverName: string
  player: string
  command: string
  status: string
  response?: string | null
  createdAt: Date
}

export default function AdminLogsPage() {
  const [activeTab, setActiveTab] = useState<'audit' | 'rcon'>('audit')
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([])
  const [rconLogs, setRconLogs] = useState<RconLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      try {
        if (activeTab === 'audit') {
          const data = await getAuditLogsAdmin(search)
          if (isMounted) setAuditLogs(data)
        } else {
          const data = await getRconLogsAdmin(search)
          if (isMounted) setRconLogs(data)
        }
      } catch {
        if (isMounted) Toast.fire({ icon: 'error', title: 'Erro ao carregar registos de logs.' })
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [activeTab, search])

  function handleRefresh() {
    setLoading(true)
    if (activeTab === 'audit') {
      getAuditLogsAdmin(search).then(setAuditLogs).finally(() => setLoading(false))
    } else {
      getRconLogsAdmin(search).then(setRconLogs).finally(() => setLoading(false))
    }
  }

  function getActionBadge(action: string) {
    if (action.includes('ROLE')) return 'bg-neon-purple/10 text-neon-purple border-neon-purple/30'
    if (action.includes('PERMISSIONS')) return 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    if (action.includes('BALANCE') || action.includes('COINS')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    if (action.includes('SETTINGS') || action.includes('CSS')) return 'bg-neon-blue/10 text-neon-blue border-neon-blue/30'
    if (action.includes('FORM') || action.includes('APPLICATION')) return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    return 'bg-white/10 text-gray-300 border-white/20'
  }

  return (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase text-white mb-1 flex items-center gap-3">
            <History className="text-neon-purple" size={28} />
            Registos de Auditoria & Logs
          </h1>
          <p className="text-gray-400 text-sm">
            Histórico completo de ações administrativas e comandos RCON executados nos servidores.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs rounded-xl border border-white/10 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Atualizar
        </button>
      </div>

      {/* Tabs & Search Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-neon-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield size={16} /> Ações de Administradores ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('rcon')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'rcon'
                ? 'bg-neon-blue text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Terminal size={16} /> Comandos RCON ({rconLogs.length})
          </button>
        </div>

        {/* Pesquisa */}
        <div className="relative min-w-[260px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar nos registos..."
            className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple"
          />
        </div>
      </div>

      {/* Conteúdo das Abas */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 text-sm">A carregar registos de logs...</div>
      ) : activeTab === 'audit' ? (
        /* Tabela de Ações de Administradores */
        <div className="gale-panel border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-black/50 text-gray-400 uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Data & Hora</th>
                <th className="p-4">Utilizador / Admin</th>
                <th className="p-4">Ação</th>
                <th className="p-4">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-black/20">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Nenhum registo de ação administrativa encontrado.
                  </td>
                </tr>
              ) : (
                auditLogs.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-gray-400 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-neon-purple" />
                        {new Date(item.createdAt).toLocaleString('pt-PT')}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-neon-blue" />
                        {item.username || 'Sistema'}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border ${getActionBadge(item.action)}`}>
                        {item.action}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300 font-medium leading-relaxed">
                      {item.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Tabela de Comandos RCON */
        <div className="gale-panel border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-black/50 text-gray-400 uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Data & Hora</th>
                <th className="p-4">Servidor</th>
                <th className="p-4">Jogador</th>
                <th className="p-4">Comando RCON</th>
                <th className="p-4">Estado & Resposta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-black/20">
              {rconLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Nenhum registo de comando RCON encontrado.
                  </td>
                </tr>
              ) : (
                rconLogs.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-gray-400">
                      {new Date(item.createdAt).toLocaleString('pt-PT')}
                    </td>
                    <td className="p-4 font-bold text-neon-blue">
                      {item.serverName}
                    </td>
                    <td className="p-4 font-bold text-white">
                      {item.player}
                    </td>
                    <td className="p-4 font-mono text-neon-purple bg-black/30 rounded-lg py-2">
                      {item.command}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {item.status === 'SUCCESS' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 size={12} /> SUCESSO
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30 flex items-center gap-1">
                            <XCircle size={12} /> FALHA
                          </span>
                        )}
                        <span className="text-gray-400 text-[11px] truncate max-w-[200px]">
                          {item.response || 'OK'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
