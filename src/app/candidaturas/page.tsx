'use client'

import { useState, useEffect } from 'react'
import { getFormsPublic, submitForm } from '@/app/actions/admin-forms'
import { getModules } from '@/app/actions/settings'
import { ClipboardList, Sparkles, Send, CheckCircle2, User, ShieldAlert } from 'lucide-react'
import { Toast } from '@/lib/toast'

type FormItem = {
  id: number
  title: string
  description: string | null
  questions: { id: number; question: string; type: string; options: string | null; isRequired: boolean }[]
}

export default function PublicCandidaturas() {
  const [forms, setForms] = useState<FormItem[]>([])
  const [selectedForm, setSelectedForm] = useState<FormItem | null>(null)
  const [player, setPlayer] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submittedSuccess, setSubmittedSuccess] = useState(false)

  const [isModuleActive, setIsModuleActive] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [data, modules] = await Promise.all([getFormsPublic(), getModules()])
        if (!modules.MODULE_APPLICATIONS) {
          setIsModuleActive(false)
        }
        setForms(data)
        if (data.length > 0) {
          setSelectedForm(data[0])
        }
      } catch {
        Toast.fire({ icon: 'error', title: 'Erro ao carregar formulários de candidatura.' })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedForm) return

    if (!player.trim()) {
      Toast.fire({ icon: 'warning', title: 'Por favor introduz o teu Nickname no Minecraft.' })
      return
    }

    // Check required questions
    for (const q of selectedForm.questions) {
      if (q.isRequired && (!answers[q.question] || !answers[q.question].trim())) {
        Toast.fire({ icon: 'warning', title: `Por favor responde à pergunta: "${q.question}"` })
        return
      }
    }

    setSubmitting(true)
    try {
      await submitForm({
        formId: selectedForm.id,
        player: player.trim(),
        answers
      })
      setSubmittedSuccess(true)
      Toast.fire({ icon: 'success', title: 'Candidatura submetida com sucesso!' })
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao submeter a candidatura. Tenta novamente.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-12 text-center text-gray-400">A carregar formulários de candidatura...</div>

  if (!isModuleActive) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <ShieldAlert size={64} className="text-red-500 mb-6" />
        <h1 className="text-4xl font-black text-white uppercase tracking-widest mb-4 text-center">Acesso Restrito</h1>
        <p className="text-gray-400 text-center max-w-lg mb-8">
          O módulo de Candidaturas & Recrutamento encontra-se desativado no momento.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 py-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-xs font-bold uppercase tracking-widest">
          <Sparkles size={14} />
          Junta-te à Nossa Equipa
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-wider">
          Candidaturas & Recrutamento
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
          Queres ajudar a comunidade e fazer parte do crescimento do nosso servidor? Escolhe um formulário e submete a tua candidatura!
        </p>
      </div>

      {forms.length === 0 ? (
        <div className="gale-panel p-12 text-center text-gray-500 rounded-2xl border border-white/10">
          <ClipboardList size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="font-semibold text-lg">Não existem recrutamentos abertos de momento.</p>
          <p className="text-sm text-gray-500 mt-1">Fica atento às nossas redes sociais para quando abrirmos novas vagas!</p>
        </div>
      ) : submittedSuccess ? (
        <div className="gale-panel p-12 text-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-4 shadow-2xl">
          <CheckCircle2 size={56} className="mx-auto text-emerald-400" />
          <h2 className="text-2xl font-black text-white">Candidatura Submetida!</h2>
          <p className="text-gray-300 text-sm max-w-md mx-auto">
            A tua candidatura foi enviada com sucesso para a administração. Analisaremos as tuas respostas brevemente!
          </p>
          <button
            onClick={() => {
              setSubmittedSuccess(false)
              setAnswers({})
              setPlayer('')
            }}
            className="mt-4 px-6 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-sm hover:bg-emerald-500/30 transition-colors"
          >
            Submeter Outra Candidatura
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Select Form if multiple */}
          {forms.length > 1 && (
            <div className="flex flex-wrap justify-center gap-3">
              {forms.map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedForm(f)
                    setAnswers({})
                  }}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                    selectedForm?.id === f.id
                      ? 'bg-neon-purple text-white border-neon-purple shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {f.title}
                </button>
              ))}
            </div>
          )}

          {/* Form Content */}
          {selectedForm && (
            <form onSubmit={handleSubmit} className="gale-panel p-8 rounded-2xl border border-white/10 space-y-6 shadow-2xl">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-2xl font-black text-white">{selectedForm.title}</h2>
                {selectedForm.description && (
                  <p className="text-sm text-gray-400 mt-1 leading-relaxed">{selectedForm.description}</p>
                )}
              </div>

              {/* Player Minecraft Nickname */}
              <div>
                <label className="block text-xs font-bold text-neon-purple uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <User size={14} /> Nickname no Minecraft *
                </label>
                <input
                  type="text"
                  required
                  value={player}
                  onChange={e => setPlayer(e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple/50"
                  placeholder="Ex: Goodinhoo"
                />
              </div>

              {/* Dynamic Questions */}
              {selectedForm.questions.map((q, idx) => (
                <div key={q.id} className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                    {idx + 1}. {q.question} {q.isRequired && <span className="text-red-400">*</span>}
                  </label>
                  <textarea
                    rows={3}
                    required={q.isRequired}
                    value={answers[q.question] || ''}
                    onChange={e => setAnswers({ ...answers, [q.question]: e.target.value })}
                    className="w-full bg-[#050508] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-neon-purple/50 resize-none leading-relaxed"
                    placeholder="Escreve a tua resposta aqui..."
                  />
                </div>
              ))}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-neon-purple text-white font-bold rounded-xl text-base hover:bg-neon-purple/80 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50"
                >
                  <Send size={18} />
                  {submitting ? 'A Submeter...' : 'Submeter Candidatura'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
