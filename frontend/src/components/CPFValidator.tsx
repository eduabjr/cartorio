import React from 'react'
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'

export interface CPFValidatorProps {
  cpf: string
  isValid: boolean
  error: string | null
  showIcon?: boolean
  showMessage?: boolean
}

export function CPFValidator({ 
  cpf, 
  isValid, 
  error, 
  showIcon = true,
  showMessage = true 
}: CPFValidatorProps) {
  // Se CPF está vazio, não mostrar nada
  if (!cpf || cpf.length === 0) {
    return null
  }

  // Se o CPF ainda está sendo digitado (menos de 11 dígitos)
  const isIncomplete = cpf.replace(/\D/g, '').length < 11

  if (isIncomplete) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: '#6B7280',
          fontWeight: '500'
        }}
        title="CPF incompleto"
      >
        {showIcon && <AlertCircle size={14} style={{ opacity: 0.6 }} />}
        {showMessage && <span>CPF incompleto ({cpf.replace(/\D/g, '').length}/11)</span>}
      </div>
    )
  }

  if (isValid) {
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
        title="CPF válido"
      >
        {showIcon && <CheckCircle size={14} />}
        {showMessage && <span>CPF válido</span>}
      </div>
    )
  }

  // CPF inválido
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
      title={`CPF inválido: ${error}`}
    >
      {showIcon && <XCircle size={14} />}
      {showMessage && <span>{error || 'CPF inválido'}</span>}
    </div>
  )
}
