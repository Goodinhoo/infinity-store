'use client'

import { useState, useEffect, useRef } from 'react'
import { getGlobalSettings, saveGlobalSettings, uploadImage, GlobalSettings } from '@/app/actions/global-settings'
import { Save, Image as ImageIcon, Server, Type, Link as LinkIcon, Loader2 } from 'lucide-react'
import { Toast } from '@/lib/toast'
import Image from 'next/image'

export default function AdminSettings() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const logoRef = useRef<HTMLInputElement>(null)
  const faviconRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const data = await getGlobalSettings()
      setSettings(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleChange = (key: keyof GlobalSettings, value: string) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: keyof GlobalSettings) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append(key, file)

    Toast.fire({ icon: 'info', title: 'A fazer upload...', showConfirmButton: false, timer: 0 })
    
    const res = await uploadImage(formData, key)
    if (res.success && res.url) {
      handleChange(key, res.url)
      Toast.fire({ icon: 'success', title: 'Upload concluído!' })
    } else {
      Toast.fire({ icon: 'error', title: res.error || 'Erro no upload.' })
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return
    setSaving(true)
    
    const res = await saveGlobalSettings(settings)
    setSaving(false)
    
    if (res.success) {
      Toast.fire({ icon: 'success', title: 'Configurações guardadas!' })
    } else {
      Toast.fire({ icon: 'error', title: res.error || 'Erro ao guardar.' })
    }
  }

  if (loading || !settings) return <div className="p-8 text-center text-gray-400">A carregar...</div>

  return (
    <div className="p-8 w-full space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black uppercase text-white mb-1">Configurações Gerais</h1>
        <p className="text-gray-400 text-sm">Gerencie o nome da loja, logótipo, IP do servidor e muito mais.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* IDENTIDADE & TOPO DO SITE */}
        <div className="gale-panel p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-500">
              <ImageIcon size={16} />
            </div>
            <h2 className="font-bold text-white uppercase tracking-wider text-sm">Identidade & Topo do Site</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Favicon */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Favicon (Aba do Browser)</label>
              <div className="bg-black/50 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-4 h-40 relative group">
                {settings.STORE_FAVICON_URL && (
                  <Image src={settings.STORE_FAVICON_URL} alt="Favicon" width={32} height={32} className="object-contain" />
                )}
                <button 
                  type="button"
                  onClick={() => faviconRef.current?.click()}
                  className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                >
                  Alterar Favicon
                </button>
                <input type="file" ref={faviconRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'STORE_FAVICON_URL')} />
              </div>
            </div>

            {/* Logo */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Logótipo (Menu Principal)</label>
              <div className="bg-black/50 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-4 h-40 relative group">
                {settings.STORE_LOGO_URL && (
                  <Image src={settings.STORE_LOGO_URL} alt="Logo" width={64} height={64} className="object-contain" />
                )}
                <button 
                  type="button"
                  onClick={() => logoRef.current?.click()}
                  className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                >
                  Alterar Logótipo
                </button>
                <input type="file" ref={logoRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'STORE_LOGO_URL')} />
              </div>
            </div>
          </div>

          {/* Nome da Loja */}
          <div className="flex flex-col gap-2 mb-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nome da Loja</label>
            <input 
              type="text" 
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple" 
              value={settings.STORE_NAME} 
              onChange={(e) => handleChange('STORE_NAME', e.target.value)} 
              required 
            />
          </div>

          {/* Descrição do Banner */}
          <div className="flex flex-col gap-2 mb-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mensagem do Banner Principal</label>
            <input 
              type="text" 
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple" 
              value={settings.STORE_BANNER_DESC} 
              onChange={(e) => handleChange('STORE_BANNER_DESC', e.target.value)} 
              placeholder="Ex: Aqui poderá obter uma grande variedade de itens..."
            />
          </div>

          {/* Banner */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Banner Principal (Fundo da Homepage)</label>
            <div className="bg-black/50 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-4 h-64 relative group overflow-hidden">
              {settings.STORE_BANNER_URL && (
                <Image src={settings.STORE_BANNER_URL} alt="Banner" fill className="object-cover opacity-60" />
              )}
              <button 
                type="button"
                onClick={() => bannerRef.current?.click()}
                className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold z-10"
              >
                Fazer Upload do Banner (1920x400)
              </button>
              <input type="file" ref={bannerRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'STORE_BANNER_URL')} />
            </div>
          </div>
        </div>

        {/* SERVIDOR (MEIO DO SITE) */}
        <div className="gale-panel p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-neon-blue/20 flex items-center justify-center text-neon-blue">
              <Server size={16} />
            </div>
            <h2 className="font-bold text-white uppercase tracking-wider text-sm">Servidor (Página Inicial & Footer)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">IP do Servidor Minecraft</label>
              <input 
                type="text" 
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-blue" 
                value={settings.SERVER_IP} 
                onChange={(e) => handleChange('SERVER_IP', e.target.value)} 
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Versões Suportadas</label>
              <input 
                type="text" 
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-blue" 
                value={settings.SERVER_VERSIONS} 
                onChange={(e) => handleChange('SERVER_VERSIONS', e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* RODAPÉ (FOOTER) */}
        <div className="gale-panel p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-neon-purple/20 flex items-center justify-center text-neon-purple">
              <Type size={16} />
            </div>
            <h2 className="font-bold text-white uppercase tracking-wider text-sm">Detalhes do Rodapé (Footer)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descrição (SEO & Footer)</label>
              <textarea 
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple" 
                value={settings.STORE_DESC} 
                onChange={(e) => handleChange('STORE_DESC', e.target.value)} 
                rows={3}
                required 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">URL do Discord (Botão e Footer)</label>
              <div className="relative">
                <LinkIcon size={16} className="absolute left-4 top-3.5 text-gray-500" />
                <input 
                  type="text" 
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple" 
                  value={settings.DISCORD_URL} 
                  onChange={(e) => handleChange('DISCORD_URL', e.target.value)} 
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* SAVE BUTTON */}
        <div className="fixed bottom-6 right-8 z-50">
          <button 
            type="submit" 
            disabled={saving}
            className="px-8 py-3 bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer select-none border border-white/20"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
            {saving ? 'A Guardar...' : 'Guardar Alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}
