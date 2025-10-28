import React, { useState, useEffect } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'

interface HospitalCemiterioPageProps {
  onClose: () => void
}

interface Estabelecimento {
  codigo: string
  descricao: string
  cep: string
  logradouro: string
  endereco: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
}

export const HospitalCemiterioPage: React.FC<HospitalCemiterioPageProps> = ({ onClose }) => {
  const { currentTheme, getTheme } = useAccessibility()
  const theme = getTheme()

  const [activeTab, setActiveTab] = useState<'hospitais' | 'cemiterios' | 'funerarias'>('hospitais')
  const [formData, setFormData] = useState({
    codigo: '0',
    descricao: '',
    logradouro: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: ''
  })

  const [selectedEstabelecimento, setSelectedEstabelecimento] = useState<number>(-1)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [updateCount, setUpdateCount] = useState(0)
  const [buscandoCEP, setBuscandoCEP] = useState(false)
  const [sugestoesCidade, setSugestoesCidade] = useState<string[]>([])
  const [showSugestoes, setShowSugestoes] = useState(false)
  const [sugestaoSelecionada, setSugestaoSelecionada] = useState(-1)

  useEffect(() => {
    console.log('🎨 HospitalCemiterioPage - Tema mudou para:', currentTheme)
    setUpdateCount(prev => prev + 1)
  }, [currentTheme])

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      console.log('📢 HospitalCemiterioPage - Recebeu evento theme-changed:', e.detail)
      setUpdateCount(prev => prev + 1)
    }
    window.addEventListener('theme-changed', handleThemeChange)
    return () => window.removeEventListener('theme-changed', handleThemeChange)
  }, [])

  // Limpar seleção e formulário ao trocar de aba
  useEffect(() => {
    setSelectedEstabelecimento(-1)
    setFormData({
      codigo: '0',
      descricao: '',
      logradouro: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: ''
    })
    setShowSugestoes(false)
    setSugestoesCidade([])
  }, [activeTab])

  // Atualizar sugestões quando UF mudar (se já tem cidade digitada)
  useEffect(() => {
    if (formData.cidade.length >= 2 && focusedField === 'cidade') {
      buscarSugestoesCidade(formData.cidade)
    }
  }, [formData.uf])

  // Formatar CEP com máscara (00000-000)
  const formatarCEP = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '')
    if (apenasNumeros.length <= 5) {
      return apenasNumeros
    }
    return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5, 8)}`
  }

  // Buscar endereço pelo CEP
  const buscarCEP = async (cep: string) => {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '')
    
    // Verifica se o CEP tem 8 dígitos
    if (cepLimpo.length !== 8) {
      return
    }

    setBuscandoCEP(true)

    try {
      console.log('🔍 Buscando CEP:', cepLimpo)
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()

      if (data.erro) {
        console.log('❌ CEP não encontrado')
        alert('⚠️ CEP não encontrado!')
        setBuscandoCEP(false)
        return
      }

      console.log('✅ Endereço encontrado:', data)

      // Mapear tipo de logradouro
      let tipoLogradouro = ''
      if (data.logradouro) {
        const tipos = ['Rua', 'Avenida', 'Travessa', 'Alameda', 'Praça', 'Rodovia', 'Estrada', 'Viela', 'Largo']
        for (const tipo of tipos) {
          if (data.logradouro.toLowerCase().startsWith(tipo.toLowerCase())) {
            tipoLogradouro = tipo
            break
          }
        }
      }

      // Remover o tipo do logradouro do endereço
      let endereco = data.logradouro || ''
      if (tipoLogradouro && endereco.toLowerCase().startsWith(tipoLogradouro.toLowerCase())) {
        endereco = endereco.substring(tipoLogradouro.length).trim()
      }

      // Preencher os campos com os dados do CEP
      setFormData(prev => ({
        ...prev,
        logradouro: tipoLogradouro,
        endereco: endereco,
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        uf: data.uf || '',
        complemento: data.complemento || prev.complemento
      }))

      console.log('✅ Campos preenchidos automaticamente')
      setBuscandoCEP(false)
    } catch (error) {
      console.error('❌ Erro ao buscar CEP:', error)
      alert('⚠️ Erro ao buscar CEP. Verifique sua conexão.')
      setBuscandoCEP(false)
    }
  }

  // Monitorar mudanças no CEP
  useEffect(() => {
    const cepLimpo = formData.cep.replace(/\D/g, '')
    if (cepLimpo.length === 8) {
      buscarCEP(cepLimpo)
    }
  }, [formData.cep])

  // Estado para armazenar estabelecimentos cadastrados
  const [hospitais, setHospitais] = useState<Estabelecimento[]>(() => {
    const saved = localStorage.getItem('hospitais-cadastrados')
    return saved ? JSON.parse(saved) : []
  })
  const [cemiterios, setCemiterios] = useState<Estabelecimento[]>(() => {
    const saved = localStorage.getItem('cemiterios-cadastrados')
    return saved ? JSON.parse(saved) : []
  })
  const [funerarias, setFunerarias] = useState<Estabelecimento[]>(() => {
    const saved = localStorage.getItem('funerarias-cadastrados')
    return saved ? JSON.parse(saved) : []
  })

  const estabelecimentos = activeTab === 'hospitais' ? hospitais : (activeTab === 'cemiterios' ? cemiterios : funerarias)
  const setEstabelecimentos = activeTab === 'hospitais' ? setHospitais : (activeTab === 'cemiterios' ? setCemiterios : setFunerarias)

  // Persistir dados no localStorage
  useEffect(() => {
    localStorage.setItem('hospitais-cadastrados', JSON.stringify(hospitais))
  }, [hospitais])

  useEffect(() => {
    localStorage.setItem('cemiterios-cadastrados', JSON.stringify(cemiterios))
  }, [cemiterios])

  useEffect(() => {
    localStorage.setItem('funerarias-cadastrados', JSON.stringify(funerarias))
  }, [funerarias])

  const tiposLogradouro = [
    'Rua',
    'Avenida',
    'Travessa',
    'Alameda',
    'Praça',
    'Rodovia',
    'Estrada',
    'Viela',
    'Largo'
  ]

  const estados = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ]

  // Base de cidades brasileiras (principais cidades por estado)
  const cidadesPorEstado: Record<string, string[]> = {
    "SP": ["São Paulo", "Campinas", "Santos", "Ribeirão Preto", "São José dos Campos", "Sorocaba", "Santo André", "São Bernardo do Campo", "Osasco", "Guarulhos", "Mogi das Cruzes", "Diadema", "Piracicaba", "Bauru", "Jundiaí", "Franca", "São Vicente", "Praia Grande", "Limeira", "Suzano"],
    "RJ": ["Rio de Janeiro", "Niterói", "Duque de Caxias", "Nova Iguaçu", "São Gonçalo", "Campos dos Goytacazes", "Petrópolis", "Volta Redonda", "Belford Roxo", "Angra dos Reis", "Cabo Frio", "Macaé", "Teresópolis", "Resende", "Barra Mansa"],
    "MG": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "Ribeirão das Neves", "Uberaba", "Governador Valadares", "Ipatinga", "Sete Lagoas", "Divinópolis", "Santa Luzia", "Ibirité", "Poços de Caldas"],
    "BA": ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Itabuna", "Juazeiro", "Lauro de Freitas", "Ilhéus", "Jequié", "Teixeira de Freitas", "Alagoinhas", "Barreiras", "Paulo Afonso", "Simões Filho"],
    "PR": ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "São José dos Pinhais", "Foz do Iguaçu", "Colombo", "Guarapuava", "Paranaguá", "Araucária", "Toledo", "Apucarana", "Pinhais"],
    "RS": ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria", "Gravataí", "Viamão", "Novo Hamburgo", "São Leopoldo", "Rio Grande", "Alvorada", "Passo Fundo", "Sapucaia do Sul", "Uruguaiana"],
    "PE": ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina", "Paulista", "Cabo de Santo Agostinho", "Camaragibe", "Garanhuns", "Vitória de Santo Antão", "Igarassu", "São Lourenço da Mata"],
    "CE": ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral", "Crato", "Itapipoca", "Maranguape", "Iguatu", "Quixadá", "Canindé", "Pacajus", "Aquiraz"],
    "GO": ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia", "Águas Lindas de Goiás", "Valparaíso de Goiás", "Trindade", "Formosa", "Novo Gama", "Itumbiara", "Senador Canedo"],
    "SC": ["Florianópolis", "Joinville", "Blumenau", "São José", "Criciúma", "Chapecó", "Itajaí", "Jaraguá do Sul", "Lages", "Palhoça", "Balneário Camboriú", "Brusque", "Tubarão"],
    "PA": ["Belém", "Ananindeua", "Santarém", "Marabá", "Castanhal", "Parauapebas", "Itaituba", "Cametá", "Bragança", "Abaetetuba", "Marituba", "Altamira"],
    "AM": ["Manaus", "Parintins", "Itacoatiara", "Manacapuru", "Coari", "Tefé", "Tabatinga", "Maués", "Presidente Figueiredo"],
    "MA": ["São Luís", "Imperatriz", "São José de Ribamar", "Timon", "Caxias", "Codó", "Paço do Lumiar", "Açailândia", "Bacabal"],
    "DF": ["Brasília", "Taguatinga", "Ceilândia", "Samambaia", "Planaltina", "Águas Claras", "Gama", "Santa Maria", "Sobradinho"],
    "ES": ["Vitória", "Vila Velha", "Serra", "Cariacica", "Cachoeiro de Itapemirim", "Linhares", "São Mateus", "Colatina", "Guarapari"],
    "AL": ["Maceió", "Arapiraca", "Palmeira dos Índios", "Rio Largo", "Penedo", "União dos Palmares", "São Miguel dos Campos"],
    "SE": ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana", "Estância", "Tobias Barreto"],
    "RN": ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante", "Macaíba", "Ceará-Mirim", "Caicó"],
    "PB": ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux", "Sousa", "Cajazeiras"],
    "PI": ["Teresina", "Parnaíba", "Picos", "Piripiri", "Floriano", "Campo Maior"],
    "TO": ["Palmas", "Araguaína", "Gurupi", "Porto Nacional", "Paraíso do Tocantins"],
    "MT": ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra", "Cáceres"],
    "MS": ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã", "Aquidauana"],
    "RO": ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena", "Cacoal", "Rolim de Moura"],
    "AC": ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá"],
    "AP": ["Macapá", "Santana", "Laranjal do Jari", "Oiapoque"],
    "RR": ["Boa Vista", "Rorainópolis", "Caracaraí"],
  }

  // Buscar sugestões de cidade
  const buscarSugestoesCidade = (termoBusca: string) => {
    if (!termoBusca || termoBusca.length < 2) {
      setSugestoesCidade([])
      setShowSugestoes(false)
      return
    }

    const termo = termoBusca.toLowerCase()
    let cidadesFiltradas: string[] = []

    // Se tem UF selecionado, buscar apenas naquele estado
    if (formData.uf && cidadesPorEstado[formData.uf]) {
      cidadesFiltradas = cidadesPorEstado[formData.uf].filter(cidade =>
        cidade.toLowerCase().includes(termo)
      )
    } else {
      // Buscar em todos os estados
      Object.values(cidadesPorEstado).forEach(cidades => {
        const matches = cidades.filter(cidade =>
          cidade.toLowerCase().includes(termo)
        )
        cidadesFiltradas.push(...matches)
      })
    }

    // Remover duplicatas e limitar a 10 sugestões
    cidadesFiltradas = [...new Set(cidadesFiltradas)].slice(0, 10)
    
    setSugestoesCidade(cidadesFiltradas)
    setShowSugestoes(cidadesFiltradas.length > 0)
    setSugestaoSelecionada(-1)
  }

  // Selecionar sugestão
  const selecionarSugestao = (cidade: string) => {
    // Buscar UF da cidade selecionada
    let ufEncontrado = formData.uf // Manter UF atual se já houver
    
    // Se não tem UF selecionado, buscar qual estado tem essa cidade
    if (!ufEncontrado) {
      for (const [uf, cidades] of Object.entries(cidadesPorEstado)) {
        if (cidades.includes(cidade)) {
          ufEncontrado = uf
          break
        }
      }
    }
    
    setFormData({ ...formData, cidade, uf: ufEncontrado })
    setShowSugestoes(false)
    setSugestoesCidade([])
    setSugestaoSelecionada(-1)
    console.log('✅ Cidade selecionada:', cidade, '| UF:', ufEncontrado)
  }

  // Navegar pelas sugestões com setas
  const handleCidadeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSugestoes || sugestoesCidade.length === 0) {
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSugestaoSelecionada(prev => 
          prev < sugestoesCidade.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSugestaoSelecionada(prev => 
          prev > 0 ? prev - 1 : sugestoesCidade.length - 1
        )
        break
      case 'Enter':
      case 'Tab':
        e.preventDefault()
        if (sugestaoSelecionada >= 0) {
          selecionarSugestao(sugestoesCidade[sugestaoSelecionada])
        } else if (sugestoesCidade.length > 0) {
          selecionarSugestao(sugestoesCidade[0])
        }
        break
      case 'Escape':
        setShowSugestoes(false)
        setSugestoesCidade([])
        setSugestaoSelecionada(-1)
        break
    }
  }

  const handleNovo = () => {
    setFormData({
      codigo: '0',
      descricao: '',
      logradouro: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: ''
    })
    setSelectedEstabelecimento(-1)
    setShowSugestoes(false)
    setSugestoesCidade([])
    setSugestaoSelecionada(-1)
  }

  const handleGravar = () => {
    // Validar campos obrigatórios
    if (!formData.descricao.trim()) {
      alert('⚠️ Campo "Descrição" é obrigatório!')
      return
    }
    if (!formData.cidade.trim()) {
      alert('⚠️ Campo "Cidade" é obrigatório!')
      return
    }
    if (!formData.uf.trim()) {
      alert('⚠️ Campo "UF" é obrigatório!')
      return
    }

    console.log('Salvando estabelecimento:', formData)

    // Verificar se está editando ou criando novo
    if (selectedEstabelecimento >= 0) {
      // Editando estabelecimento existente
      const novosEstabelecimentos = [...estabelecimentos]
      novosEstabelecimentos[selectedEstabelecimento] = { ...formData }
      setEstabelecimentos(novosEstabelecimentos)
      console.log('✅ Estabelecimento atualizado!')
      alert('✅ Estabelecimento atualizado com sucesso!')
    } else {
      // Criando novo estabelecimento - gerar código automaticamente
      const novoCodigo = (estabelecimentos.length + 1).toString().padStart(3, '0')
      const novoEstabelecimento = { ...formData, codigo: novoCodigo }
      setEstabelecimentos([...estabelecimentos, novoEstabelecimento])
      console.log('✅ Novo estabelecimento adicionado com código:', novoCodigo)
      alert(`✅ Estabelecimento salvo com sucesso! Código: ${novoCodigo}`)
    }

    handleNovo()
  }

  const handleExcluir = () => {
    if (selectedEstabelecimento < 0) {
      alert('⚠️ Selecione um estabelecimento para excluir!')
      return
    }

    if (confirm('⚠️ Deseja realmente excluir este estabelecimento?')) {
      const novosEstabelecimentos = estabelecimentos.filter((_, index) => index !== selectedEstabelecimento)
      setEstabelecimentos(novosEstabelecimentos)
      handleNovo()
      alert('✅ Estabelecimento excluído com sucesso!')
    }
  }

  const handleSelecionarEstabelecimento = (index: number) => {
    setSelectedEstabelecimento(index)
    const estabelecimento = estabelecimentos[index]
    setFormData({
      codigo: estabelecimento.codigo,
      descricao: estabelecimento.descricao,
      cep: estabelecimento.cep,
      logradouro: estabelecimento.logradouro,
      endereco: estabelecimento.endereco,
      numero: estabelecimento.numero,
      complemento: estabelecimento.complemento,
      bairro: estabelecimento.bairro,
      cidade: estabelecimento.cidade,
      uf: estabelecimento.uf
    })
    console.log('✅ Estabelecimento carregado para edição:', estabelecimento.descricao)
  }

  const getInputStyles = (fieldName: string) => ({
    width: '100%',
    padding: '4px 8px',
    fontSize: '12px',
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    backgroundColor: focusedField === fieldName ? (currentTheme === 'dark' ? '#ffd4a3' : '#ffedd5') : theme.background,
    color: focusedField === fieldName ? (currentTheme === 'dark' ? '#1a1a1a' : '#000000') : theme.text,
    outline: 'none',
    height: '28px',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease',
    lineHeight: '20px',
    WebkitBoxShadow: focusedField === fieldName ? `0 0 0 1000px ${currentTheme === 'dark' ? '#ffd4a3' : '#ffedd5'} inset` : `0 0 0 1000px ${theme.background} inset`,
    WebkitTextFillColor: focusedField === fieldName ? (currentTheme === 'dark' ? '#1a1a1a' : '#000000') : theme.text,
    boxShadow: focusedField === fieldName ? `0 0 0 1000px ${currentTheme === 'dark' ? '#ffd4a3' : '#ffedd5'} inset` : 'none'
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
    paddingRight: '28px',
    verticalAlign: 'middle'
  })

  const labelStyles = {
    fontSize: '11px',
    fontWeight: '600' as const,
    marginBottom: '2px',
    display: 'block',
    color: theme.text,
    height: '16px',
    lineHeight: '16px'
  }

  const sectionTitleStyles = {
    fontSize: '12px',
    fontWeight: '700' as const,
    marginBottom: '8px',
    marginTop: '8px',
    color: theme.text,
    borderBottom: `1px solid ${theme.border}`,
    paddingBottom: '4px'
  }

  const buttonStyles = {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600' as const,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: '#6c757d',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  }

  const tabStyles = (isActive: boolean) => ({
    padding: '6px 16px',
    fontSize: '12px',
    fontWeight: '600' as const,
    border: 'none',
    borderRadius: '4px 4px 0 0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: isActive ? theme.primary : theme.surface,
    color: isActive ? '#fff' : theme.text,
    marginRight: '4px'
  })

  const listItemStyles = (isSelected: boolean) => ({
    padding: '6px 8px',
    fontSize: '12px',
    cursor: 'pointer',
    backgroundColor: isSelected ? '#0066cc' : 'transparent',
    color: isSelected ? '#fff' : theme.text,
    transition: 'all 0.2s ease'
  })

  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'

  return (
    <BasePage
      title="Cadastro de Hospitais e Cemitérios"
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
        padding: '12px',
        gap: '8px',
        height: '100%'
      }}>
        {/* Abas */}
        <div style={{ display: 'flex', gap: '0px' }}>
          <button
            onClick={() => setActiveTab('hospitais')}
            style={tabStyles(activeTab === 'hospitais')}
            onMouseEnter={(e) => {
              if (activeTab !== 'hospitais') {
                e.currentTarget.style.backgroundColor = theme.border
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'hospitais') {
                e.currentTarget.style.backgroundColor = theme.surface
              }
            }}
          >
            Hospitais
          </button>
          <button
            onClick={() => setActiveTab('cemiterios')}
            style={tabStyles(activeTab === 'cemiterios')}
            onMouseEnter={(e) => {
              if (activeTab !== 'cemiterios') {
                e.currentTarget.style.backgroundColor = theme.border
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'cemiterios') {
                e.currentTarget.style.backgroundColor = theme.surface
              }
            }}
          >
            Cemitérios
          </button>
          <button
            onClick={() => setActiveTab('funerarias')}
            style={tabStyles(activeTab === 'funerarias')}
            onMouseEnter={(e) => {
              if (activeTab !== 'funerarias') {
                e.currentTarget.style.backgroundColor = theme.border
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'funerarias') {
                e.currentTarget.style.backgroundColor = theme.surface
              }
            }}
          >
            Funerárias
          </button>
        </div>

        {/* Seção Cadastro */}
        <div style={sectionTitleStyles}>Cadastro / Manutenção</div>

        {/* Linha 1: Código, Descrição */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '120px' }}>
            <label style={labelStyles}>Código</label>
            <input
              type="text"
              value={formData.codigo}
              readOnly
              style={{ 
                ...getInputStyles('codigo'), 
                width: '100%',
                backgroundColor: theme.surface,
                cursor: 'not-allowed',
                opacity: 0.8
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyles}>
              {activeTab === 'funerarias' ? 'Descrição da Funerária' : 'Descrição do Estabelecimento'} <span style={{ color: '#ff4444' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              onFocus={() => setFocusedField('descricao')}
              onBlur={() => setFocusedField(null)}
              style={{ ...getInputStyles('descricao'), width: '100%' }}
            />
          </div>
          <div style={{ width: '180px' }}>
            <label style={labelStyles}>CEP</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={formData.cep}
                onChange={(e) => {
                  const valorFormatado = formatarCEP(e.target.value)
                  setFormData({ ...formData, cep: valorFormatado })
                }}
                onFocus={() => setFocusedField('cep')}
                onBlur={() => setFocusedField(null)}
                placeholder="00000-000"
                maxLength={9}
                style={{ ...getInputStyles('cep'), width: '100%', paddingRight: '30px' }}
              />
              <button
                onClick={() => {
                  console.log('🔍 Lupa clicada! CEP:', formData.cep)
                  if (formData.cep.replace(/\D/g, '').length === 8 && !buscandoCEP) {
                    buscarCEP(formData.cep)
                  }
                }}
                style={{
                  position: 'absolute',
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
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                title="Buscar endereço por CEP"
              >
                🔍
              </button>
            </div>
          </div>
        </div>

        {/* Linha 2: Logradouro, Endereço, Número, Complemento */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '140px' }}>
            <label style={labelStyles}>Logradouro</label>
            <select
              value={formData.logradouro}
              onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
              onFocus={() => setFocusedField('logradouro')}
              onBlur={() => setFocusedField(null)}
              style={{ ...getSelectStyles('logradouro'), width: '100%' }}
            >
              <option value="">--</option>
              {tiposLogradouro.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyles}>Endereço</label>
            <input
              type="text"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              onFocus={() => setFocusedField('endereco')}
              onBlur={() => setFocusedField(null)}
              style={{ ...getInputStyles('endereco'), width: '100%' }}
            />
          </div>
          <div style={{ width: '100px' }}>
            <label style={labelStyles}>Número</label>
            <input
              type="text"
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              onFocus={() => setFocusedField('numero')}
              onBlur={() => setFocusedField(null)}
              style={{ ...getInputStyles('numero'), width: '100%' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyles}>Complemento</label>
            <input
              type="text"
              value={formData.complemento}
              onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
              onFocus={() => setFocusedField('complemento')}
              onBlur={() => setFocusedField(null)}
              style={{ ...getInputStyles('complemento'), width: '100%' }}
            />
          </div>
        </div>

        {/* Linha 3: Bairro, Cidade, UF */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '280px' }}>
            <label style={labelStyles}>Bairro</label>
            <input
              type="text"
              value={formData.bairro}
              onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
              onFocus={() => setFocusedField('bairro')}
              onBlur={() => setFocusedField(null)}
              style={{ ...getInputStyles('bairro'), width: '100%' }}
            />
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <label style={labelStyles}>Cidade <span style={{ color: '#ff4444' }}>*</span></label>
            <input
              type="text"
              value={formData.cidade}
              onChange={(e) => {
                setFormData({ ...formData, cidade: e.target.value })
                buscarSugestoesCidade(e.target.value)
              }}
              onKeyDown={handleCidadeKeyDown}
              onFocus={() => {
                setFocusedField('cidade')
                if (formData.cidade.length >= 2) {
                  buscarSugestoesCidade(formData.cidade)
                }
              }}
              onBlur={() => {
                // Delay para permitir clique na sugestão
                setTimeout(() => {
                  setFocusedField(null)
                  setShowSugestoes(false)
                }, 200)
              }}
              style={{ ...getInputStyles('cidade'), width: '100%' }}
              autoComplete="off"
            />
            {showSugestoes && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: '200px',
                overflowY: 'auto',
                backgroundColor: theme.background,
                border: `1px solid ${theme.border}`,
                borderRadius: '3px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                zIndex: 1000,
                marginTop: '2px'
              }}>
                {sugestoesCidade.length > 0 ? (
                  sugestoesCidade.map((cidade, index) => (
                    <div
                      key={index}
                      onClick={() => selecionarSugestao(cidade)}
                      onMouseEnter={() => setSugestaoSelecionada(index)}
                      style={{
                        padding: '6px 8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        backgroundColor: sugestaoSelecionada === index ? theme.primary : 'transparent',
                        color: sugestaoSelecionada === index ? '#fff' : theme.text,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {cidade}
                    </div>
                  ))
                ) : (
                  <div style={{
                    padding: '8px',
                    fontSize: '11px',
                    color: theme.text,
                    opacity: 0.6,
                    textAlign: 'center'
                  }}>
                    {formData.uf 
                      ? `Nenhuma cidade encontrada em ${formData.uf}`
                      : 'Nenhuma cidade encontrada. Selecione uma UF primeiro.'}
                  </div>
                )}
              </div>
            )}
          </div>
          <div style={{ width: '100px' }}>
            <label style={labelStyles}>UF <span style={{ color: '#ff4444' }}>*</span></label>
            <select
              value={formData.uf}
              onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
              onFocus={() => setFocusedField('uf')}
              onBlur={() => setFocusedField(null)}
              style={{ ...getSelectStyles('uf'), width: '100%' }}
            >
              <option value="">--</option>
              {estados.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Estabelecimentos */}
        <div style={sectionTitleStyles}>Descrição do Estabelecimento</div>
        <div style={{
          flex: 1,
          border: `1px solid ${theme.border}`,
          borderRadius: '4px',
          overflow: 'auto',
          backgroundColor: theme.background
        }}>
          {estabelecimentos.length === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: theme.text,
              opacity: 0.5,
              fontSize: '12px'
            }}>
              Nenhum {activeTab === 'hospitais' ? 'hospital' : (activeTab === 'cemiterios' ? 'cemitério' : 'funerária')} cadastrado.
              <br />
              Preencha os campos acima e clique em "Gravar".
            </div>
          ) : (
            estabelecimentos.map((estab, index) => (
              <div
                key={index}
                style={listItemStyles(selectedEstabelecimento === index)}
                onClick={() => handleSelecionarEstabelecimento(index)}
                onMouseEnter={(e) => {
                  if (selectedEstabelecimento !== index) {
                    e.currentTarget.style.backgroundColor = theme.border
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedEstabelecimento !== index) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                {estab.descricao}
              </div>
            ))
          )}
        </div>

        {/* Botões de Ação */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          paddingTop: '8px',
          borderTop: `1px solid ${theme.border}`
        }}>
          <button
            onClick={handleNovo}
            style={buttonStyles}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#495057'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
          >
            <span>📄</span>
            <span>Novo</span>
          </button>
          <button
            onClick={handleGravar}
            style={buttonStyles}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#495057'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
          >
            <span>💾</span>
            <span>Gravar</span>
          </button>
          <button
            onClick={handleExcluir}
            disabled={selectedEstabelecimento < 0}
            style={{
              ...buttonStyles,
              opacity: selectedEstabelecimento < 0 ? 0.5 : 1,
              cursor: selectedEstabelecimento < 0 ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (selectedEstabelecimento >= 0) {
                e.currentTarget.style.backgroundColor = '#495057'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedEstabelecimento >= 0) {
                e.currentTarget.style.backgroundColor = '#6c757d'
              }
            }}
          >
            <span>❌</span>
            <span>Excluir</span>
          </button>
          <button
            onClick={onClose}
            style={buttonStyles}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#495057'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
          >
            <span>🚪</span>
            <span>Retornar</span>
          </button>
        </div>
      </div>
    </BasePage>
  )
}

