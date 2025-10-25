/**
 * UTILITÁRIO DE VALIDAÇÃO E BUSCA DE CEP
 * =======================================
 * 
 * Busca endereço completo através da API ViaCEP
 * Formata e valida CEPs brasileiros
 */

export interface CEPData {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string  // Cidade
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
}

export interface CEPValidationResult {
  isValid: boolean
  formatted: string
  error: string | null
  data?: CEPData
}

/**
 * Remove formatação do CEP
 */
export function removeCEPFormatting(cep: string): string {
  return cep.replace(/\D/g, '')
}

/**
 * Formata CEP para o padrão XXXXX-XXX
 */
export function formatCEP(cep: string): string {
  const cleaned = removeCEPFormatting(cep)
  
  if (cleaned.length === 0) return ''
  if (cleaned.length <= 5) return cleaned
  
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`
}

/**
 * Valida formato do CEP
 */
export function validarFormatoCEP(cep: string): boolean {
  const cleaned = removeCEPFormatting(cep)
  return cleaned.length === 8 && /^\d+$/.test(cleaned)
}

/**
 * Busca endereço completo através do CEP usando a API ViaCEP
 */
export async function buscarCEP(cep: string): Promise<CEPValidationResult> {
  const cleaned = removeCEPFormatting(cep)
  const formatted = formatCEP(cep)

  // Validar formato
  if (!validarFormatoCEP(cep)) {
    return {
      isValid: false,
      formatted,
      error: 'CEP deve conter exatamente 8 dígitos'
    }
  }

  try {
    // Buscar na API ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`)
    
    if (!response.ok) {
      throw new Error('Erro ao buscar CEP na API')
    }

    const data = await response.json()

    // ViaCEP retorna { erro: true } quando o CEP não existe
    if (data.erro) {
      return {
        isValid: false,
        formatted,
        error: 'CEP não encontrado'
      }
    }

    // Sucesso - CEP encontrado
    return {
      isValid: true,
      formatted,
      error: null,
      data: {
        cep: data.cep,
        logradouro: data.logradouro || '',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
        localidade: data.localidade || '',
        uf: data.uf || '',
        ibge: data.ibge || '',
        gia: data.gia || '',
        ddd: data.ddd || '',
        siafi: data.siafi || ''
      }
    }
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    return {
      isValid: false,
      formatted,
      error: 'Erro ao consultar CEP. Verifique sua conexão com a internet.'
    }
  }
}

/**
 * Verifica se o CEP é válido (apenas formato)
 */
export function isCEPValid(cep: string): boolean {
  return validarFormatoCEP(cep)
}

/**
 * Preenche os campos de endereço com os dados do CEP
 * Retorna um objeto com os campos preenchidos
 */
export function preencherEndereco(cepData: CEPData) {
  return {
    cep: cepData.cep,
    endereco: cepData.logradouro,
    bairro: cepData.bairro,
    cidade: cepData.localidade,
    uf: cepData.uf,
    codigoIbge: cepData.ibge,
    complemento: cepData.complemento
  }
}

/**
 * Exemplo de uso:
 * 
 * const resultado = await buscarCEP('01310-100')
 * 
 * if (resultado.isValid && resultado.data) {
 *   const endereco = preencherEndereco(resultado.data)
 *   console.log(endereco)
 *   // {
 *   //   cep: '01310-100',
 *   //   endereco: 'Avenida Paulista',
 *   //   bairro: 'Bela Vista',
 *   //   cidade: 'São Paulo',
 *   //   uf: 'SP',
 *   //   codigoIbge: '3550308'
 *   // }
 * }
 */

