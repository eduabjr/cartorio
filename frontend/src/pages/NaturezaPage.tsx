// ⚠️⚠️⚠️ ATENÇÃO: LAYOUT CONFIGURÁVEL - VERSÃO 2.0 ⚠️⚠️⚠️
// 
// NaturezaPage.tsx
// Tela de Cadastro/Manutenção de Serviços de Cartório
// Permite configurar manualmente cada item da tabela de custas
//
// 📅 Data: 30/10/2025
//
// ⛔ BLOQUEIOS ATIVOS - NÃO MODIFIQUE:
// 
// 📏 DIMENSÕES DA JANELA (BLOQUEADAS):
// - width: "900px" - minWidth: "900px" (FIXO)
// - height: "500px" - minHeight: "500px" (FIXO)
//
// 🎨 ESTILOS BLOQUEADOS:
// - formStyles: gap: '6px', minWidth: 0, flexShrink: 1
// - rowStyles: gap: '8px', flexWrap: 'nowrap', justifyContent: 'space-between', flexShrink: 1
// - fieldStyles: flex: '1', flexShrink: 1
// - getInputStyles: minWidth: '0', flexShrink: 1
// - selectStyles: minWidth: '0', flexShrink: 1
//
// 📐 PROPRIEDADES CRÍTICAS (NÃO ALTERAR):
// - Propriedades flexShrink (TODAS devem ser 1)
// - Propriedades minWidth (inputs: 0, rowFields: 0)
// - Propriedades flexWrap (TODAS devem ser nowrap)
// - Espaçamentos (gaps, margins, paddings)
// - Distribuição uniforme dos campos (justifyContent: 'space-between')
//
// ✅ COMPORTAMENTO GARANTIDO:
// - Janela tamanho normal (900x500): SEM scroll, todos campos visíveis
// - Janela reduzida: COM scroll, campos encolhem proporcionalmente
// - Nenhum campo ultrapassa a margem
// - Linhas NUNCA quebram
// - Layout NUNCA quebra
//
// ⚠️⚠️⚠️ QUALQUER MODIFICAÇÃO QUEBRARÁ O LAYOUT APROVADO ⚠️⚠️⚠️

import React, { useState, useEffect } from 'react'
import { BasePage } from '../components/BasePage'
import { naturezaService, Natureza } from '../services/NaturezaService'
import { useAccessibility } from '../hooks/useAccessibility'
import { getRelativeFontSize } from '../utils/fontUtils'

interface NaturezaPageProps {
  onClose: () => void
}

