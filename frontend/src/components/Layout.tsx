import { Outlet, useNavigate } from 'react-router-dom'
import { Header } from './Header'
import { MenuBar } from './MenuBar'
import { Toolbar } from './Toolbar'
import { SideMenu } from './SideMenu'
import { WindowManager } from './WindowManager'
import { SafeComponent } from './SafeComponent'
import { useAuth } from '../contexts/AuthContext'
import { useAccessibility } from '../hooks/useAccessibility'
import { useEffect, useState } from 'react'

export function Layout() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
  
  // 🔒 CORREÇÃO CRÍTICA: Forçar re-renderização quando tema muda
  const { getTheme, currentTheme, isThemeLoaded } = useAccessibility()
  const [updateCount, setUpdateCount] = useState(0)
  
  // 🔒 GARANTIA 100%: Re-renderizar quando currentTheme muda
  useEffect(() => {
    if (isThemeLoaded && currentTheme) {
      console.log('🎨 Layout - Tema mudou para:', currentTheme)
      setUpdateCount(prev => prev + 1) // Força re-render
    }
  }, [currentTheme, isThemeLoaded])
  
  // 🔒 GARANTIA DUPLA: Escutar evento customizado theme-changed
  useEffect(() => {
    const handleThemeChange = (e: any) => {
      console.log('📢 Layout - Recebeu evento theme-changed:', e.detail)
      setUpdateCount(prev => prev + 1) // Força re-render adicional
    }
    
    window.addEventListener('theme-changed', handleThemeChange)
    console.log('👂 Layout - Escutando evento theme-changed')
    
    return () => {
      window.removeEventListener('theme-changed', handleThemeChange)
    }
  }, [])
  
  const theme = getTheme()
  
  console.log('🔄 Layout render #', updateCount, 'Tema:', currentTheme, 'Background:', theme.background, 'Surface:', theme.surface)


  // Aguardar o tema estar carregado
  if (!isThemeLoaded || !theme || !currentTheme) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando tema...</div>
      </div>
    )
  }

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login')
    }
  }, [user, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div 
      className={`flex flex-col h-screen theme-${currentTheme}`}
      style={{
        backgroundColor: theme.background,
        color: theme.text,
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}
    >
      <SafeComponent name="Header">
        <Header onMenuClick={() => setIsSideMenuOpen(true)} />
      </SafeComponent>
      
      <SafeComponent name="MenuBar">
        <MenuBar />
      </SafeComponent>
      
      <main 
        className="flex-1 main-content-area"
        style={{
          backgroundColor: theme.background,
          color: theme.text,
          position: 'relative',
          overflow: 'auto',
          overflowX: 'auto',
          overflowY: 'auto',
          height: '100%',
          minHeight: 0
        }}
      >
        {/* Container interno que expande com as janelas */}
        <div style={{
          position: 'relative',
          minHeight: '200vh',  // 2x a altura da viewport
          minWidth: '200vw',   // 2x a largura da viewport
          width: '100%',
          height: '100%'
        }}>
          <SafeComponent name="MainContent">
            <Outlet />
          </SafeComponent>
          
          {/* WindowManager DENTRO do container scrollável */}
          <SafeComponent name="WindowManager">
            <WindowManager />
          </SafeComponent>
        </div>
      </main>
      
      <SafeComponent name="SideMenu">
        <SideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} />
      </SafeComponent>
    </div>
  )
}

