/**
 * Serviço de integração com a API ViaCEP
 * API: https://viacep.com.br/
 * 
 * Permite buscar endereços através do CEP
 */

import axios from 'axios'

export interface ViaCepData {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

class ViaCepService {
  private baseURL = 'https://viacep.com.br/ws'

  /**
   * Busca endereço por CEP
   */
  async buscarCEP(cep: string): Promise<ViaCepData | null> {
    try {
      // Remove caracteres não numéricos
      const cepLimpo = cep.replace(/\D/g, '')
      
      if (cepLimpo.length !== 8) {
        console.error('❌ CEP inválido! Deve conter 8 dígitos.')
        return null
      }

      console.log('🔍 Buscando CEP:', cepLimpo)
      
      const response = await axios.get<ViaCepData>(
        `${this.baseURL}/${cepLimpo}/json/`,
        { timeout: 10000 }
      )

      if (response.data.erro) {
        console.log('❌ CEP não encontrado')
        return null
      }

      console.log('✅ CEP encontrado:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Erro ao buscar CEP:', error)
      return null
    }
  }

  /**
   * Formata CEP (XXXXX-XXX)
   */
  formatarCEP(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, '')
    
    if (cepLimpo.length !== 8) return cep
    
    return cepLimpo.replace(/^(\d{5})(\d{3})$/, '$1-$2')
  }

  /**
   * Valida CEP
   */
  validarCEP(cep: string): boolean {
    const cepLimpo = cep.replace(/\D/g, '')
    return cepLimpo.length === 8
  }
}

export const viaCepService = new ViaCepService()

