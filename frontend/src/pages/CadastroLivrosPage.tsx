import { useState, useEffect } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'

interface CadastroLivrosPageProps {
  onClose: () => void
}

interface TipoLivro {
  id: string
  codigo: string
  tipoLivroSeletor: string
  indice: string
  atoLivro: string
}

interface ConfiguracaoLivro {
  id: string
  codigo: string
  atoLivro: string
  quantidade: string
  folhaInicial: string
  folhaInicialTipo: string
  folhaFinal: string
  folhaFinalTipo: string
  livroDesdobrado: 'sim' | 'nao'
  tipoNumeracao: 'pagina' | 'folhas'
  atosLivroE: {
    ausencia: boolean
    interdicao: boolean
    emancipacao: boolean
    uniaoEstavel: boolean
    opcaoNacionalidade: boolean
    transcricaoNascimento: boolean
    transcricaoCasamento: boolean
    transcricaoObito: boolean
  }
  ultimaNumLivro: string
  ultimaNumTermo: string
  ultimaNumFolhas: string
  ultimaNumFolhasTipo: string
}

interface LivroCorrente {
  id: string
  codigo: string
  atoLivro: string
  tipo: string
  qtdeFolhas: string
  livro: string
  termo: string
  folhas: string
  encerrado: boolean
}

