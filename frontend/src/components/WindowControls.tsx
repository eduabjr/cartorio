import React, { useState, useRef } from 'react'
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
  const [maximizeState, setMaximizeState] = useState<'normal' | 'minimized' | 'screen1' | 'screen2'>('normal')
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const containerStyles = {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }

  const buttonStyles = {
    width: '36px',
    height: '24px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.15s ease',
    position: 'relative' as const
  }

  const minimizeStyles = {
    ...buttonStyles,
    backgroundColor: '#6b7280',
    color: '#ffffff',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  }

  const maximizeStyles = {
    ...buttonStyles,
    backgroundColor: '#6b7280',
    color: '#ffffff',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  }

  const closeStyles = {
    ...buttonStyles,
    backgroundColor: '#ef4444',
    color: '#ffffff',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
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
    // Limpar timeout anterior se existir
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      // Segundo clique - ir para tela 1 completa
      if (maximizeState === 'minimized') {
        setMaximizeState('screen1')
        applyScreen1Layout()
      } else if (maximizeState === 'screen1') {
        // Terceiro clique - ir para tela 2 (apenas fundo)
        setMaximizeState('screen2')
        applyScreen2Layout()
      } else if (maximizeState === 'screen2') {
        // Quarto clique - voltar ao normal
        setMaximizeState('normal')
        applyNormalLayout()
      }
      clickTimeoutRef.current = null
    } else {
      // Primeiro clique - reduzir tela
      setMaximizeState('minimized')
      applyMinimizedLayout()
      
      // Configurar timeout para detectar próximo clique
      clickTimeoutRef.current = setTimeout(() => {
        // Se não houve próximo clique, manter reduzido
        clickTimeoutRef.current = null
      }, 300) // 300ms para detectar próximo clique
    }
  }

  const applyMinimizedLayout = () => {
    // Reduzir tela do sistema
    const element = document.documentElement
    element.style.width = '1200px'
    element.style.height = '800px'
    element.style.position = 'fixed'
    element.style.top = '50%'
    element.style.left = '50%'
    element.style.transform = 'translate(-50%, -50%)'
    element.style.zIndex = '9999'
    element.style.border = '2px solid #00796B'
    element.style.borderRadius = '8px'
    element.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)'
    
    // Mostrar todos os menus
    showMenus(true)
  }

  const applyScreen1Layout = () => {
    // Preencher tela 1 completamente (com menus)
    const element = document.documentElement
    element.style.width = '1920px'
    element.style.height = '1080px'
    element.style.position = 'fixed'
    element.style.top = '0'
    element.style.left = '0'
    element.style.zIndex = '9999'
    element.style.border = 'none'
    element.style.borderRadius = '0'
    element.style.boxShadow = 'none'
    
    // Aplicar zoom se necessário
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080)
    element.style.transform = `scale(${scale})`
    element.style.transformOrigin = 'top left'
    
    // Mostrar todos os menus
    showMenus(true)
  }

  const applyScreen2Layout = () => {
    // Expandir para tela 2 (apenas fundo, sem menus - para abas móveis)
    const element = document.documentElement
    element.style.width = '2560px'
    element.style.height = '1440px'
    element.style.position = 'fixed'
    element.style.top = '0'
    element.style.left = '0'
    element.style.zIndex = '9999'
    element.style.border = 'none'
    element.style.borderRadius = '0'
    element.style.boxShadow = 'none'
    
    // Aplicar zoom se necessário
    const scale = Math.min(window.innerWidth / 2560, window.innerHeight / 1440)
    element.style.transform = `scale(${scale})`
    element.style.transformOrigin = 'top left'
    
    // Esconder menus - apenas fundo para abas móveis
    showMenus(false)
  }

  const applyNormalLayout = () => {
    // Voltar ao layout normal
    const element = document.documentElement
    element.style.width = '100%'
    element.style.height = '100%'
    element.style.position = 'static'
    element.style.transform = 'none'
    element.style.transformOrigin = 'initial'
    element.style.zIndex = 'auto'
    element.style.border = 'none'
    element.style.borderRadius = '0'
    element.style.boxShadow = 'none'
    
    // Mostrar todos os menus
    showMenus(true)
  }

  const showMenus = (show: boolean) => {
    // Controlar visibilidade dos menus
    const menuElements = document.querySelectorAll('[data-responsive-menu]')
    const windowControls = document.querySelectorAll('[data-window-controls]')
    
    const display = show ? 'block' : 'none'
    
    menuElements.forEach(element => {
      (element as HTMLElement).style.display = display
    })
    
    // Manter controles de janela sempre visíveis
    windowControls.forEach(element => {
      (element as HTMLElement).style.display = 'block'
    })
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
          const target = e.target as HTMLButtonElement
          target.style.backgroundColor = '#4b5563'
          target.style.transform = 'scale(1.05)'
          target.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)'
        }}
        onMouseLeave={(e) => {
          const target = e.target as HTMLButtonElement
          target.style.backgroundColor = '#6b7280'
          target.style.transform = 'scale(1)'
          target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
        title="Minimizar"
      >
        −
      </button>
      
      <button
        style={maximizeStyles}
        onClick={handleMaximize}
        onMouseEnter={(e) => {
          const target = e.target as HTMLButtonElement
          target.style.backgroundColor = '#4b5563'
          target.style.transform = 'scale(1.05)'
          target.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)'
        }}
        onMouseLeave={(e) => {
          const target = e.target as HTMLButtonElement
          target.style.backgroundColor = '#6b7280'
          target.style.transform = 'scale(1)'
          target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
        title={`Maximizar - Estado: ${maximizeState === 'normal' ? 'Normal' : maximizeState === 'minimized' ? 'Reduzido' : maximizeState === 'screen1' ? 'Tela 1' : 'Tela 2'}`}
      >
        {maximizeState === 'normal' ? '□' : maximizeState === 'minimized' ? '⊡' : maximizeState === 'screen1' ? '⧉' : '⧈'}
      </button>
      
      <button
        style={closeStyles}
        onClick={handleClose}
        onMouseEnter={(e) => {
          const target = e.target as HTMLButtonElement
          target.style.backgroundColor = '#dc2626'
          target.style.transform = 'scale(1.05)'
          target.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)'
        }}
        onMouseLeave={(e) => {
          const target = e.target as HTMLButtonElement
          target.style.backgroundColor = '#ef4444'
          target.style.transform = 'scale(1)'
          target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
        title="Fechar"
      >
        ×
      </button>

    </div>
  )
}