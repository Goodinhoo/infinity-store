import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'
import { redirect } from 'next/navigation'
import { ProductForm } from '../_components/ProductForm'

export const metadata = {
  title: 'Editar Produto - Admin Infinity Nexus',
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login')

  const resolvedParams = await params
  const productId = parseInt(resolvedParams.id)
  if (isNaN(productId)) redirect('/admin/store/products')

  const [product, categories, servers] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId } }),
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
    prisma.minecraftServer.findMany({ orderBy: { name: 'asc' } })
  ])

  if (!product) redirect('/admin/store/products')

  return <ProductForm product={product} categories={categories} servers={servers} />
}
