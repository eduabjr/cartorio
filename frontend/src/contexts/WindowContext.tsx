import React, { createContext, useContext, useState, ReactNode } from 'react'

interface Window {
  id: string
  title: string
  component: ReactNode
  width?: number
  height?: number
  initialX?: number
  initialY?: number
}

interface WindowContextType {
  windows: Window[]
  openWindow: (window: Window) => void
  closeWindow: (id: string) => void
  closeAllWindows: () => void
}

const WindowContext = createContext<WindowContextType | undefined>(undefined)

export function WindowProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<Window[]>([])

  const openWindow = (window: Window) => {
    setWindows(prev => {
      // Remove window if it already exists
      const filtered = prev.filter(w => w.id !== window.id)
      return [...filtered, window]
    })
  }

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id))
  }

  const closeAllWindows = () => {
    setWindows([])
  }

  return (
    <WindowContext.Provider value={{ windows, openWindow, closeWindow, closeAllWindows }}>
      {children}
    </WindowContext.Provider>
  )
}

export function useWindows() {
  const context = useContext(WindowContext)
  if (context === undefined) {
    throw new Error('useWindows deve ser usado dentro de um WindowProvider')
  }
  return context
}
