import React, { useEffect, useMemo, useRef, useState } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { useModal } from '../hooks/useModal'
import { exportToExcel } from '../utils/excelExport'

type TipoIndice = 'nascimento' | 'casamento' | 'obito'

interface RegistroIndice {
  id: string
  tipo: TipoIndice
  livro: string
  folha: string
  folhaVerso?: '' | 'F' | 'V'
  termo: string
  data: string
  dataNascimento?: string
  dataCasamento?: string
  dataObito?: string
  causaMorte?: string
  cidade: string
  nomePrincipal: string
  nomeComplementar?: string
  nomePai?: string
  nomeMae?: string
  contraente?: string
  contraente2?: string
  novoNomeContraente?: string
  novoNomeContraente2?: string
  tipoCasamento?: string
  regimeBens?: string
  sexo?: '' | 'masculino' | 'feminino'
  gemeos?: boolean
  obitoDesconhecido?: boolean
  observacoes?: string
  criadoEm: string
  codigoInterno: number
}

interface FiltroIndice {
  tipo: TipoIndice | ''
  livro: string
  termoFinal: string
  termoInicial: string
  folhaInicial: string
  folhaFinal: string
  dataInicio: string
  dataFim: string
  nome: string
  nomePai: string
  nomeMae: string
}

const emptyFiltro: FiltroIndice = {
  tipo: '',
  livro: '',
  termoFinal: '',
  termoInicial: '',
  folhaInicial: '',
  folhaFinal: '',
  dataInicio: '',
  dataFim: '',
  nome: '',
  nomePai: '',
  nomeMae: ''
}

const formDefaults = {
  livro: '',
  folha: '',
  folhaVerso: '' as '' | 'F' | 'V',
  termo: '',
  data: '',
  dataNascimento: '',
  dataCasamento: '',
  dataObito: '',
  causaMorte: '',
  cidade: 'SANTO ANDRÉ',
  nomePrincipal: '',
  nomeComplementar: '',
  nomePai: '',
  nomeMae: '',
  contraente: '',
  contraente2: '',
  novoNomeContraente: '',
  novoNomeContraente2: '',
  tipoCasamento: '',
  regimeBens: '',
  observacoes: '',
  sexo: '' as '' | 'masculino' | 'feminino',
  gemeos: false,
  obitoDesconhecido: false,
  livroGemelar: '',
  folhaGemelar: '',
  termoGemelar: '',
  nomeGemelar: ''
}

const REGISTROS_STORAGE_KEY = 'cadastro-indice-registros'
const CODIGO_INTERNO_STORAGE_KEY = 'cadastro-indice-codigo'
const FILTRO_STORAGE_KEY = 'cadastro-indice-filtro'
const CONSULTA_EXECUTADA_STORAGE_KEY = 'cadastro-indice-consulta-executada'

type TipoFiltroIndice = '' | TipoIndice

interface FiltroNomeConfig {
  nomeLabel: string
  nomePlaceholder: string
  mostrarNomePai: boolean
  nomePaiLabel: string
  nomePaiPlaceholder: string
  mostrarNomeMae: boolean
  nomeMaeLabel: string
  nomeMaePlaceholder: string
}

const obterFiltroNomeConfig = (tipo: TipoFiltroIndice): FiltroNomeConfig => {
  switch (tipo) {
    case 'nascimento':
      return {
        nomeLabel: 'Nome da Criança',
        nomePlaceholder: 'Nome principal do registro',
        mostrarNomePai: true,
        nomePaiLabel: 'Nome do Pai',
        nomePaiPlaceholder: 'Nome do pai',
        mostrarNomeMae: true,
        nomeMaeLabel: 'Nome da Mãe',
        nomeMaePlaceholder: 'Nome da mãe'
      }
    case 'casamento':
      return {
        nomeLabel: 'Nome do Contraente',
        nomePlaceholder: 'Nome do contraente',
        mostrarNomePai: true,
        nomePaiLabel: 'Nome da Contraente',
        nomePaiPlaceholder: 'Nome da contraente',
        mostrarNomeMae: false,
        nomeMaeLabel: 'Nome da Mãe',
        nomeMaePlaceholder: 'Nome da mãe'
      }
    case 'obito':
      return {
        nomeLabel: 'Nome do Falecido',
        nomePlaceholder: 'Nome principal do registro',
        mostrarNomePai: true,
        nomePaiLabel: 'Nome do Pai',
        nomePaiPlaceholder: 'Nome do pai',
        mostrarNomeMae: true,
        nomeMaeLabel: 'Nome da Mãe',
        nomeMaePlaceholder: 'Nome da mãe'
      }
    default:
      return {
        nomeLabel: 'Nome principal',
        nomePlaceholder: 'Nome principal do registro',
        mostrarNomePai: true,
        nomePaiLabel: 'Nome do Pai',
        nomePaiPlaceholder: 'Nome do pai',
        mostrarNomeMae: true,
        nomeMaeLabel: 'Nome da Mãe',
        nomeMaePlaceholder: 'Nome da mãe'
      }
  }
}

const sanitizarFiltroPorTipo = (tipo: TipoFiltroIndice, filtro: FiltroIndice): FiltroIndice => {
  const config = obterFiltroNomeConfig(tipo)
  let resultado = filtro
  let mudou = false

  if (!config.mostrarNomePai && filtro.nomePai) {
    resultado = mudou ? resultado : { ...resultado }
    resultado.nomePai = ''
    mudou = true
  }

  if (!config.mostrarNomeMae && filtro.nomeMae) {
    resultado = mudou ? resultado : { ...resultado }
    resultado.nomeMae = ''
    mudou = true
  }

  return mudou ? resultado : filtro
}

const camposObrigatoriosPorTipo: Record<
  TipoIndice,
  {
    campos: (keyof typeof formDefaults)[]
    mensagem: string
  }
> = {
  nascimento: {
    campos: ['livro', 'folha', 'termo', 'nomePrincipal'],
    mensagem: 'Preencha Livro, Folha, Termo e Nome da Criança antes de gravar.'
  },
  casamento: {
    campos: ['livro', 'folha', 'termo', 'tipoCasamento', 'dataCasamento', 'contraente', 'contraente2', 'regimeBens'],
    mensagem: 'Preencha Livro, Folha, Termo, Tipo, Data de Casamento, Regime de Bens e os nomes dos contraentes antes de gravar.'
  },
  obito: {
    campos: ['livro', 'folha', 'termo', 'nomePrincipal', 'dataObito', 'causaMorte'],
    mensagem: 'Preencha Livro, Folha, Termo, Nome do Falecido, Data do Óbito e Causa de Morte antes de gravar.'
  }
}

