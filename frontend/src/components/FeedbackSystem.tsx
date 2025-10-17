import { useState, useEffect, useCallback } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'

export interface FeedbackMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface FeedbackSystemProps {
  children: React.ReactNode
}

export function FeedbackSystem({ children }: FeedbackSystemProps) {
  const [messages, setMessages] = useState<FeedbackMessage[]>([])
  const { getTheme, isReducedMotion } = useAccessibility()

  const addMessage = useCallback((message: Omit<FeedbackMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newMessage = { ...message, id }
    
    setMessages(prev => [...prev, newMessage])
    
    // Auto-remove message after duration
    const duration = message.duration || 5000
    setTimeout(() => {
      removeMessage(id)
    }, duration)
  }, [])

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }, [])

  // Expor função globalmente
  useEffect(() => {
    (window as any).showFeedback = addMessage
    return () => {
      delete (window as any).showFeedback
    }
  }, [addMessage])

  const theme = getTheme()

  const getMessageStyles = (type: FeedbackMessage['type']) => {
    const baseStyles = {
      padding: '16px 20px',
      borderRadius: '8px',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: `2px solid`,
      transition: isReducedMotion ? 'none' : 'all 0.3s ease',
      transform: 'translateX(0)',
      opacity: 1
    }

    const typeStyles = {
      success: {
        backgroundColor: theme.success + '15',
        borderColor: theme.success,
        color: theme.success
      },
      error: {
        backgroundColor: theme.error + '15',
        borderColor: theme.error,
        color: theme.error
      },
      warning: {
        backgroundColor: theme.warning + '15',
        borderColor: theme.warning,
        color: theme.warning
      },
      info: {
        backgroundColor: theme.info + '15',
        borderColor: theme.info,
        color: theme.info
      }
    }

    return { ...baseStyles, ...typeStyles[type] }
  }

  const getIcon = (type: FeedbackMessage['type']) => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }
    return icons[type]
  }

  return (
    <>
      {children}
      
      {/* Container de mensagens */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          maxWidth: '400px',
          width: '100%'
        }}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={getMessageStyles(message.type)}
            role="alert"
            aria-label={`${message.type}: ${message.title}`}
          >
            <span style={{ fontSize: '20px' }} aria-hidden="true">
              {getIcon(message.type)}
            </span>
            
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: '600', 
                marginBottom: '4px',
                fontSize: '14px'
              }}>
                {message.title}
              </div>
              <div style={{ 
                fontSize: '13px',
                opacity: 0.9
              }}>
                {message.message}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {message.action && (
                <button
                  onClick={message.action.onClick}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: theme.primary,
                    color: 'white',
                    cursor: 'pointer',
                    transition: isReducedMotion ? 'none' : 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (!isReducedMotion) {
                      (e.target as HTMLButtonElement).style.backgroundColor = theme.accent
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isReducedMotion) {
                      (e.target as HTMLButtonElement).style.backgroundColor = theme.primary
                    }
                  }}
                >
                  {message.action.label}
                </button>
              )}
              
              <button
                onClick={() => removeMessage(message.id)}
                style={{
                  padding: '4px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: theme.textSecondary,
                  borderRadius: '4px',
                  transition: isReducedMotion ? 'none' : 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (!isReducedMotion) {
                    (e.target as HTMLButtonElement).style.backgroundColor = theme.border
                  }
                }}
                onMouseOut={(e) => {
                  if (!isReducedMotion) {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                  }
                }}
                aria-label="Fechar mensagem"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// Hook para usar o sistema de feedback
export function useFeedback() {
  const showSuccess = useCallback((title: string, message: string, options?: Partial<FeedbackMessage>) => {
    (window as any).showFeedback?.({
      type: 'success',
      title,
      message,
      ...options
    })
  }, [])

  const showError = useCallback((title: string, message: string, options?: Partial<FeedbackMessage>) => {
    (window as any).showFeedback?.({
      type: 'error',
      title,
      message,
      ...options
    })
  }, [])

  const showWarning = useCallback((title: string, message: string, options?: Partial<FeedbackMessage>) => {
    (window as any).showFeedback?.({
      type: 'warning',
      title,
      message,
      ...options
    })
  }, [])

  const showInfo = useCallback((title: string, message: string, options?: Partial<FeedbackMessage>) => {
    (window as any).showFeedback?.({
      type: 'info',
      title,
      message,
      ...options
    })
  }, [])

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}
