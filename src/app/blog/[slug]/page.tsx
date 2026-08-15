import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug } })
  return {
    title: post ? `${post.title} - Blog Infinity Nexus` : 'Artigo Não Encontrado',
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { author: true }
  })

  if (!post) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in my-6">
      <Link href="/blog" className="text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 w-fit">
        <ArrowLeft size={14} /> Voltar às notícias
      </Link>

      <article className="gale-panel p-8 sm:p-12 border border-white/10 flex flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white">{post.title}</h1>
          
          <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
              <User size={14} className="text-neon-purple" />
              {post.author?.name || post.author?.username || 'Staff Infinity'}
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
              <Calendar size={14} className="text-neon-blue" />
              {new Date(post.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </header>

        {post.imageUrl && (
          <div className="w-full rounded-2xl bg-black/40 overflow-hidden border border-white/10 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.imageUrl} alt={post.title} className="w-full h-auto max-h-[600px] object-contain" />
          </div>
        )}

        <div 
          className="text-gray-300 text-sm sm:text-base leading-relaxed py-4 prose prose-invert prose-p:my-2 prose-headings:my-4 prose-ul:my-2 prose-li:my-0 prose-blockquote:my-2 prose-blockquote:border-neon-purple prose-blockquote:bg-neon-purple/5 prose-blockquote:px-4 prose-blockquote:py-1 max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  )
}
