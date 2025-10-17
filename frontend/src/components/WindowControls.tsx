import React from 'react'
import { useAccessibility } from '../hooks/useAccessibility'

interface WindowControlsProps {
  onMinimize?: () => void
  onMaximize?: () => void
  onClose?: () => void
}

export function WindowControls({ 
  onMinimize, 
  onMaximize, 
  onClose
}: WindowControlsProps) {
  const { getTheme } = useAccessibility()
  const theme = getTheme()

  const containerStyles = {
    position: 'fixed' as const,
    top: '0',
    right: '0',
    zIndex: 1001,
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    gap: '4px'
  }

  const buttonStyles = {
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.2s ease'
  }

  const buttonBaseStyles = {
    ...buttonStyles,
    backgroundColor: '#6c757d', // Cor cinza uniforme
    color: '#fff'
  }

  const minimizeStyles = {
    ...buttonBaseStyles
  }

  const maximizeStyles = {
    ...buttonBaseStyles
  }

  const closeStyles = {
    ...buttonBaseStyles
  }


  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize()
    } else {
      // Comportamento padrão - minimizar janela do navegador
      window.minimize?.()
    }
  }

  const handleMaximize = () => {
    if (onMaximize) {
      onMaximize()
    } else {
      // Comportamento padrão - alternar tela cheia
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      // Comportamento padrão - fechar aba
      window.close()
    }
  }


  return (
    <div style={containerStyles}>
      <button
        style={minimizeStyles}
        onClick={handleMinimize}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.opacity = '0.8'
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.opacity = '1'
        }}
        title="Minimizar"
      >
        −
      </button>
      
      <button
        style={maximizeStyles}
        onClick={handleMaximize}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.opacity = '0.8'
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.opacity = '1'
        }}
        title="Maximizar"
      >
        □
      </button>
      
      <button
        style={closeStyles}
        onClick={handleClose}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.opacity = '0.8'
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.opacity = '1'
        }}
        title="Fechar"
      >
        ×
      </button>

    </div>
  )
}