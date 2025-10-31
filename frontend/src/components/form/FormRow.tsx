/**
 * Componente para linhas de formulário
 * Garante alinhamento e espaçamento consistente
 */

import React from 'react'
import { getFormStyles } from '../../styles/formStyles'
import { useAccessibility } from '../../hooks/useAccessibility'

interface FormRowProps {
  children: React.ReactNode
  style?: React.CSSProperties
}

export function FormRow({ children, style }: FormRowProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const { rowStyles } = getFormStyles({ theme, currentTheme })

  return (
    <div style={{ ...rowStyles, ...style }}>
      {children}
    </div>
  )
}

