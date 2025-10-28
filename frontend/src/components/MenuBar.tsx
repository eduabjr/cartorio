import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccessibility } from '../hooks/useAccessibility'

/**
 * MENUBAR
 * 🚨 CORREÇÃO: Removido React.memo para permitir re-renders quando tema muda
 */
export function MenuBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const [renderKey, setRenderKey] = useState(0)

  // Buscar tema - SEMPRE chamar getTheme() diretamente
  const { getTheme, currentTheme, isThemeLoaded } = useAccessibility()
  const theme = getTheme()

  // 🔥 FORÇA BRUTA: Escutar mudanças de tema
  useEffect(() => {
    console.log('🔥 MenuBar - Tema mudou para:', currentTheme)
    setRenderKey(prev => prev + 1)
  }, [currentTheme])

  console.log('🔄 MenuBar render #', renderKey, '- Tema:', currentTheme, 'Surface:', theme.surface)

  // 🚨 CORREÇÃO CRÍTICA: Aguardar tema estar carregado antes de renderizar
  if (!isThemeLoaded) {
    console.log('⏳ MenuBar - Aguardando tema carregar...')
    return null // Não renderizar até o tema estar pronto
  }

  return (
    <div
      className="sticky top-16 z-40 shadow-sm transition-colors duration-200"
      style={{
        backgroundColor: 'var(--surface-color)', // 🚨 CORREÇÃO: Usar variável CSS
        borderBottom: '1px solid var(--border-color)', // 🚨 CORREÇÃO: Usar variável CSS
      }}
    >
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <MenuButton
              label="Cadastros"
              onClick={() => navigate('/cadastros')}
              theme={theme}
            />
            <MenuButton
              label="Protocolo"
              onClick={() => navigate('/protocolos')}
              theme={theme}
            />
            <MenuButton
              label="Lavratura"
              onClick={() => navigate('/lavratura')}
              theme={theme}
            />
            <MenuButton
              label="Certidões"
              onClick={() => navigate('/certidoes')}
              theme={theme}
            />
            <MenuButton
              label="Firmas"
              onClick={() => navigate('/firmas')}
              theme={theme}
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden px-3 py-2 rounded-md transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ 
              color: theme.text,
              backgroundColor: isMobileMenuOpen ? theme.hover : 'transparent'
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-2 space-y-1" style={{ borderTop: `1px solid ${theme.border}` }}>
            <MobileMenuItem label="Cadastros" onClick={() => { navigate('/cadastros'); setIsMobileMenuOpen(false); }} theme={theme} />
            <MobileMenuItem label="Protocolo" onClick={() => { navigate('/protocolos'); setIsMobileMenuOpen(false); }} theme={theme} />
            <MobileMenuItem label="Lavratura" onClick={() => { navigate('/lavratura'); setIsMobileMenuOpen(false); }} theme={theme} />
            <MobileMenuItem label="Certidões" onClick={() => { navigate('/certidoes'); setIsMobileMenuOpen(false); }} theme={theme} />
            <MobileMenuItem label="Firmas" onClick={() => { navigate('/firmas'); setIsMobileMenuOpen(false); }} theme={theme} />
          </div>
        )}
      </div>
    </div>
  )
})

// ⚡ Sub-componentes memoizados
const MenuButton = memo(({ label, onClick, theme }: any) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-2 transition-colors duration-150 hover:opacity-80"
    style={{ color: theme.text }}
  >
    <span className="font-medium">{label}</span>
  </button>
))
MenuButton.displayName = 'MenuButton'

const MobileMenuItem = memo(({ label, onClick, theme }: any) => (
  <button
    onClick={onClick}
    className="block w-full text-left px-3 py-2 rounded-md transition-colors"
    style={{
      color: theme.text,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = theme.hover
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'transparent'
    }}
  >
    {label}
  </button>
))
MobileMenuItem.displayName = 'MobileMenuItem'
