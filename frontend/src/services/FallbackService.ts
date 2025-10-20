import React from 'react'

/**
 * Serviço de Fallback - Fornece funcionalidades básicas
 * quando os serviços principais estão indisponíveis
 */

export interface FallbackData {
  users: any[]
  clients: any[]
  documents: any[]
  lastSync: Date
}

export interface OfflineCapability {
  name: string
  available: boolean
  description: string
}

class FallbackService {
  private fallbackData: FallbackData = {
    users: [],
    clients: [],
    documents: [],
    lastSync: new Date()
  }

  private offlineCapabilities: OfflineCapability[] = [
    {
      name: 'Visualização de Dados',
      available: true,
      description: 'Visualizar dados já carregados anteriormente'
    },
    {
      name: 'Navegação',
      available: true,
      description: 'Navegar entre páginas do sistema'
    },
    {
      name: 'Configurações',
      available: true,
      description: 'Acessar configurações locais'
    },
    {
      name: 'Cadastro Local',
      available: true,
      description: 'Cadastrar dados localmente (sincronização posterior)'
    },
    {
      name: 'Relatórios Básicos',
      available: true,
      description: 'Gerar relatórios com dados locais'
    }
  ]

  constructor() {
    this.loadFallbackData()
    this.initializeOfflineData()
  }

