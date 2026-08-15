import { auth } from '@/../auth'
import { redirect } from 'next/navigation'
import { CategoryForm } from '../_components/CategoryForm'

export const metadata = {
  title: 'Criar Categoria - Admin Infinity Nexus',
}

export default async function NewCategoryPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login')

  return <CategoryForm />
}
