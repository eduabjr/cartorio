/**
 * Serviço de Funcionários - Integração com microserviço
 * Utiliza o ApiService para comunicação resiliente
 */

import { apiService } from './ApiService'

export interface Funcionario {
  id?: string
  codigo: string
  ordemSinalPublico: string
  emAtividade: boolean
  nome: string
  nomeMin: string
  prenome: string
  endereco: string
  bairro: string
  cidade: string
  cep: string
  telefone: string
  uf: string
  email: string
  celular: string
  nascimento: string
  rg: string
  mae: string
  cpf: string
  pai: string
  cargo: string
  assinante: boolean
  cargoMin: string
  cargoCivil: string
  cargoMin2: string
  salario: string
  comissao: string
  admissao: string
  demissao: string
  login: string
  senha: string
  observacao: string
  createdAt?: string
  updatedAt?: string
}

export interface FuncionarioResponse {
  success: boolean
  data?: Funcionario
  message?: string
  error?: string
}

export interface FuncionarioListResponse {
  success: boolean
  data?: Funcionario[]
  total?: number
  page?: number
  limit?: number
  message?: string
  error?: string
}

class FuncionarioService {
  /**
   * Buscar todos os funcionários
   */
  async getFuncionarios(page: number = 1, limit: number = 10, search?: string): Promise<FuncionarioListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (search) {
      params.append('search', search)
    }

    const endpoint = `/funcionarios?${params}`

    return apiService.get<FuncionarioListResponse>(endpoint, {
      fallback: {
        success: true,
        data: [],
        total: 0,
        message: 'Dados offline'
      }
    })
  }

  /**
   * Buscar funcionário por ID
   */
  async getFuncionarioById(id: string): Promise<FuncionarioResponse> {
    const data = await apiService.get<Funcionario>(`/funcionarios/${id}`)
    return {
      success: true,
      data: data
    }
  }

  /**
   * Criar novo funcionário
   */
  async createFuncionario(funcionario: Omit<Funcionario, 'id' | 'createdAt' | 'updatedAt'>): Promise<FuncionarioResponse> {
    const data = await apiService.post<Funcionario>('/funcionarios', funcionario)
    return {
      success: true,
      data: data,
      message: 'Funcionário criado com sucesso!'
    }
  }

  /**
   * Atualizar funcionário
   */
  async updateFuncionario(id: string, funcionario: Partial<Funcionario>): Promise<FuncionarioResponse> {
    const data = await apiService.put<Funcionario>(`/funcionarios/${id}`, funcionario)
    return {
      success: true,
      data: data,
      message: 'Funcionário atualizado com sucesso!'
    }
  }

  /**
   * Deletar funcionário
   */
  async deleteFuncionario(id: string): Promise<FuncionarioResponse> {
    await apiService.delete<void>(`/funcionarios/${id}`)
    return {
      success: true,
      message: 'Funcionário deletado com sucesso!'
    }
  }

  // Validar CPF
  validateCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '')

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false

    // Validação do primeiro dígito verificador
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cpf.charAt(9))) return false

    // Validação do segundo dígito verificador
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cpf.charAt(10))) return false

    return true
  }

  // Validar email
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validar telefone
  validateTelefone(telefone: string): boolean {
    const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/
    return telefoneRegex.test(telefone)
  }

  // Validar CEP
  validateCEP(cep: string): boolean {
    const cepRegex = /^\d{5}-\d{3}$/
    return cepRegex.test(cep)
  }

  // Formatar dados para exibição
  formatFuncionarioForDisplay(funcionario: Funcionario): Funcionario {
    return {
      ...funcionario,
      cpf: this.formatCPF(funcionario.cpf),
      telefone: this.formatTelefone(funcionario.telefone),
      celular: this.formatCelular(funcionario.celular),
      cep: this.formatCEP(funcionario.cep)
    }
  }

  // Formatar CPF
  formatCPF(cpf: string): string {
    const numbers = cpf.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return cpf
  }

  // Formatar telefone
  formatTelefone(telefone: string): string {
    const numbers = telefone.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return telefone
  }

  // Formatar celular
  formatCelular(celular: string): string {
    const numbers = celular.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return celular
  }

  // Formatar CEP
  formatCEP(cep: string): string {
    const numbers = cep.replace(/\D/g, '')
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
    }
    return cep
  }

  /**
   * Buscar funcionários por nome (para lookup)
   */
  async searchFuncionariosByName(name: string): Promise<FuncionarioListResponse> {
    const data = await apiService.get<Funcionario[]>(`/funcionarios/search?name=${encodeURIComponent(name)}`, {
      fallback: []
    })
    return {
      success: true,
      data: data
    }
  }
}

export const funcionarioService = new FuncionarioService()
