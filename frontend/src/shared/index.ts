/**
 * Índice centralizado de imports compartilhados
 * Facilita importar múltiplos recursos de um único lugar
 */

// Constantes
export { UF_OPTIONS, PAIS_OPTIONS } from '../constants/selectOptions'
export { 
  HEADER_COLORS, 
  WINDOW_DIMENSIONS, 
  STATUS_COLORS, 
  Z_INDEX,
  SPACING,
  BORDERS,
  FONT_SIZES,
  COMPONENT_HEIGHTS 
} from '../constants/theme'
export { 
  STORAGE_KEYS, 
  getFromStorage, 
  saveToStorage, 
  getNextCode, 
  saveLastCode,
  getValoresNaturezaKey 
} from '../constants/localStorage'

// Estilos
export { getFormStyles } from '../styles/formStyles'
export type { FormStylesConfig } from '../styles/formStyles'

// Componentes de Formulário
export { FormField } from '../components/form/FormField'
export { FormRow } from '../components/form/FormRow'
export { CustomSelect } from '../components/CustomSelect'

// Validadores
export {
  validateCPF,
  validateEmail,
  validateRequired,
  validateRequiredFields,
  formatCPF,
  formatTelefone,
  formatCelular,
  formatCEP
} from '../utils/validators'
export type { ValidationResult } from '../utils/validators'

// Hooks
export { useAccessibility } from '../hooks/useAccessibility'

// Componentes Base
export { BasePage } from '../components/BasePage'

