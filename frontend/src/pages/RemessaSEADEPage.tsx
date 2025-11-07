import React, { useState } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { useModal } from '../hooks/useModal'

interface RemessaSEADEPageProps {
  onClose: () => void
}

interface RegistroRemessa {
  id: string
  processo: string
  livro: string
  termo: string
  data: string
  dataTermo: string
  estadoCivilNoivo: string
  nomeNoivo: string
  nomeNoiva: string
  idadeNoivo: string
  nascimentoNoivo: string
  profissaoNoivo: string
  naturalidadeNoivo: string
  temImagem: boolean
}

export function RemessaSEADEPage({ onClose }: RemessaSEADEPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const modal = useModal()
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
  
  const [mesAno, setMesAno] = useState('')
  const [tipoSelecionado, setTipoSelecionado] = useState<'casamento-civil' | 'casamento-religioso' | 'nascimento' | 'obito' | 'obito-fetal'>('casamento-civil')
  const [registros, setRegistros] = useState<RegistroRemessa[]>([])
  const [registrosSemImagem, setRegistrosSemImagem] = useState<string[]>([])
  
  const handlePesquisar = () => {
    // Implementar lógica de pesquisa
    console.log('Pesquisando...', { mesAno, tipoSelecionado })
    modal.showInfo('Função de pesquisa será implementada.')
  }
  
  const handleLimpar = () => {
    setMesAno('')
    setRegistros([])
    setRegistrosSemImagem([])
  }
  
  const handleGerarArquivo = () => {
    if (registros.length === 0) {
      modal.showWarning('Nenhum registro para gerar arquivo.')
      return
    }
    // Implementar geração de arquivo
    console.log('Gerando arquivo...')
    modal.showSuccess('Arquivo gerado com sucesso!')
  }
  
  const handleEnviarDisquete = () => {
    if (registros.length === 0) {
      modal.showWarning('Nenhum registro para enviar.')
      return
    }
    // Implementar envio
    console.log('Enviando ao disquete...')
    modal.showSuccess('Dados enviados com sucesso!')
  }
  
  // Estilos
  const groupBoxStyles: React.CSSProperties = {
    border: `2px solid ${theme.border}`,
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: theme.surface
  }
  
  const labelStyles: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: '600',
    color: theme.text,
    marginBottom: '8px',
    display: 'block'
  }
  
  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    border: `1px solid ${theme.border}`,
    borderRadius: '6px',
    backgroundColor: theme.background,
    color: theme.text
  }
  
  const radioLabelStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: theme.text,
    cursor: 'pointer'
  }
  
  const buttonStyles: React.CSSProperties = {
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  }
  
  const totalRegistros = registros.length
  const totalImagensEncontradas = registros.filter(r => r.temImagem).length
  
  return (
    <BasePage
      title="Remessa SEADE"
      onClose={onClose}
      theme={theme}
      headerColor={headerColor}
      width="1200px"
      height="700px"
      minWidth="1200px"
      minHeight="700px"
      resizable={false}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        height: '100%',
        overflow: 'auto'
      }}>
        {/* Seção de Filtros */}
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Período */}
          <div style={{ ...groupBoxStyles, width: '280px' }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '700',
              color: theme.text,
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: `1px solid ${theme.border}`
            }}>
              📅 Período
            </div>
            <div>
              <label style={labelStyles}>Mês/Ano</label>
              <input
                type="text"
                value={mesAno}
                onChange={(e) => {
                  let valor = e.target.value.replace(/\D/g, '')
                  if (valor.length <= 6) {
                    // Formatar: MM/AAAA
                    if (valor.length > 2) {
                      valor = valor.replace(/^(\d{2})(\d{0,4})/, '$1/$2')
                    }
                    setMesAno(valor)
                  }
                }}
                placeholder="MM/AAAA"
                maxLength={7}
                style={{
                  ...inputStyles,
                  width: '140px',
                  textAlign: 'center',
                  fontWeight: '600'
                }}
              />
            </div>
          </div>
          
          {/* Tipo */}
          <div style={{ ...groupBoxStyles, flex: 2 }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '700',
              color: theme.text,
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: `1px solid ${theme.border}`
            }}>
              📋 Tipo
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 24px', alignItems: 'center' }}>
              <label style={radioLabelStyles}>
                <input
                  type="radio"
                  checked={tipoSelecionado === 'casamento-civil'}
                  onChange={() => setTipoSelecionado('casamento-civil')}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span>Cas. Civil</span>
              </label>
              <label style={radioLabelStyles}>
                <input
                  type="radio"
                  checked={tipoSelecionado === 'casamento-religioso'}
                  onChange={() => setTipoSelecionado('casamento-religioso')}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span>Cas. Religioso</span>
              </label>
              <label style={radioLabelStyles}>
                <input
                  type="radio"
                  checked={tipoSelecionado === 'nascimento'}
                  onChange={() => setTipoSelecionado('nascimento')}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span>Nascimento</span>
              </label>
              <label style={radioLabelStyles}>
                <input
                  type="radio"
                  checked={tipoSelecionado === 'obito'}
                  onChange={() => setTipoSelecionado('obito')}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span>Óbitos</span>
              </label>
              <label style={radioLabelStyles}>
                <input
                  type="radio"
                  checked={tipoSelecionado === 'obito-fetal'}
                  onChange={() => setTipoSelecionado('obito-fetal')}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span>Óbitos Fetais</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Seção de Dados */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '0' }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '700',
            color: theme.text,
            marginBottom: '12px'
          }}>
            📊 Dados a serem enviados
          </div>
          
          {/* Grid de Dados */}
          <div style={{
            flex: 1,
            border: `2px solid ${theme.border}`,
            borderRadius: '8px',
            backgroundColor: theme.surface,
            overflow: 'auto'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: theme.background,
                  borderBottom: `2px solid ${theme.border}`,
                  position: 'sticky',
                  top: 0,
                  zIndex: 1
                }}>
                  <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '700', color: theme.text, textAlign: 'left', borderRight: `1px solid ${theme.border}`, minWidth: '100px' }}>Processo</th>
                  <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '700', color: theme.text, textAlign: 'left', borderRight: `1px solid ${theme.border}`, minWidth: '80px' }}>Livro</th>
                  <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '700', color: theme.text, textAlign: 'left', borderRight: `1px solid ${theme.border}`, minWidth: '80px' }}>Termo</th>
                  <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '700', color: theme.text, textAlign: 'left', borderRight: `1px solid ${theme.border}`, minWidth: '100px' }}>Data</th>
                  <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '700', color: theme.text, textAlign: 'left', borderRight: `1px solid ${theme.border}`, minWidth: '100px' }}>Data Termo</th>
                  <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '700', color: theme.text, textAlign: 'left', borderRight: `1px solid ${theme.border}`, minWidth: '120px' }}>Estado Civil_No</th>
                  <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '700', color: theme.text, textAlign: 'left', borderRight: `1px solid ${theme.border}`, minWidth: '200px' }}>Nome_Noivo</th>
                  <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '700', color: theme.text, textAlign: 'left', borderRight: `1px solid ${theme.border}`, minWidth: '200px' }}>Nome_Noiva</th>
                  <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '700', color: theme.text, textAlign: 'left', borderRight: `1px solid ${theme.border}`, minWidth: '80px' }}>Idade_Noivo</th>
                  <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '700', color: theme.text, textAlign: 'left', borderRight: `1px solid ${theme.border}`, minWidth: '150px' }}>Nascimento_Noivo</th>
                  <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '700', color: theme.text, textAlign: 'left', borderRight: `1px solid ${theme.border}`, minWidth: '150px' }}>Profissão_Noivo</th>
                  <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '700', color: theme.text, textAlign: 'left', minWidth: '150px' }}>Naturalidade_Noivo</th>
                </tr>
              </thead>
              <tbody>
                {registros.length === 0 ? (
                  <tr>
                    <td colSpan={12} style={{
                      padding: '40px',
                      textAlign: 'center',
                      fontSize: '14px',
                      color: theme.textSecondary
                    }}>
                      Nenhum registro encontrado. Use os filtros acima e clique em "Pesquisar".
                    </td>
                  </tr>
                ) : (
                  registros.map((registro, index) => (
                    <tr
                      key={registro.id}
                      style={{
                        backgroundColor: index % 2 === 0 ? theme.surface : theme.background,
                        borderBottom: `1px solid ${theme.border}`
                      }}
                    >
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: theme.text, borderRight: `1px solid ${theme.border}` }}>{registro.processo}</td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: theme.text, borderRight: `1px solid ${theme.border}` }}>{registro.livro}</td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: theme.text, borderRight: `1px solid ${theme.border}` }}>{registro.termo}</td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: theme.text, borderRight: `1px solid ${theme.border}` }}>{registro.data}</td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: theme.text, borderRight: `1px solid ${theme.border}` }}>{registro.dataTermo}</td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: theme.text, borderRight: `1px solid ${theme.border}` }}>{registro.estadoCivilNoivo}</td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: theme.text, borderRight: `1px solid ${theme.border}` }}>{registro.nomeNoivo}</td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: theme.text, borderRight: `1px solid ${theme.border}` }}>{registro.nomeNoiva}</td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: theme.text, borderRight: `1px solid ${theme.border}` }}>{registro.idadeNoivo}</td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: theme.text, borderRight: `1px solid ${theme.border}` }}>{registro.nascimentoNoivo}</td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: theme.text, borderRight: `1px solid ${theme.border}` }}>{registro.profissaoNoivo}</td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: theme.text }}>{registro.naturalidadeNoivo}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Seção de Status e Botões */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          paddingTop: '12px',
          borderTop: `2px solid ${theme.border}`
        }}>
          {/* Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{
              fontSize: '12px',
              color: '#ef4444',
              fontWeight: '600'
            }}>
              {registrosSemImagem.length > 0 && (
                <>⚠️ Registros que não foi possível encontrar a imagem: {registrosSemImagem.length}</>
              )}
            </div>
            <div style={{
              fontSize: '13px',
              fontWeight: '700',
              color: registros.length === 0 ? '#ef4444' : theme.text
            }}>
              Total de Registros / Imagens: <span style={{ color: registros.length === 0 ? '#ef4444' : headerColor }}>{totalRegistros.toString().padStart(3, '0')} / {totalImagensEncontradas.toString().padStart(3, '0')}</span>
            </div>
          </div>
          
          {/* Botões de Ação */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
          }}>
            <button
              onClick={handlePesquisar}
              style={{
                ...buttonStyles,
                backgroundColor: '#3b82f6',
                color: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              🔍 Pesquisar
            </button>
            
            <button
              onClick={handleLimpar}
              style={{
                ...buttonStyles,
                backgroundColor: '#f59e0b',
                color: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
            >
              🧹 Limpar
            </button>
            
            <button
              onClick={handleGerarArquivo}
              style={{
                ...buttonStyles,
                backgroundColor: '#10b981',
                color: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
            >
              📄 Gerar Arquivo
            </button>
            
            <button
              onClick={handleEnviarDisquete}
              style={{
                ...buttonStyles,
                backgroundColor: '#8b5cf6',
                color: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
            >
              💾 Enviar ao Disquete
            </button>
            
            <button
              onClick={onClose}
              style={{
                ...buttonStyles,
                backgroundColor: '#6c757d',
                color: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
            >
              🚪 Retornar
            </button>
          </div>
        </div>
      </div>
    </BasePage>
  )
}

