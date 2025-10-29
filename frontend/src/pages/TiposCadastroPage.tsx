import React, { useState } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'

interface TiposCadastroPageProps {
  onClose: () => void
}

export function TiposCadastroPage({ onClose }: TiposCadastroPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  
  const [activeTab, setActiveTab] = useState<'tipoAto' | 'tipoDocumento' | 'acessoRapido'>('tipoAto')
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'

  const tabStyles = (isActive: boolean) => ({
    padding: '8px 20px',
    fontSize: '13px',
    fontWeight: '600' as const,
    border: 'none',
    borderRadius: '4px 4px 0 0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: isActive ? theme.primary : theme.surface,
    color: isActive ? '#fff' : theme.text,
    marginRight: '4px'
  })

  return (
    <BasePage
      title="Cadastro de Digitalização"
      onClose={onClose}
      width="900px"
      height="580px"
      minWidth="900px"
      minHeight="580px"
      resizable={false}
      headerColor={headerColor}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '8px'
      }}>
        {/* Abas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <button
            onClick={() => setActiveTab('tipoAto')}
            style={tabStyles(activeTab === 'tipoAto')}
            onMouseEnter={(e) => {
              if (activeTab !== 'tipoAto') {
                e.currentTarget.style.backgroundColor = theme.border
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'tipoAto') {
                e.currentTarget.style.backgroundColor = theme.surface
              }
            }}
          >
            Tipo de Ato
          </button>
          
          {/* Seta de Fluxo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: headerColor,
            textShadow: `0 0 10px ${headerColor}40`
          }}>
            ➡️
          </div>
          
          <button
            onClick={() => setActiveTab('tipoDocumento')}
            style={tabStyles(activeTab === 'tipoDocumento')}
            onMouseEnter={(e) => {
              if (activeTab !== 'tipoDocumento') {
                e.currentTarget.style.backgroundColor = theme.border
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'tipoDocumento') {
                e.currentTarget.style.backgroundColor = theme.surface
              }
            }}
          >
            Tipo de Documento Digitalizado
          </button>
          
          {/* Seta de Fluxo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: headerColor,
            textShadow: `0 0 10px ${headerColor}40`
          }}>
            ➡️
          </div>
          
          <button
            onClick={() => setActiveTab('acessoRapido')}
            style={tabStyles(activeTab === 'acessoRapido')}
            onMouseEnter={(e) => {
              if (activeTab !== 'acessoRapido') {
                e.currentTarget.style.backgroundColor = theme.border
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'acessoRapido') {
                e.currentTarget.style.backgroundColor = theme.surface
              }
            }}
          >
            ⚡ Acesso Rápido
          </button>
        </div>

        {/* Conteúdo da aba ativa */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activeTab === 'tipoAto' ? (
            <TipoAtoContent onClose={onClose} />
          ) : activeTab === 'tipoDocumento' ? (
            <TipoDocumentoContent onClose={onClose} />
          ) : (
            <AcessoRapidoContent onClose={onClose} />
          )}
        </div>
      </div>
    </BasePage>
  )
}

