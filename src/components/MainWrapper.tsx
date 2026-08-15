'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export default function MainWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  if (isAdmin) {
    return (
      <main className="h-screen w-screen overflow-hidden flex flex-col p-4 bg-[#08080c] fixed inset-0 z-30">
        {children}
      </main>
    )
  }

  return (
    <main className="flex-1 max-w-7xl 2xl:max-w-[90vw] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </main>
  )
}
