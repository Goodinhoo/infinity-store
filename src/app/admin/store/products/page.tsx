import { prisma } from '@/lib/prisma'
import ProductManager from './ProductManager'
import { auth } from '@/../auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Produtos - Admin Infinity Nexus',
}

export default async function AdminProductsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  
  if (session.user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-gray-400">Não tens permissão para aceder a esta página.</p>
      </div>
    )
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.category.findMany({ orderBy: { order: 'asc' } })
  ])

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold text-white">Gestão de Produtos</h1>
        <p className="text-gray-400 text-sm mt-1">Adiciona e remove produtos do catálogo</p>
      </div>

      <ProductManager products={products} categories={categories} />
    </div>
  )
}
