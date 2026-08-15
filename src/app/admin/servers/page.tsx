'use client'

import { useState, useEffect } from 'react'
import { getServersAdmin, createMinecraftServer, updateMinecraftServer, deleteMinecraftServer, testRconConnection } from '@/app/actions/admin-servers'
import { Plus, Edit2, Trash2, Server, Terminal, Loader2, CheckCircle2, XCircle } from 'lucide-react'
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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [fName, setFName] = useState('')
  const [fIp, setFIp] = useState('')
  const [fPort, setFPort] = useState(25575)
  const [fPassword, setFPassword] = useState('')

  // Test Connection State
  const [testingId, setTestingId] = useState<number | null>(null)
  const [testResult, setTestResult] = useState<{ id: number; success: boolean; msg: string } | null>(null)

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

  async function handleTestConnection(item: MinecraftServer) {
    setTestingId(item.id)
    setTestResult(null)
    try {
      const res = await testRconConnection({
        ip: item.ip,
        rconPort: item.rconPort,
        rconPassword: item.rconPassword
      })

      if (res.success) {
        setTestResult({ id: item.id, success: true, msg: res.message || 'OK' })
        Toast.fire({ icon: 'success', title: 'Conexão RCON com sucesso!' })
      } else {
        setTestResult({ id: item.id, success: false, msg: res.error || 'Falha na conexão.' })
        Toast.fire({ icon: 'error', title: res.error || 'Falha ao ligar via RCON.' })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido.'
      setTestResult({ id: item.id, success: false, msg })
      Toast.fire({ icon: 'error', title: 'Erro na conexão RCON.' })
    } finally {
      setTestingId(null)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">A carregar servidores...</div>

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase text-white mb-1 flex items-center gap-3">
            <Server className="text-neon-purple" size={28} />
            Servidores Minecraft & RCON
          </h1>
          <p className="text-gray-400 text-sm">
            Regista os teus servidores de Minecraft para entrega automática de VIPs e itens via comandos RCON em tempo real.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-neon-purple/20 text-neon-purple border border-neon-purple/30 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-neon-purple/30 transition-colors shadow-lg"
        >
          <Plus size={18} /> Registar Servidor
        </button>
      </div>

      {/* Tabela de Servidores */}
      <div className="gale-panel border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-black/40 text-gray-400 uppercase text-xs tracking-wider border-b border-white/10">
            <tr>
              <th className="p-4">Nome do Servidor</th>
              <th className="p-4">IP / Hostname</th>
              <th className="p-4">Porta RCON</th>
              <th className="p-4 text-center">Teste RCON</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-black/20">
            {servers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Nenhum servidor registado. Clica no botão acima para registar o teu primeiro servidor de Minecraft!
                </td>
              </tr>
            ) : (
              servers.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <Server size={18} className="text-neon-blue" />
                    {item.name}
                  </td>
                  <td className="p-4 font-mono text-gray-300">
                    {item.ip}
                  </td>
                  <td className="p-4 font-mono text-neon-purple font-bold">
                    {item.rconPort}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleTestConnection(item)}
                      disabled={testingId === item.id}
                      className="px-3 py-1.5 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/20 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {testingId === item.id ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> A testar...
                        </>
                      ) : (
                        <>
                          <Terminal size={14} /> Testar Conexão RCON
                        </>
                      )}
                    </button>
                    {testResult && testResult.id === item.id && (
                      <div className={`mt-2 p-2 rounded-lg text-xs font-mono text-left flex items-start gap-2 ${
                        testResult.success ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border border-red-500/20 text-red-300'
                      }`}>
                        {testResult.success ? <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> : <XCircle size={14} className="shrink-0 mt-0.5" />}
                        <span className="line-clamp-2">{testResult.msg}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-2 bg-white/5 hover:bg-white/10 text-blue-400 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Criar/Editar Servidor */}
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
              className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple/50"
              placeholder="Ex: Survival 1.20 ou RankUP"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">IP do Servidor / Hostname *</label>
              <input
                type="text"
                value={fIp}
                onChange={e => setFIp(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple/50 font-mono"
                placeholder="Ex: 185.123.45.67 ou mc.teuservidor.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Porta RCON *</label>
              <input
                type="number"
                value={fPort}
                onChange={e => setFPort(parseInt(e.target.value) || 25575)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple/50 font-mono"
                placeholder="25575"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Password RCON *</label>
            <input
              type="password"
              value={fPassword}
              onChange={e => setFPassword(e.target.value)}
              className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple/50 font-mono"
              placeholder="A password definida em server.properties (rcon.password)"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setIsModalOpen(false)}
            className="flex-1 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-bold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-5 py-2.5 bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            Guardar Servidor
          </button>
        </div>
      </Modal>
    </div>
  )
}
