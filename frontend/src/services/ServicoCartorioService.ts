import { apiService } from './ApiService'

/**
 * Interface para Serviço de Cartório
 */
export interface ServicoCartorio {
  id?: string
  naturezaId?: string
  codigoServico: string
  descricao: string
  aoOficial: number  // Valor base (83,3333%)
  iss?: number        // ISS 2,0% (calculado)
  aSecFaz?: number    // A SEC. FAZ. 16,6667% (calculado)
  total?: number      // Total (calculado)
  tipoServico?: 'NASCIMENTO' | 'CASAMENTO' | 'OBITO' | 'DIVERSOS' | 'CERTIDAO' | 'RECONHECIMENTO' | 'AVERBACAO' | 'OUTROS'
  unidadeReferencia?: string
  observacoes?: string
  ativo?: boolean
  criadoEm?: string
  atualizadoEm?: string
}

class ServicoCartorioService {
  /**
   * Lista todos os serviços com busca opcional
   */
  async listar(search?: string, naturezaId?: string): Promise<ServicoCartorio[]> {
    let endpoint = '/servicos-cartorio'
    const params = new URLSearchParams()
    
    if (search) params.append('search', search)
    if (naturezaId) params.append('naturezaId', naturezaId)
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`
    }

    return apiService.get<ServicoCartorio[]>(endpoint, {
      fallback: []
    })
  }

  /**
   * Busca um serviço por ID
   */
  async buscarPorId(id: string): Promise<ServicoCartorio> {
    return apiService.get<ServicoCartorio>(`/servicos-cartorio/${id}`)
  }

  /**
   * Busca um serviço por código
   */
  async buscarPorCodigo(codigo: string): Promise<ServicoCartorio> {
    return apiService.get<ServicoCartorio>(`/servicos-cartorio/codigo/${codigo}`)
  }

  /**
   * Cria um novo serviço
   */
  async criar(data: ServicoCartorio): Promise<ServicoCartorio> {
    return apiService.post<ServicoCartorio>('/servicos-cartorio', data)
  }

  /**
   * Atualiza um serviço existente
   */
  async atualizar(id: string, data: Partial<ServicoCartorio>): Promise<ServicoCartorio> {
    return apiService.put<ServicoCartorio>(`/servicos-cartorio/${id}`, data)
  }

  /**
   * Remove um serviço
   */
  async remover(id: string): Promise<void> {
    return apiService.delete<void>(`/servicos-cartorio/${id}`)
  }

  /**
   * Busca serviços ativos
   */
  async listarAtivos(): Promise<ServicoCartorio[]> {
    return apiService.get<ServicoCartorio[]>('/servicos-cartorio/ativos', {
      fallback: []
    })
  }

  /**
   * Busca serviços por natureza
   */
  async listarPorNatureza(naturezaId: string): Promise<ServicoCartorio[]> {
    return apiService.get<ServicoCartorio[]>(`/servicos-cartorio/natureza/${naturezaId}`, {
      fallback: []
    })
  }

  /**
   * Calcula valores do serviço conforme tabela de custas
   * Baseado no valor AO OFICIAL:
   * - ISS = AO OFICIAL × 2%
   * - A SEC. FAZ. = AO OFICIAL × 16,6667%
   * - TOTAL = AO OFICIAL + ISS + A SEC. FAZ.
   */
  calcularValores(aoOficial: number): {
    iss: number
    aSecFaz: number
    total: number
  } {
    const iss = aoOficial * 0.02  // 2%
    const aSecFaz = aoOficial * 0.166667  // 16,6667%
    const total = aoOficial + iss + aSecFaz

    return {
      iss: Number(iss.toFixed(2)),
      aSecFaz: Number(aSecFaz.toFixed(2)),
      total: Number(total.toFixed(2))
    }
  }
}

export const servicoCartorioService = new ServicoCartorioService()

