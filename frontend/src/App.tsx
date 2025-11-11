import { useState, useEffect, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MaternidadePage } from './pages/MaternidadePage'
import { ConfiguracoesPage } from './pages/ConfiguracoesPage'
import { AccessibilitySettingsPage } from './pages/AccessibilitySettingsPage'
import { NavigationManager } from './components/NavigationManager'
import { FeedbackSystem } from './components/FeedbackSystem'
import { WindowControls } from './components/WindowControls'
import { TextualMenu } from './components/TextualMenu'
import { IconMenu } from './components/IconMenu'
import { ProtectedMenu } from './components/ProtectedMenu'
import { SideMenu } from './components/SideMenu'
import { ConfigOverlay } from './components/ConfigOverlay'
import { PasswordPrompt } from './components/PasswordPrompt'
import { MovableTabs } from './components/MovableTabs'
import { ErrorBoundary } from './components/ErrorBoundary'
// 🏗️ MICRO-FRONTENDS: Imports isolados com ErrorBoundary e Lazy Loading
import { 
  ClientePageIsolated,
  FuncionarioPageIsolated,
  FirmasPageIsolated,
  TiposCadastroPageIsolated,
  LocalizacaoCadastroPageIsolated,
  RecepcaoArquivoFunerariaPageIsolated,
  RecepcaoArquivoMaternidadePageIsolated,
  RecepcaoArquivosPageIsolated,
  FeriadosPageIsolated,
  ControleDigitalizacaoPageIsolated,
  ProtocoloCancelamentoPageIsolated,
  CartorioSeadePageIsolated,
  DNVDOBloqueadasPageIsolated,
  OficiosMandadosPageIsolated,
  HospitalCemiterioPageIsolated,
  CadastroIndicePageIsolated,
  ProtocoloLancamentoPageIsolated,
  NaturezaPageIsolated,
  ServicoCartorioPageIsolated,
  IndicesPageIsolated,
  IndiceXPageIsolated,
  ConfiguracaoMenuPageIsolated,
  ConfiguracaoSistemaPageIsolated,
  ConfiguracaoSenhaPageIsolated,
  ControladorSenhaPageIsolated,
  PainelSenhasPageIsolated,
  GerenciamentoGuichesPageIsolated,
  RemessaSEADEPageIsolated,
  LombadasPageIsolated
} from './modules'
// Rotas públicas (não precisam de isolamento, carregadas diretamente)
import { TelaSenhaPublicaPage } from './pages/TelaSenhaPublicaPage'
import { TerminalSenhaPage } from './pages/TerminalSenhaPage'
import { PainelPublicoPage } from './pages/PainelPublicoPage'
import { BasePage } from './components/BasePage'
import { ScannerIcon } from './components/ScannerIcon'
import { CivitasLogo } from './components/CivitasLogo'
import { SystemStatus } from './components/SystemStatus'
import { InstanceNotification } from './components/InstanceNotification'
import { AutoLogoutWarning } from './components/AutoLogoutWarning'
import { useAccessibility } from './hooks/useAccessibility'
import { useAutoLogout } from './hooks/useAutoLogout'
import { useWindowState } from './hooks/useWindowState'
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation'
import { getRelativeFontSize } from './utils/fontUtils'
import { announcementService } from './services/AnnouncementService'
import { WindowProvider, useWindowManager } from './contexts/WindowContext'
import { FormDataProvider } from './contexts/FormDataContext'
import { singleInstanceService } from './services/SingleInstanceService'
import { ThemeProtector } from './components/ThemeProtector'
import { GLOBAL_SHORTCUTS, generateHelpText } from './utils/globalShortcuts'
import { KeyboardIndicator } from './components/KeyboardIndicator'

interface User {
  id: string
  email: string
  name: string
  role: string
}

function WindowRenderer() {
  const { windows, closeWindow } = useWindowManager()
  
  return (
    <>
      {windows.map((window) => {
        const Component = window.component
        
        // Páginas que NÃO usam BasePage internamente precisam ser envolvidas
        const needsBasePage = [].includes(window.type) // ConfiguracaoMenuPage agora usa BasePage interno
        
        console.log(`🪟 WindowRenderer - Tipo: ${window.type}, needsBasePage: ${needsBasePage}`)
        
        if (needsBasePage) {
          console.log(`✅ Envolvendo ${window.type} em BasePage`)
          return (
            <BasePage
              key={window.id}
              title={window.title}
              windowId={window.id}
              initialPosition={window.position}
              initialZIndex={window.zIndex}
              isMinimized={window.isMinimized}
              isMaximized={window.isMaximized}
              width={window.defaultSize?.width ? `${window.defaultSize.width}px` : '1000px'}
              height={window.defaultSize?.height ? `${window.defaultSize.height}px` : '600px'}
              onClose={() => closeWindow(window.id)}
              draggable={true}
              resizable={true}
            >
              <Component
                {...window.props}
                onClose={() => closeWindow(window.id)}
              />
            </BasePage>
          )
        }
        
        // Páginas que JÁ usam BasePage internamente
        console.log(`📦 Renderizando ${window.type} direto (já tem BasePage interno)`)
        return (
          <Component
            key={window.id}
            windowId={window.id}
            initialPosition={window.position}
            initialZIndex={window.zIndex}
            isMinimized={window.isMinimized}
            isMaximized={window.isMaximized}
            {...window.props}
            onClose={() => closeWindow(window.id)}
          />
        )
      })}
    </>
  )
}

