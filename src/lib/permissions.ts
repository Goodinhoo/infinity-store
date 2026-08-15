export type PermissionKey =
  // Loja & Vendas
  | 'MANAGE_CATEGORIES'
  | 'MANAGE_PRODUCTS'
  | 'MANAGE_ORDERS'
  | 'MANAGE_COUPONS'
  | 'MANAGE_GIFTCARDS'
  | 'MANAGE_SERVERS'

  // Comunidade & Conteúdo
  | 'MANAGE_PAGES'
  | 'MANAGE_USERS'
  | 'MANAGE_STAFF'
  | 'MANAGE_APPLICATIONS'
  | 'MANAGE_VIPTABLE'
  | 'MANAGE_VOTES'
  | 'MANAGE_DOWNLOADS'
  | 'MANAGE_CREATORS'
  | 'MANAGE_BLOG'
  | 'MANAGE_CHANGELOGS'
  | 'MANAGE_TICKETS'
  | 'MANAGE_BANS'
  | 'MANAGE_SLIDERS'

  // Definições & Sistema
  | 'MANAGE_MODULES'
  | 'MANAGE_NAVIGATION'
  | 'MANAGE_APPEARANCE'
  | 'MANAGE_SETTINGS'
  | 'MANAGE_LOGS'

export type PermissionGroup = {
  category: string
  items: { key: PermissionKey; label: string; description: string }[]
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    category: 'Loja & Vendas',
    items: [
      { key: 'MANAGE_CATEGORIES', label: 'Categorias', description: 'Criar, editar e eliminar categorias da loja' },
      { key: 'MANAGE_PRODUCTS', label: 'Produtos', description: 'Criar, editar e eliminar produtos' },
      { key: 'MANAGE_ORDERS', label: 'Encomendas', description: 'Ver e atualizar o estado das compras dos jogadores' },
      { key: 'MANAGE_COUPONS', label: 'Cupões', description: 'Criar e gerir cupões de desconto' },
      { key: 'MANAGE_GIFTCARDS', label: 'Cartões Presente', description: 'Gerar e eliminar gift cards' },
      { key: 'MANAGE_SERVERS', label: 'Servidores RCON', description: 'Adicionar, testar e editar conexões RCON de servidores Minecraft' },
    ]
  },
  {
    category: 'Comunidade & Conteúdo',
    items: [
      { key: 'MANAGE_PAGES', label: 'Páginas Personalizadas', description: 'Criar e editar páginas de conteúdo (TipTap Editor)' },
      { key: 'MANAGE_USERS', label: 'Utilizadores & Permissões', description: 'Gerir contas de jogadores, saldos e permissões' },
      { key: 'MANAGE_STAFF', label: 'Equipa / Staff', description: 'Adicionar e editar membros na página pública /staff' },
      { key: 'MANAGE_APPLICATIONS', label: 'Candidaturas', description: 'Criar formulários e analisar candidaturas enviadas' },
      { key: 'MANAGE_VIPTABLE', label: 'Tabela VIP', description: 'Gerir vantagens da tabela comparativa dos VIPs' },
      { key: 'MANAGE_VOTES', label: 'Sites de Voto', description: 'Adicionar e gerir links dos sites de votação' },
      { key: 'MANAGE_DOWNLOADS', label: 'Downloads', description: 'Adicionar launchers, modpacks e texturas' },
      { key: 'MANAGE_CREATORS', label: 'Criadores & Afiliados', description: 'Gerir códigos de parceiros e comissões' },
      { key: 'MANAGE_BLOG', label: 'Blog & Notícias', description: 'Publicar anúncios e artigos' },
      { key: 'MANAGE_CHANGELOGS', label: 'Notas de Atualização', description: 'Publicar changelogs e novidades das versões' },
      { key: 'MANAGE_SLIDERS', label: 'Sliders da Homepage', description: 'Criar e gerir banners rotativos do carrossel no topo do site' },
      { key: 'MANAGE_TICKETS', label: 'Suporte & Tickets', description: 'Responder e fechar tickets dos jogadores' },
      { key: 'MANAGE_BANS', label: 'Punições & Bans', description: 'Gerir lista de jogadores punidos' },
    ]
  },
  {
    category: 'Definições & Sistema',
    items: [
      { key: 'MANAGE_MODULES', label: 'Central de Módulos', description: 'Ativar e desativar módulos da loja' },
      { key: 'MANAGE_NAVIGATION', label: 'Menu de Navegação', description: 'Reordenar e configurar os links do topo' },
      { key: 'MANAGE_APPEARANCE', label: 'Aparência & Custom CSS', description: 'Escrever código CSS personalizado para o site' },
      { key: 'MANAGE_SETTINGS', label: 'Configurações Globais', description: 'Alterar nome da loja, IP, Discord e logótipos' },
      { key: 'MANAGE_LOGS', label: 'Logs & Auditoria', description: 'Visualizar histórico de ações administrativas e comandos RCON' },
    ]
  }
]

export function hasPermission(
  userRole: string | undefined,
  userPermissionsJson: string | null | undefined,
  requiredPermission?: PermissionKey
): boolean {
  // SUPER ADMIN (role ADMIN) tem acesso total a tudo por defeito
  if (userRole === 'ADMIN') return true

  // Se não for ADMIN nem MODERATOR, não tem acesso ao painel
  if (userRole !== 'MODERATOR' && userRole !== 'ADMIN') return false

  // Se não foi especificada uma permissão requerida mas é pelo menos MODERATOR, dá acesso ao Dashboard basico
  if (!requiredPermission) return true

  // Parse das permissões do utilizador
  if (!userPermissionsJson) return false

  try {
    const userPerms: string[] = JSON.parse(userPermissionsJson)
    return userPerms.includes(requiredPermission)
  } catch {
    return false
  }
}
