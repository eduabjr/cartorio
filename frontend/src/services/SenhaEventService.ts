/**
 * Serviço de Comunicação em Tempo Real entre as páginas do Sistema de Senhas
 * Usa BroadcastChannel para comunicação entre abas/janelas
 */

export type SenhaEventType = 
  | 'senha_emitida'      // Nova senha criada no terminal
  | 'senha_chamada'      // Senha foi chamada por funcionário
  | 'senha_atendendo'    // Senha em atendimento
  | 'senha_finalizada'   // Atendimento finalizado
  | 'senha_cancelada'    // Senha cancelada
  | 'guiche_atualizado'  // Guichê foi modificado
  | 'config_atualizada'  // Configurações de senhas alteradas

export interface SenhaEvent {
  type: SenhaEventType
  data: any
  timestamp: number
  source?: string // Identifica qual página disparou o evento
}

class SenhaEventService {
  private channel: BroadcastChannel | null = null
  private listeners: Map<SenhaEventType, Set<(data: any) => void>> = new Map()
  private isInitialized = false

  constructor() {
    this.init()
  }

  private init() {
    if (this.isInitialized) return

    try {
      // Criar canal de broadcast para comunicação entre abas
      this.channel = new BroadcastChannel('senha-system-channel')
      
      // Escutar mensagens do canal
      this.channel.onmessage = (event: MessageEvent<SenhaEvent>) => {
        console.log('📨 BroadcastChannel recebeu:', event.data.type, event.data)
        this.handleEvent(event.data)
      }

      this.isInitialized = true
      console.log('✅ SenhaEventService inicializado com BroadcastChannel')
    } catch (error) {
      console.error('❌ Erro ao inicializar BroadcastChannel:', error)
      // Fallback: usar localStorage events APENAS se BroadcastChannel falhou
      this.setupLocalStorageFallback()
      this.isInitialized = true
    }
  }

  private setupLocalStorageFallback() {
    console.log('🔄 Configurando fallback via localStorage')
    // Fallback usando localStorage para navegadores sem BroadcastChannel
    window.addEventListener('storage', (e) => {
      // Escutar tanto senha-event quanto senha-event-{timestamp}
      if (e.key && e.key.startsWith('senha-event') && e.newValue) {
        try {
          const event: SenhaEvent = JSON.parse(e.newValue)
          console.log('📨 localStorage recebeu:', event.type, event)
          this.handleEvent(event)
        } catch (error) {
          console.error('Erro ao processar evento do localStorage:', error)
        }
      }
    })
  }

  /**
   * Enviar evento via localStorage (fallback)
   */
  private enviarViaLocalStorage(event: SenhaEvent, type: SenhaEventType) {
    try {
      const eventKey = `senha-event-${Date.now()}`
      localStorage.setItem(eventKey, JSON.stringify(event))
      console.log(`✅ Enviado via localStorage (fallback): ${type}`)
      
      // Limpar após 500ms
      setTimeout(() => {
        localStorage.removeItem(eventKey)
      }, 500)
    } catch (error) {
      console.error('❌ Erro ao enviar via localStorage:', error)
    }
  }

  /**
   * Emitir um evento para todas as abas/janelas
   */
  emit(type: SenhaEventType, data: any, source?: string) {
    const event: SenhaEvent = {
      type,
      data,
      timestamp: Date.now(),
      source: source || 'unknown'
    }

    console.log(`📤 EMITINDO evento: ${type} de ${source}`, data)

    // Enviar via BroadcastChannel (prioritário)
    if (this.channel) {
      try {
        this.channel.postMessage(event)
        console.log(`✅ Enviado APENAS via BroadcastChannel: ${type}`)
      } catch (error) {
        console.error('❌ Erro ao enviar via BroadcastChannel, tentando localStorage:', error)
        // Se BroadcastChannel falhar, usar localStorage como fallback
        this.enviarViaLocalStorage(event, type)
      }
    } else {
      // Se BroadcastChannel não estiver disponível, usar localStorage
      console.warn('⚠️ BroadcastChannel não disponível, usando localStorage')
      this.enviarViaLocalStorage(event, type)
    }

    // Também notificar listeners locais (mesma aba)
    this.handleEvent(event)
  }

  /**
   * Processar evento recebido
   */
  private handleEvent(event: SenhaEvent) {
    console.log(`🎯 handleEvent chamado para: ${event.type}`)
    console.log(`   Listeners registrados para ${event.type}:`, this.listeners.get(event.type)?.size || 0)
    
    const listeners = this.listeners.get(event.type)
    if (listeners && listeners.size > 0) {
      console.log(`   ✅ Executando ${listeners.size} listener(s)`)
      listeners.forEach(callback => {
        try {
          callback(event.data)
        } catch (error) {
          console.error(`Erro ao executar listener para ${event.type}:`, error)
        }
      })
    } else {
      console.warn(`   ⚠️ Nenhum listener registrado para ${event.type}`)
    }

    // Listeners para ALL events
    const allListeners = this.listeners.get('*' as SenhaEventType)
    if (allListeners) {
      allListeners.forEach(callback => {
        try {
          callback(event)
        } catch (error) {
          console.error('Erro ao executar listener global:', error)
        }
      })
    }
  }

  /**
   * Registrar listener para um tipo de evento
   */
  on(type: SenhaEventType | '*', callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(callback)
    
    console.log(`✅ Listener registrado para '${type}'. Total: ${this.listeners.get(type)!.size}`)

    // Retornar função para remover listener
    return () => {
      this.off(type, callback)
    }
  }

  /**
   * Remover listener
   */
  off(type: SenhaEventType | '*', callback: (data: any) => void) {
    const listeners = this.listeners.get(type)
    if (listeners) {
      listeners.delete(callback)
    }
  }

  /**
   * Limpar todos os listeners
   */
  removeAllListeners() {
    this.listeners.clear()
  }

  /**
   * Destruir serviço
   */
  destroy() {
    if (this.channel) {
      this.channel.close()
      this.channel = null
    }
    this.removeAllListeners()
    this.isInitialized = false
  }
}

// Exportar instância singleton
export const senhaEventService = new SenhaEventService()

