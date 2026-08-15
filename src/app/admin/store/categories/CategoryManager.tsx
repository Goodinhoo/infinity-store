'use client'

import Link from 'next/link'
import { PlusCircle, Edit, Layers, EyeOff, Trash2 } from 'lucide-react'
import { deleteCategory } from '@/app/actions/admin-categories'
import { Toast } from '@/lib/toast'
import Swal from 'sweetalert2'

type CategoryProps = {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  order: number
  isHidden: boolean
  createdAt: Date
  products: { id: number }[]
}

export default function CategoryManager({ categories }: { categories: CategoryProps[] }) {
  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: 'Tem a certeza?',
      text: `Deseja eliminar a categoria "${name}"?`,
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
      const res = await deleteCategory(id)
      if (res.success) {
        Toast.fire({ icon: 'success', title: 'Categoria eliminada!' })
      } else {
        Toast.fire({ icon: 'error', title: res.error || 'Erro ao eliminar' })
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-bold text-white flex items-center gap-2">
          <Layers size={18} className="text-neon-blue" />
          Categorias Existentes ({categories.length})
        </h2>
        <Link
          href="/admin/store/categories/new"
          className="bg-neon-purple text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:bg-neon-purple/80 transition-all flex items-center gap-2 select-none"
        >
          <PlusCircle size={16} /> Nova Categoria
        </Link>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-4">
        {categories.length === 0 ? (
          <div className="gale-panel p-12 text-center text-gray-400 border border-white/10 rounded-2xl">
            <Layers size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-bold">Nenhuma categoria criada.</p>
            <p className="text-xs text-gray-500 mt-1">Clica no botão &quot;Nova Categoria&quot; acima para organizares os teus produtos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`gale-panel p-5 border flex flex-col justify-between gap-4 transition-all rounded-2xl ${
                  cat.isHidden
                    ? 'border-red-500/30 opacity-70 bg-black/40'
                    : 'border-white/10 hover:border-neon-purple/50'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 font-mono">
                      Ordem: #{cat.order}
                    </span>
                    {cat.isHidden && (
                      <span className="text-[10px] uppercase font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 flex items-center gap-1">
                        <EyeOff size={10} /> Oculta
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-white text-lg leading-tight flex items-center gap-2">
                    {cat.name}
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-1">/{cat.slug}</p>
                  <p className="text-xs text-neon-blue mt-2 font-medium">
                    {cat.products.length} {cat.products.length === 1 ? 'produto associado' : 'produtos associados'}
                  </p>
                </div>

                <div className="flex gap-2 justify-end mt-2 pt-4 border-t border-white/5">
                  <Link
                    href={`/admin/store/categories/${cat.id}`}
                    className="w-[36px] h-[36px] flex items-center justify-center bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-all"
                    title="Editar Categoria"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="w-[36px] h-[36px] flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all"
                    title="Eliminar Categoria"
                  >
                    <Trash2 size={16} />
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
