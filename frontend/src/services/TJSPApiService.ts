/**
 * Serviço para integração com a API do TJSP (Tribunal de Justiça de São Paulo)
 * Gerencia autenticação, consultas e operações relacionadas aos selos digitais
 */

export interface TJSPAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

export interface TJSPSealData {
  id: string
  dataCadastro: string
  seloDigital: string
  cns: string
  naturezaAto: string
  anoAto: string
  digito: string
  cia: string
  qrCode: string
  status: 'ATIVO' | 'INATIVO' | 'CANCELADO'
  dataValidade?: string
  observacoes?: string
}

export interface TJSPApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface TJSPConfig {
  baseUrl: string
  clientId: string
  clientSecret: string
  environment: 'sandbox' | 'production'
}

class TJSPApiService {
  private config: TJSPConfig
  private accessToken: string | null = null
  private tokenExpiry: number | null = null

  constructor(config: TJSPConfig) {
    this.config = config
  }

  /**
   * Autentica com a API do TJSP usando OAuth 2.0
   */
  async authenticate(): Promise<TJSPApiResponse<TJSPAuthResponse>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          scope: 'selos_digitais'
        })
      })

      if (!response.ok) {
        throw new Error(`Erro na autenticação: ${response.status} ${response.statusText}`)
      }

      const authData: TJSPAuthResponse = await response.json()
      
      this.accessToken = authData.access_token
      this.tokenExpiry = Date.now() + (authData.expires_in * 1000)

      console.log('✅ Autenticação TJSP realizada com sucesso')
      
      return {
        success: true,
        data: authData
      }
    } catch (error) {
      console.error('❌ Erro na autenticação TJSP:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na autenticação'
      }
    }
  }

  /**
   * Verifica se o token está válido e renova se necessário
   */
  private async ensureValidToken(): Promise<boolean> {
    if (!this.accessToken || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
      const authResult = await this.authenticate()
      return authResult.success
    }
    return true
  }

  /**
   * Busca selos digitais do TJSP
   */
  async buscarSelosDigitais(filtros?: {
    cns?: string
    naturezaAto?: string
    anoAto?: string
    status?: string
    dataInicio?: string
    dataFim?: string
  }): Promise<TJSPApiResponse<TJSPSealData[]>> {
    try {
      const tokenValid = await this.ensureValidToken()
      if (!tokenValid) {
        throw new Error('Falha na autenticação')
      }

      const queryParams = new URLSearchParams()
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value) queryParams.append(key, value)
        })
      }

      const response = await fetch(`${this.config.baseUrl}/api/v1/selos-digitais?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro na consulta: ${response.status} ${response.statusText}`)
      }

      const data: TJSPSealData[] = await response.json()

      console.log(`✅ ${data.length} selos digitais encontrados no TJSP`)
      
      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('❌ Erro ao buscar selos digitais:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na consulta'
      }
    }
  }

  /**
   * Consulta um selo digital específico por ID
   */
  async consultarSeloDigital(id: string): Promise<TJSPApiResponse<TJSPSealData>> {
    try {
      const tokenValid = await this.ensureValidToken()
      if (!tokenValid) {
        throw new Error('Falha na autenticação')
      }

      const response = await fetch(`${this.config.baseUrl}/api/v1/selos-digitais/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro na consulta: ${response.status} ${response.statusText}`)
      }

      const data: TJSPSealData = await response.json()

      console.log(`✅ Selo digital ${id} consultado com sucesso`)
      
      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('❌ Erro ao consultar selo digital:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na consulta'
      }
    }
  }

  /**
   * Cancela um selo digital no TJSP
   */
  async cancelarSeloDigital(id: string, motivo: string): Promise<TJSPApiResponse<boolean>> {
    try {
      const tokenValid = await this.ensureValidToken()
      if (!tokenValid) {
        throw new Error('Falha na autenticação')
      }

      const response = await fetch(`${this.config.baseUrl}/api/v1/selos-digitais/${id}/cancelar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          motivo,
          dataCancelamento: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`Erro no cancelamento: ${response.status} ${response.statusText}`)
      }

      console.log(`✅ Selo digital ${id} cancelado com sucesso no TJSP`)
      
      return {
        success: true,
        data: true,
        message: 'Selo digital cancelado com sucesso'
      }
    } catch (error) {
      console.error('❌ Erro ao cancelar selo digital:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no cancelamento'
      }
    }
  }

  /**
   * Valida um selo digital
   */
  async validarSeloDigital(seloDigital: string): Promise<TJSPApiResponse<TJSPSealData>> {
    try {
      const tokenValid = await this.ensureValidToken()
      if (!tokenValid) {
        throw new Error('Falha na autenticação')
      }

      const response = await fetch(`${this.config.baseUrl}/api/v1/selos-digitais/validar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          seloDigital
        })
      })

      if (!response.ok) {
        throw new Error(`Erro na validação: ${response.status} ${response.statusText}`)
      }

      const data: TJSPSealData = await response.json()

      console.log(`✅ Selo digital ${seloDigital} validado com sucesso`)
      
      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('❌ Erro ao validar selo digital:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na validação'
      }
    }
  }

  /**
   * Gera QR Code para um selo digital
   */
  async gerarQRCode(seloDigital: string): Promise<TJSPApiResponse<string>> {
    try {
      const tokenValid = await this.ensureValidToken()
      if (!tokenValid) {
        throw new Error('Falha na autenticação')
      }

      const response = await fetch(`${this.config.baseUrl}/api/v1/selos-digitais/qr-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          seloDigital
        })
      })

      if (!response.ok) {
        throw new Error(`Erro na geração do QR Code: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      console.log(`✅ QR Code gerado para selo ${seloDigital}`)
      
      return {
        success: true,
        data: data.qrCode
      }
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na geração do QR Code'
      }
    }
  }

  /**
   * Obtém estatísticas dos selos digitais
   */
  async obterEstatisticas(): Promise<TJSPApiResponse<{
    total: number
    ativos: number
    cancelados: number
    expirados: number
  }>> {
    try {
      const tokenValid = await this.ensureValidToken()
      if (!tokenValid) {
        throw new Error('Falha na autenticação')
      }

      const response = await fetch(`${this.config.baseUrl}/api/v1/selos-digitais/estatisticas`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro na consulta de estatísticas: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      console.log('✅ Estatísticas obtidas com sucesso')
      
      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na consulta de estatísticas'
      }
    }
  }
}

// Configuração padrão para desenvolvimento
const defaultConfig: TJSPConfig = {
  baseUrl: process.env.REACT_APP_TJSP_API_URL || 'https://api-sandbox.tjsp.jus.br',
  clientId: process.env.REACT_APP_TJSP_CLIENT_ID || '',
  clientSecret: process.env.REACT_APP_TJSP_CLIENT_SECRET || '',
  environment: (process.env.REACT_APP_TJSP_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
}

// Instância singleton do serviço
export const tjspApiService = new TJSPApiService(defaultConfig)

export default TJSPApiService
