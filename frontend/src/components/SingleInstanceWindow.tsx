import React, { useState, useEffect, useCallback } from 'react'
import { singleInstanceService } from '../services/SingleInstanceService'

interface SingleInstanceWindowProps {
  type: string
  component: React.ComponentType<any>
  props?: any
  onClose?: () => void
  onRefresh?: () => void
}

export function SingleInstanceWindow({ 
  type, 
  component: Component, 
  props = {}, 
  onClose,
  onRefresh 
}: SingleInstanceWindowProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [instance, setInstance] = useState(singleInstanceService.getInstance(type))
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Monitora mudanças na instância
  useEffect(() => {
    const unsubscribe = singleInstanceService.subscribe((instances) => {
      const currentInstance = instances.get(type)
      setInstance(currentInstance)
      
      // Detecta refresh
      if (currentInstance && currentInstance.props.refreshTrigger) {
        const lastRefresh = currentInstance.props.refreshTrigger
        if (lastRefresh !== refreshKey) {
          console.log(`🔄 Refresh detectado para ${type}`)
          setIsRefreshing(true)
          setRefreshKey(lastRefresh)
          
          // Simula um pequeno delay para mostrar o refresh
          setTimeout(() => {
            setIsRefreshing(false)
            onRefresh?.()
          }, 300)
        }
      }
    })

    return unsubscribe
  }, [type, refreshKey, onRefresh])

  const handleClose = useCallback(() => {
    singleInstanceService.close(type)
    onClose?.()
  }, [type, onClose])

  const handleForceRefresh = useCallback(() => {
    singleInstanceService.forceRefresh(type, props)
  }, [type, props])

  if (!instance || !instance.isOpen) {
    return null
  }

  if (isRefreshing) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ color: '#374151', fontSize: '14px' }}>
            Atualizando {type}...
          </span>
        </div>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <Component
      key={refreshKey} // Força re-render quando há refresh
      {...props}
      {...instance.props}
      onClose={handleClose}
      onForceRefresh={handleForceRefresh}
      instanceId={instance.id}
      refreshCount={instance.refreshCount}
    />
  )
}

// Hook para usar em componentes que precisam saber se são instância única
export const useSingleInstanceProps = () => {
  const [props, setProps] = useState<any>({})

  useEffect(() => {
    // Detecta se o componente foi chamado via SingleInstanceWindow
    const urlParams = new URLSearchParams(window.location.search)
    const instanceId = urlParams.get('instanceId')
    const refreshCount = urlParams.get('refreshCount')
    
    if (instanceId) {
      setProps({
        instanceId,
        refreshCount: refreshCount ? parseInt(refreshCount) : 0,
        isSingleInstance: true
      })
    }
  }, [])

  return props
}
