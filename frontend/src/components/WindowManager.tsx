import React, { useState, useEffect, useCallback } from 'react'
import { MovableWindow } from './MovableWindow'
import { useWindows } from '../contexts/WindowContext'

export function WindowManager() {
  const { windows, closeWindow } = useWindows()
  const [windowPositions, setWindowPositions] = useState<Map<string, { x: number, y: number, width: number, height: number }>>(new Map())
  const [containerSize, setContainerSize] = useState({ width: '100%', height: '100%' })

  // Callback para atualizar posição de uma janela
  const handlePositionChange = useCallback((id: string, x: number, y: number, width: number, height: number) => {
    console.log('📬 WindowManager recebeu atualização de posição:', { id, x, y, width, height })
    setWindowPositions(prev => {
      const newMap = new Map(prev)
      newMap.set(id, { x, y, width, height })
      console.log('📊 Total de janelas rastreadas:', newMap.size)
      return newMap
    })
  }, [])

  // Atualizar o tamanho do container baseado nas posições das janelas
  useEffect(() => {
    if (windowPositions.size === 0) {
      console.log('📐 Nenhuma janela - container no tamanho padrão')
      setContainerSize({ width: '100%', height: '100%' })
      return
    }

    let maxX = 0
    let maxY = 0

    windowPositions.forEach(({ x, y, width, height }) => {
      const windowRight = x + width
      const windowBottom = y + height
      
      maxX = Math.max(maxX, windowRight)
      maxY = Math.max(maxY, windowBottom)
      
      console.log('🪟 Janela posição:', { x, y, width, height, right: windowRight, bottom: windowBottom })
    })

    // Adicionar margem extra (500px) para permitir arrastar além da borda
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800
    
    const minWidth = Math.max(maxX + 500, viewportWidth)
    const minHeight = Math.max(maxY + 500, viewportHeight)

    console.log('📐 Container expandido:', { 
      width: minWidth, 
      height: minHeight, 
      maxX, 
      maxY,
      viewport: { width: viewportWidth, height: viewportHeight }
    })
    console.log('📊 Scroll deve estar ativo:', minHeight > viewportHeight || minWidth > viewportWidth)

    setContainerSize({
      width: `${minWidth}px`,
      height: `${minHeight}px`
    })
  }, [windowPositions])

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      minWidth: '100%',
      minHeight: '100%',
      pointerEvents: 'none'
    }}>
      {windows.map((window) => (
        <MovableWindow
          key={window.id}
          title={window.title}
          isOpen={true}
          onClose={() => closeWindow(window.id)}
          width={window.width}
          height={window.height}
          initialX={window.initialX}
          initialY={window.initialY}
          onPositionChange={(x, y, w, h) => handlePositionChange(window.id, x, y, w, h)}
        >
          {window.component}
        </MovableWindow>
      ))}
    </div>
  )
}
