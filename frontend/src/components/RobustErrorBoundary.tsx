import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

export class RobustErrorBoundary extends Component<Props, State> {
  private maxRetries = 3
  private retryTimeout: NodeJS.Timeout | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Erro capturado pelo ErrorBoundary:', error)
    console.error('📋 Error Info:', errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Chama callback de erro se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Tenta recuperação automática
    this.attemptRecovery()
  }

  private attemptRecovery = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.retryTimeout = setTimeout(() => {
        console.log(`🔄 Tentativa de recuperação ${this.state.retryCount + 1}/${this.maxRetries}`)
        this.setState(prevState => ({
          hasError: false,
          error: null,
          errorInfo: null,
          retryCount: prevState.retryCount + 1
        }))
      }, 2000 * (this.state.retryCount + 1)) // Delay crescente
    }
  }

  private handleManualRetry = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  render() {
    if (this.state.hasError) {
      // Se há um fallback customizado, usa ele
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Fallback padrão robusto
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          margin: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          
          <h3 style={{ 
            color: '#dc3545', 
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            Ops! Algo deu errado
          </h3>
          
          <p style={{ 
            color: '#6c757d', 
            textAlign: 'center',
            marginBottom: '20px',
            maxWidth: '400px'
          }}>
            O sistema encontrou um erro, mas não se preocupe! 
            Estamos tentando recuperar automaticamente.
          </p>

          {this.state.retryCount > 0 && (
            <p style={{ 
              color: '#28a745', 
              fontSize: '14px',
              marginBottom: '16px'
            }}>
              Tentativa de recuperação: {this.state.retryCount}/{this.maxRetries}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleManualRetry}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 Tentar Novamente
            </button>
            
            <button
              onClick={this.handleReload}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔃 Recarregar Página
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ 
              marginTop: '20px', 
              width: '100%',
              maxWidth: '600px'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                color: '#6c757d',
                fontSize: '14px'
              }}>
                Detalhes do erro (desenvolvimento)
              </summary>
              <pre style={{
                backgroundColor: '#f8f9fa',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                marginTop: '8px',
                border: '1px solid #dee2e6'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

// Hook para usar em componentes funcionais
export const useErrorHandler = () => {
  const handleError = (error: Error, context?: string) => {
    console.error(`🚨 Erro em ${context || 'componente'}:`, error)
    
    // Aqui você pode adicionar lógica para reportar erros
    // Por exemplo, enviar para um serviço de monitoramento
    
    // Para erros não críticos, apenas log
    if (error.name === 'ChunkLoadError') {
      console.warn('📦 Erro de carregamento de chunk, tentando recarregar...')
      window.location.reload()
    }
  }

  return { handleError }
}
