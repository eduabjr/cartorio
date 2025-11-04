/**
 * Serviço de integração com NVDA (NonVisual Desktop Access)
 * Fornece comunicação direta com o leitor de tela NVDA
 */

import { audioService } from './AudioService';

export interface NVDAMessage {
  type: 'announce' | 'braille' | 'status' | 'command'
  content: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  category?: 'information' | 'warning' | 'error' | 'success'
  interrupt?: boolean
}

export interface NVDACapabilities {
  speech: boolean
  braille: boolean
  keyboard: boolean
  mouse: boolean
  objectNavigation: boolean
  documentNavigation: boolean
  webNavigation: boolean
}

export interface NVDASettings {
  speechRate: number
  speechPitch: number
  speechVolume: number
  brailleDisplay: boolean
  keyboardEcho: boolean
  mouseEcho: boolean
}

class NVDAService {
  private isAvailable: boolean = false
  private capabilities: NVDACapabilities | null = null
  private settings: NVDASettings | null = null
  private messageQueue: NVDAMessage[] = []
  private isProcessing: boolean = false
  private lastAnnouncement: string = ''
  private logCount: number = 0
  private verboseLogs: boolean = false // Desabilitar logs verbosos por padrão

  constructor() {
    this.initialize()
  }

  /**
   * Inicializa o serviço NVDA
   */
  private async initialize(): Promise<void> {
    try {
      // Detectar se NVDA está disponível
      this.isAvailable = await this.detectNVDA()
      
      if (this.isAvailable) {
        // Obter capacidades do NVDA
        this.capabilities = await this.getNVDACapabilities()
        
        // Obter configurações atuais
        this.settings = await this.getNVDASettings()
        
        // Configurar listeners para mudanças
        this.setupEventListeners()
        
        console.log('NVDA Service initialized successfully')
      } else {
        console.log('NVDA not detected')
      }
    } catch (error) {
      console.error('Failed to initialize NVDA service:', error)
      this.isAvailable = false
    }
  }

  /**
   * Detecta se o NVDA está disponível
   */
  private async detectNVDA(): Promise<boolean> {
    console.log('🔍 Iniciando detecção do NVDA...')
    
    try {
      // Método 1: Verificar user agent
      const userAgent = navigator.userAgent.toLowerCase()
      console.log('🌐 User Agent:', userAgent)
      if (userAgent.includes('nvda')) {
        console.log('✅ NVDA detectado via User Agent')
        return true
      }

      // Método 2: Verificar APIs específicas do NVDA
      const hasWindowNVDA = typeof (window as any).nvda !== 'undefined'
      console.log('🪟 window.nvda existe:', hasWindowNVDA)
      if (hasWindowNVDA) {
        console.log('✅ NVDA detectado via window.nvda')
        return true
      }

      // Método 3: Verificar se há elementos com atributos específicos do NVDA
      const nvdaElements = document.querySelectorAll('[data-nvda], [aria-live="assertive"]')
      console.log('🔧 Elementos NVDA encontrados:', nvdaElements.length)
      if (nvdaElements.length > 0) {
        console.log('✅ NVDA detectado via elementos específicos')
        return true
      }

      // Método 4: Verificar se há sinais de leitor de tela ativo
      const hasScreenReader = this.detectScreenReaderSigns()
      console.log('♿ Sinais de leitor de tela:', hasScreenReader)
      if (hasScreenReader) {
        console.log('✅ Leitor de tela detectado via sinais')
        return true
      }

      // Método 5: Tentar comunicação via postMessage
      console.log('📡 Tentando comunicação via postMessage...')
      const response = await this.sendMessage({
        type: 'status',
        content: 'ping'
      })
      console.log('📡 Resposta do postMessage:', response)
      
      if (response !== null) {
        console.log('✅ NVDA detectado via postMessage')
        return true
      }

      console.log('❌ NVDA não detectado por nenhum método')
      return false
    } catch (error) {
      console.error('❌ Erro na detecção do NVDA:', error)
      return false
    }
  }

