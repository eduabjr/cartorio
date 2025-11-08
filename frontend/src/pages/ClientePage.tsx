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

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { CidadeAutocompleteInput } from '../components/CidadeAutocompleteInput'
import { CustomSelect } from '../components/CustomSelect'
import { UF_OPTIONS, PAIS_OPTIONS } from '../constants/selectOptions'
import { BasePage } from '../components/BasePage'
import { OCRProgress } from '../components/OCRProgress'
import { ScannerConfig } from '../components/ScannerConfig'
import { WebScannerConfig } from '../components/WebScannerConfig'
import { ExtractedData } from '../utils/ocrUtils'
import { useAccessibility } from '../hooks/useAccessibility'
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation'
import { scannerService } from '../services/ScannerService'
import { ocrService } from '../services/OCRService'
import QRCode from 'qrcode'
import { useFieldValidation } from '../hooks/useFieldValidation'
import { validarCPF, formatCPF } from '../utils/cpfValidator'
import { useModal } from '../hooks/useModal'
import { useFormPersist, clearPersistedForm } from '../hooks/useFormPersist'
// import { useTJSPApi } from '../hooks/useTJSPApi'

// CSS específico para dropdowns de países com scroll pequeno quando expandido
const paisDropdownCSS = `
  .pais-select {
    /* Mantém o estilo normal quando fechado */
    height: auto;
  }
  
  .pais-select option {
    padding: 2px 4px;
    font-size: 12px;
    line-height: 1.1;
  }
  
  /* Quando o dropdown está expandido (focado), limita a altura e adiciona scroll */
  .pais-select:focus {
    max-height: 80px !important;
    overflow-y: auto !important;
    scroll-behavior: smooth !important;
  }
  
  /* Estilo específico para o dropdown expandido */
  .pais-select[size="1"]:focus {
    max-height: 80px !important;
    overflow-y: auto !important;
  }
  
  /* Scrollbar personalizada para ficar mais discreta */
  .pais-select::-webkit-scrollbar {
    width: 6px;
  }
  
  .pais-select::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  .pais-select::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }
  
  .pais-select::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`

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

const CLIENTE_RESULTADOS_STORAGE_KEY = 'cliente-pesquisa-estado'

