import React, { useState, useEffect } from 'react'
import { senhaService } from '../services/SenhaService'
import { senhaEventService } from '../services/SenhaEventService'
import { ServicoSenha, Senha } from '../types/senha'

export function TerminalSenhaPage() {
  const [servicos, setServicos] = useState<ServicoSenha[]>([])
  const [horaAtual, setHoraAtual] = useState(new Date())
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<'preferencial' | 'comum' | null>(null)
  const [mostrarExclusao, setMostrarExclusao] = useState(false)
  const [senhasAtivas, setSenhasAtivas] = useState<Senha[]>([])
  const [config, setConfig] = useState(senhaService.getConfiguracao())

  useEffect(() => {
    carregarServicos()
    carregarSenhasAtivas()
    
    const timer = setInterval(() => {
      setHoraAtual(new Date())
    }, 1000)

    // Recarregar serviços a cada 5 segundos para sincronizar com configurações
    const timerServicos = setInterval(() => {
      carregarServicos()
      carregarSenhasAtivas()
    }, 5000)

    // Escutar eventos para debug
    const unsubscribeChamada = senhaEventService.on('senha_chamada', (senha) => {
      console.log('🔔 Terminal - Senha foi chamada:', senhaService.formatarSenha(senha))
      carregarSenhasAtivas()
    })

    const unsubscribeFinalizada = senhaEventService.on('senha_finalizada', (senha) => {
      console.log('🔔 Terminal - Senha foi finalizada:', senhaService.formatarSenha(senha))
      carregarSenhasAtivas()
    })
    
    const unsubscribeEmitida = senhaEventService.on('senha_emitida', () => {
      carregarSenhasAtivas()
    })
    
    // Escutar mudanças na configuração de serviços
    const unsubscribeConfig = senhaEventService.on('config_atualizada', () => {
      console.log('🔄 Terminal - Configuração atualizada, recarregando serviços')
      const novaConfig = senhaService.getConfiguracao()
      setConfig(novaConfig)
      carregarServicos()
    })

    return () => {
      clearInterval(timer)
      clearInterval(timerServicos)
      unsubscribeChamada()
      unsubscribeFinalizada()
      unsubscribeEmitida()
      unsubscribeConfig()
    }
  }, [])

  const carregarServicos = () => {
    const todosServicos = senhaService.getServicos().filter(s => {
      // Filtrar apenas serviços ativos
      if (!s.ativo) return false
      
      // Ignorar serviços com nomes genéricos de categoria
      const nomesIgnorar = [
        'Atendimento Preferencial',
        'Atendimento Comum',
        'Preferencial',
        'Comum',
        'Novo Serviço'
      ]
      
      if (nomesIgnorar.includes(s.nome)) {
        console.log('⚠️ Serviço ignorado (nome genérico):', s.nome)
        return false
      }
      
      return true
    })
    
    console.log('📋 Terminal - Serviços carregados:', todosServicos.length)
    console.log('📋 Serviços:', todosServicos.map(s => `${s.nome} (${s.sigla})`).join(', '))
    setServicos(todosServicos)
  }

  const carregarSenhasAtivas = () => {
    const senhas = senhaService.getSenhasAguardando()
    setSenhasAtivas(senhas)
  }

  const excluirSenha = (senhaId: string) => {
    if (confirm('Deseja realmente excluir esta senha?')) {
      senhaService.excluirSenha(senhaId)
      carregarSenhasAtivas()
    }
  }

  const imprimirSenhaTermica = (senha: Senha) => {
    const senhaFormatada = senhaService.formatarSenha(senha)
    const config = senhaService.getConfiguracao()
    
    // Construir impressão dinamicamente com base nas configurações
    let impressao = ''
    
    // Título (sempre mostrado)
    impressao += `${config.impressaoTitulo}\n\n`
    
    // Serviço
    if (config.impressaoMostrarServico) {
      impressao += `         ${senha.servico.nome}\n         \n`
    }
    
    // Categoria (Preferencial)
    if (config.impressaoMostrarCategoria && senha.prioridade) {
      impressao += `    ★ SENHA PREFERENCIAL ★\n    \n`
    }
    
    // Senha em caixa
    impressao += `         ┌─────────────┐\n`
    impressao += `         │             │\n`
    impressao += `         │   ${senhaFormatada.padStart(6)}    │\n`
    impressao += `         │             │\n`
    impressao += `         └─────────────┘\n\n`
    
    // Data
    if (config.impressaoMostrarData) {
      impressao += `Data: ${new Date(senha.horaEmissao).toLocaleDateString('pt-BR')}\n`
    }
    
    // Hora
    if (config.impressaoMostrarHora) {
      impressao += `Hora: ${new Date(senha.horaEmissao).toLocaleTimeString('pt-BR')}\n`
    }
    
    // Instrução
    if (config.impressaoMostrarInstrucao && config.impressaoMensagemInstrucao) {
      impressao += `\n${config.impressaoMensagemInstrucao}\n`
    }
    
    // Rodapé (com tracejado)
    if (config.impressaoMostrarRodape && config.impressaoMensagemRodape) {
      impressao += `\n================================\n`
      impressao += `    ${config.impressaoMensagemRodape}\n`
      impressao += `================================\n`
    }

    // Tentar imprimir via Electron
    if (window.electron?.print) {
      window.electron.print.printThermal(impressao)
        .then(() => console.log('✅ Impressão enviada'))
        .catch((err: Error) => console.error('❌ Erro na impressão:', err))
    } else {
      // Fallback: Abrir janela de impressão do navegador
      const printWindow = window.open('', '', 'width=300,height=600')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Senha - ${senhaFormatada}</title>
              <style>
                @media print {
                  @page { margin: 0; size: 58mm auto; }
                  body { margin: 0; padding: 10mm; }
                }
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  line-height: 1.4;
                  white-space: pre-wrap;
                }
              </style>
            </head>
            <body onload="window.print(); setTimeout(() => window.close(), 500);">
              ${impressao}
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    }
  }

  const emitirSenha = (servicoId: string, prioridade: boolean = false) => {
    try {
      const senha = senhaService.emitirSenha(servicoId, prioridade)
      
      // Imprimir senha térmica
      imprimirSenhaTermica(senha)
      
      // 🔇 SOM DESABILITADO - Terminal não precisa de áudio
      // (Som fica apenas no Painel Público)
      
      // NÃO exibir tela de confirmação - permanecer na tela de seleção
    } catch (error) {
      console.error('Erro ao emitir senha:', error)
    }
  }

  // Removido: Tela de confirmação da senha emitida
  // O terminal permanece sempre na tela de seleção

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#ecf1f4',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header - Configurável pelo Layout do Painel Público */}
      {(config.painelPublicoMostrarTitulo !== false || config.painelPublicoMostrarSubtitulo !== false) && (
        <div style={{
          padding: config.painelPublicoMostrarTitulo !== false && config.painelPublicoMostrarSubtitulo !== false ? '32px' :
                   config.painelPublicoMostrarTitulo === false && config.painelPublicoMostrarSubtitulo === false ? '0' :
                   '24px',
          background: `linear-gradient(135deg, ${config.painelPublicoCorHeader || '#1e3a8a'} 0%, ${config.painelPublicoCorSenhaDestaque || '#3b82f6'} 100%)`,
          color: config.painelPublicoCorTexto || '#fff',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          minHeight: config.painelPublicoMostrarTitulo === false && config.painelPublicoMostrarSubtitulo === false ? '0' : 'auto',
          transition: 'all 0.3s ease'
        }}>
          {config.painelPublicoMostrarTitulo !== false && (
            <h1 style={{ 
              margin: 0, 
              fontSize: '48px', 
              fontWeight: '700',
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
          <div style={{ 
            fontSize: '28px', 
            fontFamily: 'monospace', 
            fontWeight: '600',
            color: config.painelPublicoCorTexto || '#fff',
            opacity: 0.95
          }}>
            {horaAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      )}

      {/* Grid de Serviços */}
      <div style={{
        flex: 1,
        padding: '48px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>

        {/* TELA INICIAL: Mostrar apenas Categorias P e C */}
        {!categoriaSelecionada && (
          <div>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#1e3a8a',
              marginBottom: '32px',
              textAlign: 'center'
            }}>
              Selecione a Categoria de Atendimento
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '40px',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              {/* Categoria P - Preferencial */}
              <button
                onClick={() => setCategoriaSelecionada('preferencial')}
                onTouchStart={(e) => {
                  e.currentTarget.style.transform = 'scale(0.97)'
                  e.currentTarget.style.backgroundColor = '#eff6ff'
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.backgroundColor = '#fff'
                }}
                style={{
                  padding: '60px 40px',
                  backgroundColor: '#fff',
                  border: '6px solid #3b82f6',
                  borderRadius: '28px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 12px 32px rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px',
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!('ontouchstart' in window)) {
                    e.currentTarget.style.transform = 'translateY(-12px) scale(1.03)'
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(59, 130, 246, 0.4)'
                    e.currentTarget.style.backgroundColor = '#eff6ff'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!('ontouchstart' in window)) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.2)'
                    e.currentTarget.style.backgroundColor = '#fff'
                  }
                }}
              >
                <div style={{
                  width: '160px',
                  height: '160px',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '96px',
                  fontWeight: '700',
                  boxShadow: '0 12px 32px rgba(59, 130, 246, 0.4)'
                }}>
                  ⭐
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#3b82f6',
                  textAlign: 'center'
                }}>
                  Atendimento Preferencial
                </div>
                <div style={{
                  padding: '12px 24px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  borderRadius: '24px',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  ★ PRIORITÁRIO
                </div>
                <div style={{
                  fontSize: '16px',
                  color: '#64748b',
                  textAlign: 'center'
                }}>
                  Idosos 60+, Gestantes, PCD
                </div>
              </button>

              {/* Categoria C - Comum */}
              <button
                onClick={() => setCategoriaSelecionada('comum')}
                onTouchStart={(e) => {
                  e.currentTarget.style.transform = 'scale(0.97)'
                  e.currentTarget.style.backgroundColor = '#f0fdf4'
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.backgroundColor = '#fff'
                }}
                style={{
                  padding: '60px 40px',
                  backgroundColor: '#fff',
                  border: '6px solid #10b981',
                  borderRadius: '28px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 12px 32px rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px',
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!('ontouchstart' in window)) {
                    e.currentTarget.style.transform = 'translateY(-12px) scale(1.03)'
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(16, 185, 129, 0.4)'
                    e.currentTarget.style.backgroundColor = '#f0fdf4'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!('ontouchstart' in window)) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(16, 185, 129, 0.2)'
                    e.currentTarget.style.backgroundColor = '#fff'
                  }
                }}
              >
                <div style={{
                  width: '160px',
                  height: '160px',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '96px',
                  fontWeight: '700',
                  boxShadow: '0 12px 32px rgba(16, 185, 129, 0.4)'
                }}>
                  📋
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#10b981',
                  textAlign: 'center'
                }}>
                  Atendimento Comum
                </div>
                <div style={{
                  fontSize: '16px',
                  color: '#64748b',
                  textAlign: 'center'
                }}>
                  Atendimento Geral
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TELA DE SERVIÇOS: Mostrar serviços da categoria selecionada */}
        {categoriaSelecionada && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1
          }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: categoriaSelecionada === 'preferencial' ? '#3b82f6' : '#10b981',
              marginBottom: '32px',
              paddingBottom: '16px',
              borderBottom: `4px solid ${categoriaSelecionada === 'preferencial' ? '#3b82f6' : '#10b981'}`,
              textAlign: 'center'
            }}>
              {categoriaSelecionada === 'preferencial' ? '⭐ Atendimento Preferencial' : '📋 Atendimento Comum'}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '32px',
              width: '100%'
            }}>
              {servicos
                .filter(s => s.categoria === categoriaSelecionada || s.tipoSenha === categoriaSelecionada)
                .map((servico) => (
          <button
            key={servico.id}
            onClick={() => {
              emitirSenha(servico.id, categoriaSelecionada === 'preferencial')
              // Voltar para categorias após emitir
              setTimeout(() => setCategoriaSelecionada(null), 100)
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)'
              e.currentTarget.style.backgroundColor = `${servico.cor}20`
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.backgroundColor = '#fff'
            }}
            style={{
              padding: '48px 32px',
              backgroundColor: '#fff',
              border: `4px solid ${servico.cor}`,
              borderRadius: '24px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none',
              minHeight: '280px'
            }}
            onMouseEnter={(e) => {
              if (!('ontouchstart' in window)) {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                e.currentTarget.style.boxShadow = `0 16px 48px ${servico.cor}40`
                e.currentTarget.style.backgroundColor = `${servico.cor}10`
              }
            }}
            onMouseLeave={(e) => {
              if (!('ontouchstart' in window)) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
                e.currentTarget.style.backgroundColor = '#fff'
              }
            }}
          >
            <div style={{
              width: '120px',
              height: '120px',
              backgroundColor: servico.cor,
              color: '#fff',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '72px',
              fontWeight: '700',
              boxShadow: `0 8px 24px ${servico.cor}60`
            }}>
              {servico.sigla}
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a1a1a',
              textAlign: 'center'
            }}>
              {servico.nome}
            </div>
            {categoriaSelecionada === 'preferencial' && (
              <div style={{
                padding: '8px 20px',
                backgroundColor: '#ef4444',
                color: '#fff',
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                ★ PRIORITÁRIA
              </div>
            )}
          </button>
                ))}
            </div>
            
            {/* Mensagem se não houver serviços nesta categoria */}
            {servicos.filter(s => s.categoria === categoriaSelecionada || s.tipoSenha === categoriaSelecionada).length === 0 && (
              <div style={{
                padding: '80px',
                textAlign: 'center',
                color: '#666'
              }}>
                <div style={{ fontSize: '96px', marginBottom: '24px', opacity: 0.3 }}>
                  📭
                </div>
                <div style={{ fontSize: '32px', marginBottom: '12px', fontWeight: '600' }}>
                  Nenhum serviço nesta categoria
                </div>
                <div style={{ fontSize: '20px' }}>
                  Configure serviços em "Configuração de Senhas"
                </div>
              </div>
            )}
            
            {/* Botão Voltar embaixo - canto esquerdo */}
            {categoriaSelecionada && (
              <button
                onClick={() => setCategoriaSelecionada(null)}
                onTouchStart={(e) => {
                  e.currentTarget.style.backgroundColor = '#5a6268'
                  e.currentTarget.style.transform = 'scale(0.97)'
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.backgroundColor = '#6c757d'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                style={{
                  marginTop: '32px',
                  padding: '20px 40px',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '22px',
                  fontWeight: '700',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s ease',
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none',
                  minHeight: '70px',
                  alignSelf: 'flex-start'
                }}
                onMouseEnter={(e) => {
                  if (!('ontouchstart' in window)) {
                    e.currentTarget.style.backgroundColor = '#5a6268'
                    e.currentTarget.style.transform = 'translateY(-4px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!('ontouchstart' in window)) {
                    e.currentTarget.style.backgroundColor = '#6c757d'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                ← Voltar para Categorias
              </button>
            )}
          </div>
        )}

        {/* Mensagem quando não há nenhum serviço cadastrado no sistema */}
        {!categoriaSelecionada && servicos.length === 0 && (
          <div style={{
            padding: '120px 80px',
            textAlign: 'center',
            color: '#666'
          }}>
            <div style={{ fontSize: '120px', marginBottom: '32px', opacity: 0.3 }}>
              🎫
            </div>
            <div style={{ fontSize: '36px', marginBottom: '16px', fontWeight: '700' }}>
              Sistema em Configuração
            </div>
            <div style={{ fontSize: '22px' }}>
              Entre em contato com o administrador
            </div>
          </div>
        )}
      </div>

      {/* Botão de Gerenciar Senhas (canto inferior direito) */}
      {!mostrarExclusao && (
        <button
          onClick={() => {
            setMostrarExclusao(true)
            carregarSenhasAtivas()
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.9)'
            e.currentTarget.style.backgroundColor = '#dc2626'
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = '#ef4444'
          }}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '70px',
            height: '70px',
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '32px',
            fontWeight: '700',
            boxShadow: '0 6px 20px rgba(239, 68, 68, 0.5)',
            transition: 'all 0.2s ease',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            if (!('ontouchstart' in window)) {
              e.currentTarget.style.transform = 'scale(1.1)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(239, 68, 68, 0.7)'
            }
          }}
          onMouseLeave={(e) => {
            if (!('ontouchstart' in window)) {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)'
            }
          }}
          title="Gerenciar Senhas"
        >
          🗑️
        </button>
      )}

      {/* Modal de Exclusão de Senhas */}
      {mostrarExclusao && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '3px solid #ef4444'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '28px',
                color: '#1a1a1a',
                fontWeight: '700'
              }}>
                🗑️ Gerenciar Senhas
              </h2>
              <button
                onClick={() => setMostrarExclusao(false)}
                onTouchStart={(e) => {
                  e.currentTarget.style.color = '#1a1a1a'
                  e.currentTarget.style.transform = 'scale(0.9)'
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.color = '#6b7280'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '32px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  lineHeight: 1,
                  transition: 'all 0.2s ease',
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none'
                }}
              >
                ✕
              </button>
            </div>

            {/* Lista de Senhas */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              paddingRight: '8px'
            }}>
              {senhasAtivas.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#9ca3af'
                }}>
                  <div style={{ fontSize: '80px', marginBottom: '16px', opacity: 0.3 }}>
                    📭
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '600' }}>
                    Nenhuma senha aguardando
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {senhasAtivas.map((senha) => (
                    <div
                      key={senha.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 20px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '12px',
                        border: `3px solid ${senha.servico.cor}`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                        <div style={{
                          fontSize: '32px',
                          fontWeight: '700',
                          fontFamily: 'monospace',
                          color: senha.servico.cor,
                          minWidth: '120px'
                        }}>
                          {senhaService.formatarSenha(senha)}
                        </div>
                        <div>
                          <div style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1a1a1a',
                            marginBottom: '4px'
                          }}>
                            {senha.servico.nome}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            {senha.prioridade && '⭐ '}
                            Emitida: {new Date(senha.horaEmissao).toLocaleTimeString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => excluirSenha(senha.id)}
                        onTouchStart={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc2626'
                          e.currentTarget.style.transform = 'scale(0.95)'
                        }}
                        onTouchEnd={(e) => {
                          e.currentTarget.style.backgroundColor = '#ef4444'
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                          WebkitTapHighlightColor: 'transparent',
                          userSelect: 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!('ontouchstart' in window)) {
                            e.currentTarget.style.backgroundColor = '#dc2626'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!('ontouchstart' in window)) {
                            e.currentTarget.style.backgroundColor = '#ef4444'
                          }
                        }}
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '2px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '16px', color: '#6b7280' }}>
                Total: <strong>{senhasAtivas.length}</strong> senha{senhasAtivas.length !== 1 ? 's' : ''} aguardando
              </div>
              <button
                onClick={() => setMostrarExclusao(false)}
                onTouchStart={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563'
                  e.currentTarget.style.transform = 'scale(0.95)'
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.backgroundColor = '#6b7280'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!('ontouchstart' in window)) {
                    e.currentTarget.style.backgroundColor = '#4b5563'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!('ontouchstart' in window)) {
                    e.currentTarget.style.backgroundColor = '#6b7280'
                  }
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

