'use client'

import { useState, useEffect, useRef } from 'react'
import { getAdminDownloads, createDownload, updateDownload, deleteDownload } from '@/app/actions/admin-downloads'
import { uploadImage } from '@/app/actions/global-settings'
import { Plus, Loader2, Trash2, Edit, Power, DownloadCloud, Upload } from 'lucide-react'
import { Toast, ConfirmAlert } from '@/lib/toast'

type DownloadData = {
  id: number
  name: string
  slug: string
  description: string
  downloadUrl: string
  imageUrl: string | null
  icon: string | null
  downloads: number
  isActive: boolean
}

export default function DownloadsAdminPage() {
  const [items, setItems] = useState<DownloadData[]>([])
  const [loading, setLoading] = useState(true)
  const [search] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Modal state
  const [editId, setEditId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [icon, setIcon] = useState('Download')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const data = await getAdminDownloads()
      setItems(data)
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao carregar ficheiros.' })
    } finally {
      setLoading(false)
    }
  }

  const openModal = (item?: DownloadData) => {
    if (item) {
      setEditId(item.id)
      setName(item.name)
      setDescription(item.description)
      setDownloadUrl(item.downloadUrl)
      setImageUrl(item.imageUrl || '')
      setIcon(item.icon || 'Download')
    } else {
      setEditId(null)
      setName('')
      setDescription('')
      setDownloadUrl('')
      setImageUrl('')
      setIcon('Download')
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !downloadUrl) {
      Toast.fire({ icon: 'error', title: 'Preenche os campos obrigatórios.' })
      return
    }

    setIsSubmitting(true)
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    
    let res;
    if (editId) {
      res = await updateDownload(editId, { name, slug, description, downloadUrl, imageUrl, icon, isActive: true })
    } else {
      res = await createDownload({ name, slug, description, downloadUrl, imageUrl, icon })
    }

    if (res.success) {
      Toast.fire({ icon: 'success', title: 'Ficheiro guardado com sucesso!' })
      setIsModalOpen(false)
      loadData()
    } else {
      Toast.fire({ icon: 'error', title: res.error || 'Erro ao guardar' })
    }
    setIsSubmitting(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('download_cover', file)

    Toast.fire({ icon: 'info', title: 'A fazer upload...', showConfirmButton: false, timer: 0 })
    
    const res = await uploadImage(formData, 'download_cover')
    if (res.success && res.url) {
      setImageUrl(res.url)
      Toast.fire({ icon: 'success', title: 'Upload concluído!' })
    } else {
      Toast.fire({ icon: 'error', title: res.error || 'Erro no upload.' })
    }
  }

  const handleToggle = async (item: DownloadData) => {
    const res = await updateDownload(item.id, { 
      name: item.name, slug: item.slug, description: item.description, 
      downloadUrl: item.downloadUrl, imageUrl: item.imageUrl || undefined, icon: item.icon || undefined, isActive: !item.isActive 
    })
    if (res.success) {
      Toast.fire({ icon: 'success', title: 'Estado atualizado!' })
      loadData()
    } else {
      Toast.fire({ icon: 'error', title: res.error || 'Erro' })
    }
  }

  const handleDelete = async (id: number) => {
    const isConfirmed = await ConfirmAlert.fire('Tens a certeza?', 'Queres apagar este ficheiro?')
    if (!isConfirmed) return
    const res = await deleteDownload(id)
    if (res.success) {
      Toast.fire({ icon: 'success', title: 'Apagado!' })
      loadData()
    } else {
      Toast.fire({ icon: 'error', title: res.error || 'Erro' })
    }
  }

  const filteredItems = items.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <div className="p-3 bg-neon-blue/20 text-neon-blue rounded-xl border border-neon-blue/30">
              <DownloadCloud size={24} />
            </div>
            Gestão de Downloads
          </h1>
          <p className="text-gray-400 mt-2">Adiciona mods, launchers e ficheiros para os jogadores.</p>
        </div>
        
        <button 
          onClick={() => openModal()}
          className="bg-neon-blue hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Ficheiro
        </button>
      </div>

      {/* List */}
      <div className="gale-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-gray-400 font-semibold">
              <tr>
                <th className="p-4 rounded-tl-2xl">Ficheiro</th>
                <th className="p-4">Link (URL)</th>
                <th className="p-4 text-center">Downloads</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-right rounded-tr-2xl">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 className="animate-spin mx-auto text-neon-blue" size={32} />
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Nenhum ficheiro configurado.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-base">{item.name}</span>
                        <span className="text-xs text-gray-400">{item.description}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <a href={item.downloadUrl} target="_blank" className="text-neon-blue hover:underline text-xs truncate max-w-[200px] inline-block">
                        {item.downloadUrl}
                      </a>
                    </td>
                    <td className="p-4 text-center font-bold text-neon-purple">
                      {item.downloads}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {item.isActive ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleToggle(item)}
                          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${item.isActive ? 'text-red-400' : 'text-green-400'}`}
                          title={item.isActive ? 'Desativar' : 'Ativar'}
                        >
                          <Power size={18} />
                        </button>
                        <button 
                          onClick={() => openModal(item)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-blue-400"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="gale-panel max-w-lg w-full p-6 animate-fade-in flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{editId ? 'Editar Ficheiro' : 'Novo Ficheiro'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-gray-400 mb-2 block">Nome do Ficheiro</label>
                <input 
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-neon-blue"
                  placeholder="Ex: Launcher Oficial, Optifine..."
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-400 mb-2 block">Link de Download (URL)</label>
                <input 
                  type="url" required value={downloadUrl} onChange={e => setDownloadUrl(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-neon-blue"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-400 mb-2 block">Imagem de Capa (URL ou Upload)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-neon-blue"
                    placeholder="Link da imagem ou faz upload..."
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors flex items-center justify-center"
                    title="Fazer Upload do Computador"
                  >
                    <Upload size={20} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-gray-400">Ícone (Lucide-react)</label>
                  <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="text-neon-purple hover:underline text-xs font-bold lowercase">ver lista</a>
                </div>
                <input 
                  type="text" value={icon} onChange={e => setIcon(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-neon-blue font-mono text-xs"
                  placeholder="Ex: DownloadCloud, Package, Cpu, Shield..."
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-400 mb-2 block">Descrição Breve</label>
                <input 
                  type="text" value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-neon-blue"
                  placeholder="Recomendado para jogar no servidor."
                />
              </div>

              <button 
                type="submit" disabled={isSubmitting}
                className="mt-4 w-full bg-neon-blue hover:bg-blue-500 text-black font-black py-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin text-white" /> : 'Guardar Ficheiro'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
