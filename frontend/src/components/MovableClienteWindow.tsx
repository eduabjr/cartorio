import React, { useState, useRef, useEffect } from 'react'
import { ClienteCadastroWindow } from './ClienteCadastroWindow'

interface MovableClienteWindowProps {
  onClose: () => void
}

export function MovableClienteWindow({ onClose }: MovableClienteWindowProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
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
    if (isDragging) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      
      // Limitar movimento dentro da tela
      const maxX = window.innerWidth - 900 // largura da janela
      const maxY = window.innerHeight - 700 // altura da janela
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart])

  const windowStyles = {
    position: 'fixed' as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 5,
    cursor: isDragging ? 'grabbing' : 'default'
  }

  return (
    <div
      ref={windowRef}
      style={windowStyles}
      onMouseDown={handleMouseDown}
    >
      <ClienteCadastroWindow onClose={onClose} />
    </div>
  )
}
