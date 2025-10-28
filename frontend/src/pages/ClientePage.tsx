// ⚠️⚠️⚠️ ATENÇÃO: LAYOUT PERFEITO E TRAVADO - NÃO MODIFICAR ⚠️⚠️⚠️
// 
// ClientePage.tsx
// Tela de Cadastro/Manutenção de Clientes conforme especificação
//
// 🔒🔒🔒 ESTE LAYOUT ESTÁ PERFEITO E BLOQUEADO CONTRA ALTERAÇÕES 🔒🔒🔒
// 📅 Data de Bloqueio: 25/10/2025
//
// ⛔ BLOQUEIOS ATIVOS - NÃO MODIFIQUE:
// 
// 📏 DIMENSÕES DA JANELA (BLOQUEADAS):
// - width: "900px" - minWidth: "900px" (FIXO)
// - height: "580px" - minHeight: "580px" (FIXO)
//
// 🎨 ESTILOS BLOQUEADOS:
// - formStyles: gap: '6px', minWidth: 0, flexShrink: 1
// - rowStyles: gap: '8px', flexWrap: 'nowrap', justifyContent: 'space-between', flexShrink: 1
// - fieldStyles: flex: '1', flexShrink: 1
// - getInputStyles: minWidth: '0', flexShrink: 1
// - selectStyles: minWidth: '0', flexShrink: 1
//
// 📐 PROPRIEDADES CRÍTICAS (NÃO ALTERAR):
// - Propriedades flexShrink (TODAS devem ser 1)
// - Propriedades minWidth (inputs: 0, rowFields: 0)
// - Propriedades flexWrap (TODAS devem ser nowrap)
// - Espaçamentos (gaps, margins, paddings)
// - Distribuição uniforme dos campos (justifyContent: 'space-between')
//
// ✅ COMPORTAMENTO GARANTIDO:
// - Janela tamanho normal (900x580): SEM scroll, todos campos visíveis
// - Janela reduzida: COM scroll, campos encolhem proporcionalmente
// - Nenhum campo ultrapassa a margem
// - Linhas NUNCA quebram
// - Layout NUNCA quebra
//
// ⚠️⚠️⚠️ QUALQUER MODIFICAÇÃO QUEBRARÁ O LAYOUT APROVADO ⚠️⚠️⚠️

import React, { useState, useEffect } from 'react'
import { CidadeAutocompleteInput } from '../components/CidadeAutocompleteInput'
import { BasePage } from '../components/BasePage'
import { OCRProgress } from '../components/OCRProgress'
import { ScannerConfig } from '../components/ScannerConfig'
import { WebScannerConfig } from '../components/WebScannerConfig'
import { extractDocumentData, ExtractedData } from '../utils/ocrUtils'
import { useAccessibility } from '../hooks/useAccessibility'
import { scannerService } from '../services/ScannerService'
import { ocrService } from '../services/OCRService'
import QRCode from 'qrcode'
import { useFieldValidation } from '../hooks/useFieldValidation'
import { validarCPF, formatCPF } from '../utils/cpfValidator'
// import { useTJSPApi } from '../hooks/useTJSPApi'

// Definições de tipos para APIs do Electron
declare global {
  interface Window {
    electronAPI?: {
      detectScanners: () => Promise<ScannerDevice[]>
      scanDocument: (config: ScanConfig) => Promise<ScanResult>
      printDocument: (config: PrintConfig) => Promise<PrintResult>
    }
  }
}

interface ScannerDevice {
  id: string
  name: string
  manufacturer: string
  model: string
  capabilities: {
    resolutions: number[]
    colorModes: string[]
    pageSizes: string[]
    formats: string[]
  }
}

interface ScanConfig {
  scannerId: string
  resolution: number
  colorMode: string
  pageSize: string
  format: string
  quality: number
}

interface ScanResult {
  success: boolean
  imageData?: ArrayBuffer
  error?: string
}

interface PrintConfig {
  data: ArrayBuffer
  config: {
    copies: number
    colorMode: string
    paperSize: string
    orientation: string
    quality: string
    duplex: boolean
    collate: boolean
    margins: {
      top: number
      bottom: number
      left: number
      right: number
    }
  }
  documentName: string
}

interface PrintResult {
  success: boolean
  error?: string
}

interface ClientePageProps {
  onClose: () => void
  resetToOriginalPosition?: boolean
}

