import { apiService } from './ApiService'

/**
 * Interface para Natureza de Serviços
 */
export interface Natureza {
  id?: string
  codigo: string
  descricao: string
  percentualIss: number
  ativo?: boolean
  observacoes?: string
  tabelaUrl?: string
  criadoEm?: string
  atualizadoEm?: string
}

class NaturezaService {
  private STORAGE_KEY = 'cartorio_naturezas'

  /**
   * Busca dados do localStorage
   */
  private getFromStorage(): Natureza[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Erro ao ler localStorage:', error)
      return []
    }
  }

  /**
   * Salva dados no localStorage
   */
  private saveToStorage(naturezas: Natureza[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(naturezas))
      console.log('✅ Dados salvos no localStorage')
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error)
    }
  }

  /**
   * Lista todas as naturezas com busca opcional
   * USANDO APENAS LOCALSTORAGE - SEM API
   */
  async listar(search?: string): Promise<Natureza[]> {
    console.log('📦 Carregando do localStorage...')
    const dados = this.getFromStorage()
    console.log('📦 Dados encontrados no localStorage:', dados)
    console.log('📦 Total:', dados.length)
    
    if (search) {
      const filtrados = dados.filter(n => 
        n.codigo.toLowerCase().includes(search.toLowerCase()) ||
        n.descricao.toLowerCase().includes(search.toLowerCase())
      )
      console.log('🔍 Filtrados:', filtrados)
      return filtrados
    }
    
    return dados
  }

  /**
   * Busca uma natureza por ID
   * USANDO APENAS LOCALSTORAGE - SEM API
   */
  async buscarPorId(id: string): Promise<Natureza> {
    const naturezas = this.getFromStorage()
    const natureza = naturezas.find(n => n.id === id)
    if (!natureza) {
      throw new Error('Natureza não encontrada')
    }
    return natureza
  }

  /**
   * Busca uma natureza por código
   * USANDO APENAS LOCALSTORAGE - SEM API
   */
  async buscarPorCodigo(codigo: string): Promise<Natureza> {
    const naturezas = this.getFromStorage()
    const natureza = naturezas.find(n => n.codigo === codigo)
    if (!natureza) {
      throw new Error('Natureza não encontrada')
    }
    return natureza
  }

  /**
   * Cria uma nova natureza
   * USANDO APENAS LOCALSTORAGE - SEM API
   */
  async criar(data: Natureza): Promise<Natureza> {
    console.log('💾 Salvando no localStorage...', data)
    const naturezas = this.getFromStorage()
    console.log('📦 Naturezas existentes:', naturezas.length)
    
    const novaNatureza: Natureza = {
      ...data,
      id: `local-${Date.now()}-${Math.random()}`,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    }
    
    naturezas.push(novaNatureza)
    console.log('📦 Salvando lista atualizada:', naturezas)
    this.saveToStorage(naturezas)
    
    // Verificar se salvou
    const verificacao = this.getFromStorage()
    console.log('✅ Verificação pós-save:', verificacao.length)
    
    return novaNatureza
  }

  /**
   * Atualiza uma natureza existente
   * USANDO APENAS LOCALSTORAGE - SEM API
   */
  async atualizar(id: string, data: Partial<Natureza>): Promise<Natureza> {
    console.log('🔄 Atualizando no localStorage...', id, data)
    const naturezas = this.getFromStorage()
    const index = naturezas.findIndex(n => n.id === id)
    
    if (index !== -1) {
      naturezas[index] = {
        ...naturezas[index],
        ...data,
        atualizadoEm: new Date().toISOString()
      }
      this.saveToStorage(naturezas)
      console.log('✅ Natureza atualizada no localStorage')
      return naturezas[index]
    }
    
    throw new Error('Natureza não encontrada')
  }

  /**
   * Remove uma natureza
   * USANDO APENAS LOCALSTORAGE - SEM API
   */
  async remover(id: string): Promise<void> {
    console.log('🗑️ Removendo do localStorage...', id)
    const naturezas = this.getFromStorage()
    const novaLista = naturezas.filter(n => n.id !== id)
    this.saveToStorage(novaLista)
    console.log('✅ Natureza removida do localStorage')
  }

  /**
   * Busca naturezas ativas
   * USANDO APENAS LOCALSTORAGE - SEM API
   */
  async listarAtivas(): Promise<Natureza[]> {
    const todas = this.getFromStorage()
    return todas.filter(n => n.ativo !== false)
  }
}

export const naturezaService = new NaturezaService()

