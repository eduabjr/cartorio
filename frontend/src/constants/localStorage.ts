/**
 * Chaves padronizadas para localStorage
 * Evita erros de digitação e centraliza gerenciamento
 */

export const STORAGE_KEYS = {
  // Códigos sequenciais
  ULTIMO_CODIGO_CLIENTE: 'ultimoCodigoCliente',
  ULTIMO_CODIGO_FUNCIONARIO: 'ultimoCodigoFuncionario',
  ULTIMO_CODIGO_NATUREZA: 'ultimoCodigoNatureza',
  ULTIMO_CODIGO_PROTOCOLO: 'ultimoCodigoProtocolo',
  ULTIMO_CODIGO_DNVDO: 'ultimoCodigoDNVDO',
  ULTIMO_NUMERO_CARTAO: 'ultimoNumeroCartao',
  
  // Dados de entidades
  CLIENTES: 'cartorio_clientes',
  FUNCIONARIOS: 'cartorio_funcionarios',
  NATUREZAS: 'cartorio_naturezas',
  PROTOCOLOS: 'cartorio_protocolos',
  DECLARACOES_BLOQUEADAS: 'declaracoesBloqueadas',
  
  // Configurações
  ACCESSIBILITY_SETTINGS: 'accessibility_settings',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  
  // Sessão
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData'
} as const

/**
 * Helper para gerar chave de valores de natureza
 */
export function getValoresNaturezaKey(codigo: string): string {
  return `cartorio_valores_${codigo}`
}

/**
 * Helper seguro para ler do localStorage
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Erro ao ler ${key} do localStorage:`, error)
    return defaultValue
  }
}

/**
 * Helper seguro para salvar no localStorage
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Erro ao salvar ${key} no localStorage:`, error)
    return false
  }
}

/**
 * Helper para gerar próximo código sequencial
 */
export function getNextCode(storageKey: string): string {
  const ultimoCodigo = localStorage.getItem(storageKey)
  const proximoCodigo = ultimoCodigo ? parseInt(ultimoCodigo) + 1 : 1
  return proximoCodigo.toString()
}

/**
 * Helper para salvar código gerado
 */
export function saveLastCode(storageKey: string, codigo: string): void {
  localStorage.setItem(storageKey, codigo)
}

