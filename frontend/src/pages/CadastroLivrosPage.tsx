/**
 * ====================================================================
 * CADASTRO DE LIVROS - SISTEMA DE GERENCIAMENTO DE LIVROS DE CARTÓRIO
 * ====================================================================
 * 
 * DESCRIÇÃO GERAL:
 * ----------------
 * Este módulo gerencia o cadastro e controle de livros de cartório,
 * incluindo tipos de livro, configurações e livros correntes (ativos).
 * 
 * ESTRUTURA DE 3 SUBMENUS:
 * ------------------------
 * 1. TIPO DE LIVRO:
 *    - Define os tipos de livros (A, B, C, D, E, etc.)
 *    - Cada tipo tem: Código, Índice (1-7), Tipo e Ato Livro
 *    - Exemplo: Livro A - Nascimento, Livro B - Casamento
 * 
 * 2. CONFIGURAÇÃO DE LIVRO:
 *    - Configura parâmetros para cada tipo de livro
 *    - Define: quantidade de folhas, numeração, desdobramento
 *    - Código é auto-preenchido baseado em livros ativos
 * 
 * 3. LIVROS CORRENTES:
 *    - Lista de livros ativos e encerrados
 *    - Controla uso de folhas e termos
 *    - Cria automaticamente o próximo livro ao encerrar
 * 
 * SISTEMA DE CÓDIGOS:
 * -------------------
 * - Código em "Tipo de Livro": identifica o tipo (1-7)
 * - Código em "Livros Correntes": auto-incrementa por tipo (0, 1, 2...)
 * - Primeiro livro: usuário define código inicial via popup
 * - Próximos livros: auto-incrementa automaticamente
 * 
 * SISTEMA DE TERMOS:
 * ------------------
 * - Termo é sequencial e contínuo entre livros do mesmo tipo
 * - Exemplo: Livro 1 termina no termo 50 → Livro 2 começa no termo 51
 * 
 * SISTEMA DE FOLHAS:
 * ------------------
 * - PÁGINA: numeração sequencial (1, 2, 3, 4...)
 * - FOLHAS: frente/verso (1F, 1V, 2F, 2V...)
 * 
 * VALIDAÇÕES:
 * -----------
 * - Livro Desdobrado = Sim: máximo 150 folhas
 * - Livro Desdobrado = Não: máximo 300 folhas
 * - Apenas 1 livro ativo por tipo permitido
 * - Livros encerrados não podem ser excluídos
 * 
 * PERSISTÊNCIA:
 * -------------
 * - Todos os dados são salvos em localStorage
 * - Sincronização automática entre submenus
 * 
 * ====================================================================
 */

import { useState, useEffect } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { Modal } from '../components/Modal'
import { useModal } from '../hooks/useModal'

/**
 * PROPS DO COMPONENTE
 */
interface CadastroLivrosPageProps {
  onClose: () => void
}

/**
 * INTERFACE: TipoLivro
 * --------------------
 * Define a estrutura de um tipo de livro (Livro A, B, C, etc.)
 * - codigo: identificador numérico do tipo (1-7)
 * - tipoLivroSeletor: letra do livro (A, B, C, etc.)
 * - indice: número do índice (1-7)
 * - atoLivro: descrição completa (ex: "Livro A - Nascimento")
 */
interface TipoLivro {
  id: string
  codigo: string
  tipoLivroSeletor: string
  indice: string
  atoLivro: string
}

/**
 * INTERFACE: ConfiguracaoLivro
 * ----------------------------
 * Define as configurações de um tipo de livro
 * - codigo: código do livro corrente correspondente
 * - quantidade: número total de folhas do livro
 * - livroDesdobrado: se "sim" limita a 150 folhas, se "não" limita a 300
 * - tipoNumeracao: "pagina" (sequencial) ou "folhas" (F/V)
 * - atosLivroE: atos específicos do Livro E (emancipação, interdição, etc.)
 */
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

/**
 * INTERFACE: LivroCorrente
 * ------------------------
 * Define um livro em uso (ativo) ou encerrado
 * - codigo: número sequencial do livro por tipo (0, 1, 2...)
 * - livro: número do livro físico (1, 2, 3...)
 * - termo: número sequencial de registro (contínuo entre livros)
 * - folhas: representação atual/total (ex: "1F / 300" ou "5 / 300")
 * - folhaAtual: número da folha atual
 * - ladoAtual: 'F' (frente) ou 'V' (verso) - apenas para tipo "folhas"
 * - encerrado: true quando atingir a última folha
 */
interface LivroCorrente {
  id: string
  codigo: string
  atoLivro: string
  tipo: string
  qtdeFolhas: string
  livro: string
  termo: string
  folhas: string
  folhaAtual: number
  folhaFinal: number
  tipoNumeracao: 'pagina' | 'folhas'
  ladoAtual: 'F' | 'V'
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
  const [editandoLivroId, setEditandoLivroId] = useState<string | null>(null)
  const [dadosEdicao, setDadosEdicao] = useState({
    livro: '',
    folhas: '',
    termo: ''
  })

  // Hook para modais internos
  const { modalState, showAlert, showConfirm, showPrompt, closeModal } = useModal()

  // Carregar dados do localStorage
  useEffect(() => {
    carregarDados()
  }, [])

  // Recarregar livros correntes quando mudar para o submenu
  useEffect(() => {
    if (activeSubmenu === 'correntes') {
      const livrosSaved = localStorage.getItem('livrosCorrente')
      if (livrosSaved) {
        try {
          setLivrosCorrente(JSON.parse(livrosSaved))
        } catch (error) {
          console.error('Erro ao recarregar livros correntes:', error)
        }
      }
    }
  }, [activeSubmenu])


  /**
   * FUNÇÃO: carregarDados
   * ---------------------
   * Carrega todos os dados salvos do localStorage ao iniciar o componente.
   * Carrega: tipos de livro e livros correntes.
   */
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

  /**
   * ====================================================================
   * FUNÇÕES DO SUBMENU 1: TIPO DE LIVRO
   * ====================================================================
   */

  /**
   * FUNÇÃO: handleNovoTipo
   * ----------------------
   * Limpa o formulário para cadastrar um novo tipo de livro.
   * Reseta todos os campos e desmarca seleção.
   */
  const handleNovoTipo = () => {
    setTipoForm({ codigo: '0', tipoLivroSeletor: '', indice: '', atoLivro: '' })
    setSelectedTipoId(null)
  }

