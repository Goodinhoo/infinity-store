'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useGlobalSettings } from './Providers'

export default function Footer() {
  const settings = useGlobalSettings()
  return (
    <footer className="border-t border-white/5 bg-[#050508] text-gray-400 text-sm py-12 mt-20">
      <div className="max-w-7xl 2xl:max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Image src={settings.STORE_LOGO_URL} alt={settings.STORE_NAME} width={32} height={32} className="w-8 h-8 object-contain" />
            <span className="font-extrabold text-white text-base uppercase">{settings.STORE_NAME}</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {settings.STORE_DESC}
          </p>
        </div>

        {/* Links Rápidos */}
        <div>
          <h3 className="font-bold text-white mb-4 text-xs uppercase tracking-wider">Navegação</h3>
          <ul className="space-y-2 text-xs">
            <li><Link href="/" className="hover:text-neon-blue transition-colors">Início</Link></li>
            <li><Link href="/loja" className="hover:text-neon-blue transition-colors">Loja Oficial</Link></li>
            <li><Link href="/blog" className="hover:text-neon-blue transition-colors">Notícias & Anúncios</Link></li>
            <li><Link href="/suporte" className="hover:text-neon-blue transition-colors">Suporte ao Jogador</Link></li>
            <li><Link href="/punicoes" className="hover:text-neon-blue transition-colors">Punições / Bans</Link></li>
          </ul>
        </div>

        {/* Informações da Loja */}
        <div>
          <h3 className="font-bold text-white mb-4 text-xs uppercase tracking-wider">Servidor</h3>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><span className="text-gray-500">IP do Servidor:</span> <code className="text-neon-purple font-mono">{settings.SERVER_IP}</code></li>
            <li><span className="text-gray-500">Versão Suportada:</span> {settings.SERVER_VERSIONS}</li>
            <li><span className="text-gray-500">Discord Oficial:</span> <a href={settings.DISCORD_URL.startsWith('http') ? settings.DISCORD_URL : `https://${settings.DISCORD_URL}`} target="_blank" className="hover:text-neon-blue transition-colors">{settings.DISCORD_URL}</a></li>
          </ul>
        </div>

        {/* Termos & Suporte */}
        <div>
          <h3 className="font-bold text-white mb-4 text-xs uppercase tracking-wider">Apoio</h3>
          <p className="text-xs text-gray-500 mb-3">
            Não somos afiliados à Mojang ou Microsoft. Todos os pagamentos revertem diretamente para a manutenção dos nossos servidores.
          </p>
          <div className="text-[11px] text-gray-600">
            © {new Date().getFullYear()} {settings.STORE_NAME}. Todos os direitos reservados.
          </div>
        </div>

      </div>
    </footer>
  )
}
