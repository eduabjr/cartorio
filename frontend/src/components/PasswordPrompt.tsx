import React, { useState } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'

interface PasswordPromptProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  title?: string
  message?: string
}

export function PasswordPrompt({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title = "Acesso Restrito",
  message = "Digite a senha para acessar este módulo:"
}: PasswordPromptProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { getTheme } = useAccessibility()
  const theme = getTheme()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simular verificação de senha (substitua pela lógica real)
    setTimeout(() => {
      if (password === 'maternidade123' || password === 'admin123') {
        onSuccess()
        onClose()
        setPassword('')
      } else {
        setError('Senha incorreta. Tente novamente.')
      }
      setIsLoading(false)
    }, 1000)
  }

  const handleClose = () => {
    setPassword('')
    setError('')
    onClose()
  }

  const overlayStyles = {
    position: 'fixed' as const,
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10001,
    backdropFilter: 'blur(5px)'
  }

  const modalStyles = {
    background: theme.surface,
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    border: `1px solid ${theme.border}`
  }

  const headerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  }

  const iconStyles = {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  }

  const titleStyles = {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: theme.text
  }

  const messageStyles = {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: theme.textSecondary,
    lineHeight: '1.5'
  }

  const inputStyles = {
    width: '100%',
    padding: '12px 16px',
    background: theme.background,
    border: `2px solid ${theme.border}`,
    borderRadius: '8px',
    color: theme.text,
    fontSize: '14px',
    marginBottom: '16px',
    transition: 'all 0.2s ease',
    outline: 'none'
  }

  const buttonContainerStyles = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  }

  const buttonStyles = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  }

  const cancelButtonStyles = {
    ...buttonStyles,
    background: 'transparent',
    color: theme.text,
    border: `1px solid ${theme.border}`
  }

  const submitButtonStyles = {
    ...buttonStyles,
    background: theme.primary,
    color: 'white'
  }

  const errorStyles = {
    color: theme.error,
    fontSize: '12px',
    marginTop: '8px',
    textAlign: 'center' as const
  }

  return (
    <div style={overlayStyles}>
      <div style={modalStyles}>
        {/* Header */}
        <div style={headerStyles}>
          <div style={iconStyles}>
            🔒
          </div>
          <h2 style={titleStyles}>{title}</h2>
        </div>

        {/* Message */}
        <p style={messageStyles}>{message}</p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha..."
            style={inputStyles}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor = theme.primary
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor = theme.border
            }}
            required
            autoFocus
          />

          {error && (
            <div style={errorStyles}>{error}</div>
          )}

          {/* Buttons */}
          <div style={buttonContainerStyles}>
            <button
              type="button"
              onClick={handleClose}
              style={cancelButtonStyles}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = theme.border
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = 'transparent'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              style={{
                ...submitButtonStyles,
                opacity: isLoading || !password.trim() ? 0.6 : 1,
                cursor: isLoading || !password.trim() ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && password.trim()) {
                  (e.target as HTMLButtonElement).style.background = theme.primary + 'dd'
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && password.trim()) {
                  (e.target as HTMLButtonElement).style.background = theme.primary
                }
              }}
            >
              {isLoading ? 'Verificando...' : 'Acessar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
