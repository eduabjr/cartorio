import React from 'react'

interface PageFallbackProps {
  pageName?: string
  onRetry?: () => void
  onGoHome?: () => void
}

export function PageFallback({ 
  pageName = 'página', 
  onRetry, 
  onGoHome 
}: PageFallbackProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: '40px 20px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '12px',
      margin: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '24px' }}>📄</div>
      
      <h2 style={{ 
        color: '#495057', 
        marginBottom: '16px',
        textAlign: 'center',
        fontSize: '24px'
      }}>
        {pageName} temporariamente indisponível
      </h2>
      
      <p style={{ 
        color: '#6c757d', 
        textAlign: 'center',
        marginBottom: '32px',
        maxWidth: '500px',
        lineHeight: '1.5'
      }}>
        Esta {pageName} está passando por uma manutenção rápida. 
        Nossa equipe foi notificada e está trabalhando para resolver o problema.
      </p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff'
            }}
          >
            🔄 Tentar Novamente
          </button>
        )}
        
        {onGoHome && (
          <button
            onClick={onGoHome}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e7e34'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#28a745'
            }}
          >
            🏠 Ir para Início
          </button>
        )}
      </div>

      <div style={{
        marginTop: '32px',
        padding: '16px',
        backgroundColor: '#e9ecef',
        borderRadius: '6px',
        fontSize: '14px',
        color: '#495057',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        💡 <strong>Dica:</strong> Se o problema persistir, 
        tente recarregar a página ou voltar mais tarde.
      </div>
    </div>
  )
}
