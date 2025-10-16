import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MaternidadePage } from './pages/MaternidadePage'

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

  // Verificar se já está logado e tema
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    const savedTheme = localStorage.getItem('theme')
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
      setIsLoggedIn(true)
    }
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
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
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  const handleMenuClick = (menuId: string) => {
    if (menuId === 'cadastros') {
      setOpenDropdown(openDropdown === 'cadastros' ? '' : 'cadastros')
      setActiveMenu('')
    } else {
      setOpenDropdown('')
      setActiveMenu(activeMenu === menuId ? '' : menuId)
    }
  }

  const handleDropdownItemClick = (itemId: string) => {
    setActiveMenu(itemId)
    setOpenDropdown('')
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
          padding: '16px 24px',
          borderBottom: `1px solid ${theme.border}`,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
                  fontSize: '24px', 
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Sistema de Cartório
                </h1>
                <p style={{ margin: 0, fontSize: '14px', color: theme.textSecondary }}>
                  Tecnologia da Informação
                </p>
              </div>
            </div>
            
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={navigateToMaternidade}
              style={{
                padding: '8px 12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)'}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.transform = 'translateY(0)'}
            >
              👶 Maternidade
            </button>
            
            <button 
              onClick={toggleTheme}
              style={{
                padding: '8px 12px',
                background: theme.buttonBg,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = theme.buttonHover}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = theme.buttonBg}
            >
              {isDarkMode ? '☀️ Claro' : '🌙 Escuro'}
            </button>
            
            <div style={{
              padding: '8px 16px',
              background: theme.menuActive,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              👤 {user?.name || 'Usuário'}
            </div>
            
            <button 
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                background: 'rgba(239, 68, 68, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
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

        {/* Menu Superior - Apenas Texto */}
        <div style={{
          background: theme.cardBg,
          backdropFilter: 'blur(20px)',
          padding: '12px 24px 8px 24px',
          borderBottom: `1px solid ${theme.border}`,
          boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 999,
          overflow: 'visible'
        }}>
          <div style={{
            display: 'flex',
            gap: '0px',
            maxWidth: '100%',
            overflowX: 'hidden',
            overflowY: 'visible',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {[
              { id: 'cadastros', label: 'Cadastros' },
              { id: 'processos', label: 'Processos' },
              { id: 'protocolos', label: 'Protocolos' },
              { id: 'livro-comercial', label: 'Livro Comercial' },
              { id: 'livro-e', label: 'Livro E' },
              { id: 'certidoes', label: 'Certidões' },
              { id: 'indice', label: 'Índice' },
              { id: 'editor', label: 'Editor' },
              { id: 'relatorios', label: 'Relatórios' },
              { id: 'remessas', label: 'Remessas' },
              { id: 'digitalizacao', label: 'Digitalização' },
              { id: 'procuracao', label: 'Procuração' },
              { id: 'ajuda', label: 'Ajuda' }
            ].map((menu) => (
              <div key={menu.id} style={{ position: 'relative' }}>
                <button
                  onClick={() => handleMenuClick(menu.id)}
                  style={{
                    padding: '8px 12px',
                    background: openDropdown === menu.id ? theme.menuActive : 'transparent',
                    color: openDropdown === menu.id ? '#3b82f6' : theme.text,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    minWidth: 'fit-content',
                    textAlign: 'center',
                    position: 'relative'
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
                    position: 'fixed',
                    top: '120px',
                    left: '24px',
                    background: theme.cardBg,
                    backdropFilter: 'blur(20px)',
                    border: `2px solid #3b82f6`,
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px -5px rgba(0, 0, 0, 0.3)',
                    zIndex: 99999,
                    minWidth: '250px',
                    padding: '12px 0',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}>
                    {[
                      { id: 'cliente', label: 'Cliente' },
                      { id: 'cartorio-seade', label: 'Cartório (SEADE)' },
                      { id: 'cidade', label: 'Cidade' },
                      { id: 'pais', label: 'País' },
                      { id: 'dnv-do-bloqueadas', label: 'DNV e DO Bloqueadas' },
                      { id: 'oficios-mandados', label: 'Ofícios e Mandados' },
                      { id: 'hospital', label: 'Hospital' },
                      { id: 'cemiterio', label: 'Cemitério' },
                      { id: 'funeraria', label: 'Funerária' },
                      { id: 'cadastro-livros', label: 'Cadastro de Livros' },
                      { id: 'sair', label: 'Sair' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleDropdownItemClick(item.id)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'transparent',
                          color: theme.text,
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center'
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

        {/* Menu Inferior - Apenas Ícones */}
        <div style={{
          background: theme.cardBg,
          backdropFilter: 'blur(20px)',
          padding: '8px 24px 12px 24px',
          borderBottom: `1px solid ${theme.border}`,
          boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
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
              { id: 'cadastros', icon: '👥', color: '#3b82f6' },
              { id: 'processos', icon: '📝', color: '#10b981' },
              { id: 'protocolos', icon: '💡', color: '#f59e0b' },
              { id: 'livro-comercial', icon: '❤️', color: '#ef4444' },
              { id: 'livro-e', icon: '❄️', color: '#06b6d4' },
              { id: 'certidoes', icon: '📄', color: '#6b7280' },
              { id: 'indice', icon: '🔍', color: '#3b82f6' },
              { id: 'editor', icon: '❓', color: '#3b82f6' },
              { id: 'relatorios', icon: '✍️', color: '#f59e0b' },
              { id: 'remessas', icon: '🚪', color: '#8b5cf6' },
              { id: 'digitalizacao', icon: '📱', color: '#10b981' },
              { id: 'procuracao', icon: '📋', color: '#f97316' },
              { id: 'ajuda', icon: '❓', color: '#6366f1' }
            ].map((menu) => (
              <button
                key={menu.id}
                onClick={() => handleMenuClick(menu.id)}
                style={{
                  padding: '8px 12px',
                  background: openDropdown === menu.id ? theme.menuActive : 'transparent',
                  border: `1px solid ${openDropdown === menu.id ? '#3b82f6' : 'transparent'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  transition: 'all 0.2s ease',
                  minWidth: 'fit-content',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  if (openDropdown !== menu.id) {
                    const target = e.target as HTMLButtonElement
                    target.style.background = theme.menuActive
                    target.style.borderColor = '#3b82f6'
                    target.style.transform = 'scale(1.1)'
                  }
                }}
                onMouseOut={(e) => {
                  if (openDropdown !== menu.id) {
                    const target = e.target as HTMLButtonElement
                    target.style.background = 'transparent'
                    target.style.borderColor = 'transparent'
                    target.style.transform = 'scale(1)'
                  }
                }}
              >
                {menu.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Área de Conteúdo Principal - COMPLETAMENTE LIMPA */}
        <div style={{
          flex: 1
        }}>
          {/* Área completamente vazia para suas adaptações futuras */}
        </div>
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