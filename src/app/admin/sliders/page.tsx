'use client'

import { useState, useEffect } from 'react'
import { getSlidersAdmin, createSlider, updateSlider, deleteSlider, toggleSliderActive } from '@/app/actions/admin-sliders'
import { Blocks, PlusCircle, Edit2, Trash2, Eye, EyeOff, Sparkles, Image as ImageIcon, ExternalLink, Hash } from 'lucide-react'
import { Toast } from '@/lib/toast'
import Swal from 'sweetalert2'
import Modal from '@/components/Modal'

type SliderItem = {
  id: number
  title: string
  subtitle: string | null
  badge: string | null
  imageUrl: string
  buttonText: string | null
  buttonLink: string | null
  order: number
  isActive: boolean
}

export default function AdminSlidersPage() {
  const [sliders, setSliders] = useState<SliderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SliderItem | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadSliders = async () => {
    setLoading(true)
    try {
      const data = await getSlidersAdmin()
      setSliders(data)
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao carregar sliders.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSliders()
  }, [])

  const handleOpenModal = (item?: SliderItem) => {
    setEditingItem(item || null)
    setIsModalOpen(true)
  }

  const handleToggleState = async (id: number, currentVal: boolean) => {
    const res = await toggleSliderActive(id, !currentVal)
    if (res.success) {
      Toast.fire({ icon: 'success', title: `Slide ${!currentVal ? 'ativado' : 'desativado'}!` })
      loadSliders()
    } else {
      Toast.fire({ icon: 'error', title: res.error || 'Erro ao alterar estado.' })
    }
  }

  const handleDelete = async (id: number, title: string) => {
    const result = await Swal.fire({
      title: 'Tem a certeza?',
      text: `Deseja eliminar o slide "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Sim, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#0d0d14',
      color: '#fff'
    })

    if (result.isConfirmed) {
      const res = await deleteSlider(id)
      if (res.success) {
        Toast.fire({ icon: 'success', title: 'Slide eliminado!' })
        loadSliders()
      } else {
        Toast.fire({ icon: 'error', title: res.error || 'Erro ao eliminar.' })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)

    try {
      if (editingItem) {
        const res = await updateSlider(editingItem.id, formData)
        if (res.success) {
          Toast.fire({ icon: 'success', title: 'Slide atualizado!' })
          setIsModalOpen(false)
          loadSliders()
        } else {
          Toast.fire({ icon: 'error', title: res.error || 'Erro ao atualizar.' })
        }
      } else {
        const res = await createSlider(formData)
        if (res.success) {
          Toast.fire({ icon: 'success', title: 'Slide criado com sucesso!' })
          setIsModalOpen(false)
          loadSliders()
        } else {
          Toast.fire({ icon: 'error', title: res.error || 'Erro ao criar.' })
        }
      }
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao guardar slide.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-8 w-full space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black uppercase text-white flex items-center gap-3">
            <Blocks className="text-neon-pink" size={28} /> Sliders da Homepage (Banners)
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Gere os banners rotativos do topo da página inicial com imagens de fundo, títulos e botões de ação.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-5 py-2.5 bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center gap-2 cursor-pointer select-none"
        >
          <PlusCircle size={16} /> Novo Slide
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 font-bold">A carregar sliders...</div>
      ) : sliders.length === 0 ? (
        <div className="gale-panel p-12 text-center text-gray-400 border border-white/10 rounded-2xl">
          <Blocks size={48} className="mx-auto mb-3 opacity-20 text-neon-pink" />
          <p className="font-bold text-white">Nenhum slide rotativo criado.</p>
          <p className="text-xs text-gray-500 mt-1">
            Se o módulo estiver ativo mas não houver slides aqui, a homepage usará o banner estático padrão.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sliders.map((s) => (
            <div
              key={s.id}
              className={`gale-panel border rounded-2xl overflow-hidden flex flex-col justify-between transition-all ${
                s.isActive ? 'border-white/10 hover:border-neon-purple/50' : 'border-red-500/20 opacity-70 bg-black/40'
              }`}
            >
              {/* Preview da Imagem com Overlays */}
              <div className="relative h-[180px] w-full bg-black/60 overflow-hidden group">
                <img
                  src={s.imageUrl}
                  alt={s.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-black/70 text-white px-2 py-0.5 rounded-full border border-white/20">
                    Ordem: #{s.order}
                  </span>
                  {s.badge && (
                    <span className="text-[10px] uppercase font-bold bg-neon-purple/80 text-white px-2 py-0.5 rounded-full shadow-lg">
                      {s.badge}
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleToggleState(s.id, s.isActive)}
                    className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold flex items-center gap-1.5 transition-all ${
                      s.isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}
                  >
                    {s.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                    {s.isActive ? 'Ativo' : 'Inativo'}
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 right-4 space-y-1">
                  <h3 className="font-black text-white text-lg leading-tight drop-shadow-md">
                    {s.title}
                  </h3>
                  {s.subtitle && (
                    <p className="text-xs text-gray-300 line-clamp-1 opacity-90 drop-shadow">
                      {s.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Detalhes & Botão */}
              <div className="p-4 bg-black/40 space-y-3 flex-1 flex flex-col justify-between">
                {s.buttonText && (
                  <div className="flex items-center gap-2 text-xs text-neon-blue font-bold">
                    <ExternalLink size={14} />
                    <span>Botão: &quot;{s.buttonText}&quot;</span>
                    {s.buttonLink && <span className="text-gray-500 font-mono">({s.buttonLink})</span>}
                  </div>
                )}

                <div className="flex justify-end items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleOpenModal(s)}
                    className="p-2 bg-white/5 hover:bg-white/10 text-blue-400 border border-white/10 rounded-xl transition-all"
                    title="Editar Slide"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.title)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all"
                    title="Eliminar Slide"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar/Editar Slide */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-white font-bold">
            <Blocks size={18} className="text-neon-pink" />
            {editingItem ? 'Editar Slide' : 'Criar Novo Slide Rotativo'}
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
              Título Principal *
            </label>
            <input
              type="text"
              name="title"
              defaultValue={editingItem?.title || ''}
              required
              placeholder="Ex: Nova Temporada FullPVP 2026!"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
              Subtítulo / Descrição Curta (Opcional)
            </label>
            <textarea
              name="subtitle"
              rows={2}
              defaultValue={editingItem?.subtitle || ''}
              placeholder="Ex: Entra já no servidor e descobre todas as novidades da nova época."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1 flex items-center gap-1">
                <Sparkles size={12} className="text-yellow-400" /> Badge / Etiqueta (Opcional)
              </label>
              <input
                type="text"
                name="badge"
                defaultValue={editingItem?.badge || ''}
                placeholder="Ex: PROMOÇÃO 25%, NOVIDADE..."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1 flex items-center gap-1">
                <Hash size={12} className="text-neon-purple" /> Ordem de Exibição (0, 1, 2...)
              </label>
              <input
                type="number"
                name="order"
                defaultValue={editingItem?.order ?? 0}
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1 flex items-center gap-1">
              <ImageIcon size={12} className="text-amber-400" /> URL da Imagem de Fundo *
            </label>
            <input
              type="url"
              name="imageUrl"
              defaultValue={editingItem?.imageUrl || ''}
              required
              placeholder="https://exemplo.com/banner.png"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                Texto do Botão (Opcional)
              </label>
              <input
                type="text"
                name="buttonText"
                defaultValue={editingItem?.buttonText || ''}
                placeholder="Ex: Ver Pacotes VIP"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                Link do Botão (Opcional)
              </label>
              <input
                type="text"
                name="buttonLink"
                defaultValue={editingItem?.buttonLink || ''}
                placeholder="Ex: /loja ou /vips"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 rounded-xl">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              defaultChecked={editingItem ? editingItem.isActive : true}
              className="w-4 h-4 rounded border-gray-300 text-neon-purple focus:ring-neon-purple bg-black/50 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-xs font-bold text-white cursor-pointer select-none">
              Slide Ativo na Homepage?
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10 mt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
              className="flex-1 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-bold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer select-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-5 py-2.5 bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer select-none"
            >
              {submitting ? 'A guardar...' : editingItem ? 'Guardar Slide' : 'Criar Slide'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
