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
  const { getTheme, currentTheme, isThemeLoaded } = useAccessibility()
  const theme = getTheme()


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
        color: theme.text
      }}
    >
      <SafeComponent name="Header">
        <Header onMenuClick={() => setIsSideMenuOpen(true)} />
      </SafeComponent>
      
      <SafeComponent name="MenuBar">
        <MenuBar />
      </SafeComponent>
      
      <main 
        className="flex-1 overflow-auto"
        style={{
          backgroundColor: theme.background,
          color: theme.text
        }}
      >
        <SafeComponent name="MainContent">
          <Outlet />
        </SafeComponent>
      </main>
      
      <SafeComponent name="SideMenu">
        <SideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} />
      </SafeComponent>
      
      <SafeComponent name="WindowManager">
        <WindowManager />
      </SafeComponent>
    </div>
  )
}

