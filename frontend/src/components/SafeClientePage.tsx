import { useState, useCallback } from 'react'
import { RobustErrorBoundary } from './RobustErrorBoundary'
import { PageFallback } from './PageFallback'
import { ClientePage } from '../pages/ClientePage'

interface SafeClientePageProps {
  onClose: () => void
}

export function SafeClientePage({ onClose }: SafeClientePageProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = useCallback(() => {
    setIsRetrying(true)
    
    // Simula um delay para mostrar o estado de retry
    setTimeout(() => {
      setIsRetrying(false)
    }, 1000)
  }, [])

  const handleGoHome = useCallback(() => {
    // Navegar para a página inicial ou fechar todas as janelas
    onClose()
  }, [onClose])

  const handleError = useCallback((error: Error, errorInfo: any) => {
    console.error('🚨 Erro no ClientePage:', error)
    console.error('📋 Error Info:', errorInfo)
    
    // Aqui você pode adicionar lógica para reportar erros
    // Por exemplo, enviar para um serviço de monitoramento
  }, [])

  if (isRetrying) {
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
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>🔄</div>
        <h3 style={{ color: '#495057', marginBottom: '16px' }}>
          Recarregando página...
        </h3>
        <p style={{ color: '#6c757d', textAlign: 'center' }}>
          Aguarde um momento enquanto tentamos restaurar a funcionalidade.
        </p>
      </div>
    )
  }

  return (
    <RobustErrorBoundary
      onError={handleError}
      fallback={
        <PageFallback
          pageName="página de Cliente"
          onRetry={handleRetry}
          onGoHome={handleGoHome}
        />
      }
    >
      <ClientePage onClose={onClose} />
    </RobustErrorBoundary>
  )
}
