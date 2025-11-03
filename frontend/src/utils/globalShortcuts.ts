/**
 * Atalhos de Teclado Globais
 * 
 * Define os atalhos padrão disponíveis em todo o sistema
 */

export interface GlobalShortcut {
  id: string
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  category: 'navegacao' | 'edicao' | 'sistema'
}

export const GLOBAL_SHORTCUTS: GlobalShortcut[] = [
  // Navegação
  {
    id: 'fechar-janela',
    key: 'Escape',
    description: 'Fechar janela/modal atual',
    category: 'navegacao'
  },
  {
    id: 'ajuda-atalhos',
    key: 'F1',
    description: 'Mostrar ajuda de atalhos',
    category: 'navegacao'
  },
  {
    id: 'buscar',
    key: 'f',
    ctrl: true,
    description: 'Buscar/Pesquisar',
    category: 'navegacao'
  },
  
  // Edição
  {
    id: 'salvar',
    key: 's',
    ctrl: true,
    description: 'Salvar/Gravar',
    category: 'edicao'
  },
  {
    id: 'novo',
    key: 'n',
    ctrl: true,
    description: 'Novo registro',
    category: 'edicao'
  },
  {
    id: 'imprimir',
    key: 'p',
    ctrl: true,
    description: 'Imprimir',
    category: 'edicao'
  },
  {
    id: 'excluir',
    key: 'Delete',
    description: 'Excluir item selecionado',
    category: 'edicao'
  },
  
  // Sistema
  {
    id: 'menu',
    key: 'm',
    ctrl: true,
    shift: true,
    description: 'Abrir menu do usuário',
    category: 'sistema'
  },
  {
    id: 'logout',
    key: 'l',
    ctrl: true,
    shift: true,
    description: 'Fazer logout',
    category: 'sistema'
  }
]

/**
 * Formata um atalho para exibição
 */
export function formatShortcut(shortcut: GlobalShortcut): string {
  const keys = []
  
  if (shortcut.ctrl) keys.push('Ctrl')
  if (shortcut.shift) keys.push('Shift')
  if (shortcut.alt) keys.push('Alt')
  keys.push(shortcut.key.toUpperCase())
  
  return keys.join('+')
}

/**
 * Agrupa atalhos por categoria
 */
export function groupShortcutsByCategory(shortcuts: GlobalShortcut[]) {
  const grouped: Record<string, GlobalShortcut[]> = {
    navegacao: [],
    edicao: [],
    sistema: []
  }
  
  shortcuts.forEach(shortcut => {
    if (grouped[shortcut.category]) {
      grouped[shortcut.category].push(shortcut)
    }
  })
  
  return grouped
}

/**
 * Gera texto de ajuda formatado
 */
export function generateHelpText(shortcuts: GlobalShortcut[]): string {
  const grouped = groupShortcutsByCategory(shortcuts)
  
  const categoryNames = {
    navegacao: '🧭 NAVEGAÇÃO',
    edicao: '✏️ EDIÇÃO',
    sistema: '⚙️ SISTEMA'
  }
  
  let helpText = '⌨️ ATALHOS DE TECLADO DISPONÍVEIS\n\n'
  
  Object.entries(grouped).forEach(([category, items]) => {
    if (items.length === 0) return
    
    helpText += `${categoryNames[category as keyof typeof categoryNames]}\n`
    helpText += '─'.repeat(40) + '\n'
    
    items.forEach(item => {
      const shortcut = formatShortcut(item)
      helpText += `${shortcut.padEnd(20)} → ${item.description}\n`
    })
    
    helpText += '\n'
  })
  
  return helpText
}

