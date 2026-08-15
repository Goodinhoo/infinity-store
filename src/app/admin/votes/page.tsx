'use client'

import { useState, useEffect } from 'react'
import { getVoteSitesAdmin, createVoteSite, updateVoteSite, deleteVoteSite } from '@/app/actions/votes'
import { Plus, Edit2, Trash2, Link as LinkIcon, Check, X, MousePointerClick, Image as ImageIcon } from 'lucide-react'
import { Toast } from '@/lib/toast'
import Modal from '@/components/Modal'

type VoteSite = {
  id: number
  name: string
  url: string
  imageUrl: string | null
  reward: string | null
  order: number
  isActive: boolean
}

export default function AdminVotes() {
  const [sites, setSites] = useState<VoteSite[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [fName, setFName] = useState('')
  const [fUrl, setFUrl] = useState('')
  const [fImageUrl, setFImageUrl] = useState('')
  const [fReward, setFReward] = useState('')
  const [fOrder, setFOrder] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const data = await getVoteSitesAdmin()
      setSites(data)
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao carregar sites de voto.' })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (site?: VoteSite) => {
    if (site) {
      setEditingId(site.id)
      setFName(site.name)
      setFUrl(site.url)
      setFImageUrl(site.imageUrl || '')
      setFReward(site.reward || '')
      setFOrder(site.order)
    } else {
      setEditingId(null)
      setFName('')
      setFUrl('')
      setFImageUrl('')
      setFReward('')
      setFOrder(sites.length)
    }
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!fName || !fUrl) {
      Toast.fire({ icon: 'error', title: 'Nome e URL são obrigatórios.' })
      return
    }

    try {
      const data = {
        name: fName,
        url: fUrl,
        imageUrl: fImageUrl || undefined,
        reward: fReward || undefined,
        order: fOrder,
      }

      if (editingId) {
        await updateVoteSite(editingId, data)
        Toast.fire({ icon: 'success', title: 'Site atualizado!' })
      } else {
        await createVoteSite(data)
        Toast.fire({ icon: 'success', title: 'Site criado!' })
      }
      setIsModalOpen(false)
      loadData()
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao guardar site.' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar este site de votos?')) return
    try {
      await deleteVoteSite(id)
      Toast.fire({ icon: 'success', title: 'Site eliminado.' })
      loadData()
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao eliminar.' })
    }
  }

  const toggleActive = async (id: number, current: boolean) => {
    try {
      setSites(sites.map(s => s.id === id ? { ...s, isActive: !current } : s))
      await updateVoteSite(id, { isActive: !current })
    } catch {
      setSites(sites.map(s => s.id === id ? { ...s, isActive: current } : s))
      Toast.fire({ icon: 'error', title: 'Erro ao alterar estado.' })
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">A carregar...</div>

  return (
    <>
      <div className="p-8 w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black uppercase text-white mb-1">Gestão de Votos</h1>
        <p className="text-gray-400 text-sm">Configura os sites onde os jogadores podem votar no servidor.</p>
      </div>

      <div className="gale-panel p-6 border border-white/10 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-400 max-w-xl">Cria links que redirecionam os jogadores para as páginas de votação. Podes adicionar imagens e descrições das recompensas.</p>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-500 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Plus size={16} /> Novo Site de Voto
          </button>
        </div>

        {sites.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white/5 rounded-xl border border-dashed border-white/10">Nenhum site configurado.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map(site => (
              <div key={site.id} className={`bg-[#050508] border ${site.isActive ? 'border-white/10' : 'border-red-500/20 opacity-60'} rounded-xl p-5 flex flex-col gap-4 relative group`}>
                
                {/* Imagem */}
                <div className="h-24 w-full bg-white/5 rounded-lg flex items-center justify-center overflow-hidden border border-white/5 relative">
                  {site.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={site.imageUrl} alt={site.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <MousePointerClick className="text-white/20" size={32} />
                  )}
                </div>

                {/* Info */}
                <div>
                  <h3 className="font-bold text-white text-lg">{site.name}</h3>
                  {site.reward && (
                    <p className="text-xs text-emerald-400 mt-1 font-medium">{site.reward}</p>
                  )}
                  <a href={site.url} target="_blank" rel="noreferrer" className="text-[10px] text-gray-500 mt-2 flex items-center gap-1 hover:text-white transition-colors truncate">
                    <LinkIcon size={10} /> {site.url}
                  </a>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5">
                  <button 
                    onClick={() => toggleActive(site.id, site.isActive)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex justify-center items-center gap-1 transition-colors ${site.isActive ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                  >
                    {site.isActive ? <Check size={14} /> : <X size={14} />}
                    {site.isActive ? 'Ativo' : 'Desativado'}
                  </button>
                  <button onClick={() => handleOpenModal(site)} className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(site.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

      {/* Modal Criar/Editar */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <MousePointerClick className="text-emerald-500" size={20} />
            {editingId ? 'Editar Site de Votos' : 'Novo Site de Votos'}
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nome do Site *</label>
            <input type="text" value={fName} onChange={e => setFName(e.target.value)} className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" placeholder="Ex: Minecraft-MP" />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">URL (Link) *</label>
            <input type="text" value={fUrl} onChange={e => setFUrl(e.target.value)} className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" placeholder="Ex: https://minecraft-mp.com/..." />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">URL da Imagem (Opcional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ImageIcon size={14} className="text-gray-500" />
              </div>
              <input type="text" value={fImageUrl} onChange={e => setFImageUrl(e.target.value)} className="w-full bg-[#050508] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" placeholder="Ex: https://i.imgur.com/..." />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Recompensa (Opcional)</label>
            <input type="text" value={fReward} onChange={e => setFReward(e.target.value)} className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" placeholder="Ex: 1x Chave Diária + 500 Coins" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Ordem de Exibição</label>
            <input type="number" value={fOrder} onChange={e => setFOrder(parseInt(e.target.value) || 0)} className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => setIsModalOpen(false)} className="flex-1 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-bold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer select-none">
            Cancelar
          </button>
          <button onClick={handleSave} className="flex-1 px-5 py-2.5 bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer select-none">
            Guardar Site
          </button>
        </div>
      </Modal>
    </>
  )
}
