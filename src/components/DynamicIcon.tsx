import React, { ElementType } from 'react'
import * as LucideIcons from 'lucide-react'

// Pre-mapear todas as chaves em minúsculas para encontrar o nome oficial PascalCase do Lucide
const iconMap = new Map<string, string>()
Object.keys(LucideIcons).forEach((key) => {
  iconMap.set(key.toLowerCase(), key)
})

export function resolveLucideIcon(name?: string | null): ElementType | null {
  if (!name || typeof name !== 'string') return null
  const trimmed = name.trim()
  if (!trimmed) return null

  // 1. Correspondência direta exata (ex: "BookOpen")
  if (LucideIcons[trimmed as keyof typeof LucideIcons]) {
    return LucideIcons[trimmed as keyof typeof LucideIcons] as ElementType
  }

  // 2. Normalizar snake_case ("book_open"), kebab-case ("book-open"), espaços ("book open") -> "BookOpen"
  const pascalCase = trimmed
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')

  if (LucideIcons[pascalCase as keyof typeof LucideIcons]) {
    return LucideIcons[pascalCase as keyof typeof LucideIcons] as ElementType
  }

  // 3. Fallback: Verificação insensível a maiúsculas (ex: "bookopen" -> "BookOpen")
  const cleanedLower = trimmed.replace(/[-_\s]+/g, '').toLowerCase()
  const matchedKey = iconMap.get(cleanedLower)
  if (matchedKey && LucideIcons[matchedKey as keyof typeof LucideIcons]) {
    return LucideIcons[matchedKey as keyof typeof LucideIcons] as ElementType
  }

  return null
}

export default function DynamicIcon({
  name,
  className = '',
  size = 18,
  fallback: Fallback = LucideIcons.HelpCircle
}: {
  name?: string | null
  className?: string
  size?: number
  fallback?: ElementType
}) {
  const IconComponent = resolveLucideIcon(name)
  if (!IconComponent) {
    if (Fallback) return React.createElement(Fallback, { size, className })
    return null
  }

  return React.createElement(IconComponent, { size, className })
}
