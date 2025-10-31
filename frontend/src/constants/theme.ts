/**
 * Configurações globais de tema e cores
 * Centraliza todas as cores e dimensões do sistema
 */

// Cores de header por tema
export const HEADER_COLORS = {
  light: '#008080', // Teal
  dark: '#FF8C00',  // Laranja
  highContrast: '#FFFF00' // Amarelo
} as const

// Dimensões padrão de janelas
export const WINDOW_DIMENSIONS = {
  small: { width: '600px', height: '400px', minWidth: '600px', minHeight: '400px' },
  medium: { width: '800px', height: '600px', minWidth: '800px', minHeight: '600px' },
  large: { width: '900px', height: '580px', minWidth: '900px', minHeight: '580px' },
  xlarge: { width: '1200px', height: '700px', minWidth: '1200px', minHeight: '700px' }
} as const

// Cores de status
export const STATUS_COLORS = {
  success: '#22c55e',
  error: '#dc2626',
  warning: '#f59e0b',
  info: '#3b82f6'
} as const

// Z-index layers
export const Z_INDEX = {
  base: 1000,
  dropdown: 9999,
  modal: 10000,
  tooltip: 10001
} as const

// Breakpoints para responsividade
export const BREAKPOINTS = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px'
} as const

// Espaçamentos padronizados
export const SPACING = {
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  xxl: '24px'
} as const

// Bordas e raios
export const BORDERS = {
  radius: {
    sm: '3px',
    md: '4px',
    lg: '6px',
    xl: '8px'
  },
  width: {
    thin: '1px',
    medium: '2px',
    thick: '3px'
  }
} as const

// Tamanhos de fonte padronizados
export const FONT_SIZES = {
  xs: '10px',
  sm: '11px',
  md: '12px',
  lg: '13px',
  xl: '14px',
  xxl: '16px'
} as const

// Alturas de componentes
export const COMPONENT_HEIGHTS = {
  input: '24px',
  select: '24px',
  button: '36px',
  buttonSmall: '28px'
} as const

