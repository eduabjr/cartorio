import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'
import { useWindowManager } from '../contexts/WindowContext'
import {
  CadastroIndicePageIsolated,
  ClientePageIsolated,
  FirmasPageIsolated,
  ControleDigitalizacaoPageIsolated,
  IndicesPageIsolated
} from '../modules'
import { DEFAULT_TOOLBAR_ORDER, TOOLBAR_ITEM_MAP, TOOLBAR_ITEMS, ToolbarItemDefinition } from '../config/toolbarItems'

type ToolbarRenderableItem = ToolbarItemDefinition & { onClick?: () => void }

const LOCKED_TOOLBAR_IDS = new Set(
  TOOLBAR_ITEMS.filter((item) => item.locked).map((item) => item.id)
)

const getToolbarDefinition = (id: string): ToolbarItemDefinition | undefined => {
  if (TOOLBAR_ITEM_MAP[id]) {
    return TOOLBAR_ITEM_MAP[id]
  }
  if (typeof window !== 'undefined') {
    const raw = (window as any).__RAW_MENU_ITEMS__ as ToolbarItemDefinition[] | undefined
    return raw?.find((item) => item.id === id)
  }
  return undefined
}

const normalizeToolbarIds = (ids: string[]): string[] => {
  const seen = new Set<string>()
  const normalized: string[] = []

  ids.forEach((id) => {
    if (!seen.has(id) && getToolbarDefinition(id)) {
      seen.add(id)
      normalized.push(id)
    }
  })

  DEFAULT_TOOLBAR_ORDER.forEach((id) => {
    if (!seen.has(id)) {
      seen.add(id)
      normalized.push(id)
    }
  })

  return normalized
}

