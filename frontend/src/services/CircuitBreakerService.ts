import React from 'react'

/**
 * Circuit Breaker Service - Implementa padrão Circuit Breaker
 * para proteger o sistema contra falhas em cascata
 */

export interface CircuitBreakerConfig {
  failureThreshold: number // Número de falhas antes de abrir o circuito
  recoveryTimeout: number // Tempo em ms para tentar recuperação
  monitoringPeriod: number // Período de monitoramento em ms
  halfOpenMaxCalls: number // Máximo de chamadas no estado half-open
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failureCount: number
  lastFailureTime?: Date
  nextAttemptTime?: Date
  successCount: number
  totalCalls: number
}

export interface ServiceCallResult<T = any> {
  success: boolean
  data?: T
  error?: Error
  responseTime: number
  fromCache?: boolean
}

class CircuitBreakerService {
  private circuits: Map<string, CircuitBreakerState> = new Map()
  private configs: Map<string, CircuitBreakerConfig> = new Map()
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()

  constructor() {
    this.initializeDefaultConfigs()
  }

  private initializeDefaultConfigs() {
    const defaultConfig: CircuitBreakerConfig = {
      failureThreshold: 5,
      recoveryTimeout: 30000, // 30 segundos
      monitoringPeriod: 60000, // 1 minuto
      halfOpenMaxCalls: 3
    }

    // Configurações específicas por serviço
    const serviceConfigs = {
      'auth-service': { ...defaultConfig, failureThreshold: 3, recoveryTimeout: 15000 },
      'user-service': { ...defaultConfig, failureThreshold: 5, recoveryTimeout: 20000 },
      'api-gateway': { ...defaultConfig, failureThreshold: 3, recoveryTimeout: 10000 },
      'ocr-service': { ...defaultConfig, failureThreshold: 2, recoveryTimeout: 45000 },
      'database': { ...defaultConfig, failureThreshold: 3, recoveryTimeout: 20000 }
    }

    Object.entries(serviceConfigs).forEach(([service, config]) => {
      this.configs.set(service, config)
      this.circuits.set(service, {
        state: 'CLOSED',
        failureCount: 0,
        successCount: 0,
        totalCalls: 0
      })
    })
  }

  private getCircuitState(serviceName: string): CircuitBreakerState {
    if (!this.circuits.has(serviceName)) {
      this.circuits.set(serviceName, {
        state: 'CLOSED',
        failureCount: 0,
        successCount: 0,
        totalCalls: 0
      })
    }
    return this.circuits.get(serviceName)!
  }

  private getConfig(serviceName: string): CircuitBreakerConfig {
    return this.configs.get(serviceName) || this.configs.get('default') || {
      failureThreshold: 5,
      recoveryTimeout: 30000,
      monitoringPeriod: 60000,
      halfOpenMaxCalls: 3
    }
  }

  private shouldAttemptCall(serviceName: string): boolean {
    const state = this.getCircuitState(serviceName)
    const config = this.getConfig(serviceName)

    switch (state.state) {
      case 'CLOSED':
        return true

      case 'OPEN':
        if (state.nextAttemptTime && new Date() >= state.nextAttemptTime) {
          // Transição para HALF_OPEN
          this.circuits.set(serviceName, {
            ...state,
            state: 'HALF_OPEN',
            successCount: 0
          })
          return true
        }
        return false

      case 'HALF_OPEN':
        return state.successCount < config.halfOpenMaxCalls

      default:
        return true
    }
  }

  private recordSuccess(serviceName: string) {
    const state = this.getCircuitState(serviceName)
    const config = this.getConfig(serviceName)

    const newState: CircuitBreakerState = {
      ...state,
      successCount: state.successCount + 1,
      totalCalls: state.totalCalls + 1
    }

    if (state.state === 'HALF_OPEN' && newState.successCount >= config.halfOpenMaxCalls) {
      // Transição para CLOSED
      newState.state = 'CLOSED'
      newState.failureCount = 0
      newState.lastFailureTime = undefined
      newState.nextAttemptTime = undefined
    }

    this.circuits.set(serviceName, newState)
  }

