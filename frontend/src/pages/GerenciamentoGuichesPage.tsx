import React, { useState, useEffect } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { useModal } from '../hooks/useModal'
import { senhaService } from '../services/SenhaService'
import { Guiche, ServicoSenha } from '../types/senha'

interface GerenciamentoGuichesPageProps {
  onClose: () => void
}

export function GerenciamentoGuichesPage({ onClose }: GerenciamentoGuichesPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const modal = useModal()
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
  
  const [guiches, setGuiches] = useState<Guiche[]>([])
  const [servicos, setServicos] = useState<ServicoSenha[]>([])
  const [funcionariosDisponiveis, setFuncionariosDisponiveis] = useState<any[]>([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [buscaFuncionario, setBuscaFuncionario] = useState('')
  const [novoGuiche, setNovoGuiche] = useState({
    numero: 1,
    nome: 'Guichê 1',
    funcionarioId: '',
    funcionarioNome: '',
    servicosSelecionados: [] as string[]
  })
  const [guichesExpandidos, setGuichesExpandidos] = useState<{
    [key: string]: {
      guiche: boolean
      funcionario: boolean
      servicos: boolean
    }
  }>({})

  useEffect(() => {
    carregarDados()
    carregarFuncionarios()
  }, [])

  const carregarDados = () => {
    setGuiches(senhaService.getGuiches())
    setServicos(senhaService.getServicos().filter(s => s.ativo))
  }

  const carregarFuncionarios = () => {
    const funcionariosSalvos = localStorage.getItem('funcionarios-cadastrados')
    let lista: any[] = []
    
    if (funcionariosSalvos) {
      try {
        lista = JSON.parse(funcionariosSalvos)
      } catch (error) {
        console.error('Erro ao carregar funcionários:', error)
        lista = []
      }
    }
    
    // Adicionar funcionário ADM para teste se não existir
    const temAdmin = lista.some(f => f.codigo === 999 || f.login === 'adm')
    if (!temAdmin) {
      const funcionarioAdmin = {
        id: 'func-adm-999',
        codigo: 999,
        nome: 'ADM (Teste)',
        login: 'adm',
        senha: 'adm',
        email: 'adm@cartorio.com',
        cpf: '000.000.000-00',
        telefone: '(00) 0000-0000',
        cargo: 'Administrador',
        setor: 'Teste',
        dataAdmissao: new Date().toISOString(),
        emAtividade: true,
        observacoes: 'Funcionário de teste para desenvolvimento'
      }
      lista.push(funcionarioAdmin)
      localStorage.setItem('funcionarios-cadastrados', JSON.stringify(lista))
    }
    
    // Filtrar apenas funcionários ativos
    const ativos = lista.filter((f: any) => f.emAtividade !== false)
    setFuncionariosDisponiveis(ativos)
  }

  const abrirFormularioNovoGuiche = () => {
    const numeroMaximo = guiches.length > 0 ? Math.max(...guiches.map(g => g.numero)) : 0
    const proximoNumero = numeroMaximo + 1
    
    setNovoGuiche({
      numero: proximoNumero,
      nome: `Guichê ${proximoNumero}`,
      funcionarioId: '',
      funcionarioNome: '',
      servicosSelecionados: servicos.map(s => s.id) // Todos por padrão
    })
    setBuscaFuncionario('')
    setMostrarFormulario(true)
  }

  const selecionarFuncionario = (func: any) => {
    setNovoGuiche({
      ...novoGuiche,
      funcionarioId: func.codigo || func.id,
      funcionarioNome: func.nome
    })
  }

  const criarNovoGuiche = async () => {
    if (!novoGuiche.funcionarioId) {
      await modal.alert('⚠️ Selecione um funcionário!', 'Atenção', '⚠️')
      return
    }

    if (novoGuiche.servicosSelecionados.length === 0) {
      await modal.alert('⚠️ Selecione pelo menos um serviço!', 'Atenção', '⚠️')
      return
    }

    const guicheParaCriar: Guiche = {
      id: `guiche-${Date.now()}`,
      numero: novoGuiche.numero,
      nome: novoGuiche.nome,
      ativo: true,
      funcionarioId: novoGuiche.funcionarioId,
      funcionarioNome: novoGuiche.funcionarioNome,
      servicosAtendidos: novoGuiche.servicosSelecionados,
      statusGuiche: 'livre'
    }
    
    // Garantir que funcionarioId é sempre o codigo do funcionário
    const funcionario = funcionariosDisponiveis.find(f => (f.id || f.codigo) === novoGuiche.funcionarioId)
    if (funcionario) {
      guicheParaCriar.funcionarioId = funcionario.codigo || funcionario.id
    }

    const novosGuiches = [...guiches, guicheParaCriar]
    setGuiches(novosGuiches)
    senhaService.salvarGuiches(novosGuiches)
    
    await modal.alert(
      `✅ Guichê ${novoGuiche.numero} criado para ${novoGuiche.funcionarioNome}!`,
      'Sucesso',
      '✅'
    )
    
    setMostrarFormulario(false)
    carregarDados()
  }


  const salvarGuiches = async () => {
    // Validar números duplicados
    const numeros = guiches.map(g => g.numero)
    const duplicados = numeros.filter((num, idx) => numeros.indexOf(num) !== idx)
    
    if (duplicados.length > 0) {
      await modal.alert(`Erro: Números de guichê duplicados (${duplicados.join(', ')})`, 'Erro', '❌')
      return
    }

    senhaService.salvarGuiches(guiches)
    await modal.alert('✅ Guichês salvos com sucesso!', 'Sucesso', '✅')
  }


  const removerGuiche = async (id: string) => {
    const confirmar = await modal.confirm(
      'Tem certeza que deseja remover este guichê?\n\nAs configurações serão perdidas.',
      'Confirmar Remoção',
      '⚠️'
    )
    
    if (confirmar) {
      setGuiches(guiches.filter(g => g.id !== id))
    }
  }

  const atualizarGuiche = (id: string, campo: keyof Guiche, valor: any) => {
    const novosGuiches = guiches.map(g => {
      if (g.id === id) {
        const guicheAtualizado = { ...g, [campo]: valor }
        
        // Se está removendo funcionário, limpar ambos os campos
        if (campo === 'funcionarioId' && !valor) {
          guicheAtualizado.funcionarioId = undefined
          guicheAtualizado.funcionarioNome = undefined
        }
        
        return guicheAtualizado
      }
      return g
    })
    
    setGuiches(novosGuiches)
    
    // Salvar automaticamente no localStorage
    senhaService.salvarGuiches(novosGuiches)
  }

  const toggleServico = (guicheId: string, servicoId: string) => {
    setGuiches(guiches.map(g => {
      if (g.id === guicheId) {
        const servicosAtendidos = g.servicosAtendidos.includes(servicoId)
          ? g.servicosAtendidos.filter(s => s !== servicoId)
          : [...g.servicosAtendidos, servicoId]
        return { ...g, servicosAtendidos }
      }
      return g
    }))
  }

  const toggleExpandirSecao = (guicheId: string, secao: 'guiche' | 'funcionario' | 'servicos') => {
    setGuichesExpandidos(prev => ({
      ...prev,
      [guicheId]: {
        guiche: secao === 'guiche' ? !prev[guicheId]?.guiche : (prev[guicheId]?.guiche || false),
        funcionario: secao === 'funcionario' ? !prev[guicheId]?.funcionario : (prev[guicheId]?.funcionario || false),
        servicos: secao === 'servicos' ? !prev[guicheId]?.servicos : (prev[guicheId]?.servicos || false)
      }
    }))
  }

  // Filtrar funcionários pela busca
  const funcionariosFiltrados = funcionariosDisponiveis.filter(func => {
    const busca = buscaFuncionario.toLowerCase()
    return (
      func.nome.toLowerCase().includes(busca) ||
      func.codigo.toString().includes(busca) ||
      (func.login && func.login.toLowerCase().includes(busca))
    )
  })

  return (
    <>
      {/* Modal de Adicionar Guichê */}
      {mostrarFormulario && (
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
            borderRadius: '12px',
            width: '600px',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}>
            {/* Header Modal */}
            <div style={{
              padding: '20px',
              backgroundColor: headerColor,
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>
                ➕ Adicionar Novo Guichê
              </h3>
              <button
                onClick={() => setMostrarFormulario(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Corpo Modal */}
            <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
              
              {/* Número e Nome */}
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                    Número
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={novoGuiche.numero}
                    onChange={(e) => {
                      const num = parseInt(e.target.value) || 1
                      setNovoGuiche({
                        ...novoGuiche,
                        numero: num,
                        nome: `Guichê ${num}`
                      })
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '18px',
                      fontWeight: '700',
                      textAlign: 'center',
                      border: `2px solid ${headerColor}`,
                      borderRadius: '6px',
                      backgroundColor: theme.background,
                      color: theme.text
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                    Nome do Guichê
                  </label>
                  <input
                    type="text"
                    value={novoGuiche.nome}
                    onChange={(e) => setNovoGuiche({
                      ...novoGuiche,
                      nome: e.target.value
                    })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      border: `2px solid ${theme.border}`,
                      borderRadius: '6px',
                      backgroundColor: theme.background,
                      color: theme.text
                    }}
                  />
                </div>
              </div>

              {/* Buscar Funcionário */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                  🔍 Buscar Funcionário (Nome, Código ou Login)
                </label>
                <input
                  type="text"
                  value={buscaFuncionario}
                  onChange={(e) => setBuscaFuncionario(e.target.value)}
                  placeholder="Digite para buscar..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    border: `2px solid ${theme.border}`,
                    borderRadius: '6px',
                    backgroundColor: theme.background,
                    color: theme.text
                  }}
                />
              </div>

              {/* Funcionário Selecionado */}
              {novoGuiche.funcionarioId ? (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#d1fae5',
                  border: '2px solid #10b981',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#065f46' }}>
                      ✅ {novoGuiche.funcionarioNome}
                    </div>
                    <div style={{ fontSize: '12px', color: '#047857' }}>
                      Cód: {funcionariosDisponiveis.find(f => (f.id || f.codigo) === novoGuiche.funcionarioId)?.codigo}
                    </div>
                  </div>
                  <button
                    onClick={() => setNovoGuiche({
                      ...novoGuiche,
                      funcionarioId: '',
                      funcionarioNome: ''
                    })}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ✕ Trocar
                  </button>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Selecionar Funcionário
                  </label>
                  <div style={{
                    maxHeight: '250px',
                    overflowY: 'auto',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    backgroundColor: theme.background
                  }}>
                    {funcionariosFiltrados.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>
                        {buscaFuncionario ? 'Nenhum funcionário encontrado' : 'Nenhum funcionário disponível'}
                      </div>
                    ) : (
                      funcionariosFiltrados.map((func) => {
                        const jaAtribuido = guiches.some(g => 
                          (g.funcionarioId === func.codigo || g.funcionarioId === func.id)
                        )
                        
                        return (
                          <button
                            key={func.id || func.codigo}
                            onClick={() => !jaAtribuido && selecionarFuncionario(func)}
                            disabled={jaAtribuido}
                            style={{
                              width: '100%',
                              padding: '14px',
                              backgroundColor: jaAtribuido ? '#f3f4f6' : theme.background,
                              border: 'none',
                              borderBottom: `1px solid ${theme.border}`,
                              cursor: jaAtribuido ? 'not-allowed' : 'pointer',
                              textAlign: 'left',
                              opacity: jaAtribuido ? 0.5 : 1,
                              transition: 'background-color 0.2s ease',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                            onMouseEnter={(e) => {
                              if (!jaAtribuido) {
                                e.currentTarget.style.backgroundColor = '#e0f2fe'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!jaAtribuido) {
                                e.currentTarget.style.backgroundColor = theme.background
                              }
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: theme.text }}>
                                👤 {func.nome}
                              </div>
                              <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                                Código: {func.codigo} • Login: {func.login || func.email || 'N/A'}
                              </div>
                            </div>
                            {jaAtribuido && (
                              <span style={{
                                fontSize: '11px',
                                color: '#ef4444',
                                fontWeight: 'bold',
                                backgroundColor: '#fee2e2',
                                padding: '3px 8px',
                                borderRadius: '4px'
                              }}>
                                EM USO
                              </span>
                            )}
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Serviços */}
              <div style={{ marginTop: '20px' }}>
                <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Serviços Atendidos
                </label>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '8px'
                }}>
                  {servicos.map((servico) => {
                    const selecionado = novoGuiche.servicosSelecionados.includes(servico.id)
                    return (
                      <button
                        key={servico.id}
                        onClick={() => {
                          setNovoGuiche({
                            ...novoGuiche,
                            servicosSelecionados: selecionado
                              ? novoGuiche.servicosSelecionados.filter(s => s !== servico.id)
                              : [...novoGuiche.servicosSelecionados, servico.id]
                          })
                        }}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: selecionado ? servico.cor : theme.background,
                          color: selecionado ? '#fff' : servico.cor,
                          border: `2px solid ${servico.cor}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {selecionado ? '✓' : ''} {servico.sigla} {servico.nome}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div style={{
              padding: '16px 20px',
              borderTop: `2px solid ${theme.border}`,
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setMostrarFormulario(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={criarNovoGuiche}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                ✅ Criar Guichê
              </button>
            </div>
          </div>
        </div>
      )}

      <BasePage
        title="Gerenciamento de Guichês"
        onClose={onClose}
        width="900px"
        height="700px"
        resizable={false}
        headerColor={headerColor}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <div style={{
            padding: '20px',
            borderBottom: `2px solid ${theme.border}`,
            backgroundColor: theme.surface
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: theme.text }}>
                  Configuração de Guichês
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: theme.textSecondary }}>
                  Gerencie os guichês de atendimento, números e serviços
                </p>
              </div>
              <button
                onClick={abrirFormularioNovoGuiche}
                style={{
                  padding: '10px 20px',
                  backgroundColor: headerColor,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                + Adicionar Guichê
              </button>
            </div>
          </div>



          {/* Lista de Guichês */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: theme.background }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '0' }}>
              {guiches.sort((a, b) => a.numero - b.numero).map((guiche) => (
                <div
                  key={guiche.id}
                  style={{
                    backgroundColor: theme.surface,
                    border: `2px solid ${guiche.ativo ? headerColor : theme.border}`,
                    borderRadius: '12px',
                    opacity: guiche.ativo ? 1 : 0.6,
                    overflow: 'hidden'
                  }}
                >
                  {/* Header Clicável - Minimizar/Expandir Guichê */}
                  <button
                    onClick={() => toggleExpandirSecao(guiche.id, 'guiche')}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      backgroundColor: guichesExpandidos[guiche.id]?.guiche ? theme.surface : theme.background,
                      border: 'none',
                      borderBottom: guichesExpandidos[guiche.id]?.guiche ? `2px solid ${theme.border}` : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {/* Badge do Número */}
                      <div style={{
                        width: '50px',
                        height: '50px',
                        backgroundColor: guiche.ativo ? headerColor : theme.border,
                        color: '#fff',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: '700',
                        boxShadow: guiche.ativo ? `0 2px 8px ${headerColor}40` : 'none'
                      }}>
                        {guiche.numero}
                      </div>
                      
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: theme.text }}>
                          {guiche.nome}
                        </div>
                        <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                          {guiche.funcionarioNome || 'Sem funcionário'} • {guiche.servicosAtendidos.length} serviço(s)
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        padding: '4px 10px',
                        backgroundColor: guiche.ativo ? '#10b981' : '#6b7280',
                        color: '#fff',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {guiche.ativo ? '✓ Ativo' : '✕ Inativo'}
                      </span>
                      <span style={{ fontSize: '20px', color: theme.text }}>
                        {guichesExpandidos[guiche.id]?.guiche ? '▲' : '▼'}
                      </span>
                    </div>
                  </button>

                  {/* Conteúdo Expansível do Guichê */}
                  {guichesExpandidos[guiche.id]?.guiche && (
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'start' }}>
                        {/* Campos */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Linha 1: Número e Nome */}
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: theme.textSecondary, display: 'block', marginBottom: '4px' }}>
                            Número
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={guiche.numero}
                            onChange={(e) => {
                              const novoNumero = parseInt(e.target.value) || 1
                              // Atualizar número e nome juntos em uma única operação
                              const novosGuiches = guiches.map(g => 
                                g.id === guiche.id 
                                  ? { ...g, numero: novoNumero, nome: `Guichê ${novoNumero}` }
                                  : g
                              )
                              setGuiches(novosGuiches)
                              senhaService.salvarGuiches(novosGuiches)
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
                            Nome do Guichê
                          </label>
                          <input
                            type="text"
                            value={guiche.nome}
                            onChange={(e) => atualizarGuiche(guiche.id, 'nome', e.target.value)}
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
                      </div>

                      {/* Linha 2: Funcionário - Minimizável */}
                      <div>
                        <button
                          onClick={() => toggleExpandirSecao(guiche.id, 'funcionario')}
                          style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: guiche.funcionarioId ? '#d1fae5' : theme.surface,
                            border: `2px solid ${guiche.funcionarioId ? '#10b981' : theme.border}`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px' }}>👤</span>
                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: theme.text }}>
                              Funcionário: {guiche.funcionarioNome || 'Nenhum'}
                            </span>
                          </div>
                          <span style={{ fontSize: '16px', color: theme.textSecondary }}>
                            {guichesExpandidos[guiche.id]?.funcionario ? '▲' : '▼'}
                          </span>
                        </button>
                        
                        {/* Conteúdo Expansível - Funcionário */}
                        {guichesExpandidos[guiche.id]?.funcionario && (
                          <div style={{ marginBottom: '12px' }}>
                            {guiche.funcionarioId ? (
                          <div style={{
                            padding: '12px',
                            backgroundColor: '#d1fae5',
                            border: '2px solid #10b981',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#065f46' }}>
                                👤 {guiche.funcionarioNome}
                              </div>
                              <div style={{ fontSize: '11px', color: '#047857' }}>
                                Cód: {funcionariosDisponiveis.find(f => (f.id || f.codigo) === guiche.funcionarioId)?.codigo || 'N/A'}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                // Remover funcionário (limpa ambos os campos)
                                atualizarGuiche(guiche.id, 'funcionarioId', undefined)
                                // Garantir que dropdown fica aberto para selecionar outro
                                setTimeout(() => {
                                  setGuichesExpandidos(prev => ({
                                    ...prev,
                                    [guiche.id]: {
                                      ...prev[guiche.id],
                                      funcionario: true
                                    }
                                  }))
                                }, 50)
                              }}
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                background: '#ef4444',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                              }}
                            >
                              ✕ Remover
                            </button>
                          </div>
                        ) : (
                          <div style={{
                            padding: '12px',
                            backgroundColor: theme.background,
                            border: `2px dashed ${theme.border}`,
                            borderRadius: '8px',
                            marginBottom: '8px',
                            textAlign: 'center',
                            color: theme.textSecondary,
                            fontSize: '13px'
                          }}>
                            🔓 Nenhum funcionário atribuído (Guichê Livre)
                          </div>
                        )}

                        {/* Lista de Funcionários Disponíveis */}
                        {!guiche.funcionarioId && funcionariosDisponiveis.length > 0 && (
                          <div>
                            <div style={{
                              fontSize: '11px',
                              color: theme.textSecondary,
                              marginBottom: '6px',
                              fontWeight: 'bold'
                            }}>
                              📋 Selecionar Funcionário:
                            </div>
                            <div style={{
                              maxHeight: '200px',
                              overflowY: 'auto',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              padding: '4px',
                              backgroundColor: theme.background,
                              borderRadius: '6px',
                              border: `1px solid ${theme.border}`
                            }}>
                              {funcionariosDisponiveis.map((func) => {
                        const jaAtribuido = guiches.some(g => 
                          g.id !== guiche.id && (g.funcionarioId === func.codigo || g.funcionarioId === func.id)
                        )
                                
                                return (
                                  <button
                                    key={func.id || func.codigo}
                                    onClick={() => {
                                      if (!jaAtribuido) {
                                        // Atualizar guichê com funcionário (sempre usar codigo como prioritário)
                                        const funcionarioId = func.codigo || func.id
                                        const novosGuiches = guiches.map(g => 
                                          g.id === guiche.id 
                                            ? { ...g, funcionarioId: funcionarioId, funcionarioNome: func.nome }
                                            : g
                                        )
                                        setGuiches(novosGuiches)
                                        // Salvar imediatamente no localStorage
                                        senhaService.salvarGuiches(novosGuiches)
                                      }
                                    }}
                                    disabled={jaAtribuido}
                                    style={{
                                      padding: '10px',
                                      backgroundColor: jaAtribuido ? '#f3f4f6' : '#fff',
                                      border: `2px solid ${jaAtribuido ? '#d1d5db' : '#14b8a6'}`,
                                      borderRadius: '6px',
                                      cursor: jaAtribuido ? 'not-allowed' : 'pointer',
                                      textAlign: 'left',
                                      opacity: jaAtribuido ? 0.5 : 1,
                                      transition: 'all 0.2s ease',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!jaAtribuido) {
                                        e.currentTarget.style.backgroundColor = '#e0f2fe'
                                        e.currentTarget.style.borderColor = '#0891b2'
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!jaAtribuido) {
                                        e.currentTarget.style.backgroundColor = '#fff'
                                        e.currentTarget.style.borderColor = '#14b8a6'
                                      }
                                    }}
                                  >
                                    <div>
                                      <div style={{
                                        fontSize: '13px',
                                        fontWeight: 'bold',
                                        color: jaAtribuido ? '#9ca3af' : '#1f2937'
                                      }}>
                                        👤 {func.nome}
                                      </div>
                                      <div style={{
                                        fontSize: '11px',
                                        color: jaAtribuido ? '#d1d5db' : '#6b7280'
                                      }}>
                                        Código: {func.codigo} • Login: {func.login || func.email || 'N/A'}
                                      </div>
                                    </div>
                                    {jaAtribuido && (
                                      <span style={{
                                        fontSize: '10px',
                                        color: '#ef4444',
                                        fontWeight: 'bold',
                                        backgroundColor: '#fee2e2',
                                        padding: '3px 8px',
                                        borderRadius: '4px'
                                      }}>
                                        EM USO
                                      </span>
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                          </div>
                        )}
                      </div>

                      {/* Linha 3: Serviços Atendidos - Minimizável */}
                      <div>
                        <button
                          onClick={() => toggleExpandirSecao(guiche.id, 'servicos')}
                          style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: theme.surface,
                            border: `2px solid ${theme.border}`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px' }}>⚙️</span>
                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: theme.text }}>
                              Serviços ({guiche.servicosAtendidos.length}/{servicos.length})
                            </span>
                          </div>
                          <span style={{ fontSize: '16px', color: theme.textSecondary }}>
                            {guichesExpandidos[guiche.id]?.servicos ? '▲' : '▼'}
                          </span>
                        </button>

                        {guichesExpandidos[guiche.id]?.servicos && (
                          <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: '8px',
                            padding: '10px',
                            backgroundColor: theme.background,
                            borderRadius: '6px',
                            border: `1px solid ${theme.border}`
                          }}>
                            {servicos.map(servico => (
                            <label
                              key={servico.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                backgroundColor: guiche.servicosAtendidos.includes(servico.id) ? servico.cor + '20' : theme.surface,
                                border: `2px solid ${guiche.servicosAtendidos.includes(servico.id) ? servico.cor : theme.border}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: '13px',
                                fontWeight: guiche.servicosAtendidos.includes(servico.id) ? '600' : '400'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={guiche.servicosAtendidos.includes(servico.id)}
                                onChange={() => toggleServico(guiche.id, servico.id)}
                                style={{ width: '16px', height: '16px' }}
                              />
                              <span style={{ color: servico.cor, fontWeight: '700' }}>{servico.sigla}</span>
                              <span style={{ color: theme.text }}>{servico.nome}</span>
                            </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                        {/* Ações */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '100px' }}>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: theme.text,
                            padding: '6px 10px',
                            backgroundColor: theme.background,
                            borderRadius: '6px'
                          }}>
                            <input
                              type="checkbox"
                              checked={guiche.ativo}
                              onChange={(e) => atualizarGuiche(guiche.id, 'ativo', e.target.checked)}
                              style={{ width: '16px', height: '16px' }}
                            />
                            Ativo
                          </label>
                          
                          <button
                            onClick={() => removerGuiche(guiche.id)}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            🗑️ Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

            </div>
          </div>

          {/* Rodapé */}
          <div style={{
            padding: '16px 20px',
            borderTop: `2px solid ${theme.border}`,
            backgroundColor: theme.surface,
            display: 'flex',
            gap: '10px',
            justifyContent: 'center'
          }}>
            <button
              onClick={salvarGuiches}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: '#10b981',
                color: '#fff'
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
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: '#6c757d',
                color: '#fff'
              }}
            >
              🚪 Retornar
            </button>
          </div>
        </div>
        
        {/* Modal Component - DENTRO da janela */}
        <modal.ModalComponent />
      </BasePage>
    </>
  )
}

