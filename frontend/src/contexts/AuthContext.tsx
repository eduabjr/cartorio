import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, PROFILE_PERMISSIONS } from '../types/User'

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
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, _password: string, profile: 'admin' | 'employee' = 'employee') => {
    try {
      // Simular login - em produção, fazer requisição para API
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        profile,
        permissions: PROFILE_PERMISSIONS[profile]
      }
      
      const mockToken = 'mock-jwt-token'
      
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      setUser(mockUser)
    } catch (error) {
      throw new Error('Erro ao fazer login')
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

