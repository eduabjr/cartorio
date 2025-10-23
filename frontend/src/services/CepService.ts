// Serviço para buscar informações de CEP via API ViaCEP

export interface CepData {
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

export class CepService {
  private static readonly VIA_CEP_URL = 'https://viacep.com.br/ws'

  // Buscar dados do CEP
  static async buscarCep(cep: string): Promise<CepData | null> {
    try {
      // Remover formatação do CEP (traços, espaços)
      const cepLimpo = cep.replace(/\D/g, '')
      
      // Validar se o CEP tem 8 dígitos
      if (cepLimpo.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos')
      }

      const response = await fetch(`${this.VIA_CEP_URL}/${cepLimpo}/json/`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar CEP')
      }

      const data: CepData = await response.json()

      // Verificar se o CEP foi encontrado
      if (data.erro) {
        throw new Error('CEP não encontrado')
      }

      return data
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      return null
    }
  }

  // Validar formato do CEP
  static validarCep(cep: string): boolean {
    const cepLimpo = cep.replace(/\D/g, '')
    return cepLimpo.length === 8
  }

  // Formatar CEP
  static formatarCep(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length <= 8) {
      return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2')
    }
    return cep
  }
}
