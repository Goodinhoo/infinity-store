import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import CategoryManager from './CategoryManager'
import { auth } from '@/../auth'

export const metadata = {
  title: 'Categorias - Admin Infinity Nexus',
}

export default async function AdminCategoriesPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const categories = await prisma.category.findMany({
    include: { products: true },
    orderBy: { order: 'asc' }
  })

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold text-white">Gestão de Categorias</h1>
        <p className="text-gray-400 text-sm mt-1">Cria e organiza as categorias da loja</p>
      </div>

      <CategoryManager categories={categories} />
    </div>
  )
}
