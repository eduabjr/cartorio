import { useState, useCallback, useRef, useEffect } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'

interface MenuItem {
  id: string
  label: string
  icon?: string
  submenu?: MenuItem[]
  onClick?: () => void
}

interface HoverMenuProps {
  items: MenuItem[]
  className?: string
  style?: React.CSSProperties
}

export function HoverMenu({ items, className, style }: HoverMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [submenuPosition, setSubmenuPosition] = useState<{ x: number; y: number } | null>(null)
  const { getTheme, isReducedMotion } = useAccessibility()
  const theme = getTheme()
  const menuRef = useRef<HTMLDivElement>(null)
  const submenuRef = useRef<HTMLDivElement>(null)


  const handleMouseEnter = useCallback((itemId: string, event: React.MouseEvent) => {
    setHoveredItem(itemId)
    
    const item = items.find(i => i.id === itemId)
    
    if (item?.submenu && item.submenu.length > 0) {
      setActiveMenu(itemId)
      
      // Calcular posição do submenu
      const rect = (event.target as HTMLElement).getBoundingClientRect()
      setSubmenuPosition({
        x: rect.left,
        y: rect.bottom + 5
      })
    } else {
      // Se não tem submenu, limpar menu ativo
      setActiveMenu(null)
      setSubmenuPosition(null)
    }
  }, [items])

  const handleMouseLeave = useCallback(() => {
    setHoveredItem(null)
    // Delay para permitir movimento para o submenu
    setTimeout(() => {
      if (!submenuRef.current?.matches(':hover') && !menuRef.current?.matches(':hover')) {
        setActiveMenu(null)
        setSubmenuPosition(null)
      }
    }, 150)
  }, [])

  const handleSubmenuMouseEnter = useCallback(() => {
    // Manter submenu aberto quando mouse estiver sobre ele
  }, [])

  const handleSubmenuMouseLeave = useCallback(() => {
    setTimeout(() => {
      if (!menuRef.current?.matches(':hover')) {
        setActiveMenu(null)
        setSubmenuPosition(null)
      }
    }, 100)
  }, [])

  const handleItemClick = useCallback((item: MenuItem) => {
    if (item.onClick) {
      try {
        item.onClick()
      } catch (error) {
        console.warn('Erro ao executar onClick:', error)
        // Se houver erro, tentar recarregar a página
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    }
    setActiveMenu(null)
    setSubmenuPosition(null)
  }, [])

  const getMenuStyles = () => ({
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '6px',
    padding: '4px',
    ...style
  })

  const getMenuItemStyles = (itemId: string) => ({
    padding: '8px 12px',
    border: 'none',
    background: hoveredItem === itemId ? theme.primary + '20' : 'transparent',
    color: hoveredItem === itemId ? theme.primary : theme.text,
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: isReducedMotion ? 'none' : 'all 0.2s ease',
    position: 'relative' as const
  })

  const getSubmenuStyles = () => ({
    position: 'fixed' as const,
    top: submenuPosition?.y || 0,
    left: submenuPosition?.x || 0,
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    padding: '8px',
    minWidth: '200px',
    zIndex: 1000,
    opacity: activeMenu ? 1 : 0,
    visibility: activeMenu ? 'visible' : 'hidden',
    transform: activeMenu ? 'translateY(0)' : 'translateY(-10px)',
    transition: isReducedMotion ? 'none' : 'all 0.2s ease',
    display: activeMenu ? 'block' : 'none'
  })

  const getSubmenuItemStyles = (itemId: string) => ({
    padding: '8px 12px',
    border: 'none',
    background: 'transparent',
    color: theme.text,
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    textAlign: 'left' as const,
    transition: isReducedMotion ? 'none' : 'background-color 0.2s ease'
  })

  return (
    <>
      <div
        ref={menuRef}
        className={className}
        style={getMenuStyles()}
        role="menubar"
        aria-label="Menu principal"
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={getMenuItemStyles(item.id)}
            onMouseEnter={(e) => handleMouseEnter(item.id, e)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleItemClick(item)}
            role="menuitem"
            aria-haspopup={item.submenu ? 'true' : 'false'}
            aria-expanded={activeMenu === item.id ? 'true' : 'false'}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleItemClick(item)
              }
            }}
          >
            {item.icon && (
              <span style={{ fontSize: '16px' }} aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
            {item.submenu && (
              <span style={{ fontSize: '12px', marginLeft: '4px' }} aria-hidden="true">
                ▼
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Submenu */}
      {activeMenu && (
        <div
          ref={submenuRef}
          style={getSubmenuStyles()}
          onMouseEnter={handleSubmenuMouseEnter}
          onMouseLeave={handleSubmenuMouseLeave}
          role="menu"
          aria-label={`Submenu de ${items.find(i => i.id === activeMenu)?.label}`}
        >
          {items
            .find(i => i.id === activeMenu)
            ?.submenu?.map((subItem) => (
              <button
                key={subItem.id}
                style={getSubmenuItemStyles(subItem.id)}
                onClick={() => handleItemClick(subItem)}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = theme.primary + '20'
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                }}
                role="menuitem"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleItemClick(subItem)
                  }
                }}
              >
                {subItem.icon && (
                  <span style={{ fontSize: '16px' }} aria-hidden="true">
                    {subItem.icon}
                  </span>
                )}
                <span>{subItem.label}</span>
              </button>
            ))}
        </div>
      )}
    </>
  )
}
