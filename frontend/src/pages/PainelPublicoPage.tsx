import React, { useState, useEffect, useRef } from 'react'
import { senhaService } from '../services/SenhaService'
import { senhaEventService } from '../services/SenhaEventService'
import { Senha } from '../types/senha'

export function PainelPublicoPage() {
  const [senhasChamando, setSenhasChamando] = useState<Senha[]>([])
  const [senhasAguardando, setSenhasAguardando] = useState<Senha[]>([])
  const [ultimaSenhaChamada, setUltimaSenhaChamada] = useState<Senha | null>(null)
  const [horaAtual, setHoraAtual] = useState(new Date())
  const [ultimaChamadaId, setUltimaChamadaId] = useState<string | null>(null)
  const [config, setConfig] = useState(senhaService.getConfiguracao())
  const [forceRender, setForceRender] = useState(0)
  const configRef = useRef(config)

  // Atualizar ref sempre que config mudar
  useEffect(() => {
    configRef.current = config
    console.log('🎨 PAINEL PÚBLICO - Config atualizado:', {
      tamanhoSenha: config.painelPublicoTamanhoFonteSenha,
      tamanhoHistorico: config.painelPublicoTamanhoFonteHistorico,
      forceRender
    })
    
    // Debug: Verificar se os valores estão sendo aplicados no DOM
    const elementoSenha = document.querySelector('[data-senha-atual]')
    if (elementoSenha) {
      const fontSize = window.getComputedStyle(elementoSenha).fontSize
      console.log('   📏 Font-size real aplicado no DOM:', fontSize)
    }
  }, [config, forceRender])

  useEffect(() => {
    console.log('🎬 PAINEL PÚBLICO - useEffect INICIADO')
    const configInicial = senhaService.getConfiguracao()
    console.log('📐 Config inicial:', {
      tamanhoSenha: configInicial.painelPublicoTamanhoFonteSenha,
      tamanhoHistorico: configInicial.painelPublicoTamanhoFonteHistorico
    })
    carregarSenhas()
    setConfig(configInicial)
    
    // Atualizar hora a cada segundo
    const timerHora = setInterval(() => {
      setHoraAtual(new Date())
    }, 1000)
    
    // Atualizar senhas a cada 3 segundos (backup)
    const timerSenhas = setInterval(() => {
      carregarSenhas()
    }, 3000)
    
    // 🔥 POLLING: Verificar configurações a cada 1 segundo (garantir sincronização)
    const timerConfig = setInterval(() => {
      const configAtual = senhaService.getConfiguracao()
      const configAnterior = configRef.current
      
      // Verificar se mudou (usar ref para ter valor atual)
      if (configAtual.painelPublicoTamanhoFonteSenha !== configAnterior.painelPublicoTamanhoFonteSenha ||
          configAtual.painelPublicoTamanhoFonteHistorico !== configAnterior.painelPublicoTamanhoFonteHistorico) {
        console.log('🔄 POLLING - Detectada mudança nas configurações!')
        console.log('   Antes:', configAnterior.painelPublicoTamanhoFonteSenha, configAnterior.painelPublicoTamanhoFonteHistorico)
        console.log('   Agora:', configAtual.painelPublicoTamanhoFonteSenha, configAtual.painelPublicoTamanhoFonteHistorico)
        setConfig(configAtual)
        setForceRender(prev => prev + 1)
      }
    }, 1000)

    // Escutar eventos em tempo real
    const unsubscribeEmitida = senhaEventService.on('senha_emitida', (senha: Senha) => {
      console.log('🎫 PAINEL PÚBLICO - EVENTO senha_emitida RECEBIDO:', senha?.numeroCompleto || senha)
      carregarSenhas()
    })
    
    console.log('👂 PAINEL PÚBLICO - Listeners registrados')

    const unsubscribeChamada = senhaEventService.on('senha_chamada', (senha: Senha) => {
      console.log('🔔 Painel Público - Senha chamada:', senhaService.formatarSenha(senha))
      
      // Sistema de LOCK global para evitar múltiplos áudios
      // Verificar se o CONTROLADOR já tocou
      const lockKeyControlador = `audio-lock-controlador-${senha.id}`
      const lockControlador = localStorage.getItem(lockKeyControlador)
      
      if (lockControlador) {
        const tempoDecorrido = Date.now() - parseInt(lockControlador)
        if (tempoDecorrido < 2000) {
          console.log('🔒 Painel Público - Áudio bloqueado - CONTROLADOR já tocou há', tempoDecorrido + 'ms')
          setUltimaSenhaChamada(senha)
          carregarSenhas()
          return
        }
      }
      
      // Sistema de LOCK para esta tela
      const lockKey = `audio-lock-${senha.id}`
      const lockTimestamp = localStorage.getItem(lockKey)
      const agora = Date.now()
      
      // Se já existe um lock recente (< 2000ms), esta aba NÃO toca o som
      if (lockTimestamp) {
        const tempoDecorrido = agora - parseInt(lockTimestamp)
        if (tempoDecorrido < 2000) {
          console.log('🔒 Painel Público - Áudio bloqueado - outra aba já tocou há', tempoDecorrido + 'ms')
          setUltimaSenhaChamada(senha)
          carregarSenhas()
          return
        }
      }
      
      // Adquirir o lock para esta aba
      localStorage.setItem(lockKey, String(agora))
      console.log('🔓 Painel Público - Lock adquirido - esta aba vai tocar o áudio')
      
      // Limpar o lock após 2 segundos
      setTimeout(() => {
        localStorage.removeItem(lockKey)
      }, 2000)
      
      setUltimaChamadaId(`${senha.id}-${agora}`)
      setUltimaSenhaChamada(senha)
      carregarSenhas()
      
      // Tocar som/voz APENAS UMA VEZ
      console.log('🔊 Anunciando senha:', senhaService.formatarSenha(senha))
      anunciarSenha(senha)
    })

    const unsubscribeFinalizada = senhaEventService.on('senha_finalizada', () => {
      console.log('🔔 Painel Público - Senha finalizada')
      carregarSenhas()
    })

    const unsubscribeConfig = senhaEventService.on('config_atualizada', () => {
      const novaConfig = senhaService.getConfiguracao()
      console.log('🔄 Painel Público - Evento config_atualizada recebido!')
      console.log('   📏 Tamanho Senha:', novaConfig.painelPublicoTamanhoFonteSenha)
      console.log('   📋 Tamanho Histórico:', novaConfig.painelPublicoTamanhoFonteHistorico)
      setConfig(novaConfig)
      setForceRender(prev => prev + 1) // Forçar re-renderização
    })
    
    // FALLBACK: Também escutar mudanças no localStorage (caso BroadcastChannel falhe)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'senha-configuracao' && e.newValue) {
        console.log('💾 FALLBACK - Detectada mudança no localStorage!')
        const novaConfig = senhaService.getConfiguracao()
        console.log('   📏 Tamanho Senha:', novaConfig.painelPublicoTamanhoFonteSenha)
        console.log('   📋 Tamanho Histórico:', novaConfig.painelPublicoTamanhoFonteHistorico)
        setConfig(novaConfig)
        setForceRender(prev => prev + 1)
      }
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(timerHora)
      clearInterval(timerSenhas)
      clearInterval(timerConfig)
      unsubscribeEmitida()
      unsubscribeChamada()
      unsubscribeFinalizada()
      unsubscribeConfig()
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const carregarSenhas = () => {
    console.log('📋 PAINEL PÚBLICO - carregarSenhas() chamado')
    const todasSenhas = senhaService.getSenhas()
    const chamando = todasSenhas.filter(s => s.status === 'chamando' || s.status === 'atendendo')
    const aguardando = todasSenhas.filter(s => s.status === 'aguardando')
    
    console.log(`📊 PAINEL PÚBLICO - Total: ${todasSenhas.length}, Aguardando: ${aguardando.length}, Chamando: ${chamando.length}`)
    if (aguardando.length > 0) {
      console.log('📋 Aguardando:', aguardando.map(s => s.numeroCompleto).join(', '))
    }
    
    setSenhasChamando(chamando)
    setSenhasAguardando(aguardando)
  }

  const anunciarSenha = (senha: Senha) => {
    try {
      const config = senhaService.getConfiguracao()
      
      // Verificar tipo de áudio configurado
      if (config.tipoAudio === 'nenhum') {
        console.log('🔇 Áudio desativado nas configurações')
        return
      }
      
      // Tocar BEEP (som)
      if (config.tipoAudio === 'som' || config.tipoAudio === 'ambos') {
        const tipoSom = config.tipoSom || 'beep-simples'
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const volumeFinal = Math.max(0.3, (config.volumeSom || 90) / 100)
        
        console.log('🔔 Painel Público - Tocando som:', tipoSom, '| Volume:', (volumeFinal * 100).toFixed(0) + '%')
        
        // Função auxiliar para criar um beep
        const criarBeep = (frequencia: number, duracao: number, delay: number = 0) => {
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.value = frequencia
          oscillator.type = 'sine'
          
          const startTime = audioContext.currentTime + delay
          gainNode.gain.setValueAtTime(volumeFinal, startTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duracao)
          
          oscillator.start(startTime)
          oscillator.stop(startTime + duracao)
        }
        
        // Tocar conforme o tipo selecionado
        switch (tipoSom) {
          case 'beep-simples':
            criarBeep(880, 0.15)
            break
          case 'beep-duplo':
            criarBeep(880, 0.1, 0)
            criarBeep(880, 0.1, 0.15)
            break
          case 'beep-triplo':
            criarBeep(1046, 0.08, 0)
            criarBeep(1046, 0.08, 0.12)
            criarBeep(1046, 0.08, 0.24)
            break
          case 'sino':
            criarBeep(523, 0.3, 0)
            criarBeep(659, 0.25, 0.1)
            break
          case 'campainha':
            criarBeep(1318, 0.12, 0)
            criarBeep(1567, 0.12, 0.12)
            break
          case 'beep-longo':
            criarBeep(880, 0.5, 0)
            break
          default:
            criarBeep(880, 0.15)
        }
      }
      
      // Tocar VOZ (TTS)
      if (config.tipoAudio === 'voz' || config.tipoAudio === 'ambos') {
        if ('speechSynthesis' in window && senha) {
          const mensagem = config.mensagemChamada
            .replace('{senha}', senhaService.formatarSenha(senha))
            .replace('{guiche}', senha.guicheNumero?.toString() || '')
          
          const utterance = new SpeechSynthesisUtterance(mensagem)
          utterance.lang = 'pt-BR'
          
          // APLICAR TODOS OS PARÂMETROS CORRETAMENTE
          const volumeVoz = (config.volumeVoz || 100) / 100
          const velocidade = config.velocidadeVoz || 1.0
          const pitch = config.pitchVoz || 1.2
          const genero = config.generoVoz || 'feminino'
          
          utterance.volume = volumeVoz
          utterance.rate = velocidade
          utterance.pitch = pitch
          
          console.log('🎤 CONFIGURAÇÕES DE VOZ (Painel Público):')
          console.log('   📊 Volume:', config.volumeVoz + '%', '→', volumeVoz)
          console.log('   ⚡ Velocidade:', velocidade + 'x')
          console.log('   🎵 Pitch:', pitch, pitch < 0.8 ? '(Grave)' : pitch < 1.2 ? '(Normal)' : '(Agudo)')
          console.log('   👤 Gênero:', genero)
          
          // Função para selecionar voz apropriada
          const selecionarVoz = () => {
            const voices = window.speechSynthesis.getVoices()
            console.log('🔍 Total de vozes disponíveis:', voices.length)
            
            if (voices.length === 0) {
              console.warn('⚠️ Nenhuma voz carregada ainda')
              return null
            }
            
            // Listar todas as vozes disponíveis
            console.log('📋 Lista de vozes:')
            voices.forEach((v, i) => {
              console.log(`   ${i}: ${v.name} | ${v.lang} ${v.default ? '★ PADRÃO' : ''}`)
            })
            
            // Estratégia de seleção por gênero e idioma
            let vozEscolhida = null
            
            // 1. Tentar voz PT específica do gênero (procurar por palavras-chave)
            if (genero === 'feminino') {
              console.log('🔍 Procurando voz feminina em português...')
              vozEscolhida = voices.find(v => 
                v.lang.toLowerCase().includes('pt') && 
                (v.name.toLowerCase().includes('female') || 
                 v.name.toLowerCase().includes('feminino') ||
                 v.name.toLowerCase().includes('feminina') ||
                 v.name.toLowerCase().includes('maria') ||
                 v.name.toLowerCase().includes('lucia') ||
                 v.name.toLowerCase().includes('woman'))
              )
            } else {
              console.log('🔍 Procurando voz masculina em português...')
              vozEscolhida = voices.find(v => 
                v.lang.toLowerCase().includes('pt') && 
                (v.name.toLowerCase().includes('male') && !v.name.toLowerCase().includes('female')) ||
                (v.name.toLowerCase().includes('masculino') ||
                 v.name.toLowerCase().includes('joão') ||
                 v.name.toLowerCase().includes('jose') ||
                 v.name.toLowerCase().includes('man'))
              )
            }
            
            // 2. Fallback: qualquer voz PT-BR
            if (!vozEscolhida) {
              console.log('⚠️ Voz específica não encontrada, tentando PT-BR genérica...')
              vozEscolhida = voices.find(v => v.lang.toLowerCase().includes('pt-br'))
            }
            
            // 3. Fallback: qualquer voz PT
            if (!vozEscolhida) {
              console.log('⚠️ PT-BR não encontrada, tentando qualquer PT...')
              vozEscolhida = voices.find(v => v.lang.toLowerCase().includes('pt'))
            }
            
            // 4. Fallback: voz padrão do sistema
            if (!vozEscolhida) {
              console.warn('⚠️ Nenhuma voz PT encontrada, usando padrão do sistema...')
              vozEscolhida = voices.find(v => v.default) || voices[0]
            }
            
            if (vozEscolhida) {
              console.log('✅ VOZ FINAL SELECIONADA:', vozEscolhida.name, '|', vozEscolhida.lang)
              console.log('   💡 NOTA: O pitch (' + pitch + ') ajustará o tom para ' + (genero === 'feminino' ? 'mais agudo' : 'mais grave'))
            }
            
            return vozEscolhida
          }
          
          // Tentar selecionar voz
          const vozSelecionada = selecionarVoz()
          if (vozSelecionada) {
            utterance.voice = vozSelecionada
          }
          
          // Função para falar
          const falar = () => {
            // Limpar fila de voz para evitar acúmulo
            window.speechSynthesis.cancel()
            
            // Falar a mensagem
            window.speechSynthesis.speak(utterance)
            console.log('🗣️ VOZ TOCANDO AGORA com os parâmetros aplicados!')
          }
          
          // Se as vozes ainda não estão carregadas, aguardar
          if (window.speechSynthesis.getVoices().length === 0) {
            console.log('⏳ Aguardando vozes serem carregadas...')
            window.speechSynthesis.onvoiceschanged = () => {
              const vozAtualizada = selecionarVoz()
              if (vozAtualizada) {
                utterance.voice = vozAtualizada
              }
              
              if (config.tipoAudio === 'ambos') {
                setTimeout(falar, 600)
              } else {
                falar()
              }
            }
          } else {
            // Vozes já carregadas
            if (config.tipoAudio === 'ambos') {
              setTimeout(falar, 600)
            } else {
              falar()
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao tocar áudio:', error)
    }
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#1e293b',
      display: 'flex',
      flexDirection: 'column',
      color: '#fff',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header - Configurável pelo Layout do Painel Público */}
      {(config.painelPublicoMostrarTitulo !== false || config.painelPublicoMostrarSubtitulo !== false) && (
        <div style={{
          background: `linear-gradient(135deg, ${config.painelPublicoCorHeader || '#1e3a8a'} 0%, ${config.painelPublicoCorSenhaDestaque || '#3b82f6'} 100%)`,
          padding: config.painelPublicoMostrarTitulo !== false && config.painelPublicoMostrarSubtitulo !== false ? '32px 40px' :
                   config.painelPublicoMostrarTitulo === false && config.painelPublicoMostrarSubtitulo === false ? '0' :
                   '24px 40px',
          borderBottom: `4px solid ${config.painelPublicoCorSenhaDestaque || '#14b8a6'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: config.painelPublicoCorTexto || '#fff',
          minHeight: config.painelPublicoMostrarTitulo === false && config.painelPublicoMostrarSubtitulo === false ? '0' : 'auto',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            width: '100%' 
          }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {config.painelPublicoMostrarTitulo !== false && (
                <h1 style={{
                  fontSize: '48px',
                  fontWeight: '700',
                  margin: 0,
                  color: config.painelPublicoCorTexto || '#fff'
                }}>
                  {config.painelPublicoTitulo || 'Sistema de Atendimento'}
                </h1>
              )}
              {config.painelPublicoMostrarSubtitulo !== false && (
                <div style={{
                  fontSize: '20px',
                  opacity: 0.9,
                  color: config.painelPublicoCorTexto || '#fff'
                }}>
                  {config.painelPublicoSubtitulo || 'Bem-vindo ao Sistema de Atendimento'}
                </div>
              )}
            </div>
            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              fontFamily: 'monospace',
              color: config.painelPublicoCorTexto || '#fff',
              opacity: 0.95
            }}>
              {horaAtual.toLocaleTimeString('pt-BR')}
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '40px',
        gap: '30px'
      }}>
        
        {/* Última Senha Chamada - DESTAQUE */}
        {ultimaSenhaChamada && (
          <div style={{
            backgroundColor: '#14b8a6',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 40px rgba(20, 184, 166, 0.5)',
            animation: 'pulse 2s infinite',
            border: '5px solid #0d9488'
          }}>
            <div style={{
              textAlign: 'center',
              fontSize: '24px',
              color: '#fff',
              marginBottom: '20px',
              fontWeight: 'bold'
            }}>
              📢 CHAMANDO AGORA
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', color: '#f0fdfa', marginBottom: '10px' }}>
                  SENHA
                </div>
                <div 
                  data-senha-atual
                  style={{
                    fontSize: `${config.painelPublicoTamanhoFonteSenha || 80}px`,
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    color: '#fff',
                    textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                  }}>
                  {senhaService.formatarSenha(ultimaSenhaChamada)}
                </div>
              </div>
              <div style={{
                width: '4px',
                height: '200px',
                backgroundColor: 'rgba(255,255,255,0.3)'
              }}></div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', color: '#f0fdfa', marginBottom: '10px' }}>
                  GUICHÊ
                </div>
                <div style={{
                  fontSize: `${config.painelPublicoTamanhoFonteSenha || 80}px`,
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  color: '#fff',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}>
                  {ultimaSenhaChamada.guicheNumero || '--'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Senhas Aguardando */}
        {senhasAguardando.length > 0 && (
          <div>
            <h2 style={{
              fontSize: '28px',
              marginBottom: '15px',
              color: '#94a3b8',
              fontWeight: 'bold'
            }}>
              AGUARDANDO CHAMADA ({senhasAguardando.length})
            </h2>
            <div style={{
              display: 'flex',
              gap: '15px',
              flexWrap: 'wrap',
              padding: '20px',
              backgroundColor: '#334155',
              borderRadius: '12px',
              maxHeight: '150px',
              overflowY: 'auto'
            }}>
              {senhasAguardando.map((senha) => (
                <div
                  key={senha.id}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: senha.servico.cor + '30',
                    border: `2px solid ${senha.servico.cor}`,
                    borderRadius: '8px',
                    fontSize: `${config.painelPublicoTamanhoFonteHistorico || 24}px`,
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {senha.prioridade && <span style={{ color: '#f59e0b' }}>★</span>}
                  {senhaService.formatarSenha(senha)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Senhas em Atendimento */}
        <div>
          <h2 style={{
            fontSize: '32px',
            marginBottom: '20px',
            color: '#94a3b8',
            fontWeight: 'bold'
          }}>
            EM ATENDIMENTO
          </h2>
          
          {senhasChamando.length === 0 ? (
            <div style={{
              backgroundColor: '#334155',
              borderRadius: '12px',
              padding: '60px',
              textAlign: 'center',
              fontSize: '28px',
              color: '#64748b'
            }}>
              Nenhuma senha em atendimento no momento
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '20px'
            }}>
              {senhasChamando.map((senha) => (
                <div
                  key={senha.id}
                  style={{
                    backgroundColor: senha.status === 'chamando' ? '#7c3aed' : '#334155',
                    borderRadius: '12px',
                    padding: '30px',
                    border: `3px solid ${senha.servico.cor}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#cbd5e1',
                      fontWeight: 'bold'
                    }}>
                      {senha.servico.nome}
                    </div>
                    {senha.prioridade && (
                      <div style={{
                        backgroundColor: '#f59e0b',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        ★ PREFERENCIAL
                      </div>
                    )}
                  </div>
                  
                  <div style={{
                    fontSize: `${Math.floor((config.painelPublicoTamanhoFonteSenha || 80) * 0.7)}px`,
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    color: '#fff',
                    marginBottom: '15px',
                    textAlign: 'center'
                  }}>
                    {senhaService.formatarSenha(senha)}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '18px',
                    color: '#cbd5e1'
                  }}>
                    <span>Guichê: <strong style={{ color: '#fff' }}>{senha.guicheNumero || '--'}</strong></span>
                    <span>{senha.status === 'chamando' ? '📢 Chamando' : '💼 Atendendo'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: '#0f172a',
        padding: '15px',
        textAlign: 'center',
        fontSize: '18px',
        color: '#64748b',
        borderTop: '2px solid #334155'
      }}>
        Aguarde ser chamado e dirija-se ao guichê indicado
      </div>

      {/* Animação CSS */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  )
}

