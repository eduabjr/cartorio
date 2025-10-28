import React, { useState, useEffect } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'

interface FeriadosPageProps {
  onClose: () => void
}

interface Feriado {
  id: string
  codigo: string
  descricao: string
  data: string
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
  const [codigo, setCodigo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState('')

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
    setCodigo('')
    setDescricao('')
    setData('')
  }

  const handleGravar = () => {
    if (!descricao.trim() || !data.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios (Descrição e Data).')
      return
    }

    // Validar formato da data (DD/MM/YYYY)
    const regexData = /^(\d{2})\/(\d{2})\/(\d{4})$/
    if (!regexData.test(data)) {
      alert('Data inválida. Use o formato DD/MM/AAAA (ex: 25/12/2024)')
      return
    }

    if (selectedId) {
      setFeriados(prev => prev.map(f => 
        f.id === selectedId 
          ? { ...f, descricao, data }
          : f
      ))
      alert('Feriado atualizado com sucesso!')
    } else {
      const novoFeriado: Feriado = {
        id: Date.now().toString(),
        codigo: (feriados.length + 1).toString().padStart(3, '0'),
        descricao,
        data
      }
      setFeriados(prev => [...prev, novoFeriado])
      alert('Feriado cadastrado com sucesso!')
    }
    handleNovo()
  }

  const handleExcluir = () => {
    if (selectedId) {
      if (confirm('Deseja realmente excluir este feriado?')) {
        setFeriados(prev => prev.filter(f => f.id !== selectedId))
        handleNovo()
        alert('Feriado excluído com sucesso!')
      }
    }
  }

  const handleSelectRow = (feriado: Feriado) => {
    setSelectedId(feriado.id)
    setCodigo(feriado.codigo)
    setDescricao(feriado.descricao)
    setData(feriado.data)
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
              style={{
                ...inputStyles,
                backgroundColor: theme.border,
                cursor: 'not-allowed',
                width: '100px'
              }}
            />
          </div>

          {/* Linha 2: Descrição do Feriado */}
          <div style={{ marginBottom: '8px' }}>
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

          {/* Linha 3: Data */}
          <div>
            <label style={labelStyles}>Data</label>
            <input
              type="text"
              value={data}
              onChange={(e) => setData(e.target.value)}
              style={{
                ...inputStyles,
                width: '150px'
              }}
              placeholder="DD/MM/AAAA"
              maxLength={10}
            />
            <p style={{ 
              fontSize: '10px', 
              color: theme.textSecondary, 
              marginTop: '2px',
              fontStyle: 'italic' 
            }}>
              ℹ️ Formato: DD/MM/AAAA (ex: 25/12/2024)
            </p>
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
                  width: '120px'
                }}>
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {feriados.length === 0 ? (
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
                      padding: '6px 8px'
                    }}>
                      {feriado.data}
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

