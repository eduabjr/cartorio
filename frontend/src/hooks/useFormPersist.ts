import { useEffect, useRef } from 'react'

/**
 * 🔒 Hook para persistir dados de formulário automaticamente
 * 
 * Salva os dados no localStorage conforme o usuário digita
 * e os recupera automaticamente ao reabrir a janela
 * 
 * @param storageKey - Chave única para identificar o formulário (ex: 'form-funcionario-novo')
 * @param formData - Dados do formulário a serem salvos
 * @param setFormData - Função para atualizar os dados do formulário
 * @param enabled - Se deve salvar automaticamente (default: true)
 * @param debounceMs - Tempo de espera antes de salvar (default: 500ms)
 */
export function useFormPersist<T>(
  storageKey: string,
  formData: T,
  setFormData: (data: T) => void,
  enabled: boolean = true,
  debounceMs: number = 500
) {
  const isFirstMount = useRef(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedDataRef = useRef<string>('')

  // 🔒 RECUPERAR dados salvos ao montar o componente
  useEffect(() => {
    if (!enabled || !isFirstMount.current) return
    
    isFirstMount.current = false
    
    try {
      const savedData = localStorage.getItem(storageKey)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        console.log(`💾 Recuperando dados de "${storageKey}":`, parsedData)
        setFormData(parsedData)
        lastSavedDataRef.current = savedData
      } else {
        console.log(`🆕 Nenhum dado salvo para "${storageKey}" - formulário vazio`)
      }
    } catch (error) {
      console.error(`❌ Erro ao recuperar dados de "${storageKey}":`, error)
    }
  }, []) // Executar apenas uma vez na montagem

  // 🔒 SALVAR dados automaticamente quando mudarem
  useEffect(() => {
    if (!enabled || isFirstMount.current) return
    
    // Serializar dados para comparação
    const currentDataStr = JSON.stringify(formData)
    
    // Se dados não mudaram, não fazer nada
    if (currentDataStr === lastSavedDataRef.current) {
      return
    }
    
    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Criar novo timeout com debounce
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, currentDataStr)
        lastSavedDataRef.current = currentDataStr
        console.log(`💾 Dados salvos automaticamente: "${storageKey}"`)
      } catch (error) {
        console.error(`❌ Erro ao salvar dados de "${storageKey}":`, error)
      }
    }, debounceMs)
    
    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [formData, enabled, debounceMs, storageKey])

  // 🔒 Limpar dados APENAS quando a janela/aba realmente fechar
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        localStorage.removeItem(storageKey)
        console.log(`🗑️ Janela fechando - Dados temporários removidos: "${storageKey}"`)
      } catch (error) {
        console.error(`❌ Erro ao limpar dados: "${storageKey}":`, error)
      }
    }

    // Detectar fechamento da janela/aba
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      // Limpar timeout pendente
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      // Remover listener
      window.removeEventListener('beforeunload', handleBeforeUnload)
      
      // ❌ NÃO limpar localStorage aqui - pode ser apenas re-render ou navegação
    }
  }, [storageKey])
}

/**
 * 🗑️ Função auxiliar para limpar dados salvos
 * Use isso após salvar o formulário com sucesso
 */
export function clearPersistedForm(storageKey: string) {
  try {
    localStorage.removeItem(storageKey)
    console.log(`🗑️ Dados persistidos removidos: "${storageKey}"`)
  } catch (error) {
    console.error(`❌ Erro ao limpar dados de "${storageKey}":`, error)
  }
}