export function NaturezaPage({ onClose }: NaturezaPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  
  // Cor do header: azul royal no light, roxo no dark
  const headerColor = currentTheme === 'dark' ? '#9370DB' : '#4169E1'

  // Estados para os dados da natureza
  const [formData, setFormData] = useState<Natureza>({
    codigo: '',
    descricao: '',
    percentualIss: 0,
    ativo: true,
    observacoes: '',
    tabelaUrl: ''
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [naturezas, setNaturezas] = useState<Natureza[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [showLookup, setShowLookup] = useState(false)

  // Carregar lista de naturezas
  useEffect(() => {
    carregarNaturezas()
  }, [])

  const carregarNaturezas = async () => {
    try {
      const lista = await naturezaService.listar()
      setNaturezas(lista)
    } catch (error) {
      console.error('❌ Erro ao carregar naturezas:', error)
    }
  }

  const handleInputChange = (field: keyof Natureza, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Função para iniciar um novo cadastro
  const handleNovo = () => {
    setFormData({
      codigo: '',
      descricao: '',
      percentualIss: 0,
      ativo: true,
      observacoes: '',
      tabelaUrl: ''
    })
    setIsEditing(false)
    console.log('📄 Novo cadastro de natureza iniciado! Formulário limpo.')
  }

  // Função para gravar os dados
  const handleGravar = async () => {
    try {
      // Validação básica
      if (!formData.codigo || !formData.descricao) {
        alert('⚠️ Código e Descrição são obrigatórios!')
        return
      }

      if (formData.percentualIss < 0 || formData.percentualIss > 100) {
        alert('⚠️ O percentual de ISS deve estar entre 0 e 100!')
        return
      }

      if (isEditing && formData.id) {
        // Atualizar natureza existente
        await naturezaService.atualizar(formData.id, formData)
        console.log('✅ Natureza atualizada com sucesso!')
        alert('✅ Natureza atualizada com sucesso!')
      } else {
        // Criar nova natureza
        await naturezaService.criar(formData)
        console.log('✅ Natureza cadastrada com sucesso!')
        alert('✅ Natureza cadastrada com sucesso!')
      }

      // Recarregar lista
      await carregarNaturezas()
      handleNovo()
    } catch (error) {
      console.error('❌ Erro ao gravar natureza:', error)
      alert('❌ Erro ao gravar natureza. Verifique os dados e tente novamente.')
    }
  }

  // Função para excluir
  const handleExcluir = async () => {
    if (!formData.id) {
      alert('⚠️ Selecione uma natureza para excluir!')
      return
    }

    if (confirm('⚠️ Tem certeza que deseja excluir esta natureza?')) {
      try {
        await naturezaService.remover(formData.id)
        console.log('✅ Natureza excluída com sucesso!')
        alert('✅ Natureza excluída com sucesso!')
        await carregarNaturezas()
        handleNovo()
      } catch (error) {
        console.error('❌ Erro ao excluir natureza:', error)
        alert('❌ Erro ao excluir natureza.')
      }
    }
  }

  // Função para buscar natureza por código
  const handleBuscar = async () => {
    if (!searchTerm) {
      alert('⚠️ Digite um código para buscar!')
      return
    }

    try {
      const natureza = await naturezaService.buscarPorCodigo(searchTerm)
      setFormData(natureza)
      setIsEditing(true)
      console.log('✅ Natureza encontrada:', natureza)
    } catch (error) {
      console.error('❌ Erro ao buscar natureza:', error)
      alert('❌ Natureza não encontrada!')
    }
  }

  // Função para selecionar da lista
  const handleSelecionarNatureza = (natureza: Natureza) => {
    setFormData(natureza)
    setIsEditing(true)
    setShowLookup(false)
    console.log('✅ Natureza selecionada:', natureza)
  }

  // 🔒 BLOQUEIO: Estilos da janela principal - NÃO MODIFICAR
  const windowStyles = {
    width: '900px',
    minWidth: '900px', // 🔒 BLOQUEIO
    height: '500px',
    minHeight: '500px', // 🔒 BLOQUEIO
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    flexShrink: 1 // 🔒 BLOQUEIO
  }

  // 🔒 BLOQUEIO: Estilos do header - NÃO MODIFICAR
  const headerStyles = {
    backgroundColor: headerColor,
    color: 'white',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0
  }

  // 🔒 BLOQUEIO: Estilos do container do formulário - NÃO MODIFICAR
  const formContainerStyles = {
    flex: 1,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    padding: '8px',
    flexShrink: 1 // 🔒 BLOQUEIO
  }

  // 🔒 BLOQUEIO: Estilos do formulário - NÃO MODIFICAR
  const formStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px', // 🔒 BLOQUEIO
    minWidth: 0, // 🔒 BLOQUEIO
    flexShrink: 1 // 🔒 BLOQUEIO
  }

  // 🔒 BLOQUEIO: Estilos das linhas - NÃO MODIFICAR
  const rowStyles = {
    display: 'flex',
    gap: '8px', // 🔒 BLOQUEIO
    alignItems: 'flex-end',
    flexWrap: 'nowrap' as const, // 🔒 BLOQUEIO
    justifyContent: 'space-between', // 🔒 BLOQUEIO
    flexShrink: 1 // 🔒 BLOQUEIO
  }

  // 🔒 BLOQUEIO: Estilos dos campos - NÃO MODIFICAR
  const fieldStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: '1',
    minWidth: 0, // 🔒 BLOQUEIO
    flexShrink: 1 // 🔒 BLOQUEIO
  }

  const labelStyles = {
    fontSize: getRelativeFontSize(12),
    fontWeight: '500',
    marginBottom: '2px',
    color: theme.text,
    whiteSpace: 'nowrap' as const
  }

  // 🔒 BLOQUEIO: Estilos dos inputs - NÃO MODIFICAR
  const getInputStyles = (disabled = false) => ({
    width: '100%',
    minWidth: '0', // 🔒 BLOQUEIO
    padding: '6px 8px',
    fontSize: getRelativeFontSize(13),
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    backgroundColor: disabled ? theme.background : theme.surface,
    color: theme.text,
    outline: 'none',
    transition: 'border-color 0.2s',
    flexShrink: 1 // 🔒 BLOQUEIO
  })

  // 🔒 BLOQUEIO: Estilos dos selects - NÃO MODIFICAR
  const arrowColor = currentTheme === 'dark' ? '%23FFFFFF' : '%23333333'
  const selectStyles = {
    width: '100%',
    minWidth: '0', // 🔒 BLOQUEIO
    padding: '6px 8px',
    fontSize: getRelativeFontSize(13),
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    backgroundColor: theme.surface,
    color: theme.text,
    outline: 'none',
    cursor: 'pointer',
    flexShrink: 1, // 🔒 BLOQUEIO
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    MozAppearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${arrowColor}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 6px center',
    backgroundSize: '14px',
    paddingRight: '26px'
  }

  // 🔒 BLOQUEIO: Estilos dos botões - NÃO MODIFICAR
  const buttonContainerStyles = {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    borderTop: `1px solid ${theme.border}`,
    backgroundColor: theme.background,
    flexWrap: 'nowrap' as const, // 🔒 BLOQUEIO
    flexShrink: 0
  }

  const buttonStyles = (isPrimary = false) => ({
    padding: '8px 16px',
    fontSize: getRelativeFontSize(13),
    fontWeight: '500',
    border: isPrimary ? 'none' : `1px solid ${theme.border}`,
    borderRadius: '4px',
    backgroundColor: isPrimary ? theme.primary : theme.surface,
    color: isPrimary ? 'white' : theme.text,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap' as const
  })

  // Renderização
  return (
    <div style={windowStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h2 style={{ margin: 0, fontSize: getRelativeFontSize(16), fontWeight: '600' }}>
          Cadastro de Natureza de Serviços
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            width: '28px',
            height: '28px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: getRelativeFontSize(18),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      {/* Formulário */}
      <div style={formContainerStyles}>
        <div style={formStyles}>
          {/* Linha 1: Código e Descrição */}
          <div style={rowStyles}>
            <div style={{ ...fieldStyles, flex: '0 0 150px' }}>
              <label style={labelStyles}>Código:</label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => handleInputChange('codigo', e.target.value)}
                style={getInputStyles()}
                placeholder="Ex: ISS-1.0"
              />
            </div>
            <div style={{ ...fieldStyles, flex: '1' }}>
              <label style={labelStyles}>Descrição:</label>
              <input
                type="text"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                style={getInputStyles()}
                placeholder="Nome da natureza do serviço"
              />
            </div>
          </div>

          {/* Linha 2: Percentual ISS e Ativo */}
          <div style={rowStyles}>
            <div style={{ ...fieldStyles, flex: '0 0 180px' }}>
              <label style={labelStyles}>Percentual ISS (%):</label>
              <select
                value={formData.percentualIss}
                onChange={(e) => handleInputChange('percentualIss', parseFloat(e.target.value))}
                style={selectStyles}
              >
                <option value="0">Sem ISS (0%)</option>
                <option value="1.00">1,0%</option>
                <option value="1.50">1,5%</option>
                <option value="2.00">2,0%</option>
                <option value="2.50">2,5%</option>
                <option value="3.00">3,0%</option>
                <option value="3.50">3,5%</option>
                <option value="4.00">4,0%</option>
                <option value="4.50">4,5%</option>
                <option value="5.00">5,0%</option>
              </select>
            </div>
            <div style={{ ...fieldStyles, flex: '0 0 120px' }}>
              <label style={labelStyles}>Status:</label>
              <select
                value={formData.ativo ? 'true' : 'false'}
                onChange={(e) => handleInputChange('ativo', e.target.value === 'true')}
                style={selectStyles}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
            <div style={{ ...fieldStyles, flex: '1' }}>
              <label style={labelStyles}>Link da Tabela (URL):</label>
              <input
                type="text"
                value={formData.tabelaUrl || ''}
                onChange={(e) => handleInputChange('tabelaUrl', e.target.value)}
                style={getInputStyles()}
                placeholder="https://arpensp.org.br/..."
              />
            </div>
          </div>

          {/* Linha 3: Observações */}
          <div style={rowStyles}>
            <div style={{ ...fieldStyles, flex: '1' }}>
              <label style={labelStyles}>Observações:</label>
              <textarea
                value={formData.observacoes || ''}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                style={{
                  ...getInputStyles(),
                  minHeight: '80px',
                  resize: 'vertical' as const,
                  fontFamily: 'inherit'
                }}
                placeholder="Observações adicionais sobre esta natureza..."
              />
            </div>
          </div>

          {/* Linha 4: Busca */}
          <div style={{ ...rowStyles, marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${theme.border}` }}>
            <div style={{ ...fieldStyles, flex: '0 0 250px' }}>
              <label style={labelStyles}>Buscar por Código:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={getInputStyles()}
                placeholder="Digite o código"
                onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
              />
            </div>
            <button
              onClick={handleBuscar}
              style={{
                ...buttonStyles(),
                alignSelf: 'flex-end',
                flex: '0 0 auto'
              }}
            >
              🔍 Buscar
            </button>
            <button
              onClick={() => setShowLookup(!showLookup)}
              style={{
                ...buttonStyles(),
                alignSelf: 'flex-end',
                flex: '0 0 auto'
              }}
            >
              📋 {showLookup ? 'Fechar Lista' : 'Ver Lista'}
            </button>
          </div>

          {/* Lista de Naturezas */}
          {showLookup && (
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
                  <tr style={{ backgroundColor: theme.surface, borderBottom: `2px solid ${theme.border}` }}>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: getRelativeFontSize(12), color: theme.text }}>Código</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: getRelativeFontSize(12), color: theme.text }}>Descrição</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontSize: getRelativeFontSize(12), color: theme.text }}>ISS %</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontSize: getRelativeFontSize(12), color: theme.text }}>Status</th>
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
                        backgroundColor: formData.id === nat.id ? theme.primary + '20' : 'transparent'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primary + '10'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = formData.id === nat.id ? theme.primary + '20' : 'transparent'}
                    >
                      <td style={{ padding: '8px', fontSize: getRelativeFontSize(12), color: theme.text }}>{nat.codigo}</td>
                      <td style={{ padding: '8px', fontSize: getRelativeFontSize(12), color: theme.text }}>{nat.descricao}</td>
                      <td style={{ padding: '8px', textAlign: 'center', fontSize: getRelativeFontSize(12), color: theme.text }}>{nat.percentualIss.toFixed(2)}%</td>
                      <td style={{ padding: '8px', textAlign: 'center', fontSize: getRelativeFontSize(12), color: theme.text }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: getRelativeFontSize(11),
                          backgroundColor: nat.ativo ? '#10b981' : '#ef4444',
                          color: 'white'
                        }}>
                          {nat.ativo ? 'Ativo' : 'Inativo'}
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

      {/* Botões de ação */}
      <div style={buttonContainerStyles}>
        <button onClick={handleNovo} style={buttonStyles()}>
          📄 Novo
        </button>
        <button onClick={handleGravar} style={buttonStyles(true)}>
          💾 Gravar
        </button>
        <button onClick={handleExcluir} style={buttonStyles()}>
          🗑️ Excluir
        </button>
        <button onClick={onClose} style={buttonStyles()}>
          🚪 Sair
        </button>
      </div>
    </div>
  )
}

