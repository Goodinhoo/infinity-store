'use client'

import { useState, useEffect } from 'react'
import { getGlobalSettings, saveGlobalSettings } from '@/app/actions/global-settings'
import { Palette, Save, Code } from 'lucide-react'
import { Toast } from '@/lib/toast'

export default function AdminAppearance() {
  const [cssCode, setCssCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      setLoading(true)
      try {
        const data = await getGlobalSettings()
        setCssCode(data.CUSTOM_CSS || '')
      } catch {
        Toast.fire({ icon: 'error', title: 'Erro ao carregar configurações.' })
      } finally {
        setLoading(false)
      }
    }
    
    loadSettings()
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await saveGlobalSettings({ CUSTOM_CSS: cssCode })
      Toast.fire({ icon: 'success', title: 'CSS guardado com sucesso!' })
      
      const existingStyle = document.getElementById('custom-css-live')
      if (existingStyle) {
        existingStyle.innerHTML = cssCode
      } else {
        const styleNode = document.createElement('style')
        styleNode.id = 'custom-css-live'
        styleNode.innerHTML = cssCode
        document.head.appendChild(styleNode)
      }
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao guardar configurações.' })
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const end = target.selectionEnd
      const spaces = '  ' // 2 spaces for indent
      
      setCssCode(prev => prev.substring(0, start) + spaces + prev.substring(end))
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
      
      // Se a linha anterior terminar em '{', aumenta a indentação em 2 espaços
      if (currentLine.trim().endsWith('{')) {
        spaces += '  '
      }
      
      if (spaces) {
        e.preventDefault()
        setCssCode(prev => prev.substring(0, start) + '\n' + spaces + prev.substring(target.selectionEnd))
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 1 + spaces.length
        }, 0)
      }
    }

    if (e.key === '}') {
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const currentLine = cssCode.substring(0, start).split('\n').pop() || ''
      
      // Se estamos a fechar a chave numa linha que só tem espaços, vamos puxá-la para trás 2 espaços
      if (/^\s+$/.test(currentLine) && currentLine.length >= 2) {
        e.preventDefault()
        const newSpaces = currentLine.substring(0, currentLine.length - 2)
        const textBeforeLine = cssCode.substring(0, start - currentLine.length)
        
        setCssCode(prev => textBeforeLine + newSpaces + '}' + prev.substring(target.selectionEnd))
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = textBeforeLine.length + newSpaces.length + 1
        }, 0)
      }
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">A carregar...</div>

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black uppercase text-white mb-1 flex items-center gap-3">
            <Palette className="text-neon-purple" size={28} />
            Aparência & Custom CSS
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl">
            Escreve regras de CSS personalizadas para alterar a aparência visual de qualquer elemento do site. 
            Este CSS será carregado e injetado globalmente em todas as páginas públicas e personalizadas.
          </p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="px-6 py-2.5 bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer select-none"
        >
          <Save size={18} />
          {saving ? 'A Guardar...' : 'Guardar CSS'}
        </button>
      </div>

      <div className="gale-panel border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
        <div className="bg-black/50 border-b border-white/10 p-3 flex items-center gap-2 text-gray-400 font-mono text-sm px-5">
          <Code size={16} className="text-emerald-500" />
          <span>style.css</span>
        </div>
        <textarea
          value={cssCode}
          onChange={e => setCssCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="flex-1 w-full bg-[#030305] p-6 text-sm text-emerald-400 font-mono focus:outline-none resize-none leading-relaxed"
          placeholder="/* Exemplo: */&#10;.gale-panel { border-color: red !important; }"
        />
      </div>

      <div className="bg-neon-blue/10 border border-neon-blue/20 rounded-xl p-6 text-sm text-gray-300 flex flex-col gap-2">
        <h3 className="font-bold text-neon-blue uppercase tracking-widest text-xs mb-2">Dicas de CSS</h3>
        <p>• Podes utilizar a flag <code className="text-white bg-black/40 px-1 py-0.5 rounded">!important</code> se precisares de forçar a sobreposição do estilo padrão.</p>
        <p>• Podes inspecionar a página (F12) para descobrires a class dos elementos (por exemplo: <code className="text-white bg-black/40 px-1 py-0.5 rounded">.gale-panel</code>).</p>
        <p>• As alterações aplicam-se a <b>todo o site</b> instantaneamente após guardares e atualizar a página.</p>
      </div>
    </div>
  )
}
