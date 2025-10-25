/**
 * CONFIGURAÇÃO CENTRALIZADA DE CAMPOS
 * ====================================
 * 
 * Define as regras de validação, formatação e aceitação para todos os campos
 * usados no sistema. Isso evita duplicação e garante consistência em todas as telas.
 * 
 * Baseado nos campos reais de Cliente e Funcionário
 */

export interface FieldRule {
  name: string              // Nome do campo
  label: string            // Label exibido na tela
  type: 'text' | 'number' | 'email' | 'cpf' | 'cnpj' | 'phone' | 'date' | 'currency' | 'percentage' | 'select' | 'checkbox' | 'custom'
  maxLength?: number        // Comprimento máximo
  minLength?: number        // Comprimento mínimo
  required?: boolean        // Campo obrigatório
  pattern?: RegExp         // Padrão de validação (regex)
  mask?: string            // Máscara de formatação (ex: "XXX.XXX.XXX-XX")
  allowLetters?: boolean   // Aceita letras
  allowNumbers?: boolean   // Aceita números
  allowSpecialChars?: boolean // Aceita caracteres especiais
  validator?: (value: string) => { isValid: boolean; error?: string } // Validador customizado
  formatter?: (value: string) => string // Formatador customizado
  placeholder?: string     // Placeholder do campo
  description?: string     // Descrição do campo para tooltip
}

/**
 * DICIONÁRIO GLOBAL DE CAMPOS - CLIENTE E FUNCIONÁRIO
 */
