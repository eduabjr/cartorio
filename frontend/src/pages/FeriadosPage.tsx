import { useState, useEffect } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'

interface FeriadosPageProps {
  onClose: () => void
}

interface Feriado {
  id: string
  codigo: string
  descricao: string
  dataInicial: string
  dataFinal?: string
}

export function FeriadosPage({ onClose }: FeriadosPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
  
  // Carregar dados do localStorage na inicialização
  const [feriados, setFeriados] = useState<Feriado[]>(() => {
    const saved = localStorage.getItem('feriados-cadastrados')
    return saved ? JSON.parse(saved) : []
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [codigo, setCodigo] = useState('0')
  const [descricao, setDescricao] = useState('')
  const [dataInicial, setDataInicial] = useState('')
  const [dataFinal, setDataFinal] = useState('')
  
  // Interface para feriados do JSON
  interface FeriadoJSON {
    descricao: string
    dataInicial: string
    dataFinal?: string
  }
  
  // Estado para armazenar os feriados do JSON
  const [feriadosJSON, setFeriadosJSON] = useState<FeriadoJSON[]>([])
  
  // Carregar feriados do JSON
  useEffect(() => {
    const carregarFeriadosJSON = async () => {
      try {
        const response = await fetch('/extra/feriadosNacionais2025.json')
        if (response.ok) {
          const data = await response.json()
          setFeriadosJSON(data)
          console.log('✅ Feriados Nacionais 2025 carregados do JSON:', data)
        } else {
          console.warn('⚠️ Não foi possível carregar feriadosNacionais2025.json')
        }
      } catch (error) {
        console.error('❌ Erro ao carregar feriadosNacionais2025.json:', error)
      }
    }
    
    carregarFeriadosJSON()
  }, [])

  // Salvar no localStorage sempre que feriados mudar
  useEffect(() => {
    localStorage.setItem('feriados-cadastrados', JSON.stringify(feriados))
  }, [feriados])

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

  const labelStyles = {
    display: 'block',
    marginBottom: '4px',
    fontSize: '11px',
    fontWeight: '600' as const,
    color: theme.text
  }

  const inputStyles = {
    width: '100%',
    padding: '6px 8px',
    fontSize: '12px',
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    backgroundColor: theme.surface,
    color: theme.text,
    boxSizing: 'border-box' as const
  }

  const handleNovo = () => {
    setSelectedId(null)
    setCodigo('0')
    setDescricao('')
    setDataInicial('')
    setDataFinal('')
  }

  // Função auxiliar para converter data de YYYY-MM-DD para DD/MM/YYYY
  const formatarDataParaBR = (dataISO: string): string => {
    if (!dataISO) return ''
    const [ano, mes, dia] = dataISO.split('-')
    return `${dia}/${mes}/${ano}`
  }

  // Função auxiliar para converter data de DD/MM/YYYY para YYYY-MM-DD
  const formatarDataParaISO = (dataBR: string): string => {
    if (!dataBR) return ''
    const [dia, mes, ano] = dataBR.split('/')
    return `${ano}-${mes}-${dia}`
  }

  const handleGravar = () => {
    if (!descricao.trim() || !dataInicial.trim()) {
      console.log('⚠️ Por favor, preencha todos os campos obrigatórios (Descrição e Data Inicial).')
      return
    }

    const dataFormatada = formatarDataParaBR(dataInicial)
    const dataFinalFormatada = dataFinal ? formatarDataParaBR(dataFinal) : dataFormatada

    if (selectedId) {
      setFeriados(prev => prev.map(f => 
        f.id === selectedId 
          ? { ...f, descricao, dataInicial: dataFormatada, dataFinal: dataFinalFormatada !== dataFormatada ? dataFinalFormatada : undefined }
          : f
      ))
      console.log('✅ Feriado atualizado!')
    } else {
      // Gerar código sequencial
      const ultimoCodigo = localStorage.getItem('ultimoCodigoFeriado')
      const proximoCodigo = ultimoCodigo ? parseInt(ultimoCodigo) + 1 : 1
      
      const novoCodigo = proximoCodigo.toString().padStart(3, '0')
      
      const novoFeriado: Feriado = {
        id: Date.now().toString(),
        codigo: novoCodigo,
        descricao,
        dataInicial: dataFormatada,
        dataFinal: dataFinal && dataFinal !== dataInicial ? dataFinalFormatada : undefined
      }
      setFeriados(prev => [...prev, novoFeriado])
      localStorage.setItem('ultimoCodigoFeriado', proximoCodigo.toString())
      
      if (dataFinal && dataFinal !== dataInicial) {
        console.log(`✅ Feriado cadastrado de ${dataFormatada} até ${dataFinalFormatada}! Código: ${novoCodigo}`)
      } else {
        console.log('✅ Feriado cadastrado! Código:', novoCodigo)
      }
    }
    handleNovo()
  }

  const handleExcluir = () => {
    if (selectedId) {
      setFeriados(prev => prev.filter(f => f.id !== selectedId))
      handleNovo()
      console.log('✅ Feriado excluído.')
    }
  }

  const handleSelectRow = (feriado: Feriado) => {
    setSelectedId(feriado.id)
    setCodigo(feriado.codigo)
    setDescricao(feriado.descricao)
    setDataInicial(formatarDataParaISO(feriado.dataInicial))
    setDataFinal(feriado.dataFinal ? formatarDataParaISO(feriado.dataFinal) : '')
  }
  
  const handleGerarFeriadosAutomaticamente = () => {
    if (feriadosJSON.length === 0) {
      console.warn('⚠️ Nenhum feriado encontrado no JSON.')
      return
    }

    let novosFeriados = [...feriados]
    let ultimoCodigo = parseInt(localStorage.getItem('ultimoCodigoFeriado') || '0')
    let countCriados = 0
    let countJaExistentes = 0

    feriadosJSON.forEach((feriadoJSON, index) => {
      // Verificar se já existe (mesma descrição, dataInicial e dataFinal)
      const jaExiste = novosFeriados.some(f => 
        f.descricao.toLowerCase() === feriadoJSON.descricao.toLowerCase() &&
        f.dataInicial === feriadoJSON.dataInicial &&
        f.dataFinal === (feriadoJSON.dataFinal || undefined)
      )
      
      if (jaExiste) {
        const dataInfo = feriadoJSON.dataFinal && feriadoJSON.dataFinal !== feriadoJSON.dataInicial 
          ? `${feriadoJSON.dataInicial} - ${feriadoJSON.dataFinal}` 
          : feriadoJSON.dataInicial
        console.log(`⚠️ Feriado "${feriadoJSON.descricao}" (${dataInfo}) já existe, pulando...`)
        countJaExistentes++
        return
      }
      
      // Criar novo feriado
      ultimoCodigo++
      const novoCodigo = ultimoCodigo.toString().padStart(3, '0')
      const novoFeriado: Feriado = {
        id: Date.now().toString() + Math.random() + index,
        codigo: novoCodigo,
        descricao: feriadoJSON.descricao,
        dataInicial: feriadoJSON.dataInicial,
        dataFinal: feriadoJSON.dataFinal || undefined
      }
      novosFeriados.push(novoFeriado)
      countCriados++
      const dataInfo = feriadoJSON.dataFinal && feriadoJSON.dataFinal !== feriadoJSON.dataInicial 
        ? `${feriadoJSON.dataInicial} - ${feriadoJSON.dataFinal}` 
        : feriadoJSON.dataInicial
      console.log(`✅ Feriado "${feriadoJSON.descricao}" (${dataInfo}) criado!`)
    })

    if (countCriados > 0) {
      localStorage.setItem('ultimoCodigoFeriado', ultimoCodigo.toString())
      setFeriados(novosFeriados)
      handleNovo() // Limpar formulário
      console.log(`🎉 ${countCriados} feriado(s) criado(s) com sucesso!`)
      if (countJaExistentes > 0) {
        console.log(`ℹ️ ${countJaExistentes} feriado(s) já existia(m) e foi(ram) ignorado(s).`)
      }
    } else {
      console.log('ℹ️ Todos os feriados já existem no sistema.')
    }
  }

  return (
    <BasePage
      title="Cadastro de Feriado"
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
        padding: '8px',
        gap: '8px'
      }}>
        {/* Formulário */}
        <div style={{
          border: `1px solid ${theme.border}`,
          borderRadius: '4px',
          padding: '8px',
          backgroundColor: theme.surface
        }}>
          {/* Linha 1: Código */}
          <div style={{ marginBottom: '8px' }}>
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
                width: '100px',
                opacity: 0.7
              }}
            />
          </div>

          {/* Linha 2: Descrição do Feriado e Botão Geração Automática */}
          <div style={{ 
            marginBottom: '8px',
            display: 'grid',
            gridTemplateColumns: '1fr 130px',
            gap: '8px'
          }}>
            <div>
              <label style={labelStyles}>Descrição do Feriado</label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                style={inputStyles}
                placeholder="Ex: Natal, Ano Novo, Dia do Trabalho..."
                maxLength={100}
              />
            </div>
            
            {/* Botão Geração Automática */}
            <div>
              <label style={labelStyles}>Geração Automática</label>
              <button
                onClick={handleGerarFeriadosAutomaticamente}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '11px',
                  fontWeight: '600',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '3px',
                  cursor: 'pointer',
                  backgroundColor: headerColor,
                  color: 'white',
                  height: '28px',
                  boxSizing: 'border-box' as const,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
                title="Gerar feriados nacionais de 2025 automaticamente"
              >
                ⚡ Gerar
              </button>
            </div>
          </div>

          {/* Linha 3: Data Inicial e Data Final */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px'
          }}>
            <div>
              <label style={labelStyles}>Data Inicial *</label>
              <input
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                style={{
                  ...inputStyles,
                  height: '28px'
                }}
              />
            </div>
            
            <div>
              <label style={labelStyles}>Data Final (opcional)</label>
              <input
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
                style={{
                  ...inputStyles,
                  height: '28px'
                }}
                min={dataInicial}
              />
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          border: `1px solid ${theme.border}`,
          borderRadius: '4px'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '11px'
          }}>
            <thead style={{
              position: 'sticky',
              top: 0,
              backgroundColor: theme.primary,
              color: 'white',
              zIndex: 1
            }}>
              <tr>
                <th style={{
                  padding: '6px 8px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '11px',
                  borderRight: `1px solid rgba(255,255,255,0.2)`,
                  width: '80px'
                }}>
                  Código
                </th>
                <th style={{
                  padding: '6px 8px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '11px',
                  borderRight: `1px solid rgba(255,255,255,0.2)`
                }}>
                  Descrição
                </th>
                <th style={{
                  padding: '6px 8px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '11px',
                  borderRight: `1px solid rgba(255,255,255,0.2)`,
                  width: '120px'
                }}>
                  Data Inicial
                </th>
                <th style={{
                  padding: '6px 8px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '11px',
                  width: '120px'
                }}>
                  Data Final
                </th>
              </tr>
            </thead>
            <tbody>
              {feriados.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{
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
                      <span style={{ fontSize: '20px', opacity: 0.5 }}>📅</span>
                      <span>Nenhum feriado cadastrado</span>
                    </div>
                  </td>
                </tr>
              ) : (
                feriados.map((feriado, index) => (
                  <tr
                    key={feriado.id}
                    onClick={() => handleSelectRow(feriado)}
                    style={{
                      backgroundColor: selectedId === feriado.id 
                        ? '#3b82f6' 
                        : index % 2 === 0 
                          ? theme.surface 
                          : theme.background,
                      color: selectedId === feriado.id ? 'white' : theme.text,
                      cursor: 'pointer',
                      borderBottom: `1px solid ${theme.border}`
                    }}
                    onMouseEnter={(e) => {
                      if (selectedId !== feriado.id) {
                        e.currentTarget.style.backgroundColor = theme.border
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedId !== feriado.id) {
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
                      {feriado.codigo}
                    </td>
                    <td style={{
                      padding: '6px 8px',
                      borderRight: `1px solid ${theme.border}`
                    }}>
                      {feriado.descricao}
                    </td>
                    <td style={{
                      padding: '6px 8px',
                      borderRight: `1px solid ${theme.border}`
                    }}>
                      {feriado.dataInicial}
                    </td>
                    <td style={{
                      padding: '6px 8px'
                    }}>
                      {feriado.dataFinal || '-'}
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
    </BasePage>
  )
}