  /**
   * Detecta sinais de leitor de tela ativo
   */
  private detectScreenReaderSigns(): boolean {
    // Verificar se há APIs de síntese de voz
    const hasSpeechSynthesis = 'speechSynthesis' in window
    const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    
    // Verificar elementos ARIA
    const hasAriaElements = document.querySelectorAll('[aria-live], [aria-label], [role]').length > 0
    
    // Verificar preferências do sistema
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
    
    // Verificar se há uso intensivo de teclado (indicador de usuário de leitor de tela)
    let keyboardUsage = 0
    const trackKeyboardUsage = () => {
      keyboardUsage++
      if (keyboardUsage > 10) {
        document.removeEventListener('keydown', trackKeyboardUsage)
      }
    }
    document.addEventListener('keydown', trackKeyboardUsage)
    
    return hasSpeechSynthesis || hasSpeechRecognition || hasAriaElements || 
           (prefersReducedMotion && prefersHighContrast) || keyboardUsage > 5
  }

  /**
   * Obtém as capacidades do NVDA
   */
  private async getNVDACapabilities(): Promise<NVDACapabilities> {
    try {
      // Tentar obter capacidades via API do NVDA
      if (typeof (window as any).nvda?.getCapabilities === 'function') {
        return await (window as any).nvda.getCapabilities()
      }

      // Fallback: assumir capacidades básicas
      return {
        speech: true,
        braille: false,
        keyboard: true,
        mouse: false,
        objectNavigation: true,
        documentNavigation: true,
        webNavigation: true
      }
    } catch (error) {
      console.error('Failed to get NVDA capabilities:', error)
      return {
        speech: true,
        braille: false,
        keyboard: true,
        mouse: false,
        objectNavigation: true,
        documentNavigation: true,
        webNavigation: true
      }
    }
  }

  /**
   * Obtém as configurações atuais do NVDA
   */
  private async getNVDASettings(): Promise<NVDASettings> {
    try {
      if (typeof (window as any).nvda?.getSettings === 'function') {
        return await (window as any).nvda.getSettings()
      }

      // Fallback: configurações padrão
      return {
        speechRate: 50,
        speechPitch: 50,
        speechVolume: 50,
        brailleDisplay: false,
        keyboardEcho: true,
        mouseEcho: false
      }
    } catch (error) {
      console.error('Failed to get NVDA settings:', error)
      return {
        speechRate: 50,
        speechPitch: 50,
        speechVolume: 50,
        brailleDisplay: false,
        keyboardEcho: true,
        mouseEcho: false
      }
    }
  }

  /**
   * Configura listeners para eventos do NVDA
   */
  private setupEventListeners(): void {
    // Listener para mudanças de configurações
    window.addEventListener('nvda-settings-changed', (event: any) => {
      this.settings = event.detail
      this.notifySettingsChanged()
    })

    // Listener para comandos do NVDA
    window.addEventListener('nvda-command', (event: any) => {
      this.handleNVDACommand(event.detail)
    })

    // Listener para mudanças de foco
    document.addEventListener('focusin', (event) => {
      this.announceFocus(event.target as HTMLElement)
    })
  }

  /**
   * Envia mensagem para o NVDA
   */
  public async sendMessage(message: NVDAMessage): Promise<any> {
    if (this.verboseLogs || this.logCount++ < 3) {
      console.log('📤 NVDAService.sendMessage:', message.type)
    }
    
    if (!this.isAvailable) {
      console.log('❌ NVDA não está disponível, retornando null')
      return null
    }

    try {
      // Adicionar à fila se estiver processando
      if (this.isProcessing) {
        console.log('⏳ Adicionando mensagem à fila...')
        this.messageQueue.push(message)
        return null
      }

      this.isProcessing = true
      console.log('🔄 Processando mensagem...')

      // Tentar via API nativa do NVDA
      if (typeof (window as any).nvda?.sendMessage === 'function') {
        console.log('🪟 Tentando via API nativa do NVDA...')
        const response = await (window as any).nvda.sendMessage(message)
        console.log('✅ Resposta da API nativa:', response)
        this.processNextMessage()
        return response
      }

      // Fallback: usar postMessage
      console.log('📡 Usando postMessage como fallback...')
      const response = await this.sendViaPostMessage(message)
      console.log('✅ Resposta do postMessage:', response)
      this.processNextMessage()
      return response
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem para NVDA:', error)
      this.isProcessing = false
      return null
    }
  }

