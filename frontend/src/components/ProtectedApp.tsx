import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  retryCount: number
}

class ProtectedApp extends Component<Props, State> {
  private maxRetries = 3
  private retryTimeout: NodeJS.Timeout | null = null

  public state: State = {
    hasError: false,
    retryCount: 0
  }

  public static getDerivedStateFromError(error: Error): State {
    // Atualiza o state para mostrar a UI de fallback na próxima renderização
    return { hasError: true, error, retryCount: 0 }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Sistema capturou um erro:', error, errorInfo)
    
    // Salvar erro no localStorage para debug
    localStorage.setItem('lastError', JSON.stringify({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount
    }))

    // Tentar recuperação automática para erros não críticos
    this.attemptRecovery(error)
  }

  private attemptRecovery = (error: Error) => {
    // Não tenta recuperar erros críticos
    if (this.isCriticalError(error)) {
      console.error('🚨 Erro crítico detectado, não tentando recuperação automática')
      return
    }

    if (this.state.retryCount < this.maxRetries) {
      this.retryTimeout = setTimeout(() => {
        console.log(`🔄 Tentativa de recuperação do sistema ${this.state.retryCount + 1}/${this.maxRetries}`)
        this.setState(prevState => ({
          hasError: false,
          error: undefined,
          retryCount: prevState.retryCount + 1
        }))
      }, 2000 * (this.state.retryCount + 1)) // Delay crescente
    }
  }

  private isCriticalError = (error: Error): boolean => {
    const criticalErrors = [
      'ChunkLoadError',
      'TypeError',
      'ReferenceError',
      'SyntaxError'
    ]
    
    return criticalErrors.some(errorType => 
      error.name === errorType || error.message.includes(errorType)
    )
  }

  private handleRestore = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
    
    // Tentar restaurar o sistema
    this.setState({ 
      hasError: false, 
      error: undefined,
      retryCount: 0
    })
    
    // Limpar erro salvo
    localStorage.removeItem('lastError')
  }

  private handleReload = () => {
    // Recarregar a página
    window.location.reload()
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  public render() {
    
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#f1f5f9'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '48px',
            borderRadius: '24px',
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            maxWidth: '600px',
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              margin: '0 auto 24px auto'
            }}>
              ⚠️
            </div>
            
            <h1 style={{ 
              fontSize: '28px', 
              margin: '0 0 16px 0', 
              fontWeight: '700',
              color: '#ef4444'
            }}>
              Sistema Protegido
            </h1>
            
            <p style={{ 
              fontSize: '16px', 
              margin: '0 0 16px 0', 
              color: '#94a3b8',
              lineHeight: '1.6'
            }}>
              O sistema detectou um erro e foi protegido automaticamente.
              Isso evita que o sistema trave completamente.
            </p>

            {this.state.retryCount > 0 && (
              <p style={{ 
                fontSize: '14px', 
                margin: '0 0 24px 0', 
                color: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center'
              }}>
                🔄 Tentativa de recuperação: {this.state.retryCount}/{this.maxRetries}
              </p>
            )}

            {this.state.error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <p style={{ 
                  margin: '0 0 8px 0', 
                  fontWeight: '600', 
                  color: '#ef4444',
                  fontSize: '14px'
                }}>
                  Erro detectado:
                </p>
                <p style={{ 
                  margin: '0', 
                  color: '#fca5a5',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={this.handleRestore}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => (e.target as HTMLButtonElement).style.transform = 'translateY(0)'}
              >
                🔄 Tentar Restaurar
              </button>
              
              <button 
                onClick={this.handleReload}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => (e.target as HTMLButtonElement).style.transform = 'translateY(0)'}
              >
                🔄 Recarregar Página
              </button>
            </div>

            <div style={{ 
              marginTop: '24px',
              fontSize: '12px', 
              color: '#64748b',
              background: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>
                💡 Sistema de Proteção Ativo
              </p>
              <p style={{ margin: '0' }}>
                O erro foi registrado automaticamente para análise.
                Use "Tentar Restaurar" primeiro, ou "Recarregar" se necessário.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ProtectedApp
