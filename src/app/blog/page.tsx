import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, Calendar, ArrowRight, Layers } from 'lucide-react'

export const metadata = {
  title: 'Notícias & Comunicados - Infinity Nexus',
  description: 'Acompanha todas as atualizações e novidades da rede Infinity Nexus.',
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    include: { author: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <header className="gale-panel p-8 border border-white/10 bg-gradient-to-r from-[#0d0d18] via-[#150a25] to-[#08080c]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-neon-purple/10 border border-neon-purple/30 text-neon-purple">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Notícias & Atualizações</h1>
            <p className="text-sm text-gray-400">Fica a par dos novos eventos, atualizações e comunicados da equipa</p>
          </div>
        </div>
      </header>

      {posts.length === 0 ? (
        <div className="gale-panel p-16 text-center text-gray-400">
          <Layers size={48} className="mx-auto mb-3 opacity-20 text-neon-purple" />
          <p className="font-bold">Ainda não existem notícias publicadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 min-[1920px]:grid-cols-5 min-[2560px]:grid-cols-6 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="gale-panel p-6 hover:border-neon-purple/40 transition-all flex flex-col justify-between gap-4 group">
              <div className="flex flex-col gap-3">
                {post.imageUrl && (
                  <div className="w-full h-40 rounded-xl bg-black/40 border border-white/5 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={14} className="text-neon-purple" />
                  <span>{new Date(post.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
                <h2 className="font-bold text-lg text-white group-hover:text-neon-blue transition-colors">{post.title}</h2>
                <div className="text-xs text-gray-400 line-clamp-3 leading-relaxed [&>p]:inline [&>ul]:hidden [&>ol]:hidden [&>h1]:inline [&>h2]:inline [&>blockquote]:inline [&>img]:hidden [&>a]:text-neon-blue [&>a]:underline" dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>

              <span className="text-xs font-bold text-neon-blue flex items-center gap-1 pt-3 border-t border-white/5">
                Ler comunicado completo <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
