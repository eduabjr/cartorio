import React from 'react'

interface OCRProgressProps {
  isVisible: boolean
  progress: number
  status: string
}

export function OCRProgress({ isVisible, progress, status }: OCRProgressProps) {
  if (!isVisible) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        textAlign: 'center',
        minWidth: '300px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          🔍
        </div>
        
        <h3 style={{
          margin: '0 0 20px 0',
          color: '#333',
          fontSize: '18px'
        }}>
          Processando Documento
        </h3>
        
        <div style={{
          marginBottom: '20px',
          color: '#666',
          fontSize: '14px'
        }}>
          {status}
        </div>
        
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e0e0e0',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '10px'
        }}>
          <div style={{
            width: `${progress * 100}%`,
            height: '100%',
            backgroundColor: '#4CAF50',
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        <div style={{
          fontSize: '12px',
          color: '#888'
        }}>
          {Math.round(progress * 100)}% concluído
        </div>
      </div>
    </div>
  )
}
