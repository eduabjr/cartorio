/**
 * Tradutor de Mensagens de Erro para Português
 * 
 * Converte mensagens de erro do JavaScript/React/Sistema para português
 */

interface ErrorTranslation {
  pattern: RegExp
  translation: string
}

const ERROR_TRANSLATIONS: ErrorTranslation[] = [
  // Erros de propriedade/acesso
  { 
    pattern: /can't access property "([^"]+)", ([^\s]+) is undefined/i,
    translation: 'não é possível acessar a propriedade "$1", $2 está indefinido'
  },
  { 
    pattern: /Cannot read property '([^']+)' of undefined/i,
    translation: 'não é possível ler a propriedade "$1" de indefinido'
  },
  { 
    pattern: /Cannot read properties of undefined \(reading '([^']+)'\)/i,
    translation: 'não é possível ler propriedades de indefinido (lendo "$1")'
  },
  { 
    pattern: /Cannot read property '([^']+)' of null/i,
    translation: 'não é possível ler a propriedade "$1" de nulo'
  },
  
  // Erros de tipo
  { 
    pattern: /([^\s]+) is not defined/i,
    translation: '$1 não está definido'
  },
  { 
    pattern: /([^\s]+) is undefined/i,
    translation: '$1 está indefinido'
  },
  { 
    pattern: /([^\s]+) is null/i,
    translation: '$1 é nulo'
  },
  { 
    pattern: /([^\s]+) is not a function/i,
    translation: '$1 não é uma função'
  },
  { 
    pattern: /([^\s]+) is not an object/i,
    translation: '$1 não é um objeto'
  },
  
  // Erros de conversão
  { 
    pattern: /Cannot convert ([^\s]+) to ([^\s]+)/i,
    translation: 'não é possível converter $1 para $2'
  },
  { 
    pattern: /Invalid ([^\s]+)/i,
    translation: '$1 inválido'
  },
  
  // Erros de rede
  { 
    pattern: /Network request failed/i,
    translation: 'Falha na requisição de rede'
  },
  { 
    pattern: /Failed to fetch/i,
    translation: 'Falha ao buscar dados'
  },
  { 
    pattern: /Request timeout/i,
    translation: 'Tempo de requisição esgotado'
  },
  
  // Erros HTTP
  { 
    pattern: /HTTP (\d+): (.+)/i,
    translation: 'Erro HTTP $1: $2'
  },
  { 
    pattern: /Not found/i,
    translation: 'Não encontrado'
  },
  { 
    pattern: /Unauthorized/i,
    translation: 'Não autorizado'
  },
  { 
    pattern: /Forbidden/i,
    translation: 'Acesso proibido'
  },
  { 
    pattern: /Internal Server Error/i,
    translation: 'Erro interno do servidor'
  },
  { 
    pattern: /Bad Request/i,
    translation: 'Requisição inválida'
  },
  
  // Erros de validação
  { 
    pattern: /Validation failed/i,
    translation: 'Validação falhou'
  },
  { 
    pattern: /Required field/i,
    translation: 'Campo obrigatório'
  },
  { 
    pattern: /Invalid format/i,
    translation: 'Formato inválido'
  },
  
  // Erros de parsing
  { 
    pattern: /JSON\.parse: (.+)/i,
    translation: 'Erro ao interpretar JSON: $1'
  },
  { 
    pattern: /Unexpected token/i,
    translation: 'Token inesperado'
  },
  { 
    pattern: /Unexpected end of JSON input/i,
    translation: 'Fim inesperado de entrada JSON'
  },
  { 
    pattern: /Unexpected character/i,
    translation: 'Caractere inesperado'
  },
  
  // Erros de sintaxe
  { 
    pattern: /Syntax error/i,
    translation: 'Erro de sintaxe'
  },
  { 
    pattern: /Unexpected reserved word/i,
    translation: 'Palavra reservada inesperada'
  },
  
  // Erros de memória
  { 
    pattern: /Out of memory/i,
    translation: 'Memória insuficiente'
  },
  { 
    pattern: /Stack overflow/i,
    translation: 'Estouro de pilha'
  },
  
  // Erros React
  { 
    pattern: /Element type is invalid/i,
    translation: 'Tipo de elemento inválido'
  },
  { 
    pattern: /Objects are not valid as a React child/i,
    translation: 'Objetos não são válidos como filho React'
  },
  { 
    pattern: /Too many re-renders/i,
    translation: 'Muitas re-renderizações'
  },
  { 
    pattern: /Maximum update depth exceeded/i,
    translation: 'Profundidade máxima de atualização excedida'
  },
  
  // Erros de Promise
  { 
    pattern: /Unhandled promise rejection/i,
    translation: 'Rejeição de promise não tratada'
  },
  { 
    pattern: /Promise\.then: (.+)/i,
    translation: 'Erro em Promise: $1'
  }
]

/**
 * Traduz uma mensagem de erro para português
 */
export function translateError(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message
  
  // Tenta encontrar uma tradução correspondente
  for (const { pattern, translation } of ERROR_TRANSLATIONS) {
    const match = message.match(pattern)
    if (match) {
      let translated = translation
      
      // Substitui os grupos de captura ($1, $2, etc.)
      for (let i = 1; i < match.length; i++) {
        translated = translated.replace(`$${i}`, match[i])
      }
      
      return translated
    }
  }
  
  // Se não encontrou tradução, retorna a mensagem original
  return message
}

/**
 * Cria um Error com mensagem traduzida
 */
export function createTranslatedError(error: Error | string): Error {
  const translatedMessage = translateError(error)
  const originalError = typeof error === 'string' ? new Error(error) : error
  
  return new Error(translatedMessage)
}

/**
 * Formata uma mensagem de erro para exibição ao usuário
 */
export function formatErrorMessage(error: Error | string, context?: string): string {
  const translatedMessage = translateError(error)
  
  if (context) {
    return `${context}\n\n${translatedMessage}`
  }
  
  return translatedMessage
}

/**
 * Loga um erro com tradução
 */
export function logTranslatedError(error: Error | string, prefix: string = '❌ Erro'): void {
  const translatedMessage = translateError(error)
  console.error(`${prefix}:`, translatedMessage)
  
  // Loga também o erro original para debug
  if (typeof error !== 'string') {
    console.debug('Erro original:', error)
  }
}

