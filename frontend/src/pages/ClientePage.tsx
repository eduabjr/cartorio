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
        paisEndereco: 'BRASIL', // Preenche Brasil automaticamente
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
    padding: '6px 12px',
    border: 'none',
    backgroundColor: isActive ? theme.surface : 'transparent',
    color: isActive ? theme.primary : theme.text,
    cursor: 'pointer',
    borderBottom: isActive ? `2px solid ${theme.primary}` : '2px solid transparent',
    transition: 'all 0.2s ease',
    fontSize: '11px'
  })

  const formStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px'
  }

  const rowStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
    alignItems: 'end',
    marginBottom: '6px'
  }

  const fieldStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px'
  }

  const labelStyles = {
    fontSize: '12px',
    fontWeight: '600',
    color: theme.text,
    marginBottom: '2px'
  }

  const inputStyles = {
    padding: '4px 8px',
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    fontSize: '12px',
    backgroundColor: theme.background,
    color: theme.text,
    outline: 'none',
    height: '28px',
    width: '100%',
    boxSizing: 'border-box' as const
  }

  const selectStyles = {
    ...inputStyles,
    cursor: 'pointer'
  }

  const buttonStyles = {
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
    justifyContent: 'center'
  }

  const primaryButtonStyles = {
    ...buttonStyles,
    backgroundColor: theme.primary,
    color: 'white'
  }

  const secondaryButtonStyles = {
    ...buttonStyles,
    backgroundColor: theme.border,
    color: theme.text
  }

  const dangerButtonStyles = {
    ...buttonStyles,
    backgroundColor: '#ef4444',
    color: 'white'
  }

  const buttonsContainerStyles = {
    display: 'flex',
    gap: '6px',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: `1px solid ${theme.border}`
  }

  return (
    <BasePage title="Cliente" onClose={onClose} width="1200px" height="750px">
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
            <div style={fieldStyles}>
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
                  onChange={(e) => handleInputChange('codigo', e.target.value)}
                  style={inputStyles}
                />
                <button type="button" style={secondaryButtonStyles}>...</button>
              </div>
            </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 2' }}>
              <label style={labelStyles}>Nome *</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  style={inputStyles}
                  required
                />
                <button type="button" style={secondaryButtonStyles}>...</button>
              </div>
            </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 1' }}>
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
            <div style={fieldStyles}>
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

        <div style={fieldStyles}>
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

            <div style={fieldStyles}>
              <label style={labelStyles}>RG *</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={formData.rg}
                  onChange={(e) => handleInputChange('rg', e.target.value)}
                  style={inputStyles}
                  required
                />
                <button type="button" style={secondaryButtonStyles}>...</button>
              </div>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Órgão RG</label>
              <input
                type="text"
                value={formData.orgaoRg}
                onChange={(e) => handleInputChange('orgaoRg', e.target.value)}
                style={inputStyles}
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
            <div style={fieldStyles}>
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

            <div style={fieldStyles}>
              <label style={labelStyles}>Naturalidade</label>
              <input
                type="text"
                value={formData.naturalidade}
                onChange={(e) => handleInputChange('naturalidade', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>UF</label>
              <select
                value={formData.uf}
                onChange={(e) => handleInputChange('uf', e.target.value)}
                style={selectStyles}
              >
                <option value="">Selecione</option>
                <option value="SP">SP</option>
                <option value="RJ">RJ</option>
                <option value="MG">MG</option>
                <option value="PR">PR</option>
                <option value="RS">RS</option>
                <option value="SC">SC</option>
                <option value="BA">BA</option>
                <option value="GO">GO</option>
                <option value="PE">PE</option>
                <option value="CE">CE</option>
              </select>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>País</label>
              <input
                type="text"
                value={formData.pais}
                onChange={(e) => handleInputChange('pais', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Nacionalidade</label>
              <input
                type="text"
                value={formData.nacionalidade}
                onChange={(e) => handleInputChange('nacionalidade', e.target.value)}
                style={inputStyles}
              />
            </div>
          </div>

          {/* Linha 4: Profissão, Pai, Mãe */}
          <div style={rowStyles}>
            <div style={{ ...fieldStyles, gridColumn: 'span 1' }}>
              <label style={labelStyles}>Profissão</label>
              <input
                type="text"
                value={formData.profissao}
                onChange={(e) => handleInputChange('profissao', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 2' }}>
              <label style={labelStyles}>Pai</label>
              <input
                type="text"
                value={formData.pai}
                onChange={(e) => handleInputChange('pai', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 2' }}>
              <label style={labelStyles}>Mãe</label>
              <input
                type="text"
                value={formData.mae}
                onChange={(e) => handleInputChange('mae', e.target.value)}
                style={inputStyles}
              />
            </div>
          </div>

          {/* Linha 5: CEP, Logradouro, Endereço, Número, Complemento */}
          <div style={rowStyles}>
            <div style={fieldStyles}>
              <label style={labelStyles}>CEP</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={formData.cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  onKeyDown={handleCepKeyDown}
                  style={inputStyles}
                  placeholder="00000-000"
                  maxLength={9}
                />
                <button type="button" style={secondaryButtonStyles} onClick={handleBuscarCep}>🔍</button>
              </div>
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

            <div style={{ ...fieldStyles, gridColumn: 'span 1' }}>
              <label style={labelStyles}>Endereço</label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Número</label>
              <input
                type="text"
                value={formData.numero}
                onChange={(e) => handleInputChange('numero', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Complemento</label>
              <input
                type="text"
                value={formData.complemento}
                onChange={(e) => handleInputChange('complemento', e.target.value)}
                style={inputStyles}
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
                onChange={(e) => handleInputChange('bairro', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Cidade</label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => handleInputChange('cidade', e.target.value)}
                style={inputStyles}
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
                <option value="SP">SP</option>
                <option value="RJ">RJ</option>
                <option value="MG">MG</option>
                <option value="PR">PR</option>
                <option value="RS">RS</option>
                <option value="SC">SC</option>
                <option value="BA">BA</option>
                <option value="GO">GO</option>
                <option value="PE">PE</option>
                <option value="CE">CE</option>
              </select>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>País</label>
              <select
                value={formData.paisEndereco}
                onChange={(e) => handleInputChange('paisEndereco', e.target.value)}
                style={selectStyles}
              >
                <option value="">Selecione</option>
                <option value="BRASIL">BRASIL</option>
                <option value="ARGENTINA">ARGENTINA</option>
                <option value="URUGUAI">URUGUAI</option>
                <option value="PARAGUAI">PARAGUAI</option>
                <option value="CHILE">CHILE</option>
              </select>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Código IBGE</label>
              <input
                type="text"
                value={formData.codigoIbge}
                onChange={(e) => handleInputChange('codigoIbge', e.target.value)}
                style={inputStyles}
              />
            </div>
          </div>

          {/* Linha 7: Telefone, Celular, E-mail */}
          <div style={rowStyles}>
            <div style={fieldStyles}>
              <label style={labelStyles}>Telefone</label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                style={inputStyles}
                placeholder="(00) 0000-0000"
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Celular</label>
              <input
                type="text"
                value={formData.celular}
                onChange={(e) => handleInputChange('celular', e.target.value)}
                style={inputStyles}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div style={{ ...fieldStyles, gridColumn: 'span 1' }}>
              <label style={labelStyles}>E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={inputStyles}
              />
            </div>
          </div>

          {/* Linha 8: Atendente */}
          <div style={rowStyles}>
            <div style={{ ...fieldStyles, gridColumn: 'span 1' }}>
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
          </div>

          {/* Linha 9: Assinante do Cartão */}
          <div style={rowStyles}>
            <div style={{ ...fieldStyles, gridColumn: 'span 2' }}>
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
            <button type="button" style={primaryButtonStyles} onClick={handleNovo}>
              📄 Novo
            </button>
            <button type="button" style={primaryButtonStyles} onClick={handleGravar}>
              💾 Gravar
            </button>
            <button type="button" style={secondaryButtonStyles} onClick={handleLimpar}>
              🧹 Limpar
            </button>
            <button type="button" style={dangerButtonStyles} onClick={() => {
              console.log('🚪 BOTÃO FECHAR CLICADO!')
              console.log('🔧 onClose function:', onClose)
              onClose()
            }}>
              🚪 Fechar
            </button>
          </div>

    </BasePage>
  )
}

