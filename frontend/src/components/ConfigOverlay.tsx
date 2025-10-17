import React from 'react'
import { useAccessibility } from '../hooks/useAccessibility'

interface ConfigOverlayProps {
  isOpen: boolean
  onClose: () => void
  onOpenAccessibilitySettings: () => void
}

export function ConfigOverlay({ isOpen, onClose, onOpenAccessibilitySettings }: ConfigOverlayProps) {
  const { getTheme } = useAccessibility()
  const theme = getTheme()

  if (!isOpen) return null

  const overlayStyles = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  }

  const modalStyles = {
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    padding: '30px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '80vh',
    overflowY: 'auto' as const
  }

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    paddingBottom: '15px',
    borderBottom: `1px solid ${theme.border}`
  }

  const titleStyles = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: theme.primary,
    margin: 0
  }

  const closeButtonStyles = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: theme.textSecondary,
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  }

  const sectionStyles = {
    marginBottom: '25px'
  }

  const sectionTitleStyles = {
    fontSize: '18px',
    fontWeight: '600',
    color: theme.text,
    marginBottom: '15px'
  }

  const buttonStyles = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: theme.buttonBg,
    color: theme.buttonText,
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '10px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div style={overlayStyles} onClick={handleOverlayClick}>
      <div style={modalStyles}>
        <div style={headerStyles}>
          <h2 style={titleStyles}>Configurações</h2>
          <button
            style={closeButtonStyles}
            onClick={onClose}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = theme.menuActive
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
            }}
            title="Fechar"
          >
            ×
          </button>
        </div>

        <div style={sectionStyles}>
          <h3 style={sectionTitleStyles}>Acessibilidade</h3>
          <button
            style={buttonStyles}
            onClick={() => {
              onOpenAccessibilitySettings()
              onClose()
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = theme.buttonHover
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = theme.buttonBg
            }}
          >
            <span>♿</span>
            Configurações de Acessibilidade
          </button>
        </div>

        <div style={sectionStyles}>
          <h3 style={sectionTitleStyles}>Sistema</h3>
          <button
            style={buttonStyles}
            onClick={() => {
              // Aqui você pode adicionar outras configurações do sistema
              console.log('Configurações do Sistema')
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = theme.buttonHover
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = theme.buttonBg
            }}
          >
            <span>⚙️</span>
            Configurações Gerais
          </button>
        </div>

        <div style={sectionStyles}>
          <h3 style={sectionTitleStyles}>Aparência</h3>
          <button
            style={buttonStyles}
            onClick={() => {
              // Aqui você pode adicionar configurações de tema
              console.log('Configurações de Aparência')
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = theme.buttonHover
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = theme.buttonBg
            }}
          >
            <span>🎨</span>
            Tema e Cores
          </button>
        </div>
      </div>
    </div>
  )
}
