import { useState, useEffect, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MaternidadePage } from './pages/MaternidadePage'
import { ConfiguracoesPage } from './pages/ConfiguracoesPage'
import { AccessibilitySettingsPage } from './pages/AccessibilitySettingsPage'
import { RecepcaoArquivoMaternidade } from './components/RecepcaoArquivoMaternidade'
import { NavigationManager } from './components/NavigationManager'
import { FeedbackSystem } from './components/FeedbackSystem'
import { WindowControls } from './components/WindowControls'
import { TextualMenu } from './components/TextualMenu'
import { IconMenu } from './components/IconMenu'
import { SideMenu } from './components/SideMenu'
import { ConfigOverlay } from './components/ConfigOverlay'
import { PasswordPrompt } from './components/PasswordPrompt'
import { MovableTabs } from './components/MovableTabs'
import { ScannerIcon } from './components/ScannerIcon'
import { useAccessibility } from './hooks/useAccessibility'
import { useResponsive } from './hooks/useResponsive'
import { useResponsiveLayout } from './hooks/useResponsiveLayout'
import { useWindowState } from './hooks/useWindowState'
import { getRelativeFontSize } from './utils/fontUtils'
import { announcementService } from './services/AnnouncementService'

interface User {
  id: string
  email: string
  name: string
  role: string
}

