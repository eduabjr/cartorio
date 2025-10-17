import { useState } from 'react'

interface FirmasPageTestProps {
  onClose: () => void
  isDarkMode: boolean
}

export function FirmasPageTest({ onClose, isDarkMode }: FirmasPageTestProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: isDarkMode ? '#1e293b' : '#ffffff',
        borderRadius: '8px',
        width: '80%',
        height: '80%',
        maxWidth: '800px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '600',
            color: isDarkMode ? '#f1f5f9' : '#1e293b'
          }}>
            🧪 TESTE - Firmas
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '18px',
              color: isDarkMode ? '#94a3b8' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.background = isDarkMode ? '#374151' : '#f3f4f6'
              (e.target as HTMLButtonElement).style.color = isDarkMode ? '#f1f5f9' : '#1e293b'
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.background = 'transparent'
              (e.target as HTMLButtonElement).style.color = isDarkMode ? '#94a3b8' : '#64748b'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            ✍️
          </div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: isDarkMode ? '#f1f5f9' : '#1e293b',
            margin: 0
          }}>
            Tela de Firmas Funcionando!
          </h3>
          <p style={{
            fontSize: '16px',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            textAlign: 'center',
            margin: 0
          }}>
            Se você está vendo esta tela, o sistema está funcionando corretamente.
          </p>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              marginTop: '16px'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#2563eb'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = '#3b82f6'}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
