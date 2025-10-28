import React, { useState, useEffect } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'

interface TipoAto {
  id: number
  codigo: number
  descricao: string
  observacoes: string
}

interface TipoAtoPageProps {
  onClose: () => void
}

// Função para salvar no localStorage
const saveTiposAto = (tipos: TipoAto[]) => {
  localStorage.setItem('tiposAto', JSON.stringify(tipos))
}

// Função para carregar do localStorage
const loadTiposAto = (): TipoAto[] => {
  const stored = localStorage.getItem('tiposAto')
  if (stored) {
    return JSON.parse(stored)
  }
  // Dados iniciais padrão
  return [
    { id: 1, codigo: 1, descricao: 'Casamento', observacoes: 'Registro de casamento civil' },
    { id: 2, codigo: 2, descricao: 'Nascimento', observacoes: 'Registro de nascimento' },
    { id: 3, codigo: 3, descricao: 'Óbito', observacoes: 'Registro de óbito' },
    { id: 4, codigo: 4, descricao: 'Divórcio', observacoes: 'Registro de divórcio' },
    { id: 5, codigo: 5, descricao: 'Escritura', observacoes: 'Escritura pública' },
    { id: 6, codigo: 6, descricao: 'Procuração', observacoes: 'Procuração pública' },
    { id: 7, codigo: 7, descricao: 'Reconhecimento de Firma', observacoes: 'Reconhecimento de assinatura' },
    { id: 8, codigo: 8, descricao: 'Autenticação', observacoes: 'Autenticação de documentos' }
  ]
}

export function TipoAtoPage({ onClose }: TipoAtoPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  
  // Cor do header: teal no light, laranja no dark
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'

  // Estado para o formulário
  const [codigo, setCodigo] = useState(0)
  const [descricao, setDescricao] = useState('')
  const [observacoes, setObservacoes] = useState('')
  
  // Estado para os dados cadastrados
  const [tiposAto, setTiposAto] = useState<TipoAto[]>([])
  
  // Estado para o item selecionado na grid
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Carregar dados ao montar o componente
  useEffect(() => {
    const tipos = loadTiposAto()
    setTiposAto(tipos)
    saveTiposAto(tipos) // Salva os padrões se não existirem
  }, [])

  // Função para criar novo registro
  const handleNovo = () => {
    setCodigo(0)
    setDescricao('')
    setObservacoes('')
    setSelectedId(null)
  }

  // Função para gravar registro
  const handleGravar = () => {
    if (!descricao.trim()) {
      alert('Por favor, preencha a descrição do tipo de ato.')
      return
    }

    let novosTipos: TipoAto[]

    if (selectedId !== null) {
      // Editar registro existente
      novosTipos = tiposAto.map(tipo => 
        tipo.id === selectedId 
          ? { ...tipo, descricao, observacoes }
          : tipo
      )
    } else {
      // Criar novo registro
      const novoCodigo = tiposAto.length > 0 ? Math.max(...tiposAto.map(t => t.codigo)) + 1 : 1
      const novoTipo: TipoAto = {
        id: Date.now(),
        codigo: novoCodigo,
        descricao,
        observacoes
      }
      novosTipos = [...tiposAto, novoTipo]
      setCodigo(novoCodigo)
    }

    setTiposAto(novosTipos)
    saveTiposAto(novosTipos)
    alert('Tipo de Ato gravado com sucesso!')
  }

  // Função para excluir registro
  const handleExcluir = () => {
    if (selectedId !== null) {
      if (confirm('Deseja realmente excluir este tipo de ato?')) {
        const novosTipos = tiposAto.filter(tipo => tipo.id !== selectedId)
        setTiposAto(novosTipos)
        saveTiposAto(novosTipos)
        handleNovo()
      }
    }
  }

  // Função para selecionar registro na grid
  const handleSelectRow = (tipo: TipoAto) => {
    setSelectedId(tipo.id)
    setCodigo(tipo.codigo)
    setDescricao(tipo.descricao)
    setObservacoes(tipo.observacoes)
  }

  // Estilos dos inputs
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
    <BasePage
      title="Cadastro de Tipo de Ato"
      onClose={onClose}
      width="700px"
      height="500px"
      minWidth="700px"
      minHeight="500px"
      resizable={false}
      headerColor={headerColor}
    >
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
                style={{
                  ...inputStyles,
                  backgroundColor: theme.border,
                  cursor: 'not-allowed'
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
              {tiposAto.map((tipo, index) => (
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
              ))}
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
          {/* Novo */}
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

          {/* Gravar */}
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

          {/* Excluir */}
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

          {/* Retornar */}
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
            ↩️ Retornar
          </button>
        </div>
      </div>
    </BasePage>
  )
}

