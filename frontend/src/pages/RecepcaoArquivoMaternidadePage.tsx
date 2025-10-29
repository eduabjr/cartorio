import { useState } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'

interface RecepcaoArquivoMaternidadePageProps {
  onClose: () => void
}

interface Nascido {
  id: string
  transferido: boolean
  nome: string
}

export function RecepcaoArquivoMaternidadePage({ onClose }: RecepcaoArquivoMaternidadePageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
  
  const [caminhoArquivo, setCaminhoArquivo] = useState('')
  const [nascidos, setNascidos] = useState<Nascido[]>([])
  const [importingIndex, setImportingIndex] = useState<number | null>(null)

  const buttonStyles = {
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '600' as const,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }

  const handleSelecionarArquivo = async () => {
    try {
      // Simular seleção de arquivo (em produção, usaria window.electronAPI)
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      
      input.onchange = async (e: any) => {
        const file = e.target.files[0]
        if (file) {
          setCaminhoArquivo(file.path || file.name)
          
          // Importar automaticamente ao selecionar
          await processarArquivo(file)
        }
      }
      
      input.click()
    } catch (error) {
      console.error('Erro ao selecionar arquivo:', error)
    }
  }

  const processarArquivo = async (_file?: File) => {
    try {
      // Em produção, aqui seria feito o parse do JSON real
      // Por enquanto, simula a importação de dados
      
      const dadosSimulados: Nascido[] = [
        { id: '1', transferido: false, nome: 'MARIA CLARA SANTOS OLIVEIRA' },
        { id: '2', transferido: false, nome: 'JOÃO PEDRO SILVA COSTA' },
        { id: '3', transferido: false, nome: 'ANA JULIA RODRIGUES SOUZA' },
        { id: '4', transferido: false, nome: 'MIGUEL HENRIQUE ALVES LIMA' },
        { id: '5', transferido: false, nome: 'SOFIA GABRIELA FERREIRA PINTO' },
        { id: '6', transferido: false, nome: 'LUCAS MATHEUS PEREIRA SANTOS' },
        { id: '7', transferido: false, nome: 'VALENTINA ISABELLA MARTINS ROCHA' },
        { id: '8', transferido: false, nome: 'GABRIEL EDUARDO SOUSA MENDES' },
        { id: '9', transferido: false, nome: 'ALICE BEATRIZ CARVALHO DIAS' },
        { id: '10', transferido: false, nome: 'RAFAEL GUSTAVO ARAUJO BARBOSA' },
        { id: '11', transferido: false, nome: 'LAURA VITÓRIA RIBEIRO CARDOSO' },
        { id: '12', transferido: false, nome: 'DAVI LUCAS NASCIMENTO FREITAS' },
        { id: '13', transferido: false, nome: 'HELENA SOPHIA CAMPOS MELO' },
        { id: '14', transferido: false, nome: 'PEDRO HENRIQUE GOMES TEIXEIRA' },
        { id: '15', transferido: false, nome: 'ISABELA MARIA MONTEIRO VIEIRA' },
        { id: '16', transferido: false, nome: 'ARTHUR LORENZO CORREIA NUNES' },
        { id: '17', transferido: false, nome: 'MANUELA CECÍLIA DUARTE RAMOS' },
        { id: '18', transferido: false, nome: 'BERNARDO FELIPE MOREIRA Castro' },
        { id: '19', transferido: false, nome: 'MARIANA LETÍCIA BARROS AZEVEDO' },
        { id: '20', transferido: false, nome: 'ENZO GABRIEL LOPES FARIAS' }
      ]

      // Inicializar lista com todos desmarcados
      setNascidos(dadosSimulados)
      
      // Animar importação item por item
      for (let i = 0; i < dadosSimulados.length; i++) {
        setImportingIndex(i)
        await new Promise(resolve => setTimeout(resolve, 200)) // 200ms por item
        
        // Marcar item como transferido
        setNascidos(prev => prev.map((item, idx) => 
          idx === i ? { ...item, transferido: true } : item
        ))
      }
      
      setImportingIndex(null)
      console.log(`✅ Arquivo carregado com sucesso! ${dadosSimulados.length} registros encontrados.`)
    } catch (error) {
      console.error('Erro ao processar o arquivo JSON:', error)
      setImportingIndex(null)
    }
  }

  // Função não utilizada - importação automática ao selecionar arquivo
  /*const handleImportarArquivo = async () => {
    if (!caminhoArquivo) {
      console.log('⚠️ Nenhum arquivo selecionado.')
      return
    }

    // Processar arquivo novamente (caso o usuário clique manualmente)
    await processarArquivo()
  }*/

  const handleBaixarSelecionados = async () => {
    const selecionados = nascidos.filter(n => n.transferido)
    
    if (selecionados.length === 0) {
      console.log('⚠️ Nenhum registro selecionado para baixar.')
      return
    }

    console.log(`✅ Baixando ${selecionados.length} registro(s) selecionado(s):`)
    
    // Animar baixando cada item selecionado
    for (let i = 0; i < nascidos.length; i++) {
      // Só processar se estiver selecionado
      if (nascidos[i].transferido) {
        setImportingIndex(i)
        await new Promise(resolve => setTimeout(resolve, 300)) // 300ms por item
        console.log(`  - ${nascidos[i].nome}`)
      }
    }
    
    setImportingIndex(null)
    console.log('✅ Download concluído!')
  }

  const handleLimpar = () => {
    setNascidos([])
    setCaminhoArquivo('')
    console.log('✅ Dados limpos.')
  }

  const handleMarcarTodos = () => {
    setNascidos(prev => prev.map(n => ({ ...n, transferido: true })))
  }

  const handleDesmarcarTodos = () => {
    setNascidos(prev => prev.map(n => ({ ...n, transferido: false })))
  }

  const handleToggleTransferido = (id: string) => {
    setNascidos(prev => prev.map(n => 
      n.id === id ? { ...n, transferido: !n.transferido } : n
    ))
  }

  return (
    <BasePage
      title="Recepção de Arquivo da Maternidade"
      onClose={onClose}
      width="900px"
      height="650px"
      minWidth="900px"
      minHeight="650px"
      resizable={false}
      headerColor={headerColor}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '12px',
        gap: '12px'
      }}>
        {/* Caminho do Arquivo */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={caminhoArquivo}
            readOnly
            placeholder="Selecione um arquivo JSON da maternidade..."
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '12px',
              border: `1px solid ${theme.border}`,
              borderRadius: '4px',
              backgroundColor: theme.surface,
              color: theme.text,
              cursor: 'default'
            }}
          />
          <button
            onClick={handleSelecionarArquivo}
            style={{
              padding: '8px 12px',
              fontSize: '20px',
              backgroundColor: theme.surface,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            title="Selecionar arquivo"
          >
            📁
          </button>
        </div>

        {/* Área de dados */}
        <div style={{
          flex: 1,
          border: `1px solid ${theme.border}`,
          borderRadius: '4px',
          overflow: 'auto',
          backgroundColor: theme.surface,
          position: 'relative'
        }}>
          {nascidos.length === 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: theme.textSecondary,
              fontSize: '14px',
              fontStyle: 'italic'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '20px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }}>👶</div>
                <div>Nenhum arquivo importado</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                  Clique em "Importar Arquivo" para carregar os dados
                </div>
              </div>
            </div>
          ) : (
            <>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px'
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
                      padding: '10px',
                      textAlign: 'center',
                      fontWeight: '600',
                      fontSize: '12px',
                      borderRight: `1px solid rgba(255,255,255,0.2)`,
                      width: '50px'
                    }}>
                      
                    </th>
                    <th style={{
                      padding: '10px',
                      textAlign: 'center',
                      fontWeight: '600',
                      fontSize: '12px',
                      borderRight: `1px solid rgba(255,255,255,0.2)`,
                      width: '120px'
                    }}>
                      Transferido
                    </th>
                    <th style={{
                      padding: '10px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '12px'
                    }}>
                      Nascido_Nome
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {nascidos.map((nascido, index) => (
                    <tr
                      key={nascido.id}
                      style={{
                        backgroundColor: index % 2 === 0 ? theme.surface : theme.background,
                        borderBottom: `1px solid ${theme.border}`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.border
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 
                          ? theme.surface 
                          : theme.background
                      }}
                    >
                      <td style={{
                        padding: '8px',
                        textAlign: 'center',
                        borderRight: `1px solid ${theme.border}`
                      }}>
                        {importingIndex === index && (
                          <div style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: headerColor,
                            animation: 'pulse 0.5s ease-in-out infinite'
                          }}>
                            ➡️
                          </div>
                        )}
                      </td>
                      <td style={{
                        padding: '8px',
                        textAlign: 'center',
                        borderRight: `1px solid ${theme.border}`
                      }}>
                        <input
                          type="checkbox"
                          checked={nascido.transferido}
                          onChange={() => handleToggleTransferido(nascido.id)}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            accentColor: '#10b981'
                          }}
                        />
                      </td>
                      <td style={{
                        padding: '8px',
                        color: theme.text
                      }}>
                        {nascido.nome}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Botões de Marcar/Desmarcar */}
        {nascidos.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center'
          }}>
            <button
              onClick={handleMarcarTodos}
              style={{
                padding: '6px 16px',
                fontSize: '11px',
                fontWeight: '600',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#059669'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981'
              }}
            >
              ✓ Marcar Todos
            </button>

            <button
              onClick={handleDesmarcarTodos}
              style={{
                padding: '6px 16px',
                fontSize: '11px',
                fontWeight: '600',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ef4444'
              }}
            >
              ✗ Desmarcar Todos
            </button>
          </div>
        )}

        {/* Botões de Ação com Contador */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: '4px',
          borderTop: `1px solid ${theme.border}`,
          position: 'relative'
        }}>
          <button
            onClick={handleLimpar}
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
            🧹 Limpar
          </button>

          <button
            onClick={nascidos.length > 0 ? handleBaixarSelecionados : handleSelecionarArquivo}
            style={{
              ...buttonStyles,
              backgroundColor: theme.primary,
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            {nascidos.length > 0 ? '⬇️ Baixar Selecionados' : '📂 Importar Arquivo'}
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

          {/* Contador de registros */}
          {nascidos.length > 0 && (
            <div style={{
              position: 'absolute',
              right: '0',
              padding: '6px 12px',
              backgroundColor: theme.background,
              border: `1px solid ${theme.border}`,
              borderRadius: '4px',
              fontSize: '12px',
              color: theme.text,
              fontWeight: '600'
            }}>
              Registros: {nascidos.length} | Selecionados: {nascidos.filter(n => n.transferido).length}
            </div>
          )}
        </div>
      </div>
    </BasePage>
  )
}

