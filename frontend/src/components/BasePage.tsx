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
  headerColor?: string
  resizable?: boolean
  minWidth?: string
  minHeight?: string
  maxWidth?: string
  maxHeight?: string
}

export function BasePage({ 
  title, 
  onClose, 
  children, 
  width = '1000px', 
  height = '600px',
  draggable = true,
  windowId,
  initialPosition = { x: 100, y: 150 },
  initialZIndex = 50,
  isMinimized = false,
  isMaximized = false,
  resetToOriginalPosition = false,
  headerColor,
  resizable = true,
  minWidth = '400px',
  minHeight = '300px',
  maxWidth,
  maxHeight
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

  // Função para trazer janela para frente
  const handleBringToFront = () => {
    console.log('🔼 Trazendo janela para frente:', title)
    if (windowId) {
      bringToFront(windowId)
    } else {
      // Se não tem windowId, usar timestamp como zIndex para garantir que seja único e maior
      const newZIndex = 1000 + Date.now() % 10000
      console.log('📊 Novo zIndex:', newZIndex)
      setZIndex(newZIndex)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!draggable) return
    
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
      
      // Obter tamanho ATUAL da janela (considerando redimensionamento)
      const currentWidth = windowRef.current?.offsetWidth || parseInt(width)
      const currentHeight = windowRef.current?.offsetHeight || parseInt(height)
      
      // Limitar movimento dentro da tela, respeitando área dos menus
      const maxX = window.innerWidth - currentWidth
      const maxY = window.innerHeight - currentHeight
      
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
    minWidth: minWidth,
    minHeight: minHeight,
    maxWidth: maxWidth,
    maxHeight: maxHeight,
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: isMaximized ? '0' : '8px',
    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    cursor: isDragging ? 'grabbing' : 'default',
    transition: isDragging ? 'none' : 'all 0.2s ease',
    pointerEvents: 'auto', // Reabilita cliques na janela
    resize: resizable ? 'both' as const : 'none' as const
  }

  const headerStyles = {
    backgroundColor: headerColor || theme.primary,
    color: 'white',
    padding: '1px 8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: draggable ? 'grab' : 'default',
    minHeight: '22px'
  }

  const contentStyles = {
    flex: 1,
    padding: '8px 8px 4px 8px',  // Reduzido padding
    overflow: 'hidden',
    backgroundColor: theme.surface,
    color: theme.text,
    display: 'flex',
    flexDirection: 'column' as const
  }

  const closeButtonStyles = {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '2px',
    borderRadius: '3px',
    transition: 'background-color 0.2s ease',
    lineHeight: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  return (
    <div style={pageStyles}>
      <div 
        ref={windowRef}
        style={windowStyles}
        onMouseDown={(e) => {
          // Trazer janela para frente ao clicar em qualquer lugar
          handleBringToFront()
          
          // Chamar handleMouseDown para arrastar (apenas se for no header)
          handleMouseDown(e)
        }}
      >
        {/* Header */}
        <div style={headerStyles} data-draggable-header>
          <h3 style={{ margin: 0, fontSize: '11px', fontWeight: '600', lineHeight: '1' }}>
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
