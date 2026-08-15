'use client'

import { useState } from 'react'
import { ShieldAlert, PlusCircle } from 'lucide-react'
import { createPunishment, deletePunishment } from '@/app/actions/admin-bans'
import { Toast } from '@/lib/toast'
import Swal from 'sweetalert2'
import CustomSelect from '@/components/CustomSelect'
import Modal from '@/components/Modal'

type PunishmentProps = {
  id: number
  player: string
  type: string
  reason: string
  operator: string
  createdAt: Date
}

export default function BansManager({ punishments }: { punishments: PunishmentProps[] }) {
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const typeColors: Record<string, string> = {
    BAN: 'bg-red-500/10 text-red-400 border-red-500/20',
    MUTE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    WARN: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    KICK: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const form = e.currentTarget
    const formData = new FormData(form)
    
    const res = await createPunishment(formData)
    if (res.success) {
      Toast.fire({ icon: 'success', title: 'Punição registada!' })
      setIsModalOpen(false)
      form.reset()
    } else {
      Toast.fire({ icon: 'error', title: res.error || 'Erro ao registar' })
    }
    
    setLoading(false)
  }

  const handleDelete = async (id: number, player: string) => {
    const result = await Swal.fire({
      title: 'Tem a certeza?',
      text: `Deseja remover a punição de "${player}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Sim, remover',
      cancelButtonText: 'Cancelar',
      background: '#0d0d14',
      color: '#fff'
    })

    if (result.isConfirmed) {
      const res = await deletePunishment(id)
      if (res.success) {
        Toast.fire({ icon: 'success', title: 'Punição removida!' })
      } else {
        Toast.fire({ icon: 'error', title: res.error || 'Erro ao remover' })
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-bold text-white flex items-center gap-2">
          <ShieldAlert size={18} className="text-red-400" />
          Punições Registadas ({punishments.length})
        </h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)] hover:scale-105 transition-all flex items-center gap-2"
        >
          <PlusCircle size={16} /> Nova Punição
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={
          <>
            <PlusCircle size={18} className="text-red-400" />
            Nova Punição
          </>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Nick do Jogador *</label>
            <input name="player" type="text" placeholder="Ex: BadPlayer123" required
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Tipo de Punição *</label>
            <CustomSelect
              name="type"
              required
              options={[
                { value: '', label: 'Seleciona o tipo...' },
                { value: 'BAN', label: 'BAN (Permanente)' },
                { value: 'MUTE', label: 'MUTE (Silêncio)' },
                { value: 'WARN', label: 'WARN (Aviso)' },
                { value: 'KICK', label: 'KICK (Expulsão)' }
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Aplicado por (Staff)</label>
            <input name="operator" type="text" placeholder="Ex: Admin_Mario"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Motivo *</label>
            <textarea name="reason" rows={3} placeholder="Descreve o motivo da punição..." required
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500" />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={loading} className="flex-1 h-[44px] bg-red-500/10 border border-red-500/30 hover:border-red-500 hover:bg-red-500/20 rounded-xl font-bold text-sm text-red-400 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
              {loading ? 'A processar...' : 'Registar Punição'}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} disabled={loading} className="px-6 h-[44px] bg-gray-500/10 border border-gray-500/20 hover:bg-gray-500/20 rounded-xl font-bold text-sm text-gray-400 transition-all flex items-center justify-center shadow-sm disabled:opacity-50">
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Lista */}
      <div className="flex flex-col gap-4">
        {punishments.length === 0 ? (
          <div className="gale-panel p-12 text-center text-gray-400 border border-white/10">
            <ShieldAlert size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-bold">Nenhuma punição registada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {punishments.map((item) => (
              <div key={item.id} className="gale-panel p-5 border border-white/10 flex flex-col gap-3 justify-between hover:border-red-500/30 transition-colors relative group">
                <button 
                  onClick={() => handleDelete(item.id, item.player)}
                  className="absolute top-3 right-3 p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Remover punição"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${typeColors[item.type] || typeColors.WARN}`}>{item.type}</span>
                    <span className="font-bold text-white text-lg">{item.player}</span>
                  </div>
                  <p className="text-sm text-gray-300 break-words">{item.reason}</p>
                </div>
                
                <p className="text-xs text-gray-500 mt-2 pt-3 border-t border-white/5">
                  Por: <span className="text-gray-400">{item.operator}</span> • {new Date(item.createdAt).toLocaleDateString('pt-PT')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
