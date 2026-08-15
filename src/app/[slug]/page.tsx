import { getPageBySlug } from '@/app/actions/admin-pages'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) return { title: 'Página Não Encontrada' }
  return { title: `${page.title} | Infinity Store` }
}

export default async function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  
  if (!page) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in min-h-[70vh] mt-8">
      <div className="gale-panel p-8 md:p-12 border border-white/10 rounded-3xl relative overflow-hidden">
        
        {/* Efeito visual subtil de fundo */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[100px] pointer-events-none opacity-50 translate-x-1/3 -translate-y-1/3" />
        
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest mb-10 relative z-10 border-b border-white/10 pb-6">
          {page.title}
        </h1>
        
        <div 
          className="prose prose-invert prose-lg max-w-none relative z-10 
                     prose-headings:text-white prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-widest
                     prose-a:text-neon-purple hover:prose-a:text-neon-blue prose-a:transition-colors
                     prose-img:rounded-xl prose-img:border prose-img:border-white/10
                     prose-hr:border-white/10"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  )
}