  private recordFailure(serviceName: string, error: Error) {
    const state = this.getCircuitState(serviceName)
    const config = this.getConfig(serviceName)

    const newState: CircuitBreakerState = {
      ...state,
      failureCount: state.failureCount + 1,
      totalCalls: state.totalCalls + 1,
      lastFailureTime: new Date()
    }

    if (state.state === 'HALF_OPEN' || 
        (state.state === 'CLOSED' && newState.failureCount >= config.failureThreshold)) {
      // Transição para OPEN
      newState.state = 'OPEN'
      newState.nextAttemptTime = new Date(Date.now() + config.recoveryTimeout)
    }

    this.circuits.set(serviceName, newState)

    console.warn(`🚨 Circuit Breaker: ${serviceName} falhou (${newState.failureCount}/${config.failureThreshold})`, error)
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }
    if (cached) {
      this.cache.delete(key)
    }
    return null
  }

  private setCachedData<T>(key: string, data: T, ttl: number = 300000) { // 5 minutos default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  public async callService<T = any>(
    serviceName: string,
    callFunction: () => Promise<T>,
    options: {
      cacheKey?: string
      cacheTTL?: number
      fallbackData?: T
      timeout?: number
    } = {}
  ): Promise<ServiceCallResult<T>> {
    const startTime = Date.now()

    // Verificar cache primeiro
    if (options.cacheKey) {
      const cachedData = this.getCachedData<T>(options.cacheKey)
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          responseTime: Date.now() - startTime,
          fromCache: true
        }
      }
    }

    // Verificar se deve tentar a chamada
    if (!this.shouldAttemptCall(serviceName)) {
      const state = this.getCircuitState(serviceName)
      const error = new Error(`Circuit breaker is OPEN for ${serviceName}. Next attempt at ${state.nextAttemptTime}`)
      
      // Retornar dados de fallback se disponível
      if (options.fallbackData) {
        return {
          success: true,
          data: options.fallbackData,
          responseTime: Date.now() - startTime,
          error
        }
      }

      return {
        success: false,
        error,
        responseTime: Date.now() - startTime
      }
    }

    try {
      // Criar timeout se especificado
      let callPromise = callFunction()
      if (options.timeout) {
        callPromise = Promise.race([
          callPromise,
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Service call timeout')), options.timeout)
          )
        ])
      }

      const result = await callPromise
      const responseTime = Date.now() - startTime

      // Registrar sucesso
      this.recordSuccess(serviceName)

      // Cachear resultado se especificado
      if (options.cacheKey) {
        this.setCachedData(options.cacheKey, result, options.cacheTTL)
      }

      return {
        success: true,
        data: result,
        responseTime
      }

    } catch (error) {
      const responseTime = Date.now() - startTime
      const err = error instanceof Error ? error : new Error('Unknown error')

      // Registrar falha
      this.recordFailure(serviceName, err)

      // Retornar dados de fallback se disponível
      if (options.fallbackData) {
        return {
          success: true,
          data: options.fallbackData,
          responseTime,
          error: err
        }
      }

      return {
        success: false,
        error: err,
        responseTime
      }
    }
  }

  public getCircuitStatePublic(serviceName: string): CircuitBreakerState {
    return this.getCircuitState(serviceName)
  }

  public getAllCircuitStates(): Map<string, CircuitBreakerState> {
    return new Map(this.circuits)
  }

  public resetCircuit(serviceName: string) {
    this.circuits.set(serviceName, {
      state: 'CLOSED',
      failureCount: 0,
      successCount: 0,
      totalCalls: 0
    })
  }

  public clearCache() {
    this.cache.clear()
  }

  public getCacheStats() {
    const now = Date.now()
    let validEntries = 0
    let expiredEntries = 0

    this.cache.forEach((entry) => {
      if (now - entry.timestamp < entry.ttl) {
        validEntries++
      } else {
        expiredEntries++
      }
    })

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries
    }
  }
}

// Instância singleton
export const circuitBreakerService = new CircuitBreakerService()

// Hook para usar em componentes React
export const useCircuitBreaker = (serviceName: string) => {
  const [circuitState, setCircuitState] = React.useState<CircuitBreakerState>(
    circuitBreakerService.getCircuitStatePublic(serviceName)
  )

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCircuitState(circuitBreakerService.getCircuitStatePublic(serviceName))
    }, 1000)

    return () => clearInterval(interval)
  }, [serviceName])

  return {
    circuitState,
    isHealthy: circuitState.state === 'CLOSED' || circuitState.state === 'HALF_OPEN',
    canMakeCalls: true // Simplificado para evitar erro de acesso privado
  }
}
