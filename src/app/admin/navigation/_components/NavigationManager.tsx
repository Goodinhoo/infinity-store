'use client'

import { useState } from 'react'
import { createNavigationItem, updateNavigationItem, deleteNavigationItem, reorderNavigationItems } from '@/app/actions/admin-navigation'
import { ArrowUp, ArrowDown, Trash2, Plus, Save, Eye, EyeOff } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import Swal from 'sweetalert2'

type NavItem = {
  id: number
  label: string
  url: string
  icon: string | null
  order: number
  isActive: boolean
  isSystem: boolean
}

type CustomPage = {
  id: number
  title: string
  slug: string
}

import { ElementType } from 'react'

const IconComponent = ({ name, className }: { name: string | null, className?: string }) => {
  if (!name) return null
  const Icon = LucideIcons[name as keyof typeof LucideIcons] as ElementType
  if (!Icon) return <LucideIcons.HelpCircle className={className} />
  return <Icon className={className} />
}

const urlToModule: Record<string, string> = {
  '/vips': 'MODULE_VIPTABLE',
  '/sugestoes': 'MODULE_SUGGESTIONS',
  '/downloads': 'MODULE_DOWNLOADS',
  '/votos': 'MODULE_VOTES',
  '/roleta': 'MODULE_FORTUNE_WHEEL',
}

export default function NavigationManager({ 
  initialItems, 
  customPages = [],
  modules = {} 
}: { 
  initialItems: NavItem[], 
  customPages?: CustomPage[],
  modules?: Record<string, boolean>
}) {
  const [items, setItems] = useState<NavItem[]>(initialItems)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Novo item form
  const [newLabel, setNewLabel] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newIcon, setNewIcon] = useState('')
  const [showUrlSuggestions, setShowUrlSuggestions] = useState(false)

  const moveUp = (index: number) => {
    if (index === 0) return
    const newItems = [...items]
    const temp = newItems[index]
    newItems[index] = newItems[index - 1]
    newItems[index - 1] = temp
    
    // Atualizar order local
    newItems.forEach((item, i) => item.order = i)
    setItems(newItems)
    setHasChanges(true)
  }

  const moveDown = (index: number) => {
    if (index === items.length - 1) return
    const newItems = [...items]
    const temp = newItems[index]
    newItems[index] = newItems[index + 1]
    newItems[index + 1] = temp

    // Atualizar order local
    newItems.forEach((item, i) => item.order = i)
    setItems(newItems)
    setHasChanges(true)
  }

  const handleSaveOrder = async () => {
    setIsSaving(true)
    const payload = items.map(item => ({ id: item.id, order: item.order }))
    await reorderNavigationItems(payload)
    setHasChanges(false)
    setIsSaving(false)
    Swal.fire({
      icon: 'success',
      title: 'Ordem Guardada!',
      background: '#0a0a0f',
      color: '#fff',
      timer: 1500,
      showConfirmButton: false
    })
  }

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    // Optimistic UI
    setItems(items.map(item => item.id === id ? { ...item, isActive: !currentActive } : item))
    await updateNavigationItem(id, { isActive: !currentActive })
  }

  const handleDelete = async (id: number) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Apagar link?',
      text: 'Tem a certeza que deseja apagar este link?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, apagar',
      cancelButtonText: 'Cancelar',
      background: '#0a0a0f',
      color: '#fff',
      confirmButtonColor: '#ef4444'
    })

    if (isConfirmed) {
      const res = await deleteNavigationItem(id)
      if (res.success) {
        setItems(items.filter(item => item.id !== id))
      } else {
        Swal.fire('Erro', res.error, 'error')
      }
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLabel || !newUrl) return

    setIsSaving(true)
    const res = await createNavigationItem(newLabel, newUrl, newIcon || null)
    if (res.success) {
      setNewLabel('')
      setNewUrl('')
      setNewIcon('')
      window.location.reload()
    } else {
      Swal.fire('Erro', res.error, 'error')
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-10">
      
      {/* Table of items */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Links Atuais</h2>
          {hasChanges && (
            <button 
              onClick={handleSaveOrder}
              disabled={isSaving}
              className="px-4 py-2 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-neon-blue/30 transition-colors"
            >
              <Save size={16} />
              Guardar Ordem
            </button>
          )}
        </div>

        <div className="border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/50 border-b border-white/10">
                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-widest w-16">Ord.</th>
                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-widest">Item</th>
                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-widest">URL</th>
                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-black/20">
              {items.map((item, index) => {
                const itemModule = urlToModule[item.url]
                const isModuleActive = itemModule ? modules[itemModule] !== false : true

                return (
                <tr key={item.id} className={`hover:bg-white/5 transition-colors ${!item.isActive || !isModuleActive ? 'opacity-50' : ''} ${!isModuleActive ? 'grayscale' : ''}`}>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="text-gray-500 hover:text-white disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button 
                        onClick={() => moveDown(index)}
                        disabled={index === items.length - 1}
                        className="text-gray-500 hover:text-white disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <IconComponent name={item.icon} className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-sm text-white">{item.label}</span>
                      {item.isSystem && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
                          Sistema
                        </span>
                      )}
                      {isModuleActive === false && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 border border-red-500/30">
                          Módulo Inativo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 font-mono text-sm">
                    {item.url}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleToggleActive(item.id, item.isActive)}
                        disabled={!isModuleActive}
                        className={`p-2 rounded-lg transition-colors border ${item.isActive ? 'bg-white/5 text-gray-400 hover:bg-white/10 border-white/10' : 'bg-neon-blue/10 text-neon-blue border-neon-blue/20 hover:bg-neon-blue/20'} ${!isModuleActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={!isModuleActive ? 'Módulo inativo' : item.isActive ? 'Ocultar Link' : 'Mostrar Link'}
                      >
                        {item.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      
                      {!item.isSystem && (
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all"
                          title="Apagar"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Item */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
          <Plus className="text-neon-purple" size={20} />
          Adicionar Link Personalizado
        </h2>

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Nome</label>
            <input 
              type="text" 
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-neon-purple/50 transition-colors"
              placeholder="Ex: Regras"
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Link de Destino
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={newUrl}
                  onChange={(e) => {
                    setNewUrl(e.target.value)
                    setShowUrlSuggestions(true)
                  }}
                  onFocus={() => setShowUrlSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowUrlSuggestions(false), 200)}
                  placeholder="/minha-pagina ou https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-purple transition-all"
                />
                
                {showUrlSuggestions && customPages.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-[#0a0a0f] border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col max-h-60 overflow-y-auto">
                    {customPages.map(page => (
                      <button
                        key={page.id}
                        type="button"
                        className="flex flex-col text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                        onClick={() => {
                          setNewUrl(`/${page.slug}`)
                          setShowUrlSuggestions(false)
                        }}
                      >
                        <span className="text-white font-bold">{page.title}</span>
                        <span className="text-neon-purple text-xs">/{page.slug}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex justify-between">
              Ícone 
              <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="text-neon-purple hover:underline lowercase">ver lista</a>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-gray-500">
                <IconComponent name={newIcon} className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-neon-purple/50 transition-colors"
                placeholder="Ex: BookOpen"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSaving || !newLabel || !newUrl}
            className="w-full py-2.5 bg-neon-purple/20 text-neon-purple hover:bg-neon-purple/30 border border-neon-purple/30 rounded-xl font-bold flex justify-center items-center gap-2 transition-all disabled:opacity-50"
          >
            <Plus size={18} />
            Adicionar
          </button>
        </form>
      </div>

    </div>
  )
}
