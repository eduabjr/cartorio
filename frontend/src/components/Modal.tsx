import React, { useEffect } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'
import { FocusTrap } from './FocusTrap'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  type?: 'alert' | 'confirm' | 'prompt'
  defaultValue?: string
  onConfirm?: (value?: string) => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  icon?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = 'alert',
  defaultValue = '',
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  icon
}: ModalProps) {
  const { getTheme } = useAccessibility()
  const theme = getTheme()
  const [inputValue, setInputValue] = React.useState(defaultValue)
  const inputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && type === 'prompt' && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isOpen, type])

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue)
    }
  }, [isOpen, defaultValue])

  if (!isOpen) return null

  console.log('🔴🔴🔴 MODAL ABERTO! 🔴🔴🔴')
  console.log('   Tipo:', type)
  console.log('   Mensagem:', message)
  console.log('   zIndex: 10000')

  const handleConfirm = () => {
    if (type === 'prompt') {
      onConfirm?.(inputValue)
    } else {
      onConfirm?.()
    }
    onClose()
  }

  const handleCancel = () => {
    onCancel?.()
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter' && type === 'prompt') {
      handleConfirm()
    }
  }

  // Ícone padrão baseado no tipo
  const defaultIcon = icon || (type === 'confirm' ? '⚠️' : type === 'prompt' ? '📝' : 'ℹ️')
  const defaultConfirmText = confirmText || (type === 'confirm' ? 'Confirmar' : type === 'prompt' ? 'OK' : 'OK')
  const defaultCancelText = cancelText || 'Cancelar'

  return (
    <FocusTrap active={isOpen}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(2px)'
        }}
        onClick={handleCancel}
      >
      <div
        style={{
          backgroundColor: theme.background,
          borderRadius: '8px',
          padding: '24px',
          minWidth: '400px',
          maxWidth: '500px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: `1px solid ${theme.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        {(title || icon) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {icon && <span style={{ fontSize: '24px' }}>{icon}</span>}
            {title && (
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: theme.text }}>
                {title}
              </h3>
            )}
          </div>
        )}

        {/* Message */}
        <div style={{ color: theme.text, fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
          {message}
        </div>

        {/* Input para prompt */}
        {type === 'prompt' && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              border: `1px solid ${theme.border}`,
              borderRadius: '4px',
              backgroundColor: theme.inputBackground || theme.background,
              color: theme.text,
              outline: 'none'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConfirm()
              }
            }}
          />
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
          {(type === 'confirm' || type === 'prompt') && (
            <button
              onClick={handleCancel}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: theme.text,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.border
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {defaultCancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: type === 'confirm' ? '#dc2626' : '#3b82f6',
              color: 'white',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = type === 'confirm' ? '#b91c1c' : '#2563eb'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = type === 'confirm' ? '#dc2626' : '#3b82f6'
            }}
          >
            {defaultConfirmText}
          </button>
        </div>
      </div>
    </div>
    </FocusTrap>
  )
}

