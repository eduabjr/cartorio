import React, { useState, useEffect } from 'react'
import { nvdaService } from '../services/NVDAService'
import { useAccessibility } from '../hooks/useAccessibility'
import { audioService } from '../services/AudioService'

export function NVDATest() {
  const { settings } = useAccessibility()
  const [nvdaStatus, setNvdaStatus] = useState<{
    available: boolean
    capabilities: any
    settings: any
  }>({
    available: false,
    capabilities: null,
    settings: null
  })
  const [testMessage, setTestMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [audioStatus, setAudioStatus] = useState<{
    working: boolean
    capabilities: any
    contextState: string
  }>({
    working: false,
    capabilities: null,
    contextState: 'não inicializado'
  })

  useEffect(() => {
    const checkNVDAStatus = async () => {
      setIsLoading(true)
      try {
        // Aguardar um pouco para o serviço inicializar
        await new Promise(resolve => setTimeout(resolve, 200))
        
        const available = nvdaService.isNVDAAvailable()
        const capabilities = nvdaService.getCapabilities()
        const nvdaSettings = nvdaService.getSettings()
        
        setNvdaStatus({
          available,
          capabilities,
          settings: nvdaSettings
        })
        
        // Log detalhado para debug
        console.log('NVDA Status Check:', {
          available,
          capabilities,
          settings: nvdaSettings,
          userAgent: navigator.userAgent,
          speechSynthesis: !!window.speechSynthesis,
          speechRecognition: !!(window.speechRecognition || (window as any).webkitSpeechRecognition),
          ariaElements: document.querySelectorAll('[aria-live], [aria-label], [role]').length,
          prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches
        })
      } catch (error) {
        console.error('Error checking NVDA status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkNVDAStatus()
    
    // Re-verificar a cada 5 segundos
    const interval = setInterval(checkNVDAStatus, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const handleTestAnnouncement = async () => {
    if (!testMessage.trim() || isTesting) return
    
    setIsTesting(true)
    try {
      await nvdaService.announce(testMessage, {
        priority: 'normal',
        interrupt: false,
        category: 'information'
      })
    } catch (error) {
      console.error('Failed to announce via NVDA:', error)
    } finally {
      setTimeout(() => setIsTesting(false), 1000)
    }
  }

  const checkAudioSystem = async () => {
    setIsLoading(true)
    try {
      console.log('🔊 Verificando sistema de áudio...')
      
      // Inicializar serviço de áudio
      await audioService.initialize()
      
      // Verificar capacidades com tratamento de erro
      let capabilities = null
      try {
        capabilities = audioService.getAudioCapabilities()
      } catch (capError) {
        console.warn('⚠️ Erro ao obter capacidades de áudio:', capError)
        capabilities = {
          hasAudioContext: false,
          hasWebAudio: false,
          hasMediaDevices: false,
          hasSpeechSynthesis: false,
          hasAudioWorklet: false
        }
      }
      
      // Verificar se o áudio está funcionando
      let audioWorking = false
      try {
        audioWorking = await nvdaService.checkAudioSystem()
      } catch (audioError) {
        console.warn('⚠️ Erro ao verificar sistema de áudio:', audioError)
      }
      
      setAudioStatus({
        working: audioWorking,
        capabilities,
        contextState: audioService.getAudioContextState()
      })
      
      console.log('✅ Status do áudio atualizado:', {
        working: audioWorking,
        capabilities,
        contextState: audioService.getAudioContextState()
      })
    } catch (error) {
      console.error('❌ Erro ao verificar áudio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const configureAudioForNVDA = async () => {
    setIsLoading(true)
    try {
      console.log('⚙️ Configurando áudio para NVDA...')
      const success = await nvdaService.configureAudioForNVDA()
      
      if (success) {
        // Atualizar status do áudio
        await checkAudioSystem()
        console.log('✅ Áudio configurado com sucesso para NVDA')
      } else {
        console.error('❌ Falha ao configurar áudio para NVDA')
      }
    } catch (error) {
      console.error('❌ Erro ao configurar áudio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const testAudioWithFallback = async () => {
    if (!testMessage.trim() || isTesting) return
    
    setIsTesting(true)
    try {
      console.log('🔊 Testando anúncio com fallback de áudio...')
      const success = await nvdaService.announceWithFallback(testMessage, {
        priority: 'normal',
        interrupt: false,
        category: 'information'
      })
      
      if (success) {
        console.log('✅ Anúncio com fallback bem-sucedido')
      } else {
        console.error('❌ Falha no anúncio com fallback')
      }
    } catch (error) {
      console.error('❌ Erro no teste com fallback:', error)
    } finally {
      setTimeout(() => setIsTesting(false), 1000)
    }
  }

  const handleTestUrgentAnnouncement = async () => {
    try {
      await nvdaService.announce('ATENÇÃO! Esta é uma mensagem urgente do NVDA!', {
        priority: 'urgent',
        interrupt: true,
        category: 'warning'
      })
    } catch (error) {
      console.error('Failed to announce urgent message via NVDA:', error)
    }
  }

  const handleTestCommand = async () => {
    try {
      const status = await nvdaService.getStatus()
      console.log('NVDA Status:', status)
      
      await nvdaService.announce('Comando de status executado com sucesso', {
        priority: 'normal',
        category: 'success'
      })
    } catch (error) {
      console.error('Failed to execute NVDA command:', error)
    }
  }

  const theme = useAccessibility().getTheme()

  return (
    <div style={{
      background: theme.background,
      borderRadius: '10px',
      padding: '20px',
      border: `1px solid ${theme.border}`,
      marginBottom: '20px'
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: theme.text,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🦮 Teste de Integração NVDA
      </h3>

      {/* Status do NVDA */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <span style={{ 
            color: theme.text, 
            fontSize: '14px', 
            fontWeight: '500' 
          }}>
            Status do NVDA:
          </span>
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
            background: nvdaStatus.available ? theme.success : theme.error,
            color: 'white'
          }}>
            {isLoading ? 'Verificando...' : (nvdaStatus.available ? 'DETECTADO' : 'NÃO DETECTADO')}
          </span>
        </div>

        {nvdaStatus.available && nvdaStatus.capabilities && (
          <div style={{
            background: theme.surface,
            padding: '12px',
            borderRadius: '6px',
            border: `1px solid ${theme.border}`
          }}>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.text
            }}>
              Capacidades Detectadas:
            </h4>
            <ul style={{
              margin: '0',
              paddingLeft: '16px',
              fontSize: '12px',
              color: theme.textSecondary
            }}>
              {Object.entries(nvdaStatus.capabilities).map(([key, value]) => (
                <li key={key}>
                  {key}: {value ? '✅' : '❌'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Status do Áudio */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <span style={{ 
            color: theme.text, 
            fontSize: '14px', 
            fontWeight: '500' 
          }}>
            Status do Áudio:
          </span>
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
            background: audioStatus.working ? theme.success : theme.error,
            color: 'white'
          }}>
            {isLoading ? 'Verificando...' : (audioStatus.working ? 'FUNCIONANDO' : 'NÃO FUNCIONANDO')}
          </span>
        </div>

        {audioStatus.capabilities && (
          <div style={{
            background: theme.surface,
            padding: '12px',
            borderRadius: '6px',
            border: `1px solid ${theme.border}`,
            marginBottom: '10px'
          }}>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.text
            }}>
              🔊 Capacidades de Áudio
            </h4>
            <div style={{ fontSize: '12px', color: theme.textSecondary }}>
              <div>Web Audio: {audioStatus.capabilities.hasWebAudio ? '✅' : '❌'}</div>
              <div>Síntese de Voz: {audioStatus.capabilities.hasSpeechSynthesis ? '✅' : '❌'}</div>
              <div>Contexto: {audioStatus.contextState}</div>
              {audioStatus.capabilities.sampleRate && (
                <div>Taxa de Amostragem: {audioStatus.capabilities.sampleRate}Hz</div>
              )}
            </div>
          </div>
        )}

        {/* Botões de Teste de Áudio */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '10px'
        }}>
          <button
            onClick={checkAudioSystem}
            disabled={isLoading}
            style={{
              padding: '6px 12px',
              background: isLoading ? theme.border : theme.primary,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            {isLoading ? '⏳' : '🔊'} Verificar Áudio
          </button>

          <button
            onClick={configureAudioForNVDA}
            disabled={isLoading}
            style={{
              padding: '6px 12px',
              background: isLoading ? theme.border : '#d97706',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            {isLoading ? '⏳' : '⚙️'} Configurar para NVDA
          </button>
        </div>
      </div>

      {/* Teste de Anúncios */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: theme.text
        }}>
          Teste de Anúncios:
        </h4>
        
        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Digite uma mensagem para testar o NVDA"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              fontSize: '14px',
              background: theme.background,
              color: theme.text
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleTestAnnouncement}
            disabled={!testMessage.trim() || !nvdaStatus.available || isTesting}
            style={{
              padding: '8px 16px',
              background: nvdaStatus.available && testMessage.trim() && !isTesting ? theme.primary : theme.border,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: nvdaStatus.available && testMessage.trim() && !isTesting ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            {isTesting ? 'Testando...' : 'Testar Anúncio Normal'}
          </button>
          
          <button
            onClick={handleTestUrgentAnnouncement}
            disabled={!nvdaStatus.available}
            style={{
              padding: '8px 16px',
              background: nvdaStatus.available ? theme.error : theme.border,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: nvdaStatus.available ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            Testar Anúncio Urgente
          </button>
          
          <button
            onClick={handleTestCommand}
            disabled={!nvdaStatus.available}
            style={{
              padding: '8px 16px',
              background: nvdaStatus.available ? theme.info : theme.border,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: nvdaStatus.available ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            Testar Comando
          </button>

          <button
            onClick={testAudioWithFallback}
            disabled={!testMessage.trim() || isTesting}
            style={{
              padding: '8px 16px',
              background: testMessage.trim() && !isTesting ? '#059669' : theme.border,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: testMessage.trim() && !isTesting ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            {isTesting ? 'Testando...' : '🔊 Teste com Fallback de Áudio'}
          </button>
          
          <button
            onClick={async () => {
              setIsLoading(true)
              try {
                // Forçar re-inicialização do serviço NVDA
                await new Promise(resolve => setTimeout(resolve, 100))
                const available = nvdaService.isNVDAAvailable()
                const capabilities = nvdaService.getCapabilities()
                const nvdaSettings = nvdaService.getSettings()
                
                setNvdaStatus({
                  available,
                  capabilities,
                  settings: nvdaSettings
                })
              } finally {
                setIsLoading(false)
              }
            }}
            style={{
              padding: '8px 16px',
              background: theme.warning || '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            🔄 Re-detectar NVDA
          </button>
          
          <button
            onClick={() => {
              // Forçar detecção para testes
              nvdaService.forceDetection()
              const available = nvdaService.isNVDAAvailable()
              const capabilities = nvdaService.getCapabilities()
              const nvdaSettings = nvdaService.getSettings()
              
              setNvdaStatus({
                available,
                capabilities,
                settings: nvdaSettings
              })
            }}
            style={{
              padding: '8px 16px',
              background: theme.success || '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            🧪 Simular NVDA
          </button>
        </div>
      </div>

      {/* Informações Técnicas */}
      <div style={{
        background: theme.surface,
        padding: '12px',
        borderRadius: '6px',
        border: `1px solid ${theme.border}`
      }}>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: theme.text
        }}>
          Informações Técnicas:
        </h4>
        <ul style={{
          margin: '0',
          paddingLeft: '16px',
          fontSize: '11px',
          color: theme.textSecondary
        }}>
          <li>Detecção via User Agent e APIs específicas</li>
          <li>Comunicação via postMessage e APIs nativas</li>
          <li>Suporte a anúncios com diferentes prioridades</li>
          <li>Integração com sistema de acessibilidade</li>
          <li>Fallback para métodos padrão quando NVDA não disponível</li>
        </ul>
      </div>

      {!nvdaStatus.available && (
        <div style={{
          background: theme.error + '20',
          border: `1px solid ${theme.error}`,
          borderRadius: '6px',
          padding: '12px',
          marginTop: '12px'
        }}>
          <p style={{
            margin: '0',
            fontSize: '12px',
            color: theme.error,
            fontWeight: '500'
          }}>
            ⚠️ NVDA não detectado. Certifique-se de que o NVDA está instalado e ativo.
          </p>
        </div>
      )}
    </div>
  )
}
