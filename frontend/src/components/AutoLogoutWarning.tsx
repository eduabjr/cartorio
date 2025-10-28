import React from 'react'
import { useAccessibility } from '../hooks/useAccessibility'

interface AutoLogoutWarningProps {
  remainingSeconds: number
  onCancel: () => void
}

export function AutoLogoutWarning({ remainingSeconds, onCancel }: AutoLogoutWarningProps) {
  const { getTheme } = useAccessibility()
  const theme = getTheme()

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: theme.surface,
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: `2px solid ${theme.warning}`,
        textAlign: 'center'
      }}>
        {/* Ícone e Título */}
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>
          ⏰
        </div>
        
        <h2 style={{
          margin: '0 0 8px 0',
          fontSize: '20px',
          fontWeight: '700',
          color: theme.text
        }}>
          Sessão Expirando
        </h2>
        
        <p style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          color: theme.textSecondary
        }}>
          Por inatividade, você será desconectado em:
        </p>
        
        {/* Countdown */}
        <div style={{
          fontSize: '48px',
          fontWeight: '700',
          color: theme.warning,
          margin: '16px 0',
          fontFamily: 'monospace'
        }}>
          {remainingSeconds}s
        </div>
        
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '13px',
          color: theme.textSecondary
        }}>
          Clique em "Continuar Conectado" para permanecer no sistema
        </p>
        
        {/* Botão */}
        <button
          onClick={onCancel}
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            border: 'none',
            borderRadius: '24px',
            cursor: 'pointer',
            backgroundColor: theme.primary,
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease',
            width: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          ✅ Continuar Conectado
        </button>
      </div>
    </div>
  )
}