export function CadastroIndicePage({ onClose }: { onClose: () => void }) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const modal = useModal()

  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'

  const [activeTab, setActiveTab] = useState<'cadastro' | 'consulta'>('cadastro')
  const [activeTipoCadastro, setActiveTipoCadastro] = useState<TipoIndice>('nascimento')
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [activeButton, setActiveButton] = useState<string | null>(null)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [formNascimento, setFormNascimento] = useState(formDefaults)
  const [formCasamento, setFormCasamento] = useState(formDefaults)
  const [formObito, setFormObito] = useState(formDefaults)

  const formByTab: Record<TipoIndice, typeof formDefaults> = {
    nascimento: formNascimento,
    casamento: formCasamento,
    obito: formObito
  }

  const setFormByTab: Record<TipoIndice, React.Dispatch<React.SetStateAction<typeof formDefaults>>> = {
    nascimento: setFormNascimento,
    casamento: setFormCasamento,
    obito: setFormObito
  }

  const [registros, setRegistros] = useState<RegistroIndice[]>([])
  const [filtro, setFiltro] = useState<FiltroIndice>(emptyFiltro)
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltroIndice>(emptyFiltro)
  const [registroSelecionadoId, setRegistroSelecionadoId] = useState<string | null>(null)
  const [registroEmEdicaoId, setRegistroEmEdicaoId] = useState<string | null>(null)
  const ultimoCodigoRef = useRef<number>(0)
  const tipoEdicaoRef = useRef<TipoIndice>('nascimento')
  const codigoEdicaoRef = useRef<number | null>(null)
  const popupTimeoutRef = useRef<number | null>(null)
  const [popupMensagem, setPopupMensagem] = useState<string | null>(null)
  const [consultaExecutada, setConsultaExecutada] = useState(false)
  const [mostrarPopupCausaMorte, setMostrarPopupCausaMorte] = useState(false)
  const [causasMorteTemp, setCausasMorteTemp] = useState<string[]>(['', '', '', '', ''])
  const [campoOrdenacao, setCampoOrdenacao] = useState<string | null>(null)
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<'asc' | 'desc'>('asc')

  const filtroNomeConfig = useMemo(() => obterFiltroNomeConfig(filtro.tipo), [filtro.tipo])

  const obterColunasPorTipo = (tipo: TipoIndice): string[] => {
    switch (tipo) {
      case 'nascimento':
        return ['Código', 'Livro', 'Folha', 'Termo', 'Data Termo', 'Data Nasc.', 'Nome da Criança', 'Pai', 'Mãe', '']
      case 'casamento':
        return ['Código', 'Livro', 'Folha', 'Termo', 'Data Termo', 'Data Cas.', 'Tipo', 'O Contraente', 'A Contraente', '']
      case 'obito':
        return ['Código', 'Livro', 'Folha', 'Termo', 'Data Termo', 'Data Óbito', 'Nome Falecido', 'Pai', 'Mãe', '']
      default:
        return ['Código', 'Livro', 'Folha', 'Termo', 'Data', 'Nome', '']
    }
  }

  const filteredRegistros = useMemo(() => {
    if (!consultaExecutada) {
      return [] as RegistroIndice[]
    }

    const filtros = filtrosAplicados

    let resultado = registros.filter((registro) => {
      // Se tipo estiver selecionado, filtrar por tipo
      if (filtros.tipo && registro.tipo !== filtros.tipo) return false
      
      // Filtros opcionais
      if (filtros.livro && filtros.livro.trim() && registro.livro !== filtros.livro) return false

      if (filtros.nome && filtros.nome.trim() && !registro.nomePrincipal.toLowerCase().includes(filtros.nome.toLowerCase())) return false
      if (filtros.nomePai && filtros.nomePai.trim() && !(registro.nomePai || '').toLowerCase().includes(filtros.nomePai.toLowerCase())) return false
      if (filtros.nomeMae && filtros.nomeMae.trim() && !(registro.nomeMae || '').toLowerCase().includes(filtros.nomeMae.toLowerCase())) return false

      if (filtros.dataInicio && filtros.dataInicio.trim() && registro.data < filtros.dataInicio) return false
      if (filtros.dataFim && filtros.dataFim.trim() && registro.data > filtros.dataFim) return false

      if (filtros.termoInicial && filtros.termoInicial.trim() && registro.termo < filtros.termoInicial) return false
      if (filtros.termoFinal && filtros.termoFinal.trim() && registro.termo > filtros.termoFinal) return false

      if (filtros.folhaInicial && filtros.folhaInicial.trim() && registro.folha < filtros.folhaInicial) return false
      if (filtros.folhaFinal && filtros.folhaFinal.trim() && registro.folha > filtros.folhaFinal) return false

      return true
    })

    // Aplicar ordenação se houver campo selecionado
    if (campoOrdenacao) {
      resultado = [...resultado].sort((a, b) => {
        let valorA: any
        let valorB: any

        switch (campoOrdenacao) {
          case 'codigo':
            valorA = a.codigoInterno
            valorB = b.codigoInterno
            break
          case 'livro':
            valorA = a.livro
            valorB = b.livro
            break
          case 'folha':
            valorA = a.folha
            valorB = b.folha
            break
          case 'termo':
            valorA = a.termo
            valorB = b.termo
            break
          case 'dataTermo':
            valorA = a.data
            valorB = b.data
            break
          case 'dataNasc':
            valorA = a.dataNascimento || ''
            valorB = b.dataNascimento || ''
            break
          case 'dataCas':
            valorA = a.dataCasamento || ''
            valorB = b.dataCasamento || ''
            break
          case 'dataObito':
            valorA = a.dataObito || ''
            valorB = b.dataObito || ''
            break
          case 'nome':
            valorA = a.nomePrincipal.toLowerCase()
            valorB = b.nomePrincipal.toLowerCase()
            break
          case 'pai':
            valorA = (a.nomePai || '').toLowerCase()
            valorB = (b.nomePai || '').toLowerCase()
            break
          case 'mae':
            valorA = (a.nomeMae || '').toLowerCase()
            valorB = (b.nomeMae || '').toLowerCase()
            break
          case 'tipo':
            valorA = a.tipoCasamento || ''
            valorB = b.tipoCasamento || ''
            break
          case 'contraente1':
            valorA = (a.contraente || '').toLowerCase()
            valorB = (b.contraente || '').toLowerCase()
            break
          case 'contraente2':
            valorA = (a.contraente2 || '').toLowerCase()
            valorB = (b.contraente2 || '').toLowerCase()
            break
          default:
            return 0
        }

        if (valorA < valorB) return direcaoOrdenacao === 'asc' ? -1 : 1
        if (valorA > valorB) return direcaoOrdenacao === 'asc' ? 1 : -1
        return 0
      })
    }

    return resultado
  }, [consultaExecutada, filtrosAplicados, registros, campoOrdenacao, direcaoOrdenacao])

  const totalRegistrosPorTipo = useMemo(() => {
    if (!filtrosAplicados.tipo) {
      return registros.length
    }
    return registros.filter(reg => reg.tipo === filtrosAplicados.tipo).length
  }, [registros, filtrosAplicados.tipo])

  useEffect(() => {
    try {
      const armazenados = localStorage.getItem(REGISTROS_STORAGE_KEY)
      if (armazenados) {
        const parsed: RegistroIndice[] = JSON.parse(armazenados)
        setRegistros(parsed)
      }

      const codigoArmazenado = localStorage.getItem(CODIGO_INTERNO_STORAGE_KEY)
      if (codigoArmazenado) {
        const numero = parseInt(codigoArmazenado, 10)
        if (!Number.isNaN(numero)) {
          ultimoCodigoRef.current = numero
        }
      }

      const filtroArmazenado = localStorage.getItem(FILTRO_STORAGE_KEY)
      if (filtroArmazenado) {
        const parsedFiltro: FiltroIndice = JSON.parse(filtroArmazenado)
        const sanitizado = sanitizarFiltroPorTipo(parsedFiltro.tipo, parsedFiltro)
        setFiltro(sanitizado)
        setFiltrosAplicados(sanitizado)
      }

      const consultaFlag = localStorage.getItem(CONSULTA_EXECUTADA_STORAGE_KEY)
      if (consultaFlag === 'true') {
        setConsultaExecutada(true)
      }
    } catch (error) {
      console.error('Erro ao carregar registros de índice persistidos:', error)
    }
  }, [])

  const handleChangeFiltro = (field: keyof FiltroIndice, value: string) => {
    if (field === 'tipo') {
      const novoTipo = value as TipoFiltroIndice
      setFiltro((prev) => {
        const atualizado: FiltroIndice = { ...prev, tipo: novoTipo as TipoIndice | '' }
        return sanitizarFiltroPorTipo(novoTipo, atualizado)
      })
      return
    }

    setFiltro((prev) => ({ ...prev, [field]: value }))
  }

  const aplicarFiltros = () => {
    // Validar se o Tipo de Índice foi selecionado
    if (!filtro.tipo) {
      setPopupMensagem('⚠️ Selecione o Tipo de Índice antes de aplicar os filtros')
      window.setTimeout(() => setPopupMensagem(''), 3500)
      return
    }

    // Validar se pelo menos um campo adicional foi preenchido
    const camposPreenchidos = [
      filtro.livro,
      filtro.dataInicio,
      filtro.dataFim,
      filtro.termoInicial,
      filtro.termoFinal,
      filtro.folhaInicial,
      filtro.folhaFinal,
      filtro.nome,
      filtro.nomePai,
      filtro.nomeMae
    ].filter(campo => campo && campo.trim() !== '')

    if (camposPreenchidos.length === 0) {
      setPopupMensagem('⚠️ Preencha pelo menos um campo além do Tipo de Índice')
      window.setTimeout(() => setPopupMensagem(''), 3500)
      return
    }

    const filtroSanitizado = sanitizarFiltroPorTipo(filtro.tipo, filtro)
    setFiltro(filtroSanitizado)
    setFiltrosAplicados(filtroSanitizado)
    setConsultaExecutada(true)
    localStorage.setItem(FILTRO_STORAGE_KEY, JSON.stringify(filtroSanitizado))
    localStorage.setItem(CONSULTA_EXECUTADA_STORAGE_KEY, 'true')
  }

  const limparFiltros = () => {
    setFiltro(emptyFiltro)
    setFiltrosAplicados(emptyFiltro)
    setConsultaExecutada(false)
    localStorage.removeItem(FILTRO_STORAGE_KEY)
    localStorage.removeItem(CONSULTA_EXECUTADA_STORAGE_KEY)
  }

  useEffect(() => {
    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current)
      }
    }
  }, [])

  const handleFormChange = (field: keyof typeof formDefaults, value: string | boolean) => {
    const setter = setFormByTab[activeTipoCadastro]
    setter((prev) => ({ ...prev, [field]: value }))
  }

  const limparFormulario = async (emitirToast = true) => {
    setFormNascimento(formDefaults)
    setFormCasamento(formDefaults)
    setFormObito(formDefaults)
    setRegistroEmEdicaoId(null)
    codigoEdicaoRef.current = null
    setRegistroSelecionadoId(null)
    if (emitirToast) {
      await modal.toast('Formulário limpo.', 'info')
    }
  }

  const novaEntrada = async () => {
    await limparFormulario(false)
    await modal.toast('Pronto para novo registro.', 'info')
  }

  const gravarEntrada = async () => {
    await adicionarRegistro()
  }

  const handleRetornar = async () => {
    await modal.toast('Retornando...', 'info')
    onClose()
  }

  const handleOrdenar = (campo: string) => {
    if (campoOrdenacao === campo) {
      // Se já está ordenando por este campo, inverte a direção
      setDirecaoOrdenacao(direcaoOrdenacao === 'asc' ? 'desc' : 'asc')
    } else {
      // Se é um novo campo, ordena ascendente
      setCampoOrdenacao(campo)
      setDirecaoOrdenacao('asc')
    }
  }

  const gerarRelatorioExcel = () => {
    if (filteredRegistros.length === 0) {
      modal.alert('Nenhum registro para exportar. Aplique os filtros primeiro.')
      return
    }

    const tipoRelatorio = filtrosAplicados.tipo || 'Todos os Tipos'
    let headers: string[] = []
    let data: string[][] = []
    
    // Definir colunas e dados baseado no tipo
    if (tipoRelatorio === 'nascimento') {
      headers = ['Código', 'Livro', 'Folha', 'Termo', 'Data Termo', 'Data Nasc.', 'Nome da Criança', 'Nome do Pai', 'Nome da Mãe', 'Sexo', 'Gêmeos']
      data = filteredRegistros.map((reg) => [
        String(reg.codigoInterno ?? ''),
        reg.livro || '',
        reg.folha ? (reg.folhaVerso === 'V' ? `${reg.folha}v` : reg.folha) : '',
        reg.termo || '',
        reg.data ? new Date(reg.data).toLocaleDateString('pt-BR') : '',
        reg.dataNascimento ? new Date(reg.dataNascimento).toLocaleDateString('pt-BR') : '',
        reg.nomePrincipal || '',
        reg.nomePai || '',
        reg.nomeMae || '',
        reg.sexo === 'masculino' ? 'M' : reg.sexo === 'feminino' ? 'F' : '',
        reg.gemeos ? 'Sim' : 'Não'
      ])
    } else if (tipoRelatorio === 'casamento') {
      headers = ['Código', 'Livro', 'Folha', 'Termo', 'Data Termo', 'Data Cas.', 'Tipo', 'O Contraente', 'Novo Nome', 'A Contraente', 'Novo Nome', 'Regime de Bens']
      data = filteredRegistros.map((reg) => [
        String(reg.codigoInterno ?? ''),
        reg.livro || '',
        reg.folha ? (reg.folhaVerso === 'V' ? `${reg.folha}v` : reg.folha) : '',
        reg.termo || '',
        reg.data ? new Date(reg.data).toLocaleDateString('pt-BR') : '',
        reg.dataCasamento ? new Date(reg.dataCasamento).toLocaleDateString('pt-BR') : '',
        reg.tipoCasamento === 'r' ? 'Religioso' : reg.tipoCasamento === 'c' ? 'Civil' : reg.tipoCasamento === 'u' ? 'União Estável' : '',
        reg.contraente || '',
        reg.novoNomeContraente || '',
        reg.contraente2 || '',
        reg.novoNomeContraente2 || '',
        reg.regimeBens || ''
      ])
    } else if (tipoRelatorio === 'obito') {
      headers = ['Código', 'Livro', 'Folha', 'Termo', 'Data Termo', 'Data Óbito', 'Nome do Falecido', 'Nome do Pai', 'Nome da Mãe', 'Causa de Morte']
      data = filteredRegistros.map((reg) => [
        String(reg.codigoInterno ?? ''),
        reg.livro || '',
        reg.folha ? (reg.folhaVerso === 'V' ? `${reg.folha}v` : reg.folha) : '',
        reg.termo || '',
        reg.data ? new Date(reg.data).toLocaleDateString('pt-BR') : '',
        reg.dataObito ? new Date(reg.dataObito).toLocaleDateString('pt-BR') : '',
        reg.nomePrincipal || '',
        reg.nomePai || '',
        reg.nomeMae || '',
        reg.causaMorte?.replace(/;/g, ' | ') || ''
      ])
    } else {
      headers = ['Código', 'Tipo', 'Livro', 'Folha', 'Termo', 'Data', 'Nome Principal', 'Pai', 'Mãe']
      data = filteredRegistros.map((reg) => [
        String(reg.codigoInterno ?? ''),
        reg.tipo === 'nascimento' ? 'Nascimento' : reg.tipo === 'casamento' ? 'Casamento' : 'Óbito',
        reg.livro || '',
        reg.folha ? (reg.folhaVerso === 'V' ? `${reg.folha}v` : reg.folha) : '',
        reg.termo || '',
        reg.data ? new Date(reg.data).toLocaleDateString('pt-BR') : '',
        reg.nomePrincipal || '',
        reg.nomePai || '',
        reg.nomeMae || ''
      ])
    }

    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const tipoFormatado = tipoRelatorio === 'nascimento' ? 'Nascimento' 
      : tipoRelatorio === 'casamento' ? 'Casamento'
      : tipoRelatorio === 'obito' ? 'Óbito'
      : 'Todos'
    const fileName = `Relatorio_Indices_${tipoFormatado}_${dataAtual}_${horaAtual.replace(':', 'h')}`

    exportToExcel({
      fileName,
      sheetName: `Índices ${tipoFormatado}`,
      headers,
      data
    })
    
    modal.toast(`✅ Relatório exportado com sucesso! ${filteredRegistros.length} registro(s)`, 'success')
  }

  const camposObrigatoriosPreenchidos = useMemo(() => {
    const form = formByTab[activeTipoCadastro]
    const obrigatorios = camposObrigatoriosPorTipo[activeTipoCadastro].campos

    return obrigatorios.every((campo) => {
      const valor = form[campo]
      if (typeof valor === 'string') {
        return valor.trim().length > 0
      }
      return !!valor
    })
  }, [activeTipoCadastro, formNascimento, formCasamento, formObito])

  const obterNomeCampo = (campo: keyof typeof formDefaults): string => {
    const nomes: Record<string, string> = {
      livro: 'Livro',
      folha: 'Folha',
      termo: 'Termo',
      nomePrincipal: activeTipoCadastro === 'nascimento' ? 'Nome da Criança' : activeTipoCadastro === 'obito' ? 'Nome do Falecido' : 'Nome',
      tipoCasamento: 'Tipo de Casamento',
      dataCasamento: 'Data de Casamento',
      contraente: 'O Contraente',
      contraente2: 'A Contraente',
      regimeBens: 'Regime de Bens',
      dataObito: 'Data do Óbito',
      causaMorte: 'Causa de Morte',
      data: 'Data do Termo'
    }
    return nomes[campo] || campo
  }

  const adicionarRegistro = async () => {
    const form = formByTab[activeTipoCadastro]
    const { campos } = camposObrigatoriosPorTipo[activeTipoCadastro]
    const faltando = campos.filter((campo) => {
      const valor = form[campo]
      if (typeof valor === 'string') {
        return valor.trim().length === 0
      }
      return !valor
    })

    if (faltando.length > 0) {
      const camposFaltantes = faltando.map(campo => obterNomeCampo(campo)).join(', ')
      const mensagem = `⚠️ Campos obrigatórios faltando: ${camposFaltantes}`
      mostrarPopup(mensagem)
      return
    }

    const registro: RegistroIndice = {
      id: registroEmEdicaoId || `registro-${Date.now()}`,
      tipo: activeTipoCadastro,
      livro: form.livro.trim(),
      folha: form.folha.trim(),
      folhaVerso: form.folhaVerso,
      termo: form.termo.trim(),
      data: form.data,
      cidade: form.cidade.trim(),
      nomePrincipal: form.nomePrincipal.trim(),
      nomeComplementar: form.nomeComplementar?.trim(),
      nomePai: form.nomePai?.trim(),
      nomeMae: form.nomeMae?.trim(),
      contraente: form.contraente?.trim(),
      contraente2: form.contraente2?.trim(),
      novoNomeContraente: form.novoNomeContraente?.trim(),
      novoNomeContraente2: form.novoNomeContraente2?.trim(),
      tipoCasamento: form.tipoCasamento?.trim(),
      regimeBens: form.regimeBens?.trim(),
      sexo: form.sexo || '',
      gemeos: !!form.gemeos,
      obitoDesconhecido: !!form.obitoDesconhecido,
      dataNascimento: form.dataNascimento || '',
      dataCasamento: form.dataCasamento || '',
      dataObito: form.dataObito || '',
      causaMorte: form.causaMorte?.trim(),
      livroGemelar: form.livroGemelar?.trim(),
      folhaGemelar: form.folhaGemelar?.trim(),
      termoGemelar: form.termoGemelar?.trim(),
      nomeGemelar: form.nomeGemelar?.trim(),
      observacoes: form.observacoes?.trim(),
      criadoEm: new Date().toISOString(),
      codigoInterno: codigoEdicaoRef.current ?? 0
    }

    if (registroEmEdicaoId) {
      const atualizados = registros.map((item) =>
        item.id === registroEmEdicaoId
          ? { ...registro, id: item.id, codigoInterno: item.codigoInterno }
          : item
      )
      setRegistros(atualizados)
      persistirRegistros(atualizados)
      mostrarPopup('Registro atualizado com sucesso.')
    } else {
      const novoCodigo = ultimoCodigoRef.current + 1
      ultimoCodigoRef.current = novoCodigo
      localStorage.setItem(CODIGO_INTERNO_STORAGE_KEY, String(novoCodigo))

      const novoRegistro = {
        ...registro,
        id: `registro-${novoCodigo}`,
        codigoInterno: novoCodigo
      }

      const novos = [novoRegistro, ...registros]
      setRegistros(novos)
      persistirRegistros(novos)
      setRegistroSelecionadoId(novoRegistro.id)
      mostrarPopup('Registro gravado com sucesso.')
    }

    await limparFormulario(false)
  }

  const removerRegistro = (id: string) => {
    setRegistros((prev) => {
      const atualizados = prev.filter((registro) => registro.id !== id)
      persistirRegistros(atualizados)
      if (registroEmEdicaoId === id) {
        setRegistroEmEdicaoId(null)
        codigoEdicaoRef.current = null
      }
      if (registroSelecionadoId === id) {
        setRegistroSelecionadoId(null)
      }
      return atualizados
    })
  }

  const inputBaseStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surface,
    color: theme.text,
    fontSize: '13px',
    boxSizing: 'border-box'
  }

  const inputSmallStyle: React.CSSProperties = {
    ...inputBaseStyle,
    maxWidth: '140px'
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: theme.text,
    marginBottom: '4px'
  }

  const actionButtonsContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '4px',
    paddingTop: '6px',
    borderTop: `1px solid ${theme.border}`,
    flexWrap: 'nowrap',
    flexShrink: 0,
    minHeight: '40px'
  }

  const getActionButtonStyles = (buttonId: string, disabled = false) => {
    const isHovered = hoveredButton === buttonId
    const backgroundColor = disabled
      ? '#9ca3af'
      : isHovered
      ? '#495057'
      : '#6c757d'

    return {
      padding: '10px 18px',
      border: 'none',
      borderRadius: '6px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '13px',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s ease',
      minWidth: '90px',
      justifyContent: 'center',
      whiteSpace: 'nowrap' as const,
      flexShrink: 0,
      color: '#ffffff',
      backgroundColor,
      opacity: disabled ? 0.7 : 1,
      transform: disabled ? 'none' : isHovered ? 'translateY(-1px)' : 'translateY(0)',
      boxShadow: disabled ? 'none' : isHovered ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
    }
  }

  const persistirRegistros = (lista: RegistroIndice[]) => {
    localStorage.setItem(REGISTROS_STORAGE_KEY, JSON.stringify(lista))
  }

  const mostrarPopup = (mensagem: string) => {
    setPopupMensagem(mensagem)
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current)
    }
    popupTimeoutRef.current = setTimeout(() => {
      setPopupMensagem(null)
      popupTimeoutRef.current = null
    }, 3500) as unknown as number
  }

  const abrirPopupCausaMorte = () => {
    const form = formByTab[activeTipoCadastro]
    if (form.causaMorte) {
      const causas = form.causaMorte.split(';').map(c => c.trim())
      setCausasMorteTemp([...causas, ...Array(5 - causas.length).fill('')].slice(0, 5))
    } else {
      setCausasMorteTemp(['', '', '', '', ''])
    }
    setMostrarPopupCausaMorte(true)
  }

  const salvarCausasMorte = () => {
    const causasPreenchidas = causasMorteTemp.filter(c => c.trim() !== '')
    const causaFinal = causasPreenchidas.join('; ')
    handleFormChange('causaMorte', causaFinal)
    setMostrarPopupCausaMorte(false)
  }

  const cancelarCausasMorte = () => {
    setMostrarPopupCausaMorte(false)
    setCausasMorteTemp(['', '', '', '', ''])
  }

  const renderLabel = (texto: string, obrigatorio = false) => (
    <label style={labelStyle}>
      {texto}
      {obrigatorio && <span style={{ color: '#dc2626', marginLeft: '2px' }}>*</span>}
    </label>
  )

  const isCampoObrigatorio = (campo: keyof typeof formDefaults) =>
    camposObrigatoriosPorTipo[activeTipoCadastro].campos.includes(campo)

  const renderFormulario = () => {
    const form = formByTab[activeTipoCadastro]

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
         <div
           style={{
             display: 'grid',
             gridTemplateColumns:
               activeTipoCadastro === 'nascimento'
                 ? 'repeat(5, minmax(160px, 1fr))'
                 : activeTipoCadastro === 'casamento'
                 ? 'repeat(5, minmax(140px, 1fr))'
                 : activeTipoCadastro === 'obito'
                 ? 'repeat(5, minmax(140px, 1fr))'
                 : 'repeat(4, minmax(180px, 1fr))',
             gap: '16px'
           }}
         >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {renderLabel('Livro', isCampoObrigatorio('livro'))}
            <input
              style={activeTipoCadastro === 'casamento' || activeTipoCadastro === 'obito' ? inputSmallStyle : inputBaseStyle}
              value={form.livro}
              onChange={(e) => handleFormChange('livro', e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {renderLabel('Folha', isCampoObrigatorio('folha'))}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                style={{ ...inputBaseStyle, flex: 1, minWidth: 0 }}
                value={form.folha}
                onChange={(e) => handleFormChange('folha', e.target.value)}
              />
               <select
                 style={{ ...inputBaseStyle, width: '60px', padding: '8px 4px' }}
                 value={form.folhaVerso || ''}
                 onChange={(e) => handleFormChange('folhaVerso', e.target.value)}
                 title="Frente ou Verso"
               >
                 <option value=""></option>
                 <option value="F">F</option>
                 <option value="V">V</option>
               </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {renderLabel('Termo', isCampoObrigatorio('termo'))}
            <input
              style={activeTipoCadastro === 'casamento' || activeTipoCadastro === 'obito' ? inputSmallStyle : inputBaseStyle}
              value={form.termo}
              onChange={(e) => handleFormChange('termo', e.target.value)}
            />
          </div>
          {activeTipoCadastro === 'nascimento' ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {renderLabel('Data de Nascimento', isCampoObrigatorio('dataNascimento'))}
              <input
                type="date"
                style={inputBaseStyle}
                value={form.dataNascimento || ''}
                onChange={(e) => handleFormChange('dataNascimento', e.target.value)}
              />
            </div>
          ) : null}
          {activeTipoCadastro === 'casamento' ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {renderLabel('Data de Casamento', isCampoObrigatorio('dataCasamento'))}
                <input
                  type="date"
                  style={inputBaseStyle}
                  value={form.dataCasamento || ''}
                  onChange={(e) => handleFormChange('dataCasamento', e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {renderLabel('Data do Termo', isCampoObrigatorio('data'))}
                <input
                  type="date"
                  style={inputBaseStyle}
                  value={form.data}
                  onChange={(e) => handleFormChange('data', e.target.value)}
                />
              </div>
            </>
          ) : activeTipoCadastro === 'obito' ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {renderLabel('Data do Óbito', isCampoObrigatorio('dataObito'))}
                <input
                  type="date"
                  style={inputBaseStyle}
                  value={form.dataObito || ''}
                  onChange={(e) => handleFormChange('dataObito', e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {renderLabel('Data do Termo', isCampoObrigatorio('data'))}
                <input
                  type="date"
                  style={inputBaseStyle}
                  value={form.data}
                  onChange={(e) => handleFormChange('data', e.target.value)}
                />
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {renderLabel('Data do Termo', isCampoObrigatorio('data'))}
              <input
                type="date"
                style={inputBaseStyle}
                value={form.data}
                onChange={(e) => handleFormChange('data', e.target.value)}
              />
            </div>
          )}
        </div>

         <div style={{ display: 'grid', gap: '16px', alignItems: 'flex-start', gridTemplateColumns: activeTipoCadastro === 'nascimento' ? 'minmax(320px, 3fr) minmax(140px, 1fr) minmax(220px, 1fr)' : activeTipoCadastro === 'casamento' ? 'repeat(2, 1fr)' : 'repeat(2, minmax(260px, 1fr))' }}>
           {activeTipoCadastro === 'casamento' ? (
             <>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 {renderLabel('Tipo de Casamento', isCampoObrigatorio('tipoCasamento'))}
                 <select
                   style={inputBaseStyle}
                   value={form.tipoCasamento || ''}
                   onChange={(e) => handleFormChange('tipoCasamento', e.target.value)}
                 >
                   <option value="">Selecione</option>
                   <option value="R">R - Religioso com efeito civil</option>
                   <option value="U">U - Conversão de união estável em casamento</option>
                   <option value="C">C - Civil</option>
                 </select>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 {renderLabel('Regime de Bens', isCampoObrigatorio('regimeBens'))}
                 <select
                   style={inputBaseStyle}
                   value={form.regimeBens || ''}
                   onChange={(e) => handleFormChange('regimeBens', e.target.value)}
                 >
                   <option value="">Selecione</option>
                   <option value="comunhao_parcial">Comunhão parcial de bens</option>
                   <option value="comunhao_universal">Comunhão universal de bens</option>
                   <option value="separacao_total">Separação total de bens</option>
                   <option value="participacao_final">Participação final nos aquestos</option>
                   <option value="separacao_obrigatoria">Separação obrigatória de bens</option>
                 </select>
               </div>
             </>
           ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {renderLabel(
                  activeTipoCadastro === 'obito' ? 'Nome do Falecido' : 'Nome da Criança',
                  isCampoObrigatorio('nomePrincipal')
                )}
                <input
                  style={inputBaseStyle}
                  value={form.nomePrincipal}
                  onChange={(e) => handleFormChange('nomePrincipal', e.target.value)}
                  disabled={activeTipoCadastro === 'obito' && form.obitoDesconhecido}
                />
              </div>

              {activeTipoCadastro === 'obito' && (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  {renderLabel('Óbito de desconhecido')}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '38px' }}>
                    <input
                      type="checkbox"
                      checked={!!form.obitoDesconhecido}
                      onChange={(e) => {
                        handleFormChange('obitoDesconhecido', e.target.checked)
                        if (e.target.checked) {
                          handleFormChange('nomePrincipal', 'DESCONHECIDO')
                        } else {
                          handleFormChange('nomePrincipal', '')
                        }
                      }}
                    />
                    <span style={{ fontSize: '12px', color: theme.text }}>Marcar se o falecido é desconhecido</span>
                  </div>
                </div>
              )}

              {activeTipoCadastro === 'nascimento' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '180px' }}>
                    {renderLabel('Sexo')}
                    <select
                      style={inputBaseStyle}
                      value={form.sexo || ''}
                      onChange={(e) => handleFormChange('sexo', e.target.value)}
                    >
                      <option value="">Selecione</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    {renderLabel('Gêmeos?')}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '38px' }}>
                      <input
                        type="checkbox"
                        checked={!!form.gemeos}
                        onChange={(e) => handleFormChange('gemeos', e.target.checked)}
                      />
                      <span style={{ fontSize: '12px', color: theme.text }}>Marcar se o nascimento for gemelar</span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

         {activeTipoCadastro === 'casamento' && (
           <>
             <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 {renderLabel('O Contraente', isCampoObrigatorio('contraente'))}
                 <input
                   style={inputBaseStyle}
                   value={form.contraente}
                   onChange={(e) => handleFormChange('contraente', e.target.value)}
                   placeholder="Nome do contraente"
                 />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 {renderLabel('Novo Nome Contraente', false)}
                 <input
                   style={inputBaseStyle}
                   value={form.novoNomeContraente}
                   onChange={(e) => handleFormChange('novoNomeContraente', e.target.value)}
                   placeholder="Novo nome após casamento"
                 />
               </div>
             </div>
             <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 {renderLabel('A Contraente', isCampoObrigatorio('contraente2'))}
                 <input
                   style={inputBaseStyle}
                   value={form.contraente2}
                   onChange={(e) => handleFormChange('contraente2', e.target.value)}
                   placeholder="Nome da contraente"
                 />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 {renderLabel('Novo Nome da Contraente', false)}
                 <input
                   style={inputBaseStyle}
                   value={form.novoNomeContraente2}
                   onChange={(e) => handleFormChange('novoNomeContraente2', e.target.value)}
                   placeholder="Novo nome após casamento"
                 />
               </div>
             </div>
           </>
         )}

        {activeTipoCadastro === 'casamento' ? null : (
          <>
            {(activeTipoCadastro === 'nascimento' || activeTipoCadastro === 'obito') && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '16px'
                }}
              >
                <div>
                  <label style={labelStyle}>Nome do Pai</label>
                  <input
                    style={inputBaseStyle}
                    value={form.nomePai}
                    onChange={(e) => handleFormChange('nomePai', e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nome da Mãe</label>
                  <input
                    style={inputBaseStyle}
                    value={form.nomeMae}
                    onChange={(e) => handleFormChange('nomeMae', e.target.value)}
                  />
                </div>
              </div>
            )}
          </>
        )}

         {activeTipoCadastro === 'obito' && (
           <div>
             {renderLabel('Causa de Morte', isCampoObrigatorio('causaMorte'))}
             <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
               <input
                 style={{ ...inputBaseStyle, flex: 1, cursor: 'pointer' }}
                 value={form.causaMorte || ''}
                 readOnly
                 onClick={abrirPopupCausaMorte}
                 placeholder="Clique para preencher as causas"
               />
               <button
                 type="button"
                 onClick={abrirPopupCausaMorte}
                 style={{
                   padding: '8px 16px',
                   borderRadius: '6px',
                   border: 'none',
                   backgroundColor: '#2563eb',
                   color: '#fff',
                   cursor: 'pointer',
                   fontSize: '13px',
                   fontWeight: 600,
                   whiteSpace: 'nowrap'
                 }}
               >
                 📝 Editar
               </button>
             </div>
           </div>
         )}

        {form.gemeos && activeTipoCadastro === 'nascimento' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '150px 150px 150px minmax(260px, 2fr)',
              gap: '16px'
            }}
          >
            <div>
              <label style={labelStyle}>Livro (Gemelar)</label>
              <input
                style={inputBaseStyle}
                value={form.livroGemelar || ''}
                onChange={(e) => handleFormChange('livroGemelar', e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Folha (Gemelar)</label>
              <input
                style={inputBaseStyle}
                value={form.folhaGemelar || ''}
                onChange={(e) => handleFormChange('folhaGemelar', e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Termo (Gemelar)</label>
              <input
                style={inputBaseStyle}
                value={form.termoGemelar || ''}
                onChange={(e) => handleFormChange('termoGemelar', e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Nome do Gemelar</label>
              <input
                style={inputBaseStyle}
                value={form.nomeGemelar || ''}
                onChange={(e) => handleFormChange('nomeGemelar', e.target.value)}
              />
            </div>
          </div>
        )}

        {activeTipoCadastro === 'casamento' ? null : null}
      </div>
    )
  }

  return (
    <BasePage
      title="Cadastro de Índice de Livro Antigo"
      onClose={onClose}
      width="1200px"
      height="780px"
      minWidth="1200px"
      minHeight="780px"
      resizable={false}
      headerColor={headerColor}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px', padding: '12px', boxSizing: 'border-box', position: 'relative' }}>
        {popupMensagem && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: popupMensagem.includes('⚠️') ? '#ef4444' : '#0ea5e9',
              color: '#f8fafc',
              padding: '12px 18px',
              borderRadius: '10px',
              boxShadow: popupMensagem.includes('⚠️') ? '0 12px 28px rgba(239,68,68,0.35)' : '0 12px 28px rgba(14,165,233,0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 600,
              letterSpacing: '0.2px',
              zIndex: 20,
              minWidth: '320px',
              maxWidth: '500px'
            }}
          >
            <span style={{ fontSize: '20px' }}>{popupMensagem.includes('⚠️') ? '⚠️' : '📄'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px' }}>Cadastro de Índice</div>
              <div style={{ fontSize: '13px', opacity: 0.9, wordWrap: 'break-word' }}>{popupMensagem.replace('⚠️ ', '')}</div>
            </div>
          </div>
        )}

        {/* Tabs principais: Cadastro vs Consulta */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(
            [
              { id: 'cadastro', label: 'Cadastro' },
              { id: 'consulta', label: 'Consulta' }
            ] as { id: 'cadastro' | 'consulta'; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px 8px 0 0',
                border: `1px solid ${theme.border}`,
                borderBottom: activeTab === tab.id ? `3px solid ${headerColor}` : `1px solid ${theme.border}`,
                background: activeTab === tab.id ? theme.surface : theme.background,
                color: activeTab === tab.id ? headerColor : theme.text,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 4px 10px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'cadastro' && (
          <>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                backgroundColor: theme.surface,
                borderRadius: '10px',
                padding: '8px',
                border: `1px solid ${theme.border}`
              }}
            >
              {(
                [
                  { id: 'nascimento', label: 'Nascimento' },
                  { id: 'casamento', label: 'Casamento' },
                  { id: 'obito', label: 'Óbito' }
                ] as { id: TipoIndice; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTipoCadastro(tab.id)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    background: activeTipoCadastro === tab.id ? headerColor : theme.background,
                    color: activeTipoCadastro === tab.id ? '#fff' : theme.text,
                    boxShadow: activeTipoCadastro === tab.id ? '0 2px 6px rgba(0,0,0,0.16)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div
              style={{
                flex: '0 0 auto',
                backgroundColor: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px'
              }}
            >
              {renderFormulario()}
            </div>
          </>
        )}

        {activeTab === 'consulta' && (
          <div
            style={{
              flex: 1,
              minHeight: '0',
              backgroundColor: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: '10px',
              padding: '16px'
            }}
          >
            {/* Painel de filtros */}
            <div
              style={{
                backgroundColor: theme.background,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                marginBottom: '16px',
                boxShadow: '0 1px 4px rgba(15, 23, 42, 0.06)'
              }}
            >
              <button
                onClick={() => setMostrarFiltros((prev) => !prev)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: theme.text,
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <span>Filtros de Conferência</span>
                <span style={{ fontSize: '14px', color: theme.textSecondary }}>{mostrarFiltros ? '▲ Recolher' : '▼ Expandir'}</span>
              </button>
              {mostrarFiltros && (
                <div style={{ padding: '0 16px 16px 16px' }}>
                  <div style={{ color: theme.textSecondary, fontSize: '12px', marginBottom: '12px' }}>
                    Utilize os mesmos critérios da planilha de conferência para validar os registros cadastrados.
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <label style={labelStyle}>Tipo de Índice</label>
                      <select
                        style={inputBaseStyle}
                        value={filtro.tipo}
                        onChange={(e) => handleChangeFiltro('tipo', e.target.value as TipoIndice)}
                      >
                        <option value="">Selecione</option>
                        <option value="nascimento">Nascimento</option>
                        <option value="casamento">Casamento</option>
                        <option value="obito">Óbito</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Livro</label>
                      <input
                        style={inputBaseStyle}
                        value={filtro.livro}
                        onChange={(e) => handleChangeFiltro('livro', e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Data Inicial</label>
                      <input
                        type="date"
                        style={inputBaseStyle}
                        value={filtro.dataInicio}
                        onChange={(e) => handleChangeFiltro('dataInicio', e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Data Final</label>
                      <input
                        type="date"
                        style={inputBaseStyle}
                        value={filtro.dataFim}
                        onChange={(e) => handleChangeFiltro('dataFim', e.target.value)}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <label style={labelStyle}>Termo Inicial</label>
                      <input
                        style={inputBaseStyle}
                        value={filtro.termoInicial}
                        onChange={(e) => handleChangeFiltro('termoInicial', e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Termo Final</label>
                      <input
                        style={inputBaseStyle}
                        value={filtro.termoFinal}
                        onChange={(e) => handleChangeFiltro('termoFinal', e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Folha Inicial</label>
                      <input
                        style={inputBaseStyle}
                        value={filtro.folhaInicial}
                        onChange={(e) => handleChangeFiltro('folhaInicial', e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Folha Final</label>
                      <input
                        style={inputBaseStyle}
                        value={filtro.folhaFinal}
                        onChange={(e) => handleChangeFiltro('folhaFinal', e.target.value)}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: filtroNomeConfig.mostrarNomeMae ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <label style={labelStyle}>{filtroNomeConfig.nomeLabel}</label>
                      <input
                        style={inputBaseStyle}
                        value={filtro.nome}
                        placeholder={filtroNomeConfig.nomePlaceholder}
                        onChange={(e) => handleChangeFiltro('nome', e.target.value)}
                      />
                    </div>
                    {filtroNomeConfig.mostrarNomePai && (
                      <div>
                        <label style={labelStyle}>{filtroNomeConfig.nomePaiLabel}</label>
                        <input
                          style={inputBaseStyle}
                          value={filtro.nomePai}
                          placeholder={filtroNomeConfig.nomePaiPlaceholder}
                          onChange={(e) => handleChangeFiltro('nomePai', e.target.value)}
                        />
                      </div>
                    )}
                    {filtroNomeConfig.mostrarNomeMae && (
                      <div>
                        <label style={labelStyle}>{filtroNomeConfig.nomeMaeLabel}</label>
                        <input
                          style={inputBaseStyle}
                          value={filtro.nomeMae}
                          placeholder={filtroNomeConfig.nomeMaePlaceholder}
                          onChange={(e) => handleChangeFiltro('nomeMae', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                    <button
                      onClick={limparFiltros}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: `1px solid ${theme.border}`,
                        background: theme.background,
                        color: theme.text,
                        cursor: 'pointer'
                      }}
                    >
                      Limpar filtros
                    </button>
                    <button
                      onClick={aplicarFiltros}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#2563eb',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)'
                      }}
                    >
                      Aplicar filtros
                    </button>
                    <button
                      onClick={gerarRelatorioExcel}
                      disabled={!consultaExecutada || filteredRegistros.length === 0}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '6px',
                        border: 'none',
                        background: consultaExecutada && filteredRegistros.length > 0 ? '#10b981' : '#9ca3af',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: consultaExecutada && filteredRegistros.length > 0 ? 'pointer' : 'not-allowed',
                        boxShadow: consultaExecutada && filteredRegistros.length > 0 ? '0 2px 6px rgba(16, 185, 129, 0.2)' : 'none',
                        opacity: consultaExecutada && filteredRegistros.length > 0 ? 1 : 0.6
                      }}
                    >
                      📊 Relatório
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: theme.text }}>
                Registros cadastrados ({consultaExecutada ? filteredRegistros.length : 0}/{totalRegistrosPorTipo})
              </strong>
              <span style={{ color: theme.textSecondary, fontSize: '12px' }}>
                Os registros são mantidos apenas nesta sessão. Use a conferência para validar com a planilha oficial.
              </span>
            </div>
            <div
              style={{
                flex: '0 0 auto',
                maxHeight: mostrarFiltros ? '240px' : '450px',
                overflowY: 'auto',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.background,
                transition: 'max-height 0.3s ease'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead style={{ position: 'sticky', top: 0, background: currentTheme === 'dark' ? '#1f2937' : '#f1f5f9', zIndex: 5 }}>
                  <tr>
                    {obterColunasPorTipo(filtro.tipo || 'nascimento').map((col, index) => {
                      // Mapear nome da coluna para o campo de ordenação
                      const campoMap: Record<string, string> = {
                        'Código': 'codigo',
                        'Livro': 'livro',
                        'Folha': 'folha',
                        'Termo': 'termo',
                        'Data Termo': 'dataTermo',
                        'Data Nasc.': 'dataNasc',
                        'Data Cas.': 'dataCas',
                        'Data Óbito': 'dataObito',
                        'Nome da Criança': 'nome',
                        'Nome Falecido': 'nome',
                        'Pai': 'pai',
                        'Mãe': 'mae',
                        'Tipo': 'tipo',
                        'O Contraente': 'contraente1',
                        'A Contraente': 'contraente2'
                      }
                      
                      const campo = campoMap[col]
                      const isOrdenado = campoOrdenacao === campo
                      const isClicavel = col !== ''
                      
                      return (
                        <th
                          key={col || `empty-${index}`}
                          onClick={() => isClicavel && handleOrdenar(campo)}
                          style={{
                            padding: '10px 8px',
                            textAlign: col === '' ? 'right' : 'left',
                            fontWeight: 700,
                            color: isOrdenado ? '#2563eb' : theme.text,
                            borderBottom: `1px solid ${theme.border}`,
                            background: currentTheme === 'dark' ? '#1f2937' : '#f1f5f9',
                            fontSize: '11px',
                            cursor: isClicavel ? 'pointer' : 'default',
                            userSelect: 'none',
                            transition: 'color 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{col}</span>
                            {isClicavel && (
                              <span style={{ fontSize: '10px', opacity: isOrdenado ? 1 : 0.3 }}>
                                {isOrdenado ? (direcaoOrdenacao === 'asc' ? '▲' : '▼') : '⬍'}
                              </span>
                            )}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {!consultaExecutada ? (
                    <tr>
                      <td colSpan={12} style={{ padding: '20px', textAlign: 'center', color: theme.textSecondary }}>
                        Utilize os filtros de conferência e clique em "Aplicar filtros" para visualizar os registros cadastrados.
                      </td>
                    </tr>
                  ) : filteredRegistros.length === 0 ? (
                    <tr>
                      <td colSpan={12} style={{ padding: '20px', textAlign: 'center', color: theme.textSecondary }}>
                        Nenhum registro encontrado para os critérios informados.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistros.map((registro) => {
                      const selecionado = registroSelecionadoId === registro.id
                      
                      const renderCelulas = () => {
                        // Formatar folha: se for V (verso), mostrar como "8v", senão apenas o número
                        const folhaFormatada = registro.folha 
                          ? (registro.folhaVerso === 'V' ? `${registro.folha}v` : registro.folha)
                          : '--'
                        
                        const cells = [
                          <td key="codigo" style={{ padding: '8px' }}>{registro.codigoInterno ?? '--'}</td>,
                          <td key="livro" style={{ padding: '8px', maxWidth: '60px' }}>{registro.livro || '--'}</td>,
                          <td key="folha" style={{ padding: '8px' }}>{folhaFormatada}</td>,
                          <td key="termo" style={{ padding: '8px' }}>{registro.termo || '--'}</td>
                        ]

                        if (registro.tipo === 'nascimento') {
                          cells.push(
                            <td key="dataTermo" style={{ padding: '8px' }}>{registro.data ? new Date(registro.data).toLocaleDateString() : '--'}</td>,
                            <td key="dataNasc" style={{ padding: '8px' }}>{registro.dataNascimento ? new Date(registro.dataNascimento).toLocaleDateString() : '--'}</td>,
                            <td key="nome" style={{ padding: '8px' }}>{registro.nomePrincipal || '--'}</td>,
                            <td key="pai" style={{ padding: '8px' }}>{registro.nomePai || '--'}</td>,
                            <td key="mae" style={{ padding: '8px' }}>{registro.nomeMae || '--'}</td>
                          )
                        } else if (registro.tipo === 'casamento') {
                          cells.push(
                            <td key="dataTermo" style={{ padding: '8px' }}>{registro.data ? new Date(registro.data).toLocaleDateString() : '--'}</td>,
                            <td key="dataCas" style={{ padding: '8px' }}>{registro.dataCasamento ? new Date(registro.dataCasamento).toLocaleDateString() : '--'}</td>,
                            <td key="tipo" style={{ padding: '8px', textAlign: 'center' }}>{registro.tipoCasamento?.toUpperCase() || '--'}</td>,
                            <td key="contraente1" style={{ padding: '8px' }}>{registro.contraente || '--'}</td>,
                            <td key="contraente2" style={{ padding: '8px' }}>{registro.contraente2 || '--'}</td>
                          )
                        } else if (registro.tipo === 'obito') {
                          cells.push(
                            <td key="dataTermo" style={{ padding: '8px' }}>{registro.data ? new Date(registro.data).toLocaleDateString() : '--'}</td>,
                            <td key="dataObito" style={{ padding: '8px' }}>{registro.dataObito ? new Date(registro.dataObito).toLocaleDateString() : '--'}</td>,
                            <td key="nome" style={{ padding: '8px' }}>{registro.nomePrincipal || '--'}</td>,
                            <td key="pai" style={{ padding: '8px' }}>{registro.nomePai || '--'}</td>,
                            <td key="mae" style={{ padding: '8px' }}>{registro.nomeMae || '--'}</td>
                          )
                        }

                        return cells
                      }

                      return (
                        <tr
                          key={registro.id}
                          onClick={() => setRegistroSelecionadoId(registro.id)}
                          style={{
                            borderBottom: `1px solid ${theme.border}`,
                            backgroundColor: selecionado ? '#e2e8f0' : 'transparent',
                            cursor: 'pointer'
                          }}
                        >
                          {renderCelulas()}
                          <td style={{ padding: '8px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation()
                                setActiveTab('cadastro')
                                setActiveTipoCadastro(registro.tipo)
                                setFormByTab[registro.tipo]({
                                  ...formDefaults,
                                  ...registro,
                                  sexo: registro.sexo || '',
                                  gemeos: registro.gemeos || false
                                })
                                setRegistroSelecionadoId(registro.id)
                                setRegistroEmEdicaoId(registro.id)
                                tipoEdicaoRef.current = registro.tipo
                                codigoEdicaoRef.current = registro.codigoInterno || null
                                mostrarPopup('Registro carregado para edição.')
                              }}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#6b7280',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                            >
                              Editar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removerRegistro(registro.id)
                                mostrarPopup('Registro removido.')
                              }}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#ef4444',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'consulta' && (
          <div style={actionButtonsContainerStyle}>
            <button
              onClick={() => handleRetornar()}
              onMouseEnter={() => setHoveredButton('retornar-consulta')}
              onMouseLeave={() => {
                setHoveredButton(null)
                setActiveButton(null)
              }}
              onMouseDown={() => setActiveButton('retornar-consulta')}
              onMouseUp={() => setActiveButton(null)}
              style={getActionButtonStyles('retornar-consulta', false)}
            >
              <span style={{ fontSize: '16px' }}>↩️</span>
              <span>Retornar</span>
            </button>
          </div>
        )}

         {activeTab === 'cadastro' && (
           <div style={actionButtonsContainerStyle}>
             {[
               { id: 'novo', label: 'Novo', icon: '📄', action: () => novaEntrada() },
               { id: 'gravar', label: 'Gravar', icon: '💾', action: () => gravarEntrada() },
               { id: 'limpar', label: 'Limpar', icon: '🧹', action: () => limparFormulario() },
               { id: 'retornar', label: 'Retornar', icon: '↩️', action: () => handleRetornar() }
             ].map((botao) => (
               <button
                 key={botao.id}
                 onClick={() => {
                   void botao.action()
                 }}
                 onMouseEnter={() => setHoveredButton(botao.id)}
                 onMouseLeave={() => {
                   setHoveredButton(null)
                   setActiveButton(null)
                 }}
                 onMouseDown={() => setActiveButton(botao.id)}
                 onMouseUp={() => setActiveButton(null)}
                 style={getActionButtonStyles(botao.id, false)}
               >
                 <span style={{ fontSize: '16px' }}>{botao.icon}</span>
                 <span>{botao.label}</span>
               </button>
             ))}
           </div>
         )}

        {/* Popup para editar Causa de Morte */}
        {mostrarPopupCausaMorte && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={cancelarCausasMorte}
          >
            <div
              style={{
                backgroundColor: theme.surface,
                borderRadius: '12px',
                padding: '24px',
                width: '600px',
                maxWidth: '90%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                border: `1px solid ${theme.border}`
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: theme.text, fontSize: '18px', fontWeight: 700 }}>
                  📋 Causa de Morte
                </h3>
                <p style={{ margin: '8px 0 0 0', color: theme.textSecondary, fontSize: '13px' }}>
                  Preencha até 6 causas de morte. Elas serão salvas separadas por ponto e vírgula (;)
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {causasMorteTemp.map((causa, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ ...labelStyle, marginBottom: '6px' }}>
                      Causa {index + 1}
                    </label>
                    <input
                      style={inputBaseStyle}
                      value={causa}
                      onChange={(e) => {
                        const novasCausas = [...causasMorteTemp]
                        novasCausas[index] = e.target.value
                        setCausasMorteTemp(novasCausas)
                      }}
                      placeholder={`Digite a causa ${index + 1}...`}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={cancelarCausasMorte}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.background,
                    color: theme.text,
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarCausasMorte}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  💾 Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BasePage>
  )
}