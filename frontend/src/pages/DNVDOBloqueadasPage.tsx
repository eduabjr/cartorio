import { useState, useEffect } from 'react'
import { CidadeAutocompleteInput } from '../components/CidadeAutocompleteInput'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { viaCepService } from '../services/ViaCepService'

interface DNVDOBloqueadasPageProps {
  onClose: () => void
}

export function DNVDOBloqueadasPage({ onClose }: DNVDOBloqueadasPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  
  // Cor do header: teal no light, laranja no dark
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'

  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState<'cadastro' | 'consulta'>('cadastro')

  // Estado para o formulário
  const [formData, setFormData] = useState({
    codigo: '0',
    tipoDeclaracao: 'DNV',
    numeroDeclaracao: '',
    data: '',
    localOcorrencia: 'Hospital',
    estabelecimento: '',
    logradouro: 'Rua',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: 'SP',
    cep: '',
    observacao: ''
  })

  // Estado para campo em foco
  const [focusedField, setFocusedField] = useState<string | null>(null)
  
  // Estado para controlar se há um registro selecionado
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Estados para consulta
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'DNV' | 'DO'>('TODOS')
  const [filtroData, setFiltroData] = useState('')
  const [filtroBusca, setFiltroBusca] = useState('')
  const [declaracoesBloqueadas, setDeclaracoesBloqueadas] = useState<Array<{
    id: string
    codigo: string
    tipo: string
    numero: string
    data: string
    estabelecimento: string
    cidade: string
    localOcorrencia: string
    logradouro: string
    endereco: string
    numeroEndereco: string
    bairro: string
    uf: string
    cep: string
    observacao: string
  }>>([])

  // Carregar declarações salvas do localStorage
  const carregarDeclaracoes = () => {
    const saved = localStorage.getItem('declaracoesBloqueadas')
    if (saved) {
      try {
        const declaracoes = JSON.parse(saved)
        setDeclaracoesBloqueadas(declaracoes)
      } catch (error) {
        console.error('Erro ao carregar declarações:', error)
      }
    }
  }

  // Carregar ao montar o componente ou trocar de aba
  useEffect(() => {
    carregarDeclaracoes()
  }, [activeTab])

  // Função para criar novo registro
  const handleNovo = () => {
    setFormData({
      codigo: '0',
      tipoDeclaracao: 'DNV',
      numeroDeclaracao: '',
      data: '',
      localOcorrencia: 'Hospital',
      estabelecimento: '',
      logradouro: 'Rua',
      endereco: '',
      numero: '',
      bairro: '',
      cidade: '',
      uf: 'SP',
      cep: '',
      observacao: ''
    })
    setSelectedId(null)
  }

  // Função para gravar registro
  const handleGravar = () => {
    console.log('Salvando declaração bloqueada:', formData)
    
    // Gerar código sequencial se novo registro
    let codigoFinal = formData.codigo
    let registroId = selectedId
    
    if (!selectedId || formData.codigo === '0') {
      const ultimoCodigo = localStorage.getItem('ultimoCodigoDNVDO')
      const proximoCodigo = ultimoCodigo ? parseInt(ultimoCodigo) + 1 : 1
      
      codigoFinal = proximoCodigo.toString()
      localStorage.setItem('ultimoCodigoDNVDO', codigoFinal)
      
      registroId = Date.now().toString()
      setSelectedId(registroId)
      console.log('🆔 Código gerado:', codigoFinal)
    }
    
    // Criar objeto da declaração
    const novaDeclaracao = {
      id: registroId!,
      codigo: codigoFinal,
      tipo: formData.tipoDeclaracao,
      numero: formData.numeroDeclaracao,
      data: formData.data,
      estabelecimento: formData.estabelecimento,
      cidade: formData.cidade,
      localOcorrencia: formData.localOcorrencia,
      logradouro: formData.logradouro,
      endereco: formData.endereco,
      numeroEndereco: formData.numero,
      bairro: formData.bairro,
      uf: formData.uf,
      cep: formData.cep,
      observacao: formData.observacao
    }
    
    // Carregar declarações existentes
    const saved = localStorage.getItem('declaracoesBloqueadas')
    let declaracoes = []
    if (saved) {
      try {
        declaracoes = JSON.parse(saved)
      } catch (error) {
        console.error('Erro ao carregar declarações:', error)
      }
    }
    
    // Verificar se é atualização ou novo registro
    const index = declaracoes.findIndex((d: any) => d.id === registroId)
    if (index >= 0) {
      // Atualizar registro existente
      declaracoes[index] = novaDeclaracao
    } else {
      // Adicionar novo registro
      declaracoes.push(novaDeclaracao)
    }
    
    // Salvar no localStorage
    localStorage.setItem('declaracoesBloqueadas', JSON.stringify(declaracoes))
    
    console.log('✅ Declaração bloqueada salva com sucesso!')
    alert(`✅ Declaração bloqueada salva com sucesso!\n\nCódigo: ${codigoFinal}\nTipo: ${formData.tipoDeclaracao}\nNúmero: ${formData.numeroDeclaracao}`)
    
    // Reset do formulário para próximo preenchimento (mantém próximo código)
    const proximoCodigo = parseInt(codigoFinal) + 1
    localStorage.setItem('ultimoCodigoDNVDO', proximoCodigo.toString())
    
    setFormData({
      codigo: proximoCodigo.toString(),
      tipoDeclaracao: 'DNV',
      numeroDeclaracao: '',
      data: '',
      localOcorrencia: 'Hospital',
      estabelecimento: '',
      logradouro: 'Rua',
      endereco: '',
      numero: '',
      bairro: '',
      cidade: '',
      uf: 'SP',
      cep: '',
      observacao: ''
    })
    setSelectedId(null)
    
    // Recarregar lista de declarações
    carregarDeclaracoes()
  }

  // Função para excluir registro
  const handleExcluir = () => {
    if (!selectedId) {
      alert('⚠️ Nenhuma declaração selecionada para excluir.')
      console.log('⚠️ Nenhuma declaração selecionada para excluir.')
      return
    }
    
    // Confirmar exclusão
    if (!confirm('Tem certeza que deseja excluir esta declaração bloqueada?')) {
      return
    }
    
    // Carregar declarações existentes
    const saved = localStorage.getItem('declaracoesBloqueadas')
    if (saved) {
      try {
        let declaracoes = JSON.parse(saved)
        
        // Remover o registro
        declaracoes = declaracoes.filter((d: any) => d.id !== selectedId)
        
        // Salvar de volta no localStorage
        localStorage.setItem('declaracoesBloqueadas', JSON.stringify(declaracoes))
        
        console.log('✅ Declaração bloqueada excluída.')
        alert('✅ Declaração bloqueada excluída com sucesso!')
        
        // Limpar formulário
        handleNovo()
        
        // Recarregar lista
        carregarDeclaracoes()
      } catch (error) {
        console.error('Erro ao excluir declaração:', error)
        alert('❌ Erro ao excluir declaração.')
      }
    }
  }

  // Função para buscar CEP
  const handleBuscarCEP = async () => {
    const cep = formData.cep.replace(/\D/g, '')
    
    if (!cep || cep.length < 8) {
      console.log('⚠️ Digite um CEP válido com 8 dígitos')
      return
    }

    try {
      console.log('🔍 Buscando CEP:', cep)
      
      const dados = await viaCepService.buscarCEP(cep)
      
      if (dados) {
        setFormData(prev => ({
          ...prev,
          cep: viaCepService.formatarCEP(dados.cep),
          endereco: dados.logradouro,
          bairro: dados.bairro,
          cidade: dados.localidade,
          uf: dados.uf
        }))
        
        console.log(`✅ CEP encontrado: ${dados.logradouro}, ${dados.bairro}, ${dados.localidade}/${dados.uf}`)
      } else {
        console.log('❌ CEP não encontrado')
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    }
  }

  // Filtrar declarações dinamicamente
  const declaracoesFiltradas = declaracoesBloqueadas.filter(decl => {
    // Filtro por Tipo (individual)
    const matchTipo = filtroTipo === 'TODOS' || decl.tipo === filtroTipo
    
    // Filtro por Data (individual)
    let matchData = true
    if (filtroData) {
      // Comparar apenas a data (sem hora)
      const dataDecl = decl.data ? new Date(decl.data).toISOString().split('T')[0] : ''
      matchData = dataDecl === filtroData
    }
    
    // Filtro por Busca - número, estabelecimento ou cidade (individual)
    const matchBusca = filtroBusca === '' || 
      decl.numero.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      decl.estabelecimento.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      decl.cidade.toLowerCase().includes(filtroBusca.toLowerCase())
    
    // Retorna true apenas se TODOS os filtros ativos forem satisfeitos
    return matchTipo && matchData && matchBusca
  })

  // Cor de foco dinâmica baseada no tema (igual CartorioSeadePage)
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
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease',
    lineHeight: '20px',
    WebkitBoxShadow: focusedField === fieldName ? `0 0 0 1000px ${focusColor} inset` : `0 0 0 1000px ${theme.background} inset`,
    WebkitTextFillColor: focusedField === fieldName ? focusTextColor : theme.text,
    boxShadow: focusedField === fieldName ? `0 0 0 1000px ${focusColor} inset` : 'none'
  })

  const getSelectStyles = (fieldName: string) => {
    // Seta sempre preta para visibilidade (não muda com foco)
    return {
      width: '100%',
      padding: '4px 8px',
      fontSize: '12px',
      border: `1px solid ${theme.border}`,
      borderRadius: '3px',
      backgroundColor: focusedField === fieldName ? focusColor : theme.background,
      color: focusedField === fieldName ? focusTextColor : theme.text,
      outline: 'none',
      height: '28px',
      minHeight: '28px',
      maxHeight: '28px',
      lineHeight: '20px',
      boxSizing: 'border-box' as const,
      transition: 'all 0.2s ease',
      WebkitBoxShadow: focusedField === fieldName ? `0 0 0 1000px ${focusColor} inset` : `0 0 0 1000px ${theme.background} inset`,
      WebkitTextFillColor: focusedField === fieldName ? focusTextColor : theme.text,
      boxShadow: focusedField === fieldName ? `0 0 0 1000px ${focusColor} inset` : 'none',
      appearance: 'none' as const,
      WebkitAppearance: 'none' as const,
      MozAppearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23666666' d='M1 1 L6 6 L11 1'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 8px center',
      backgroundSize: '12px 8px',
      paddingRight: '28px',
      verticalAlign: 'middle'
    }
  }

  const labelStyles = {
    fontSize: '11px',
    fontWeight: '600' as const,
    marginBottom: '2px',
    color: theme.text,
    display: 'block',
    height: '16px',
    lineHeight: '16px'
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

  const iconButtonStyles = {
    position: 'absolute' as const,
    right: '6px',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '0px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '0px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: theme.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s ease',
    zIndex: 1,
    width: '20px',
    height: '20px',
    outline: 'none',
    boxShadow: 'none'
  }
  
  const getInputWithIconStyles = (fieldName: string) => ({
    ...getInputStyles(fieldName),
    paddingRight: '30px' // Espaço para o ícone
  })

  // Estilos para as abas
  const tabContainerStyles = {
    display: 'flex',
    borderBottom: `2px solid ${theme.border}`,
    marginBottom: '16px',
    gap: '4px'
  }

  const getTabStyles = (isActive: boolean) => ({
    padding: '8px 24px',
    fontSize: '12px',
    fontWeight: '600' as const,
    border: 'none',
    borderBottom: isActive ? `3px solid ${headerColor}` : 'none',
    backgroundColor: isActive ? (currentTheme === 'dark' ? '#2a2a2a' : '#f0f0f0') : 'transparent',
    color: isActive ? headerColor : theme.text,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none'
  })

  return (
      <BasePage
        title="Cadastro de Declaração Bloqueada"
        onClose={onClose}
        width="700px"
        height="660px"
        minWidth="700px"
        minHeight="660px"
        resizable={false}
        headerColor={headerColor}
      >
      <div style={{
        padding: '16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Abas */}
        <div style={tabContainerStyles}>
          <button
            onClick={() => setActiveTab('cadastro')}
            style={getTabStyles(activeTab === 'cadastro')}
            onMouseEnter={(e) => {
              if (activeTab !== 'cadastro') {
                e.currentTarget.style.backgroundColor = currentTheme === 'dark' ? '#1a1a1a' : '#e0e0e0'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'cadastro') {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            📝 Cadastro
          </button>
          <button
            onClick={() => setActiveTab('consulta')}
            style={getTabStyles(activeTab === 'consulta')}
            onMouseEnter={(e) => {
              if (activeTab !== 'consulta') {
                e.currentTarget.style.backgroundColor = currentTheme === 'dark' ? '#1a1a1a' : '#e0e0e0'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'consulta') {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            🔍 Consulta
          </button>
        </div>

        {/* Conteúdo da aba Cadastro */}
        {activeTab === 'cadastro' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            flex: 1
          }}>
        {/* Linha 1: Código, Tipo Declaração, Número Declaração */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '120px 180px 1fr',
          gap: '8px',
          alignItems: 'end'
        }}>
          {/* Código */}
          <div>
            <label style={labelStyles}>Código</label>
            <input
              type="text"
              value={formData.codigo}
              readOnly
              disabled
              onKeyDown={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              style={{
                ...getInputWithIconStyles('codigo'),
                backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                color: currentTheme === 'dark' ? '#666' : '#999',
                cursor: 'not-allowed',
                opacity: 0.7,
                width: '100px'
              }}
            />
          </div>

          {/* Tipo Declaração */}
          <div>
            <label style={labelStyles}>Tipo Declaração</label>
            <select
              value={formData.tipoDeclaracao}
              onChange={(e) => setFormData({ ...formData, tipoDeclaracao: e.target.value })}
              onFocus={() => setFocusedField('tipoDeclaracao')}
              onBlur={() => setFocusedField(null)}
              style={getSelectStyles('tipoDeclaracao')}
            >
              <option value="DNV">DNV</option>
              <option value="DO">DO</option>
            </select>
          </div>

          {/* Número Declaração */}
          <div>
            <label style={labelStyles}>Número Declaração</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={formData.numeroDeclaracao}
                onChange={(e) => setFormData({ ...formData, numeroDeclaracao: e.target.value })}
                onFocus={() => setFocusedField('numeroDeclaracao')}
                onBlur={() => setFocusedField(null)}
                style={getInputWithIconStyles('numeroDeclaracao')}
              />
              <button 
                style={iconButtonStyles}
                title="Buscar número declaração"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >🔍</button>
            </div>
          </div>
        </div>

        {/* Linha 2: Local de Ocorrência, Estabelecimento */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '250px 1fr',
          gap: '8px',
          alignItems: 'end'
        }}>
          {/* Local de Ocorrência */}
          <div>
            <label style={labelStyles}>Local de Ocorrência</label>
            <select
              value={formData.localOcorrencia}
              onChange={(e) => setFormData({ ...formData, localOcorrencia: e.target.value })}
              onFocus={() => setFocusedField('localOcorrencia')}
              onBlur={() => setFocusedField(null)}
              style={getSelectStyles('localOcorrencia')}
            >
              <option value="Hospital">Hospital</option>
              <option value="Domicílio">Domicílio</option>
              <option value="Outros Estab. Saúde">Outros Estab. Saúde</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          {/* Estabelecimento */}
          <div>
            <label style={labelStyles}>Estabelecimento</label>
            <input
              type="text"
              value={formData.estabelecimento}
              onChange={(e) => setFormData({ ...formData, estabelecimento: e.target.value })}
              onFocus={() => setFocusedField('estabelecimento')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyles('estabelecimento')}
            />
          </div>
        </div>

        {/* Linha 3: Logradouro, Endereço, Número */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '150px 1fr 120px',
          gap: '8px',
          alignItems: 'end'
        }}>
          {/* Logradouro */}
          <div>
            <label style={labelStyles}>Logradouro</label>
            <select
              value={formData.logradouro}
              onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
              onFocus={() => setFocusedField('logradouro')}
              onBlur={() => setFocusedField(null)}
              style={getSelectStyles('logradouro')}
            >
              <option value="Rua">Rua</option>
              <option value="Avenida">Avenida</option>
              <option value="Alameda">Alameda</option>
              <option value="Travessa">Travessa</option>
              <option value="Praça">Praça</option>
              <option value="Rodovia">Rodovia</option>
              <option value="Estrada">Estrada</option>
              <option value="Viela">Viela</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          {/* Endereço */}
          <div>
            <label style={labelStyles}>Endereço</label>
            <input
              type="text"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              onFocus={() => setFocusedField('endereco')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyles('endereco')}
            />
          </div>

          {/* Número */}
          <div>
            <label style={labelStyles}>Número</label>
            <input
              type="text"
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              onFocus={() => setFocusedField('numero')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyles('numero')}
            />
          </div>
        </div>

        {/* Linha 4: Bairro, Cidade, UF, CEP */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 150px 150px',
          gap: '8px',
          alignItems: 'end'
        }}>
          {/* Bairro */}
          <div>
            <label style={labelStyles}>Bairro</label>
            <input
              type="text"
              value={formData.bairro}
              onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
              onFocus={() => setFocusedField('bairro')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyles('bairro')}
            />
          </div>

          {/* Cidade */}
          <div>
            <label style={labelStyles}>Cidade</label>
            <CidadeAutocompleteInput
              value={formData.cidade}
              onChange={(cidade) => setFormData({ ...formData, cidade })}
              onUfChange={(uf) => setFormData({ ...formData, uf })}
              uf={formData.uf}
              focusedField={focusedField}
              onFocus={() => setFocusedField('cidade')}
              onBlur={() => setFocusedField(null)}
              inputStyles={getInputStyles('cidade')}
            />
          </div>

          {/* UF */}
          <div>
            <label style={labelStyles}>UF</label>
            <select
              value={formData.uf}
              onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
              onFocus={() => setFocusedField('uf')}
              onBlur={() => setFocusedField(null)}
              style={getSelectStyles('uf')}
            >
              <option value="AC">AC</option>
              <option value="AL">AL</option>
              <option value="AP">AP</option>
              <option value="AM">AM</option>
              <option value="BA">BA</option>
              <option value="CE">CE</option>
              <option value="DF">DF</option>
              <option value="ES">ES</option>
              <option value="GO">GO</option>
              <option value="MA">MA</option>
              <option value="MT">MT</option>
              <option value="MS">MS</option>
              <option value="MG">MG</option>
              <option value="PA">PA</option>
              <option value="PB">PB</option>
              <option value="PR">PR</option>
              <option value="PE">PE</option>
              <option value="PI">PI</option>
              <option value="RJ">RJ</option>
              <option value="RN">RN</option>
              <option value="RS">RS</option>
              <option value="RO">RO</option>
              <option value="RR">RR</option>
              <option value="SC">SC</option>
              <option value="SP">SP</option>
              <option value="SE">SE</option>
              <option value="TO">TO</option>
            </select>
          </div>

          {/* CEP */}
          <div>
            <label style={labelStyles}>CEP</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={formData.cep}
                onChange={(e) => {
                  const valor = e.target.value.replace(/\D/g, '').slice(0, 8)
                  setFormData({ ...formData, cep: valor })
                }}
                onFocus={() => setFocusedField('cep')}
                onBlur={async (e) => {
                  setFocusedField(null)
                  const cep = e.target.value
                  
                  // Formata e busca CEP automaticamente ao sair do campo
                  if (cep && cep.length === 8) {
                    try {
                      const dados = await viaCepService.buscarCEP(cep)
                      
                      if (dados) {
                        setFormData(prev => ({
                          ...prev,
                          cep: viaCepService.formatarCEP(dados.cep),
                          endereco: dados.logradouro,
                          bairro: dados.bairro,
                          cidade: dados.localidade,
                          uf: dados.uf
                        }))
                        
                        console.log('✅ Endereço preenchido automaticamente pelo CEP')
                      }
                    } catch (error) {
                      console.error('Erro ao buscar CEP automaticamente:', error)
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleBuscarCEP()
                  }
                }}
                style={getInputWithIconStyles('cep')}
                placeholder="00000-000"
                maxLength={9}
              />
              <button 
                onClick={handleBuscarCEP}
                style={iconButtonStyles}
                title="Buscar endereço por CEP"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >🔍</button>
            </div>
          </div>
        </div>

        {/* Linha 5: Data */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '150px',
          gap: '8px'
        }}>
          {/* Data */}
          <div>
            <label style={labelStyles}>Data</label>
            <input
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              onFocus={() => setFocusedField('data')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyles('data')}
            />
          </div>
        </div>

        {/* Linha 6: Observação */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <label style={labelStyles}>Observação</label>
          <textarea
            value={formData.observacao}
            onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
            onFocus={() => setFocusedField('observacao')}
            onBlur={() => setFocusedField(null)}
            style={{
              ...getInputStyles('observacao'),
              height: '100%',
              minHeight: '120px',
              resize: 'none',
              paddingTop: '8px',
              lineHeight: '1.5'
            }}
            placeholder="Digite observações sobre a declaração bloqueada..."
          />
        </div>

        {/* Botões de Ação */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          paddingTop: '8px',
          borderTop: `1px solid ${theme.border}`
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
            disabled={!selectedId}
            style={{
              ...buttonStyles,
              backgroundColor: selectedId ? '#dc2626' : '#4b5563',
              color: 'white',
              cursor: selectedId ? 'pointer' : 'not-allowed',
              opacity: selectedId ? 1 : 0.5
            }}
            onMouseEnter={(e) => {
              if (selectedId) {
                e.currentTarget.style.backgroundColor = '#b91c1c'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedId) {
                e.currentTarget.style.backgroundColor = '#dc2626'
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
            🚪 Retornar
          </button>
        </div>
          </div>
        )}

        {/* Conteúdo da aba Consulta */}
        {activeTab === 'consulta' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            flex: 1
          }}>
            {/* Filtros */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {/* Linha 1: Tipo de Declaração e Data */}
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'end'
              }}>
                {/* Filtro por Tipo */}
                <div style={{ width: '250px' }}>
                  <label style={labelStyles}>Tipo de Declaração</label>
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value as 'TODOS' | 'DNV' | 'DO')}
                    onFocus={() => setFocusedField('filtroTipo')}
                    onBlur={() => setFocusedField(null)}
                    style={getSelectStyles('filtroTipo')}
                  >
                    <option value="TODOS">TODOS</option>
                    <option value="DNV">DNV - Nascidos Vivos</option>
                    <option value="DO">DO - Óbitos</option>
                  </select>
                </div>

                {/* Filtro por Data */}
                <div style={{ width: '180px' }}>
                  <label style={labelStyles}>Data</label>
                  <input
                    type="date"
                    value={filtroData}
                    onChange={(e) => setFiltroData(e.target.value)}
                    onFocus={() => setFocusedField('filtroData')}
                    onBlur={() => setFocusedField(null)}
                    style={getInputStyles('filtroData')}
                  />
                </div>
              </div>

              {/* Linha 2: Busca */}
              <div>
                <label style={labelStyles}>Buscar (Número, Estabelecimento ou Cidade)</label>
                <input
                  type="text"
                  value={filtroBusca}
                  onChange={(e) => setFiltroBusca(e.target.value)}
                  onFocus={() => setFocusedField('filtroBusca')}
                  onBlur={() => setFocusedField(null)}
                  style={getInputStyles('filtroBusca')}
                  placeholder="Digite para buscar..."
                />
              </div>
            </div>

            {/* Tabela de resultados */}
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
                    <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600' }}>Tipo</th>
                    <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600' }}>Número</th>
                    <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600' }}>Data</th>
                    <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600' }}>Estabelecimento</th>
                    <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600' }}>Cidade</th>
                    <th style={{ padding: '8px', textAlign: 'center', color: theme.text, fontWeight: '600' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {declaracoesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{
                        padding: '32px',
                        textAlign: 'center',
                        color: theme.text,
                        fontStyle: 'italic'
                      }}>
                        Nenhuma declaração bloqueada encontrada
                      </td>
                    </tr>
                  ) : (
                    declaracoesFiltradas.map((decl, index) => (
                      <tr
                        key={decl.id}
                        style={{
                          backgroundColor: index % 2 === 0 
                            ? 'transparent' 
                            : (currentTheme === 'dark' ? '#1a1a1a' : '#f9f9f9'),
                          borderBottom: `1px solid ${theme.border}`,
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = currentTheme === 'dark' ? '#2a2a2a' : '#e0e0e0'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = index % 2 === 0 
                            ? 'transparent' 
                            : (currentTheme === 'dark' ? '#1a1a1a' : '#f9f9f9')
                        }}
                      >
                        <td style={{ padding: '8px', color: theme.text }}>
                          <span style={{
                            backgroundColor: decl.tipo === 'DNV' ? '#10b981' : '#ef4444',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '3px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {decl.tipo}
                          </span>
                        </td>
                        <td style={{ padding: '8px', color: theme.text }}>{decl.numero}</td>
                        <td style={{ padding: '8px', color: theme.text }}>
                          {new Date(decl.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td style={{ padding: '8px', color: theme.text }}>{decl.estabelecimento}</td>
                        <td style={{ padding: '8px', color: theme.text }}>{decl.cidade}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              // Carregar registro no formulário de cadastro
                              setFormData({
                                codigo: decl.codigo,
                                tipoDeclaracao: decl.tipo,
                                numeroDeclaracao: decl.numero,
                                data: decl.data,
                                localOcorrencia: decl.localOcorrencia,
                                estabelecimento: decl.estabelecimento,
                                logradouro: decl.logradouro,
                                endereco: decl.endereco,
                                numero: decl.numeroEndereco,
                                bairro: decl.bairro,
                                cidade: decl.cidade,
                                uf: decl.uf,
                                cep: decl.cep,
                                observacao: decl.observacao
                              })
                              setSelectedId(decl.id)
                              
                              // Mudar para aba de cadastro
                              setActiveTab('cadastro')
                              
                              console.log('Carregando declaração para edição:', decl)
                            }}
                            style={{
                              ...buttonStyles,
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              minWidth: '70px',
                              padding: '4px 12px',
                              fontSize: '11px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#2563eb'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#3b82f6'
                            }}
                          >
                            👁️ Ver
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Informação de resultados */}
            <div style={{
              padding: '8px',
              fontSize: '11px',
              color: theme.text,
              borderTop: `1px solid ${theme.border}`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative'
            }}>
              {/* Botões centralizados */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setFiltroTipo('TODOS')
                    setFiltroData('')
                    setFiltroBusca('')
                    console.log('🧹 Filtros limpos')
                  }}
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
                  title="Limpar todos os filtros"
                >
                  🧹 Limpar
                </button>
                <button
                  onClick={() => {
                    if (declaracoesFiltradas.length === 0) {
                      alert('⚠️ Não há registros para gerar o relatório.')
                      return
                    }

                    try {
                      console.log('📊 Gerando relatório Excel...')
                      
                      // Criar XML Excel
                      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
                      xml += '<?mso-application progid="Excel.Sheet"?>\n'
                      xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n'
                      xml += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n'
                      xml += '<Worksheet ss:Name="Declarações Bloqueadas">\n'
                      xml += '<Table>\n'
                      
                      // Cabeçalho
                      xml += '<Row>\n'
                      xml += '<Cell><Data ss:Type="String">Código</Data></Cell>\n'
                      xml += '<Cell><Data ss:Type="String">Tipo</Data></Cell>\n'
                      xml += '<Cell><Data ss:Type="String">Número</Data></Cell>\n'
                      xml += '<Cell><Data ss:Type="String">Data</Data></Cell>\n'
                      xml += '<Cell><Data ss:Type="String">Estabelecimento</Data></Cell>\n'
                      xml += '<Cell><Data ss:Type="String">Cidade</Data></Cell>\n'
                      xml += '<Cell><Data ss:Type="String">UF</Data></Cell>\n'
                      xml += '<Cell><Data ss:Type="String">Observação</Data></Cell>\n'
                      xml += '</Row>\n'
                      
                      // Dados
                      declaracoesFiltradas.forEach(decl => {
                        xml += '<Row>\n'
                        xml += `<Cell><Data ss:Type="String">${decl.codigo || ''}</Data></Cell>\n`
                        xml += `<Cell><Data ss:Type="String">${decl.tipo || ''}</Data></Cell>\n`
                        xml += `<Cell><Data ss:Type="String">${decl.numero || ''}</Data></Cell>\n`
                        xml += `<Cell><Data ss:Type="String">${decl.data ? new Date(decl.data).toLocaleDateString('pt-BR') : ''}</Data></Cell>\n`
                        xml += `<Cell><Data ss:Type="String">${decl.estabelecimento || ''}</Data></Cell>\n`
                        xml += `<Cell><Data ss:Type="String">${decl.cidade || ''}</Data></Cell>\n`
                        xml += `<Cell><Data ss:Type="String">${decl.uf || ''}</Data></Cell>\n`
                        xml += `<Cell><Data ss:Type="String">${decl.observacao || ''}</Data></Cell>\n`
                        xml += '</Row>\n'
                      })
                      
                      xml += '</Table>\n'
                      xml += '</Worksheet>\n'
                      xml += '</Workbook>'
                      
                      // Criar blob e fazer download
                      const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
                      const url = window.URL.createObjectURL(blob)
                      const link = document.createElement('a')
                      link.href = url
                      
                      // Nome do arquivo com data e hora
                      const agora = new Date()
                      const dataHora = `${agora.getFullYear()}${String(agora.getMonth() + 1).padStart(2, '0')}${String(agora.getDate()).padStart(2, '0')}_${String(agora.getHours()).padStart(2, '0')}${String(agora.getMinutes()).padStart(2, '0')}`
                      link.download = `Declaracoes_Bloqueadas_${dataHora}.xls`
                      
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                      window.URL.revokeObjectURL(url)
                      
                      console.log(`✅ Relatório gerado com sucesso! ${declaracoesFiltradas.length} registro(s)`)
                      alert(`✅ Relatório Excel gerado com sucesso!\n\n${declaracoesFiltradas.length} registro(s) exportado(s)`)
                    } catch (error) {
                      console.error('Erro ao gerar relatório:', error)
                      alert('❌ Erro ao gerar relatório. Tente novamente.')
                    }
                  }}
                  style={{
                    ...buttonStyles,
                    backgroundColor: '#17a2b8',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#138496'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#17a2b8'
                  }}
                  title="Gerar relatório em Excel"
                >
                  📊 Relatório
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
              
              {/* Contador de registros no lado direito */}
              <span style={{
                position: 'absolute',
                right: '8px'
              }}>
                {declaracoesFiltradas.length === 0 
                  ? 'Nenhum registro encontrado' 
                  : `${declaracoesFiltradas.length} registro${declaracoesFiltradas.length !== 1 ? 's' : ''} encontrado${declaracoesFiltradas.length !== 1 ? 's' : ''}`
                }
              </span>
            </div>
          </div>
        )}
      </div>
    </BasePage>
  )
}

