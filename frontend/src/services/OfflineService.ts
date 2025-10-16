// Serviço para gerenciar dados offline
export interface NascimentoData {
  id: string
  timestamp: number
  // Dados da mãe
  nomeMae: string
  cpfMae: string
  rgMae: string
  dataNascimentoMae: string
  estadoCivilMae: string
  profissaoMae: string
  enderecoMae: string
  cidadeMae: string
  ufMae: string
  cepMae: string
  
  // Dados do pai
  nomePai: string
  cpfPai: string
  rgPai: string
  dataNascimentoPai: string
  estadoCivilPai: string
  profissaoPai: string
  enderecoPai: string
  cidadePai: string
  ufPai: string
  cepPai: string
  
  // Dados do nascimento
  dataNascimento: string
  horaNascimento: string
  hospital: string
  medico: string
  peso: string
  altura: string
  sexo: 'M' | 'F'
  
  // Dados do cartório
  cartorio: string
  funcionario: string
  observacoes: string
  
  // Status de sincronização
  sincronizado: boolean
  dataSincronizacao?: number
}

export interface SyncQueue {
  id: string
  data: NascimentoData
  timestamp: number
  tentativas: number
  status: 'pending' | 'syncing' | 'success' | 'error'
  error?: string
}

class OfflineService {
  private dbName = 'MaternidadeDB'
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Store para dados de nascimento
        if (!db.objectStoreNames.contains('nascimentos')) {
          const store = db.createObjectStore('nascimentos', { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('sincronizado', 'sincronizado', { unique: false })
        }
        
        // Store para fila de sincronização
        if (!db.objectStoreNames.contains('syncQueue')) {
          const store = db.createObjectStore('syncQueue', { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('status', 'status', { unique: false })
        }
      }
    })
  }

  // Salvar dados de nascimento
  async salvarNascimento(data: Omit<NascimentoData, 'id' | 'timestamp' | 'sincronizado'>): Promise<string> {
    if (!this.db) await this.init()
    
    const id = `nasc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const nascimentoData: NascimentoData = {
      ...data,
      id,
      timestamp: Date.now(),
      sincronizado: false
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['nascimentos'], 'readwrite')
      const store = transaction.objectStore('nascimentos')
      const request = store.add(nascimentoData)
      
      request.onsuccess = () => {
        // Adicionar à fila de sincronização
        this.adicionarFilaSync(nascimentoData)
        resolve(id)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Listar nascimentos
  async listarNascimentos(): Promise<NascimentoData[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['nascimentos'], 'readonly')
      const store = transaction.objectStore('nascimentos')
      const request = store.getAll()
      
      request.onsuccess = () => {
        const data = request.result.sort((a, b) => b.timestamp - a.timestamp)
        resolve(data)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Adicionar à fila de sincronização
  private async adicionarFilaSync(data: NascimentoData): Promise<void> {
    if (!this.db) await this.init()
    
    const syncItem: SyncQueue = {
      id: data.id,
      data,
      timestamp: Date.now(),
      tentativas: 0,
      status: 'pending'
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      const request = store.add(syncItem)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Listar fila de sincronização
  async listarFilaSync(): Promise<SyncQueue[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly')
      const store = transaction.objectStore('syncQueue')
      const request = store.getAll()
      
      request.onsuccess = () => {
        const data = request.result.sort((a, b) => a.timestamp - b.timestamp)
        resolve(data)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Tentar sincronizar
  async sincronizar(): Promise<{ sucesso: number, erro: number }> {
    const fila = await this.listarFilaSync()
    const pendentes = fila.filter(item => item.status === 'pending' || item.status === 'error')
    
    let sucesso = 0
    let erro = 0
    
    for (const item of pendentes) {
      try {
        await this.enviarParaServidor(item.data)
        await this.marcarSincronizado(item.id)
        sucesso++
      } catch (error) {
        await this.marcarErroSync(item.id, error instanceof Error ? error.message : 'Erro desconhecido')
        erro++
      }
    }
    
    return { sucesso, erro }
  }

  // Enviar dados para servidor (simulado)
  private async enviarParaServidor(data: NascimentoData): Promise<void> {
    // Simular envio para servidor
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular sucesso/erro baseado em probabilidade
        if (Math.random() > 0.2) { // 80% de sucesso
          resolve()
        } else {
          reject(new Error('Erro de conexão'))
        }
      }, 1000)
    })
  }

  // Marcar como sincronizado
  private async marcarSincronizado(id: string): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['nascimentos', 'syncQueue'], 'readwrite')
      
      // Atualizar nascimento
      const nascimentoStore = transaction.objectStore('nascimentos')
      const nascimentoRequest = nascimentoStore.get(id)
      
      nascimentoRequest.onsuccess = () => {
        const data = nascimentoRequest.result
        if (data) {
          data.sincronizado = true
          data.dataSincronizacao = Date.now()
          nascimentoStore.put(data)
        }
      }
      
      // Remover da fila de sync
      const syncStore = transaction.objectStore('syncQueue')
      syncStore.delete(id)
      
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  // Marcar erro de sincronização
  private async marcarErroSync(id: string, error: string): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      const request = store.get(id)
      
      request.onsuccess = () => {
        const item = request.result
        if (item) {
          item.status = 'error'
          item.tentativas++
          item.error = error
          store.put(item)
        }
      }
      
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  // Exportar dados para JSON
  async exportarDados(): Promise<string> {
    const nascimentos = await this.listarNascimentos()
    const filaSync = await this.listarFilaSync()
    
    const exportData = {
      timestamp: Date.now(),
      versao: '1.0',
      nascimentos,
      filaSync,
      totalNascimentos: nascimentos.length,
      totalPendentes: filaSync.filter(item => item.status === 'pending').length
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  // Importar dados de JSON
  async importarDados(jsonData: string): Promise<{ importados: number, erros: number }> {
    try {
      const data = JSON.parse(jsonData)
      let importados = 0
      let erros = 0
      
      if (data.nascimentos && Array.isArray(data.nascimentos)) {
        for (const nascimento of data.nascimentos) {
          try {
            await this.salvarNascimento(nascimento)
            importados++
          } catch (error) {
            erros++
          }
        }
      }
      
      return { importados, erros }
    } catch (error) {
      throw new Error('Formato de arquivo inválido')
    }
  }

  // Verificar status de conexão
  async verificarConexao(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      })
      return true
    } catch {
      return false
    }
  }

  // Limpar dados antigos
  async limparDadosAntigos(dias: number = 30): Promise<void> {
    const cutoff = Date.now() - (dias * 24 * 60 * 60 * 1000)
    
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['nascimentos', 'syncQueue'], 'readwrite')
      
      // Limpar nascimentos antigos sincronizados
      const nascimentoStore = transaction.objectStore('nascimentos')
      const nascimentoIndex = nascimentoStore.index('timestamp')
      const nascimentoRequest = nascimentoIndex.openCursor(IDBKeyRange.upperBound(cutoff))
      
      nascimentoRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          if (cursor.value.sincronizado) {
            cursor.delete()
          }
          cursor.continue()
        }
      }
      
      // Limpar fila de sync antiga
      const syncStore = transaction.objectStore('syncQueue')
      const syncIndex = syncStore.index('timestamp')
      const syncRequest = syncIndex.openCursor(IDBKeyRange.upperBound(cutoff))
      
      syncRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }
      
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }
}

export const offlineService = new OfflineService()
