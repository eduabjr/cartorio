/**
 * Serviço centralizado de API para comunicação com microserviços
 * - Implementa Circuit Breaker pattern
 * - Retry automático com backoff exponencial
 * - Fallback para dados em cache/offline
 * - Logging e monitoramento
 */

interface CircuitBreakerState {
  failures: number
  lastFailureTime: number
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
}

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint: string
  data?: any
  params?: Record<string, string>
  headers?: Record<string, string>
  retry?: number
  timeout?: number
  fallback?: any
}

class ApiService {
  private baseURL: string
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map()
  private readonly FAILURE_THRESHOLD = 5
  private readonly TIMEOUT_THRESHOLD = 30000 // 30 segundos
  private readonly RETRY_ATTEMPTS = 3
  private readonly RETRY_DELAY = 1000 // 1 segundo

  constructor() {
    // API Gateway como ponto único de entrada
    this.baseURL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000'
  }

  /**
   * Verifica o estado do Circuit Breaker para um serviço
   */
  private getCircuitState(serviceName: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, {
        failures: 0,
        lastFailureTime: 0,
        state: 'CLOSED'
      })
    }
    return this.circuitBreakers.get(serviceName)!
  }

  /**
   * Atualiza o estado do Circuit Breaker
   */
  private updateCircuitState(serviceName: string, success: boolean) {
    const circuit = this.getCircuitState(serviceName)
    
    if (success) {
      circuit.failures = 0
      circuit.state = 'CLOSED'
    } else {
      circuit.failures++
      circuit.lastFailureTime = Date.now()
      
      if (circuit.failures >= this.FAILURE_THRESHOLD) {
        circuit.state = 'OPEN'
        console.warn(`🔴 Circuit Breaker ABERTO para ${serviceName}`)
        
        // Tenta fechar após o timeout
        setTimeout(() => {
          const currentCircuit = this.getCircuitState(serviceName)
          if (currentCircuit.state === 'OPEN') {
            currentCircuit.state = 'HALF_OPEN'
            console.log(`🟡 Circuit Breaker MEIO-ABERTO para ${serviceName}`)
          }
        }, this.TIMEOUT_THRESHOLD)
      }
    }
  }

  /**
   * Executa requisição com retry e backoff exponencial
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retries: number = this.RETRY_ATTEMPTS,
    delay: number = this.RETRY_DELAY
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (retries === 0) throw error
      
      console.log(`⚠️ Tentando novamente... (${this.RETRY_ATTEMPTS - retries + 1}/${this.RETRY_ATTEMPTS})`)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // Backoff exponencial
      return this.executeWithRetry(fn, retries - 1, delay * 2)
    }
  }

  /**
   * Método principal de requisição
   */
  async request<T>(config: RequestConfig): Promise<T> {
    const serviceName = config.endpoint.split('/')[1] || 'api'
    const circuit = this.getCircuitState(serviceName)

    // Circuit Breaker aberto - retorna fallback
    if (circuit.state === 'OPEN') {
      console.error(`❌ Circuit Breaker aberto para ${serviceName}. Usando fallback.`)
      if (config.fallback !== undefined) {
        return config.fallback as T
      }
      throw new Error(`Serviço ${serviceName} temporariamente indisponível`)
    }

    try {
      const result = await this.executeWithRetry(async () => {
        const url = `${this.baseURL}${config.endpoint}`
        const token = localStorage.getItem('token')
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...config.headers
        }
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const options: RequestInit = {
          method: config.method,
          headers,
          signal: AbortSignal.timeout(config.timeout || 10000)
        }

        if (config.data) {
          options.body = JSON.stringify(config.data)
        }

        const response = await fetch(url, options)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        return data
      }, config.retry)

      this.updateCircuitState(serviceName, true)
      return result

    } catch (error) {
      this.updateCircuitState(serviceName, false)
      
      console.error(`❌ Erro na requisição para ${serviceName}:`, error)
      
      // Retorna fallback se disponível
      if (config.fallback !== undefined) {
        console.log(`📦 Usando dados de fallback para ${serviceName}`)
        return config.fallback as T
      }
      
      throw error
    }
  }

  // Métodos de conveniência
  async get<T>(endpoint: string, options?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ method: 'GET', endpoint, ...options })
  }

  async post<T>(endpoint: string, data?: any, options?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ method: 'POST', endpoint, data, ...options })
  }

  async put<T>(endpoint: string, data?: any, options?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ method: 'PUT', endpoint, data, ...options })
  }

  async delete<T>(endpoint: string, options?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ method: 'DELETE', endpoint, ...options })
  }

  async patch<T>(endpoint: string, data?: any, options?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ method: 'PATCH', endpoint, data, ...options })
  }

  /**
   * Obtém o estado de saúde de todos os serviços
   */
  async getServicesHealth() {
    try {
      return await this.get<Record<string, any>>('/health')
    } catch (error) {
      console.error('Erro ao obter saúde dos serviços:', error)
      return {}
    }
  }

  /**
   * Reseta o Circuit Breaker de um serviço
   */
  resetCircuit(serviceName: string) {
    this.circuitBreakers.delete(serviceName)
    console.log(`🔄 Circuit Breaker resetado para ${serviceName}`)
  }

  /**
   * Obtém estatísticas dos Circuit Breakers
   */
  getCircuitStats() {
    const stats: Record<string, any> = {}
    this.circuitBreakers.forEach((circuit, service) => {
      stats[service] = {
        state: circuit.state,
        failures: circuit.failures,
        lastFailure: circuit.lastFailureTime ? new Date(circuit.lastFailureTime).toISOString() : null
      }
    })
    return stats
  }
}

// Exporta instância singleton
export const apiService = new ApiService()
export default apiService

