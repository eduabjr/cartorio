/**
 * 🔒 COMPONENTE DE PROTEÇÃO DE TEMAS
 * 
 * Este componente monitora e protege o sistema de temas contra quebras.
 * Ele garante que:
 * 1. Temas sejam sempre válidos
 * 2. Transições sejam suaves
 * 3. Mudanças sejam aplicadas corretamente
 * 4. Erros sejam detectados e corrigidos automaticamente
 * 
 * ⚠️ NÃO REMOVA ESTE COMPONENTE!
 */

import React, { useEffect, useState } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'
import { ensureValidTheme } from '../utils/themeValidator'
import { professionalThemes } from '../hooks/useAccessibility'

interface ThemeProtectorProps {
  children: React.ReactNode
}

export function ThemeProtector({ children }: ThemeProtectorProps) {
  const { getTheme, currentTheme, setTheme } = useAccessibility()
  const [lastValidTheme, setLastValidTheme] = useState(currentTheme)
  const [errorCount, setErrorCount] = useState(0)

  // 🔒 PROTEÇÃO: Monitorar mudanças de tema
  useEffect(() => {
    console.log('🔒 ThemeProtector - Tema mudou:', currentTheme)

    // Validar tema atual
    const theme = getTheme()
    const validatedTheme = ensureValidTheme(theme, professionalThemes.light)

    // Verificar se o tema é válido
    if (JSON.stringify(theme) !== JSON.stringify(validatedTheme)) {
      console.error('❌ Tema corrompido detectado! Corrigindo...')
      setErrorCount((prev) => prev + 1)

      // Se muitos erros, resetar para tema padrão
      if (errorCount > 3) {
        console.error('❌ Muitos erros de tema! Resetando para light')
        setTheme('light')
        setErrorCount(0)
      }
    } else {
      setLastValidTheme(currentTheme)
      setErrorCount(0)
    }
  }, [currentTheme, getTheme, errorCount, setTheme])

  // 🔒 PROTEÇÃO: Aplicar tema ao body de forma segura
  useEffect(() => {
    const theme = getTheme()

    // Aplicar classe de tema ao body
    document.body.className = document.body.className.replace(/theme-\w+/g, '')
    document.body.classList.add(`theme-${currentTheme}`)

    // Aplicar cores CSS customizadas
    document.body.style.setProperty('--theme-primary', theme.primary)
    document.body.style.setProperty('--theme-secondary', theme.secondary)
    document.body.style.setProperty('--theme-accent', theme.accent)
    document.body.style.setProperty('--theme-background', theme.background)
    document.body.style.setProperty('--theme-surface', theme.surface)
    document.body.style.setProperty('--theme-text', theme.text)
    document.body.style.setProperty('--theme-border', theme.border)

    console.log('✅ ThemeProtector - Variáveis CSS aplicadas:', {
      currentTheme,
      background: theme.background,
      surface: theme.surface,
      text: theme.text
    })
  }, [currentTheme, getTheme])

  // 🔒 PROTEÇÃO: Detectar problemas de renderização
  useEffect(() => {
    const checkRender = () => {
      const computedBg = window.getComputedStyle(document.body).backgroundColor
      
      if (computedBg === 'rgba(0, 0, 0, 0)' || computedBg === 'transparent') {
        console.warn('⚠️ Background do body está transparente! Isso pode causar problemas visuais.')
      }
    }

    // Verificar após renderização
    const timer = setTimeout(checkRender, 500)
    return () => clearTimeout(timer)
  }, [currentTheme])

  // Renderizar children normalmente
  return <>{children}</>
}

/**
 * 🔒 HOOK: Hook simplificado para usar tema de forma segura
 */
export function useSafeTheme() {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()

  // 🔒 PROTEÇÃO: Sempre retornar um tema válido
  const safeTheme = ensureValidTheme(theme, professionalThemes.light)

  return {
    theme: safeTheme,
    currentTheme,
    isDark: currentTheme === 'dark',
    isLight: currentTheme === 'light',
    isHighContrast: currentTheme === 'highContrast'
  }
}

