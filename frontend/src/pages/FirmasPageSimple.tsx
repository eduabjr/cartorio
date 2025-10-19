import { useState } from 'react'

interface FirmasPageSimpleProps {
  onClose: () => void
  isDarkMode: boolean
}

export function FirmasPageSimple({ onClose, isDarkMode }: FirmasPageSimpleProps) {
  console.log('=== FIRMAS PAGE SIMPLE RENDERIZADA ===')
  console.log('isDarkMode:', isDarkMode)
  
  // Forçar renderização com alerta
  alert('COMPONENTE FIRMAS RENDERIZADO!')
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        width: '400px',
        height: '300px',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>
          🎉 FIRMAS FUNCIONANDO!
        </h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>
          Se você está vendo esta tela, o sistema está funcionando corretamente!
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
            fontWeight: '500'
          }}
        >
          Fechar
        </button>
      </div>
    </div>
  )
}