  /**
   * FUNÇÃO: handleGravarTipo
   * ------------------------
   * Grava um novo tipo de livro ou atualiza um existente.
   * - Valida campos obrigatórios
   * - Auto-gera código sequencial para novos tipos
   * - Salva no localStorage
   * - Exibe mensagem de sucesso
   * - Prepara formulário para próximo cadastro
   */
  const handleGravarTipo = async () => {
    if (!tipoForm.tipoLivroSeletor || !tipoForm.indice || !tipoForm.atoLivro) {
      await showAlert('⚠️ Preencha todos os campos obrigatórios!')
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
    
    await showAlert(`✅ Tipo de livro salvo com sucesso!\n\nCódigo: ${codigoFinal}`)
    
    // Reset para próximo cadastro com código incrementado
    const proximoCodigo = parseInt(codigoFinal) + 1
    localStorage.setItem('ultimoCodigoTipoLivro', proximoCodigo.toString())
    setTipoForm({ codigo: proximoCodigo.toString(), tipoLivroSeletor: '', indice: '', atoLivro: '' })
    setSelectedTipoId(null)
  }

  /**
   * FUNÇÃO: handleExcluirTipo
   * -------------------------
   * Exclui um tipo de livro selecionado após confirmação.
   * - Valida se há tipo selecionado
   * - Solicita confirmação via modal
   * - Remove do localStorage
   * - Limpa formulário
   */
  const handleExcluirTipo = async () => {
    if (!selectedTipoId) {
      await showAlert('⚠️ Selecione um tipo de livro para excluir')
      return
    }

    const confirmado = await showConfirm('Tem certeza que deseja excluir este tipo de livro?')
    if (confirmado) {
      const tipos = tiposLivro.filter(t => t.id !== selectedTipoId)
      setTiposLivro(tipos)
      localStorage.setItem('tiposLivro', JSON.stringify(tipos))
      handleNovoTipo()
      await showAlert('✅ Tipo de livro excluído com sucesso!')
    }
  }

  /**
   * ====================================================================
   * FUNÇÕES DO SUBMENU 2: CONFIGURAÇÃO DE LIVRO
   * ====================================================================
   */

  /**
   * FUNÇÃO: handleGravarConfiguracao
   * ---------------------------------
   * Grava a configuração de um tipo de livro.
   * - Valida campos obrigatórios (Ato Livro e Quantidade)
   * - Salva/atualiza configuração no localStorage
   * - Atualiza livros ativos correspondentes (folhaFinal, quantidade, etc.)
   * - Exibe mensagem de sucesso
   * - Limpa formulário
   */
  const handleGravarConfiguracao = async () => {
    // Validação
    if (!configForm.atoLivro || !configForm.quantidade) {
      await showAlert('⚠️ Preencha os campos obrigatórios: Ato Livro e Quantidade!')
      return
    }
    
    if (configForm.codigo === '') {
      await showAlert('⚠️ Código não foi gerado! Selecione um Ato Livro.')
      return
    }
    
    // Salvar no localStorage
    const configSaved = localStorage.getItem('configuracoesLivro')
    const configs = configSaved ? JSON.parse(configSaved) : []
    
    // Garantir que temos um ID válido
    const configId = configForm.id || Date.now().toString()
    
    // Criar objeto completo com todos os campos
    const novaConfig: ConfiguracaoLivro = {
      id: configId,
      codigo: configForm.codigo,
      atoLivro: configForm.atoLivro,
      quantidade: configForm.quantidade,
      folhaInicial: configForm.folhaInicial || '',
      folhaInicialTipo: configForm.folhaInicialTipo || 'V',
      folhaFinal: configForm.folhaFinal || '',
      folhaFinalTipo: configForm.folhaFinalTipo || 'F',
      livroDesdobrado: configForm.livroDesdobrado || 'nao',
      tipoNumeracao: configForm.tipoNumeracao || 'folhas',
      atosLivroE: {
        ausencia: configForm.atosLivroE?.ausencia || false,
        interdicao: configForm.atosLivroE?.interdicao || false,
        emancipacao: configForm.atosLivroE?.emancipacao || false,
        uniaoEstavel: configForm.atosLivroE?.uniaoEstavel || false,
        opcaoNacionalidade: configForm.atosLivroE?.opcaoNacionalidade || false,
        transcricaoNascimento: configForm.atosLivroE?.transcricaoNascimento || false,
        transcricaoCasamento: configForm.atosLivroE?.transcricaoCasamento || false,
        transcricaoObito: configForm.atosLivroE?.transcricaoObito || false
      },
      ultimaNumLivro: configForm.ultimaNumLivro || '',
      ultimaNumTermo: configForm.ultimaNumTermo || '',
      ultimaNumFolhas: configForm.ultimaNumFolhas || '',
      ultimaNumFolhasTipo: configForm.ultimaNumFolhasTipo || 'V'
    }
    
    // Verificar se já existe por ID (edição) ou por código (evitar duplicatas)
    const indexPorId = configs.findIndex((c: any) => c.id === configId)
    const indexPorCodigo = configs.findIndex((c: any) => c.codigo === configForm.codigo && c.id !== configId)
    
    if (indexPorId >= 0) {
      // Atualizar configuração existente por ID
      configs[indexPorId] = novaConfig
    } else if (indexPorCodigo >= 0) {
      // Se existe por código mas com ID diferente, atualizar (evitar duplicatas)
      configs[indexPorCodigo] = novaConfig
    } else {
      // Nova configuração
      configs.push(novaConfig)
    }
    
    localStorage.setItem('configuracoesLivro', JSON.stringify(configs))
    
    // Atualizar livros ativos correspondentes
    const livrosSaved = localStorage.getItem('livrosCorrente')
    const livros = livrosSaved ? JSON.parse(livrosSaved) : []
    
    // Calcular folhaFinal baseado na configuração
    const folhaFinalNum = configForm.folhaFinal 
      ? parseInt(configForm.folhaFinal) 
      : parseInt(configForm.quantidade)
    
    
    // Atualizar livros ativos deste tipo de livro
    const livrosAtualizados = livros.map((livro: LivroCorrente) => {
      // Se o livro não está encerrado e tem o mesmo ato livro da configuração
      if (!livro.encerrado && livro.atoLivro === configForm.atoLivro) {
        // Recalcular string de folhas baseado no novo tipo de numeração
        let novaFolhas: string
        if (configForm.tipoNumeracao === 'pagina') {
          novaFolhas = `${livro.folhaAtual} / ${folhaFinalNum}`
        } else {
          // Para folhas, usar o lado atual (F ou V)
          novaFolhas = `${livro.folhaAtual}${livro.ladoAtual} / ${folhaFinalNum}`
        }
        
        return {
          ...livro,
          qtdeFolhas: configForm.quantidade,
          folhaFinal: folhaFinalNum,
          tipoNumeracao: configForm.tipoNumeracao,
          folhas: novaFolhas
        }
      }
      return livro
    })
    
    // Salvar livros atualizados
    localStorage.setItem('livrosCorrente', JSON.stringify(livrosAtualizados))
    
    // SEMPRE atualizar o estado, independente do submenu ativo
    setLivrosCorrente(livrosAtualizados)
    
    // Debug: mostrar quantos livros foram atualizados
    const livrosAtualizadosCount = livrosAtualizados.filter((l: LivroCorrente) => 
      !l.encerrado && l.atoLivro === configForm.atoLivro
    ).length
    
    console.log(`📚 ${livrosAtualizadosCount} livros ativos atualizados para ${configForm.atoLivro}`)
    
    await showAlert('✅ Configuração de livro salva com sucesso! Livros ativos atualizados.')
    handleCancelarConfiguracao()
  }

  /**
   * FUNÇÃO: handleCancelarConfiguracao
   * -----------------------------------
   * Cancela a edição da configuração e reseta o formulário para valores padrão.
   */
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

  /**
   * ====================================================================
   * FUNÇÕES DO SUBMENU 3: LIVROS CORRENTES
   * ====================================================================
   */

  /**
   * FUNÇÃO: verificarECriarProximoLivro
   * ------------------------------------
   * Verifica se um livro atingiu a última folha e cria automaticamente o próximo.
   * 
   * FLUXO:
   * ------
   * 1. Verifica se atingiu a última folha (considera tipo de numeração)
   * 2. Marca o livro atual como encerrado
   * 3. Calcula termo inicial (continua do último termo do livro anterior)
   * 4. Solicita código inicial (apenas se for o primeiro livro do tipo)
   * 5. Auto-incrementa código (se já houver livros deste tipo)
   * 6. Cria novo livro com código, livro nº, termo e folhas incrementados
   * 7. Salva no localStorage
   * 8. Exibe mensagem de sucesso
   * 
   * @param livroId - ID do livro a ser verificado
   */
  const verificarECriarProximoLivro = async (livroId: string) => {
    const livro = livrosCorrente.find(l => l.id === livroId)
    if (!livro || livro.encerrado) return
    
    // Buscar configuração para obter o tipo final
    const configSaved = localStorage.getItem('configuracoesLivro')
    const configs = configSaved ? JSON.parse(configSaved) : []
    const config = configs.find((c: any) => c.atoLivro === livro.atoLivro)
    const tipoFinal = config?.folhaFinalTipo || 'F'
    
    console.log(`🔍 Verificando livro ${livro.codigo}:`, {
      folhaAtual: livro.folhaAtual,
      folhaFinal: livro.folhaFinal,
      ladoAtual: livro.ladoAtual,
      tipoFinal: tipoFinal,
      tipoNumeracao: livro.tipoNumeracao
    })
    
    // Verificar se atingiu a última folha
    let atingiuFinal = false
    if (livro.tipoNumeracao === 'pagina') {
      // Para página: simplesmente compara o número
      atingiuFinal = livro.folhaAtual >= livro.folhaFinal
      console.log(`📄 Página: ${livro.folhaAtual} >= ${livro.folhaFinal} = ${atingiuFinal}`)
    } else {
      // Para folhas: precisa estar na última folha E no lado correto (V ou F conforme configurado)
      atingiuFinal = livro.folhaAtual >= livro.folhaFinal && livro.ladoAtual === tipoFinal
      console.log(`📄 Folhas: ${livro.folhaAtual} >= ${livro.folhaFinal} && ${livro.ladoAtual} === ${tipoFinal} = ${atingiuFinal}`)
    }
    
    // Se atingiu a última folha, encerrar e criar próximo
    if (atingiuFinal) {
      console.log(`✅ Livro ${livro.codigo} atingiu o final! Encerrando e criando próximo...`)
      
      // Encerrar livro atual
      const livrosAtualizados = livrosCorrente.map(l => 
        l.id === livroId ? { ...l, encerrado: true } : l
      )
      
      // Buscar configuração
      const configSaved = localStorage.getItem('configuracoesLivro')
      const configs = configSaved ? JSON.parse(configSaved) : []
      const config = configs.find((c: any) => c.atoLivro === livro.atoLivro)
      
      console.log(`🔧 Configuração encontrada:`, config)
      
      if (config) {
        // Criar próximo livro automaticamente
        const proximoNumeroLivro = parseInt(livro.livro) + 1
        const tipoNum = config.tipoNumeracao || 'folhas'
        const folhaInic = config.folhaInicial ? parseInt(config.folhaInicial) : 1
        const folhaFin = config.folhaFinal ? parseInt(config.folhaFinal) : parseInt(config.quantidade)
        const tipoInicial = config.folhaInicialTipo || 'V'
        
        console.log(`📚 Criando próximo livro:`, {
          proximoNumeroLivro,
          tipoNum,
          folhaInic,
          folhaFin,
          tipoInicial
        })
        
        // Determinar folhas iniciais baseado na configuração
        let folhasInicial: string
        let ladoInicial: 'F' | 'V'
        
        if (tipoNum === 'pagina') {
          folhasInicial = folhaInic.toString()
          ladoInicial = 'F'
        } else {
          // Para folhas, usar o tipo configurado (V ou F)
          ladoInicial = tipoInicial === 'V' ? 'V' : 'F'
          folhasInicial = `${folhaInic}${ladoInicial}`
        }
        
        // Verificar livros existentes deste tipo (incluindo encerrados)
        const livrosDoTipo = livrosAtualizados.filter(l => l.atoLivro === livro.atoLivro)
        
        // Calcular termo inicial: continuar numeração do último termo do livro anterior (encerrado) do mesmo tipo
        let termoInicial: string
        if (livrosDoTipo.length === 0) {
          // Primeiro livro deste tipo: começar em 1
          termoInicial = '1'
        } else {
          // Buscar o maior termo dos livros encerrados deste tipo
          const livrosEncerrados = livrosDoTipo.filter(l => l.encerrado)
          if (livrosEncerrados.length > 0) {
            const ultimoTermo = Math.max(...livrosEncerrados.map(l => parseInt(l.termo) || 0))
            termoInicial = (ultimoTermo + 1).toString()
          } else {
            // Se não houver livros encerrados, começar em 1
            termoInicial = '1'
          }
        }
        
        // Determinar código: se for o primeiro livro deste tipo (incluindo encerrados), solicitar via prompt; caso contrário, auto-incrementar
        let proximoCodigo: number
        
        if (livrosDoTipo.length === 0) {
          // Primeiro livro deste tipo: solicitar código inicial
          const codigoInicialInput = await showPrompt(
            `📚 Livro ${livro.tipo} nº ${livro.livro} ENCERRADO!\n\nInforme o código inicial para o próximo livro:\n\nTipo: ${livro.tipo}\nLivro: ${proximoNumeroLivro}\n\nDigite o número inicial do código:`,
            '',
            'Código Inicial'
          )
          
          // Validar se o usuário cancelou ou digitou algo inválido
          if (codigoInicialInput === null) {
            // Usuário cancelou - não criar o próximo livro
            await showAlert(`📚 Livro ${livro.tipo} nº ${livro.livro} ENCERRADO!\n\n⚠️ Criação do próximo livro cancelada pelo usuário.`)
            setLivrosCorrente(livrosAtualizados)
            localStorage.setItem('livrosCorrente', JSON.stringify(livrosAtualizados))
            return
          }
          
          const codigoInicial = parseInt(codigoInicialInput.trim())
          
          if (isNaN(codigoInicial) || codigoInicial < 0) {
            await showAlert('⚠️ Por favor, digite um número válido (0 ou maior)!')
            setLivrosCorrente(livrosAtualizados)
            localStorage.setItem('livrosCorrente', JSON.stringify(livrosAtualizados))
            return
          }
          
          proximoCodigo = codigoInicial
        } else {
          // Já existe pelo menos um livro: auto-incrementar baseado em TODOS os livros deste tipo (incluindo encerrados)
          proximoCodigo = Math.max(...livrosDoTipo.map(l => parseInt(l.codigo) || 0)) + 1
          console.log(`🔢 Código auto-incrementado para ${livro.atoLivro}: ${proximoCodigo}`)
        }
        
        // Verificar se o código já existe para este tipo
        const codigoExistente = livrosAtualizados.find(l => 
          l.atoLivro === livro.atoLivro && 
          parseInt(l.codigo) === proximoCodigo
        )
        
        if (codigoExistente) {
          await showAlert(`⚠️ Já existe um livro com código ${proximoCodigo} para este tipo!\n\nEscolha outro número.`)
          setLivrosCorrente(livrosAtualizados)
          localStorage.setItem('livrosCorrente', JSON.stringify(livrosAtualizados))
          return
        }
          
          const novoLivro: LivroCorrente = {
            id: Date.now().toString(),
            codigo: proximoCodigo.toString(),
            atoLivro: livro.atoLivro,
            tipo: livro.tipo,
          qtdeFolhas: config.quantidade,
          livro: proximoNumeroLivro.toString(),
          termo: termoInicial,
          folhas: folhasInicial,
          folhaAtual: folhaInic,
          folhaFinal: folhaFin,
          tipoNumeracao: tipoNum,
          ladoAtual: ladoInicial,
          encerrado: false
        }
        
        livrosAtualizados.push(novoLivro)
        console.log(`✅ Novo livro criado:`, novoLivro)
        await showAlert(`📚 Livro ${livro.tipo} nº ${livro.livro} ENCERRADO!\n✅ Livro ${livro.tipo} nº ${proximoNumeroLivro} criado automaticamente!\n📋 Código: ${proximoCodigo}`)
      } else {
        console.log(`❌ Configuração não encontrada para ${livro.atoLivro}`)
      }
      
      setLivrosCorrente(livrosAtualizados)
      localStorage.setItem('livrosCorrente', JSON.stringify(livrosAtualizados))
      console.log(`💾 Livros salvos no localStorage. Total: ${livrosAtualizados.length}`)
    } else {
      console.log(`❌ Livro ${livro.codigo} não atingiu o final ainda`)
    }
  }

  /**
   * FUNÇÃO: handleUsarFolha
   * -----------------------
   * Incrementa a folha e termo de um livro ativo.
   * 
   * COMPORTAMENTO:
   * --------------
   * - PÁGINA: incrementa número (1 → 2 → 3...)
   * - FOLHAS: alterna F/V (1F → 1V → 2F → 2V...)
   * - Termo sempre incrementa (+1)
   * - Verifica se atingiu última folha e cria próximo livro automaticamente
   * 
   * @param livroId - ID do livro a usar folha
   */
  const handleUsarFolha = async (livroId: string) => {
    const livro = livrosCorrente.find(l => l.id === livroId)
    if (!livro || livro.encerrado) {
      await showAlert('⚠️ Este livro está encerrado!')
      return
    }
    
    // Incrementar folha atual
    const livrosAtualizados = livrosCorrente.map(l => {
      if (l.id === livroId) {
        let novaFolhaAtual = l.folhaAtual
        let novoLado = l.ladoAtual
        let novasFolhas = l.folhas
        
        // Termo sempre incrementa como número sequencial
        const termoAtual = parseInt(l.termo) || 0
        const novoTermo = (termoAtual + 1).toString()
        
        if (l.tipoNumeracao === 'pagina') {
          // Numeração por PÁGINA: 1, 2, 3, 4, 5...
          novaFolhaAtual = l.folhaAtual + 1
          novasFolhas = novaFolhaAtual.toString()
        } else {
          // Numeração por FOLHAS: 1F, 1V, 2F, 2V, 3F, 3V...
          if (l.ladoAtual === 'F') {
            // Estava na frente, vai para o verso
            novoLado = 'V'
            novasFolhas = `${l.folhaAtual}V`
          } else {
            // Estava no verso, vai para a próxima frente
            novoLado = 'F'
            novaFolhaAtual = l.folhaAtual + 1
            novasFolhas = `${novaFolhaAtual}F`
          }
        }
        
        return {
          ...l,
          folhaAtual: novaFolhaAtual,
          ladoAtual: novoLado,
          folhas: novasFolhas,
          termo: novoTermo
        }
      }
      return l
    })
    
    setLivrosCorrente(livrosAtualizados)
    localStorage.setItem('livrosCorrente', JSON.stringify(livrosAtualizados))
    
    // Verificar se precisa criar próximo livro
    await verificarECriarProximoLivro(livroId)
  }

  /**
   * FUNÇÃO: handleAlterarLivro
   * ---------------------------
   * Ativa o modo de edição inline para o livro selecionado.
   * Permite editar: Livro Nº, Folhas e Termo diretamente na tabela.
   * 
   * RESTRIÇÕES:
   * -----------
   * - Livros encerrados não podem ser alterados
   */
  const handleAlterarLivro = async () => {
    if (!selectedLivroId) {
      await showAlert('⚠️ Selecione um livro para alterar')
      return
    }
    
    const livro = livrosCorrente.find(l => l.id === selectedLivroId)
    if (!livro) return
    
    if (livro.encerrado) {
      await showAlert('⚠️ Não é possível alterar um livro encerrado!')
      return
    }
    
    // Ativar modo de edição
    setEditandoLivroId(selectedLivroId)
    setDadosEdicao({
      livro: livro.livro,
      folhas: livro.folhas,
      termo: livro.termo
    })
  }

  /**
   * FUNÇÃO: handleSalvarEdicao
   * ---------------------------
   * Salva as alterações feitas inline no livro.
   * 
   * VALIDAÇÕES:
   * -----------
   * - Termo deve ser um número válido
   * - Folha não pode estar vazia
   * - PÁGINA: deve ser apenas número (ex: 15)
   * - FOLHAS: deve ser número + F ou V (ex: 15F ou 15V)
   */
  const handleSalvarEdicao = async () => {
    if (!editandoLivroId) return
    
    const livro = livrosCorrente.find(l => l.id === editandoLivroId)
    if (!livro) return
    
    // Validar termo
    if (!dadosEdicao.termo || isNaN(parseInt(dadosEdicao.termo))) {
      await showAlert('⚠️ Termo deve ser um número válido!')
      return
    }
    
    // Validar e extrair dados da folha
    let novaFolhaAtual: number
    let novoLado: 'F' | 'V' = livro.ladoAtual
    const novaFolha = dadosEdicao.folhas.trim()
    
    if (!novaFolha) {
      await showAlert('⚠️ Folha não pode estar vazia!')
      return
    }
    
    if (livro.tipoNumeracao === 'pagina') {
      // Para página, deve ser apenas número
      novaFolhaAtual = parseInt(novaFolha)
      if (isNaN(novaFolhaAtual)) {
        await showAlert('⚠️ Para numeração por PÁGINA, digite apenas o número (ex: 15)')
        return
      }
    } else {
      // Para folhas, deve ser número + F ou V
      const match = novaFolha.match(/^(\d+)([FV])$/i)
      if (!match) {
        await showAlert('⚠️ Para numeração por FOLHAS, digite número + F ou V (ex: 15F ou 15V)')
        return
      }
      novaFolhaAtual = parseInt(match[1])
      novoLado = match[2].toUpperCase() as 'F' | 'V'
    }
    
    // Atualizar livro
    const livrosAtualizados = livrosCorrente.map(l => {
      if (l.id === editandoLivroId) {
        return {
          ...l,
          livro: dadosEdicao.livro,
          termo: dadosEdicao.termo,
          folhas: novaFolha,
          folhaAtual: novaFolhaAtual,
          ladoAtual: novoLado
        }
      }
      return l
    })
    
    setLivrosCorrente(livrosAtualizados)
    localStorage.setItem('livrosCorrente', JSON.stringify(livrosAtualizados))
    setEditandoLivroId(null)
    await showAlert('✅ Livro alterado com sucesso!')
  }

  /**
   * FUNÇÃO: handleCancelarEdicao
   * -----------------------------
   * Cancela a edição inline e descarta as alterações.
   */
  const handleCancelarEdicao = () => {
    setEditandoLivroId(null)
    setDadosEdicao({ livro: '', folhas: '', termo: '' })
  }

  /**
   * FUNÇÃO: handleEditarConfiguracao
   * ---------------------------------
   * Abre a configuração do tipo de livro correspondente ao livro selecionado.
   * - Busca a configuração pelo atoLivro
   * - Carrega todos os dados no formulário de configuração
   * - Muda para o submenu "Configuração de Livro"
   */
  const handleEditarConfiguracao = async () => {
    if (!selectedLivroId) {
      await showAlert('⚠️ Selecione um livro para editar a configuração')
      return
    }

    const livro = livrosCorrente.find(l => l.id === selectedLivroId)
    if (!livro) return

    // Buscar configuração correspondente ao tipo de livro (atoLivro)
    const configSaved = localStorage.getItem('configuracoesLivro')
    const configs = configSaved ? JSON.parse(configSaved) : []
    const config = configs.find((c: any) => c.atoLivro === livro.atoLivro)

    if (!config) {
      await showAlert('⚠️ Configuração não encontrada para este livro!')
      return
    }

    // Carregar configuração no formulário
    // Atualizar código para o código do livro ATIVO deste tipo
    const livrosAtivosDoTipo = livrosCorrente.filter(l => l.atoLivro === livro.atoLivro && !l.encerrado)
    const proximoCodigo = livrosAtivosDoTipo.length > 0
      ? Math.max(...livrosAtivosDoTipo.map(l => parseInt(l.codigo) || 0))
      : (livrosCorrente.filter(l => l.atoLivro === livro.atoLivro).length > 0
          ? Math.max(...livrosCorrente.filter(l => l.atoLivro === livro.atoLivro).map(l => parseInt(l.codigo) || 0)) + 1
          : 0) // Primeiro livro deste tipo começa com 0
    
    setConfigForm({
      id: config.id,
      codigo: proximoCodigo.toString(), // Código do livro ativo ou próximo disponível
      atoLivro: config.atoLivro,
      quantidade: config.quantidade,
      folhaInicial: config.folhaInicial,
      folhaInicialTipo: config.folhaInicialTipo,
      folhaFinal: config.folhaFinal,
      folhaFinalTipo: config.folhaFinalTipo,
      livroDesdobrado: config.livroDesdobrado,
      tipoNumeracao: config.tipoNumeracao,
      atosLivroE: config.atosLivroE,
      ultimaNumLivro: config.ultimaNumLivro || '',
      ultimaNumTermo: config.ultimaNumTermo || '',
      ultimaNumFolhas: config.ultimaNumFolhas || '',
      ultimaNumFolhasTipo: config.ultimaNumFolhasTipo || 'V'
    })

    // Mudar para o submenu de configuração
    setActiveSubmenu('configuracao')
    setSelectedLivroId(null)
  }

  /**
   * FUNÇÃO: handleExcluirLivro
   * ---------------------------
   * Exclui um livro corrente selecionado após confirmação.
   * 
   * RESTRIÇÕES:
   * -----------
   * - Livros encerrados não podem ser excluídos (proteção de dados históricos)
   * - Requer confirmação do usuário
   */
  const handleExcluirLivro = async () => {
    if (!selectedLivroId) {
      await showAlert('⚠️ Selecione um livro para excluir')
      return
    }

    // Verificar se o livro está encerrado
    const livroSelecionado = livrosCorrente.find(l => l.id === selectedLivroId)
    if (livroSelecionado?.encerrado) {
      await showAlert('⚠️ Não é possível excluir um livro encerrado!')
      return
    }

    const confirmado = await showConfirm('Tem certeza que deseja excluir este livro?')
    if (confirmado) {
      const livros = livrosCorrente.filter(l => l.id !== selectedLivroId)
      setLivrosCorrente(livros)
      localStorage.setItem('livrosCorrente', JSON.stringify(livros))
      setSelectedLivroId(null)
      await showAlert('✅ Livro excluído com sucesso!')
    }
  }

  /**
   * ====================================================================
   * ESTILOS DO COMPONENTE
   * ====================================================================
   */
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

  const getSelectStyles = (fieldName: string) => {
    // Cor da seta adaptada ao tema
    const arrowColor = currentTheme === 'dark' ? 'cccccc' : '333333'
    return {
      ...getInputStyles(fieldName),
      appearance: 'none' as const,
      WebkitAppearance: 'none' as const,
      MozAppearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23${arrowColor}' d='M1 1 L6 6 L11 1'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 8px center',
      backgroundSize: '12px 8px',
      paddingRight: '28px'
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
      height="550px"
      minWidth="900px"
      minHeight="550px"
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: theme.text, fontSize: '16px', fontWeight: 'bold' }}>
                  Cadastro de Tipo de Livro
                </h2>
                <button
                  onClick={async () => {
                    const atosAutomaticos = [
                      { indice: '1', tipo: 'A', ato: 'Livro A - Nascimento' },
                      { indice: '2', tipo: 'B', ato: 'Livro B - Casamento' },
                      { indice: '3', tipo: 'B Auxiliar', ato: 'Livro B Auxiliar - Casamento Religioso para Efeitos Civis' },
                      { indice: '4', tipo: 'C', ato: 'Livro C - Óbito' },
                      { indice: '5', tipo: 'C Auxiliar', ato: 'Livro C Auxiliar - Natimorto' },
                      { indice: '6', tipo: 'D', ato: 'Livro D - Proclamas' },
                      { indice: '7', tipo: 'E', ato: 'Livro E - Outros Atos (Emancipação, Interdição, etc.)' }
                    ]
                    
                    const confirmado = await showConfirm('Deseja gerar automaticamente os 7 tipos de livro padrão? Isso irá sobrescrever os registros existentes.')
                    if (confirmado) {
                      const novosAtos = atosAutomaticos.map((ato, index) => ({
                        id: Date.now().toString() + index,
                        codigo: (index + 1).toString(),
                        tipoLivroSeletor: ato.tipo,
                        indice: ato.indice,
                        atoLivro: ato.ato
                      }))
                      
                      setTiposLivro(novosAtos)
                      localStorage.setItem('tiposLivro', JSON.stringify(novosAtos))
                      localStorage.setItem('ultimoCodigoTipoLivro', '7')
                      
                      handleNovoTipo()
                      await showAlert('✅ 7 tipos de livro gerados automaticamente com sucesso!')
                    }
                  }}
                  disabled={tiposLivro.length >= 7}
                  style={{
                    ...buttonStyles,
                    backgroundColor: tiposLivro.length >= 7 ? '#6c757d' : '#16a34a',
                    color: 'white',
                    fontSize: '11px',
                    padding: '4px 12px',
                    cursor: tiposLivro.length >= 7 ? 'not-allowed' : 'pointer',
                    opacity: tiposLivro.length >= 7 ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (tiposLivro.length < 7) {
                      e.currentTarget.style.backgroundColor = '#15803d'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (tiposLivro.length < 7) {
                      e.currentTarget.style.backgroundColor = '#16a34a'
                    }
                  }}
                  title={tiposLivro.length >= 7 ? 'Os 7 tipos de livro já foram gerados' : 'Gerar os 7 tipos de livro automaticamente'}
                >
                  ⚡ Gerar Atos Automáticos
                </button>
              </div>
              
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
                <div style={{ width: '100px', display: 'flex', flexDirection: 'column' }}>
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
                      cursor: 'not-allowed'
                    }}
                    title="Código gerado automaticamente"
                  />
                </div>
                <div style={{ width: '100px', display: 'flex', flexDirection: 'column' }}>
                  <label style={labelStyles}>Índice *</label>
                  <select
                    value={tipoForm.indice}
                    onChange={(e) => {
                      const selectedIndice = e.target.value
                      let tipoLivro = ''
                      
                      // Mapear índice para tipo de livro
                      switch(selectedIndice) {
                        case '1':
                          tipoLivro = 'A'
                          break
                        case '2':
                          tipoLivro = 'B'
                          break
                        case '3':
                          tipoLivro = 'B Auxiliar'
                          break
                        case '4':
                          tipoLivro = 'C'
                          break
                        case '5':
                          tipoLivro = 'C Auxiliar'
                          break
                        case '6':
                          tipoLivro = 'D'
                          break
                        case '7':
                          tipoLivro = 'E'
                          break
                      }
                      
                      setTipoForm({ 
                        ...tipoForm, 
                        indice: selectedIndice,
                        tipoLivroSeletor: tipoLivro
                      })
                    }}
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
                <div style={{ width: '180px', display: 'flex', flexDirection: 'column' }}>
                  <label style={labelStyles}>Tipo de Livro *</label>
                  <input
                    type="text"
                    value={tipoForm.tipoLivroSeletor}
                    readOnly
                    disabled
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
                      cursor: 'not-allowed'
                    }}
                    placeholder="Selecione o índice"
                    title="Preenchido automaticamente ao selecionar o Índice"
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
              
              {/* Linha 1: Código/Ato Livro (esquerda) + Configurações (direita em caixa) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 400px',
                gap: '12px',
                alignItems: 'start'
              }}>
                {/* Coluna Esquerda: Código e Ato Livro */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
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
                        
                        // Buscar o código do livro ATIVO deste tipo (se não houver ativo, pegar o maior + 1)
                        const livrosAtivosDoTipo = livrosCorrente.filter(l => l.atoLivro === selectedAtoLivro && !l.encerrado)
                        const proximoCodigo = livrosAtivosDoTipo.length > 0
                          ? Math.max(...livrosAtivosDoTipo.map(l => parseInt(l.codigo) || 0))
                          : (livrosCorrente.filter(l => l.atoLivro === selectedAtoLivro).length > 0
                              ? Math.max(...livrosCorrente.filter(l => l.atoLivro === selectedAtoLivro).map(l => parseInt(l.codigo) || 0)) + 1
                              : 0) // Primeiro livro deste tipo começa com 0
                        
                        setConfigForm({ 
                          ...configForm, 
                          atoLivro: selectedAtoLivro,
                          codigo: proximoCodigo.toString()
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
                </div>

                {/* Coluna Direita: Livro Desdobrado e Tipo Numeração */}
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
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        cursor: (!configForm.codigo || configForm.codigo === '') ? 'not-allowed' : 'pointer', 
                        color: (!configForm.codigo || configForm.codigo === '') ? '#6b7280' : theme.text,
                        opacity: (!configForm.codigo || configForm.codigo === '') ? 0.5 : 1
                      }}>
                        <input
                          type="radio"
                          checked={configForm.livroDesdobrado === 'sim'}
                          onChange={async () => {
                            const quantidadeAtual = parseInt(configForm.quantidade) || 0
                            if (quantidadeAtual > 150) {
                              await showAlert(`⚠️ A quantidade atual (${quantidadeAtual}) excede o limite máximo para Livro Desdobrado (150)!\n\nA quantidade será ajustada para 150.`)
                              setConfigForm({ 
                                ...configForm, 
                                livroDesdobrado: 'sim',
                                quantidade: '150',
                                folhaFinal: '150'
                              })
                            } else {
                              setConfigForm({ ...configForm, livroDesdobrado: 'sim' })
                            }
                          }}
                          disabled={!configForm.codigo || configForm.codigo === ''}
                        />
                        Sim
                      </label>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        cursor: (!configForm.codigo || configForm.codigo === '') ? 'not-allowed' : 'pointer', 
                        color: (!configForm.codigo || configForm.codigo === '') ? '#6b7280' : theme.text,
                        opacity: (!configForm.codigo || configForm.codigo === '') ? 0.5 : 1
                      }}>
                        <input
                          type="radio"
                          checked={configForm.livroDesdobrado === 'nao'}
                          onChange={() => setConfigForm({ ...configForm, livroDesdobrado: 'nao' })}
                          disabled={!configForm.codigo || configForm.codigo === ''}
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
              </div>

              {/* Linha 2: Quantidade, Folha Inicial e Folha Final */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '120px 140px 140px',
                gap: '12px',
                alignItems: 'end'
              }}>
                <div>
                  <label style={labelStyles}>Quantidade</label>
                  <input
                    type="number"
                    value={configForm.quantidade}
                    min="1"
                    max={configForm.livroDesdobrado === 'sim' ? 150 : 300}
                    onChange={async (e) => {
                      const quantidade = e.target.value
                      const quantidadeNum = parseInt(quantidade)
                      const limiteMaximo = configForm.livroDesdobrado === 'sim' ? 150 : 300
                      
                      // Validar limite máximo
                      if (quantidade && !isNaN(quantidadeNum)) {
                        if (quantidadeNum > limiteMaximo) {
                          await showAlert(`⚠️ A quantidade máxima permitida é ${limiteMaximo} ${configForm.livroDesdobrado === 'sim' ? '(Livro Desdobrado)' : '(Livro Não Desdobrado)'}!`)
                          return
                        }
                        if (quantidadeNum < 1) {
                          await showAlert('⚠️ A quantidade deve ser no mínimo 1!')
                          return
                        }
                      }
                      
                      // Atualizar quantidade e automaticamente preencher folha inicial/final
                      setConfigForm({ 
                        ...configForm, 
                        quantidade,
                        folhaInicial: quantidade ? '1' : '',
                        folhaFinal: quantidade
                      })
                    }}
                    onFocus={() => setFocusedField('quantidade')}
                    onBlur={() => setFocusedField(null)}
                    style={getInputStyles('quantidade')}
                    title={configForm.livroDesdobrado === 'sim' ? 'Quantidade máxima: 150 (Livro Desdobrado)' : 'Quantidade máxima: 300 (Livro Não Desdobrado)'}
                  />
                </div>
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
                    disabled={configForm.tipoNumeracao === 'pagina'}
                    style={{ 
                      ...getSelectStyles('folhaInicialTipo'), 
                      width: '60px',
                      opacity: configForm.tipoNumeracao === 'pagina' ? 0.5 : 1,
                      cursor: configForm.tipoNumeracao === 'pagina' ? 'not-allowed' : 'pointer'
                    }}
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
                    disabled={configForm.tipoNumeracao === 'pagina'}
                    style={{ 
                      ...getSelectStyles('folhaFinalTipo'), 
                      width: '60px',
                      opacity: configForm.tipoNumeracao === 'pagina' ? 0.5 : 1,
                      cursor: configForm.tipoNumeracao === 'pagina' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <option value="V">V</option>
                    <option value="F">F</option>
                  </select>
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
              
              {/* Formulário de Seleção */}
              <div style={{
                padding: '12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '4px',
                backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#f9f9f9'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyles}>Selecione o Tipo de Livro *</label>
                    <select
                      value=""
                      onChange={async (e) => {
                        const tipoSelecionado = tiposLivro.find(t => t.id === e.target.value)
                        if (tipoSelecionado) {
                          // Verificar se já existe um livro ATIVO deste tipo
                          const livroAtivoDoTipo = livrosCorrente.find(l => 
                            l.atoLivro === tipoSelecionado.atoLivro && !l.encerrado
                          )
                          
                          if (livroAtivoDoTipo) {
                            await showAlert(`⚠️ Já existe um livro ativo do tipo ${tipoSelecionado.tipoLivroSeletor}!\n\nApenas 1 livro por tipo pode estar ativo por vez.\nO próximo livro será criado automaticamente quando o atual atingir sua última folha.`)
                            return
                          }
                          
                          // Buscar configuração correspondente
                          const configSaved = localStorage.getItem('configuracoesLivro')
                          const configs = configSaved ? JSON.parse(configSaved) : []
                          const config = configs.find((c: any) => c.atoLivro === tipoSelecionado.atoLivro)
                          
                          if (!config) {
                            await showAlert('⚠️ Configure este tipo de livro antes de criar um livro corrente!')
                            return
                          }
                          
                          // Verificar quantos livros já existem deste tipo (incluindo encerrados)
                          const livrosDoTipo = livrosCorrente.filter(l => l.atoLivro === tipoSelecionado.atoLivro)
                          const proximoNumeroLivro = livrosDoTipo.length + 1
                          
                          // Determinar código: se for o primeiro livro deste tipo, solicitar via prompt; caso contrário, auto-incrementar
                          let proximoCodigo: number
                          
                          if (livrosDoTipo.length === 0) {
                            // Primeiro livro deste tipo: solicitar código inicial
                            const codigoInicialInput = await showPrompt(
                              `📚 Informe o código inicial para o livro:\n\nTipo: ${tipoSelecionado.tipoLivroSeletor} - ${tipoSelecionado.atoLivro}\n\nDigite o número inicial do código:`,
                              '',
                              'Código Inicial'
                            )
                            
                            // Validar se o usuário cancelou ou digitou algo inválido
                            if (codigoInicialInput === null) {
                              // Usuário cancelou
                              return
                            }
                            
                            const codigoInicial = parseInt(codigoInicialInput.trim())
                            
                            if (isNaN(codigoInicial) || codigoInicial < 0) {
                              await showAlert('⚠️ Por favor, digite um número válido (0 ou maior)!')
                              return
                            }
                            
                            proximoCodigo = codigoInicial
                          } else {
                            // Já existe pelo menos um livro: auto-incrementar
                            proximoCodigo = Math.max(...livrosDoTipo.map(l => parseInt(l.codigo) || 0)) + 1
                          }
                          
                          // Verificar se o código já existe para este tipo
                          const codigoExistente = livrosCorrente.find(l => 
                            l.atoLivro === tipoSelecionado.atoLivro && 
                            parseInt(l.codigo) === proximoCodigo
                          )
                          
                          if (codigoExistente) {
                            await showAlert(`⚠️ Já existe um livro com código ${proximoCodigo} para este tipo!\n\nEscolha outro número.`)
                            return
                          }
                          
                          // Criar novo livro corrente
                          const tipoNum = config.tipoNumeracao || 'folhas'
                          const folhaInic = config.folhaInicial ? parseInt(config.folhaInicial) : 1
                          const folhaFin = config.folhaFinal ? parseInt(config.folhaFinal) : parseInt(config.quantidade)
                          const tipoInicial = config.folhaInicialTipo || 'V'
                          
                          // Calcular termo inicial: continuar numeração do último termo do livro anterior (encerrado) do mesmo tipo
                          const livrosDoTipoParaTermo = livrosCorrente.filter(l => l.atoLivro === tipoSelecionado.atoLivro)
                          let termoInicial: string
                          if (livrosDoTipoParaTermo.length === 0) {
                            // Primeiro livro deste tipo: começar em 1
                            termoInicial = '1'
                          } else {
                            // Buscar o maior termo dos livros encerrados deste tipo
                            const livrosEncerrados = livrosDoTipoParaTermo.filter(l => l.encerrado)
                            if (livrosEncerrados.length > 0) {
                              const ultimoTermo = Math.max(...livrosEncerrados.map(l => parseInt(l.termo) || 0))
                              termoInicial = (ultimoTermo + 1).toString()
                            } else {
                              // Se não houver livros encerrados, começar em 1
                              termoInicial = '1'
                            }
                          }
                          
                          // Determinar folhas iniciais baseado na configuração
                          let folhasInicial: string
                          let ladoInicial: 'F' | 'V'
                          
                          if (tipoNum === 'pagina') {
                            folhasInicial = folhaInic.toString()
                            ladoInicial = 'F'
                          } else {
                            // Para folhas, usar o tipo configurado (V ou F)
                            ladoInicial = tipoInicial === 'V' ? 'V' : 'F'
                            folhasInicial = `${folhaInic}${ladoInicial}`
                          }
                          
                          const novoLivro: LivroCorrente = {
                            id: Date.now().toString(),
                            codigo: proximoCodigo.toString(),
                            atoLivro: tipoSelecionado.atoLivro,
                            tipo: tipoSelecionado.tipoLivroSeletor,
                            qtdeFolhas: config.quantidade,
                            livro: proximoNumeroLivro.toString(),
                            termo: termoInicial,
                            folhas: folhasInicial,
                            folhaAtual: folhaInic,
                            folhaFinal: folhaFin,
                            tipoNumeracao: tipoNum,
                            ladoAtual: ladoInicial,
                            encerrado: false
                          }
                          
                          const novosLivros = [...livrosCorrente, novoLivro]
                          setLivrosCorrente(novosLivros)
                          localStorage.setItem('livrosCorrente', JSON.stringify(novosLivros))
                          await showAlert(`✅ Livro ${tipoSelecionado.tipoLivroSeletor} nº ${proximoNumeroLivro} criado com sucesso!\n📋 Código: ${proximoCodigo}`)
                        }
                      }}
                      style={{
                        ...getSelectStyles('tipoLivroCorrente'),
                        fontSize: '13px'
                      }}
                    >
                      <option value="">Selecione...</option>
                      {tiposLivro.map((tipo) => {
                        // Verificar se já existe livro ativo deste tipo
                        const temLivroAtivo = livrosCorrente.some(l => 
                          l.codigo === tipo.codigo && !l.encerrado
                        )
                        return (
                          <option 
                            key={tipo.id} 
                            value={tipo.id}
                            disabled={temLivroAtivo}
                            style={{
                              color: temLivroAtivo ? '#999' : 'inherit',
                              fontStyle: temLivroAtivo ? 'italic' : 'normal'
                            }}
                          >
                            {tipo.indice} - {tipo.atoLivro} {temLivroAtivo ? '(Já possui livro ativo)' : ''}
                          </option>
                        )
                      })}
                    </select>
                  </div>
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
                      <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600', width: '60px' }}>Código</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600' }}>Ato Livro</th>
                      <th style={{ padding: '8px', textAlign: 'center', color: theme.text, fontWeight: '600', width: '60px' }}>Tipo Numeração</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600', width: '60px' }}>Livro Nº</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600', width: '120px' }}>Folha Atual/Total</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600', width: '60px' }}>Termo</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: theme.text, fontWeight: '600', width: '80px' }}>Status</th>
                      <th style={{ padding: '8px', textAlign: 'center', color: theme.text, fontWeight: '600', width: '100px' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {livrosCorrente.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{
                          padding: '32px',
                          textAlign: 'center',
                          color: theme.text,
                          fontStyle: 'italic'
                        }}>
                          Nenhum livro corrente cadastrado
                        </td>
                      </tr>
                    ) : (
                      livrosCorrente
                        .sort((a, b) => {
                          // Livros ativos primeiro, encerrados depois
                          if (a.encerrado === b.encerrado) return 0
                          return a.encerrado ? 1 : -1
                        })
                        .map((livro) => (
                        <tr
                          key={livro.id}
                          onClick={() => setSelectedLivroId(livro.id)}
                        style={{
                          backgroundColor: selectedLivroId === livro.id
                            ? (currentTheme === 'dark' ? '#3b82f6' : '#60a5fa')
                            : (livro.encerrado 
                                ? '#dc2626'
                                : 'transparent'
                              ),
                          borderBottom: `1px solid ${theme.border}`,
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedLivroId !== livro.id && !livro.encerrado) {
                            e.currentTarget.style.backgroundColor = currentTheme === 'dark' ? '#2a2a2a' : '#e0e0e0'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedLivroId !== livro.id) {
                            e.currentTarget.style.backgroundColor = livro.encerrado ? '#dc2626' : 'transparent'
                          }
                        }}
                      >
                        <td style={{ padding: '8px', color: (selectedLivroId === livro.id || livro.encerrado) ? '#fff' : theme.text }}>{livro.codigo}</td>
                        <td style={{ padding: '8px', color: (selectedLivroId === livro.id || livro.encerrado) ? '#fff' : theme.text }}>{livro.atoLivro}</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: (selectedLivroId === livro.id || livro.encerrado) ? '#fff' : theme.text, fontWeight: 'bold' }}>
                          {livro.tipoNumeracao === 'pagina' ? 'P' : 'F'}
                        </td>
                        <td style={{ padding: '4px' }} onClick={(e) => e.stopPropagation()}>
                          {editandoLivroId === livro.id ? (
                            <input
                              type="text"
                              value={dadosEdicao.livro}
                              onChange={(e) => setDadosEdicao({ ...dadosEdicao, livro: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '2px 4px',
                                fontSize: '11px',
                                border: '1px solid #3b82f6',
                                borderRadius: '3px',
                                textAlign: 'center'
                              }}
                            />
                          ) : (
                            <span style={{ color: (selectedLivroId === livro.id || livro.encerrado) ? '#fff' : theme.text }}>
                              {livro.livro}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '4px' }} onClick={(e) => e.stopPropagation()}>
                          {editandoLivroId === livro.id ? (
                            <input
                              type="text"
                              value={dadosEdicao.folhas}
                              onChange={(e) => setDadosEdicao({ ...dadosEdicao, folhas: e.target.value })}
                              placeholder={livro.tipoNumeracao === 'pagina' ? '15' : '15F'}
                              style={{
                                width: '100%',
                                padding: '2px 4px',
                                fontSize: '11px',
                                border: '1px solid #3b82f6',
                                borderRadius: '3px',
                                textAlign: 'center'
                              }}
                            />
                          ) : (
                            <span style={{ color: (selectedLivroId === livro.id || livro.encerrado) ? '#fff' : theme.text }}>
                              {livro.tipoNumeracao === 'pagina' 
                                ? `${livro.folhaAtual} / ${livro.folhaFinal}` 
                                : `${livro.folhaAtual}${livro.ladoAtual} / ${livro.folhaFinal}`
                              }
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '4px' }} onClick={(e) => e.stopPropagation()}>
                          {editandoLivroId === livro.id ? (
                            <input
                              type="text"
                              value={dadosEdicao.termo}
                              onChange={(e) => setDadosEdicao({ ...dadosEdicao, termo: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '2px 4px',
                                fontSize: '11px',
                                border: '1px solid #3b82f6',
                                borderRadius: '3px',
                                textAlign: 'center'
                              }}
                            />
                          ) : (
                            <span style={{ color: (selectedLivroId === livro.id || livro.encerrado) ? '#fff' : theme.text }}>
                              {livro.termo}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '8px', color: (selectedLivroId === livro.id || livro.encerrado) ? '#fff' : theme.text }}>
                          {livro.encerrado ? '🔴 Encerrado' : '🟢 Ativo'}
                        </td>
                        <td style={{ padding: '4px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleUsarFolha(livro.id)}
                            disabled={livro.encerrado}
                            style={{
                              padding: '4px 8px',
                              fontSize: '10px',
                              backgroundColor: livro.encerrado ? '#666' : '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: livro.encerrado ? 'not-allowed' : 'pointer',
                              opacity: livro.encerrado ? 0.5 : 1
                            }}
                          >
                            📄 Usar Folha
                          </button>
                        </td>
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
                gap: '16px',
                padding: '8px',
                backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#f9f9f9',
                borderRadius: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#10b981',
                    border: `1px solid ${theme.border}`
                  }}></div>
                  <span style={{ fontSize: '11px', color: theme.text }}>Livro Ativo</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#dc2626',
                    border: `1px solid ${theme.border}`
                  }}></div>
                  <span style={{ fontSize: '11px', color: theme.text }}>Livro Encerrado</span>
                </div>
              </div>

              {/* Botões */}
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                paddingTop: '8px',
                borderTop: `1px solid ${theme.border}`
              }}>
                {editandoLivroId ? (
                  <>
                    <button
                      onClick={handleSalvarEdicao}
                      style={{
                        ...buttonStyles,
                        backgroundColor: '#10b981',
                        color: 'white'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#059669'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#10b981'
                      }}
                    >
                      💾 Salvar
                    </button>
                    <button
                      onClick={handleCancelarEdicao}
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
                      ❌ Cancelar
                    </button>
                  </>
                ) : (
                  <>
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
                      onClick={handleEditarConfiguracao}
                      disabled={!selectedLivroId}
                      style={{
                        ...buttonStyles,
                        backgroundColor: selectedLivroId ? '#f59e0b' : '#4b5563',
                        color: 'white',
                        cursor: selectedLivroId ? 'pointer' : 'not-allowed',
                        opacity: selectedLivroId ? 1 : 0.5
                      }}
                      onMouseEnter={(e) => {
                        if (selectedLivroId) e.currentTarget.style.backgroundColor = '#d97706'
                      }}
                      onMouseLeave={(e) => {
                        if (selectedLivroId) e.currentTarget.style.backgroundColor = '#f59e0b'
                      }}
                    >
                      ⚙️ Editar Configuração
                    </button>
                    <button
                      onClick={handleExcluirLivro}
                      disabled={!selectedLivroId || livrosCorrente.find(l => l.id === selectedLivroId)?.encerrado}
                      style={{
                        ...buttonStyles,
                        backgroundColor: (selectedLivroId && !livrosCorrente.find(l => l.id === selectedLivroId)?.encerrado) ? '#dc2626' : '#4b5563',
                        color: 'white',
                        cursor: (selectedLivroId && !livrosCorrente.find(l => l.id === selectedLivroId)?.encerrado) ? 'pointer' : 'not-allowed',
                        opacity: (selectedLivroId && !livrosCorrente.find(l => l.id === selectedLivroId)?.encerrado) ? 1 : 0.5
                      }}
                      onMouseEnter={(e) => {
                        if (selectedLivroId && !livrosCorrente.find(l => l.id === selectedLivroId)?.encerrado) {
                          e.currentTarget.style.backgroundColor = '#b91c1c'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedLivroId && !livrosCorrente.find(l => l.id === selectedLivroId)?.encerrado) {
                          e.currentTarget.style.backgroundColor = '#dc2626'
                        }
                      }}
                    >
                      ❌ Excluir
                    </button>
                  </>
                )}
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
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        defaultValue={modalState.defaultValue}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.onCancel}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        icon={modalState.icon}
      />
    </BasePage>
  )
}

