/**
 * Serviço de integração com APIs de Consulta CNPJ
 * 
 * Fontes de APIs:
 * 1. API Oficial gov.br - Conecta: https://www.gov.br/conecta/catalogo/sistemas/cadastros-de-referencia
 * 2. ReceitaWS (API pública alternativa): https://receitaws.com.br/api
 * 3. Brasil API: https://brasilapi.com.br/api/cnpj/v1/
 * 
 * A API do gov.br requer autenticação OAuth2, então usaremos alternativas públicas
 * para desenvolvimento e validação.
 */

import axios from 'axios'

export interface CNPJData {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  situacaoCadastral: string
  dataAbertura: string
  tipo: string
  porte: string
  naturezaJuridica: string
  atividadePrincipal: {
    codigo: string
    descricao: string
  }
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  municipio: string
  uf: string
  cep: string
  telefone: string
  email: string
  capitalSocial: string
}

class CNPJService {
  /**
   * Consulta CNPJ na API Brasil API
   * Endpoint: https://brasilapi.com.br/api/cnpj/v1/{cnpj}
   */
  async consultarCNPJ(cnpj: string): Promise<CNPJData | null> {
    try {
      // Remove caracteres não numéricos
      const cnpjLimpo = cnpj.replace(/\D/g, '')
      
      if (cnpjLimpo.length !== 14) {
        console.error('❌ CNPJ inválido! Deve conter 14 dígitos.')
        return null
      }

      console.log('🔍 Consultando CNPJ:', cnpjLimpo)
      
      // Tenta Brasil API primeiro
      try {
        const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
          timeout: 15000
        })

        console.log('✅ CNPJ encontrado na Brasil API')
        return this.normalizarDadosBrasilAPI(response.data)
      } catch (brasilAPIError) {
        console.log('⚠️ Brasil API falhou, tentando ReceitaWS...')
        
        // Fallback para ReceitaWS
        const response = await axios.get(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`, {
          timeout: 15000
        })

        if (response.data.status === 'ERROR') {
          console.error('❌ CNPJ não encontrado')
          return null
        }

        console.log('✅ CNPJ encontrado na ReceitaWS')
        return this.normalizarDadosReceitaWS(response.data)
      }
    } catch (error) {
      console.error('❌ Erro ao consultar CNPJ:', error)
      return null
    }
  }

  /**
   * Valida formato do CNPJ
   */
  validarCNPJ(cnpj: string): boolean {
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    
    if (cnpjLimpo.length !== 14) return false
    
    // Valida dígitos verificadores
    let tamanho = cnpjLimpo.length - 2
    let numeros = cnpjLimpo.substring(0, tamanho)
    const digitos = cnpjLimpo.substring(tamanho)
    let soma = 0
    let pos = tamanho - 7

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--
      if (pos < 2) pos = 9
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
    if (resultado !== parseInt(digitos.charAt(0))) return false

    tamanho = tamanho + 1
    numeros = cnpjLimpo.substring(0, tamanho)
    soma = 0
    pos = tamanho - 7

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--
      if (pos < 2) pos = 9
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
    if (resultado !== parseInt(digitos.charAt(1))) return false

    return true
  }

  /**
   * Formata CNPJ (XX.XXX.XXX/XXXX-XX)
   */
  formatarCNPJ(cnpj: string): string {
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    
    if (cnpjLimpo.length !== 14) return cnpj
    
    return cnpjLimpo.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    )
  }

  /**
   * Normaliza dados da Brasil API
   */
  private normalizarDadosBrasilAPI(data: any): CNPJData {
    return {
      cnpj: data.cnpj || '',
      razaoSocial: data.razao_social || data.nome_fantasia || '',
      nomeFantasia: data.nome_fantasia || '',
      situacaoCadastral: data.descricao_situacao_cadastral || '',
      dataAbertura: data.data_inicio_atividade || '',
      tipo: data.descricao_tipo_logradouro || '',
      porte: data.porte || '',
      naturezaJuridica: data.natureza_juridica || '',
      atividadePrincipal: {
        codigo: data.cnae_fiscal || '',
        descricao: data.cnae_fiscal_descricao || ''
      },
      logradouro: `${data.descricao_tipo_logradouro || ''} ${data.logradouro || ''}`.trim(),
      numero: data.numero || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      municipio: data.municipio || '',
      uf: data.uf || '',
      cep: data.cep || '',
      telefone: `${data.ddd_telefone_1 || ''}`,
      email: data.email || '',
      capitalSocial: data.capital_social || '0'
    }
  }

  /**
   * Normaliza dados da ReceitaWS
   */
  private normalizarDadosReceitaWS(data: any): CNPJData {
    return {
      cnpj: data.cnpj || '',
      razaoSocial: data.nome || '',
      nomeFantasia: data.fantasia || '',
      situacaoCadastral: data.situacao || '',
      dataAbertura: data.abertura || '',
      tipo: data.tipo || '',
      porte: data.porte || '',
      naturezaJuridica: data.natureza_juridica || '',
      atividadePrincipal: {
        codigo: data.atividade_principal?.[0]?.code || '',
        descricao: data.atividade_principal?.[0]?.text || ''
      },
      logradouro: data.logradouro || '',
      numero: data.numero || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      municipio: data.municipio || '',
      uf: data.uf || '',
      cep: data.cep || '',
      telefone: data.telefone || '',
      email: data.email || '',
      capitalSocial: data.capital_social || '0'
    }
  }
}

export const cnpjService = new CNPJService()

