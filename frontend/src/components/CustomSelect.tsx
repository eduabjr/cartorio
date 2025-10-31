import { useState, useRef, useEffect } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  maxVisibleItems?: number
  style?: React.CSSProperties
  disabled?: boolean
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecione',
  maxVisibleItems = 5,
  style = {},
  disabled = false
}: CustomSelectProps) {
  const { getTheme } = useAccessibility()
  const theme = getTheme()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Encontrar label da opção selecionada
  const selectedOption = options.find(opt => opt.value === value)
  const displayValue = selectedOption ? selectedOption.label : placeholder

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Scroll automático para item selecionado quando abre
  useEffect(() => {
    if (isOpen && dropdownRef.current && selectedOption) {
      const selectedIndex = options.findIndex(opt => opt.value === value)
      if (selectedIndex >= 0) {
        const itemHeight = 28 // altura aproximada de cada item
        dropdownRef.current.scrollTop = selectedIndex * itemHeight - itemHeight * 2
      }
    }
  }, [isOpen, value, options, selectedOption])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(!isOpen)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'ArrowDown' && !isOpen) {
      setIsOpen(true)
    }
  }

  const itemHeight = 28
  const maxHeight = itemHeight * maxVisibleItems

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        minWidth: 0,
        flex: 1,
        ...style
      }}
    >
      {/* Select button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        style={{
          width: '100%',
          minWidth: 0,
          padding: '3px 24px 3px 10px',
          border: `1px solid ${theme.border}`,
          borderRadius: '3px',
          fontSize: '12px',
          backgroundColor: theme.background,
          color: theme.text,
          outline: 'none',
          height: '24px',
          minHeight: '24px',
          maxHeight: '24px',
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          opacity: disabled ? 0.6 : 1,
          boxSizing: 'border-box',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: '18px'
        }}
      >
        <span style={{ 
          flex: 1, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {displayValue}
        </span>
        {/* Seta */}
        <svg
          style={{
            position: 'absolute',
            right: '6px',
            top: '50%',
            transform: `translateY(-50%) rotate(${isOpen ? '180deg' : '0deg'})`,
            transition: 'transform 0.2s ease',
            width: '14px',
            height: '14px',
            pointerEvents: 'none'
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke={theme.text}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {/* Dropdown menu - OVERLAY */}
      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '2px',
            backgroundColor: theme.background,
            border: `1px solid ${theme.border}`,
            borderRadius: '4px',
            maxHeight: `${maxHeight}px`,
            overflowY: 'auto',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            boxSizing: 'border-box'
          }}
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                cursor: 'pointer',
                backgroundColor: option.value === value 
                  ? theme.primary 
                  : 'transparent',
                color: option.value === value ? '#fff' : theme.text,
                transition: 'background-color 0.15s ease',
                minHeight: `${itemHeight}px`,
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              onMouseEnter={(e) => {
                if (option.value !== value) {
                  e.currentTarget.style.backgroundColor = theme.surface
                }
              }}
              onMouseLeave={(e) => {
                if (option.value !== value) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

