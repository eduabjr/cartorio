import React, { useState, useRef, useEffect } from 'react'
import { XIcon } from './icons'

interface MovableWindowProps {
  title: string
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  width?: number
  height?: number
  initialX?: number
  initialY?: number
}

export function MovableWindow({
  title,
  children,
  isOpen,
  onClose,
  width = 800,
  height = 600,
  initialX = 100,
  initialY = 100
}: MovableWindowProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect()
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setIsDragging(true)
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={windowRef}
      className="fixed bg-white border border-gray-300 shadow-2xl rounded-lg z-50"
      style={{
        left: position.x,
        top: position.y,
        width: width,
        height: height,
        minWidth: 400,
        minHeight: 300
      }}
    >
      {/* Header da janela */}
      <div
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-4 py-2 rounded-t-lg cursor-move flex items-center justify-between shadow-lg"
        onMouseDown={handleMouseDown}
      >
        <h3 className="text-sm font-medium">{title}</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
        >
          <XIcon size={16} />
        </button>
      </div>

      {/* Conteúdo da janela */}
      <div className="p-4 h-full overflow-auto bg-gradient-to-br from-white via-blue-50 to-purple-50" style={{ height: height - 50 }}>
        {children}
      </div>
    </div>
  )
}
