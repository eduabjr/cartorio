import React, { Component, ErrorInfo, ReactNode } from 'react'
import { FallbackComponent } from './FallbackComponent'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorCount: 0
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorCount: 1 }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo)
    
    // Se houver muitos erros, recarregar automaticamente
    if (this.state.errorCount > 3) {
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    }
  }

  private resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <FallbackComponent 
          error={this.state.error} 
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}