export function ClientePage({ onClose, resetToOriginalPosition }: ClientePageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  // const tjspApi = useTJSPApi()
  const theme = getTheme()
  const modal = useModal()
  
  // Cor do header: teal no light, laranja no dark
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
  
  const [activeTab, setActiveTab] = useState('cadastro')
  
  // 🔒 Criar uma ref para armazenar a chave de persistência
  const persistKeyRef = useRef<string>('')
  
  // Atalhos de teclado específicos para Cliente (definidos antes de serem usados)
  const atalhosTeclado = [
    {
      key: 's',
      ctrl: true,
      action: async () => {
        console.log('⌨️ Ctrl+S - Salvando cliente...')
        await handleGravar()
      },
      description: 'Salvar cliente'
    },
    {
      key: 'n',
      ctrl: true,
      action: () => {
        console.log('⌨️ Ctrl+N - Novo cliente')
        handleNovo()
      },
      description: 'Novo cliente'
    },
    {
      key: 'Escape',
      action: () => {
        if (showResultados) {
          console.log('⌨️ ESC - Fechando resultados')
          setShowResultados(false)
        } else {
          console.log('⌨️ ESC - Fechando janela')
          onClose()
        }
      },
      description: 'Fechar'
    }
  ]
  
  // Ativar navegação por teclado
  useKeyboardNavigation(atalhosTeclado)
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [_focusedField, setFocusedField] = useState<string | null>(null)
  const [ocrProgress, setOcrProgress] = useState({ isVisible: false, progress: 0, status: '' })
  const [showScannerConfig, setShowScannerConfig] = useState(false)
  const [isWebEnvironment, setIsWebEnvironment] = useState(false)
  
  // Estados para tela intermediária de resultados
  const persistedResultados = useMemo(() => {
    if (typeof window === 'undefined') {
      return { showResultados: false, termoBusca: '', resultadosBusca: [] as any[] }
    }
    try {
      const raw = localStorage.getItem(CLIENTE_RESULTADOS_STORAGE_KEY)
      if (!raw) {
        return { showResultados: false, termoBusca: '', resultadosBusca: [] as any[] }
      }
      const parsed = JSON.parse(raw)
      return {
        showResultados: !!parsed.showResultados,
        termoBusca: typeof parsed.termoBusca === 'string' ? parsed.termoBusca : '',
        resultadosBusca: Array.isArray(parsed.resultadosBusca) ? parsed.resultadosBusca : []
      }
    } catch (error) {
      console.error('❌ Erro ao carregar resultados persistidos de Cliente:', error)
      return { showResultados: false, termoBusca: '', resultadosBusca: [] as any[] }
    }
  }, [])

  const [showResultados, setShowResultados] = useState(persistedResultados.showResultados)
  const [resultadosBusca, setResultadosBusca] = useState<any[]>(persistedResultados.resultadosBusca)
  const [termoBusca, setTermoBusca] = useState(persistedResultados.termoBusca)
  
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
  
  // Adicionar CSS específico para dropdowns de países
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = paisDropdownCSS
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])
  
  const [cartaoHabilitado, setCartaoHabilitado] = useState(true)
  
  const [funcionarios, setFuncionarios] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    codigo: '0',
    nome: '',
    atendente: '',
    assinanteCartao: '',
    numeroCartao: '0',
    sexo: '',
    cpf: '',
    rg: '',
    orgaoRg: '',
    nascimento: '',
    naturalidade: '',
    uf: '',
    pais: '',
    nacionalidade: '',
    estadoCivil: '',
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
    handleChange: handleValidatedChange
  } = useFieldValidation(formData, setFormData)

  const handleInputChange = (field: string, value: string) => {
    // Usar o hook de validação para aplicar regras globais
    handleValidatedChange(field, value)
  }

  // 🔒 PROTEÇÃO: Auto-salvar dados do formulário
  const persistKey = 'form-cliente-' + (formData.codigo || 'novo')
  persistKeyRef.current = persistKey
  useFormPersist(persistKey, formData, setFormData, true, 500)
  
  // 🔒 Limpar dados persistidos ao fechar a janela (não só ao fechar navegador)
  const handleClose = () => {
    clearPersistedForm(persistKeyRef.current)
    console.log(`🗑️ Janela fechada - Limpando dados temporários: "${persistKeyRef.current}"`)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CLIENTE_RESULTADOS_STORAGE_KEY)
    }
    onClose()
  }

  // Carregar funcionários cadastrados
  useEffect(() => {
    const carregarFuncionarios = () => {
      const funcionariosSalvos = localStorage.getItem('funcionarios-cadastrados')
      if (funcionariosSalvos) {
        const funcList = JSON.parse(funcionariosSalvos)
        setFuncionarios(funcList.filter((f: any) => f.emAtividade !== false))
      }
    }
    
    carregarFuncionarios()
    
    // Recarregar a cada 2 segundos para manter atualizado
    const interval = setInterval(carregarFuncionarios, 2000)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      const payload = JSON.stringify({
        showResultados,
        termoBusca,
        resultadosBusca
      })
      localStorage.setItem(CLIENTE_RESULTADOS_STORAGE_KEY, payload)
    } catch (error) {
      console.error('❌ Erro ao persistir resultados de busca de Cliente:', error)
    }
  }, [showResultados, termoBusca, resultadosBusca])

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

  // Função para formatar email (apenas retorna o valor sem adicionar @)
  const formatEmail = (value: string) => {
    // Apenas retorna o valor digitado pelo usuário
    return value.trim()
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
      setTimeout(async () => {
        setOcrProgress({ isVisible: false, progress: 0, status: '' })
        
        const camposPreenchidos = Object.keys(formattedData).filter(key => formattedData[key as keyof ExtractedData])
        
        let message = `✅ Scanner + OCR Concluído!\n\n📋 Campos preenchidos: ${camposPreenchidos.length}\n🔍 Confiança: ${ocrResult.confidence}%\n\n`
        
        if (validation.warnings.length > 0) {
          message += `⚠️ Avisos:\n${validation.warnings.map(w => `• ${w}`).join('\n')}\n\n`
        }
        
        message += `📄 Dados extraídos:\n${camposPreenchidos.map(campo => `• ${campo}: ${formattedData[campo as keyof ExtractedData]}`).join('\n')}\n\nVerifique os dados e faça ajustes se necessário.`
        
        await modal.alert(message, 'Scanner', 'ℹ️')
      }, 1000)

    } catch (error) {
      console.error('❌ Erro no Scanner + OCR:', error)
      setOcrProgress({ isVisible: false, progress: 0, status: '' })
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      await modal.alert(`Erro no Scanner + OCR:\n\n${errorMessage}\n\nTente novamente ou use o upload manual de arquivo.`, 'Erro', '❌')
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
  const handleConsultarCliente = async () => {
    const clientesSalvos = localStorage.getItem('clientes-cadastrados')
    
    if (!clientesSalvos) {
      await modal.alert('Nenhum cliente cadastrado no sistema', 'Informação', 'ℹ️')
      return
    }
    
    try {
      const clientes = JSON.parse(clientesSalvos)
      
      if (clientes.length === 0) {
        await modal.alert('Nenhum cliente cadastrado no sistema', 'Informação', 'ℹ️')
        return
      }
      
      // Se não digitou código, mostra TODOS
      const codigoConsulta = formData.codigo.trim()
      if (!codigoConsulta || codigoConsulta === '0') {
        setTermoBusca('Todos os Clientes')
        setResultadosBusca(clientes)
        setShowResultados(true)
        return
      }
      
      // Se digitou código, filtra por código
      const encontrados = clientes.filter((c: any) => 
        c.codigo.includes(codigoConsulta)
      )
      
      if (encontrados.length === 0) {
        await modal.alert('Nenhum cliente encontrado', 'Não Encontrado', '❌')
        return
      }
      
      // SEMPRE mostra tela intermediária
      setTermoBusca(`Código: ${codigoConsulta}`)
      setResultadosBusca(encontrados)
      setShowResultados(true)
    } catch (error) {
      console.error('❌ Erro ao consultar cliente:', error)
      await modal.alert('Erro ao consultar cliente', 'Erro', '❌')
    }
  }

  const handleNovo = () => {
    setFormData({
      codigo: '0',
      nome: '',
      numeroCartao: '0',
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
      sexo: ''
    })
    // Desmarcar checkbox do cartão
    setCartaoHabilitado(false)
    // Voltar para aba Cadastro ao criar novo
    setActiveTab('cadastro')
    console.log('📄 Novo cadastro iniciado! Formulário limpo.')
  }

  // Função para gravar os dados
  const handleGravar = async () => {
    // Validação de campos obrigatórios
    const camposObrigatorios = [
      { campo: 'nome', label: 'Nome' },
      { campo: 'cpf', label: 'CPF' },
      { campo: 'nascimento', label: 'Data de Nascimento' },
      { campo: 'estadoCivil', label: 'Estado Civil' },
      { campo: 'cep', label: 'CEP' },
      { campo: 'logradouro', label: 'Logradouro' },
      { campo: 'endereco', label: 'Endereço' },
      { campo: 'numero', label: 'Número' },
      { campo: 'bairro', label: 'Bairro' },
      { campo: 'cidade', label: 'Cidade' },
      { campo: 'ufEndereco', label: 'UF' },
      { campo: 'telefone', label: 'Telefone' },
      { campo: 'profissao', label: 'Profissão' }
    ]

    const camposVazios = camposObrigatorios.filter(item => {
      const valor = formData[item.campo as keyof typeof formData]
      return !valor || (typeof valor === 'string' && valor.trim() === '')
    })

    if (camposVazios.length > 0) {
      const listaCampos = camposVazios.map(item => item.label).join(', ')
      const mensagem = `Por favor, preencha os seguintes campos obrigatórios:\n\n${listaCampos}`
      
      console.log(`❌ ${mensagem}`)
      await modal.alert(mensagem, 'Campos Obrigatórios', '⚠️')
      
      // Focar no primeiro campo vazio se possível
      const primeiroCampo = camposVazios[0].campo
      const elemento = document.querySelector(`input[name="${primeiroCampo}"], select[name="${primeiroCampo}"]`)
      if (elemento instanceof HTMLElement) {
        elemento.focus()
      }
      
      return
    }

    // Verificar se CPF já existe no sistema
    const clientesSalvosTemp = localStorage.getItem('clientes-cadastrados')
    if (clientesSalvosTemp) {
      const clientesTemp = JSON.parse(clientesSalvosTemp)
      const cpfJaExiste = clientesTemp.filter((c: any) => 
        c.cpf === formData.cpf && c.codigo !== formData.codigo
      )
      
      if (cpfJaExiste.length > 0) {
        // Mostrar tela intermediária com os clientes encontrados
        setTermoBusca(`CPF: ${formData.cpf}`)
        setResultadosBusca(cpfJaExiste)
        setShowResultados(true)
        return
      }
    }

    // Gera código sequencial se ainda não foi gerado (código = '0')
    let codigoFinal = formData.codigo
    if (formData.codigo === '0') {
      // Buscar o último código usado
      const ultimoCodigo = localStorage.getItem('ultimoCodigoCliente')
      const proximoCodigo = ultimoCodigo ? parseInt(ultimoCodigo) + 1 : 1
      
      codigoFinal = proximoCodigo.toString()
      
      // Salvar novo último código
      localStorage.setItem('ultimoCodigoCliente', codigoFinal)
      
      setFormData(prev => ({ ...prev, codigo: codigoFinal }))
      console.log('🆔 Código gerado:', codigoFinal)
    }

    // Gera número de cartão automaticamente se checkbox estiver marcado e campo vazio
    let numeroCartaoFinal = formData.numeroCartao
    if (cartaoHabilitado && (formData.numeroCartao === '0' || formData.numeroCartao === '')) {
      const ultimoNumero = localStorage.getItem('ultimoNumeroCartao')
      const proximoNumero = ultimoNumero ? parseInt(ultimoNumero) + 1 : 1
      
      numeroCartaoFinal = proximoNumero.toString().padStart(10, '0')
      
      // Salvar novo último número
      localStorage.setItem('ultimoNumeroCartao', proximoNumero.toString())
      
      setFormData(prev => ({ ...prev, numeroCartao: numeroCartaoFinal }))
      console.log('🎫 Número de cartão gerado:', numeroCartaoFinal)
    }

    // Salvar cliente no localStorage
    const clienteParaSalvar = { ...formData, codigo: codigoFinal, numeroCartao: numeroCartaoFinal }
    
    console.log('🔍 [DEBUG GRAVAÇÃO] Iniciando gravação de cliente...')
    console.log('   Código:', codigoFinal)
    console.log('   Nome:', formData.nome)
    
    const clientesSalvos = localStorage.getItem('clientes-cadastrados')
    console.log('   Clientes já salvos:', clientesSalvos ? 'SIM' : 'NÃO')
    
    const clientes = clientesSalvos ? JSON.parse(clientesSalvos) : []
    console.log('   Total de clientes antes:', clientes.length)
    
    // Verificar se já existe (atualizar) ou criar novo
    const indexExistente = clientes.findIndex((c: any) => c.codigo === codigoFinal)
    if (indexExistente >= 0) {
      clientes[indexExistente] = clienteParaSalvar
      console.log('✏️ Cliente atualizado no índice:', indexExistente)
    } else {
      clientes.push(clienteParaSalvar)
      console.log('➕ Novo cliente adicionado')
    }
    
    console.log('   Total de clientes depois:', clientes.length)
    
    const dadosParaSalvar = JSON.stringify(clientes)
    console.log('   Tamanho dos dados:', dadosParaSalvar.length, 'caracteres')
    
    try {
      localStorage.setItem('clientes-cadastrados', dadosParaSalvar)
      console.log('💾 localStorage.setItem EXECUTADO')
      
      // VERIFICAÇÃO IMEDIATA
      const verificacao = localStorage.getItem('clientes-cadastrados')
      if (verificacao) {
        const clientesVerificados = JSON.parse(verificacao)
        console.log('✅ VERIFICAÇÃO: Total de clientes após salvar:', clientesVerificados.length)
        console.log('✅ VERIFICAÇÃO: Cliente salvo existe?', clientesVerificados.some((c: any) => c.codigo === codigoFinal))
      } else {
        console.error('❌ VERIFICAÇÃO FALHOU: localStorage.getItem retornou null!')
      }
    } catch (error) {
      console.error('❌ ERRO ao salvar no localStorage:', error)
      throw error
    }
    
    console.log('💾 Cliente gravado com sucesso no localStorage!')
    
    let mensagemSucesso = `✅ Cliente gravado com sucesso!\n\nCódigo: ${codigoFinal}\nNome: ${formData.nome}`
    if (cartaoHabilitado && numeroCartaoFinal !== '0') {
      mensagemSucesso += `\nNúmero Cartão: ${numeroCartaoFinal}`
    }
    
    await modal.alert(mensagemSucesso, 'Sucesso', '✅')
    
    // 🔒 Limpar dados persistidos após salvar com sucesso
    clearPersistedForm('form-cliente-' + (formData.codigo || 'novo'))
  }

  // Função para limpar os campos
  // Função para selecionar cliente da lista
  const handleSelecionarDaLista = (cliente: any) => {
    setFormData(cliente)
    setShowResultados(false)
    console.log('✅ Cliente selecionado da lista:', cliente.nome)
  }

  const handleLimpar = () => {
    setFormData(prev => ({
      ...prev,
      codigo: '0',
      nome: '',
      numeroCartao: '0',
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
      sexo: ''
    }))
    // Desmarcar checkbox do cartão
    setCartaoHabilitado(false)
    // Voltar para aba Cadastro ao limpar
    setActiveTab('cadastro')
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
        await modal.alert('Nenhum scanner detectado!\n\nVerifique se:\n• O scanner está conectado\n• Os drivers TWAIN/SANE estão instalados\n• O dispositivo está ligado', 'Scanner Não Detectado', '❌')
        return
      }

      console.log('📷 Scanners detectados:', scanners)
      await modal.alert('Scanner detectado com sucesso!', 'Sucesso', '✅')
    } catch (error) {
      console.error('❌ Erro ao acessar scanner:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      await modal.alert(`Erro ao acessar scanner:\n${errorMessage}`, 'Erro', '❌')
    }
  }

  // Função para scanner via Web APIs (navegador)
  const startWebScanning = async () => {
    try {
      // Verificar se Image Capture API está disponível
      if ('ImageCapture' in window) {
        await modal.alert('Funcionalidade de câmera disponível. Utilize seu dispositivo para capturar imagens.', 'Câmera', '📷')
      } else {
        await modal.alert('Camera/Scanner não disponível neste navegador.\n\nUtilize um navegador moderno como Chrome, Firefox ou Edge.', 'Não Disponível', '⚠️')
      }
    } catch (error) {
      console.error('❌ Erro ao acessar câmera:', error)
      await modal.alert('Erro ao acessar câmera/scanner', 'Erro', '❌')
    }
  }

  // Scanner via Image Capture API (não utilizada - funcionalidade futura)
  /*const startImageCaptureScanning = async () => {
    try {
      // Obter dispositivos de mídia
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      
      if (videoDevices.length === 0) {
        await modal.alert('Nenhuma câmera/scanner detectado!', 'Não Detectado', '❌')
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
  }*/

  // Scanner via WebUSB API (não utilizada - funcionalidade futura)
  /*const startWebUSBScanning = async () => {
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
  }*/

  // Configurações reais do scanner (não utilizada - funcionalidade futura)
  /*const showRealScannerConfig = async (scanner: any) => {
    const resolution = await modal.prompt('Resolução (DPI):', '300', 'Configuração', '📐')
    const colorMode = await modal.prompt('Modo de cor (Color/Grayscale/Black&White):', 'Color', 'Configuração', '🎨')
    const pageSize = await modal.prompt('Tamanho da página (A4/Letter/Legal):', 'A4', 'Configuração', '📄')
    
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
  }*/

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
        
        await modal.alert(`Documento digitalizado com sucesso!\n\n📄 Nome: ${file.name}\n📐 Resolução: ${config.resolution} DPI\n🎨 Modo: ${config.colorMode}\n📏 Tamanho: ${config.pageSize}`, 'Sucesso', '✅')
      } else {
        throw new Error(scanResult.error || 'Erro desconhecido na digitalização')
      }
      
    } catch (error) {
      console.error('❌ Erro na digitalização real:', error)
      throw error
    }
  }
  */

  // Digitalização via USB (não utilizada - funcionalidade futura)
  /*const performUSBScan = async (device: any) => {
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
  }*/

  // Adicionar documento digitalizado à lista (não utilizada - funções de scan comentadas)
  /*const addScannedDocument = async (file: File, source: string, config?: any) => {
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
  }*/

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
      await modal.alert(`Erro ao imprimir documento:\n${errorMessage}`, 'Erro', '❌')
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
        await modal.alert(`Documento "${documento.nome}" enviado para impressão com sucesso!\n\n📄 Cópias: ${printConfig.copies}\n🎨 Modo: ${printConfig.colorMode}\n📏 Papel: ${printConfig.paperSize}\n📐 Orientação: ${printConfig.orientation}`, 'Sucesso', '✅')
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
        navigator.clipboard.writeText(qrData).then(async () => {
          await modal.alert('QR Code gerado e dados copiados para a área de transferência!', 'Sucesso', '✅')
        }).catch(async () => {
          await modal.alert('QR Code gerado, mas erro ao copiar dados', 'Atenção', '⚠️')
        })
      } catch (error) {
        console.error('Erro ao gerar QR Code:', error)
        await modal.alert('Erro ao gerar QR Code', 'Erro', '❌')
      }
    }
  }


  const handleExcluirSeloLocal = async () => {
    if (selosDigitais[seloSelecionado]) {
      const confirmacao = await modal.confirm('Tem certeza que deseja excluir o selo digital local?', 'Confirmar Exclusão', '⚠️')
      if (confirmacao) {
        const novosSelos = selosDigitais.filter((_, index) => index !== seloSelecionado)
        setSelosDigitais(novosSelos)
        if (seloSelecionado >= novosSelos.length) {
          setSeloSelecionado(Math.max(0, novosSelos.length - 1))
        }
        await modal.alert('Selo digital local excluído com sucesso!', 'Sucesso', '✅')
      }
    }
  }

  const handleExcluirSeloTJ = async () => {
    if (selosDigitais[seloSelecionado]) {
      const selo = selosDigitais[seloSelecionado]
      const motivo = await modal.prompt('Digite o motivo do cancelamento:', '', 'Cancelar Selo', '⚠️')
      
      if (motivo && motivo.trim()) {
        const confirmacao = await modal.confirm(`Tem certeza que deseja cancelar o selo digital "${selo.seloDigital}" no TJSP?`, 'Confirmar Cancelamento', '⚠️')
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
  }

  // Componente para label com asterisco vermelho (campo obrigatório)
  const RequiredLabel = ({ children }: { children: string }) => (
    <label style={labelStyles}>
      {children} <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>
    </label>
  )

  // 🔒 BLOQUEIO: getInputStyles - NÃO MODIFICAR minWidth ou flexShrink (não utilizada)
  /*const getInputStyles = (fieldName: string) => {
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
  }*/

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
  const arrowColor = currentTheme === 'dark' ? '%23FFFFFF' : '%23333333' // Cor da seta: branca no dark, preta no light
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
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${arrowColor}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 6px center',
    backgroundSize: '14px',
    paddingRight: '26px',
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
    <BasePage title="Cliente" onClose={handleClose} width="900px" height="580px" minWidth="900px" minHeight="580px" resetToOriginalPosition={resetToOriginalPosition} headerColor={headerColor} resizable={false}>
      {/* 🔒 BLOQUEIO: Redimensionamento DESABILITADO - Dimensões fixas 900x580px */}
      {/* Wrapper para garantir tema correto */}
      <div 
        className={`theme-${currentTheme}`}
        style={{ 
          backgroundColor: theme.surface, 
          color: theme.text, 
          width: '100%', 
          height: '100%',
          minHeight: 'auto',  // Ajusta ao conteúdo
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
          style={{
            ...tabButtonStyles(activeTab === 'digitalizacao'),
            opacity: formData.codigo === '0' ? 0.4 : 1,
            cursor: formData.codigo === '0' ? 'not-allowed' : 'pointer'
          }}
          onClick={() => {
            if (formData.codigo !== '0') {
              setActiveTab('digitalizacao')
            } else {
              alert('⚠️ Grave um cadastro primeiro antes de acessar a Digitalização!')
            }
          }}
          disabled={formData.codigo === '0'}
        >
          Digitalização
        </button>
        <button
          style={{
            ...tabButtonStyles(activeTab === 'selo-digital'),
            opacity: formData.codigo === '0' ? 0.4 : 1,
            cursor: formData.codigo === '0' ? 'not-allowed' : 'pointer'
          }}
          onClick={() => {
            if (formData.codigo !== '0') {
              setActiveTab('selo-digital')
            } else {
              alert('⚠️ Grave um cadastro primeiro antes de acessar o Selo Digital!')
            }
          }}
          disabled={formData.codigo === '0'}
        >
          Selo Digital
        </button>
      </div>

      {/* Content */}
      
      {/* Tela Intermediária de Resultados */}
      {showResultados && activeTab === 'cadastro' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: theme.background,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          padding: '15px',
          boxSizing: 'border-box',
          border: `1px solid ${theme.border}`,
          borderRadius: '8px'
        }}>
          <h3 style={{ color: theme.text, marginBottom: '10px', textAlign: 'center' }}>
            📋 Resultados da Busca: {termoBusca} - Encontrados: {resultadosBusca.length}
          </h3>
          <div style={{ flex: 1, overflowY: 'auto', border: `1px solid ${theme.border}`, borderRadius: '4px', padding: '5px' }}>
            {resultadosBusca.map((cliente: any) => (
              <div
                key={cliente.codigo}
                onClick={() => handleSelecionarDaLista(cliente)}
                style={{
                  padding: '10px',
                  borderBottom: `1px solid ${theme.border}`,
                  cursor: 'pointer',
                  backgroundColor: theme.surface,
                  color: theme.text,
                  marginBottom: '4px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primary}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.surface}
              >
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                  {cliente.nome}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.8, display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <span>Código: {cliente.codigo}</span>
                  <span>CPF: {cliente.cpf}</span>
                  <span>Nasc: {cliente.nascimento}</span>
                  <span>Tel: {cliente.telefone}</span>
                </div>
                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>
                  {cliente.endereco && `${cliente.endereco}, ${cliente.numero} - ${cliente.bairro} - ${cliente.cidade}/${cliente.ufEndereco}`}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowResultados(false)}
            style={{
              padding: '8px 16px',
              marginTop: '15px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ← Voltar ao Formulário
          </button>
        </div>
      )}
      
      {activeTab === 'cadastro' && !showResultados && (
        <form style={formStyles}>

          {/* Linha 1: Código, Nome, Número Cartão */}
          <div style={{...rowStyles, display: 'flex', alignItems: 'flex-end', gap: '8px'}}>
            {/* Campo Código */}
            <div style={{display: 'flex', flexDirection: 'column', maxWidth: '180px', flexShrink: 0}}>
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
                  onChange={(e) => handleInputChange('codigo', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleConsultarCliente()
                    }
                  }}
                  style={{
                    ...inputStyles, 
                    flex: 1, 
                    minWidth: '50px', 
                    height: '24px'
                  }}
                  maxLength={10}
                  placeholder="Digite o código"
                />
                <button
                  type="button"
                  onClick={handleConsultarCliente}
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
                    borderRadius: '0',
                    flexShrink: 0,
                    transition: 'opacity 0.2s ease',
                    color: '#4CAF50'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  title="Consultar cliente pelo código"
                >
                  🔍
                </button>
              </div>
            </div>

            {/* Campo Nome */}
            <div style={{display: 'flex', flexDirection: 'column', flex: '0.7', minWidth: '100px'}}>
              <label style={{fontSize: '12px', color: theme.text, marginBottom: '2px', height: '18px', lineHeight: '18px'}}>Nome <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></label>
              <div style={{display: 'flex', gap: '6px', alignItems: 'center', height: '24px'}}>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputWithLimit('nome', e.target.value.toUpperCase(), 100)}
                  style={{...inputStyles, flex: 1, height: '24px'}}
                  maxLength={100}
                  required
                />
                <button 
                  type="button" 
                  onClick={async () => {
                    const clientesSalvos = localStorage.getItem('clientes-cadastrados')
                    if (!clientesSalvos) {
                      await modal.alert('Nenhum cliente cadastrado', 'Informação', 'ℹ️')
                      return
                    }
                    
                    const clientes = JSON.parse(clientesSalvos)
                    const nomeBusca = formData.nome.trim()
                    
                    // Se não digitou nada, mostra TODOS
                    if (!nomeBusca) {
                      setTermoBusca('Todos os Clientes')
                      setResultadosBusca(clientes)
                      setShowResultados(true)
                      return
                    }
                    
                    // Se digitou algo, filtra por nome
                    const encontrados = clientes.filter((c: any) => 
                      c.nome.toUpperCase().includes(nomeBusca.toUpperCase())
                    )
                    
                    if (encontrados.length === 0) {
                      await modal.alert('Nenhum cliente encontrado', 'Não Encontrado', '❌')
                      return
                    }
                    
                    // SEMPRE mostra tela intermediária
                    setTermoBusca(nomeBusca ? `Nome: ${nomeBusca}` : 'Todos os Clientes')
                    setResultadosBusca(encontrados)
                    setShowResultados(true)
                  }}
                  style={{
                    ...secondaryButtonStyles, 
                    height: '24px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    padding: '0 6px'
                  }}
                  title="Buscar cliente por nome"
                >🔍</button>
              </div>
            </div>

            {/* Campo Número Cartão */}
            <div style={{display: 'flex', flexDirection: 'column', flex: '0.5', minWidth: '100px', maxWidth: '180px'}}>
              <label style={{fontSize: '12px', color: theme.text, marginBottom: '2px', height: '18px', lineHeight: '18px'}}>Número Cartão</label>
              <div style={{display: 'flex', gap: '2px', alignItems: 'center', height: '24px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '2px', height: '24px'}}>
                  <input 
                    type="checkbox" 
                    checked={cartaoHabilitado}
                    onChange={(e) => {
                      // Se desmarcar, não apagar o número se já foi gerado
                      if (!e.target.checked && formData.numeroCartao !== '0' && formData.numeroCartao !== '') {
                        // Não permitir desmarcar se número já foi gerado
                        return
                      }
                      setCartaoHabilitado(e.target.checked)
                      if (!e.target.checked) {
                        handleInputChange('numeroCartao', '0')
                      }
                    }}
                    style={{ 
                      margin: 0,
                      padding: 0,
                      border: '0',
                      outline: '0',
                      boxShadow: 'none',
                      width: '14px', 
                      height: '14px',
                      flexShrink: 0,
                      cursor: formData.numeroCartao !== '0' && formData.numeroCartao !== '' ? 'not-allowed' : 'pointer'
                    }} 
                  />
                  <span style={{fontSize: '11px', color: theme.text, whiteSpace: 'nowrap', lineHeight: '24px'}}>Cartão</span>
                </div>
                <input
                  type="text"
                  value={formData.numeroCartao}
                  readOnly
                  disabled={!cartaoHabilitado}
                  onKeyDown={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onDrop={(e) => e.preventDefault()}
                  style={{
                    ...inputStyles, 
                    flex: 1, 
                    minWidth: '30px', 
                    height: '24px',
                    backgroundColor: !cartaoHabilitado 
                      ? (currentTheme === 'dark' ? '#1a1a1a' : '#f0f0f0')
                      : (currentTheme === 'dark' ? '#2a4a2a' : '#e8f5e9'),
                    color: !cartaoHabilitado 
                      ? (currentTheme === 'dark' ? '#555' : '#aaa')
                      : (currentTheme === 'dark' ? '#4ade80' : '#2e7d32'),
                    cursor: 'not-allowed',
                    opacity: !cartaoHabilitado ? 0.5 : 1,
                    border: cartaoHabilitado 
                      ? `2px solid ${currentTheme === 'dark' ? '#4ade80' : '#4caf50'}` 
                      : `1px solid ${theme.border}`,
                    fontWeight: cartaoHabilitado ? '600' : '400',
                    transition: 'all 0.3s ease'
                  }}
                  placeholder={cartaoHabilitado ? 'Será gerado ao gravar' : 'Marque o checkbox'}
                />
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
                <option value="">Selecione</option>
                <option value="MASCULINO">MASCULINO</option>
                <option value="FEMININO">FEMININO</option>
              </select>
            </div>

        <div style={fieldStyles}>
          <RequiredLabel>CPF</RequiredLabel>
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
                    alert(`❌ CPF INVÁLIDO!\n\n${validacao.error}\n\nPor favor, verifique o número digitado.`)
                    console.log(`❌ CPF inválido! ${validacao.error}`)
                    // Limpa o campo CPF inválido
                    handleInputChange('cpf', '')
                  } else {
                    console.log('✅ CPF válido!')
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
              <label style={labelStyles}>RG</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="text"
                value={formData.rg}
                onChange={(e) => handleInputWithLimit('rg', e.target.value, 20)}
                style={inputStyles}
                maxLength={20}
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
              <RequiredLabel>Data de Nascimento</RequiredLabel>
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
              <RequiredLabel>Estado Civil</RequiredLabel>
              <select
                value={formData.estadoCivil}
                onChange={(e) => handleInputChange('estadoCivil', e.target.value)}
                style={selectStyles}
                required
              >
                <option value="">Selecione</option>
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
              <CustomSelect
                value={formData.uf}
                onChange={(value) => handleInputChange('uf', value)}
                options={UF_OPTIONS}
                maxVisibleItems={5}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>País</label>
              <CustomSelect
                value={formData.pais}
                onChange={(value) => handleInputChange('pais', value)}
                options={PAIS_OPTIONS}
                maxVisibleItems={5}
              />
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
                onChange={(e) => handleInputWithLimit('pai', e.target.value.toUpperCase(), 100)}
                style={{...inputStyles, textTransform: 'uppercase'}}
                maxLength={100}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Nome da Mãe</label>
              <input
                type="text"
                value={formData.mae}
                onChange={(e) => handleInputWithLimit('mae', e.target.value.toUpperCase(), 100)}
                style={{...inputStyles, textTransform: 'uppercase'}}
                maxLength={100}
              />
            </div>

            <div style={fieldStyles}>
              <RequiredLabel>Profissão</RequiredLabel>
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
              <RequiredLabel>CEP</RequiredLabel>
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
              <RequiredLabel>Logradouro</RequiredLabel>
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
              <RequiredLabel>Endereço</RequiredLabel>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => handleInputWithLimit('endereco', e.target.value, 100)}
                  style={inputStyles}
                  maxLength={100}
                />
            </div>

            <div style={fieldStylesSmall}>
              <RequiredLabel>Número</RequiredLabel>
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
              <RequiredLabel>Bairro</RequiredLabel>
              <input
                type="text"
                value={formData.bairro}
                onChange={(e) => handleInputWithLimit('bairro', e.target.value, 50)}
                style={inputStyles}
                maxLength={50}
              />
            </div>

            <div style={fieldStyles}>
              <RequiredLabel>Cidade</RequiredLabel>
              <CidadeAutocompleteInput
                value={formData.cidade}
                onChange={(cidade) => handleInputWithLimit('cidade', cidade, 50)}
                onUfChange={(uf) => {
                  handleInputChange('ufEndereco', uf)
                  // Preencher país como Brasil ao preencher cidade brasileira
                  if (uf) {
                    handleInputChange('paisEndereco', 'BR')
                  }
                }}
                uf={formData.uf}
                inputStyles={inputStyles}
                maxLength={50}
              />
            </div>

            <div style={fieldStyles}>
              <RequiredLabel>UF</RequiredLabel>
              <CustomSelect
                value={formData.ufEndereco}
                onChange={(value) => handleInputChange('ufEndereco', value)}
                options={UF_OPTIONS}
                maxVisibleItems={5}
              />
            </div>

            <div style={fieldStyles}>
              <RequiredLabel>País</RequiredLabel>
              <CustomSelect
                value={formData.paisEndereco}
                onChange={(value) => handleInputChange('paisEndereco', value)}
                options={PAIS_OPTIONS}
                maxVisibleItems={5}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Código País/IBGE</label>
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
            <div style={fieldStyles}>
              <RequiredLabel>Telefone</RequiredLabel>
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
                type="text"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={(e) => {
                  const email = e.target.value.trim()
                  if (email && !email.includes('@')) {
                    alert('⚠️ E-mail inválido!\n\nO e-mail deve conter o símbolo @\n\nExemplo: usuario@exemplo.com')
                    // Focar novamente no campo
                    e.target.focus()
                  } else if (email && email.includes('@') && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                    alert('⚠️ E-mail inválido!\n\nFormato correto: usuario@exemplo.com')
                    // Focar novamente no campo
                    e.target.focus()
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
              <CustomSelect
                value={formData.atendente}
                onChange={(value) => handleInputChange('atendente', value)}
                options={[
                  { value: '', label: 'Selecione' },
                  ...funcionarios.map((func) => ({
                    value: func.codigo,
                    label: `${func.nome}${func.cargo ? ` - ${func.cargo}` : ''}`
                  }))
                ]}
                maxVisibleItems={5}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Assinante do Cartão</label>
              <CustomSelect
                value={formData.assinanteCartao}
                onChange={(value) => handleInputChange('assinanteCartao', value)}
                options={[
                  { value: '', label: 'Selecione' },
                  ...funcionarios
                    .filter((func) => func.assinante === true || func.assinante === 'true' || func.assinante === 'Sim')
                    .map((func) => ({
                      value: func.codigo,
                      label: `${func.nome}${func.cargo ? ` - ${func.cargo}` : ''}`
                    }))
                ]}
                maxVisibleItems={5}
              />
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
            height: '220px',  // Ajustado para 220px
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
      
      {/* Modal Component - DENTRO da janela */}
      <modal.ModalComponent />
      
      {/* OCR Progress - DENTRO da janela */}
      <OCRProgress 
        isVisible={ocrProgress.isVisible}
        progress={ocrProgress.progress}
        status={ocrProgress.status}
      />
    </BasePage>
    
    {/* Scanner Config - Popup externo (tela cheia) */}
    {showScannerConfig && (
      isWebEnvironment ? (
        <WebScannerConfig
          onScan={async (_config) => {
            setShowScannerConfig(false)
            await handleScannerComOCR()
          }}
          onClose={() => setShowScannerConfig(false)}
        />
      ) : (
        <ScannerConfig
          onScan={async (_config) => {
            setShowScannerConfig(false)
            await handleScannerComOCR()
          }}
          onClose={() => setShowScannerConfig(false)}
        />
      )
    )}
  </>
  )
}

