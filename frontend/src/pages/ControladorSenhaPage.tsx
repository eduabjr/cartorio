import React, { useState, useEffect, useMemo } from 'react'
import { BasePage } from '../components/BasePage'
import { useTempoReal } from '../hooks/useTempoReal'
import { useAccessibility } from '../hooks/useAccessibility'
import { useModal } from '../hooks/useModal'
import { senhaService } from '../services/SenhaService'
import { senhaEventService } from '../services/SenhaEventService'
import { Senha, Guiche, ConfiguracaoSenha } from '../types/senha'

// 🔧 Flag para habilitar logs verbosos (desabilitar em produção)
const VERBOSE_LOGS = false

interface ControladorSenhaPageProps {
  onClose: () => void
}

export function ControladorSenhaPage({ onClose }: ControladorSenhaPageProps) {
  const agora = useTempoReal()
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const modal = useModal()
  
  // Cor do header: laranja no dark, teal no light (mesma cor das outras janelas)
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
  
  const [meuGuiche, setMeuGuiche] = useState<Guiche | null>(null)
  const [senhaAtual, setSenhaAtual] = useState<Senha | null>(null)
  const [senhaManual, setSenhaManual] = useState('')
  const [senhasPreferencial, setSenhasPreferencial] = useState<Senha[]>([])
  const [senhasComum, setSenhasComum] = useState<Senha[]>([])
  const [todasSenhas, setTodasSenhas] = useState<Senha[]>([])
  const [indiceVisualizacao, setIndiceVisualizacao] = useState(0)
  const [filtroAtivo, setFiltroAtivo] = useState<'todas' | 'preferencial' | 'comum'>('todas')
  const [mostrarResumo, setMostrarResumo] = useState(false)
  const [mostrarDiagnostico, setMostrarDiagnostico] = useState(false)
  const [mostrarPopupChamarSenha, setMostrarPopupChamarSenha] = useState(false)
  const [configuracao, setConfiguracao] = useState<ConfiguracaoSenha | null>(null)
  const [totalGuiches, setTotalGuiches] = useState(0)

  // Próxima senha da fila geral (para o botão telefone)
  const proximaSenhaFila = useMemo(() => {
    if (todasSenhas.length === 0) return null
    return todasSenhas[0] // Sempre a primeira (mais antiga)
  }, [todasSenhas])
  
  // Senhas filtradas para navegação
  const senhasFiltradas = useMemo(() => {
    if (filtroAtivo === 'preferencial') return senhasPreferencial
    if (filtroAtivo === 'comum') return senhasComum
    return todasSenhas
  }, [filtroAtivo, senhasPreferencial, senhasComum, todasSenhas])
  
  // Senha sendo visualizada nos botões Voltar/Avançar
  const senhaVisualizada = senhasFiltradas[indiceVisualizacao]
  
  // Ajustar índice quando mudar o filtro
  useEffect(() => {
    console.log('🔍 CONTROLADOR - Senhas filtradas atualizadas:')
    console.log('   📊 Filtro ativo:', filtroAtivo)
    console.log('   📈 Total senhas filtradas:', senhasFiltradas.length)
    console.log('   📍 Índice atual:', indiceVisualizacao)
    
    if (senhasFiltradas.length === 0) {
      // Se não há senhas, resetar para 0
      console.log('   ⚠️ Nenhuma senha - resetando índice para 0')
      setIndiceVisualizacao(0)
    } else if (indiceVisualizacao >= senhasFiltradas.length) {
      // Se índice está além do array, ajustar para o último
      const novoIndice = senhasFiltradas.length - 1
      console.log(`   🔄 Ajustando índice de ${indiceVisualizacao} para ${novoIndice}`)
      setIndiceVisualizacao(novoIndice)
    }
  }, [senhasFiltradas.length, indiceVisualizacao, filtroAtivo])

  useEffect(() => {
    if (VERBOSE_LOGS) console.log('🎬 CONTROLADOR - useEffect INICIADO')
    carregarDados()
    
    // Atualizar a cada 5 segundos (reduzido de 2s)
    const interval = setInterval(() => carregarDados(), 5000)
    
    // Escutar eventos em tempo real
    const unsubscribeEmitida = senhaEventService.on('senha_emitida', (senha) => {
      if (VERBOSE_LOGS) console.log('🎫 CONTROLADOR - EVENTO senha_emitida RECEBIDO:', senha)
      carregarDados()
    })
    
    const unsubscribeChamada = senhaEventService.on('senha_chamada', (senha) => {
      console.log('📞 CONTROLADOR - EVENTO senha_chamada RECEBIDO:', senha)
      carregarDados()
    })
    
    const unsubscribeFinalizada = senhaEventService.on('senha_finalizada', (senha) => {
      console.log('✅ CONTROLADOR - EVENTO senha_finalizada RECEBIDO:', senha)
      carregarDados()
    })
    
    const unsubscribeGuiche = senhaEventService.on('guiche_atualizado', () => {
      if (VERBOSE_LOGS) console.log('🏢 CONTROLADOR - EVENTO guiche_atualizado RECEBIDO')
      carregarDados()
    })
    
    const unsubscribeConfig = senhaEventService.on('config_atualizada', () => {
      console.log('⚙️ CONTROLADOR - EVENTO config_atualizada RECEBIDO')
      console.log('🔄 Recarregando configuração de voz, formato de senha, etc...')
      setConfiguracao(senhaService.getConfiguracao())
      carregarDados()
    })
    
    console.log('👂 CONTROLADOR - Listeners registrados com sucesso')
    
    return () => {
      clearInterval(interval)
      unsubscribeEmitida()
      unsubscribeChamada()
      unsubscribeFinalizada()
      unsubscribeGuiche()
      unsubscribeConfig()
    }
  }, [])


  const tocarAudioSenha = (senha: Senha) => {
    try {
      console.log('═══════════════════════════════════════════════════')
      console.log('🔊 CONTROLADOR - tocarAudioSenha() CHAMADO!')
      console.log('   Senha:', senhaService.formatarSenha(senha))
      console.log('   Timestamp:', new Date().toLocaleTimeString())
      
      const config = senhaService.getConfiguracao()
      
      console.log('📋 CONFIGURAÇÃO CARREGADA:')
      console.log('   tipoAudio:', config.tipoAudio)
      console.log('   generoVoz:', config.generoVoz)
      console.log('   pitchVoz:', config.pitchVoz)
      console.log('   volumeVoz:', config.volumeVoz)
      console.log('   velocidadeVoz:', config.velocidadeVoz)
      
      // Sistema de LOCK ÚNICO para evitar múltiplos áudios
      const lockKey = `audio-lock-controlador-${senha.id}`
      const lockTimestamp = localStorage.getItem(lockKey)
      const agora = Date.now()
      
      // Se já existe um lock recente (< 2000ms), NÃO tocar
      if (lockTimestamp) {
        const tempoDecorrido = agora - parseInt(lockTimestamp)
        if (tempoDecorrido < 2000) {
          console.log('🔒 CONTROLADOR - ÁUDIO BLOQUEADO!')
          console.log('   Tempo decorrido:', tempoDecorrido + 'ms')
          console.log('   Já tocou há menos de 2s - IGNORANDO')
          console.log('═══════════════════════════════════════════════════')
          return
        }
      }
      
      // Adquirir o lock ANTES de tocar
      localStorage.setItem(lockKey, String(agora))
      console.log('🔓 CONTROLADOR - LOCK ADQUIRIDO!')
      console.log('   Vai tocar áudio AGORA')
      
      // Limpar o lock após 2 segundos
      setTimeout(() => {
        localStorage.removeItem(lockKey)
        console.log('🗑️ CONTROLADOR - Lock removido')
      }, 2000)
      
      // Tocar BEEP (som)
      if (config.tipoAudio === 'som' || config.tipoAudio === 'ambos') {
        const tipoSom = config.tipoSom || 'beep-simples'
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const volumeFinal = Math.max(0.3, (config.volumeSom || 90) / 100)
        
        console.log('🔔 CONTROLADOR - Tocando som:', tipoSom)
        
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
            // Beep único curto (padrão)
            criarBeep(880, 0.15)
            break
            
          case 'beep-duplo':
            // Dois beeps rápidos (banco)
            criarBeep(880, 0.1, 0)
            criarBeep(880, 0.1, 0.15)
            break
            
          case 'beep-triplo':
            // Três beeps curtos (hospital)
            criarBeep(1046, 0.08, 0)
            criarBeep(1046, 0.08, 0.12)
            criarBeep(1046, 0.08, 0.24)
            break
            
          case 'sino':
            // Som de sino suave (cartório)
            criarBeep(523, 0.3, 0)    // Dó
            criarBeep(659, 0.25, 0.1) // Mi
            break
            
          case 'campainha':
            // Campainha eletrônica (recepção)
            criarBeep(1318, 0.12, 0)
            criarBeep(1567, 0.12, 0.12)
            break
            
          case 'beep-longo':
            // Beep prolongado (atenção)
            criarBeep(880, 0.5, 0)
            break
            
          default:
            // Fallback para beep simples
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
          utterance.volume = (config.volumeVoz || 100) / 100
          utterance.rate = config.velocidadeVoz || 1.0
          utterance.pitch = config.pitchVoz || 1.2
          
          const genero = config.generoVoz || 'feminino'
          
          console.log('🎤 CONTROLADOR - Configurações de voz:')
          console.log('   👤 Gênero:', genero)
          console.log('   🎵 Pitch:', config.pitchVoz)
          console.log('   📊 Volume:', config.volumeVoz + '%')
          console.log('   ⚡ Velocidade:', config.velocidadeVoz + 'x')
          
          // LIMPAR FILA ANTES DE TUDO
          window.speechSynthesis.cancel()
          console.log('🧹 CONTROLADOR - Fila de voz limpa')
          
          // Selecionar voz por gênero
          const selecionarVoz = () => {
            const voices = window.speechSynthesis.getVoices()
            console.log('🔍 CONTROLADOR - Total de vozes:', voices.length)
            
            if (voices.length === 0) {
              console.warn('⚠️ CONTROLADOR - Nenhuma voz disponível')
              return null
            }
            
            // Listar vozes para debug
            console.log('📋 CONTROLADOR - Vozes disponíveis:')
            voices.forEach((v, i) => {
              console.log(`   ${i}: ${v.name} | ${v.lang}`)
            })
            
            let vozEscolhida = null
            
            if (genero === 'feminino') {
              console.log('🔍 CONTROLADOR - Procurando voz FEMININA...')
              vozEscolhida = voices.find(v => 
                v.lang.toLowerCase().includes('pt') && 
                (v.name.toLowerCase().includes('female') || 
                 v.name.toLowerCase().includes('feminino') ||
                 v.name.toLowerCase().includes('feminina') ||
                 v.name.toLowerCase().includes('maria'))
              )
            } else {
              console.log('🔍 CONTROLADOR - Procurando voz MASCULINA...')
              vozEscolhida = voices.find(v => 
                v.lang.toLowerCase().includes('pt') && 
                !v.name.toLowerCase().includes('female') &&
                (v.name.toLowerCase().includes('male') || 
                 v.name.toLowerCase().includes('masculino'))
              )
            }
            
            if (!vozEscolhida) {
              console.log('⚠️ CONTROLADOR - Voz específica não encontrada, usando qualquer PT')
              vozEscolhida = voices.find(v => v.lang.toLowerCase().includes('pt'))
            }
            
            if (vozEscolhida) {
              console.log('✅ CONTROLADOR - VOZ ESCOLHIDA:', vozEscolhida.name, '(', vozEscolhida.lang, ')')
            } else {
              console.warn('⚠️ CONTROLADOR - Nenhuma voz PT encontrada')
            }
            
            return vozEscolhida
          }
          
          const vozSelecionada = selecionarVoz()
          if (vozSelecionada) {
            utterance.voice = vozSelecionada
          }
          
          const falar = () => {
            console.log('🎙️ CONTROLADOR - Iniciando fala...')
            console.log('   📢 Mensagem:', mensagem)
            console.log('   👤 Gênero:', genero)
            console.log('   🎵 Pitch:', utterance.pitch)
            console.log('   📊 Volume:', utterance.volume)
            console.log('   ⚡ Rate:', utterance.rate)
            console.log('   🗣️ Voz:', utterance.voice?.name || 'padrão')
            
            window.speechSynthesis.speak(utterance)
            console.log('✅ CONTROLADOR - speechSynthesis.speak() EXECUTADO!')
          }
          
          // Aguardar vozes carregarem
          const voices = window.speechSynthesis.getVoices()
          if (voices.length === 0) {
            console.log('⏳ CONTROLADOR - Aguardando vozes serem carregadas...')
            window.speechSynthesis.onvoiceschanged = () => {
              console.log('🔄 CONTROLADOR - Vozes carregadas!')
              const voz = selecionarVoz()
              if (voz) utterance.voice = voz
              
              if (config.tipoAudio === 'ambos') {
                setTimeout(falar, 600)
              } else {
                falar()
              }
            }
          } else {
            console.log('✅ CONTROLADOR - Vozes já carregadas, tocando agora')
            if (config.tipoAudio === 'ambos') {
              setTimeout(falar, 600)
            } else {
              falar()
            }
          }
        }
      }
      
      console.log('═══════════════════════════════════════════════════')
    } catch (error) {
      console.error('❌ CONTROLADOR - Erro ao tocar áudio:', error)
      console.log('═══════════════════════════════════════════════════')
    }
  }

  const carregarDados = () => {
    if (VERBOSE_LOGS) console.log('📋 CONTROLADOR - carregarDados() chamado')
    const guiches = senhaService.getGuiches()
    setTotalGuiches(guiches.length)
    const funcionarioLogado = localStorage.getItem('user')
    
    // Carregar configuração
    setConfiguracao(senhaService.getConfiguracao())
    
    if (VERBOSE_LOGS) {
      console.log('👤 funcionarioLogado existe?', !!funcionarioLogado)
      console.log('🏢 Total de guichês:', guiches.length)
    }
    
    if (funcionarioLogado) {
      console.log('✅ Funcionário está logado, processando...')
      try {
        const user = JSON.parse(funcionarioLogado)
        if (VERBOSE_LOGS) {
          console.log('👤 User:', user.nome || user.name)
          console.log('📝 User completo:', user)
        }
        
        // Buscar guichê por codigo OU id do funcionário (prioritário: codigo)
        const userCodigo = user.codigo || user.id
        const userId = user.id
        
        let guiche = guiches.find(g => {
          // Comparar como string e número para garantir match
          const funcionarioIdStr = String(g.funcionarioId || '')
          const userCodigoStr = String(userCodigo || '')
          const userIdStr = String(userId || '')
          
          return (
            funcionarioIdStr === userCodigoStr ||
            funcionarioIdStr === userIdStr ||
            g.funcionarioId === userCodigo ||
            g.funcionarioId === userId
          )
        })
        
        if (!guiche) {
          // Criar guichê automaticamente se não encontrado
          console.log('🏗️ Criando guichê automaticamente...')
          const novoNumero = (guiches.length > 0 ? Math.max(...guiches.map(g => g.numero)) : 0) + 1
          guiche = {
            id: `guiche-${Date.now()}`,
            numero: novoNumero,
            nome: `Guichê ${novoNumero}`,
            ativo: true,
            funcionarioId: userCodigo,
            funcionarioNome: user.name || user.nome,
            servicosAtendidos: senhaService.getServicos().map(s => s.id),
            statusGuiche: 'livre'
          }
          guiches.push(guiche)
          senhaService.salvarGuiches(guiches)
          console.log('✅ Guichê criado:', guiche)
        }
        
        setMeuGuiche(guiche)
        if (VERBOSE_LOGS) console.log('🏢 Guichê definido:', guiche.numero)
        
        const senhas = senhaService.getSenhas()
        console.log('📦 getSenhas() retornou:', senhas.length, 'senhas')
        
        // Usar guiche! para garantir que não é undefined
        const senhaDoGuiche = senhas.find(s => 
          s.guicheId === guiche!.id && (s.status === 'chamando' || s.status === 'atendendo')
        )
        setSenhaAtual(senhaDoGuiche || null)
        
        // Separar senhas por tipo
        const pref = senhas.filter(s => s.status === 'aguardando' && s.prioridade)
        const comum = senhas.filter(s => s.status === 'aguardando' && !s.prioridade)
        const todas = senhas.filter(s => s.status === 'aguardando')
        
        if (VERBOSE_LOGS) {
          console.log(`📊 CONTROLADOR - Total senhas: ${senhas.length}`)
          console.log(`📊 CONTROLADOR - Aguardando: ${todas.length} (${pref.length}P + ${comum.length}C)`)
        }
        if (todas.length > 0) {
          console.log('📋 Lista de senhas:', todas.map(s => s.numeroCompleto).join(', '))
        }
        
        setSenhasPreferencial(pref)
        setSenhasComum(comum)
        setTodasSenhas(todas)
        console.log('✅ Estados atualizados com sucesso')
        console.log('📊 RESUMO - Preferenciais:', pref.length, '| Comuns:', comum.length, '| Total:', todas.length)
      } catch (error) {
        console.error('❌ ERRO em carregarDados:', error)
        setMeuGuiche(null)
      }
    } else {
      console.warn('⚠️ Nenhum funcionário logado!')
      setMeuGuiche(null)
    }
    if (VERBOSE_LOGS) console.log('🏁 carregarDados() finalizado')
  }

  const chamarSenhaManual = () => {
    if (!meuGuiche || !senhaManual.trim()) return
    
    const senhas = senhaService.getSenhas()
    const senha = senhas.find(s => s.numeroCompleto === senhaManual.trim().toUpperCase())
    
    if (senha) {
      setSenhaManual('')
      
      // Se ainda não foi chamada, chamar (chamarSenha já emite o som)
      if (senha.status === 'aguardando') {
        console.log('🟡 BOTÃO ON - Chamando fora de ordem:', senhaService.formatarSenha(senha))
        const senhaChamada = senhaService.chamarSenha(senha.id, meuGuiche.id)
        setSenhaAtual(senhaChamada)
        
        // Tocar áudio no CONTROLADOR também
        tocarAudioSenha(senhaChamada)
        
        setTimeout(() => {
          senhaService.iniciarAtendimento(senhaChamada.id)
          carregarDados()
        }, 3000)
      } else {
        // Se já foi chamada, apenas emitir som novamente
        console.log('🔔 BOTÃO ON - Re-chamando senha:', senhaService.formatarSenha(senha))
        tocarAudioSenha(senha) // Tocar áudio localmente
        senhaEventService.emit('senha_chamada', senha, 'Controlador')
      }
    }
  }




  const chamarProximaSenha = async () => {
    if (!meuGuiche) return
    
    // Se já tem senha em atendimento, apenas re-chamar (tocar som novamente)
    if (senhaAtual) {
      console.log('🔔 RE-CHAMADA - Usuário clicou para tocar som novamente')
      console.log('📡 Emitindo evento senha_chamada ÚNICO para:', senhaService.formatarSenha(senhaAtual))
      // Tocar áudio localmente
      tocarAudioSenha(senhaAtual)
      // APENAS emitir evento (NÃO chamar senhaService.chamarSenha de novo)
      senhaEventService.emit('senha_chamada', senhaAtual, 'Controlador-Rechamada')
      return
    }
    
    // Se não tem senha em atendimento, chamar a próxima da fila
    if (!proximaSenhaFila) {
      console.log('⚠️ Nenhuma senha aguardando')
      return
    }
    
    // VERIFICAÇÃO DE BLOQUEIO DE SENHAS COMUNS
    if (configuracao?.bloquearComumSePreferencialEsperando && !proximaSenhaFila.prioridade) {
      // A próxima senha é comum (C) - verificar se há preferenciais esperando há muito tempo
      const senhasPreferenciaisEsperando = senhasPreferencial.filter(s => s.status === 'aguardando')
      
      if (senhasPreferenciaisEsperando.length > 0) {
        const tempoLimite = (configuracao.tempoEsperaPreferencialParaBloquear || 20) * 60 * 1000 // minutos para ms
        const agora = Date.now()
        
        for (const senhaP of senhasPreferenciaisEsperando) {
          const tempoEspera = agora - new Date(senhaP.horaEmissao).getTime()
          
          if (tempoEspera >= tempoLimite) {
            const minutosEsperando = Math.floor(tempoEspera / 60000)
            await modal.alert(
              `⚠️ Não é possível chamar senhas comuns!\n\n` +
              `Há ${senhasPreferenciaisEsperando.length} senha(s) preferencial(is) aguardando.\n` +
              `A senha ${senhaP.numeroCompleto} está esperando há ${minutosEsperando} minutos.\n\n` +
              `Configuração: Bloqueio ativado após ${configuracao.tempoEsperaPreferencialParaBloquear} minutos.\n\n` +
              `Por favor, atenda as senhas preferenciais primeiro.`,
              'Bloqueio de Senhas Comuns',
              '🚫'
            )
            return // Bloquear a chamada
          }
        }
      }
    }
    
    console.log('📞 PRIMEIRA CHAMADA - Próxima senha:', senhaService.formatarSenha(proximaSenhaFila))
    console.log('⚠️ IMPORTANTE: senhaService.chamarSenha() vai emitir evento senha_chamada AUTOMATICAMENTE')
    // chamarSenha JÁ emite o evento senha_chamada automaticamente
    const senhaChamada = senhaService.chamarSenha(proximaSenhaFila.id, meuGuiche.id)
    console.log('✅ senhaService.chamarSenha() executado - evento já foi emitido pelo service')
    
    // Tocar áudio no CONTROLADOR também (primeira chamada)
    tocarAudioSenha(senhaChamada)
    
    setSenhaAtual(senhaChamada)
    setMostrarResumo(false)
    
    // Marcar como atendendo após 3 segundos
    setTimeout(() => {
      senhaService.iniciarAtendimento(senhaChamada.id)
      carregarDados()
    }, 3000)
  }
  
  const avancar = () => {
    if (indiceVisualizacao < senhasFiltradas.length - 1) {
      setIndiceVisualizacao(indiceVisualizacao + 1)
    }
  }

  const voltar = () => {
    if (indiceVisualizacao > 0) {
      setIndiceVisualizacao(indiceVisualizacao - 1)
    }
  }
  
  const toggleFiltro = (tipo: 'preferencial' | 'comum') => {
    if (filtroAtivo === tipo) {
      setFiltroAtivo('todas')
    } else {
      setFiltroAtivo(tipo)
    }
    setIndiceVisualizacao(0)
  }

  const finalizarAtendimento = () => {
    if (senhaAtual) {
      senhaService.finalizarAtendimento(senhaAtual.id)
      setSenhaAtual(null)
      setIndiceVisualizacao(0)
      carregarDados()
    }
  }

  const marcarComoAusente = () => {
    if (senhaAtual) {
      senhaService.marcarAusente(senhaAtual.id)
      setSenhaAtual(null)
      setIndiceVisualizacao(0)
      carregarDados()
    }
  }

  const corrigirSistema = () => {
    console.log('🔧 CORRIGINDO SISTEMA...')
    
    // 1. Verificar/criar funcionário ADM
    let funcionarios = JSON.parse(localStorage.getItem('funcionarios-cadastrados') || '[]')
    let admExiste = funcionarios.find((f: any) => f.codigo === 999 || f.login === 'adm')
    
    if (!admExiste) {
      console.log('👤 Criando funcionário ADM...')
      admExiste = {
        id: 'func-adm-999',
        codigo: 999,
        nome: 'ADM (Teste)',
        login: 'adm',
        senha: 'adm',
        email: 'adm@sistema.com',
        cpf: '000.000.000-00',
        emAtividade: true
      }
      funcionarios.push(admExiste)
      localStorage.setItem('funcionarios-cadastrados', JSON.stringify(funcionarios))
    }
    
    // 2. Fazer login
    console.log('🔐 Fazendo login...')
    const userData = {
      id: admExiste.id || admExiste.codigo,
      codigo: admExiste.codigo,
      email: admExiste.email,
      name: admExiste.nome,
      nome: admExiste.nome,
      login: admExiste.login,
      profile: 'employee',
      permissions: ['read', 'create'],
      funcionario: admExiste
    }
    localStorage.setItem('token', 'adm-token-' + Date.now())
    localStorage.setItem('user', JSON.stringify(userData))
    
    // 3. Criar/verificar guichê
    console.log('🏢 Criando guichê...')
    let guiches = senhaService.getGuiches()
    let guicheAdm = guiches.find((g: any) => String(g.funcionarioId) === '999' || String(g.funcionarioId) === String(admExiste.codigo))
    
    if (!guicheAdm) {
      const novoNumero = guiches.length > 0 ? Math.max(...guiches.map((g: any) => g.numero)) + 1 : 1
      guicheAdm = {
        id: 'guiche-adm-' + Date.now(),
        numero: novoNumero,
        nome: 'Guichê ADM',
        ativo: true,
        funcionarioId: 999,
        funcionarioNome: 'ADM (Teste)',
        servicosAtendidos: senhaService.getServicos().map((s: any) => s.id),
        statusGuiche: 'livre'
      }
      guiches.push(guicheAdm)
      senhaService.salvarGuiches(guiches)
    }
    
    // 4. Corrigir data
    localStorage.setItem('senha-ultima-data', new Date().toDateString())
    
    console.log('✅ Sistema corrigido!')
    alert('✅ Sistema corrigido!\n\nFuncionário: ADM (Teste)\nGuichê: ' + guicheAdm.numero + '\n\nRecarregando...')
    
    // Recarregar dados
    setTimeout(() => {
      carregarDados()
    }, 500)
  }

  const calcularTempoMedio = (senhas: Senha[]): { horas: number; minutos: number; segundos: number } => {
    if (senhas.length === 0) return { horas: 0, minutos: 0, segundos: 0 }
    
    const totalSegundos = senhas.reduce((acc, s) => {
      const esperaMs = agora.getTime() - new Date(s.horaEmissao).getTime()
      const esperaSegundos = Math.floor(esperaMs / 1000)
      return acc + esperaSegundos
    }, 0)
    
    const mediaSegundos = Math.floor(totalSegundos / senhas.length)
    const horas = Math.floor(mediaSegundos / 3600)
    const minutos = Math.floor((mediaSegundos % 3600) / 60)
    const segundos = mediaSegundos % 60
    
    return { horas, minutos, segundos }
  }
  
  const formatarTempo = (tempo: { horas: number; minutos: number; segundos: number }): string => {
    // Se tudo é zero
    if (tempo.horas === 0 && tempo.minutos === 0 && tempo.segundos === 0) return '0s'
    
    // Se tem horas
    if (tempo.horas > 0) {
      if (tempo.minutos === 0 && tempo.segundos === 0) return `${tempo.horas}h`
      if (tempo.segundos === 0) return `${tempo.horas}h ${tempo.minutos}min`
      return `${tempo.horas}h ${tempo.minutos}min ${tempo.segundos}s`
    }
    
    // Se tem apenas minutos e segundos
    if (tempo.minutos > 0) {
      if (tempo.segundos === 0) return `${tempo.minutos}min`
      return `${tempo.minutos}min ${tempo.segundos}s`
    }
    
    // Apenas segundos
    return `${tempo.segundos}s`
  }
  
  const calcularPorcentagemBarra = (tempo: { horas: number; minutos: number; segundos: number }): number => {
    const totalSegundos = tempo.horas * 3600 + tempo.minutos * 60 + tempo.segundos
    // Máximo de 2 horas (7200 segundos) = 100%
    const porcentagem = Math.min((totalSegundos / 7200) * 100, 100)
    return porcentagem
  }

  const guicheDisponivel = !!meuGuiche
  const semGuicheCadastrado = totalGuiches === 0

  return (
    <>
      <BasePage
        title="Controle de Atendimento"
        onClose={onClose}
        width="400px"
        height="580px"
        resizable={false}
        headerColor={headerColor}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: theme.background,
          padding: '16px',
          gap: '12px',
          position: 'relative'
        }}>
          
          {/* Diagnóstico - Mostrar se não houver guichê */}
          {!meuGuiche && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '2px solid #ef4444',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '8px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#991b1b', marginBottom: '8px' }}>
                {semGuicheCadastrado ? '⚠️ Nenhum guichê cadastrado' : '⚠️ Guichê não encontrado'}
              </div>
              <div style={{ fontSize: '12px', color: '#7f1d1d', marginBottom: '8px', lineHeight: 1.4 }}>
                {semGuicheCadastrado
                  ? (
                    <>
                      Cadastre ao menos um guichê em <strong>Cadastros &gt; Funcionário &gt; Guichês</strong> e atribua a um usuário.
                    </>
                  )
                  : (
                    <>
                      Você precisa estar logado e ter um guichê atribuído.
                    </>
                  )}
              </div>
              <button
                onClick={corrigirSistema}
                disabled={semGuicheCadastrado}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: semGuicheCadastrado ? '#94a3b8' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: semGuicheCadastrado ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  opacity: semGuicheCadastrado ? 0.7 : 1
                }}
              >
                {semGuicheCadastrado ? 'Cadastre um guichê para continuar' : '🔧 Corrigir Automaticamente'}
              </button>
            </div>
          )}
          {/* Chamar Senha Manual */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={senhaManual}
              onChange={(e) => setSenhaManual(e.target.value)}
              placeholder="Digite senha"
              style={{
                flex: 1,
              padding: '10px',
              fontSize: '14px',
              border: `1px solid ${theme.border}`,
              borderRadius: '4px',
              backgroundColor: theme.surface,
              color: theme.text
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') chamarSenhaManual()
              }}
            />
            <button
              onClick={chamarSenhaManual}
              style={{
                padding: '10px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                background: '#fbbf24',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                minWidth: '60px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              ON
            </button>
          </div>

          {/* Botões de Finalização */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={finalizarAtendimento}
              disabled={!senhaAtual}
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '15px',
                fontWeight: 'bold',
                background: senhaAtual ? '#10b981' : '#9ca3af',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: senhaAtual ? 'pointer' : 'not-allowed',
                opacity: senhaAtual ? 1 : 0.6,
                boxShadow: senhaAtual ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
              }}
              title="Cliente compareceu e foi atendido"
            >
              ✅ Finalizar Atendimento
            </button>
            <button
              onClick={marcarComoAusente}
              disabled={!senhaAtual}
              style={{
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 'bold',
                background: senhaAtual ? '#ef4444' : '#9ca3af',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: senhaAtual ? 'pointer' : 'not-allowed',
                opacity: senhaAtual ? 1 : 0.6,
                boxShadow: senhaAtual ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
              }}
              title="Cliente não compareceu"
            >
              ❌ Ausência
            </button>
          </div>

          {/* Campo unificado (navegação + estado) + Botões */}
          <div style={{
            backgroundColor: theme.surface,
            borderRadius: '8px',
            padding: '12px',
            border: `2px solid ${senhaAtual ? '#f59e0b' : theme.border}`
          }}>
            <div style={{
              fontSize: '12px',
              color: theme.textSecondary,
              marginBottom: '8px',
              textAlign: 'center',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              overflow: 'visible'
            }}>
              {senhaAtual ? (
                <span style={{ color: '#f59e0b' }}>🔔 Em Atendimento</span>
              ) : (
                <>
                  Visualizar Senhas ({senhasFiltradas.length === 0 ? '0/0' : `${indiceVisualizacao + 1}/${senhasFiltradas.length}`})
                  {filtroAtivo !== 'todas' && (
                    <span style={{ color: '#3b82f6', marginLeft: '4px' }}>
                      ({filtroAtivo === 'preferencial' ? 'P' : 'C'})
                    </span>
                  )}
                </>
              )}
            </div>
            
            {/* Campo + Botões na mesma linha */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{
                flex: 1,
                padding: '12px',
                backgroundColor: senhaAtual ? '#fef3c7' : theme.background,
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                color: senhaAtual ? '#92400e' : theme.text,
                minHeight: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${senhaAtual ? '#f59e0b' : theme.border}`,
                boxShadow: senhaAtual ? '0 2px 8px rgba(245, 158, 11, 0.3)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {senhaAtual ? senhaService.formatarSenha(senhaAtual) : (senhaVisualizada ? senhaService.formatarSenha(senhaVisualizada) : '--')}
              </div>
              
              <button
                onClick={() => {
                  if (senhaAtual) {
                    // Se já tem senha, apenas re-chamar
                    chamarProximaSenha()
                  } else {
                    // Se não tem senha, abrir popup de confirmação
                    setMostrarPopupChamarSenha(true)
                  }
                }}
                disabled={!proximaSenhaFila && !senhaAtual}
                style={{
                  padding: '12px 18px',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  background: (!proximaSenhaFila && !senhaAtual) ? '#9ca3af' : (senhaAtual ? '#f59e0b' : '#10b981'),
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (!proximaSenhaFila && !senhaAtual) ? 'not-allowed' : 'pointer',
                  opacity: (!proximaSenhaFila && !senhaAtual) ? 0.6 : 1,
                  boxShadow: (!proximaSenhaFila && !senhaAtual) ? 'none' : '0 3px 6px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '70px'
                }}
                title={senhaAtual ? "🔔 Re-chamar senha (tocar som novamente)" : "📢 Chamar próxima senha da fila"}
              >
                📢
              </button>
              
              <button
                onClick={() => setMostrarDiagnostico(!mostrarDiagnostico)}
                style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  justifyContent: 'center',
                  minWidth: '80px'
                }}
                title="Ver informações do sistema"
              >
                <span style={{ fontSize: '18px' }}>📋</span>
                <span>Info</span>
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={voltar}
                disabled={indiceVisualizacao === 0 || senhasFiltradas.length === 0 || !!senhaAtual}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  background: (indiceVisualizacao === 0 || senhasFiltradas.length === 0 || senhaAtual) ? '#d1d5db' : '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (indiceVisualizacao === 0 || senhasFiltradas.length === 0 || senhaAtual) ? 'not-allowed' : 'pointer',
                  opacity: (indiceVisualizacao === 0 || senhasFiltradas.length === 0 || senhaAtual) ? 0.5 : 1
                }}
                title={senhaAtual ? "Finalize o atendimento para navegar" : "Voltar"}
              >
                ◀ Voltar
              </button>
              <button
                onClick={avancar}
                disabled={indiceVisualizacao >= senhasFiltradas.length - 1 || senhasFiltradas.length === 0 || !!senhaAtual}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  background: (indiceVisualizacao >= senhasFiltradas.length - 1 || senhasFiltradas.length === 0 || senhaAtual) ? '#d1d5db' : '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (indiceVisualizacao >= senhasFiltradas.length - 1 || senhasFiltradas.length === 0 || senhaAtual) ? 'not-allowed' : 'pointer',
                  opacity: (indiceVisualizacao >= senhasFiltradas.length - 1 || senhasFiltradas.length === 0 || senhaAtual) ? 0.5 : 1
                }}
                title={senhaAtual ? "Finalize o atendimento para navegar" : "Avançar"}
              >
                Avançar ▶
              </button>
            </div>
          </div>
          
          {!guicheDisponivel && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '180px',
                bottom: 0,
                background: 'rgba(248, 250, 252, 0.85)',
                backdropFilter: 'blur(2px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                zIndex: 5,
                pointerEvents: 'auto'
              }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  padding: '18px',
                  maxWidth: '280px',
                  textAlign: 'center',
                  boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
                  color: '#1f2937',
                  fontSize: '13px',
                  lineHeight: 1.5
                }}
              >
                <strong style={{ display: 'block', marginBottom: '8px', color: '#ef4444', fontSize: '15px' }}>
                  Recursos bloqueados
                </strong>
                {semGuicheCadastrado ? (
                  <>
                    Para utilizar o controlador de atendimento, cadastre pelo menos um guichê no sistema
                    e atribua-o a um funcionário.
                  </>
                ) : (
                  <>
                    Para utilizar o controlador de atendimento, associe um guichê ao usuário logado
                    ou utilize o botão <em>"Corrigir Automaticamente"</em> no painel acima.
                  </>
                )}
              </div>
            </div>
          )}

          {/* Modal de Info/Diagnóstico */}
          {mostrarDiagnostico && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              zIndex: 9999,
              padding: '20px',
              overflowY: 'auto'
            }}>
              <div style={{
                backgroundColor: theme.surface,
                borderRadius: '12px',
                padding: '20px',
                color: theme.text,
                maxWidth: '350px',
                maxHeight: '80vh',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                {/* Header fixo */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '15px', 
                  borderBottom: `3px solid ${headerColor}`, 
                  paddingBottom: '10px',
                  flexShrink: 0
                }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: headerColor }}>📋 Informações do Sistema</h3>
                  <button
                    onClick={() => setMostrarDiagnostico(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#6b7280'
                    }}
                  >
                    ✕
                  </button>
                </div>
                
                {/* Conteúdo scrollável */}
                <div style={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  overflowX: 'hidden',
                  paddingRight: '8px'
                }}>
                  {/* PREFERENCIAL */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '13px', marginBottom: '6px', color: theme.text, fontWeight: 'bold' }}>
                      📊 Senhas PREFERENCIAL: <strong>{senhasPreferencial.length}</strong>
                    </div>
                    {senhasPreferencial.length > 0 && (
                      <div style={{ marginLeft: '20px', fontSize: '12px', color: theme.textSecondary }}>
                        {(() => {
                          const porServico: { [key: string]: number } = {}
                          senhasPreferencial.forEach(senha => {
                            const nome = senha.servico.nome
                            porServico[nome] = (porServico[nome] || 0) + 1
                          })
                          return Object.entries(porServico).map(([servico, qtd]) => (
                            <div key={servico} style={{ marginBottom: '4px' }}>
                              • {servico}: <strong>{qtd}</strong>
                            </div>
                          ))
                        })()}
                      </div>
                    )}
                  </div>

                  {/* COMUM */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '13px', marginBottom: '6px', color: theme.text, fontWeight: 'bold' }}>
                      📊 Senhas COMUM: <strong>{senhasComum.length}</strong>
                    </div>
                    {senhasComum.length > 0 && (
                      <div style={{ marginLeft: '20px', fontSize: '12px', color: theme.textSecondary }}>
                        {(() => {
                          const porServico: { [key: string]: number } = {}
                          senhasComum.forEach(senha => {
                            const nome = senha.servico.nome
                            porServico[nome] = (porServico[nome] || 0) + 1
                          })
                          return Object.entries(porServico).map(([servico, qtd]) => (
                            <div key={servico} style={{ marginBottom: '4px' }}>
                              • {servico}: <strong>{qtd}</strong>
                            </div>
                          ))
                        })()}
                      </div>
                    )}
                  </div>

                  {/* TOTAL */}
                  <div style={{ fontSize: '13px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb', color: theme.text, fontWeight: 'bold' }}>
                    📊 Total: <strong>{todasSenhas.length}</strong>
                  </div>
                </div>
                
                {!meuGuiche && (
                  <button
                    onClick={() => {
                      setMostrarDiagnostico(false)
                      corrigirSistema()
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      marginTop: '12px',
                      backgroundColor: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      flexShrink: 0
                    }}
                  >
                    🔧 Corrigir Sistema
                  </button>
                )}
              </div>
            </div>
          )}


          {/* Barras de Tempo */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
              fontSize: '13px',
              color: '#374151',
              fontWeight: 'bold'
            }}>
              <span>Fila</span>
              <span>Aguardando</span>
            </div>

            {/* Preferencial */}
            <div 
              onClick={() => toggleFiltro('preferencial')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                marginBottom: '10px',
                padding: '8px',
                borderRadius: '10px',
                backgroundColor: filtroAtivo === 'preferencial' 
                  ? (currentTheme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe')
                  : 'transparent',
                border: `2px solid ${filtroAtivo === 'preferencial' ? '#3b82f6' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: filtroAtivo === 'preferencial' ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: filtroAtivo === 'preferencial' ? '#3b82f6' : (currentTheme === 'dark' ? '#1e40af' : '#93c5fd'),
                border: `2px solid ${filtroAtivo === 'preferencial' ? '#1d4ed8' : (currentTheme === 'dark' ? '#3b82f6' : '#60a5fa')}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: filtroAtivo === 'preferencial' 
                  ? '0 4px 8px rgba(59, 130, 246, 0.4)' 
                  : '0 2px 4px rgba(59, 130, 246, 0.2)',
                transition: 'all 0.3s ease',
                flexShrink: 0
              }}>
                {filtroAtivo === 'preferencial' ? (
                  <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>✓</div>
                ) : (
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: currentTheme === 'dark' ? '#3b82f6' : '#1976d2'
                  }}></div>
                )}
              </div>
              <span style={{ 
                fontSize: '24px', 
                fontWeight: '800', 
                color: currentTheme === 'dark' ? '#93c5fd' : theme.text,
                width: '32px',
                textShadow: currentTheme === 'dark' ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
              }}>P</span>
              <div style={{ 
                flex: 1, 
                height: '32px', 
                backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#e0e0e0',
                borderRadius: '8px', 
                position: 'relative', 
                overflow: 'hidden', 
                boxShadow: currentTheme === 'dark' 
                  ? 'inset 0 2px 6px rgba(0,0,0,0.4)' 
                  : 'inset 0 2px 4px rgba(0,0,0,0.1)',
                border: currentTheme === 'dark' ? '1px solid #334155' : 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: senhasPreferencial.length > 0 ? `${calcularPorcentagemBarra(calcularTempoMedio(senhasPreferencial))}%` : '0%',
                  background: 'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)',
                  transition: 'width 0.5s ease'
                }}></div>
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: senhasPreferencial.length > 0 
                    ? '#fff' 
                    : (currentTheme === 'dark' ? '#64748b' : '#9ca3af'),
                  textShadow: senhasPreferencial.length > 0 ? '0 1px 3px rgba(0,0,0,0.7)' : 'none'
                }}>
                  {senhasPreferencial.length > 0 ? formatarTempo(calcularTempoMedio(senhasPreferencial)) : '0s'}
                </div>
              </div>
            </div>

            {/* Comum */}
            <div 
              onClick={() => toggleFiltro('comum')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                padding: '8px',
                borderRadius: '10px',
                backgroundColor: filtroAtivo === 'comum' 
                  ? (currentTheme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5')
                  : 'transparent',
                border: `2px solid ${filtroAtivo === 'comum' ? '#10b981' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: filtroAtivo === 'comum' ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: filtroAtivo === 'comum' ? '#10b981' : (currentTheme === 'dark' ? '#047857' : '#6ee7b7'),
                border: `2px solid ${filtroAtivo === 'comum' ? '#059669' : (currentTheme === 'dark' ? '#10b981' : '#34d399')}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: filtroAtivo === 'comum' 
                  ? '0 4px 8px rgba(16, 185, 129, 0.4)' 
                  : '0 2px 4px rgba(16, 185, 129, 0.2)',
                transition: 'all 0.3s ease',
                flexShrink: 0
              }}>
                {filtroAtivo === 'comum' ? (
                  <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>✓</div>
                ) : (
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: currentTheme === 'dark' ? '#10b981' : '#059669'
                  }}></div>
                )}
              </div>
              <span style={{ 
                fontSize: '24px', 
                fontWeight: '800', 
                color: currentTheme === 'dark' ? '#6ee7b7' : theme.text,
                width: '32px',
                textShadow: currentTheme === 'dark' ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
              }}>C</span>
              <div style={{ 
                flex: 1, 
                height: '32px', 
                backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#e0e0e0',
                borderRadius: '8px', 
                position: 'relative', 
                overflow: 'hidden', 
                boxShadow: currentTheme === 'dark' 
                  ? 'inset 0 2px 6px rgba(0,0,0,0.4)' 
                  : 'inset 0 2px 4px rgba(0,0,0,0.1)',
                border: currentTheme === 'dark' ? '1px solid #334155' : 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: senhasComum.length > 0 ? `${calcularPorcentagemBarra(calcularTempoMedio(senhasComum))}%` : '0%',
                  background: 'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)',
                  transition: 'width 0.5s ease'
                }}></div>
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: senhasComum.length > 0 
                    ? '#fff' 
                    : (currentTheme === 'dark' ? '#64748b' : '#9ca3af'),
                  textShadow: senhasComum.length > 0 ? '0 1px 3px rgba(0,0,0,0.7)' : 'none'
                }}>
                  {senhasComum.length > 0 ? formatarTempo(calcularTempoMedio(senhasComum)) : '0s'}
                </div>
              </div>
            </div>
          </div>

          {/* Guichê - Parte de baixo */}
          <div style={{
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: headerColor,
            color: '#fff',
            padding: '10px',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            🏢 Guichê {meuGuiche?.numero || '--'}
          </div>
        </div>
        
        {/* Popup Chamar Senha */}
        {mostrarPopupChamarSenha && proximaSenhaFila && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }} onClick={() => setMostrarPopupChamarSenha(false)}>
            <div style={{
              backgroundColor: theme.surface,
              borderRadius: '12px',
              width: '400px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }} onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div style={{
                padding: '20px',
                backgroundColor: headerColor,
                color: '#fff',
                textAlign: 'center',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                📢 Chamar Senha
              </div>

              {/* Corpo */}
              <div style={{ padding: '30px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '16px' }}>
                  Próxima senha da fila:
                </div>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: proximaSenhaFila.prioridade ? '#3b82f6' : '#10b981',
                  marginBottom: '16px',
                  fontFamily: 'monospace'
                }}>
                  {senhaService.formatarSenha(proximaSenhaFila)}
                </div>
                <div style={{
                  display: 'inline-block',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  backgroundColor: proximaSenhaFila.prioridade ? '#dbeafe' : '#d1fae5',
                  color: proximaSenhaFila.prioridade ? '#1e40af' : '#065f46',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '20px'
                }}>
                  {proximaSenhaFila.prioridade ? '⭐ Preferencial' : '📋 Comum'}
                </div>
                <div style={{ fontSize: '13px', color: theme.textSecondary }}>
                  Confirmar chamada desta senha?
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: '16px 20px',
                borderTop: `2px solid ${theme.border}`,
                display: 'flex',
                gap: '10px'
              }}>
                <button
                  onClick={() => setMostrarPopupChamarSenha(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: '#6b7280',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setMostrarPopupChamarSenha(false)
                    chamarProximaSenha()
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  ✓ Chamar
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal Component - DENTRO da janela */}
        <modal.ModalComponent />
      </BasePage>
    </>
  )
}
