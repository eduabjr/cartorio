import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight, Building, Shield, User } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('admin@cartorio.com')
  const [password, setPassword] = useState('')
  const [profile, setProfile] = useState<'admin' | 'employee'>('employee')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await login(email, password, profile)
      navigate('/')
    } catch (error) {
      alert('Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-3">
            <Building className="h-12 w-12 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-blue-600">Sistema Cartório</h1>
              <p className="text-sm text-gray-600">Tecnologia da Informação</p>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  )
}

