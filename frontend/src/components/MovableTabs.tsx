import React, { useState, useRef, useEffect } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'

interface MovableTab {
  id: string
  title: string
  content: React.ReactNode
  x: number
  y: number
  width: number
  height: number
  isMinimized: boolean
}

interface MovableTabsProps {
  tabs: MovableTab[]
  onTabUpdate: (tabs: MovableTab[]) => void
  onTabClose: (tabId: string) => void
  onTabMinimize: (tabId: string) => void
}

export function MovableTabs({ tabs, onTabUpdate, onTabClose, onTabMinimize }: MovableTabsProps) {
  const { getTheme } = useAccessibility()
  const theme = getTheme()
  const [draggedTab, setDraggedTab] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizingTab, setResizingTab] = useState<string | null>(null)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const handleMouseDown = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault()
    const tab = tabs.find(t => t.id === tabId)
    if (!tab) return

    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setDraggedTab(tabId)
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (draggedTab) {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      
      const updatedTabs = tabs.map(tab => 
        tab.id === draggedTab 
          ? { ...tab, x: Math.max(0, newX), y: Math.max(0, newY) }
          : tab
      )
      onTabUpdate(updatedTabs)
    }

    if (resizingTab) {
      const tab = tabs.find(t => t.id === resizingTab)
      if (!tab) return

      const newWidth = Math.max(200, resizeStart.width + (e.clientX - resizeStart.x))
      const newHeight = Math.max(150, resizeStart.height + (e.clientY - resizeStart.y))
      
      const updatedTabs = tabs.map(t => 
        t.id === resizingTab 
          ? { ...t, width: newWidth, height: newHeight }
          : t
      )
      onTabUpdate(updatedTabs)
    }
  }

  const handleMouseUp = () => {
    setDraggedTab(null)
    setResizingTab(null)
  }

  useEffect(() => {
    if (draggedTab || resizingTab) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggedTab, resizingTab, dragOffset, resizeStart])

  const handleResizeStart = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    const tab = tabs.find(t => t.id === tabId)
    if (!tab) return

    setResizingTab(tabId)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: tab.width,
      height: tab.height
    })
  }

  const tabStyles = (tab: MovableTab) => ({
    position: 'absolute' as const,
    left: `${tab.x}px`,
    top: `${tab.y}px`,
    width: `${tab.width}px`,
    height: tab.isMinimized ? '40px' : `${tab.height}px`,
    backgroundColor: theme.surface,
    border: `2px solid ${theme.border}`,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: draggedTab === tab.id ? 1000 : 100,
    cursor: draggedTab === tab.id ? 'grabbing' : 'grab',
    overflow: 'hidden',
    transition: draggedTab === tab.id ? 'none' : 'all 0.2s ease'
  })

  const headerStyles = {
    backgroundColor: theme.primary,
    color: 'white',
    padding: '8px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'grab',
    userSelect: 'none' as const,
    fontSize: '14px',
    fontWeight: '500'
  }

  const contentStyles = {
    padding: '12px',
    height: 'calc(100% - 40px)',
    overflow: 'auto',
    backgroundColor: theme.background
  }

  const resizeHandleStyles = {
    position: 'absolute' as const,
    bottom: '0',
    right: '0',
    width: '12px',
    height: '12px',
    backgroundColor: theme.border,
    cursor: 'nw-resize',
    borderTopLeftRadius: '4px'
  }

  const buttonStyles = {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '12px',
    marginLeft: '4px'
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {tabs.map(tab => (
        <div
          key={tab.id}
          style={tabStyles(tab)}
          onMouseDown={(e) => handleMouseDown(e, tab.id)}
        >
          {/* Header da aba */}
          <div style={headerStyles}>
            <span>{tab.title}</span>
            <div>
              <button
                style={buttonStyles}
                onClick={(e) => {
                  e.stopPropagation()
                  onTabMinimize(tab.id)
                }}
                title={tab.isMinimized ? 'Expandir' : 'Minimizar'}
              >
                {tab.isMinimized ? '□' : '−'}
              </button>
              <button
                style={buttonStyles}
                onClick={(e) => {
                  e.stopPropagation()
                  onTabClose(tab.id)
                }}
                title="Fechar"
              >
                ×
              </button>
            </div>
          </div>

          {/* Conteúdo da aba */}
          {!tab.isMinimized && (
            <div style={contentStyles}>
              {tab.content}
            </div>
          )}

          {/* Handle de redimensionamento */}
          {!tab.isMinimized && (
            <div
              style={resizeHandleStyles}
              onMouseDown={(e) => handleResizeStart(e, tab.id)}
            />
          )}
        </div>
      ))}
    </div>
  )
}
