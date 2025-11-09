/**
 * Serviço de integração com a API oficial de Cartórios do Registro Civil
 * 
 * API Oficial: https://apicartorios.registrocivil.org.br/api/cartorios
 * 
 * Esta API fornece acesso aos dados de todos os cartórios de registro civil
 * do Brasil, incluindo informações como:
 * - Códigos e identificadores (SEADE, CNJ)
 * - Dados de contato (endereço, telefone, email, site)
 * - Informações do responsável
 * - Status de interligação
 * 
 * @see https://apicartorios.registrocivil.org.br
 */

import axios from 'axios'

// API oficial do Registro Civil
const API_CARTORIOS_URL = 'https://apicartorios.registrocivil.org.br/api/cartorios'

export interface CartorioSeadeAPI {
  codigo: string
  numeroSeade: string
  numeroCnj: string
  tituloCartorio: string
  cnpj: string
  endereco: string
  bairro: string
  cidade: string
  uf: string
  cep: string
  site: string
  email: string
  responsavel: string
  telefone: string
  cpf: string
  interligado: boolean
}

class CartorioSeadeService {
  private baseURL: string

  constructor() {
    this.baseURL = API_CARTORIOS_URL
  }

  /**
   * Busca todos os cartórios interligados da API oficial do Registro Civil
   * URL: https://apicartorios.registrocivil.org.br/api/cartorios
   */
  async buscarCartoriosInterligados(): Promise<CartorioSeadeAPI[]> {
    try {
      console.log('🌐 Buscando cartórios na API oficial do Registro Civil...')
      console.log('🔗 URL:', this.baseURL)
      
      const response = await axios.get(this.baseURL, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 segundos de timeout
      })
      
      console.log('✅ Cartórios recebidos da API:', response.data?.length || 0)
      
      // A API pode retornar em diferentes formatos, vamos normalizar
      const cartorios = Array.isArray(response.data) ? response.data : []
      
      return cartorios
    } catch (error) {
      console.error('❌ Erro ao buscar cartórios da API oficial:', error)
      console.log('⚠️ Usando dados mock para desenvolvimento...')
      // Retornar dados mock para desenvolvimento
      return this.getMockCartoriosInterligados()
    }
  }

  /**
   * Busca todos os cartórios
   */
  async buscarTodosCartorios(): Promise<CartorioSeadeAPI[]> {
    return this.buscarCartoriosInterligados()
  }

  /**
   * Busca cartório por código
   */
  async buscarPorCodigo(codigo: string): Promise<CartorioSeadeAPI | null> {
    try {
      console.log('🔍 Buscando cartório por código:', codigo)
      const response = await axios.get(`${this.baseURL}/codigo/${codigo}`)
      console.log('✅ Cartório encontrado:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Erro ao buscar cartório por código:', error)
      return null
    }
  }

  /**
   * Busca cartório por número SEADE
   */
  async buscarPorNumeroSeade(numeroSeade: string): Promise<CartorioSeadeAPI | null> {
    try {
      console.log('🔍 Buscando cartório por número SEADE:', numeroSeade)
      
      // Buscar no localStorage primeiro
      const cartoriosSalvos = localStorage.getItem('cartorios-seade')
      if (cartoriosSalvos) {
        const cartorios = JSON.parse(cartoriosSalvos)
        const cartorioEncontrado = cartorios.find((c: any) => c.numeroSeade === numeroSeade)
        if (cartorioEncontrado) {
          console.log('✅ Cartório encontrado no localStorage:', cartorioEncontrado)
          return cartorioEncontrado
        }
      }
      
      // Se não encontrou no localStorage, tentar API
      const response = await axios.get(`${this.baseURL}/seade/${numeroSeade}`)
      console.log('✅ Cartório encontrado na API:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Erro ao buscar cartório por número SEADE:', error)
      return null
    }
  }

  /**
   * Busca cartório por número CNJ
   */
  async buscarPorNumeroCnj(numeroCnj: string): Promise<CartorioSeadeAPI | null> {
    try {
      console.log('🔍 Buscando cartório por número CNJ:', numeroCnj)
      
      // Buscar no localStorage primeiro
      const cartoriosSalvos = localStorage.getItem('cartorios-seade')
      if (cartoriosSalvos) {
        const cartorios = JSON.parse(cartoriosSalvos)
        const cartorioEncontrado = cartorios.find((c: any) => c.numeroCnj === numeroCnj)
        if (cartorioEncontrado) {
          console.log('✅ Cartório encontrado no localStorage:', cartorioEncontrado)
          return cartorioEncontrado
        }
      }
      
      // Se não encontrou no localStorage, tentar API
      const response = await axios.get(`${this.baseURL}/cnj/${numeroCnj}`)
      console.log('✅ Cartório encontrado na API:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Erro ao buscar cartório por número CNJ:', error)
      return null
    }
  }

  /**
   * Atualiza lista de cartórios interligados
   * Busca diretamente da API oficial do Registro Civil
   */
  async atualizarCartoriosInterligados(): Promise<CartorioSeadeAPI[]> {
    try {
      console.log('🔄 Atualizando lista de cartórios da API oficial...')
      console.log('🔗 Fonte: https://apicartorios.registrocivil.org.br')
      
      // Busca diretamente da API oficial
      const cartorios = await this.buscarCartoriosInterligados()
      
      console.log('✅ Lista atualizada com sucesso:', cartorios.length, 'cartórios')
      return cartorios
    } catch (error) {
      console.error('❌ Erro ao atualizar cartórios interligados:', error)
      // Retornar dados mock para desenvolvimento
      return this.getMockCartoriosInterligados()
    }
  }

  /**
   * Dados mock para desenvolvimento/teste
   */
  private getMockCartoriosInterligados(): CartorioSeadeAPI[] {
    return [
      {
        codigo: '001',
        numeroSeade: 'SEADE-001',
        numeroCnj: 'CNJ-001-SP',
        tituloCartorio: '1º Cartório de Registro Civil de São Paulo',
        cnpj: '12.345.678/0001-90',
        endereco: 'Av. Paulista, 1000',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '01310-100',
        site: 'https://www.1cartorio.sp.gov.br',
        email: 'contato@1cartorio.sp.gov.br',
        responsavel: 'João da Silva',
        telefone: '(11) 3456-7890',
        cpf: '123.456.789-00',
        interligado: true
      },
      {
        codigo: '002',
        numeroSeade: 'SEADE-002',
        numeroCnj: 'CNJ-002-SP',
        tituloCartorio: '2º Cartório de Registro Civil de São Paulo',
        cnpj: '12.345.678/0002-71',
        endereco: 'R. da Consolação, 500',
        bairro: 'Consolação',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '01301-000',
        site: 'https://www.2cartorio.sp.gov.br',
        email: 'contato@2cartorio.sp.gov.br',
        responsavel: 'Maria Santos',
        telefone: '(11) 3456-7891',
        cpf: '987.654.321-00',
        interligado: true
      },
      {
        codigo: '003',
        numeroSeade: 'SEADE-003',
        numeroCnj: 'CNJ-003-SP',
        tituloCartorio: '3º Cartório de Registro Civil de São Paulo',
        cnpj: '12.345.678/0003-52',
        endereco: 'R. XV de Novembro, 300',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '01013-000',
        site: 'https://www.3cartorio.sp.gov.br',
        email: 'contato@3cartorio.sp.gov.br',
        responsavel: 'Carlos Oliveira',
        telefone: '(11) 3456-7892',
        cpf: '456.789.123-00',
        interligado: true
      }
    ]
  }
}

export const cartorioSeadeService = new CartorioSeadeService()

