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
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const [windowState, setWindowState] = useState<WindowState>('normal')

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
          gap: '8px',
          alignItems: 'center',
          paddingRight: '12px',
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
            width: '32px',
            height: '32px',
            border: 'none',
            borderRadius: '4px',
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
          <svg width="11" height="11" viewBox="0 0 11 11" fill="white" aria-hidden="true" focusable="false">
            <rect x="0" y="5" width="11" height="1"/>
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
            width: '32px',
            height: '32px',
            border: 'none',
            borderRadius: '4px',
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
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="white" strokeWidth="1.3" aria-hidden="true" focusable="false" style={{ pointerEvents: 'none' }}>
              <rect x="0.5" y="0.5" width="10" height="10" />
              <path d="M3 3 L3 5.5 L5.5 5.5 M8 3 L8 5.5 L5.5 5.5 M3 8 L3 5.5 M8 8 L8 5.5" 
                    strokeLinecap="round" strokeLinejoin="round" fill="white" fillOpacity="0.3"/>
            </svg>
          ) : windowState === 'minimized' ? (
            // ÍCONE 2: Reduzido → Setas para fora (estender)
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="white" strokeWidth="1.3" aria-hidden="true" focusable="false" style={{ pointerEvents: 'none' }}>
              <path d="M1 1 L1 4 M1 1 L4 1 M10 1 L7 1 M10 1 L10 4 M1 10 L1 7 M1 10 L4 10 M10 10 L10 7 M10 10 L7 10" 
                    strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3.5" y="3.5" width="4" height="4" fill="white" fillOpacity="0.3"/>
            </svg>
          ) : (
            // ÍCONE 3: Estendido → Quadrados sobrepostos (voltar ao normal)
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="white" strokeWidth="1.2" aria-hidden="true" focusable="false" style={{ pointerEvents: 'none' }}>
              <rect x="3" y="0.5" width="7" height="7" />
              <rect x="0.5" y="3" width="7" height="7" />
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
            width: '32px',
            height: '32px',
            border: 'none',
            borderRadius: '4px',
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
          <svg width="10" height="10" viewBox="0 0 10 10" fill="white" aria-hidden="true" focusable="false">
            <path d="M1 1 L9 9 M9 1 L1 9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

