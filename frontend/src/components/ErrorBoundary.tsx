import React, { Component, ErrorInfo, ReactNode } from 'react'
import { translateError } from '../utils/errorTranslator'

interface Props {
  children: ReactNode
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * ErrorBoundary - Captura erros de renderização e os exibe em português
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Traduz e loga o erro
    const translatedMessage = translateError(error)
    
    console.error('❌ Erro capturado pelo ErrorBoundary:')
    console.error('   Mensagem original:', error.message)
    console.error('   Mensagem traduzida:', translatedMessage)
    console.error('   Stack:', errorInfo.componentStack)
    
    this.setState({
      hasError: true,
      error,
      errorInfo
    })
  }

  private handleReload = () => {
    console.log('🔄 Botão RECARREGAR clicado!')
    try {
      window.location.reload()
    } catch (error) {
      console.error('❌ Erro ao recarregar:', error)
      alert('Erro ao recarregar a página. Por favor, recarregue manualmente.')
    }
  }

  private handleReset = () => {
    console.log('🔙 Botão TENTAR NOVAMENTE clicado!')
    try {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      })
      console.log('✅ Estado resetado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao resetar:', error)
      window.location.reload()
    }
  }

  public render() {
    if (this.state.hasError && this.state.error) {
      // Se um fallback customizado foi fornecido, usa ele
      if (this.props.fallback && this.state.errorInfo) {
        return this.props.fallback(this.state.error, this.state.errorInfo)
      }

      // Tela de erro padrão em português
      const translatedMessage = translateError(this.state.error)

      return (
        <div style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          padding: '20px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px'
            }}>
              ⚠️
            </div>
            
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#ef4444',
              marginBottom: '10px'
            }}>
              Ops! Algo deu errado
            </h1>
            
            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              Ocorreu um erro inesperado no sistema. Tente recarregar a página ou entre em contato com o suporte.
            </p>

            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: '6px',
              padding: '15px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#991b1b',
                marginBottom: '8px'
              }}>
                Detalhes do erro:
              </div>
              <div style={{
                fontSize: '14px',
                color: '#dc2626',
                fontFamily: 'monospace',
                wordBreak: 'break-word'
              }}>
                {translatedMessage}
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('🔙 Botão TENTAR NOVAMENTE - evento disparado')
                  this.handleReset()
                }}
                onMouseDown={(e) => {
                  console.log('🔙 mouseDown no botão Tentar Novamente')
                  e.currentTarget.style.transform = 'scale(0.95)'
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                style={{
                  padding: '14px 28px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: '2px solid #059669',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  zIndex: 1000
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
              >
                🔙 Tentar Novamente
              </button>
              
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('🔄 Botão RECARREGAR - evento disparado')
                  this.handleReload()
                }}
                onMouseDown={(e) => {
                  console.log('🔄 mouseDown no botão Recarregar')
                  e.currentTarget.style.transform = 'scale(0.95)'
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                style={{
                  padding: '14px 28px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  border: '2px solid #2563eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  zIndex: 1000
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
              >
                🔄 Recarregar Página
              </button>
            </div>

            <div style={{
              padding: '12px',
              backgroundColor: '#dbeafe',
              border: '1px solid #93c5fd',
              borderRadius: '6px',
              marginBottom: '15px'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}>
                <span>💡</span>
                <strong>Sistema de Proteção Ativo</strong>
              </div>
              <div style={{
                fontSize: '13px',
                color: '#1e3a8a',
                marginTop: '6px'
              }}>
                O erro foi registrado automaticamente para análise. Use "Tentar Novamente" primeiro, ou "Recarregar" se necessário.
              </div>
            </div>

            {/* Detalhes técnicos (colapsados por padrão) */}
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary style={{
                cursor: 'pointer',
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: 'bold'
              }}>
                🔍 Detalhes técnicos
              </summary>
              <div style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#f9fafb',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#374151',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                <div><strong>Erro original:</strong> {this.state.error.message}</div>
                <div style={{ marginTop: '10px' }}><strong>Stack:</strong></div>
                <pre style={{
                  margin: '5px 0',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.stack}
                </pre>
                {this.state.errorInfo && (
                  <>
                    <div style={{ marginTop: '10px' }}><strong>Componente:</strong></div>
                    <pre style={{
                      margin: '5px 0',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            </details>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
