import React, { useState, useEffect, useRef } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { useModal } from '../hooks/useModal'
import { senhaService } from '../services/SenhaService'
import { ServicoSenha, ConfiguracaoSenha, TipoServico, CategoriaSenha, TipoAudio, CategoriaServico, FormatoSenha, LayoutPainelPublico, GeneroVoz } from '../types/senha'

interface ConfiguracaoSenhaPageProps {
  onClose: () => void
}

export function ConfiguracaoSenhaPage({ onClose }: ConfiguracaoSenhaPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const modal = useModal()
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
  
  const [abaAtiva, setAbaAtiva] = useState<'tipos' | 'servicos' | 'configuracao' | 'impressao'>('servicos')
  const [tiposServico, setTiposServico] = useState<TipoServico[]>([])
  const [categorias, setCategorias] = useState<CategoriaServico[]>([])
  const [servicos, setServicos] = useState<ServicoSenha[]>([])
  const [configuracao, setConfiguracao] = useState<ConfiguracaoSenha | null>(null)
  const [servicoEditando, setServicoEditando] = useState<ServicoSenha | null>(null)
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<{ [key: string]: boolean }>({})
  
  // Estados para modais
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false)
  const [mostrarModalServico, setMostrarModalServico] = useState(false)
  const [mostrarModalDicas, setMostrarModalDicas] = useState(false)
  const [mostrarCoresCategorias, setMostrarCoresCategorias] = useState(false)
  const [mostrarCoresPainel, setMostrarCoresPainel] = useState(false)
  const [categoriaNovoServico, setCategoriaNovoServico] = useState<string | null>(null)
  const [nomeNovoServico, setNomeNovoServico] = useState('')
  const [siglaNovoServico, setSiglaNovoServico] = useState('')
  const [cadastrarEmP, setCadastrarEmP] = useState(false)
  const [cadastrarEmC, setCadastrarEmC] = useState(false)
  const [adicionarLetraPCAutomaticamente, setAdicionarLetraPCAutomaticamente] = useState(true)
  const [configuracaoSomAlterada, setConfiguracaoSomAlterada] = useState(false)
  
  // Usar useRef para salvar configuração original (não causa re-render)
  const configuracaoOriginalRef = useRef<{ tipoAudio?: TipoAudio, tipoSom?: string, volumeSom?: number } | null>(null)

  useEffect(() => {
    carregarDados()
  }, [])
  
  // Inicializar configuração original apenas uma vez quando configuração for carregada
  useEffect(() => {
    if (configuracao && !configuracaoOriginalRef.current) {
      configuracaoOriginalRef.current = {
        tipoAudio: configuracao.tipoAudio,
        tipoSom: configuracao.tipoSom,
        volumeSom: configuracao.volumeSom
      }
      console.log('💾 Config original salva:', configuracaoOriginalRef.current)
    }
  }, [configuracao])
  
  // Verificar alterações sempre que configuração mudar
  useEffect(() => {
    if (configuracao && configuracaoOriginalRef.current) {
      const alterou = 
        configuracao.tipoAudio !== configuracaoOriginalRef.current.tipoAudio ||
        configuracao.tipoSom !== configuracaoOriginalRef.current.tipoSom ||
        configuracao.volumeSom !== configuracaoOriginalRef.current.volumeSom
      
      console.log('🔍 Verificando alterações:', {
        tipoAudioAtual: configuracao.tipoAudio,
        tipoAudioOriginal: configuracaoOriginalRef.current.tipoAudio,
        tipoSomAtual: configuracao.tipoSom,
        tipoSomOriginal: configuracaoOriginalRef.current.tipoSom,
        volumeSomAtual: configuracao.volumeSom,
        volumeSomOriginal: configuracaoOriginalRef.current.volumeSom,
        alterou
      })
      
      setConfiguracaoSomAlterada(alterou)
    }
  }, [configuracao?.tipoAudio, configuracao?.tipoSom, configuracao?.volumeSom])

  const carregarDados = () => {
    // Categorias P e C são FIXAS - sempre as mesmas (mas cores configuráveis)
    const config = senhaService.getConfiguracao()
    const categoriasFixas: CategoriaServico[] = [
      {
        id: 'cat-preferencial',
        nome: 'Preferencial',
        tipo: 'preferencial',
        sigla: 'P',
        cor: config.corCategoriaPreferencial || '#3b82f6',
        ativo: true,
        ordem: 1
      },
      {
        id: 'cat-comum',
        nome: 'Comum',
        tipo: 'comum',
        sigla: 'C',
        cor: config.corCategoriaComum || '#10b981',
        ativo: true,
        ordem: 2
      }
    ]
    setCategorias(categoriasFixas)
    
    setServicos(senhaService.getServicos())
    setConfiguracao(config)
  }

  const salvarServicos = async () => {
    senhaService.salvarServicos(servicos)
    await modal.alert('✅ Serviços salvos com sucesso!', 'Sucesso', '✅')
  }
  
  // Recarregar categorias quando cores mudarem
  useEffect(() => {
    if (configuracao) {
      carregarDados()
    }
  }, [configuracao?.corCategoriaPreferencial, configuracao?.corCategoriaComum])

  const aplicarPerfilVoz = (genero: 'feminino' | 'masculino') => {
    if (!configuracao) return
    
    // Perfis ideais para cada gênero
    const perfis = {
      feminino: {
        generoVoz: 'feminino' as const,
        pitchVoz: 1.3,      // Tom mais agudo (feminino)
        velocidadeVoz: 1.0,  // Velocidade normal
        volumeVoz: 100       // Volume máximo
      },
      masculino: {
        generoVoz: 'masculino' as const,
        pitchVoz: 0.85,     // Tom mais grave (masculino)
        velocidadeVoz: 0.95, // Levemente mais lento
        volumeVoz: 100       // Volume máximo
      }
    }
    
    const perfil = perfis[genero]
    
    setConfiguracao({
      ...configuracao,
      ...perfil
    })
    
    console.log(`✅ Perfil de voz "${genero}" aplicado:`, perfil)
    modal.alert(
      `Perfil de voz ${genero === 'feminino' ? '👩 Feminina' : '👨 Masculina'} aplicado!\n\n` +
      `Tom: ${perfil.pitchVoz} ${perfil.pitchVoz > 1.1 ? '(Agudo)' : '(Grave)'}\n` +
      `Velocidade: ${perfil.velocidadeVoz}x\n` +
      `Volume: ${perfil.volumeVoz}%\n\n` +
      `Você pode ajustar manualmente se desejar.`,
      'Perfil Aplicado',
      '✅'
    )
  }

  const testarSom = () => {
    if (!configuracao) return
    
    try {
      const tipoSom = configuracao.tipoSom || 'beep-simples'
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const volumeFinal = Math.max(0.3, (configuracao.volumeSom || 90) / 100)
      
      console.log('🧪 TESTE - Tocando som:', tipoSom, '| Volume:', (volumeFinal * 100).toFixed(0) + '%')
      
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
      
      console.log('✅ TESTE - Som tocado com sucesso!')
    } catch (error) {
      console.error('❌ TESTE - Erro ao tocar som:', error)
      modal.alert('Erro ao testar o som. Verifique se o áudio está habilitado.', 'Erro', '❌')
    }
  }

  const salvarConfiguracao = async () => {
    if (configuracao) {
      senhaService.salvarConfiguracao(configuracao)
      // Atualizar configuração original para resetar flag de alteração
      configuracaoOriginalRef.current = {
        tipoAudio: configuracao.tipoAudio,
        tipoSom: configuracao.tipoSom,
        volumeSom: configuracao.volumeSom
      }
      setConfiguracaoSomAlterada(false)
      console.log('✅ Config salva, nova original:', configuracaoOriginalRef.current)
      await modal.alert('✅ Configurações salvas com sucesso!', 'Sucesso', '✅')
    }
  }

  // Categorias P e C são fixas - não podem ser adicionadas/removidas

  const abrirModalServico = (categoriaId?: string) => {
    setCategoriaNovoServico(categoriaId || null)
    setNomeNovoServico('')
    setSiglaNovoServico('')
    setCadastrarEmP(false)
    setCadastrarEmC(false)
    setAdicionarLetraPCAutomaticamente(true)
    setMostrarModalServico(true)
  }

  const gerarPreviewSenha = (categoria: string, numero: number): string => {
    if (!configuracao) return `${categoria}${numero.toString().padStart(3, '0')}`
    
    const formato = configuracao.formatoSenha || 'padrao'
    
    switch (formato) {
      case 'padrao':
        return `${categoria}${numero.toString().padStart(3, '0')}` // P001
      case 'compacto':
        return `${categoria}${numero}` // P1
      case 'extenso':
        return `${categoria}${numero.toString().padStart(4, '0')}` // P0001
      case 'personalizado':
        const template = configuracao.formatoPersonalizado || '{categoria}{numero:3}'
        return template
          .replace('{categoria}', categoria)
          .replace(/\{numero:(\d+)\}/g, (_, digits) => numero.toString().padStart(parseInt(digits), '0'))
          .replace('{numero}', numero.toString())
      default:
        return `${categoria}${numero.toString().padStart(3, '0')}`
    }
  }

  const salvarNovoServico = () => {
    if (!nomeNovoServico.trim() || !siglaNovoServico.trim()) {
      modal.alert('Por favor, preencha o nome e a sigla do serviço', 'Erro', '❌')
      return
    }

    if (!cadastrarEmP && !cadastrarEmC) {
      modal.alert('Selecione ao menos uma categoria (P ou C)', 'Erro', '❌')
      return
    }

    const novosServicos: ServicoSenha[] = []

    // Criar serviço Preferencial (P)
    if (cadastrarEmP) {
      const catP = categorias.find(c => c.tipo === 'preferencial')
      if (catP) {
        novosServicos.push({
          id: `servico-${Date.now()}-p`,
          categoriaId: catP.id,
          categoria: 'preferencial',
          nome: `${nomeNovoServico} Preferencial`,
          sigla: adicionarLetraPCAutomaticamente ? `${siglaNovoServico}P` : siglaNovoServico,
          cor: catP.cor,
          ativo: true,
          ordem: servicos.length + novosServicos.length + 1,
          tipoSenha: 'preferencial',
          tempoMedioAtendimento: 15
        })
      }
    }

    // Criar serviço Comum (C)
    if (cadastrarEmC) {
      const catC = categorias.find(c => c.tipo === 'comum')
      if (catC) {
        novosServicos.push({
          id: `servico-${Date.now()}-c`,
          categoriaId: catC.id,
          categoria: 'comum',
          nome: `${nomeNovoServico} Comum`,
          sigla: adicionarLetraPCAutomaticamente ? `${siglaNovoServico}C` : siglaNovoServico,
          cor: catC.cor,
          ativo: true,
          ordem: servicos.length + novosServicos.length + 1,
          tipoSenha: 'comum',
          tempoMedioAtendimento: 15
        })
      }
    }

    setServicos([...servicos, ...novosServicos])
    senhaService.salvarServicos([...servicos, ...novosServicos])
    setMostrarModalServico(false)
    
    modal.alert(
      `✅ ${novosServicos.length} serviço(s) criado(s) com sucesso!`,
      'Sucesso',
      '✅'
    )
  }

  const adicionarServico = () => {
    const novoServico: ServicoSenha = {
      id: `servico-${Date.now()}`,
      nome: 'Novo Serviço',
      sigla: 'N',
      cor: '#6b7280',
      ativo: true,
      ordem: servicos.length + 1,
      categoria: 'comum',
      tipoSenha: 'comum',
      tempoMedioAtendimento: 15
    }
    setServicos([...servicos, novoServico])
  }

  const removerServico = async (id: string) => {
    const confirmar = await modal.confirm(
      'Tem certeza que deseja remover este serviço?\n\nAs senhas deste serviço não serão mais geradas.',
      'Confirmar Remoção',
      '⚠️'
    )
    
    if (confirmar) {
      setServicos(servicos.filter(s => s.id !== id))
    }
  }

  const cores = [
    { nome: 'Azul', valor: '#3b82f6' },
    { nome: 'Verde', valor: '#10b981' },
    { nome: 'Roxo', valor: '#8b5cf6' },
    { nome: 'Laranja', valor: '#f59e0b' },
    { nome: 'Vermelho', valor: '#ef4444' },
    { nome: 'Rosa', valor: '#ec4899' },
    { nome: 'Ciano', valor: '#06b6d4' },
    { nome: 'Cinza', valor: '#6b7280' }
  ]

  const tiposCategorias: { categoria: CategoriaSenha; nome: string; descricao: string }[] = [
    { categoria: 'preferencial', nome: 'Preferencial', descricao: 'Idosos 60+, gestantes, PCD' },
    { categoria: 'comum', nome: 'Comum', descricao: 'Atendimento geral' }
  ]

  const tiposAudio: { tipo: TipoAudio; nome: string; descricao: string }[] = [
    { tipo: 'voz', nome: 'Voz (TTS)', descricao: 'Sintetização de voz' },
    { tipo: 'som', nome: 'Som (Beep)', descricao: 'Apenas sinal sonoro' },
    { tipo: 'ambos', nome: 'Voz + Som', descricao: 'Som e voz juntos' },
    { tipo: 'nenhum', nome: 'Nenhum', descricao: 'Silencioso' }
  ]

  return (
    <>
      <BasePage
        title="Configuração de Senhas"
        onClose={onClose}
        width="1000px"
        height="700px"
        resizable={false}
        headerColor={headerColor}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
          {/* Abas */}
          <div style={{
            display: 'flex',
            borderBottom: `2px solid ${theme.border}`,
            backgroundColor: theme.surface
          }}>
            <button
              onClick={() => setAbaAtiva('servicos')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: abaAtiva === 'servicos' ? headerColor : theme.surface,
                color: abaAtiva === 'servicos' ? '#fff' : theme.text,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              🎫 Serviços de Atendimento
            </button>
            <button
              onClick={() => setAbaAtiva('configuracao')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: abaAtiva === 'configuracao' ? headerColor : theme.surface,
                color: abaAtiva === 'configuracao' ? '#fff' : theme.text,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              ⚙️ Configurações Gerais
            </button>
            <button
              onClick={() => setAbaAtiva('impressao')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: abaAtiva === 'impressao' ? headerColor : theme.surface,
                color: abaAtiva === 'impressao' ? '#fff' : theme.text,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              🖨️ Impressão de Senhas
            </button>
          </div>

          {/* Conteúdo */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: theme.background }}>
            {/* ABA: Serviços */}
            {abaAtiva === 'servicos' && (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: theme.text }}>
                        Categorias de Atendimento
                      </h3>
                      <p style={{ margin: 0, fontSize: '13px', color: theme.textSecondary }}>
                        Configure categorias (P/C) e seus serviços
                      </p>
                    </div>
                    <button
                      onClick={() => setMostrarModalDicas(true)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563eb'
                        e.currentTarget.style.transform = 'scale(1.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#3b82f6'
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                      title="Ver dicas de como adicionar serviços"
                    >
                      💡
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                      onClick={() => setMostrarCoresCategorias(!mostrarCoresCategorias)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: theme.surface,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.border}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.surface}
                      title="Personalizar cores das categorias"
                    >
                      🎨 Cores
                    </button>
                    <button
                      onClick={() => abrirModalServico()}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}
                    >
                      + Adicionar Serviço
                    </button>
                  </div>
                </div>

                {/* Painel de Cores das Categorias (expansível) */}
                {mostrarCoresCategorias && (
                  <div style={{
                    backgroundColor: theme.surface,
                    border: `2px solid ${theme.border}`,
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: theme.text }}>
                      🎨 Personalização de Cores
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      {/* Cor Categoria Preferencial (P) */}
                      <div>
                        <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
                          ⭐ Categoria Preferencial (P)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="color"
                            value={configuracao?.corCategoriaPreferencial || '#3b82f6'}
                            onChange={(e) => {
                              if (configuracao) {
                                const novaConfig = { ...configuracao, corCategoriaPreferencial: e.target.value }
                                setConfiguracao(novaConfig)
                                senhaService.salvarConfiguracao(novaConfig)
                              }
                            }}
                            style={{ 
                              width: '50px',
                              height: '36px',
                              border: `1px solid ${theme.border}`,
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          />
                          <input
                            type="text"
                            value={configuracao?.corCategoriaPreferencial || '#3b82f6'}
                            onChange={(e) => {
                              if (configuracao) {
                                const novaConfig = { ...configuracao, corCategoriaPreferencial: e.target.value }
                                setConfiguracao(novaConfig)
                                senhaService.salvarConfiguracao(novaConfig)
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: '8px',
                              fontSize: '12px',
                              border: `1px solid ${theme.border}`,
                              borderRadius: '4px',
                              backgroundColor: theme.background,
                              color: theme.text,
                              fontFamily: 'monospace'
                            }}
                            placeholder="#3b82f6"
                          />
                        </div>
                      </div>

                      {/* Cor Categoria Comum (C) */}
                      <div>
                        <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
                          📋 Categoria Comum (C)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="color"
                            value={configuracao?.corCategoriaComum || '#10b981'}
                            onChange={(e) => {
                              if (configuracao) {
                                const novaConfig = { ...configuracao, corCategoriaComum: e.target.value }
                                setConfiguracao(novaConfig)
                                senhaService.salvarConfiguracao(novaConfig)
                              }
                            }}
                            style={{ 
                              width: '50px',
                              height: '36px',
                              border: `1px solid ${theme.border}`,
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          />
                          <input
                            type="text"
                            value={configuracao?.corCategoriaComum || '#10b981'}
                            onChange={(e) => {
                              if (configuracao) {
                                const novaConfig = { ...configuracao, corCategoriaComum: e.target.value }
                                setConfiguracao(novaConfig)
                                senhaService.salvarConfiguracao(novaConfig)
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: '8px',
                              fontSize: '12px',
                              border: `1px solid ${theme.border}`,
                              borderRadius: '4px',
                              backgroundColor: theme.background,
                              color: theme.text,
                              fontFamily: 'monospace'
                            }}
                            placeholder="#10b981"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista Hierárquica: Categorias e Serviços */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {categorias.sort((a, b) => a.ordem - b.ordem).map((categoria) => {
                    const servicosDaCategoria = servicos.filter(s => s.categoriaId === categoria.id)
                    const isExpanded = categoriasExpandidas[categoria.id] === true // Fechado por padrão
                    
                    return (
                    <div
                      key={categoria.id}
                      style={{
                        backgroundColor: theme.surface,
                        border: `3px solid ${categoria.cor}`,
                        borderRadius: '16px',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Header da Categoria */}
                      <div 
                        onClick={() => setCategoriasExpandidas({ 
                          ...categoriasExpandidas, 
                          [categoria.id]: !isExpanded 
                        })}
                        style={{
                          padding: '20px',
                          backgroundColor: categoria.cor + '20',
                          borderBottom: isExpanded ? `2px solid ${categoria.cor}` : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div style={{
                          width: '60px',
                          height: '60px',
                          backgroundColor: categoria.cor,
                          color: '#fff',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '32px',
                          fontWeight: '700',
                          boxShadow: `0 4px 12px ${categoria.cor}60`
                        }}>
                          {categoria.sigla}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: theme.text }}>
                            {categoria.nome}
                          </div>
                          <div style={{ fontSize: '13px', color: theme.textSecondary, marginTop: '4px' }}>
                            {servicosDaCategoria.length} serviço(s) cadastrado(s)
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            abrirModalServico(categoria.id)
                          }}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: categoria.cor,
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}
                        >
                          + Adicionar Serviço
                        </button>
                        
                        <div style={{ 
                          fontSize: '24px',
                          color: theme.textSecondary,
                          transition: 'transform 0.3s ease',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                          ▼
                        </div>
                      </div>
                      
                      {/* Lista de Serviços da Categoria */}
                      {isExpanded && servicosDaCategoria.length > 0 && (
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {servicosDaCategoria.sort((a, b) => a.ordem - b.ordem).map((servico) => (
                            <div
                              key={servico.id}
                      style={{
                        padding: '20px',
                        backgroundColor: theme.surface,
                        border: `2px solid ${servico.ativo ? servico.cor : theme.border}`,
                        borderRadius: '12px',
                        opacity: servico.ativo ? 1 : 0.6
                      }}
                    >
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        {/* Badge da Sigla */}
                        <div style={{
                          width: '60px',
                          height: '60px',
                          backgroundColor: servico.cor,
                          color: '#fff',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '28px',
                          fontWeight: '700',
                          boxShadow: `0 4px 12px ${servico.cor}40`
                        }}>
                          {servico.sigla}
                        </div>

                        {/* Informações */}
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                          <div>
                            <input
                              type="text"
                              value={servico.nome}
                              onChange={(e) => {
                                const novosServicos = servicos.map(s =>
                                  s.id === servico.id ? { ...s, nome: e.target.value } : s
                                )
                                setServicos(novosServicos)
                              }}
                              style={{
                                width: '100%',
                                padding: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '6px',
                                backgroundColor: theme.background,
                                color: theme.text
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '11px', color: theme.textSecondary, display: 'block', marginBottom: '4px' }}>
                              Sigla
                            </label>
                            <input
                              type="text"
                              maxLength={2}
                              value={servico.sigla}
                              onChange={(e) => {
                                const novosServicos = servicos.map(s =>
                                  s.id === servico.id ? { ...s, sigla: e.target.value.toUpperCase() } : s
                                )
                                setServicos(novosServicos)
                              }}
                              style={{
                                width: '100%',
                                padding: '8px',
                                fontSize: '16px',
                                fontWeight: '700',
                                textAlign: 'center',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '6px',
                                backgroundColor: theme.background,
                                color: theme.text
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '11px', color: theme.textSecondary, display: 'block', marginBottom: '4px' }}>
                              Cor
                            </label>
                            <select
                              value={servico.cor}
                              onChange={(e) => {
                                const novosServicos = servicos.map(s =>
                                  s.id === servico.id ? { ...s, cor: e.target.value } : s
                                )
                                setServicos(novosServicos)
                              }}
                              style={{
                                width: '100%',
                                padding: '8px',
                                fontSize: '13px',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '6px',
                                backgroundColor: theme.background,
                                color: theme.text
                              }}
                            >
                              {cores.map(cor => (
                                <option key={cor.valor} value={cor.valor}>{cor.nome}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label style={{ fontSize: '11px', color: theme.textSecondary, display: 'block', marginBottom: '4px' }}>
                              Tempo Médio
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="120"
                              value={servico.tempoMedioAtendimento || 15}
                              onChange={(e) => {
                                const novosServicos = servicos.map(s =>
                                  s.id === servico.id ? { 
                                    ...s, 
                                    tempoMedioAtendimento: parseInt(e.target.value) || 15
                                  } : s
                                )
                                setServicos(novosServicos)
                              }}
                              style={{
                                width: '100%',
                                padding: '8px',
                                fontSize: '13px',
                                textAlign: 'center',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '6px',
                                backgroundColor: theme.background,
                                color: theme.text
                              }}
                            />
                            <div style={{ fontSize: '10px', color: theme.textSecondary, marginTop: '2px', textAlign: 'center' }}>
                              minutos
                            </div>
                          </div>
                        </div>

                        {/* Ações */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: theme.text
                          }}>
                            <input
                              type="checkbox"
                              checked={servico.ativo}
                              onChange={(e) => {
                                const novosServicos = servicos.map(s =>
                                  s.id === servico.id ? { ...s, ativo: e.target.checked } : s
                                )
                                setServicos(novosServicos)
                              }}
                              style={{ width: '16px', height: '16px' }}
                            />
                            Ativo
                          </label>
                          <button
                            onClick={() => removerServico(servico.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            🗑️ Remover
                          </button>
                        </div>
                      </div>
                    </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Mensagem quando não há serviços na categoria */}
                      {isExpanded && servicosDaCategoria.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>
                          <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>📭</div>
                          <div style={{ fontSize: '13px' }}>
                            Nenhum serviço nesta categoria
                          </div>
                        </div>
                      )}
                    </div>
                    )
                  })}
                </div>

                {/* Mensagem quando não há categorias */}
                {categorias.length === 0 && (
                  <div style={{
                    padding: '60px',
                    textAlign: 'center',
                    color: theme.textSecondary
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.3 }}>📁</div>
                    <div style={{ fontSize: '18px', marginBottom: '8px' }}>
                      Nenhuma categoria cadastrada
                    </div>
                    <div style={{ fontSize: '13px' }}>
                      Clique em "Adicionar Categoria" para começar
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ABA: Configurações Gerais */}
            {abaAtiva === 'configuracao' && configuracao && (
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', color: theme.text }}>
                  Configurações do Sistema de Senhas
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Reinício Automático */}
                  <div style={{
                    order: 1,
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: theme.text }}>
                      🔄 Reinício Automático
                    </h4>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      marginBottom: '12px'
                    }}>
                      <input
                        type="checkbox"
                        checked={configuracao.reiniciarSenhasDiariamente}
                        onChange={(e) => setConfiguracao({ ...configuracao, reiniciarSenhasDiariamente: e.target.checked })}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontSize: '14px', color: theme.text }}>
                        Reiniciar numeração de senhas diariamente
                      </span>
                    </label>
                    
                    {configuracao.reiniciarSenhasDiariamente && (
                      <div>
                        <label style={{ fontSize: '13px', color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
                          Horário de Reinício
                        </label>
                        <input
                          type="time"
                          value={configuracao.horarioReinicio}
                          onChange={(e) => setConfiguracao({ ...configuracao, horarioReinicio: e.target.value })}
                          style={{
                            padding: '10px',
                            fontSize: '16px',
                            fontWeight: '600',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            backgroundColor: theme.background,
                            color: theme.text
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Som e Áudio */}
                  <div style={{
                    order: 7,
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: theme.text }}>
                        🔊 Som e Áudio
                      </h4>
                      <button
                        onClick={testarSom}
                        disabled={!configuracaoSomAlterada}
                        style={{
                          padding: '8px 16px',
                          fontSize: '13px',
                          fontWeight: '600',
                          backgroundColor: configuracaoSomAlterada 
                            ? (currentTheme === 'dark' ? '#10b981' : '#059669')
                            : (currentTheme === 'dark' ? '#374151' : '#d1d5db'),
                          color: configuracaoSomAlterada ? '#fff' : (currentTheme === 'dark' ? '#6b7280' : '#9ca3af'),
                          border: 'none',
                          borderRadius: '6px',
                          cursor: configuracaoSomAlterada ? 'pointer' : 'not-allowed',
                          transition: 'all 0.2s ease',
                          opacity: configuracaoSomAlterada ? 1 : 0.6
                        }}
                        title={configuracaoSomAlterada ? 'Testar o som configurado' : 'Faça alterações em Som e Áudio para ativar'}
                      >
                        🔊 Teste de Som
                      </button>
                    </div>

                    {/* Tipo de Áudio */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ fontSize: '13px', color: theme.textSecondary, display: 'block', marginBottom: '8px' }}>
                        Tipo de Áudio ao Chamar Senha
                      </label>
                      <select
                        value={configuracao.tipoAudio || 'voz'}
                        onChange={(e) => {
                          const novoTipo = e.target.value as TipoAudio
                          console.log('🔊 Tipo de Áudio mudou para:', novoTipo)
                          setConfiguracao({ 
                            ...configuracao, 
                            tipoAudio: novoTipo,
                            emitirSom: novoTipo === 'som' || novoTipo === 'ambos',
                            usarVoz: novoTipo === 'voz' || novoTipo === 'ambos'
                          })
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          fontSize: '14px',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '6px',
                          backgroundColor: theme.background,
                          color: theme.text
                        }}
                      >
                        {tiposAudio.map(tipo => (
                          <option key={tipo.tipo} value={tipo.tipo}>
                            {tipo.nome} - {tipo.descricao}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Configurações de Voz */}
                    {(configuracao.tipoAudio === 'voz' || configuracao.tipoAudio === 'ambos') && (
                      <div style={{ 
                        marginBottom: '16px',
                        padding: '20px',
                        backgroundColor: theme.background,
                        borderRadius: '12px',
                        border: `2px solid ${theme.border}`
                      }}>
                        <h5 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700', color: theme.text }}>
                          🗣️ Configurações de Voz (TTS)
                        </h5>

                        {/* Gênero da Voz */}
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ fontSize: '13px', fontWeight: '600', color: theme.text, display: 'block', marginBottom: '8px' }}>
                            👤 Gênero da Voz:
                          </label>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                              onClick={() => aplicarPerfilVoz('feminino')}
                              style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: (configuracao.generoVoz || 'feminino') === 'feminino' ? '#ec4899' : theme.surface,
                                color: (configuracao.generoVoz || 'feminino') === 'feminino' ? '#fff' : theme.text,
                                border: `2px solid ${(configuracao.generoVoz || 'feminino') === 'feminino' ? '#ec4899' : theme.border}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '13px',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              👩 Feminino
                            </button>
                            <button
                              onClick={() => aplicarPerfilVoz('masculino')}
                              style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: (configuracao.generoVoz || 'feminino') === 'masculino' ? '#3b82f6' : theme.surface,
                                color: (configuracao.generoVoz || 'feminino') === 'masculino' ? '#fff' : theme.text,
                                border: `2px solid ${(configuracao.generoVoz || 'feminino') === 'masculino' ? '#3b82f6' : theme.border}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '13px',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              👨 Masculino
                            </button>
                          </div>
                          <div style={{ 
                            marginTop: '8px', 
                            padding: '8px 12px', 
                            backgroundColor: '#eff6ff', 
                            borderRadius: '6px',
                            fontSize: '11px',
                            color: '#1e40af'
                          }}>
                            💡 Ao selecionar o gênero, os valores de Tom e Velocidade serão ajustados automaticamente para o perfil ideal. Você pode personalizá-los depois.
                          </div>
                        </div>

                        {/* Tom/Pitch da Voz */}
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ fontSize: '13px', fontWeight: '600', color: theme.text, display: 'block', marginBottom: '8px' }}>
                            🎵 Tom da Voz: {(configuracao.pitchVoz || 1.2).toFixed(1)}
                            <span style={{ fontSize: '11px', fontWeight: 'normal', marginLeft: '8px', color: theme.textSecondary }}>
                              {(configuracao.pitchVoz || 1.2) < 0.8 ? '(Grave)' : 
                               (configuracao.pitchVoz || 1.2) < 1.2 ? '(Normal)' : '(Agudo)'}
                            </span>
                          </label>
                          <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={configuracao.pitchVoz || 1.2}
                            onChange={(e) => setConfiguracao({ ...configuracao, pitchVoz: parseFloat(e.target.value) })}
                            style={{ width: '100%' }}
                          />
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            fontSize: '11px', 
                            color: theme.textSecondary, 
                            marginTop: '6px' 
                          }}>
                            <span>0.5 = Grave</span>
                            <span>1.0 = Normal</span>
                            <span>2.0 = Agudo</span>
                          </div>
                        </div>

                        {/* Volume da Voz */}
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ fontSize: '13px', fontWeight: '600', color: theme.text, display: 'block', marginBottom: '8px' }}>
                            🔊 Volume da Voz: {configuracao.volumeVoz || 100}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={configuracao.volumeVoz || 100}
                            onChange={(e) => setConfiguracao({ ...configuracao, volumeVoz: parseInt(e.target.value) })}
                            style={{ width: '100%' }}
                          />
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            fontSize: '11px', 
                            color: theme.textSecondary, 
                            marginTop: '6px' 
                          }}>
                            <span>0% = Mudo</span>
                            <span>50% = Médio</span>
                            <span>100% = Máximo</span>
                          </div>
                        </div>

                        {/* Velocidade */}
                        <div>
                          <label style={{ fontSize: '13px', fontWeight: '600', color: theme.text, display: 'block', marginBottom: '8px' }}>
                            ⚡ Velocidade: {(configuracao.velocidadeVoz || 1.0).toFixed(1)}x
                          </label>
                          <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={configuracao.velocidadeVoz || 1.0}
                            onChange={(e) => setConfiguracao({ ...configuracao, velocidadeVoz: parseFloat(e.target.value) })}
                            style={{ width: '100%' }}
                          />
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            fontSize: '11px', 
                            color: theme.textSecondary, 
                            marginTop: '6px' 
                          }}>
                            <span>0.5 = Lento</span>
                            <span>1.0 = Normal</span>
                            <span>2.0 = Rápido</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Configurações de Som */}
                    {(() => {
                      const mostrarSom = configuracao && (configuracao.tipoAudio === 'som' || configuracao.tipoAudio === 'ambos')
                      console.log('🎵 Mostrar seção de Som?', mostrarSom, '| tipoAudio:', configuracao?.tipoAudio)
                      return mostrarSom
                    })() && (
                      <div style={{ 
                        padding: '16px',
                        backgroundColor: theme.background,
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`
                      }}>
                        <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600', color: theme.text }}>
                          🔔 Configurações de Som (Beep)
                        </h5>
                        
                        {/* Tipo de Som */}
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
                            Tipo de Som
                          </label>
                          <select
                            value={configuracao.tipoSom || 'beep-simples'}
                            onChange={(e) => setConfiguracao({ ...configuracao, tipoSom: e.target.value as any })}
                            style={{
                              width: '100%',
                              padding: '10px',
                              fontSize: '13px',
                              border: `1px solid ${theme.border}`,
                              borderRadius: '6px',
                              backgroundColor: theme.background,
                              color: theme.text,
                              cursor: 'pointer'
                            }}
                          >
                            <option value="beep-simples">🔔 Beep Simples (Padrão)</option>
                            <option value="beep-duplo">🏦 Beep Duplo (Banco)</option>
                            <option value="beep-triplo">🏥 Beep Triplo (Hospital)</option>
                            <option value="sino">📄 Sino Suave (Cartório)</option>
                            <option value="campainha">🔔 Campainha Eletrônica (Recepção)</option>
                            <option value="beep-longo">⏰ Beep Longo (Atenção)</option>
                          </select>
                        </div>
                        
                        {/* Volume do Som */}
                        <div>
                          <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '4px' }}>
                            Volume do Som: {configuracao.volumeSom}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={configuracao.volumeSom}
                            onChange={(e) => setConfiguracao({ ...configuracao, volumeSom: parseInt(e.target.value) })}
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mensagens */}
                  <div style={{
                    order: 3,
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: theme.text }}>
                      💬 Mensagens
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '13px', color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
                          Mensagem de Chamada
                        </label>
                        <input
                          type="text"
                          value={configuracao.mensagemChamada}
                          onChange={(e) => setConfiguracao({ ...configuracao, mensagemChamada: e.target.value })}
                          placeholder="{senha}, {guiche}"
                          style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '14px',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            backgroundColor: theme.background,
                            color: theme.text
                          }}
                        />
                        <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '4px' }}>
                          Use {'{senha}'} e {'{guiche}'} como variáveis
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tela Pública */}
                  <div style={{
                    order: 6,
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: theme.text }}>
                      📺 Tela Pública
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '13px', color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
                          Tempo de Atualização (segundos)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={configuracao.tempoAtualizacaoTela}
                          onChange={(e) => setConfiguracao({ ...configuracao, tempoAtualizacaoTela: parseInt(e.target.value) || 5 })}
                          style={{
                            width: '100px',
                            padding: '10px',
                            fontSize: '14px',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            backgroundColor: theme.background,
                            color: theme.text
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '13px', color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
                          Quantidade de Senhas Exibidas
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={configuracao.quantidadeSenhasExibidas}
                          onChange={(e) => {
                            const valor = parseInt(e.target.value) || 3
                            const valorLimitado = Math.min(Math.max(valor, 1), 10) // Garantir entre 1 e 10
                            setConfiguracao({ ...configuracao, quantidadeSenhasExibidas: valorLimitado })
                          }}
                          style={{
                            width: '100px',
                            padding: '10px',
                            fontSize: '14px',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            backgroundColor: theme.background,
                            color: theme.text
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Priorização de Senhas Preferenciais */}
                  <div style={{
                    order: 4,
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: theme.text }}>
                      ⚡ Priorização de Senhas Preferenciais
                    </h4>
                    
                    <div style={{
                      padding: '12px 16px',
                      backgroundColor: '#FEF3C7',
                      border: '2px solid #F59E0B',
                      borderRadius: '8px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>⚠️</span>
                        <div style={{ fontSize: '13px', color: '#92400E', lineHeight: '1.5' }}>
                          <strong>Bloqueio de Senhas Comuns:</strong> Quando ativado, o sistema impedirá a chamada de senhas comuns (C) se houver senhas preferenciais (P) aguardando há mais tempo que o configurado.
                        </div>
                      </div>
                    </div>

                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      marginBottom: '16px'
                    }}>
                      <input
                        type="checkbox"
                        checked={configuracao.bloquearComumSePreferencialEsperando || false}
                        onChange={(e) => setConfiguracao({ 
                          ...configuracao, 
                          bloquearComumSePreferencialEsperando: e.target.checked 
                        })}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontSize: '14px', color: theme.text, fontWeight: '600' }}>
                        Ativar bloqueio de senhas comuns quando houver preferencial esperando
                      </span>
                    </label>
                    
                    {configuracao.bloquearComumSePreferencialEsperando && (
                      <div>
                        <label style={{ fontSize: '13px', color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
                          Tempo de espera para bloquear (minutos)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={configuracao.tempoEsperaPreferencialParaBloquear || 20}
                            onChange={(e) => setConfiguracao({ 
                              ...configuracao, 
                              tempoEsperaPreferencialParaBloquear: parseInt(e.target.value) || 20 
                            })}
                            style={{
                              width: '100px',
                              padding: '10px',
                              fontSize: '16px',
                              fontWeight: '600',
                              border: `1px solid ${theme.border}`,
                              borderRadius: '6px',
                              backgroundColor: theme.background,
                              color: theme.text
                            }}
                          />
                          <span style={{ fontSize: '14px', color: theme.textSecondary }}>
                            minutos
                          </span>
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: theme.textSecondary, 
                          marginTop: '8px',
                          fontStyle: 'italic'
                        }}>
                          Exemplo: Se configurado para 20 minutos e houver uma senha preferencial aguardando há mais de 20 minutos, as senhas comuns não poderão ser chamadas até que todas as preferenciais sejam atendidas.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Formato de Exibição de Senhas */}
                  <div style={{
                    order: 2,
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: theme.text }}>
                      🎫 Formato de Exibição de Senhas
                    </h4>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '13px', color: theme.textSecondary, display: 'block', marginBottom: '8px' }}>
                        Escolha o formato
                      </label>
                      <select
                        value={configuracao.formatoSenha || 'padrao'}
                        onChange={(e) => setConfiguracao({ 
                          ...configuracao, 
                          formatoSenha: e.target.value as FormatoSenha 
                        })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          fontSize: '14px',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '6px',
                          backgroundColor: theme.background,
                          color: theme.text
                        }}
                      >
                        <option value="padrao">Padrão - P001, C001 (letra + 3 dígitos)</option>
                        <option value="compacto">Compacto - P1, C1 (letra + número)</option>
                        <option value="extenso">Extenso - P0001, C0001 (letra + 4 dígitos)</option>
                        <option value="personalizado">Personalizado</option>
                      </select>
                    </div>

                    {/* Campo Personalizado */}
                    {configuracao.formatoSenha === 'personalizado' && (
                      <div style={{
                        padding: '16px',
                        backgroundColor: theme.background,
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        marginBottom: '16px'
                      }}>
                        <label style={{ fontSize: '13px', color: theme.textSecondary, display: 'block', marginBottom: '8px' }}>
                          Formato Personalizado
                        </label>
                        <input
                          type="text"
                          value={configuracao.formatoPersonalizado || '{categoria}{numero:3}'}
                          onChange={(e) => setConfiguracao({ 
                            ...configuracao, 
                            formatoPersonalizado: e.target.value 
                          })}
                          placeholder="{categoria}{numero:3}"
                          style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '14px',
                            fontFamily: 'monospace',
                            fontWeight: '600',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            backgroundColor: theme.background,
                            color: theme.text
                          }}
                        />
                        <div style={{ 
                          fontSize: '11px', 
                          color: theme.textSecondary, 
                          marginTop: '8px',
                          lineHeight: '1.4'
                        }}>
                          <strong>Variáveis disponíveis:</strong><br/>
                          • <code>{'{categoria}'}</code> = P ou C<br/>
                          • <code>{'{numero:X}'}</code> = Número com X dígitos (ex: :3 = 001, :4 = 0001)<br/>
                          • <code>{'{numero}'}</code> = Número sem zeros à esquerda<br/>
                          <br/>
                          <strong>Exemplos:</strong><br/>
                          • <code>{'{categoria}{numero:3}'}</code> → P001, C001<br/>
                          • <code>{'{categoria}-{numero:4}'}</code> → P-0001, C-0001<br/>
                          • <code>{'SN{numero:5}'}</code> → SN00001, SN00002
                        </div>
                      </div>
                    )}

                    {/* Preview do Formato */}
                    <div style={{
                      padding: '12px 16px',
                      backgroundColor: '#F0FDF4',
                      border: '2px solid #10b981',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#047857', marginBottom: '8px' }}>
                        📋 Preview:
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{
                          padding: '8px 16px',
                          backgroundColor: '#3b82f6',
                          color: '#fff',
                          borderRadius: '6px',
                          fontWeight: '700',
                          fontSize: '18px',
                          fontFamily: 'monospace'
                        }}>
                          {gerarPreviewSenha('P', 1)}
                        </div>
                        <div style={{
                          padding: '8px 16px',
                          backgroundColor: '#10b981',
                          color: '#fff',
                          borderRadius: '6px',
                          fontWeight: '700',
                          fontSize: '18px',
                          fontFamily: 'monospace'
                        }}>
                          {gerarPreviewSenha('C', 42)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Layout do Painel Público */}
                  <div style={{
                    order: 5,
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: theme.text }}>
                      📺 Layout do Painel Público
                    </h4>

                    {/* Textos do Painel */}
                    <div style={{ marginBottom: '20px' }}>
                      <h5 style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '12px' }}>
                        📝 Textos do Cabeçalho
                      </h5>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Título Principal */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <input
                              type="checkbox"
                              checked={configuracao.painelPublicoMostrarTitulo !== false}
                              onChange={(e) => {
                                const novaConfig = { ...configuracao, painelPublicoMostrarTitulo: e.target.checked }
                                setConfiguracao(novaConfig)
                                senhaService.salvarConfiguracao(novaConfig)
                              }}
                              style={{
                                width: '16px',
                                height: '16px',
                                cursor: 'pointer'
                              }}
                              id="checkbox-titulo"
                            />
                            <label htmlFor="checkbox-titulo" style={{ fontSize: '12px', color: theme.textSecondary, cursor: 'pointer' }}>
                              Mostrar Título Principal
                            </label>
                          </div>
                          <input
                            type="text"
                            value={configuracao.painelPublicoTitulo || 'Sistema de Atendimento'}
                            onChange={(e) => {
                              const novaConfig = { ...configuracao, painelPublicoTitulo: e.target.value }
                              setConfiguracao(novaConfig)
                              senhaService.salvarConfiguracao(novaConfig)
                            }}
                            disabled={!configuracao.painelPublicoMostrarTitulo}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              fontSize: '13px',
                              border: `1px solid ${theme.border}`,
                              borderRadius: '4px',
                              backgroundColor: configuracao.painelPublicoMostrarTitulo ? theme.background : theme.border,
                              color: configuracao.painelPublicoMostrarTitulo ? theme.text : theme.textSecondary,
                              opacity: configuracao.painelPublicoMostrarTitulo ? 1 : 0.5,
                              cursor: configuracao.painelPublicoMostrarTitulo ? 'text' : 'not-allowed'
                            }}
                            placeholder="Sistema de Atendimento"
                          />
                        </div>

                        {/* Subtítulo */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <input
                              type="checkbox"
                              checked={configuracao.painelPublicoMostrarSubtitulo !== false}
                              onChange={(e) => {
                                const novaConfig = { ...configuracao, painelPublicoMostrarSubtitulo: e.target.checked }
                                setConfiguracao(novaConfig)
                                senhaService.salvarConfiguracao(novaConfig)
                              }}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              id="checkbox-subtitulo"
                            />
                            <label htmlFor="checkbox-subtitulo" style={{ fontSize: '12px', color: theme.textSecondary, cursor: 'pointer' }}>
                              Mostrar Subtítulo / Mensagem de Boas-Vindas
                            </label>
                          </div>
                          <input
                            type="text"
                            value={configuracao.painelPublicoSubtitulo || 'Bem-vindo ao Sistema de Atendimento'}
                            onChange={(e) => {
                              const novaConfig = { ...configuracao, painelPublicoSubtitulo: e.target.value }
                              setConfiguracao(novaConfig)
                              senhaService.salvarConfiguracao(novaConfig)
                            }}
                            disabled={!configuracao.painelPublicoMostrarSubtitulo}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              fontSize: '13px',
                              border: `1px solid ${theme.border}`,
                              borderRadius: '4px',
                              backgroundColor: configuracao.painelPublicoMostrarSubtitulo ? theme.background : theme.border,
                              color: configuracao.painelPublicoMostrarSubtitulo ? theme.text : theme.textSecondary,
                              opacity: configuracao.painelPublicoMostrarSubtitulo ? 1 : 0.5,
                              cursor: configuracao.painelPublicoMostrarSubtitulo ? 'text' : 'not-allowed'
                            }}
                            placeholder="Bem-vindo ao Sistema de Atendimento"
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '13px', color: theme.textSecondary, display: 'block', marginBottom: '12px' }}>
                        Posição da Senha Atual
                      </label>
                      
                      {/* TODOS OS 4 BOTÕES NA MESMA LINHA */}
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {/* Senha à Esquerda */}
                        <label style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: configuracao.layoutPainelPublico === 'senha-esquerda' 
                              ? '#EFF6FF' 
                              : theme.background,
                            border: `3px solid ${configuracao.layoutPainelPublico === 'senha-esquerda' ? '#3b82f6' : theme.border}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: configuracao.layoutPainelPublico === 'senha-esquerda' 
                              ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
                              : 'none'
                          }}>
                            <input
                              type="radio"
                              name="layout"
                              checked={configuracao.layoutPainelPublico === 'senha-esquerda'}
                              onChange={() => setConfiguracao({ 
                                ...configuracao, 
                                layoutPainelPublico: 'senha-esquerda' 
                              })}
                              style={{ display: 'none' }}
                            />
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '28px', marginBottom: '6px' }}>⬅️</div>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>
                                Senha à Esquerda
                              </div>
                            </div>
                          </label>

                          {/* Senha à Direita */}
                          <label style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: configuracao.layoutPainelPublico === 'senha-direita' 
                              ? '#EFF6FF' 
                              : theme.background,
                            border: `3px solid ${configuracao.layoutPainelPublico === 'senha-direita' ? '#3b82f6' : theme.border}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: configuracao.layoutPainelPublico === 'senha-direita' 
                              ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
                              : 'none'
                          }}>
                            <input
                              type="radio"
                              name="layout"
                              checked={configuracao.layoutPainelPublico === 'senha-direita'}
                              onChange={() => setConfiguracao({ 
                                ...configuracao, 
                                layoutPainelPublico: 'senha-direita' 
                              })}
                              style={{ display: 'none' }}
                            />
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '28px', marginBottom: '6px' }}>➡️</div>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>
                                Senha à Direita
                              </div>
                            </div>
                          </label>

                          {/* Senha no Topo */}
                          <label style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: configuracao.layoutPainelPublico === 'senha-cima' 
                              ? '#EFF6FF' 
                              : theme.background,
                            border: `3px solid ${configuracao.layoutPainelPublico === 'senha-cima' ? '#3b82f6' : theme.border}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: configuracao.layoutPainelPublico === 'senha-cima' 
                              ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
                              : 'none'
                          }}>
                            <input
                              type="radio"
                              name="layout"
                              checked={configuracao.layoutPainelPublico === 'senha-cima'}
                              onChange={() => setConfiguracao({ 
                                ...configuracao, 
                                layoutPainelPublico: 'senha-cima' 
                              })}
                              style={{ display: 'none' }}
                            />
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '28px', marginBottom: '6px' }}>⬆️</div>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>
                                Senha no Topo
                              </div>
                            </div>
                          </label>

                          {/* Senha Embaixo */}
                          <label style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: configuracao.layoutPainelPublico === 'senha-baixo' 
                              ? '#EFF6FF' 
                              : theme.background,
                            border: `3px solid ${configuracao.layoutPainelPublico === 'senha-baixo' ? '#3b82f6' : theme.border}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: configuracao.layoutPainelPublico === 'senha-baixo' 
                              ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
                              : 'none'
                          }}>
                            <input
                              type="radio"
                              name="layout"
                              checked={configuracao.layoutPainelPublico === 'senha-baixo'}
                              onChange={() => setConfiguracao({ 
                                ...configuracao, 
                                layoutPainelPublico: 'senha-baixo' 
                              })}
                              style={{ display: 'none' }}
                            />
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '28px', marginBottom: '6px' }}>⬇️</div>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>
                                Senha Embaixo
                              </div>
                            </div>
                          </label>
                      </div>
                    </div>

                    {/* Tamanho das Fontes */}
                    <div style={{ marginTop: '20px', display: 'flex', gap: '16px' }}>
                      {/* Tamanho da Senha Atual */}
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '13px', color: theme.textSecondary, display: 'block', marginBottom: '8px' }}>
                          🔤 Tamanho da Senha Atual
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="range"
                            min="48"
                            max="200"
                            step="8"
                            value={configuracao.painelPublicoTamanhoFonteSenha || 80}
                            onChange={(e) => {
                              const novoTamanho = parseInt(e.target.value)
                              const novaConfig = { ...configuracao, painelPublicoTamanhoFonteSenha: novoTamanho }
                              setConfiguracao(novaConfig)
                              senhaService.salvarConfiguracao(novaConfig)
                            }}
                            style={{ flex: 1 }}
                          />
                          <span style={{ fontSize: '14px', fontWeight: '600', color: theme.text, minWidth: '60px', textAlign: 'right' }}>
                            {configuracao.painelPublicoTamanhoFonteSenha || 80}px
                          </span>
                        </div>
                      </div>

                      {/* Tamanho do Histórico */}
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '13px', color: theme.textSecondary, display: 'block', marginBottom: '8px' }}>
                          📜 Tamanho do Histórico
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="range"
                            min="16"
                            max="72"
                            step="4"
                            value={configuracao.painelPublicoTamanhoFonteHistorico || 24}
                            onChange={(e) => {
                              const novoTamanho = parseInt(e.target.value)
                              const novaConfig = { ...configuracao, painelPublicoTamanhoFonteHistorico: novoTamanho }
                              setConfiguracao(novaConfig)
                              senhaService.salvarConfiguracao(novaConfig)
                            }}
                            style={{ flex: 1 }}
                          />
                          <span style={{ fontSize: '14px', fontWeight: '600', color: theme.text, minWidth: '60px', textAlign: 'right' }}>
                            {configuracao.painelPublicoTamanhoFonteHistorico || 24}px
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="checkbox"
                            checked={mostrarCoresPainel}
                            onChange={(e) => setMostrarCoresPainel(e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            id="checkbox-cores-painel"
                          />
                          <label htmlFor="checkbox-cores-painel" style={{ fontSize: '14px', fontWeight: '600', color: theme.text, margin: 0, cursor: 'pointer' }}>
                            🎨 Cores do Painel
                          </label>
                        </div>
                        {mostrarCoresPainel && (
                          <button
                            onClick={() => {
                              const novaConfig = {
                                ...configuracao,
                                painelPublicoTitulo: 'Sistema de Atendimento',
                                painelPublicoMostrarTitulo: true,
                                painelPublicoSubtitulo: 'Bem-vindo ao Sistema de Atendimento',
                                painelPublicoMostrarSubtitulo: true,
                                painelPublicoCorFundo: '#1a1a1a',
                                painelPublicoCorHeader: '#1e3a8a',
                                painelPublicoCorSenhaDestaque: '#3b82f6',
                                painelPublicoCorTexto: '#ffffff',
                                painelPublicoCorHistorico: '#1a1a1a',
                                corCategoriaPreferencial: '#3b82f6',
                                corCategoriaComum: '#10b981'
                              }
                              setConfiguracao(novaConfig)
                              senhaService.salvarConfiguracao(novaConfig)
                            }}
                            style={{
                              padding: '4px 12px',
                              fontSize: '11px',
                              backgroundColor: '#6c757d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                            title="Resetar textos e cores para os valores padrão"
                          >
                            🔄 Resetar Tudo
                          </button>
                        )}
                      </div>
                      
                      {mostrarCoresPainel && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                        {/* Cor de Fundo */}
                        <div>
                          <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
                            Fundo da Tela
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="color"
                              value={configuracao.painelPublicoCorFundo || '#1a1a1a'}
                              onChange={(e) => {
                                console.log('🎨 CONFIG - Alterando cor de fundo para:', e.target.value)
                                const novaConfig = { ...configuracao, painelPublicoCorFundo: e.target.value }
                                setConfiguracao(novaConfig)
                                senhaService.salvarConfiguracao(novaConfig)
                                console.log('🎨 CONFIG - Configuração salva:', novaConfig.painelPublicoCorFundo)
                                
                                // Forçar atualização via evento
                                window.dispatchEvent(new CustomEvent('config_atualizada', { detail: novaConfig }))
                                
                                console.log('✅ Configuração salva! Verificando:', senhaService.getConfiguracao().painelPublicoCorFundo)
                              }}
                              style={{ 
                                width: '50px',
                                height: '36px',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            />
                            <input
                              type="text"
                              value={configuracao.painelPublicoCorFundo || '#1a1a1a'}
                              onChange={(e) => {
                                console.log('🎨 CONFIG - Alterando cor de fundo (texto) para:', e.target.value)
                                const novaConfig = { ...configuracao, painelPublicoCorFundo: e.target.value }
                                setConfiguracao(novaConfig)
                                senhaService.salvarConfiguracao(novaConfig)
                                console.log('🎨 CONFIG - Configuração salva (texto):', novaConfig.painelPublicoCorFundo)
                                
                                // Forçar atualização via evento
                                window.dispatchEvent(new CustomEvent('config_atualizada', { detail: novaConfig }))
                                
                                console.log('✅ Configuração salva! Verificando:', senhaService.getConfiguracao().painelPublicoCorFundo)
                              }}
                              style={{
                                flex: 1,
                                padding: '8px',
                                fontSize: '12px',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '4px',
                                backgroundColor: theme.background,
                                color: theme.text,
                                fontFamily: 'monospace'
                              }}
                              placeholder="#1a1a1a"
                            />
                          </div>
                        </div>

                        {/* Cor do Header */}
                        <div>
                          <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
                            Cabeçalho
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="color"
                              value={configuracao.painelPublicoCorHeader || '#1e3a8a'}
                              onChange={(e) => {
                                const novaConfig = { ...configuracao, painelPublicoCorHeader: e.target.value }
                                setConfiguracao(novaConfig)
                                senhaService.salvarConfiguracao(novaConfig)
                              }}
                              style={{ 
                                width: '50px',
                                height: '36px',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            />
                            <input
                              type="text"
                              value={configuracao.painelPublicoCorHeader || '#1e3a8a'}
                              onChange={(e) => {
                                const novaConfig = { ...configuracao, painelPublicoCorHeader: e.target.value }
                                setConfiguracao(novaConfig)
                                senhaService.salvarConfiguracao(novaConfig)
                              }}
                              style={{
                                flex: 1,
                                padding: '8px',
                                fontSize: '12px',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '4px',
                                backgroundColor: theme.background,
                                color: theme.text,
                                fontFamily: 'monospace'
                              }}
                              placeholder="#1e3a8a"
                            />
                          </div>
                        </div>

                        {/* Cor da Senha Destaque */}
                        <div>
                          <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
                            Senha em Destaque
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="color"
                              value={configuracao.painelPublicoCorSenhaDestaque || '#3b82f6'}
                              onChange={(e) => {
                                const novaConfig = { ...configuracao, painelPublicoCorSenhaDestaque: e.target.value }
                                setConfiguracao(novaConfig)
                                senhaService.salvarConfiguracao(novaConfig)
                              }}
                              style={{ 
                                width: '50px',
                                height: '36px',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            />
                            <input
                              type="text"
                              value={configuracao.painelPublicoCorSenhaDestaque || '#3b82f6'}
                              onChange={(e) => {
                                const novaConfig = { ...configuracao, painelPublicoCorSenhaDestaque: e.target.value }
                                setConfiguracao(novaConfig)
                                senhaService.salvarConfiguracao(novaConfig)
                              }}
                              style={{
                                flex: 1,
                                padding: '8px',
                                fontSize: '12px',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '4px',
                                backgroundColor: theme.background,
                                color: theme.text,
                                fontFamily: 'monospace'
                              }}
                              placeholder="#3b82f6"
                            />
                          </div>
                        </div>

                        {/* Cor do Texto */}
                        <div>
                          <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
                            Texto
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="color"
                              value={configuracao.painelPublicoCorTexto || '#ffffff'}
                              onChange={(e) => {
                                const novaConfig = { ...configuracao, painelPublicoCorTexto: e.target.value }
                                setConfiguracao(novaConfig)
                                senhaService.salvarConfiguracao(novaConfig)
                              }}
                              style={{ 
                                width: '50px',
                                height: '36px',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            />
                            <input
                              type="text"
                              value={configuracao.painelPublicoCorTexto || '#ffffff'}
                              onChange={(e) => {
                                const novaConfig = { ...configuracao, painelPublicoCorTexto: e.target.value }
                                setConfiguracao(novaConfig)
                                senhaService.salvarConfiguracao(novaConfig)
                              }}
                              style={{
                                flex: 1,
                                padding: '8px',
                                fontSize: '12px',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '4px',
                                backgroundColor: theme.background,
                                color: theme.text,
                                fontFamily: 'monospace'
                              }}
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>

                        {/* Cor do Histórico */}
                        <div>
                          <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
                            Fundo do Histórico
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="color"
                              value={configuracao.painelPublicoCorHistorico || '#1a1a1a'}
                              onChange={(e) => {
                                const novaConfig = { ...configuracao, painelPublicoCorHistorico: e.target.value }
                                setConfiguracao(novaConfig)
                                senhaService.salvarConfiguracao(novaConfig)
                              }}
                              style={{ 
                                width: '50px',
                                height: '36px',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            />
                            <input
                              type="text"
                              value={configuracao.painelPublicoCorHistorico || '#1a1a1a'}
                              onChange={(e) => {
                                const novaConfig = { ...configuracao, painelPublicoCorHistorico: e.target.value }
                                setConfiguracao(novaConfig)
                                senhaService.salvarConfiguracao(novaConfig)
                              }}
                              style={{
                                flex: 1,
                                padding: '8px',
                                fontSize: '12px',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '4px',
                                backgroundColor: theme.background,
                                color: theme.text,
                                fontFamily: 'monospace'
                              }}
                              placeholder="#1a1a1a"
                            />
                          </div>
                        </div>
                        </div>
                      )}
                    </div>

                    {/* Preview do Layout com Cores */}
                    <div style={{
                      padding: '16px',
                      backgroundColor: configuracao.painelPublicoCorFundo || '#0a0a0a',
                      borderRadius: '8px',
                      border: `2px solid ${theme.border}`,
                      marginTop: '16px'
                    }}>
                      {/* Mini Header Preview */}
                      <div style={{
                        padding: (configuracao.painelPublicoMostrarTitulo !== false && configuracao.painelPublicoMostrarSubtitulo !== false) ? '8px' :
                                 (configuracao.painelPublicoMostrarTitulo === false && configuracao.painelPublicoMostrarSubtitulo === false) ? '4px' :
                                 '6px',
                        background: `linear-gradient(135deg, ${configuracao.painelPublicoCorHeader || '#1e3a8a'} 0%, ${configuracao.painelPublicoCorSenhaDestaque || '#3b82f6'} 100%)`,
                        borderRadius: '4px',
                        marginBottom: '12px',
                        textAlign: 'center',
                        color: configuracao.painelPublicoCorTexto || '#fff',
                        transition: 'padding 0.3s ease',
                        minHeight: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        {configuracao.painelPublicoMostrarTitulo !== false && (
                          <div style={{ fontSize: '11px', fontWeight: '700' }}>
                            {configuracao.painelPublicoTitulo || 'Sistema de Atendimento'}
                          </div>
                        )}
                        {configuracao.painelPublicoMostrarSubtitulo !== false && (
                          <div style={{ fontSize: '8px', opacity: 0.9, marginTop: configuracao.painelPublicoMostrarTitulo !== false ? '2px' : '0' }}>
                            {configuracao.painelPublicoSubtitulo || 'Bem-vindo ao Sistema de Atendimento'}
                          </div>
                        )}
                        {configuracao.painelPublicoMostrarTitulo === false && configuracao.painelPublicoMostrarSubtitulo === false && (
                          <div style={{ fontSize: '9px', opacity: 0.5 }}>
                            (Header vazio - mais espaço para conteúdo)
                          </div>
                        )}
                      </div>
                      
                      <div style={{ fontSize: '12px', fontWeight: '600', color: configuracao.painelPublicoCorTexto || '#fff', marginBottom: '12px', textAlign: 'center', opacity: 0.7 }}>
                        📐 Preview do Layout
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px',
                        height: configuracao.layoutPainelPublico?.startsWith('senha-') && 
                               (configuracao.layoutPainelPublico === 'senha-cima' || configuracao.layoutPainelPublico === 'senha-baixo') 
                          ? '120px' : '80px',
                        flexDirection: 
                          configuracao.layoutPainelPublico === 'senha-direita' ? 'row-reverse' :
                          configuracao.layoutPainelPublico === 'senha-cima' ? 'column' :
                          configuracao.layoutPainelPublico === 'senha-baixo' ? 'column-reverse' :
                          'row'
                      }}>
                        <div style={{
                          flex: configuracao.layoutPainelPublico === 'senha-cima' || configuracao.layoutPainelPublico === 'senha-baixo' ? 1.5 : 1.8,
                          backgroundColor: configuracao.painelPublicoCorSenhaDestaque || '#3b82f6',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: configuracao.painelPublicoCorTexto || '#fff',
                          fontSize: '24px',
                          fontWeight: '700',
                          fontFamily: 'monospace'
                        }}>
                          {gerarPreviewSenha('P', 1)}
                        </div>
                        <div style={{
                          flex: configuracao.layoutPainelPublico === 'senha-cima' || configuracao.layoutPainelPublico === 'senha-baixo' ? 1 : 2.2,
                          backgroundColor: configuracao.painelPublicoCorHistorico || '#1a1a1a',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: configuracao.layoutPainelPublico === 'senha-cima' || configuracao.layoutPainelPublico === 'senha-baixo' ? 'row' : 'column',
                          gap: '4px',
                          padding: '8px'
                        }}>
                          {[1, 2, 3].map(i => (
                            <div key={i} style={{
                              flex: 1,
                              backgroundColor: '#475569',
                              borderRadius: '4px'
                            }}></div>
                          ))}
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: configuracao.painelPublicoCorTexto || '#fff', marginTop: '8px', textAlign: 'center', opacity: 0.6 }}>
                        {configuracao.layoutPainelPublico === 'senha-esquerda' && '← Senha Atual (grande) | Últimas Chamadas →'}
                        {configuracao.layoutPainelPublico === 'senha-direita' && '← Últimas Chamadas | Senha Atual (grande) →'}
                        {configuracao.layoutPainelPublico === 'senha-cima' && '↑ Senha Atual (grande) | Últimas Chamadas ↓'}
                        {configuracao.layoutPainelPublico === 'senha-baixo' && '↑ Últimas Chamadas | Senha Atual (grande) ↓'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA: Impressão */}
            {abaAtiva === 'impressao' && configuracao && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Título da Impressão */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: theme.text }}>
                      📄 Cabeçalho da Impressão
                    </h4>
                    <div>
                      <label style={{ fontSize: '13px', color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>
                        Título do Sistema
                      </label>
                      <input
                        type="text"
                        value={configuracao.impressaoTitulo}
                        onChange={(e) => setConfiguracao({ ...configuracao, impressaoTitulo: e.target.value })}
                        placeholder="Ex: SISTEMA DE ATENDIMENTO"
                        style={{
                          width: '100%',
                          padding: '10px',
                          fontSize: '14px',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '6px',
                          backgroundColor: theme.background,
                          color: theme.text,
                          textAlign: 'center',
                          fontWeight: 'bold',
                          marginBottom: '8px'
                        }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                        {/* Alinhamento - Lado Esquerdo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{ fontSize: '12px', color: theme.textSecondary }}>
                            Alinhamento:
                          </label>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => setConfiguracao({ ...configuracao, impressaoTituloAlinhamento: 'left' })}
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                border: `2px solid ${configuracao.impressaoTituloAlinhamento === 'left' ? headerColor : theme.border}`,
                                backgroundColor: configuracao.impressaoTituloAlinhamento === 'left' ? headerColor : theme.surface,
                                color: configuracao.impressaoTituloAlinhamento === 'left' ? '#fff' : theme.text,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: configuracao.impressaoTituloAlinhamento === 'left' ? '600' : '400'
                              }}
                            >
                              ⬅️ Esquerda
                            </button>
                            <button
                              onClick={() => setConfiguracao({ ...configuracao, impressaoTituloAlinhamento: 'center' })}
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                border: `2px solid ${configuracao.impressaoTituloAlinhamento === 'center' ? headerColor : theme.border}`,
                                backgroundColor: configuracao.impressaoTituloAlinhamento === 'center' ? headerColor : theme.surface,
                                color: configuracao.impressaoTituloAlinhamento === 'center' ? '#fff' : theme.text,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: configuracao.impressaoTituloAlinhamento === 'center' ? '600' : '400'
                              }}
                            >
                              ↕️ Centro
                            </button>
                            <button
                              onClick={() => setConfiguracao({ ...configuracao, impressaoTituloAlinhamento: 'right' })}
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                border: `2px solid ${configuracao.impressaoTituloAlinhamento === 'right' ? headerColor : theme.border}`,
                                backgroundColor: configuracao.impressaoTituloAlinhamento === 'right' ? headerColor : theme.surface,
                                color: configuracao.impressaoTituloAlinhamento === 'right' ? '#fff' : theme.text,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: configuracao.impressaoTituloAlinhamento === 'right' ? '600' : '400'
                              }}
                            >
                              ➡️ Direita
                            </button>
                          </div>
                        </div>
                        {/* Tamanho - Lado Direito */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{ fontSize: '12px', color: theme.textSecondary }}>
                            Tamanho:
                          </label>
                          <input
                            type="number"
                            min="8"
                            max="72"
                            value={configuracao.impressaoTituloTamanhoFonte || 16}
                            onChange={(e) => setConfiguracao({ 
                              ...configuracao, 
                              impressaoTituloTamanhoFonte: Math.min(Math.max(parseInt(e.target.value) || 8, 8), 72) 
                            })}
                            style={{
                              width: '60px',
                              padding: '4px',
                              fontSize: '11px',
                              border: `1px solid ${theme.border}`,
                              borderRadius: '4px',
                              backgroundColor: theme.background,
                              color: theme.text,
                              textAlign: 'center'
                            }}
                          />
                          <span style={{ fontSize: '11px', color: theme.textSecondary }}>px</span>
                          <button
                            onClick={() => setConfiguracao({ ...configuracao, impressaoTituloTamanhoFonte: Math.min((configuracao.impressaoTituloTamanhoFonte || 16) + 2, 72) })}
                            style={{
                              padding: '2px 8px',
                              fontSize: '10px',
                              border: `1px solid ${theme.border}`,
                              backgroundColor: theme.surface,
                              color: theme.text,
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >➕</button>
                          <button
                            onClick={() => setConfiguracao({ ...configuracao, impressaoTituloTamanhoFonte: Math.max((configuracao.impressaoTituloTamanhoFonte || 16) - 2, 8) })}
                            style={{
                              padding: '2px 8px',
                              fontSize: '10px',
                              border: `1px solid ${theme.border}`,
                              backgroundColor: theme.surface,
                              color: theme.text,
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >➖</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Elementos Visíveis - Título da seção mantido */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: theme.text }}>
                      👁️ Elementos Visíveis e Alinhamento
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Serviço */}
                      <div style={{ padding: '12px', backgroundColor: theme.background, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
                          <input
                            type="checkbox"
                            checked={configuracao.impressaoMostrarServico}
                            onChange={(e) => setConfiguracao({ ...configuracao, impressaoMostrarServico: e.target.checked })}
                            style={{ width: '18px', height: '18px' }}
                          />
                          <span style={{ fontSize: '14px', color: theme.text, fontWeight: '600' }}>Mostrar nome do serviço</span>
                        </label>
                        {configuracao.impressaoMostrarServico && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginLeft: '26px' }}>
                            {/* Alinhamento - Lado Esquerdo */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <label style={{ fontSize: '11px', color: theme.textSecondary }}>Alinhamento:</label>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {['left', 'center', 'right'].map((align) => (
                                  <button
                                    key={align}
                                    onClick={() => setConfiguracao({ ...configuracao, impressaoServicoAlinhamento: align as any })}
                                    style={{
                                      padding: '4px 10px',
                                      fontSize: '11px',
                                      border: `2px solid ${configuracao.impressaoServicoAlinhamento === align ? headerColor : theme.border}`,
                                      backgroundColor: configuracao.impressaoServicoAlinhamento === align ? headerColor : theme.surface,
                                      color: configuracao.impressaoServicoAlinhamento === align ? '#fff' : theme.text,
                                      borderRadius: '4px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {align === 'left' ? '⬅️' : align === 'center' ? '↕️' : '➡️'}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {/* Tamanho - Lado Direito */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <label style={{ fontSize: '11px', color: theme.textSecondary }}>Tamanho:</label>
                              <input
                                type="number"
                                min="8"
                                max="72"
                                value={configuracao.impressaoServicoTamanhoFonte || 14}
                                onChange={(e) => setConfiguracao({ ...configuracao, impressaoServicoTamanhoFonte: Math.min(Math.max(parseInt(e.target.value) || 8, 8), 72) })}
                                style={{ width: '60px', padding: '4px', fontSize: '11px', border: `1px solid ${theme.border}`, borderRadius: '4px', backgroundColor: theme.background, color: theme.text, textAlign: 'center' }}
                              />
                              <span style={{ fontSize: '10px', color: theme.textSecondary }}>px</span>
                              <button
                                onClick={() => setConfiguracao({ ...configuracao, impressaoServicoTamanhoFonte: Math.min((configuracao.impressaoServicoTamanhoFonte || 14) + 2, 72) })}
                                style={{ padding: '2px 8px', fontSize: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surface, color: theme.text, borderRadius: '4px', cursor: 'pointer' }}
                              >➕</button>
                              <button
                                onClick={() => setConfiguracao({ ...configuracao, impressaoServicoTamanhoFonte: Math.max((configuracao.impressaoServicoTamanhoFonte || 14) - 2, 8) })}
                                style={{ padding: '2px 8px', fontSize: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surface, color: theme.text, borderRadius: '4px', cursor: 'pointer' }}
                              >➖</button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Categoria */}
                      <div style={{ padding: '12px', backgroundColor: theme.background, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
                          <input
                            type="checkbox"
                            checked={configuracao.impressaoMostrarCategoria}
                            onChange={(e) => setConfiguracao({ ...configuracao, impressaoMostrarCategoria: e.target.checked })}
                            style={{ width: '18px', height: '18px' }}
                          />
                          <span style={{ fontSize: '14px', color: theme.text, fontWeight: '600' }}>Mostrar categoria (PREFERENCIAL/COMUM)</span>
                        </label>
                        {configuracao.impressaoMostrarCategoria && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginLeft: '26px' }}>
                            {/* Alinhamento - Lado Esquerdo */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <label style={{ fontSize: '11px', color: theme.textSecondary }}>Alinhamento:</label>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {['left', 'center', 'right'].map((align) => (
                                  <button
                                    key={align}
                                    onClick={() => setConfiguracao({ ...configuracao, impressaoCategoriaAlinhamento: align as any })}
                                    style={{
                                      padding: '4px 10px',
                                      fontSize: '11px',
                                      border: `2px solid ${configuracao.impressaoCategoriaAlinhamento === align ? headerColor : theme.border}`,
                                      backgroundColor: configuracao.impressaoCategoriaAlinhamento === align ? headerColor : theme.surface,
                                      color: configuracao.impressaoCategoriaAlinhamento === align ? '#fff' : theme.text,
                                      borderRadius: '4px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {align === 'left' ? '⬅️' : align === 'center' ? '↕️' : '➡️'}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {/* Tamanho - Lado Direito */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <label style={{ fontSize: '11px', color: theme.textSecondary }}>Tamanho:</label>
                              <input
                                type="number"
                                min="8"
                                max="72"
                                value={configuracao.impressaoCategoriaTamanhoFonte || 13}
                                onChange={(e) => setConfiguracao({ ...configuracao, impressaoCategoriaTamanhoFonte: Math.min(Math.max(parseInt(e.target.value) || 8, 8), 72) })}
                                style={{ width: '60px', padding: '4px', fontSize: '11px', border: `1px solid ${theme.border}`, borderRadius: '4px', backgroundColor: theme.background, color: theme.text, textAlign: 'center' }}
                              />
                              <span style={{ fontSize: '10px', color: theme.textSecondary }}>px</span>
                              <button
                                onClick={() => setConfiguracao({ ...configuracao, impressaoCategoriaTamanhoFonte: Math.min((configuracao.impressaoCategoriaTamanhoFonte || 13) + 2, 72) })}
                                style={{ padding: '2px 8px', fontSize: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surface, color: theme.text, borderRadius: '4px', cursor: 'pointer' }}
                              >➕</button>
                              <button
                                onClick={() => setConfiguracao({ ...configuracao, impressaoCategoriaTamanhoFonte: Math.max((configuracao.impressaoCategoriaTamanhoFonte || 13) - 2, 8) })}
                                style={{ padding: '2px 8px', fontSize: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surface, color: theme.text, borderRadius: '4px', cursor: 'pointer' }}
                              >➖</button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Data */}
                      <div style={{ padding: '12px', backgroundColor: theme.background, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
                          <input
                            type="checkbox"
                            checked={configuracao.impressaoMostrarData}
                            onChange={(e) => setConfiguracao({ ...configuracao, impressaoMostrarData: e.target.checked })}
                            style={{ width: '18px', height: '18px' }}
                          />
                          <span style={{ fontSize: '14px', color: theme.text, fontWeight: '600' }}>Mostrar data</span>
                        </label>
                        {configuracao.impressaoMostrarData && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginLeft: '26px' }}>
                            {/* Alinhamento - Lado Esquerdo */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <label style={{ fontSize: '11px', color: theme.textSecondary }}>Alinhamento:</label>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {['left', 'center', 'right'].map((align) => (
                                  <button
                                    key={align}
                                    onClick={() => setConfiguracao({ ...configuracao, impressaoDataAlinhamento: align as any })}
                                    style={{
                                      padding: '4px 10px',
                                      fontSize: '11px',
                                      border: `2px solid ${configuracao.impressaoDataAlinhamento === align ? headerColor : theme.border}`,
                                      backgroundColor: configuracao.impressaoDataAlinhamento === align ? headerColor : theme.surface,
                                      color: configuracao.impressaoDataAlinhamento === align ? '#fff' : theme.text,
                                      borderRadius: '4px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {align === 'left' ? '⬅️' : align === 'center' ? '↕️' : '➡️'}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {/* Tamanho - Lado Direito */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <label style={{ fontSize: '11px', color: theme.textSecondary }}>Tamanho:</label>
                              <input
                                type="number"
                                min="8"
                                max="72"
                                value={configuracao.impressaoDataTamanhoFonte || 12}
                                onChange={(e) => setConfiguracao({ ...configuracao, impressaoDataTamanhoFonte: Math.min(Math.max(parseInt(e.target.value) || 8, 8), 72) })}
                                style={{ width: '60px', padding: '4px', fontSize: '11px', border: `1px solid ${theme.border}`, borderRadius: '4px', backgroundColor: theme.background, color: theme.text, textAlign: 'center' }}
                              />
                              <span style={{ fontSize: '10px', color: theme.textSecondary }}>px</span>
                              <button
                                onClick={() => setConfiguracao({ ...configuracao, impressaoDataTamanhoFonte: Math.min((configuracao.impressaoDataTamanhoFonte || 12) + 2, 72) })}
                                style={{ padding: '2px 8px', fontSize: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surface, color: theme.text, borderRadius: '4px', cursor: 'pointer' }}
                              >➕</button>
                              <button
                                onClick={() => setConfiguracao({ ...configuracao, impressaoDataTamanhoFonte: Math.max((configuracao.impressaoDataTamanhoFonte || 12) - 2, 8) })}
                                style={{ padding: '2px 8px', fontSize: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surface, color: theme.text, borderRadius: '4px', cursor: 'pointer' }}
                              >➖</button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Hora */}
                      <div style={{ padding: '12px', backgroundColor: theme.background, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
                          <input
                            type="checkbox"
                            checked={configuracao.impressaoMostrarHora}
                            onChange={(e) => setConfiguracao({ ...configuracao, impressaoMostrarHora: e.target.checked })}
                            style={{ width: '18px', height: '18px' }}
                          />
                          <span style={{ fontSize: '14px', color: theme.text, fontWeight: '600' }}>Mostrar hora</span>
                        </label>
                        {configuracao.impressaoMostrarHora && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginLeft: '26px' }}>
                            {/* Alinhamento - Lado Esquerdo */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <label style={{ fontSize: '11px', color: theme.textSecondary }}>Alinhamento:</label>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {['left', 'center', 'right'].map((align) => (
                                  <button
                                    key={align}
                                    onClick={() => setConfiguracao({ ...configuracao, impressaoHoraAlinhamento: align as any })}
                                    style={{
                                      padding: '4px 10px',
                                      fontSize: '11px',
                                      border: `2px solid ${configuracao.impressaoHoraAlinhamento === align ? headerColor : theme.border}`,
                                      backgroundColor: configuracao.impressaoHoraAlinhamento === align ? headerColor : theme.surface,
                                      color: configuracao.impressaoHoraAlinhamento === align ? '#fff' : theme.text,
                                      borderRadius: '4px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {align === 'left' ? '⬅️' : align === 'center' ? '↕️' : '➡️'}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {/* Tamanho - Lado Direito */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <label style={{ fontSize: '11px', color: theme.textSecondary }}>Tamanho:</label>
                              <input
                                type="number"
                                min="8"
                                max="72"
                                value={configuracao.impressaoHoraTamanhoFonte || 12}
                                onChange={(e) => setConfiguracao({ ...configuracao, impressaoHoraTamanhoFonte: Math.min(Math.max(parseInt(e.target.value) || 8, 8), 72) })}
                                style={{ width: '60px', padding: '4px', fontSize: '11px', border: `1px solid ${theme.border}`, borderRadius: '4px', backgroundColor: theme.background, color: theme.text, textAlign: 'center' }}
                              />
                              <span style={{ fontSize: '10px', color: theme.textSecondary }}>px</span>
                              <button
                                onClick={() => setConfiguracao({ ...configuracao, impressaoHoraTamanhoFonte: Math.min((configuracao.impressaoHoraTamanhoFonte || 12) + 2, 72) })}
                                style={{ padding: '2px 8px', fontSize: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surface, color: theme.text, borderRadius: '4px', cursor: 'pointer' }}
                              >➕</button>
                              <button
                                onClick={() => setConfiguracao({ ...configuracao, impressaoHoraTamanhoFonte: Math.max((configuracao.impressaoHoraTamanhoFonte || 12) - 2, 8) })}
                                style={{ padding: '2px 8px', fontSize: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surface, color: theme.text, borderRadius: '4px', cursor: 'pointer' }}
                              >➖</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Alinhamento da Senha */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: theme.text }}>
                      🎫 Alinhamento e Tamanho do Número da Senha
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                      {/* Alinhamento - Lado Esquerdo */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '12px', color: theme.textSecondary }}>Alinhamento:</label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {['left', 'center', 'right'].map((align) => (
                            <button
                              key={align}
                              onClick={() => setConfiguracao({ ...configuracao, impressaoSenhaAlinhamento: align as any })}
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                border: `2px solid ${configuracao.impressaoSenhaAlinhamento === align ? headerColor : theme.border}`,
                                backgroundColor: configuracao.impressaoSenhaAlinhamento === align ? headerColor : theme.surface,
                                color: configuracao.impressaoSenhaAlinhamento === align ? '#fff' : theme.text,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: configuracao.impressaoSenhaAlinhamento === align ? '600' : '400'
                              }}
                            >
                              {align === 'left' ? '⬅️' : align === 'center' ? '↕️' : '➡️'}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Tamanho - Lado Direito */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '12px', color: theme.textSecondary }}>Tamanho:</label>
                        <input
                          type="number"
                          min="8"
                          max="72"
                          value={configuracao.impressaoSenhaTamanhoFonte || 24}
                          onChange={(e) => setConfiguracao({ ...configuracao, impressaoSenhaTamanhoFonte: Math.min(Math.max(parseInt(e.target.value) || 8, 8), 72) })}
                          style={{ width: '60px', padding: '4px', fontSize: '11px', border: `1px solid ${theme.border}`, borderRadius: '4px', backgroundColor: theme.background, color: theme.text, textAlign: 'center' }}
                        />
                        <span style={{ fontSize: '11px', color: theme.textSecondary }}>px</span>
                        <button
                          onClick={() => setConfiguracao({ ...configuracao, impressaoSenhaTamanhoFonte: Math.min((configuracao.impressaoSenhaTamanhoFonte || 24) + 2, 72) })}
                          style={{ padding: '2px 8px', fontSize: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surface, color: theme.text, borderRadius: '4px', cursor: 'pointer' }}
                        >➕</button>
                        <button
                          onClick={() => setConfiguracao({ ...configuracao, impressaoSenhaTamanhoFonte: Math.max((configuracao.impressaoSenhaTamanhoFonte || 24) - 2, 8) })}
                          style={{ padding: '2px 8px', fontSize: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surface, color: theme.text, borderRadius: '4px', cursor: 'pointer' }}
                        >➖</button>
                      </div>
                    </div>
                  </div>

                  {/* Mensagens Personalizadas */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: theme.text }}>
                      💬 Mensagens Personalizadas
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Mensagem de Instrução */}
                      <div style={{ padding: '12px', backgroundColor: theme.background, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
                          <input
                            type="checkbox"
                            checked={configuracao.impressaoMostrarInstrucao}
                            onChange={(e) => setConfiguracao({ ...configuracao, impressaoMostrarInstrucao: e.target.checked })}
                            style={{ width: '18px', height: '18px' }}
                          />
                          <span style={{ fontSize: '14px', color: theme.text, fontWeight: '600' }}>Mostrar mensagem de instrução</span>
                        </label>
                        {configuracao.impressaoMostrarInstrucao && (
                          <>
                            <input
                              type="text"
                              value={configuracao.impressaoMensagemInstrucao}
                              onChange={(e) => setConfiguracao({ ...configuracao, impressaoMensagemInstrucao: e.target.value })}
                              placeholder="Ex: Aguarde ser chamado no painel."
                              style={{
                                width: '100%',
                                padding: '10px',
                                fontSize: '14px',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '6px',
                                backgroundColor: theme.surface,
                                color: theme.text,
                                marginBottom: '8px',
                                marginLeft: '26px',
                                maxWidth: 'calc(100% - 26px)'
                              }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginLeft: '26px' }}>
                              {/* Alinhamento - Lado Esquerdo */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ fontSize: '11px', color: theme.textSecondary }}>Alinhamento:</label>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  {['left', 'center', 'right'].map((align) => (
                                    <button
                                      key={align}
                                      onClick={() => setConfiguracao({ ...configuracao, impressaoInstrucaoAlinhamento: align as any })}
                                      style={{
                                        padding: '4px 10px',
                                        fontSize: '11px',
                                        border: `2px solid ${configuracao.impressaoInstrucaoAlinhamento === align ? headerColor : theme.border}`,
                                        backgroundColor: configuracao.impressaoInstrucaoAlinhamento === align ? headerColor : theme.surface,
                                        color: configuracao.impressaoInstrucaoAlinhamento === align ? '#fff' : theme.text,
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {align === 'left' ? '⬅️' : align === 'center' ? '↕️' : '➡️'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              {/* Tamanho - Lado Direito */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ fontSize: '11px', color: theme.textSecondary }}>Tamanho:</label>
                                <input
                                  type="number"
                                  min="8"
                                  max="72"
                                  value={configuracao.impressaoInstrucaoTamanhoFonte || 12}
                                  onChange={(e) => setConfiguracao({ ...configuracao, impressaoInstrucaoTamanhoFonte: Math.min(Math.max(parseInt(e.target.value) || 8, 8), 72) })}
                                  style={{ width: '60px', padding: '4px', fontSize: '11px', border: `1px solid ${theme.border}`, borderRadius: '4px', backgroundColor: theme.surface, color: theme.text, textAlign: 'center' }}
                                />
                                <span style={{ fontSize: '10px', color: theme.textSecondary }}>px</span>
                                <button
                                  onClick={() => setConfiguracao({ ...configuracao, impressaoInstrucaoTamanhoFonte: Math.min((configuracao.impressaoInstrucaoTamanhoFonte || 12) + 2, 72) })}
                                  style={{ padding: '2px 8px', fontSize: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surface, color: theme.text, borderRadius: '4px', cursor: 'pointer' }}
                                >➕</button>
                                <button
                                  onClick={() => setConfiguracao({ ...configuracao, impressaoInstrucaoTamanhoFonte: Math.max((configuracao.impressaoInstrucaoTamanhoFonte || 12) - 2, 8) })}
                                  style={{ padding: '2px 8px', fontSize: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surface, color: theme.text, borderRadius: '4px', cursor: 'pointer' }}
                                >➖</button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Mensagem de Rodapé */}
                      <div style={{ padding: '12px', backgroundColor: theme.background, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
                          <input
                            type="checkbox"
                            checked={configuracao.impressaoMostrarRodape}
                            onChange={(e) => setConfiguracao({ ...configuracao, impressaoMostrarRodape: e.target.checked })}
                            style={{ width: '18px', height: '18px' }}
                          />
                          <span style={{ fontSize: '14px', color: theme.text, fontWeight: '600' }}>Mostrar mensagem de rodapé</span>
                        </label>
                        {configuracao.impressaoMostrarRodape && (
                          <>
                            <input
                              type="text"
                              value={configuracao.impressaoMensagemRodape}
                              onChange={(e) => setConfiguracao({ ...configuracao, impressaoMensagemRodape: e.target.value })}
                              placeholder="Ex: Obrigado pela preferência"
                              style={{
                                width: '100%',
                                padding: '10px',
                                fontSize: '14px',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '6px',
                                backgroundColor: theme.surface,
                                color: theme.text,
                                marginBottom: '8px',
                                marginLeft: '26px',
                                maxWidth: 'calc(100% - 26px)'
                              }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginLeft: '26px' }}>
                              {/* Alinhamento - Lado Esquerdo */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ fontSize: '11px', color: theme.textSecondary }}>Alinhamento:</label>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  {['left', 'center', 'right'].map((align) => (
                                    <button
                                      key={align}
                                      onClick={() => setConfiguracao({ ...configuracao, impressaoRodapeAlinhamento: align as any })}
                                      style={{
                                        padding: '4px 10px',
                                        fontSize: '11px',
                                        border: `2px solid ${configuracao.impressaoRodapeAlinhamento === align ? headerColor : theme.border}`,
                                        backgroundColor: configuracao.impressaoRodapeAlinhamento === align ? headerColor : theme.surface,
                                        color: configuracao.impressaoRodapeAlinhamento === align ? '#fff' : theme.text,
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {align === 'left' ? '⬅️' : align === 'center' ? '↕️' : '➡️'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              {/* Tamanho - Lado Direito */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ fontSize: '11px', color: theme.textSecondary }}>Tamanho:</label>
                                <input
                                  type="number"
                                  min="8"
                                  max="72"
                                  value={configuracao.impressaoRodapeTamanhoFonte || 12}
                                  onChange={(e) => setConfiguracao({ ...configuracao, impressaoRodapeTamanhoFonte: Math.min(Math.max(parseInt(e.target.value) || 8, 8), 72) })}
                                  style={{ width: '60px', padding: '4px', fontSize: '11px', border: `1px solid ${theme.border}`, borderRadius: '4px', backgroundColor: theme.surface, color: theme.text, textAlign: 'center' }}
                                />
                                <span style={{ fontSize: '10px', color: theme.textSecondary }}>px</span>
                                <button
                                  onClick={() => setConfiguracao({ ...configuracao, impressaoRodapeTamanhoFonte: Math.min((configuracao.impressaoRodapeTamanhoFonte || 12) + 2, 72) })}
                                  style={{ padding: '2px 8px', fontSize: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surface, color: theme.text, borderRadius: '4px', cursor: 'pointer' }}
                                >➕</button>
                                <button
                                  onClick={() => setConfiguracao({ ...configuracao, impressaoRodapeTamanhoFonte: Math.max((configuracao.impressaoRodapeTamanhoFonte || 12) - 2, 8) })}
                                  style={{ padding: '2px 8px', fontSize: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surface, color: theme.text, borderRadius: '4px', cursor: 'pointer' }}
                                >➖</button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preview da Impressão */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: theme.text }}>
                      👁️ Pré-visualização
                    </h4>
                    
                    <div style={{
                      backgroundColor: '#fff',
                      color: '#000',
                      padding: '20px',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      lineHeight: '1.4',
                      border: '2px dashed #ccc',
                      maxWidth: '300px',
                      margin: '0 auto'
                    }}>
                      <div style={{ textAlign: configuracao.impressaoTituloAlinhamento, fontWeight: 'bold', fontSize: `${configuracao.impressaoTituloTamanhoFonte || 16}px` }}>
                        {configuracao.impressaoTitulo}
                      </div>
                      
                      {configuracao.impressaoMostrarServico && (
                        <>
                          <br />
                          <div style={{ textAlign: configuracao.impressaoServicoAlinhamento, fontSize: `${configuracao.impressaoServicoTamanhoFonte || 14}px` }}>
                            Nascimento Preferencial
                          </div>
                        </>
                      )}
                      
                      {configuracao.impressaoMostrarCategoria && (
                        <>
                          <br />
                          <div style={{ textAlign: configuracao.impressaoCategoriaAlinhamento, fontSize: `${configuracao.impressaoCategoriaTamanhoFonte || 13}px` }}>
                            * SENHA PREFERENCIAL *
                          </div>
                        </>
                      )}
                      
                      <br />
                      <div style={{ textAlign: configuracao.impressaoSenhaAlinhamento, border: '1px solid #000', padding: '8px', margin: '8px 0' }}>
                        <div style={{ fontSize: `${configuracao.impressaoSenhaTamanhoFonte || 24}px`, fontWeight: 'bold' }}>{gerarPreviewSenha('P', 1)}</div>
                      </div>
                      
                      {configuracao.impressaoMostrarData && (
                        <div style={{ textAlign: configuracao.impressaoDataAlinhamento, fontSize: `${configuracao.impressaoDataTamanhoFonte || 12}px` }}>
                          Data: {new Date().toLocaleDateString('pt-BR')}
                        </div>
                      )}
                      
                      {configuracao.impressaoMostrarHora && (
                        <div style={{ textAlign: configuracao.impressaoHoraAlinhamento, fontSize: `${configuracao.impressaoHoraTamanhoFonte || 12}px` }}>
                          Hora: {new Date().toLocaleTimeString('pt-BR')}
                        </div>
                      )}
                      
                      {configuracao.impressaoMostrarInstrucao && (
                        <>
                          <br />
                          <div style={{ textAlign: configuracao.impressaoInstrucaoAlinhamento, fontSize: `${configuracao.impressaoInstrucaoTamanhoFonte || 12}px` }}>
                            {configuracao.impressaoMensagemInstrucao}
                          </div>
                          <br />
                        </>
                      )}
                      
                      {configuracao.impressaoMostrarRodape && (
                        <>
                          <div style={{ textAlign: 'center' }}>
                            ============================
                          </div>
                          <div style={{ textAlign: configuracao.impressaoRodapeAlinhamento, fontSize: `${configuracao.impressaoRodapeTamanhoFonte || 12}px` }}>
                            {configuracao.impressaoMensagemRodape}
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            ============================
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rodapé com Botões */}
          <div style={{
            padding: '16px',
            borderTop: `2px solid ${theme.border}`,
            backgroundColor: theme.surface,
            display: 'flex',
            gap: '10px',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => abaAtiva === 'servicos' ? salvarServicos() : salvarConfiguracao()}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: '#10b981',
                color: '#fff',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#059669'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              💾 Salvar Configurações
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: '#6c757d',
                color: '#fff'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#495057'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
            >
              🚪 Retornar
            </button>
          </div>

          {/* Modal de Dicas */}
          {mostrarModalDicas && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '20px'
            }}>
              <div style={{
                backgroundColor: theme.surface,
                borderRadius: '16px',
                padding: '24px',
                width: '90%',
                maxWidth: '650px',
                maxHeight: '90%',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                border: `2px solid ${theme.border}`
              }}>
                {/* Cabeçalho */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom: `2px solid ${theme.border}`
                }}>
                  <h3 style={{ margin: 0, color: theme.text, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    💡 Dicas de Configuração
                  </h3>
                  <button
                    onClick={() => setMostrarModalDicas(false)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: theme.surface,
                      border: `2px solid ${theme.border}`,
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Conteúdo das Dicas */}
                <div style={{ padding: '20px', backgroundColor: '#EFF6FF', border: '2px solid #3b82f6', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '14px' }}>
                    <span style={{ fontSize: '28px' }}>💡</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', color: '#1e40af', marginBottom: '12px', fontSize: '16px' }}>
                        📋 Como adicionar serviços:
                      </div>
                      <div style={{ fontSize: '14px', color: '#1e3a8a', lineHeight: '1.8' }}>
                        <div style={{ marginBottom: '10px' }}>
                          <strong style={{ color: '#3b82f6' }}>1️⃣ Clique no botão</strong> <span style={{ padding: '2px 8px', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>+ Adicionar Serviço</span> acima ou dentro de cada categoria (P ou C)
                        </div>
                        
                        <div style={{ marginBottom: '10px' }}>
                          <strong style={{ color: '#3b82f6' }}>2️⃣ Preencha os campos:</strong><br/>
                          &nbsp;&nbsp;&nbsp;• <strong>Nome do Serviço:</strong> Digite o tipo de atendimento (ex: <em>Casamento</em>, <em>Nascimento</em>, <em>Óbito</em>)<br/>
                          &nbsp;&nbsp;&nbsp;• <strong>Sigla:</strong> Digite a abreviação (ex: <em>CA</em>, <em>NA</em>, <em>OB</em>)
                        </div>
                        
                        <div style={{ marginBottom: '10px' }}>
                          <strong style={{ color: '#3b82f6' }}>3️⃣ Escolha onde cadastrar:</strong><br/>
                          <div style={{ marginLeft: '20px', marginTop: '6px', padding: '10px', backgroundColor: '#dbeafe', borderRadius: '6px' }}>
                            ☑️ <strong>P (Preferencial)</strong> → Cria: <em>"Casamento Preferencial"</em> com sigla <strong>CAP</strong><br/>
                            ☑️ <strong>C (Comum)</strong> → Cria: <em>"Casamento Comum"</em> com sigla <strong>CAC</strong><br/>
                            ☑️ <strong>Ambos (P + C)</strong> → Cria os <strong>2 serviços de uma vez</strong>!
                          </div>
                        </div>
                        
                        <div style={{ marginTop: '14px', padding: '12px', backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '6px' }}>
                          <strong style={{ color: '#92400e' }}>💡 Dica Importante:</strong><br/>
                          <span style={{ color: '#78350f' }}>
                            Marque <strong>P e C juntos</strong> para criar automaticamente as versões Preferencial e Comum do mesmo serviço. Isso economiza tempo e garante padronização!
                          </span>
                        </div>
                        
                        <div style={{ marginTop: '10px', fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>
                          ℹ️ A letra P ou C será adicionada automaticamente à sigla, a menos que você desmarque a opção no modal.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botão Fechar */}
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={() => setMostrarModalDicas(false)}
                    style={{
                      padding: '12px 32px',
                      backgroundColor: '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    Entendi!
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Modal: Adicionar Serviço */}
        {mostrarModalServico && (
          <div style={{
            position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: theme.surface,
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            border: `2px solid ${theme.border}`
          }}>
            <h2 style={{ 
              margin: '0 0 24px 0', 
              fontSize: '22px', 
              color: theme.text,
              borderBottom: `3px solid ${headerColor}`,
              paddingBottom: '12px'
            }}>
              ➕ Adicionar Novo Serviço
            </h2>

            {/* Nome do Serviço */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: theme.text, 
                display: 'block', 
                marginBottom: '8px' 
              }}>
                Nome do Serviço:
              </label>
              <input
                type="text"
                value={nomeNovoServico}
                onChange={(e) => setNomeNovoServico(e.target.value)}
                placeholder="Ex: Casamento, Certidão, Procuração..."
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  border: `2px solid ${theme.border}`,
                  borderRadius: '8px',
                  backgroundColor: theme.background,
                  color: theme.text
                }}
              />
            </div>

            {/* Sigla */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: theme.text, 
                display: 'block', 
                marginBottom: '8px' 
              }}>
                Sigla (sem P/C):
              </label>
              <input
                type="text"
                value={siglaNovoServico}
                onChange={(e) => setSiglaNovoServico(e.target.value.toUpperCase())}
                placeholder="Ex: CA, CT, PR..."
                maxLength={3}
                style={{
                  width: '120px',
                  padding: '12px',
                  fontSize: '18px',
                  fontWeight: '700',
                  textAlign: 'center',
                  border: `2px solid ${theme.border}`,
                  borderRadius: '8px',
                  backgroundColor: theme.background,
                  color: theme.text,
                  fontFamily: 'monospace'
                }}
              />
              
              {/* Checkbox para controlar adição automática de P/C */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '8px',
                cursor: 'pointer',
                padding: '8px',
                backgroundColor: theme.background,
                borderRadius: '6px',
                border: `1px solid ${theme.border}`
              }}>
                <input
                  type="checkbox"
                  checked={adicionarLetraPCAutomaticamente}
                  onChange={(e) => setAdicionarLetraPCAutomaticamente(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>
                    Adicionar P/C automaticamente à sigla
                  </div>
                  <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '2px' }}>
                    {adicionarLetraPCAutomaticamente 
                      ? 'Sigla final: ' + (siglaNovoServico ? `${siglaNovoServico}P / ${siglaNovoServico}C` : 'CAP / CAC')
                      : 'Sigla final: ' + (siglaNovoServico || 'CA (sem P/C)')
                    }
                  </div>
                </div>
              </label>
            </div>

            {/* Checkboxes P e C */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: theme.text, 
                display: 'block', 
                marginBottom: '12px' 
              }}>
                Cadastrar em:
              </label>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                {/* Checkbox P */}
                <label style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: cadastrarEmP ? '#dbeafe' : theme.background,
                  border: `3px solid ${cadastrarEmP ? '#3b82f6' : theme.border}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: cadastrarEmP ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                }}>
                  <input
                    type="checkbox"
                    checked={cadastrarEmP}
                    onChange={(e) => setCadastrarEmP(e.target.checked)}
                    style={{ 
                      width: '24px', 
                      height: '24px',
                      cursor: 'pointer',
                      accentColor: '#3b82f6'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6' }}>
                      P - Preferencial
                    </div>
                    <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                      Idosos, gestantes, PCD
                    </div>
                  </div>
                </label>

                {/* Checkbox C */}
                <label style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: cadastrarEmC ? '#d1fae5' : theme.background,
                  border: `3px solid ${cadastrarEmC ? '#10b981' : theme.border}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: cadastrarEmC ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                }}>
                  <input
                    type="checkbox"
                    checked={cadastrarEmC}
                    onChange={(e) => setCadastrarEmC(e.target.checked)}
                    style={{ 
                      width: '24px', 
                      height: '24px',
                      cursor: 'pointer',
                      accentColor: '#10b981'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
                      C - Comum
                    </div>
                    <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                      Atendimento geral
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Preview */}
            {(cadastrarEmP || cadastrarEmC) && nomeNovoServico && siglaNovoServico && (
              <div style={{
                padding: '16px',
                backgroundColor: theme.background,
                borderRadius: '8px',
                marginBottom: '24px',
                border: `2px solid ${theme.border}`
              }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '12px' }}>
                  📝 Serviços que serão criados:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cadastrarEmP && (
                    <div style={{ 
                      padding: '10px', 
                      backgroundColor: '#dbeafe', 
                      borderRadius: '6px',
                      border: '2px solid #3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div style={{
                        padding: '8px 12px',
                        backgroundColor: '#3b82f6',
                        color: '#fff',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '14px',
                        fontFamily: 'monospace'
                      }}>
                        {adicionarLetraPCAutomaticamente ? `${siglaNovoServico}P` : siglaNovoServico}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>
                        {nomeNovoServico} Preferencial
                      </div>
                    </div>
                  )}
                  {cadastrarEmC && (
                    <div style={{ 
                      padding: '10px', 
                      backgroundColor: '#d1fae5', 
                      borderRadius: '6px',
                      border: '2px solid #10b981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div style={{
                        padding: '8px 12px',
                        backgroundColor: '#10b981',
                        color: '#fff',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '14px',
                        fontFamily: 'monospace'
                      }}>
                        {adicionarLetraPCAutomaticamente ? `${siglaNovoServico}C` : siglaNovoServico}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#047857' }}>
                        {nomeNovoServico} Comum
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setMostrarModalServico(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={salvarNovoServico}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                ✅ Criar Serviço(s)
              </button>
            </div>
          </div>
        </div>
        )}
        
        <modal.ModalComponent />
      </BasePage>
    </>
  )
}

