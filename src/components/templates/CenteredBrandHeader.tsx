'use client'

import Link from 'next/link'
import Image from 'next/image'
import CartButton from '../CartButton'
import ServerIPCard from '../ServerIPCard'
import DynamicIcon from '../DynamicIcon'
import { useGlobalSettings } from '../Providers'
import { useState } from 'react'
import { User, Menu, X } from 'lucide-react'

type NavItem = {
  id: number
  label: string
  url: string
  icon: string | null
  isActive: boolean
  isSystem: boolean
}

export default function CenteredBrandHeader({
  initialNavItems
}: {
  initialNavItems: NavItem[]
}) {
  const settings = useGlobalSettings()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="w-full bg-[#050509] border-b border-white/10 shadow-2xl">
      {/* Top Banner / Centered Brand Header */}
      <div className="relative w-full bg-gradient-to-b from-black/80 via-black/60 to-[#050509] py-10 px-4 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center gap-6">
          {/* Logo Gigante Centrado */}
          <Link href="/" className="flex flex-col items-center gap-4 group">
            <Image
              src={settings.STORE_LOGO_URL}
              alt={settings.STORE_NAME}
              width={90}
              height={90}
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain group-hover:scale-105 transition-transform drop-shadow-[0_0_25px_rgba(188,19,254,0.5)]"
              priority
            />
            <div className="flex flex-col items-center">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase drop-shadow-lg">
                {settings.STORE_NAME}
              </h1>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                Rede Oficial de Servidores Minecraft
              </p>
            </div>
          </Link>

          {/* Widget de IP Centrado em Destaque */}
          <div className="w-full max-w-md">
            <ServerIPCard ip={settings.SERVER_IP} versions={settings.SERVER_VERSIONS} />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 overflow-x-auto custom-scrollbar py-2">
          {initialNavItems
            .filter((item) => item.isActive)
            .map((item) => (
              <Link
                key={item.id}
                href={item.url}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <DynamicIcon name={item.icon} size={16} className="text-neon-purple" />
                <span>{item.label}</span>
              </Link>
            ))}
        </div>

        {/* Action Buttons (Conta & Carrinho) */}
        <div className="flex items-center gap-3 ml-auto">
          <CartButton />
          <Link
            href="/profile"
            className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all flex items-center gap-2 text-xs font-bold"
          >
            <User size={18} className="text-neon-purple" />
            <span className="hidden sm:inline">Minha Conta</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#08080c] px-4 py-4 space-y-2 animate-fade-in">
          {initialNavItems
            .filter((item) => item.isActive)
            .map((item) => (
              <Link
                key={item.id}
                href={item.url}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <DynamicIcon name={item.icon} size={18} className="text-neon-purple" />
                <span>{item.label}</span>
              </Link>
            ))}
        </div>
      )}
    </header>
  )
}
