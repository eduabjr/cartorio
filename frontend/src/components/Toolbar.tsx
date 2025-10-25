import { useState, useEffect } from 'react'
import { 
  UserIcon, 
  DocumentIcon, 
  RegistryIcon, 
  CertificateIcon, 
  BuildingIcon, 
  SearchIcon, 
  PrintIcon, 
  UploadIcon,
  SettingsIcon
} from './icons'
import { useAccessibility } from '../hooks/useAccessibility'

export function Toolbar() {
  const { getTheme, currentTheme } = useAccessibility()
  const [theme, setTheme] = useState(getTheme())
  
  // Atualizar tema quando currentTheme mudar
  useEffect(() => {
    const newTheme = getTheme()
    setTheme(newTheme)
    console.log('🎨 Toolbar - Tema atualizado:', currentTheme, newTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTheme])
  const toolbarItems = [
    { icon: UserIcon, label: 'Cadastros', onClick: () => console.log('Cadastros') },
    { icon: DocumentIcon, label: 'Documentos', onClick: () => console.log('Documentos') },
    { icon: RegistryIcon, label: 'Processos', onClick: () => console.log('Processos') },
    { icon: CertificateIcon, label: 'Certidões', onClick: () => console.log('Certidões') },
    { icon: BuildingIcon, label: 'Livro Comercial', onClick: () => console.log('Livro Comercial') },
    { icon: SearchIcon, label: 'Índice', onClick: () => console.log('Índice') },
    { icon: SearchIcon, label: 'Buscar', onClick: () => console.log('Buscar') },
    { icon: PrintIcon, label: 'Relatórios', onClick: () => console.log('Relatórios') },
    { icon: UploadIcon, label: 'Digitalização', onClick: () => console.log('Digitalização') },
    { icon: DocumentIcon, label: 'Procuração', onClick: () => console.log('Procuração') },
    { icon: SettingsIcon, label: 'Configurações', onClick: () => console.log('Configurações') }
  ]

  const toolbarStyles: React.CSSProperties = {
    backgroundColor: theme.surface,
    borderBottom: `1px solid ${theme.border}`,
    padding: '0 16px'
  }

  return (
    <div style={toolbarStyles}>
      <div className="flex space-x-1">
        {toolbarItems.map((item, index) => {
          const IconComponent = item.icon
          return (
            <button
              key={index}
              className="p-0.5 rounded-md transition-colors group"
              title={item.label}
              onClick={item.onClick}
              style={{ 
                color: theme.text,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.background}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <IconComponent 
                size={16} 
                style={{ color: theme.text }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

