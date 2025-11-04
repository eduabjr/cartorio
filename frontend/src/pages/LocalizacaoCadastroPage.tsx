import { useState, useEffect } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { cidadesData } from '../data/cidades'
import { paisesData } from '../data/paises'
import { useModal } from '../hooks/useModal'

interface LocalizacaoCadastroPageProps {
  onClose: () => void
}

interface Cidade {
  id: string
  codigo: string
  nome: string
  uf: string
  numeroIBGE: string
}

interface Pais {
  id: string
  codigo: string
  nome: string
  sigla: string
  numeroIBGE: string
  nacionalidadeMasculino: string
  nacionalidadeFeminino: string
}

export function LocalizacaoCadastroPage({ onClose }: LocalizacaoCadastroPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const modal = useModal()
  
  const [activeTab, setActiveTab] = useState<'cidade' | 'pais'>('cidade')
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
  
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
    <>
    <BasePage
      title="Cadastro de Localização"
      onClose={onClose}
      width="900px"
      height="600px"
      minWidth="900px"
      minHeight="600px"
      resizable={false}
      headerColor={headerColor}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '8px'
      }}>
        {/* Abas com botão de importação */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px' 
        }}>
          <div style={{ display: 'flex', gap: '0px' }}>
            <button
              onClick={() => setActiveTab('cidade')}
              style={tabStyles(activeTab === 'cidade')}
              onMouseEnter={(e) => {
                if (activeTab !== 'cidade') {
                  e.currentTarget.style.backgroundColor = theme.border
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'cidade') {
                  e.currentTarget.style.backgroundColor = theme.surface
                }
              }}
            >
              Cidade (IBGE)
            </button>
            <button
              onClick={() => setActiveTab('pais')}
              style={tabStyles(activeTab === 'pais')}
              onMouseEnter={(e) => {
                if (activeTab !== 'pais') {
                  e.currentTarget.style.backgroundColor = theme.border
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'pais') {
                  e.currentTarget.style.backgroundColor = theme.surface
                }
              }}
            >
              País
            </button>
          </div>

          {/* Botão de Importação */}
          <button
            onClick={() => {
              if (activeTab === 'cidade') {
                // Importar cidades
                window.dispatchEvent(new CustomEvent('importar-cidades'))
              } else {
                // Importar países
                window.dispatchEvent(new CustomEvent('importar-paises'))
              }
            }}
            style={{
              ...buttonStyles,
              backgroundColor: theme.primary,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
            title={`Importar dados pré-cadastrados de ${activeTab === 'cidade' ? 'cidades' : 'países'}`}
          >
            📥 Importar Dados
          </button>
        </div>

        {/* Conteúdo da aba ativa */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activeTab === 'cidade' ? (
            <CidadeContent onClose={onClose} />
          ) : (
            <PaisContent onClose={onClose} />
          )}
        </div>
      </div>
      
      {/* Modal Component - DENTRO da janela */}
      <modal.ModalComponent />
    </BasePage>
    </>
  )
}

