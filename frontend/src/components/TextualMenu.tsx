import React, { useState, useRef, useEffect } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'
import { getRelativeFontSize } from '../utils/fontUtils'

interface MenuItem {
  id: string
  label: string
  icon: string
  submenu?: SubMenuItem[]
}

interface SubMenuItem {
  id: string
  label: string
  icon: string
  onClick: () => void
}

interface TextualMenuProps {
  items: MenuItem[]
  isExpanded: boolean
  onToggleExpanded: () => void
}

export function TextualMenu({ items, isExpanded, onToggleExpanded }: TextualMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { getTheme } = useAccessibility()
  const theme = getTheme()

  // Fechar submenu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activeMenu])

  const handleItemClick = (itemId: string) => {
    if (activeMenu === itemId) {
      setActiveMenu(null)
    } else {
      setActiveMenu(itemId)
    }
  }

  const handleSubmenuClick = (subItem: SubMenuItem) => {
    subItem.onClick()
    setActiveMenu(null)
  }

  const menuStyles = {
    position: 'relative' as const,
    top: '0',
    left: '0',
    right: '0',
    zIndex: 1000,
    backgroundColor: theme.surface,
    borderBottom: `1px solid ${theme.border}`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '0',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '0',
    backdropFilter: 'blur(8px)'
  }

  const itemStyles = (itemId: string) => ({
    padding: '12px 20px',
    border: 'none',
    background: activeMenu === itemId 
      ? theme.surface 
      : hoveredItem === itemId 
        ? '#007F7F' 
        : 'transparent',
    color: activeMenu === itemId ? theme.primary : theme.text,
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0',
    fontSize: getRelativeFontSize(14),
    fontWeight: activeMenu === itemId ? '600' : '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease-in-out',
    boxShadow: hoveredItem === itemId ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
    position: 'relative' as const,
    border: `1px solid ${theme.border}`,
    borderBottom: activeMenu === itemId ? `1px solid ${theme.surface}` : `1px solid ${theme.border}`,
    marginRight: '2px',
    marginBottom: activeMenu === itemId ? '-1px' : '0',
    zIndex: activeMenu === itemId ? 2 : 1,
    boxShadow: activeMenu === itemId ? '0 -2px 4px rgba(0, 0, 0, 0.05)' : 'none'
  })

  const submenuStyles = {
    position: 'absolute' as const,
    top: '100%',
    left: '0',
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '0 0 8px 8px',
    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    padding: '8px 0',
    minWidth: '220px',
    zIndex: 1001,
    marginTop: '0',
    display: activeMenu ? 'block' : 'none',
    backdropFilter: 'blur(8px)'
  }

  const submenuItemStyles = {
    padding: '10px 12px',
    border: 'none',
    background: 'transparent',
    color: theme.text,
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: getRelativeFontSize(13),
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    textAlign: 'left' as const,
    transition: 'all 0.2s ease'
  }

  return (
    <div ref={menuRef} style={menuStyles}>
      {items.map((item) => (
        <div key={item.id} style={{ position: 'relative' }}>
          <button
            style={itemStyles(item.id)}
            onClick={() => handleItemClick(item.id)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            title={item.label}
          >
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.submenu && (
              <span style={{ fontSize: '12px', marginLeft: '4px' }}>
                {activeMenu === item.id ? '▲' : '▼'}
              </span>
            )}
          </button>

          {/* Submenu */}
          {activeMenu === item.id && item.submenu && (
            <div style={submenuStyles}>
              {item.submenu.map((subItem) => (
                <button
                  key={subItem.id}
                  style={submenuItemStyles}
                  onClick={() => handleSubmenuClick(subItem)}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = theme.primary + '20'
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{subItem.icon}</span>
                  <span>{subItem.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
