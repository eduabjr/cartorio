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
  mostrarDetalhes: boolean
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
      errorInfo: null,
      mostrarDetalhes: false
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Atualizar estado para mostrar UI de fallback
    return {
      hasError: true,
      error,
      errorInfo: null,
      mostrarDetalhes: false
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
      errorInfo: null,
      mostrarDetalhes: false
    })
  }

  handleFechar = () => {
    // Limpar erros do console
    console.clear()
    
    // Resetar o estado
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      mostrarDetalhes: false
    })
  }

  toggleDetalhes = () => {
    this.setState({ mostrarDetalhes: !this.state.mostrarDetalhes })
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
          margin: '20px',
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#991b1b', marginBottom: '12px', fontSize: '24px' }}>
            Erro no módulo "{this.props.moduleName || 'Sistema'}"
          </h2>
          <p style={{ color: '#7f1d1d', marginBottom: '24px', fontSize: '14px' }}>
            Este módulo encontrou um erro, mas o restante do sistema continua funcionando normalmente.
          </p>
          
          {/* Botões de Ação */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '12px 32px',
                backgroundColor: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#059669'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              🔄 Tentar Novamente
            </button>
            
            <button
              onClick={this.handleFechar}
              style={{
                padding: '12px 32px',
                backgroundColor: '#6b7280',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4b5563'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6b7280'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              ✕ Fechar
            </button>
          </div>

          {/* Botão para mostrar/ocultar detalhes */}
          {this.state.error && (
            <>
              <button
                onClick={this.toggleDetalhes}
                style={{
                  padding: '8px 20px',
                  backgroundColor: 'transparent',
                  color: '#991b1b',
                  border: `1px solid #991b1b`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  marginBottom: this.state.mostrarDetalhes ? '16px' : '0'
                }}
              >
                {this.state.mostrarDetalhes ? '▲ Ocultar Detalhes' : '▼ Ver Detalhes Técnicos'}
              </button>

              {this.state.mostrarDetalhes && (
                <div style={{
                  backgroundColor: '#fff',
                  padding: '16px',
                  borderRadius: '8px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  border: '1px solid #ef4444',
                  marginTop: '16px'
                }}>
                  <div style={{ color: '#dc2626', whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>
                    <strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>Erro:</strong>
                    <div style={{ marginBottom: '16px', padding: '8px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
                      {this.state.error.toString()}
                    </div>
                    {this.state.errorInfo && (
                      <>
                        <strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>Stack:</strong>
                        <div style={{ padding: '8px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
                          {this.state.errorInfo.componentStack}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