// Conteúdo de Cidade
function CidadeContent({ onClose }: { onClose: () => void }) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const modal = useModal()

  // Carregar dados do localStorage na inicialização
  const [cidades, setCidades] = useState<Cidade[]>(() => {
    const saved = localStorage.getItem('cidades-cadastradas')
    return saved ? JSON.parse(saved) : []
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [codigo, setCodigo] = useState('0')
  const [nome, setNome] = useState('')
  const [uf, setUf] = useState('')
  const [numeroIBGE, setNumeroIBGE] = useState('')
  const [termoBusca, setTermoBusca] = useState('')

  // Salvar no localStorage sempre que cidades mudar
  useEffect(() => {
    localStorage.setItem('cidades-cadastradas', JSON.stringify(cidades))
  }, [cidades])

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
    setNome('')
    setUf('')
    setNumeroIBGE('')
  }

  const handleGravar = () => {
    if (!nome.trim() || !uf.trim() || !numeroIBGE.trim()) {
      console.log('⚠️ Por favor, preencha todos os campos obrigatórios (Nome, UF e Número IBGE).')
      return
    }

    if (selectedId) {
      setCidades(prev => prev.map(c => 
        c.id === selectedId 
          ? { ...c, nome, uf, numeroIBGE }
          : c
      ))
      console.log('✅ Cidade atualizada!')
    } else {
      // Gerar código sequencial
      const ultimoCodigo = localStorage.getItem('ultimoCodigoCidade')
      const proximoCodigo = ultimoCodigo ? parseInt(ultimoCodigo) + 1 : 1
      
      const novoCodigo = proximoCodigo.toString().padStart(3, '0')
      localStorage.setItem('ultimoCodigoCidade', proximoCodigo.toString())
      
      const novaCidade: Cidade = {
        id: Date.now().toString(),
        codigo: novoCodigo,
        nome,
        uf,
        numeroIBGE
      }
      setCidades(prev => [...prev, novaCidade])
      console.log('✅ Cidade cadastrada! Código:', novoCodigo)
    }
    handleNovo()
  }

  const handleExcluir = () => {
    if (selectedId) {
      setCidades(prev => prev.filter(c => c.id !== selectedId))
      handleNovo()
      console.log('✅ Cidade excluída.')
    }
  }

  const handleSelectRow = (cidade: Cidade) => {
    setSelectedId(cidade.id)
    setCodigo(cidade.codigo)
    setNome(cidade.nome)
    setUf(cidade.uf)
    setNumeroIBGE(cidade.numeroIBGE)
  }

  const handleImportar = async () => {
    const opcao = await modal.confirm(
      `ESCOLHA O TIPO DE IMPORTAÇÃO:\n\n` +
      `✅ OK = Importar TODAS as 5.570 cidades do Brasil (demora ~10 segundos)\n` +
      `❌ CANCELAR = Importar apenas ${cidadesData.length} principais cidades (instantâneo)`
    )

    if (opcao === true) {
      // Importação COMPLETA via API do IBGE
      const confirmadoIBGE = await modal.confirm('IMPORTAÇÃO COMPLETA\n\nSerão buscados TODOS os 5.570 municípios brasileiros da base oficial do IBGE.\n\nIsso pode demorar alguns segundos. Deseja continuar?', 'Importar do IBGE', '⚠️')
      if (confirmadoIBGE) {
        try {
          await modal.alert('Buscando dados do IBGE... Aguarde alguns segundos.', 'Processando', '🔄')
          const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios')
          
          if (!response.ok) {
            throw new Error('Erro ao buscar dados do IBGE')
          }
          
          const municipios = await response.json()
          console.log('📊 Municípios recebidos:', municipios.length)
          
          const cidadesCompletas: Cidade[] = municipios
            .filter((m: any) => m && m.nome && m.microrregiao?.mesorregiao?.UF?.sigla) // Filtrar dados inválidos
            .map((m: any, index: number) => ({
              id: Date.now().toString() + index + Math.random().toString(),
              codigo: (index + 1).toString().padStart(4, '0'),
              nome: m.nome,
              uf: m.microrregiao.mesorregiao.UF.sigla,
              numeroIBGE: m.id.toString()
            }))
          
          console.log('✅ Cidades processadas:', cidadesCompletas.length)
          
          setCidades(prev => {
            const codigosExistentes = new Set(prev.map(c => c.numeroIBGE))
            const novasCidades = cidadesCompletas.filter(c => !codigosExistentes.has(c.numeroIBGE))
            console.log('➕ Novas cidades a adicionar:', novasCidades.length)
            return [...prev, ...novasCidades]
          })
          
          await modal.alert(`IMPORTAÇÃO COMPLETA CONCLUÍDA!\n\n${municipios.length} municípios foram cadastrados com sucesso!`, 'Sucesso', '✅')
        } catch (error) {
          console.error('❌ Erro na importação:', error)
          await modal.alert(`Erro ao importar dados do IBGE.\n\nVerifique sua conexão com a internet e tente novamente.\n\nErro: ${error}`, 'Erro', '❌')
        }
      }
    } else if (opcao === false) {
      // Importação RÁPIDA (146 principais)
      console.log('📥 Iniciando importação rápida de', cidadesData.length, 'cidades')
      
      const cidadesImportadas: Cidade[] = cidadesData.map((cidade, index) => ({
        id: Date.now().toString() + index + Math.random().toString(),
        codigo: cidade.codigo,
        nome: cidade.nome,
        uf: cidade.uf,
        numeroIBGE: cidade.numeroIBGE
      }))
      
      console.log('✅ Cidades preparadas:', cidadesImportadas.length)
      
      setCidades(prev => {
        const codigosExistentes = new Set(prev.map(c => c.numeroIBGE))
        const novasCidades = cidadesImportadas.filter(c => !codigosExistentes.has(c.numeroIBGE))
        console.log('➕ Novas cidades a adicionar:', novasCidades.length)
        return [...prev, ...novasCidades]
      })
      
      await modal.alert(`Importação concluída!\n\n${cidadesData.length} cidades foram cadastradas com sucesso!`, 'Sucesso', '✅')
    }
  }

  // Listener para evento de importação
  useEffect(() => {
    const handleImportEvent = () => handleImportar()
    window.addEventListener('importar-cidades', handleImportEvent)
    return () => window.removeEventListener('importar-cidades', handleImportEvent)
  }, [])

  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  // Filtrar cidades com base no termo de busca
  const cidadesFiltradas = cidades.filter(cidade => {
    if (!termoBusca.trim()) return true
    const termo = termoBusca.toLowerCase()
    return (
      cidade.nome.toLowerCase().includes(termo) ||
      cidade.uf.toLowerCase().includes(termo) ||
      cidade.numeroIBGE.includes(termo) ||
      cidade.codigo.includes(termo)
    )
  })

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      gap: '8px'
    }}>
      {/* Formulário */}
      <div style={{
        border: `1px solid ${theme.border}`,
        borderRadius: '4px',
        padding: '8px',
        backgroundColor: theme.surface
      }}>
        {/* Linha 1: Código e Nome da Cidade */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '100px 1fr 100px',
          gap: '8px',
          marginBottom: '8px'
        }}>
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

          <div>
            <label style={labelStyles}>Nome da Cidade</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={inputStyles}
              placeholder="Nome da cidade..."
              maxLength={100}
            />
          </div>

          <div>
            <label style={labelStyles}>UF</label>
            <select
              value={uf}
              onChange={(e) => setUf(e.target.value)}
              style={{
                ...inputStyles,
                cursor: 'pointer'
              }}
            >
              <option value="">Selecione...</option>
              {ufs.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Linha 2: Número IBGE */}
        <div style={{ marginBottom: '8px' }}>
          <label style={labelStyles}>Número IBGE</label>
          <input
            type="text"
            value={numeroIBGE}
            onChange={(e) => setNumeroIBGE(e.target.value)}
            style={inputStyles}
            placeholder="Número IBGE..."
            maxLength={20}
          />
        </div>
      </div>

      {/* Campo de Busca */}
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        padding: '8px',
        border: `1px solid ${theme.border}`,
        borderRadius: '4px',
        backgroundColor: theme.surface
      }}>
        <span style={{ fontSize: '16px' }}>🔍</span>
        <input
          type="text"
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          placeholder="Buscar por nome, UF, código IBGE..."
          style={{
            ...inputStyles,
            flex: 1,
            margin: 0
          }}
        />
        {termoBusca && (
          <button
            onClick={() => setTermoBusca('')}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              backgroundColor: theme.border,
              color: theme.text,
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
            title="Limpar busca"
          >
            ✕
          </button>
        )}
        <span style={{ 
          fontSize: '11px', 
          color: theme.textSecondary,
          whiteSpace: 'nowrap'
        }}>
          {cidadesFiltradas.length} de {cidades.length}
        </span>
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
                borderRight: `1px solid rgba(255,255,255,0.2)`
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
                Nome da Cidade
              </th>
              <th style={{
                padding: '6px 8px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '11px',
                borderRight: `1px solid rgba(255,255,255,0.2)`
              }}>
                UF
              </th>
              <th style={{
                padding: '6px 8px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '11px'
              }}>
                Número IBGE
              </th>
            </tr>
          </thead>
          <tbody>
            {cidadesFiltradas.length === 0 ? (
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
                    <span style={{ fontSize: '20px', opacity: 0.5 }}>🏙️</span>
                    <span>{termoBusca ? 'Nenhuma cidade encontrada com este termo' : 'Nenhuma cidade cadastrada'}</span>
                  </div>
                </td>
              </tr>
            ) : (
              cidadesFiltradas.map((cidade, index) => (
                <tr
                  key={cidade.id}
                  onClick={() => handleSelectRow(cidade)}
                  style={{
                    backgroundColor: selectedId === cidade.id 
                      ? '#3b82f6' 
                      : index % 2 === 0 
                        ? theme.surface 
                        : theme.background,
                    color: selectedId === cidade.id ? 'white' : theme.text,
                    cursor: 'pointer',
                    borderBottom: `1px solid ${theme.border}`
                  }}
                  onMouseEnter={(e) => {
                    if (selectedId !== cidade.id) {
                      e.currentTarget.style.backgroundColor = theme.border
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedId !== cidade.id) {
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
                    {cidade.codigo}
                  </td>
                  <td style={{
                    padding: '6px 8px',
                    borderRight: `1px solid ${theme.border}`
                  }}>
                    {cidade.nome}
                  </td>
                  <td style={{
                    padding: '6px 8px',
                    borderRight: `1px solid ${theme.border}`
                  }}>
                    {cidade.uf}
                  </td>
                  <td style={{
                    padding: '6px 8px'
                  }}>
                    {cidade.numeroIBGE}
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

// Conteúdo de País
function PaisContent({ onClose }: { onClose: () => void }) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const modal = useModal()

  // Carregar dados do localStorage na inicialização
  const [paises, setPaises] = useState<Pais[]>(() => {
    const saved = localStorage.getItem('paises-cadastrados')
    return saved ? JSON.parse(saved) : []
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [codigo, setCodigo] = useState('0')
  const [nome, setNome] = useState('')
  const [sigla, setSigla] = useState('')
  const [numeroIBGE, setNumeroIBGE] = useState('')
  const [nacionalidadeMasculino, setNacionalidadeMasculino] = useState('')
  const [nacionalidadeFeminino, setNacionalidadeFeminino] = useState('')
  const [termoBusca, setTermoBusca] = useState('')

  // Salvar no localStorage sempre que paises mudar
  useEffect(() => {
    localStorage.setItem('paises-cadastrados', JSON.stringify(paises))
  }, [paises])

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
    setNome('')
    setSigla('')
    setNumeroIBGE('')
    setNacionalidadeMasculino('')
    setNacionalidadeFeminino('')
  }

  const handleGravar = () => {
    if (!nome.trim() || !sigla.trim()) {
      console.log('⚠️ Por favor, preencha os campos obrigatórios (Nome do País e Sigla).')
      return
    }

    if (selectedId) {
      setPaises(prev => prev.map(p => 
        p.id === selectedId 
          ? { ...p, nome, sigla, numeroIBGE, nacionalidadeMasculino, nacionalidadeFeminino }
          : p
      ))
      console.log('✅ País atualizado!')
    } else {
      // Gerar código sequencial
      const ultimoCodigo = localStorage.getItem('ultimoCodigoPais')
      const proximoCodigo = ultimoCodigo ? parseInt(ultimoCodigo) + 1 : 1
      
      const novoCodigo = proximoCodigo.toString().padStart(3, '0')
      localStorage.setItem('ultimoCodigoPais', proximoCodigo.toString())
      
      const novoPais: Pais = {
        id: Date.now().toString(),
        codigo: novoCodigo,
        nome,
        sigla,
        numeroIBGE,
        nacionalidadeMasculino,
        nacionalidadeFeminino
      }
      setPaises(prev => [...prev, novoPais])
      console.log('✅ País cadastrado! Código:', novoCodigo)
    }
    handleNovo()
  }

  const handleExcluir = () => {
    if (selectedId) {
      setPaises(prev => prev.filter(p => p.id !== selectedId))
      handleNovo()
      console.log('✅ País excluído.')
    }
  }

  const handleSelectRow = (pais: Pais) => {
    setSelectedId(pais.id)
    setCodigo(pais.codigo)
    setNome(pais.nome)
    setSigla(pais.sigla)
    setNumeroIBGE(pais.numeroIBGE)
    setNacionalidadeMasculino(pais.nacionalidadeMasculino)
    setNacionalidadeFeminino(pais.nacionalidadeFeminino)
  }

  const handleImportar = async () => {
    const confirmadoPaises = await modal.confirm(`Deseja importar ${paisesData.length} países pré-cadastrados?\n\nIsso irá adicionar todos os 197 países reconhecidos pela ONU com suas siglas oficiais e nacionalidades.`, 'Importar Países', '🌍')
    if (confirmadoPaises) {
      const paisesImportados: Pais[] = paisesData.map(pais => ({
        id: Date.now().toString() + Math.random().toString(),
        codigo: pais.codigo,
        nome: pais.nome,
        sigla: pais.sigla,
        numeroIBGE: '',
        nacionalidadeMasculino: pais.nacionalidadeMasculino,
        nacionalidadeFeminino: pais.nacionalidadeFeminino
      }))
      
      setPaises(prev => {
        // Evitar duplicatas baseadas na sigla
        const siglasExistentes = new Set(prev.map(p => p.sigla))
        const novosPaises = paisesImportados.filter(p => !siglasExistentes.has(p.sigla))
        return [...prev, ...novosPaises]
      })
      
      await modal.alert(`Importação concluída!\n\n${paisesData.length} países foram cadastrados com sucesso!`, 'Sucesso', '✅')
    }
  }

  // Listener para evento de importação
  useEffect(() => {
    const handleImportEvent = () => handleImportar()
    window.addEventListener('importar-paises', handleImportEvent)
    return () => window.removeEventListener('importar-paises', handleImportEvent)
  }, [])

  // Filtrar países com base no termo de busca
  const paisesFiltrados = paises.filter(pais => {
    if (!termoBusca.trim()) return true
    const termo = termoBusca.toLowerCase()
    return (
      pais.nome.toLowerCase().includes(termo) ||
      pais.sigla.toLowerCase().includes(termo) ||
      pais.nacionalidadeMasculino.toLowerCase().includes(termo) ||
      pais.nacionalidadeFeminino.toLowerCase().includes(termo) ||
      pais.codigo.includes(termo)
    )
  })

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      gap: '8px'
    }}>
      {/* Formulário */}
      <div style={{
        border: `1px solid ${theme.border}`,
        borderRadius: '4px',
        padding: '8px',
        backgroundColor: theme.surface
      }}>
        {/* Linha 1: Código, Nome do País e Sigla */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '100px 1fr 120px',
          gap: '8px',
          marginBottom: '8px'
        }}>
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

          <div>
            <label style={labelStyles}>Nome do País</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={inputStyles}
              placeholder="Nome do país..."
              maxLength={100}
            />
          </div>

          <div>
            <label style={labelStyles}>Sigla</label>
            <input
              type="text"
              value={sigla}
              onChange={(e) => setSigla(e.target.value.toUpperCase())}
              style={inputStyles}
              placeholder="Ex: BR, US..."
              maxLength={3}
            />
          </div>
        </div>

        {/* Linha 2: Número IBGE */}
        <div style={{ marginBottom: '8px' }}>
          <label style={labelStyles}>Número IBGE (Opcional)</label>
          <input
            type="text"
            value={numeroIBGE}
            onChange={(e) => setNumeroIBGE(e.target.value)}
            style={inputStyles}
            placeholder="Opcional - Países não possuem código IBGE"
            maxLength={20}
          />
        </div>

        {/* Linha 3: Nacionalidade (Masculino) e (Feminino) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px'
        }}>
          <div>
            <label style={labelStyles}>Nacionalidade (Masculino)</label>
            <input
              type="text"
              value={nacionalidadeMasculino}
              onChange={(e) => setNacionalidadeMasculino(e.target.value)}
              style={inputStyles}
              placeholder="Ex: Brasileiro, Americano..."
              maxLength={50}
            />
          </div>

          <div>
            <label style={labelStyles}>Nacionalidade (Feminino)</label>
            <input
              type="text"
              value={nacionalidadeFeminino}
              onChange={(e) => setNacionalidadeFeminino(e.target.value)}
              style={inputStyles}
              placeholder="Ex: Brasileira, Americana..."
              maxLength={50}
            />
          </div>
        </div>
      </div>

      {/* Campo de Busca */}
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        padding: '8px',
        border: `1px solid ${theme.border}`,
        borderRadius: '4px',
        backgroundColor: theme.surface
      }}>
        <span style={{ fontSize: '16px' }}>🔍</span>
        <input
          type="text"
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          placeholder="Buscar por nome, sigla, nacionalidade..."
          style={{
            ...inputStyles,
            flex: 1,
            margin: 0
          }}
        />
        {termoBusca && (
          <button
            onClick={() => setTermoBusca('')}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              backgroundColor: theme.border,
              color: theme.text,
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
            title="Limpar busca"
          >
            ✕
          </button>
        )}
        <span style={{ 
          fontSize: '11px', 
          color: theme.textSecondary,
          whiteSpace: 'nowrap'
        }}>
          {paisesFiltrados.length} de {paises.length}
        </span>
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
                borderRight: `1px solid rgba(255,255,255,0.2)`
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
                Nome do País
              </th>
              <th style={{
                padding: '6px 8px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '11px',
                borderRight: `1px solid rgba(255,255,255,0.2)`
              }}>
                Sigla
              </th>
              <th style={{
                padding: '6px 8px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '11px'
              }}>
                Nacionalidade (M/F)
              </th>
            </tr>
          </thead>
          <tbody>
            {paisesFiltrados.length === 0 ? (
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
                    <span style={{ fontSize: '20px', opacity: 0.5 }}>🌍</span>
                    <span>{termoBusca ? 'Nenhum país encontrado com este termo' : 'Nenhum país cadastrado'}</span>
                  </div>
                </td>
              </tr>
            ) : (
              paisesFiltrados.map((pais, index) => (
                <tr
                  key={pais.id}
                  onClick={() => handleSelectRow(pais)}
                  style={{
                    backgroundColor: selectedId === pais.id 
                      ? '#3b82f6' 
                      : index % 2 === 0 
                        ? theme.surface 
                        : theme.background,
                    color: selectedId === pais.id ? 'white' : theme.text,
                    cursor: 'pointer',
                    borderBottom: `1px solid ${theme.border}`
                  }}
                  onMouseEnter={(e) => {
                    if (selectedId !== pais.id) {
                      e.currentTarget.style.backgroundColor = theme.border
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedId !== pais.id) {
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
                    {pais.codigo}
                  </td>
                  <td style={{
                    padding: '6px 8px',
                    borderRight: `1px solid ${theme.border}`
                  }}>
                    {pais.nome}
                  </td>
                  <td style={{
                    padding: '6px 8px',
                    borderRight: `1px solid ${theme.border}`
                  }}>
                    {pais.sigla}
                  </td>
                  <td style={{
                    padding: '6px 8px'
                  }}>
                    {pais.nacionalidadeMasculino && pais.nacionalidadeFeminino 
                      ? `${pais.nacionalidadeMasculino} / ${pais.nacionalidadeFeminino}`
                      : pais.nacionalidadeMasculino || pais.nacionalidadeFeminino || '-'}
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

