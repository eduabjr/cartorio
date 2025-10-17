import { useState, useCallback } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'

interface SecureDataDisplayProps {
  value: string
  type: 'cpf' | 'cnpj' | 'rg' | 'phone' | 'email' | 'generic'
  label?: string
  showByDefault?: boolean
  requirePermission?: boolean
  userRole?: string
  allowedRoles?: string[]
  className?: string
  style?: React.CSSProperties
}

export function SecureDataDisplay({
  value,
  type,
  label,
  showByDefault = false,
  requirePermission = true,
  userRole,
  allowedRoles = ['admin', 'manager'],
  className,
  style
}: SecureDataDisplayProps) {
  const [isVisible, setIsVisible] = useState(showByDefault)
  const [isHovered, setIsHovered] = useState(false)
  const { getTheme, isHighContrast } = useAccessibility()

  const theme = getTheme()

  // Verificar se o usuário tem permissão para ver os dados
  const hasPermission = !requirePermission || 
    (userRole && allowedRoles.includes(userRole))

  // Formatar o valor baseado no tipo
  const formatValue = useCallback((val: string, dataType: string) => {
    if (!val) return ''
    
    switch (dataType) {
      case 'cpf':
        return val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      case 'cnpj':
        return val.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
      case 'phone':
        return val.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      case 'email':
        return val
      case 'rg':
        return val.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4')
      default:
        return val
    }
  }, [])

  // Gerar valor mascarado
  const getMaskedValue = useCallback((val: string, dataType: string) => {
    if (!val) return ''
    
    switch (dataType) {
      case 'cpf':
        return '***.***.***-**'
      case 'cnpj':
        return '**.***.***/****-**'
      case 'phone':
        return '(**) *****-****'
      case 'email':
        const [local, domain] = val.split('@')
        return `${local.substring(0, 2)}***@${domain}`
      case 'rg':
        return '**.***.***-*'
      default:
        return '***'
    }
  }, [])

  const toggleVisibility = useCallback(() => {
    if (!hasPermission) return
    setIsVisible(!isVisible)
  }, [hasPermission, isVisible])

  const getDisplayValue = () => {
    if (!hasPermission) {
      return getMaskedValue(value, type)
    }
    return isVisible ? formatValue(value, type) : getMaskedValue(value, type)
  }

  const getIcon = () => {
    if (!hasPermission) return '🔒'
    return isVisible ? '👁️' : '👁️‍🗨️'
  }

  const getTooltip = () => {
    if (!hasPermission) {
      return 'Você não tem permissão para visualizar este dado'
    }
    return isVisible ? 'Clique para ocultar' : 'Clique para visualizar'
  }

  const containerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    cursor: hasPermission ? 'pointer' : 'not-allowed',
    opacity: hasPermission ? 1 : 0.6,
    ...style
  }

  const valueStyles = {
    fontFamily: 'monospace',
    fontSize: '14px',
    color: hasPermission && isVisible ? theme.text : theme.textSecondary,
    backgroundColor: hasPermission && isVisible ? 'transparent' : theme.background,
    padding: hasPermission && isVisible ? '0' : '2px 4px',
    borderRadius: hasPermission && isVisible ? '0' : '3px',
    border: hasPermission && isVisible ? 'none' : `1px solid ${theme.border}`,
    transition: 'all 0.2s ease'
  }

  const iconStyles = {
    fontSize: '16px',
    cursor: hasPermission ? 'pointer' : 'not-allowed',
    opacity: hasPermission ? 1 : 0.5,
    transition: 'all 0.2s ease',
    padding: '4px',
    borderRadius: '4px',
    backgroundColor: isHovered && hasPermission ? theme.primary + '20' : 'transparent'
  }

  return (
    <div
      className={className}
      style={containerStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={toggleVisibility}
      role="button"
      tabIndex={hasPermission ? 0 : -1}
      aria-label={getTooltip()}
      aria-describedby={label ? `${label}-description` : undefined}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && hasPermission) {
          e.preventDefault()
          toggleVisibility()
        }
      }}
    >
      {label && (
        <span style={{ 
          fontSize: '12px', 
          color: theme.textSecondary,
          fontWeight: '500',
          minWidth: '80px'
        }}>
          {label}:
        </span>
      )}
      
      <span style={valueStyles}>
        {getDisplayValue()}
      </span>
      
      <span
        style={iconStyles}
        role="img"
        aria-label={getTooltip()}
        title={getTooltip()}
      >
        {getIcon()}
      </span>
      
      {label && (
        <span 
          id={`${label}-description`}
          style={{ display: 'none' }}
        >
          {getTooltip()}
        </span>
      )}
    </div>
  )
}

// Componente para exibir dados sensíveis em tabelas
interface SecureTableDataProps {
  data: Array<{
    id: string
    label: string
    value: string
    type: SecureDataDisplayProps['type']
  }>
  userRole?: string
  allowedRoles?: string[]
  className?: string
  style?: React.CSSProperties
}

export function SecureTableData({
  data,
  userRole,
  allowedRoles = ['admin', 'manager'],
  className,
  style
}: SecureTableDataProps) {
  const { getTheme } = useAccessibility()
  const theme = getTheme()

  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    overflow: 'hidden',
    ...style
  }

  const headerStyles = {
    backgroundColor: theme.primary,
    color: 'white',
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontWeight: '600',
    fontSize: '14px'
  }

  const cellStyles = {
    padding: '12px 16px',
    borderBottom: `1px solid ${theme.border}`,
    fontSize: '14px'
  }

  return (
    <table className={className} style={tableStyles} role="table">
      <thead>
        <tr>
          <th style={headerStyles}>Campo</th>
          <th style={headerStyles}>Valor</th>
          <th style={headerStyles}>Ação</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td style={cellStyles}>{item.label}</td>
            <td style={cellStyles}>
              <SecureDataDisplay
                value={item.value}
                type={item.type}
                userRole={userRole}
                allowedRoles={allowedRoles}
                style={{ margin: 0 }}
              />
            </td>
            <td style={cellStyles}>
              <span style={{ fontSize: '12px', color: theme.textSecondary }}>
                {item.type.toUpperCase()}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
