'use client'

import { useState } from 'react'
import { BookOpen, PlusCircle, Edit } from 'lucide-react'
import { createBlogPost, updateBlogPost, deleteBlogPost } from '@/app/actions/admin-blog'
import { Toast } from '@/lib/toast'
import Swal from 'sweetalert2'
import Modal from '@/components/Modal'
import RichTextEditor from '@/components/RichTextEditor'

type PostProps = {
  id: number
  title: string
  slug: string
  content: string
  imageUrl: string | null
  createdAt: Date
}

export default function BlogManager({ posts }: { posts: PostProps[] }) {
  const [loading, setLoading] = useState(false)
  const [editingPost, setEditingPost] = useState<PostProps | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    imageUrl: ''
  })
  const [contentHtml, setContentHtml] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const form = new FormData(e.currentTarget)
    form.set('content', contentHtml)
    
    if (editingPost) {
      const res = await updateBlogPost(editingPost.id, form)
      if (res.success) {
        Toast.fire({ icon: 'success', title: 'Artigo atualizado!' })
        setEditingPost(null)
        setFormData({ title: '', slug: '', imageUrl: '' })
        setContentHtml('')
        setIsModalOpen(false)
      } else {
        Toast.fire({ icon: 'error', title: res.error || 'Erro ao atualizar' })
      }
    } else {
      const res = await createBlogPost(form)
      if (res.success) {
        Toast.fire({ icon: 'success', title: 'Artigo publicado!' })
        setFormData({ title: '', slug: '', imageUrl: '' })
        setContentHtml('')
        setIsModalOpen(false)
      } else {
        Toast.fire({ icon: 'error', title: res.error || 'Erro ao criar' })
      }
    }
    
    setLoading(false)
  }

  const handleEdit = (post: PostProps) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      imageUrl: post.imageUrl || ''
    })
    setContentHtml(post.content)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number, title: string) => {
    const result = await Swal.fire({
      title: 'Tem a certeza?',
      text: `Deseja eliminar o artigo "${title}"?`,
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
      const res = await deleteBlogPost(id)
      if (res.success) {
        Toast.fire({ icon: 'success', title: 'Artigo eliminado!' })
        if (editingPost?.id === id) {
          setEditingPost(null)
          setFormData({ title: '', slug: '', imageUrl: '' })
          setContentHtml('')
        }
      } else {
        Toast.fire({ icon: 'error', title: res.error || 'Erro ao eliminar' })
      }
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setEditingPost(null)
      setFormData({ title: '', slug: '', imageUrl: '' })
      setContentHtml('')
    }, 300)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-bold text-white flex items-center gap-2">
          <BookOpen size={18} className="text-neon-blue" />
          Artigos Existentes ({posts.length})
        </h2>
        <button 
          onClick={() => {
            setEditingPost(null)
            setFormData({ title: '', slug: '', imageUrl: '' })
            setContentHtml('')
            setIsModalOpen(true)
          }}
          className="bg-neon-purple text-white px-4 py-2 rounded-xl font-bold text-sm shadow-[0_0_15px_-3px_rgba(188,19,254,0.4)] hover:scale-105 transition-all flex items-center gap-2"
        >
          <PlusCircle size={16} /> Novo Artigo
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCancel}
        title={
          <>
            {editingPost ? <Edit size={18} className="text-neon-pink" /> : <PlusCircle size={18} className="text-neon-purple" />}
            {editingPost ? 'Editar Artigo' : 'Novo Artigo'}
          </>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Título *</label>
            <input name="title" type="text" placeholder="Título do artigo" required
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Slug (URL) *</label>
            <input name="slug" type="text" placeholder="Ex: novidades-agosto-2026" required
              value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Conteúdo *</label>
            <RichTextEditor 
              content={contentHtml} 
              onChange={setContentHtml} 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">URL da Imagem de Capa</label>
            <input name="imageUrl" type="url" placeholder="https://..."
              value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple" />
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10 mt-4">
            <button type="button" onClick={handleCancel} disabled={loading} className="flex-1 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-bold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer select-none">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-5 py-2.5 bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer select-none">
              {loading ? 'A processar...' : (editingPost ? 'Guardar Artigo' : 'Publicar Artigo')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Lista */}
      <div className="flex flex-col gap-4">

        {posts.length === 0 ? (
          <div className="gale-panel p-12 text-center text-gray-400 border border-white/10">
            <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-bold">Nenhum artigo publicado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {posts.map((post) => (
              <div key={post.id} className="gale-panel p-5 border border-white/10 flex justify-between items-center gap-4 hover:border-neon-purple/50 transition-colors">
                <div>
                  <p className="font-bold text-white">{post.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(post.createdAt).toLocaleDateString('pt-PT')} • /blog/{post.slug}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(post)} className="w-[36px] h-[36px] flex items-center justify-center bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-all" title="Editar Artigo">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(post.id, post.title)} className="w-[36px] h-[36px] flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all" title="Eliminar Artigo">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