function App() {
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
  const [movableTabs, setMovableTabs] = useState([])

  // Hooks de acessibilidade e responsividade
  const accessibility = useAccessibility()
  const responsive = useResponsive()
  const responsiveLayout = useResponsiveLayout()
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
      setCurrentPage(pageId)
      setPageProps(props)
    } catch (error) {
      console.error('Erro na navegação:', error)
    }
  }, [])

  const closeCurrentPage = useCallback(() => {
    try {
      console.log('=== FECHANDO PÁGINA ===')
      setCurrentPage(null)
      setPageProps({})
    } catch (error) {
      console.error('Erro ao fechar página:', error)
    }
  }, [])

  // Expor funções de navegação globalmente
  useEffect(() => {
    try {
      (window as any).navigateToPage = navigateToPage
      (window as any).closeCurrentPage = closeCurrentPage
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
      setIsDarkMode(isDark)
      document.body.style.background = isDark 
        ? '#121212'
        : '#E1E1E1'
    }
  }, [])

  // Monitorar mudanças no tema

  const handleLogin = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      // Simular delay de login
    await new Promise(resolve => setTimeout(resolve, 1000))
    
      // Validação simples
      if (email === 'admin@cartorio.com' && password === 'admin123') {
    const userData = {
      id: '1',
          email: email,
          name: 'Administrador',
          role: 'admin'
        }
    
    setUser(userData)
    setIsLoggedIn(true)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', 'fake-jwt-token')
        
        console.log('Login realizado com sucesso:', userData)
      } else if (email === 'funcionario@cartorio.com' && password === 'func123') {
        const userData = {
          id: '2',
          email: email,
          name: 'Funcionário',
          role: 'funcionario'
        }
        
        setUser(userData)
        setIsLoggedIn(true)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', 'fake-jwt-token')
        
        console.log('Login realizado com sucesso:', userData)
      } else if (email === 'teste@cartorio.com' && password === 'teste123') {
        const userData = {
          id: '3',
          email: email,
          name: 'Usuário Teste',
          role: 'teste'
        }
        
        setUser(userData)
        setIsLoggedIn(true)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', 'fake-jwt-token')
        
        console.log('Login realizado com sucesso:', userData)
    } else {
        setError('Credenciais inválidas')
      }
    } catch (err) {
      setError('Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem('user')
  }

  // Funções para gerenciar abas móveis
  const handleTabUpdate = (updatedTabs: any[]) => {
    setMovableTabs(updatedTabs)
  }

  const handleTabClose = (tabId: string) => {
    setMovableTabs(tabs => tabs.filter(tab => tab.id !== tabId))
  }

  const handleTabMinimize = (tabId: string) => {
    setMovableTabs(tabs => 
      tabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, isMinimized: !tab.isMinimized }
          : tab
      )
    )
    localStorage.removeItem('token')
    console.log('Logout realizado')
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
          { id: 'cliente', label: 'Firmas', icon: '', onClick: () => (window as any).navigateToPage?.('cliente') },
          { id: 'cartorio-seade', label: 'Cartório (SEADE)', icon: '', onClick: () => (window as any).navigateToPage?.('cartorio-seade') },
          { id: 'dnv-bloqueadas', label: 'DNV e DO Bloqueadas', icon: '', onClick: () => (window as any).navigateToPage?.('dnv-bloqueadas') },
          { id: 'modelos-procuração', label: 'Modelos e Minutas - Procuração', icon: '', onClick: () => (window as any).navigateToPage?.('modelos-procuração') },
          { id: 'oficios-mandados', label: 'Ofícios e Mandados', icon: '', onClick: () => (window as any).navigateToPage?.('oficios-mandados') },
          { id: 'hospital', label: 'Hospital', icon: '', onClick: () => (window as any).navigateToPage?.('hospital') },
          { id: 'cemiterio', label: 'Cemitério', icon: '', onClick: () => (window as any).navigateToPage?.('cemiterio') },
          { id: 'funeraria', label: 'Funerária', icon: '', onClick: () => (window as any).navigateToPage?.('funeraria') },
          { id: 'cadastro-livros', label: 'Cadastro de Livros', icon: '', onClick: () => (window as any).navigateToPage?.('cadastro-livros') },
          { 
            id: 'configuracao-sistema', 
            label: 'Configurações do Sistema', 
            icon: '', 
            submenu: [
              { id: 'config-sistema-funcionario', label: 'Funcionário', icon: '', onClick: () => (window as any).navigateToPage?.('config-sistema-funcionario') },
              { id: 'config-sistema-feriados', label: 'Feriados', icon: '', onClick: () => (window as any).navigateToPage?.('config-sistema-feriados') },
              { id: 'config-sistema-ibge', label: 'IBGE', icon: '', onClick: () => (window as any).navigateToPage?.('config-sistema-ibge') },
              { id: 'config-sistema-pais', label: 'País', icon: '', onClick: () => (window as any).navigateToPage?.('config-sistema-pais') },
              { id: 'config-sistema-cep', label: 'CEP', icon: '', onClick: () => (window as any).navigateToPage?.('config-sistema-cep') },
              { id: 'config-sistema-cidade', label: 'Cidade', icon: '', onClick: () => (window as any).navigateToPage?.('config-sistema-cidade') }
            ]
          },
          { id: 'cadastros-tipos-documento', label: 'Tipos de Documento Digitalizado', icon: '', onClick: () => (window as any).navigateToPage?.('cadastros-tipos-documento') }
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
        id: 'livro-comercial',
        label: 'Livro Comercial',
        icon: '',
        submenu: [
          { id: 'livro-comercial-novo', label: 'Novo Registro', icon: '', onClick: () => (window as any).navigateToPage?.('livro-comercial-novo') },
          { id: 'livro-comercial-consulta', label: 'Consulta', icon: '', onClick: () => (window as any).navigateToPage?.('livro-comercial-consulta') },
          { id: 'livro-comercial-relatorio', label: 'Relatório', icon: '', onClick: () => (window as any).navigateToPage?.('livro-comercial-relatorio') }
        ]
      },
      {
        id: 'livro-e',
        label: 'Livro E',
        icon: '',
        submenu: [
          { id: 'livro-e-novo', label: 'Novo Registro', icon: '', onClick: () => (window as any).navigateToPage?.('livro-e-novo') },
          { id: 'livro-e-consulta', label: 'Consulta', icon: '', onClick: () => (window as any).navigateToPage?.('livro-e-consulta') },
          { id: 'livro-e-relatorio', label: 'Relatório', icon: '', onClick: () => (window as any).navigateToPage?.('livro-e-relatorio') }
        ]
      },
      {
        id: 'certidoes',
        label: 'Certidões',
        icon: '',
        submenu: [
          { id: 'certidao-nascimento', label: 'Certidão de Nascimento', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-nascimento') },
          { id: 'certidao-casamento', label: 'Certidão de Casamento', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-casamento') },
          { id: 'certidao-obito', label: 'Certidão de Óbito', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-obito') },
          { id: 'certidao-2-via-ausencia', label: '2ª Via de Ausência', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-2-via-ausencia') },
          { id: 'certidao-2-via-emancipacao', label: '2ª Via de Emancipação', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-2-via-emancipacao') },
          { id: 'certidao-2-via-interdicao', label: '2ª Via de Interdição', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-2-via-interdicao') },
          { id: 'certidao-2-via-opcao-nacionalidade', label: '2ª via Opção de Nacionalidade', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-2-via-opcao-nacionalidade') },
          { id: 'certidao-2-via-uniao-estavel', label: '2ª Via de União Estável', icon: '', onClick: () => (window as any).navigateToPage?.('certidao-2-via-uniao-estavel') },
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
          { id: 'relatorio-diario', label: 'Relatório Diário', icon: '', onClick: () => (window as any).navigateToPage?.('relatorio-diario') },
          { id: 'relatorio-mensal', label: 'Relatório Mensal', icon: '', onClick: () => (window as any).navigateToPage?.('relatorio-mensal') },
          { id: 'relatorio-anual', label: 'Relatório Anual', icon: '', onClick: () => (window as any).navigateToPage?.('relatorio-anual') },
          { id: 'relatorio-personalizado', label: 'Personalizado', icon: '', onClick: () => (window as any).navigateToPage?.('relatorio-personalizado') }
        ]
      },
      {
        id: 'remessas',
        label: 'Remessas',
        icon: '',
        submenu: [
          { id: 'remessa-enviar', label: 'Enviar Remessa', icon: '', onClick: () => (window as any).navigateToPage?.('remessa-enviar') },
          { id: 'remessa-receber', label: 'Receber Remessa', icon: '', onClick: () => (window as any).navigateToPage?.('remessa-receber') },
          { id: 'remessa-historico', label: 'Histórico', icon: '', onClick: () => (window as any).navigateToPage?.('remessa-historico') },
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
          { id: 'firmas-cadastrar', label: 'Cadastrar Firma', icon: '', onClick: () => (window as any).navigateToPage?.('firmas-cadastrar') },
          { id: 'firmas-consultar', label: 'Consultar', icon: '', onClick: () => (window as any).navigateToPage?.('firmas-consultar') },
          { id: 'firmas-gerenciar', label: 'Gerenciar', icon: '', onClick: () => (window as any).navigateToPage?.('firmas-gerenciar') }
        ]
      },
    ]

    // Configuração do Menu de Ícones (Menu 2) - Ícones de acesso rápido
    const iconMenuItems = [
      { id: 'firmas', label: 'Cliente', icon: '✍️', onClick: () => (window as any).navigateToPage?.('firmas') },
      { id: 'nascimento', label: 'Nascimento', icon: '👶', onClick: () => (window as any).navigateToPage?.('nascimento') },
      { id: 'casamento', label: 'Casamento', icon: '💍', onClick: () => (window as any).navigateToPage?.('casamento') },
      { id: 'obito', label: 'Óbito', icon: '⚰️', onClick: () => (window as any).navigateToPage?.('obito') },
      { id: 'livro', label: 'Livro e', icon: '📖', onClick: () => (window as any).navigateToPage?.('livro') },
      { id: 'digitalizacao', label: 'Digitalização', icon: <ScannerIcon size={20} />, onClick: () => (window as any).navigateToPage?.('digitalizacao') },
      { id: 'login', label: 'Login', icon: '🔐', onClick: () => console.log('Login clicado') },
      { id: 'logout', label: 'Sair', icon: '🚪', onClick: handleLogout }
    ]

    return (
      <div style={{
        height: '100vh',
        background: accessibility.currentTheme === 'dark' ? theme.background : '#E1E1E1',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: theme.text,
        overflow: 'hidden'
      }}>

        {/* Header com Controles de Janela */}
             <div style={{
               background: accessibility.currentTheme === 'dark' ? '#004D40' : '#00796B',
               backdropFilter: 'blur(20px)',
               padding: '8px 16px',
               borderBottom: `1px solid ${theme.border}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          height: '48px',
          minHeight: '48px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
          {/* Controles de Janela */}
          <div data-window-controls>
            <WindowControls
              onClose={windowState.close}
              onMinimize={windowState.minimize}
              onMaximize={windowState.maximize}
            />
          </div>
        </div>

        {/* Menu Textual (Menu 1) */}
        <div style={{ marginTop: '20px' }} data-responsive-menu>
          <TextualMenu 
            items={textualMenuItems}
            isExpanded={isTextualMenuExpanded}
            onToggleExpanded={() => setIsTextualMenuExpanded(!isTextualMenuExpanded)}
          />
        </div>

        {/* Menu de Ícones (Menu 2) */}
        <div style={{ marginTop: '10px' }} data-responsive-menu>
          <IconMenu 
            items={iconMenuItems}
            onOpenSideMenu={() => setIsSideMenuOpen(true)}
          />
                  </div>

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

        {/* Área de Conteúdo Principal - COMPLETAMENTE LIMPA */}
        <div style={{
          flex: 1,
            background: theme.background,
          position: 'relative',
          marginTop: '120px' // Espaço para os dois menus
        }}>
          {/* Área completamente vazia para suas adaptações futuras */}
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
            isDarkMode={isDarkMode}
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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
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
            fontSize: getRelativeFontSize(48),
            marginBottom: '16px'
        }}>
          🏛️
        </div>
        
        <h1 style={{ 
          fontSize: getRelativeFontSize(28), 
          fontWeight: '700',
            margin: '0 0 8px 0',
            color: loginTheme.text
        }}>
          Sistema de Cartório
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
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px',
            color: '#ef4444',
            fontSize: getRelativeFontSize(14),
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: getRelativeFontSize(14),
            fontWeight: '500',
            color: loginTheme.text
          }}>
            Email
          </label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: getRelativeFontSize(14),
            fontWeight: '500',
            color: loginTheme.text
          }}>
            Senha
          </label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        
        <button 
          onClick={handleLogin}
          disabled={isLoading}
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
        
        <div style={{ 
          textAlign: 'center',
          fontSize: '12px',
          color: loginTheme.textSecondary,
          lineHeight: '1.5'
        }}>
          <p style={{ margin: '4px 0' }}>👤 admin@cartorio.com / admin123</p>
          <p style={{ margin: '4px 0' }}>👥 funcionario@cartorio.com / func123</p>
          <p style={{ margin: '4px 0' }}>🧪 teste@cartorio.com / teste123</p>
        </div>

        {/* Botões de teste */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button
            onClick={async () => {
              console.log('🔊 Testando leitor de tela...')
              await announcementService.announce('Teste do leitor de tela funcionando', {
                priority: 'normal',
                interrupt: true,
                volume: 0.8
              })
            }}
            style={{
              padding: '8px 16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🔊 Testar Leitor
          </button>
          
          <button
            onClick={() => {
              const currentMotion = document.body.style.getPropertyValue('--animation-duration')
              const isReduced = currentMotion === '0.01s'
              console.log('🎬 Movimento reduzido ativo:', isReduced)
              console.log('🎬 Variável CSS --animation-duration:', currentMotion)
              console.log('🎬 Variável CSS --transition-duration:', document.body.style.getPropertyValue('--transition-duration'))
            }}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🎬 Testar Movimento
          </button>
          
          <button
            onClick={() => {
              const currentFilter = document.body.style.filter
              const blueLightFilter = document.body.style.getPropertyValue('--blue-light-filter')
              const contrastFilter = document.body.style.getPropertyValue('--contrast-filter')
              console.log('🔵 Filtro atual aplicado:', currentFilter)
              console.log('🔵 Variável CSS --blue-light-filter:', blueLightFilter)
              console.log('🔵 Variável CSS --contrast-filter:', contrastFilter)
              console.log('🔵 Classes do body:', document.body.className)
            }}
            style={{
              padding: '8px 16px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🔵 Testar Filtro Azul
          </button>
          
          <button
            onClick={async () => {
              const savedSettings = localStorage.getItem('accessibility-settings')
              const screenReaderEnabled = savedSettings ? JSON.parse(savedSettings).screenReader : false
              console.log('🔊 Leitor de tela ativado nas configurações:', screenReaderEnabled)
              console.log('🔊 Configurações completas:', savedSettings ? JSON.parse(savedSettings) : 'Nenhuma configuração salva')
              
              // Testar anúncio
              await announcementService.announce('Teste de controle do leitor de tela', {
                priority: 'normal',
                interrupt: true,
                volume: 0.8
              })
            }}
            style={{
              padding: '8px 16px',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🔊 Testar Controle
          </button>
          
          <button
            onClick={() => {
              const savedSettings = localStorage.getItem('accessibility-settings')
              console.log('💾 Configurações salvas no localStorage:', savedSettings)
              
              if (savedSettings) {
                const parsed = JSON.parse(savedSettings)
                console.log('📋 Configurações parseadas:', parsed)
                console.log('🔊 Estado do leitor de tela:', parsed.screenReader)
              } else {
                console.log('❌ Nenhuma configuração encontrada')
              }
            }}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            💾 Verificar Estado
          </button>
        </div>
      </div>
    </div>
  )
}

export default App