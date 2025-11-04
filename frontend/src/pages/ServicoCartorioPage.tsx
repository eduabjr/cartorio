// ServicoCartorioPage.tsx
// Tela de Cadastro/Manutenção de Serviços de Cartório
// Permite configurar manualmente cada item da tabela de custas com valores

import React, { useState, useEffect } from 'react'
import { BasePage } from '../components/BasePage'
import { naturezaService, Natureza } from '../services/NaturezaService'
import { useAccessibility } from '../hooks/useAccessibility'
import { getRelativeFontSize } from '../utils/fontUtils'
import { useModal } from '../hooks/useModal'

interface ServicoCartorioPageProps {
  onClose: () => void
  resetToOriginalPosition?: boolean
}

export function ServicoCartorioPage({ onClose, resetToOriginalPosition }: ServicoCartorioPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const modal = useModal()
  
  // Cor do header: teal no light, laranja no dark (PADRÃO DO SISTEMA)
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'

  const [activeTab, setActiveTab] = useState<'criar' | 'valores' | 'visualizar'>('criar')
  const [naturezas, setNaturezas] = useState<Natureza[]>([])
  const [naturezaSelecionada, setNaturezaSelecionada] = useState<Natureza | null>(null)
  const [forceUpdate, setForceUpdate] = useState(0)
  
  // Estados para Natureza (Aba 1)
  const [naturezaForm, setNaturezaForm] = useState({
    codigo: '0',
    nome: '',
    ativo: true
  })
  const [isEditingNatureza, setIsEditingNatureza] = useState(false)
  
  // Estado para armazenar naturezas do JSON
  const [naturezasJSON, setNaturezasJSON] = useState<Array<{codigo: string, nome: string, ativo: boolean}>>([])
  
  // Carregar naturezas do JSON
  useEffect(() => {
    const carregarNaturezasJSON = async () => {
      try {
        const response = await fetch('/extra/naturezaProtocolo.json')
        if (response.ok) {
          const data = await response.json()
          setNaturezasJSON(data)
          console.log('✅ Naturezas/Protocolos carregados do JSON:', data)
        } else {
          console.warn('⚠️ Não foi possível carregar naturezaProtocolo.json')
        }
      } catch (error) {
        console.error('❌ Erro ao carregar naturezaProtocolo.json:', error)
      }
    }
    
    carregarNaturezasJSON()
  }, [])
  
  // Estados para Valores (Aba 2)
  const [valoresForm, setValoresForm] = useState({
    naturezaId: '',
    valorOficial: 0,
    valorIss: 0,
    valorSecFaz: 0,
    valorTotal: 0
  })

  // Carregar listas na inicialização e quando forceUpdate mudar
  useEffect(() => {
    carregarNaturezas()
  }, [forceUpdate])

  const carregarNaturezas = async () => {
    try {
      console.log('🔄 Carregando naturezas...')
      const lista = await naturezaService.listar()
      console.log('📋 Naturezas carregadas da API/Storage:', lista)
      console.log('📊 Total de naturezas:', lista.length)
      
      if (Array.isArray(lista)) {
        setNaturezas(lista)
        console.log('✅ State de naturezas atualizado')
      } else {
        console.error('❌ Lista retornada não é um array:', typeof lista)
        setNaturezas([])
      }
    } catch (error) {
      console.error('❌ Erro ao carregar naturezas:', error)
      setNaturezas([])
    }
  }

  const gerarProximoCodigo = async (): Promise<string> => {
    console.log('🔢 Iniciando geração de código...')
    
    // Buscar DIRETAMENTE do localStorage para garantir dados atualizados
    const storageData = localStorage.getItem('cartorio_naturezas')
    const lista = storageData ? JSON.parse(storageData) : []
    
    console.log('📦 Naturezas no localStorage:', lista)
    console.log('📊 Total encontrado:', lista.length)
    
    // Encontrar o maior número de código
    let maiorNumero = 0
    
    lista.forEach((nat: any) => {
      const numero = parseInt(nat.codigo)
      console.log(`🔍 Verificando código "${nat.codigo}" → número: ${numero}`)
      if (!isNaN(numero) && numero > maiorNumero) {
        maiorNumero = numero
      }
    })
    
    const proximoCodigo = String(maiorNumero + 1)
    console.log(`🔢 Maior código encontrado: ${maiorNumero}`)
    console.log(`🔢 Próximo código será: ${proximoCodigo}`)
    return proximoCodigo
  }

  // Handlers para Natureza (Aba 1)
  const handleNaturezaInputChange = (field: string, value: any) => {
    setNaturezaForm(prev => ({ ...prev, [field]: value }))
  }

  // Handlers para Valores (Aba 2)
  const handleValoresInputChange = (field: string, value: any) => {
    setValoresForm(prev => ({ ...prev, [field]: value }))
  }

  const calcularTotalValores = () => {
    const total = valoresForm.valorOficial + valoresForm.valorIss + valoresForm.valorSecFaz
    setValoresForm(prev => ({ ...prev, valorTotal: Number(total.toFixed(2)) }))
  }

  useEffect(() => {
    calcularTotalValores()
  }, [valoresForm.valorOficial, valoresForm.valorIss, valoresForm.valorSecFaz])

  // Debug: Monitorar mudanças no state de naturezas
  useEffect(() => {
    console.log('🔄 STATE DE NATUREZAS MUDOU:', naturezas)
    console.log('📊 Quantidade:', naturezas.length)
  }, [naturezas])

  const handleNovoNatureza = () => {
    setNaturezaForm({
      codigo: '0',
      nome: '',
      ativo: true
    })
    setNaturezaSelecionada(null)
    setIsEditingNatureza(false)
    console.log('📄 Nova natureza iniciada! Código: 0')
  }
  
  const handleNovoValores = () => {
    setValoresForm({
      naturezaId: '',
      valorOficial: 0,
      valorIss: 0,
      valorSecFaz: 0,
      valorTotal: 0
    })
    console.log('📄 Novos valores iniciados!')
  }

  const handleGravarValores = async () => {
    try {
      if (!valoresForm.naturezaId) {
        await modal.alert('Selecione uma natureza!', 'Atenção', '⚠️')
        return
      }

      console.log('💾 Salvando valores...', valoresForm)

      // Buscar a natureza selecionada
      const natureza = naturezas.find(n => n.id === valoresForm.naturezaId)
      
      if (!natureza) {
        await modal.alert('Natureza não encontrada!', 'Erro', '❌')
        return
      }

      // Salvar os valores no localStorage com chave específica
      const valoresKey = `cartorio_valores_${natureza.codigo}`
      const dadosValores = {
        naturezaId: valoresForm.naturezaId,
        naturezaCodigo: natureza.codigo,
        naturezaNome: natureza.descricao,
        valorOficial: valoresForm.valorOficial,
        valorIss: valoresForm.valorIss,
        valorSecFaz: valoresForm.valorSecFaz,
        valorTotal: valoresForm.valorTotal,
        dataAtualizacao: new Date().toISOString()
      }

      localStorage.setItem(valoresKey, JSON.stringify(dadosValores))
      console.log('✅ Valores salvos no localStorage:', dadosValores)

      await modal.alert(`Valores da natureza "${natureza.descricao}" salvos com sucesso!`, 'Sucesso', '✅')
      handleNovoValores()
    } catch (error: any) {
      console.error('❌ Erro ao salvar valores:', error)
      await modal.alert(`Erro ao salvar valores: ${error.message}`, 'Erro', '❌')
    }
  }

  const carregarValoresNatureza = (naturezaId: string) => {
    const natureza = naturezas.find(n => n.id === naturezaId)
    if (!natureza) return

    // Tentar carregar valores salvos
    const valoresKey = `cartorio_valores_${natureza.codigo}`
    const dadosSalvos = localStorage.getItem(valoresKey)
    
    if (dadosSalvos) {
      const valores = JSON.parse(dadosSalvos)
      setValoresForm({
        naturezaId: naturezaId,
        valorOficial: valores.valorOficial || 0,
        valorIss: valores.valorIss || 0,
        valorSecFaz: valores.valorSecFaz || 0,
        valorTotal: valores.valorTotal || 0
      })
      console.log('📥 Valores carregados:', valores)
    } else {
      setValoresForm({
        naturezaId: naturezaId,
        valorOficial: 0,
        valorIss: 0,
        valorSecFaz: 0,
        valorTotal: 0
      })
    }
  }

  const handleGravarNatureza = async () => {
    console.log('🔵 handleGravarNatureza INICIADO')
    console.log('📝 Dados do formulário:', naturezaForm)
    
    try {
      if (!naturezaForm.nome) {
        await modal.alert('Nome é obrigatório!', 'Campo Obrigatório', '⚠️')
        return
      }

      let codigoFinal = naturezaForm.codigo

      // Se for novo cadastro (código = 0), gerar o próximo código
      if (!isEditingNatureza || naturezaForm.codigo === '0') {
        console.log('🔢 Gerando próximo código...')
        codigoFinal = await gerarProximoCodigo()
        console.log('🔢 Novo código gerado:', codigoFinal)
      }

      const naturezaData = {
        codigo: codigoFinal,
        descricao: naturezaForm.nome,
        percentualIss: 0,
        ativo: naturezaForm.ativo
      }

      console.log('📤 Enviando dados para API:', naturezaData)

      if (isEditingNatureza && naturezaSelecionada?.id) {
        console.log('🔄 Atualizando natureza existente...')
        const resultado = await naturezaService.atualizar(naturezaSelecionada.id, naturezaData)
        console.log('✅ Resultado da atualização:', resultado)
        await modal.alert('Natureza atualizada com sucesso!', 'Sucesso', '✅')
      } else {
        console.log('➕ Criando nova natureza...')
        const resultado = await naturezaService.criar(naturezaData)
        console.log('✅ Resultado da criação:', resultado)
        await modal.alert('Natureza cadastrada com sucesso!', 'Sucesso', '✅')
      }

      console.log('🔄 Recarregando lista de naturezas...')
      
      // Aguardar um pouco para localStorage estar atualizado
      await new Promise(resolve => setTimeout(resolve, 100))
      
      await carregarNaturezas()
      
      // Forçar re-render da lista
      setForceUpdate(prev => prev + 1)
      
      console.log('✅ Lista recarregada. Forçando atualização...')
      
      // Aguardar mais um pouco antes de gerar novo código
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Disparar evento para outras telas atualizarem
      window.dispatchEvent(new Event('naturezas-atualizadas'))
      
      handleNovoNatureza()
    } catch (error: any) {
      console.error('❌ ERRO COMPLETO ao gravar natureza:', error)
      console.error('❌ Mensagem:', error.message)
      console.error('❌ Stack:', error.stack)
      await modal.alert(`Erro ao gravar natureza: ${error.message || 'Erro desconhecido'}`, 'Erro', '❌')
    }
  }

  const handleExcluirNatureza = async () => {
    if (!naturezaSelecionada?.id) {
      await modal.alert('Selecione uma natureza para excluir!', 'Atenção', '⚠️')
      return
    }

    const confirmado = await modal.confirm('Tem certeza que deseja excluir esta natureza?', 'Confirmar Exclusão', '⚠️')
    if (confirmado) {
      try {
        await naturezaService.remover(naturezaSelecionada.id)
        await modal.alert('Natureza excluída com sucesso!', 'Sucesso', '✅')
        await carregarNaturezas()
        setForceUpdate(prev => prev + 1)
        
        // Disparar evento para outras telas atualizarem
        window.dispatchEvent(new Event('naturezas-atualizadas'))
        
        handleNovoNatureza()
      } catch (error) {
        console.error('❌ Erro ao excluir natureza:', error)
        await modal.alert('Erro ao excluir natureza.', 'Erro', '❌')
      }
    }
  }

  const handleSelecionarNatureza = (natureza: Natureza) => {
    setNaturezaForm({
      codigo: natureza.codigo,
      nome: natureza.descricao,
      ativo: natureza.ativo ?? true
    })
    setNaturezaSelecionada(natureza)
    setIsEditingNatureza(true)
  }

  const handleToggleAtivo = async (natureza: Natureza) => {
    try {
      const novoStatus = !natureza.ativo
      await naturezaService.atualizar(natureza.id!, { ativo: novoStatus })
      await carregarNaturezas()
      setForceUpdate(prev => prev + 1)
      console.log(`✅ Natureza ${novoStatus ? 'ativada' : 'desativada'}`)
    } catch (error) {
      console.error('❌ Erro ao alterar status:', error)
    }
  }

  const handleGeracaoAutomatica = async () => {
    if (naturezasJSON.length === 0) {
      await modal.alert('Nenhuma natureza encontrada no JSON. Verifique o arquivo naturezaProtocolo.json', 'Atenção', '⚠️')
      return
    }

    const confirmado = await modal.confirm(`Isso irá criar ${naturezasJSON.length} naturezas automaticamente. Deseja continuar?`, 'Geração Automática', '⚠️')
    if (!confirmado) {
      return
    }

    try {
      console.log('🤖 Iniciando geração automática de naturezas do JSON...')
      
      let countCriadas = 0
      let countJaExistentes = 0
      
      for (const naturezaJSON of naturezasJSON) {
        // Verificar se já existe
        const jaExiste = naturezas.some(n => 
          n.codigo === naturezaJSON.codigo || 
          n.descricao.toLowerCase() === naturezaJSON.nome.toLowerCase()
        )
        
        if (jaExiste) {
          console.log(`⚠️ Natureza "${naturezaJSON.nome}" (código ${naturezaJSON.codigo}) já existe, pulando...`)
          countJaExistentes++
          continue
        }
        
        const naturezaData = {
          codigo: naturezaJSON.codigo,
          descricao: naturezaJSON.nome,
          percentualIss: 0,
          ativo: naturezaJSON.ativo
        }
        
        await naturezaService.criar(naturezaData)
        console.log(`✅ Criada: ${naturezaJSON.codigo} - ${naturezaJSON.nome}`)
        countCriadas++
      }

      await new Promise(resolve => setTimeout(resolve, 200))
      await carregarNaturezas()
      setForceUpdate(prev => prev + 1)
      
      let mensagem = `✅ ${countCriadas} natureza(s) criada(s) com sucesso!`
      if (countJaExistentes > 0) {
        mensagem += `\nℹ️ ${countJaExistentes} natureza(s) já existia(m) e foi(ram) ignorada(s).`
      }
      
      await modal.alert(mensagem, 'Geração Concluída', '✅')
      console.log('🎉 Geração automática concluída!')
      
      // Disparar evento para outras telas atualizarem
      window.dispatchEvent(new Event('naturezas-atualizadas'))
    } catch (error: any) {
      console.error('❌ Erro na geração automática:', error)
      await modal.alert(`Erro ao gerar naturezas: ${error.message}`, 'Erro', '❌')
    }
  }


  // Estilos
  const formContainerStyles = {
    flex: 1,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    padding: '12px',
    flexShrink: 1
  }

  const formStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  }

  const rowStyles = {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end',
    flexWrap: 'nowrap' as const
  }

  const fieldStyles = (flex: string = '1') => ({
    display: 'flex',
    flexDirection: 'column' as const,
    flex,
    minWidth: 0
  })

  const labelStyles = {
    fontSize: getRelativeFontSize(12),
    fontWeight: '600' as const,
    marginBottom: '4px',
    color: theme.text
  }

  const inputStyles = (disabled = false) => ({
    width: '100%',
    padding: '7px 10px',
    fontSize: getRelativeFontSize(13),
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    backgroundColor: disabled ? theme.background : theme.surface,
    color: disabled ? theme.textSecondary : theme.text,
    outline: 'none'
  })

  const arrowColor = currentTheme === 'dark' ? '%23FFFFFF' : '%23333333'
  const selectStyles = {
    width: '100%',
    padding: '7px 10px',
    fontSize: getRelativeFontSize(13),
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    backgroundColor: theme.surface,
    color: theme.text,
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    MozAppearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${arrowColor}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    backgroundSize: '14px',
    paddingRight: '30px'
  }

  const buttonContainerStyles = {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    borderTop: `1px solid ${theme.border}`,
    backgroundColor: theme.background,
    flexWrap: 'nowrap' as const,
    flexShrink: 0,
    justifyContent: 'center' as const  // 🔒 CENTRALIZAR BOTÕES
  }

  const buttonStyles = (isPrimary = false) => ({
    padding: '8px 16px',
    fontSize: getRelativeFontSize(13),
    fontWeight: '500' as const,
    border: isPrimary ? 'none' : `1px solid ${theme.border}`,
    borderRadius: '4px',
    backgroundColor: isPrimary ? theme.primary : theme.surface,
    color: isPrimary ? 'white' : theme.text,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const
  })

  const tabButtonStyles = (isActive: boolean) => ({
    padding: '12px 24px',
    fontSize: getRelativeFontSize(14),
    fontWeight: '600' as const,
    border: 'none',
    borderBottom: isActive ? `3px solid ${headerColor}` : '3px solid transparent',
    backgroundColor: isActive ? theme.surface : theme.background,
    color: isActive ? theme.text : theme.textSecondary,
    cursor: 'pointer',
    transition: 'all 0.2s',
    flex: 1
  })

  const sectionTitleStyles = {
    fontSize: getRelativeFontSize(14),
    fontWeight: '700' as const,
    color: theme.primary,
    marginTop: '12px',
    marginBottom: '8px',
    paddingBottom: '4px',
    borderBottom: `2px solid ${theme.primary}`
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <>
    <BasePage
      title="Cadastro de Naturezas - Tabela de Custas"
      onClose={onClose}
        width="900px"
        height="650px"
        minWidth="900px"
        minHeight="650px"
      headerColor={headerColor}
      resetToOriginalPosition={resetToOriginalPosition}
      draggable={true}
        resizable={false}
    >
      {/* Menu de Abas com Setas Separadoras */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: `2px solid ${theme.border}`,
        backgroundColor: theme.background,
        gap: '0'
      }}>
        <button
          onClick={() => setActiveTab('criar')}
          style={tabButtonStyles(activeTab === 'criar')}
        >
          1️⃣ Criar Natureza
        </button>
        
        <div style={{
          width: '30px',
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#3b82f6',
          color: 'white',
          fontSize: getRelativeFontSize(14),
          fontWeight: 'bold'
        }}>
          →
        </div>
        
        <button
          onClick={() => setActiveTab('valores')}
          style={tabButtonStyles(activeTab === 'valores')}
        >
          2️⃣ Cadastrar Valores
        </button>
        
        <div style={{
          width: '30px',
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#3b82f6',
          color: 'white',
          fontSize: getRelativeFontSize(14),
          fontWeight: 'bold'
        }}>
          →
        </div>
        
        <button
          onClick={() => setActiveTab('visualizar')}
          style={tabButtonStyles(activeTab === 'visualizar')}
        >
          3️⃣ Gerenciar Naturezas
        </button>
      </div>

      {/* ABA 1: Criar Natureza */}
      {activeTab === 'criar' && (
        <>
          <div style={formContainerStyles}>
            <div style={formStyles}>
              <div style={sectionTitleStyles}>1️⃣ Criar Nova Natureza</div>
          
          {/* Linha 1: Código, Nome e Status */}
          <div style={rowStyles}>
            <div style={fieldStyles('0 0 200px')}>
              <label style={labelStyles}>Código: (Automático)</label>
              <input
                type="text"
                value={naturezaForm.codigo}
                style={{
                  ...inputStyles(true),
                  fontWeight: '600',
                  backgroundColor: theme.background,
                  color: theme.primary
                }}
                disabled
                placeholder="NAT-XXX"
              />
            </div>
            <div style={fieldStyles('1')}>
              <label style={labelStyles}>Nome da Natureza: *</label>
              <input
                type="text"
                value={naturezaForm.nome}
                onChange={(e) => handleNaturezaInputChange('nome', e.target.value)}
                style={inputStyles()}
                placeholder="Nome descritivo da natureza"
              />
            </div>
          </div>

              {/* Lista de Naturezas Criadas */}
              <div style={{ 
                ...sectionTitleStyles, 
                marginTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>📋 Naturezas Criadas ({naturezas.length})</span>
                <button
                  onClick={handleGeracaoAutomatica}
                  style={{
                    padding: '6px 16px',
                    fontSize: getRelativeFontSize(12),
                    fontWeight: '600',
                    border: `1px solid ${theme.primary}`,
                    borderRadius: '4px',
                    backgroundColor: theme.surface,
                    color: theme.primary,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.primary
                    e.currentTarget.style.color = 'white'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.surface
                    e.currentTarget.style.color = theme.primary
                  }}
                >
                  🤖 Geração Automática
                </button>
              </div>
              
              {naturezas.length === 0 && (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  fontSize: getRelativeFontSize(13),
                  color: theme.textSecondary,
                  backgroundColor: theme.background,
                  borderRadius: '4px',
                  border: `1px dashed ${theme.border}`,
                  marginTop: '8px'
                }}>
                  Nenhuma natureza cadastrada ainda. Clique em "Novo" e preencha os dados.
                </div>
              )}
              
              {naturezas.length > 0 && (
                <div style={{
                  marginTop: '8px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '4px',
                  maxHeight: '250px',
                  overflowY: 'auto',
                  backgroundColor: theme.background
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: theme.surface, borderBottom: `2px solid ${theme.border}`, position: 'sticky', top: 0 }}>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: getRelativeFontSize(11), color: theme.text }}>Código</th>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: getRelativeFontSize(11), color: theme.text }}>Nome</th>
                        <th style={{ padding: '8px', textAlign: 'center', fontSize: getRelativeFontSize(11), color: theme.text }}>Status</th>
                        <th style={{ padding: '8px', textAlign: 'center', fontSize: getRelativeFontSize(11), color: theme.text }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {naturezas.map((nat) => (
                        <tr
                          key={nat.id}
                          onClick={() => handleSelecionarNatureza(nat)}
                          style={{
                            cursor: 'pointer',
                            borderBottom: `1px solid ${theme.border}`,
                            backgroundColor: naturezaSelecionada?.id === nat.id ? theme.primary + '20' : 'transparent'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primary + '10'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = naturezaSelecionada?.id === nat.id ? theme.primary + '20' : 'transparent'}
                        >
                          <td style={{ padding: '8px', fontSize: getRelativeFontSize(12), color: theme.text }}>{nat.codigo}</td>
                          <td style={{ padding: '8px', fontSize: getRelativeFontSize(12), color: theme.text }}>{nat.descricao}</td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontSize: getRelativeFontSize(11),
                              backgroundColor: nat.ativo ? '#10b981' : '#ef4444',
                              color: 'white',
                              fontWeight: '600',
                              display: 'inline-block',
                              minWidth: '70px',
                              textAlign: 'center'
                            }}>
                              {nat.ativo ? '✓ Ativo' : '✗ Inativo'}
                            </span>
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            <span 
                              onClick={async (e) => {
                                e.stopPropagation()
                                const confirmadoExclusao = await modal.confirm(`Tem certeza que deseja excluir a natureza "${nat.descricao}"?`, 'Confirmar Exclusão', '⚠️')
                                if (confirmadoExclusao) {
                                  naturezaService.remover(nat.id!)
                                  setForceUpdate(prev => prev + 1)
                                  await modal.alert('Natureza excluída!', 'Sucesso', '✅')
                                }
                              }}
                              style={{
                                padding: '4px 10px',
                                fontSize: getRelativeFontSize(11),
                                fontWeight: '600',
                                border: 'none',
                                borderRadius: '4px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                cursor: 'pointer',
                                minWidth: '70px',
                                display: 'inline-block',
                                textAlign: 'center'
                              }}
                              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.opacity = '0.8'}
                              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.opacity = '1'}
                            >
                              🗑️ Excluir
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Botões de ação - Aba 1 */}
          <div style={buttonContainerStyles}>
            <button onClick={handleNovoNatureza} style={buttonStyles()}>
              📄 Novo
            </button>
            <button 
              onClick={() => {
                console.log('🖱️ BOTÃO GRAVAR CLICADO!')
                handleGravarNatureza()
              }} 
              style={buttonStyles(true)}
            >
              💾 Gravar
            </button>
            <button onClick={handleNovoNatureza} style={buttonStyles()}>
              🧹 Limpar
            </button>
            <button onClick={onClose} style={buttonStyles()}>
              🚪 Sair
            </button>
          </div>
        </>
      )}

      {/* ABA 2: Cadastrar Valores */}
      {activeTab === 'valores' && (
        <>
          <div style={formContainerStyles}>
            <div style={formStyles}>
              <div style={sectionTitleStyles}>2️⃣ Cadastrar Valores de Custas</div>
              
              {/* Lista de Naturezas Cadastradas */}
              <div style={{ 
                ...sectionTitleStyles, 
                marginTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>📋 Naturezas Cadastradas ({naturezas.length})</span>
              </div>
              
              {naturezas.length === 0 && (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  fontSize: getRelativeFontSize(13),
                  color: theme.textSecondary,
                  backgroundColor: theme.background,
                  borderRadius: '4px',
                  border: `1px dashed ${theme.border}`,
                  marginTop: '8px'
                }}>
                  Nenhuma natureza cadastrada. Vá para aba "Criar Natureza" para cadastrar.
                </div>
              )}
              
              {naturezas.length > 0 && (
                <div style={{
                  marginTop: '8px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  backgroundColor: theme.background
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: theme.surface, borderBottom: `2px solid ${theme.border}`, position: 'sticky', top: 0 }}>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: getRelativeFontSize(11), color: theme.text }}>Código</th>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: getRelativeFontSize(11), color: theme.text }}>Nome</th>
                        <th style={{ padding: '8px', textAlign: 'center', fontSize: getRelativeFontSize(11), color: theme.text }}>Status</th>
                        <th style={{ padding: '8px', textAlign: 'center', fontSize: getRelativeFontSize(11), color: theme.text }}>Valores</th>
                      </tr>
                    </thead>
                    <tbody>
                      {naturezas.map((nat) => {
                      const valoresKey = `cartorio_valores_${nat.codigo}`
                        const valoresSalvos = localStorage.getItem(valoresKey)
                        
                        // Verificar se tem valores E se não são todos zero
                        let temValores = false
                        if (valoresSalvos) {
                          try {
                            const valores = JSON.parse(valoresSalvos)
                            const valorTotal = (valores.valorOficial || 0) + (valores.valorIss || 0) + (valores.valorSecFaz || 0)
                            temValores = valorTotal > 0
                          } catch (e) {
                            temValores = false
                          }
                        }
                        
                        const isSelected = valoresForm.naturezaId === nat.id
                        
                        return (
                          <tr
                            key={nat.id}
                            onClick={() => {
                              handleValoresInputChange('naturezaId', nat.id!)
                              carregarValoresNatureza(nat.id!)
                            }}
                            style={{
                              cursor: 'pointer',
                              borderBottom: `1px solid ${theme.border}`,
                              backgroundColor: isSelected ? theme.primary + '20' : 'transparent'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primary + '10'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isSelected ? theme.primary + '20' : 'transparent'}
                          >
                            <td style={{ padding: '8px', fontSize: getRelativeFontSize(12), color: theme.text }}>{nat.codigo}</td>
                            <td style={{ padding: '8px', fontSize: getRelativeFontSize(12), color: theme.text }}>{nat.descricao}</td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: getRelativeFontSize(11),
                                backgroundColor: nat.ativo ? '#10b981' : '#ef4444',
                                color: 'white',
                                fontWeight: '600',
                                display: 'inline-block',
                                minWidth: '70px',
                                textAlign: 'center'
                              }}>
                                {nat.ativo ? '✓ Ativo' : '✗ Inativo'}
                              </span>
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: getRelativeFontSize(11),
                                backgroundColor: temValores ? '#3b82f6' : '#6b7280',
                                color: 'white',
                                fontWeight: '600',
                                display: 'inline-block',
                                minWidth: '70px',
                                textAlign: 'center'
                              }}>
                                {temValores ? '✓ Cadastrado' : '⚠️ Pendente'}
                              </span>
                            </td>
                          </tr>
                      )
                    })}
                    </tbody>
                  </table>
                </div>
              )}

              {valoresForm.naturezaId && (
                <>
                  <div style={{ ...sectionTitleStyles, marginTop: '16px' }}>💰 Valores da Tabela de Custas</div>
                  
                  {/* Valores */}
                  <div style={rowStyles}>
                    <div style={fieldStyles('1')}>
                      <label style={labelStyles}>
                        <strong>OFICIAL</strong> (R$):
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={valoresForm.valorOficial}
                        onChange={(e) => handleValoresInputChange('valorOficial', parseFloat(e.target.value) || 0)}
                        style={{
                          ...inputStyles(),
                          fontWeight: '600',
                          fontSize: getRelativeFontSize(14)
                        }}
                      />
                    </div>
                    <div style={fieldStyles('1')}>
                      <label style={labelStyles}>
                        <strong>ISS</strong> (R$):
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={valoresForm.valorIss}
                        onChange={(e) => handleValoresInputChange('valorIss', parseFloat(e.target.value) || 0)}
                        style={{
                          ...inputStyles(),
                          fontWeight: '600',
                          fontSize: getRelativeFontSize(14)
                        }}
                      />
                    </div>
                    <div style={fieldStyles('1')}>
                      <label style={labelStyles}>
                        <strong>SEC. FAZ.</strong> (R$):
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={valoresForm.valorSecFaz}
                        onChange={(e) => handleValoresInputChange('valorSecFaz', parseFloat(e.target.value) || 0)}
                        style={{
                          ...inputStyles(),
                          fontWeight: '600',
                          fontSize: getRelativeFontSize(14)
                        }}
                      />
                    </div>
                    <div style={fieldStyles('1')}>
                      <label style={labelStyles}>
                        <strong>TOTAL</strong> (R$):
                      </label>
                      <input
                        type="text"
                        value={formatCurrency(valoresForm.valorTotal)}
                        style={{
                          ...inputStyles(true),
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          fontWeight: '700',
                          fontSize: getRelativeFontSize(15)
                        }}
                        disabled
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Botões de ação - Aba 2 */}
          <div style={buttonContainerStyles}>
            <button onClick={handleNovoValores} style={buttonStyles()}>
              📄 Limpar
            </button>
            <button 
              onClick={handleGravarValores}
              style={buttonStyles(true)}
              disabled={!valoresForm.naturezaId}
            >
              💾 Gravar Valores
            </button>
            <button onClick={onClose} style={buttonStyles()}>
              🚪 Sair
            </button>
          </div>
        </>
      )}

      {/* ABA 3: Visualizar/Gerenciar Naturezas */}
      {activeTab === 'visualizar' && (
        <>
          <div style={formContainerStyles}>
            <div style={formStyles}>
              <div style={sectionTitleStyles}>3️⃣ Gerenciar Naturezas</div>
              
              {/* Lista de Naturezas */}
          <div style={{ ...sectionTitleStyles, marginTop: '16px' }}>
            📋 Naturezas Cadastradas ({naturezas.length})
          </div>
          
          {naturezas.length === 0 && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              fontSize: getRelativeFontSize(13),
              color: theme.textSecondary,
              backgroundColor: theme.background,
              borderRadius: '4px',
              border: `1px dashed ${theme.border}`
            }}>
              Nenhuma natureza cadastrada ainda. Clique em "Novo" e preencha os dados.
            </div>
          )}
          
          {naturezas.length > 0 && (
            <div style={{
              marginTop: '8px',
              border: `1px solid ${theme.border}`,
              borderRadius: '4px',
              maxHeight: '250px',
              overflowY: 'auto',
              backgroundColor: theme.background
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: theme.surface, borderBottom: `2px solid ${theme.border}`, position: 'sticky', top: 0 }}>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: getRelativeFontSize(11) }}>Código</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: getRelativeFontSize(11) }}>Nome</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontSize: getRelativeFontSize(11) }}>Status</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontSize: getRelativeFontSize(11) }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {naturezas.map((nat) => {
                    console.log('🔷 Renderizando natureza:', nat)
                    return (
                  <tr
                    key={nat.id}
                    onClick={() => handleSelecionarNatureza(nat)}
                    style={{
                      cursor: 'pointer',
                      borderBottom: `1px solid ${theme.border}`,
                      backgroundColor: naturezaSelecionada?.id === nat.id ? theme.primary + '20' : 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primary + '10'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = naturezaSelecionada?.id === nat.id ? theme.primary + '20' : 'transparent'}
                  >
                    <td style={{ padding: '8px', fontSize: getRelativeFontSize(11) }}>{nat.codigo}</td>
                    <td style={{ padding: '8px', fontSize: getRelativeFontSize(11) }}>{nat.descricao}</td>
                    <td style={{ padding: '8px', textAlign: 'center', fontSize: getRelativeFontSize(11) }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: getRelativeFontSize(11),
                        backgroundColor: nat.ativo ? '#10b981' : '#ef4444',
                        color: 'white',
                        fontWeight: '600',
                        display: 'inline-block',
                        minWidth: '70px',
                        textAlign: 'center'
                      }}>
                        {nat.ativo ? '✓ Ativo' : '✗ Inativo'}
                      </span>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleAtivo(nat)
                        }}
                        style={{
                          padding: '4px 10px',
                          fontSize: getRelativeFontSize(11),
                          fontWeight: '600',
                          border: 'none',
                          borderRadius: '4px',
                          backgroundColor: nat.ativo ? '#ef4444' : '#10b981',
                          color: 'white',
                          cursor: 'pointer',
                          minWidth: '85px',
                          display: 'inline-block',
                          textAlign: 'center'
                        }}
                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.opacity = '0.8'}
                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.opacity = '1'}
                      >
                        {nat.ativo ? 'Desativar' : 'Ativar'}
                      </span>
                    </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}
            </div>
          </div>

          {/* Botões de ação - Aba 3 */}
          <div style={buttonContainerStyles}>
            <button onClick={handleExcluirNatureza} style={buttonStyles()}>
              🗑️ Excluir Selecionada
            </button>
            <button onClick={onClose} style={buttonStyles()}>
              🚪 Sair
            </button>
          </div>
        </>
      )}
      
      {/* Modal Component - DENTRO da janela */}
      <modal.ModalComponent />
    </BasePage>
    </>
  )
}