const readToolbarConfig = (): string[] => {
  if (typeof window === 'undefined') {
    return [...DEFAULT_TOOLBAR_ORDER]
  }

  try {
    const saved = localStorage.getItem('toolbar-config')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((id: unknown) => typeof id === 'string' && getToolbarDefinition(id as string))
        if (filtered.length > 0) {
          return normalizeToolbarIds(filtered as string[])
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro ao carregar toolbar-config:', error)
  }

  return [...DEFAULT_TOOLBAR_ORDER]
}

/**
 * TOOLBAR
 * 🚨 CORREÇÃO: Removido React.memo para permitir re-renders quando tema muda
 */
export function Toolbar() {
  const [renderKey, setRenderKey] = useState(0)
  const [toolbarConfig, setToolbarConfig] = useState<string[]>(readToolbarConfig)

  // Buscar tema - SEMPRE chamar getTheme() diretamente
  const { getTheme, currentTheme, isThemeLoaded } = useAccessibility()
  const theme = getTheme()
  const { openWindow } = useWindowManager()

  // 🔥 FORÇA BRUTA: Escutar mudanças de tema
  useEffect(() => {
    console.log('🔥 Toolbar - Tema mudou para:', currentTheme)
    setRenderKey(prev => prev + 1)
  }, [currentTheme])

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<string[] | undefined>
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        const normalized = normalizeToolbarIds(customEvent.detail)
        setToolbarConfig(normalized.length > 0 ? normalized : [...DEFAULT_TOOLBAR_ORDER])
      } else {
        setToolbarConfig(readToolbarConfig())
      }
    }

    window.addEventListener('toolbar-config-updated', handler as EventListener)
    return () => window.removeEventListener('toolbar-config-updated', handler as EventListener)
  }, [])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'toolbar-config') {
        setToolbarConfig(readToolbarConfig())
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    const handleRawMenuUpdated = () => {
      setToolbarConfig((prev) => normalizeToolbarIds(prev))
    }
    window.addEventListener('toolbar-raw-menu-updated', handleRawMenuUpdated)
    return () => window.removeEventListener('toolbar-raw-menu-updated', handleRawMenuUpdated)
  }, [])

  const handleOpenCliente = useCallback(() => {
    openWindow({
      id: `cadastro-cliente-${Date.now()}`,
      type: 'cadastro-cliente',
      title: 'Cadastro de Clientes',
      component: ClientePageIsolated,
      props: {}
    })
  }, [openWindow])

  const handleOpenFirmas = useCallback(() => {
    openWindow({
      id: `firmas-${Date.now()}`,
      type: 'firmas',
      title: 'Firmas',
      component: FirmasPageIsolated,
      props: {}
    })
  }, [openWindow])

  const handleOpenIndices = useCallback(() => {
    openWindow({
      id: `indices-${Date.now()}`,
      type: 'indices',
      title: 'Índices - Nascimento, Casamento, Óbito, Proclamas',
      component: IndicesPageIsolated,
      props: {}
    })
  }, [openWindow])

  const handleOpenCadastroIndiceAntigo = useCallback(() => {
    openWindow({
      id: `cadastro-indice-antigo-${Date.now()}`,
      type: 'cadastro-indice-antigo',
      title: 'Cadastro de Índice de Livro Antigo',
      component: CadastroIndicePageIsolated,
      props: {}
    })
  }, [openWindow])

  const handleOpenDigitalizacao = useCallback(() => {
    openWindow({
      id: `controle-digitalizacao-${Date.now()}`,
      type: 'controle-digitalizacao',
      title: 'Controle de Digitalização de Imagens',
      component: ControleDigitalizacaoPageIsolated,
      props: {}
    })
  }, [openWindow])

  const navigateTo = useCallback((route: string) => {
    (window as any).navigateToPage?.(route)
  }, [])

  const handleLogoff = useCallback(() => {
    window.dispatchEvent(new CustomEvent('toolbar-request-logoff'))
  }, [])

  const handleLogout = useCallback(() => {
    window.dispatchEvent(new CustomEvent('toolbar-request-logout'))
  }, [])

  const toolbarActions = useMemo(
    () => ({
      'cadastro-cliente': handleOpenCliente,
      firmas: handleOpenFirmas,
      nascimento: () => navigateTo('nascimento'),
      casamento: () => navigateTo('casamento'),
      obito: () => navigateTo('obito'),
      livro: () => navigateTo('livro'),
      digitalizacao: handleOpenDigitalizacao,
      indices: handleOpenIndices,
      'cadastro-indice-antigo': handleOpenCadastroIndiceAntigo,
      login: handleLogoff,
      logout: handleLogout
    }),
    [
      handleOpenCadastroIndiceAntigo,
      handleOpenCliente,
      handleOpenDigitalizacao,
      handleOpenFirmas,
      handleOpenIndices,
      handleLogoff,
      handleLogout,
      navigateTo
    ]
  )

  const resolvedToolbarItems = useMemo(() => {
    const buildItems = (ids: string[]): ToolbarRenderableItem[] => {
      const items: ToolbarRenderableItem[] = []
      ids.forEach((id) => {
        const definition = getToolbarDefinition(id)
        if (!definition) return
        const baseAction = toolbarActions[id] ?? definition.onClick
        items.push({
          ...definition,
          icon: definition.icon || '📁',
          onClick: baseAction ?? (() => console.warn(`Nenhuma ação definida para o ícone ${id}`))
        })
      })
      return items
    }

    const configured = buildItems(toolbarConfig)
    if (configured.length > 0) {
      return configured
    }

    return buildItems(DEFAULT_TOOLBAR_ORDER)
  }, [toolbarActions, toolbarConfig])

  console.log(
    '🔄 Toolbar render #',
    renderKey,
    '- Tema:',
    currentTheme,
    'Surface:',
    theme.surface,
    'Itens ativos:',
    resolvedToolbarItems.map((item) => item.id)
  )

  // 🚨 CORREÇÃO CRÍTICA: Aguardar tema estar carregado antes de renderizar
  if (!isThemeLoaded) {
    console.log('⏳ Toolbar - Aguardando tema carregar...')
    return null // Não renderizar até o tema estar pronto
  }

  return (
    <div
      className="sticky top-28 z-30 shadow-sm transition-colors duration-200"
      style={{
        backgroundColor: 'var(--surface-color)', // 🚨 CORREÇÃO: Usar variável CSS
        borderBottom: '1px solid var(--border-color)', // 🚨 CORREÇÃO: Usar variável CSS
      }}
    >
      <div className="max-w-full mx-auto px-4 py-2">
        <div className="flex items-center justify-start space-x-2 overflow-x-auto">
          {resolvedToolbarItems.map((item) => (
            <ToolbarButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              theme={theme}
              onClick={item.onClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ⚡ Sub-componente memoizado
const ToolbarButton = memo(({ icon, label, theme, onClick }: { icon?: string; label: string; theme: any; onClick?: () => void }) => {
  const [isHovered, setIsHovered] = useState(false)
  const title = label
  const displayIcon = icon || '📁'

  return (
    <button
      className="flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-150 min-w-[70px]"
      style={{
        backgroundColor: isHovered ? theme.hover : 'transparent',
        color: theme.text,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      title={title}
    >
      <span className="text-lg mb-1">{displayIcon}</span>
      <span className="text-xs font-medium text-center">{label}</span>
    </button>
  )
})
ToolbarButton.displayName = 'ToolbarButton'