export function CadastroLivrosPage({ onClose }: CadastroLivrosPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'

  // Estado para controlar submenu ativo
  const [activeSubmenu, setActiveSubmenu] = useState<'tipo' | 'configuracao' | 'correntes'>('tipo')
  
  // Estado para campo em foco
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Estados para Tipo de Livro
  const [tiposLivro, setTiposLivro] = useState<TipoLivro[]>([])
  const [tipoForm, setTipoForm] = useState({
    codigo: '0',
    tipoLivroSeletor: '',
    indice: '',
    atoLivro: ''
  })
  const [selectedTipoId, setSelectedTipoId] = useState<string | null>(null)

  // Estados para Configuração de Livro
  const [configForm, setConfigForm] = useState<ConfiguracaoLivro>({
    id: '',
    codigo: '0',
    atoLivro: '',
    quantidade: '',
    folhaInicial: '',
    folhaInicialTipo: 'V',
    folhaFinal: '',
    folhaFinalTipo: 'F',
    livroDesdobrado: 'nao',
    tipoNumeracao: 'folhas',
    atosLivroE: {
      ausencia: false,
      interdicao: false,
      emancipacao: false,
      uniaoEstavel: false,
      opcaoNacionalidade: false,
      transcricaoNascimento: false,
      transcricaoCasamento: false,
      transcricaoObito: false
    },
    ultimaNumLivro: '',
    ultimaNumTermo: '',
    ultimaNumFolhas: '',
    ultimaNumFolhasTipo: 'V'
  })

  // Estados para Livros Correntes
  const [livrosCorrente, setLivrosCorrente] = useState<LivroCorrente[]>([])
  const [selectedLivroId, setSelectedLivroId] = useState<string | null>(null)

  // Carregar dados do localStorage
  useEffect(() => {
    carregarDados()
  }, [])


  const carregarDados = () => {
    // Carregar tipos de livro
    const tiposSaved = localStorage.getItem('tiposLivro')
    if (tiposSaved) {
      try {
        setTiposLivro(JSON.parse(tiposSaved))
      } catch (error) {
        console.error('Erro ao carregar tipos de livro:', error)
      }
    }

    // Carregar livros correntes
    const livrosSaved = localStorage.getItem('livrosCorrente')
    if (livrosSaved) {
      try {
        setLivrosCorrente(JSON.parse(livrosSaved))
      } catch (error) {
        console.error('Erro ao carregar livros correntes:', error)
      }
    }
  }

  // Funções para Tipo de Livro
  const handleNovoTipo = () => {
    setTipoForm({ codigo: '0', tipoLivroSeletor: '', indice: '', atoLivro: '' })
    setSelectedTipoId(null)
  }

  const handleGravarTipo = () => {
    if (!tipoForm.tipoLivroSeletor || !tipoForm.indice || !tipoForm.atoLivro) {
      alert('⚠️ Preencha todos os campos obrigatórios!')
      return
    }

    // Gerar código automático se for novo registro (código = '0')
    let codigoFinal = tipoForm.codigo
    if (!selectedTipoId || tipoForm.codigo === '0') {
      const ultimoCodigo = localStorage.getItem('ultimoCodigoTipoLivro')
      const proximoCodigo = ultimoCodigo ? parseInt(ultimoCodigo) + 1 : 1
      
      codigoFinal = proximoCodigo.toString()
      localStorage.setItem('ultimoCodigoTipoLivro', codigoFinal)
      
      console.log('🆔 Código gerado:', codigoFinal)
    }

    const novoTipo: TipoLivro = {
      id: selectedTipoId || Date.now().toString(),
      codigo: codigoFinal,
      tipoLivroSeletor: tipoForm.tipoLivroSeletor,
      indice: tipoForm.indice,
      atoLivro: tipoForm.atoLivro
    }

    let tipos = [...tiposLivro]
    if (selectedTipoId) {
      const index = tipos.findIndex(t => t.id === selectedTipoId)
      if (index >= 0) tipos[index] = novoTipo
    } else {
      tipos.push(novoTipo)
    }

    setTiposLivro(tipos)
    localStorage.setItem('tiposLivro', JSON.stringify(tipos))
    
    alert(`✅ Tipo de livro salvo com sucesso!\n\nCódigo: ${codigoFinal}`)
    
    // Reset para próximo cadastro com código incrementado
    const proximoCodigo = parseInt(codigoFinal) + 1
    localStorage.setItem('ultimoCodigoTipoLivro', proximoCodigo.toString())
    setTipoForm({ codigo: proximoCodigo.toString(), tipoLivroSeletor: '', indice: '', atoLivro: '' })
    setSelectedTipoId(null)
  }

  const handleExcluirTipo = () => {
    if (!selectedTipoId) {
      alert('⚠️ Selecione um tipo de livro para excluir')
      return
    }

    if (confirm('Tem certeza que deseja excluir este tipo de livro?')) {
      const tipos = tiposLivro.filter(t => t.id !== selectedTipoId)
      setTiposLivro(tipos)
      localStorage.setItem('tiposLivro', JSON.stringify(tipos))
      handleNovoTipo()
      alert('✅ Tipo de livro excluído com sucesso!')
    }
  }

  // Funções para Configuração de Livro
  const handleGravarConfiguracao = () => {
    alert('✅ Configuração de livro salva com sucesso!')
    console.log('Configuração salva:', configForm)
  }

  const handleCancelarConfiguracao = () => {
    setConfigForm({
      id: '',
      codigo: '0',
      atoLivro: '',
      quantidade: '',
      folhaInicial: '',
      folhaInicialTipo: 'V',
      folhaFinal: '',
      folhaFinalTipo: 'F',
      livroDesdobrado: 'nao',
      tipoNumeracao: 'folhas',
      atosLivroE: {
        ausencia: false,
        interdicao: false,
        emancipacao: false,
        uniaoEstavel: false,
        opcaoNacionalidade: false,
        transcricaoNascimento: false,
        transcricaoCasamento: false,
        transcricaoObito: false
      },
      ultimaNumLivro: '',
      ultimaNumTermo: '',
      ultimaNumFolhas: '',
      ultimaNumFolhasTipo: 'V'
    })
  }

  // Funções para Livros Correntes
  const handleNovoLivro = () => {
    alert('Criar novo livro corrente')
  }

  const handleAlterarLivro = () => {
    if (!selectedLivroId) {
      alert('⚠️ Selecione um livro para alterar')
      return
    }
    alert('Alterar livro selecionado')
  }

  const handleExcluirLivro = () => {
    if (!selectedLivroId) {
      alert('⚠️ Selecione um livro para excluir')
      return
    }

    if (confirm('Tem certeza que deseja excluir este livro?')) {
      const livros = livrosCorrente.filter(l => l.id !== selectedLivroId)
      setLivrosCorrente(livros)
      localStorage.setItem('livrosCorrente', JSON.stringify(livros))
      setSelectedLivroId(null)
      alert('✅ Livro excluído com sucesso!')
    }
  }

  // Estilos
  const focusColor = currentTheme === 'dark' ? '#ffd4a3' : '#ffedd5'
  const focusTextColor = currentTheme === 'dark' ? '#1a1a1a' : '#000000'

  const getInputStyles = (fieldName: string) => ({
    width: '100%',
    padding: '4px 8px',
    fontSize: '12px',
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    backgroundColor: focusedField === fieldName ? focusColor : theme.background,
    color: focusedField === fieldName ? focusTextColor : theme.text,
    outline: 'none',
    height: '28px',
    lineHeight: '20px',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease',
    WebkitBoxShadow: focusedField === fieldName ? `0 0 0 1000px ${focusColor} inset` : `0 0 0 1000px ${theme.background} inset`,
    WebkitTextFillColor: focusedField === fieldName ? focusTextColor : theme.text
  })

  const getSelectStyles = (fieldName: string) => ({
    ...getInputStyles(fieldName),
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    MozAppearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23666666' d='M1 1 L6 6 L11 1'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    backgroundSize: '12px 8px',
    paddingRight: '28px'
  })

  const labelStyles = {
    fontSize: '11px',
    fontWeight: '600' as const,
    marginBottom: '2px',
    color: theme.text,
    display: 'block'
  }

  const buttonStyles = {
    padding: '6px 16px',
    fontSize: '12px',
    fontWeight: '600' as const,
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '90px'
  }

  const getSubmenuStyles = (isActive: boolean, isDisabled: boolean = false) => ({
    flex: 1,
    padding: '12px',
    fontSize: '13px',
    fontWeight: '600' as const,
    border: 'none',
    borderBottom: isActive ? `3px solid ${headerColor}` : '3px solid transparent',
    backgroundColor: isActive ? (currentTheme === 'dark' ? '#2a2a2a' : '#f0f0f0') : 'transparent',
    color: isDisabled ? (currentTheme === 'dark' ? '#666' : '#999') : (isActive ? headerColor : theme.text),
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    opacity: isDisabled ? 0.5 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  })

  return (
    <BasePage
      title="Cadastro de Livros"
      onClose={onClose}
      width="900px"
      height="700px"
      minWidth="900px"
      minHeight="700px"
      resizable={false}
      headerColor={headerColor}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        {/* Submenus com setas */}
        <div style={{
          display: 'flex',
          borderBottom: `2px solid ${theme.border}`,
          backgroundColor: currentTheme === 'dark' ? '#1a1a1a' : '#fff',
          alignItems: 'center',
          gap: '8px',
          padding: '0 8px'
        }}>
          <button
            onClick={() => setActiveSubmenu('tipo')}
            style={getSubmenuStyles(activeSubmenu === 'tipo')}
            onMouseEnter={(e) => {
              if (activeSubmenu !== 'tipo') {
                e.currentTarget.style.backgroundColor = currentTheme === 'dark' ? '#333' : '#e0e0e0'
              }
            }}
            onMouseLeave={(e) => {
              if (activeSubmenu !== 'tipo') {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            📚 Tipo de Livro
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
            onClick={() => setActiveSubmenu('configuracao')}
            style={getSubmenuStyles(activeSubmenu === 'configuracao')}
            onMouseEnter={(e) => {
              if (activeSubmenu !== 'configuracao') {
                e.currentTarget.style.backgroundColor = currentTheme === 'dark' ? '#333' : '#e0e0e0'
              }
            }}
            onMouseLeave={(e) => {
              if (activeSubmenu !== 'configuracao') {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            ⚙️ Configuração de Livro
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
            onClick={() => setActiveSubmenu('correntes')}
            style={getSubmenuStyles(activeSubmenu === 'correntes')}
            onMouseEnter={(e) => {
              if (activeSubmenu !== 'correntes') {
                e.currentTarget.style.backgroundColor = currentTheme === 'dark' ? '#333' : '#e0e0e0'
              }
            }}
            onMouseLeave={(e) => {
              if (activeSubmenu !== 'correntes') {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            📖 Livros Correntes
          </button>
        </div>

        {/* Conteúdo dos submenus */}
        <div style={{
          flex: 1,
          padding: '16px',
          overflow: 'auto'
        }}>
          {/* Submenu 1: Tipo de Livro */}
          {activeSubmenu === 'tipo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              <h2 style={{ margin: 0, color: theme.text, fontSize: '16px', fontWeight: 'bold' }}>
                Cadastro de Tipo de Livro
              </h2>
              
              {/* Formulário - Linha única */}
              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '16px',
                border: `1px solid ${theme.border}`,
                borderRadius: '4px',
                backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#f9f9f9',
                alignItems: 'end'
              }}>
                <div style={{ width: '100px' }}>
                  <label style={labelStyles}>Código *</label>
                  <input
                    type="text"
                    value={tipoForm.codigo}
                    readOnly
                    disabled
                    onKeyDown={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      fontSize: '12px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '3px',
                      outline: 'none',
                      height: '28px',
                      lineHeight: '20px',
                      boxSizing: 'border-box' as const,
                      backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      color: currentTheme === 'dark' ? '#666' : '#999',
                      cursor: 'not-allowed',
                      opacity: 0.7
                    }}
                    title="Código gerado automaticamente"
                  />
                </div>
                <div style={{ width: '100px' }}>
                  <label style={labelStyles}>Índice *</label>
                  <select
                    value={tipoForm.indice}
                    onChange={(e) => setTipoForm({ ...tipoForm, indice: e.target.value })}
                    onFocus={() => setFocusedField('tipoIndice')}
                    onBlur={() => setFocusedField(null)}
                    style={getSelectStyles('tipoIndice')}
                  >
                    <option value="">Selecione...</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                  </select>
                </div>
                <div style={{ width: '180px' }}>
                  <label style={labelStyles}>Tipo de Livro *</label>
                  <select
                    value={tipoForm.tipoLivroSeletor}
                    onChange={(e) => setTipoForm({ ...tipoForm, tipoLivroSeletor: e.target.value })}
                    onFocus={() => setFocusedField('tipoLivroSeletor')}
                    onBlur={() => setFocusedField(null)}
                    style={getSelectStyles('tipoLivroSeletor')}
                  >
                    <option value="">Selecione...</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="B Auxiliar">B Auxiliar</option>
                    <option value="C">C</option>
                    <option value="C Auxiliar">C Auxiliar</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyles}>Ato Livro *</label>
                  <input
                    type="text"
                    value={tipoForm.atoLivro}
                    onChange={(e) => setTipoForm({ ...tipoForm, atoLivro: e.target.value })}
                    onFocus={() => setFocusedField('tipoAtoLivro')}
                    onBlur={() => setFocusedField(null)}
                    style={getInputStyles('tipoAtoLivro')}
                    placeholder="Digite o ato do livro"
                  />
                </div>
              </div>

              {/* Tabela */}
              <div style={{
                flex: 1,
                border: `1px solid ${theme.border}`,
                borderRadius: '4px',
                overflow: 'auto'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '12px'
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                      borderBottom: `2px solid ${theme.border}`,
                      position: 'sticky',
                      top: 0
                    }}>
                      <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600', width: '80px' }}>Código</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600', width: '80px' }}>Índice</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600', width: '140px' }}>Tipo de Livro</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600' }}>Ato Livro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiposLivro.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{
                          padding: '32px',
                          textAlign: 'center',
                          color: theme.text,
                          fontStyle: 'italic'
                        }}>
                          Nenhum tipo de livro cadastrado
                        </td>
                      </tr>
                    ) : (
                      tiposLivro.map((tipo, index) => (
                        <tr
                          key={tipo.id}
                          onClick={() => {
                            setSelectedTipoId(tipo.id)
                            setTipoForm({ 
                              codigo: tipo.codigo, 
                              tipoLivroSeletor: tipo.tipoLivroSeletor,
                              indice: tipo.indice, 
                              atoLivro: tipo.atoLivro 
                            })
                          }}
                          style={{
                            backgroundColor: selectedTipoId === tipo.id
                              ? (currentTheme === 'dark' ? '#3b82f6' : '#60a5fa')
                              : (index % 2 === 0 ? 'transparent' : (currentTheme === 'dark' ? '#1a1a1a' : '#f9f9f9')),
                            borderBottom: `1px solid ${theme.border}`,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedTipoId !== tipo.id) {
                              e.currentTarget.style.backgroundColor = currentTheme === 'dark' ? '#2a2a2a' : '#e0e0e0'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedTipoId !== tipo.id) {
                              e.currentTarget.style.backgroundColor = index % 2 === 0 
                                ? 'transparent' 
                                : (currentTheme === 'dark' ? '#1a1a1a' : '#f9f9f9')
                            }
                          }}
                        >
                          <td style={{ padding: '8px', color: selectedTipoId === tipo.id ? '#fff' : theme.text }}>{tipo.codigo}</td>
                          <td style={{ padding: '8px', color: selectedTipoId === tipo.id ? '#fff' : theme.text }}>{tipo.indice}</td>
                          <td style={{ padding: '8px', color: selectedTipoId === tipo.id ? '#fff' : theme.text }}>{tipo.tipoLivroSeletor}</td>
                          <td style={{ padding: '8px', color: selectedTipoId === tipo.id ? '#fff' : theme.text }}>{tipo.atoLivro}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Botões */}
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                paddingTop: '8px',
                borderTop: `1px solid ${theme.border}`
              }}>
                <button
                  onClick={handleNovoTipo}
                  style={{
                    ...buttonStyles,
                    backgroundColor: '#6c757d',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#495057'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                >
                  📄 Novo
                </button>
                <button
                  onClick={handleGravarTipo}
                  style={{
                    ...buttonStyles,
                    backgroundColor: '#6c757d',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#495057'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                >
                  💾 Gravar
                </button>
                <button
                  onClick={handleExcluirTipo}
                  disabled={!selectedTipoId}
                  style={{
                    ...buttonStyles,
                    backgroundColor: selectedTipoId ? '#dc2626' : '#4b5563',
                    color: 'white',
                    cursor: selectedTipoId ? 'pointer' : 'not-allowed',
                    opacity: selectedTipoId ? 1 : 0.5
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTipoId) e.currentTarget.style.backgroundColor = '#b91c1c'
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTipoId) e.currentTarget.style.backgroundColor = '#dc2626'
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
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#495057'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                >
                  🚪 Retornar
                </button>
              </div>
            </div>
          )}

          {/* Submenu 2: Configuração de Livro */}
          {activeSubmenu === 'configuracao' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflow: 'auto' }}>
              <h2 style={{ 
                margin: 0, 
                color: '#dc2626', 
                fontSize: '18px', 
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                Cadastro de Livro
              </h2>
              
              {/* Informações Básicas */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 120px',
                gap: '12px',
                alignItems: 'end'
              }}>
                <div>
                  <label style={labelStyles}>Código</label>
                  <input
                    type="text"
                    value={configForm.codigo}
                    readOnly
                    disabled
                    onKeyDown={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      fontSize: '12px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '3px',
                      outline: 'none',
                      height: '28px',
                      lineHeight: '20px',
                      boxSizing: 'border-box' as const,
                      backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      color: currentTheme === 'dark' ? '#666' : '#999',
                      cursor: 'not-allowed',
                      opacity: 0.7
                    }}
                    title="Código preenchido automaticamente ao selecionar Ato Livro"
                  />
                </div>
                <div>
                  <label style={labelStyles}>Ato Livro</label>
                  <select
                    value={configForm.atoLivro}
                    onChange={(e) => {
                      const selectedAtoLivro = e.target.value
                      const tipoEncontrado = tiposLivro.find(t => t.atoLivro === selectedAtoLivro)
                      setConfigForm({ 
                        ...configForm, 
                        atoLivro: selectedAtoLivro,
                        codigo: tipoEncontrado ? tipoEncontrado.codigo : '0'
                      })
                    }}
                    onFocus={() => setFocusedField('atoLivro')}
                    onBlur={() => setFocusedField(null)}
                    style={getSelectStyles('atoLivro')}
                  >
                    <option value="">Selecione...</option>
                    {tiposLivro.map((tipo) => (
                      <option key={tipo.id} value={tipo.atoLivro}>
                        {tipo.atoLivro}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyles}>Quantidade</label>
                  <input
                    type="text"
                    value={configForm.quantidade}
                    onChange={(e) => setConfigForm({ ...configForm, quantidade: e.target.value })}
                    onFocus={() => setFocusedField('quantidade')}
                    onBlur={() => setFocusedField(null)}
                    style={getInputStyles('quantidade')}
                  />
                </div>
              </div>

              {/* Folhas */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyles}>Folha Inicial</label>
                    <input
                      type="text"
                      value={configForm.folhaInicial}
                      onChange={(e) => setConfigForm({ ...configForm, folhaInicial: e.target.value })}
                      onFocus={() => setFocusedField('folhaInicial')}
                      onBlur={() => setFocusedField(null)}
                      style={getInputStyles('folhaInicial')}
                    />
                  </div>
                  <select
                    value={configForm.folhaInicialTipo}
                    onChange={(e) => setConfigForm({ ...configForm, folhaInicialTipo: e.target.value })}
                    style={{ ...getSelectStyles('folhaInicialTipo'), width: '60px' }}
                  >
                    <option value="V">V</option>
                    <option value="F">F</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyles}>Folha Final</label>
                    <input
                      type="text"
                      value={configForm.folhaFinal}
                      onChange={(e) => setConfigForm({ ...configForm, folhaFinal: e.target.value })}
                      onFocus={() => setFocusedField('folhaFinal')}
                      onBlur={() => setFocusedField(null)}
                      style={getInputStyles('folhaFinal')}
                    />
                  </div>
                  <select
                    value={configForm.folhaFinalTipo}
                    onChange={(e) => setConfigForm({ ...configForm, folhaFinalTipo: e.target.value })}
                    style={{ ...getSelectStyles('folhaFinalTipo'), width: '60px' }}
                  >
                    <option value="V">V</option>
                    <option value="F">F</option>
                  </select>
                </div>
              </div>

              {/* Configurações */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                padding: '12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '4px',
                backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#f9f9f9'
              }}>
                <div>
                  <label style={{ ...labelStyles, marginBottom: '8px' }}>Livro Desdobrado</label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: theme.text }}>
                      <input
                        type="radio"
                        checked={configForm.livroDesdobrado === 'sim'}
                        onChange={() => setConfigForm({ ...configForm, livroDesdobrado: 'sim' })}
                      />
                      Sim
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: theme.text }}>
                      <input
                        type="radio"
                        checked={configForm.livroDesdobrado === 'nao'}
                        onChange={() => setConfigForm({ ...configForm, livroDesdobrado: 'nao' })}
                      />
                      Não
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ ...labelStyles, marginBottom: '8px' }}>Tipo Numeração</label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: theme.text }}>
                      <input
                        type="radio"
                        checked={configForm.tipoNumeracao === 'pagina'}
                        onChange={() => setConfigForm({ ...configForm, tipoNumeracao: 'pagina' })}
                      />
                      Página
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: theme.text }}>
                      <input
                        type="radio"
                        checked={configForm.tipoNumeracao === 'folhas'}
                        onChange={() => setConfigForm({ ...configForm, tipoNumeracao: 'folhas' })}
                      />
                      Folhas
                    </label>
                  </div>
                </div>
              </div>

              {/* Atos do Livro E */}
              <div style={{
                padding: '12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '4px',
                backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#f9f9f9'
              }}>
                <label style={{ ...labelStyles, marginBottom: '12px', display: 'block' }}>Atos do Livro E</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  gap: '8px'
                }}>
                  {[
                    { key: 'ausencia', label: 'Ausência' },
                    { key: 'interdicao', label: 'Interdição' },
                    { key: 'emancipacao', label: 'Emancipação' },
                    { key: 'uniaoEstavel', label: 'União Estável' },
                    { key: 'opcaoNacionalidade', label: 'Opção de Nacionalidade' },
                    { key: 'transcricaoNascimento', label: 'Transcrição de Nascimento' },
                    { key: 'transcricaoCasamento', label: 'Transcrição de Casamento' },
                    { key: 'transcricaoObito', label: 'Transcrição de Óbito' }
                  ].map(({ key, label }) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: theme.text, fontSize: '11px' }}>
                      <input
                        type="checkbox"
                        checked={configForm.atosLivroE[key as keyof typeof configForm.atosLivroE]}
                        onChange={(e) => setConfigForm({
                          ...configForm,
                          atosLivroE: {
                            ...configForm.atosLivroE,
                            [key]: e.target.checked
                          }
                        })}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Última Numeração */}
              <div style={{
                padding: '12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '4px',
                backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#f9f9f9'
              }}>
                <label style={{ ...labelStyles, marginBottom: '12px', display: 'block' }}>Última Numeração Utilizada</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 200px 1fr',
                  gap: '12px'
                }}>
                  <div>
                    <label style={{ ...labelStyles, fontSize: '10px' }}>Livro</label>
                    <input
                      type="text"
                      value={configForm.ultimaNumLivro}
                      onChange={(e) => setConfigForm({ ...configForm, ultimaNumLivro: e.target.value })}
                      onFocus={() => setFocusedField('ultimaNumLivro')}
                      onBlur={() => setFocusedField(null)}
                      style={getInputStyles('ultimaNumLivro')}
                    />
                  </div>
                  <div>
                    <label style={{ ...labelStyles, fontSize: '10px' }}>Termo</label>
                    <input
                      type="text"
                      value={configForm.ultimaNumTermo}
                      onChange={(e) => setConfigForm({ ...configForm, ultimaNumTermo: e.target.value })}
                      onFocus={() => setFocusedField('ultimaNumTermo')}
                      onBlur={() => setFocusedField(null)}
                      style={getInputStyles('ultimaNumTermo')}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ ...labelStyles, fontSize: '10px' }}>Folhas</label>
                      <input
                        type="text"
                        value={configForm.ultimaNumFolhas}
                        onChange={(e) => setConfigForm({ ...configForm, ultimaNumFolhas: e.target.value })}
                        onFocus={() => setFocusedField('ultimaNumFolhas')}
                        onBlur={() => setFocusedField(null)}
                        style={getInputStyles('ultimaNumFolhas')}
                      />
                    </div>
                    <select
                      value={configForm.ultimaNumFolhasTipo}
                      onChange={(e) => setConfigForm({ ...configForm, ultimaNumFolhasTipo: e.target.value })}
                      style={{ ...getSelectStyles('ultimaNumFolhasTipo'), width: '60px' }}
                    >
                      <option value="V">V</option>
                      <option value="F">F</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                paddingTop: '16px',
                borderTop: `1px solid ${theme.border}`,
                marginTop: 'auto'
              }}>
                <button
                  onClick={handleGravarConfiguracao}
                  style={{
                    ...buttonStyles,
                    backgroundColor: '#10b981',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                >
                  ✅ Gravar
                </button>
                <button
                  onClick={handleCancelarConfiguracao}
                  style={{
                    ...buttonStyles,
                    backgroundColor: '#ef4444',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Submenu 3: Livros Correntes */}
          {activeSubmenu === 'correntes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              <h2 style={{ margin: 0, color: theme.text, fontSize: '16px', fontWeight: 'bold' }}>
                Abertura de Livros
              </h2>
              
              {/* Tabela */}
              <div style={{
                flex: 1,
                border: `1px solid ${theme.border}`,
                borderRadius: '4px',
                overflow: 'auto'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '12px'
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                      borderBottom: `2px solid ${theme.border}`,
                      position: 'sticky',
                      top: 0
                    }}>
                      <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600', width: '80px' }}>Código</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600' }}>Ato Livro</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600', width: '60px' }}>Tipo</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600', width: '100px' }}>Qtde Folhas</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600', width: '80px' }}>Livro</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600', width: '100px' }}>Termo</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600', width: '100px' }}>Folhas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {livrosCorrente.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{
                          padding: '32px',
                          textAlign: 'center',
                          color: theme.text,
                          fontStyle: 'italic'
                        }}>
                          Nenhum livro corrente cadastrado
                        </td>
                      </tr>
                    ) : (
                      livrosCorrente.map((livro, index) => (
                        <tr
                          key={livro.id}
                          onClick={() => setSelectedLivroId(livro.id)}
                        style={{
                          backgroundColor: selectedLivroId === livro.id
                            ? (currentTheme === 'dark' ? '#3b82f6' : '#60a5fa')
                            : (livro.encerrado 
                                ? '#dc2626'
                                : (index % 2 === 0 ? 'transparent' : (currentTheme === 'dark' ? '#1a1a1a' : '#f9f9f9'))
                              ),
                          borderBottom: `1px solid ${theme.border}`,
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedLivroId !== livro.id) {
                            e.currentTarget.style.backgroundColor = currentTheme === 'dark' ? '#2a2a2a' : '#e0e0e0'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedLivroId !== livro.id) {
                            if (livro.encerrado) {
                              e.currentTarget.style.backgroundColor = '#dc2626'
                            } else {
                              e.currentTarget.style.backgroundColor = index % 2 === 0 
                                ? 'transparent' 
                                : (currentTheme === 'dark' ? '#1a1a1a' : '#f9f9f9')
                            }
                          }
                        }}
                      >
                        <td style={{ padding: '8px', color: (selectedLivroId === livro.id || livro.encerrado) ? '#fff' : theme.text }}>{livro.codigo}</td>
                        <td style={{ padding: '8px', color: (selectedLivroId === livro.id || livro.encerrado) ? '#fff' : theme.text }}>{livro.atoLivro}</td>
                        <td style={{ padding: '8px', color: (selectedLivroId === livro.id || livro.encerrado) ? '#fff' : theme.text }}>{livro.tipo}</td>
                        <td style={{ padding: '8px', color: (selectedLivroId === livro.id || livro.encerrado) ? '#fff' : theme.text }}>{livro.qtdeFolhas}</td>
                        <td style={{ padding: '8px', color: (selectedLivroId === livro.id || livro.encerrado) ? '#fff' : theme.text }}>{livro.livro}</td>
                        <td style={{ padding: '8px', color: (selectedLivroId === livro.id || livro.encerrado) ? '#fff' : theme.text }}>{livro.termo}</td>
                        <td style={{ padding: '8px', color: (selectedLivroId === livro.id || livro.encerrado) ? '#fff' : theme.text }}>{livro.folhas}</td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Legenda */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#f9f9f9',
                borderRadius: '4px'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#dc2626',
                  border: `1px solid ${theme.border}`
                }}></div>
                <span style={{ fontSize: '11px', color: theme.text }}>Livro Encerrado</span>
              </div>

              {/* Botões */}
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                paddingTop: '8px',
                borderTop: `1px solid ${theme.border}`
              }}>
                <button
                  onClick={handleNovoLivro}
                  style={{
                    ...buttonStyles,
                    backgroundColor: '#6c757d',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#495057'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                >
                  ➕ Novo
                </button>
                <button
                  onClick={handleAlterarLivro}
                  disabled={!selectedLivroId}
                  style={{
                    ...buttonStyles,
                    backgroundColor: selectedLivroId ? '#6c757d' : '#4b5563',
                    color: 'white',
                    cursor: selectedLivroId ? 'pointer' : 'not-allowed',
                    opacity: selectedLivroId ? 1 : 0.5
                  }}
                  onMouseEnter={(e) => {
                    if (selectedLivroId) e.currentTarget.style.backgroundColor = '#495057'
                  }}
                  onMouseLeave={(e) => {
                    if (selectedLivroId) e.currentTarget.style.backgroundColor = '#6c757d'
                  }}
                >
                  ✅ Alterar
                </button>
                <button
                  onClick={handleExcluirLivro}
                  disabled={!selectedLivroId}
                  style={{
                    ...buttonStyles,
                    backgroundColor: selectedLivroId ? '#dc2626' : '#4b5563',
                    color: 'white',
                    cursor: selectedLivroId ? 'pointer' : 'not-allowed',
                    opacity: selectedLivroId ? 1 : 0.5
                  }}
                  onMouseEnter={(e) => {
                    if (selectedLivroId) e.currentTarget.style.backgroundColor = '#b91c1c'
                  }}
                  onMouseLeave={(e) => {
                    if (selectedLivroId) e.currentTarget.style.backgroundColor = '#dc2626'
                  }}
                >
                  ❌ Excluir
                </button>
                <button
                  onClick={onClose}
                  style={{
                    ...buttonStyles,
                    backgroundColor: '#17a2b8',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#138496'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#17a2b8'}
                >
                  ↩️ Retornar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BasePage>
  )
}

