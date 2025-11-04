import { useState, useEffect, memo } from 'react'
import { 
  UserIcon, 
  DocumentIcon, 
  RegistryIcon, 
  CertificateIcon, 
  BuildingIcon, 
  SearchIcon, 
  PrintIcon, 
  UploadIcon,
  SettingsIcon,
  IndexIcon
} from './icons'
import { useAccessibility } from '../hooks/useAccessibility'
import { useWindowManager } from '../contexts/WindowContext'
import { IndicesPage } from '../pages/IndicesPage'

/**
 * TOOLBAR
 * 🚨 CORREÇÃO: Removido React.memo para permitir re-renders quando tema muda
 */
export function Toolbar() {
  const [renderKey, setRenderKey] = useState(0)
  
  // Buscar tema - SEMPRE chamar getTheme() diretamente
  const { getTheme, currentTheme, isThemeLoaded } = useAccessibility()
  const theme = getTheme()
  const { openWindow } = useWindowManager()

  // 🔥 FORÇA BRUTA: Escutar mudanças de tema
  useEffect(() => {
    console.log('🔥 Toolbar - Tema mudou para:', currentTheme)
    setRenderKey(prev => prev + 1)
  }, [currentTheme])

  console.log('🔄 Toolbar render #', renderKey, '- Tema:', currentTheme, 'Surface:', theme.surface)

  // 🚨 CORREÇÃO CRÍTICA: Aguardar tema estar carregado antes de renderizar
  if (!isThemeLoaded) {
    console.log('⏳ Toolbar - Aguardando tema carregar...')
    return null // Não renderizar até o tema estar pronto
  }

  const handleOpenIndices = () => {
    openWindow({
      id: `indices-${Date.now()}`,
      type: 'indices',
      title: 'Índices - Nascimento, Casamento, Óbito, Proclamas',
      component: IndicesPage,
      props: {}
    })
  }

  const toolbarItems = [
    { icon: UserIcon, label: 'Clientes', shortcut: 'F2' },
    { icon: DocumentIcon, label: 'Documentos', shortcut: 'F3' },
    { icon: RegistryIcon, label: 'Registros', shortcut: 'F4' },
    { icon: CertificateIcon, label: 'Certidões', shortcut: 'F5' },
    { icon: IndexIcon, label: 'Índices', shortcut: 'F8', onClick: handleOpenIndices },
    { icon: BuildingIcon, label: 'Imóveis', shortcut: 'F6' },
    { icon: SearchIcon, label: 'Consulta', shortcut: 'F7' },
    { icon: PrintIcon, label: 'Imprimir', shortcut: 'Ctrl+P' },
    { icon: UploadIcon, label: 'Upload', shortcut: 'Ctrl+U' },
    { icon: SettingsIcon, label: 'Config', shortcut: 'F12' },
  ]

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
          {toolbarItems.map((item, index) => (
            <ToolbarButton
              key={index}
              Icon={item.icon}
              label={item.label}
              shortcut={item.shortcut}
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
const ToolbarButton = memo(({ Icon, label, shortcut, theme, onClick }: any) => {
  const [isHovered, setIsHovered] = useState(false)

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
      title={`${label} (${shortcut})`}
    >
      <Icon className="w-5 h-5 mb-1" />
      <span className="text-xs font-medium">{label}</span>
      <span className="text-[10px] opacity-60 mt-0.5">{shortcut}</span>
    </button>
  )
})
ToolbarButton.displayName = 'ToolbarButton'
