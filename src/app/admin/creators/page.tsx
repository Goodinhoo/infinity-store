'use client'

import { useState, useEffect } from 'react'
import { getCreatorCodes, createCreatorCode, toggleCreatorCode, deleteCreatorCode } from '@/app/actions/creator-codes'
import { Users, Search, Plus, Loader2, Trash2, Power, Star } from 'lucide-react'
import { Toast, ConfirmAlert } from '@/lib/toast'

type CreatorCodeData = {
  id: number
  code: string
  discountPercent: number
  rewardPercent: number
  uses: number
  totalGenerated: number
  totalRewarded: number
  isActive: boolean
  creator: {
    id: number
    username: string | null
    name: string | null
  }
}

type UserData = {
  id: number
  username: string | null
  name: string | null
}

export default function CreatorsAdminPage() {
  const [codes, setCodes] = useState<CreatorCodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Modal state
  const [newCode, setNewCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(5)
  const [rewardPercent, setRewardPercent] = useState(10)
  const [creatorId, setCreatorId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Users for select
  const [users, setUsers] = useState<UserData[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const data = await getCreatorCodes()
      setCodes(data)
      
      // We need to fetch users for the dropdown (ideally a proper search, but for now fetch a list)
      const usersRes = await fetch('/api/admin/users')
      if (usersRes.ok) {
        const u = await usersRes.json()
        setUsers(u)
      }
    } catch (e) {
      console.error(e)
      Toast.fire({ icon: 'error', title: 'Erro ao carregar códigos.' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCode || !creatorId) {
      Toast.fire({ icon: 'error', title: 'Preenche todos os campos obrigatórios.' })
      return
    }

    setIsSubmitting(true)
    const res = await createCreatorCode({
      code: newCode,
      discountPercent: Number(discountPercent),
      rewardPercent: Number(rewardPercent),
      creatorId: Number(creatorId)
    })

    if (res.success) {
      Toast.fire({ icon: 'success', title: 'Código criado com sucesso!' })
      setIsModalOpen(false)
      setNewCode('')
      setDiscountPercent(5)
      setRewardPercent(10)
      setCreatorId('')
      loadData()
    } else {
      Toast.fire({ icon: 'error', title: res.error || 'Erro ao criar' })
    }
    setIsSubmitting(false)
  }

  const handleToggle = async (id: number) => {
    const res = await toggleCreatorCode(id)
    if (res.success) {
      Toast.fire({ icon: 'success', title: 'Estado atualizado!' })
      loadData()
    } else {
      Toast.fire({ icon: 'error', title: res.error || 'Erro' })
    }
  }

  const handleDelete = async (id: number) => {
    const isConfirmed = await ConfirmAlert.fire('Tens a certeza?', 'Queres apagar este código definitivamente?')
    if (!isConfirmed) return
    const res = await deleteCreatorCode(id)
    if (res.success) {
      Toast.fire({ icon: 'success', title: 'Código apagado!' })
      loadData()
    } else {
      Toast.fire({ icon: 'error', title: res.error || 'Erro' })
    }
  }

  const filteredCodes = codes.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase()) || 
    (c.creator?.username || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <div className="p-3 bg-neon-purple/20 text-neon-purple rounded-xl border border-neon-purple/30">
              <Star size={24} />
            </div>
            Criadores (Afiliados)
          </h1>
          <p className="text-gray-400 mt-2">Gere os códigos de afiliados e comissões dos criadores.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-neon-purple hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Código
        </button>
      </div>

      {/* Search */}
      <div className="gale-panel p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar por código ou criador..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-purple transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="gale-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-gray-400 font-semibold">
              <tr>
                <th className="p-4 rounded-tl-2xl">Código</th>
                <th className="p-4">Criador</th>
                <th className="p-4">Desconto / Recompensa</th>
                <th className="p-4">Usos</th>
                <th className="p-4">Gerado (€)</th>
                <th className="p-4">Recompensado (€)</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right rounded-tr-2xl">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <Loader2 className="animate-spin mx-auto text-neon-purple" size={32} />
                  </td>
                </tr>
              ) : filteredCodes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    Nenhum código encontrado.
                  </td>
                </tr>
              ) : (
                filteredCodes.map(code => (
                  <tr key={code.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-white bg-white/10 px-3 py-1 rounded-lg tracking-widest">{code.code}</span>
                    </td>
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <Users size={16} className="text-gray-500" />
                      {code.creator?.username || code.creator?.name || 'Desconhecido'}
                    </td>
                    <td className="p-4 font-medium">
                      <span className="text-neon-blue">{code.discountPercent}% OFF</span> / <span className="text-green-400">{code.rewardPercent}% REWARD</span>
                    </td>
                    <td className="p-4 font-bold text-white">
                      {code.uses}
                    </td>
                    <td className="p-4 font-bold text-green-400">
                      {code.totalGenerated.toFixed(2)}€
                    </td>
                    <td className="p-4 font-bold text-neon-purple">
                      {code.totalRewarded.toFixed(2)}€
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${code.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {code.isActive ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleToggle(code.id)}
                          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${code.isActive ? 'text-red-400' : 'text-green-400'}`}
                          title={code.isActive ? 'Desativar' : 'Ativar'}
                        >
                          <Power size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(code.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Apagar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="gale-panel max-w-md w-full p-6 animate-fade-in flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Novo Código de Criador</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-gray-400 mb-2 block">Código (Ex: JOGADOR20)</label>
                <input 
                  type="text" 
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-neon-purple font-mono uppercase"
                  placeholder="CODIGO"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-400 mb-2 block">Criador (Utilizador)</label>
                <select 
                  required
                  value={creatorId}
                  onChange={(e) => setCreatorId(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-neon-purple"
                >
                  <option value="">Selecionar Utilizador...</option>
                  {users.map((u: UserData) => (
                    <option key={u.id} value={u.id}>{u.username || u.name} (ID: {u.id})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-bold text-gray-400 mb-2 block">Desconto (%)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      required
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-neon-purple"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">O jogador recebe isto.</p>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-bold text-gray-400 mb-2 block">Recompensa (%)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      required
                      value={rewardPercent}
                      onChange={(e) => setRewardPercent(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-neon-purple"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">O criador recebe isto em Saldo.</p>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="mt-4 w-full bg-neon-purple hover:bg-purple-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Criar Código'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
