import { useState, useEffect, useCallback } from 'react'

export type WindowState = 'normal' | 'maximized' | 'double-maximized' | 'minimized'

export interface WindowStateHook {
  windowState: WindowState
  isMaximized: boolean
  isDoubleMaximized: boolean
  isMinimized: boolean
  maximize: () => void
  doubleMaximize: () => void
  minimize: () => void
  restore: () => void
  close: () => void
}

export function useWindowState(): WindowStateHook {
  const [windowState, setWindowState] = useState<WindowState>('normal')

  const isMaximized = windowState === 'maximized' || windowState === 'double-maximized'
  const isDoubleMaximized = windowState === 'double-maximized'
  const isMinimized = windowState === 'minimized'

  const maximize = useCallback(() => {
    setWindowState('maximized')
    // Aplicar estilos de maximização
    document.body.style.overflow = 'hidden'
  }, [])

  const doubleMaximize = useCallback(() => {
    setWindowState('double-maximized')
    // Aplicar estilos de duplo maximização (preencher múltiplas telas)
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = '0'
    document.body.style.left = '0'
    document.body.style.width = '100vw'
    document.body.style.height = '100vh'
  }, [])

  const minimize = useCallback(() => {
    setWindowState('minimized')
    // Aplicar estilos de minimização
    document.body.style.transform = 'scale(0.1)'
    document.body.style.opacity = '0'
  }, [])

  const restore = useCallback(() => {
    setWindowState('normal')
    // Restaurar estilos normais
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.width = ''
    document.body.style.height = ''
    document.body.style.transform = ''
    document.body.style.opacity = ''
  }, [])

  const close = useCallback(() => {
    // Implementar lógica de fechamento
    if (window.confirm('Deseja realmente fechar o sistema?')) {
      window.close()
    }
  }, [])

  // Detectar mudanças de estado da janela
  useEffect(() => {
    const handleResize = () => {
      if (windowState === 'maximized' && window.innerWidth < screen.width) {
        setWindowState('normal')
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [windowState])

  return {
    windowState,
    isMaximized,
    isDoubleMaximized,
    isMinimized,
    maximize,
    doubleMaximize,
    minimize,
    restore,
    close
  }
}
