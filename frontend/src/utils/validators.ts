/**
 * Validadores centralizados para todo o sistema
 * Evita duplicação de lógica de validação
 */

import { validarCPF, formatCPF as formatCPFUtil } from './cpfValidator'

/**
 * Resultado padrão de validação
 */
export interface ValidationResult {
  isValid: boolean
  error: string | null
  formatted?: string
}

/**
 * Valida CPF e retorna resultado formatado
 */
export function validateCPF(cpf: string): ValidationResult {
  const result = validarCPF(cpf)
  return {
    isValid: result.isValid,
    error: result.error,
    formatted: result.formatted
  }
}

/**
 * Valida email - verifica se contém @ e formato básico
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim()
  
  if (!trimmed) {
    return { isValid: true, error: null } // Email vazio é válido (campo opcional)
  }
  
  if (!trimmed.includes('@')) {
    return {
      isValid: false,
      error: 'O e-mail deve conter o símbolo @\n\nExemplo: usuario@exemplo.com'
    }
  }
  
  if (!trimmed.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return {
      isValid: false,
      error: 'Formato inválido\n\nFormato correto: usuario@exemplo.com'
    }
  }
  
  return { isValid: true, error: null, formatted: trimmed }
}

/**
 * Formata telefone (00) 0000-0000
 */
export function formatTelefone(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return value
}

/**
 * Formata celular (00) 00000-0000
 */
export function formatCelular(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return value
}

/**
 * Formata CEP 00000-000
 */
export function formatCEP(value: string): string {
  const cepLimpo = value.replace(/[^\d]/g, '')
  
  if (cepLimpo.length <= 5) return cepLimpo
  return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5, 8)}`
}

/**
 * Valida se um campo obrigatório está preenchido
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  
  if (!trimmed) {
    return {
      isValid: false,
      error: `O campo ${fieldName} é obrigatório`
    }
  }
  
  return { isValid: true, error: null }
}

/**
 * Valida múltiplos campos obrigatórios
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: Array<{ campo: string; label: string }>
): ValidationResult {
  const camposVazios = requiredFields.filter(item => {
    const valor = data[item.campo]
    return !valor || (typeof valor === 'string' && valor.trim() === '')
  })

  if (camposVazios.length > 0) {
    const listaCampos = camposVazios.map(item => item.label).join(', ')
    return {
      isValid: false,
      error: `Por favor, preencha os seguintes campos obrigatórios:\n\n${listaCampos}`
    }
  }

  return { isValid: true, error: null }
}

/**
 * Formata CPF
 */
export function formatCPF(cpf: string): string {
  return formatCPFUtil(cpf)
}

