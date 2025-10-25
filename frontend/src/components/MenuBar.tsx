import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccessibility } from '../hooks/useAccessibility'

export function MenuBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  
  // 🔒 BLOQUEIO: Usar getTheme() diretamente sem useState local
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  
  // 🔒 BLOQUEIO: Log para debug (apenas desenvolvimento)
  useEffect(() => {
    console.log('🎨 MenuBar - Tema atual:', currentTheme, theme)
  }, [currentTheme, theme])

  const handleLogout = () => {
    // Implementar logout
    console.log('Logout')
  }

  // 🔒 BLOQUEIO: Estilos sempre atualizados com o tema atual
  const menuStyles: React.CSSProperties = {
    background: theme.surface,
    padding: '4px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    borderBottom: `1px solid ${theme.border}`,
    transition: 'all 0.3s ease' // Transição suave na troca de tema
  }

  return (
    <div>
      {/* Menu Mobile Button */}
      <div className="lg:hidden" style={menuStyles}>
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center space-x-2 transition-colors duration-150"
            style={{ color: theme.text }}
          >
            <span className="font-medium">Menu</span>
          </button>
        </div>
      </div>

      {/* Menu Desktop */}
      <div className="hidden lg:block" style={menuStyles}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => navigate('/cadastros')}
              className="flex items-center space-x-2 transition-colors duration-150"
              style={{ color: theme.text }}
            >
              <span className="font-medium">Cadastros</span>
            </button>
            
            <button
              onClick={() => navigate('/processos')}
              className="flex items-center space-x-2 transition-colors duration-150"
              style={{ color: theme.text }}
            >
              <span className="font-medium">Processos</span>
            </button>
            
            <button
              onClick={() => navigate('/atendimento')}
              className="flex items-center space-x-2 transition-colors duration-150"
              style={{ color: theme.text }}
            >
              <span className="font-medium">Atendimento</span>
            </button>
            
            <button
              onClick={() => navigate('/protocolo')}
              className="flex items-center space-x-2 transition-colors duration-150"
              style={{ color: theme.text }}
            >
              <span className="font-medium">Protocolo</span>
            </button>
            
            <button
              onClick={() => navigate('/lavratura')}
              className="flex items-center space-x-2 transition-colors duration-150"
              style={{ color: theme.text }}
            >
              <span className="font-medium">Lavratura</span>
            </button>
            
            <button
              onClick={() => navigate('/certidoes')}
              className="flex items-center space-x-2 transition-colors duration-150"
              style={{ color: theme.text }}
            >
              <span className="font-medium">Certidões</span>
            </button>
            
            <button
              onClick={() => navigate('/firmas')}
              className="flex items-center space-x-2 transition-colors duration-150"
              style={{ color: theme.text }}
            >
              <span className="font-medium">Firmas</span>
            </button>
            
            <button
              onClick={() => navigate('/livro-e')}
              className="flex items-center space-x-2 transition-colors duration-150"
              style={{ color: theme.text }}
            >
              <span className="font-medium">Livro E</span>
            </button>
            
            <button
              onClick={() => navigate('/livro-comercial')}
              className="flex items-center space-x-2 transition-colors duration-150"
              style={{ color: theme.text }}
            >
              <span className="font-medium">Livro Comercial</span>
            </button>
            
            <button
              onClick={() => navigate('/remessas')}
              className="flex items-center space-x-2 transition-colors duration-150"
              style={{ color: theme.text }}
            >
              <span className="font-medium">Remessas</span>
            </button>
            
            <button
              onClick={() => navigate('/relatorios')}
              className="flex items-center space-x-2 transition-colors duration-150"
              style={{ color: theme.text }}
            >
              <span className="font-medium">Relatórios</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-150"
              style={{ color: theme.text }}
            >
              <span className="text-sm">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="lg:hidden" style={menuStyles}>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => {
                navigate('/cadastros')
                setIsMobileMenuOpen(false)
              }}
              className="flex items-center space-x-2 text-white hover:text-yellow-200 py-2 transition-colors duration-150"
            >
              <span className="font-medium">Cadastros</span>
            </button>
            
            <button
              onClick={() => {
                navigate('/processos')
                setIsMobileMenuOpen(false)
              }}
              className="flex items-center space-x-2 text-white hover:text-yellow-200 py-2 transition-colors duration-150"
            >
              <span className="font-medium">Processos</span>
            </button>
            
            <button
              onClick={() => {
                navigate('/atendimento')
                setIsMobileMenuOpen(false)
              }}
              className="flex items-center space-x-2 text-white hover:text-yellow-200 py-2 transition-colors duration-150"
            >
              <span className="font-medium">Atendimento</span>
            </button>
            
            <button
              onClick={() => {
                navigate('/protocolo')
                setIsMobileMenuOpen(false)
              }}
              className="flex items-center space-x-2 text-white hover:text-yellow-200 py-2 transition-colors duration-150"
            >
              <span className="font-medium">Protocolo</span>
            </button>
            
            <button
              onClick={() => {
                navigate('/lavratura')
                setIsMobileMenuOpen(false)
              }}
              className="flex items-center space-x-2 text-white hover:text-yellow-200 py-2 transition-colors duration-150"
            >
              <span className="font-medium">Lavratura</span>
            </button>
            
            <button
              onClick={() => {
                navigate('/certidoes')
                setIsMobileMenuOpen(false)
              }}
              className="flex items-center space-x-2 text-white hover:text-yellow-200 py-2 transition-colors duration-150"
            >
              <span className="font-medium">Certidões</span>
            </button>
            
            <button
              onClick={() => {
                navigate('/firmas')
                setIsMobileMenuOpen(false)
              }}
              className="flex items-center space-x-2 text-white hover:text-yellow-200 py-2 transition-colors duration-150"
            >
              <span className="font-medium">Firmas</span>
            </button>
            
            <button
              onClick={() => {
                navigate('/livro-e')
                setIsMobileMenuOpen(false)
              }}
              className="flex items-center space-x-2 text-white hover:text-yellow-200 py-2 transition-colors duration-150"
            >
              <span className="font-medium">Livro E</span>
            </button>
            
            <button
              onClick={() => {
                navigate('/livro-comercial')
                setIsMobileMenuOpen(false)
              }}
              className="flex items-center space-x-2 text-white hover:text-yellow-200 py-2 transition-colors duration-150"
            >
              <span className="font-medium">Livro Comercial</span>
            </button>
            
            <button
              onClick={() => {
                navigate('/remessas')
                setIsMobileMenuOpen(false)
              }}
              className="flex items-center space-x-2 text-white hover:text-yellow-200 py-2 transition-colors duration-150"
            >
              <span className="font-medium">Remessas</span>
            </button>
            
            <button
              onClick={() => {
                navigate('/relatorios')
                setIsMobileMenuOpen(false)
              }}
              className="flex items-center space-x-2 text-white hover:text-yellow-200 py-2 transition-colors duration-150"
            >
              <span className="font-medium">Relatórios</span>
            </button>
            
            <div className="border-t border-white border-opacity-20 pt-2 mt-2">
              <button
                onClick={() => {
                  handleLogout()
                  setIsMobileMenuOpen(false)
                }}
                className="flex items-center space-x-1 px-3 py-2 text-white hover:text-red-200 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-colors duration-150"
              >
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