  /**
   * Envia mensagem via postMessage (fallback)
   */
  private async sendViaPostMessage(message: NVDAMessage): Promise<any> {
    console.log('📡 Iniciando sendViaPostMessage...')
    
    return new Promise((resolve) => {
      const messageId = Date.now().toString()
      console.log('🆔 ID da mensagem:', messageId)
      
      // Listener para resposta
      const handleResponse = (event: MessageEvent) => {
        if (this.verboseLogs) {
          console.log('📨 Mensagem recebida:', event.data)
        }
        if (event.data?.type === 'nvda-response' && event.data?.id === messageId) {
          console.log('✅ Resposta NVDA recebida:', event.data.result)
          window.removeEventListener('message', handleResponse)
          resolve(event.data.result)
        }
      }
      
      window.addEventListener('message', handleResponse)
      console.log('👂 Listener de mensagem adicionado')
      
      // Enviar mensagem
      const messageToSend = {
        type: 'nvda-message',
        id: messageId,
        message
      }
      console.log('📤 Enviando mensagem:', messageToSend)
      window.postMessage(messageToSend, '*')
      
      // Timeout após 3 segundos (aumentado)
      setTimeout(() => {
        if (this.verboseLogs) {
          console.log('⏰ Timeout atingido')
        }
        window.removeEventListener('message', handleResponse)
        resolve(null)
      }, 3000)
    })
  }

  /**
   * Processa próxima mensagem da fila
   */
  private processNextMessage(): void {
    this.isProcessing = false
    
    if (this.messageQueue.length > 0) {
      const nextMessage = this.messageQueue.shift()
      if (nextMessage) {
        this.sendMessage(nextMessage)
      }
    }
  }

  /**
   * Anuncia texto via NVDA
   */
  public async announce(text: string, options?: {
    priority?: 'low' | 'normal' | 'high' | 'urgent'
    interrupt?: boolean
    category?: 'information' | 'warning' | 'error' | 'success'
  }): Promise<void> {
    console.log('🔊 NVDAService.announce chamado:', text, options)
    
    if (!this.isAvailable) {
      console.log('❌ NVDA não está disponível, pulando anúncio')
      return
    }
    
    if (!text.trim()) {
      console.log('❌ Texto vazio, pulando anúncio')
      return
    }

    // Evitar anúncios duplicados
    const messageKey = `${text}-${options?.priority || 'normal'}`
    if (this.lastAnnouncement === messageKey) {
      // Silenciosamente ignorar duplicados
      return
    }
    this.lastAnnouncement = messageKey

    console.log('📤 Enviando anúncio via sendMessage...')
    try {
      await this.sendMessage({
        type: 'announce',
        content: text,
        priority: options?.priority || 'normal',
        interrupt: options?.interrupt || false,
        category: options?.category || 'information'
      })
      console.log('✅ Anúncio enviado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao enviar anúncio:', error)
    }
  }

  /**
   * Anuncia mudança de foco
   */
  private async announceFocus(element: HTMLElement): Promise<void> {
    if (!this.isAvailable) {
      return
    }

    // ⛔ IGNORAR elementos SVG e elementos com aria-hidden="true"
    if (element.tagName === 'svg' || 
        element.closest('svg') || 
        element.getAttribute('aria-hidden') === 'true' ||
        element.closest('[aria-hidden="true"]')) {
      console.log('🚫 Ignorando foco em SVG ou elemento oculto')
      return
    }

    // ⛔ IGNORAR elementos dentro do header (controles de janela)
    if (element.closest('[role="banner"]') && 
        (element.closest('[role="group"]') || element.closest('button'))) {
      console.log('🚫 Ignorando controles do header')
      return
    }

    const label = this.getElementLabel(element)
    if (label) {
      await this.announce(`Foco em: ${label}`, {
        priority: 'low',
        interrupt: false
      })
    }
  }

