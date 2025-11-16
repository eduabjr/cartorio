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
  const { getTheme, currentTheme } = useAccessibility()
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

  const formattedMessage = React.useMemo(() => {
    const blocks = message.split('\n\n').map(block => block.trim()).filter(Boolean)

    return blocks.map((block) => {
      const lines = block.split('\n').map(line => line.trim()).filter(Boolean)
      if (lines.length === 0) {
        return { type: 'text' as const, content: block }
      }

      const headingCandidate = lines[0]
      const remaining = lines.slice(1)
      const isSection = headingCandidate.endsWith(':') && remaining.length > 0

      if (isSection) {
        const items = remaining.map(line => line.replace(/^•\s*/, '').trim())
        return {
          type: 'section' as const,
          heading: headingCandidate.replace(/:$/, ''),
          items
        }
      }

      if (lines.every(line => line.startsWith('•'))) {
        return {
          type: 'list' as const,
          items: lines.map(line => line.replace(/^•\s*/, '').trim())
        }
      }

      return { type: 'text' as const, content: lines.join(' ') }
    })
  }, [message])

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
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(2px)',
          padding: '20px',
          maxHeight: '100%'
        }}
        onClick={handleCancel}
      >
      <div
        style={{
          backgroundColor: theme.background,
          borderRadius: '8px',
          padding: '24px',
          width: 'min(520px, calc(100% - 40px))',
          minWidth: 'min(320px, 100%)',
          maxHeight: 'min(600px, 100%)',
          overflowY: 'auto',
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
        <div style={{ color: theme.text, fontSize: '14px', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {formattedMessage.map((block, index) => {
            if (block.type === 'section') {
              return (
                <div
                  key={`section-${index}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: `1px solid ${theme.border}`,
                    backgroundColor: currentTheme === 'dark' ? 'rgba(255,255,255,0.04)' : '#f4f7fb'
                  }}
                >
                  <span style={{ fontWeight: 600, color: theme.text }}>{block.heading}</span>
                  <ul style={{ margin: 0, paddingInlineStart: '18px', display: 'grid', gap: '6px', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                    {block.items.map((item, itemIndex) => (
                      <li
                        key={`section-item-${index}-${itemIndex}`}
                        style={{
                          listStyle: 'disc',
                          color: theme.text,
                          marginInlineStart: '0'
                        }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            }

            if (block.type === 'list') {
              return (
                <ul
                  key={`list-${index}`}
                  style={{
                    margin: 0,
                    paddingInlineStart: '18px',
                    display: 'grid',
                    gap: '6px',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'
                  }}
                >
                  {block.items.map((item, itemIndex) => (
                    <li key={`list-item-${index}-${itemIndex}`} style={{ listStyle: 'disc', color: theme.text }}>
                      {item}
                    </li>
                  ))}
                </ul>
              )
            }

            return (
              <p key={`text-${index}`} style={{ margin: 0, color: theme.textSecondary }}>
                {block.content}
              </p>
            )
          })}
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

