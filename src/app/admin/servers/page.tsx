'use client'

import { useState, useEffect } from 'react'
import { getServersAdmin, createMinecraftServer, updateMinecraftServer, deleteMinecraftServer, testRconConnection, sendRconCommand } from '@/app/actions/admin-servers'
import { Plus, Edit2, Trash2, Server, Terminal, Loader2, CheckCircle2, XCircle, Send, Radio } from 'lucide-react'
import { Toast } from '@/lib/toast'
import Modal from '@/components/Modal'

type MinecraftServer = {
  id: number
  name: string
  ip: string
  rconPort: number
  rconPassword: string
  isActive: boolean
  createdAt: Date
}

export default function AdminServers() {
  const [servers, setServers] = useState<MinecraftServer[]>([])
  const [loading, setLoading] = useState(true)

  // Edit/Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [fName, setFName] = useState('')
  const [fIp, setFIp] = useState('')
  const [fPort, setFPort] = useState(25575)
  const [fPassword, setFPassword] = useState('')

  // Terminal Console Modal State
  const [activeConsoleServer, setActiveConsoleServer] = useState<MinecraftServer | null>(null)
  const [consoleLogs, setConsoleLogs] = useState<Array<{ type: 'sys' | 'success' | 'error' | 'cmd'; text: string }>>([])
  const [customCommand, setCustomCommand] = useState('')
  const [executingCmd, setExecutingCmd] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const data = await getServersAdmin()
      setServers(data)
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao carregar servidores.' })
    } finally {
      setLoading(false)
    }
  }

  function handleOpenModal(item?: MinecraftServer) {
    if (item) {
      setEditingId(item.id)
      setFName(item.name)
      setFIp(item.ip)
      setFPort(item.rconPort)
      setFPassword(item.rconPassword)
    } else {
      setEditingId(null)
      setFName('')
      setFIp('')
      setFPort(25575)
      setFPassword('')
    }
    setIsModalOpen(true)
  }

  async function handleSave() {
    if (!fName.trim() || !fIp.trim() || !fPassword.trim()) {
      Toast.fire({ icon: 'warning', title: 'Preenche o nome, IP e Password RCON.' })
      return
    }

    try {
      if (editingId) {
        await updateMinecraftServer(editingId, {
          name: fName,
          ip: fIp,
          rconPort: fPort,
          rconPassword: fPassword
        })
        Toast.fire({ icon: 'success', title: 'Servidor modificado com sucesso!' })
      } else {
        await createMinecraftServer({
          name: fName,
          ip: fIp,
          rconPort: fPort,
          rconPassword: fPassword
        })
        Toast.fire({ icon: 'success', title: 'Novo servidor registado!' })
      }
      setIsModalOpen(false)
      loadData()
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao guardar servidor.' })
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tens a certeza que queres eliminar este servidor? Os produtos associados ficarão sem servidor especificado.')) return

    try {
      await deleteMinecraftServer(id)
      Toast.fire({ icon: 'success', title: 'Servidor eliminado!' })
      loadData()
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao eliminar servidor.' })
    }
  }

  async function handleOpenConsole(item: MinecraftServer) {
    setActiveConsoleServer(item)
    setConsoleLogs([
      { type: 'sys', text: `[RCON Console] A iniciar conexão a ${item.ip}:${item.rconPort}...` }
    ])
    setExecutingCmd(true)

    try {
      const res = await testRconConnection({
        ip: item.ip,
        rconPort: item.rconPort,
        rconPassword: item.rconPassword
      })

      if (res.success) {
        setConsoleLogs(prev => [
          ...prev,
          { type: 'success', text: `[RCON OK] Autenticação bem sucedida!` },
          { type: 'success', text: `[Resposta] ${res.message}` }
        ])
        Toast.fire({ icon: 'success', title: 'Conexão RCON Estabelecida!' })
      } else {
        setConsoleLogs(prev => [
          ...prev,
          { type: 'error', text: `[ERRO RCON] ${res.error || 'Falha de conexão.'}` }
        ])
        Toast.fire({ icon: 'error', title: 'Falha na conexão RCON' })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro na conexão.'
      setConsoleLogs(prev => [...prev, { type: 'error', text: `[EXCEÇÃO] ${msg}` }])
    } finally {
      setExecutingCmd(false)
    }
  }

  async function handleExecuteCustomCommand(e: React.FormEvent) {
    e.preventDefault()
    if (!customCommand.trim() || !activeConsoleServer || executingCmd) return

    const cmdToRun = customCommand.trim()
    setCustomCommand('')
    setConsoleLogs(prev => [...prev, { type: 'cmd', text: `> ${cmdToRun}` }])
    setExecutingCmd(true)

    try {
      const res = await sendRconCommand({
        ip: activeConsoleServer.ip,
        rconPort: activeConsoleServer.rconPort,
        rconPassword: activeConsoleServer.rconPassword,
        command: cmdToRun
      })

      if (res.success) {
        setConsoleLogs(prev => [...prev, { type: 'success', text: res.message }])
      } else {
        setConsoleLogs(prev => [...prev, { type: 'error', text: res.error || 'Erro no comando.' }])
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro no envio.'
      setConsoleLogs(prev => [...prev, { type: 'error', text: msg }])
    } finally {
      setExecutingCmd(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">A carregar servidores...</div>

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black uppercase text-white mb-1 flex items-center gap-3">
            <Server className="text-neon-purple" size={28} />
            Servidores Minecraft & RCON
          </h1>
          <p className="text-gray-400 text-sm">
            Gere os teus servidores de Minecraft para entrega automática de VIPs e itens via comandos RCON em tempo real.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-5 py-3 bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={18} /> Registar Servidor
        </button>
      </div>

      {/* Grid de Cards de Servidores */}
      {servers.length === 0 ? (
        <div className="gale-panel p-12 border border-white/10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple mx-auto">
            <Server size={32} />
          </div>
          <h3 className="text-lg font-bold text-white uppercase">Nenhum Servidor Registado</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Regista o teu primeiro servidor de Minecraft para ativação automática de compras na loja!
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-2.5 bg-neon-purple text-white font-bold text-xs rounded-xl shadow-lg inline-flex items-center gap-2"
          >
            <Plus size={16} /> Adicionar Servidor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {servers.map((item) => (
            <div
              key={item.id}
              className="gale-panel p-6 border border-white/10 rounded-2xl flex flex-col justify-between space-y-6 hover:border-neon-purple/50 transition-all duration-300 group shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/5 rounded-full blur-2xl group-hover:bg-neon-purple/10 transition-all" />

              <div>
                {/* Top Badge & Name */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-white/10 flex items-center justify-center text-neon-purple group-hover:scale-105 transition-transform">
                      <Server size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white group-hover:text-neon-purple transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5 font-mono">
                        <Radio size={12} className="text-emerald-400 animate-pulse" />
                        RCON Habilitado
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all border border-white/5"
                      title="Editar Definições"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl transition-all border border-white/5"
                      title="Eliminar Servidor"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Details Pills */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">IP / Hostname</span>
                    <code className="text-xs text-neon-blue font-mono font-bold truncate block">{item.ip}</code>
                  </div>
                  <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Porta RCON</span>
                    <code className="text-xs text-neon-purple font-mono font-bold block">{item.rconPort}</code>
                  </div>
                </div>
              </div>

              {/* Console Trigger Button */}
              <div className="pt-2">
                <button
                  onClick={() => handleOpenConsole(item)}
                  className="w-full py-3 bg-white/5 hover:bg-neon-purple/20 text-white font-bold text-xs rounded-xl border border-white/10 hover:border-neon-purple/40 transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
                >
                  <Terminal size={16} className="text-neon-blue group-hover/btn:text-neon-purple transition-colors" />
                  <span>Consola & Teste RCON</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar / Editar Servidor */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <Server className="text-neon-purple" size={22} />
            {editingId ? 'Editar Servidor Minecraft' : 'Registar Novo Servidor'}
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nome de Exibição *</label>
            <input
              type="text"
              value={fName}
              onChange={e => setFName(e.target.value)}
              className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple/50 transition-colors"
              placeholder="Ex: Infinity Nexus Survival ou RankUP"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">IP do Servidor / Hostname *</label>
              <input
                type="text"
                value={fIp}
                onChange={e => setFIp(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple/50 font-mono transition-colors"
                placeholder="Ex: 148.230.76.21"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Porta RCON *</label>
              <input
                type="number"
                value={fPort}
                onChange={e => setFPort(parseInt(e.target.value) || 25575)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple/50 font-mono transition-colors"
                placeholder="25987"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Password RCON *</label>
            <input
              type="password"
              value={fPassword}
              onChange={e => setFPassword(e.target.value)}
              className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple/50 font-mono transition-colors"
              placeholder="Password definida em server.properties (rcon.password)"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setIsModalOpen(false)}
            className="flex-1 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-5 py-2.5 bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
          >
            Guardar Servidor
          </button>
        </div>
      </Modal>

      {/* Modal Interactive RCON Terminal Console */}
      <Modal
        isOpen={!!activeConsoleServer}
        onClose={() => setActiveConsoleServer(null)}
        title={
          <div className="flex items-center gap-3">
            <Terminal className="text-neon-purple" size={22} />
            <span>Consola RCON — {activeConsoleServer?.name}</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-black/50 border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono">
            <span className="text-gray-400">Host: <strong className="text-neon-blue">{activeConsoleServer?.ip}:{activeConsoleServer?.rconPort}</strong></span>
            <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
              <Radio size={12} className="animate-pulse" /> RCON Online
            </span>
          </div>

          {/* Terminal Console Output */}
          <div className="h-64 bg-[#050509] border border-white/10 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-2 custom-scrollbar shadow-inner">
            {consoleLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-2">
                {log.type === 'sys' && <span className="text-gray-500">{log.text}</span>}
                {log.type === 'cmd' && <span className="text-neon-blue font-bold">{log.text}</span>}
                {log.type === 'success' && (
                  <span className="text-emerald-400 flex items-start gap-1.5">
                    <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                    <span>{log.text}</span>
                  </span>
                )}
                {log.type === 'error' && (
                  <span className="text-red-400 flex items-start gap-1.5">
                    <XCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{log.text}</span>
                  </span>
                )}
              </div>
            ))}
            {executingCmd && (
              <div className="flex items-center gap-2 text-neon-purple animate-pulse">
                <Loader2 size={14} className="animate-spin" />
                <span>A enviar comando RCON...</span>
              </div>
            )}
          </div>

          {/* Live Command Line Input */}
          <form onSubmit={handleExecuteCustomCommand} className="flex gap-2">
            <input
              type="text"
              value={customCommand}
              onChange={e => setCustomCommand(e.target.value)}
              placeholder="Escreve um comando (ex: list, say Olá, version)..."
              className="flex-1 bg-[#050508] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-neon-purple"
            />
            <button
              type="submit"
              disabled={executingCmd || !customCommand.trim()}
              className="px-4 py-2.5 bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Send size={14} /> Enviar
            </button>
          </form>
        </div>
      </Modal>
    </div>
  )
}
