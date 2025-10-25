import React from 'react'
import { CheckCircle, AlertCircle, RotateCw } from 'lucide-react'

export interface SaveIndicatorProps {
  isSaving: boolean
  lastSaved: Date | null
  error: Error | null
}

export function SaveIndicator({ isSaving, lastSaved, error }: SaveIndicatorProps) {
  if (isSaving) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: '#3B82F6',
          fontWeight: '500'
        }}
        title="Salvando dados..."
      >
        <RotateCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
        <span>Salvando...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: '#EF4444',
          fontWeight: '500'
        }}
        title={`Erro ao salvar: ${error.message}`}
      >
        <AlertCircle size={14} />
        <span>Erro ao salvar</span>
      </div>
    )
  }

  if (lastSaved) {
    const timeAgo = Date.now() - lastSaved.getTime()
    const secondsAgo = Math.floor(timeAgo / 1000)
    const minutesAgo = Math.floor(timeAgo / 60000)

    let timeLabel = 'Agora'
    if (secondsAgo > 60) {
      timeLabel = `${minutesAgo}m atrás`
    } else if (secondsAgo > 0) {
      timeLabel = 'Alguns segundos'
    }

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: '#10B981',
          fontWeight: '500'
        }}
        title={`Últim salvamento: ${lastSaved.toLocaleTimeString('pt-BR')}`}
      >
        <CheckCircle size={14} />
        <span>{timeLabel}</span>
      </div>
    )
  }

  return null
}

// Adicionar animação de spin ao CSS
const style = document.createElement('style')
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`
document.head.appendChild(style)
