'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import CartButton from './CartButton'
import { useState } from 'react'
import { User, Menu, X } from 'lucide-react'
import { useModules, useGlobalSettings } from './Providers'
import CenteredBrandHeader from './templates/CenteredBrandHeader'

type NavItem = {
  id: number
  label: string
  url: string
  icon: string | null
  order: number
  isActive: boolean
  isSystem: boolean
}

export default function NavBar({ initialNavItems }: { initialNavItems: NavItem[] }) {
  const pathname = usePathname()
  const modules = useModules()
  const settings = useGlobalSettings()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  const navLinks = initialNavItems.filter(item => {
    if (!item.isActive) return false
    if (item.isSystem && urlToModule[item.url] === false) return false
    return true
  }).map(item => ({
    href: item.url,
    label: item.label,
    icon: resolveLucideIcon(item.icon)
  }))

  if (settings.STORE_TEMPLATE === 'CLASSIC_PORTAL') {
    return <CenteredBrandHeader initialNavItems={initialNavItems} />
  }

  return (
    <nav className="sticky top-0 z-40 bg-[#08080c]/85 backdrop-blur-xl border-b border-white/5 shadow-2xl">
      <div className="max-w-7xl 2xl:max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <Image 
            src={settings.STORE_LOGO_URL} 
            alt={settings.STORE_NAME} 
            width={40}
            height={40}
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain group-hover:scale-105 transition-transform drop-shadow-[0_0_15px_rgba(188,19,254,0.3)]" 
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-neon-blue transition-colors uppercase">
              {settings.STORE_NAME}
            </span>
            <span className="hidden sm:block text-[10px] text-gray-400 font-semibold tracking-widest uppercase">Rede de Minecraft</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden xl:flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/5">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href))

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 text-white border border-neon-purple/30 shadow-[0_0_10px_-2px_rgba(188,19,254,0.3)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {Icon && <Icon size={16} className={isActive ? 'text-neon-blue' : 'text-gray-400'} />}
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* User Actions & Cart */}
        <div className="flex items-center gap-1 sm:gap-3">
          <CartButton />

          <Link
            href="/profile"
            className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-sm font-bold transition-all flex items-center gap-2"
          >
            <User size={16} className="text-neon-purple" />
            <span className="hidden sm:inline">Perfil</span>
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="xl:hidden p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#08080c]/95 backdrop-blur-3xl absolute top-full left-0 w-full p-4 flex flex-col gap-2 shadow-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href))

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${
                  isActive
                    ? 'bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 text-white border border-neon-purple/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {Icon && <Icon size={18} className={isActive ? 'text-neon-blue' : 'text-gray-400'} />}
                {link.label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