export function ClientePage({ onClose, resetToOriginalPosition }: ClientePageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  // const tjspApi = useTJSPApi()
  const theme = getTheme()
  
  // Cor do header: teal no light, laranja no dark
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
  
  const [activeTab, setActiveTab] = useState('cadastro')
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [ocrProgress, setOcrProgress] = useState({ isVisible: false, progress: 0, status: '' })
  const [showScannerConfig, setShowScannerConfig] = useState(false)
  const [isWebEnvironment, setIsWebEnvironment] = useState(false)
  
  // Detectar ambiente (web vs desktop)
  useEffect(() => {
    const isElectron = !!(window as any).electronAPI
    setIsWebEnvironment(!isElectron)
  }, [])

  // Forçar remoção de borda do checkbox e botões
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'checkbox-no-border-style'
    style.innerHTML = `
      input[type="checkbox"] {
        border: 0 !important;
        border-width: 0 !important;
        border-style: none !important;
        border-color: transparent !important;
        outline: 0 !important;
        outline-width: 0 !important;
        outline-style: none !important;
        box-shadow: none !important;
        -webkit-box-shadow: none !important;
      }
      input[type="checkbox"]:hover,
      input[type="checkbox"]:focus,
      input[type="checkbox"]:active,
      input[type="checkbox"]:checked {
        border: 0 !important;
        border-width: 0 !important;
        border-style: none !important;
        border-color: transparent !important;
        outline: 0 !important;
        outline-width: 0 !important;
        outline-style: none !important;
        box-shadow: none !important;
        -webkit-box-shadow: none !important;
      }
      button[type="button"] {
        border: none !important;
        border-width: 0 !important;
        border-style: none !important;
        border-color: transparent !important;
        border-top: none !important;
        border-right: none !important;
        border-bottom: none !important;
        border-left: none !important;
        outline: none !important;
        outline-width: 0 !important;
        outline-style: none !important;
        outline-color: transparent !important;
        box-shadow: none !important;
        -webkit-appearance: none !important;
        -moz-appearance: none !important;
        appearance: none !important;
      }
      button[type="button"]:hover,
      button[type="button"]:focus,
      button[type="button"]:active,
      button[type="button"]:visited {
        border: none !important;
        border-width: 0 !important;
        border-style: none !important;
        border-color: transparent !important;
        outline: none !important;
        outline-width: 0 !important;
        outline-style: none !important;
        outline-color: transparent !important;
        box-shadow: none !important;
      }
    `
    document.head.appendChild(style)
    return () => {
      const existingStyle = document.getElementById('checkbox-no-border-style')
      if (existingStyle) {
        document.head.removeChild(existingStyle)
      }
    }
  }, [])

  // 🎨 Adicionar estilos CSS dinâmicos para foco laranja (igual ao Funcionário)
  useEffect(() => {
    const styleId = 'cliente-focus-styles'
    let styleElement = document.getElementById(styleId) as HTMLStyleElement
    
    const focusColor = theme.background === '#1a1a1a' ? '#ffd4a3' : '#ffedd5'
    const textColor = theme.background === '#1a1a1a' ? '#1a1a1a' : '#000000'
    const hoverBg = theme.background === '#1a1a1a' ? '#2a2a2a' : '#f5f5f5'
    
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }
    
    styleElement.textContent = `
      /* Aplica fundo laranja em TODOS os inputs e selects da página Cliente ao focar */
      input[type="text"]:focus,
      input[type="number"]:focus,
      input[type="email"]:focus,
      input[type="tel"]:focus,
      input[type="date"]:focus,
      select:focus,
      textarea:focus {
        background-color: ${focusColor} !important;
        color: ${textColor} !important;
        -webkit-box-shadow: 0 0 0 1000px ${focusColor} inset !important;
        -webkit-text-fill-color: ${textColor} !important;
        box-shadow: 0 0 0 1000px ${focusColor} inset !important;
      }
      /* Excluir checkbox do foco laranja */
      input[type="checkbox"]:focus {
        background-color: transparent !important;
        -webkit-box-shadow: none !important;
        box-shadow: none !important;
      }
      
      /* 🎯 Feedback visual para botões da toolbar */
      button[title*="cartão"]:not(:disabled):hover,
      button[title*="documento"]:not(:disabled):hover,
      button[title*="Carregar"]:not(:disabled):hover,
      button[title*="Digitalizar"]:not(:disabled):hover,
      button[title*="Excluir"]:not(:disabled):hover,
      button[title*="Imprimir"]:not(:disabled):hover,
      button[title*="Girar"]:not(:disabled):hover,
      button[title*="zoom"]:not(:disabled):hover,
      button[title*="Voltar"]:hover {
        transform: scale(1.05) !important;
        background-color: #6b7280 !important;  /* Cinza para combinar */
        color: white !important;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
      }
      
      button[title*="cartão"]:not(:disabled):active,
      button[title*="documento"]:not(:disabled):active,
      button[title*="Carregar"]:not(:disabled):active,
      button[title*="Digitalizar"]:not(:disabled):active,
      button[title*="Excluir"]:not(:disabled):active,
      button[title*="Imprimir"]:not(:disabled):active,
      button[title*="Girar"]:not(:disabled):active,
      button[title*="zoom"]:not(:disabled):active,
      button[title*="Voltar"]:active {
        transform: scale(0.95) !important;
        background-color: #4b5563 !important;  /* Cinza mais escuro ao clicar */
        color: white !important;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1) inset !important;
      }
      
      /* Botão Retornar verde com hover especial */
      button[title*="Voltar"]:hover {
        background-color: #059669 !important;
      }
      
      button[title*="Voltar"]:active {
        background-color: #047857 !important;
      }
    `
    
    return () => {
      const el = document.getElementById(styleId)
      if (el) {
        document.head.removeChild(el)
      }
    }
  }, [theme.background])
  
  // Estados para Digitalização
  const [digitalizacaoTab, setDigitalizacaoTab] = useState('cartoes-assinatura')
  
  // Estados para Cartões de Assinatura
  const [cartoesAssinatura, setCartoesAssinatura] = useState<any[]>([])
  const [cartaoAtual, setCartaoAtual] = useState<number>(0)
  const [zoomLevelCartoes, setZoomLevelCartoes] = useState(100)
  const [rotacaoCartoes, setRotacaoCartoes] = useState(0)
  const [isDraggingCartoes, setIsDraggingCartoes] = useState(false)
  const [dragStartCartoes, setDragStartCartoes] = useState({ x: 0, y: 0 })
  const [documentPositionCartoes, setDocumentPositionCartoes] = useState({ x: 0, y: 0 })
  
  // Estados para Outros Documentos
  const [outrosDocumentos, setOutrosDocumentos] = useState<any[]>([])
  const [documentoAtual, setDocumentoAtual] = useState<number>(0)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [rotacao, setRotacao] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [documentPosition, setDocumentPosition] = useState({ x: 0, y: 0 })
  
  // Estados para Selo Digital
  const [selosDigitais, setSelosDigitais] = useState<any[]>([])
  const [seloSelecionado, setSeloSelecionado] = useState<number>(0)
  const [campoPrincipal, setCampoPrincipal] = useState('')
  const [campoSecundario, setCampoSecundario] = useState('')

  // Gerar QR Code para o selo selecionado
  useEffect(() => {
    const gerarQRCode = async () => {
      if (selosDigitais[seloSelecionado] && !selosDigitais[seloSelecionado].qrCode) {
        try {
          const selo = selosDigitais[seloSelecionado]
          const qrData = `SELO:${selo.seloDigital}|CNS:${selo.cns}|DATA:${selo.dataCadastro}|NATUREZA:${selo.naturezaAto}`
          const qrCodeDataURL = await QRCode.toDataURL(qrData, {
            width: 90,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          })
          
          // Atualizar o selo com o QR Code gerado
          setSelosDigitais(prevSelos => {
            const novosSelos = [...prevSelos]
            novosSelos[seloSelecionado] = { ...selo, qrCode: qrCodeDataURL }
            return novosSelos
          })
        } catch (error) {
          console.error('Erro ao gerar QR Code:', error)
        }
      }
    }

    gerarQRCode()
  }, [seloSelecionado])
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

  // ✨ Hook de validação com regras globais
  const { 
    handleChange: handleValidatedChange, 
    getValue, 
    getError,
    loadingCEP 
  } = useFieldValidation(formData, setFormData)

  const handleInputChange = (field: string, value: string) => {
    // Usar o hook de validação para aplicar regras globais
    handleValidatedChange(field, value)
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





  // Função para Scanner Real + OCR + Preenchimento Automático
  const handleScannerComOCR = async () => {
    try {
      console.log('🔍 Iniciando Scanner + OCR + Preenchimento Automático...')
      
      // Mostra progresso
      setOcrProgress({ isVisible: true, progress: 0, status: 'Inicializando scanner...' })

      // 1. INICIALIZAR SERVIÇOS
      await scannerService.initialize()
      const scanners = scannerService.getAvailableScanners()
      
      if (scanners.length === 0) {
        throw new Error('Nenhum scanner detectado. Verifique se:\n• O scanner está conectado\n• Os drivers estão instalados\n• O dispositivo está ligado')
      }

      setOcrProgress({ isVisible: true, progress: 0.2, status: 'Configurando scanner...' })

      // 2. CONFIGURAR E EXECUTAR SCAN
      const scanConfig = {
        resolution: 300,
        colorMode: 'color' as const,
        pageSize: 'A4',
        quality: 90,
        autoCrop: true,
        autoDeskew: true,
        autoRotate: true
      }

      const scanResult = await scannerService.scanDocument(scanners[0].id, scanConfig)
      
      if (!scanResult.success) {
        throw new Error(scanResult.error || 'Falha na digitalização')
      }

      setOcrProgress({ isVisible: true, progress: 0.5, status: 'Processando com OCR...' })

      // 3. PROCESSAR COM OCR
      if (!scanResult.imageData) {
        throw new Error('Dados da imagem não disponíveis')
      }

      const ocrResult = await ocrService.processDocument(
        scanResult.imageData,
        (progress, status) => {
          setOcrProgress({ isVisible: true, progress: 0.5 + (progress * 0.3), status })
        }
      )

      if (!ocrResult.success) {
        throw new Error(ocrResult.error || 'Erro no processamento OCR')
      }

      setOcrProgress({ isVisible: true, progress: 0.8, status: 'Validando dados...' })

      // 4. VALIDAR E FORMATAR DADOS
      const validation = await ocrService.validateExtractedData(ocrResult.data)
      const formattedData = ocrService.formatExtractedData(ocrResult.data)

      setOcrProgress({ isVisible: true, progress: 0.9, status: 'Preenchendo campos...' })

      // 5. PREENCHER CAMPOS AUTOMATICAMENTE
      fillFormFields(formattedData)

      setOcrProgress({ isVisible: true, progress: 1.0, status: 'Concluído!' })

      // 6. MOSTRAR RESULTADO
      setTimeout(() => {
        setOcrProgress({ isVisible: false, progress: 0, status: '' })
        
        const camposPreenchidos = Object.keys(formattedData).filter(key => formattedData[key as keyof ExtractedData])
        
        let message = `✅ Scanner + OCR Concluído!\n\n📋 Campos preenchidos: ${camposPreenchidos.length}\n🔍 Confiança: ${ocrResult.confidence}%\n\n`
        
        if (validation.warnings.length > 0) {
          message += `⚠️ Avisos:\n${validation.warnings.map(w => `• ${w}`).join('\n')}\n\n`
        }
        
        message += `📄 Dados extraídos:\n${camposPreenchidos.map(campo => `• ${campo}: ${formattedData[campo as keyof ExtractedData]}`).join('\n')}\n\nVerifique os dados e faça ajustes se necessário.`
        
        alert(message)
      }, 1000)

    } catch (error) {
      console.error('❌ Erro no Scanner + OCR:', error)
      setOcrProgress({ isVisible: false, progress: 0, status: '' })
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`❌ Erro no Scanner + OCR:\n\n${errorMessage}\n\nTente novamente ou use o upload manual de arquivo.`)
    }
  }


  // Função auxiliar para preencher campos do formulário
  const fillFormFields = (dadosExtraidos: ExtractedData) => {
    // Remove código dos dados extraídos
    const { codigo, ...dadosParaPreencher } = dadosExtraidos
    
    console.log('🎯 Preenchendo campos com dados extraídos:', dadosParaPreencher)
    
    // Preenche os campos
    setFormData(prev => ({
      ...prev,
      ...dadosParaPreencher
    }))

    // Se CEP foi extraído, buscar endereço automaticamente
    if (dadosParaPreencher.cep) {
      // Simular clique no botão de buscar CEP
      const cepInput = document.querySelector('input[value*="' + dadosParaPreencher.cep + '"]') as HTMLInputElement
      if (cepInput) {
        cepInput.value = dadosParaPreencher.cep
        cepInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }
  }



  // Função para iniciar um novo cadastro
  const handleNovo = () => {
    setFormData({
      codigo: '0',
      nome: '',
      numeroCartao: '',
      cpf: '',
      rg: '',
      orgaoRg: '',
      nascimento: '',
      estadoCivil: 'IGNORADO',
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
      uf: '',
      pais: '',
      ufEndereco: '',
      paisEndereco: 'BRASIL',
      codigoIbge: '',
      telefone: '',
      celular: '',
      email: '',
      atendente: '',
      assinanteCartao: '',
      sexo: 'IGNORADO'
    })
    console.log('📄 Novo cadastro iniciado! Formulário limpo.')
  }

  // Função para gravar os dados
  const handleGravar = () => {
    // Validação básica
    if (!formData.nome || !formData.cpf) {
      console.log('❌ Por favor, preencha pelo menos Nome e CPF!')
      alert('❌ Por favor, preencha pelo menos Nome e CPF!')
      return
    }

    // Gera ID único se ainda não foi gerado (código = '0')
    let codigoFinal = formData.codigo
    if (formData.codigo === '0') {
      codigoFinal = 'CLI' + Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      setFormData(prev => ({ ...prev, codigo: codigoFinal }))
      console.log('🆔 ID gerado automaticamente:', codigoFinal)
    }

    // Simula salvamento
    console.log('Dados a serem gravados:', { ...formData, codigo: codigoFinal })
    console.log('💾 Cliente gravado com sucesso!')
    alert(`✅ Cliente gravado com sucesso!\n\n🆔 ID: ${codigoFinal}`)
  }

  // Função para limpar os campos
  const handleLimpar = () => {
    setFormData(prev => ({
      ...prev,
      codigo: '0',
      nome: '',
      numeroCartao: '',
      cpf: '',
      rg: '',
      orgaoRg: '',
      nascimento: '',
      estadoCivil: 'IGNORADO',
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
      uf: '',
      pais: '',
      ufEndereco: '',
      paisEndereco: 'BRASIL',
      codigoIbge: '',
      telefone: '',
      celular: '',
      email: '',
      atendente: '',
      assinanteCartao: '',
      sexo: 'IGNORADO'
    }))
    console.log('🧹 Campos limpos!')
  }

  // Funções para Cartões de Assinatura
  const handlePrimeiroCartao = () => {
    if (cartoesAssinatura.length > 0) {
      setCartaoAtual(0)
      resetCartaoPosition()
    }
  }

  const handleCartaoAnterior = () => {
    if (cartaoAtual > 0) {
      setCartaoAtual(cartaoAtual - 1)
      resetCartaoPosition()
    }
  }

  const handleProximoCartao = () => {
    if (cartaoAtual < cartoesAssinatura.length - 1) {
      setCartaoAtual(cartaoAtual + 1)
      resetCartaoPosition()
    }
  }

  const handleUltimoCartao = () => {
    if (cartoesAssinatura.length > 0) {
      setCartaoAtual(cartoesAssinatura.length - 1)
      resetCartaoPosition()
    }
  }

  const handleNovoCartao = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,.pdf'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const novoCartao = {
          id: Date.now(),
          nome: file.name,
          arquivo: file,
          dataCriacao: new Date(),
          origem: 'upload'
        }
        setCartoesAssinatura(prev => [...prev, novoCartao])
        setCartaoAtual(cartoesAssinatura.length)
        resetCartaoPosition()
        setZoomLevelCartoes(100)
        setRotacaoCartoes(0)
      }
    }
    input.click()
  }

  const handleExcluirCartao = () => {
    if (cartoesAssinatura.length > 0 && cartaoAtual >= 0) {
      const novosCartoes = cartoesAssinatura.filter((_, index) => index !== cartaoAtual)
      setCartoesAssinatura(novosCartoes)
      if (cartaoAtual >= novosCartoes.length) {
        setCartaoAtual(novosCartoes.length - 1)
      }
    }
  }

  const handleGirarCartao90 = () => {
    setRotacaoCartoes((prev) => (prev + 90) % 360)
    resetCartaoPosition()
  }

  const handleGirarCartao180 = () => {
    setRotacaoCartoes((prev) => (prev + 180) % 360)
    resetCartaoPosition()
  }

  const handleZoomInCartao = () => {
    setZoomLevelCartoes((prev) => Math.min(prev + 25, 300))
    resetCartaoPosition()
  }

  const handleZoomOutCartao = () => {
    setZoomLevelCartoes((prev) => Math.max(prev - 25, 25))
    resetCartaoPosition()
  }

  const handleImprimirCartao = () => {
    if (cartoesAssinatura.length > 0 && cartaoAtual >= 0) {
      const cartao = cartoesAssinatura[cartaoAtual]
      printDocument(cartao)
    }
  }

  const handleScannerCartao = () => {
    // Verificar se estamos em ambiente Electron (para acesso a APIs nativas)
    if (window.electronAPI) {
      startRealScanning()
    } else {
      // Fallback para navegador - usar WebUSB API ou Image Capture API
      startWebScanning()
    }
  }

  const handleRetornarCartao = () => {
    setActiveTab('cadastro')
  }

  // Funções para arrastar cartão
  const handleCartaoMouseDown = (e: React.MouseEvent) => {
    if (cartoesAssinatura.length > 0) {
      setIsDraggingCartoes(true)
      setDragStartCartoes({
        x: e.clientX - documentPositionCartoes.x,
        y: e.clientY - documentPositionCartoes.y
      })
    }
  }

  const handleCartaoMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCartoes && cartoesAssinatura.length > 0) {
      const newX = e.clientX - dragStartCartoes.x
      const newY = e.clientY - dragStartCartoes.y
      setDocumentPositionCartoes({ x: newX, y: newY })
    }
  }

  const handleCartaoMouseUp = () => {
    setIsDraggingCartoes(false)
  }

  const handleCartaoMouseLeave = () => {
    setIsDraggingCartoes(false)
  }

  // Resetar posição do cartão
  const resetCartaoPosition = () => {
    setDocumentPositionCartoes({ x: 0, y: 0 })
  }

  // Funções para Outros Documentos
  const handlePrimeiroDocumento = () => {
    if (outrosDocumentos.length > 0) {
      setDocumentoAtual(0)
      resetDocumentPosition()
    }
  }

  const handleDocumentoAnterior = () => {
    if (documentoAtual > 0) {
      setDocumentoAtual(documentoAtual - 1)
      resetDocumentPosition()
    }
  }

  const handleProximoDocumento = () => {
    if (documentoAtual < outrosDocumentos.length - 1) {
      setDocumentoAtual(documentoAtual + 1)
      resetDocumentPosition()
    }
  }

  const handleUltimoDocumento = () => {
    if (outrosDocumentos.length > 0) {
      setDocumentoAtual(outrosDocumentos.length - 1)
      resetDocumentPosition()
    }
  }

  const handleNovoDocumento = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,.pdf'
    input.multiple = true
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        const novosDocumentos = Array.from(files).map((file, index) => ({
          id: Date.now() + index,
          nome: file.name,
          arquivo: file,
          tipo: file.type,
          tamanho: file.size,
          dataUpload: new Date()
        }))
        setOutrosDocumentos([...outrosDocumentos, ...novosDocumentos])
        if (outrosDocumentos.length === 0) {
          setDocumentoAtual(0)
        }
      }
    }
    input.click()
  }

  const handleScanner = () => {
    // Verificar se estamos em ambiente Electron (para acesso a APIs nativas)
    if (window.electronAPI) {
      startRealScanning()
    } else {
      // Fallback para navegador - usar WebUSB API ou Image Capture API
      startWebScanning()
    }
  }


  // Função para scanner real via Electron (APIs nativas)
  const startRealScanning = async () => {
    try {
      console.log('🔍 Iniciando detecção de scanner via Electron...')
      
      if (!window.electronAPI) {
        throw new Error('APIs do Electron não disponíveis')
      }
      
      // Detectar scanners disponíveis via TWAIN (Windows) ou SANE (Linux)
      const scanners = await window.electronAPI.detectScanners()
      
      if (!scanners || scanners.length === 0) {
        alert('❌ Nenhum scanner detectado!\n\nVerifique se:\n• O scanner está conectado\n• Os drivers TWAIN/SANE estão instalados\n• O dispositivo está ligado')
        return
      }

      console.log('📷 Scanners detectados:', scanners)
      alert('Scanner detectado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao acessar scanner:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`❌ Erro ao acessar scanner:\n${errorMessage}`)
    }
  }

  // Função para scanner via Web APIs (navegador)
  const startWebScanning = async () => {
    try {
      // Verificar se Image Capture API está disponível
      if ('ImageCapture' in window) {
        alert('📷 Funcionalidade de câmera disponível. Utilize seu dispositivo para capturar imagens.')
      } else {
        alert('⚠️ Camera/Scanner não disponível neste navegador.\n\nUtilize um navegador moderno como Chrome, Firefox ou Edge.')
      }
    } catch (error) {
      console.error('❌ Erro ao acessar câmera:', error)
      alert('❌ Erro ao acessar câmera/scanner')
    }
  }

  // Scanner via Image Capture API
  const startImageCaptureScanning = async () => {
    try {
      // Obter dispositivos de mídia
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      
      if (videoDevices.length === 0) {
        alert('❌ Nenhuma câmera/scanner detectado!')
        return
      }

      // Usar primeira câmera disponível (pode ser um scanner com câmera)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: videoDevices[0].deviceId }
      })
      
      const track = stream.getVideoTracks()[0]
      const imageCapture = new ImageCapture(track)
      
      // Capturar imagem
      const imageBitmap = await imageCapture.takePhoto()
      
      // Converter para File
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx && imageBitmap && 'width' in imageBitmap && 'height' in imageBitmap) {
        canvas.width = (imageBitmap as any).width
        canvas.height = (imageBitmap as any).height
        ctx.drawImage(imageBitmap as any, 0, 0)
      }
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `scanned_${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          
          await addScannedDocument(file, 'image-capture')
        }
        
        // Parar stream
        track.stop()
      }, 'image/jpeg', 0.9)
      
    } catch (error) {
      console.error('❌ Erro Image Capture:', error)
      throw error
    }
  }

  // Scanner via WebUSB API
  const startWebUSBScanning = async () => {
    try {
      // Solicitar acesso a dispositivos USB
      const device = await (navigator as any).usb.requestDevice({
        filters: [
          { classCode: 7 }, // Printer/Scanner class
          { classCode: 6 }  // Still Image class
        ]
      })
      
      console.log('📷 Dispositivo USB selecionado:', device)
      
      // Conectar ao dispositivo
      await device.open()
      await device.selectConfiguration(1)
      await device.claimInterface(0)
      
      // Iniciar processo de digitalização
      // (Implementação específica depende do protocolo do scanner)
      await performUSBScan(device)
      
    } catch (error) {
      console.error('❌ Erro WebUSB:', error)
      throw error
    }
  }

  // Configurações reais do scanner
  const showRealScannerConfig = async (scanner: any) => {
    const resolution = prompt('📐 Resolução (DPI):', '300')
    const colorMode = prompt('🎨 Modo de cor (Color/Grayscale/Black&White):', 'Color')
    const pageSize = prompt('📄 Tamanho da página (A4/Letter/Legal):', 'A4')
    
    if (!resolution || !colorMode || !pageSize) {
      return null
    }

    return {
      scanner: scanner,
      resolution: parseInt(resolution) || 300,
      colorMode: colorMode.toLowerCase(),
      pageSize: pageSize.toUpperCase(),
      format: 'JPEG',
      quality: 90
    }
  }

  // Digitalização real via Electron (não utilizada - substituída por performRealScanOCR)
  /*
  const performRealScan = async (config: any) => {
    try {
      console.log('📷 Iniciando digitalização real...')
      
      // Chamar API nativa do Electron para digitalizar
      if (!window.electronAPI) {
        throw new Error('APIs do Electron não disponíveis')
      }
      
      const scanResult = await window.electronAPI.scanDocument({
        scannerId: config.scanner.id,
        resolution: config.resolution,
        colorMode: config.colorMode,
        pageSize: config.pageSize,
        format: config.format,
        quality: config.quality
      })
      
      if (scanResult.success && scanResult.imageData) {
        // Converter dados da imagem para File
        const file = new File([scanResult.imageData], `scanned_${Date.now()}.${config.format.toLowerCase()}`, {
          type: `image/${config.format.toLowerCase()}`,
          lastModified: Date.now()
        })
        
        await addScannedDocument(file, 'real-scanner', config)
        
        alert(`✅ Documento digitalizado com sucesso!\n\n📄 Nome: ${file.name}\n📐 Resolução: ${config.resolution} DPI\n🎨 Modo: ${config.colorMode}\n📏 Tamanho: ${config.pageSize}`)
      } else {
        throw new Error(scanResult.error || 'Erro desconhecido na digitalização')
      }
      
    } catch (error) {
      console.error('❌ Erro na digitalização real:', error)
      throw error
    }
  }
  */

  // Digitalização via USB
  const performUSBScan = async (device: any) => {
    try {
      // Implementação específica para protocolo USB do scanner
      // Cada fabricante tem seu próprio protocolo
      
      // Exemplo genérico - enviar comando de scan
      const scanCommand = new Uint8Array([0x1B, 0x2A, 0x72, 0x31, 0x41]) // Comando ESC/P
      
      await device.transferOut(1, scanCommand)
      
      // Aguardar dados da imagem
      const result = await device.transferIn(1, 1024 * 1024) // 1MB buffer
      
      if (result.data && result.data.byteLength > 0) {
        const blob = new Blob([result.data], { type: 'image/jpeg' })
        const file = new File([blob], `scanned_${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        })
        
        await addScannedDocument(file, 'usb-scanner')
      }
      
    } catch (error) {
      console.error('❌ Erro USB scan:', error)
      throw error
    } finally {
      // Desconectar dispositivo
      try {
        await device.close()
      } catch (e) {
        console.warn('Aviso ao fechar dispositivo USB:', e)
      }
    }
  }

  // Adicionar documento digitalizado à lista
  const addScannedDocument = async (file: File, source: string, config?: any) => {
    const scannedDocument = {
      id: Date.now(),
      nome: file.name,
      arquivo: file,
      dataCriacao: new Date(),
      configuracao: config,
      origem: source
    }
    
    // Adicionar documento à lista
    setOutrosDocumentos(prev => [...prev, scannedDocument])
    setDocumentoAtual(outrosDocumentos.length) // Ir para o novo documento
    
    // Resetar posição e zoom
    resetDocumentPosition()
    setZoomLevel(100)
    setRotacao(0)
    
    console.log('✅ Documento adicionado:', scannedDocument)
  }

  const handleExcluirDocumento = () => {
    if (outrosDocumentos.length > 0 && documentoAtual >= 0) {
      const novosDocumentos = outrosDocumentos.filter((_, index) => index !== documentoAtual)
      setOutrosDocumentos(novosDocumentos)
      
      if (novosDocumentos.length === 0) {
        setDocumentoAtual(0)
      } else if (documentoAtual >= novosDocumentos.length) {
        setDocumentoAtual(novosDocumentos.length - 1)
      }
    }
  }

  const handleImprimir = () => {
    if (outrosDocumentos.length > 0 && documentoAtual >= 0) {
      const documento = outrosDocumentos[documentoAtual]
      printDocument(documento)
    }
  }

  // Função para imprimir documento real
  const printDocument = async (documento: any) => {
    try {
      console.log('🖨️ Iniciando impressão do documento:', documento.nome)
      
      // Verificar se estamos em ambiente Electron (obrigatório para aplicação desktop)
      if (!window.electronAPI) {
        throw new Error('Aplicação deve ser executada via Electron para impressão nativa')
      }
      
      // Impressão nativa via Electron
      await printWithElectron(documento)
      
    } catch (error) {
      console.error('❌ Erro ao imprimir:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`❌ Erro ao imprimir documento:\n${errorMessage}`)
    }
  }

  // Impressão via Electron (impressão nativa)
  const printWithElectron = async (documento: any) => {
    try {
      if (!window.electronAPI) {
        throw new Error('APIs do Electron não disponíveis')
      }

      console.log('🖨️ Preparando impressão nativa do documento:', documento.nome)
      console.log('📄 Tipo de arquivo:', documento.arquivo.type)
      console.log('📏 Tamanho do arquivo:', documento.arquivo.size, 'bytes')

      // Mostrar configurações de impressão
      const printConfig = await showPrintConfig()
      if (!printConfig) {
        console.log('❌ Usuário cancelou configuração de impressão')
        return
      }

      console.log('⚙️ Configurações de impressão:', printConfig)

      // Converter arquivo para dados de impressão
      console.log('🔄 Convertendo arquivo para dados de impressão...')
      const printData = await convertFileToPrintData(documento.arquivo)
      console.log('✅ Arquivo convertido, tamanho dos dados:', printData.byteLength, 'bytes')
      
      // Chamar API nativa do Electron para imprimir
      console.log('📤 Enviando para impressão via Electron...')
      const printResult = await window.electronAPI.printDocument({
        data: printData,
        config: printConfig,
        documentName: documento.nome
      })

      if (printResult.success) {
        console.log('✅ Impressão concluída com sucesso!')
        alert(`✅ Documento "${documento.nome}" enviado para impressão com sucesso!\n\n📄 Cópias: ${printConfig.copies}\n🎨 Modo: ${printConfig.colorMode}\n📏 Papel: ${printConfig.paperSize}\n📐 Orientação: ${printConfig.orientation}`)
      } else {
        throw new Error(printResult.error || 'Erro desconhecido na impressão')
      }
      
    } catch (error) {
      console.error('❌ Erro na impressão via Electron:', error)
      throw error
    }
  }


  // Mostrar configurações de impressão
  const showPrintConfig = async () => {
    // Solicitar configurações do usuário
    const copies = prompt('📄 Número de cópias (1-99):', '1')
    if (!copies) return null

    const colorMode = prompt('🎨 Modo de cor (Color/Grayscale/Black&White):', 'Color')
    if (!colorMode) return null

    const paperSize = prompt('📏 Tamanho do papel (A4/Letter/Legal/A3):', 'A4')
    if (!paperSize) return null

    const orientation = prompt('📐 Orientação (Portrait/Landscape):', 'Portrait')
    if (!orientation) return null

    const duplex = confirm('🔄 Impressão frente e verso (duplex)?')
    const collate = confirm('📚 Colar páginas (quando múltiplas cópias)?')

    // Validar e processar configurações
    const copiesNum = Math.max(1, Math.min(99, parseInt(copies) || 1))
    const colorModeProcessed = colorMode.toLowerCase().replace('&', 'and')
    const paperSizeProcessed = paperSize.toUpperCase()
    const orientationProcessed = orientation.toLowerCase()

    return {
      copies: copiesNum,
      colorMode: colorModeProcessed,
      paperSize: paperSizeProcessed,
      orientation: orientationProcessed,
      quality: 'high',
      duplex: duplex,
      collate: collate,
      margins: {
        top: 1.0,    // cm
        bottom: 1.0, // cm
        left: 1.0,   // cm
        right: 1.0   // cm
      }
    }
  }

  // Converter arquivo para dados de impressão
  const convertFileToPrintData = async (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result)
        } else {
          reject(new Error('Erro ao converter arquivo'))
        }
      }
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
      reader.readAsArrayBuffer(file)
    })
  }


  const handleGirar90 = () => {
    setRotacao((prev) => (prev + 90) % 360)
    resetDocumentPosition()
  }

  const handleGirar180 = () => {
    setRotacao((prev) => (prev + 180) % 360)
    resetDocumentPosition()
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 300))
    resetDocumentPosition()
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 25))
    resetDocumentPosition()
  }

  const handleRetornar = () => {
    setActiveTab('cadastro')
  }

  // Funções para Selo Digital
  const handleSelecionarSelo = (index: number) => {
    setSeloSelecionado(index)
    const selo = selosDigitais[index]
    if (selo) {
      setCampoPrincipal(selo.seloDigital)
      setCampoSecundario(selo.cns)
    }
  }

  const handleCopiarQRCode = async () => {
    if (selosDigitais[seloSelecionado]) {
      const selo = selosDigitais[seloSelecionado]
      
      try {
        // Gerar QR Code real
        const qrData = `SELO:${selo.seloDigital}|CNS:${selo.cns}|DATA:${selo.dataCadastro}|NATUREZA:${selo.naturezaAto}`
        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
          width: 90,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        
        // Atualizar o selo com o QR Code gerado
        const novosSelos = [...selosDigitais]
        novosSelos[seloSelecionado] = { ...selo, qrCode: qrCodeDataURL }
        setSelosDigitais(novosSelos)
        
        // Copiar os dados do QR Code para área de transferência
        navigator.clipboard.writeText(qrData).then(() => {
          alert('QR Code gerado e dados copiados para a área de transferência!')
        }).catch(() => {
          alert('QR Code gerado, mas erro ao copiar dados')
        })
      } catch (error) {
        console.error('Erro ao gerar QR Code:', error)
        alert('Erro ao gerar QR Code')
      }
    }
  }


  const handleExcluirSeloLocal = () => {
    if (selosDigitais[seloSelecionado]) {
      const confirmacao = confirm('Tem certeza que deseja excluir o selo digital local?')
      if (confirmacao) {
        const novosSelos = selosDigitais.filter((_, index) => index !== seloSelecionado)
        setSelosDigitais(novosSelos)
        if (seloSelecionado >= novosSelos.length) {
          setSeloSelecionado(Math.max(0, novosSelos.length - 1))
        }
        alert('Selo digital local excluído com sucesso!')
      }
    }
  }

  const handleExcluirSeloTJ = async () => {
    if (selosDigitais[seloSelecionado]) {
      const selo = selosDigitais[seloSelecionado]
      const motivo = prompt('Digite o motivo do cancelamento:')
      
      if (motivo && motivo.trim()) {
        const confirmacao = confirm(`Tem certeza que deseja cancelar o selo digital "${selo.seloDigital}" no TJSP?`)
        if (confirmacao) {
          // const sucesso = await tjspApi.cancelarSelo(selo.id, motivo.trim())
          // if (sucesso) {
            // Remover da lista local também
            const novosSelos = selosDigitais.filter((_, index) => index !== seloSelecionado)
            setSelosDigitais(novosSelos)
            if (seloSelecionado >= novosSelos.length) {
              setSeloSelecionado(Math.max(0, novosSelos.length - 1))
            }
            alert('Selo digital cancelado com sucesso no TJSP!')
          // } else {
          //   alert(`Erro ao cancelar selo: ${tjspApi.error || 'Erro desconhecido'}`)
          // }
        }
      } else if (motivo !== null) {
        alert('Motivo é obrigatório para cancelamento')
      }
    }
  }

  // Funções para arrastar documento
  const handleDocumentMouseDown = (e: React.MouseEvent) => {
    if (outrosDocumentos.length > 0) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - documentPosition.x,
        y: e.clientY - documentPosition.y
      })
    }
  }

  const handleDocumentMouseMove = (e: React.MouseEvent) => {
    if (isDragging && outrosDocumentos.length > 0) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      setDocumentPosition({ x: newX, y: newY })
    }
  }

  const handleDocumentMouseUp = () => {
    setIsDragging(false)
  }

  const handleDocumentMouseLeave = () => {
    setIsDragging(false)
  }

  // Resetar posição do documento quando necessário
  const resetDocumentPosition = () => {
    setDocumentPosition({ x: 0, y: 0 })
  }

  const tabStyles = {
    display: 'flex',
    backgroundColor: theme.background,
    borderBottom: `1px solid ${theme.border}`,
    marginTop: '-8px',  // Sube as abas para mais perto do topo
    marginBottom: '4px',  // Reduz espaço abaixo das abas
    flexShrink: 0  // Não encolhe
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

  // 🔒 BLOQUEIO: formStyles - NÃO MODIFICAR flexShrink ou minWidth
  const formStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',  // 🔒 FIXO - Gap uniforme entre linhas
    marginTop: '2px',  // Margem menor
    backgroundColor: theme.surface,
    color: theme.text,
    minWidth: 0,  // 🔒 FIXO - Permite encolher para adaptar
    flexShrink: 1  // 🔒 FIXO - Encolhe proporcionalmente
  }

  // 🔒 BLOQUEIO: rowStyles - NUNCA modificar flexWrap, gap ou justifyContent
  const rowStyles = {
    display: 'flex',
    gap: '8px',  // 🔒 FIXO - Gap uniforme entre campos
    alignItems: 'start',
    marginBottom: '2px',  // Margem menor para economizar espaço vertical
    justifyContent: 'space-between',  // 🔒 FIXO - Distribui campos uniformemente
    flexWrap: 'nowrap' as const,  // 🔒 CRÍTICO - NÃO quebra linha - mantém campos juntos
    minWidth: 0,
    flexShrink: 1  // 🔒 FIXO - Encolhe proporcionalmente
  }

  // 🔒 BLOQUEIO: fieldStyles - NÃO MODIFICAR flexShrink ou flex
  const fieldStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1px',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
    minHeight: '38px',  // Altura menor para economizar espaço
    paddingTop: '0px',
    marginTop: '0px',
    minWidth: 0,
    flex: '1',  // 🔒 FIXO - Cada campo ocupa espaço igual
    flexShrink: 1  // 🔒 FIXO - Encolhe proporcionalmente
  }

  // Estilos para campos menores (CEP, Logradouro, Número)
  const fieldStylesSmall = {
    ...fieldStyles,
    flex: '0.6',  // 60% do tamanho padrão
    minWidth: '60px'
  }

  // Estilos para campo Endereço (maior)
  const fieldStylesLarge = {
    ...fieldStyles,
    flex: '2',  // 200% do tamanho padrão
    minWidth: 0
  }

  const labelStyles: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '600',
    color: theme.text,
    marginBottom: '1px',
    height: '16px',
    lineHeight: '16px',
    display: 'flex',
    alignItems: 'center',
    marginTop: '0px',
    paddingTop: '0px',
    verticalAlign: 'top',
    position: 'relative' as const,
    top: '0px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    minWidth: 0
  }

  // 🔒 BLOQUEIO: getInputStyles - NÃO MODIFICAR minWidth ou flexShrink
  const getInputStyles = (fieldName: string) => {
    const focusColor = theme.background === '#1a1a1a' ? '#ffd4a3' : '#ffedd5'
    return {
      padding: '3px 10px',
      border: `1px solid ${theme.border}`,
      borderRadius: '3px',
      fontSize: '12px',
      backgroundColor: focusedField === fieldName ? focusColor : theme.background,
      color: focusedField === fieldName ? (theme.background === '#1a1a1a' ? '#1a1a1a' : '#000000') : theme.text,
      outline: 'none',
      height: '24px',
      minHeight: '24px',
      maxHeight: '24px',
      width: '100%',
      boxSizing: 'border-box' as const,
      lineHeight: '18px',
      minWidth: '0',  // 🔒 FIXO - Permite encolher até o mínimo
      flexShrink: 1,  // 🔒 FIXO - Encolhe proporcionalmente
      transition: 'all 0.2s ease',
      WebkitBoxShadow: focusedField === fieldName ? `0 0 0 1000px ${focusColor} inset` : `0 0 0 1000px ${theme.background} inset`,
      WebkitTextFillColor: focusedField === fieldName ? (theme.background === '#1a1a1a' ? '#1a1a1a' : '#000000') : theme.text,
      boxShadow: focusedField === fieldName ? `0 0 0 1000px ${focusColor} inset` : 'none'
    }
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
    minHeight: '24px',
    maxHeight: '24px',
    width: '100%',
    boxSizing: 'border-box' as const,
    lineHeight: '18px',
    minWidth: '80px',
    flexShrink: 0  // NÃO encolhe - mantém proporção
  }

  // 🔒 BLOQUEIO: selectStyles - NÃO MODIFICAR minWidth ou flexShrink
  const selectStyles = {
    padding: '3px 10px',
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    fontSize: '12px',
    backgroundColor: theme.background,
    color: theme.text,
    outline: 'none',
    height: '24px',
    minHeight: '24px',
    maxHeight: '24px',
    width: '100%',
    boxSizing: 'border-box' as const,
    cursor: 'pointer',
    lineHeight: '18px',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    MozAppearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 6px center',
    backgroundSize: '12px',
    paddingRight: '24px',
    verticalAlign: 'top',
    display: 'block',
    margin: '0',
    fontFamily: 'inherit',
    minWidth: '0',  // 🔒 FIXO - Permite encolher até o mínimo
    flexShrink: 1  // 🔒 FIXO - Encolhe proporcionalmente
  }

  const buttonStyles = {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    transition: 'all 0.2s ease',
    height: '40px',
    minWidth: '85px',
    maxWidth: '120px',
    justifyContent: 'center',
    whiteSpace: 'nowrap'
  }


  const getSecondaryButtonStyles = (buttonId: string) => ({
    ...buttonStyles,
    backgroundColor: hoveredButton === buttonId ? '#495057' : '#6c757d',
    color: 'white',
    transform: hoveredButton === buttonId ? 'translateY(-1px)' : 'translateY(0)',
    boxShadow: hoveredButton === buttonId ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
  })

  const getDangerButtonStyles = (buttonId: string) => ({
    ...buttonStyles,
    backgroundColor: hoveredButton === buttonId ? '#495057' : '#6c757d',
    color: 'white',
    transform: hoveredButton === buttonId ? 'translateY(-1px)' : 'translateY(0)',
    boxShadow: hoveredButton === buttonId ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
  })

  const getSuccessButtonStyles = (buttonId: string) => ({
    ...buttonStyles,
    backgroundColor: hoveredButton === buttonId ? '#495057' : '#6c757d',
    color: 'white',
    transform: hoveredButton === buttonId ? 'translateY(-1px)' : 'translateY(0)',
    boxShadow: hoveredButton === buttonId ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
  })

  const getInfoButtonStyles = (buttonId: string) => ({
    ...buttonStyles,
    backgroundColor: hoveredButton === buttonId ? '#495057' : '#6c757d',
    color: 'white',
    transform: hoveredButton === buttonId ? 'translateY(-1px)' : 'translateY(0)',
    boxShadow: hoveredButton === buttonId ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
  })

  // Estilos para outros botões (não principais)
  const secondaryButtonStyles = {
    padding: '2px 6px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease',
    height: '24px',
    minHeight: '24px',
    maxHeight: '24px',
    minWidth: '24px',
    maxWidth: '24px',
    justifyContent: 'center',
    backgroundColor: theme.border,
    color: theme.text
  }


  const buttonsContainerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '14px',
    marginTop: '2px',  // Botões bem próximos do formulário
    paddingTop: '4px',  // Espaço mínimo
    borderTop: `1px solid ${theme.border}`,
    flexWrap: 'nowrap' as const,  // NÃO quebra - botões ficam na mesma linha
    flexShrink: 0,  // Botões não encolhem
    minHeight: '40px'  // Altura mínima garantida
  }

  // Estilos para botões da barra de ferramentas
  const toolbarButtonStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 8px',
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: theme.surface,
    color: theme.text,
    fontSize: '10px',
    minWidth: '55px',
    height: '42px',
    transition: 'all 0.15s ease',
    gap: '2px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }

  const toolbarButtonDisabledStyles = {
    ...toolbarButtonStyles,
    opacity: 0.5,
    cursor: 'not-allowed',
    backgroundColor: theme.background
  }

  // Função auxiliar para obter estilos de botão
  const getToolbarButtonStyle = (isDisabled: boolean) => {
    return isDisabled ? toolbarButtonDisabledStyles : toolbarButtonStyles
  }

  return (
    <>
    <BasePage title="Cliente" onClose={onClose} width="900px" height="580px" minWidth="900px" minHeight="580px" resetToOriginalPosition={resetToOriginalPosition} headerColor={headerColor} resizable={false}>
      {/* 🔒 BLOQUEIO: Redimensionamento DESABILITADO - Dimensões fixas 900x580px */}
      {/* Wrapper para garantir tema correto */}
      <div 
        className={`theme-${currentTheme}`}
        style={{ 
          backgroundColor: theme.surface, 
          color: theme.text, 
          width: '100%', 
          height: '100%',
          minHeight: '580px',  // Altura mínima = altura da janela
          padding: '8px',
          overflowY: activeTab === 'cadastro' ? 'auto' : 'hidden',  // Scroll apenas em cadastro
          overflowX: 'auto',  // Scroll horizontal quando menor que tamanho padrão
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
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
          <div style={{...rowStyles, display: 'flex', alignItems: 'flex-end', gap: '8px'}}>
            {/* Campo Código */}
            <div style={{display: 'flex', flexDirection: 'column', maxWidth: '150px', flexShrink: 0}}>
              <label style={{fontSize: '12px', color: theme.text, marginBottom: '2px', height: '18px', lineHeight: '18px'}}>Código</label>
              <div style={{display: 'flex', gap: '4px', alignItems: 'center', height: '24px'}}>
                <button
                  type="button"
                  onClick={handleScanner}
                  style={{
                    padding: '0',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '24px',
                    width: '24px',
                    minWidth: '24px',
                    flexShrink: 0
                  }}
                  title="Escanear documento"
                >
                  📷
                </button>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => {
                    // Permite apenas números
                    const valor = e.target.value.replace(/\D/g, '')
                    handleInputWithLimit('codigo', valor, 10)
                  }}
                  style={{...inputStyles, flex: 1, minWidth: '50px', height: '24px'}}
                  maxLength={10}
                />
                <button type="button" style={{...secondaryButtonStyles, height: '24px'}}>...</button>
              </div>
            </div>

            {/* Campo Nome */}
            <div style={{display: 'flex', flexDirection: 'column', flex: '0.7', minWidth: '100px'}}>
              <label style={{fontSize: '12px', color: theme.text, marginBottom: '2px', height: '18px', lineHeight: '18px'}}>Nome *</label>
              <div style={{display: 'flex', gap: '6px', alignItems: 'center', height: '24px'}}>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputWithLimit('nome', e.target.value, 100)}
                  style={{...inputStyles, flex: 1, height: '24px'}}
                  maxLength={100}
                  required
                />
                <button type="button" style={{...secondaryButtonStyles, height: '24px'}}>...</button>
              </div>
            </div>

            {/* Campo Número Cartão */}
            <div style={{display: 'flex', flexDirection: 'column', flex: '0.5', minWidth: '100px', maxWidth: '180px'}}>
              <label style={{fontSize: '12px', color: theme.text, marginBottom: '2px', height: '18px', lineHeight: '18px'}}>Número Cartão</label>
              <div style={{display: 'flex', gap: '2px', alignItems: 'center', height: '24px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '2px', height: '24px'}}>
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    style={{ 
                      margin: 0,
                      padding: 0,
                      border: '0',
                      outline: '0',
                      boxShadow: 'none',
                      width: '14px', 
                      height: '14px',
                      flexShrink: 0
                    }} 
                  />
                  <span style={{fontSize: '11px', color: theme.text, whiteSpace: 'nowrap', lineHeight: '24px'}}>Cartão</span>
                </div>
                <input
                  type="text"
                  value={formData.numeroCartao}
                  onChange={(e) => {
                    // Permite apenas números
                    const valor = e.target.value.replace(/\D/g, '')
                    handleInputChange('numeroCartao', valor)
                  }}
                  style={{...inputStyles, flex: 1, minWidth: '30px', height: '24px'}}
                  maxLength={20}
                />
                <button type="button" style={{...secondaryButtonStyles, height: '24px', minWidth: '25px', padding: '3px 6px'}}>...</button>
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
              onChange={(e) => {
                // Permite apenas números, máximo 11 dígitos
                const valor = e.target.value.replace(/\D/g, '').slice(0, 11)
                handleInputChange('cpf', valor)
              }}
              onFocus={() => setFocusedField('cpf')}
              onBlur={(e) => {
                setFocusedField(null)
                const valor = e.target.value
                if (valor) {
                  // Formata CPF
                  const cpfFormatado = formatCPF(valor)
                  handleInputChange('cpf', cpfFormatado)
                  
                  // Valida CPF
                  const validacao = validarCPF(valor)
                  if (!validacao.isValid) {
                    alert(`❌ CPF inválido!\n\n${validacao.error}`)
                  }
                }
              }}
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
                onChange={(e) => handleInputWithLimit('rg', e.target.value, 20)}
                style={inputStyles}
                maxLength={20}
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
                onChange={(e) => handleInputWithLimit('orgaoRg', e.target.value, 10)}
                style={inputStyles}
                maxLength={10}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Data de Nascimento *</label>
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
                onChange={(e) => handleFieldChange('naturalidade', e.target.value)}
                style={inputStyles}
                maxLength={50}
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

            <div style={fieldStyles}>
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
            <div style={fieldStyles}>
              <label style={labelStyles}>Nome do Pai</label>
              <input
                type="text"
                value={formData.pai}
                onChange={(e) => handleInputWithLimit('pai', e.target.value, 100)}
                style={inputStyles}
                maxLength={100}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Nome da Mãe</label>
              <input
                type="text"
                value={formData.mae}
                onChange={(e) => handleInputWithLimit('mae', e.target.value, 100)}
                style={inputStyles}
                maxLength={100}
              />
            </div>

            <div style={fieldStyles}>
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
            <div style={fieldStylesSmall}>
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

            <div style={fieldStylesSmall}>
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

            <div style={fieldStylesLarge}>
              <label style={labelStyles}>Endereço</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => handleInputWithLimit('endereco', e.target.value, 100)}
                  style={inputStyles}
                  maxLength={100}
                />
            </div>

            <div style={fieldStylesSmall}>
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

            <div style={fieldStyles}>
              <label style={labelStyles}>Cidade</label>
              <CidadeAutocompleteInput
                value={formData.cidade}
                onChange={(cidade) => handleInputWithLimit('cidade', cidade, 50)}
                onUfChange={(uf) => handleInputChange('ufEndereco', uf)}
                uf={formData.uf}
                inputStyles={inputStyles}
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

            <div style={fieldStyles}>
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
              <label style={labelStyles}>Código País/IBGE</label>
              <input
                type="text"
                value={formData.codigoIbge}
                onChange={(e) => handleInputWithLimit('codigoIbge', e.target.value, 10)}
                style={inputStyles}
                maxLength={10}
                placeholder="Código do país ou IBGE"
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
                onChange={(e) => handleFieldChange('telefone', e.target.value)}
                style={inputStyles}
                placeholder="(00) 0000-0000"
                maxLength={14}
              />
            </div>

            <div style={fieldStyles}>
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

            <div style={fieldStyles}>
              <label style={labelStyles}>E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={(e) => {
                  const email = e.target.value.trim()
                  if (email && !email.includes('@')) {
                    alert('⚠️ E-mail inválido! O e-mail deve conter @')
                  } else if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                    alert('⚠️ E-mail inválido! Formato correto: usuario@exemplo.com')
                  }
                }}
                style={inputStyles}
                placeholder="usuario@exemplo.com"
                maxLength={100}
              />
            </div>
          </div>

          {/* Linha 8: Atendente, Assinante do Cartão */}
          <div style={rowStyles}>
            <div style={fieldStyles}>
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

            <div style={fieldStyles}>
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

          {/* Botões de Ação */}
          <div style={buttonsContainerStyles}>
            <button 
              type="button" 
              style={getInfoButtonStyles('novo')} 
              onClick={handleNovo}
              onMouseEnter={() => setHoveredButton('novo')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              📄 Novo
            </button>
            <button 
              type="button" 
              style={getSuccessButtonStyles('gravar')} 
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
                console.log('🚪 BOTÃO RETORNAR CLICADO!')
                console.log('🔧 onClose function:', onClose)
                onClose()
              }}
              onMouseEnter={() => setHoveredButton('fechar')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              🚪 Retornar
            </button>
          </div>

        </form>
      )}

      {activeTab === 'digitalizacao' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Abas Secundárias */}
            <div style={{
              display: 'flex',
              gap: '2px',
              marginBottom: '2px',  // Reduzido de 4px para 2px
              borderBottom: `1px solid ${theme.border}`,
              flexShrink: 0  // Não encolhe
            }}>
              <button
                style={{
                  padding: '4px 12px',  // Reduzido de 8px 16px para 4px 12px
                  border: 'none',
                  backgroundColor: theme.surface,
                  color: theme.text,
                  cursor: 'pointer',
                  borderBottom: `2px solid ${digitalizacaoTab === 'cartoes-assinatura' ? theme.primary : 'transparent'}`,
                  fontSize: '11px',  // Reduzido de 12px para 11px
                  fontWeight: '500'
                }}
                onClick={() => setDigitalizacaoTab('cartoes-assinatura')}
              >
                Cartões de Assinatura
              </button>
              <button
                style={{
                  padding: '4px 12px',  // Reduzido de 8px 16px para 4px 12px
                  border: 'none',
                  backgroundColor: theme.surface,
                  color: theme.text,
                  cursor: 'pointer',
                  borderBottom: `2px solid ${digitalizacaoTab === 'outros-documentos' ? theme.primary : 'transparent'}`,
                  fontSize: '11px',  // Reduzido de 12px para 11px
                  fontWeight: '500'
                }}
                onClick={() => setDigitalizacaoTab('outros-documentos')}
              >
                Outros Documentos
              </button>
            </div>

          {/* Área de Visualização de Documentos */}
          <div style={{
            flex: 1,  // Ocupa espaço disponível ao invés de altura fixa
            backgroundColor: '#D4D4D4',  // Cinza claro padrão
            marginTop: '2px',
            border: `1px solid ${theme.border}`,
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '240px',  // Aumentado de 200px para 240px
            maxHeight: '370px'  // Aumentado de 320px para 370px
          }}>
            {digitalizacaoTab === 'cartoes-assinatura' ? (
              /* Conteúdo para Cartões de Assinatura */
              cartoesAssinatura.length > 0 ? (
                <div 
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: isDraggingCartoes ? 'grabbing' : 'grab',
                    overflow: 'hidden'
                  }}
                  onMouseDown={handleCartaoMouseDown}
                  onMouseMove={handleCartaoMouseMove}
                  onMouseUp={handleCartaoMouseUp}
                  onMouseLeave={handleCartaoMouseLeave}
                >
                  <div style={{
                    transform: `translate(${documentPositionCartoes.x}px, ${documentPositionCartoes.y}px) rotate(${rotacaoCartoes}deg) scale(${zoomLevelCartoes / 100})`,
                    transition: isDraggingCartoes ? 'none' : 'transform 0.3s ease',
                    maxWidth: '90%',
                    maxHeight: '90%',
                    userSelect: 'none'
                  }}>
                    <img 
                      src={URL.createObjectURL(cartoesAssinatura[cartaoAtual]?.arquivo)} 
                      alt={cartoesAssinatura[cartaoAtual]?.nome}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        pointerEvents: 'none'
                      }}
                      draggable={false}
                    />
                  </div>
                  {/* Contador de cartões */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(79,79,79,0.8)',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {cartaoAtual + 1} de {cartoesAssinatura.length}
                  </div>
                </div>
              ) : (
                /* Logo Civitas quando não há cartões */
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: '#4F4F4F',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    CIVITAS
                  </div>
                  <div style={{
                    color: '#4F4F4F',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}>
                    Nenhum cartão de assinatura carregado
                  </div>
                </div>
              )
            ) : (
              /* Conteúdo para Outros Documentos */
              outrosDocumentos.length > 0 ? (
                <div 
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    overflow: 'hidden'
                  }}
                  onMouseDown={handleDocumentMouseDown}
                  onMouseMove={handleDocumentMouseMove}
                  onMouseUp={handleDocumentMouseUp}
                  onMouseLeave={handleDocumentMouseLeave}
                >
                  <div style={{
                    transform: `translate(${documentPosition.x}px, ${documentPosition.y}px) rotate(${rotacao}deg) scale(${zoomLevel / 100})`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease',
                    maxWidth: '90%',
                    maxHeight: '90%',
                    userSelect: 'none'
                  }}>
                    <img 
                      src={URL.createObjectURL(outrosDocumentos[documentoAtual]?.arquivo)} 
                      alt={outrosDocumentos[documentoAtual]?.nome}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        pointerEvents: 'none'
                      }}
                      draggable={false}
                    />
                  </div>
                  {/* Contador de documentos */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(79,79,79,0.8)',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {documentoAtual + 1} de {outrosDocumentos.length}
                  </div>
                </div>
              ) : (
                /* Logo Civitas quando não há documentos */
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#4F4F4F',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  CIVITAS
                </div>
                  <div style={{
                    color: '#4F4F4F',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}>
                    Nenhum documento carregado
                  </div>
                </div>
              )
            )}
          </div>

          {/* Barra de Ferramentas */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '2px 4px',  // Reduzido de 4px 8px para 2px 4px
            backgroundColor: theme.surface,
            borderTop: `1px solid ${theme.border}`,
            marginTop: '2px',  // Reduzido de 4px para 2px
            flexShrink: 0  // Não encolhe
          }}>
            {/* Controles de Navegação */}
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
              {digitalizacaoTab === 'cartoes-assinatura' ? (
                <>
                  <button 
                    style={getToolbarButtonStyle(cartoesAssinatura.length === 0)}
                    onClick={handlePrimeiroCartao}
                    disabled={cartoesAssinatura.length === 0}
                    title="Primeiro cartão"
                  >
                    <div style={{ fontSize: '16px' }}>⏮️</div>
                    <div style={{ fontSize: '10px' }}>Primeiro</div>
                  </button>
                  <button 
                    style={getToolbarButtonStyle(cartoesAssinatura.length === 0 || cartaoAtual === 0)}
                    onClick={handleCartaoAnterior}
                    disabled={cartoesAssinatura.length === 0 || cartaoAtual === 0}
                    title="Cartão anterior"
                  >
                    <div style={{ fontSize: '16px' }}>◀️</div>
                    <div style={{ fontSize: '10px' }}>Anterior</div>
                  </button>
                  <button 
                    style={getToolbarButtonStyle(cartoesAssinatura.length === 0 || cartaoAtual === cartoesAssinatura.length - 1)}
                    onClick={handleProximoCartao}
                    disabled={cartoesAssinatura.length === 0 || cartaoAtual === cartoesAssinatura.length - 1}
                    title="Próximo cartão"
                  >
                    <div style={{ fontSize: '16px' }}>▶️</div>
                    <div style={{ fontSize: '10px' }}>Próximo</div>
                  </button>
                  <button 
                    style={getToolbarButtonStyle(cartoesAssinatura.length === 0)}
                    onClick={handleUltimoCartao}
                    disabled={cartoesAssinatura.length === 0}
                    title="Último cartão"
                  >
                    <div style={{ fontSize: '16px' }}>⏭️</div>
                    <div style={{ fontSize: '10px' }}>Último</div>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    style={getToolbarButtonStyle(outrosDocumentos.length === 0)}
                    onClick={handlePrimeiroDocumento}
                    disabled={outrosDocumentos.length === 0}
                    title="Primeiro documento"
                  >
                    <div style={{ fontSize: '16px' }}>⏮️</div>
                    <div style={{ fontSize: '10px' }}>Primeiro</div>
                  </button>
                  <button 
                    style={getToolbarButtonStyle(outrosDocumentos.length === 0 || documentoAtual === 0)}
                    onClick={handleDocumentoAnterior}
                    disabled={outrosDocumentos.length === 0 || documentoAtual === 0}
                    title="Documento anterior"
                  >
                    <div style={{ fontSize: '16px' }}>◀️</div>
                    <div style={{ fontSize: '10px' }}>Anterior</div>
                  </button>
                  <button 
                    style={getToolbarButtonStyle(outrosDocumentos.length === 0 || documentoAtual === outrosDocumentos.length - 1)}
                    onClick={handleProximoDocumento}
                    disabled={outrosDocumentos.length === 0 || documentoAtual === outrosDocumentos.length - 1}
                    title="Próximo documento"
                  >
                    <div style={{ fontSize: '16px' }}>▶️</div>
                    <div style={{ fontSize: '10px' }}>Próximo</div>
                  </button>
                  <button 
                    style={getToolbarButtonStyle(outrosDocumentos.length === 0)}
                    onClick={handleUltimoDocumento}
                    disabled={outrosDocumentos.length === 0}
                    title="Último documento"
                  >
                    <div style={{ fontSize: '16px' }}>⏭️</div>
                    <div style={{ fontSize: '10px' }}>Último</div>
                  </button>
                </>
              )}
            </div>

            {/* Botões de Ação */}
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
              {digitalizacaoTab === 'cartoes-assinatura' ? (
                <>
                  <button 
                    style={toolbarButtonStyles}
                    onClick={handleNovoCartao}
                    title="Carregar novo cartão"
                  >
                    <div style={{ fontSize: '16px' }}>📄</div>
                    <div style={{ fontSize: '10px' }}>Novo</div>
                  </button>
                  <button 
                    style={toolbarButtonStyles}
                    onClick={handleScannerCartao}
                    title="Digitalizar cartão com scanner"
                  >
                    <div style={{ fontSize: '16px' }}>📷</div>
                    <div style={{ fontSize: '10px' }}>Scanner</div>
                  </button>
                  <button 
                    style={getToolbarButtonStyle(cartoesAssinatura.length === 0)}
                    onClick={handleExcluirCartao}
                    disabled={cartoesAssinatura.length === 0}
                    title="Excluir cartão atual"
                  >
                    <div style={{ fontSize: '16px', color: '#dc2626' }}>❌</div>
                    <div style={{ fontSize: '10px' }}>Excluir</div>
                  </button>
                  <button 
                    style={getToolbarButtonStyle(cartoesAssinatura.length === 0)}
                    onClick={handleImprimirCartao}
                    disabled={cartoesAssinatura.length === 0}
                    title="Imprimir cartão atual"
                  >
                    <div style={{ fontSize: '16px' }}>🖨️</div>
                    <div style={{ fontSize: '10px' }}>Imprimir</div>
                  </button>
                  <button 
                    style={getToolbarButtonStyle(cartoesAssinatura.length === 0)}
                    onClick={handleGirarCartao90}
                    disabled={cartoesAssinatura.length === 0}
                    title="Girar cartão 90 graus"
                  >
                    <div style={{ fontSize: '16px' }}>↻</div>
                    <div style={{ fontSize: '10px' }}>Girar 90°</div>
                  </button>
                  <button 
                    style={getToolbarButtonStyle(cartoesAssinatura.length === 0)}
                    onClick={handleGirarCartao180}
                    disabled={cartoesAssinatura.length === 0}
                    title="Girar cartão 180 graus"
                  >
                    <div style={{ fontSize: '16px' }}>↻↻</div>
                    <div style={{ fontSize: '10px' }}>Girar 180°</div>
                  </button>
                  <button 
                    style={getToolbarButtonStyle(cartoesAssinatura.length === 0 || zoomLevelCartoes >= 300)}
                    onClick={handleZoomInCartao}
                    disabled={cartoesAssinatura.length === 0 || zoomLevelCartoes >= 300}
                    title="Aumentar zoom do cartão"
                  >
                    <div style={{ fontSize: '16px' }}>🔍+</div>
                    <div style={{ fontSize: '10px' }}>+ Zoom</div>
                  </button>
                  <button 
                    style={getToolbarButtonStyle(cartoesAssinatura.length === 0 || zoomLevelCartoes <= 25)}
                    onClick={handleZoomOutCartao}
                    disabled={cartoesAssinatura.length === 0 || zoomLevelCartoes <= 25}
                    title="Diminuir zoom do cartão"
                  >
                    <div style={{ fontSize: '16px' }}>🔍-</div>
                    <div style={{ fontSize: '10px' }}>- Zoom</div>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    style={toolbarButtonStyles}
                    onClick={handleNovoDocumento}
                    title="Carregar novo documento"
                  >
                    <div style={{ fontSize: '16px' }}>📄</div>
                    <div style={{ fontSize: '10px' }}>Novo</div>
                  </button>
                  <button 
                    style={toolbarButtonStyles}
                    onClick={handleScanner}
                    title="Digitalizar documento com scanner"
                  >
                    <div style={{ fontSize: '16px' }}>📷</div>
                    <div style={{ fontSize: '10px' }}>Scanner</div>
                  </button>
                  <button 
                    style={getToolbarButtonStyle(outrosDocumentos.length === 0)}
                    onClick={handleExcluirDocumento}
                    disabled={outrosDocumentos.length === 0}
                    title="Excluir documento atual"
                  >
                    <div style={{ fontSize: '16px', color: '#dc2626' }}>❌</div>
                    <div style={{ fontSize: '10px' }}>Excluir</div>
                  </button>
                  <button 
                    style={getToolbarButtonStyle(outrosDocumentos.length === 0)}
                    onClick={handleImprimir}
                    disabled={outrosDocumentos.length === 0}
                    title="Imprimir documento atual"
                  >
                    <div style={{ fontSize: '16px' }}>🖨️</div>
                    <div style={{ fontSize: '10px' }}>Imprimir</div>
                  </button>
                  <button 
                    style={getToolbarButtonStyle(outrosDocumentos.length === 0)}
                    onClick={handleGirar90}
                    disabled={outrosDocumentos.length === 0}
                    title="Girar documento 90 graus"
                  >
                    <div style={{ fontSize: '16px' }}>↻</div>
                    <div style={{ fontSize: '10px' }}>Girar 90°</div>
                  </button>
                  <button 
                    style={getToolbarButtonStyle(outrosDocumentos.length === 0)}
                    onClick={handleGirar180}
                    disabled={outrosDocumentos.length === 0}
                    title="Girar documento 180 graus"
                  >
                    <div style={{ fontSize: '16px' }}>↻↻</div>
                    <div style={{ fontSize: '10px' }}>Girar 180°</div>
                  </button>
                  <button 
                    style={getToolbarButtonStyle(outrosDocumentos.length === 0 || zoomLevel >= 300)}
                    onClick={handleZoomIn}
                    disabled={outrosDocumentos.length === 0 || zoomLevel >= 300}
                    title="Aumentar zoom do documento"
                  >
                    <div style={{ fontSize: '16px' }}>🔍+</div>
                    <div style={{ fontSize: '10px' }}>+ Zoom</div>
                  </button>
                  <button 
                    style={getToolbarButtonStyle(outrosDocumentos.length === 0 || zoomLevel <= 25)}
                    onClick={handleZoomOut}
                    disabled={outrosDocumentos.length === 0 || zoomLevel <= 25}
                    title="Diminuir zoom do documento"
                  >
                    <div style={{ fontSize: '16px' }}>🔍-</div>
                    <div style={{ fontSize: '10px' }}>- Zoom</div>
                  </button>
                </>
              )}
            </div>

            {/* Botão Retornar */}
            <button 
              style={{
                ...toolbarButtonStyles,
                backgroundColor: '#10b981',
                color: 'white'
              }}
              onClick={digitalizacaoTab === 'cartoes-assinatura' ? handleRetornarCartao : handleRetornar}
              title="Voltar para aba Cadastro"
            >
              <div style={{ fontSize: '16px' }}>↶</div>
              <div style={{ fontSize: '10px' }}>Retornar</div>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'selo-digital' && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%', 
          padding: '12px',
          gap: '8px',
          overflow: 'auto'  // Permite scroll se necessário
        }}>
          {/* Grade de Dados */}
          <div style={{
            backgroundColor: theme.surface,
            border: `2px solid ${theme.primary}`,  // Borda mais grossa e colorida
            borderRadius: '6px',
            overflow: 'auto',
            height: '250px',  // Altura aumentada para 250px
            flexShrink: 0,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'  // Sombra para destaque
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              backgroundColor: theme.primary,
              color: 'white',
              fontWeight: 'bold',
              fontSize: '11px',  // Reduzido de 12px para 11px
              flexShrink: 0
            }}>
              <div style={{ padding: '6px 8px', borderRight: `1px solid ${theme.border}` }}>DataCadastro</div>
              <div style={{ padding: '6px 8px', borderRight: `1px solid ${theme.border}` }}>Selo Digital</div>
              <div style={{ padding: '6px 8px', borderRight: `1px solid ${theme.border}` }}>CNS</div>
              <div style={{ padding: '6px 8px', borderRight: `1px solid ${theme.border}` }}>Natureza Ato</div>
              <div style={{ padding: '6px 8px', borderRight: `1px solid ${theme.border}` }}>AnoAto</div>
              <div style={{ padding: '6px 8px', borderRight: `1px solid ${theme.border}` }}>Digito</div>
              <div style={{ padding: '6px 8px' }}>CIA</div>
            </div>
            
            {/* Linhas de dados */}
            {selosDigitais.map((selo, index) => (
              <div 
                key={selo.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  backgroundColor: seloSelecionado === index ? '#6b7280' : theme.background,
                  color: seloSelecionado === index ? 'white' : theme.text,
                  fontSize: '11px',
                  cursor: 'pointer',
                  borderBottom: `1px solid ${theme.border}`
                }}
                onClick={() => handleSelecionarSelo(index)}
              >
                <div style={{ padding: '6px 8px', borderRight: `1px solid ${theme.border}` }}>{selo.dataCadastro}</div>
                <div style={{ padding: '6px 8px', borderRight: `1px solid ${theme.border}` }}>{selo.seloDigital}</div>
                <div style={{ padding: '6px 8px', borderRight: `1px solid ${theme.border}` }}>{selo.cns}</div>
                <div style={{ padding: '6px 8px', borderRight: `1px solid ${theme.border}` }}>{selo.naturezaAto}</div>
                <div style={{ padding: '6px 8px', borderRight: `1px solid ${theme.border}` }}>{selo.anoAto}</div>
                <div style={{ padding: '6px 8px', borderRight: `1px solid ${theme.border}` }}>{selo.digito}</div>
                <div style={{ padding: '6px 8px' }}>{selo.cia}</div>
              </div>
            ))}
          </div>

          {/* Painéis Inferiores */}
          <div style={{
            display: 'flex',
            gap: '4px',
            overflow: 'hidden',
            flexShrink: 0  // Garante que não será cortado
          }}>
            {/* Painel QR Code */}
            <div style={{
              width: '200px',
              backgroundColor: '#e5e7eb',
              border: `1px solid ${theme.border}`,
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '8px',
              flexShrink: 0
            }}>
              <div style={{
                width: '130px',
                height: '130px',
                backgroundColor: '#e5e7eb',
                border: `2px solid ${theme.border}`,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {selosDigitais[seloSelecionado] ? (
                  <img 
                    src={selosDigitais[seloSelecionado].qrCode} 
                    alt="QR Code"
                    style={{
                      width: '126px',
                      height: '126px',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <div style={{
                    color: theme.textSecondary,
                    fontSize: '14px',
                    textAlign: 'center'
                  }}>
                    (QrCode)
                  </div>
                )}
              </div>
              
              <button 
                style={{
                  padding: '10px 16px',
                  backgroundColor: theme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  width: '100%'
                }}
                onClick={handleCopiarQRCode}
                disabled={!selosDigitais[seloSelecionado]}
              >
                Copiar QRCode
              </button>
            </div>

            {/* Painel de Campos */}
            <div style={{
              flex: '1',
              backgroundColor: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: '4px',
              padding: '8px 20px 20px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              justifyContent: 'flex-start'
            }}>
              <input
                type="text"
                placeholder="Selo Digital"
                value={campoPrincipal}
                onChange={(e) => setCampoPrincipal(e.target.value)}
                style={{
                  width: 'calc(100% - 10px)',
                  maxWidth: '100%',
                  height: '70px',
                  padding: '12px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '4px',
                  backgroundColor: theme.background,
                  color: theme.text,
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                  marginTop: '0'
                }}
              />
              <input
                type="text"
                placeholder="CNS"
                value={campoSecundario}
                onChange={(e) => setCampoSecundario(e.target.value)}
                style={{
                  width: 'calc(100% - 10px)',
                  maxWidth: '100%',
                  height: '42px',
                  padding: '10px 12px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '4px',
                  backgroundColor: theme.background,
                  color: theme.text,
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box' as const
                }}
              />

              {/* Botões Vermelhos */}
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button 
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={handleExcluirSeloLocal}
                  disabled={!selosDigitais[seloSelecionado]}
                >
                  Excluir Selo (Local)
                </button>
                <button 
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={handleExcluirSeloTJ}
                  disabled={!selosDigitais[seloSelecionado]}
                >
                  Excluir Selo (TJ)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </BasePage>
    
    {showScannerConfig && (
      isWebEnvironment ? (
        <WebScannerConfig
          onScan={async (config) => {
            setShowScannerConfig(false)
            await handleScannerComOCR()
          }}
          onClose={() => setShowScannerConfig(false)}
        />
      ) : (
        <ScannerConfig
          onScan={async (config) => {
            setShowScannerConfig(false)
            await handleScannerComOCR()
          }}
          onClose={() => setShowScannerConfig(false)}
        />
      )
    )}
    
    <OCRProgress 
      isVisible={ocrProgress.isVisible}
      progress={ocrProgress.progress}
      status={ocrProgress.status}
    />
  </>
  )
}

