import { useEffect, useCallback, useRef } from 'react'
import { useAccessibility } from './useAccessibility'

/**
 * Tipo de atalho de teclado
 */
export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void | Promise<void>
  description: string
  enabled?: boolean
}

/**
 * Hook para gerenciar navegação por teclado e atalhos
 */
export function useKeyboardNavigation(shortcuts: KeyboardShortcut[] = []) {
  const { settings } = useAccessibility()
  const shortcutsRef = useRef(shortcuts)
  
  // Atualizar ref quando shortcuts mudam
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  /**
   * Handler global de teclado
   */
  const handleKeyDown = useCallback(async (e: KeyboardEvent) => {
    // Só ativa se navegação por teclado estiver habilitada
    if (!settings.keyboardNavigation) return
    
    const activeShortcuts = shortcutsRef.current
    
    for (const shortcut of activeShortcuts) {
      // Verificar se o atalho está desabilitado
      if (shortcut.enabled === false) continue
      
      // Verificar se a combinação de teclas corresponde
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
      const altMatch = shortcut.alt ? e.altKey : !e.altKey
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()
      
      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        e.preventDefault()
        e.stopPropagation()
        
        try {
          await shortcut.action()
        } catch (error) {
          console.error('❌ Erro ao executar atalho:', error)
        }
        
        break
      }
    }
  }, [settings.keyboardNavigation])

  /**
   * Registrar listeners
   */
  useEffect(() => {
    if (!settings.keyboardNavigation) {
      return
    }
    
    console.log('⌨️ Navegação por teclado ativada -', shortcutsRef.current.length, 'atalhos registrados')
    
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [settings.keyboardNavigation, handleKeyDown])

  /**
   * Função para adicionar indicador visual de foco
   */
  const enableFocusIndicators = useCallback(() => {
    if (!settings.keyboardNavigation) return
    
    // Adicionar classe global para indicadores de foco
    document.body.classList.add('keyboard-navigation-active')
    
    // Estilo global para foco
    const style = document.createElement('style')
    style.id = 'keyboard-focus-styles'
    style.textContent = `
      .keyboard-navigation-active *:focus {
        outline: 3px solid #3b82f6 !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3) !important;
      }
      
      .keyboard-navigation-active button:focus,
      .keyboard-navigation-active input:focus,
      .keyboard-navigation-active select:focus,
      .keyboard-navigation-active textarea:focus {
        outline: 3px solid #3b82f6 !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3) !important;
      }
      
      .keyboard-navigation-active a:focus {
        outline: 3px solid #10b981 !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3) !important;
      }
    `
    
    if (!document.getElementById('keyboard-focus-styles')) {
      document.head.appendChild(style)
    }
  }, [settings.keyboardNavigation])

  /**
   * Função para desabilitar indicadores de foco
   */
  const disableFocusIndicators = useCallback(() => {
    document.body.classList.remove('keyboard-navigation-active')
    
    const style = document.getElementById('keyboard-focus-styles')
    if (style) {
      style.remove()
    }
  }, [])

  /**
   * Aplicar/remover indicadores baseado na configuração
   */
  useEffect(() => {
    if (settings.keyboardNavigation) {
      enableFocusIndicators()
    } else {
      disableFocusIndicators()
    }
    
    return () => {
      disableFocusIndicators()
    }
  }, [settings.keyboardNavigation, enableFocusIndicators, disableFocusIndicators])

  /**
   * Mostrar painel de ajuda de atalhos
   */
  const showShortcutsHelp = useCallback(() => {
    const shortcuts = shortcutsRef.current
    if (shortcuts.length === 0) return
    
    const helpText = shortcuts
      .filter(s => s.enabled !== false)
      .map(s => {
        const keys = []
        if (s.ctrl) keys.push('Ctrl')
        if (s.shift) keys.push('Shift')
        if (s.alt) keys.push('Alt')
        keys.push(s.key.toUpperCase())
        
        return `${keys.join('+')} → ${s.description}`
      })
      .join('\n')
    
    console.log('⌨️ Atalhos disponíveis:\n' + helpText)
    alert(`⌨️ Atalhos de Teclado Disponíveis:\n\n${helpText}`)
  }, [])

  return {
    isEnabled: settings.keyboardNavigation,
    showShortcutsHelp,
    enableFocusIndicators,
    disableFocusIndicators
  }
}

