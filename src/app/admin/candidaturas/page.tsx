'use client'

import { useState, useEffect } from 'react'
import { getFormsAdmin, createForm, deleteForm, getSubmissionsAdmin, updateSubmissionStatus } from '@/app/actions/admin-forms'
import { Plus, Trash2, ClipboardList, CheckCircle, XCircle, Clock, FileText, Eye, User } from 'lucide-react'
import { Toast } from '@/lib/toast'
import Modal from '@/components/Modal'

type FormQuestion = {
  question: string
  type: string
  options?: string
  isRequired: boolean
}

type FormItem = {
  id: number
  title: string
  description: string | null
  isActive: boolean
  createdAt: Date
  questions: { id: number; question: string; type: string; options: string | null; isRequired: boolean }[]
  submissions: { id: number }[]
}

type SubmissionItem = {
  id: number
  player: string
  answers: string
  status: string
  createdAt: Date
  form: { id: number; title: string }
}

export default function AdminCandidaturas() {
  const [activeTab, setActiveTab] = useState<'submissions' | 'forms'>('submissions')
  const [forms, setForms] = useState<FormItem[]>([])
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [loading, setLoading] = useState(true)

  // Form Builder Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fTitle, setFTitle] = useState('')
  const [fDesc, setFDesc] = useState('')
  const [fQuestions, setFQuestions] = useState<FormQuestion[]>([
    { question: 'Qual a tua idade e disponibilidade de horário?', type: 'TEXTAREA', isRequired: true },
    { question: 'Por que motivo te queres candidatar à equipa?', type: 'TEXTAREA', isRequired: true }
  ])

  // View Submission Modal State
  const [viewSubmission, setViewSubmission] = useState<SubmissionItem | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [fData, sData] = await Promise.all([getFormsAdmin(), getSubmissionsAdmin()])
      setForms(fData)
      setSubmissions(sData)
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao carregar candidaturas.' })
    } finally {
      setLoading(false)
    }
  }

  function handleAddQuestion() {
    setFQuestions([...fQuestions, { question: '', type: 'TEXTAREA', isRequired: true }])
  }

  function handleRemoveQuestion(idx: number) {
    if (fQuestions.length <= 1) return
    setFQuestions(fQuestions.filter((_, i) => i !== idx))
  }

  async function handleSaveForm() {
    if (!fTitle.trim()) {
      Toast.fire({ icon: 'warning', title: 'Preenche o título do formulário.' })
      return
    }

    const validQuestions = fQuestions.filter(q => q.question.trim() !== '')
    if (validQuestions.length === 0) {
      Toast.fire({ icon: 'warning', title: 'Adiciona pelo menos uma pergunta válida.' })
      return
    }

    try {
      await createForm({
        title: fTitle,
        description: fDesc,
        questions: validQuestions
      })
      Toast.fire({ icon: 'success', title: 'Formulário criado com sucesso!' })
      setIsModalOpen(false)
      loadData()
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao criar formulário.' })
    }
  }

  async function handleDeleteForm(id: number) {
    if (!confirm('Tens a certeza que queres eliminar este formulário e todas as candidaturas associadas?')) return

    try {
      await deleteForm(id)
      Toast.fire({ icon: 'success', title: 'Formulário eliminado!' })
      loadData()
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao eliminar formulário.' })
    }
  }

  async function handleUpdateStatus(id: number, status: string) {
    try {
      await updateSubmissionStatus(id, status)
      Toast.fire({ icon: 'success', title: `Estado alterado para ${status}` })
      if (viewSubmission && viewSubmission.id === id) {
        setViewSubmission({ ...viewSubmission, status })
      }
      loadData()
    } catch {
      Toast.fire({ icon: 'error', title: 'Erro ao atualizar estado.' })
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">A carregar...</div>

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase text-white mb-1 flex items-center gap-3">
            <ClipboardList className="text-neon-purple" size={28} />
            Candidaturas & Recrutamento
          </h1>
          <p className="text-gray-400 text-sm">
            Cria formulários personalizados de recrutamento e analisa as candidaturas submetidas pelos jogadores.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-neon-purple/20 text-neon-purple border border-neon-purple/30 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-neon-purple/30 transition-colors shadow-lg"
        >
          <Plus size={18} /> Novo Formulário
        </button>
      </div>

      {/* Tabs Header */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${
            activeTab === 'submissions'
              ? 'bg-neon-purple text-white'
              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <FileText size={16} /> Candidaturas Submetidas ({submissions.length})
        </button>
        <button
          onClick={() => setActiveTab('forms')}
          className={`px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${
            activeTab === 'forms'
              ? 'bg-neon-purple text-white'
              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <ClipboardList size={16} /> Construtor de Formulários ({forms.length})
        </button>
      </div>

      {/* Tab Content: Submissions */}
      {activeTab === 'submissions' && (
        <div className="gale-panel border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-black/40 text-gray-400 uppercase text-xs tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Jogador</th>
                <th className="p-4">Formulário</th>
                <th className="p-4">Data</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-black/20">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Nenhuma candidatura submetida até ao momento.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <User size={16} className="text-neon-purple" />
                      {sub.player}
                    </td>
                    <td className="p-4 text-gray-300">
                      {sub.form?.title || 'Formulário'}
                    </td>
                    <td className="p-4 text-gray-400 text-xs">
                      {new Date(sub.createdAt).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="p-4">
                      {sub.status === 'APPROVED' && (
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold flex items-center w-fit gap-1">
                          <CheckCircle size={12} /> Aprovado
                        </span>
                      )}
                      {sub.status === 'REJECTED' && (
                        <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-bold flex items-center w-fit gap-1">
                          <XCircle size={12} /> Rejeitado
                        </span>
                      )}
                      {sub.status === 'PENDING' && (
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold flex items-center w-fit gap-1">
                          <Clock size={12} /> Pendente
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setViewSubmission(sub)}
                        className="px-3 py-1.5 bg-neon-purple/20 text-neon-purple hover:bg-neon-purple/30 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye size={14} /> Analisar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Forms */}
      {activeTab === 'forms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {forms.length === 0 ? (
            <div className="col-span-2 gale-panel p-8 text-center text-gray-500 rounded-2xl border border-white/10">
              Nenhum formulário ativo. Clica no botão acima para criar o primeiro!
            </div>
          ) : (
            forms.map((f) => (
              <div key={f.id} className="gale-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4 shadow-xl">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2">{f.description || 'Sem descrição'}</p>
                  <div className="mt-4 pt-3 border-t border-white/5 flex justify-between text-xs text-gray-400 font-mono">
                    <span>{f.questions.length} Pergunta(s)</span>
                    <span>{f.submissions.length} Resposta(s)</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleDeleteForm(f.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    title="Eliminar Formulário"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Construtor de Formulário */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <ClipboardList className="text-neon-purple" size={22} />
            Novo Formulário de Recrutamento
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Título do Formulário *</label>
            <input
              type="text"
              value={fTitle}
              onChange={e => setFTitle(e.target.value)}
              className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple/50"
              placeholder="Ex: Candidatura a Helper 2026"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Descrição / Instruções (Opcional)</label>
            <textarea
              rows={2}
              value={fDesc}
              onChange={e => setFDesc(e.target.value)}
              className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-neon-purple/50 resize-none"
              placeholder="Explica o que procuram no candidato..."
            />
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-neon-purple uppercase tracking-widest">Perguntas do Formulário</label>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1 rounded-lg flex items-center gap-1 font-bold"
              >
                <Plus size={14} /> Adicionar Pergunta
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {fQuestions.map((q, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="text-xs font-mono font-bold text-gray-500">{idx + 1}.</span>
                  <input
                    type="text"
                    value={q.question}
                    onChange={e => {
                      const updated = [...fQuestions]
                      updated[idx].question = e.target.value
                      setFQuestions(updated)
                    }}
                    className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neon-purple/50"
                    placeholder="Escreve a Pergunta..."
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setIsModalOpen(false)}
            className="flex-1 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-bold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveForm}
            className="flex-1 px-5 py-2.5 bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            Criar Formulário
          </button>
        </div>
      </Modal>

      {/* Modal Analisar Candidatura */}
      {viewSubmission && (
        <Modal
          isOpen={!!viewSubmission}
          onClose={() => setViewSubmission(null)}
          title={
            <div className="flex items-center gap-3">
              <User className="text-neon-purple" size={22} />
              Candidatura de {viewSubmission.player}
            </div>
          }
        >
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            <div className="bg-black/40 p-4 rounded-xl border border-white/10 flex justify-between items-center text-xs">
              <span className="text-gray-400">Formulário: <b className="text-white">{viewSubmission.form?.title}</b></span>
              <span className="text-gray-400">Data: <b className="text-white">{new Date(viewSubmission.createdAt).toLocaleString('pt-PT')}</b></span>
            </div>

            <div className="space-y-4">
              {Object.entries(JSON.parse(viewSubmission.answers || '{}')).map(([question, answer], idx) => (
                <div key={idx} className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-1.5">
                  <p className="text-xs font-bold text-neon-purple uppercase tracking-wider">{idx + 1}. {question}</p>
                  <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{String(answer)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => handleUpdateStatus(viewSubmission.id, 'REJECTED')}
              className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-sm hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle size={16} /> Rejeitar
            </button>
            <button
              onClick={() => handleUpdateStatus(viewSubmission.id, 'APPROVED')}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-sm hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} /> Aprovar Candidatura
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
