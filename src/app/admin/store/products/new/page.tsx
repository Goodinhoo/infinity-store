import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'
import { redirect } from 'next/navigation'
import { ProductForm } from '../_components/ProductForm'

export const metadata = {
  title: 'Criar Produto - Admin Infinity Nexus',
}

export default async function NewProductPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login')

  const [categories, servers] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
    prisma.minecraftServer.findMany({ orderBy: { name: 'asc' } })
  ])

  return <ProductForm categories={categories} servers={servers} />
}
