import { useAccessibility } from '../hooks/useAccessibility'
import { useState, useEffect } from 'react'

interface HeaderProps {
  onMenuClick?: () => void
}

// Tipo para o estado da janela - CICLO DE 4 PASSOS
type WindowState = 'normal' | 'minimized' | 'extended'

// Declaração global para TypeScript reconhecer a API do Electron
declare global {
  interface Window {
    electronAPI?: {
      minimizeWindow: () => void
      maximizeWindow: () => void // Ciclo: normal → minimized → extended → normal
      closeWindow: () => void
      onWindowStateChanged: (callback: (state: WindowState) => void) => void
      getWindowState: () => Promise<WindowState>
    }
  }
}

export function Header({ onMenuClick }: HeaderProps) {
  // 🔒 CORREÇÃO CRÍTICA: Forçar re-renderização quando tema muda
  const { getTheme, currentTheme } = useAccessibility()
  const [updateCount, setUpdateCount] = useState(0)
  const [windowState, setWindowState] = useState<WindowState>('normal')
  
  // 🔒 GARANTIA 100%: Re-renderizar quando currentTheme muda
  useEffect(() => {
    console.log('🎨 Header - Tema mudou para:', currentTheme)
    setUpdateCount(prev => prev + 1) // Força re-render
  }, [currentTheme])
  
  // 🔒 GARANTIA DUPLA: Escutar evento customizado theme-changed
  useEffect(() => {
    const handleThemeChange = (e: any) => {
      console.log('📢 Header - Recebeu evento theme-changed:', e.detail)
      setUpdateCount(prev => prev + 1) // Força re-render adicional
    }
    
    window.addEventListener('theme-changed', handleThemeChange)
    console.log('👂 Header - Escutando evento theme-changed')
    
    return () => {
      window.removeEventListener('theme-changed', handleThemeChange)
    }
  }, [])
  
  const theme = getTheme()
  
  console.log('🔄 Header render #', updateCount, 'Tema:', currentTheme, 'Surface:', theme.surface, 'Text:', theme.text)

  // Verificar ambiente ao montar
  useEffect(() => {
    console.log('\n═════════════════════════════════════════════════')
    console.log('🔍 DIAGNÓSTICO DE AMBIENTE')
    console.log('═════════════════════════════════════════════════')
    console.log('🌐 window.electronAPI existe?', !!window.electronAPI)
    console.log('🪟 User Agent:', navigator.userAgent)
    console.log('📍 Location:', window.location.href)
    console.log('🔧 Modo:', window.electronAPI ? '✅ ELECTRON' : '❌ NAVEGADOR')
    
    if (!window.electronAPI) {
      console.error('❌❌❌ RODANDO NO NAVEGADOR WEB ❌❌❌')
      console.error('⚠️  Os botões de janela NÃO funcionarão!')
      console.error('⚠️  Execute: npm run electron-dev')
      console.error('⚠️  Ou: .\\RESETAR-ELECTRON-AGORA.ps1')
    }
    console.log('═════════════════════════════════════════════════\n')
  }, [])

  // Escutar eventos de mudança de estado da janela
  useEffect(() => {
    if (window.electronAPI) {
      console.log('🎬 React: Inicializando sistema de ciclo de janela')
      
      // 1. Buscar estado inicial do Electron
      window.electronAPI.getWindowState().then((initialState) => {
        console.log('📡 Estado inicial recebido:', initialState)
        setWindowState(initialState)
      }).catch((err) => {
        console.warn('⚠️ Erro ao obter estado inicial:', err)
        setWindowState('normal')
      })
      
      // 2. Configurar listener para mudanças de estado
      window.electronAPI.onWindowStateChanged((state) => {
        console.log('📥 React: Novo estado recebido →', state)
        setWindowState(state)
      })
    }
  }, [])

  const handleMinimize = () => {
    console.log('🔽 Minimizando janela...')
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow()
    } else {
      console.warn('⚠️ electronAPI não disponível - rodando no navegador')
    }
  }

  const handleMaximize = () => {
    console.log('\n╔══════════════════════════════════════════════════╗')
    console.log('║  🖱️  CLIQUE NO BOTÃO MAXIMIZAR (REACT)          ║')
    console.log('╚══════════════════════════════════════════════════╝')
    console.log('📊 Estado atual do React:', windowState)
    console.log('🪟 window.electronAPI existe?', !!window.electronAPI)
    
    if (window.electronAPI) {
      console.log('✅ electronAPI disponível, enviando mensagem...')
      try {
        window.electronAPI.maximizeWindow()
        console.log('✅ window.electronAPI.maximizeWindow() chamado com sucesso')
      } catch (error) {
        console.error('❌ ERRO ao chamar maximizeWindow():', error)
      }
    } else {
      console.error('❌ electronAPI NÃO DISPONÍVEL - rodando no navegador')
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }

  const handleClose = () => {
    console.log('❌ Fechando janela...')
    if (window.electronAPI) {
      window.electronAPI.closeWindow()
    } else {
      console.warn('⚠️ electronAPI não disponível - rodando no navegador')
      // Fallback para navegador
      window.close()
    }
  }

  // 🎨 Cor do header baseada no tema
  const getHeaderColor = () => {
    switch(currentTheme) {
      case 'dark':
        return '#0d2617' // Verde muito escuro para dark mode
      case 'highContrast':
        return '#000000' // Preto para alto contraste
      default:
        return '#1a5c3a' // Verde padrão para light mode
    }
  }

  return (
    <div 
      role="banner"
      aria-label="Barra de título do aplicativo"
      style={{
        backgroundColor: getHeaderColor(),
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0',
        margin: '0',
        position: 'relative' as const,
        top: '0',
        left: '0',
        right: '0',
        WebkitAppRegion: 'drag' as any, // Permite arrastar a janela
        userSelect: 'none',
        zIndex: 1000,
        width: '100%',
        boxSizing: 'border-box' as const,
        transition: 'background-color 0.3s ease' // Transição suave
      }}
    >
      {/* Logo e Nome */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        paddingLeft: '16px',
        height: '100%'
      }}>
        <img 
          src="/logo-header.png" 
          alt="Logo" 
          style={{ height: '32px', width: 'auto' }}
        />
        <span style={{ 
          color: 'white', 
          fontSize: '18px', 
          fontWeight: 'bold',
          letterSpacing: '0.5px'
        }}>
          CIVITAS
        </span>
      </div>

      {/* Botões de Controle da Janela */}
      <div 
        role="group"
        aria-label="Controles da janela"
        style={{ 
          display: 'flex', 
          gap: '4px',
          alignItems: 'center',
          paddingRight: '12px',
          height: '100%',
          WebkitAppRegion: 'no-drag' as any
        }}
      >
         {/* Botão Minimizar */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleMinimize();
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2d2d2d'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3f3f3f'
          }}
          style={{
            width: '22px',
            height: '22px',
            border: 'none',
            borderRadius: '3px',
            backgroundColor: '#3f3f3f',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s ease',
            padding: '0',
            margin: '0',
            outline: 'none',
            pointerEvents: 'auto',
            WebkitAppRegion: 'no-drag' as any,
            userSelect: 'none',
            position: 'relative' as const
          }}
          title="Minimizar"
          aria-label="Minimizar janela"
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="white" aria-hidden="true" focusable="false">
            <rect x="0" y="4" width="9" height="1"/>
          </svg>
        </button>

         {/* Botão Ciclo de Janela: Normal → Reduzido → Estendido → Normal */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 onClick do botão DISPARADO! (via', e.type, ')');
            handleMaximize();
          }}
          onMouseDown={(e) => {
            console.log('🖱️  onMouseDown DISPARADO!');
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            console.log('🖱️  onMouseUp DISPARADO!');
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onKeyDown={(e) => {
            console.log('⌨️  onKeyDown DISPARADO! Tecla:', e.key);
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              console.log('✅ TECLA ENTER/SPACE - Chamando handleMaximize()');
              handleMaximize();
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2d2d2d'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3f3f3f'
          }}
          style={{
            width: '22px',
            height: '22px',
            border: 'none',
            borderRadius: '3px',
            backgroundColor: '#3f3f3f',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s ease',
            padding: '0',
            margin: '0',
            outline: 'none',
            pointerEvents: 'auto',
            WebkitAppRegion: 'no-drag' as any,
            userSelect: 'none',
            zIndex: 10000,
            position: 'relative' as const
          }}
          title={
            windowState === 'normal' ? "1º Clique: Reduzir janela (900x600)" :
            windowState === 'minimized' ? "2º Clique: Estender para 2ª tela (ou maximizar)" :
            "3º Clique: Voltar ao normal (1200x800)"
          }
          aria-label={
            windowState === 'normal' ? "Reduzir janela" :
            windowState === 'minimized' ? "Estender janela" :
            "Restaurar janela ao tamanho normal"
          }
        >
          {windowState === 'normal' ? (
            // ÍCONE 1: Normal → Setas para dentro (reduzir)
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="white" strokeWidth="1.2" aria-hidden="true" focusable="false" style={{ pointerEvents: 'none' }}>
              <rect x="0.5" y="0.5" width="8" height="8" />
              <path d="M2.5 2.5 L2.5 4.5 L4.5 4.5 M6.5 2.5 L6.5 4.5 L4.5 4.5 M2.5 6.5 L2.5 4.5 M6.5 6.5 L6.5 4.5" 
                    strokeLinecap="round" strokeLinejoin="round" fill="white" fillOpacity="0.3"/>
            </svg>
          ) : windowState === 'minimized' ? (
            // ÍCONE 2: Reduzido → Setas para fora (estender)
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="white" strokeWidth="1.2" aria-hidden="true" focusable="false" style={{ pointerEvents: 'none' }}>
              <path d="M0.5 0.5 L0.5 3 M0.5 0.5 L3 0.5 M8.5 0.5 L6 0.5 M8.5 0.5 L8.5 3 M0.5 8.5 L0.5 6 M0.5 8.5 L3 8.5 M8.5 8.5 L8.5 6 M8.5 8.5 L6 8.5" 
                    strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="3" width="3" height="3" fill="white" fillOpacity="0.3"/>
            </svg>
          ) : (
            // ÍCONE 3: Estendido → Quadrados sobrepostos (voltar ao normal)
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="white" strokeWidth="1.1" aria-hidden="true" focusable="false" style={{ pointerEvents: 'none' }}>
              <rect x="2.5" y="0.5" width="6" height="6" />
              <rect x="0.5" y="2.5" width="6" height="6" />
            </svg>
          )}
        </button>

        {/* Botão Fechar */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClose();
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#c42b1c'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#e81123'
          }}
          style={{
            width: '22px',
            height: '22px',
            border: 'none',
            borderRadius: '3px',
            backgroundColor: '#e81123',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s ease',
            padding: '0',
            margin: '0',
            outline: 'none',
            pointerEvents: 'auto',
            WebkitAppRegion: 'no-drag' as any,
            userSelect: 'none',
            position: 'relative' as const
          }}
          title="Fechar"
          aria-label="Fechar janela"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="white" aria-hidden="true" focusable="false">
            <path d="M0.5 0.5 L7.5 7.5 M7.5 0.5 L0.5 7.5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

