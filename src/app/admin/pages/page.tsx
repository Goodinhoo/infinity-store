import { getPages, deletePage } from '@/app/actions/admin-pages'
import Link from 'next/link'
import { FileText, Plus, Trash2, Edit } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function AdminPagesPage() {
  const pages = await getPages()

  const handleDelete = async (formData: FormData) => {
    'use server'
    const id = parseInt(formData.get('id') as string)
    await deletePage(id)
    revalidatePath('/admin/pages')
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            <FileText className="text-neon-purple" size={32} />
            Páginas Personalizadas
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Cria e gere páginas estáticas para a tua loja.</p>
        </div>
        <Link 
          href="/admin/pages/new" 
          className="px-6 py-3 bg-neon-purple/20 text-neon-purple hover:bg-neon-purple/30 border border-neon-purple/30 rounded-xl font-bold flex items-center gap-2 transition-all"
        >
          <Plus size={20} />
          Nova Página
        </Link>
      </div>

      <div className="gale-panel p-6 border border-white/10 rounded-2xl overflow-hidden">
        {pages.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-500 mb-4" size={48} />
            <p className="text-gray-400">Ainda não tens nenhuma página criada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-4 text-xs font-black uppercase text-gray-500 tracking-widest">Título</th>
                  <th className="pb-4 text-xs font-black uppercase text-gray-500 tracking-widest">URL (Slug)</th>
                  <th className="pb-4 text-xs font-black uppercase text-gray-500 tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {pages.map(page => (
                  <tr key={page.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 font-bold text-white">
                      {page.title}
                    </td>
                    <td className="py-4 text-gray-400 font-mono text-sm">
                      /{page.slug}
                    </td>
                    <td className="py-4 flex justify-end gap-2">
                      <Link 
                        href={`/admin/pages/${page.id}`}
                        className="p-2 bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 border border-neon-blue/20 rounded-lg transition-all"
                      >
                        <Edit size={16} />
                      </Link>
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={page.id} />
                        <button 
                          type="submit"
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