  /**
   * Obtém label acessível de um elemento
   */
  private getElementLabel(element: HTMLElement): string | null {
    // Tentar aria-label primeiro (PRIORIDADE MÁXIMA)
    const ariaLabel = element.getAttribute('aria-label')
    if (ariaLabel && ariaLabel.trim()) {
      return ariaLabel.trim()
    }

    // Tentar aria-labelledby
    const ariaLabelledBy = element.getAttribute('aria-labelledby')
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy)
      if (labelElement) {
        const labelText = labelElement.textContent || labelElement.innerText
        if (labelText && labelText.trim()) {
          return labelText.trim()
        }
      }
    }

    // Tentar placeholder (campos de entrada)
    const placeholder = element.getAttribute('placeholder')
    if (placeholder && placeholder.trim()) {
      return placeholder.trim()
    }

    // Tentar title
    const title = element.getAttribute('title')
    if (title && title.trim()) {
      return title.trim()
    }

    // Tentar texto do elemento (ÚLTIMA OPÇÃO, com filtros)
    let textContent = element.textContent || element.innerText
    if (textContent) {
      textContent = textContent.trim()
      
      // ⛔ FILTRAR símbolos Unicode de ícones SVG (□, ⊡, ✕, etc)
      const svgSymbols = /[\u25A1\u22A1\u2715\u2716\u2212\u2014\u2500]/g
      textContent = textContent.replace(svgSymbols, '')
      
      // ⛔ FILTRAR se for apenas espaços em branco ou símbolos
      if (textContent.trim() && textContent.length > 0) {
        return textContent.trim()
      }
    }

    return null
  }

  /**
   * Envia comando para o NVDA
   */
  public async sendCommand(command: string): Promise<any> {
    if (!this.isAvailable) {
      return null
    }

    return await this.sendMessage({
      type: 'command',
      content: command,
      priority: 'normal'
    })
  }

  /**
   * Obtém status do NVDA
   */
  public async getStatus(): Promise<any> {
    if (!this.isAvailable) {
      return null
    }

    return await this.sendMessage({
      type: 'status',
      content: 'get-status'
    })
  }

  /**
   * Manipula comandos recebidos do NVDA
   */
  private handleNVDACommand(command: any): void {
    switch (command.type) {
      case 'navigate':
        this.handleNavigationCommand(command)
        break
      case 'settings':
        this.handleSettingsCommand(command)
        break
      case 'feedback':
        this.handleFeedbackCommand(command)
        break
      default:
        console.log('Unknown NVDA command:', command)
    }
  }

  /**
   * Manipula comandos de navegação
   */
  private handleNavigationCommand(command: any): void {
    // Implementar lógica de navegação baseada no comando
    console.log('Navigation command received:', command)
  }

  /**
   * Manipula comandos de configurações
   */
  private handleSettingsCommand(command: any): void {
    // Atualizar configurações locais
    if (this.settings) {
      Object.assign(this.settings, command.settings)
    }
  }

  /**
   * Manipula comandos de feedback
   */
  private handleFeedbackCommand(command: any): void {
    // Processar feedback do NVDA
    console.log('Feedback received:', command)
  }

  /**
   * Notifica mudanças de configurações
   */
  private notifySettingsChanged(): void {
    const event = new CustomEvent('nvda-settings-updated', {
      detail: this.settings
    })
    window.dispatchEvent(event)
  }

  /**
   * Verifica se NVDA está disponível
   */
  public isNVDAAvailable(): boolean {
    return this.isAvailable
  }

  /**
   * Força a detecção do NVDA (para testes)
   */
  public forceDetection(): void {
    this.isAvailable = true
    this.capabilities = {
      speech: true,
      braille: false,
      keyboard: true,
      mouse: false,
      objectNavigation: true,
      documentNavigation: true,
      webNavigation: true
    }
    this.settings = {
      speechRate: 50,
      speechPitch: 50,
      speechVolume: 50,
      brailleDisplay: false,
      keyboardEcho: true,
      mouseEcho: false
    }
    document.body.classList.add('nvda-optimized')
    console.log('NVDA detection forced for testing')
  }

  /**
   * Obtém capacidades do NVDA
   */
  public getCapabilities(): NVDACapabilities | null {
    return this.capabilities
  }

  /**
   * Obtém configurações do NVDA
   */
  public getSettings(): NVDASettings | null {
    return this.settings
  }

  /**
   * Verifica se o sistema de áudio está funcionando
   */
  async checkAudioSystem(): Promise<boolean> {
    try {
      console.log('🔊 Verificando sistema de áudio para NVDA...');
      
      // Inicializar o serviço de áudio se necessário
      await audioService.initialize();
      
      // Verificar capacidades de áudio
      const capabilities = audioService.getAudioCapabilities();
      console.log('🎛️ Capacidades de áudio:', capabilities);
      
      // Testar áudio básico
      const audioTest = await audioService.testBasicAudio();
      console.log('🔊 Teste de áudio:', audioTest);
      
      // Testar síntese de voz
      const speechTest = await audioService.testSpeechSynthesis('Teste de áudio para NVDA');
      console.log('🗣️ Teste de síntese:', speechTest);
      
      const audioWorking = audioTest.success && speechTest.success;
      console.log('✅ Sistema de áudio funcionando:', audioWorking);
      
      return audioWorking;
    } catch (error) {
      console.error('❌ Erro ao verificar sistema de áudio:', error);
      return false;
    }
  }

  /**
   * Configura o áudio para funcionar com NVDA
   */
  async configureAudioForNVDA(): Promise<boolean> {
    try {
      console.log('⚙️ Configurando áudio para NVDA...');
      
      // Forçar inicialização do contexto de áudio
      const initialized = await audioService.forceInitialize();
      if (!initialized) {
        console.error('❌ Falha ao inicializar contexto de áudio');
        return false;
      }
      
      // Verificar se o áudio está funcionando
      const audioWorking = await this.checkAudioSystem();
      if (!audioWorking) {
        console.error('❌ Sistema de áudio não está funcionando');
        return false;
      }
      
      console.log('✅ Áudio configurado com sucesso para NVDA');
      return true;
    } catch (error) {
      console.error('❌ Erro ao configurar áudio para NVDA:', error);
      return false;
    }
  }

  /**
   * Anuncia mensagem usando síntese de voz como fallback
   */
  async announceWithFallback(text: string, options?: {
    priority?: 'low' | 'normal' | 'high' | 'urgent'
    interrupt?: boolean
    category?: 'information' | 'warning' | 'error' | 'success'
  }): Promise<boolean> {
    try {
      console.log('🔊 Anunciando com fallback de áudio:', text);
      
      // Tentar usar NVDA primeiro
      try {
        await this.announce(text, options);
        console.log('✅ Anúncio via NVDA bem-sucedido');
        return true;
      } catch (error) {
        console.log('⚠️ NVDA não disponível, usando fallback');
      }
      
      // Fallback para síntese de voz do navegador
      console.log('🔄 Usando fallback de síntese de voz...');
      const speechResult = await audioService.testSpeechSynthesis(text);
      
      if (speechResult.success) {
        console.log('✅ Anúncio via síntese de voz bem-sucedido');
        return true;
      }
      
      console.error('❌ Falha em ambos os métodos de anúncio');
      return false;
    } catch (error) {
      console.error('❌ Erro no anúncio com fallback:', error);
      return false;
    }
  }

  /**
   * Atualiza configurações do NVDA
   */
  public async updateSettings(newSettings: Partial<NVDASettings>): Promise<boolean> {
    if (!this.isAvailable || !this.settings) {
      return false
    }

    try {
      Object.assign(this.settings, newSettings)
      
      await this.sendMessage({
        type: 'command',
        content: 'update-settings',
        priority: 'normal'
      })
      
      return true
    } catch (error) {
      console.error('Failed to update NVDA settings:', error)
      return false
    }
  }

  /**
   * Limpa a fila de mensagens
   */
  public clearQueue(): void {
    this.messageQueue = []
  }

  /**
   * Destrói o serviço
   */
  public destroy(): void {
    this.clearQueue()
    this.isAvailable = false
    this.capabilities = null
    this.settings = null
  }
}

// Instância singleton
export const nvdaService = new NVDAService()

// Exportar tipos e instância
export default nvdaService