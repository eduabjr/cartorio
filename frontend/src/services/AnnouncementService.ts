// Serviço para anúncios de acessibilidade integrado com NVDA e navegador
import { audioService } from './AudioService';

export interface AnnouncementOptions {
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  interrupt?: boolean;
  category?: 'information' | 'warning' | 'error' | 'success';
  volume?: number;
  rate?: number;
  pitch?: number;
}

class AnnouncementService {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  // @ts-ignore - Variáveis de estado interno (reservadas para uso futuro)
  private _currentUtterance: SpeechSynthesisUtterance | null = null;
  private lastAnnouncement: string = '';
  // @ts-ignore - Variáveis de estado interno (reservadas para uso futuro)
  private _announcementQueue: string[] = [];
  // @ts-ignore - Variáveis de estado interno (reservadas para uso futuro)
  private _isProcessing = false;

  /**
   * Inicializa o serviço de anúncios
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🔊 Inicializando AnnouncementService...');
      
      // Inicializar contexto de áudio
      await audioService.initialize();
      this.audioContext = audioService['audioContext'];
      
      // Verificar síntese de voz
      if (!window.speechSynthesis) {
        console.warn('⚠️ Speech Synthesis não disponível');
        return false;
      }

      // Forçar inicialização do contexto de áudio
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('▶️ Contexto de áudio resumido');
      }

      this.isInitialized = true;
      console.log('✅ AnnouncementService inicializado');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar AnnouncementService:', error);
      return false;
    }
  }

  /**
   * Verifica se o leitor de tela está ativado nas configurações
   */
  private isScreenReaderEnabled(): boolean {
    try {
      const savedSettings = localStorage.getItem('accessibility-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        return settings.screenReader === true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar configurações de leitor de tela:', error);
      return false;
    }
  }

  /**
   * Anuncia texto usando múltiplos métodos
   */
  async announce(text: string, options: AnnouncementOptions = {}): Promise<boolean> {
    if (!text || text.trim() === '') {
      return false;
    }

    // Verificar se o leitor de tela está ativado nas configurações
    if (!this.isScreenReaderEnabled()) {
      console.log('❌ Leitor de tela desativado nas configurações, pulando anúncio:', text);
      return false;
    }

    // Evitar anúncios duplicados
    if (text === this.lastAnnouncement) {
      return false;
    }

    this.lastAnnouncement = text;
    console.log('🔊 Anunciando:', text);

    let success = false;

    // Método 1: Tentar Speech Synthesis do navegador primeiro (mais confiável)
    if (await this.announceViaSpeechSynthesis(text, options)) {
      success = true;
    }

    // Método 2: Tentar NVDA como fallback
    if (!success && await this.announceViaNVDA(text, options)) {
      success = true;
    }

    // Método 3: Fallback para sons de notificação
    if (!success) {
      success = await this.announceViaAudioTones(text, options);
    }

    return success;
  }

  /**
   * Anuncia via NVDA
   */
  private async announceViaNVDA(text: string, options: AnnouncementOptions): Promise<boolean> {
    try {
      // Verificar se NVDA está disponível
      if (typeof window !== 'undefined' && (window as any).nvda) {
        const nvda = (window as any).nvda;
        
        if (nvda.announce) {
          await nvda.announce(text, {
            priority: options.priority || 'normal',
            interrupt: options.interrupt || false
          });
          console.log('✅ Anúncio enviado via NVDA');
          return true;
        }
      }

      // Tentar via postMessage para NVDA
      if (typeof window !== 'undefined') {
        window.postMessage({
          type: 'nvda-announce',
          text: text,
          priority: options.priority || 'normal',
          interrupt: options.interrupt || false
        }, '*');
        console.log('📤 Anúncio enviado via postMessage para NVDA');
        return true;
      }

      return false;
    } catch (error) {
      console.warn('⚠️ Erro ao anunciar via NVDA:', error);
      return false;
    }
  }

