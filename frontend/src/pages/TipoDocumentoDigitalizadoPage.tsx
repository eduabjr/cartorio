import React, { useState } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'

interface TipoDocumento {
  id: number
  codigo: number
  tipoAto: string
  tipoDocumento: string
  descricaoDetalhada: string
}

interface TipoDocumentoDigitalizadoPageProps {
  onClose: () => void
}

export function TipoDocumentoDigitalizadoPage({ onClose }: TipoDocumentoDigitalizadoPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  
  // Cor do header: teal no light, laranja no dark
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'

  // Estado para o formulário
  const [codigo, setCodigo] = useState(0)
  const [tipoAto, setTipoAto] = useState('Casamento')
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [descricaoDetalhada, setDescricaoDetalhada] = useState('')
  
  // Estado para os dados cadastrados
  const [documentos, setDocumentos] = useState<TipoDocumento[]>([])
  
  // Estado para o item selecionado na grid
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Função para criar novo registro
  const handleNovo = () => {
    setCodigo(0)
    setTipoAto('Casamento')
    setTipoDocumento('')
    setDescricaoDetalhada('')
    setSelectedId(null)
  }

  // Função para gravar registro
  const handleGravar = () => {
    if (selectedId !== null) {
      // Editar registro existente
      setDocumentos(documentos.map(doc => 
        doc.id === selectedId 
          ? { ...doc, tipoAto, tipoDocumento, descricaoDetalhada }
          : doc
      ))
    } else {
      // Criar novo registro
      const novoCodigo = documentos.length > 0 ? Math.max(...documentos.map(d => d.codigo)) + 1 : 1
      const novoDoc: TipoDocumento = {
        id: Date.now(),
        codigo: novoCodigo,
        tipoAto,
        tipoDocumento,
        descricaoDetalhada
      }
      setDocumentos([...documentos, novoDoc])
      setCodigo(novoCodigo)
    }
  }

  // Função para excluir registro
  const handleExcluir = () => {
    if (selectedId !== null) {
      if (confirm('Deseja realmente excluir este registro?')) {
        setDocumentos(documentos.filter(doc => doc.id !== selectedId))
        handleNovo()
      }
    }
  }

  // Função para selecionar registro na grid
  const handleSelectRow = (doc: TipoDocumento) => {
    setSelectedId(doc.id)
    setCodigo(doc.codigo)
    setTipoAto(doc.tipoAto)
    setTipoDocumento(doc.tipoDocumento)
    setDescricaoDetalhada(doc.descricaoDetalhada)
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
      title="Cadastro de Tipo de Documento Digitalizado"
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
          {/* Linha 1: Código e Tipo do Ato */}
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

            {/* Tipo do Ato */}
            <div>
              <label style={labelStyles}>Tipo do Ato</label>
              <select
                value={tipoAto}
                onChange={(e) => setTipoAto(e.target.value)}
                style={inputStyles}
              >
                <option value="Casamento">Casamento</option>
                <option value="Nascimento">Nascimento</option>
                <option value="Óbito">Óbito</option>
                <option value="Divórcio">Divórcio</option>
                <option value="Escritura">Escritura</option>
                <option value="Procuração">Procuração</option>
                <option value="Reconhecimento de Firma">Reconhecimento de Firma</option>
                <option value="Autenticação">Autenticação</option>
              </select>
            </div>
          </div>

          {/* Linha 2: Tipo de Documento */}
          <div style={{ marginBottom: '8px' }}>
            <label style={labelStyles}>Tipo de Documento</label>
            <input
              type="text"
              value={tipoDocumento}
              onChange={(e) => setTipoDocumento(e.target.value)}
              style={inputStyles}
            />
          </div>

          {/* Linha 3: Descrição Detalhada */}
          <div>
            <label style={labelStyles}>Descrição Detalhada</label>
            <textarea
              value={descricaoDetalhada}
              onChange={(e) => setDescricaoDetalhada(e.target.value)}
              style={{
                ...inputStyles,
                height: 'auto',
                minHeight: '60px',
                maxHeight: '150px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
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
                  borderRight: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  Tipo do Ato
                </th>
                <th style={{
                  padding: '6px 8px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '11px'
                }}>
                  Tipo de Documento
                </th>
              </tr>
            </thead>
            <tbody>
              {documentos.map((doc, index) => (
                <tr
                  key={doc.id}
                  onClick={() => handleSelectRow(doc)}
                  style={{
                    backgroundColor: selectedId === doc.id 
                      ? '#3b82f6' 
                      : index % 2 === 0 
                        ? theme.surface 
                        : theme.background,
                    color: selectedId === doc.id ? 'white' : theme.text,
                    cursor: 'pointer',
                    borderBottom: `1px solid ${theme.border}`
                  }}
                  onMouseEnter={(e) => {
                    if (selectedId !== doc.id) {
                      e.currentTarget.style.backgroundColor = theme.border
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedId !== doc.id) {
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
                    {doc.tipoAto}
                  </td>
                  <td style={{
                    padding: '6px 8px'
                  }}>
                    {doc.tipoDocumento}
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
            ❌ Fechar
          </button>
        </div>
      </div>
    </BasePage>
  )
}

