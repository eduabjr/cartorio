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
import { ClientePage } from './pages/ClientePage'
import { FuncionarioPage } from './pages/FuncionarioPage'
import { FirmasPage } from './pages/FirmasPage'
import { TipoDocumentoDigitalizadoPage } from './pages/TipoDocumentoDigitalizadoPage'
import { CartorioSeadePage } from './pages/CartorioSeadePage'
import { DNVDOBloqueadasPage } from './pages/DNVDOBloqueadasPage'
import { OficiosMandadosPage } from './pages/OficiosMandadosPage'
import { ScannerIcon } from './components/ScannerIcon'
import { CivitasLogo } from './components/CivitasLogo'
import { SystemStatus } from './components/SystemStatus'
import { InstanceNotification } from './components/InstanceNotification'
import { useAccessibility } from './hooks/useAccessibility'
import { useWindowState } from './hooks/useWindowState'
import { getRelativeFontSize } from './utils/fontUtils'
import { announcementService } from './services/AnnouncementService'
import { WindowProvider, useWindowManager } from './contexts/WindowContext'
import { FormDataProvider } from './contexts/FormDataContext'
import { singleInstanceService } from './services/SingleInstanceService'
import { ThemeProtector } from './components/ThemeProtector'

interface User {
  id: string
  email: string
  name: string
  role: string
}

