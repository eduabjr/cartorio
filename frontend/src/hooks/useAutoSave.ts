import { useEffect, useRef, useState } from 'react'

export interface AutoSaveOptions<T> {
  data: T
  onSave: (data: T) => Promise<void>
  debounceDelay?: number
  enabled?: boolean
  onError?: (error: Error) => void
  onSuccess?: () => void
}

export interface AutoSaveState {
  isSaving: boolean
  lastSaved: Date | null
  error: Error | null
}

/**
 * Hook para auto-salvar dados com debounce
 * 
 * Uso:
 * const { isSaving, lastSaved, error } = useAutoSave({
 *   data: formData,
 *   onSave: async (data) => {
 *     await clienteService.criar(data)
 *   },
 *   debounceDelay: 2000
 * })
 */
export function useAutoSave<T>(options: AutoSaveOptions<T>): AutoSaveState {
  const { 
    data, 
    onSave, 
    debounceDelay = 2000, 
    enabled = true,
    onError,
    onSuccess 
  } = options

  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    error: null
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastDataRef = useRef<T>(data)

  useEffect(() => {
    if (!enabled) return

    // Verificar se os dados realmente mudaram
    if (JSON.stringify(data) === JSON.stringify(lastDataRef.current)) {
      return
    }

    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Definir novo timeout com debounce
    timeoutRef.current = setTimeout(async () => {
      try {
        setState(prev => ({ ...prev, isSaving: true, error: null }))
        
        await onSave(data)
        
        setState(prev => ({
          ...prev,
          isSaving: false,
          lastSaved: new Date()
        }))
        
        lastDataRef.current = data
        
        if (onSuccess) {
          onSuccess()
        }
        
        console.log('✅ Dados salvos com sucesso')
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Erro ao salvar')
        
        setState(prev => ({
          ...prev,
          isSaving: false,
          error: err
        }))
        
        if (onError) {
          onError(err)
        }
        
        console.error('❌ Erro ao salvar:', err)
      }
    }, debounceDelay)

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, onSave, debounceDelay, enabled, onError, onSuccess])

  return state
}
