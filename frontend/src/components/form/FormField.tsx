/**
 * Componente reutilizável para campos de formulário
 * Padroniza layout e comportamento em todo o sistema
 */

import React from 'react'
import { getFormStyles } from '../../styles/formStyles'
import { useAccessibility } from '../../hooks/useAccessibility'

interface FormFieldProps {
  label: string
  required?: boolean
  children: React.ReactNode
  style?: React.CSSProperties
  width?: string | number
}

export function FormField({ label, required = false, children, style, width }: FormFieldProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const { fieldStyles, labelStyles } = getFormStyles({ theme, currentTheme })

  return (
    <div style={{ ...fieldStyles, ...style, ...(width ? { flex: 'none', width } : {}) }}>
      <label style={labelStyles}>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

