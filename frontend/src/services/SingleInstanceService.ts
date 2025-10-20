import React from 'react'

/**
 * Serviço para gerenciar instâncias únicas de telas
 * Garante que cada tela só possa ter uma instância aberta por vez
 */

export interface WindowInstance {
  id: string
  type: string
  component: React.ComponentType<any>
  props: any
  isOpen: boolean
  lastOpened: Date
  refreshCount: number
}

class SingleInstanceService {
  private instances: Map<string, WindowInstance> = new Map()
  private listeners: ((instances: Map<string, WindowInstance>) => void)[] = []

  /**
   * Tenta abrir uma nova instância de uma tela
   * Se já existe, fecha a primeira e reabre na posição original
   */
  public openOrRefresh(
    type: string, 
    component: React.ComponentType<any>, 
    props: any = {}
  ): { action: 'open' | 'refresh'; instance: WindowInstance } {
    const existingInstance = this.instances.get(type)
    
    if (existingInstance && existingInstance.isOpen) {
      // Tela já está aberta - fechar a primeira e reabrir na posição original
      console.log(`🔄 Tela ${type} já está aberta, fechando e reabrindo na posição original...`)
      
      // Fechar a instância existente
      const closedInstance: WindowInstance = {
        ...existingInstance,
        isOpen: false
      }
      this.instances.set(type, closedInstance)
      
      // Criar nova instância na posição original
      const newInstance: WindowInstance = {
        id: `${type}-${Date.now()}`,
        type,
        component,
        props: { 
          ...props, 
          refreshTrigger: Date.now(),
          resetToOriginalPosition: true // Flag para indicar que deve voltar à posição original
        },
        isOpen: true,
        lastOpened: new Date(),
        refreshCount: existingInstance.refreshCount + 1
      }
      
      this.instances.set(type, newInstance)
      this.notifyListeners()
      
      return { action: 'open', instance: newInstance }
    } else {
      // Nova instância
      console.log(`🆕 Abrindo nova instância da tela ${type}...`)
      
      const newInstance: WindowInstance = {
        id: `${type}-${Date.now()}`,
        type,
        component,
        props: { ...props, refreshTrigger: Date.now() },
        isOpen: true,
        lastOpened: new Date(),
        refreshCount: 0
      }
      
      this.instances.set(type, newInstance)
      this.notifyListeners()
      
      return { action: 'open', instance: newInstance }
    }
  }

  /**
   * Fecha uma instância de tela
   */
  public close(type: string): void {
    const instance = this.instances.get(type)
    if (instance) {
      console.log(`❌ Fechando tela ${type}...`)
      
      const updatedInstance: WindowInstance = {
        ...instance,
        isOpen: false
      }
      
      this.instances.set(type, updatedInstance)
      this.notifyListeners()
    }
  }

  /**
   * Força o refresh de uma tela específica
   */
  public forceRefresh(type: string, newProps: any = {}): void {
    const instance = this.instances.get(type)
    if (instance && instance.isOpen) {
      console.log(`🔄 Forçando refresh da tela ${type}...`)
      
      const updatedInstance: WindowInstance = {
        ...instance,
        lastOpened: new Date(),
        refreshCount: instance.refreshCount + 1,
        props: { 
          ...instance.props, 
          ...newProps, 
          refreshTrigger: Date.now(),
          forceRefresh: true 
        }
      }
      
      this.instances.set(type, updatedInstance)
      this.notifyListeners()
    }
  }

  /**
   * Verifica se uma tela está aberta
   */
  public isOpen(type: string): boolean {
    const instance = this.instances.get(type)
    return instance ? instance.isOpen : false
  }

  /**
   * Obtém uma instância específica
   */
  public getInstance(type: string): WindowInstance | undefined {
    return this.instances.get(type)
  }

  /**
   * Obtém todas as instâncias abertas
   */
  public getOpenInstances(): WindowInstance[] {
    return Array.from(this.instances.values()).filter(instance => instance.isOpen)
  }

  /**
   * Obtém todas as instâncias (abertas e fechadas)
   */
  public getAllInstances(): Map<string, WindowInstance> {
    return new Map(this.instances)
  }

  /**
   * Fecha todas as instâncias
   */
  public closeAll(): void {
    console.log('❌ Fechando todas as telas...')
    
    this.instances.forEach((instance, type) => {
      if (instance.isOpen) {
        this.instances.set(type, { ...instance, isOpen: false })
      }
    })
    
    this.notifyListeners()
  }

  /**
   * Limpa instâncias fechadas (garbage collection)
   */
  public cleanup(): void {
    const now = Date.now()
    const maxAge = 5 * 60 * 1000 // 5 minutos
    
    this.instances.forEach((instance, type) => {
      if (!instance.isOpen && (now - instance.lastOpened.getTime()) > maxAge) {
        console.log(`🗑️ Removendo instância antiga da tela ${type}...`)
        this.instances.delete(type)
      }
    })
    
    this.notifyListeners()
  }

  /**
   * Inscreve-se para receber notificações de mudanças
   */
  public subscribe(listener: (instances: Map<string, WindowInstance>) => void): () => void {
    this.listeners.push(listener)
    
    // Retorna função para unsubscribe
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * Notifica todos os listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(new Map(this.instances))
      } catch (error) {
        console.error('Erro ao notificar listener do SingleInstanceService:', error)
      }
    })
  }

  /**
   * Obtém estatísticas das instâncias
   */
  public getStats(): {
    total: number
    open: number
    closed: number
    totalRefreshes: number
  } {
    const instances = Array.from(this.instances.values())
    
    return {
      total: instances.length,
      open: instances.filter(i => i.isOpen).length,
      closed: instances.filter(i => !i.isOpen).length,
      totalRefreshes: instances.reduce((sum, i) => sum + i.refreshCount, 0)
    }
  }
}

// Instância singleton
export const singleInstanceService = new SingleInstanceService()

// Hook para usar em componentes React
export const useSingleInstance = (type: string) => {
  const [instance, setInstance] = React.useState<WindowInstance | undefined>(
    singleInstanceService.getInstance(type)
  )
  const [isOpen, setIsOpen] = React.useState<boolean>(
    singleInstanceService.isOpen(type)
  )

  React.useEffect(() => {
    const unsubscribe = singleInstanceService.subscribe((instances) => {
      const currentInstance = instances.get(type)
      setInstance(currentInstance)
      setIsOpen(currentInstance ? currentInstance.isOpen : false)
    })

    return unsubscribe
  }, [type])

  return {
    instance,
    isOpen,
    openOrRefresh: (component: React.ComponentType<any>, props?: any) => 
      singleInstanceService.openOrRefresh(type, component, props),
    close: () => singleInstanceService.close(type),
    forceRefresh: (newProps?: any) => singleInstanceService.forceRefresh(type, newProps)
  }
}

// Auto cleanup a cada 2 minutos
setInterval(() => {
  singleInstanceService.cleanup()
}, 2 * 60 * 1000)
