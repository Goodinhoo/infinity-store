'use client'

import { SessionProvider } from "next-auth/react"
import { ReactNode, createContext, useContext } from "react"
import { ModuleKey } from "@/app/actions/settings"
import { GlobalSettings } from "@/app/actions/global-settings"

type ModuleState = Record<ModuleKey, boolean>

const ModuleContext = createContext<ModuleState | null>(null)

export function useModules() {
  const context = useContext(ModuleContext)
  if (!context) throw new Error('useModules must be used within a ModuleProvider')
  return context
}

const GlobalSettingsContext = createContext<GlobalSettings | null>(null)

export function useGlobalSettings() {
  const context = useContext(GlobalSettingsContext)
  if (!context) throw new Error('useGlobalSettings must be used within a GlobalSettingsProvider')
  return context
}

export function Providers({ 
  children, 
  initialModules,
  initialSettings
}: { 
  children: ReactNode, 
  initialModules: ModuleState,
  initialSettings: GlobalSettings
}) {
  return (
    <SessionProvider>
      <GlobalSettingsContext.Provider value={initialSettings}>
        <ModuleContext.Provider value={initialModules}>
          {children}
        </ModuleContext.Provider>
      </GlobalSettingsContext.Provider>
    </SessionProvider>
  )
}
