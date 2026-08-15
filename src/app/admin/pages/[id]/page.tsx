import PageForm from '../_components/PageForm'
import { getPage, updatePage } from '@/app/actions/admin-pages'
import { FileText } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: paramId } = await params
  const id = parseInt(paramId)
  if (isNaN(id)) notFound()

  const page = await getPage(id)
  if (!page) notFound()

  const handleSubmit = async (title: string, slug: string, content: string) => {
    'use server'
    return await updatePage(id, title, slug, content)
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-bold">
          <Link href="/admin/pages" className="hover:text-white transition-colors">Páginas</Link>
          <span>/</span>
          <span className="text-neon-purple">Editar</span>
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-widest flex items-center gap-3">
          <FileText className="text-neon-purple" size={32} />
          Editar Página
        </h1>
        <p className="text-gray-400 mt-2 text-sm">Atualiza os dados e o conteúdo da página.</p>
      </div>

      <div className="gale-panel p-6 border border-white/10 rounded-2xl">
        <PageForm 
          initialData={page}
          onSubmit={handleSubmit} 
          submitLabel="Atualizar Página"
        />
      </div>
    </div>
  )
}
