'use client'

import { useState, useEffect } from 'react'
import { getStaffMembersAdmin, createStaffMember, updateStaffMember, deleteStaffMember } from '@/app/actions/admin-staff'
import { Plus, Edit2, Trash2, ShieldCheck, UserCheck } from 'lucide-react'
import { Toast } from '@/lib/toast'
import Modal from '@/components/Modal'
import Image from 'next/image'

type StaffMember = {
  id: number
  username: string
  roleGroup: string
  customTitle: string | null
  discord: string | null
  order: number
}

const ROLE_GROUPS = [
  'Fundadores',
  'Administradores',
  'Moderadores',
  'Ajudantes',
  'Desenvolvedores',
  'Builders'
]

export default function AdminStaff() {
  const [members, setMembers] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [fUsername, setFUsername] = useState('')
  const [fRoleGroup, setFRoleGroup] = useState('Administradores')
  const [fCustomTitle, setFCustomTitle] = useState('')
  const [fDiscord, setFDiscord] = useState('')
  const [fOrder, setFOrder] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const data = await getStaffMembersAdmin()
      setMembers(data)
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao carregar membros da equipa.' })
    } finally {
      setLoading(false)
    }
  }

  function handleOpenModal(item?: StaffMember) {
    if (item) {
      setEditingId(item.id)
      setFUsername(item.username)
      setFRoleGroup(item.roleGroup)
      setFCustomTitle(item.customTitle || '')
      setFDiscord(item.discord || '')
      setFOrder(item.order)
    } else {
      setEditingId(null)
      setFUsername('')
      setFRoleGroup('Administradores')
      setFCustomTitle('')
      setFDiscord('')
      setFOrder(0)
    }
    setIsModalOpen(true)
  }

  async function handleSave() {
    if (!fUsername.trim() || !fRoleGroup.trim()) {
      Toast.fire({ icon: 'warning', title: 'Preenche o Nickname e o Grupo do cargo.' })
      return
    }

    try {
      if (editingId) {
        await updateStaffMember(editingId, {
          username: fUsername,
          roleGroup: fRoleGroup,
          customTitle: fCustomTitle,
          discord: fDiscord,
          order: fOrder
        })
        Toast.fire({ icon: 'success', title: 'Membro atualizado com sucesso!' })
      } else {
        await createStaffMember({
          username: fUsername,
          roleGroup: fRoleGroup,
          customTitle: fCustomTitle,
          discord: fDiscord,
          order: fOrder
        })
        Toast.fire({ icon: 'success', title: 'Membro adicionado à equipa!' })
      }
      setIsModalOpen(false)
      loadData()
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao guardar membro da equipa.' })
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tens a certeza que queres remover este membro da equipa pública?')) return

    try {
      await deleteStaffMember(id)
      Toast.fire({ icon: 'success', title: 'Membro removido!' })
      loadData()
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao remover membro.' })
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">A carregar...</div>

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase text-white mb-1 flex items-center gap-3">
            <ShieldCheck className="text-neon-purple" size={28} />
            Equipa & Staff (`/staff`)
          </h1>
          <p className="text-gray-400 text-sm">
            Gere os membros da equipa que são visíveis publicamente na página `/staff`.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-neon-purple/20 text-neon-purple border border-neon-purple/30 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-neon-purple/30 transition-colors shadow-lg"
        >
          <Plus size={18} /> Adicionar Membro
        </button>
      </div>

      {/* Tabela de Membros */}
      <div className="gale-panel border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-black/40 text-gray-400 uppercase text-xs tracking-wider border-b border-white/10">
            <tr>
              <th className="p-4">Avatar</th>
              <th className="p-4">Nickname (MC)</th>
              <th className="p-4">Grupo de Cargo</th>
              <th className="p-4">Título Personalizado</th>
              <th className="p-4">Discord</th>
              <th className="p-4 text-center">Ordem</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-black/20">
            {members.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  Nenhum membro da equipa adicionado ainda.
                </td>
              </tr>
            ) : (
              members.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="w-10 h-10 relative rounded-xl overflow-hidden bg-black/50 border border-white/10">
                      <Image
                        src={`https://minotar.net/helm/${item.username}/100.png`}
                        alt={item.username}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-4 font-bold text-white">
                    {item.username}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-neon-purple/10 text-neon-purple border border-neon-purple/20 rounded-full text-xs font-bold">
                      {item.roleGroup}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">
                    {item.customTitle || '-'}
                  </td>
                  <td className="p-4 text-gray-400 text-xs">
                    {item.discord || '-'}
                  </td>
                  <td className="p-4 text-center font-mono font-bold text-gray-400">
                    {item.order}
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

      {/* Modal Criar/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <UserCheck className="text-neon-purple" size={22} />
            {editingId ? 'Editar Membro da Staff' : 'Adicionar Membro à Staff'}
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nickname Minecraft *</label>
              <input
                type="text"
                value={fUsername}
                onChange={e => setFUsername(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple/50"
                placeholder="Ex: Goodinhoo"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Grupo de Cargo *</label>
              <input
                type="text"
                list="role-suggestions"
                value={fRoleGroup}
                onChange={e => setFRoleGroup(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple/50"
                placeholder="Ex: Fundadores, Administradores..."
              />
              <datalist id="role-suggestions">
                {ROLE_GROUPS.map(r => <option key={r} value={r} />)}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Título Personalizado (Opcional)</label>
            <input
              type="text"
              value={fCustomTitle}
              onChange={e => setFCustomTitle(e.target.value)}
              className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple/50"
              placeholder="Ex: Lead Developer & Dono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Discord Tag (Opcional)</label>
              <input
                type="text"
                value={fDiscord}
                onChange={e => setFDiscord(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple/50"
                placeholder="Ex: goodinhoo"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Ordem de Exibição</label>
              <input
                type="number"
                value={fOrder}
                onChange={e => setFOrder(parseInt(e.target.value) || 0)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple/50 font-mono"
              />
            </div>
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
            Guardar Membro
          </button>
        </div>
      </Modal>
    </div>
  )
}
