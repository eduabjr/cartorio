import React, { createContext, useContext, useState, useCallback } from 'react'

export interface FormDataEntry {
  id: string // windowId
  type: 'cliente' | 'funcionario' | 'protocolo'
  formData: any
  activeTab: string
  lastUpdated: number
}

export interface FormDataContextType {
  formDataMap: Map<string, FormDataEntry>
  saveFormData: (id: string, type: string, formData: any, activeTab: string) => void
  getFormData: (id: string) => FormDataEntry | undefined
  clearFormData: (id: string) => void
  getLastActiveTab: (type: string) => string
}

const FormDataContext = createContext<FormDataContextType | undefined>(undefined)

export function FormDataProvider({ children }: { children: React.ReactNode }) {
  const [formDataMap, setFormDataMap] = useState<Map<string, FormDataEntry>>(new Map())

  const saveFormData = useCallback((id: string, type: string, formData: any, activeTab: string) => {
    setFormDataMap(prev => {
      const newMap = new Map(prev)
      newMap.set(id, {
        id,
        type: type as 'cliente' | 'funcionario' | 'protocolo',
        formData,
        activeTab,
        lastUpdated: Date.now()
      })
      
      // Também salvar em localStorage como backup
      try {
        localStorage.setItem(`formData_${id}`, JSON.stringify({
          type,
          formData,
          activeTab,
          lastUpdated: Date.now()
        }))
      } catch (error) {
        console.error('Erro ao salvar em localStorage:', error)
      }
      
      return newMap
    })
  }, [])

  const getFormData = useCallback((id: string): FormDataEntry | undefined => {
    const cached = formDataMap.get(id)
    if (cached) return cached

    // Tentar recuperar de localStorage
    try {
      const stored = localStorage.getItem(`formData_${id}`)
      if (stored) {
        const data = JSON.parse(stored)
        return {
          id,
          type: data.type,
          formData: data.formData,
          activeTab: data.activeTab,
          lastUpdated: data.lastUpdated
        }
      }
    } catch (error) {
      console.error('Erro ao recuperar de localStorage:', error)
    }

    return undefined
  }, [formDataMap])

  const clearFormData = useCallback((id: string) => {
    setFormDataMap(prev => {
      const newMap = new Map(prev)
      newMap.delete(id)
      return newMap
    })
    
    try {
      localStorage.removeItem(`formData_${id}`)
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error)
    }
  }, [])

  const getLastActiveTab = useCallback((type: string): string => {
    // Procurar a última aba ativa para este tipo
    for (const entry of formDataMap.values()) {
      if (entry.type === type) {
        return entry.activeTab
      }
    }
    return 'cadastro' // Default
  }, [formDataMap])

  return (
    <FormDataContext.Provider
      value={{
        formDataMap,
        saveFormData,
        getFormData,
        clearFormData,
        getLastActiveTab
      }}
    >
      {children}
    </FormDataContext.Provider>
  )
}

export function useFormDataContext() {
  const context = useContext(FormDataContext)
  if (context === undefined) {
    throw new Error('useFormDataContext deve ser usado dentro de FormDataProvider')
  }
  return context
}
