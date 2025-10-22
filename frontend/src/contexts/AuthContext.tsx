import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, PROFILE_PERMISSIONS } from '../types/User'
import { apiService } from '../services/ApiService'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, profile?: 'admin' | 'employee') => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se há token salvo no localStorage
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    // Removido login automático - sempre mostrar tela de login
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, profile: 'admin' | 'employee' = 'employee') => {
    try {
      // Tentar autenticação via API com fallback para modo offline
      const response = await apiService.post<{ token: string; user: any }>(
        '/auth/login',
        { email, password, profile },
        {
          // Fallback para autenticação offline se o serviço estiver indisponível
          fallback: {
            token: 'offline-token-' + Date.now(),
            user: {
              id: '1',
              email,
              name: email.split('@')[0],
              profile,
              permissions: PROFILE_PERMISSIONS[profile]
            }
          }
        }
      )
      
      const { token, user: userData } = response
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      
      console.log('✅ Login realizado com sucesso via microserviço')
    } catch (error) {
      // Se falhar, usar credenciais de demonstração como fallback final
      console.warn('⚠️ Usando autenticação de fallback')
      
      const validCredentials = {
        'admin@cartorio.com': { password: 'admin123', profile: 'admin' as const },
        'funcionario@cartorio.com': { password: 'func123', profile: 'employee' as const },
        'teste@cartorio.com': { password: 'teste123', profile: 'employee' as const }
      }
      
      const credential = validCredentials[email as keyof typeof validCredentials]
      
      if (!credential || credential.password !== password) {
        throw new Error('Email ou senha incorretos')
      }
      
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        profile: credential.profile,
        permissions: PROFILE_PERMISSIONS[credential.profile]
      }
      
      const mockToken = 'fallback-token-' + Date.now()
      
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      setUser(mockUser)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

