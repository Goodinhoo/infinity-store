'use client'

import { useState, useEffect } from 'react'
import { getChangelogsAdmin, createChangelog, updateChangelog, deleteChangelog } from '@/app/actions/admin-changelogs'
import { Plus, Edit2, Trash2, GitCommit } from 'lucide-react'
import { Toast } from '@/lib/toast'
import Modal from '@/components/Modal'
import CustomSelect from '@/components/CustomSelect'

type Changelog = {
  id: number
  title: string
  version: string
  content: string
  type: string
  createdAt: Date
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Novo', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  IMPROVEMENT: { label: 'Melhoria', color: 'bg-neon-blue/10 text-neon-blue border-neon-blue/20' },
  FIX: { label: 'Correção', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  REMOVED: { label: 'Removido', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  UPDATE: { label: 'Atualização', color: 'bg-neon-purple/10 text-neon-purple border-neon-purple/20' }
}

export default function AdminChangelogs() {
  const [changelogs, setChangelogs] = useState<Changelog[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [fVersion, setFVersion] = useState('v1.0.0')
  const [fTitle, setFTitle] = useState('')
  const [fType, setFType] = useState('NEW')
  const [fContent, setFContent] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const data = await getChangelogsAdmin()
      setChangelogs(data)
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao carregar notas de atualização.' })
    } finally {
      setLoading(false)
    }
  }

  function handleOpenModal(item?: Changelog) {
    if (item) {
      setEditingId(item.id)
      setFVersion(item.version)
      setFTitle(item.title)
      setFType(item.type)
      setFContent(item.content)
    } else {
      setEditingId(null)
      setFVersion('v1.0.0')
      setFTitle('')
      setFType('NEW')
      setFContent('')
    }
    setIsModalOpen(true)
  }

  async function handleSave() {
    if (!fTitle.trim() || !fVersion.trim() || !fContent.trim()) {
      Toast.fire({ icon: 'warning', title: 'Preenche todos os campos obrigatórios.' })
      return
    }

    try {
      if (editingId) {
        await updateChangelog(editingId, {
          title: fTitle,
          version: fVersion,
          type: fType,
          content: fContent
        })
        Toast.fire({ icon: 'success', title: 'Atualização modificada com sucesso!' })
      } else {
        await createChangelog({
          title: fTitle,
          version: fVersion,
          type: fType,
          content: fContent
        })
        Toast.fire({ icon: 'success', title: 'Nova atualização criada!' })
      }
      setIsModalOpen(false)
      loadData()
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao guardar atualização.' })
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tens a certeza que queres eliminar esta nota de atualização?')) return

    try {
      await deleteChangelog(id)
      Toast.fire({ icon: 'success', title: 'Registo eliminado!' })
      loadData()
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao eliminar registo.' })
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">A carregar...</div>

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase text-white mb-1 flex items-center gap-3">
            <GitCommit className="text-neon-purple" size={28} />
            Notas de Atualização (Changelog)
          </h1>
          <p className="text-gray-400 text-sm">
            Gere as atualizações e notas de versão do servidor para os teus jogadores acompanharem.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-neon-purple/20 text-neon-purple border border-neon-purple/30 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-neon-purple/30 transition-colors shadow-lg"
        >
          <Plus size={18} /> Nova Nota de Atualização
        </button>
      </div>

      {/* Tabela de Changelogs */}
      <div className="gale-panel border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-black/40 text-gray-400 uppercase text-xs tracking-wider border-b border-white/10">
            <tr>
              <th className="p-4">Versão</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Título</th>
              <th className="p-4">Data</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-black/20">
            {changelogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Nenhuma nota de atualização registada até ao momento.
                </td>
              </tr>
            ) : (
              changelogs.map((item) => {
                const conf = TYPE_CONFIG[item.type] || TYPE_CONFIG.UPDATE
                return (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-bold text-white">
                      {item.version}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${conf.color}`}>
                        {conf.label}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-white">
                      {item.title}
                    </td>
                    <td className="p-4 text-gray-400 text-xs">
                      {new Date(item.createdAt).toLocaleDateString('pt-PT')}
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
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Criar/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <GitCommit className="text-neon-purple" size={22} />
            {editingId ? 'Editar Nota de Atualização' : 'Nova Nota de Atualização'}
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Versão *</label>
              <input
                type="text"
                value={fVersion}
                onChange={e => setFVersion(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple/50 font-mono"
                placeholder="Ex: v1.2.0"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tipo de Nota *</label>
              <CustomSelect
                value={fType}
                onChange={setFType}
                options={[
                  { value: 'NEW', label: 'Novo (Adicionado)' },
                  { value: 'IMPROVEMENT', label: 'Melhoria' },
                  { value: 'FIX', label: 'Correção (Bugfix)' },
                  { value: 'REMOVED', label: 'Removido' },
                  { value: 'UPDATE', label: 'Atualização Geral' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Título Resumido *</label>
            <input
              type="text"
              value={fTitle}
              onChange={e => setFTitle(e.target.value)}
              className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple/50"
              placeholder="Ex: Novo Sistema de Clan Wars e Correção de Dupe"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Conteúdo / Descrição *</label>
            <textarea
              rows={5}
              value={fContent}
              onChange={e => setFContent(e.target.value)}
              className="w-full bg-[#050508] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-neon-purple/50 resize-none leading-relaxed"
              placeholder="Descreve as alterações detalhadas da atualização (podes usar tópicos ou texto livre)..."
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
            Guardar Registo
          </button>
        </div>
      </Modal>
    </div>
  )
}
