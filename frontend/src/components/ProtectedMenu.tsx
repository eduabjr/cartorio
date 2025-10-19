import React, { useEffect, useRef } from 'react'
import { useZIndexManager } from '../hooks/useZIndexManager'

interface ProtectedMenuProps {
  children: React.ReactNode
  menuType: 'ICON_MENU' | 'TEXTUAL_MENU' | 'HOVER_MENU' | 'SUBMENU_LEVEL_1' | 'SUBMENU_LEVEL_2'
  className?: string
  style?: React.CSSProperties
  [key: string]: any
}

/**
 * Componente wrapper que protege os menus contra quebras de z-index
 * Aplica automaticamente o z-index correto e monitora mudanças
 */
export function ProtectedMenu({ 
  children, 
  menuType, 
  className, 
  style, 
  ...props 
}: ProtectedMenuProps) {
  const { getZIndex, validateZIndex, forceCorrectZIndex } = useZIndexManager()
  const containerRef = useRef<HTMLDivElement>(null)
  const lastValidZIndex = useRef<number>(getZIndex(menuType))

  // Z-index correto para este tipo de menu
  const correctZIndex = getZIndex(menuType)

  // Estilos protegidos que sempre aplicam o z-index correto
  const protectedStyles: React.CSSProperties = {
    position: 'relative',
    zIndex: correctZIndex,
    ...style
  }

  // Monitorar mudanças no z-index e corrigir automaticamente
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target as HTMLElement
          const currentStyle = target.style.zIndex
          
          if (currentStyle) {
            const currentZIndex = parseInt(currentStyle)
            
            // Se o z-index mudou e não é o correto, corrigir automaticamente
            if (!validateZIndex(menuType, currentZIndex)) {
              console.warn(`🚨 Z-Index incorreto detectado em ${menuType}: ${currentZIndex}. Corrigindo para: ${correctZIndex}`)
              target.style.zIndex = correctZIndex.toString()
            }
          }
        }
      })
    })

    observer.observe(container, {
      attributes: true,
      attributeFilter: ['style']
    })

    return () => {
      observer.disconnect()
    }
  }, [menuType, correctZIndex, validateZIndex])

  // Verificar z-index na montagem
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      const computedStyle = window.getComputedStyle(container)
      const currentZIndex = parseInt(computedStyle.zIndex) || 0
      
      if (!validateZIndex(menuType, currentZIndex)) {
        console.warn(`🚨 Z-Index incorreto na montagem de ${menuType}: ${currentZIndex}. Aplicando correção.`)
        container.style.zIndex = correctZIndex.toString()
      }
    }
  }, [menuType, correctZIndex, validateZIndex])

  return (
    <div
      ref={containerRef}
      className={className}
      style={protectedStyles}
      data-menu-type={menuType}
      data-protected-z-index={correctZIndex}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Hook para usar em componentes de menu que precisam de proteção
 */
export function useMenuProtection(menuType: 'ICON_MENU' | 'TEXTUAL_MENU' | 'HOVER_MENU' | 'SUBMENU_LEVEL_1' | 'SUBMENU_LEVEL_2') {
  const { getZIndex, validateZIndex, forceCorrectZIndex } = useZIndexManager()
  
  const getProtectedStyles = (customStyles?: React.CSSProperties): React.CSSProperties => {
    const correctZIndex = getZIndex(menuType)
    
    return {
      position: 'relative',
      zIndex: correctZIndex,
      ...customStyles
    }
  }

  const validateAndCorrectZIndex = (element: HTMLElement | null): boolean => {
    if (!element) return false
    
    const computedStyle = window.getComputedStyle(element)
    const currentZIndex = parseInt(computedStyle.zIndex) || 0
    
    if (!validateZIndex(menuType, currentZIndex)) {
      console.warn(`🚨 Z-Index incorreto detectado em ${menuType}: ${currentZIndex}. Corrigindo.`)
      element.style.zIndex = forceCorrectZIndex(menuType).toString()
      return true
    }
    
    return false
  }

  return {
    getProtectedStyles,
    validateAndCorrectZIndex,
    correctZIndex: getZIndex(menuType)
  }
}
