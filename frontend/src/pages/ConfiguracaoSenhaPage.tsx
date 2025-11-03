import React, { useState, useEffect } from 'react'
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
  
  const [abaAtiva, setAbaAtiva] = useState<'tipos' | 'servicos' | 'configuracao'>('servicos')
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
  const [categoriaNovoServico, setCategoriaNovoServico] = useState<string | null>(null)
  const [nomeNovoServico, setNomeNovoServico] = useState('')
  const [siglaNovoServico, setSiglaNovoServico] = useState('')
  const [cadastrarEmP, setCadastrarEmP] = useState(false)
  const [cadastrarEmC, setCadastrarEmC] = useState(false)
  const [adicionarLetraPCAutomaticamente, setAdicionarLetraPCAutomaticamente] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = () => {
    // Categorias P e C são FIXAS - sempre as mesmas
    const categoriasFixas: CategoriaServico[] = [
      {
        id: 'cat-preferencial',
        nome: 'Preferencial',
        tipo: 'preferencial',
        sigla: 'P',
        cor: '#3b82f6',
        ativo: true,
        ordem: 1
      },
      {
        id: 'cat-comum',
        nome: 'Comum',
        tipo: 'comum',
        sigla: 'C',
        cor: '#10b981',
        ativo: true,
        ordem: 2
      }
    ]
    setCategorias(categoriasFixas)
    
    setServicos(senhaService.getServicos())
    setConfiguracao(senhaService.getConfiguracao())
  }

  const salvarServicos = async () => {
    senhaService.salvarServicos(servicos)
    await modal.alert('✅ Serviços salvos com sucesso!', 'Sucesso', '✅')
  }

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

  const salvarConfiguracao = async () => {
    if (configuracao) {
      senhaService.salvarConfiguracao(configuracao)
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
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: theme.text }}>
                      🔊 Som e Áudio
                    </h4>

                    {/* Tipo de Áudio */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ fontSize: '13px', color: theme.textSecondary, display: 'block', marginBottom: '8px' }}>
                        Tipo de Áudio ao Chamar Senha
                      </label>
                      <select
                        value={configuracao.tipoAudio || 'voz'}
                        onChange={(e) => setConfiguracao({ 
                          ...configuracao, 
                          tipoAudio: e.target.value as TipoAudio,
                          emitirSom: e.target.value === 'som' || e.target.value === 'ambos',
                          usarVoz: e.target.value === 'voz' || e.target.value === 'ambos'
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
                    {(configuracao.tipoAudio === 'som' || configuracao.tipoAudio === 'ambos') && (
                      <div style={{ 
                        padding: '16px',
                        backgroundColor: theme.background,
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`
                      }}>
                        <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600', color: theme.text }}>
                          🔔 Configurações de Som (Beep)
                        </h5>
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
                          max="50"
                          value={configuracao.quantidadeSenhasExibidas}
                          onChange={(e) => setConfiguracao({ ...configuracao, quantidadeSenhasExibidas: parseInt(e.target.value) || 10 })}
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
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: theme.text }}>
                      📺 Layout do Painel Público
                    </h4>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '13px', color: theme.textSecondary, display: 'block', marginBottom: '12px' }}>
                        Posição da Senha Atual
                      </label>
                      
                      {/* Layouts Horizontais */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: theme.text, marginBottom: '8px' }}>
                          📐 Layouts Horizontais:
                        </div>
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
                        </div>
                      </div>

                      {/* Layouts Verticais */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: theme.text, marginBottom: '8px' }}>
                          📐 Layouts Verticais:
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
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
                    </div>

                    {/* Preview do Layout */}
                    <div style={{
                      padding: '16px',
                      backgroundColor: theme.background,
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      marginTop: '16px'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: theme.textSecondary, marginBottom: '12px', textAlign: 'center' }}>
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
                          backgroundColor: '#3b82f6',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '24px',
                          fontWeight: '700',
                          fontFamily: 'monospace'
                        }}>
                          P001
                        </div>
                        <div style={{
                          flex: configuracao.layoutPainelPublico === 'senha-cima' || configuracao.layoutPainelPublico === 'senha-baixo' ? 1 : 2.2,
                          backgroundColor: '#64748b',
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
                      <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '8px', textAlign: 'center' }}>
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
      </BasePage>
      
      {/* Modal: Adicionar Serviço */}
      {mostrarModalServico && (
        <div style={{
          position: 'fixed',
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
    </>
  )
}

