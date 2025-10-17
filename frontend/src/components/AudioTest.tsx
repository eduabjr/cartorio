import React, { useState, useEffect } from 'react';
import { audioService, AudioTestResult, AudioCapabilities } from '../services/AudioService';

interface AudioTestProps {
  theme: any;
}

export const AudioTest: React.FC<AudioTestProps> = ({ theme }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [capabilities, setCapabilities] = useState<AudioCapabilities | null>(null);
  const [testResults, setTestResults] = useState<AudioTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [audioContextState, setAudioContextState] = useState<string>('não inicializado');

  useEffect(() => {
    initializeAudio();
  }, []);

  const initializeAudio = async () => {
    try {
      console.log('🔊 Inicializando teste de áudio...');
      const success = await audioService.initialize();
      setIsInitialized(success);
      
      if (success) {
        try {
          const caps = audioService.getAudioCapabilities();
          setCapabilities(caps);
          setAudioContextState(audioService.getAudioContextState());
          console.log('✅ Áudio inicializado:', caps);
        } catch (capError) {
          console.warn('⚠️ Erro ao obter capacidades de áudio:', capError);
          setCapabilities({
            hasAudioContext: false,
            hasWebAudio: false,
            hasMediaDevices: false,
            hasSpeechSynthesis: false,
            hasAudioWorklet: false
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar áudio:', error);
      setIsInitialized(false);
    }
  };

  const runBasicTest = async () => {
    setIsRunning(true);
    try {
      const result = await audioService.testBasicAudio();
      setTestResults(prev => [...prev, result]);
      setAudioContextState(audioService.getAudioContextState());
    } catch (error) {
      console.error('❌ Erro no teste básico:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runSpeechTest = async () => {
    setIsRunning(true);
    try {
      const result = await audioService.testSpeechSynthesis('Teste de síntese de voz do sistema');
      setTestResults(prev => [...prev, result]);
    } catch (error) {
      console.error('❌ Erro no teste de voz:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runFrequencyTest = async () => {
    setIsRunning(true);
    try {
      const result = await audioService.testFrequencySweep();
      setTestResults(prev => [...prev, result]);
    } catch (error) {
      console.error('❌ Erro no teste de frequência:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    try {
      const results = await audioService.runAllTests();
      setTestResults(results);
      setAudioContextState(audioService.getAudioContextState());
    } catch (error) {
      console.error('❌ Erro nos testes:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const forceInitialize = async () => {
    setIsRunning(true);
    try {
      const success = await audioService.forceInitialize();
      setIsInitialized(success);
      if (success) {
        try {
          setAudioContextState(audioService.getAudioContextState());
          const caps = audioService.getAudioCapabilities();
          setCapabilities(caps);
        } catch (capError) {
          console.warn('⚠️ Erro ao obter capacidades após forçar inicialização:', capError);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao forçar inicialização:', error);
      setIsInitialized(false);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    audioService.clearTestResults();
  };

  const getStatusColor = (success: boolean) => {
    return success ? '#059669' : '#dc2626';
  };

  const getStatusIcon = (success: boolean) => {
    return success ? '✅' : '❌';
  };

  return (
    <div style={{
      padding: '20px',
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      backgroundColor: theme.surface,
      marginBottom: '20px'
    }}>
      <h3 style={{
        color: theme.text,
        marginBottom: '15px',
        fontSize: '16px',
        fontWeight: '600'
      }}>
        🔊 Teste de Áudio do Sistema
      </h3>

      {/* Status do Sistema */}
      <div style={{
        padding: '12px',
        backgroundColor: isInitialized ? '#f0f9ff' : '#fef2f2',
        border: `1px solid ${isInitialized ? '#0ea5e9' : '#f87171'}`,
        borderRadius: '6px',
        marginBottom: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '18px' }}>
            {isInitialized ? '✅' : '❌'}
          </span>
          <strong style={{ color: theme.text }}>
            Status: {isInitialized ? 'Áudio Inicializado' : 'Áudio Não Inicializado'}
          </strong>
        </div>
        <div style={{ fontSize: '12px', color: theme.textSecondary }}>
          Contexto de Áudio: <strong>{audioContextState}</strong>
        </div>
      </div>

      {/* Capacidades do Sistema */}
      {capabilities && (
        <div style={{
          padding: '12px',
          backgroundColor: theme.background,
          border: `1px solid ${theme.border}`,
          borderRadius: '6px',
          marginBottom: '15px'
        }}>
          <h4 style={{ color: theme.text, marginBottom: '8px', fontSize: '14px' }}>
            🎛️ Capacidades de Áudio
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '12px' }}>
            <div style={{ color: theme.textSecondary }}>
              Web Audio: {capabilities.hasWebAudio ? '✅' : '❌'}
            </div>
            <div style={{ color: theme.textSecondary }}>
              Síntese de Voz: {capabilities.hasSpeechSynthesis ? '✅' : '❌'}
            </div>
            <div style={{ color: theme.textSecondary }}>
              Media Devices: {capabilities.hasMediaDevices ? '✅' : '❌'}
            </div>
            <div style={{ color: theme.textSecondary }}>
              Audio Worklet: {capabilities.hasAudioWorklet ? '✅' : '❌'}
            </div>
            {capabilities.sampleRate && (
              <div style={{ color: theme.textSecondary }}>
                Taxa de Amostragem: {capabilities.sampleRate}Hz
              </div>
            )}
            {capabilities.maxChannels && (
              <div style={{ color: theme.textSecondary }}>
                Canais Máximos: {capabilities.maxChannels}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botões de Teste */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '10px',
        marginBottom: '15px'
      }}>
        <button
          onClick={runBasicTest}
          disabled={isRunning}
          style={{
            padding: '8px 12px',
            backgroundColor: isRunning ? theme.border : theme.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          {isRunning ? '⏳' : '🔊'} Teste Básico
        </button>

        <button
          onClick={runSpeechTest}
          disabled={isRunning}
          style={{
            padding: '8px 12px',
            backgroundColor: isRunning ? theme.border : theme.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          {isRunning ? '⏳' : '🗣️'} Teste de Voz
        </button>

        <button
          onClick={runFrequencyTest}
          disabled={isRunning}
          style={{
            padding: '8px 12px',
            backgroundColor: isRunning ? theme.border : theme.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          {isRunning ? '⏳' : '🎵'} Teste Frequência
        </button>

        <button
          onClick={runAllTests}
          disabled={isRunning}
          style={{
            padding: '8px 12px',
            backgroundColor: isRunning ? theme.border : '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          {isRunning ? '⏳' : '🧪'} Todos os Testes
        </button>

        <button
          onClick={forceInitialize}
          disabled={isRunning}
          style={{
            padding: '8px 12px',
            backgroundColor: isRunning ? theme.border : '#d97706',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          {isRunning ? '⏳' : '🔄'} Forçar Inicialização
        </button>

        <button
          onClick={clearResults}
          disabled={isRunning}
          style={{
            padding: '8px 12px',
            backgroundColor: isRunning ? theme.border : '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          🗑️ Limpar Resultados
        </button>
      </div>

      {/* Resultados dos Testes */}
      {testResults.length > 0 && (
        <div style={{
          padding: '12px',
          backgroundColor: theme.background,
          border: `1px solid ${theme.border}`,
          borderRadius: '6px'
        }}>
          <h4 style={{ color: theme.text, marginBottom: '10px', fontSize: '14px' }}>
            📊 Resultados dos Testes
          </h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {testResults.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: '8px',
                  marginBottom: '8px',
                  backgroundColor: result.success ? '#f0f9ff' : '#fef2f2',
                  border: `1px solid ${getStatusColor(result.success)}`,
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px' }}>
                    {getStatusIcon(result.success)}
                  </span>
                  <strong style={{ color: theme.text }}>
                    {result.message}
                  </strong>
                </div>
                {result.error && (
                  <div style={{ color: '#dc2626', fontSize: '11px' }}>
                    Erro: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instruções */}
      <div style={{
        padding: '12px',
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '6px',
        marginTop: '15px'
      }}>
        <h4 style={{ color: '#92400e', marginBottom: '8px', fontSize: '14px' }}>
          💡 Instruções
        </h4>
        <ul style={{ color: '#92400e', fontSize: '12px', margin: 0, paddingLeft: '20px' }}>
          <li>Clique em qualquer botão de teste para ativar o áudio</li>
          <li>Se não ouvir som, verifique o volume do sistema</li>
          <li>Use "Forçar Inicialização" se o contexto estiver suspenso</li>
          <li>Os testes verificam diferentes aspectos do áudio</li>
        </ul>
      </div>
    </div>
  );
};
