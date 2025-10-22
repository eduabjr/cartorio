/**
 * Serviço de Protocolos - Integração com microserviço
 * Utiliza o ApiService para comunicação resiliente
 */

import { apiService } from './ApiService'

export interface Protocolo {
  id?: string
  numero: string
  data?: string
  tipo: string // lancamento, baixa, cancelamento
  status?: string // ativo, baixado, cancelado
  descricao?: string
  valor?: number
  natureza?: string
  complementoAto?: string
  comparecente?: string
  numeroDocumento?: string
  telefone?: string
  parteA?: string
  parteB?: string
  responsavel?: string
  previsaoEntrega?: string
  termo?: string
  livro?: string
  folhas?: string
  quantidade?: number
  analfabetos?: number
  totalAtos?: number
  outrosServicos?: number
  total?: number
  totalPago?: number
  reciboNome?: string
  reciboNumero?: string
  fichaBalcao?: string
}

class ProtocoloService {
  /**
   * Lista todos os protocolos com filtros opcionais
   */
  async listar(filters?: { tipo?: string; status?: string }): Promise<Protocolo[]> {
    const params = new URLSearchParams()
    if (filters?.tipo) params.append('tipo', filters.tipo)
    if (filters?.status) params.append('status', filters.status)

    const queryString = params.toString()
    const endpoint = `/protocolos${queryString ? `?${queryString}` : ''}`

    return apiService.get<Protocolo[]>(endpoint, {
      // Dados de fallback caso o serviço esteja indisponível
      fallback: [
        {
          id: '1',
          numero: 'PROT-2024-001',
          data: '2024-01-15',
          tipo: 'lancamento',
          status: 'ativo',
          descricao: 'Protocolo de lançamento de documento (OFFLINE)',
          valor: 150.00
        }
      ]
    })
  }

  /**
   * Busca um protocolo por ID
   */
  async buscarPorId(id: string): Promise<Protocolo> {
    return apiService.get<Protocolo>(`/protocolos/${id}`)
  }

  /**
   * Cria um novo protocolo
   */
  async criar(data: Protocolo): Promise<Protocolo> {
    return apiService.post<Protocolo>('/protocolos', data)
  }

  /**
   * Atualiza um protocolo existente
   */
  async atualizar(id: string, data: Partial<Protocolo>): Promise<Protocolo> {
    return apiService.put<Protocolo>(`/protocolos/${id}`, data)
  }

  /**
   * Remove um protocolo
   */
  async remover(id: string): Promise<void> {
    return apiService.delete<void>(`/protocolos/${id}`)
  }

  /**
   * Baixa um protocolo (marca como baixado)
   */
  async baixar(id: string): Promise<Protocolo> {
    return apiService.post<Protocolo>(`/protocolos/${id}/baixar`)
  }

  /**
   * Cancela um protocolo
   */
  async cancelar(id: string): Promise<Protocolo> {
    return apiService.post<Protocolo>(`/protocolos/${id}/cancelar`)
  }

  /**
   * Obtém o histórico de um protocolo
   */
  async obterHistorico(id: string): Promise<any[]> {
    return apiService.get<any[]>(`/protocolos/${id}/historico`, {
      fallback: []
    })
  }
}

export const protocoloService = new ProtocoloService()
export default protocoloService

