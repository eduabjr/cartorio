import React, { useState, useEffect } from 'react'
import { singleInstanceService } from '../services/SingleInstanceService'

interface InstanceNotificationProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function InstanceNotification({ position = 'top-right' }: InstanceNotificationProps) {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    message: string
    type: 'refresh' | 'open' | 'close'
    timestamp: Date
  }>>([])

  useEffect(() => {
    const unsubscribe = singleInstanceService.subscribe((instances) => {
      // Detectar mudanças nas instâncias
      instances.forEach((instance, type) => {
        const existingNotification = notifications.find(n => n.id === instance.id)
        
        if (instance.refreshCount > 0 && !existingNotification) {
          // Nova notificação de refresh
          const newNotification = {
            id: instance.id,
            message: `🔄 ${type} foi atualizada`,
            type: 'refresh' as const,
            timestamp: new Date()
          }
          
          setNotifications(prev => [...prev, newNotification])
          
          // Remove a notificação após 3 segundos
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newNotification.id))
          }, 3000)
        }
      })
    })

    return unsubscribe
  }, [notifications])

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      pointerEvents: 'none' as const
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

  if (notifications.length === 0) {
    return null
  }

  return (
    <div style={getPositionStyles()}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            animation: 'slideIn 0.3s ease-out',
            maxWidth: '300px',
            wordWrap: 'break-word'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>
              {notification.type === 'refresh' ? '🔄' : 
               notification.type === 'open' ? '🆕' : '❌'}
            </span>
            <span>{notification.message}</span>
          </div>
        </div>
      ))}
      
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
