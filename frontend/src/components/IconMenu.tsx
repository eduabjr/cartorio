import React, { useState, useEffect } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'
import { getRelativeFontSize } from '../utils/fontUtils'
import { announcementService } from '../services/AnnouncementService'
import { useMenuProtection } from './ProtectedMenu'

interface IconMenuItem {
  id: string
  label: string
  icon: string | React.ReactNode
  onClick: () => void
}

interface IconMenuProps {
  items: IconMenuItem[]
  onOpenSideMenu: () => void
}

export function IconMenu({ items, onOpenSideMenu }: IconMenuProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const { getProtectedStyles } = useMenuProtection('ICON_MENU')

  const handleItemClick = (item: IconMenuItem) => {
    // Anunciar clique
    announcementService.announceClick(item.label, 'ícone')
    item.onClick()
  }

  const handleItemHover = (itemLabel: string) => {
    // Anunciar hover
    announcementService.announceHover(itemLabel, 'ícone')
  }

  const handleSideMenuClick = () => {
    // Anunciar clique no menu lateral
    announcementService.announceClick('Menu lateral', 'botão')
    onOpenSideMenu()
  }

  const handleSideMenuHover = () => {
    // Anunciar hover no menu lateral
    announcementService.announceHover('Menu lateral', 'botão')
  }

  const menuStyles = getProtectedStyles({
    top: '0',
    left: '0',
    right: '0',
    backgroundColor: theme.surface,
    borderBottom: `1px solid ${theme.border}`,
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(8px)'
  })

  const iconStyles = (itemId: string) => ({
    padding: '8px',
    background: hoveredItem === itemId ? '#00695C' : 'transparent',
    color: hoveredItem === itemId ? '#FFFFFF' : theme.text,
    cursor: 'pointer',
    borderRadius: '8px',
    fontSize: getRelativeFontSize(20),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '36px',
    minHeight: '36px',
    transition: 'all 0.2s ease-in-out',
    position: 'relative' as const,
    boxShadow: hoveredItem === itemId ? '0 0 0 3px rgba(255, 255, 255, 0.35)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
    border: hoveredItem === itemId ? '1px solid rgba(255, 255, 255, 0.5)' : `1px solid ${theme.border}`,
    transform: hoveredItem === itemId ? 'translateY(-1px) scale(1.03)' : 'translateY(0) scale(1)'
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
          onClick={() => handleItemClick(item)}
          onMouseEnter={() => {
            setHoveredItem(item.id)
            handleItemHover(item.label)
          }}
          onMouseLeave={() => setHoveredItem(null)}
          title={item.label}
        >
          <span>{item.icon}</span>
        </button>
      ))}
      
      {/* Botão do menu lateral */}
      <button
        style={sideMenuButtonStyles}
        onClick={handleSideMenuClick}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = theme.primary + '20'
          ;(e.target as HTMLButtonElement).style.color = theme.primary
          handleSideMenuHover()
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
