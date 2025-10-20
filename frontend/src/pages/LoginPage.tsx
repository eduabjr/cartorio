import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight, Building, Shield, User } from 'lucide-react'
import { CivitasLogo } from '../components/CivitasLogo'
import { useAccessibility } from '../hooks/useAccessibility'

export function LoginPage() {
  const [email, setEmail] = useState('admin@cartorio.com')
  const [password, setPassword] = useState('admin123')
  const [profile, setProfile] = useState<'admin' | 'employee'>('admin')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const { currentTheme } = useAccessibility()

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
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-3">
            {currentTheme === 'dark' ? (
              // No modo dark, mostrar apenas o texto CIVITAS em branco
              <div>
                <h1 className="text-2xl font-bold text-white">CIVITAS</h1>
                <p className="text-sm text-gray-300">Sistema Cartório</p>
              </div>
            ) : (
              // No modo light, usar o logo-light
              <CivitasLogo 
                size={48} 
                theme="light" 
                showText={true}
                textColor="#2D5A5A"
              />
            )}
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
      </div>
    </div>
  )
}

