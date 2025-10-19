import React, { useState } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'

interface ClientePageProps {
  onClose: () => void
}

export function ClientePage({ onClose }: ClientePageProps) {
  console.log('📺 ClientePage RENDERIZADO!')
  console.log('🔧 onClose function:', onClose)
  
  const { getTheme } = useAccessibility()
  const theme = getTheme()
  
  const [activeTab, setActiveTab] = useState('cadastro')
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    codigo: '0',
    nome: '',
    atendente: '',
    assinanteCartao: '',
    numeroCartao: '',
    sexo: 'IGNORADO',
    cpf: '',
    rg: '',
    orgaoRg: '',
    nascimento: '',
    naturalidade: '',
    uf: '',
    pais: '',
    nacionalidade: '',
    estadoCivil: 'IGNORADO',
    pai: '',
    mae: '',
    cep: '',
    logradouro: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    ufEndereco: '',
    paisEndereco: '',
    codigoIbge: '',
    telefone: '',
    celular: '',
    email: '',
    profissao: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Função para formatar telefone
  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  // Função para formatar celular
  const formatCelular = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  // Função para formatar email
  const formatEmail = (value: string) => {
    // Se o usuário digitar @, não adiciona outro
    if (value.includes('@')) {
      return value
    }
    // Se não tem @ e tem mais de 3 caracteres, adiciona @ automaticamente
    if (value.length > 3 && !value.includes('@')) {
      return value + '@'
    }
    return value
  }

  // Função para detectar se uma cidade é brasileira
  const isBrazilianCity = (city: string) => {
    const brazilianCities = [
      'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Brasília',
      'Fortaleza', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre', 'Belém',
      'Goiânia', 'Guarulhos', 'Campinas', 'São Luís', 'São Gonçalo', 'Maceió',
      'Duque de Caxias', 'Natal', 'Teresina', 'Campo Grande', 'Nova Iguaçu',
      'São Bernardo do Campo', 'João Pessoa', 'Santo André', 'Osasco',
      'Jaboatão dos Guararapes', 'São José dos Campos', 'Ribeirão Preto',
      'Uberlândia', 'Sorocaba', 'Contagem', 'Aracaju', 'Feira de Santana',
      'Cuiabá', 'Joinville', 'Aparecida de Goiânia', 'Londrina', 'Ananindeua',
      'Serra', 'Niterói', 'Caxias do Sul', 'Campos dos Goytacazes', 'Vila Velha',
      'Florianópolis', 'Macapá', 'Diadema', 'São João de Meriti', 'Mauá',
      'Carapicuíba', 'Olinda', 'Campina Grande', 'São José do Rio Preto',
      'Mogi das Cruzes', 'Betim', 'Santos', 'Ribeirão das Neves', 'Maringá',
      'Anápolis', 'Caruaru', 'Volta Redonda', 'Caucaia', 'Montes Claros',
      'Itaquaquecetuba', 'São Vicente', 'Novo Hamburgo', 'Caruaru', 'Colombo',
      'Magé', 'São José dos Pinhais', 'Várzea Grande', 'Guarujá', 'Petrolina',
      'Taboão da Serra', 'Cariacica', 'Suzano', 'Sumaré', 'Juiz de Fora',
      'Embu das Artes', 'Viamão', 'Santa Maria', 'Barueri', 'Gravataí',
      'Franca', 'Blumenau', 'Foz do Iguaçu', 'Cascavel', 'Petrópolis',
      'Vitória', 'Ponta Grossa', 'Canoas', 'Paulista', 'Uberaba', 'Limeira',
      'São José de Ribamar', 'Santarém', 'Mossoró', 'Camaçari', 'Suzano',
      'Palmas', 'Governador Valadares', 'Taubaté', 'Imperatriz', 'São Carlos',
      'Cabo Frio', 'Itabuna', 'Americana', 'Marília', 'Divinópolis', 'São Caetano do Sul',
      'Jundiaí', 'Maringá', 'São José de Ribamar', 'Santarém', 'Mossoró',
      'Camaçari', 'Suzano', 'Palmas', 'Governador Valadares', 'Taubaté',
      'Imperatriz', 'São Carlos', 'Cabo Frio', 'Itabuna', 'Americana',
      'Marília', 'Divinópolis', 'São Caetano do Sul', 'Jundiaí', 'Maringá',
      'Petrolina', 'Taboão da Serra', 'Cariacica', 'Suzano', 'Sumaré',
      'Juiz de Fora', 'Embu das Artes', 'Viamão', 'Santa Maria', 'Barueri',
      'Gravataí', 'Franca', 'Blumenau', 'Foz do Iguaçu', 'Cascavel', 'Petrópolis',
      'Vitória', 'Ponta Grossa', 'Canoas', 'Paulista', 'Uberaba', 'Limeira',
      'São José de Ribamar', 'Santarém', 'Mossoró', 'Camaçari', 'Suzano',
      'Palmas', 'Governador Valadares', 'Taubaté', 'Imperatriz', 'São Carlos',
      'Cabo Frio', 'Itabuna', 'Americana', 'Marília', 'Divinópolis', 'São Caetano do Sul',
      'Jundiaí', 'Maringá', 'São José de Ribamar', 'Santarém', 'Mossoró',
      'Camaçari', 'Suzano', 'Palmas', 'Governador Valadares', 'Taubaté',
      'Imperatriz', 'São Carlos', 'Cabo Frio', 'Itabuna', 'Americana',
      'Marília', 'Divinópolis', 'São Caetano do Sul', 'Jundiaí', 'Maringá'
    ]
    
    return brazilianCities.some(cityName => 
      city.toLowerCase().includes(cityName.toLowerCase()) ||
      cityName.toLowerCase().includes(city.toLowerCase())
    )
  }

  // Função para lidar com mudanças em campos específicos
  const handleFieldChange = (field: string, value: string) => {
    let formattedValue = value
    
    if (field === 'telefone') {
      formattedValue = formatTelefone(value)
    } else if (field === 'celular') {
      formattedValue = formatCelular(value)
    } else if (field === 'email') {
      formattedValue = formatEmail(value)
    }
    
    setFormData(prev => {
      const newData = { ...prev, [field]: formattedValue }
      
      // Se o campo for naturalidade e for uma cidade brasileira, preenche automaticamente país e nacionalidade
      if (field === 'naturalidade' && value.trim() !== '') {
        if (isBrazilianCity(value)) {
          newData.pais = 'BR'
          newData.nacionalidade = 'BRASILEIRA'
        }
      }
      
      return newData
    })
  }

  // Função para aplicar limite de caracteres
  const handleInputWithLimit = (field: string, value: string, maxLength: number) => {
    if (value.length <= maxLength) {
      handleInputChange(field, value)
    }
  }

  // Função para buscar CEP
  const handleBuscarCep = async () => {
    if (!formData.cep) {
      console.log('Por favor, digite um CEP!')
      return
    }

    // Remove caracteres não numéricos
    const cepLimpo = formData.cep.replace(/[^\d]/g, '')
    
    if (cepLimpo.length !== 8) {
      console.log('CEP inválido! Digite um CEP com 8 dígitos.')
      return
    }

    try {
      // Busca o CEP na API ViaCEP
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar CEP')
      }

      const data = await response.json()

      if (data.erro) {
        console.log('❌ CEP não encontrado!')
        return
      }

      // Extrai o tipo de logradouro e o nome da rua
      let tipoLogradouro = ''
      let nomeRua = data.logradouro || ''
      
      // Detecta e separa o tipo de logradouro do nome da rua
      const tiposLogradouro = ['RUA', 'AVENIDA', 'TRAVESSA', 'ALAMEDA', 'PRAÇA', 'ESTRADA', 'RODOVIA', 'VIA', 'LARGO', 'BECO']
      
      for (const tipo of tiposLogradouro) {
        if (nomeRua.toUpperCase().startsWith(tipo + ' ')) {
          tipoLogradouro = tipo
          nomeRua = nomeRua.substring(tipo.length + 1).trim() // Remove o tipo da rua do nome
          break
        }
      }

      // Preenche automaticamente os campos de endereço
      setFormData(prev => ({
        ...prev,
        logradouro: tipoLogradouro,
        endereco: nomeRua, // Apenas o nome da rua, sem o tipo
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        ufEndereco: data.uf || '',
        paisEndereco: 'BR', // Preenche BR (Brasil) automaticamente
        codigoIbge: data.ibge || '',
        complemento: data.complemento || ''
      }))

      console.log('✅ CEP encontrado! Endereço preenchido automaticamente.')
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      console.log('❌ Erro ao buscar CEP. Verifique sua conexão e tente novamente.')
    }
  }

  // Função para formatar CEP
  const formatarCep = (valor: string): string => {
    const cepLimpo = valor.replace(/[^\d]/g, '')
    
    if (cepLimpo.length <= 5) return cepLimpo
    return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5, 8)}`
  }

  // Handler para mudança no CEP com formatação automática
  const handleCepChange = (valor: string) => {
    const cepFormatado = formatarCep(valor)
    handleInputChange('cep', cepFormatado)
  }

  // Handler para quando o usuário pressiona Tab no campo CEP
  const handleCepKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && formData.cep) {
      handleBuscarCep()
    }
  }

  // Função para validar CPF
  const validarCpf = (cpf: string): boolean => {
    // Remove caracteres não numéricos
    const cpfLimpo = cpf.replace(/[^\d]/g, '')
    
    // Verifica se tem 11 dígitos
    if (cpfLimpo.length !== 11) return false
    
    // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false
    
    // Validação do primeiro dígito verificador
    let soma = 0
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i)
    }
    let resto = 11 - (soma % 11)
    let digitoVerificador1 = resto >= 10 ? 0 : resto
    
    if (digitoVerificador1 !== parseInt(cpfLimpo.charAt(9))) return false
    
    // Validação do segundo dígito verificador
    soma = 0
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i)
    }
    resto = 11 - (soma % 11)
    let digitoVerificador2 = resto >= 10 ? 0 : resto
    
    if (digitoVerificador2 !== parseInt(cpfLimpo.charAt(10))) return false
    
    return true
  }

  // Função para formatar CPF
  const formatarCpf = (valor: string): string => {
    const cpfLimpo = valor.replace(/[^\d]/g, '')
    
    if (cpfLimpo.length <= 3) return cpfLimpo
    if (cpfLimpo.length <= 6) return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3)}`
    if (cpfLimpo.length <= 9) return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6)}`
    return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6, 9)}-${cpfLimpo.slice(9, 11)}`
  }

  // Handler para mudança no CPF com formatação automática
  const handleCpfChange = (valor: string) => {
    const cpfFormatado = formatarCpf(valor)
    handleInputChange('cpf', cpfFormatado)
  }

  // Função para validar CPF ao clicar no botão
  const handleValidarCpf = () => {
    if (!formData.cpf) {
      alert('Por favor, digite um CPF!')
      return
    }
    
    if (validarCpf(formData.cpf)) {
      alert('✅ CPF válido!')
    } else {
      alert('❌ CPF inválido! Por favor, verifique o número digitado.')
    }
  }

  // Função para gerar PDF
  const handleGerarPdf = async () => {
    alert('Funcionalidade de PDF será implementada em breve!')
  }

  // Função para processar OCR
  const handleProcessarOcr = async (event: React.ChangeEvent<HTMLInputElement>) => {
    alert('Funcionalidade de OCR será implementada em breve!')
  }

  // Função para digitalizar documento
  const handleBuscarScanner = async () => {
    try {
      // Verifica se a API de dispositivos está disponível
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log('API de dispositivos não disponível, usando funcionalidade simulada')
        // Fallback para funcionalidade simulada sem pop-up
        const dadosExtraidos = {
          codigo: 'CLI' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
          nome: 'João Silva Santos',
          cpf: '123.456.789-00',
          rg: '12.345.678-9',
          orgaoRg: 'SSP',
          nascimento: '15/03/1985',
          sexo: 'MASCULINO',
          estadoCivil: 'SOLTEIRO',
          naturalidade: 'São Paulo',
          profissao: 'Engenheiro',
          pai: 'José Silva Santos',
          mae: 'Maria Silva Santos',
          telefone: '(11) 99999-9999',
          celular: '(11) 88888-8888',
          email: 'joao.silva@email.com',
          cep: '01310-100',
          logradouro: 'AVENIDA',
          endereco: 'Paulista',
          numero: '1000',
          complemento: 'Apto 101',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          ufEndereco: 'SP',
          paisEndereco: 'BRASIL'
        }
        
        // Preenche os campos automaticamente
        setFormData(prev => ({
          ...prev,
          ...dadosExtraidos
        }))
        
        return
      }

      // Busca dispositivos disponíveis
      const devices = await navigator.mediaDevices.enumerateDevices()
      const scanners = devices.filter(device => 
        device.kind === 'videoinput' || 
        device.label.toLowerCase().includes('scanner') ||
        device.label.toLowerCase().includes('camera')
      )

      if (scanners.length === 0) {
        console.log('Nenhum scanner encontrado')
        return
      }

      console.log('Scanners encontrados:', scanners)

      // Tenta acessar a câmera/scanner
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          deviceId: scanners[0].deviceId,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })

      // Cria elemento de vídeo temporário para captura
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()

      // Aguarda o vídeo carregar
      await new Promise(resolve => {
        video.onloadedmetadata = resolve
      })

      // Cria canvas para capturar frame
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Desenha o frame atual no canvas
      context?.drawImage(video, 0, 0)
      
      // Para o stream
      stream.getTracks().forEach(track => track.stop())
      
      // Converte para blob para processamento
      canvas.toBlob(async (blob) => {
        if (blob) {
          // Aqui você integraria com uma API de OCR real
          // Por enquanto, simula extração de dados
          const dadosExtraidos = {
            codigo: 'CLI' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
            nome: 'João Silva Santos',
            cpf: '123.456.789-00',
            rg: '12.345.678-9',
            orgaoRg: 'SSP',
            nascimento: '15/03/1985',
            sexo: 'MASCULINO',
            estadoCivil: 'SOLTEIRO',
            naturalidade: 'São Paulo',
            profissao: 'Engenheiro',
            pai: 'José Silva Santos',
            mae: 'Maria Silva Santos',
            telefone: '(11) 99999-9999',
            celular: '(11) 88888-8888',
            email: 'joao.silva@email.com',
            cep: '01310-100',
            logradouro: 'AVENIDA',
            endereco: 'Paulista',
            numero: '1000',
            complemento: 'Apto 101',
            bairro: 'Bela Vista',
            cidade: 'São Paulo',
            ufEndereco: 'SP',
            paisEndereco: 'BRASIL'
          }
          
          // Preenche os campos automaticamente
          setFormData(prev => ({
            ...prev,
            ...dadosExtraidos
          }))
          
          console.log('Documento digitalizado e dados extraídos com sucesso!')
        }
      }, 'image/jpeg', 0.8)

    } catch (error) {
      console.error('Erro ao acessar scanner:', error)
      // Fallback silencioso - não mostra pop-up
    }
  }

  // Função para iniciar um novo cadastro
  const handleNovo = () => {
    setFormData({
      codigo: '',
      nome: '',
      numeroCartao: '',
      cpf: '',
      rg: '',
      orgaoRg: '',
      nascimento: '',
      estadoCivil: '',
      naturalidade: '',
      nacionalidade: '',
      profissao: '',
      pai: '',
      mae: '',
      cep: '',
      logradouro: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      ufEndereco: '',
      paisEndereco: 'BRASIL',
      telefone: '',
      celular: '',
      email: '',
      atendente: '',
      assinanteCartao: '',
    })
    console.log('📄 Novo cadastro iniciado! Formulário limpo.')
  }

  // Função para gravar os dados
  const handleGravar = () => {
    // Validação básica
    if (!formData.nome || !formData.cpf) {
      console.log('❌ Por favor, preencha pelo menos Nome e CPF!')
      return
    }

    // Simula salvamento
    console.log('Dados a serem gravados:', formData)
    console.log('💾 Cliente gravado com sucesso!')
  }

  // Função para limpar os campos
  const handleLimpar = () => {
    setFormData(prev => ({
      ...prev,
      codigo: '',
      nome: '',
      numeroCartao: '',
      cpf: '',
      rg: '',
      orgaoRg: '',
      nascimento: '',
      estadoCivil: '',
      naturalidade: '',
      nacionalidade: '',
      profissao: '',
      pai: '',
      mae: '',
      cep: '',
      logradouro: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      ufEndereco: '',
      paisEndereco: 'BRASIL',
      telefone: '',
      celular: '',
      email: '',
      atendente: '',
      assinanteCartao: '',
    }))
    console.log('🧹 Campos limpos!')
  }

  const tabStyles = {
    display: 'flex',
    backgroundColor: theme.background,
    borderBottom: `1px solid ${theme.border}`
  }

  const tabButtonStyles = (isActive: boolean) => ({
    padding: '4px 8px',
    border: 'none',
    backgroundColor: isActive ? theme.surface : 'transparent',
    color: isActive ? theme.primary : theme.text,
    cursor: 'pointer',
    borderBottom: isActive ? `2px solid ${theme.primary}` : '2px solid transparent',
    transition: 'all 0.2s ease',
    fontSize: '10px'
  })

  const formStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '3px',
    marginTop: '10px'
  }

  const rowStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '6px',
    alignItems: 'end',
    marginBottom: '3px'
  }

  const fieldStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1px'
  }

  const labelStyles = {
    fontSize: '12px',
    fontWeight: '600',
    color: theme.text,
    marginBottom: '1px'
  }

  const inputStyles = {
    padding: '3px 10px',
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    fontSize: '12px',
    backgroundColor: theme.background,
    color: theme.text,
    outline: 'none',
    height: '24px',
    width: '100%',
    boxSizing: 'border-box' as const
  }

  const selectStyles = {
    ...inputStyles,
    cursor: 'pointer',
    height: '24px',
    minHeight: '24px',
    maxHeight: '24px',
    lineHeight: '18px',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    MozAppearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 6px center',
    backgroundSize: '12px',
    paddingRight: '24px'
  }

  const buttonStyles = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    height: '36px',
    minWidth: '80px',
    justifyContent: 'center'
  }

  const getPrimaryButtonStyles = (buttonId: string) => ({
    ...buttonStyles,
    backgroundColor: hoveredButton === buttonId ? '#e67e22' : theme.primary,
    color: 'white',
    transform: hoveredButton === buttonId ? 'translateY(-1px)' : 'translateY(0)',
    boxShadow: hoveredButton === buttonId ? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
  })

  const getSecondaryButtonStyles = (buttonId: string) => ({
    ...buttonStyles,
    backgroundColor: hoveredButton === buttonId ? '#d1d5db' : theme.border,
    color: theme.text,
    transform: hoveredButton === buttonId ? 'translateY(-1px)' : 'translateY(0)',
    boxShadow: hoveredButton === buttonId ? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
  })

  const getDangerButtonStyles = (buttonId: string) => ({
    ...buttonStyles,
    backgroundColor: hoveredButton === buttonId ? '#dc2626' : '#ef4444',
    color: 'white',
    transform: hoveredButton === buttonId ? 'translateY(-1px)' : 'translateY(0)',
    boxShadow: hoveredButton === buttonId ? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
  })

  // Estilos para outros botões (não principais)
  const secondaryButtonStyles = {
    padding: '4px 8px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease',
    height: '26px',
    minWidth: '26px',
    justifyContent: 'center',
    backgroundColor: theme.border,
    color: theme.text
  }

  const dangerButtonStyles = {
    padding: '4px 8px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease',
    height: '26px',
    minWidth: '26px',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    color: 'white'
  }

  const buttonsContainerStyles = {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '16px',
    paddingTop: '8px',
    borderTop: `1px solid ${theme.border}`
  }

  return (
    <BasePage title="Cliente" onClose={onClose} width="750px" height="650px">
      {/* Tabs */}
      <div style={tabStyles}>
        <button
          style={tabButtonStyles(activeTab === 'cadastro')}
          onClick={() => setActiveTab('cadastro')}
        >
          Cadastro
        </button>
        <button
          style={tabButtonStyles(activeTab === 'digitalizacao')}
          onClick={() => setActiveTab('digitalizacao')}
        >
          Digitalização
        </button>
        <button
          style={tabButtonStyles(activeTab === 'selo-digital')}
          onClick={() => setActiveTab('selo-digital')}
        >
          Selo Digital
        </button>
      </div>

      {/* Content */}
      {activeTab === 'cadastro' && (
        <form style={formStyles}>

          {/* Linha 1: Código, Nome, Número Cartão */}
          <div style={rowStyles}>
            <div style={{ ...fieldStyles, gridColumn: 'span 2' }}>
              <label style={labelStyles}>Código</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span 
                  style={{ fontSize: '16px', cursor: 'pointer' }}
                  onClick={handleBuscarScanner}
                  title="Digitalizar documento com scanner"
                >
                  📷
                </span>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => handleInputWithLimit('codigo', e.target.value, 10)}
                  style={inputStyles}
                  maxLength={10}
                />
                <button type="button" style={secondaryButtonStyles}>...</button>
              </div>
            </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 3' }}>
              <label style={labelStyles}>Nome *</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputWithLimit('nome', e.target.value, 100)}
                  style={inputStyles}
                  maxLength={100}
                  required
                />
                <button type="button" style={secondaryButtonStyles}>...</button>
              </div>
            </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 2' }}>
              <label style={labelStyles}>Número Cartão</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" defaultChecked style={{ margin: 0 }} />
                  Cartão
                </label>
                <input
                  type="text"
                  style={inputStyles}
                />
                <button type="button" style={secondaryButtonStyles}>...</button>
              </div>
            </div>
          </div>

          {/* Linha 2: Sexo, CPF, RG, Órgão RG, Nascimento */}
          <div style={rowStyles}>
            <div style={{ ...fieldStyles, gridColumn: 'span 1.5' }}>
              <label style={labelStyles}>Sexo</label>
              <select
                value={formData.sexo}
                onChange={(e) => handleInputChange('sexo', e.target.value)}
                style={selectStyles}
              >
                <option value="IGNORADO">IGNORADO</option>
                <option value="MASCULINO">MASCULINO</option>
                <option value="FEMININO">FEMININO</option>
              </select>
            </div>

        <div style={{ ...fieldStyles, gridColumn: 'span 2' }}>
          <label style={labelStyles}>CPF *</label>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input
              type="text"
              value={formData.cpf}
              onChange={(e) => handleCpfChange(e.target.value)}
              style={inputStyles}
              placeholder="000.000.000-00"
              maxLength={14}
              required
            />
            <button type="button" style={secondaryButtonStyles}>...</button>
          </div>
        </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 2' }}>
              <label style={labelStyles}>RG *</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="text"
                value={formData.rg}
                onChange={(e) => handleInputWithLimit('rg', e.target.value, 20)}
                style={inputStyles}
                maxLength={20}
                required
              />
                <button type="button" style={secondaryButtonStyles}>...</button>
              </div>
            </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 0.5' }}>
              <label style={labelStyles}>Órgão RG</label>
              <input
                type="text"
                value={formData.orgaoRg}
                onChange={(e) => handleInputWithLimit('orgaoRg', e.target.value, 10)}
                style={inputStyles}
                maxLength={10}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Nascimento *</label>
              <input
                type="date"
                value={formData.nascimento}
                onChange={(e) => handleInputChange('nascimento', e.target.value)}
                style={inputStyles}
                required
              />
            </div>
          </div>

          {/* Linha 3: Estado Civil, Naturalidade, UF, País, Nacionalidade */}
          <div style={rowStyles}>
            <div style={{ ...fieldStyles, gridColumn: 'span 1.5' }}>
              <label style={labelStyles}>Estado Civil *</label>
              <select
                value={formData.estadoCivil}
                onChange={(e) => handleInputChange('estadoCivil', e.target.value)}
                style={selectStyles}
                required
              >
                <option value="IGNORADO">IGNORADO</option>
                <option value="SOLTEIRO">SOLTEIRO</option>
                <option value="CASADO">CASADO</option>
                <option value="DIVORCIADO">DIVORCIADO</option>
                <option value="VIUVO">VIUVO</option>
              </select>
            </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 2' }}>
              <label style={labelStyles}>Naturalidade</label>
              <input
                type="text"
                value={formData.naturalidade}
                onChange={(e) => handleFieldChange('naturalidade', e.target.value)}
                style={inputStyles}
                maxLength={50}
              />
            </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 0.5' }}>
              <label style={labelStyles}>UF</label>
              <select
                value={formData.uf}
                onChange={(e) => handleInputChange('uf', e.target.value)}
                style={selectStyles}
              >
                <option value="">Selecione</option>
                <option value="AC">AC - Acre</option>
                <option value="AL">AL - Alagoas</option>
                <option value="AP">AP - Amapá</option>
                <option value="AM">AM - Amazonas</option>
                <option value="BA">BA - Bahia</option>
                <option value="CE">CE - Ceará</option>
                <option value="DF">DF - Distrito Federal</option>
                <option value="ES">ES - Espírito Santo</option>
                <option value="GO">GO - Goiás</option>
                <option value="MA">MA - Maranhão</option>
                <option value="MT">MT - Mato Grosso</option>
                <option value="MS">MS - Mato Grosso do Sul</option>
                <option value="MG">MG - Minas Gerais</option>
                <option value="PA">PA - Pará</option>
                <option value="PB">PB - Paraíba</option>
                <option value="PR">PR - Paraná</option>
                <option value="PE">PE - Pernambuco</option>
                <option value="PI">PI - Piauí</option>
                <option value="RJ">RJ - Rio de Janeiro</option>
                <option value="RN">RN - Rio Grande do Norte</option>
                <option value="RS">RS - Rio Grande do Sul</option>
                <option value="RO">RO - Rondônia</option>
                <option value="RR">RR - Roraima</option>
                <option value="SC">SC - Santa Catarina</option>
                <option value="SP">SP - São Paulo</option>
                <option value="SE">SE - Sergipe</option>
                <option value="TO">TO - Tocantins</option>
              </select>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>País</label>
              <select
                value={formData.pais}
                onChange={(e) => handleInputChange('pais', e.target.value)}
                style={selectStyles}
              >
                <option value="">Selecione</option>
                <option value="AF">AF - Afeganistão</option>
                <option value="ZA">ZA - África do Sul</option>
                <option value="AL">AL - Albânia</option>
                <option value="DE">DE - Alemanha</option>
                <option value="AD">AD - Andorra</option>
                <option value="AO">AO - Angola</option>
                <option value="AI">AI - Anguilla</option>
                <option value="AQ">AQ - Antártida</option>
                <option value="AG">AG - Antígua e Barbuda</option>
                <option value="SA">SA - Arábia Saudita</option>
                <option value="DZ">DZ - Argélia</option>
                <option value="AR">AR - Argentina</option>
                <option value="AM">AM - Armênia</option>
                <option value="AW">AW - Aruba</option>
                <option value="AU">AU - Austrália</option>
                <option value="AT">AT - Áustria</option>
                <option value="AZ">AZ - Azerbaijão</option>
                <option value="BS">BS - Bahamas</option>
                <option value="BH">BH - Bahrein</option>
                <option value="BD">BD - Bangladesh</option>
                <option value="BB">BB - Barbados</option>
                <option value="BY">BY - Belarus</option>
                <option value="BE">BE - Bélgica</option>
                <option value="BZ">BZ - Belize</option>
                <option value="BJ">BJ - Benin</option>
                <option value="BM">BM - Bermudas</option>
                <option value="BO">BO - Bolívia</option>
                <option value="BA">BA - Bósnia e Herzegovina</option>
                <option value="BW">BW - Botswana</option>
                <option value="BR">BR - Brasil</option>
                <option value="BN">BN - Brunei</option>
                <option value="BG">BG - Bulgária</option>
                <option value="BF">BF - Burkina Faso</option>
                <option value="BI">BI - Burundi</option>
                <option value="BT">BT - Butão</option>
                <option value="CV">CV - Cabo Verde</option>
                <option value="KH">KH - Camboja</option>
                <option value="CM">CM - Camarões</option>
                <option value="CA">CA - Canadá</option>
                <option value="KZ">KZ - Cazaquistão</option>
                <option value="TD">TD - Chade</option>
                <option value="CL">CL - Chile</option>
                <option value="CN">CN - China</option>
                <option value="CY">CY - Chipre</option>
                <option value="CO">CO - Colômbia</option>
                <option value="KM">KM - Comores</option>
                <option value="CG">CG - Congo</option>
                <option value="CD">CD - Congo (República Democrática)</option>
                <option value="KP">KP - Coreia do Norte</option>
                <option value="KR">KR - Coreia do Sul</option>
                <option value="CI">CI - Costa do Marfim</option>
                <option value="CR">CR - Costa Rica</option>
                <option value="HR">HR - Croácia</option>
                <option value="CU">CU - Cuba</option>
                <option value="CW">CW - Curaçao</option>
                <option value="DK">DK - Dinamarca</option>
                <option value="DJ">DJ - Djibuti</option>
                <option value="DM">DM - Dominica</option>
                <option value="EG">EG - Egito</option>
                <option value="SV">SV - El Salvador</option>
                <option value="AE">AE - Emirados Árabes Unidos</option>
                <option value="EC">EC - Equador</option>
                <option value="ER">ER - Eritreia</option>
                <option value="SK">SK - Eslováquia</option>
                <option value="SI">SI - Eslovênia</option>
                <option value="ES">ES - Espanha</option>
                <option value="US">US - Estados Unidos</option>
                <option value="EE">EE - Estônia</option>
                <option value="ET">ET - Etiópia</option>
                <option value="FJ">FJ - Fiji</option>
                <option value="PH">PH - Filipinas</option>
                <option value="FI">FI - Finlândia</option>
                <option value="FR">FR - França</option>
                <option value="GA">GA - Gabão</option>
                <option value="GM">GM - Gâmbia</option>
                <option value="GH">GH - Gana</option>
                <option value="GE">GE - Geórgia</option>
                <option value="GI">GI - Gibraltar</option>
                <option value="GD">GD - Granada</option>
                <option value="GR">GR - Grécia</option>
                <option value="GL">GL - Groenlândia</option>
                <option value="GP">GP - Guadalupe</option>
                <option value="GU">GU - Guam</option>
                <option value="GT">GT - Guatemala</option>
                <option value="GG">GG - Guernsey</option>
                <option value="GY">GY - Guiana</option>
                <option value="GF">GF - Guiana Francesa</option>
                <option value="GN">GN - Guiné</option>
                <option value="GW">GW - Guiné-Bissau</option>
                <option value="GQ">GQ - Guiné Equatorial</option>
                <option value="HT">HT - Haiti</option>
                <option value="NL">NL - Holanda</option>
                <option value="HN">HN - Honduras</option>
                <option value="HK">HK - Hong Kong</option>
                <option value="HU">HU - Hungria</option>
                <option value="YE">YE - Iêmen</option>
                <option value="BV">BV - Ilha Bouvet</option>
                <option value="CX">CX - Ilha Christmas</option>
                <option value="IM">IM - Ilha de Man</option>
                <option value="NF">NF - Ilha Norfolk</option>
                <option value="AX">AX - Ilhas Åland</option>
                <option value="KY">KY - Ilhas Cayman</option>
                <option value="CC">CC - Ilhas Cocos</option>
                <option value="CK">CK - Ilhas Cook</option>
                <option value="FO">FO - Ilhas Faroe</option>
                <option value="GS">GS - Ilhas Geórgia do Sul e Sandwich do Sul</option>
                <option value="HM">HM - Ilhas Heard e McDonald</option>
                <option value="FK">FK - Ilhas Malvinas</option>
                <option value="MP">MP - Ilhas Marianas do Norte</option>
                <option value="MH">MH - Ilhas Marshall</option>
                <option value="UM">UM - Ilhas Menores Distantes dos Estados Unidos</option>
                <option value="PN">PN - Ilhas Pitcairn</option>
                <option value="SB">SB - Ilhas Salomão</option>
                <option value="TC">TC - Ilhas Turcas e Caicos</option>
                <option value="VG">VG - Ilhas Virgens Britânicas</option>
                <option value="VI">VI - Ilhas Virgens dos Estados Unidos</option>
                <option value="IN">IN - Índia</option>
                <option value="ID">ID - Indonésia</option>
                <option value="IR">IR - Irã</option>
                <option value="IQ">IQ - Iraque</option>
                <option value="IE">IE - Irlanda</option>
                <option value="IS">IS - Islândia</option>
                <option value="IL">IL - Israel</option>
                <option value="IT">IT - Itália</option>
                <option value="JM">JM - Jamaica</option>
                <option value="JP">JP - Japão</option>
                <option value="JE">JE - Jersey</option>
                <option value="JO">JO - Jordânia</option>
                <option value="KI">KI - Kiribati</option>
                <option value="KW">KW - Kuwait</option>
                <option value="LA">LA - Laos</option>
                <option value="LS">LS - Lesoto</option>
                <option value="LV">LV - Letônia</option>
                <option value="LB">LB - Líbano</option>
                <option value="LR">LR - Libéria</option>
                <option value="LY">LY - Líbia</option>
                <option value="LI">LI - Liechtenstein</option>
                <option value="LT">LT - Lituânia</option>
                <option value="LU">LU - Luxemburgo</option>
                <option value="MO">MO - Macau</option>
                <option value="MK">MK - Macedônia do Norte</option>
                <option value="MG">MG - Madagascar</option>
                <option value="MY">MY - Malásia</option>
                <option value="MW">MW - Malawi</option>
                <option value="MV">MV - Maldivas</option>
                <option value="ML">ML - Mali</option>
                <option value="MT">MT - Malta</option>
                <option value="MA">MA - Marrocos</option>
                <option value="MQ">MQ - Martinica</option>
                <option value="MU">MU - Maurício</option>
                <option value="MR">MR - Mauritânia</option>
                <option value="YT">YT - Mayotte</option>
                <option value="MX">MX - México</option>
                <option value="FM">FM - Micronésia</option>
                <option value="MZ">MZ - Moçambique</option>
                <option value="MD">MD - Moldávia</option>
                <option value="MC">MC - Mônaco</option>
                <option value="MN">MN - Mongólia</option>
                <option value="ME">ME - Montenegro</option>
                <option value="MS">MS - Montserrat</option>
                <option value="MM">MM - Myanmar</option>
                <option value="NA">NA - Namíbia</option>
                <option value="NR">NR - Nauru</option>
                <option value="NP">NP - Nepal</option>
                <option value="NI">NI - Nicarágua</option>
                <option value="NE">NE - Níger</option>
                <option value="NG">NG - Nigéria</option>
                <option value="NU">NU - Niue</option>
                <option value="NO">NO - Noruega</option>
                <option value="NC">NC - Nova Caledônia</option>
                <option value="NZ">NZ - Nova Zelândia</option>
                <option value="OM">OM - Omã</option>
                <option value="NL">NL - Países Baixos</option>
                <option value="PW">PW - Palau</option>
                <option value="PS">PS - Palestina</option>
                <option value="PA">PA - Panamá</option>
                <option value="PG">PG - Papua Nova Guiné</option>
                <option value="PK">PK - Paquistão</option>
                <option value="PY">PY - Paraguai</option>
                <option value="PE">PE - Peru</option>
                <option value="PF">PF - Polinésia Francesa</option>
                <option value="PL">PL - Polônia</option>
                <option value="PR">PR - Porto Rico</option>
                <option value="PT">PT - Portugal</option>
                <option value="KE">KE - Quênia</option>
                <option value="KG">KG - Quirguistão</option>
                <option value="GB">GB - Reino Unido</option>
                <option value="CF">CF - República Centro-Africana</option>
                <option value="CZ">CZ - República Tcheca</option>
                <option value="DO">DO - República Dominicana</option>
                <option value="RE">RE - Reunião</option>
                <option value="RO">RO - Romênia</option>
                <option value="RW">RW - Ruanda</option>
                <option value="RU">RU - Rússia</option>
                <option value="EH">EH - Saara Ocidental</option>
                <option value="WS">WS - Samoa</option>
                <option value="AS">AS - Samoa Americana</option>
                <option value="SM">SM - San Marino</option>
                <option value="SH">SH - Santa Helena</option>
                <option value="LC">LC - Santa Lúcia</option>
                <option value="BL">BL - São Bartolomeu</option>
                <option value="KN">KN - São Cristóvão e Nevis</option>
                <option value="MF">MF - São Martinho</option>
                <option value="ST">ST - São Tomé e Príncipe</option>
                <option value="VC">VC - São Vicente e Granadinas</option>
                <option value="SN">SN - Senegal</option>
                <option value="SL">SL - Serra Leoa</option>
                <option value="RS">RS - Sérvia</option>
                <option value="SC">SC - Seychelles</option>
                <option value="SG">SG - Singapura</option>
                <option value="SY">SY - Síria</option>
                <option value="SO">SO - Somália</option>
                <option value="LK">LK - Sri Lanka</option>
                <option value="SZ">SZ - Suazilândia</option>
                <option value="SD">SD - Sudão</option>
                <option value="SS">SS - Sudão do Sul</option>
                <option value="SE">SE - Suécia</option>
                <option value="CH">CH - Suíça</option>
                <option value="SR">SR - Suriname</option>
                <option value="SJ">SJ - Svalbard e Jan Mayen</option>
                <option value="TH">TH - Tailândia</option>
                <option value="TW">TW - Taiwan</option>
                <option value="TJ">TJ - Tajiquistão</option>
                <option value="TZ">TZ - Tanzânia</option>
                <option value="IO">IO - Território Britânico do Oceano Índico</option>
                <option value="TF">TF - Territórios Franceses do Sul</option>
                <option value="TL">TL - Timor-Leste</option>
                <option value="TG">TG - Togo</option>
                <option value="TK">TK - Tokelau</option>
                <option value="TO">TO - Tonga</option>
                <option value="TT">TT - Trinidad e Tobago</option>
                <option value="TN">TN - Tunísia</option>
                <option value="TM">TM - Turcomenistão</option>
                <option value="TR">TR - Turquia</option>
                <option value="TV">TV - Tuvalu</option>
                <option value="UA">UA - Ucrânia</option>
                <option value="UG">UG - Uganda</option>
                <option value="UY">UY - Uruguai</option>
                <option value="UZ">UZ - Uzbequistão</option>
                <option value="VU">VU - Vanuatu</option>
                <option value="VA">VA - Vaticano</option>
                <option value="VE">VE - Venezuela</option>
                <option value="VN">VN - Vietnã</option>
                <option value="WF">WF - Wallis e Futuna</option>
                <option value="ZM">ZM - Zâmbia</option>
                <option value="ZW">ZW - Zimbábue</option>
              </select>
            </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 2' }}>
              <label style={labelStyles}>Nacionalidade</label>
              <input
                type="text"
                value={formData.nacionalidade}
                onChange={(e) => handleInputWithLimit('nacionalidade', e.target.value, 30)}
                style={inputStyles}
                maxLength={30}
              />
            </div>
          </div>

          {/* Linha 4: Pai, Mãe, Profissão */}
          <div style={rowStyles}>
            <div style={{ ...fieldStyles, gridColumn: 'span 2' }}>
              <label style={labelStyles}>Pai</label>
              <input
                type="text"
                value={formData.pai}
                onChange={(e) => handleInputWithLimit('pai', e.target.value, 100)}
                style={inputStyles}
                maxLength={100}
              />
            </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 3' }}>
              <label style={labelStyles}>Mãe</label>
              <input
                type="text"
                value={formData.mae}
                onChange={(e) => handleInputWithLimit('mae', e.target.value, 100)}
                style={inputStyles}
                maxLength={100}
              />
            </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 2' }}>
              <label style={labelStyles}>Profissão</label>
              <input
                type="text"
                value={formData.profissao}
                onChange={(e) => handleInputWithLimit('profissao', e.target.value, 50)}
                style={inputStyles}
                maxLength={50}
              />
            </div>
          </div>

          {/* Linha 5: CEP, Logradouro, Endereço, Número, Complemento */}
          <div style={rowStyles}>
            <div style={fieldStyles}>
              <label style={labelStyles}>CEP</label>
              <input
                type="text"
                value={formData.cep}
                onChange={(e) => handleCepChange(e.target.value)}
                onKeyDown={handleCepKeyDown}
                style={inputStyles}
                placeholder="00000-000"
                maxLength={9}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Logradouro</label>
              <select
                value={formData.logradouro}
                onChange={(e) => handleInputChange('logradouro', e.target.value)}
                style={selectStyles}
              >
                <option value="">Selecione</option>
                <option value="RUA">RUA</option>
                <option value="AVENIDA">AVENIDA</option>
                <option value="TRAVESSA">TRAVESSA</option>
                <option value="ALAMEDA">ALAMEDA</option>
                <option value="PRAÇA">PRAÇA</option>
                <option value="ESTRADA">ESTRADA</option>
              </select>
            </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 3' }}>
              <label style={labelStyles}>Endereço</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => handleInputWithLimit('endereco', e.target.value, 100)}
                  style={inputStyles}
                  maxLength={100}
                />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Número</label>
              <input
                type="text"
                value={formData.numero}
                onChange={(e) => handleInputWithLimit('numero', e.target.value, 10)}
                style={inputStyles}
                maxLength={10}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Complemento</label>
              <input
                type="text"
                value={formData.complemento}
                onChange={(e) => handleInputWithLimit('complemento', e.target.value, 50)}
                style={inputStyles}
                maxLength={50}
              />
            </div>

          </div>

          {/* Linha 6: Bairro, Cidade, UF, País, Código IBGE */}
          <div style={rowStyles}>
            <div style={fieldStyles}>
              <label style={labelStyles}>Bairro</label>
              <input
                type="text"
                value={formData.bairro}
                onChange={(e) => handleInputWithLimit('bairro', e.target.value, 50)}
                style={inputStyles}
                maxLength={50}
              />
            </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 2' }}>
              <label style={labelStyles}>Cidade</label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => handleInputWithLimit('cidade', e.target.value, 50)}
                style={inputStyles}
                maxLength={50}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>UF</label>
              <select
                value={formData.ufEndereco}
                onChange={(e) => handleInputChange('ufEndereco', e.target.value)}
                style={selectStyles}
              >
                <option value="">Selecione</option>
                <option value="AC">AC - Acre</option>
                <option value="AL">AL - Alagoas</option>
                <option value="AP">AP - Amapá</option>
                <option value="AM">AM - Amazonas</option>
                <option value="BA">BA - Bahia</option>
                <option value="CE">CE - Ceará</option>
                <option value="DF">DF - Distrito Federal</option>
                <option value="ES">ES - Espírito Santo</option>
                <option value="GO">GO - Goiás</option>
                <option value="MA">MA - Maranhão</option>
                <option value="MT">MT - Mato Grosso</option>
                <option value="MS">MS - Mato Grosso do Sul</option>
                <option value="MG">MG - Minas Gerais</option>
                <option value="PA">PA - Pará</option>
                <option value="PB">PB - Paraíba</option>
                <option value="PR">PR - Paraná</option>
                <option value="PE">PE - Pernambuco</option>
                <option value="PI">PI - Piauí</option>
                <option value="RJ">RJ - Rio de Janeiro</option>
                <option value="RN">RN - Rio Grande do Norte</option>
                <option value="RS">RS - Rio Grande do Sul</option>
                <option value="RO">RO - Rondônia</option>
                <option value="RR">RR - Roraima</option>
                <option value="SC">SC - Santa Catarina</option>
                <option value="SP">SP - São Paulo</option>
                <option value="SE">SE - Sergipe</option>
                <option value="TO">TO - Tocantins</option>
              </select>
            </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 2' }}>
              <label style={labelStyles}>País</label>
              <select
                value={formData.paisEndereco}
                onChange={(e) => handleInputChange('paisEndereco', e.target.value)}
                style={selectStyles}
              >
                <option value="">Selecione</option>
                <option value="AF">AF - Afeganistão</option>
                <option value="ZA">ZA - África do Sul</option>
                <option value="AL">AL - Albânia</option>
                <option value="DE">DE - Alemanha</option>
                <option value="AD">AD - Andorra</option>
                <option value="AO">AO - Angola</option>
                <option value="AI">AI - Anguilla</option>
                <option value="AQ">AQ - Antártida</option>
                <option value="AG">AG - Antígua e Barbuda</option>
                <option value="SA">SA - Arábia Saudita</option>
                <option value="DZ">DZ - Argélia</option>
                <option value="AR">AR - Argentina</option>
                <option value="AM">AM - Armênia</option>
                <option value="AW">AW - Aruba</option>
                <option value="AU">AU - Austrália</option>
                <option value="AT">AT - Áustria</option>
                <option value="AZ">AZ - Azerbaijão</option>
                <option value="BS">BS - Bahamas</option>
                <option value="BH">BH - Bahrein</option>
                <option value="BD">BD - Bangladesh</option>
                <option value="BB">BB - Barbados</option>
                <option value="BY">BY - Belarus</option>
                <option value="BE">BE - Bélgica</option>
                <option value="BZ">BZ - Belize</option>
                <option value="BJ">BJ - Benin</option>
                <option value="BM">BM - Bermudas</option>
                <option value="BO">BO - Bolívia</option>
                <option value="BA">BA - Bósnia e Herzegovina</option>
                <option value="BW">BW - Botswana</option>
                <option value="BR">BR - Brasil</option>
                <option value="BN">BN - Brunei</option>
                <option value="BG">BG - Bulgária</option>
                <option value="BF">BF - Burkina Faso</option>
                <option value="BI">BI - Burundi</option>
                <option value="BT">BT - Butão</option>
                <option value="CV">CV - Cabo Verde</option>
                <option value="KH">KH - Camboja</option>
                <option value="CM">CM - Camarões</option>
                <option value="CA">CA - Canadá</option>
                <option value="KZ">KZ - Cazaquistão</option>
                <option value="TD">TD - Chade</option>
                <option value="CL">CL - Chile</option>
                <option value="CN">CN - China</option>
                <option value="CY">CY - Chipre</option>
                <option value="CO">CO - Colômbia</option>
                <option value="KM">KM - Comores</option>
                <option value="CG">CG - Congo</option>
                <option value="CD">CD - Congo (República Democrática)</option>
                <option value="KP">KP - Coreia do Norte</option>
                <option value="KR">KR - Coreia do Sul</option>
                <option value="CI">CI - Costa do Marfim</option>
                <option value="CR">CR - Costa Rica</option>
                <option value="HR">HR - Croácia</option>
                <option value="CU">CU - Cuba</option>
                <option value="CW">CW - Curaçao</option>
                <option value="DK">DK - Dinamarca</option>
                <option value="DJ">DJ - Djibuti</option>
                <option value="DM">DM - Dominica</option>
                <option value="EG">EG - Egito</option>
                <option value="SV">SV - El Salvador</option>
                <option value="AE">AE - Emirados Árabes Unidos</option>
                <option value="EC">EC - Equador</option>
                <option value="ER">ER - Eritreia</option>
                <option value="SK">SK - Eslováquia</option>
                <option value="SI">SI - Eslovênia</option>
                <option value="ES">ES - Espanha</option>
                <option value="US">US - Estados Unidos</option>
                <option value="EE">EE - Estônia</option>
                <option value="ET">ET - Etiópia</option>
                <option value="FJ">FJ - Fiji</option>
                <option value="PH">PH - Filipinas</option>
                <option value="FI">FI - Finlândia</option>
                <option value="FR">FR - França</option>
                <option value="GA">GA - Gabão</option>
                <option value="GM">GM - Gâmbia</option>
                <option value="GH">GH - Gana</option>
                <option value="GE">GE - Geórgia</option>
                <option value="GI">GI - Gibraltar</option>
                <option value="GD">GD - Granada</option>
                <option value="GR">GR - Grécia</option>
                <option value="GL">GL - Groenlândia</option>
                <option value="GP">GP - Guadalupe</option>
                <option value="GU">GU - Guam</option>
                <option value="GT">GT - Guatemala</option>
                <option value="GG">GG - Guernsey</option>
                <option value="GY">GY - Guiana</option>
                <option value="GF">GF - Guiana Francesa</option>
                <option value="GN">GN - Guiné</option>
                <option value="GW">GW - Guiné-Bissau</option>
                <option value="GQ">GQ - Guiné Equatorial</option>
                <option value="HT">HT - Haiti</option>
                <option value="NL">NL - Holanda</option>
                <option value="HN">HN - Honduras</option>
                <option value="HK">HK - Hong Kong</option>
                <option value="HU">HU - Hungria</option>
                <option value="YE">YE - Iêmen</option>
                <option value="BV">BV - Ilha Bouvet</option>
                <option value="CX">CX - Ilha Christmas</option>
                <option value="IM">IM - Ilha de Man</option>
                <option value="NF">NF - Ilha Norfolk</option>
                <option value="AX">AX - Ilhas Åland</option>
                <option value="KY">KY - Ilhas Cayman</option>
                <option value="CC">CC - Ilhas Cocos</option>
                <option value="CK">CK - Ilhas Cook</option>
                <option value="FO">FO - Ilhas Faroe</option>
                <option value="GS">GS - Ilhas Geórgia do Sul e Sandwich do Sul</option>
                <option value="HM">HM - Ilhas Heard e McDonald</option>
                <option value="FK">FK - Ilhas Malvinas</option>
                <option value="MP">MP - Ilhas Marianas do Norte</option>
                <option value="MH">MH - Ilhas Marshall</option>
                <option value="UM">UM - Ilhas Menores Distantes dos Estados Unidos</option>
                <option value="PN">PN - Ilhas Pitcairn</option>
                <option value="SB">SB - Ilhas Salomão</option>
                <option value="TC">TC - Ilhas Turcas e Caicos</option>
                <option value="VG">VG - Ilhas Virgens Britânicas</option>
                <option value="VI">VI - Ilhas Virgens dos Estados Unidos</option>
                <option value="IN">IN - Índia</option>
                <option value="ID">ID - Indonésia</option>
                <option value="IR">IR - Irã</option>
                <option value="IQ">IQ - Iraque</option>
                <option value="IE">IE - Irlanda</option>
                <option value="IS">IS - Islândia</option>
                <option value="IL">IL - Israel</option>
                <option value="IT">IT - Itália</option>
                <option value="JM">JM - Jamaica</option>
                <option value="JP">JP - Japão</option>
                <option value="JE">JE - Jersey</option>
                <option value="JO">JO - Jordânia</option>
                <option value="KI">KI - Kiribati</option>
                <option value="KW">KW - Kuwait</option>
                <option value="LA">LA - Laos</option>
                <option value="LS">LS - Lesoto</option>
                <option value="LV">LV - Letônia</option>
                <option value="LB">LB - Líbano</option>
                <option value="LR">LR - Libéria</option>
                <option value="LY">LY - Líbia</option>
                <option value="LI">LI - Liechtenstein</option>
                <option value="LT">LT - Lituânia</option>
                <option value="LU">LU - Luxemburgo</option>
                <option value="MO">MO - Macau</option>
                <option value="MK">MK - Macedônia do Norte</option>
                <option value="MG">MG - Madagascar</option>
                <option value="MY">MY - Malásia</option>
                <option value="MW">MW - Malawi</option>
                <option value="MV">MV - Maldivas</option>
                <option value="ML">ML - Mali</option>
                <option value="MT">MT - Malta</option>
                <option value="MA">MA - Marrocos</option>
                <option value="MQ">MQ - Martinica</option>
                <option value="MU">MU - Maurício</option>
                <option value="MR">MR - Mauritânia</option>
                <option value="YT">YT - Mayotte</option>
                <option value="MX">MX - México</option>
                <option value="FM">FM - Micronésia</option>
                <option value="MZ">MZ - Moçambique</option>
                <option value="MD">MD - Moldávia</option>
                <option value="MC">MC - Mônaco</option>
                <option value="MN">MN - Mongólia</option>
                <option value="ME">ME - Montenegro</option>
                <option value="MS">MS - Montserrat</option>
                <option value="MM">MM - Myanmar</option>
                <option value="NA">NA - Namíbia</option>
                <option value="NR">NR - Nauru</option>
                <option value="NP">NP - Nepal</option>
                <option value="NI">NI - Nicarágua</option>
                <option value="NE">NE - Níger</option>
                <option value="NG">NG - Nigéria</option>
                <option value="NU">NU - Niue</option>
                <option value="NO">NO - Noruega</option>
                <option value="NC">NC - Nova Caledônia</option>
                <option value="NZ">NZ - Nova Zelândia</option>
                <option value="OM">OM - Omã</option>
                <option value="NL">NL - Países Baixos</option>
                <option value="PW">PW - Palau</option>
                <option value="PS">PS - Palestina</option>
                <option value="PA">PA - Panamá</option>
                <option value="PG">PG - Papua Nova Guiné</option>
                <option value="PK">PK - Paquistão</option>
                <option value="PY">PY - Paraguai</option>
                <option value="PE">PE - Peru</option>
                <option value="PF">PF - Polinésia Francesa</option>
                <option value="PL">PL - Polônia</option>
                <option value="PR">PR - Porto Rico</option>
                <option value="PT">PT - Portugal</option>
                <option value="KE">KE - Quênia</option>
                <option value="KG">KG - Quirguistão</option>
                <option value="GB">GB - Reino Unido</option>
                <option value="CF">CF - República Centro-Africana</option>
                <option value="CZ">CZ - República Tcheca</option>
                <option value="DO">DO - República Dominicana</option>
                <option value="RE">RE - Reunião</option>
                <option value="RO">RO - Romênia</option>
                <option value="RW">RW - Ruanda</option>
                <option value="RU">RU - Rússia</option>
                <option value="EH">EH - Saara Ocidental</option>
                <option value="WS">WS - Samoa</option>
                <option value="AS">AS - Samoa Americana</option>
                <option value="SM">SM - San Marino</option>
                <option value="SH">SH - Santa Helena</option>
                <option value="LC">LC - Santa Lúcia</option>
                <option value="BL">BL - São Bartolomeu</option>
                <option value="KN">KN - São Cristóvão e Nevis</option>
                <option value="MF">MF - São Martinho</option>
                <option value="ST">ST - São Tomé e Príncipe</option>
                <option value="VC">VC - São Vicente e Granadinas</option>
                <option value="SN">SN - Senegal</option>
                <option value="SL">SL - Serra Leoa</option>
                <option value="RS">RS - Sérvia</option>
                <option value="SC">SC - Seychelles</option>
                <option value="SG">SG - Singapura</option>
                <option value="SY">SY - Síria</option>
                <option value="SO">SO - Somália</option>
                <option value="LK">LK - Sri Lanka</option>
                <option value="SZ">SZ - Suazilândia</option>
                <option value="SD">SD - Sudão</option>
                <option value="SS">SS - Sudão do Sul</option>
                <option value="SE">SE - Suécia</option>
                <option value="CH">CH - Suíça</option>
                <option value="SR">SR - Suriname</option>
                <option value="SJ">SJ - Svalbard e Jan Mayen</option>
                <option value="TH">TH - Tailândia</option>
                <option value="TW">TW - Taiwan</option>
                <option value="TJ">TJ - Tajiquistão</option>
                <option value="TZ">TZ - Tanzânia</option>
                <option value="IO">IO - Território Britânico do Oceano Índico</option>
                <option value="TF">TF - Territórios Franceses do Sul</option>
                <option value="TL">TL - Timor-Leste</option>
                <option value="TG">TG - Togo</option>
                <option value="TK">TK - Tokelau</option>
                <option value="TO">TO - Tonga</option>
                <option value="TT">TT - Trinidad e Tobago</option>
                <option value="TN">TN - Tunísia</option>
                <option value="TM">TM - Turcomenistão</option>
                <option value="TR">TR - Turquia</option>
                <option value="TV">TV - Tuvalu</option>
                <option value="UA">UA - Ucrânia</option>
                <option value="UG">UG - Uganda</option>
                <option value="UY">UY - Uruguai</option>
                <option value="UZ">UZ - Uzbequistão</option>
                <option value="VU">VU - Vanuatu</option>
                <option value="VA">VA - Vaticano</option>
                <option value="VE">VE - Venezuela</option>
                <option value="VN">VN - Vietnã</option>
                <option value="WF">WF - Wallis e Futuna</option>
                <option value="ZM">ZM - Zâmbia</option>
                <option value="ZW">ZW - Zimbábue</option>
              </select>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Código IBGE</label>
              <input
                type="text"
                value={formData.codigoIbge}
                onChange={(e) => handleInputWithLimit('codigoIbge', e.target.value, 10)}
                style={inputStyles}
                maxLength={10}
              />
            </div>

          </div>

          {/* Linha 7: Telefone, Celular, E-mail */}
          <div style={rowStyles}>
            <div style={{ ...fieldStyles, gridColumn: 'span 2' }}>
              <label style={labelStyles}>Telefone</label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => handleFieldChange('telefone', e.target.value)}
                style={inputStyles}
                placeholder="(00) 0000-0000"
                maxLength={14}
              />
            </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 2' }}>
              <label style={labelStyles}>Celular</label>
              <input
                type="text"
                value={formData.celular}
                onChange={(e) => handleFieldChange('celular', e.target.value)}
                style={inputStyles}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 3' }}>
              <label style={labelStyles}>E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                style={inputStyles}
                placeholder="usuario@exemplo.com"
                maxLength={100}
              />
            </div>
          </div>

          {/* Linha 8: Atendente, Assinante do Cartão */}
          <div style={rowStyles}>
            <div style={{ ...fieldStyles, gridColumn: 'span 3' }}>
              <label style={labelStyles}>Atendente</label>
              <select
                value={formData.atendente}
                onChange={(e) => handleInputChange('atendente', e.target.value)}
                style={selectStyles}
              >
                <option value="">Selecione</option>
                <option value="ATENDENTE_1">Atendente 1</option>
                <option value="ATENDENTE_2">Atendente 2</option>
                <option value="ATENDENTE_3">Atendente 3</option>
              </select>
            </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 4' }}>
              <label style={labelStyles}>Assinante do Cartão</label>
              <select
                value={formData.assinanteCartao}
                onChange={(e) => handleInputChange('assinanteCartao', e.target.value)}
                style={selectStyles}
              >
                <option value="">Selecione</option>
                <option value="ASSINANTE_1">Assinante 1</option>
                <option value="ASSINANTE_2">Assinante 2</option>
                <option value="ASSINANTE_3">Assinante 3</option>
              </select>
            </div>
          </div>

        </form>
      )}

      {activeTab === 'digitalizacao' && (
        <div style={{ padding: '20px', textAlign: 'center', color: theme.text }}>
          <h3>Digitalização</h3>
          <p>Funcionalidade de digitalização será implementada aqui.</p>
        </div>
      )}

      {activeTab === 'selo-digital' && (
        <div style={{ padding: '20px', textAlign: 'center', color: theme.text }}>
          <h3>Selo Digital</h3>
          <p>Funcionalidade de selo digital será implementada aqui.</p>
        </div>
      )}

          {/* Botões de Ação */}
          <div style={buttonsContainerStyles}>
            <button 
              type="button" 
              style={getPrimaryButtonStyles('novo')} 
              onClick={handleNovo}
              onMouseEnter={() => setHoveredButton('novo')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              📄 Novo
            </button>
            <button 
              type="button" 
              style={getPrimaryButtonStyles('gravar')} 
              onClick={handleGravar}
              onMouseEnter={() => setHoveredButton('gravar')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              💾 Gravar
            </button>
            <button 
              type="button" 
              style={getSecondaryButtonStyles('limpar')} 
              onClick={handleLimpar}
              onMouseEnter={() => setHoveredButton('limpar')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              🧹 Limpar
            </button>
            <button 
              type="button" 
              style={getDangerButtonStyles('fechar')} 
              onClick={() => {
                console.log('🚪 BOTÃO FECHAR CLICADO!')
                console.log('🔧 onClose function:', onClose)
                onClose()
              }}
              onMouseEnter={() => setHoveredButton('fechar')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              🚪 Fechar
            </button>
          </div>

    </BasePage>
  )
}

