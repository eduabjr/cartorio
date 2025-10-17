import React from 'react'
import { useAccessibility } from '../hooks/useAccessibility'

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onLogout: () => void
  onOpenConfigurations: () => void
  onOpenMaternidade: () => void
}

export function SideMenu({ isOpen, onClose, user, onLogout, onOpenConfigurations, onOpenMaternidade }: SideMenuProps) {
  const { getTheme } = useAccessibility()
  const theme = getTheme()

  if (!isOpen) return null

  const overlayStyles = {
    position: 'fixed' as const,
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2000,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingTop: '140px' // Abaixo dos menus com mais espaço
  }

  const menuStyles = {
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    padding: '20px',
    minWidth: '250px',
    marginRight: '20px'
  }

  const userInfoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: theme.primary + '10',
    borderRadius: '6px',
    marginBottom: '16px'
  }

  const buttonStyles = {
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    background: 'transparent',
    color: theme.text,
    cursor: 'pointer',
    borderRadius: '6px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.2s ease',
    marginBottom: '8px'
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div style={overlayStyles} onClick={handleOverlayClick}>
      <div style={menuStyles}>
        {/* Informações do usuário */}
        <div style={userInfoStyles}>
          <span style={{ fontSize: '24px' }}>👤</span>
          <div>
            <div style={{ fontWeight: '600', color: theme.text }}>
              {user?.name || 'Usuário'}
            </div>
            <div style={{ fontSize: '12px', color: theme.textSecondary }}>
              {user?.email || 'usuario@cartorio.com'}
            </div>
          </div>
        </div>

        {/* Botões do menu */}
        <button
          style={buttonStyles}
          onClick={() => {
            onOpenMaternidade()
            onClose()
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = theme.primary + '20'
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
          }}
        >
          Maternidade
        </button>

        <button
          style={buttonStyles}
          onClick={() => {
            onOpenConfigurations()
            onClose()
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = theme.primary + '20'
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
          }}
        >
          Configurações
        </button>

        <button
          style={buttonStyles}
          onClick={() => {
            onLogout()
            onClose()
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = theme.error + '20'
            ;(e.target as HTMLButtonElement).style.color = theme.error
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
            ;(e.target as HTMLButtonElement).style.color = theme.text
          }}
        >
          Sair
        </button>
      </div>
    </div>
  )
}