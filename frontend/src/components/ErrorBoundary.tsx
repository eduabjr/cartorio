import React, { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  moduleName?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * 🛡️ Error Boundary - Isola erros de um módulo
 * 
 * Se uma janela quebrar, não afeta as outras
 * Equivalente ao isolamento de microserviços no backend
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Atualizar estado para mostrar UI de fallback
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log do erro para debug
    const moduleName = this.props.moduleName || 'Módulo Desconhecido'
    console.error(`❌ ERRO no módulo "${moduleName}":`, error)
    console.error('📋 Stack trace:', errorInfo.componentStack)
    
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // UI de fallback customizada
      if (this.props.fallback) {
        return this.props.fallback
      }

      // UI de fallback padrão
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#fef2f2',
          border: '2px solid #ef4444',
          borderRadius: '12px',
          margin: '20px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#991b1b', marginBottom: '12px' }}>
            Erro no módulo "{this.props.moduleName || 'Sistema'}"
          </h2>
          <p style={{ color: '#7f1d1d', marginBottom: '16px', fontSize: '14px' }}>
            Este módulo encontrou um erro, mas o restante do sistema continua funcionando normalmente.
          </p>
          
          {this.state.error && (
            <details style={{
              backgroundColor: '#fff',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              textAlign: 'left',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
                🔍 Detalhes técnicos
              </summary>
              <div style={{ color: '#dc2626', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
                <strong>Erro:</strong> {this.state.error.toString()}
                {this.state.errorInfo && (
                  <>
                    <br /><br />
                    <strong>Stack:</strong>
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </div>
            </details>
          )}

          <button
            onClick={this.handleReset}
            style={{
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            🔄 Tentar Novamente
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
