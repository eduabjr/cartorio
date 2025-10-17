import React, { useState } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'
import { getRelativeFontSize } from '../utils/fontUtils'

interface IconMenuItem {
  id: string
  label: string
  icon: string
  onClick: () => void
}

interface IconMenuProps {
  items: IconMenuItem[]
  onOpenSideMenu: () => void
}

export function IconMenu({ items, onOpenSideMenu }: IconMenuProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const { getTheme } = useAccessibility()
  const theme = getTheme()

  const menuStyles = {
    position: 'relative' as const,
    top: '0',
    left: '0',
    right: '0',
    zIndex: 999,
    backgroundColor: theme.surface,
    borderBottom: `1px solid ${theme.border}`,
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(8px)'
  }

  const iconStyles = (itemId: string) => ({
    padding: '12px',
    border: 'none',
    background: hoveredItem === itemId ? '#007F7F' : 'transparent',
    color: hoveredItem === itemId ? theme.primary : theme.text,
    cursor: 'pointer',
    borderRadius: '12px',
    fontSize: getRelativeFontSize(24),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '48px',
    minHeight: '48px',
    transition: 'all 0.3s ease-in-out',
    position: 'relative' as const,
    boxShadow: hoveredItem === itemId ? '0 4px 8px rgba(0, 0, 0, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
    transform: hoveredItem === itemId ? 'translateY(-1px)' : 'translateY(0)'
  })

  const sideMenuButtonStyles = {
    marginLeft: 'auto',
    padding: '12px',
    border: 'none',
    background: 'transparent',
    color: theme.text,
    cursor: 'pointer',
    borderRadius: '8px',
    fontSize: getRelativeFontSize(20),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '48px',
    minHeight: '48px',
    transition: 'all 0.2s ease'
  }

  return (
    <div style={menuStyles}>
      {items.map((item) => (
        <button
          key={item.id}
          style={iconStyles(item.id)}
          onClick={item.onClick}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          title={item.label}
        >
          <span>{item.icon}</span>
        </button>
      ))}
      
      {/* Botão do menu lateral */}
      <button
        style={sideMenuButtonStyles}
        onClick={onOpenSideMenu}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = theme.primary + '20'
          ;(e.target as HTMLButtonElement).style.color = theme.primary
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
          ;(e.target as HTMLButtonElement).style.color = theme.text
        }}
        title="Menu do usuário"
      >
        <span>☰</span>
      </button>
    </div>
  )
}
