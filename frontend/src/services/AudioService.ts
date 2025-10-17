// Serviço para gerenciar áudio e testes de som
export interface AudioTestResult {
  success: boolean;
  message: string;
  error?: string;
  audioContext?: AudioContext;
  oscillator?: OscillatorNode;
}

export interface AudioCapabilities {
  hasAudioContext: boolean;
  hasWebAudio: boolean;
  hasMediaDevices: boolean;
  hasSpeechSynthesis: boolean;
  hasAudioWorklet: boolean;
  sampleRate?: number;
  maxChannels?: number;
}

class AudioService {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private testResults: AudioTestResult[] = [];

  /**
   * Inicializa o serviço de áudio
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🔊 Inicializando AudioService...');
      
      // Verificar se o navegador suporta Web Audio API
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        console.error('❌ Web Audio API não suportada');
        return false;
      }

      // Se já temos um contexto válido, retornar true
      if (this.audioContext && this.audioContext.state !== 'closed') {
        console.log('✅ Contexto de áudio já inicializado');
        return true;
      }

      // Criar contexto de áudio
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      
      // Verificar se o contexto está suspenso (requer interação do usuário)
      if (this.audioContext.state === 'suspended') {
        console.log('⏸️ Contexto de áudio suspenso - aguardando interação do usuário');
      }

      this.isInitialized = true;
      console.log('✅ AudioService inicializado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar AudioService:', error);
      this.audioContext = null;
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Verifica as capacidades de áudio do sistema
   */
  getAudioCapabilities(): AudioCapabilities {
    const capabilities: AudioCapabilities = {
      hasAudioContext: !!(window.AudioContext || (window as any).webkitAudioContext),
      hasWebAudio: !!(window.AudioContext || (window as any).webkitAudioContext),
      hasMediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      hasSpeechSynthesis: !!(window.speechSynthesis),
      hasAudioWorklet: false // Desabilitado por enquanto para evitar erros
    };

    if (this.audioContext) {
      try {
        capabilities.sampleRate = this.audioContext.sampleRate;
        capabilities.maxChannels = this.audioContext.destination.maxChannelCount;
      } catch (error) {
        console.warn('Erro ao obter informações do contexto de áudio:', error);
      }
    }

    return capabilities;
  }

  /**
   * Testa o som básico do sistema
   */
  async testBasicAudio(): Promise<AudioTestResult> {
    try {
      console.log('🔊 Testando áudio básico...');

      if (!this.audioContext) {
        await this.initialize();
      }

      if (!this.audioContext) {
        return {
          success: false,
          message: 'Contexto de áudio não disponível',
          error: 'AudioContext não foi criado'
        };
      }

      // Se o contexto estiver suspenso, tentar resumir
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('▶️ Contexto de áudio resumido');
      }

      // Criar oscilador para teste
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Configurar oscilador
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // Lá central (440Hz)

      // Configurar ganho (volume)
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime); // Volume baixo
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

