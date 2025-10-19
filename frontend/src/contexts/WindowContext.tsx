import React, { createContext, useContext, useState, useCallback } from 'react'

export interface WindowInstance {
  id: string
  title: string
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
  bringToFront: (id: string) => void
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void
  toggleMinimize: (id: string) => void
  toggleMaximize: (id: string) => void
  getNextZIndex: () => number
  getNextPosition: () => { x: number; y: number }
}

const WindowContext = createContext<WindowContextType | undefined>(undefined)

export function WindowProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<WindowInstance[]>([])
  const [nextZIndex, setNextZIndex] = useState(70)
  const [windowCounter, setWindowCounter] = useState(0)

  const getNextZIndex = useCallback(() => {
    const newZIndex = nextZIndex + 1
    setNextZIndex(newZIndex)
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
  }, [getNextPosition, getNextZIndex])

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(window => window.id !== id))
  }, [])

  const bringToFront = useCallback((id: string) => {
    const newZIndex = getNextZIndex()
    setWindows(prev => 
      prev.map(window => 
        window.id === id 
          ? { ...window, zIndex: newZIndex }
          : window
      )
    )
  }, [getNextZIndex])

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
      bringToFront,
      updateWindowPosition,
      toggleMinimize,
      toggleMaximize,
      getNextZIndex,
      getNextPosition
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