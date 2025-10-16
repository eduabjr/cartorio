import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MaternidadePage } from './pages/MaternidadePage'
import { ConfiguracoesPage } from './pages/ConfiguracoesPage'
import { RecepcaoArquivoMaternidade } from './components/RecepcaoArquivoMaternidade'

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
  const [activeMenu, setActiveMenu] = useState('')
  const [openDropdown, setOpenDropdown] = useState('')
  const [hoveredSubmenu, setHoveredSubmenu] = useState('')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [showConfiguracoes, setShowConfiguracoes] = useState(false)
  const [showRecepcaoMaternidade, setShowRecepcaoMaternidade] = useState(false)

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
      console.log('Carregando tema:', isDark ? 'dark' : 'light')
      setIsDarkMode(isDark)
    } else {
      console.log('Nenhum tema salvo, usando padrão: light')
      setIsDarkMode(false)
      localStorage.setItem('theme', 'light')
    }
  }, [])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdown) {
        setOpenDropdown('')
      }
    }

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdown])

  // Monitorar mudanças no tema
  useEffect(() => {
    console.log('=== TEMA MUDOU ===')
    console.log('isDarkMode:', isDarkMode)
    console.log('Tema atual:', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const handleLogin = async () => {
    setIsLoading(true)
    setError('')
    
    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Credenciais válidas
    const validCredentials = {
      'admin@cartorio.com': { password: 'admin123', name: 'Administrador', role: 'admin' },
      'funcionario@cartorio.com': { password: 'func123', name: 'Funcionário', role: 'employee' },
      'teste@cartorio.com': { password: 'teste123', name: 'Usuário Teste', role: 'employee' }
    }
    
    const credential = validCredentials[email as keyof typeof validCredentials]
    
    if (!credential || credential.password !== password) {
      setError('Email ou senha incorretos!')
      setIsLoading(false)
      return
    }
    
    // Login bem-sucedido
    const userData = {
      id: '1',
      email,
      name: credential.name,
      role: credential.role
    }
    
    const token = 'jwt-token-' + Date.now()
    
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', token)
    
    setUser(userData)
    setIsLoggedIn(true)
    setIsLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    setIsLoggedIn(false)
    setEmail('admin@cartorio.com')
    setPassword('admin123')
    setActiveMenu('')
  }

  const toggleTheme = () => {
    console.log('=== TOGGLE THEME INICIADO ===')
    console.log('isDarkMode atual:', isDarkMode)
    
    const newTheme = !isDarkMode
    const themeString = newTheme ? 'dark' : 'light'
    
    console.log('Novo tema será:', themeString)
    
    // Atualizar estado
    setIsDarkMode(newTheme)
    
    // Salvar no localStorage
    localStorage.setItem('theme', themeString)
    
    // Verificar se foi salvo
    const saved = localStorage.getItem('theme')
    console.log('Tema salvo no localStorage:', saved)
    
    console.log('=== TOGGLE THEME FINALIZADO ===')
  }

   const handleMenuClick = (menuId: string) => {
     console.log('Menu clicado:', menuId)
     if (menuId === 'cadastros' || menuId === 'processos' || menuId === 'atendimento' || menuId === 'protocolos' || menuId === 'lavratura' || menuId === 'livro-comercial' || menuId === 'livro-e' || menuId === 'certidoes' || menuId === 'indice' || menuId === 'relatorios' || menuId === 'remessas' || menuId === 'digitalizacao' || menuId === 'procuracao') {
       setOpenDropdown(openDropdown === menuId ? '' : menuId)
     } else {
       setOpenDropdown('')
       setActiveMenu(menuId)
     }
   }

       const handleIconMenuClick = (iconId: string) => {
         setOpenDropdown('') // Fechar qualquer dropdown do menu de texto
         setActiveMenu(activeMenu === iconId ? '' : iconId)
         
         // Ações específicas para cada ícone
         switch (iconId) {
           case 'casamento-icone':
             console.log('💍 Casamento - Abrir sistema de casamento')
             break
           case 'nascimento-icone':
             console.log('👶 Nascimento - Abrir sistema de nascimento')
             break
           case 'obito-icone':
             console.log('⚰️ Óbito - Abrir sistema de óbito')
             break
           case 'firmas-icone':
             console.log('✍️ Firmas - Abrir sistema de firmas')
             break
           case 'documentos':
             console.log('📄 Documentos - Visualizar documentos')
             break
           case 'logoff-icone':
             console.log('🔓 Logoff - Fazendo logout do sistema')
             handleLogout()
             break
           case 'sair-icone':
             console.log('🚪 Sair - Fechando programa')
             handleLogout()
             break
           default:
             console.log(`Ícone clicado: ${iconId}`)
         }
       }

  const handleDropdownItemClick = (itemId: string) => {
    setActiveMenu(itemId)
    setOpenDropdown('')
    
    // Ações específicas para itens do dropdown
    switch (itemId) {
      case 'recepcao-maternidade':
        setShowRecepcaoMaternidade(true)
        break
      default:
        console.log(`Item clicado: ${itemId}`)
    }
  }


  const navigateToMaternidade = () => {
    window.open('/maternidade', '_blank')
  }

  // Se está logado, mostrar o sistema
  if (isLoggedIn && user) {
  return (
      <Routes>
        <Route path="/maternidade" element={<MaternidadePage />} />
        <Route path="*" element={<MainSystem />} />
      </Routes>
    )
  }

  function MainSystem() {
    const theme = {
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      cardBg: isDarkMode 
        ? 'rgba(30, 41, 59, 0.8)'
        : 'rgba(255, 255, 255, 0.9)',
      text: isDarkMode ? '#f1f5f9' : '#1e293b',
      textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
      border: isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(30, 41, 59, 0.1)',
      buttonBg: isDarkMode ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.9)',
      buttonHover: isDarkMode ? 'rgba(59, 130, 246, 1)' : 'rgba(59, 130, 246, 1)',
      menuActive: isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)'
    }

    return (
      <div style={{
        height: '100vh',
        background: theme.background,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: theme.text,
        overflow: 'visible'
      }}>
             {/* Header Moderno */}
             <div style={{
               background: theme.cardBg,
               backdropFilter: 'blur(20px)',
               padding: '8px 16px',
               borderBottom: `1px solid ${theme.border}`,
               boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
               zIndex: 1000
             }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '100%',
            margin: '0 auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                🏛️
              </div>
                   <div>
                     <h1 style={{ 
                       margin: 0, 
                       fontSize: '18px', 
                       fontWeight: '700',
                       background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                       WebkitBackgroundClip: 'text',
                       WebkitTextFillColor: 'transparent'
                     }}>
                  Sistema de Cartório
                     </h1>
                     <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary }}>
                       Tecnologia da Informação
                </p>
              </div>
            </div>
            
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <button 
                     onClick={navigateToMaternidade}
                     style={{
                       padding: '6px 10px',
                       background: 'linear-gradient(135deg, #10b981, #059669)',
                       color: 'white',
                       border: 'none',
                       borderRadius: '6px',
                       cursor: 'pointer',
                       fontSize: '12px',
                       fontWeight: '500',
                       transition: 'all 0.2s ease',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '4px'
                     }}
                     onMouseOver={(e) => (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)'}
                     onMouseOut={(e) => (e.target as HTMLButtonElement).style.transform = 'translateY(0)'}
                   >
                     👶 Maternidade
                   </button>
                   
                   
                    <button 
                      onClick={() => {
                        setNotificationsEnabled(!notificationsEnabled)
                        console.log(`🔔 Notificações ${notificationsEnabled ? 'desativadas' : 'ativadas'}`)
                      }}
                      style={{
                        padding: '6px 10px',
                        background: theme.buttonBg,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease',
                        transform: notificationsEnabled ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: notificationsEnabled ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'
                      }}
                      onMouseOver={(e) => {
                        const target = e.target as HTMLButtonElement
                        target.style.background = theme.buttonHover
                      }}
                      onMouseOut={(e) => {
                        const target = e.target as HTMLButtonElement
                        target.style.background = theme.buttonBg
                      }}
                      title={notificationsEnabled ? 'Notificações Ativadas' : 'Notificações Desativadas'}
                    >
                      {notificationsEnabled ? '🔔' : '🔕'}
                    </button>
                   
                    <button 
                      onClick={() => {
                        console.log('=== BOTÃO TEMA HEADER ===')
                        console.log('Estado atual isDarkMode:', isDarkMode)
                        setIsDarkMode(!isDarkMode)
                        localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light')
                        console.log('Estado após mudança:', !isDarkMode)
                      }}
                      style={{
                        padding: '6px 10px',
                        background: theme.buttonBg,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                     onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = theme.buttonHover}
                     onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = theme.buttonBg}
                     title="Alternar Tema"
                   >
                     {isDarkMode ? '☀️' : '🌙'}
                   </button>
                   
                   <div style={{ position: 'relative' }}>
                      <button 
                        onClick={() => setShowConfiguracoes(true)}
                        style={{
                          padding: '6px 10px',
                          background: theme.buttonBg,
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = theme.buttonHover}
                        onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = theme.buttonBg}
                        title="Configurações"
                      >
                        ⚙️
                      </button>
                   </div>
                   
                    <div style={{
                      padding: '6px 12px',
                      background: theme.menuActive,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      👤 {user?.name || 'Usuário'}
                    </div>
                   
                   <button 
                     onClick={handleLogout}
                     style={{
                       padding: '6px 12px',
                       background: 'rgba(239, 68, 68, 0.8)',
                       color: 'white',
                       border: 'none',
                       borderRadius: '6px',
                       cursor: 'pointer',
                       fontSize: '12px',
                       fontWeight: '500',
                       transition: 'all 0.2s ease'
                     }}
                     onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 1)'}
                     onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.8)'}
                   >
                     Sair
                   </button>
                 </div>
          </div>
        </div>

             {/* Menu Superior - Ícones Independentes */}
             <div style={{
               background: theme.cardBg,
               backdropFilter: 'blur(20px)',
               padding: '4px 16px 6px 16px',
               borderBottom: `1px solid ${theme.border}`,
               boxShadow: '0 1px 2px -1px rgba(0, 0, 0, 0.1)',
               zIndex: 998
             }}>
          <div style={{
            display: 'flex',
            gap: '0px',
            maxWidth: '100%',
            overflowX: 'hidden',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
                 {[
                   { id: 'casamento-icone', icon: '💍', label: 'Casamento', color: '#ec4899' },
                   { id: 'nascimento-icone', icon: '👶', label: 'Nascimento', color: '#10b981' },
                   { id: 'obito-icone', icon: '⚰️', label: 'Óbito', color: '#6b7280' },
                   { id: 'firmas-icone', icon: '✍️', label: 'Firmas', color: '#8b5cf6' },
                   { id: 'documentos', icon: '📄', label: 'Documentos', color: '#f59e0b' },
                   { id: 'logoff-icone', icon: '🔓', label: 'Logoff', color: '#f97316' },
                   { id: 'sair-icone', icon: '🚪', label: 'Sair', color: '#ef4444' }
                 ].map((menu) => (
              <button
                key={menu.id}
                onClick={() => handleIconMenuClick(menu.id)}
                style={{
                  padding: '6px 8px',
                  background: activeMenu === menu.id ? theme.menuActive : 'transparent',
                  border: `1px solid ${activeMenu === menu.id ? menu.color : 'transparent'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  minWidth: 'fit-content',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  if (activeMenu !== menu.id) {
                    const target = e.target as HTMLButtonElement
                    target.style.background = theme.menuActive
                    target.style.borderColor = menu.color
                    target.style.transform = 'scale(1.05)'
                  }
                }}
                onMouseOut={(e) => {
                  if (activeMenu !== menu.id) {
                    const target = e.target as HTMLButtonElement
                    target.style.background = 'transparent'
                    target.style.borderColor = 'transparent'
                    target.style.transform = 'scale(1)'
                  }
                }}
                title={menu.label}
              >
                <span>{menu.icon}</span>
              </button>
            ))}
          </div>
        </div>

             {/* Menu Inferior - Apenas Texto */}
             <div style={{
               background: theme.cardBg,
               backdropFilter: 'blur(20px)',
               padding: '8px 16px',
               borderBottom: `1px solid ${theme.border}`,
               boxShadow: '0 1px 2px -1px rgba(0, 0, 0, 0.1)',
               zIndex: 999
             }}>
               <div style={{
                 display: 'flex',
                 gap: '16px',
                 maxWidth: '100%',
                 justifyContent: 'flex-start',
                 alignItems: 'center',
                 flexWrap: 'nowrap'
               }}>
                 {[
                   { id: 'cadastros', label: 'Cadastros' },
                   { id: 'processos', label: 'Processos' },
                   { id: 'atendimento', label: 'Requerimento' },
                   { id: 'protocolos', label: 'Protocolos' },
                   { id: 'livro-comercial', label: 'Livro Comercial' },
                   { id: 'livro-e', label: 'Livro E' },
                   { id: 'certidoes', label: 'Certidões' },
                   { id: 'indice', label: 'Índice' },
                   { id: 'lavratura', label: 'Lavratura' },
                   { id: 'relatorios', label: 'Relatórios' },
                   { id: 'remessas', label: 'Remessas' },
                   { id: 'digitalizacao', label: 'Digitalização' },
                   { id: 'procuracao', label: 'Procuração' }
                 ].map((menu) => (
              <div key={menu.id} style={{ position: 'relative' }}>
                     <button
                       onClick={() => handleMenuClick(menu.id)}
                       style={{
                         padding: '8px 16px',
                         background: openDropdown === menu.id ? theme.menuActive : 'transparent',
                         color: openDropdown === menu.id ? '#3b82f6' : theme.text,
                         border: 'none',
                         cursor: 'pointer',
                         fontSize: '13px',
                         fontWeight: '500',
                         transition: 'all 0.2s ease',
                         whiteSpace: 'nowrap',
                         minWidth: 'fit-content',
                         textAlign: 'center',
                         borderRadius: '6px'
                       }}
                  onMouseOver={(e) => {
                    if (openDropdown !== menu.id) {
                      const target = e.target as HTMLButtonElement
                      target.style.color = '#3b82f6'
                      target.style.background = theme.menuActive
                    }
                  }}
                  onMouseOut={(e) => {
                    if (openDropdown !== menu.id) {
                      const target = e.target as HTMLButtonElement
                      target.style.color = theme.text
                      target.style.background = 'transparent'
                    }
                  }}
                >
                  {menu.label}
                </button>
                
                {/* Dropdown para Cadastros */}
                {menu.id === 'cadastros' && openDropdown === 'cadastros' && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    background: theme.cardBg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    boxShadow: '0 6px 15px -3px rgba(0, 0, 0, 0.1)',
                    zIndex: 100001,
                    minWidth: '220px',
                    padding: '6px 0'
                  }}>
                     {[
                       { id: 'firmas', label: 'Firmas' },
                       { id: 'funcionario', label: 'Funcionário', adminOnly: true },
                       { id: 'cartorio-seade', label: 'Cartório (SEADE)' },
                       { id: 'cidade', label: 'Cidade' },
                       { id: 'pais', label: 'País' },
                       { id: 'cep', label: 'CEP', adminOnly: true },
                       { id: 'ibge', label: 'IBGE' },
                       { id: 'dnv-do-bloqueadas', label: 'DNV e DO Bloqueadas' },
                       { id: 'oficios-mandados', label: 'Ofícios e Mandados' },
                       { id: 'hospital', label: 'Hospital' },
                       { id: 'cemiterio', label: 'Cemitério' },
                       { id: 'funeraria', label: 'Funerária' },
                       { id: 'cadastro-livros', label: 'Cadastro de Livros' },
                       { id: 'registro-tipos-digitalizacao', label: 'Registro de Tipos para Digitalização' },
                       { id: 'reg-certidoes', label: 'Reg. Certidões', hasSubmenu: true },
                       { id: 'feriados', label: 'Feriados', adminOnly: true }
                     ].filter(item => {
                      // Se não é admin, filtrar itens que requerem admin
                      if (user?.role !== 'admin' && item.adminOnly) {
                        return false
                      }
                      return true
                     }).map((item) => (
                       <div key={item.id} style={{ position: 'relative' }}>
                         <button
                           onClick={() => item.hasSubmenu ? null : handleDropdownItemClick(item.id)}
                             style={{
                               width: '100%',
                               padding: '6px 12px',
                               background: 'transparent',
                               color: theme.text,
                               border: 'none',
                               cursor: item.hasSubmenu ? 'default' : 'pointer',
                               fontSize: '12px',
                               fontWeight: '400',
                               textAlign: 'left',
                               transition: 'all 0.2s ease',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'space-between',
                               whiteSpace: 'nowrap'
                             }}
                           onMouseOver={(e) => {
                             if (!item.hasSubmenu) {
                               const target = e.target as HTMLButtonElement
                               target.style.background = theme.menuActive
                               target.style.color = '#3b82f6'
                             } else if (item.id === 'reg-certidoes') {
                               setHoveredSubmenu('reg-certidoes')
                             }
                           }}
                           onMouseOut={(e) => {
                             if (!item.hasSubmenu) {
                               const target = e.target as HTMLButtonElement
                               target.style.background = 'transparent'
                               target.style.color = theme.text
                             } else if (item.id === 'reg-certidoes') {
                               setHoveredSubmenu('')
                             }
                           }}
                         >
                           <span>{item.label}</span>
                           {item.hasSubmenu && <span style={{ fontSize: '12px' }}>▶</span>}
                         </button>
                         
                         {/* Submenu para Reg. Certidões */}
                         {item.id === 'reg-certidoes' && hoveredSubmenu === 'reg-certidoes' && (
                           <div 
                             style={{
                               position: 'absolute',
                               left: '100%',
                               top: '0',
                               background: theme.cardBg,
                               border: `1px solid ${theme.border}`,
                               borderRadius: '8px',
                               boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                               zIndex: 100002,
                               minWidth: '200px',
                               padding: '8px 0'
                             }}
                             onMouseOver={() => setHoveredSubmenu('reg-certidoes')}
                             onMouseOut={() => setHoveredSubmenu('')}
                           >
                             {/* Primeira Seção */}
                             {[
                               { id: 'compra-certidoes', label: 'Compra de Certidões' },
                               { id: 'consumo-certidoes', label: 'Consumo de Certidões' },
                               { id: 'perda-cancelamento-certidoes', label: 'Perda/Cancelamento de Certidões' },
                               { id: 'relatorio-estoque-certidoes', label: 'Relatório de Estoque de Certidões' }
                             ].map((subItem) => (
                               <button
                                 key={subItem.id}
                                 onClick={() => handleDropdownItemClick(subItem.id)}
                                 style={{
                                   width: '100%',
                                   padding: '6px 12px',
                                   background: 'transparent',
                                   color: theme.text,
                                   border: 'none',
                                   cursor: 'pointer',
                                   fontSize: '12px',
                                   fontWeight: '400',
                                   textAlign: 'left',
                                   transition: 'all 0.2s ease',
                                   display: 'block',
                                   whiteSpace: 'nowrap'
                                 }}
                                 onMouseOver={(e) => {
                                   const target = e.target as HTMLButtonElement
                                   target.style.background = theme.menuActive
                                   target.style.color = '#3b82f6'
                                 }}
                                 onMouseOut={(e) => {
                                   const target = e.target as HTMLButtonElement
                                   target.style.background = 'transparent'
                                   target.style.color = theme.text
                                 }}
                               >
                                 {subItem.label}
                               </button>
                             ))}
                             
                             {/* Divisor */}
                             <div style={{
                               height: '1px',
                               background: theme.border,
                               margin: '4px 16px'
                             }}></div>
                             
                             {/* Segunda Seção */}
                             {[
                               { id: 'estorno-certidao-utilizada', label: 'Estorno de Certidão Utilizada' },
                               { id: 'consulta-certidoes-utilizadas', label: 'Consulta de Certidões Utilizadas' },
                               { id: 'manutencao-certidoes-utilizadas', label: 'Manutenção de Certidões Utilizadas' }
                             ].map((subItem) => (
                               <button
                                 key={subItem.id}
                                 onClick={() => handleDropdownItemClick(subItem.id)}
                                 style={{
                                   width: '100%',
                                   padding: '6px 12px',
                                   background: 'transparent',
                                   color: theme.text,
                                   border: 'none',
                                   cursor: 'pointer',
                                   fontSize: '12px',
                                   fontWeight: '400',
                                   textAlign: 'left',
                                   transition: 'all 0.2s ease',
                                   display: 'block',
                                   whiteSpace: 'nowrap'
                                 }}
                                 onMouseOver={(e) => {
                                   const target = e.target as HTMLButtonElement
                                   target.style.background = theme.menuActive
                                   target.style.color = '#3b82f6'
                                 }}
                                 onMouseOut={(e) => {
                                   const target = e.target as HTMLButtonElement
                                   target.style.background = 'transparent'
                                   target.style.color = theme.text
                                 }}
                               >
                                 {subItem.label}
                               </button>
                             ))}
                           </div>
                         )}
                       </div>
                     ))}
                  </div>
                )}
                
                {/* Dropdown para Processos */}
                {menu.id === 'processos' && openDropdown === 'processos' && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    background: theme.cardBg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                    zIndex: 100001,
                    minWidth: '280px',
                    padding: '8px 0'
                  }}>
                    {[
                      { id: 'recepcao-funeraria', label: 'Recepção de Arquivo da Funerária' },
                      { id: 'recepcao-maternidade', label: 'Recepção de Arquivo da Maternidade' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleDropdownItemClick(item.id)}
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          background: 'transparent',
                          color: theme.text,
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '400',
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                          display: 'block',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseOver={(e) => {
                          const target = e.target as HTMLButtonElement
                          target.style.background = theme.menuActive
                          target.style.color = '#3b82f6'
                        }}
                        onMouseOut={(e) => {
                          const target = e.target as HTMLButtonElement
                          target.style.background = 'transparent'
                          target.style.color = theme.text
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Dropdown para Atendimento */}
                {menu.id === 'atendimento' && openDropdown === 'atendimento' && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    background: theme.cardBg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                    zIndex: 100001,
                    minWidth: '220px',
                    padding: '8px 0'
                  }}>
                    {[
                      { id: 'requerimento-uniao-estavel', label: 'Requerimento de União Estável' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleDropdownItemClick(item.id)}
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          background: 'transparent',
                          color: theme.text,
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '400',
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                          display: 'block',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseOver={(e) => {
                          const target = e.target as HTMLButtonElement
                          target.style.background = theme.menuActive
                          target.style.color = '#3b82f6'
                        }}
                        onMouseOut={(e) => {
                          const target = e.target as HTMLButtonElement
                          target.style.background = 'transparent'
                          target.style.color = theme.text
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Dropdown para Protocolos */}
                {menu.id === 'protocolos' && openDropdown === 'protocolos' && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    background: theme.cardBg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                    zIndex: 100001,
                    minWidth: '180px',
                    padding: '8px 0'
                  }}>
                    {[
                      { id: 'lancamento', label: 'Lançamento' },
                      { id: 'baixa', label: 'Baixa' },
                      { id: 'cancelamento', label: 'Cancelamento' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleDropdownItemClick(item.id)}
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          background: 'transparent',
                          color: theme.text,
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '400',
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                          display: 'block',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseOver={(e) => {
                          const target = e.target as HTMLButtonElement
                          target.style.background = theme.menuActive
                          target.style.color = '#3b82f6'
                        }}
                        onMouseOut={(e) => {
                          const target = e.target as HTMLButtonElement
                          target.style.background = 'transparent'
                          target.style.color = theme.text
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                 {/* Dropdown para Lavratura */}
                 {menu.id === 'lavratura' && openDropdown === 'lavratura' && (
                   <div style={{
                     position: 'absolute',
                     top: '100%',
                     left: '0',
                     background: theme.cardBg,
                     border: `1px solid ${theme.border}`,
                     borderRadius: '8px',
                     boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                     zIndex: 100001,
                     minWidth: '150px',
                     padding: '8px 0'
                   }}>
                     {[
                       { id: 'casamento', label: 'Casamento' },
                       { id: 'nascimento', label: 'Nascimento' },
                       { id: 'obito', label: 'Óbito' }
                     ].map((item) => (
                       <button
                         key={item.id}
                         onClick={() => handleDropdownItemClick(item.id)}
                         style={{
                           width: '100%',
                           padding: '8px 16px',
                           background: 'transparent',
                           color: theme.text,
                           border: 'none',
                           cursor: 'pointer',
                           fontSize: '14px',
                           fontWeight: '400',
                           textAlign: 'left',
                           transition: 'all 0.2s ease',
                           display: 'block',
                           whiteSpace: 'nowrap'
                         }}
                         onMouseOver={(e) => {
                           const target = e.target as HTMLButtonElement
                           target.style.background = theme.menuActive
                           target.style.color = '#3b82f6'
                         }}
                         onMouseOut={(e) => {
                           const target = e.target as HTMLButtonElement
                           target.style.background = 'transparent'
                           target.style.color = theme.text
                         }}
                       >
                         {item.label}
                       </button>
                     ))}
                   </div>
                 )}

                {/* Dropdown para Livro Comercial */}
                {menu.id === 'livro-comercial' && openDropdown === 'livro-comercial' && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    background: theme.cardBg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    boxShadow: '0 6px 15px -3px rgba(0, 0, 0, 0.1)',
                    zIndex: 100001,
                    minWidth: '220px',
                    padding: '6px 0'
                  }}>
                    {[
                      { id: 'autenticacao', label: 'Autenticação' },
                      { id: 'livro-autenticacao', label: 'Livro de Autenticação' },
                      { id: 'relatorio-junta-comercial', label: 'Relatório para Junta Comercial' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleDropdownItemClick(item.id)}
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          background: 'transparent',
                          color: theme.text,
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '400',
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                          display: 'block',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseOver={(e) => {
                          const target = e.target as HTMLButtonElement
                          target.style.background = theme.menuActive
                          target.style.color = '#3b82f6'
                        }}
                        onMouseOut={(e) => {
                          const target = e.target as HTMLButtonElement
                          target.style.background = 'transparent'
                          target.style.color = theme.text
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Dropdown para Livro E */}
                {menu.id === 'livro-e' && openDropdown === 'livro-e' && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    background: theme.cardBg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                    zIndex: 100001,
                    minWidth: '280px',
                    padding: '8px 0'
                  }}>
                    {[
                      { id: 'ausencia', label: 'Ausência' },
                      { id: 'emancipacao', label: 'Emancipação' },
                      { id: 'interdicao', label: 'Interdição' },
                      { id: 'opcao-nacionalidade', label: 'Opção de Nacionalidade' },
                      { id: 'registro-sentenca', label: 'Registro de Sentença' },
                      { id: 'registro-uniao-estavel', label: 'Registro de União Estável' },
                      { id: 'traslado-assento-casamento', label: 'Traslado de Assento de Casamento' },
                      { id: 'traslado-assento-nascimento', label: 'Traslado de Assento de Nascimento' },
                      { id: 'traslado-assento-obito', label: 'Traslado de Assento de Óbito' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleDropdownItemClick(item.id)}
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          background: 'transparent',
                          color: theme.text,
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '400',
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                          display: 'block',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseOver={(e) => {
                          const target = e.target as HTMLButtonElement
                          target.style.background = theme.menuActive
                          target.style.color = '#3b82f6'
                        }}
                        onMouseOut={(e) => {
                          const target = e.target as HTMLButtonElement
                          target.style.background = 'transparent'
                          target.style.color = theme.text
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                 {/* Dropdown para Certidões */}
                 {menu.id === 'certidoes' && openDropdown === 'certidoes' && (
                   <div style={{
                     position: 'absolute',
                     top: '100%',
                     left: '0',
                     background: theme.cardBg,
                     border: `1px solid ${theme.border}`,
                     borderRadius: '8px',
                     boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                     zIndex: 100001,
                     minWidth: '320px',
                     padding: '8px 0'
                   }}>
                     {/* Seção 1 - 2ª Via de Certidões Originais */}
                     {[
                       { id: '2via-casamento', label: '2ª Via de Casamento' },
                       { id: '2via-nascimento', label: '2ª Via de Nascimento' },
                       { id: '2via-obito', label: '2ª Via de Óbito' },
                       { id: 'certidao-negativa', label: 'Certidão Negativa' }
                     ].map((item) => (
                       <button
                         key={item.id}
                         onClick={() => handleDropdownItemClick(item.id)}
                         style={{
                           width: '100%',
                           padding: '8px 16px',
                           background: 'transparent',
                           color: theme.text,
                           border: 'none',
                           cursor: 'pointer',
                           fontSize: '14px',
                           fontWeight: '400',
                           textAlign: 'left',
                           transition: 'all 0.2s ease',
                           display: 'block',
                           whiteSpace: 'nowrap'
                         }}
                         onMouseOver={(e) => {
                           const target = e.target as HTMLButtonElement
                           target.style.background = theme.menuActive
                           target.style.color = '#3b82f6'
                         }}
                         onMouseOut={(e) => {
                           const target = e.target as HTMLButtonElement
                           target.style.background = 'transparent'
                           target.style.color = theme.text
                         }}
                       >
                         {item.label}
                       </button>
                     ))}
                     
                     {/* Divisor */}
                     <div style={{
                       height: '1px',
                       background: theme.border,
                       margin: '4px 16px'
                     }}></div>
                     
                     {/* Seção 2 - Novas Opções da Imagem */}
                     {[
                       { id: '2via-ausencia', label: '2ª Via de Ausência' },
                       { id: '2via-emancipacao', label: '2ª Via de Emancipação' },
                       { id: '2via-interdicao', label: '2ª Via de Interdição' },
                       { id: '2via-opcao-nacionalidade', label: '2ª via Opção de Nacionalidade' },
                       { id: '2via-uniao-estavel', label: '2ª Via de União Estável' },
                       { id: '2via-traslado-casamento', label: '2ª via Traslado de Assento de Casamento' },
                       { id: '2via-traslado-nascimento', label: '2ª via Traslado de Assento de Nascimento' },
                       { id: '2via-traslado-obito', label: '2ª via Traslado de Assento de Óbito' }
                     ].map((item) => (
                       <button
                         key={item.id}
                         onClick={() => handleDropdownItemClick(item.id)}
                         style={{
                           width: '100%',
                           padding: '8px 16px',
                           background: 'transparent',
                           color: theme.text,
                           border: 'none',
                           cursor: 'pointer',
                           fontSize: '14px',
                           fontWeight: '400',
                           textAlign: 'left',
                           transition: 'all 0.2s ease',
                           display: 'block',
                           whiteSpace: 'nowrap'
                         }}
                         onMouseOver={(e) => {
                           const target = e.target as HTMLButtonElement
                           target.style.background = theme.menuActive
                           target.style.color = '#3b82f6'
                         }}
                         onMouseOut={(e) => {
                           const target = e.target as HTMLButtonElement
                           target.style.background = 'transparent'
                           target.style.color = theme.text
                         }}
                       >
                         {item.label}
                       </button>
                     ))}
                     
                     {/* Divisor */}
                     <div style={{
                       height: '1px',
                       background: theme.border,
                       margin: '4px 16px'
                     }}></div>
                     
                     {/* Seção 3 - Inteiro Teor */}
                     {[
                       { id: 'inteiro-teor-digitada', label: 'Inteiro Teor Digitada' },
                       { id: 'inteiro-teor-reprografica', label: 'Inteiro Teor Reprográfica' }
                     ].map((item) => (
                       <button
                         key={item.id}
                         onClick={() => handleDropdownItemClick(item.id)}
                         style={{
                           width: '100%',
                           padding: '8px 16px',
                           background: 'transparent',
                           color: theme.text,
                           border: 'none',
                           cursor: 'pointer',
                           fontSize: '14px',
                           fontWeight: '400',
                           textAlign: 'left',
                           transition: 'all 0.2s ease',
                           display: 'block',
                           whiteSpace: 'nowrap'
                         }}
                         onMouseOver={(e) => {
                           const target = e.target as HTMLButtonElement
                           target.style.background = theme.menuActive
                           target.style.color = '#3b82f6'
                         }}
                         onMouseOut={(e) => {
                           const target = e.target as HTMLButtonElement
                           target.style.background = 'transparent'
                           target.style.color = theme.text
                         }}
                       >
                         {item.label}
                       </button>
                     ))}
                   </div>
                     )}

                     {/* Dropdown para Índice */}
                     {menu.id === 'indice' && openDropdown === 'indice' && (
                       <div style={{
                         position: 'absolute',
                         top: '100%',
                         left: '0',
                         background: theme.cardBg,
                         border: `1px solid ${theme.border}`,
                         borderRadius: '8px',
                         boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                         zIndex: 100001,
                         minWidth: '220px',
                         padding: '8px 0'
                       }}>
                         {[
                           { id: 'indice-casamento', label: 'Casamento' },
                           { id: 'indice-edital-proclamas', label: 'Edital de Proclamas' },
                           { id: 'indice-nascimento', label: 'Nascimento' },
                           { id: 'indice-obito', label: 'Óbito' },
                           { id: 'indice-livro-e', label: 'Livro E' },
                           { id: 'indice-procuracao', label: 'Procuração' }
                         ].map((item) => (
                           <button
                             key={item.id}
                             onClick={() => handleDropdownItemClick(item.id)}
                             style={{
                               width: '100%',
                               padding: '8px 16px',
                               background: 'transparent',
                               color: theme.text,
                               border: 'none',
                               cursor: 'pointer',
                               fontSize: '14px',
                               fontWeight: '400',
                               textAlign: 'left',
                               transition: 'all 0.2s ease',
                               display: 'block',
                               whiteSpace: 'nowrap'
                             }}
                             onMouseOver={(e) => {
                               const target = e.target as HTMLButtonElement
                               target.style.background = theme.menuActive
                               target.style.color = '#3b82f6'
                             }}
                             onMouseOut={(e) => {
                               const target = e.target as HTMLButtonElement
                               target.style.background = 'transparent'
                               target.style.color = theme.text
                             }}
                           >
                             {item.label}
                           </button>
                         ))}
                       </div>
                     )}

                     {/* Dropdown para Relatórios */}
                     {menu.id === 'relatorios' && openDropdown === 'relatorios' && (
                       <div style={{
                         position: 'absolute',
                         top: '100%',
                         left: '0',
                         background: theme.cardBg,
                         border: `1px solid ${theme.border}`,
                         borderRadius: '8px',
                         boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                         zIndex: 100001,
                         minWidth: '350px',
                         padding: '8px 0'
                       }}>
                         {[
                           { id: 'rel-justica-eleitoral', label: 'Justiça Eleitoral' },
                           { id: 'rel-exercito-brasileiro', label: 'Exército Brasileiro' },
                           { id: 'rel-ibge', label: 'IBGE' },
                           { id: 'rel-instituto-ricardo-daunt', label: 'Instituto Ricardo G. Daunt' },
                           { id: 'rel-min-justica-estrangeiros', label: 'Ministério da Justiça - Estrangeiros' },
                           { id: 'rel-procuradoria-bens', label: 'Procuradoria - Bens a Inventariar' },
                           { id: 'rel-sec-fazenda-bens', label: 'Sec. Fazenda - Bens a Inventariar' },
                           { id: 'rel-sec-municipal-saude', label: 'Secretaria Municipal da Saúde' },
                           { id: 'rel-vigilancia-sanitaria', label: 'Vigilância Sanitária / Epidemiológica' },
                           { id: 'rel-registro-nascimentos-hospitais', label: 'Registro de Nascimentos para Hospitais' },
                           { id: 'rel-funai', label: 'Fundação Nacional do Índio - FUNAI' },
                           { id: 'rel-listagem-conferencia-indice', label: 'Listagem de Conferência de Índice' },
                           { id: 'rel-protocolos-agenda', label: 'Protocolos - Agenda' },
                           { id: 'rel-casamentos-agendados', label: 'Casamentos Agendados' },
                           { id: 'rel-publicacao-editais-proclamas', label: 'Publicação de Editais de Proclamas' }
                         ].map((item) => (
                           <button
                             key={item.id}
                             onClick={() => handleDropdownItemClick(item.id)}
                             style={{
                               width: '100%',
                               padding: '8px 16px',
                               background: 'transparent',
                               color: theme.text,
                               border: 'none',
                               cursor: 'pointer',
                               fontSize: '14px',
                               fontWeight: '400',
                               textAlign: 'left',
                               transition: 'all 0.2s ease',
                               display: 'block',
                               whiteSpace: 'nowrap'
                             }}
                             onMouseOver={(e) => {
                               const target = e.target as HTMLButtonElement
                               target.style.background = theme.menuActive
                               target.style.color = '#3b82f6'
                             }}
                             onMouseOut={(e) => {
                               const target = e.target as HTMLButtonElement
                               target.style.background = 'transparent'
                               target.style.color = theme.text
                             }}
                           >
                             {item.label}
                           </button>
                         ))}
                       </div>
                     )}

                     {/* Dropdown para Remessas */}
                     {menu.id === 'remessas' && openDropdown === 'remessas' && (
                       <div style={{
                         position: 'absolute',
                         top: '100%',
                         left: '0',
                         background: theme.cardBg,
                         border: `1px solid ${theme.border}`,
                         borderRadius: '8px',
                         boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                         zIndex: 100001,
                         minWidth: '200px',
                         padding: '8px 0'
                       }}>
                         {[
                           { id: 'rem-guia-seade', label: 'Guia SEADE' },
                           { id: 'rem-arquivos-seade', label: 'Arquivos SEADE' },
                           { id: 'rem-intranet', label: 'INTRANET' }
                         ].map((item) => (
                           <button
                             key={item.id}
                             onClick={() => handleDropdownItemClick(item.id)}
                             style={{
                               width: '100%',
                               padding: '8px 16px',
                               background: 'transparent',
                               color: theme.text,
                               border: 'none',
                               cursor: 'pointer',
                               fontSize: '14px',
                               fontWeight: '400',
                               textAlign: 'left',
                               transition: 'all 0.2s ease',
                               display: 'block',
                               whiteSpace: 'nowrap'
                             }}
                             onMouseOver={(e) => {
                               const target = e.target as HTMLButtonElement
                               target.style.background = theme.menuActive
                               target.style.color = '#3b82f6'
                             }}
                             onMouseOut={(e) => {
                               const target = e.target as HTMLButtonElement
                               target.style.background = 'transparent'
                               target.style.color = theme.text
                             }}
                           >
                             {item.label}
                           </button>
                         ))}
                       </div>
                     )}

                     {/* Dropdown para Digitalização */}
                     {menu.id === 'digitalizacao' && openDropdown === 'digitalizacao' && (
                       <div style={{
                         position: 'absolute',
                         top: '100%',
                         left: '0',
                         background: theme.cardBg,
                         border: `1px solid ${theme.border}`,
                         borderRadius: '6px',
                         boxShadow: '0 6px 15px -3px rgba(0, 0, 0, 0.1)',
                         zIndex: 100001,
                         minWidth: '280px',
                         padding: '6px 0'
                       }}>
                         {[
                           { id: 'controle-digitalizacao', label: 'Controle de Digitalização' },
                           { id: 'exclusao-registros-imagens', label: 'Exclusão de Registros e Imagens Digitalizadas' }
                         ].map((item) => (
                           <button
                             key={item.id}
                             onClick={() => handleDropdownItemClick(item.id)}
                             style={{
                               width: '100%',
                               padding: '6px 12px',
                               background: 'transparent',
                               color: theme.text,
                               border: 'none',
                               cursor: 'pointer',
                               fontSize: '12px',
                               fontWeight: '400',
                               textAlign: 'left',
                               transition: 'all 0.2s ease',
                               display: 'block',
                               whiteSpace: 'nowrap'
                             }}
                             onMouseOver={(e) => {
                               const target = e.target as HTMLButtonElement
                               target.style.background = theme.menuActive
                               target.style.color = '#3b82f6'
                             }}
                             onMouseOut={(e) => {
                               const target = e.target as HTMLButtonElement
                               target.style.background = 'transparent'
                               target.style.color = theme.text
                             }}
                           >
                             {item.label}
                           </button>
                         ))}
                       </div>
                     )}

                     {/* Dropdown para Procuração */}
                     {menu.id === 'procuracao' && openDropdown === 'procuracao' && (
                       <div style={{
                         position: 'absolute',
                         top: '100%',
                         left: '0',
                         background: theme.cardBg,
                         border: `1px solid ${theme.border}`,
                         borderRadius: '6px',
                         boxShadow: '0 6px 15px -3px rgba(0, 0, 0, 0.1)',
                         zIndex: 100001,
                         minWidth: '200px',
                         padding: '6px 0'
                       }}>
                         {[
                           { id: 'procuracao', label: 'Procuração' },
                           { id: 'certidao-procuracao', label: 'Certidão de Procuração' }
                         ].map((item) => (
                           <button
                             key={item.id}
                             onClick={() => handleDropdownItemClick(item.id)}
                             style={{
                               width: '100%',
                               padding: '6px 12px',
                               background: 'transparent',
                               color: theme.text,
                               border: 'none',
                               cursor: 'pointer',
                               fontSize: '12px',
                               fontWeight: '400',
                               textAlign: 'left',
                               transition: 'all 0.2s ease',
                               display: 'block',
                               whiteSpace: 'nowrap'
                             }}
                             onMouseOver={(e) => {
                               const target = e.target as HTMLButtonElement
                               target.style.background = theme.menuActive
                               target.style.color = '#3b82f6'
                             }}
                             onMouseOut={(e) => {
                               const target = e.target as HTMLButtonElement
                               target.style.background = 'transparent'
                               target.style.color = theme.text
                             }}
                           >
                             {item.label}
                           </button>
                         ))}
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             </div>


        {/* Área de Conteúdo Principal - COMPLETAMENTE LIMPA */}
        <div style={{
          flex: 1
        }}>
          {/* Área completamente vazia para suas adaptações futuras */}
        </div>

        {/* Página de Configurações */}
        {showConfiguracoes && (
          <ConfiguracoesPage
            onClose={() => setShowConfiguracoes(false)}
            isDarkMode={isDarkMode}
            onThemeChange={(isDark) => {
              setIsDarkMode(isDark)
              localStorage.setItem('theme', isDark ? 'dark' : 'light')
            }}
          />
        )}

        {/* Recepção de Arquivo da Maternidade */}
        {showRecepcaoMaternidade && (
          <RecepcaoArquivoMaternidade
            onClose={() => setShowRecepcaoMaternidade(false)}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    )
  }

  // Tela de Login
  const loginTheme = {
    background: isDarkMode 
      ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    cardBg: isDarkMode 
      ? 'rgba(30, 41, 59, 0.9)'
      : 'rgba(255, 255, 255, 0.95)',
    text: isDarkMode ? '#f1f5f9' : '#1e293b',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? 'rgba(148, 163, 184, 0.3)' : 'rgba(30, 41, 59, 0.2)',
    inputBg: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)',
    buttonBg: isDarkMode ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.9)',
    buttonHover: isDarkMode ? 'rgba(59, 130, 246, 1)' : 'rgba(59, 130, 246, 1)'
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
      {/* Botão de Tema no canto superior direito */}
      <button 
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          padding: '12px 16px',
          background: loginTheme.buttonBg,
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
        onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = loginTheme.buttonHover}
        onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = loginTheme.buttonBg}
      >
        {isDarkMode ? '☀️' : '🌙'}
        {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
      </button>

      <div style={{
        textAlign: 'center',
        color: loginTheme.text,
        padding: '48px',
        borderRadius: '24px',
        backgroundColor: loginTheme.cardBg,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${loginTheme.border}`,
        maxWidth: '420px',
        width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          margin: '0 auto 24px auto'
        }}>
          🏛️
        </div>
        
        <h1 style={{ 
          fontSize: '28px', 
          margin: '0 0 8px 0', 
          fontWeight: '700',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Sistema de Cartório
        </h1>
        <p style={{ 
          fontSize: '16px', 
          margin: '0 0 32px 0', 
          color: loginTheme.textSecondary,
          fontWeight: '500'
        }}>
          Faça login para continuar
        </p>
        
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            color: '#ef4444',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}
        
        <div style={{ marginBottom: '24px' }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '16px',
              marginBottom: '16px',
              borderRadius: '12px',
              border: `1px solid ${loginTheme.border}`,
              backgroundColor: loginTheme.inputBg,
              color: loginTheme.text,
              fontSize: '16px',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = loginTheme.border}
          />
          <input 
            type="password" 
            placeholder="Senha" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '16px',
              marginBottom: '24px',
              borderRadius: '12px',
              border: `1px solid ${loginTheme.border}`,
              backgroundColor: loginTheme.inputBg,
              color: loginTheme.text,
              fontSize: '16px',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'all 0.2s ease'
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
            padding: '16px 24px',
            fontSize: '16px',
            fontWeight: '600',
            backgroundColor: isLoading ? 'rgba(59, 130, 246, 0.5)' : loginTheme.buttonBg,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginBottom: '24px',
            opacity: isLoading ? 0.6 : 1,
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
          onMouseOver={(e) => {
            if (!isLoading) (e.target as HTMLButtonElement).style.background = loginTheme.buttonHover
          }}
          onMouseOut={(e) => {
            if (!isLoading) (e.target as HTMLButtonElement).style.background = loginTheme.buttonBg
          }}
        >
          {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
        </button>
        
        <div style={{ 
          fontSize: '14px', 
          color: loginTheme.textSecondary,
          lineHeight: '1.6',
          background: 'rgba(59, 130, 246, 0.05)',
          border: `1px solid ${loginTheme.border}`,
          borderRadius: '12px',
          padding: '16px'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: loginTheme.text }}>Credenciais de teste:</p>
          <p style={{ margin: '4px 0' }}>👤 admin@cartorio.com / admin123</p>
          <p style={{ margin: '4px 0' }}>👥 funcionario@cartorio.com / func123</p>
          <p style={{ margin: '4px 0' }}>🧪 teste@cartorio.com / teste123</p>
        </div>
      </div>
    </div>
  )
}

export default App