export const FIELD_RULES: Record<string, FieldRule> = {
  // ==================== IDENTIFICAÇÃO ====================
  
  codigo: {
    name: 'codigo',
    label: 'Código',
    type: 'text',
    maxLength: 20,
    placeholder: 'Será gerado automaticamente',
    allowLetters: false,
    allowNumbers: true,
    allowSpecialChars: false,
    description: 'Código identificador único do registro (apenas números)'
  },

  // ==================== DOCUMENTOS ====================
  
  cpf: {
    name: 'cpf',
    label: 'CPF',
    type: 'cpf',
    maxLength: 14,  // Com máscara: XXX.XXX.XXX-XX
    minLength: 11,  // Sem máscara: 11 dígitos
    placeholder: '000.000.000-00',
    allowNumbers: true,
    allowLetters: false,
    allowSpecialChars: true,
    mask: '000.000.000-00',
    description: 'Cadastro de Pessoa Física (validação automática)',
    formatter: (value: string) => {
      const numbers = value.replace(/\D/g, '')
      if (numbers.length <= 3) return numbers
      if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
      if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
    },
    validator: (value: string) => {
      const numbers = value.replace(/\D/g, '')
      if (numbers.length === 0) return { isValid: true }
      if (numbers.length < 11) return { isValid: false, error: 'CPF incompleto' }
      
      // Importar validação de CPF
      const { validarCPF } = require('../utils/cpfValidator')
      const resultado = validarCPF(value)
      
      return {
        isValid: resultado.isValid,
        error: resultado.error || undefined
      }
    }
  },

  rg: {
    name: 'rg',
    label: 'RG',
    type: 'text',
    maxLength: 20,
    placeholder: 'Número do RG',
    allowNumbers: true,
    allowLetters: false,
    allowSpecialChars: false,
    description: 'Número do Registro Geral (apenas números)'
  },

  orgaoRg: {
    name: 'orgaoRg',
    label: 'Órgão RG',
    type: 'text',
    maxLength: 10,
    placeholder: 'Ex: SSP',
    allowNumbers: false,
    allowLetters: true,
    allowSpecialChars: false,
    description: 'Órgão expedidor do RG (ex: SSP, PC)'
  },

  // ==================== PESSOAIS ====================

  nome: {
    name: 'nome',
    label: 'Nome',
    type: 'text',
    maxLength: 100,
    minLength: 3,
    required: true,
    placeholder: 'Nome completo',
    allowLetters: true,
    allowNumbers: false,
    allowSpecialChars: false,
    description: 'Nome completo da pessoa'
  },

  sexo: {
    name: 'sexo',
    label: 'Sexo',
    type: 'select',
    placeholder: 'Selecione',
    description: 'M - Masculino, F - Feminino'
  },

  estadoCivil: {
    name: 'estadoCivil',
    label: 'Estado Civil',
    type: 'select',
    placeholder: 'Selecione',
    description: 'Solteiro, Casado, Separado, Divorciado, Viúvo'
  },

  nacionalidade: {
    name: 'nacionalidade',
    label: 'Nacionalidade',
    type: 'text',
    maxLength: 50,
    placeholder: 'Brasileiro(a)',
    allowLetters: true,
    allowNumbers: false,
    allowSpecialChars: false,
    description: 'Nacionalidade do indivíduo'
  },

  naturalidade: {
    name: 'naturalidade',
    label: 'Naturalidade',
    type: 'text',
    maxLength: 50,
    placeholder: 'Cidade de nascimento',
    allowLetters: true,
    allowNumbers: false,
    allowSpecialChars: false,
    description: 'Cidade onde nasceu'
  },

  email: {
    name: 'email',
    label: 'Email',
    type: 'email',
    maxLength: 100,
    placeholder: 'seu@email.com',
    allowLetters: true,
    allowNumbers: true,
    allowSpecialChars: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    description: 'Endereço de email válido'
  },

  telefone: {
    name: 'telefone',
    label: 'Telefone',
    type: 'phone',
    maxLength: 14,  // Com máscara: (XX) XXXX-XXXX
    minLength: 10,  // Sem máscara: 10 dígitos
    placeholder: '(00) 0000-0000',
    allowNumbers: true,
    allowLetters: false,
    allowSpecialChars: true,
    mask: '(00) 0000-0000',
    description: 'Telefone fixo',
    formatter: (value: string) => {
      const numbers = value.replace(/\D/g, '')
      if (numbers.length <= 2) return numbers
      if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`
    }
  },

  celular: {
    name: 'celular',
    label: 'Celular',
    type: 'phone',
    maxLength: 15,  // Com máscara: (XX) XXXXX-XXXX
    minLength: 11,  // Sem máscara: 11 dígitos
    placeholder: '(00) 00000-0000',
    allowNumbers: true,
    allowLetters: false,
    allowSpecialChars: true,
    mask: '(00) 00000-0000',
    description: 'Celular com DDD',
    formatter: (value: string) => {
      const numbers = value.replace(/\D/g, '')
      if (numbers.length <= 2) return numbers
      if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }
  },

  nascimento: {
    name: 'nascimento',
    label: 'Data de Nascimento',
    type: 'date',
    maxLength: 10,
    placeholder: 'DD/MM/YYYY',
    allowNumbers: true,
    allowLetters: false,
    allowSpecialChars: true,
    description: 'Data de nascimento (DD/MM/YYYY)'
  },

  pai: {
    name: 'pai',
    label: 'Nome do Pai',
    type: 'text',
    maxLength: 100,
    placeholder: 'Nome completo do pai',
    allowLetters: true,
    allowNumbers: false,
    allowSpecialChars: false,
    description: 'Nome completo do pai'
  },

  mae: {
    name: 'mae',
    label: 'Nome da Mãe',
    type: 'text',
    maxLength: 100,
    placeholder: 'Nome completo da mãe',
    allowLetters: true,
    allowNumbers: false,
    allowSpecialChars: false,
    description: 'Nome completo da mãe'
  },

  profissao: {
    name: 'profissao',
    label: 'Profissão',
    type: 'text',
    maxLength: 50,
    placeholder: 'Profissão/Ocupação',
    allowLetters: true,
    allowNumbers: false,
    allowSpecialChars: false,
    description: 'Profissão ou ocupação do indivíduo'
  },

  // ==================== CARTÃO DE ASSINATURA ====================

  numeroCartao: {
    name: 'numeroCartao',
    label: 'Número Cartão',
    type: 'text',
    maxLength: 20,
    placeholder: 'Número do cartão',
    allowLetters: false,
    allowNumbers: true,
    allowSpecialChars: false,
    description: 'Número do cartão de assinatura (apenas números)'
  },

  assinanteCartao: {
    name: 'assinanteCartao',
    label: 'Assinante do Cartão',
    type: 'text',
    maxLength: 100,
    placeholder: 'Nome do assinante',
    allowLetters: true,
    allowNumbers: false,
    allowSpecialChars: false,
    description: 'Nome do assinante do cartão (apenas letras)'
  },

  // ==================== ENDEREÇO ====================

  cep: {
    name: 'cep',
    label: 'CEP',
    type: 'text',
    maxLength: 9,   // Com máscara: XXXXX-XXX
    placeholder: '00000-000',
    allowNumbers: true,
    allowLetters: false,
    allowSpecialChars: true,
    mask: '00000-000',
    description: 'Código de Endereçamento Postal (busca automática de endereço)',
    formatter: (value: string) => {
      const numbers = value.replace(/\D/g, '')
      if (numbers.length <= 5) return numbers
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
    },
    validator: (value: string) => {
      const numbers = value.replace(/\D/g, '')
      if (numbers.length === 0) return { isValid: true }
      if (numbers.length === 8) return { isValid: true }
      // Não valida se estiver incompleto (deixa digitar)
      return { isValid: true }
    }
  },

  logradouro: {
    name: 'logradouro',
    label: 'Logradouro',
    type: 'select',
    maxLength: 50,
    placeholder: 'Rua, Avenida, Praça...',
    allowLetters: true,
    allowNumbers: false,
    allowSpecialChars: false,
    description: 'Tipo de logradouro (Rua, Avenida, Praça, Alameda, Travessa, etc.)'
  },

  endereco: {
    name: 'endereco',
    label: 'Endereço',
    type: 'text',
    maxLength: 100,
    placeholder: 'Nome da rua/avenida',
    allowLetters: true,
    allowNumbers: true,
    allowSpecialChars: false,
    description: 'Nome completo do logradouro'
  },

  numero: {
    name: 'numero',
    label: 'Número',
    type: 'text',
    maxLength: 10,
    placeholder: '123',
    allowNumbers: true,
    allowLetters: false,
    allowSpecialChars: false,
    description: 'Número do imóvel'
  },

  complemento: {
    name: 'complemento',
    label: 'Complemento',
    type: 'text',
    maxLength: 50,
    placeholder: 'Apt, Bloco, Sala...',
    allowLetters: true,
    allowNumbers: true,
    allowSpecialChars: true,
    description: 'Complemento do endereço (Apto, Bloco, etc.)'
  },

  bairro: {
    name: 'bairro',
    label: 'Bairro',
    type: 'text',
    maxLength: 50,
    placeholder: 'Nome do bairro',
    allowLetters: true,
    allowNumbers: false,
    allowSpecialChars: false,
    description: 'Bairro do endereço'
  },

  cidade: {
    name: 'cidade',
    label: 'Cidade',
    type: 'text',
    maxLength: 50,
    placeholder: 'Nome da cidade',
    allowLetters: true,
    allowNumbers: false,
    allowSpecialChars: false,
    description: 'Cidade do endereço'
  },

  uf: {
    name: 'uf',
    label: 'UF',
    type: 'select',
    maxLength: 2,
    minLength: 2,
    placeholder: 'SP',
    allowLetters: true,
    allowNumbers: false,
    allowSpecialChars: false,
    description: 'Estado - sigla com 2 letras (SP, RJ, MG, etc.)'
  },

  ufEndereco: {
    name: 'ufEndereco',
    label: 'UF',
    type: 'select',
    maxLength: 2,
    minLength: 2,
    placeholder: 'SP',
    allowLetters: true,
    allowNumbers: false,
    allowSpecialChars: false,
    description: 'Estado do endereço - sigla com 2 letras'
  },

  pais: {
    name: 'pais',
    label: 'País',
    type: 'text',
    maxLength: 50,
    placeholder: 'Brasil',
    allowLetters: true,
    allowNumbers: false,
    allowSpecialChars: false,
    description: 'País'
  },

  paisEndereco: {
    name: 'paisEndereco',
    label: 'País',
    type: 'text',
    maxLength: 50,
    placeholder: 'Brasil',
    allowLetters: true,
    allowNumbers: false,
    allowSpecialChars: false,
    description: 'País do endereço'
  },

  // ==================== PROFISSIONAL (FUNCIONÁRIO) ====================

  cargoCivil: {
    name: 'cargoCivil',
    label: 'Cargo Civil',
    type: 'select',
    maxLength: 50,
    placeholder: 'Selecione o cargo',
    allowLetters: true,
    allowNumbers: false,
    allowSpecialChars: false,
    description: 'Cargo civil ou função (Escrivão, Tabelião, etc.)'
  },

  admissao: {
    name: 'admissao',
    label: 'Data de Admissão',
    type: 'date',
    maxLength: 10,
    placeholder: 'DD/MM/YYYY',
    allowNumbers: true,
    allowLetters: false,
    allowSpecialChars: true,
    description: 'Data de admissão no cargo'
  },

  demissao: {
    name: 'demissao',
    label: 'Data de Demissão',
    type: 'date',
    maxLength: 10,
    placeholder: 'DD/MM/YYYY',
    allowNumbers: true,
    allowLetters: false,
    allowSpecialChars: true,
    description: 'Data de demissão (deixar vazio se ativo)'
  },

  salario: {
    name: 'salario',
    label: 'Salário',
    type: 'currency',
    placeholder: 'R$ 0,00',
    allowNumbers: true,
    allowLetters: false,
    allowSpecialChars: false,
    description: 'Salário em reais (apenas números)',
    formatter: (value: string) => {
      // Remove tudo exceto números
      const numbers = value.replace(/\D/g, '')
      if (!numbers) return ''
      
      // Converte para número e formata como moeda
      const numValue = parseFloat(numbers) / 100
      return numValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  },

  comissao: {
    name: 'comissao',
    label: 'Comissão',
    type: 'percentage',
    maxLength: 5,
    placeholder: '0%',
    allowNumbers: true,
    allowLetters: false,
    allowSpecialChars: false,
    description: 'Percentual de comissão (apenas números)',
    formatter: (value: string) => {
      // Remove tudo exceto números
      const numbers = value.replace(/\D/g, '')
      if (!numbers) return ''
      
      // Limita a 100
      const numValue = Math.min(parseFloat(numbers), 100)
      return numValue.toString()
    }
  },

  // ==================== CREDENCIAIS (FUNCIONÁRIO) ====================

  login: {
    name: 'login',
    label: 'Login',
    type: 'text',
    maxLength: 50,
    minLength: 4,
    placeholder: 'Nome de usuário',
    allowLetters: true,
    allowNumbers: true,
    allowSpecialChars: false,
    description: 'Nome de usuário para login do sistema'
  },

  senha: {
    name: 'senha',
    label: 'Senha',
    type: 'text',
    maxLength: 50,
    minLength: 6,
    placeholder: '••••••••',
    allowLetters: true,
    allowNumbers: true,
    allowSpecialChars: true,
    description: 'Senha de acesso (mínimo 6 caracteres)'
  },

  // ==================== FUNCIONÁRIO - ESPECÍFICOS ====================

  ordemSinalPublico: {
    name: 'ordemSinalPublico',
    label: 'Ordem Sinal Público',
    type: 'text',
    maxLength: 3,
    placeholder: '001',
    allowNumbers: true,
    allowLetters: false,
    allowSpecialChars: false,
    description: 'Número da ordem de sinal público'
  },

  emAtividade: {
    name: 'emAtividade',
    label: 'Em Atividade',
    type: 'checkbox',
    description: 'Marcar se estiver em atividade'
  },

  assinante: {
    name: 'assinante',
    label: 'Assinante',
    type: 'checkbox',
    description: 'Marcar se for assinante'
  },

  observacao: {
    name: 'observacao',
    label: 'Observação',
    type: 'text',
    maxLength: 500,
    placeholder: 'Digite suas observações aqui...',
    allowLetters: true,
    allowNumbers: true,
    allowSpecialChars: true,
    description: 'Campo livre para observações'
  },

  codigoIbge: {
    name: 'codigoIbge',
    label: 'Código IBGE',
    type: 'text',
    maxLength: 10,
    placeholder: 'Código IBGE',
    allowNumbers: true,
    allowLetters: false,
    allowSpecialChars: false,
    description: 'Código IBGE da cidade'
  }
}

export function getFields(fieldNames: string[]): Record<string, FieldRule> {
  const result: Record<string, FieldRule> = {}
  fieldNames.forEach(name => {
    if (FIELD_RULES[name]) {
      result[name] = FIELD_RULES[name]
    }
  })
  return result
}

export const FIELD_CATEGORIES = {
  pessoais: ['nome', 'sexo', 'estadoCivil', 'nacionalidade', 'naturalidade', 'email', 'telefone', 'celular', 'nascimento', 'pai', 'mae', 'profissao'],
  documentos: ['cpf', 'rg', 'orgaoRg'],
  endereco: ['cep', 'logradouro', 'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'uf', 'pais'],
  enderecoSecundario: ['ufEndereco', 'paisEndereco'],
  profissional: ['cargoCivil', 'admissao', 'demissao', 'salario', 'comissao', 'ordemSinalPublico'],
  credenciais: ['login', 'senha'],
  funcionario: ['codigo', 'emAtividade', 'assinante', 'observacao', 'codigoIbge']
}

// ==================== CAMPOS POR TELA ====================

export const CLIENTE_FIELDS = [
  'codigo', 'nome', 'cpf', 'rg', 'orgaoRg', 'sexo', 'estadoCivil', 'nacionalidade',
  'naturalidade', 'nascimento', 'pai', 'mae', 'profissao', 'email', 'telefone',
  'celular', 'cep', 'logradouro', 'endereco', 'numero', 'complemento', 'bairro',
  'cidade', 'uf', 'pais', 'ufEndereco', 'paisEndereco', 'codigoIbge', 'numeroCartao', 
  'assinanteCartao'
]

export const FUNCIONARIO_FIELDS = [
  'codigo', 'ordemSinalPublico', 'emAtividade', 'assinante', 'nome', 'rg', 'cpf',
  'cep', 'logradouro', 'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'uf',
  'nascimento', 'pai', 'mae', 'telefone', 'celular', 'email', 'cargoCivil', 'admissao',
  'demissao', 'salario', 'comissao', 'login', 'senha', 'observacao'
]

export function validateField(fieldName: string, value: string): { isValid: boolean; error?: string } {
  const rule = FIELD_RULES[fieldName]
  
  if (!rule) {
    return { isValid: true }
  }

  // Validação personalizada tem prioridade
  if (rule.validator) {
    return rule.validator(value)
  }

  if (rule.maxLength && value.length > rule.maxLength) {
    return {
      isValid: false,
      error: `${rule.label} não pode exceder ${rule.maxLength} caracteres`
    }
  }

  if (rule.pattern && !rule.pattern.test(value)) {
    return {
      isValid: false,
      error: `${rule.label} em formato inválido`
    }
  }

  return { isValid: true }
}

export function formatField(fieldName: string, value: string): string {
  const rule = FIELD_RULES[fieldName]
  
  if (!rule || !rule.formatter) {
    return value
  }

  return rule.formatter(value)
}

export default {
  FIELD_RULES,
  FIELD_CATEGORIES,
  CLIENTE_FIELDS,
  FUNCIONARIO_FIELDS,
  getFields,
  validateField,
  formatField
}
