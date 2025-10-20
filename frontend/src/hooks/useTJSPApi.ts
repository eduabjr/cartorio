/**
 * Hook personalizado para integração com a API do TJSP
 * Gerencia estado e operações relacionadas aos selos digitais
 */

import { useState, useCallback } from 'react'
import { tjspApiService, TJSPSealData, TJSPApiResponse } from '../services/TJSPApiService'

export interface UseTJSPApiReturn {
  // Estados
  selosDigitais: TJSPSealData[]
  loading: boolean
  error: string | null
  authenticated: boolean
  
  // Funções
  autenticar: () => Promise<boolean>
  buscarSelos: (filtros?: any) => Promise<TJSPSealData[]>
  consultarSelo: (id: string) => Promise<TJSPSealData | null>
  cancelarSelo: (id: string, motivo: string) => Promise<boolean>
  validarSelo: (seloDigital: string) => Promise<TJSPSealData | null>
  gerarQRCode: (seloDigital: string) => Promise<string | null>
  obterEstatisticas: () => Promise<any>
  limparErro: () => void
  sincronizarSelos: () => Promise<void>
}

export const useTJSPApi = (): UseTJSPApiReturn => {
  const [selosDigitais, setSelosDigitais] = useState<TJSPSealData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authenticated, setAuthenticated] = useState(false)

  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<TJSPApiResponse<T>>,
    successMessage?: string
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiCall()
      
      if (response.success && response.data) {
        if (successMessage) {
          console.log(`✅ ${successMessage}`)
        }
        return response.data
      } else {
        throw new Error(response.error || 'Erro desconhecido na API')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('❌ Erro na API TJSP:', errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const autenticar = useCallback(async (): Promise<boolean> => {
    const result = await handleApiCall(
      () => tjspApiService.authenticate(),
      'Autenticação TJSP realizada com sucesso'
    )
    
    if (result) {
      setAuthenticated(true)
      return true
    } else {
      setAuthenticated(false)
      return false
    }
  }, [handleApiCall])

  const buscarSelos = useCallback(async (filtros?: any): Promise<TJSPSealData[]> => {
    const result = await handleApiCall(
      () => tjspApiService.buscarSelosDigitais(filtros),
      `${filtros ? 'Busca filtrada' : 'Busca completa'} de selos realizada`
    )
    
    if (result) {
      setSelosDigitais(result)
      return result
    }
    
    return []
  }, [handleApiCall])

  const consultarSelo = useCallback(async (id: string): Promise<TJSPSealData | null> => {
    return await handleApiCall(
      () => tjspApiService.consultarSeloDigital(id),
      `Selo ${id} consultado com sucesso`
    )
  }, [handleApiCall])

  const cancelarSelo = useCallback(async (id: string, motivo: string): Promise<boolean> => {
    const result = await handleApiCall(
      () => tjspApiService.cancelarSeloDigital(id, motivo),
      `Selo ${id} cancelado com sucesso`
    )
    
    if (result) {
      // Atualizar lista local removendo o selo cancelado
      setSelosDigitais(prev => prev.filter(selo => selo.id !== id))
      return true
    }
    
    return false
  }, [handleApiCall])

  const validarSelo = useCallback(async (seloDigital: string): Promise<TJSPSealData | null> => {
    return await handleApiCall(
      () => tjspApiService.validarSeloDigital(seloDigital),
      `Selo ${seloDigital} validado com sucesso`
    )
  }, [handleApiCall])

  const gerarQRCode = useCallback(async (seloDigital: string): Promise<string | null> => {
    return await handleApiCall(
      () => tjspApiService.gerarQRCode(seloDigital),
      `QR Code gerado para selo ${seloDigital}`
    )
  }, [handleApiCall])

  const obterEstatisticas = useCallback(async (): Promise<any> => {
    return await handleApiCall(
      () => tjspApiService.obterEstatisticas(),
      'Estatísticas obtidas com sucesso'
    )
  }, [handleApiCall])

  const limparErro = useCallback(() => {
    setError(null)
  }, [])

  const sincronizarSelos = useCallback(async (): Promise<void> => {
    if (!authenticated) {
      const authSuccess = await autenticar()
      if (!authSuccess) {
        return
      }
    }
    
    await buscarSelos()
  }, [authenticated, autenticar, buscarSelos])

  return {
    // Estados
    selosDigitais,
    loading,
    error,
    authenticated,
    
    // Funções
    autenticar,
    buscarSelos,
    consultarSelo,
    cancelarSelo,
    validarSelo,
    gerarQRCode,
    obterEstatisticas,
    limparErro,
    sincronizarSelos
  }
}

export default useTJSPApi
