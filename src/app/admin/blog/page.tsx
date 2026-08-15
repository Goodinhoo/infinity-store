import { prisma } from '@/lib/prisma'
import { auth } from '@/../auth'
import { redirect } from 'next/navigation'
import BlogManager from './BlogManager'

export const metadata = {
  title: 'Blog - Admin Infinity Nexus',
}

export default async function AdminBlogPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const posts = await prisma.blogPost.findMany({
    include: { author: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold text-white">Gestão de Blog</h1>
        <p className="text-gray-400 text-sm mt-1">Publica notícias, atualizações e comunicados</p>
      </div>

      <BlogManager posts={posts} />
    </div>
  )
}
