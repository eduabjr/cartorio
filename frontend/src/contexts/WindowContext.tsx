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
  formData?: any // 🔒 Dados do formulário persistidos
}

interface WindowContextType {
  windows: WindowInstance[]
  openWindow: (window: Omit<WindowInstance, 'position' | 'zIndex' | 'isMinimized' | 'isMaximized'>) => void
  closeWindow: (id: string) => void
  closeWindowByType: (type: string) => void
  bringToFront: (id: string) => void
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void
  updateWindowFormData: (id: string, formData: any) => void
  toggleMinimize: (id: string) => void
  toggleMaximize: (id: string) => void
  isWindowTypeOpen: (type: string) => boolean
}

const WindowContext = createContext<WindowContextType | undefined>(undefined)

export function WindowProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<WindowInstance[]>([])
  const [nextZIndex, setNextZIndex] = useState(2000) // 🔒 CRÍTICO: Maior que menus (zIndex: 1001)
  const [windowCounter, setWindowCounter] = useState(0)

  const openWindow = useCallback((windowData: Omit<WindowInstance, 'position' | 'zIndex' | 'isMinimized' | 'isMaximized'>) => {
    setWindows(prev => {
      // Verificar se já existe uma janela do mesmo tipo
      const existingWindow = prev.find(w => w.type === windowData.type)
      
      if (existingWindow) {
        console.log(`🔄 Janela do tipo '${windowData.type}' já está aberta, trazendo para frente...`)
        
        // Trazer a janela existente para frente (sem fechar/reabrir)
        const newZIndex = nextZIndex + 1
        setNextZIndex(newZIndex)
        
        console.log(`✅ Janela '${windowData.type}' trazida para frente com zIndex ${newZIndex}`)
        
        // 🔒 CORREÇÃO: Preservar dados do formulário ao trazer para frente
        return prev.map(w => 
          w.id === existingWindow.id 
            ? { 
                ...w, 
                zIndex: newZIndex, 
                isMinimized: false,
                // Preservar dados existentes e mesclar com novos props se necessário
                props: { ...w.props, ...windowData.props }
              }
            : w
        )
      } else {
        // Nova janela - usar posição sequencial
        const baseX = 100 + (windowCounter * 30)
        const baseY = 100 + (windowCounter * 30)
        setWindowCounter(c => c + 1)
        
        // Garantir que não saia da tela
        const maxX = window.innerWidth - 400
        const maxY = window.innerHeight - 300
        
        const position = {
          x: Math.min(baseX, maxX),
          y: Math.min(baseY, maxY)
        }
        
        const zIndex = nextZIndex + 1
        setNextZIndex(zIndex)
        
        const newWindow: WindowInstance = {
          ...windowData,
          position,
          zIndex,
          isMinimized: false,
          isMaximized: false
        }

        console.log(`🆕 Nova janela '${windowData.type}' aberta com zIndex ${zIndex}`)
        return [...prev, newWindow]
      }
    })
  }, [nextZIndex, windowCounter])

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
    
    const newZIndex = nextZIndex + 1
    setNextZIndex(newZIndex)
    console.log(`🎯 Atualizando para novo zIndex: ${newZIndex}`)
    
    setWindows(prev => 
      prev.map(window => {
        if (window.id === id) {
          console.log(`✅ Window ${id} agora tem zIndex: ${newZIndex}`)
          return { ...window, zIndex: newZIndex }
        }
        return window
      })
    )
  }, [nextZIndex])

  const updateWindowPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === id 
          ? { ...window, position }
          : window
      )
    )
  }, [])

  const updateWindowFormData = useCallback((id: string, formData: any) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === id 
          ? { ...window, formData }
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
      updateWindowFormData,
      toggleMinimize,
      toggleMaximize,
      isWindowTypeOpen
    }}>
      {children}
    </WindowContext.Provider>
  )
}

export function useWindowManager() {
  const context = useContext(WindowContext)
  if (context === undefined) {
    // 🔒 FALLBACK: Retornar funções vazias em vez de erro
    console.error('❌❌❌ useWindowManager usado fora do WindowProvider!')
    console.error('📍 Stack trace:', new Error().stack)
    
    // Retornar funções vazias para não quebrar a aplicação
    return {
      windows: [],
      openWindow: () => { console.warn('⚠️ openWindow chamado sem Provider') },
      closeWindow: () => { console.warn('⚠️ closeWindow chamado sem Provider') },
      closeWindowByType: () => { console.warn('⚠️ closeWindowByType chamado sem Provider') },
      bringToFront: () => { console.warn('⚠️ bringToFront chamado sem Provider') },
      updateWindowPosition: () => { console.warn('⚠️ updateWindowPosition chamado sem Provider') },
      updateWindowFormData: () => { console.warn('⚠️ updateWindowFormData chamado sem Provider') },
      toggleMinimize: () => { console.warn('⚠️ toggleMinimize chamado sem Provider') },
      toggleMaximize: () => { console.warn('⚠️ toggleMaximize chamado sem Provider') },
      isWindowTypeOpen: () => { console.warn('⚠️ isWindowTypeOpen chamado sem Provider'); return false }
    }
  }
  return context
}