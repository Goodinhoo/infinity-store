import { getNavigationItems } from '@/app/actions/admin-navigation'
import { getPages } from '@/app/actions/admin-pages'
import { getModules } from '@/app/actions/settings'
import NavigationManager from './_components/NavigationManager'
import { Menu } from 'lucide-react'

export default async function NavigationPage() {
  const items = await getNavigationItems()
  const pages = await getPages()
  const modules = await getModules()

  return (
    <div className="p-4 md:p-8 animate-fade-in mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white uppercase tracking-widest flex items-center gap-3">
          <Menu className="text-neon-purple" size={32} />
          Menu de Navegação
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Gere os botões que aparecem no topo do teu site. Altera a ordem, esconde itens ou adiciona os teus próprios links.
        </p>
      </div>

      <div className="gale-panel p-6 border border-white/10 rounded-2xl">
        <NavigationManager initialItems={items} customPages={pages} modules={modules} />
      </div>
    </div>
  )
}