      // Conectar nós
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Tocar som por 0.5 segundos
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);

      const result: AudioTestResult = {
        success: true,
        message: 'Teste de áudio básico executado com sucesso',
        audioContext: this.audioContext,
        oscillator
      };

      this.testResults.push(result);
      console.log('✅ Teste de áudio básico concluído');
      return result;

    } catch (error) {
      const result: AudioTestResult = {
        success: false,
        message: 'Erro no teste de áudio básico',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };

      this.testResults.push(result);
      console.error('❌ Erro no teste de áudio básico:', error);
      return result;
    }
  }

  /**
   * Testa síntese de voz
   */
  async testSpeechSynthesis(text: string = 'Teste de síntese de voz'): Promise<AudioTestResult> {
    try {
      console.log('🗣️ Testando síntese de voz...');

      if (!window.speechSynthesis) {
        return {
          success: false,
          message: 'Síntese de voz não suportada',
          error: 'speechSynthesis não disponível'
        };
      }

      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.onstart = () => {
          console.log('▶️ Síntese de voz iniciada');
        };

        utterance.onend = () => {
          const result: AudioTestResult = {
            success: true,
            message: 'Teste de síntese de voz executado com sucesso'
          };
          this.testResults.push(result);
          console.log('✅ Teste de síntese de voz concluído');
          resolve(result);
        };

        utterance.onerror = (event) => {
          const result: AudioTestResult = {
            success: false,
            message: 'Erro na síntese de voz',
            error: `Erro: ${event.error}`
          };
          this.testResults.push(result);
          console.error('❌ Erro na síntese de voz:', event.error);
          resolve(result);
        };

        // Configurar voz em português se disponível
        const voices = speechSynthesis.getVoices();
        const portugueseVoice = voices.find(voice => 
          voice.lang.startsWith('pt') || voice.lang.includes('pt-BR')
        );
        
        if (portugueseVoice) {
          utterance.voice = portugueseVoice;
          console.log('🇧🇷 Usando voz em português:', portugueseVoice.name);
        }

        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 0.7;

        speechSynthesis.speak(utterance);
      });

    } catch (error) {
      const result: AudioTestResult = {
        success: false,
        message: 'Erro no teste de síntese de voz',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };

      this.testResults.push(result);
      console.error('❌ Erro no teste de síntese de voz:', error);
      return result;
    }
  }

  /**
   * Testa áudio com diferentes frequências
   */
  async testFrequencySweep(): Promise<AudioTestResult> {
    try {
      console.log('🎵 Testando varredura de frequências...');

      if (!this.audioContext) {
        await this.initialize();
      }

      if (!this.audioContext) {
        return {
          success: false,
          message: 'Contexto de áudio não disponível',
          error: 'AudioContext não foi criado'
        };
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Varredura de frequências de 200Hz a 800Hz
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 2);

      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 2);

      const result: AudioTestResult = {
        success: true,
        message: 'Teste de varredura de frequências executado com sucesso',
        audioContext: this.audioContext,
        oscillator
      };

      this.testResults.push(result);
      console.log('✅ Teste de varredura de frequências concluído');
      return result;

    } catch (error) {
      const result: AudioTestResult = {
        success: false,
        message: 'Erro no teste de varredura de frequências',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };

      this.testResults.push(result);
      console.error('❌ Erro no teste de varredura de frequências:', error);
      return result;
    }
  }

  /**
   * Executa todos os testes de áudio
   */
  async runAllTests(): Promise<AudioTestResult[]> {
    console.log('🧪 Executando todos os testes de áudio...');
    
    const results: AudioTestResult[] = [];
    
    // Teste 1: Áudio básico
    results.push(await this.testBasicAudio());
    
    // Aguardar um pouco entre os testes
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Teste 2: Síntese de voz
    results.push(await this.testSpeechSynthesis('Sistema de áudio funcionando corretamente'));
    
    // Aguardar um pouco entre os testes
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Teste 3: Varredura de frequências
    results.push(await this.testFrequencySweep());

    console.log('✅ Todos os testes de áudio concluídos');
    return results;
  }

  /**
   * Obtém histórico de testes
   */
  getTestResults(): AudioTestResult[] {
    return [...this.testResults];
  }

  /**
   * Limpa histórico de testes
   */
  clearTestResults(): void {
    this.testResults = [];
  }

  /**
   * Verifica se o áudio está funcionando
   */
  isAudioWorking(): boolean {
    return this.testResults.some(result => result.success);
  }

  /**
   * Obtém status do contexto de áudio
   */
  getAudioContextState(): string {
    return this.audioContext?.state || 'não inicializado';
  }

  /**
   * Força a inicialização do contexto de áudio (requer interação do usuário)
   */
  async forceInitialize(): Promise<boolean> {
    try {
      if (!this.audioContext) {
        return await this.initialize();
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('▶️ Contexto de áudio forçado a resumir');
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao forçar inicialização:', error);
      // Tentar recriar o contexto se houver erro
      this.audioContext = null;
      this.isInitialized = false;
      return await this.initialize();
    }
  }
}

// Instância singleton
export const audioService = new AudioService();
