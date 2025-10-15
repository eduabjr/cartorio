import React, { Component, ErrorInfo, ReactNode } from 'react'

interface SafeComponentProps {
  children: ReactNode
  fallback?: ReactNode
  name?: string
}

interface SafeComponentState {
  hasError: boolean
  error?: Error
}

export class SafeComponent extends Component<SafeComponentProps, SafeComponentState> {
  constructor(props: SafeComponentProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): SafeComponentState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Erro no componente ${this.props.name || 'SafeComponent'}:`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            Erro no componente {this.props.name || 'desconhecido'}. 
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="ml-2 text-blue-600 hover:text-blue-800 underline"
            >
              Tentar novamente
            </button>
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook para usar componentes seguros
export function useSafeComponent<T extends React.ComponentType<any>>(
  Component: T,
  fallback?: ReactNode
): T {
  return React.memo((props: any) => (
    <SafeComponent name={Component.displayName || Component.name} fallback={fallback}>
      <Component {...props} />
    </SafeComponent>
  )) as T
}
