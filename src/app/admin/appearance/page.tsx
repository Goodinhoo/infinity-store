'use client'

import { useState, useEffect } from 'react'
import { getGlobalSettings, saveGlobalSettings } from '@/app/actions/global-settings'
import { Palette, Save, Code, CheckCircle2, Sparkles, RefreshCw, Sliders } from 'lucide-react'
import { Toast } from '@/lib/toast'
import { THEME_PRESETS, ThemePreset } from '@/lib/themes'
import DynamicIcon from '@/components/DynamicIcon'

export default function AdminAppearance() {
  const [activeThemeId, setActiveThemeId] = useState('INFINITY_NEON')
  const [primaryColor, setPrimaryColor] = useState('#bc13fe')
  const [secondaryColor, setSecondaryColor] = useState('#00f0ff')
  const [accentColor, setAccentColor] = useState('#ff007f')
  const [backgroundColor, setBackgroundColor] = useState('#08080c')
  const [cssCode, setCssCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      setLoading(true)
      try {
        const data = await getGlobalSettings()
        setActiveThemeId(data.ACTIVE_THEME || 'INFINITY_NEON')
        setPrimaryColor(data.THEME_PRIMARY_COLOR || '#bc13fe')
        setSecondaryColor(data.THEME_SECONDARY_COLOR || '#00f0ff')
        setAccentColor(data.THEME_ACCENT_COLOR || '#ff007f')
        setBackgroundColor(data.THEME_BACKGROUND_COLOR || '#08080c')
        setCssCode(data.CUSTOM_CSS || '')
      } catch {
        Toast.fire({ icon: 'error', title: 'Erro ao carregar configurações de aparência.' })
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSelectPreset = (preset: ThemePreset) => {
    setActiveThemeId(preset.id)
    setPrimaryColor(preset.primary)
    setSecondaryColor(preset.secondary)
    setAccentColor(preset.accent)
    setBackgroundColor(preset.background)
  }

  const applyLiveStyles = (p: string, s: string, a: string, bg: string, css: string) => {
    // 1. Atualizar estilo de variáveis do tema
    const themeStyles = `
      :root {
        --color-primary: ${p};
        --neon-purple: ${p};
        --neon-blue: ${s};
        --neon-pink: ${a};
        --background: ${bg};
      }
      body {
        background-color: ${bg} !important;
      }
    `
    let themeNode = document.getElementById('theme-variables-live')
    if (themeNode) {
      themeNode.innerHTML = themeStyles
    } else {
      themeNode = document.createElement('style')
      themeNode.id = 'theme-variables-live'
      themeNode.innerHTML = themeStyles
      document.head.appendChild(themeNode)
    }

    // 2. Atualizar CSS personalizado
    let customCssNode = document.getElementById('custom-css-live')
    if (customCssNode) {
      customCssNode.innerHTML = css
    } else {
      customCssNode = document.createElement('style')
      customCssNode.id = 'custom-css-live'
      customCssNode.innerHTML = css
      document.head.appendChild(customCssNode)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await saveGlobalSettings({
        ACTIVE_THEME: activeThemeId,
        THEME_PRIMARY_COLOR: primaryColor,
        THEME_SECONDARY_COLOR: secondaryColor,
        THEME_ACCENT_COLOR: accentColor,
        THEME_BACKGROUND_COLOR: backgroundColor,
        CUSTOM_CSS: cssCode,
      })

      applyLiveStyles(primaryColor, secondaryColor, accentColor, backgroundColor, cssCode)
      Toast.fire({ icon: 'success', title: 'Aparência e tema guardados com sucesso!' })
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao guardar configurações.' })
    } finally {
      setSaving(false)
    }
  }

  // Auto-indent & syntax helper para o editor de CSS
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const end = target.selectionEnd
      const spaces = '  '

      setCssCode((prev) => prev.substring(0, start) + spaces + prev.substring(end))
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + spaces.length
      }, 0)
    }

    if (e.key === 'Enter') {
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const currentLine = cssCode.substring(0, start).split('\n').pop() || ''
      const match = currentLine.match(/^\s+/)
      let spaces = match ? match[0] : ''

      if (currentLine.trim().endsWith('{')) {
        spaces += '  '
      }

      if (spaces) {
        e.preventDefault()
        setCssCode((prev) => prev.substring(0, start) + '\n' + spaces + prev.substring(target.selectionEnd))
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 1 + spaces.length
        }, 0)
      }
    }
  }

  return (
    <div className="p-8 w-full space-y-10 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black uppercase text-white flex items-center gap-3">
            <Palette className="text-neon-purple" size={28} /> Aparência & Temas da Loja
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Escolhe um tema pré-definido, personaliza as cores do site ou adiciona regras de CSS personalizadas.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-6 py-3 bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 flex items-center gap-2 cursor-pointer select-none"
        >
          <Save size={16} />
          {saving ? 'A guardar...' : 'Guardar Aparência'}
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 font-bold">A carregar temas e configurações...</div>
      ) : (
        <>
          {/* Seção 1: Temas Pré-definidos */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-yellow-400" />
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                Temas Pré-definidos
              </h2>
            </div>
            <p className="text-xs text-gray-400">
              Clica num tema para aplicar instantaneamente a sua paleta de cores. Podes ajustar as cores individualmente abaixo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {THEME_PRESETS.map((preset) => {
                const isActive = activeThemeId === preset.id

                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`gale-panel p-6 border rounded-2xl cursor-pointer transition-all duration-300 relative flex flex-col justify-between group ${
                      isActive
                        ? 'border-neon-purple bg-neon-purple/10 shadow-[0_0_25px_rgba(168,85,247,0.25)] scale-[1.02]'
                        : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-white font-bold text-base">
                          <DynamicIcon name={preset.iconName} size={20} className="text-neon-purple" />
                          <span>{preset.name}</span>
                        </div>
                        {isActive && (
                          <span className="px-2.5 py-1 bg-neon-purple text-white text-[10px] uppercase font-black rounded-full flex items-center gap-1 shadow-md">
                            <CheckCircle2 size={12} /> Ativo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed mb-6">
                        {preset.subtitle}
                      </p>
                    </div>

                    {/* Amostras de Cores do Tema */}
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Paleta de Cores
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: preset.primary }}
                          title={`Primária: ${preset.primary}`}
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: preset.secondary }}
                          title={`Secundária: ${preset.secondary}`}
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: preset.accent }}
                          title={`Acento: ${preset.accent}`}
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: preset.background }}
                          title={`Fundo: ${preset.background}`}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Seção 2: Personalização Fina de Cores (Color Pickers) */}
          <section className="gale-panel p-6 border border-white/10 space-y-6 rounded-2xl">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <Sliders size={20} className="text-neon-blue" />
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  Ajuste Fino de Cores (HEX)
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Personaliza manualmente cada cor do tema selecionado.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Cor Primária */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Cor Primária (Destaques)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-11 h-11 rounded-xl bg-transparent border border-white/10 cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-purple font-mono uppercase"
                  />
                </div>
              </div>

              {/* Cor Secundária */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Cor Secundária (Botões/Ações)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-11 h-11 rounded-xl bg-transparent border border-white/10 cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-purple font-mono uppercase"
                  />
                </div>
              </div>

              {/* Cor de Acento */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Cor de Acento (Badges)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-11 h-11 rounded-xl bg-transparent border border-white/10 cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-purple font-mono uppercase"
                  />
                </div>
              </div>

              {/* Cor de Fundo */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Fundo Principal (Background)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-11 h-11 rounded-xl bg-transparent border border-white/10 cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-purple font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Seção 3: Editor de CSS Personalizado */}
          <section className="gale-panel p-6 border border-white/10 space-y-4 rounded-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Code size={20} className="text-neon-pink" />
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">
                    Editor de CSS Personalizado
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Adiciona código CSS adicional para sobrescrever estilos ou criar efeitos visuais avançados.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCssCode('/* Escreve aqui o teu CSS personalizado */\n\n')}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                title="Resetar CSS"
              >
                <RefreshCw size={12} /> Limpar CSS
              </button>
            </div>

            <textarea
              value={cssCode}
              onChange={(e) => setCssCode(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={12}
              className="w-full bg-[#050508] border border-white/10 rounded-xl p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:border-neon-purple leading-relaxed custom-scrollbar shadow-inner"
              placeholder="/* Escreve o teu CSS aqui... */"
            />
          </section>
        </>
      )}
    </div>
  )
}
