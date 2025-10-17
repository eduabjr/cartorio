import { useState, useCallback } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'

interface AccessibleButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  icon?: string
  ariaLabel?: string
  ariaDescription?: string
  className?: string
  style?: React.CSSProperties
  onFocus?: () => void
  onBlur?: () => void
}

export function AccessibleButton({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  ariaLabel,
  ariaDescription,
  className,
  style,
  onFocus,
  onBlur
}: AccessibleButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const { getTheme, isReducedMotion, getFontSize } = useAccessibility()

  const theme = getTheme()

  const handleClick = useCallback(() => {
    if (disabled || loading) return
    
    // Feedback tátil
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 150)
    
    onClick?.()
  }, [disabled, loading, onClick])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }, [handleClick])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    onFocus?.()
  }, [onFocus])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    onBlur?.()
  }, [onBlur])

  const getVariantStyles = () => {
    const baseStyles = {
      border: 'none',
      borderRadius: '6px',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontWeight: '500',
      fontFamily: 'inherit',
      fontSize: getFontSize(),
      lineHeight: '1.5',
      textDecoration: 'none',
      transition: isReducedMotion ? 'none' : 'all 0.2s ease',
      outline: 'none',
      position: 'relative',
      overflow: 'hidden'
    }

    const sizeStyles = {
      small: {
        padding: '6px 12px',
        fontSize: '14px',
        minHeight: '32px'
      },
      medium: {
        padding: '8px 16px',
        fontSize: getFontSize(),
        minHeight: '40px'
      },
      large: {
        padding: '12px 24px',
        fontSize: '18px',
        minHeight: '48px'
      }
    }

    const variantStyles = {
      primary: {
        backgroundColor: disabled ? theme.border : theme.primary,
        color: 'white',
        border: `2px solid ${disabled ? theme.border : theme.primary}`
      },
      secondary: {
        backgroundColor: disabled ? theme.border : theme.surface,
        color: disabled ? theme.textSecondary : theme.text,
        border: `2px solid ${disabled ? theme.border : theme.border}`
      },
      success: {
        backgroundColor: disabled ? theme.border : theme.success,
        color: 'white',
        border: `2px solid ${disabled ? theme.border : theme.success}`
      },
      warning: {
        backgroundColor: disabled ? theme.border : theme.warning,
        color: 'white',
        border: `2px solid ${disabled ? theme.border : theme.warning}`
      },
      error: {
        backgroundColor: disabled ? theme.border : theme.error,
        color: 'white',
        border: `2px solid ${disabled ? theme.border : theme.error}`
      },
      ghost: {
        backgroundColor: 'transparent',
        color: disabled ? theme.textSecondary : theme.primary,
        border: `2px solid transparent`
      }
    }

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant]
    }
  }

  const getInteractiveStyles = () => {
    if (disabled || loading) return {}

    const hoverStyles = {
      transform: isPressed ? 'scale(0.98)' : isFocused ? 'scale(1.02)' : 'scale(1)',
      boxShadow: isFocused 
        ? `0 0 0 3px ${theme.primary}40` 
        : '0 2px 4px rgba(0, 0, 0, 0.1)'
    }

    return hoverStyles
  }

  const buttonStyles = {
    ...getVariantStyles(),
    ...getInteractiveStyles(),
    ...style
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled || loading}
      className={className}
      style={buttonStyles}
      aria-label={ariaLabel}
      aria-describedby={ariaDescription ? `${ariaLabel}-description` : undefined}
      aria-pressed={isPressed}
      aria-disabled={disabled || loading}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      {loading && (
        <span 
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: `2px solid currentColor`,
            borderRadius: '50%',
            animation: isReducedMotion ? 'none' : 'spin 1s linear infinite'
          }}
          aria-hidden="true"
        />
      )}
      
      {icon && !loading && (
        <span style={{ fontSize: '1.2em' }} aria-hidden="true">
          {icon}
        </span>
      )}
      
      <span>{children}</span>
      
      {ariaDescription && (
        <span 
          id={`${ariaLabel}-description`}
          style={{ display: 'none' }}
        >
          {ariaDescription}
        </span>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  )
}