  /**
   * Anuncia via Speech Synthesis do navegador
   */
  private async announceViaSpeechSynthesis(text: string, options: AnnouncementOptions): Promise<boolean> {
    try {
      if (!window.speechSynthesis) {
        console.log('❌ Speech Synthesis não disponível');
        return false;
      }

      // Parar anúncio anterior se necessário
      if (options.interrupt) {
        speechSynthesis.cancel();
      }

      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Aguardar vozes carregarem se necessário
        const setVoice = () => {
          const voices = speechSynthesis.getVoices();
          const portugueseVoice = voices.find(voice => 
            voice.lang.startsWith('pt') || 
            voice.lang.includes('pt-BR') ||
            voice.name.toLowerCase().includes('portuguese') ||
            voice.name.toLowerCase().includes('brasil')
          );
          
          if (portugueseVoice) {
            utterance.voice = portugueseVoice;
            console.log('🇧🇷 Usando voz em português:', portugueseVoice.name);
          } else {
            console.log('⚠️ Voz em português não encontrada, usando voz padrão');
          }
        };

        // Configurar voz
        if (speechSynthesis.getVoices().length > 0) {
          setVoice();
        } else {
          speechSynthesis.onvoiceschanged = setVoice;
        }

        // Configurar parâmetros
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 0.8;

        // Eventos
        utterance.onstart = () => {
          console.log('▶️ Speech Synthesis iniciado:', text);
        };

        utterance.onend = () => {
          console.log('✅ Speech Synthesis concluído:', text);
          resolve(true);
        };

        utterance.onerror = (event) => {
          console.error('❌ Erro no Speech Synthesis:', event.error, text);
          resolve(false);
        };

        // Falar
        speechSynthesis.speak(utterance);
        this._currentUtterance = utterance;
      });

    } catch (error) {
      console.error('❌ Erro no Speech Synthesis:', error);
      return false;
    }
  }

  /**
   * Anuncia via tons de áudio
   */
  private async announceViaAudioTones(_text: string, options: AnnouncementOptions): Promise<boolean> {
    try {
      if (!this.audioContext) {
        await this.initialize();
      }

      if (!this.audioContext || this.audioContext.state === 'suspended') {
        return false;
      }

      // Criar tons diferentes baseados na categoria
      const frequencies = this.getFrequenciesForCategory(options.category || 'information');
      
      for (let i = 0; i < frequencies.length; i++) {
        await this.playTone(frequencies[i], 0.2, options.volume || 0.3);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log('🔊 Anúncio via tons de áudio');
      return true;

    } catch (error) {
      console.error('❌ Erro nos tons de áudio:', error);
      return false;
    }
  }

  /**
   * Toca um tom específico
   */
  private async playTone(frequency: number, duration: number, volume: number): Promise<void> {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  /**
   * Obtém frequências baseadas na categoria
   */
  private getFrequenciesForCategory(category: string): number[] {
    switch (category) {
      case 'success':
        return [523, 659, 784]; // C-E-G (acorde maior)
      case 'warning':
        return [440, 554]; // A-C# (intervalo de terça)
      case 'error':
        return [220, 185]; // A-F# (intervalo dissonante)
      case 'information':
      default:
        return [440]; // Lá central
    }
  }

  /**
   * Anuncia hover em elementos
   */
  async announceHover(elementText: string, elementType: string = 'elemento'): Promise<void> {
    if (!this.isScreenReaderEnabled()) {
      return;
    }
    const announcement = `${elementType}: ${elementText}`;
    await this.announce(announcement, {
      priority: 'low',
      interrupt: false,
      category: 'information',
      volume: 0.6,
      rate: 1.0
    });
  }

  /**
   * Anuncia clique em elementos
   */
  async announceClick(elementText: string, elementType: string = 'elemento'): Promise<void> {
    if (!this.isScreenReaderEnabled()) {
      return;
    }
    const announcement = `${elementType} clicado: ${elementText}`;
    await this.announce(announcement, {
      priority: 'normal',
      interrupt: true,
      category: 'information',
      volume: 0.8,
      rate: 0.9
    });
  }

  /**
   * Anuncia navegação
   */
  async announceNavigation(direction: string, target: string): Promise<void> {
    if (!this.isScreenReaderEnabled()) {
      return;
    }
    const announcement = `Navegando ${direction}: ${target}`;
    await this.announce(announcement, {
      priority: 'low',
      interrupt: false,
      category: 'information',
      volume: 0.5,
      rate: 1.1
    });
  }

  /**
   * Para todos os anúncios
   */
  stopAll(): void {
    if (window.speechSynthesis) {
      speechSynthesis.cancel();
    }
    this._currentUtterance = null;
    this._announcementQueue = [];
    this._isProcessing = false;
  }

  /**
   * Verifica se está funcionando
   */
  isWorking(): boolean {
    return this.isInitialized && (
      window.speechSynthesis !== undefined ||
      this.audioContext !== null ||
      (typeof window !== 'undefined' && (window as any).nvda)
    );
  }

  /**
   * Obtém status do serviço
   */
  getStatus(): {
    initialized: boolean;
    speechSynthesis: boolean;
    audioContext: boolean;
    nvda: boolean;
  } {
    return {
      initialized: this.isInitialized,
      speechSynthesis: !!window.speechSynthesis,
      audioContext: !!this.audioContext,
      nvda: !!(typeof window !== 'undefined' && (window as any).nvda)
    };
  }
}

// Instância singleton
export const announcementService = new AnnouncementService();

// Inicializar automaticamente quando o DOM estiver pronto
if (typeof window !== 'undefined') {
  // Aguardar o DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      announcementService.initialize();
    });
  } else {
    // DOM já está pronto
    announcementService.initialize();
  }
  
  // Também inicializar quando houver interação do usuário
  const initOnUserInteraction = () => {
    announcementService.initialize();
    document.removeEventListener('click', initOnUserInteraction);
    document.removeEventListener('keydown', initOnUserInteraction);
  };
  
  document.addEventListener('click', initOnUserInteraction);
  document.addEventListener('keydown', initOnUserInteraction);
}
