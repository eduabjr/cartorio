import React, { useState, useRef, useEffect } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'
import { useWindowManager } from '../contexts/WindowContext'

interface BasePageProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  width?: string
  height?: string
  draggable?: boolean
  windowId?: string
  initialPosition?: { x: number; y: number }
  initialZIndex?: number
  isMinimized?: boolean
  isMaximized?: boolean
  resetToOriginalPosition?: boolean
}

export function BasePage({ 
  title, 
  onClose, 
  children, 
  width = '900px', 
  height = '700px',
  draggable = true,
  windowId,
  initialPosition = { x: 100, y: 150 },
  initialZIndex = 50,
  isMinimized = false,
  isMaximized = false,
  resetToOriginalPosition = false
}: BasePageProps) {
  const { getTheme } = useAccessibility()
  const theme = getTheme()
  const { bringToFront, updateWindowPosition } = useWindowManager()
  
  const [position, setPosition] = useState(initialPosition)
  const [zIndex, setZIndex] = useState(initialZIndex)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  // Reset para posição original quando solicitado
  useEffect(() => {
    if (resetToOriginalPosition) {
      console.log(`🔄 Resetando ${title} para posição original:`, initialPosition)
      setPosition(initialPosition)
      setZIndex(initialZIndex)
      
      // Atualizar posição no WindowManager se disponível
      if (windowId && updateWindowPosition) {
        updateWindowPosition(windowId, initialPosition)
      }
    }
  }, [resetToOriginalPosition, initialPosition, initialZIndex, windowId, updateWindowPosition, title])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!draggable) return
    
    // Trazer janela para frente ao clicar
    if (windowId) {
      bringToFront(windowId)
    }
    
    // Só permite arrastar pelo header
    if ((e.target as HTMLElement).closest('[data-draggable-header]')) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && draggable) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      
      // Limitar movimento dentro da tela, respeitando área dos menus
      const maxX = window.innerWidth - parseInt(width)
      const maxY = window.innerHeight - parseInt(height)
      
      // Área mínima Y para não invadir os menus (header + menu1 + menu2)
      const minY = 120 // Espaço para header (36px) + menu1 + menu2
      
      const newPosition = {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(minY, Math.min(newY, maxY))
      }
      
      setPosition(newPosition)
      
      // Atualizar posição no gerenciador de janelas
      if (windowId) {
        updateWindowPosition(windowId, newPosition)
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging && draggable) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart, draggable, width, height])

  const pageStyles = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: zIndex,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: '120px 20px 20px 20px', // Espaço para os menus no topo (header + menu1 + menu2)
    pointerEvents: 'none' // Permite cliques passarem através da página para os menus
  }

  const windowStyles = {
    position: 'absolute' as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: isMaximized ? '100vw' : width,
    height: isMaximized ? '100vh' : (isMinimized ? '40px' : height),
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: isMaximized ? '0' : '8px',
    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    cursor: isDragging ? 'grabbing' : 'default',
    transition: isDragging ? 'none' : 'all 0.2s ease',
    pointerEvents: 'auto' // Reabilita cliques na janela
  }

  const headerStyles = {
    backgroundColor: theme.primary,
    color: 'white',
    padding: '2px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: draggable ? 'grab' : 'default'
  }

  const contentStyles = {
    flex: 1,
    padding: '12px 12px 0px 12px',
    overflow: 'hidden',
    backgroundColor: theme.surface,
    color: theme.text
  }

  const closeButtonStyles = {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease'
  }

  return (
    <div style={pageStyles}>
      <div 
        ref={windowRef}
        style={windowStyles}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div style={headerStyles} data-draggable-header>
          <h3 style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>
            {title}
          </h3>
          <button
            onClick={() => {
              console.log('❌ BOTÃO X CLICADO!')
              console.log('🔧 onClose function:', onClose)
              onClose()
            }}
            style={closeButtonStyles}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div style={contentStyles}>
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
