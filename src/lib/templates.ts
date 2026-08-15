export type StoreTemplate = {
  id: string
  name: string
  subtitle: string
  iconName: string
  badge: string
  headerStyle: 'FLOATING' | 'CENTERED_BRAND' | 'COMPACT'
  cardStyle: 'GRID_3D' | 'HORIZONTAL_LIST' | 'COMPACT_GRID'
}

export const STORE_TEMPLATES: StoreTemplate[] = [
  {
    id: 'MODERN_GLASS',
    name: 'Modern Glass (Futurista)',
    subtitle: 'Navbar flutuante transparente, hero com slider 3D e cards em grelha futurista.',
    iconName: 'Sparkles',
    badge: 'PADRÃO',
    headerStyle: 'FLOATING',
    cardStyle: 'GRID_3D',
  },
  {
    id: 'CLASSIC_PORTAL',
    name: 'Classic Portal (LeaderOS)',
    subtitle: 'Cabeçalho tradicional com logótipo gigante ao centro, sidebar lateral e cards em lista.',
    iconName: 'Layers',
    badge: 'TRADICIONAL',
    headerStyle: 'CENTERED_BRAND',
    cardStyle: 'HORIZONTAL_LIST',
  },
  {
    id: 'COMPACT_STORE',
    name: 'Compact E-Commerce',
    subtitle: 'Visual limpo de e-commerce focado em velocidade, pesquisa instantânea e compras rápidas.',
    iconName: 'ShoppingBag',
    badge: 'RÁPIDO',
    headerStyle: 'COMPACT',
    cardStyle: 'COMPACT_GRID',
  },
]

export function getTemplateById(id: string): StoreTemplate {
  return STORE_TEMPLATES.find((t) => t.id === id) || STORE_TEMPLATES[0]
}
