import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'
import { redirect } from 'next/navigation'
import CouponManager from './CouponManager'

export const metadata = {
  title: 'Cupões - Admin Infinity Nexus',
}

export default async function AdminCouponsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  
  if (session.user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-gray-400">Não tens permissão para aceder a esta página.</p>
      </div>
    )
  }

  const coupons = await prisma.coupon.findMany({
    include: {
      categories: { select: { id: true, name: true } },
      products: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  const products = await prisma.product.findMany({
    select: { id: true, name: true, category: { select: { name: true } } },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold text-white">Gestão de Cupões</h1>
        <p className="text-gray-400 text-sm mt-1">Cria códigos promocionais para o carrinho de compras</p>
      </div>

      <CouponManager coupons={coupons} allCategories={categories} allProducts={products} />
    </div>
  )
}
