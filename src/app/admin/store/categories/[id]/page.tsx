import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'
import { redirect } from 'next/navigation'
import { CategoryForm } from '../_components/CategoryForm'

export const metadata = {
  title: 'Editar Categoria - Admin Infinity Nexus',
}

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login')

  const resolvedParams = await params
  const categoryId = parseInt(resolvedParams.id)
  if (isNaN(categoryId)) redirect('/admin/store/categories')

  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category) redirect('/admin/store/categories')

  return <CategoryForm category={category} />
}