// Componente para renderizar múltiplas janelas
function WindowRenderer() {
  const { windows, closeWindow } = useWindowManager()
  
  return (
    <>
      {windows.map((window) => {
        const Component = window.component
        return (
          <Component
            key={window.id}
            windowId={window.id}
            initialPosition={window.position}
            initialZIndex={window.zIndex}
            isMinimized={window.isMinimized}
            isMaximized={window.isMaximized}
            {...window.props}
            onClose={() => {
              console.log('🔄 WindowRenderer onClose chamado para:', window.id)
              closeWindow(window.id)
            }}
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
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showConfiguracoes, setShowConfiguracoes] = useState(false)
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false)
  const [isTextualMenuExpanded, setIsTextualMenuExpanded] = useState(false)
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [showConfigOverlay, setShowConfigOverlay] = useState(false)
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
  
  
  // Sincronizar isDarkMode com o tema do hook de acessibilidade
  useEffect(() => {
    setIsDarkMode(accessibility.currentTheme === 'dark')
        // Aplicar tema ao body com cor única
        document.body.style.background = accessibility.currentTheme === 'dark' 
          ? '#121212'
          : '#E1E1E1'
  }, [accessibility.currentTheme])

  // Estados para navegação
  const [currentPage, setCurrentPage] = useState<string | null>(null)
  const [pageProps, setPageProps] = useState<any>({})

  // Funções de navegação globais
  const navigateToPage = useCallback((pageId: string, props: any = {}) => {
    try {
      console.log('=== NAVEGAÇÃO INICIADA ===')
      console.log('Página:', pageId)
      console.log('Props:', props)
      
      // Verificar se a página já está aberta
      if (singleInstanceService.isOpen(pageId)) {
        console.log(`🔄 Página ${pageId} já está aberta, fechando e reabrindo na posição original...`)
        
        // Fechar a página existente e reabrir na posição original
        singleInstanceService.close(pageId)
        
        // Aguardar um momento para garantir que a página foi fechada
        setTimeout(() => {
          setCurrentPage(pageId)
          setPageProps({ 
            ...props, 
            resetToOriginalPosition: true,
            refreshTrigger: Date.now()
          })
        }, 100)
        
        // Mostrar notificação
        announcementService.announce(`Página ${pageId} foi reaberta na posição original`, { priority: 'normal' })
      } else {
        console.log(`🆕 Abrindo nova página ${pageId}...`)
        setCurrentPage(pageId)
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

  // Função de login simplificada
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Simular autenticação
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (email === 'admin@cartorio.com' && password === 'admin123') {
        setUser({
          id: '1',
          email: 'admin@cartorio.com',
          name: 'Administrador',
          role: 'admin'
        })
        setIsLoggedIn(true)
      } else if (email === 'funcionario@cartorio.com' && password === 'func123') {
        setUser({
          id: '2',
          email: 'funcionario@cartorio.com',
          name: 'Funcionário',
          role: 'employee'
        })
        setIsLoggedIn(true)
      } else {
        setError('Credenciais inválidas')
      }
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
    
    // Definir tema inicial
    if (savedTheme) {
      const isDark = savedTheme === 'dark'
      document.body.style.background = isDark 
        ? '#121212'
        : '#E1E1E1'
    }
  }, [])

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
    const theme = {
      background: accessibilityTheme.background,
      cardBg: accessibilityTheme.surface,
      text: accessibilityTheme.text,
      textSecondary: accessibilityTheme.textSecondary,
      border: accessibilityTheme.border,
      buttonBg: accessibilityTheme.primary,
      buttonHover: accessibilityTheme.accent,
      menuActive: accessibilityTheme.primary + '20',
      primary: accessibilityTheme.primary,
      secondary: accessibilityTheme.secondary,
      accent: accessibilityTheme.accent,
      surface: accessibilityTheme.surface,
      success: accessibilityTheme.success,
      warning: accessibilityTheme.warning,
      error: accessibilityTheme.error,
      info: accessibilityTheme.info
    }

    // Configuração do Menu Textual (Menu 1) - TODOS OS SUBMENUS ORIGINAIS RESTAURADOS
    const textualMenuItems = [
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
                component: ClientePage,
                props: {}
              })
              console.log('✅ Janela de Cliente aberta!')
            } },
            { id: 'funcionario', label: 'Funcionário', icon: '', onClick: () => {
              console.log('✅ FUNCIONÁRIO CLICADO! Abrindo janela...')
              const windowId = 'funcionario-window'
              openWindow({
                id: windowId,
                type: 'funcionario',
                title: 'Funcionário',
                component: FuncionarioPage,
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
                component: CartorioSeadePage,
                props: { onClose: () => {} }
              })
              console.log('✅ Janela de Cartório SEADE aberta!')
            } },
          { id: 'dnv-bloqueadas', label: 'DNV e DO Bloqueadas', icon: '', onClick: () => {
            console.log('✅ DNV E DO BLOQUEADAS CLICADO! Abrindo janela...')
            openWindow({
              id: 'dnv-do-bloqueadas-window',
              type: 'dnv-do-bloqueadas',
              title: 'Cadastro de Declaração Bloqueada',
              component: DNVDOBloqueadasPage,
              props: { onClose: () => {} }
            })
            console.log('✅ Janela de DNV e DO Bloqueadas aberta!')
          } },
          { id: 'oficios-mandados', label: 'Ofícios e Mandados', icon: '', onClick: () => {
            console.log('✅ OFÍCIOS E MANDADOS CLICADO! Abrindo janela...')
            openWindow({
              id: 'oficios-mandados-window',
              type: 'oficios-mandados',
              title: 'Controle de Ofícios e Mandados',
              component: OficiosMandadosPage,
              props: { onClose: () => {} }
            })
            console.log('✅ Janela de Ofícios e Mandados aberta!')
          } },
          { id: 'hospital', label: 'Hospital', icon: '', onClick: () => (window as any).navigateToPage?.('hospital') },
          { id: 'cemiterio', label: 'Cemitério', icon: '', onClick: () => (window as any).navigateToPage?.('cemiterio') },
          { id: 'funeraria', label: 'Funerária', icon: '', onClick: () => (window as any).navigateToPage?.('funeraria') },
          { id: 'cadastro-livros', label: 'Cadastro de Livros', icon: '', onClick: () => (window as any).navigateToPage?.('cadastro-livros') },
          {
            id: 'abertura-livros',
            label: 'Abertura de Livros',
            icon: '',
            submenu: [
              {
                id: 'casamento-livro',
                label: 'Casamento',
                icon: '',
                submenu: [
                  { id: 'casamento-abertura', label: 'Abertura', icon: '', onClick: () => (window as any).navigateToPage?.('casamento-abertura') },
                  { id: 'casamento-encerramento', label: 'Encerramento', icon: '', onClick: () => (window as any).navigateToPage?.('casamento-encerramento') }
                ]
              },
              {
                id: 'edital-proclamas-livro',
                label: 'Edital de Proclamas',
                icon: '',
                submenu: [
                  { id: 'edital-proclamas-abertura', label: 'Abertura', icon: '', onClick: () => (window as any).navigateToPage?.('edital-proclamas-abertura') },
                  { id: 'edital-proclamas-encerramento', label: 'Encerramento', icon: '', onClick: () => (window as any).navigateToPage?.('edital-proclamas-encerramento') }
                ]
              },
              {
                id: 'livro-e-livro',
                label: 'Livro E',
                icon: '',
                submenu: [
                  { id: 'livro-e-abertura', label: 'Abertura', icon: '', onClick: () => (window as any).navigateToPage?.('livro-e-abertura') },
                  { id: 'livro-e-encerramento', label: 'Encerramento', icon: '', onClick: () => (window as any).navigateToPage?.('livro-e-encerramento') }
                ]
              },
              {
                id: 'nascimento-livro',
                label: 'Nascimento',
                icon: '',
                submenu: [
                  { id: 'nascimento-abertura', label: 'Abertura', icon: '', onClick: () => (window as any).navigateToPage?.('nascimento-abertura') },
                  { id: 'nascimento-encerramento', label: 'Encerramento', icon: '', onClick: () => (window as any).navigateToPage?.('nascimento-encerramento') }
                ]
              },
              {
                id: 'remissivo-livro',
                label: 'Remissivo',
                icon: '',
                submenu: [
                  { id: 'remissivo-abertura', label: 'Abertura', icon: '', onClick: () => (window as any).navigateToPage?.('remissivo-abertura') },
                  { id: 'remissivo-encerramento', label: 'Encerramento', icon: '', onClick: () => (window as any).navigateToPage?.('remissivo-encerramento') }
                ]
              },
              {
                id: 'obito-livro',
                label: 'Óbito',
                icon: '',
                submenu: [
                  { id: 'obito-abertura', label: 'Abertura', icon: '', onClick: () => (window as any).navigateToPage?.('obito-abertura') },
                  { id: 'obito-encerramento', label: 'Encerramento', icon: '', onClick: () => (window as any).navigateToPage?.('obito-encerramento') }
                ]
              },
              { id: 'lombada-livro', label: 'Lombada de Livro', icon: '', onClick: () => (window as any).navigateToPage?.('lombada-livro') }
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
            submenu: [
              { id: 'config-sistema-feriados', label: 'Feriados', icon: '', onClick: () => (window as any).navigateToPage?.('config-sistema-feriados') },
              { id: 'config-sistema-ibge', label: 'IBGE', icon: '', onClick: () => (window as any).navigateToPage?.('config-sistema-ibge') },
              { id: 'config-sistema-pais', label: 'País', icon: '', onClick: () => (window as any).navigateToPage?.('config-sistema-pais') },
              { id: 'config-sistema-cep', label: 'CEP', icon: '', onClick: () => (window as any).navigateToPage?.('config-sistema-cep') },
              { id: 'config-sistema-cidade', label: 'Cidade', icon: '', onClick: () => (window as any).navigateToPage?.('config-sistema-cidade') },
              { id: 'cadastros-tipos-documento', label: 'Tipos de Documento Digitalizado', icon: '', onClick: () => {
                console.log('✅ Abrindo Tipos de Documento Digitalizado...')
                openWindow({
                  id: 'tipo-doc-window',
                  type: 'tipo-documento',
                  title: 'Cadastro de Tipo de Documento Digitalizado',
                  component: TipoDocumentoDigitalizadoPage,
                  props: { onClose: () => {} }
                })
              } }
            ]
          }
        ]
      },
      {
        id: 'processos',
        label: 'Processos',
        icon: '',
        submenu: [
          { id: 'recepcao-arquivo-funeraria', label: 'Recepção de Arquivo da Funerária', icon: '', onClick: () => (window as any).navigateToPage?.('recepcao-arquivo-funeraria') },
          { id: 'recepcao-arquivo-maternidade', label: 'Recepção de Arquivo da Maternidade', icon: '', onClick: () => (window as any).navigateToPage?.('recepcao-arquivo-maternidade') }
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
          { id: 'protocolo-lancamento', label: 'Lançamento', icon: '', onClick: () => (window as any).navigateToPage?.('protocolo-lancamento') },
          { id: 'protocolo-baixa', label: 'Baixa', icon: '', onClick: () => (window as any).navigateToPage?.('protocolo-baixa') },
          { id: 'protocolo-cancelamento', label: 'Cancelamento', icon: '', onClick: () => (window as any).navigateToPage?.('protocolo-cancelamento') }
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
          { id: 'indice-casamento', label: 'Casamento', icon: '', onClick: () => (window as any).navigateToPage?.('indice-casamento') },
          { id: 'indice-edital-proclamas', label: 'Edital de Proclamas', icon: '', onClick: () => (window as any).navigateToPage?.('indice-edital-proclamas') },
          { id: 'indice-nascimento', label: 'Nascimento', icon: '', onClick: () => (window as any).navigateToPage?.('indice-nascimento') },
          { id: 'indice-obito', label: 'Óbito', icon: '', onClick: () => (window as any).navigateToPage?.('indice-obito') },
          { id: 'indice-livro', label: 'Livro E', icon: '', onClick: () => (window as any).navigateToPage?.('indice-livro') },
          { id: 'indice-procuracao', label: 'Índice de Procuração', icon: '', onClick: () => (window as any).navigateToPage?.('indice-procuracao') }
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
          { id: 'remessa-guia-seade', label: 'Guia SEADE', icon: '', onClick: () => (window as any).navigateToPage?.('remessa-guia-seade') },
          { id: 'remessa-arquivo-seade', label: 'Arquivo SEADE', icon: '', onClick: () => (window as any).navigateToPage?.('remessa-arquivo-seade') },
          { id: 'remessa-intranet', label: 'INTRANET', icon: '', onClick: () => (window as any).navigateToPage?.('remessa-intranet') }
        ]
      },
      {
        id: 'digitalizacao',
        label: 'Digitalização',
        icon: '',
        submenu: [
          { id: 'digitalizacao-controle', label: 'Controle de Digitalização', icon: '', onClick: () => (window as any).navigateToPage?.('digitalizacao-controle') },
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
              component: FirmasPage,
              props: { onClose: () => {} }
            })
            console.log('✅ Janela de Firmas aberta!')
          } },
          { id: 'documento-desentranhado', label: 'Documento Desentranhado', icon: '', onClick: () => {
            console.log('✅ DOCUMENTO DESENTRANHADO CLICADO! Abrindo janela...')
            openWindow({
              id: 'firmas-doc-window',
              type: 'firmas-documento-desentranhado',
              title: 'Documento Desentranhado',
              component: FirmasPage,
              props: { onClose: () => {} }
            })
            console.log('✅ Janela de Documento Desentranhado aberta!')
          } },
          { id: 'autenticacao-item-13', label: 'Autenticação Item 13', icon: '', onClick: () => {
            console.log('✅ AUTENTICAÇÃO ITEM 13 CLICADO! Abrindo janela...')
            openWindow({
              id: 'firmas-auth-window',
              type: 'firmas-autenticacao-item13',
              title: 'Autenticação Item 13',
              component: FirmasPage,
              props: { onClose: () => {} }
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
                    component: FirmasPage,
                    props: { onClose: () => {} }
                  })
                } },
                { id: 'antecedentes-ssp', label: 'Antecedentes SSP', icon: '', onClick: () => {
                  openWindow({
                    id: 'firmas-ssp-window',
                    type: 'firmas-antecedentes-ssp',
                    title: 'Antecedentes SSP',
                    component: FirmasPage,
                    props: { onClose: () => {} }
                  })
                } },
                { id: 'antecedente-epol', label: 'Antecedente Epol', icon: '', onClick: () => {
                  openWindow({
                    id: 'firmas-epol-window',
                    type: 'firmas-antecedente-epol',
                    title: 'Antecedente Epol',
                    component: FirmasPage,
                    props: { onClose: () => {} }
                  })
                } },
                { id: 'certificado-digital', label: 'Certificado Digital', icon: '', onClick: () => {
                  openWindow({
                    id: 'firmas-cert-window',
                    type: 'firmas-certificado-digital',
                    title: 'Certificado Digital',
                    component: FirmasPage,
                    props: { onClose: () => {} }
                  })
                } },
                { id: 'certidao-naturalizacao', label: 'Certidão de Naturalização', icon: '', onClick: () => {
                  openWindow({
                    id: 'firmas-nat-window',
                    type: 'firmas-certidao-naturalizacao',
                    title: 'Certidão de Naturalização',
                    component: FirmasPage,
                    props: { onClose: () => {} }
                  })
                } },
                { id: 'cnh-digital', label: 'CNH Digital', icon: '', onClick: () => {
                  openWindow({
                    id: 'firmas-cnh-window',
                    type: 'firmas-cnh-digital',
                    title: 'CNH Digital',
                    component: FirmasPage,
                    props: { onClose: () => {} }
                  })
                } },
                { id: 'qrcode', label: 'QRCODE', icon: '', onClick: () => {
                  openWindow({
                    id: 'firmas-qr-window',
                    type: 'firmas-qrcode',
                    title: 'QRCODE',
                    component: FirmasPage,
                    props: { onClose: () => {} }
                  })
                } },
                { id: 'rg-digital', label: 'RG Digital', icon: '', onClick: () => {
                  openWindow({
                    id: 'firmas-rg-window',
                    type: 'firmas-rg-digital',
                    title: 'RG Digital',
                    component: FirmasPage,
                    props: { onClose: () => {} }
                  })
                } },
                { id: 'tjsp', label: 'TJSP', icon: '', onClick: () => {
                  openWindow({
                    id: 'firmas-tjsp-window',
                    type: 'firmas-tjsp',
                    title: 'TJSP',
                    component: FirmasPage,
                    props: { onClose: () => {} }
                  })
                } },
                { id: 'tse', label: 'TSE', icon: '', onClick: () => {
                  openWindow({
                    id: 'firmas-tse-window',
                    type: 'firmas-tse',
                    title: 'TSE',
                    component: FirmasPage,
                    props: { onClose: () => {} }
                  })
                } }
              ]
          }
        ]
      },
    ]

    // Configuração do Menu de Ícones (Menu 2) - Ícones de acesso rápido
    const iconMenuItems = [
        { id: 'cadastro-cliente', label: 'Cadastro de Cliente', icon: '👤', onClick: () => {
          console.log('✅ ÍCONE CADASTRO CLIENTE CLICADO! Abrindo janela...')
          const windowId = 'cliente-window'
          openWindow({
            id: windowId,
            type: 'cliente',
            title: 'Cliente',
            component: ClientePage,
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
          component: FirmasPage,
          props: { onClose: () => {} }
        })
        console.log('✅ Janela de Firmas aberta!')
      } },
      { id: 'nascimento', label: 'Nascimento', icon: '👶', onClick: () => (window as any).navigateToPage?.('nascimento') },
      { id: 'casamento', label: 'Casamento', icon: '💍', onClick: () => (window as any).navigateToPage?.('casamento') },
      { id: 'obito', label: 'Óbito', icon: '⚰️', onClick: () => (window as any).navigateToPage?.('obito') },
      { id: 'livro', label: 'Livro e', icon: '📖', onClick: () => (window as any).navigateToPage?.('livro') },
      { id: 'digitalizacao', label: 'Digitalização', icon: <ScannerIcon size={28} />, onClick: () => (window as any).navigateToPage?.('digitalizacao') },
      { id: 'login', label: 'Logoff', icon: '🔐', onClick: () => console.log('Logoff clicado') },
      { id: 'logout', label: 'Sair', icon: '🚪', onClick: handleLogout }
    ]

    return (
      <div style={{
        height: '100vh',
        background: accessibility.currentTheme === 'dark' ? theme.background : '#E0E0E0',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: theme.text,
        overflow: 'hidden'  // Mantém hidden aqui - o scroll é no main
      }}>

        {/* Header com Controles de Janela */}
             <div style={{
               background: accessibility.currentTheme === 'dark' ? '#004D40' : '#00796B',
               backdropFilter: 'blur(20px)',
               padding: '4px 16px',
               borderBottom: `1px solid ${theme.border}`,
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

        {/* Menu Textual (Menu 1) - PROTEGIDO */}
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

        {/* Menu de Ícones (Menu 2) - PROTEGIDO */}
        <ProtectedMenu 
          menuType="ICON_MENU"
          data-responsive-menu
        >
          <IconMenu 
            items={iconMenuItems}
            onOpenSideMenu={() => setIsSideMenuOpen(true)}
          />
        </ProtectedMenu>

        {/* Menu lateral */}
        <SideMenu 
          isOpen={isSideMenuOpen}
          onClose={() => setIsSideMenuOpen(false)}
          user={user}
          onLogout={handleLogout}
          onOpenConfigurations={() => setShowConfiguracoes(true)}
          onOpenMaternidade={navigateToMaternidade}
        />

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
            background: theme.background,
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
            Email
          </label>
          <input 
            id="email-input"
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        </FormDataProvider>
      </WindowProvider>
    </ThemeProtector>
  )
}

export default App