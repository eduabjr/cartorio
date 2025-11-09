import React, { Suspense, lazy, ComponentType, useMemo, useCallback } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

/**
 * 🚀 Loader de Página com Isolamento
 * 
 * Carrega páginas de forma lazy (sob demanda)
 * Isola erros com Error Boundary
 * Equivalente a microserviços: cada módulo é independente
 */

interface PageLoaderProps {
  component: ComponentType<any>
  moduleName: string
  props?: any
}

const LoadingFallback = ({ moduleName }: { moduleName: string }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    gap: '16px'
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      border: '4px solid #e5e7eb',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    <div style={{ fontSize: '14px', color: '#6b7280' }}>
      Carregando {moduleName}...
    </div>
  </div>
)

export function PageLoader({ component: Component, moduleName, props = {} }: PageLoaderProps) {
  const memoizedProps = useMemo(() => props, [props])

  const handleClose = useCallback(() => {
    if (memoizedProps && typeof memoizedProps.onClose === 'function') {
      memoizedProps.onClose()
    }
  }, [memoizedProps])

  return (
    <ErrorBoundary moduleName={moduleName} onClose={handleClose}>
      <Suspense fallback={<LoadingFallback moduleName={moduleName} />}>
        <Component {...memoizedProps} />
      </Suspense>
    </ErrorBoundary>
  )
}

/**
 * 🏭 Helper para criar páginas isoladas com lazy loading
 */
export function createIsolatedPage(
  importFn: () => Promise<{ default: ComponentType<any> }>,
  moduleName: string
) {
  const LazyComponent = lazy(importFn)
  
  return (props: any) => (
    <PageLoader
      component={LazyComponent}
      moduleName={moduleName}
      props={props}
    />
  )
}

