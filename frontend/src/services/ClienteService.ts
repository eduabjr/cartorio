/**
 * Serviço de Clientes - Integração com microserviço
 * Utiliza o ApiService para comunicação resiliente
 */

import { apiService } from './ApiService'

export interface Cliente {
  id?: string
  nome: string
  cpf?: string
  rg?: string
  telefone?: string
  email?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  observacoes?: string
  ativo?: boolean
  criadoEm?: string
  atualizadoEm?: string
}

class ClienteService {
  /**
   * Lista todos os clientes com busca opcional
   */
  async listar(search?: string): Promise<Cliente[]> {
    const endpoint = search ? `/clientes?search=${encodeURIComponent(search)}` : '/clientes'

    return apiService.get<Cliente[]>(endpoint, {
      // Dados de fallback caso o serviço esteja indisponível
      fallback: [
        {
          id: '1',
          nome: 'João Silva (OFFLINE)',
          cpf: '123.456.789-00',
          telefone: '(14) 99999-9999',
          email: 'joao@email.com',
          ativo: true
        }
      ]
    })
  }

  /**
   * Busca um cliente por ID
   */
  async buscarPorId(id: string): Promise<Cliente> {
    return apiService.get<Cliente>(`/clientes/${id}`)
  }

  /**
   * Cria um novo cliente
   */
  async criar(data: Cliente): Promise<Cliente> {
    return apiService.post<Cliente>('/clientes', data)
  }

  /**
   * Atualiza um cliente existente
   */
  async atualizar(id: string, data: Partial<Cliente>): Promise<Cliente> {
    return apiService.put<Cliente>(`/clientes/${id}`, data)
  }

  /**
   * Remove um cliente
   */
  async remover(id: string): Promise<void> {
    return apiService.delete<void>(`/clientes/${id}`)
  }
}

export const clienteService = new ClienteService()
export default clienteService

