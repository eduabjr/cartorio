import React from 'react'

/**
 * Serviço de Health Check para monitorar a saúde dos microserviços
 * Garante que o sistema continue funcionando mesmo com falhas parciais
 */

export interface ServiceHealth {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
  lastCheck: Date
  responseTime?: number
  error?: string
  retryCount: number
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy'
  services: ServiceHealth[]
  timestamp: Date
}

class HealthCheckService {
  private services: Map<string, ServiceHealth> = new Map()
  private checkInterval: NodeJS.Timeout | null = null
  private listeners: ((health: SystemHealth) => void)[] = []

  constructor() {
    this.initializeServices()
    this.startHealthChecks()
  }

  private initializeServices() {
    // Serviços críticos do sistema
    const criticalServices = [
      'auth-service',
      'user-service', 
      'api-gateway',
      'frontend',
      'database',
      'ocr-service'
    ]

    criticalServices.forEach(serviceName => {
      this.services.set(serviceName, {
        name: serviceName,
        status: 'unknown',
        lastCheck: new Date(),
        retryCount: 0
      })
    })
  }

  private async checkServiceHealth(serviceName: string): Promise<ServiceHealth> {
    const startTime = Date.now()
    
    try {
      let isHealthy = false
      let error: string | undefined

      switch (serviceName) {
        case 'frontend':
          // Frontend está saudável se o DOM está acessível
          isHealthy = typeof window !== 'undefined' && !!document
          break

        case 'auth-service':
          // Verifica se o serviço de auth está respondendo
          try {
            const response = await fetch('/api/auth/health', { 
              method: 'GET',
              timeout: 5000 
            } as any)
            isHealthy = response.ok
          } catch (err) {
            error = err instanceof Error ? err.message : 'Unknown error'
            isHealthy = false
          }
          break

        case 'user-service':
          // Verifica se o serviço de usuários está respondendo
          try {
            const response = await fetch('/api/users/health', { 
              method: 'GET',
              timeout: 5000 
            } as any)
            isHealthy = response.ok
          } catch (err) {
            error = err instanceof Error ? err.message : 'Unknown error'
            isHealthy = false
          }
          break

        case 'api-gateway':
          // Verifica se o gateway está respondendo
          try {
            const response = await fetch('/api/health', { 
              method: 'GET',
              timeout: 5000 
            } as any)
            isHealthy = response.ok
          } catch (err) {
            error = err instanceof Error ? err.message : 'Unknown error'
            isHealthy = false
          }
          break

        case 'database':
          // Verifica se o banco está acessível (através de um endpoint simples)
          try {
            const response = await fetch('/api/db/health', { 
              method: 'GET',
              timeout: 5000 
            } as any)
            isHealthy = response.ok
          } catch (err) {
            error = err instanceof Error ? err.message : 'Unknown error'
            isHealthy = false
          }
          break

        case 'ocr-service':
          // Verifica se o serviço OCR está disponível
          try {
            const response = await fetch('/api/ocr/health', { 
              method: 'GET',
              timeout: 5000 
            } as any)
            isHealthy = response.ok
          } catch (err) {
            error = err instanceof Error ? err.message : 'Unknown error'
            isHealthy = false
          }
          break

        default:
          isHealthy = true // Serviços não críticos são considerados saudáveis por padrão
      }

      const responseTime = Date.now() - startTime
      const currentService = this.services.get(serviceName)!

      return {
        ...currentService,
        status: isHealthy ? 'healthy' : 'unhealthy',
        lastCheck: new Date(),
        responseTime,
        error,
        retryCount: isHealthy ? 0 : currentService.retryCount + 1
      }

    } catch (error) {
      const responseTime = Date.now() - startTime
      const currentService = this.services.get(serviceName)!

      return {
        ...currentService,
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: currentService.retryCount + 1
      }
    }
  }

  private async performHealthChecks() {
    const healthChecks = Array.from(this.services.keys()).map(serviceName => 
      this.checkServiceHealth(serviceName)
    )

    const results = await Promise.allSettled(healthChecks)
    
    results.forEach((result, index) => {
      const serviceName = Array.from(this.services.keys())[index]
      
      if (result.status === 'fulfilled') {
        this.services.set(serviceName, result.value)
      } else {
        // Se a verificação falhou, marca como unhealthy
        const currentService = this.services.get(serviceName)!
        this.services.set(serviceName, {
          ...currentService,
          status: 'unhealthy',
          lastCheck: new Date(),
          error: result.reason?.message || 'Health check failed',
          retryCount: currentService.retryCount + 1
        })
      }
    })

    this.notifyListeners()
  }

  private startHealthChecks() {
    // Verificação inicial
    this.performHealthChecks()

    // Verificações periódicas a cada 30 segundos
    this.checkInterval = setInterval(() => {
      this.performHealthChecks()
    }, 30000)
  }

  private notifyListeners() {
    const systemHealth = this.getSystemHealth()
    this.listeners.forEach(listener => {
      try {
        listener(systemHealth)
      } catch (error) {
        console.error('Erro ao notificar listener de health check:', error)
      }
    })
  }

  public getSystemHealth(): SystemHealth {
    const services = Array.from(this.services.values())
    
    // Determina o status geral do sistema
    const unhealthyServices = services.filter(s => s.status === 'unhealthy')
    const degradedServices = services.filter(s => s.status === 'degraded')
    
    let overall: 'healthy' | 'degraded' | 'unhealthy'
    
    if (unhealthyServices.length === 0 && degradedServices.length === 0) {
      overall = 'healthy'
    } else if (unhealthyServices.length <= 2) { // Tolerância para até 2 serviços unhealthy
      overall = 'degraded'
    } else {
      overall = 'unhealthy'
    }

    return {
      overall,
      services,
      timestamp: new Date()
    }
  }

  public getServiceHealth(serviceName: string): ServiceHealth | undefined {
    return this.services.get(serviceName)
  }

  public subscribe(listener: (health: SystemHealth) => void) {
    this.listeners.push(listener)
    
    // Retorna função para unsubscribe
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  public isServiceHealthy(serviceName: string): boolean {
    const service = this.services.get(serviceName)
    return service?.status === 'healthy'
  }

  public isSystemHealthy(): boolean {
    const health = this.getSystemHealth()
    return health.overall === 'healthy' || health.overall === 'degraded'
  }

  public destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    this.listeners = []
  }
}

// Instância singleton
export const healthCheckService = new HealthCheckService()

// Hook para usar em componentes React
export const useSystemHealth = () => {
  const [systemHealth, setSystemHealth] = React.useState<SystemHealth>(
    healthCheckService.getSystemHealth()
  )

  React.useEffect(() => {
    const unsubscribe = healthCheckService.subscribe(setSystemHealth)
    return unsubscribe
  }, [])

  return {
    systemHealth,
    isHealthy: healthCheckService.isSystemHealthy(),
    isServiceHealthy: healthCheckService.isServiceHealthy.bind(healthCheckService)
  }
}
