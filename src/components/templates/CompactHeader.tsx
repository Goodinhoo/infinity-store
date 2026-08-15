'use client'

import Link from 'next/link'
import Image from 'next/image'
import CartButton from '../CartButton'
import DynamicIcon from '../DynamicIcon'
import { useGlobalSettings, useModules } from '../Providers'
import { useState, useRef, useEffect } from 'react'
import { User, Menu, X, Search } from 'lucide-react'

type NavItem = {
  id: number
  label: string
  url: string
  icon: string | null
  isActive: boolean
  isSystem: boolean
}

export default function CompactHeader({
  initialNavItems
}: {
  initialNavItems: NavItem[]
}) {
  const settings = useGlobalSettings()
  const modules = useModules()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const urlToModule: Record<string, boolean> = {
    '/vips': modules.MODULE_VIPTABLE,
    '/sugestoes': modules.MODULE_SUGGESTIONS,
    '/downloads': modules.MODULE_DOWNLOADS,
    '/votos': modules.MODULE_VOTES,
    '/roleta': modules.MODULE_FORTUNE_WHEEL,
    '/staff': modules.MODULE_STAFF,
    '/changelog': modules.MODULE_CHANGELOG,
    '/candidaturas': modules.MODULE_APPLICATIONS,
  }

  const activeNavItems = initialNavItems.filter((item) => {
    if (!item.isActive) return false
    if (item.isSystem && urlToModule[item.url] === false) return false
    return true
  })

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [searchOpen])

  return (
    <header className="sticky top-0 z-50 bg-[#06060a]/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
          <Image
            src={settings.STORE_LOGO_URL}
            alt={settings.STORE_NAME}
            width={36}
            height={36}
            className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
          />
          <span className="font-black text-lg text-white uppercase tracking-tight hidden sm:inline">
            {settings.STORE_NAME}
          </span>
        </Link>

        {/* If Search is Open, Show Expandable Bar */}
        {searchOpen ? (
          <div className="flex-1 max-w-xl mx-2 relative animate-fade-in flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neon-purple" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Pesquisar VIPs, Chaves, Coins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-neon-purple/50 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none shadow-[0_0_15px_rgba(188,19,254,0.2)]"
              />
            </div>
            <button
              onClick={() => {
                setSearchOpen(false)
                setSearchQuery('')
              }}
              className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
              title="Fechar Pesquisa"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          /* Normal Navigation Links */
          <nav className="hidden lg:flex items-center gap-1">
            {activeNavItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
                >
                  <DynamicIcon name={item.icon} size={14} className="text-neon-purple" />
                  <span>{item.label}</span>
                </Link>
              ))}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Search Toggle Button (When Closed) */}
          {!searchOpen && (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl border border-white/10 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
              title="Pesquisar Produtos"
            >
              <Search size={18} className="text-neon-purple" />
              <span className="hidden md:inline">Pesquisar</span>
            </button>
          )}

          <CartButton />
          <Link
            href="/profile"
            className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all"
            title="Minha Conta"
          >
            <User size={18} className="text-neon-purple" />
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#08080c] px-4 py-4 space-y-2 animate-fade-in">
          {activeNavItems.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5"
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
