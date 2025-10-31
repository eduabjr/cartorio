import { useState } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'

interface RecepcaoArquivoFunerariaPageProps {
  onClose: () => void
  hideHeader?: boolean
}

interface Falecido {
  id: string
  transferido: boolean
  nome: string
}

export function RecepcaoArquivoFunerariaPage({ onClose, hideHeader = false }: RecepcaoArquivoFunerariaPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
  
  const [caminhoArquivo, setCaminhoArquivo] = useState('')
  const [falecidos, setFalecidos] = useState<Falecido[]>([])
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
      input.accept = '.xml'
      
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
      // Em produção, aqui seria feito o parse do XML real
      // Por enquanto, simula a importação de dados
      
      const dadosSimulados: Falecido[] = [
        { id: '1', transferido: false, nome: 'JOSÉ MARCIANO DA COSTA' },
        { id: '2', transferido: false, nome: 'IRACEMA LEITE CAETANO' },
        { id: '3', transferido: false, nome: 'ACCACIO DA SILVA PEDRO' },
        { id: '4', transferido: false, nome: 'FRANCISCO BATISTA DO BONFIM' },
        { id: '5', transferido: false, nome: 'LAERCIO ROMANINI' },
        { id: '6', transferido: false, nome: 'VERA LUCIA DA SILVA DOS SANTOS' },
        { id: '7', transferido: false, nome: 'NEUSA SHIDUYO HORIKAWA MATSUMOTO' },
        { id: '8', transferido: false, nome: 'EDNA TEIXEIRA NANCI' },
        { id: '9', transferido: false, nome: 'ADELSON HELIO FERREIRA DA SILVA' },
        { id: '10', transferido: false, nome: 'JOSÉ SYLVERIO DE ALMEIDA' },
        { id: '11', transferido: false, nome: 'DÉBORA HIROMI FUJII' },
        { id: '12', transferido: false, nome: 'MARIA DE LOURDES DA SILVA' },
        { id: '13', transferido: false, nome: 'ANTONIO CARLOS MOREIRA' },
        { id: '14', transferido: false, nome: 'SEBASTIÃO RODRIGUES FILHO' },
        { id: '15', transferido: false, nome: 'MARIA APARECIDA SANTOS' },
        { id: '16', transferido: false, nome: 'PEDRO HENRIQUE OLIVEIRA' }
      ]

      // Inicializar lista com todos desmarcados
      setFalecidos(dadosSimulados)
      
      // Animar importação item por item
      for (let i = 0; i < dadosSimulados.length; i++) {
        setImportingIndex(i)
        await new Promise(resolve => setTimeout(resolve, 200)) // 200ms por item
        
        // Marcar item como transferido
        setFalecidos(prev => prev.map((item, idx) => 
          idx === i ? { ...item, transferido: true } : item
        ))
      }
      
      setImportingIndex(null)
      console.log(`✅ Arquivo carregado com sucesso! ${dadosSimulados.length} registros encontrados.`)
    } catch (error) {
      console.error('Erro ao processar o arquivo XML:', error)
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
    const selecionados = falecidos.filter(f => f.transferido)
    
    if (selecionados.length === 0) {
      console.log('⚠️ Nenhum registro selecionado para baixar.')
      return
    }

    console.log(`✅ Baixando ${selecionados.length} registro(s) selecionado(s):`)
    
    // Animar baixando cada item selecionado
    for (let i = 0; i < falecidos.length; i++) {
      // Só processar se estiver selecionado
      if (falecidos[i].transferido) {
        setImportingIndex(i)
        await new Promise(resolve => setTimeout(resolve, 300)) // 300ms por item
        console.log(`  - ${falecidos[i].nome}`)
      }
    }
    
    setImportingIndex(null)
    console.log('✅ Download concluído!')
  }

  const handleLimpar = () => {
    setFalecidos([])
    setCaminhoArquivo('')
    console.log('✅ Dados limpos.')
  }

  const handleMarcarTodos = () => {
    setFalecidos(prev => prev.map(f => ({ ...f, transferido: true })))
  }

  const handleDesmarcarTodos = () => {
    setFalecidos(prev => prev.map(f => ({ ...f, transferido: false })))
  }

  const handleToggleTransferido = (id: string) => {
    setFalecidos(prev => prev.map(f => 
      f.id === id ? { ...f, transferido: !f.transferido } : f
    ))
  }

  const conteudo = (
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
            placeholder="Selecione um arquivo XML da funerária..."
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
          {falecidos.length === 0 ? (
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
                <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }}>⚰️</div>
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
                      Falecido_Nome
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {falecidos.map((falecido, index) => (
                    <tr
                      key={falecido.id}
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
                          checked={falecido.transferido}
                          onChange={() => handleToggleTransferido(falecido.id)}
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
                        {falecido.nome}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Botões de Marcar/Desmarcar */}
        {falecidos.length > 0 && (
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
            onClick={falecidos.length > 0 ? handleBaixarSelecionados : handleSelecionarArquivo}
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
            {falecidos.length > 0 ? '⬇️ Baixar Selecionados' : '📂 Importar Arquivo'}
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
          {falecidos.length > 0 && (
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
              Registros: {falecidos.length} | Selecionados: {falecidos.filter(f => f.transferido).length}
            </div>
          )}
        </div>
      </div>
  )

  if (hideHeader) {
    return conteudo
  }

  return (
    <BasePage
      title="Recepção de Arquivo da Funerária"
      onClose={onClose}
      width="900px"
      height="650px"
      minWidth="900px"
      minHeight="650px"
      resizable={false}
      headerColor={headerColor}
    >
      {conteudo}
    </BasePage>
  )
}

