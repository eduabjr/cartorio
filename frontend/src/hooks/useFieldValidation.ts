/**
 * HOOK DE VALIDAÇÃO E FORMATAÇÃO DE CAMPOS
 * ==========================================
 * 
 * Hook para aplicar automaticamente as regras de validação, formatação
 * e aceitação de caracteres definidas em fieldRules.ts
 * 
 * Uso:
 * const { handleChange, getValue, getError } = useFieldValidation(formData, setFormData)
 * 
 * <input 
 *   value={getValue('nome')} 
 *   onChange={(e) => handleChange('nome', e.target.value)}
 * />
 */

import { useState, useCallback } from 'react'
import { FIELD_RULES, validateField, formatField } from '../config/fieldRules'
import { buscarCEP, preencherEndereco } from '../utils/cepValidator'

interface ValidationErrors {
  [key: string]: string | undefined
}

export function useFieldValidation<T extends Record<string, any>>(
  formData: T,
  setFormData: React.Dispatch<React.SetStateAction<T>>
) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [loadingCEP, setLoadingCEP] = useState(false)

  /**
   * Filtra caracteres não permitidos com base nas regras do campo
   */
  const filterValue = useCallback((fieldName: string, value: string): string => {
    const rule = FIELD_RULES[fieldName]
    
    if (!rule) {
      return value
    }

    let filtered = value

    // Aplicar filtros de caracteres permitidos
    if (rule.allowLetters === false && rule.allowNumbers === false) {
      // Não permite letras nem números (apenas caracteres especiais)
      filtered = filtered.replace(/[a-zA-Z0-9]/g, '')
    } else if (rule.allowLetters === false) {
      // Não permite letras
      filtered = filtered.replace(/[a-zA-Z]/g, '')
    } else if (rule.allowNumbers === false) {
      // Não permite números
      filtered = filtered.replace(/[0-9]/g, '')
    }

    // Filtrar caracteres especiais se não permitidos
    if (rule.allowSpecialChars === false) {
      // Permite apenas letras, números e espaços
      filtered = filtered.replace(/[^a-zA-Z0-9\s]/g, '')
    }

    // Aplicar limite de comprimento máximo
    if (rule.maxLength && filtered.length > rule.maxLength) {
      filtered = filtered.slice(0, rule.maxLength)
    }

    return filtered
  }, [])

  /**
   * Busca endereço completo pelo CEP
   */
  const handleCEPChange = useCallback(async (cep: string) => {
    const cleaned = cep.replace(/\D/g, '')
    
    // Só buscar quando o CEP estiver completo (8 dígitos)
    if (cleaned.length === 8) {
      setLoadingCEP(true)
      
      try {
        const resultado = await buscarCEP(cep)
        
        if (resultado.isValid && resultado.data) {
          // Preencher campos de endereço automaticamente
          const enderecoCompleto = preencherEndereco(resultado.data)
          
          setFormData(prev => ({
            ...prev,
            cep: resultado.formatted,
            endereco: enderecoCompleto.endereco,
            bairro: enderecoCompleto.bairro,
            cidade: enderecoCompleto.cidade,
            uf: enderecoCompleto.uf,
            codigoIbge: enderecoCompleto.codigoIbge
          }))
          
          // Limpar erro de CEP
          setErrors(prev => ({
            ...prev,
            cep: undefined
          }))
          
          console.log('✅ CEP encontrado:', enderecoCompleto)
        } else {
          // CEP não encontrado
          setErrors(prev => ({
            ...prev,
            cep: resultado.error || 'CEP não encontrado'
          }))
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
        setErrors(prev => ({
          ...prev,
          cep: 'Erro ao buscar CEP. Verifique sua conexão.'
        }))
      } finally {
        setLoadingCEP(false)
      }
    }
  }, [setFormData])

  /**
   * Manipula mudança de valor do campo
   * Aplica filtros, formatação e validação automaticamente
   */
  const handleChange = useCallback(async (fieldName: string, rawValue: string) => {
    // 1. Filtrar caracteres não permitidos
    const filteredValue = filterValue(fieldName, rawValue)
    
    // 2. Aplicar formatação (ex: CPF, telefone)
    const formattedValue = formatField(fieldName, filteredValue)
    
    // 3. Atualizar estado do formulário
    setFormData(prev => ({
      ...prev,
      [fieldName]: formattedValue
    }))
    
    // 4. Se for CEP, buscar endereço automaticamente
    if (fieldName === 'cep') {
      await handleCEPChange(formattedValue)
    }
    
    // 5. Validar campo (se tiver valor)
    if (formattedValue) {
      const validation = validateField(fieldName, formattedValue)
      setErrors(prev => ({
        ...prev,
        [fieldName]: validation.error
      }))
    } else {
      // Limpar erro se campo estiver vazio
      setErrors(prev => ({
        ...prev,
        [fieldName]: undefined
      }))
    }
  }, [filterValue, setFormData, handleCEPChange])

  /**
   * Obtém o valor do campo
   */
  const getValue = useCallback((fieldName: string): string => {
    return formData[fieldName] || ''
  }, [formData])

  /**
   * Obtém erro de validação do campo
   */
  const getError = useCallback((fieldName: string): string | undefined => {
    return errors[fieldName]
  }, [errors])

  /**
   * Valida todos os campos do formulário
   */
  const validateAll = useCallback((): boolean => {
    const newErrors: ValidationErrors = {}
    let isValid = true

    Object.keys(formData).forEach(fieldName => {
      const value = formData[fieldName]
      if (value) {
        const validation = validateField(fieldName, value)
        if (!validation.isValid) {
          newErrors[fieldName] = validation.error
          isValid = false
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }, [formData])

  /**
   * Limpa todos os erros de validação
   */
  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  /**
   * Obtém as regras de um campo específico
   */
  const getFieldRule = useCallback((fieldName: string) => {
    return FIELD_RULES[fieldName]
  }, [])

  return {
    handleChange,
    getValue,
    getError,
    validateAll,
    clearErrors,
    getFieldRule,
    errors,
    hasErrors: Object.values(errors).some(error => error !== undefined),
    loadingCEP  // ✨ Novo: Indica se está buscando CEP
  }
}

export default useFieldValidation