  private loadFallbackData() {
    try {
      const saved = localStorage.getItem('fallback-data')
      if (saved) {
        const parsed = JSON.parse(saved)
        this.fallbackData = {
          ...this.fallbackData,
          ...parsed,
          lastSync: new Date(parsed.lastSync || new Date())
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar dados de fallback:', error)
    }
  }

  private saveFallbackData() {
    try {
      localStorage.setItem('fallback-data', JSON.stringify(this.fallbackData))
    } catch (error) {
      console.warn('Erro ao salvar dados de fallback:', error)
    }
  }

  private initializeOfflineData() {
    // Dados básicos para funcionamento offline
    if (this.fallbackData.users.length === 0) {
      this.fallbackData.users = [
        {
          id: '1',
          email: 'admin@cartorio.com',
          name: 'Administrador',
          role: 'admin',
          lastLogin: new Date().toISOString()
        },
        {
          id: '2',
          email: 'funcionario@cartorio.com',
          name: 'Funcionário',
          role: 'funcionario',
          lastLogin: new Date().toISOString()
        }
      ]
    }

    if (this.fallbackData.clients.length === 0) {
      this.fallbackData.clients = [
        {
          id: 'CLI0001',
          nome: 'Cliente Exemplo',
          cpf: '000.000.000-00',
          email: 'cliente@exemplo.com',
          telefone: '(00) 0000-0000',
          createdAt: new Date().toISOString(),
          status: 'ativo'
        }
      ]
    }

    this.saveFallbackData()
  }

  // Métodos de autenticação offline
  public authenticateOffline(email: string, password: string): { success: boolean; user?: any; error?: string } {
    const user = this.fallbackData.users.find(u => u.email === email)
    
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    // Validação básica offline (em produção, isso seria mais seguro)
    const validPasswords = {
      'admin@cartorio.com': 'admin123',
      'funcionario@cartorio.com': 'func123'
    }

    if (validPasswords[email as keyof typeof validPasswords] !== password) {
      return { success: false, error: 'Senha incorreta' }
    }

    return { success: true, user }
  }

  // Métodos de gerenciamento de clientes offline
  public getClientsOffline(): any[] {
    return this.fallbackData.clients
  }

  public addClientOffline(clientData: any): { success: boolean; client?: any; error?: string } {
    try {
      const newClient = {
        ...clientData,
        id: `CLI${String(this.fallbackData.clients.length + 1).padStart(4, '0')}`,
        createdAt: new Date().toISOString(),
        status: 'pendente_sincronizacao'
      }

      this.fallbackData.clients.push(newClient)
      this.saveFallbackData()

      return { success: true, client: newClient }
    } catch (error) {
      return { success: false, error: 'Erro ao adicionar cliente offline' }
    }
  }

  public updateClientOffline(clientId: string, updates: any): { success: boolean; client?: any; error?: string } {
    try {
      const index = this.fallbackData.clients.findIndex(c => c.id === clientId)
      if (index === -1) {
        return { success: false, error: 'Cliente não encontrado' }
      }

      this.fallbackData.clients[index] = {
        ...this.fallbackData.clients[index],
        ...updates,
        updatedAt: new Date().toISOString(),
        status: 'pendente_sincronizacao'
      }

      this.saveFallbackData()
      return { success: true, client: this.fallbackData.clients[index] }
    } catch (error) {
      return { success: false, error: 'Erro ao atualizar cliente offline' }
    }
  }

  // Métodos de sincronização
  public getPendingSyncData(): any {
    return {
      clients: this.fallbackData.clients.filter(c => c.status === 'pendente_sincronizacao'),
      lastSync: this.fallbackData.lastSync
    }
  }

  public markAsSynced(clientIds: string[]): void {
    this.fallbackData.clients = this.fallbackData.clients.map(client => 
      clientIds.includes(client.id) 
        ? { ...client, status: 'sincronizado', syncedAt: new Date().toISOString() }
        : client
    )
    this.fallbackData.lastSync = new Date()
    this.saveFallbackData()
  }

  // Métodos de relatórios offline
  public generateOfflineReport(type: 'clients' | 'users' | 'summary'): any {
    switch (type) {
      case 'clients':
        return {
          total: this.fallbackData.clients.length,
          active: this.fallbackData.clients.filter(c => c.status === 'ativo').length,
          pending: this.fallbackData.clients.filter(c => c.status === 'pendente_sincronizacao').length,
          data: this.fallbackData.clients
        }

      case 'users':
        return {
          total: this.fallbackData.users.length,
          admins: this.fallbackData.users.filter(u => u.role === 'admin').length,
          employees: this.fallbackData.users.filter(u => u.role === 'funcionario').length,
          data: this.fallbackData.users
        }

      case 'summary':
        return {
          clients: {
            total: this.fallbackData.clients.length,
            pendingSync: this.fallbackData.clients.filter(c => c.status === 'pendente_sincronizacao').length
          },
          users: {
            total: this.fallbackData.users.length
          },
          lastSync: this.fallbackData.lastSync,
          offlineCapabilities: this.offlineCapabilities
        }

      default:
        return null
    }
  }

  // Métodos de configuração offline
  public getOfflineCapabilities(): OfflineCapability[] {
    return this.offlineCapabilities
  }

  public isCapabilityAvailable(capabilityName: string): boolean {
    const capability = this.offlineCapabilities.find(c => c.name === capabilityName)
    return capability?.available || false
  }

  // Métodos de limpeza e manutenção
  public clearOfflineData(): void {
    this.fallbackData = {
      users: [],
      clients: [],
      documents: [],
      lastSync: new Date()
    }
    this.initializeOfflineData()
  }

  public getOfflineDataSize(): number {
    try {
      return JSON.stringify(this.fallbackData).length
    } catch {
      return 0
    }
  }

  // Métodos de notificação
  public getOfflineNotifications(): string[] {
    const notifications: string[] = []
    
    const pendingSync = this.fallbackData.clients.filter(c => c.status === 'pendente_sincronizacao').length
    if (pendingSync > 0) {
      notifications.push(`${pendingSync} cliente(s) aguardando sincronização`)
    }

    const timeSinceLastSync = Date.now() - this.fallbackData.lastSync.getTime()
    if (timeSinceLastSync > 24 * 60 * 60 * 1000) { // 24 horas
      notifications.push('Dados não sincronizados há mais de 24 horas')
    }

    return notifications
  }
}

// Instância singleton
export const fallbackService = new FallbackService()

// Hook para usar em componentes React
export const useOfflineMode = () => {
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine)
  const [offlineData, setOfflineData] = React.useState(fallbackService.getOfflineCapabilities())
  const [notifications, setNotifications] = React.useState<string[]>([])

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Atualizar notificações periodicamente
    const interval = setInterval(() => {
      setNotifications(fallbackService.getOfflineNotifications())
    }, 30000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  return {
    isOffline,
    offlineCapabilities: offlineData,
    notifications,
    fallbackService
  }
}
