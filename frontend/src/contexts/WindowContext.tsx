import React, { createContext, useContext, useState, useCallback } from 'react'

export interface WindowInstance {
  id: string
  title: string
  type: string // Tipo da janela para controle de instância única
  component: React.ComponentType<any>
  props: any
  position: { x: number; y: number }
  zIndex: number
  isMinimized: boolean
  isMaximized: boolean
}

interface WindowContextType {
  windows: WindowInstance[]
  openWindow: (window: Omit<WindowInstance, 'position' | 'zIndex' | 'isMinimized' | 'isMaximized'>) => void
  closeWindow: (id: string) => void
  closeWindowByType: (type: string) => void
  bringToFront: (id: string) => void
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void
  toggleMinimize: (id: string) => void
  toggleMaximize: (id: string) => void
  getNextZIndex: () => number
  getNextPosition: () => { x: number; y: number }
  isWindowTypeOpen: (type: string) => boolean
}

const WindowContext = createContext<WindowContextType | undefined>(undefined)

export function WindowProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<WindowInstance[]>([])
  const [nextZIndex, setNextZIndex] = useState(70)
  const [windowCounter, setWindowCounter] = useState(0)

  const getNextZIndex = useCallback(() => {
    const newZIndex = nextZIndex + 1
    setNextZIndex(newZIndex)
    console.log(`📈 Novo zIndex gerado: ${newZIndex}`)
    return newZIndex
  }, [nextZIndex])

  const getNextPosition = useCallback(() => {
    const baseX = 100 + (windowCounter * 30)
    const baseY = 100 + (windowCounter * 30)
    setWindowCounter(prev => prev + 1)
    
    // Garantir que não saia da tela
    const maxX = window.innerWidth - 400
    const maxY = window.innerHeight - 300
    
    return {
      x: Math.min(baseX, maxX),
      y: Math.min(baseY, maxY)
    }
  }, [windowCounter])

  const openWindow = useCallback((windowData: Omit<WindowInstance, 'position' | 'zIndex' | 'isMinimized' | 'isMaximized'>) => {
    // Verificar se já existe uma janela do mesmo tipo
    const existingWindow = windows.find(w => w.type === windowData.type)
    
    if (existingWindow) {
      console.log(`🔄 Janela do tipo '${windowData.type}' já está aberta, trazendo para frente...`)
      
      // Trazer a janela existente para frente (sem fechar/reabrir)
      const newZIndex = getNextZIndex()
      setWindows(prev => 
        prev.map(w => 
          w.id === existingWindow.id 
            ? { ...w, zIndex: newZIndex, isMinimized: false } // Desminimizar se estava minimizada
            : w
        )
      )
      console.log(`✅ Janela '${windowData.type}' trazida para frente`)
    } else {
      // Nova janela - usar posição sequencial
      const position = getNextPosition()
      const zIndex = getNextZIndex()
      
      const newWindow: WindowInstance = {
        ...windowData,
        position,
        zIndex,
        isMinimized: false,
        isMaximized: false
      }

      setWindows(prev => [...prev, newWindow])
      console.log(`🆕 Nova janela '${windowData.type}' aberta`)
    }
  }, [windows, getNextPosition, getNextZIndex])

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(window => window.id !== id))
  }, [])

  const closeWindowByType = useCallback((type: string) => {
    setWindows(prev => prev.filter(window => window.type !== type))
  }, [])

  const isWindowTypeOpen = useCallback((type: string) => {
    return windows.some(window => window.type === type)
  }, [windows])

  const bringToFront = useCallback((id: string) => {
    console.log(`🔺 bringToFront chamado para windowId: ${id}`)
    setNextZIndex(prev => {
      const newZIndex = prev + 1
      console.log(`🎯 Atualizando para novo zIndex: ${newZIndex}`)
      
      setWindows(prevWindows => 
        prevWindows.map(window => {
          if (window.id === id) {
            console.log(`✅ Window ${id} agora tem zIndex: ${newZIndex}`)
            return { ...window, zIndex: newZIndex }
          }
          return window
        })
      )
      return newZIndex
    })
  }, [])

  const updateWindowPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === id 
          ? { ...window, position }
          : window
      )
    )
  }, [])

  const toggleMinimize = useCallback((id: string) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === id 
          ? { ...window, isMinimized: !window.isMinimized }
          : window
      )
    )
  }, [])

  const toggleMaximize = useCallback((id: string) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === id 
          ? { ...window, isMaximized: !window.isMaximized }
          : window
      )
    )
  }, [])

  return (
    <WindowContext.Provider value={{
      windows,
      openWindow,
      closeWindow,
      closeWindowByType,
      bringToFront,
      updateWindowPosition,
      toggleMinimize,
      toggleMaximize,
      getNextZIndex,
      getNextPosition,
      isWindowTypeOpen
    }}>
      {children}
    </WindowContext.Provider>
  )
}

export function useWindowManager() {
  const context = useContext(WindowContext)
  if (context === undefined) {
    throw new Error('useWindowManager must be used within a WindowProvider')
  }
  return context
}