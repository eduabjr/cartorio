import React, { useState, useEffect } from 'react'
import { useSystemHealth } from '../services/HealthCheckService'
import { useCircuitBreaker } from '../services/CircuitBreakerService'
import { useOfflineMode } from '../services/FallbackService'

interface SystemStatusProps {
  showDetails?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function SystemStatus({ 
  showDetails = false, 
  position = 'top-right' 
}: SystemStatusProps) {
  const { systemHealth, isHealthy } = useSystemHealth()
  const { isOffline, notifications } = useOfflineMode()
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#10b981'
      case 'degraded': return '#f59e0b'
      case 'unhealthy': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅'
      case 'degraded': return '⚠️'
      case 'unhealthy': return '❌'
      default: return '❓'
    }
  }

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 9999,
      padding: '8px 12px',
      borderRadius: '8px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      fontSize: '12px',
      fontFamily: 'monospace',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      pointerEvents: 'auto' as const  // Permite cliques apenas no elemento
    }

    switch (position) {
      case 'top-right':
        return { ...baseStyles, top: '20px', right: '20px' }
      case 'top-left':
        return { ...baseStyles, top: '20px', left: '20px' }
      case 'bottom-right':
        return { ...baseStyles, bottom: '20px', right: '20px' }
      case 'bottom-left':
        return { ...baseStyles, bottom: '20px', left: '20px' }
      default:
        return { ...baseStyles, top: '20px', right: '20px' }
    }
  }

  const getOverallStatus = () => {
    if (isOffline) return 'offline'
    return systemHealth.overall
  }

  const getStatusText = () => {
    const status = getOverallStatus()
    switch (status) {
      case 'healthy': return 'Sistema Operacional'
      case 'degraded': return 'Sistema Degradado'
      case 'unhealthy': return 'Sistema Instável'
      case 'offline': return 'Modo Offline'
      default: return 'Status Desconhecido'
    }
  }

  if (!showDetails && !isExpanded) {
    return (
      <div
        style={getPositionStyles()}
        onClick={() => setIsExpanded(true)}
        title="Clique para ver detalhes do sistema"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px' }}>
            {getStatusIcon(getOverallStatus())}
          </span>
          <span>{getStatusText()}</span>
          {notifications.length > 0 && (
            <span style={{ 
              backgroundColor: '#ef4444', 
              borderRadius: '50%', 
              width: '8px', 
              height: '8px',
              display: 'inline-block'
            }} />
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        ...getPositionStyles(),
        minWidth: '300px',
        maxWidth: '400px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
          Status do Sistema
        </h4>
        <button
          onClick={() => setIsExpanded(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0'
          }}
        >
          ✕
        </button>
      </div>

      {/* Status Geral */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>
            {getStatusIcon(getOverallStatus())}
          </span>
          <span style={{ fontWeight: 'bold' }}>
            {getStatusText()}
          </span>
        </div>
        
        {isOffline && (
          <div style={{ 
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            border: '1px solid rgba(245, 158, 11, 0.5)',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '11px'
          }}>
            🔌 Modo Offline Ativo - Funcionalidades limitadas disponíveis
          </div>
        )}
      </div>

      {/* Notificações */}
      {notifications.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h5 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#fbbf24' }}>
            ⚠️ Notificações
          </h5>
          {notifications.map((notification, index) => (
            <div key={index} style={{ 
              fontSize: '11px', 
              marginBottom: '4px',
              color: '#fbbf24'
            }}>
              • {notification}
            </div>
          ))}
        </div>
      )}

      {/* Status dos Serviços */}
      <div>
        <h5 style={{ margin: '0 0 8px 0', fontSize: '12px' }}>
          🔧 Serviços
        </h5>
        {systemHealth.services.map((service) => (
          <div key={service.name} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '4px',
            fontSize: '11px'
          }}>
            <span style={{ color: '#d1d5db' }}>
              {service.name.replace('-service', '')}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px' }}>
                {getStatusIcon(service.status)}
              </span>
              <span style={{ 
                color: getStatusColor(service.status),
                fontSize: '10px'
              }}>
                {service.status}
              </span>
              {service.responseTime && (
                <span style={{ color: '#9ca3af', fontSize: '10px' }}>
                  {service.responseTime}ms
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Informações Adicionais */}
      <div style={{ 
        marginTop: '12px', 
        paddingTop: '12px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '10px',
        color: '#9ca3af'
      }}>
        <div>Última verificação: {systemHealth.timestamp.toLocaleTimeString()}</div>
        <div>Total de serviços: {systemHealth.services.length}</div>
        <div>Serviços saudáveis: {systemHealth.services.filter(s => s.status === 'healthy').length}</div>
      </div>

      {/* Ações Rápidas */}
      <div style={{ 
        marginTop: '12px', 
        display: 'flex', 
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '4px 8px',
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          🔄 Recarregar
        </button>
        <button
          onClick={() => {
            localStorage.clear()
            window.location.reload()
          }}
          style={{
            padding: '4px 8px',
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          🗑️ Limpar Cache
        </button>
      </div>
    </div>
  )
}
