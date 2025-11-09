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
  initialZIndex = 2000, // 🔒 CRÍTICO: Maior que menus (zIndex: 1001)
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
  
  // 🔒 PROTEÇÃO: Armazenar posição inicial apenas uma vez, nunca mudar
  const initialPositionRef = useRef(initialPosition)
  const initialZIndexRef = useRef(initialZIndex)
  
  // 🔒 PROTEÇÃO: Flag para saber se já foi inicializado
  const isInitializedRef = useRef(false)
  
  // 🔒 PROTEÇÃO: Guardar a última posição conhecida do usuário
  const userPositionRef = useRef<{ x: number; y: number } | null>(null)
  
  // 🔒 PROTEÇÃO MÁXIMA: Criar chave única para localStorage baseada no windowId ou title
  const storageKey = `window-position-${windowId || title}`
  
  // Inicializar posição e zIndex apenas na primeira montagem
  const [position, setPosition] = useState(() => {
    console.log(`🏗️ CRIANDO BasePage: "${title}"`)
    console.log(`   windowId:`, windowId)
    console.log(`   initialPosition recebida:`, initialPosition)
    console.log(`   initialZIndex recebida:`, initialZIndex)
    isInitializedRef.current = true
    
    // 🔒 NÍVEL 1: Tentar recuperar posição salva no localStorage
    try {
      const savedPosition = localStorage.getItem(storageKey)
      if (savedPosition) {
        const parsedPosition = JSON.parse(savedPosition)
        console.log(`   ✅ Posição recuperada do localStorage:`, parsedPosition)
        userPositionRef.current = parsedPosition
        return parsedPosition
      }
    } catch (e) {
      console.warn(`   ⚠️ Erro ao recuperar posição do localStorage:`, e)
    }
    
    // 🔒 NÍVEL 2: Se já temos uma posição do usuário na ref, usar ela
    if (userPositionRef.current) {
      console.log(`   ✅ Usando posição da ref:`, userPositionRef.current)
      return userPositionRef.current
    }
    
    // 🔒 NÍVEL 3: Usar posição inicial pela primeira vez
    console.log(`   🆕 Primeira vez - usando initialPosition:`, initialPositionRef.current)
    return initialPositionRef.current
  })
  const [zIndex, setZIndex] = useState(() => initialZIndexRef.current)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const windowRef = useRef<HTMLDivElement>(null)
  
  // 🔒 LOG: Monitorar re-renders (DESABILITADO para reduzir poluição do console)
  // useEffect(() => {
  //   console.log(`🔄 BasePage "${title}" RE-RENDERIZOU`)
  //   console.log(`   Posição atual (state):`, position)
  //   console.log(`   initialPosition (prop):`, initialPosition)
  //   console.log(`   Posição protegida (ref):`, initialPositionRef.current)
  //   console.log(`   Posição do usuário (ref):`, userPositionRef.current)
  // })
  
  // 🔒 PROTEÇÃO MÁXIMA: Bloquear mudanças em initialPosition
  useEffect(() => {
    // Se recebemos uma nova initialPosition diferente da atual
    const positionChanged = 
      initialPosition.x !== position.x || 
      initialPosition.y !== position.y
    
    if (positionChanged) {
      console.log(`⚠️ TENTATIVA DE RESET DETECTADA!`)
      console.log(`   initialPosition (nova):`, initialPosition)
      console.log(`   position (atual):`, position)
      console.log(`   Posição do usuário (salva):`, userPositionRef.current)
      
      // Se temos uma posição do usuário salva, IGNORAR a mudança
      if (userPositionRef.current) {
        console.log(`   🛡️ BLOQUEADO! Mantendo posição do usuário:`, userPositionRef.current)
        // NÃO fazer nada - manter posição atual
        return
      }
      
      console.log(`   ⚠️ Sem posição do usuário - permitindo mudança`)
    }
  }, [initialPosition.x, initialPosition.y])

  // 🔒 PROTEÇÃO: Somente resetar se explicitamente solicitado
  useEffect(() => {
    if (resetToOriginalPosition) {
      console.log(`🔄 RESET EXPLÍCITO: ${title} voltando para posição inicial`, initialPositionRef.current)
      setPosition(initialPositionRef.current)
      setZIndex(initialZIndexRef.current)
      
      // Limpar posição do usuário
      userPositionRef.current = null
      try {
        localStorage.removeItem(storageKey)
      } catch (e) {
        console.warn(`⚠️ Erro ao limpar localStorage:`, e)
      }
      
      // Atualizar posição no WindowManager se disponível
      if (windowId && updateWindowPosition) {
        updateWindowPosition(windowId, initialPositionRef.current)
      }
    }
  }, [resetToOriginalPosition]) // 🔒 PROTEÇÃO: Apenas resetToOriginalPosition como dependência!

  // 🔒 PROTEÇÃO: Sincronizar zIndex do WindowManager SEM resetar posição
  useEffect(() => {
    if (initialZIndex !== zIndex && !resetToOriginalPosition) {
      console.log(`🎯 SINCRONIZAÇÃO: Atualizando zIndex de ${title} de ${zIndex} para ${initialZIndex}`)
      setZIndex(initialZIndex)
    }
  }, [initialZIndex]) // Sincronizar apenas zIndex, não posição

  // Função para trazer janela para frente
  const handleBringToFront = () => {
    if (windowId) {
      bringToFront(windowId)
    } else {
      // Se não tem windowId, usar timestamp como zIndex para garantir que seja único e maior
      const newZIndex = 1000 + Date.now() % 10000
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
      
      // 🔒 PROTEÇÃO: Salvar posição do usuário na ref E no localStorage
      userPositionRef.current = newPosition
      try {
        localStorage.setItem(storageKey, JSON.stringify(newPosition))
        console.log(`👆 USUÁRIO MOVEU "${title}" para:`, newPosition, '- SALVO!')
      } catch (e) {
        console.warn(`⚠️ Erro ao salvar posição no localStorage:`, e)
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

  const { currentTheme } = theme
  const headerBackground = headerColor || (currentTheme === 'dark' ? theme.primary : theme.secondary)

  const headerStyles: React.CSSProperties = {
    backgroundColor: headerBackground,
    color: '#fff',
    padding: '3px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: draggable ? 'grab' : 'default',
    minHeight: '24px',
    borderBottom: currentTheme === 'dark' ? `1px solid ${theme.border}` : '1px solid rgba(255,255,255,0.25)'
  }

  const headerTitleStyles: React.CSSProperties = {
    margin: 0,
    fontSize: '13px',
    fontWeight: 600,
    color: '#fff'
  }

  const headerContainerStyles: React.CSSProperties = {
    padding: '4px 10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: draggable ? 'grab' : 'default',
    minHeight: '24px'
  }

  const contentStyles = {
    flex: 1,
    padding: '8px 8px 4px 8px',  // Reduzido padding
    overflow: 'hidden',
    backgroundColor: theme.surface,
    color: theme.text,
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const  // 🔒 IMPORTANTE: Permite modais ficarem contidos dentro da janela
  }

  const closeButtonStyles = {
    background: 'none',
    border: 'none',
    color: '#fff',
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
          <h3 style={headerTitleStyles}>
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
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.2)'
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