// Conteúdo de Tipo de Ato (copiado da TipoAtoPage sem o BasePage)
function TipoAtoContent({ onClose }: { onClose: () => void }) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'

  // Estado para o formulário
  const [codigo, setCodigo] = useState(0)
  const [descricao, setDescricao] = useState('')
  const [observacoes, setObservacoes] = useState('')
  
  // Estado para os dados cadastrados
  const [tiposAto, setTiposAto] = useState<any[]>(() => {
    const stored = localStorage.getItem('tiposAto')
    return stored ? JSON.parse(stored) : []
  })
  
  // Estado para o item selecionado na grid
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const saveTiposAto = (tipos: any[]) => {
    localStorage.setItem('tiposAto', JSON.stringify(tipos))
    // Notificar outras janelas sobre a atualização
    window.dispatchEvent(new CustomEvent('tipos-atualizados'))
  }

  const handleNovo = () => {
    setCodigo(0)
    setDescricao('')
    setObservacoes('')
    setSelectedId(null)
  }

  const handleGravar = () => {
    if (!descricao.trim()) {
      console.log('⚠️ Por favor, preencha a descrição do tipo de ato.')
      return
    }

    let novosTipos: any[]
    let tipoGravado: any

    if (selectedId !== null) {
      novosTipos = tiposAto.map(tipo => 
        tipo.id === selectedId 
          ? { ...tipo, descricao, observacoes }
          : tipo
      )
      tipoGravado = novosTipos.find(t => t.id === selectedId)
    } else {
      const novoCodigo = tiposAto.length > 0 ? Math.max(...tiposAto.map(t => t.codigo)) + 1 : 1
      tipoGravado = {
        id: Date.now(),
        codigo: novoCodigo,
        descricao,
        observacoes
      }
      novosTipos = [...tiposAto, tipoGravado]
      setCodigo(novoCodigo)
    }

    setTiposAto(novosTipos)
    saveTiposAto(novosTipos)
    console.log('✅ Tipo de Ato gravado com sucesso!')
  }

  const handleExcluir = () => {
    if (selectedId !== null) {
      const novosTipos = tiposAto.filter(tipo => tipo.id !== selectedId)
      setTiposAto(novosTipos)
      saveTiposAto(novosTipos)
      handleNovo()
      console.log('✅ Tipo de Ato excluído.')
    }
  }

  const handleSelectRow = (tipo: any) => {
    setSelectedId(tipo.id)
    setCodigo(tipo.codigo)
    setDescricao(tipo.descricao)
    setObservacoes(tipo.observacoes)
  }

  const inputStyles = {
    width: '100%',
    padding: '4px 6px',
    fontSize: '12px',
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    backgroundColor: theme.background,
    color: theme.text,
    outline: 'none',
    height: '28px',
    boxSizing: 'border-box' as const
  }

  const labelStyles = {
    fontSize: '11px',
    fontWeight: '600' as const,
    marginBottom: '2px',
    color: theme.text,
    display: 'block'
  }

  const buttonStyles = {
    padding: '6px 16px',
    fontSize: '11px',
    fontWeight: '600' as const,
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '90px'
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      gap: '8px'
    }}>
      {/* Formulário de Entrada */}
      <div style={{
        border: `1px solid ${theme.border}`,
        borderRadius: '4px',
        padding: '8px',
        backgroundColor: theme.surface
      }}>
        {/* Linha 1: Código */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr',
          gap: '8px',
          marginBottom: '8px'
        }}>
          {/* Código */}
          <div>
            <label style={labelStyles}>Código</label>
            <input
              type="text"
              value={codigo}
              readOnly
              disabled
              onKeyDown={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              style={{
                ...inputStyles,
                backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                color: currentTheme === 'dark' ? '#666' : '#999',
                cursor: 'not-allowed',
                opacity: 0.7
              }}
            />
          </div>

          {/* Descrição */}
          <div>
            <label style={labelStyles}>Descrição do Tipo de Ato</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              style={inputStyles}
              placeholder="Ex: Casamento, Nascimento, Óbito..."
              maxLength={100}
            />
          </div>
        </div>

        {/* Linha 2: Observações */}
        <div>
          <label style={labelStyles}>Observações</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            style={{
              ...inputStyles,
              height: 'auto',
              minHeight: '60px',
              maxHeight: '150px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            placeholder="Informações adicionais sobre o tipo de ato..."
          />
        </div>
      </div>

      {/* Grid de Dados */}
      <div style={{
        flex: 1,
        border: `1px solid ${theme.border}`,
        borderRadius: '4px',
        overflow: 'auto',
        backgroundColor: theme.surface
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12px'
        }}>
          <thead>
            <tr style={{
              backgroundColor: headerColor,
              color: 'white',
              position: 'sticky',
              top: 0,
              zIndex: 1
            }}>
              <th style={{
                padding: '6px 8px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '11px',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                width: '80px'
              }}>
                Código
              </th>
              <th style={{
                padding: '6px 8px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '11px',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                Descrição
              </th>
              <th style={{
                padding: '6px 8px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '11px'
              }}>
                Observações
              </th>
            </tr>
          </thead>
          <tbody>
            {tiposAto.length === 0 ? (
              <tr>
                <td colSpan={3} style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: theme.textSecondary,
                  fontStyle: 'italic',
                  fontSize: '13px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '20px', opacity: 0.5 }}>📄</span>
                    <span>Nenhum tipo de ato cadastrado</span>
                  </div>
                </td>
              </tr>
            ) : (
              tiposAto.map((tipo, index) => (
                <tr
                  key={tipo.id}
                  onClick={() => handleSelectRow(tipo)}
                  style={{
                    backgroundColor: selectedId === tipo.id 
                      ? '#3b82f6' 
                      : index % 2 === 0 
                        ? theme.surface 
                        : theme.background,
                    color: selectedId === tipo.id ? 'white' : theme.text,
                    cursor: 'pointer',
                    borderBottom: `1px solid ${theme.border}`
                  }}
                  onMouseEnter={(e) => {
                    if (selectedId !== tipo.id) {
                      e.currentTarget.style.backgroundColor = theme.border
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedId !== tipo.id) {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 
                        ? theme.surface 
                        : theme.background
                    }
                  }}
                >
                  <td style={{
                    padding: '6px 8px',
                    borderRight: `1px solid ${theme.border}`
                  }}>
                    {tipo.codigo}
                  </td>
                  <td style={{
                    padding: '6px 8px',
                    borderRight: `1px solid ${theme.border}`
                  }}>
                    {tipo.descricao}
                  </td>
                  <td style={{
                    padding: '6px 8px'
                  }}>
                    {tipo.observacoes}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Botões de Ação */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        paddingTop: '4px'
      }}>
        <button
          onClick={handleNovo}
          style={{
            ...buttonStyles,
            backgroundColor: '#6c757d',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#495057'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6c757d'
          }}
        >
          📄 Novo
        </button>

        <button
          onClick={handleGravar}
          style={{
            ...buttonStyles,
            backgroundColor: '#6c757d',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#495057'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6c757d'
          }}
        >
          💾 Gravar
        </button>

        <button
          onClick={handleExcluir}
          disabled={selectedId === null}
          style={{
            ...buttonStyles,
            backgroundColor: selectedId === null ? theme.border : '#6c757d',
            color: selectedId === null ? theme.textSecondary : 'white',
            cursor: selectedId === null ? 'not-allowed' : 'pointer',
            opacity: selectedId === null ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (selectedId !== null) {
              e.currentTarget.style.backgroundColor = '#495057'
            }
          }}
          onMouseLeave={(e) => {
            if (selectedId !== null) {
              e.currentTarget.style.backgroundColor = '#6c757d'
            }
          }}
        >
          ❌ Excluir
        </button>

        <button
          onClick={onClose}
          style={{
            ...buttonStyles,
            backgroundColor: '#6c757d',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#495057'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6c757d'
          }}
        >
          🚪 Retornar
        </button>
      </div>
    </div>
  )
}

// Conteúdo de Tipo de Documento Digitalizado
function TipoDocumentoContent({ onClose }: { onClose: () => void }) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'

  // Estado para o formulário
  const [codigo, setCodigo] = useState(0)
  const [tipoAtoSelecionado, setTipoAtoSelecionado] = useState('')
  const [nomeDocumento, setNomeDocumento] = useState('')
  const [observacoes, setObservacoes] = useState('')
  
  // 🔒 CORREÇÃO: Carregar tipos de ato para o seletor
  const [tiposAto, setTiposAto] = useState<any[]>(() => {
    const stored = localStorage.getItem('tiposAto')
    return stored ? JSON.parse(stored) : []
  })
  
  // Estado para os dados cadastrados
  const [tiposDocumento, setTiposDocumento] = useState<any[]>(() => {
    const stored = localStorage.getItem('tiposDocumento')
    return stored ? JSON.parse(stored) : []
  })
  
  // Estado para o item selecionado na grid
  const [selectedId, setSelectedId] = useState<number | null>(null)
  
  // 🔒 Estado para filtro de Tipo de Ato na lista
  const [filtroTipoAto, setFiltroTipoAto] = useState<string>('') // '' = todos, ou nome específico
  
  // 🔒 CORREÇÃO: Recarregar tipos de ato quando a aba é ativada
  React.useEffect(() => {
    const storedTiposAto = localStorage.getItem('tiposAto')
    if (storedTiposAto) {
      setTiposAto(JSON.parse(storedTiposAto))
    }
  }, [])
  
  // 🔒 Filtrar documentos por Tipo de Ato
  const documentosFiltrados = filtroTipoAto 
    ? tiposDocumento.filter(doc => doc.tipoAto === filtroTipoAto)
    : tiposDocumento

  const saveTiposDocumento = (tipos: any[]) => {
    localStorage.setItem('tiposDocumento', JSON.stringify(tipos))
    // Notificar outras janelas sobre a atualização
    window.dispatchEvent(new CustomEvent('tipos-atualizados'))
  }

  const handleNovo = () => {
    setCodigo(0)
    setTipoAtoSelecionado('')
    setNomeDocumento('')
    setObservacoes('')
    setSelectedId(null)
  }

  const handleGravar = () => {
    if (!tipoAtoSelecionado.trim()) {
      console.log('⚠️ Por favor, selecione um Tipo de Ato da lista.')
      return
    }

    if (!nomeDocumento.trim()) {
      console.log('⚠️ Por favor, preencha o nome do documento.')
      return
    }

    // Verificar se o tipo já existe (mesmo Tipo de Ato + mesmo Nome)
    const tipoExistente = tiposDocumento.find(t => 
      t.tipoAto === tipoAtoSelecionado && 
      t.nomeDocumento === nomeDocumento && 
      t.id !== selectedId
    )
    if (tipoExistente) {
      console.log('⚠️ Já existe um Tipo de Documento com este Tipo de Ato e Nome.')
      return
    }

    let novosTipos: any[]

    if (selectedId !== null) {
      novosTipos = tiposDocumento.map(tipo => 
        tipo.id === selectedId 
          ? { ...tipo, tipoAto: tipoAtoSelecionado, nomeDocumento, observacoes }
          : tipo
      )
    } else {
      const novoCodigo = tiposDocumento.length > 0 ? Math.max(...tiposDocumento.map(t => t.codigo)) + 1 : 1
      const novoTipo = {
        id: Date.now(),
        codigo: novoCodigo,
        tipoAto: tipoAtoSelecionado,
        nomeDocumento,
        observacoes
      }
      novosTipos = [...tiposDocumento, novoTipo]
      setCodigo(novoCodigo)
    }

    setTiposDocumento(novosTipos)
    saveTiposDocumento(novosTipos)
    console.log('✅ Tipo de Documento gravado com sucesso!')
  }

  const handleExcluir = () => {
    if (selectedId !== null) {
      const novosTipos = tiposDocumento.filter(tipo => tipo.id !== selectedId)
      setTiposDocumento(novosTipos)
      saveTiposDocumento(novosTipos)
      handleNovo()
      console.log('✅ Tipo de Documento excluído.')
    }
  }

  const handleSelectRow = (tipo: any) => {
    setSelectedId(tipo.id)
    setCodigo(tipo.codigo)
    setTipoAtoSelecionado(tipo.tipoAto || '')
    setNomeDocumento(tipo.nomeDocumento || '')
    setObservacoes(tipo.observacoes)
  }

  const inputStyles = {
    width: '100%',
    padding: '4px 6px',
    fontSize: '12px',
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    backgroundColor: theme.background,
    color: theme.text,
    outline: 'none',
    height: '28px',
    boxSizing: 'border-box' as const
  }

  const labelStyles = {
    fontSize: '11px',
    fontWeight: '600' as const,
    marginBottom: '2px',
    color: theme.text,
    display: 'block'
  }

  const buttonStyles = {
    padding: '6px 16px',
    fontSize: '11px',
    fontWeight: '600' as const,
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '90px'
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      gap: '8px'
    }}>
      {/* Formulário de Entrada */}
      <div style={{
        border: `1px solid ${theme.border}`,
        borderRadius: '4px',
        padding: '8px',
        backgroundColor: theme.surface
      }}>
        {/* Linha 1: Código e Tipo de Ato */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '100px 1fr',
          gap: '8px',
          marginBottom: '8px'
        }}>
          {/* Código */}
          <div>
            <label style={labelStyles}>Código</label>
            <input
              type="text"
              value={codigo}
              readOnly
              disabled
              onKeyDown={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              style={{
                ...inputStyles,
                backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                color: currentTheme === 'dark' ? '#666' : '#999',
                cursor: 'not-allowed',
                opacity: 0.7
              }}
            />
          </div>

          {/* Tipo de Ato - SELETOR */}
          <div>
            <label style={labelStyles}>Tipo de Ato (Relacionado)</label>
            <select
              value={tipoAtoSelecionado}
              onChange={(e) => {
                const valor = e.target.value
                setTipoAtoSelecionado(valor)
                // 🔒 Atualizar filtro automaticamente quando selecionar Tipo de Ato
                setFiltroTipoAto(valor)
              }}
              style={{
                ...inputStyles,
                cursor: 'pointer'
              }}
              disabled={tiposAto.length === 0}
            >
              <option value="">
                {tiposAto.length === 0 
                  ? '⚠️ Nenhum Tipo de Ato cadastrado. Cadastre primeiro na aba "Tipo de Ato".' 
                  : 'Selecione um Tipo de Ato...'}
              </option>
              {tiposAto.map((tipo) => (
                <option key={tipo.id} value={tipo.descricao}>
                  {tipo.descricao}
                </option>
              ))}
            </select>
            {tipoAtoSelecionado && (
              <div style={{ 
                fontSize: '10px', 
                color: theme.info, 
                marginTop: '2px',
                fontStyle: 'italic'
              }}>
                💡 A lista abaixo está filtrada para "{tipoAtoSelecionado}"
              </div>
            )}
          </div>
        </div>

        {/* Linha 2: Nome do Documento */}
        <div style={{ marginBottom: '8px' }}>
          <label style={labelStyles}>Nome do Documento</label>
          <input
            type="text"
            value={nomeDocumento}
            onChange={(e) => setNomeDocumento(e.target.value)}
            style={inputStyles}
            placeholder="Ex: RG, CPF, CNH, Certidão de Nascimento..."
            maxLength={100}
          />
        </div>

        {/* Linha 3: Observações */}
        <div>
          <label style={labelStyles}>Observações</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            style={{
              ...inputStyles,
              height: 'auto',
              minHeight: '60px',
              maxHeight: '150px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            placeholder="Informações adicionais sobre o tipo de documento..."
          />
        </div>
      </div>

      {/* Grid de Dados */}
      <div style={{
        flex: 1,
        border: `1px solid ${theme.border}`,
        borderRadius: '4px',
        overflow: 'auto',
        backgroundColor: theme.surface
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12px'
        }}>
          <thead>
            <tr style={{
              backgroundColor: headerColor,
              color: 'white',
              position: 'sticky',
              top: 0,
              zIndex: 1
            }}>
              <th style={{
                padding: '6px 8px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '11px',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                width: '80px'
              }}>
                Código
              </th>
              <th style={{
                padding: '6px 8px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '11px',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                width: '180px'
              }}>
                Tipo de Ato
              </th>
              <th style={{
                padding: '6px 8px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '11px',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                Nome do Documento
              </th>
              <th style={{
                padding: '6px 8px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '11px'
              }}>
                Observações
              </th>
            </tr>
          </thead>
          <tbody>
            {documentosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={4} style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: theme.textSecondary,
                  fontStyle: 'italic'
                }}>
                  {filtroTipoAto 
                    ? `📄 Nenhum documento cadastrado para "${filtroTipoAto}"`
                    : '📄 Nenhum documento cadastrado'}
                </td>
              </tr>
            ) : (
              documentosFiltrados.map((tipo, index) => (
              <tr
                key={tipo.id}
                onClick={() => handleSelectRow(tipo)}
                style={{
                  backgroundColor: selectedId === tipo.id 
                    ? '#3b82f6' 
                    : index % 2 === 0 
                      ? theme.surface 
                      : theme.background,
                  color: selectedId === tipo.id ? 'white' : theme.text,
                  cursor: 'pointer',
                  borderBottom: `1px solid ${theme.border}`
                }}
                onMouseEnter={(e) => {
                  if (selectedId !== tipo.id) {
                    e.currentTarget.style.backgroundColor = theme.border
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedId !== tipo.id) {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 
                      ? theme.surface 
                      : theme.background
                  }
                }}
              >
                <td style={{
                  padding: '6px 8px',
                  borderRight: `1px solid ${theme.border}`
                }}>
                  {tipo.codigo}
                </td>
                <td style={{
                  padding: '6px 8px',
                  borderRight: `1px solid ${theme.border}`
                }}>
                  {tipo.tipoAto}
                </td>
                <td style={{
                  padding: '6px 8px',
                  borderRight: `1px solid ${theme.border}`
                }}>
                  {tipo.nomeDocumento}
                </td>
                <td style={{
                  padding: '6px 8px'
                }}>
                  {tipo.observacoes}
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Botões de Ação */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        paddingTop: '4px'
      }}>
        <button
          onClick={handleNovo}
          style={{
            ...buttonStyles,
            backgroundColor: '#6c757d',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#495057'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6c757d'
          }}
        >
          📄 Novo
        </button>

        <button
          onClick={handleGravar}
          style={{
            ...buttonStyles,
            backgroundColor: '#6c757d',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#495057'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6c757d'
          }}
        >
          💾 Gravar
        </button>

        <button
          onClick={handleExcluir}
          disabled={selectedId === null}
          style={{
            ...buttonStyles,
            backgroundColor: selectedId === null ? theme.border : '#6c757d',
            color: selectedId === null ? theme.textSecondary : 'white',
            cursor: selectedId === null ? 'not-allowed' : 'pointer',
            opacity: selectedId === null ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (selectedId !== null) {
              e.currentTarget.style.backgroundColor = '#495057'
            }
          }}
          onMouseLeave={(e) => {
            if (selectedId !== null) {
              e.currentTarget.style.backgroundColor = '#6c757d'
            }
          }}
        >
          ❌ Excluir
        </button>

        <button
          onClick={onClose}
          style={{
            ...buttonStyles,
            backgroundColor: '#6c757d',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#495057'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6c757d'
          }}
        >
          🚪 Retornar
        </button>
      </div>
    </div>
  )
}

// Conteúdo de Acesso Rápido
function AcessoRapidoContent({ onClose }: { onClose: () => void }) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'

  // Carregar tipos de ato (apenas leitura - sem setter necessário)
  const [tiposAto] = useState<any[]>(() => {
    const stored = localStorage.getItem('tiposAto')
    return stored ? JSON.parse(stored) : []
  })

  // Carregar tipos de documento (apenas leitura - sem setter necessário)
  const [tiposDocumento] = useState<any[]>(() => {
    const stored = localStorage.getItem('tiposDocumento')
    return stored ? JSON.parse(stored) : []
  })

  // Carregar documentos marcados como acesso rápido
  const [acessoRapido, setAcessoRapido] = useState<any[]>(() => {
    const stored = localStorage.getItem('acessoRapido')
    return stored ? JSON.parse(stored) : []
  })

  const [tipoAtoSelecionado, setTipoAtoSelecionado] = useState('')

  // Filtrar documentos por tipo de ato selecionado
  const documentosFiltrados = tipoAtoSelecionado 
    ? tiposDocumento.filter(doc => doc.tipoAto === tipoAtoSelecionado)
    : []

  // Verificar se um documento está marcado como acesso rápido
  const isAcessoRapido = (docId: string) => {
    return acessoRapido.some(item => item.documentoId === docId)
  }

  // Toggle acesso rápido para um documento
  const toggleAcessoRapido = (doc: any) => {
    let novosAcessos: any[]
    
    if (isAcessoRapido(doc.id)) {
      // Remover
      novosAcessos = acessoRapido.filter(item => item.documentoId !== doc.id)
    } else {
      // Adicionar
      novosAcessos = [
        ...acessoRapido,
        {
          id: Date.now() + Math.random(),
          tipoAto: doc.tipoAto,
          documentoId: doc.id,
          nomeDocumento: doc.nomeDocumento
        }
      ]
    }
    
    setAcessoRapido(novosAcessos)
  }

  const handleGravar = () => {
    localStorage.setItem('acessoRapido', JSON.stringify(acessoRapido))
    window.dispatchEvent(new CustomEvent('acesso-rapido-atualizado'))
    console.log('✅ Configurações de Acesso Rápido gravadas.')
  }

  const labelStyles = {
    fontSize: '11px',
    fontWeight: '600' as const,
    marginBottom: '4px',
    color: theme.text,
    display: 'block'
  }

  const inputStyles = {
    width: '100%',
    padding: '4px 6px',
    fontSize: '12px',
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    backgroundColor: theme.background,
    color: theme.text,
    outline: 'none',
    height: '28px',
    boxSizing: 'border-box' as const
  }

  const buttonStyles = {
    padding: '6px 16px',
    fontSize: '11px',
    fontWeight: '600' as const,
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '90px'
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      gap: '8px'
    }}>
      {/* Cabeçalho com descrição */}
      <div style={{
        border: `1px solid ${theme.border}`,
        borderRadius: '4px',
        padding: '12px',
        backgroundColor: theme.surface
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          color: theme.text,
          marginBottom: '8px'
        }}>
          ⚡ Configurar Acesso Rápido
        </div>
        <div style={{
          fontSize: '11px',
          color: theme.textSecondary,
          lineHeight: '1.5'
        }}>
          Marque os documentos que deseja criar automaticamente ao usar o botão "Acesso Rápido" 
          na tela de Controle de Digitalização. Selecione um Tipo de Ato e marque os documentos desejados.
        </div>
      </div>

      {/* Seletor de Tipo de Ato */}
      <div style={{
        border: `1px solid ${theme.border}`,
        borderRadius: '4px',
        padding: '8px',
        backgroundColor: theme.surface
      }}>
        <label style={labelStyles}>Tipo de Ato (Relacionado)</label>
        <select
          value={tipoAtoSelecionado}
          onChange={(e) => setTipoAtoSelecionado(e.target.value)}
          style={{
            ...inputStyles,
            cursor: 'pointer'
          }}
          disabled={tiposAto.length === 0}
        >
          <option value="">
            {tiposAto.length === 0 
              ? '⚠️ Nenhum Tipo de Ato cadastrado.' 
              : 'Selecione um Tipo de Ato...'}
          </option>
          {tiposAto.map((tipo) => (
            <option key={tipo.id} value={tipo.descricao}>
              {tipo.descricao}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de documentos com checkboxes */}
      <div style={{
        flex: 1,
        border: `1px solid ${theme.border}`,
        borderRadius: '4px',
        overflow: 'auto',
        backgroundColor: theme.surface
      }}>
        {!tipoAtoSelecionado ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: theme.textSecondary,
            fontSize: '13px',
            fontStyle: 'italic'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '8px', opacity: 0.3 }}>⚡</div>
            <div>Selecione um Tipo de Ato para ver os documentos disponíveis</div>
          </div>
        ) : documentosFiltrados.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: theme.textSecondary,
            fontSize: '13px',
            fontStyle: 'italic'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '8px', opacity: 0.3 }}>📄</div>
            <div>Nenhum documento cadastrado para "{tipoAtoSelecionado}"</div>
          </div>
        ) : (
          <div style={{ padding: '12px' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: `1px solid ${theme.border}`
            }}>
              Documentos de "{tipoAtoSelecionado}" - Marque para Acesso Rápido:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {documentosFiltrados.map((doc) => (
                <label
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px',
                    backgroundColor: isAcessoRapido(doc.id) ? `${headerColor}20` : theme.background,
                    border: `1px solid ${isAcessoRapido(doc.id) ? headerColor : theme.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isAcessoRapido(doc.id) 
                      ? `${headerColor}30` 
                      : theme.border
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isAcessoRapido(doc.id) 
                      ? `${headerColor}20` 
                      : theme.background
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isAcessoRapido(doc.id)}
                    onChange={() => toggleAcessoRapido(doc)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{
                    flex: 1,
                    fontSize: '12px',
                    fontWeight: isAcessoRapido(doc.id) ? '600' : '400',
                    color: theme.text
                  }}>
                    {doc.nomeDocumento}
                    {isAcessoRapido(doc.id) && (
                      <span style={{ 
                        marginLeft: '8px', 
                        fontSize: '14px',
                        color: headerColor 
                      }}>
                        ⚡
                      </span>
                    )}
                  </div>
                  {doc.observacoes && (
                    <div style={{
                      fontSize: '10px',
                      color: theme.textSecondary,
                      fontStyle: 'italic',
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {doc.observacoes}
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        paddingTop: '4px'
      }}>
        <button
          onClick={handleGravar}
          style={{
            ...buttonStyles,
            backgroundColor: '#10b981',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#059669'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#10b981'
          }}
        >
          💾 Gravar
        </button>

        <button
          onClick={onClose}
          style={{
            ...buttonStyles,
            backgroundColor: '#6c757d',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#495057'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6c757d'
          }}
        >
          🚪 Retornar
        </button>
      </div>
    </div>
  )
}