function AppContent() {
  const { openWindow } = useWindowManager()
  
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('admin@cartorio.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  // 🔒 CORREÇÃO CRÍTICA: Inicializar isDarkMode do localStorage ANTES do primeiro render
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    const isInitiallyDark = savedTheme === 'dark'
    console.log('⚡ App.tsx - isDarkMode inicial:', isInitiallyDark, 'baseado em:', savedTheme)
    return isInitiallyDark
  })
  const [showConfiguracoes, setShowConfiguracoes] = useState(false)
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false)
  const [isTextualMenuExpanded, setIsTextualMenuExpanded] = useState(false)
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [showConfigOverlay, setShowConfigOverlay] = useState(false)
  const [menuConfigVersion, setMenuConfigVersion] = useState(0) // Contador para forçar atualização dos menus
  const [movableTabs, setMovableTabs] = useState<Array<{
    id: string
    title: string
    content: string
    x: number
    y: number
    width: number
    height: number
    isMinimized: boolean
  }>>([])
  // Removido: sistema antigo de janelas únicas
  // Agora usando WindowManager para múltiplas janelas

  // Sistema de múltiplas janelas implementado

  // Hooks de acessibilidade e responsividade
  const accessibility = useAccessibility()
  const windowState = useWindowState()
  
  // Atalhos de teclado globais
  const keyboardNav = useKeyboardNavigation([
    {
      key: 'F1',
      action: () => {
        const helpText = generateHelpText(GLOBAL_SHORTCUTS)
        alert(helpText)
      },
      description: 'Mostrar ajuda de atalhos'
    },
    {
      key: 'Escape',
      action: () => {
        // Fechar modal/janela aberta
        if (isSideMenuOpen) {
          setIsSideMenuOpen(false)
        } else if (showConfiguracoes) {
          setShowConfiguracoes(false)
        } else if (showAccessibilitySettings) {
          setShowAccessibilitySettings(false)
        }
        console.log('⌨️ ESC pressionado - fechando overlays')
      },
      description: 'Fechar janela/modal'
    },
    {
      key: 'm',
      ctrl: true,
      shift: true,
      action: () => {
        setIsSideMenuOpen(!isSideMenuOpen)
        console.log('⌨️ Ctrl+Shift+M - Alternando menu do usuário')
      },
      description: 'Abrir/fechar menu do usuário'
    },
    {
      key: 'l',
      ctrl: true,
      shift: true,
      action: () => {
        if (isLoggedIn) {
          handleLogout()
          console.log('⌨️ Ctrl+Shift+L - Logout')
        }
      },
      description: 'Fazer logout',
      enabled: isLoggedIn
    }
  ])
  
  // Sincronizar isDarkMode com o tema do hook de acessibilidade
  useEffect(() => {
    console.log('\n🔄🔄🔄 ═══════════════════════════════════════════════')
    console.log('🔄 App.tsx - Sincronizando isDarkMode')
    console.log('🔄🔄🔄 ═══════════════════════════════════════════════')
    console.log('📊 accessibility.currentTheme:', accessibility.currentTheme)
    console.log('📊 isDarkMode ANTES:', isDarkMode)
    
    const shouldBeDark = accessibility.currentTheme === 'dark'
    console.log('🎯 Deve ser dark?', shouldBeDark)
    
    setIsDarkMode(shouldBeDark)
    console.log('✅ isDarkMode atualizado para:', shouldBeDark)
    
    // 🚨 CORREÇÃO CRÍTICA: Não aplicar cor fixa - usar variável CSS para não sobrescrever o tema
    console.log('🎨 Deixando background do body usar var(--background-color) do tema')
    console.log('🔄🔄🔄 ═══════════════════════════════════════════════\n')
  }, [accessibility.currentTheme])

  // Listener para atualização de configuração de menus em tempo real
  useEffect(() => {
    const handleMenuConfigUpdate = () => {
      console.log('🔄 Evento menu-config-updated recebido! Atualizando menus...')
      setMenuConfigVersion(prev => prev + 1) // Incrementa para forçar re-renderização
    }

    window.addEventListener('menu-config-updated', handleMenuConfigUpdate)
    
    return () => {
      window.removeEventListener('menu-config-updated', handleMenuConfigUpdate)
    }
  }, [])

  // Estados para navegação
  const [currentPage, setCurrentPage] = useState<string | null>(null)
  const [pageProps, setPageProps] = useState<any>({})

  // Funções de navegação globais
  const navigateToPage = useCallback((pageId: string, props: any = {}) => {
    try {
      console.log('=== NAVEGAÇÃO INICIADA ===')
      console.log('Página:', pageId)
      console.log('Props:', props)
      
      // 🔒 CORREÇÃO: Mapear IDs de menu para IDs de página reais
      const pageIdMapping: Record<string, string> = {
        'config-sistema-cep': 'cep',
        'config-sistema-ibge': 'ibge'
      }
      
      const realPageId = pageIdMapping[pageId] || pageId
      
      if (realPageId !== pageId) {
        console.log(`🔀 Mapeando '${pageId}' → '${realPageId}'`)
      }
      
      // Verificar se a página já está aberta
      if (singleInstanceService.isOpen(realPageId)) {
        console.log(`🔄 Página ${realPageId} já está aberta, fechando e reabrindo na posição original...`)
        
        // Fechar a página existente e reabrir na posição original
        singleInstanceService.close(realPageId)
        
        // Aguardar um momento para garantir que a página foi fechada
        setTimeout(() => {
          setCurrentPage(realPageId)
          setPageProps({ 
            ...props, 
            resetToOriginalPosition: true,
            refreshTrigger: Date.now()
          })
        }, 100)
        
        // Mostrar notificação
        announcementService.announce(`Página ${realPageId} foi reaberta na posição original`, { priority: 'normal' })
      } else {
        console.log(`🆕 Abrindo nova página ${realPageId}...`)
        setCurrentPage(realPageId)
        setPageProps(props)
      }
    } catch (error) {
      console.error('Erro na navegação:', error)
    }
  }, [])

  const closeCurrentPage = useCallback(() => {
    try {
      console.log('=== FECHANDO PÁGINA ===')
      
      if (currentPage) {
        // Fechar a instância única
        singleInstanceService.close(currentPage)
      }
      
      setCurrentPage(null)
      setPageProps({})
    } catch (error) {
      console.error('Erro ao fechar página:', error)
    }
  }, [currentPage])

  // Expor funções de navegação globalmente
  useEffect(() => {
    try {
      (window as any).navigateToPage = navigateToPage;
      (window as any).closeCurrentPage = () => {
        console.log('closeCurrentPage chamado')
      };
      console.log('Funções de navegação expostas globalmente')
    } catch (error) {
      console.error('Erro ao expor funções globalmente:', error)
    }
    
    return () => {
      try {
        delete (window as any).navigateToPage
        delete (window as any).closeCurrentPage
      } catch (error) {
        console.error('Erro ao limpar funções globais:', error)
      }
    }
  }, [navigateToPage, closeCurrentPage])

  // Verificar se está no horário permitido
  const verificarHorarioPermitido = (): { permitido: boolean; mensagem: string } => {
    const configBloqueioStr = localStorage.getItem('config-bloqueio-horario')
    if (!configBloqueioStr) {
      return { permitido: true, mensagem: '' }
    }
    
    try {
      const configBloqueio = JSON.parse(configBloqueioStr)
      
      if (!configBloqueio.habilitado) {
        return { permitido: true, mensagem: '' }
      }
      
      const agora = new Date()
      const [horaInicio, minInicio] = configBloqueio.horarioInicio.split(':').map(Number)
      const [horaFim, minFim] = configBloqueio.horarioFim.split(':').map(Number)
      
      const inicioComExtra = new Date()
      inicioComExtra.setHours(horaInicio, minInicio - configBloqueio.tempoExtraPermitido, 0, 0)
      
      const fimComExtra = new Date()
      fimComExtra.setHours(horaFim, minFim + configBloqueio.tempoExtraPermitido, 0, 0)
      
      const dentroDoHorario = agora >= inicioComExtra && agora <= fimComExtra
      
      if (!dentroDoHorario) {
        const horarioInicioStr = inicioComExtra.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        const horarioFimStr = fimComExtra.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        return { 
          permitido: false, 
          mensagem: configBloqueio.mensagemBloqueio || 
            `Sistema bloqueado fora do horário de funcionamento.\n\nHorário permitido: ${horarioInicioStr} às ${horarioFimStr}`
        }
      }
      
      return { permitido: true, mensagem: '' }
    } catch (error) {
      console.error('❌ Erro ao verificar bloqueio de horário:', error)
      return { permitido: true, mensagem: '' }
    }
  }

  // Função de login simplificada
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // PRIMEIRO: Verificar horário permitido
      const { permitido, mensagem } = verificarHorarioPermitido()
      
      if (!permitido) {
        console.warn('🔒 Login bloqueado por horário!')
        setError(mensagem)
        setIsLoading(false)
        return
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const emailLimpo = String(email || '').trim()
      const senhaLimpa = String(password || '').trim()
      
      // Verificar admin padrão
      if (emailLimpo === 'admin@cartorio.com' && senhaLimpa === 'admin123') {
        setUser({
          id: '1',
          email: 'admin@cartorio.com',
          name: 'Administrador',
          role: 'admin'
        })
        setIsLoggedIn(true)
        return
      }
      
      // Verificar funcionários cadastrados
      const dadosFuncionarios = localStorage.getItem('funcionarios-cadastrados')
      
      if (dadosFuncionarios) {
        const funcionarios = JSON.parse(dadosFuncionarios)
        
        // Buscar funcionário por login ou email
        const funcionario = funcionarios.find((f: any) => 
          String(f.login || '').trim().toLowerCase() === emailLimpo.toLowerCase() ||
          String(f.email || '').trim().toLowerCase() === emailLimpo.toLowerCase()
        )
        
        if (funcionario) {
          const senhaCadastrada = String(funcionario.senha || '').trim()
          
          if (senhaCadastrada === senhaLimpa) {
            // Login válido!
            const userData = {
              id: funcionario.codigo || funcionario.id,
              email: funcionario.email || emailLimpo,
              name: funcionario.nome,
              login: funcionario.login,
              role: 'employee',
              funcionario: funcionario
            }
            
            localStorage.setItem('token', 'funcionario-token-' + Date.now())
            localStorage.setItem('user', JSON.stringify(userData))
            
            setUser(userData)
        setIsLoggedIn(true)
            return
          }
        }
      }
      
      // Se chegou aqui, credenciais inválidas
        setError('Credenciais inválidas')
      
    } catch (error) {
      setError('Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  // Função de logout
  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
    setCurrentPage(null)
    setPageProps({})
  }

  // Auto-logout por inatividade (DEPOIS da declaração de handleLogout)
  // Estado para warningMinutes (tempo de aviso antes do logout)
  const [autoLogoutWarningMinutes, setAutoLogoutWarningMinutes] = useState(() => {
    const saved = localStorage.getItem('config-gerais-sistema')
    if (saved) {
      try {
        const config = JSON.parse(saved)
        // Converter segundos para minutos se necessário
        if (config.autoLogoutWarningUnit === 'segundos') {
          return config.autoLogoutWarningSeconds / 60 // Converte segundos para minutos decimal
        }
        return config.autoLogoutWarningMinutes || 2
      } catch {
        return 2
      }
    }
    return 2
  })
  
  // Listener para atualizar warningMinutes quando configuração mudar
  useEffect(() => {
    const handleConfigUpdate = () => {
      const saved = localStorage.getItem('config-gerais-sistema')
      if (saved) {
        try {
          const config = JSON.parse(saved)
          // Converter para minutos (decimal)
          if (config.autoLogoutWarningUnit === 'segundos') {
            const minutosDecimal = config.autoLogoutWarningSeconds / 60
            setAutoLogoutWarningMinutes(minutosDecimal)
            console.log('⚠️ Tempo de aviso atualizado:', config.autoLogoutWarningSeconds, 's (', minutosDecimal.toFixed(2), 'min )')
          } else {
            setAutoLogoutWarningMinutes(config.autoLogoutWarningMinutes || 2)
            console.log('⚠️ Tempo de aviso atualizado:', config.autoLogoutWarningMinutes, 'min')
          }
        } catch (error) {
          console.error('Erro ao atualizar warningMinutes:', error)
        }
      }
    }
    
    window.addEventListener('config-gerais-updated', handleConfigUpdate)
    return () => window.removeEventListener('config-gerais-updated', handleConfigUpdate)
  }, [])
  
  const autoLogout = useAutoLogout({
    enabled: accessibility.settings.autoLogoutEnabled,
    timeoutMinutes: accessibility.settings.autoLogoutMinutes,
    warningMinutes: autoLogoutWarningMinutes,
    onLogout: handleLogout
  })
  
  // Verificação de bloqueio por horário
  useEffect(() => {
    const verificarBloqueioHorario = () => {
      const configBloqueioStr = localStorage.getItem('config-bloqueio-horario')
      if (!configBloqueioStr) return
      
      try {
        const configBloqueio = JSON.parse(configBloqueioStr)
        
        if (!configBloqueio.habilitado || !isLoggedIn) return
        
        const agora = new Date()
        const [horaInicio, minInicio] = configBloqueio.horarioInicio.split(':').map(Number)
        const [horaFim, minFim] = configBloqueio.horarioFim.split(':').map(Number)
        
        const inicioComExtra = new Date()
        inicioComExtra.setHours(horaInicio, minInicio - configBloqueio.tempoExtraPermitido, 0, 0)
        
        const fimComExtra = new Date()
        fimComExtra.setHours(horaFim, minFim + configBloqueio.tempoExtraPermitido, 0, 0)
        
        const dentroDoHorario = agora >= inicioComExtra && agora <= fimComExtra
        
        if (!dentroDoHorario) {
          console.warn('🔒 Sistema bloqueado por horário!')
          alert(configBloqueio.mensagemBloqueio || 'Sistema bloqueado fora do horário de funcionamento.')
          handleLogout()
        }
      } catch (error) {
        console.error('❌ Erro ao verificar bloqueio de horário:', error)
      }
    }
    
    // Verificar a cada minuto
    const timer = setInterval(verificarBloqueioHorario, 60000)
    
    // Verificar imediatamente ao montar
    verificarBloqueioHorario()
    
    return () => clearInterval(timer)
  }, [isLoggedIn, handleLogout])

  // Funções para MovableTabs

  const handleTabClose = (tabId: string) => {
    setMovableTabs(tabs => tabs.filter(tab => tab.id !== tabId))
  }

  const handleTabMinimize = (tabId: string) => {
    setMovableTabs(tabs => 
      tabs.map(tab => 
        tab.id === tabId ? { ...tab, isMinimized: !tab.isMinimized } : tab
      )
    )
  }

  // Inicializar serviço de anúncios
  useEffect(() => {
    const initAnnouncementService = async () => {
      try {
        await announcementService.initialize()
        console.log('✅ Serviço de anúncios inicializado')
      } catch (error) {
        console.error('❌ Erro ao inicializar serviço de anúncios:', error)
      }
    }
    
    initAnnouncementService()
  }, [])

  // Verificar se já está logado e tema
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    const savedTheme = localStorage.getItem('theme')
    
    console.log('=== INICIALIZAÇÃO ===')
    console.log('Tema salvo:', savedTheme)
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
      setIsLoggedIn(true)
    }
    
    // 🚨 CORREÇÃO CRÍTICA: Não definir background fixo na inicialização
    // O useAccessibility já aplica var(--background-color) no body
    console.log('🎨 Tema inicial já aplicado por useAccessibility')
  }, [])

  // ⚡ Verificar hash da URL para abrir Controle de Digitalização automaticamente
  useEffect(() => {
    if (!isLoggedIn) return

    const hash = window.location.hash
    console.log('🔍 Hash da URL:', hash)
    
    if (hash.includes('autoOpen=controle-digitalizacao')) {
      console.log('🚀 Auto-abrindo Controle de Digitalização...')
      
      // Aguardar um momento para garantir que tudo está carregado
      setTimeout(() => {
        openWindow({
          id: 'controle-digitalizacao-window',
          type: 'controle-digitalizacao',
          title: 'Controle de Digitalização de Imagens',
          component: ControleDigitalizacaoPageIsolated,
          props: {}
        })
        
        // Limpar o hash da URL
        window.history.replaceState(null, '', window.location.pathname)
      }, 500)
    }
  }, [isLoggedIn, openWindow])

  // Monitorar mudanças no tema



  // Funções para gerenciar abas móveis
  const handleTabUpdate = (updatedTabs: any[]) => {
    setMovableTabs(updatedTabs)
  }


  const navigateToMaternidade = () => {
    setShowPasswordPrompt(true)
  }

  const handlePasswordSuccess = () => {
    window.open('/maternidade', '_blank')
  }


  // Se está logado, mostrar o sistema
  // Rotas públicas para sistema de senhas (não requerem login)
  const rotaAtual = window.location.pathname
  if (rotaAtual === '/senha-publica') {
    return <TelaSenhaPublicaPage />
  }
  if (rotaAtual === '/painel-publico') {
    return <PainelPublicoPage />
  }
  if (rotaAtual === '/senha-terminal') {
    return <TerminalSenhaPage />
  }

  if (isLoggedIn && user) {
  return (
      <FeedbackSystem>
      <Routes>
        <Route path="/maternidade" element={<MaternidadePage />} />
        <Route path="*" element={<MainSystem />} />
      </Routes>
      </FeedbackSystem>
    )
  }

  function MainSystem() {
    const accessibilityTheme = accessibility.getTheme()
    const isDark = accessibility.currentTheme === 'dark'
    
    
    // Aguardar o tema estar carregado
    if (!accessibility.isThemeLoaded || !accessibilityTheme || !accessibility.currentTheme) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Carregando sistema...</div>
        </div>
      )
    }

    // Função para filtrar menus baseado nas configurações E permissões
    const filterMenusByConfig = (items: any[]) => {
      try {
        const savedConfig = localStorage.getItem('menu-config')
        const isAdmin = user?.role === 'admin'
        const visibilityMap = new Map<string, boolean>()
        
        if (savedConfig) {
        const config = JSON.parse(savedConfig)
        
        const buildVisibilityMap = (configItems: any[]) => {
          configItems.forEach((item: any) => {
            visibilityMap.set(item.id, item.visible)
            if (item.submenu) {
              buildVisibilityMap(item.submenu)
            }
          })
        }
        
        buildVisibilityMap(config)
        }
        
        // Filtrar itens recursivamente
        const filterItems = (items: any[], level = 0): any[] => {
          return items.filter((item: any) => {
            // Verificar permissão de admin PRIMEIRO
            if (item.adminOnly && !isAdmin) {
              return false
            }
            
            const isVisible = visibilityMap.get(item.id) !== false
            
            if (!isVisible) {
              return false
            }
            
            // Se tem submenu, filtrar também
            if (item.submenu) {
              const filteredSubmenu = filterItems(item.submenu, level + 1)
              // Se todos os submenus foram removidos, remove o item pai também
              if (filteredSubmenu.length === 0) {
                return false
              }
            }
            
            return true
          }).map((item: any) => {
            // Aplicar filtro no submenu se existir
            if (item.submenu) {
              return { ...item, submenu: filterItems(item.submenu, level + 1) }
            }
            return item
          })
        }
        
        const result = filterItems(items)
        console.log('✅ Menus filtrados:', result.length, 'itens no nível raiz')
        return result
      } catch (error) {
        console.error('❌ Erro ao filtrar menus:', error)
        return items // Em caso de erro, mostra tudo
      }
    }

    // Configuração do Menu Textual (Menu 1) - TODOS OS SUBMENUS ORIGINAIS RESTAURADOS
    const rawTextualMenuItems = [
      {
        id: 'cadastros',
        label: 'Cadastros',
        icon: '',
        submenu: [
            { id: 'cliente', label: 'Cliente', icon: '', onClick: () => {
              console.log('✅ CLIENTE CLICADO! Abrindo janela...')
              const windowId = 'cliente-window'
              openWindow({
                id: windowId,
                type: 'cliente',
                title: 'Cliente',
                component: ClientePageIsolated,
                props: {}
              })
              console.log('✅ Janela de Cliente aberta!')
            } },
            { 
              id: 'funcionario', 
              label: 'Funcionário e Guichê', 
              icon: '', 
              adminOnly: true,
              onClick: () => {
              console.log('✅ FUNCIONÁRIO CLICADO! Abrindo janela...')
              const windowId = 'funcionario-window'
              openWindow({
                id: windowId,
                type: 'funcionario',
                title: 'Funcionário',
                component: FuncionarioPageIsolated,
                props: {}
              })
              console.log('✅ Janela de Funcionário aberta!')
            } },
            { id: 'cartorio-seade', label: 'Cartório (SEADE)', icon: '', onClick: () => {
              console.log('✅ CARTÓRIO SEADE CLICADO! Abrindo janela...')
              openWindow({
                id: 'cartorio-seade-window',
                type: 'cartorio-seade',
                title: 'Cadastro de Cartório (SEADE)',
                component: CartorioSeadePageIsolated,
                props: {}
              })
              console.log('✅ Janela de Cartório SEADE aberta!')
            } },
          { id: 'dnv-bloqueadas', label: 'DNV e DO Bloqueadas', icon: '', onClick: () => {
            console.log('✅ DNV E DO BLOQUEADAS CLICADO! Abrindo janela...')
            openWindow({
              id: 'dnv-do-bloqueadas-window',
              type: 'dnv-do-bloqueadas',
              title: 'Cadastro de Declaração Bloqueada',
              component: DNVDOBloqueadasPageIsolated,
              props: {}
            })
            console.log('✅ Janela de DNV e DO Bloqueadas aberta!')
          } },
          { id: 'oficios-mandados', label: 'Ofícios e Mandados', icon: '', onClick: () => {
            console.log('✅ OFÍCIOS E MANDADOS CLICADO! Abrindo janela...')
            openWindow({
              id: 'oficios-mandados-window',
              type: 'oficios-mandados',
              title: 'Controle de Ofícios e Mandados',
              component: OficiosMandadosPageIsolated,
              props: {}
            })
            console.log('✅ Janela de Ofícios e Mandados aberta!')
          } },
          { id: 'painel-senhas-admin', label: 'Painel de Senhas (Admin)', icon: '', adminOnly: true, onClick: () => {
            console.log('✅ Abrindo Painel Administrativo de Senhas...')
            openWindow({
              id: 'painel-senhas-admin-window',
              type: 'painel-senhas-admin',
              title: 'Painel de Senhas',
              component: PainelSenhasPageIsolated,
              props: {}
            })
          } },
          { id: 'hospital-cemiterio', label: 'Hospital, Cemitério e Funerária', icon: '', onClick: () => {
            console.log('✅ HOSPITAL, CEMITÉRIO E FUNERÁRIA CLICADO! Abrindo janela...')
            openWindow({
              id: 'hospital-cemiterio-window',
              type: 'hospital-cemiterio',
              title: 'Cadastro de Hospitais, Cemitérios e Funerárias',
              component: HospitalCemiterioPageIsolated,
              props: {}
            })
            console.log('✅ Janela de Hospital, Cemitério e Funerária aberta!')
          }},
          { 
            id: 'cadastro-livros', 
            label: 'Cadastro de Livros', 
            icon: '', 
            submenu: [
              {
                id: 'cadastro-lombada-livros',
                label: 'Lombada de Livros',
                icon: '',
                onClick: () => {
                  console.log('✅ LOMBADA DE LIVROS CLICADO! Abrindo janela...');
                  openWindow({
                    id: 'lombada-livros-window',
                    type: 'lombada-livros',
                    title: 'Lombada de Livros',
                    component: LombadasPageIsolated,
                    props: {}
                  });
                }
              },
              {
                id: 'cadastro-lombada-classificador',
                label: 'Lombada de Classificador',
                icon: '',
                onClick: () => {
                  console.log('✅ LOMBADA DE CLASSIFICADOR CLICADO! Abrindo janela...');
                  openWindow({
                    id: 'lombada-classificador-window',
                    type: 'lombada-classificador',
                    title: 'Lombada de Classificador',
                    component: LombadasPageIsolated,
                    props: { modo: 'classificador' }
                  });
                }
              }
            ]
          },
          {
            id: 'abertura-livros',
            label: 'Abertura de Livros',
            icon: '',
            submenu: [
              {
                id: 'lombadas', 
                label: 'Lombada', 
                icon: '📚', 
                onClick: () => {
                  console.log('✅ LOMBADAS CLICADO! Abrindo janela...')
                  openWindow({
                    id: 'lombadas-window',
                    type: 'lombadas',
                    title: 'Criação de Lombadas de Livros',
                    component: LombadasPageIsolated,
                    props: {}
                  })
                  console.log('✅ Janela de Lombadas aberta!')
                }
              }
            ]
          },
          {
            id: 'controle-certidoes',
            label: 'Controle de Certidões',
            icon: '',
            submenu: [
              { id: 'compra-certidoes', label: 'Compra de Certidões', icon: '', onClick: () => (window as any).navigateToPage?.('compra-certidoes') },
              { id: 'consumo-certidoes', label: 'Consumo de Certidões', icon: '', onClick: () => (window as any).navigateToPage?.('consumo-certidoes') },
              { id: 'perda-cancelamento-certidoes', label: 'Perda/Cancelamento de Certidões', icon: '', onClick: () => (window as any).navigateToPage?.('perda-cancelamento-certidoes') },
              { id: 'relatorio-estoque-certidoes', label: 'Relatório de Estoque de Certidões', icon: '', onClick: () => (window as any).navigateToPage?.('relatorio-estoque-certidoes') },
              { id: 'estorno-certidao-utilizada', label: 'Estorno de Certidão Utilizada', icon: '', onClick: () => (window as any).navigateToPage?.('estorno-certidao-utilizada') },
              { id: 'consulta-certidoes-utilizadas', label: 'Consulta de Certidões Utilizadas', icon: '', onClick: () => (window as any).navigateToPage?.('consulta-certidoes-utilizadas') },
              { id: 'manutencao-certidoes-utilizadas', label: 'Manutenção de Certidões Utilizadas', icon: '', onClick: () => (window as any).navigateToPage?.('manutencao-certidoes-utilizadas') }
            ]
          },
          { 
            id: 'configuracao-sistema', 
            label: 'Configurações do Sistema', 
            icon: '', 
            adminOnly: true,
            submenu: [
              { id: 'config-sistema-feriados', label: 'Feriados', icon: '', onClick: () => {
                console.log('✅ Abrindo Cadastro de Feriados...')
                openWindow({
                  id: 'feriados-window',
                  type: 'feriados',
                  title: 'Cadastro de Feriado',
                  component: FeriadosPageIsolated,
                  props: {}
                })
              }},
              { id: 'config-sistema-ibge', label: 'IBGE', icon: '', onClick: () => {
                console.log('🔍 Clique em IBGE - chamando navigateToPage')
                navigateToPage('config-sistema-ibge')
              }},
              { id: 'config-sistema-cep', label: 'CEP', icon: '', onClick: () => {
                console.log('🔍 Clique em CEP - chamando navigateToPage')
                navigateToPage('config-sistema-cep')
              }},
              { id: 'cadastros-localizacao', label: 'Localização (Cidade e País)', icon: '', onClick: () => {
                console.log('✅ Abrindo Cadastro de Localização...')
                openWindow({
                  id: 'localizacao-cadastro-window',
                  type: 'localizacao-cadastro',
                  title: 'Cadastro de Localização',
                  component: LocalizacaoCadastroPageIsolated,
                  props: {}
                })
              } },
              { id: 'cadastros-tipos', label: 'Digitalização (Ato e Documento)', icon: '', onClick: () => {
                console.log('✅ Abrindo Cadastro de Digitalização...')
                openWindow({
                  id: 'tipos-cadastro-window',
                  type: 'tipos-cadastro',
                  title: 'Cadastro de Digitalização',
                  component: TiposCadastroPageIsolated,
                  props: {}
                })
              } },
              { id: 'servicos-cartorio', label: 'Serviços e Tabela de Custas', icon: '', onClick: () => {
                console.log('✅ SERVIÇOS CARTÓRIO CLICADO! Abrindo janela...')
                const windowId = 'servicos-cartorio-window'
                openWindow({
                  id: windowId,
                  type: 'servicos-cartorio',
                  title: 'Serviços de Cartório',
                  component: ServicoCartorioPageIsolated,
                  props: {}
                })
                console.log('✅ Janela de Serviços de Cartório aberta!')
              } },
              { id: 'config-menus', label: 'Configuração de Menus', icon: '', onClick: () => {
                console.log('✅ Abrindo Configuração de Menus...')
                openWindow({
                  id: 'config-menus-window',
                  type: 'config-menus',
                  title: 'Configuração de Menus',
                  component: ConfiguracaoMenuPageIsolated,
                  props: {},
                  defaultSize: { width: 1000, height: 700 },
                  defaultPosition: { x: 100, y: 100 }
                })
              } },
              { id: 'config-sistema-gerais', label: 'Configurações Gerais', icon: '', onClick: () => {
                console.log('✅ Abrindo Configurações Gerais do Sistema...')
                openWindow({
                  id: 'config-sistema-gerais-window',
                  type: 'config-sistema-gerais',
                  title: 'Configurações do Sistema',
                  component: ConfiguracaoSistemaPageIsolated,
                  props: {}
                })
              } },
              { id: 'config-senhas', label: 'Configuração de Senhas', icon: '', onClick: () => {
                console.log('✅ Abrindo Configuração de Senhas...')
                openWindow({
                  id: 'config-senhas-window',
                  type: 'config-senhas',
                  title: 'Configuração de Senhas',
                  component: ConfiguracaoSenhaPageIsolated,
                  props: {}
                })
              } }
            ]
          }
        ]
      },
      {
        id: 'atendimento',
        label: 'Atendimento',
        icon: '',
        submenu: [
          { id: 'novo-atendimento', label: 'Novo Atendimento', icon: '', onClick: () => (window as any).navigateToPage?.('novo-atendimento') },
          { id: 'consulta-atendimento', label: 'Consulta', icon: '', onClick: () => (window as any).navigateToPage?.('consulta-atendimento') }
        ]
      },
      {
        id: 'livro-e-menu',
        label: 'Livro E',
        icon: '',
        submenu: [
          { id: 'certificacao-eletronica', label: 'Certificação Eletrônica', icon: '', onClick: () => (window as any).navigateToPage?.('certificacao-eletronica') },
          { id: 'termo-uniao-estavel', label: 'Termo de União Estável', icon: '', onClick: () => (window as any).navigateToPage?.('termo-uniao-estavel') }
        ]
      },
      {
        id: 'protocolos',
        label: 'Protocolos',
        icon: '',
        submenu: [
          { id: 'protocolo-lancamento', label: 'Lançamento', icon: '', onClick: () => {
            console.log('✅ PROTOCOLO LANÇAMENTO CLICADO! Abrindo janela...')
            openWindow({
              id: 'protocolo-lancamento',
              title: 'Lançamento de Protocolos',
              component: ProtocoloLancamentoPageIsolated,
              position: { x: 100, y: 100 }
            })
            console.log('✅ Janela de Lançamento de Protocolos aberta!')
          }},
          { id: 'protocolo-baixa', label: 'Baixa', icon: '', onClick: () => (window as any).navigateToPage?.('protocolo-baixa') },
          { id: 'protocolo-cancelamento', label: 'Cancelamento', icon: '', onClick: () => {
            console.log('✅ Abrindo Cancelamento de Protocolos...')
            openWindow({
              id: 'protocolo-cancelamento-window',
              type: 'protocolo-cancelamento',
              title: 'Cancelamento de Protocolos',
              component: ProtocoloCancelamentoPageIsolated,
              props: {}
            })
          } }
        ]
      },
      {
        id: 'lavratura',
        label: 'Lavratura',
        icon: '',
        submenu: [
          { id: 'lavratura-casamento', label: 'Casamento', icon: '', onClick: () => (window as any).navigateToPage?.('lavratura-casamento') },
          { id: 'lavratura-nascimento', label: 'Nascimento', icon: '', onClick: () => (window as any).navigateToPage?.('lavratura-nascimento') },
          { id: 'lavratura-obito', label: 'Óbito', icon: '', onClick: () => (window as any).navigateToPage?.('lavratura-obito') },
          {
            id: 'livro-e',
            label: 'Livro E',
            icon: '',
            submenu: [
          { id: 'lavratura-ausencia', label: 'Ausência', icon: '', onClick: () => (window as any).navigateToPage?.('lavratura-ausencia') },
          { id: 'lavratura-emancipacao', label: 'Emancipação', icon: '', onClick: () => (window as any).navigateToPage?.('lavratura-emancipacao') },
          { id: 'lavratura-interdicao', label: 'Interdição', icon: '', onClick: () => (window as any).navigateToPage?.('lavratura-interdicao') },
          { id: 'lavratura-opcao-nacionalidade', label: 'Opção de Nacionalidade', icon: '', onClick: () => (window as any).navigateToPage?.('lavratura-opcao-nacionalidade') },
          { id: 'lavratura-registro-sentenca', label: 'Registro de Sentença', icon: '', onClick: () => (window as any).navigateToPage?.('lavratura-registro-sentenca') },
          { id: 'lavratura-registro-uniao-estavel', label: 'Registro de União Estável', icon: '', onClick: () => (window as any).navigateToPage?.('lavratura-registro-uniao-estavel') },
          { id: 'lavratura-traslado-casamento', label: 'Traslado de Assento de Casamento', icon: '', onClick: () => (window as any).navigateToPage?.('lavratura-traslado-casamento') },
          { id: 'lavratura-traslado-nascimento', label: 'Traslado de Assento de Nascimento', icon: '', onClick: () => (window as any).navigateToPage?.('lavratura-traslado-nascimento') },
          { id: 'lavratura-traslado-obito', label: 'Traslado de Assento de Óbito', icon: '', onClick: () => (window as any).navigateToPage?.('lavratura-traslado-obito') }
        ]
          }
        ]
      },
      {
        id: 'livro-comercial',
        label: 'Livro Comercial',
        icon: '',
        submenu: [
          { id: 'livro-autenticacao', label: 'Livro de Autenticação', icon: '', onClick: () => (window as any).navigateToPage?.('livro-autenticacao') },
          { id: 'autenticacao', label: 'Autenticação', icon: '', onClick: () => (window as any).navigateToPage?.('autenticacao') }
        ]
      },
      {
        id: 'certidoes',
        label: 'Certidões',
        icon: '',
        submenu: [
          { id: 'certidao-nascimento', label: '2ª Via de Certidão de Nascimento', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-nascimento') },
          { id: 'certidao-casamento', label: '2ª Via de Certidão de Casamento', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-casamento') },
          { id: 'certidao-obito', label: '2ª Via de Certidão de Óbito', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-obito') },
          { id: 'certidao-negativa', label: 'Certidão Negativa', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-negativa') },
          {
            id: 'inteiro-teor',
            label: 'Inteiro Teor',
            icon: '',
            submenu: [
              { id: 'certidao-digitada', label: 'Certidão Digitada', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-digitada') },
              { id: 'certidao-reprografica', label: 'Certidão Reprografica', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-reprografica') }
            ]
          },
          {
            id: 'livro-e-certidoes',
            label: 'Livro E',
        icon: '',
        submenu: [
          { id: 'certidao-2-via-ausencia', label: '2ª Via de Ausência', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-2-via-ausencia') },
          { id: 'certidao-2-via-emancipacao', label: '2ª Via de Emancipação', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-2-via-emancipacao') },
          { id: 'certidao-2-via-uniao-estavel', label: '2ª Via de União Estável', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-2-via-uniao-estavel') },
              { id: 'certidao-2-via-opcao-nacionalidade', label: '2ª via Opção de Nacionalidade', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-2-via-opcao-nacionalidade') },
              { id: 'certidao-2-via-interdicao', label: '2ª Via de Interdição', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-2-via-interdicao') },
              { id: 'certidao-2-via-registro-sentenca', label: '2ª Via Registro de Sentença', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-2-via-registro-sentenca') }
            ]
          },
          { id: 'certidao-2-via-traslado-casamento', label: '2ª via Traslado de Assento de Casamento', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-2-via-traslado-casamento') },
          { id: 'certidao-2-via-traslado-nascimento', label: '2ª via Traslado de Assento de Nascimento', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-2-via-traslado-nascimento') },
          { id: 'certidao-2-via-traslado-obito', label: '2ª via Traslado de Assento de Óbito', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-2-via-traslado-obito') }
        ]
      },
      {
        id: 'indice',
        label: 'Índice',
        icon: '',
        submenu: [
          { id: 'cadastro-indice', label: 'Cadastro de Índice de Livro Antigo', icon: '', onClick: () => {
            console.log('✅ Abrindo Cadastro de Índice de Livro Antigo...')
            openWindow({
              id: `cadastro-indice-${Date.now()}`,
              type: 'cadastro-indice',
              title: 'Cadastro de Índice de Livro Antigo',
              component: CadastroIndicePageIsolated,
              props: {}
            })
          }},
          { id: 'indices-principais', label: 'Consulta de Índices Recentes', icon: '', onClick: () => {
            console.log('✅ Abrindo Consulta de Índices Recentes...')
            openWindow({
              id: `indices-${Date.now()}`,
              type: 'indices',
              title: 'Consulta de Índices Recentes',
              component: IndicesPageIsolated,
              props: {}
            })
            console.log('✅ Janela de Índices aberta!')
          }},
         
        ]
      },
      {
        id: 'relatorios',
        label: 'Relatórios',
        icon: '',
        submenu: [
          { id: 'justica-eleitoral', label: 'Justiça Eleitoral', icon: '', onClick: () => (window as any).navigateToPage?.('justica-eleitoral') },
          { id: 'exercito-brasileiro', label: 'Exército Brasileiro', icon: '', onClick: () => (window as any).navigateToPage?.('exercito-brasileiro') },
          { id: 'ibge', label: 'IBGE', icon: '', onClick: () => (window as any).navigateToPage?.('ibge') },
          { id: 'instituto-ricardo-g-daunt', label: 'Instituto Ricardo G. Daunt', icon: '', onClick: () => (window as any).navigateToPage?.('instituto-ricardo-g-daunt') },
          { id: 'ministerio-justica-estrangeiros', label: 'Ministério da Justiça - Estrangeiros', icon: '', onClick: () => (window as any).navigateToPage?.('ministerio-justica-estrangeiros') },
          { id: 'procuradoria-bens-inventariar', label: 'Procuradoria - Bens a Inventariar', icon: '', onClick: () => (window as any).navigateToPage?.('procuradoria-bens-inventariar') },
          { id: 'sec-fazenda-bens-inventariar', label: 'Sec. Fazenda - Bens a Inventariar', icon: '', onClick: () => (window as any).navigateToPage?.('sec-fazenda-bens-inventariar') },
          { id: 'secretaria-municipal-saude', label: 'Secretaria Municipal da Saúde', icon: '', onClick: () => (window as any).navigateToPage?.('secretaria-municipal-saude') },
          { id: 'vigilancia-sanitaria-epidemiologica', label: 'Vigilância Sanitária / Epidemiológica', icon: '', onClick: () => (window as any).navigateToPage?.('vigilancia-sanitaria-epidemiologica') },
          { id: 'registro-nascimentos-hospitais', label: 'Registro de Nascimentos para Hospitais', icon: '', onClick: () => (window as any).navigateToPage?.('registro-nascimentos-hospitais') },
          { id: 'funai', label: 'Fundação Nacional do Índio - FUNAI', icon: '', onClick: () => (window as any).navigateToPage?.('funai') },
          { id: 'defensoria-publica', label: 'Defensoria Pública', icon: '', onClick: () => (window as any).navigateToPage?.('defensoria-publica') },
          { id: 'listagem-conferencia-indice', label: 'Listagem de Conferência de Índice', icon: '', onClick: () => (window as any).navigateToPage?.('listagem-conferencia-indice') },
          { id: 'protocolos-agenda', label: 'Protocolos - Agenda', icon: '', onClick: () => (window as any).navigateToPage?.('protocolos-agenda') },
          { id: 'casamentos-agendados', label: 'Casamentos Agendados', icon: '', onClick: () => (window as any).navigateToPage?.('casamentos-agendados') },
          { id: 'publicacao-editais-proclamas', label: 'Publicação de Editais de Proclamas', icon: '', onClick: () => (window as any).navigateToPage?.('publicacao-editais-proclamas') }
        ]
      },
      {
        id: 'remessas',
        label: 'Remessas',
        icon: '',
        submenu: [
          { id: 'remessa-guia-seade', label: 'Remessa SEADE', icon: '', onClick: () => {
            console.log('✅ Abrindo Remessa SEADE...')
            openWindow({
              id: 'remessa-seade-window',
              type: 'remessa-seade',
              title: 'Remessa SEADE',
              component: RemessaSEADEPageIsolated,
              props: {}
            })
          } },
          { id: 'recepcao-arquivos', label: 'Recepção de Arquivos', icon: '', onClick: () => {
            console.log('✅ Abrindo Recepção de Arquivos...')
            openWindow({
              id: 'recepcao-arquivos-window',
              type: 'recepcao-arquivos',
              title: 'Recepção de Arquivos',
              component: RecepcaoArquivosPageIsolated,
              props: {}
            })
          } },
          { id: 'remessa-arquivo-seade', label: 'Arquivo SEADE', icon: '', onClick: () => (window as any).navigateToPage?.('remessa-arquivo-seade') },
          { id: 'remessa-intranet', label: 'INTRANET', icon: '', onClick: () => (window as any).navigateToPage?.('remessa-intranet') }
        ]
      },
      {
        id: 'digitalizacao',
        label: 'Digitalização',
        icon: '',
        submenu: [
          { id: 'digitalizacao-controle', label: 'Controle de Digitalização', icon: '', onClick: () => {
            console.log('✅ Abrindo Controle de Digitalização...')
            openWindow({
              id: 'controle-digitalizacao-window',
              type: 'controle-digitalizacao',
              title: 'Controle de Digitalização de Imagens',
              component: ControleDigitalizacaoPageIsolated,
              props: {}
            })
          } },
          { id: 'digitalizacao-exclusao', label: 'Exclusão de Registros e Imagens Digitalizadas', icon: '', onClick: () => (window as any).navigateToPage?.('digitalizacao-exclusao') }
        ]
      },
      {
        id: 'procuracao',
        label: 'Procuração',
        icon: '',
        submenu: [
          { id: 'procuracao-nova', label: 'Nova Procuração', icon: '', onClick: () => (window as any).navigateToPage?.('procuracao-nova') },
          { id: 'procuracao-certidao', label: 'Certidão de Procuração', icon: '', onClick: () => (window as any).navigateToPage?.('procuracao-certidao') }
        ]
      },
      {
        id: 'firmas',
        label: 'Firmas',
        icon: '',
        submenu: [
          { id: 'firmas-cadastrar', label: 'Cadastrar Firma', icon: '', onClick: () => {
            console.log('✅ CADASTRAR FIRMA CLICADO! Abrindo janela...')
            openWindow({
              id: 'firmas-window',
              type: 'firmas',
              title: 'Firmas',
              component: FirmasPageIsolated,
              props: {}
            })
            console.log('✅ Janela de Firmas aberta!')
          } },
          { id: 'documento-desentranhado', label: 'Documento Desentranhado', icon: '', onClick: () => {
            console.log('✅ DOCUMENTO DESENTRANHADO CLICADO! Abrindo janela...')
            openWindow({
              id: 'firmas-doc-window',
              type: 'firmas-documento-desentranhado',
              title: 'Documento Desentranhado',
              component: FirmasPageIsolated,
              props: {}
            })
            console.log('✅ Janela de Documento Desentranhado aberta!')
          } },
          { id: 'autenticacao-item-13', label: 'Autenticação Item 13', icon: '', onClick: () => {
            console.log('✅ AUTENTICAÇÃO ITEM 13 CLICADO! Abrindo janela...')
            openWindow({
              id: 'firmas-auth-window',
              type: 'firmas-autenticacao-item13',
              title: 'Autenticação Item 13',
              component: FirmasPageIsolated,
              props: {}
            })
            console.log('✅ Janela de Autenticação Item 13 aberta!')
          } },
          {
            id: 'autenticacao-firmas',
            label: 'Autenticação Eletrônica',
            icon: '',
              submenu: [
                { id: 'antecedentes-pf', label: 'Antecedentes PF', icon: '', onClick: () => {
                  openWindow({
                    id: 'firmas-pf-window',
                    type: 'firmas-antecedentes-pf',
                    title: 'Antecedentes PF',
                    component: FirmasPageIsolated,
                    props: {}
                  })
                } },
                { id: 'antecedentes-ssp', label: 'Antecedentes SSP', icon: '', onClick: () => {
                  openWindow({
                    id: 'firmas-ssp-window',
                    type: 'firmas-antecedentes-ssp',
                    title: 'Antecedentes SSP',
                    component: FirmasPageIsolated,
                    props: {}
                  })
                } },
                { id: 'antecedente-epol', label: 'Antecedente Epol', icon: '', onClick: () => {
                  openWindow({
                    id: 'firmas-epol-window',
                    type: 'firmas-antecedente-epol',
                    title: 'Antecedente Epol',
                    component: FirmasPageIsolated,
                    props: {}
                  })
                } },
                { id: 'certificado-digital', label: 'Certificado Digital', icon: '', onClick: () => {
                  openWindow({
                    id: 'firmas-cert-window',
                    type: 'firmas-certificado-digital',
                    title: 'Certificado Digital',
                    component: FirmasPageIsolated,
                    props: {}
                  })
                } },
                { id: 'certidao-naturalizacao', label: 'Certidão de Naturalização', icon: '', onClick: () => {
                  openWindow({
                    id: 'firmas-nat-window',
                    type: 'firmas-certidao-naturalizacao',
                    title: 'Certidão de Naturalização',
                    component: FirmasPageIsolated,
                    props: {}
                  })
                } },
                { id: 'cnh-digital', label: 'CNH Digital', icon: '', onClick: () => {
                  openWindow({
                    id: 'firmas-cnh-window',
                    type: 'firmas-cnh-digital',
                    title: 'CNH Digital',
                    component: FirmasPageIsolated,
                    props: {}
                  })
                } },
                { id: 'qrcode', label: 'QRCODE', icon: '', onClick: () => {
                  openWindow({
                    id: 'firmas-qr-window',
                    type: 'firmas-qrcode',
                    title: 'QRCODE',
                    component: FirmasPageIsolated,
                    props: {}
                  })
                } },
                { id: 'rg-digital', label: 'RG Digital', icon: '', onClick: () => {
                  openWindow({
                    id: 'firmas-rg-window',
                    type: 'firmas-rg-digital',
                    title: 'RG Digital',
                    component: FirmasPageIsolated,
                    props: {}
                  })
                } },
                { id: 'tjsp', label: 'TJSP', icon: '', onClick: () => {
                  openWindow({
                    id: 'firmas-tjsp-window',
                    type: 'firmas-tjsp',
                    title: 'TJSP',
                    component: FirmasPageIsolated,
                    props: {}
                  })
                } },
                { id: 'tse', label: 'TSE', icon: '', onClick: () => {
                  openWindow({
                    id: 'firmas-tse-window',
                    type: 'firmas-tse',
                    title: 'TSE',
                    component: FirmasPageIsolated,
                    props: {}
                  })
                } }
              ]
          }
        ]
      },
    ]

    // Aplicar filtro de configuração de menus e permissões
    const textualMenuItems = filterMenusByConfig(rawTextualMenuItems)

    // Configuração do Menu de Ícones (Menu 2) - Ícones de acesso rápido
    const rawIconMenuItems = [
        { id: 'cadastro-cliente', label: 'Cadastro de Cliente', icon: '👤', onClick: () => {
          console.log('✅ ÍCONE CADASTRO CLIENTE CLICADO! Abrindo janela...')
          const windowId = 'cliente-window'
          openWindow({
            id: windowId,
            type: 'cliente',
            title: 'Cliente',
            component: ClientePageIsolated,
            props: {}
          })
          console.log('✅ Janela de Cliente aberta!')
        } },
      { id: 'firmas', label: 'Firmas', icon: '✍️', onClick: () => {
        console.log('✅ FIRMAS CLICADO! Abrindo janela...')
        openWindow({
          id: 'firmas-window',
          type: 'firmas',
          title: 'Firmas',
          component: FirmasPageIsolated,
          props: {}
        })
        console.log('✅ Janela de Firmas aberta!')
      } },
      { id: 'nascimento', label: 'Nascimento', icon: '👶', onClick: () => (window as any).navigateToPage?.('nascimento') },
      { id: 'casamento', label: 'Casamento', icon: '💍', onClick: () => (window as any).navigateToPage?.('casamento') },
      { id: 'obito', label: 'Óbito', icon: '⚰️', onClick: () => (window as any).navigateToPage?.('obito') },
      { id: 'livro', label: 'Livro e', icon: '📖', onClick: () => (window as any).navigateToPage?.('livro') },
      { id: 'digitalizacao', label: 'Digitalização', icon: <ScannerIcon size={28} />, onClick: () => {
        console.log('🖨️ Abrindo Controle de Digitalização...')
        openWindow({
          id: 'controle-digitalizacao-window',
          type: 'controle-digitalizacao',
          title: 'Controle de Digitalização de Imagens',
          component: ControleDigitalizacaoPageIsolated,
          props: {}
        })
      } },
      { id: 'indices', label: 'Índices', icon: '📊', onClick: () => {
        console.log('📊 Abrindo Índices...')
        openWindow({
          id: `indices-${Date.now()}`,
          type: 'indices',
          title: 'Índices - Nascimento, Casamento, Óbito, Proclamas',
          component: IndicesPageIsolated,
          props: {}
        })
      } },
      { id: 'login', label: 'Logoff', icon: '🔐', onClick: () => console.log('Logoff clicado') },
      { id: 'logout', label: 'Sair', icon: '🚪', onClick: handleLogout }
    ]

    // Mapeamento entre IDs dos ícones da toolbar e IDs dos menus
    const toolbarToMenuMapping: { [key: string]: string } = {
      'cadastro-cliente': 'cliente',
      'firmas': 'firmas',
      'nascimento': 'lavratura-nascimento',
      'casamento': 'lavratura-casamento',
      'obito': 'lavratura-obito',
      'livro': 'livro-e-menu',
      'digitalizacao': 'digitalizacao-controle',
      'indices': 'indices-principais',
      'login': 'login', // Sempre visível
      'logout': 'logout' // Sempre visível
    }

    // Filtrar ícones baseado na visibilidade dos menus correspondentes
    const filterToolbarIcons = (icons: any[]) => {
      try {
        const savedConfig = localStorage.getItem('menu-config')
        console.log('🔍 Filtrando ícones da toolbar... Config salva:', savedConfig ? 'SIM' : 'NÃO')
        
        if (!savedConfig) return icons // Se não há config, mostra tudo
        
        const config = JSON.parse(savedConfig)
        
        // Criar mapa de visibilidade
        const visibilityMap = new Map<string, boolean>()
        
        const buildVisibilityMap = (configItems: any[]) => {
          configItems.forEach((item: any) => {
            visibilityMap.set(item.id, item.visible)
            if (item.submenu) {
              buildVisibilityMap(item.submenu)
            }
          })
        }
        
        buildVisibilityMap(config)
        
        // Filtrar ícones
        const filtered = icons.filter((icon: any) => {
          const menuId = toolbarToMenuMapping[icon.id]
          
          // Se não há mapeamento ou é login/logout, sempre mostra
          if (!menuId || icon.id === 'login' || icon.id === 'logout') {
            console.log(`  ✅ Ícone ${icon.id}: SEMPRE VISÍVEL`)
            return true
          }
          
          const isVisible = visibilityMap.get(menuId) !== false
          console.log(`  ${isVisible ? '✅' : '❌'} Ícone ${icon.id} (menu: ${menuId}): ${isVisible ? 'VISÍVEL' : 'OCULTO'}`)
          
          return isVisible
        })
        
        console.log(`✅ Ícones filtrados: ${filtered.length}/${icons.length}`)
        return filtered
      } catch (error) {
        console.error('❌ Erro ao filtrar ícones:', error)
        return icons
      }
    }

    // Aplicar filtro de configuração de menus aos ícones
    console.log(`🔄 Recalculando menu de ícones (versão: ${menuConfigVersion})`)
    const iconMenuItems = filterToolbarIcons(rawIconMenuItems)

    return (
      <div style={{
        height: '100vh',
        background: 'var(--background-color)', // 🚨 CORREÇÃO: Usar variável CSS
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: 'var(--text-color)', // 🚨 CORREÇÃO: Usar variável CSS
        overflow: 'hidden'  // Mantém hidden aqui - o scroll é no main
      }}>

        {/* Header com Controles de Janela */}
             <div style={{
               background: accessibility.currentTheme === 'dark' ? '#004D40' : '#00796B',
               backdropFilter: 'blur(20px)',
               padding: '4px 16px',
               borderBottom: '1px solid var(--border-color)', // 🚨 CORREÇÃO: Usar variável CSS
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          height: '32px',
          minHeight: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1001
          }}>
          {/* Logo Civitas */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginLeft: '16px'
        }}>
          <CivitasLogo 
            size={24} 
            theme={accessibility.currentTheme === 'highContrast' ? 'dark' : accessibility.currentTheme} 
            showText={true}
            textColor="#ffffff"
          />
        </div>

          {/* Controles de Janela */}
          <div data-window-controls>
          <WindowControls
            onClose={windowState.close}
            onMinimize={windowState.minimize}
            onMaximize={windowState.maximize}
          />
          </div>
        </div>

        {/* Menu Textual (Menu 1) - PROTEGIDO COM MICRO-FRONTEND */}
        <ErrorBoundary moduleName="Menu Textual">
          <ProtectedMenu 
            menuType="TEXTUAL_MENU"
            style={{ marginTop: '10px' }}
            data-responsive-menu
          >
            <TextualMenu 
              items={textualMenuItems}
              isExpanded={isTextualMenuExpanded}
              onToggleExpanded={() => setIsTextualMenuExpanded(!isTextualMenuExpanded)}
            />
          </ProtectedMenu>
        </ErrorBoundary>

        {/* Menu de Ícones (Menu 2) - PROTEGIDO COM MICRO-FRONTEND */}
        <ErrorBoundary moduleName="Menu de Ícones / Toolbar">
          <ProtectedMenu 
            menuType="ICON_MENU"
            data-responsive-menu
          >
            <IconMenu 
              items={iconMenuItems}
              onOpenSideMenu={() => setIsSideMenuOpen(true)}
            />
          </ProtectedMenu>
        </ErrorBoundary>

        {/* Menu lateral - PROTEGIDO COM MICRO-FRONTEND */}
        <ErrorBoundary moduleName="Menu Lateral do Usuário">
          <SideMenu 
            isOpen={isSideMenuOpen}
            onClose={() => setIsSideMenuOpen(false)}
            user={user}
            onLogout={handleLogout}
            onOpenConfigurations={() => setShowConfiguracoes(true)}
            onOpenMaternidade={navigateToMaternidade}
            onOpenControladorSenha={() => {
            openWindow({
              id: 'controlador-senha-window',
              type: 'controlador-senha',
              title: 'Controlador de Senhas',
              component: ControladorSenhaPageIsolated,
              props: {}
            })
            }}
            onOpenConfiguracaoSenha={() => {
            openWindow({
              id: 'configuracao-senha-window',
              type: 'configuracao-senha',
              title: 'Configuração de Senhas',
              component: ConfiguracaoSenhaPageIsolated,
              props: {}
            })
            }}
            onOpenPainelSenhas={() => {
            openWindow({
              id: 'painel-senhas-window',
              type: 'painel-senhas',
              title: 'Painel Administrativo de Senhas',
              component: PainelSenhasPageIsolated,
              props: {}
            })
            }}
            onOpenGerenciamentoGuiches={() => {
            // 🔄 Gerenciamento de Guichês agora é uma aba dentro de Funcionário
            openWindow({
              id: 'funcionario-window',
              type: 'funcionario',
              title: 'Funcionário',
              component: FuncionarioPageIsolated,
              props: { abaInicial: 'guiches' }
            })
            }}
          />
        </ErrorBoundary>

        {/* Abas Móveis - Aparecem apenas na Tela 2 */}
        <MovableTabs
          tabs={movableTabs}
          onTabUpdate={handleTabUpdate}
          onTabClose={handleTabClose}
          onTabMinimize={handleTabMinimize}
        />

        {/* Área de Conteúdo Principal - COM SCROLL DINÂMICO */}
        <div 
          className="main-content-area"
          style={{
            flex: 1,
            background: 'var(--background-color)', // 🚨 CORREÇÃO: Usar variável CSS em vez de theme.background
            position: 'relative',
            marginTop: '120px', // Espaço para os dois menus
            overflow: 'auto',   // ← ATIVA O SCROLL!
            overflowX: 'auto',
            overflowY: 'auto'
          }}
        >
          {/* Container interno expansível para as janelas */}
          <div style={{
            position: 'relative',
            minHeight: '200vh',  // 2x a altura da tela
            minWidth: '200vw',   // 2x a largura da tela
            width: '100%',
            height: '100%'
          }}>
            {/* Área vazia - janelas aparecem aqui via WindowManager */}
          </div>
        </div>

        {/* Navigation Manager */}
        <NavigationManager 
          isDarkMode={isDark} 
          user={user}
          currentPage={currentPage}
          pageProps={pageProps}
          onClosePage={closeCurrentPage}
        />
        
        {/* Configurações */}
        {showConfiguracoes && (
          <ConfiguracoesPage
            onClose={() => setShowConfiguracoes(false)}
            isDarkMode={isDark}
            onThemeChange={(isDark) => {
              setIsDarkMode(isDark)
              accessibility.setTheme(isDark ? 'dark' : 'light')
            }}
            userRole={user?.role}
          />
        )}

        {/* Configurações de Acessibilidade */}
        {showAccessibilitySettings && (
          <AccessibilitySettingsPage 
            onClose={() => setShowAccessibilitySettings(false)}
            isDarkMode={isDark}
          />
        )}

        {/* Overlay de Configurações */}
        <ConfigOverlay
          isOpen={showConfigOverlay}
          onClose={() => setShowConfigOverlay(false)}
          onOpenAccessibilitySettings={() => setShowAccessibilitySettings(true)}
        />

        {/* Prompt de Senha para Maternidade */}
        <PasswordPrompt
          isOpen={showPasswordPrompt}
          onClose={() => setShowPasswordPrompt(false)}
          onSuccess={handlePasswordSuccess}
          title="Acesso ao Módulo Maternidade"
          message="Este módulo requer senha de acesso. Digite a senha para continuar:"
        />

        {/* Sistema de Múltiplas Janelas */}
        <WindowRenderer />

        {/* Aviso de Logout Automático */}
        {autoLogout.showWarning && (
          <AutoLogoutWarning 
            remainingSeconds={autoLogout.remainingTime}
            onCancel={autoLogout.cancelLogout}
          />
        )}
      </div>
    )
  }

  // Tela de Login
  const loginTheme = {
    background: isDarkMode 
      ? '#0f172a'
      : '#f3f4f6',
    cardBg: isDarkMode 
      ? 'rgba(30, 41, 59, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    text: isDarkMode ? '#f1f5f9' : '#1e293b',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? 'rgba(148, 163, 184, 0.3)' : 'rgba(30, 41, 59, 0.2)',
    buttonBg: isDarkMode ? '#3b82f6' : '#1e40af',
    buttonHover: isDarkMode ? '#2563eb' : '#1d4ed8',
    inputBg: isDarkMode ? '#1e293b' : '#ffffff',
    inputBorder: isDarkMode ? '#475569' : '#D1D1D1'
  }

  return (
    <div style={{
      height: '100vh',
      background: loginTheme.background,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative'
    }}>
      {/* Botões de Acessibilidade - Canto Superior Direito */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        gap: '8px',
        zIndex: 1000
      }}>
        {/* Botão Leitor de Tela */}
        <button
          aria-label="Ativar ou desativar leitor de tela"
          aria-pressed={accessibility.settings.screenReader}
          role="button"
          tabIndex={0}
          onClick={() => {
            const currentState = accessibility.settings.screenReader
            const newState = !currentState
            
            accessibility.updateSettings({ screenReader: newState })
            
            // Anunciar o novo estado (não o estado anterior)
            const message = newState ? 'Leitor de tela ativado' : 'Leitor de tela desativado'
            
            // Anunciar apenas se leitor de tela estiver ativo (usar newState, não o estado anterior)
            if (newState && window.speechSynthesis) {
              const utterance = new SpeechSynthesisUtterance(message)
              utterance.volume = 0.8
              utterance.rate = 0.9
              speechSynthesis.speak(utterance)
            }
            
            // Anunciar via sistema de acessibilidade (usar newState)
            accessibility.announceToScreenReader(message, 'polite', !newState)
            
            console.log('🔊 Estado do leitor de tela alterado:', { anterior: currentState, novo: newState, mensagem: message })
          }}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: `1px solid ${loginTheme.border}`,
            background: accessibility.settings.screenReader ? '#10b981' : loginTheme.inputBg,
            color: accessibility.settings.screenReader ? 'white' : loginTheme.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
          title={accessibility.settings.screenReader ? 'Desativar Leitor de Tela' : 'Ativar Leitor de Tela'}
        >
          🔊
        </button>

        {/* Botão Daltonismo */}
        <button
          aria-label="Alternar entre modos de daltonismo"
          aria-pressed={accessibility.settings.contrastLevel !== 'normal'}
          role="button"
          tabIndex={0}
          onClick={() => {
            // Ciclar entre os 4 tipos de daltonismo
            const currentLevel = accessibility.settings.contrastLevel
            let newLevel: 'normal' | 'light' | 'dark' | 'extreme'
            let message: string
            
            switch (currentLevel) {
              case 'normal':
                newLevel = 'light'
                message = 'Modo protanopia ativado'
                break
              case 'light':
                newLevel = 'dark'
                message = 'Modo deuteranopia ativado'
                break
              case 'dark':
                newLevel = 'extreme'
                message = 'Modo tritanopia ativado'
                break
              default:
                newLevel = 'normal'
                message = 'Modo normal ativado'
            }
            
            accessibility.setContrastLevel(newLevel)
            
            // Anunciar apenas se leitor de tela estiver ativo
            if (accessibility.settings.screenReader && window.speechSynthesis) {
              const utterance = new SpeechSynthesisUtterance(message)
              utterance.volume = 0.8
              utterance.rate = 0.9
              speechSynthesis.speak(utterance)
            }
            accessibility.announceToScreenReader(message, 'polite', false)
          }}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: `1px solid ${loginTheme.border}`,
            background: accessibility.settings.contrastLevel !== 'normal' ? '#8b5cf6' : loginTheme.inputBg,
            color: accessibility.settings.contrastLevel !== 'normal' ? 'white' : loginTheme.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
          title={`Daltonismo - ${accessibility.settings.contrastLevel === 'normal' ? 'Normal' : accessibility.settings.contrastLevel === 'light' ? 'Protanopia' : accessibility.settings.contrastLevel === 'dark' ? 'Deuteranopia' : 'Tritanopia'}`}
        >
          🎨
        </button>

        {/* Botão Alto Contraste */}
        <button
          aria-label="Ativar ou desativar alto contraste"
          aria-pressed={accessibility.settings.highContrast}
          role="button"
          tabIndex={0}
          onClick={() => {
            accessibility.toggleHighContrast()
            // Anunciar apenas se leitor de tela estiver ativo
            if (accessibility.settings.screenReader && window.speechSynthesis) {
              const utterance = new SpeechSynthesisUtterance(
                accessibility.settings.highContrast ? 'Alto contraste desativado' : 'Alto contraste ativado'
              )
              utterance.volume = 0.8
              utterance.rate = 0.9
              speechSynthesis.speak(utterance)
            }
            accessibility.announceToScreenReader(
              accessibility.settings.highContrast ? 'Alto contraste desativado' : 'Alto contraste ativado',
              'polite'
            )
          }}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: `1px solid ${loginTheme.border}`,
            background: accessibility.settings.highContrast ? '#f59e0b' : loginTheme.inputBg,
            color: accessibility.settings.highContrast ? 'white' : loginTheme.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
          title={accessibility.settings.highContrast ? 'Desativar Alto Contraste' : 'Ativar Alto Contraste'}
        >
          ⚫⚪
        </button>

        {/* Botão Tema Light/Dark */}
        <button
          aria-label="Alternar entre modo claro e escuro"
          aria-pressed={accessibility.currentTheme === 'dark'}
          role="button"
          tabIndex={0}
          onClick={() => {
            const newTheme = accessibility.currentTheme === 'dark' ? 'light' : 'dark'
            console.log('🔄 Botão de tema clicado - Mudando de', accessibility.currentTheme, 'para', newTheme)
            accessibility.setTheme(newTheme)
            
            // Anunciar apenas se leitor de tela estiver ativo
            if (accessibility.settings.screenReader && window.speechSynthesis) {
              const utterance = new SpeechSynthesisUtterance(
                newTheme === 'dark' ? 'Modo escuro ativado' : 'Modo claro ativado'
              )
              utterance.volume = 0.8
              utterance.rate = 0.9
              speechSynthesis.speak(utterance)
            }
            accessibility.announceToScreenReader(
              newTheme === 'dark' ? 'Modo escuro ativado' : 'Modo claro ativado',
              'polite'
            )
          }}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: `1px solid ${loginTheme.border}`,
            background: accessibility.currentTheme === 'dark' ? '#1e293b' : '#fbbf24',
            color: accessibility.currentTheme === 'dark' ? '#fbbf24' : '#1e293b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
          title={accessibility.currentTheme === 'dark' ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
        >
          {accessibility.currentTheme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div style={{
        background: loginTheme.cardBg,
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: `1px solid ${loginTheme.border}`
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
        <div style={{
          marginBottom: '16px',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Logo baseado no tema */}
          <img 
            src={accessibility.currentTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
            alt="Logo CIVITAS"
            width={80}
            height={80}
            style={{
              objectFit: 'contain',
              marginBottom: '16px'
            }}
          />
          <span style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}>
            Logo do sistema CIVITAS - Balança de justiça com documento e silhueta de cidade
          </span>
        </div>
        
        <h1 style={{ 
          fontSize: getRelativeFontSize(32), 
          fontWeight: '700',
            margin: '0 0 8px 0',
          color: accessibility.currentTheme === 'dark' ? '#ffffff' : '#2D5A5A',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>
          CIVITAS
        </h1>
          
        <p style={{ 
          color: loginTheme.textSecondary,
            margin: '0',
            fontSize: getRelativeFontSize(16)
        }}>
          Faça login para continuar
        </p>
        </div>
        
        {error && (
          <div 
            role="alert"
            aria-live="assertive"
            style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px',
            color: '#ef4444',
            fontSize: getRelativeFontSize(14),
            fontWeight: '500'
            }}
          >
            {error}
          </div>
        )}
        
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(e); }}>
        <div style={{ marginBottom: '24px' }}>
          <label 
            htmlFor="email-input"
            style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: getRelativeFontSize(14),
            fontWeight: '500',
            color: loginTheme.text
            }}
          >
            Email ou Login
          </label>
          <input 
            id="email-input"
            type="text" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-required="true"
            aria-invalid={error ? 'true' : 'false'}
            placeholder="Digite seu email ou login"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${loginTheme.inputBorder}`,
              borderRadius: '8px',
              fontSize: getRelativeFontSize(16),
              background: loginTheme.inputBg,
              color: loginTheme.text,
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = loginTheme.border}
          />
        </div>
        
        <div style={{ marginBottom: '32px' }}>
          <label 
            htmlFor="password-input"
            style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: getRelativeFontSize(14),
            fontWeight: '500',
            color: loginTheme.text
            }}
          >
            Senha
          </label>
          <input 
            id="password-input"
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-required="true"
            aria-invalid={error ? 'true' : 'false'}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${loginTheme.inputBorder}`,
              borderRadius: '8px',
              fontSize: getRelativeFontSize(16),
              background: loginTheme.inputBg,
              color: loginTheme.text,
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = loginTheme.border}
          />
        </div>
        
        <div id="login-description" style={{ display: 'none' }}>
          Botão para fazer login no sistema com as credenciais fornecidas
        </div>
        
        <button 
          onClick={handleLogin}
          disabled={isLoading}
          aria-label="Fazer login no sistema"
          aria-describedby="login-description"
          role="button"
          tabIndex={0}
          style={{
            width: '100%',
            padding: '12px 24px',
            background: isLoading ? loginTheme.textSecondary : loginTheme.buttonBg,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: getRelativeFontSize(16),
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '24px'
          }}
          onMouseOver={(e) => {
            if (!isLoading) {
              (e.target as HTMLButtonElement).style.background = loginTheme.buttonHover
            }
          }}
          onMouseOut={(e) => {
            if (!isLoading) {
              (e.target as HTMLButtonElement).style.background = loginTheme.buttonBg
            }
          }}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
        </form>
        
        <div style={{ 
          textAlign: 'center',
          fontSize: '12px',
          color: loginTheme.textSecondary,
          lineHeight: '1.5'
        }}>
          <p style={{ margin: '4px 0' }}>👤 admin@cartorio.com / admin123</p>
          <p style={{ margin: '4px 0' }}>👥 funcionario@cartorio.com / func123</p>
        </div>

      </div>

    </div>
  )
}

// Função principal que envolve tudo com o WindowProvider
function App() {
  return (
    <ThemeProtector>
      <WindowProvider>
        <FormDataProvider>
          <AppContent />
          <SystemStatus showDetails={false} position="bottom-left" />
          <InstanceNotification position="top-left" />
          {/* Badge de Navegação por Teclado - Aparece/Desaparece automaticamente */}
          <KeyboardIndicator key="keyboard-indicator" />
        </FormDataProvider>
      </WindowProvider>
    </ThemeProtector>
  )
}

export default App