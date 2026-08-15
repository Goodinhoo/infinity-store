export type ThemePreset = {
  id: string
  name: string
  subtitle: string
  iconName: string
  primary: string   // Cor principal de Destaque / Néon Roxo
  secondary: string // Cor secundária de Ação / Néon Azul
  accent: string    // Cor de Acento / Néon Rosa
  background: string // Cor de fundo principal
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'INFINITY_NEON',
    name: 'Infinity Neon',
    subtitle: 'Tema padrão futurista com efeito Glassmorphism e tons elétricos',
    iconName: 'Sparkles',
    primary: '#bc13fe',
    secondary: '#00f0ff',
    accent: '#ff007f',
    background: '#08080c',
  },
  {
    id: 'MEDIEVAL_RPG',
    name: 'Medieval Fantasy',
    subtitle: 'Estilo clássico RPG com tons de ouro, âmbar e rocha escura',
    iconName: 'Shield',
    primary: '#d97706',
    secondary: '#eab308',
    accent: '#b45309',
    background: '#0b0907',
  },
  {
    id: 'CYBER_MATRIX',
    name: 'Cyber Matrix',
    subtitle: 'Estilo hacker com verde esmeralda e néon brilhante',
    iconName: 'Terminal',
    primary: '#10b981',
    secondary: '#22c55e',
    accent: '#059669',
    background: '#040906',
  },
  {
    id: 'ARCTIC_FROST',
    name: 'Arctic Frost',
    subtitle: 'Estilo gelado com tons de azul cristalino e prata',
    iconName: 'Snowflake',
    primary: '#0284c7',
    secondary: '#38bdf8',
    accent: '#818cf8',
    background: '#060b13',
  },
  {
    id: 'ROYAL_IMPERIAL',
    name: 'Royal Imperial',
    subtitle: 'Estilo majestoso com roxo imperial e detalhes a ouro',
    iconName: 'Crown',
    primary: '#8b5cf6',
    secondary: '#f59e0b',
    accent: '#ec4899',
    background: '#090514',
  },
  {
    id: 'MAGMA_VOLCANO',
    name: 'Magma Dragon',
    subtitle: 'Estilo vulcânico ardente com tons vermelho fogo e chama',
    iconName: 'Flame',
    primary: '#ef4444',
    secondary: '#f97316',
    accent: '#f43f5e',
    background: '#100505',
  },
]

export function getThemeById(id: string): ThemePreset {
  return THEME_PRESETS.find((t) => t.id === id) || THEME_PRESETS[0]
}
