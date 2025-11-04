import React, { useState, useEffect, useRef } from 'react'
import { senhaService } from '../services/SenhaService'
import { senhaEventService } from '../services/SenhaEventService'
import { Senha } from '../types/senha'

export function TelaSenhaPublicaPage() {
  const [senhasChamadas, setSenhasChamadas] = useState<Senha[]>([])
  const [senhaDestaque, setSenhaDestaque] = useState<Senha | null>(null)
  const [configuracao, setConfiguracao] = useState(senhaService.getConfiguracao())
  const [ultimaChamadaId, setUltimaChamadaId] = useState<string | null>(null)
  const [forceRender, setForceRender] = useState(0)
  const configRef = useRef(configuracao)

  // Atualizar ref quando config mudar
  useEffect(() => {
    configRef.current = configuracao
  }, [configuracao])

  useEffect(() => {
    // 🔥 POLLING: Verificar configurações a cada 500ms para mudanças em tempo real
    const timerConfig = setInterval(() => {
      const configAtual = senhaService.getConfiguracao()
      const configAnterior = configRef.current
      
      if (configAtual.painelPublicoTamanhoFonteSenha !== configAnterior.painelPublicoTamanhoFonteSenha ||
          configAtual.painelPublicoTamanhoFonteHistorico !== configAnterior.painelPublicoTamanhoFonteHistorico ||
          configAtual.painelPublicoTitulo !== configAnterior.painelPublicoTitulo ||
          configAtual.painelPublicoMostrarTitulo !== configAnterior.painelPublicoMostrarTitulo ||
          configAtual.painelPublicoSubtitulo !== configAnterior.painelPublicoSubtitulo ||
          configAtual.painelPublicoMostrarSubtitulo !== configAnterior.painelPublicoMostrarSubtitulo ||
          configAtual.painelPublicoCorFundo !== configAnterior.painelPublicoCorFundo ||
          configAtual.painelPublicoCorHeader !== configAnterior.painelPublicoCorHeader ||
          configAtual.painelPublicoCorSenhaDestaque !== configAnterior.painelPublicoCorSenhaDestaque ||
          configAtual.painelPublicoCorTexto !== configAnterior.painelPublicoCorTexto ||
          configAtual.painelPublicoCorHistorico !== configAnterior.painelPublicoCorHistorico) {
        console.log('🎨 TELA PÚBLICA - Polling detectou mudança no painel!')
        setConfiguracao(configAtual)
        setForceRender(prev => prev + 1)
      }
    }, 500)

    return () => {
      clearInterval(timerConfig)
    }
  }, [])

  useEffect(() => {
    carregarSenhas()
    
    // Recarregar configuração
    const recarregarConfig = () => {
      setConfiguracao(senhaService.getConfiguracao())
    }
    
    // Atualizar senhas periodicamente (backup)
    const interval = setInterval(() => {
      carregarSenhas()
      recarregarConfig()
    }, configuracao.tempoAtualizacaoTela * 1000)

    // Escutar evento de nova senha chamada (antigo)
    const handleSenhaChamada = (event: CustomEvent) => {
      const senha = event.detail as Senha
      setSenhaDestaque(senha)
      
      // Tocar som/voz conforme configuração
      tocarSomParaSenha(senha)
      
      // Remover destaque após 10 segundos
      setTimeout(() => {
        setSenhaDestaque(null)
      }, 10000)
    }

    senhaService.addEventListener('senha-chamada', handleSenhaChamada)

    // Escutar eventos em tempo real (NOVO)
    const unsubscribeEmitida = senhaEventService.on('senha_emitida', () => {
      console.log('🔔 Tela Pública - Nova senha emitida')
      carregarSenhas()
    })

    const unsubscribeChamada = senhaEventService.on('senha_chamada', (senha: Senha) => {
      console.log('🔔 Tela Pública - Senha chamada:', senhaService.formatarSenha(senha))
      
      // Sistema de LOCK global para evitar múltiplos áudios
      // Verificar se o CONTROLADOR já tocou
      const lockKeyControlador = `audio-lock-controlador-${senha.id}`
      const lockControlador = localStorage.getItem(lockKeyControlador)
      
      if (lockControlador) {
        const tempoDecorrido = Date.now() - parseInt(lockControlador)
        if (tempoDecorrido < 2000) {
          console.log('🔒 Tela Pública - Áudio bloqueado - CONTROLADOR já tocou há', tempoDecorrido + 'ms')
          setSenhaDestaque(senha)
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
          console.log('🔒 Tela Pública - Áudio bloqueado - outra aba já tocou há', tempoDecorrido + 'ms')
          setSenhaDestaque(senha)
          carregarSenhas()
          return
        }
      }
      
      // Adquirir o lock para esta aba
      localStorage.setItem(lockKey, String(agora))
      console.log('🔓 Tela Pública - Lock adquirido - esta aba vai tocar o áudio')
      
      // Limpar o lock após 2 segundos
      setTimeout(() => {
        localStorage.removeItem(lockKey)
      }, 2000)
      
      setUltimaChamadaId(`${senha.id}-${agora}`)
      setSenhaDestaque(senha)
      carregarSenhas()
      
      // Tocar som/voz conforme configuração APENAS UMA VEZ
      console.log('🔊 Tocando áudio para:', senhaService.formatarSenha(senha))
      tocarSomParaSenha(senha)
      
      // Manter destaque até próxima chamada ou finalização
    })

    const unsubscribeFinalizada = senhaEventService.on('senha_finalizada', (senha: Senha) => {
      console.log('🔔 Tela Pública - Senha finalizada:', senha ? senhaService.formatarSenha(senha) : '--')
      // Se a senha finalizada é a que está em destaque, remover destaque
      if (senhaDestaque && senha && senhaDestaque.id === senha.id) {
        setSenhaDestaque(null)
      }
      carregarSenhas()
    })

    // 🎨 Escutar mudanças de configuração em tempo real
    const unsubscribeConfig = senhaEventService.on('config_atualizada', () => {
      const novaConfig = senhaService.getConfiguracao()
      console.log('🎨 TELA PÚBLICA - Config atualizada!', {
        tamanhoSenha: novaConfig.painelPublicoTamanhoFonteSenha,
        tamanhoHistorico: novaConfig.painelPublicoTamanhoFonteHistorico
      })
      setConfiguracao(novaConfig)
      setForceRender(prev => prev + 1)
    })

    return () => {
      clearInterval(interval)
      senhaService.removeEventListener('senha-chamada', handleSenhaChamada)
      unsubscribeEmitida()
      unsubscribeChamada()
      unsubscribeFinalizada()
      unsubscribeConfig()
    }
  }, [configuracao.tempoAtualizacaoTela, configuracao.emitirSom])

  const carregarSenhas = () => {
    // Limitar conforme configuração (padrão: 3, máximo: 10)
    const quantidadeBruta = configuracao.quantidadeSenhasExibidas || 3
    const quantidade = Math.min(Math.max(quantidadeBruta, 1), 10) // Garantir entre 1 e 10
    const ultimasSenhas = senhaService.getUltimasSenhasChamadas(quantidade)
    setSenhasChamadas(ultimasSenhas)
    
    // Se não há senha em destaque, mostrar a última chamada
    if (!senhaDestaque && ultimasSenhas.length > 0) {
      setSenhaDestaque(ultimasSenhas[0])
    }
  }

  const tocarSomParaSenha = (senha: Senha) => {
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
        
        console.log('🔔 Tela Pública - Tocando som:', tipoSom, '| Volume:', (volumeFinal * 100).toFixed(0) + '%')
        
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
          
          console.log('🎤 CONFIGURAÇÕES DE VOZ:')
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

  // Calcular quantidade limitada (máximo 10)
  const quantidadeBruta = configuracao.quantidadeSenhasExibidas || 3
  const quantidadeLimitada = Math.min(Math.max(quantidadeBruta, 1), 10)

  // Debug: Log da cor de fundo atual
  const corFundoAtual = configuracao.painelPublicoCorFundo || '#1a1a1a'
  console.log('🎨 TELA PÚBLICA - Cor de fundo configurada:', configuracao.painelPublicoCorFundo)
  console.log('🎨 TELA PÚBLICA - Cor de fundo aplicada:', corFundoAtual)

  // 🔒 Aplicar cor de fundo diretamente no body para sobrescrever CSS global
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor
    const originalOverflow = document.body.style.overflow
    
    document.body.style.backgroundColor = corFundoAtual
    document.body.style.overflow = 'hidden'
    console.log('🎨 Body background aplicado:', corFundoAtual)
    
    return () => {
      document.body.style.backgroundColor = originalBg
      document.body.style.overflow = originalOverflow
      console.log('🎨 Body background restaurado')
    }
  }, [corFundoAtual])

  return (
    <div 
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: corFundoAtual,
        color: configuracao.painelPublicoCorTexto || '#ffffff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
      data-cor-fundo={corFundoAtual}
    >
      {/* Header - Só exibe se pelo menos título ou subtítulo estiverem ativos */}
      {(configuracao.painelPublicoMostrarTitulo !== false || configuracao.painelPublicoMostrarSubtitulo !== false) && (
        <div style={{
          padding: (configuracao.painelPublicoMostrarTitulo !== false && configuracao.painelPublicoMostrarSubtitulo !== false) ? '24px 48px' : 
                   '16px 48px',
          background: `linear-gradient(135deg, ${configuracao.painelPublicoCorHeader || '#1e3a8a'} 0%, ${configuracao.painelPublicoCorSenhaDestaque || '#3b82f6'} 100%)`,
          borderBottom: `4px solid ${configuracao.painelPublicoCorSenhaDestaque || '#60a5fa'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          transition: 'padding 0.3s ease'
        }}>
          <div>
            {configuracao.painelPublicoMostrarTitulo !== false && (
              <h1 style={{
                margin: configuracao.painelPublicoMostrarSubtitulo !== false ? '0 0 4px 0' : '0',
                fontSize: '42px',
                fontWeight: '700',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                {configuracao.painelPublicoTitulo || 'Sistema de Atendimento'}
              </h1>
            )}
            {configuracao.painelPublicoMostrarSubtitulo !== false && (
              <div style={{ fontSize: '18px', opacity: 0.9 }}>
                {configuracao.painelPublicoSubtitulo || configuracao.mensagemBoasVindas}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        padding: '32px', 
        gap: '32px',
        flexDirection: 
          configuracao.layoutPainelPublico === 'senha-direita' ? 'row-reverse' :
          configuracao.layoutPainelPublico === 'senha-cima' ? 'column' :
          configuracao.layoutPainelPublico === 'senha-baixo' ? 'column-reverse' :
          'row'
      }}>
        {/* Senha em Destaque (última chamada) */}
        <div style={{
          flex: configuracao.layoutPainelPublico === 'senha-cima' || configuracao.layoutPainelPublico === 'senha-baixo' ? 1.5 : 1.8,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {senhaDestaque ? (
            <div style={{
              flex: 1,
              padding: '48px',
              background: `linear-gradient(135deg, ${senhaDestaque.servico.cor}20 0%, ${senhaDestaque.servico.cor}40 100%)`,
              border: `6px solid ${senhaDestaque.servico.cor}`,
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: `0 16px 48px ${senhaDestaque.servico.cor}60`,
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              <div style={{ fontSize: '36px', fontWeight: '600', marginBottom: '16px', opacity: 0.9 }}>
                {senhaDestaque.servico.nome}
              </div>
              <div style={{
                fontSize: `${configuracao.painelPublicoTamanhoFonteSenha || 180}px`,
                fontWeight: '700',
                fontFamily: 'monospace',
                color: configuracao.painelPublicoCorSenhaDestaque || senhaDestaque.servico.cor,
                textShadow: '4px 4px 8px rgba(0,0,0,0.5)',
                marginBottom: '32px',
                lineHeight: '1'
              }}>
                {senhaDestaque ? senhaService.formatarSenha(senhaDestaque) : '--'}
              </div>
              <div style={{
                fontSize: `${Math.floor((configuracao.painelPublicoTamanhoFonteSenha || 180) * 0.4)}px`,
                fontWeight: '700',
                color: '#fff',
                backgroundColor: senhaDestaque.servico.cor,
                padding: '16px 48px',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
              }}>
                GUICHÊ {senhaDestaque.guicheNumero}
              </div>
            </div>
          ) : (
            <div style={{
              flex: 1,
              padding: '48px',
              border: '4px dashed #3a3a3a',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '120px', marginBottom: '24px', opacity: 0.2 }}>
                🎫
              </div>
              <div style={{ fontSize: '32px', color: '#666', textAlign: 'center' }}>
                Aguardando chamada de senha...
              </div>
            </div>
          )}
        </div>

        {/* Lista de Senhas Recentes */}
        <div style={{
          flex: configuracao.layoutPainelPublico === 'senha-cima' || configuracao.layoutPainelPublico === 'senha-baixo' ? 1 : 2.2,
          backgroundColor: configuracao.painelPublicoCorHistorico || '#1a1a1a',
          borderRadius: '24px',
          padding: '40px',
          border: '2px solid #2a2a2a',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h2 style={{
            margin: '0 0 35px 0',
            fontSize: '42px',
            fontWeight: '700',
            paddingBottom: '24px',
            borderBottom: '5px solid #3a3a3a',
            color: '#14b8a6',
            flexShrink: 0
          }}>
            📋 Últimas Chamadas
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: configuracao.layoutPainelPublico === 'senha-cima' || configuracao.layoutPainelPublico === 'senha-baixo' ? 'row' : 'column',
            gap: configuracao.layoutPainelPublico === 'senha-cima' || configuracao.layoutPainelPublico === 'senha-baixo' ? '12px' : '16px',
            flex: 1,
            overflow: 'hidden',
            paddingRight: '10px'
          }}>
            {Array.from({ length: quantidadeLimitada }, (_, index) => {
              const senha = senhasChamadas[index] || null
              return (
              <div
                key={senha?.id || `empty-${index}`}
                style={{
                  padding: '32px 28px',
                  backgroundColor: senha ? (index === 0 ? `${senha.servico.cor}25` : '#0a0a0a') : '#0a0a0a',
                  border: `4px solid ${senha ? (index === 0 ? senha.servico.cor : '#2a2a2a') : '#2a2a2a'}`,
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: configuracao.layoutPainelPublico === 'senha-cima' || configuracao.layoutPainelPublico === 'senha-baixo' ? 'column' : 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '28px',
                  transition: 'all 0.3s ease',
                  boxShadow: senha && index === 0 ? `0 6px 20px ${senha.servico.cor}50` : '0 2px 8px rgba(0,0,0,0.2)',
                  height: configuracao.layoutPainelPublico === 'senha-cima' || configuracao.layoutPainelPublico === 'senha-baixo' 
                    ? 'auto' 
                    : `calc((100% - ${(quantidadeLimitada - 1) * 16}px) / ${quantidadeLimitada})`,
                  width: configuracao.layoutPainelPublico === 'senha-cima' || configuracao.layoutPainelPublico === 'senha-baixo' 
                    ? `calc((100% - ${(quantidadeLimitada - 1) * 12}px) / ${quantidadeLimitada})` 
                    : 'auto',
                  flexShrink: 0,
                  minHeight: 0,
                  opacity: senha ? 1 : 0.3
                }}
              >
                {senha ? (
                  <>
                    <div style={{
                      padding: '24px 32px',
                      backgroundColor: senha.servico.cor,
                      color: '#fff',
                      borderRadius: '16px',
                      fontSize: `${configuracao.painelPublicoTamanhoFonteHistorico || 48}px`,
                      fontWeight: '700',
                      fontFamily: 'monospace',
                      minWidth: '160px',
                      textAlign: 'center',
                      boxShadow: `0 6px 12px ${senha.servico.cor}70`,
                      letterSpacing: '2px'
                    }}>
                      {senhaService.formatarSenha(senha)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: '#fff' }}>
                        {senha.servico.nome}
                      </div>
                    </div>
                    <div style={{
                      padding: '20px 32px',
                      backgroundColor: senha.servico.cor,
                      color: '#fff',
                      borderRadius: '16px',
                      fontSize: `${Math.floor((configuracao.painelPublicoTamanhoFonteHistorico || 48) * 0.67)}px`,
                      fontWeight: '700',
                      minWidth: '180px',
                      textAlign: 'center',
                      boxShadow: `0 6px 12px ${senha.servico.cor}70`
                    }}>
                      GUICHÊ {senha.guicheNumero || '--'}
                    </div>
                  </>
                ) : (
                  <div style={{ 
                    width: '100%', 
                    textAlign: 'center', 
                    color: '#666', 
                    fontSize: '18px',
                    padding: '20px'
                  }}>
                    Aguardando...
                  </div>
                )}
              </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CSS para animação */}
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

