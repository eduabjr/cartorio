/**
 * Estilos compartilhados para formulários
 * Centraliza todos os estilos de inputs, selects e buttons
 * USO: import { getFormStyles } from '../styles/formStyles'
 */

import { Theme } from '../hooks/useAccessibility'

export interface FormStylesConfig {
  theme: Theme
  currentTheme: 'light' | 'dark' | 'highContrast'
  focusedField?: string | null
}

/**
 * Retorna todos os estilos padronizados do sistema
 */
export function getFormStyles(config: FormStylesConfig) {
  const { theme, currentTheme, focusedField } = config
  
  // Cores para estados de foco
  const focusColor = currentTheme === 'dark' ? '#ffd4a3' : '#ffedd5'
  const focusTextColor = currentTheme === 'dark' ? '#1a1a1a' : '#000000'
  
  // Cor da seta para selects (adapta ao tema)
  const arrowColor = currentTheme === 'dark' ? '%23FFFFFF' : '%23333333'

  /**
   * Estilos base para inputs de texto
   */
  const inputStyles: React.CSSProperties = {
    padding: '3px 10px',
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    fontSize: '12px',
    backgroundColor: theme.background,
    color: theme.text,
    outline: 'none',
    height: '24px',
    minHeight: '24px',
    maxHeight: '24px',
    width: '100%',
    boxSizing: 'border-box',
    lineHeight: '18px',
    minWidth: '80px',
    flexShrink: 0
  }

  /**
   * Estilos para inputs com estado de foco
   */
  const getInputStyles = (fieldName: string): React.CSSProperties => ({
    ...inputStyles,
    backgroundColor: focusedField === fieldName ? focusColor : theme.background,
    color: focusedField === fieldName ? focusTextColor : theme.text,
    transition: 'all 0.2s ease',
    WebkitBoxShadow: focusedField === fieldName 
      ? `0 0 0 1000px ${focusColor} inset` 
      : `0 0 0 1000px ${theme.background} inset`,
    WebkitTextFillColor: focusedField === fieldName ? focusTextColor : theme.text,
    boxShadow: focusedField === fieldName ? `0 0 0 1000px ${focusColor} inset` : 'none'
  })

  /**
   * Estilos base para selects (dropdowns)
   */
  const selectStyles: React.CSSProperties = {
    padding: '3px 10px',
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    fontSize: '12px',
    backgroundColor: theme.background,
    color: theme.text,
    outline: 'none',
    height: '24px',
    minHeight: '24px',
    maxHeight: '24px',
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer',
    lineHeight: '18px',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${arrowColor}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 6px center',
    backgroundSize: '14px',
    paddingRight: '26px',
    verticalAlign: 'top',
    display: 'block',
    margin: '0',
    fontFamily: 'inherit',
    minWidth: '0',
    flexShrink: 1
  }

  /**
   * Estilos para selects com estado de foco
   */
  const getSelectStyles = (fieldName: string): React.CSSProperties => ({
    ...selectStyles,
    backgroundColor: focusedField === fieldName ? focusColor : theme.background,
    color: focusedField === fieldName ? focusTextColor : theme.text,
    transition: 'all 0.2s ease',
    WebkitBoxShadow: focusedField === fieldName 
      ? `0 0 0 1000px ${focusColor} inset` 
      : `0 0 0 1000px ${theme.background} inset`,
    WebkitTextFillColor: focusedField === fieldName ? focusTextColor : theme.text,
    boxShadow: focusedField === fieldName ? `0 0 0 1000px ${focusColor} inset` : 'none'
  })

  /**
   * Estilos para labels
   */
  const labelStyles: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '600',
    color: theme.text,
    marginBottom: '1px',
    height: '16px',
    lineHeight: '16px',
    display: 'flex',
    alignItems: 'center',
    marginTop: '0px',
    paddingTop: '0px'
  }

  /**
   * Estilos base para buttons
   */
  const buttonStyles: React.CSSProperties = {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    height: '36px',
    minHeight: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap'
  }

  /**
   * Estilos para botões primários (ações principais)
   */
  const primaryButtonStyles: React.CSSProperties = {
    ...buttonStyles,
    backgroundColor: theme.primary,
    color: '#ffffff'
  }

  /**
   * Estilos para botões secundários
   */
  const secondaryButtonStyles: React.CSSProperties = {
    ...buttonStyles,
    backgroundColor: theme.surface,
    color: theme.text,
    border: `1px solid ${theme.border}`
  }

  /**
   * Estilos para botões de perigo (deletar, cancelar)
   */
  const dangerButtonStyles: React.CSSProperties = {
    ...buttonStyles,
    backgroundColor: '#dc2626',
    color: '#ffffff'
  }

  /**
   * Estilos para containers de formulário
   */
  const formContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '2px',
    backgroundColor: theme.surface,
    color: theme.text,
    minWidth: 0,
    flexShrink: 1
  }

  /**
   * Estilos para linhas de formulário (rows)
   */
  const rowStyles: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    alignItems: 'start',
    marginBottom: '2px',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    minWidth: 0,
    flexShrink: 1
  }

  /**
   * Estilos para campos individuais (field containers)
   */
  const fieldStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
    minHeight: '38px',
    paddingTop: '0px',
    marginTop: '0px',
    minWidth: 0,
    flex: '1',
    flexShrink: 1
  }

  /**
   * Estilos para containers de botões
   */
  const buttonContainerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '14px',
    marginTop: '2px',
    paddingTop: '4px',
    borderTop: `1px solid ${theme.border}`,
    flexWrap: 'nowrap',
    flexShrink: 0,
    minHeight: '40px'
  }

  return {
    // Estilos base
    inputStyles,
    selectStyles,
    labelStyles,
    buttonStyles,
    
    // Estilos com funções
    getInputStyles,
    getSelectStyles,
    
    // Estilos de botões
    primaryButtonStyles,
    secondaryButtonStyles,
    dangerButtonStyles,
    
    // Estilos de layout
    formContainerStyles,
    rowStyles,
    fieldStyles,
    buttonContainerStyles,
    
    // Cores e configurações úteis
    focusColor,
    focusTextColor,
    arrowColor
  }
}

