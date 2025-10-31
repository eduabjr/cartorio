// ProtocoloCancelamentoPage.tsx
// Tela de Cancelamento de Protocolos

import React, { useState } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { getRelativeFontSize } from '../utils/fontUtils'

interface ProtocoloCancelamentoPageProps {
  onClose: () => void
  resetToOriginalPosition?: boolean
}

interface ProtocoloCancelamento {
  id: string
  protocolo: string
  dataEntrada: string
  tipo: string
  outorgante: string
  outorgado: string
  descricao: string
  dataEntrega: string
  horaEntrega: string
  ordemSinalPublico: string
  responsavel: string
  valorTotal: string
  dataCancelamento: string
  motivoCancelamento: string
}

export function ProtocoloCancelamentoPage({ onClose, resetToOriginalPosition }: ProtocoloCancelamentoPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
  
  
  const [formData, setFormData] = useState({
    protocolo: '',
    dataEntrada: '',
    tipo: '',
    outorgante: '',
    outorgado: '',
    descricao: '',
    dataEntrega: '',
    horaEntrega: '',
    ordemSinalPublico: '',
    responsavel: '',
    valorTotal: '',
    dataCancelamento: '',
    motivoCancelamento: ''
  })

  const [protocolos, setProtocolos] = useState<ProtocoloCancelamento[]>(() => {
    const saved = localStorage.getItem('protocolos-cancelamento')
    return saved ? JSON.parse(saved) : []
  })
  
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNovo = () => {
    setFormData({
      protocolo: '',
      dataEntrada: '',
      tipo: '',
      outorgante: '',
      outorgado: '',
      descricao: '',
      dataEntrega: '',
      horaEntrega: '',
      ordemSinalPublico: '',
      responsavel: '',
      valorTotal: '',
      dataCancelamento: '',
      motivoCancelamento: ''
    })
    setSelectedId(null)
  }

  const handleGravar = () => {
    if (!formData.protocolo || !formData.tipo || !formData.dataCancelamento || !formData.motivoCancelamento) {
      alert('⚠️ Por favor, preencha os campos obrigatórios: Protocolo, Tipo, Data Cancelamento e Motivo Cancelamento')
      return
    }

    if (selectedId) {
      // Atualizar existente
      const novosProtocolos = protocolos.map(p => 
        p.id === selectedId 
          ? { ...p, ...formData }
          : p
      )
      setProtocolos(novosProtocolos)
      localStorage.setItem('protocolos-cancelamento', JSON.stringify(novosProtocolos))
      alert('✅ Protocolo atualizado com sucesso!')
    } else {
      // Criar novo
      const novoProtocolo: ProtocoloCancelamento = {
        id: Date.now().toString(),
        ...formData
      }
      const novosProtocolos = [...protocolos, novoProtocolo]
      setProtocolos(novosProtocolos)
      localStorage.setItem('protocolos-cancelamento', JSON.stringify(novosProtocolos))
      alert('✅ Protocolo cancelado e gravado com sucesso!')
    }
    
    handleNovo()
  }

  const handlePesquisar = () => {
    const protocolo = prompt('Digite o número do protocolo:')
    if (!protocolo) return
    
    const encontrado = protocolos.find(p => p.protocolo === protocolo.trim())
    if (encontrado) {
      setFormData(encontrado)
      setSelectedId(encontrado.id)
      console.log('✅ Protocolo encontrado:', encontrado)
    } else {
      alert('❌ Protocolo não encontrado!')
    }
  }

  const handleExcluir = () => {
    if (selectedId) {
      if (confirm('⚠️ Tem certeza que deseja excluir este protocolo?')) {
        const novosProtocolos = protocolos.filter(p => p.id !== selectedId)
        setProtocolos(novosProtocolos)
        localStorage.setItem('protocolos-cancelamento', JSON.stringify(novosProtocolos))
        handleNovo()
        alert('✅ Protocolo excluído!')
      }
    }
  }

  // Carregar tipos de protocolo do JSON
  const [tiposProtocolo, setTiposProtocolo] = useState<Array<{codigo: string, nome: string}>>([])
  
  React.useEffect(() => {
    const carregarTiposProtocolo = async () => {
      try {
        const response = await fetch('/extra/tipoProtocolo.json')
        if (response.ok) {
          const data = await response.json()
          setTiposProtocolo(data)
        }
      } catch (error) {
        console.error('Erro ao carregar tipos de protocolo:', error)
      }
    }
    carregarTiposProtocolo()
  }, [])

  // Estilos
  const formStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    padding: '12px 12px 8px 12px'
  }

  const rowStyles = {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end'
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

  const inputStyles = {
    width: '100%',
    padding: '7px 10px',
    fontSize: getRelativeFontSize(13),
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    backgroundColor: theme.surface,
    color: theme.text,
    outline: 'none',
    boxSizing: 'border-box' as const
  }

  const selectStyles = {
    ...inputStyles,
    cursor: 'pointer'
  }

  const buttonContainerStyles = {
    display: 'flex',
    gap: '8px',
    padding: '8px 16px',
    borderTop: `1px solid ${theme.border}`,
    backgroundColor: theme.background,
    justifyContent: 'center' as const
  }

  const buttonStyles = (variant: 'primary' | 'secondary' | 'danger' | 'default' = 'default') => {
    const colors = {
      primary: { bg: '#10b981', hover: '#059669', text: 'white' },
      secondary: { bg: theme.surface, hover: theme.border, text: theme.text },
      danger: { bg: '#ef4444', hover: '#dc2626', text: 'white' },
      default: { bg: '#6c757d', hover: '#495057', text: 'white' }
    }
    
    const color = colors[variant]
    
    return {
      padding: '8px 16px',
      fontSize: getRelativeFontSize(13),
      fontWeight: '500' as const,
      border: variant === 'secondary' ? `1px solid ${theme.border}` : 'none',
      borderRadius: '4px',
      backgroundColor: color.bg,
      color: color.text,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }

  const arrowColor = currentTheme === 'dark' ? '%23FFFFFF' : '%23333333'
  const selectStylesWithArrow = {
    ...selectStyles,
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${arrowColor}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    backgroundSize: '14px',
    paddingRight: '30px',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    MozAppearance: 'none' as const
  }

  return (
    <BasePage
      title="Cancelamento de Protocolos"
      onClose={onClose}
      width="900px"
      height="640px"
      minWidth="900px"
      minHeight="640px"
      headerColor={headerColor}
      resetToOriginalPosition={resetToOriginalPosition}
      draggable={true}
      resizable={false}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        {/* Conteúdo */}
        <>
            <div style={{
              flex: 1,
              overflowY: 'auto' as const,
              overflowX: 'hidden' as const
            }}>
              <form style={formStyles}>
                {/* Linha 1: Protocolo, Data Entrada e Valor Total */}
                <div style={rowStyles}>
                  <div style={fieldStyles('0 0 250px')}>
                    <label style={labelStyles}>Protocolo *</label>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'stretch' }}>
                      <input
                        type="text"
                        value={formData.protocolo}
                        onChange={(e) => handleInputChange('protocolo', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handlePesquisar()
                          }
                        }}
                        style={{...inputStyles, height: '32px'}}
                        placeholder="Número do protocolo"
                      />
                      <button
                        type="button"
                        onClick={handlePesquisar}
                        style={{
                          padding: '0',
                          border: `1px solid ${theme.border}`,
                          backgroundColor: theme.surface,
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          minWidth: '32px',
                          flexShrink: 0,
                          borderRadius: '4px',
                          transition: 'all 0.2s ease',
                          boxSizing: 'border-box' as const
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme.border
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = theme.surface
                        }}
                        title="Pesquisar protocolo"
                      >
                        🔍
                      </button>
                    </div>
                  </div>
                  <div style={{...fieldStyles('0 0 165px'), marginLeft: 'auto'}}>
                    <label style={labelStyles}>Data Entrada</label>
                    <input
                      type="date"
                      value={formData.dataEntrada}
                      onChange={(e) => handleInputChange('dataEntrada', e.target.value)}
                      style={inputStyles}
                    />
                  </div>
                  <div style={fieldStyles('0 0 140px')}>
                    <label style={labelStyles}>Valor Total</label>
                    <input
                      type="text"
                      value={formData.valorTotal}
                      onChange={(e) => handleInputChange('valorTotal', e.target.value)}
                      style={inputStyles}
                      placeholder="R$ 0,00"
                    />
                  </div>
                </div>

                {/* Linha 2: Tipo, Data p/ Entrega e Hora p/ Entrega */}
                <div style={rowStyles}>
                  <div style={fieldStyles('0 0 250px')}>
                    <label style={labelStyles}>Tipo *</label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => handleInputChange('tipo', e.target.value)}
                      style={selectStylesWithArrow}
                    >
                      <option value="">Selecione...</option>
                      {tiposProtocolo.map(tipo => (
                        <option key={tipo.codigo} value={tipo.nome}>
                          {tipo.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{...fieldStyles('0 0 165px'), marginLeft: 'auto'}}>
                    <label style={labelStyles}>Data p/ Entrega</label>
                    <input
                      type="date"
                      value={formData.dataEntrega}
                      onChange={(e) => handleInputChange('dataEntrega', e.target.value)}
                      style={inputStyles}
                    />
                  </div>
                  <div style={fieldStyles('0 0 140px')}>
                    <label style={labelStyles}>Hora p/ Entrega</label>
                    <input
                      type="time"
                      value={formData.horaEntrega}
                      onChange={(e) => handleInputChange('horaEntrega', e.target.value)}
                      style={inputStyles}
                    />
                  </div>
                </div>

                {/* Linha 3: Outorgante parte (a) e Outorgado parte (b) */}
                <div style={rowStyles}>
                  <div style={fieldStyles('1')}>
                    <label style={labelStyles}>Outorgante parte (a)</label>
                    <input
                      type="text"
                      value={formData.outorgante}
                      onChange={(e) => handleInputChange('outorgante', e.target.value)}
                      style={inputStyles}
                      placeholder="Nome do outorgante"
                    />
                  </div>
                  <div style={fieldStyles('1')}>
                    <label style={labelStyles}>Outorgado parte (b)</label>
                    <input
                      type="text"
                      value={formData.outorgado}
                      onChange={(e) => handleInputChange('outorgado', e.target.value)}
                      style={inputStyles}
                      placeholder="Nome do outorgado"
                    />
                  </div>
                </div>

                {/* Linha 5: Descrição */}
                <div style={fieldStyles()}>
                  <label style={labelStyles}>Descrição</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                    style={{
                      ...inputStyles,
                      height: '60px',
                      resize: 'none' as const
                    }}
                    placeholder="Descrição do protocolo"
                  />
                </div>

                {/* Linha 6: Ordem Sinal Público e Responsável */}
                <div style={rowStyles}>
                  <div style={fieldStyles('0 0 200px')}>
                    <label style={labelStyles}>Ordem Sinal Público</label>
                    <input
                      type="text"
                      value={formData.ordemSinalPublico}
                      onChange={(e) => handleInputChange('ordemSinalPublico', e.target.value)}
                      style={inputStyles}
                      placeholder="Ordem Sinal Público"
                    />
                  </div>
                  <div style={fieldStyles('1')}>
                    <label style={labelStyles}>Responsável</label>
                    <input
                      type="text"
                      value={formData.responsavel}
                      onChange={(e) => handleInputChange('responsavel', e.target.value)}
                      style={inputStyles}
                      placeholder="Nome do responsável"
                    />
                  </div>
                </div>

                {/* Linha 7: Data Cancelamento */}
                <div style={{ ...fieldStyles(), maxWidth: '220px' }}>
                  <label style={labelStyles}>Data Cancelamento *</label>
                  <input
                    type="date"
                    value={formData.dataCancelamento}
                    onChange={(e) => handleInputChange('dataCancelamento', e.target.value)}
                    style={inputStyles}
                  />
                </div>

                {/* Linha 8: Motivo Cancelamento */}
                <div style={fieldStyles()}>
                  <label style={labelStyles}>Motivo Cancelamento *</label>
                  <textarea
                    value={formData.motivoCancelamento}
                    onChange={(e) => handleInputChange('motivoCancelamento', e.target.value)}
                    style={{
                      ...inputStyles,
                      height: '60px',
                      resize: 'none' as const
                    }}
                    placeholder="Descreva o motivo do cancelamento"
                  />
                </div>
              </form>
            </div>

            {/* Botões de Ação */}
            <div style={buttonContainerStyles}>
              <button
                onClick={handleGravar}
                style={buttonStyles('primary')}
              >
                💾 Gravar
              </button>
              <button
                onClick={handleNovo}
                style={buttonStyles('secondary')}
              >
                🧹 Limpar
              </button>
              {selectedId && (
                <button
                  onClick={handleExcluir}
                  style={buttonStyles('danger')}
                >
                  ❌ Excluir
                </button>
              )}
              <button
                onClick={onClose}
                style={buttonStyles('default')}
              >
                🚪 Retornar
              </button>
            </div>
          </>
      </div>
    </BasePage>
  )
}

