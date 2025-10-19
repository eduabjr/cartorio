import { useCallback, useRef } from 'react'

/**
 * Hook para gerenciar z-index de forma segura e evitar conflitos
 * Garante que os menus sempre tenham a hierarquia correta
 */
export function useZIndexManager() {
  const zIndexCache = useRef<Map<string, number>>(new Map())

  // Hierarquia fixa e imutável
  const Z_INDEX_HIERARCHY = {
    // Menus principais
    ICON_MENU: 50,
    TEXTUAL_MENU: 60,
    
    // Submenus
    HOVER_MENU: 61,
    SUBMENU_LEVEL_1: 61,
    SUBMENU_LEVEL_2: 62,
    
    // Páginas e janelas
    PAGES: 70,
    MOVABLE_TABS_NORMAL: 72,
    MOVABLE_TABS_DRAGGING: 75,
    
    // Controles
    WINDOW_CONTROLS: 100,
    
    // Overlays e modais
    SIDE_MENU: 2000,
    CONFIG_OVERLAY: 10000,
    PASSWORD_PROMPT: 10001,
    FEEDBACK_SYSTEM: 10000
  } as const

  /**
   * Obtém o z-index correto para um componente
   * Se o z-index for inválido, retorna o valor correto automaticamente
   */
  const getZIndex = useCallback((componentType: keyof typeof Z_INDEX_HIERARCHY, customZIndex?: number): number => {
    const correctZIndex = Z_INDEX_HIERARCHY[componentType]
    
    // Se foi fornecido um z-index customizado, validar se está correto
    if (customZIndex !== undefined) {
      // Se o z-index customizado está fora da faixa permitida, usar o correto
      if (customZIndex < 50 || customZIndex > 10001) {
        console.warn(`⚠️ Z-Index inválido detectado para ${componentType}: ${customZIndex}. Usando valor correto: ${correctZIndex}`)
        return correctZIndex
      }
      
      // Se o z-index customizado está na faixa permitida mas não é o ideal, avisar
      if (customZIndex !== correctZIndex) {
        console.warn(`⚠️ Z-Index não ideal para ${componentType}: ${customZIndex}. Recomendado: ${correctZIndex}`)
      }
      
      return customZIndex
    }
    
    return correctZIndex
  }, [])

  /**
   * Valida se um z-index está na hierarquia correta
   */
  const validateZIndex = useCallback((componentType: keyof typeof Z_INDEX_HIERARCHY, zIndex: number): boolean => {
    const correctZIndex = Z_INDEX_HIERARCHY[componentType]
    return zIndex === correctZIndex
  }, [])

  /**
   * Força a correção de um z-index inválido
   */
  const forceCorrectZIndex = useCallback((componentType: keyof typeof Z_INDEX_HIERARCHY): number => {
    const correctZIndex = Z_INDEX_HIERARCHY[componentType]
    console.log(`🔧 Forçando correção de z-index para ${componentType}: ${correctZIndex}`)
    return correctZIndex
  }, [])

  /**
   * Obtém a hierarquia completa para debug
   */
  const getHierarchy = useCallback(() => {
    return { ...Z_INDEX_HIERARCHY }
  }, [])

  /**
   * Verifica se há conflitos de z-index
   */
  const checkForConflicts = useCallback((currentZIndexes: Record<string, number>): string[] => {
    const conflicts: string[] = []
    const values = Object.values(currentZIndexes)
    
    // Verificar duplicatas
    const duplicates = values.filter((value, index) => values.indexOf(value) !== index)
    if (duplicates.length > 0) {
      conflicts.push(`Z-index duplicados detectados: ${duplicates.join(', ')}`)
    }
    
    // Verificar se algum z-index está fora da faixa permitida
    const invalidZIndexes = values.filter(value => value < 50 || value > 10001)
    if (invalidZIndexes.length > 0) {
      conflicts.push(`Z-index inválidos detectados: ${invalidZIndexes.join(', ')}`)
    }
    
    return conflicts
  }, [])

  return {
    getZIndex,
    validateZIndex,
    forceCorrectZIndex,
    getHierarchy,
    checkForConflicts,
    Z_INDEX_HIERARCHY
  }
}
