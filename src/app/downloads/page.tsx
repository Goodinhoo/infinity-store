'use client'

import { useState, useEffect } from 'react'
import { getDownloads, incrementDownload } from '@/app/actions/downloads'
import { getModules } from '@/app/actions/settings'
import { DownloadCloud, ExternalLink, Package, ShieldAlert } from 'lucide-react'
import DynamicIcon from '@/components/DynamicIcon'

type DownloadItem = {
  id: number
  name: string
  description: string
  downloadUrl: string
  imageUrl: string | null
  icon?: string | null
  downloads: number
}

export default function DownloadsPage() {
  const [items, setItems] = useState<DownloadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModuleEnabled, setIsModuleEnabled] = useState(true)

  useEffect(() => {
    async function load() {
      const modules = await getModules()
      if (!modules.MODULE_DOWNLOADS) {
        setIsModuleEnabled(false)
        setLoading(false)
        return
      }

      const data = await getDownloads()
      setItems(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleDownload = async (item: DownloadItem) => {
    // Increment on DB without waiting for the response
    incrementDownload(item.id)
    // Update locally for visual feedback
    setItems(items.map(i => i.id === item.id ? { ...i, downloads: i.downloads + 1 } : i))
    // Open download link in new tab
    window.open(item.downloadUrl, '_blank')
  }

  if (!isModuleEnabled) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center gap-6 animate-fade-in">
        <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
          <ShieldAlert size={48} />
        </div>
        <h1 className="text-3xl font-black text-white">Módulo Desativado</h1>
        <p className="text-gray-400 max-w-md">
          A página de downloads encontra-se temporariamente desativada pela administração.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 flex flex-col gap-12">
      {/* Header */}
      <div className="flex flex-col gap-4 text-center items-center">
        <div className="inline-flex items-center justify-center p-4 bg-neon-blue/20 text-neon-blue rounded-2xl border border-neon-blue/30 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <DownloadCloud size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-white drop-shadow-md">
          Downloads Oficiais
        </h1>
        <p className="text-gray-400 max-w-2xl text-sm md:text-base">
          Encontra aqui todos os ficheiros necessários para jogares no nosso servidor com a melhor experiência possível. 
          Mods recomendados, texturas exclusivas e os nossos launchers.
        </p>
      </div>

      {/* Grid de Ficheiros */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="gale-panel p-12 text-center flex flex-col items-center gap-4">
          <Package size={48} className="text-gray-600" />
          <h3 className="text-xl font-bold text-gray-400">Nenhum ficheiro disponível no momento.</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="gale-panel p-6 flex flex-col gap-6 hover:border-neon-blue/40 transition-all duration-300 group">
              {item.imageUrl && (
                <div className="w-full h-48 rounded-xl overflow-hidden border border-white/10 group-hover:border-neon-blue/30 transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:bg-neon-blue/10 group-hover:border-neon-blue/30 transition-colors">
                  <DynamicIcon name={item.icon} fallback={Package} className="text-gray-400 group-hover:text-neon-blue transition-colors" size={24} />
                </div>
                <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-white/10">
                  {item.downloads} downloads
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-white group-hover:text-neon-blue transition-colors">{item.name}</h3>
                <p className="text-sm text-gray-400 mt-2 line-clamp-2">{item.description}</p>
              </div>

              <button 
                onClick={() => handleDownload(item)}
                className="mt-auto w-full py-3 bg-white/10 hover:bg-neon-blue hover:text-black border border-white/10 hover:border-neon-blue text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
              >
                <DownloadCloud size={18} className="group-hover/btn:animate-bounce" />
                Descarregar
                <ExternalLink size={14} className="opacity-50" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
