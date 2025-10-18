import React, { useState, useRef, useEffect } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'
import { getRelativeFontSize } from '../utils/fontUtils'
import { announcementService } from '../services/AnnouncementService'

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
  onClick?: () => void
  submenu?: SubMenuItem[]
}

interface TextualMenuProps {
  items: MenuItem[]
  isExpanded: boolean
  onToggleExpanded: () => void
}

export function TextualMenu({ items, isExpanded, onToggleExpanded }: TextualMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { getTheme } = useAccessibility()
  const theme = getTheme()

  // Fechar submenu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
        setActiveSubmenu(null)
      }
    }

    if (activeMenu || activeSubmenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activeMenu, activeSubmenu])

  const handleItemClick = (itemId: string, itemLabel: string) => {
    // Anunciar clique
    announcementService.announceClick(itemLabel, 'menu')
    
    if (activeMenu === itemId) {
      setActiveMenu(null)
      setActiveSubmenu(null)
    } else {
      setActiveMenu(itemId)
      setActiveSubmenu(null)
    }
  }

  const handleItemHover = (itemId: string, itemLabel: string) => {
    // Se há um menu ativo e o item hovered é diferente, trocar automaticamente
    if (activeMenu && activeMenu !== itemId) {
      setActiveMenu(itemId)
      setActiveSubmenu(null) // Fechar submenu ao trocar de menu
    }
    
    // Anunciar hover
    announcementService.announceHover(itemLabel, 'menu')
  }

  const handleSubmenuClick = (subItem: SubMenuItem, parentId: string) => {
    // Anunciar clique no submenu
    announcementService.announceClick(subItem.label, 'submenu')
    
    if (subItem.submenu) {
      // Se tem submenu, abrir o submenu aninhado
      if (activeSubmenu === subItem.id) {
        setActiveSubmenu(null)
      } else {
        setActiveSubmenu(subItem.id)
      }
    } else if (subItem.onClick) {
      // Se não tem submenu, executar a ação
      subItem.onClick()
      setActiveMenu(null)
      setActiveSubmenu(null)
    }
  }


  const handleSubmenuHover = (subItem: SubMenuItem, parentId: string) => {
    // Se o subitem tem submenu, abrir automaticamente
    if (subItem.submenu && activeSubmenu !== subItem.id) {
      setActiveSubmenu(subItem.id)
    }
    
    // Anunciar hover no submenu
    announcementService.announceHover(subItem.label, 'submenu')
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
    padding: '0 8px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    backdropFilter: 'blur(8px)'
  }

  const itemStyles = (itemId: string) => ({
    padding: '8px 20px',
    background: activeMenu === itemId 
      ? theme.surface 
      : hoveredItem === itemId 
        ? '#009688' 
        : 'transparent',
    color: activeMenu === itemId ? theme.primary : (hoveredItem === itemId ? '#FFFFFF' : theme.text),
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0',
    fontSize: getRelativeFontSize(14),
    fontWeight: activeMenu === itemId ? '600' : '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease-in-out',
    position: 'relative' as const,
    border: `1px solid ${theme.border}`,
    borderBottom: activeMenu === itemId ? `1px solid ${theme.surface}` : `1px solid ${theme.border}`,
    marginRight: '2px',
    marginBottom: activeMenu === itemId ? '-1px' : '0',
    zIndex: activeMenu === itemId ? 2 : 1,
    boxShadow: activeMenu === itemId ? '0 -2px 4px rgba(0, 0, 0, 0.05)' : (hoveredItem === itemId ? '0 0 0 3px rgba(0, 121, 107, 0.25)' : 'none')
  })

  const submenuStyles = {
    position: 'absolute' as const,
    top: '100%',
    left: '0',
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '0 0 8px 8px',
    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    padding: '6px 0',
    minWidth: '220px',
    zIndex: 1001,
    marginTop: '0',
    display: activeMenu ? 'flex' : 'none',
    flexDirection: 'column' as const,
    gap: '3px',
    backdropFilter: 'blur(8px)',
    willChange: 'opacity, transform',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    opacity: 1,
    transform: 'translateY(0)'
  }

  const submenuItemStyles = {
    padding: '8px 14px',
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
            onClick={() => handleItemClick(item.id, item.label)}
            onMouseEnter={() => {
              setHoveredItem(item.id)
              handleItemHover(item.id, item.label)
            }}
            onMouseLeave={() => setHoveredItem(null)}
            onFocus={() => setHoveredItem(item.id)}
            onBlur={() => setHoveredItem(null)}
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
                <div key={subItem.id} style={{ position: 'relative' }}>
                  <button
                    style={{
                      ...submenuItemStyles,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: activeSubmenu === subItem.id ? `${theme.primary}15` : 'transparent',
                      borderLeft: activeSubmenu === subItem.id ? `3px solid ${theme.primary}` : '3px solid transparent'
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleSubmenuClick(subItem, item.id)
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = `${theme.primary}20`
                      handleSubmenuHover(subItem, item.id)
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                    }}
                    onFocus={() => {
                      handleSubmenuHover(subItem, item.id)
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', filter: hoveredItem === subItem.id ? 'brightness(1.2) contrast(1.1)' : 'none' }}>{subItem.icon}</span>
                  <span style={{ filter: hoveredItem === subItem.id ? 'brightness(1.1)' : 'none' }}>{subItem.label}</span>
                    </div>
                    {subItem.submenu && (
                      <span style={{ 
                        fontSize: '12px', 
                        marginLeft: '8px',
                        color: activeSubmenu === subItem.id ? theme.primary : theme.text,
                        fontWeight: 'bold'
                      }}>
                        {activeSubmenu === subItem.id ? '◀' : '▶'}
                      </span>
                    )}
                  </button>

                  {/* Submenu aninhado */}
                  {activeSubmenu === subItem.id && subItem.submenu && (
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '100%',
                      backgroundColor: theme.surface,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '0 8px 8px 0',
                      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      padding: '6px 0',
                      minWidth: '200px',
                      zIndex: 1003,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      backdropFilter: 'blur(8px)',
                      willChange: 'opacity, transform',
                      transition: 'opacity 0.2s ease, transform 0.2s ease',
                      opacity: 1,
                      transform: 'translateX(0)'
                    }}>
                      {subItem.submenu.map((nestedItem) => (
                        <button
                          key={nestedItem.id}
                          style={submenuItemStyles}
                          onClick={() => {
                            if (nestedItem.onClick) {
                              announcementService.announceClick(nestedItem.label, 'submenu')
                              nestedItem.onClick()
                              setActiveMenu(null)
                              setActiveSubmenu(null)
                            }
                          }}
                          onMouseEnter={(e) => {
                            const target = e.target as HTMLButtonElement
                            target.style.backgroundColor = theme.primary + '20'
                            target.style.transform = 'translateX(2px)'
                          }}
                          onMouseLeave={(e) => {
                            const target = e.target as HTMLButtonElement
                            target.style.backgroundColor = 'transparent'
                            target.style.transform = 'translateX(0)'
                          }}
                        >
                          <span style={{ fontSize: '14px' }}>{nestedItem.icon}</span>
                          <span style={{ filter: 'brightness(1.05)' }}>{nestedItem.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
