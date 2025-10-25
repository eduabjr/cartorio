/**
 * Utilitário para validação e formatação de CPF
 * Segue as regras do Ministério da Fazenda
 */

export interface CPFValidationResult {
  isValid: boolean
  formatted: string
  error: string | null
}

/**
 * Remove caracteres não numéricos do CPF
 */
export function removeCPFFormatting(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

/**
 * Formata CPF para o padrão XXX.XXX.XXX-XX
 */
export function formatCPF(cpf: string): string {
  const cleaned = removeCPFFormatting(cpf)
  
  if (cleaned.length === 0) return ''
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
  
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`
}

/**
 * Calcula o primeiro dígito verificador
 */
function calcularPrimeiroDigito(cpf: string): number {
  let soma = 0

  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf[i]) * (10 - i)
  }

  const resto = (soma * 10) % 11
  return (resto === 10 || resto === 11) ? 0 : resto
}

/**
 * Calcula o segundo dígito verificador
 */
function calcularSegundoDigito(cpf: string): number {
  let soma = 0

  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf[i]) * (11 - i)
  }

  const resto = (soma * 10) % 11
  return (resto === 10 || resto === 11) ? 0 : resto
}

/**
 * Valida CPF de acordo com as regras do Ministério da Fazenda
 * Verifica:
 * - Comprimento (11 dígitos)
 * - Não é sequência de números iguais
 * - Dígitos verificadores estão corretos
 */
export function validarCPF(cpf: string): CPFValidationResult {
  const cleaned = removeCPFFormatting(cpf)
  const formatted = formatCPF(cpf)

  // Verificar comprimento
  if (cleaned.length !== 11) {
    return {
      isValid: false,
      formatted,
      error: 'CPF deve conter exatamente 11 dígitos'
    }
  }

  // Verificar se não é sequência de números iguais
  // Exemplos: 11111111111, 22222222222, etc.
  const todosIguais = cleaned.split('').every(digit => digit === cleaned[0])
  if (todosIguais) {
    return {
      isValid: false,
      formatted,
      error: 'CPF com dígitos repetidos não é válido'
    }
  }

  // Verificar primeiro dígito verificador
  const primeiroDigitoCalculado = calcularPrimeiroDigito(cleaned)
  if (parseInt(cleaned[9]) !== primeiroDigitoCalculado) {
    return {
      isValid: false,
      formatted,
      error: 'Primeiro dígito verificador inválido'
    }
  }

  // Verificar segundo dígito verificador
  const segundoDigitoCalculado = calcularSegundoDigito(cleaned)
  if (parseInt(cleaned[10]) !== segundoDigitoCalculado) {
    return {
      isValid: false,
      formatted,
      error: 'Segundo dígito verificador inválido'
    }
  }

  return {
    isValid: true,
    formatted,
    error: null
  }
}

/**
 * Hook para validação de CPF durante digitação
 * Retorna se é um CPF válido
 */
export function isCPFValid(cpf: string): boolean {
  return validarCPF(cpf).isValid
}

/**
 * Gera um CPF válido (apenas para testes/demo)
 * NÃO USE EM PRODUÇÃO PARA GERAR CPFs REAIS
 */
export function gerarCPFTeste(): string {
  // Gerar 9 primeiros dígitos aleatórios
  let cpf = ''
  for (let i = 0; i < 9; i++) {
    cpf += Math.floor(Math.random() * 10)
  }

  // Calcular dígitos verificadores
  const primeiroDigito = calcularPrimeiroDigito(cpf)
  cpf += primeiroDigito

  const segundoDigito = calcularSegundoDigito(cpf)
  cpf += segundoDigito

  return formatCPF(cpf)
}
