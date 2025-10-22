import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight, Shield, User } from 'lucide-react'
import { useAccessibility } from '../hooks/useAccessibility'

export function LoginPage() {
  const [email, setEmail] = useState('admin@cartorio.com')
  const [password, setPassword] = useState('admin123')
  const [profile, setProfile] = useState<'admin' | 'employee'>('admin')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [forceUpdate, setForceUpdate] = useState(0)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { currentTheme, settings, isThemeLoaded } = useAccessibility()

  // Forçar re-renderização quando o tema mudar
  useEffect(() => {
    console.log('🔄 Tema mudou para:', currentTheme)
    setForceUpdate(prev => prev + 1)
  }, [currentTheme])

  // Forçar tema para teste
  const forceTheme = (theme: 'light' | 'dark') => {
    localStorage.setItem('theme', theme)
    window.location.reload()
  }

  // Determinar qual logo usar baseado no tema
  const logoSrc = currentTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png'
  const logoTextColor = currentTheme === 'dark' ? '#ffffff' : '#2D5A5A'

  // Log quando o tema mudar
  console.log('🎨 LoginPage - Tema atual:', currentTheme)
  console.log('📸 LoginPage - Logo a ser usado:', logoSrc)
  console.log('🎨 LoginPage - Cor do texto:', logoTextColor)
  console.log('🔢 Render count:', forceUpdate)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      await login(email, password, profile)
      navigate('/')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div key={`login-${currentTheme}-${forceUpdate}`} className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        {/* Logo e Título */}
        <div className="flex flex-col items-center justify-center mb-6">
          {/* Debug Info */}
          <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-100 rounded w-full">
            <div><strong>Tema:</strong> <span style={{ color: currentTheme === 'dark' ? 'red' : 'green' }}>{currentTheme}</span></div>
            <div><strong>Logo:</strong> {logoSrc}</div>
            <div><strong>Cor do texto:</strong> <span style={{ color: logoTextColor }}>{logoTextColor}</span></div>
            <div><strong>Carregado:</strong> {isThemeLoaded ? 'Sim ✅' : 'Não ❌'}</div>
            <div><strong>Body class:</strong> {document.body.className}</div>
          </div>

          {/* Logo e Nome */}
          <div className="flex items-center space-x-3" style={{ 
            padding: '10px', 
            border: '2px solid ' + (currentTheme === 'dark' ? 'red' : 'green'),
            borderRadius: '8px'
          }}>
            <img 
              src={logoSrc}
              alt="Logo CIVITAS"
              width={48}
              height={48}
              style={{
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                border: '1px solid #ccc'
              }}
              onLoad={() => console.log('✅ Logo carregado:', logoSrc)}
              onError={() => console.error('❌ Erro ao carregar logo:', logoSrc)}
            />
            <span 
              style={{
                color: logoTextColor,
                fontSize: '29px',
                fontWeight: 'bold',
                fontFamily: 'Arial, sans-serif',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                letterSpacing: '1px'
              }}
            >
              CIVITAS
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Login
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Perfil de Acesso
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProfile('employee')}
                className={`p-3 border-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  profile === 'employee'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <User size={20} />
                <div className="text-left">
                  <div className="font-medium">Funcionário</div>
                  <div className="text-xs text-gray-500">Acesso básico</div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setProfile('admin')}
                className={`p-3 border-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  profile === 'admin'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Shield size={20} />
                <div className="text-left">
                  <div className="font-medium">Administrador</div>
                  <div className="text-xs text-gray-500">Acesso completo</div>
                </div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary flex items-center justify-center space-x-2"
          >
            <span>Entrar</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Rua Yara, 49 - São João</p>
          <p>CEP: 17513-370 - Marília/SP</p>
          <p>Tel: (14) 3216-2611</p>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          <p className="font-medium text-blue-800 mb-2">Credenciais de Demonstração:</p>
          <div className="space-y-1 text-blue-700">
            <p><strong>Admin:</strong> admin@cartorio.com / admin123</p>
            <p><strong>Funcionário:</strong> funcionario@cartorio.com / func123</p>
            <p><strong>Teste:</strong> teste@cartorio.com / teste123</p>
          </div>
        </div>

        {/* Botões de teste para tema */}
        <div className="mt-4 text-center space-y-2">
          <div className="flex justify-center space-x-2">
            <button
              type="button"
              onClick={() => forceTheme('light')}
              className="px-3 py-1 bg-green-200 text-green-700 rounded hover:bg-green-300 transition-colors text-xs"
            >
              Forçar Light
            </button>
            <button
              type="button"
              onClick={() => forceTheme('dark')}
              className="px-3 py-1 bg-blue-200 text-blue-700 rounded hover:bg-blue-300 transition-colors text-xs"
            >
              Forçar Dark
            </button>
          </div>
          
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('theme')
              localStorage.removeItem('accessibility-settings')
              window.location.reload()
            }}
            className="px-4 py-2 bg-red-200 text-red-700 rounded hover:bg-red-300 transition-colors text-sm"
          >
            Limpar Tema (Reset)
          </button>
        </div>
      </div>
    </div>
  )
}

