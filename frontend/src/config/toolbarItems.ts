export interface ToolbarItemDefinition {
  id: string
  label: string
  icon: string
  description?: string
  locked?: boolean
  onClick?: () => void
}

export const DEFAULT_TOOLBAR_ORDER: string[] = [
  'cadastro-cliente',
  'firmas',
  'indices',
  'nascimento',
  'casamento',
  'obito',
  'livro',
  'digitalizacao',
  'cadastro-indice-antigo',
  'login',
  'logout'
]

export const TOOLBAR_ITEMS: ToolbarItemDefinition[] = [
  {
    id: 'login',
    label: 'Logoff',
    icon: '🔐',
    description: 'Encerrar a sessão atual',
    locked: true
  },
  {
    id: 'logout',
    label: 'Sair',
    icon: '🚪',
    description: 'Encerrar sessão e sair do sistema',
    locked: true
  }
]

export const TOOLBAR_ITEM_MAP: Record<string, ToolbarItemDefinition> = TOOLBAR_ITEMS.reduce<Record<string, ToolbarItemDefinition>>((acc, item) => {
  acc[item.id] = item
  return acc
}, {})

