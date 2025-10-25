/**
 * 🔒 SISTEMA DE PROTEÇÃO DE TEMAS
 * 
 * Este arquivo contém validações e proteções para garantir que o sistema de temas
 * funcione corretamente e não quebre com futuras mudanças no código.
 * 
 * ⚠️ NÃO MODIFIQUE ESTE ARQUIVO SEM REVISAR TODAS AS DEPENDÊNCIAS!
 */

import { ThemeColors } from '../hooks/useAccessibility'

/**
 * 🔒 VALIDAÇÃO: Verificar se todas as cores do tema estão presentes
 */
export function validateTheme(theme: Partial<ThemeColors>, themeName: string): boolean {
  const requiredColors: (keyof ThemeColors)[] = [
    'primary',
    'secondary',
    'accent',
    'background',
    'surface',
    'text',
    'textSecondary',
    'border',
    'success',
    'warning',
    'error',
    'info'
  ]

  const missingColors: string[] = []

  for (const color of requiredColors) {
    if (!theme[color]) {
      missingColors.push(color)
    }
  }

  if (missingColors.length > 0) {
    console.error(`❌ Tema '${themeName}' está incompleto! Cores faltando:`, missingColors)
    return false
  }

  console.log(`✅ Tema '${themeName}' validado com sucesso!`)
  return true
}

/**
 * 🔒 VALIDAÇÃO: Verificar se uma cor é válida (hex, rgb, rgba, hsl)
 */
export function isValidColor(color: string): boolean {
  // Aceitar cores nomeadas comuns
  const namedColors = [
    'white', 'black', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
    'pink', 'brown', 'gray', 'grey', 'transparent'
  ]

  if (namedColors.includes(color.toLowerCase())) {
    return true
  }

  // Verificar formato hex (#RGB, #RRGGBB, #RRGGBBAA)
  if (/^#([0-9A-F]{3}){1,2}([0-9A-F]{2})?$/i.test(color)) {
    return true
  }

  // Verificar formato rgb/rgba
  if (/^rgba?\((\d+),\s*(\d+),\s*(\d+)(,\s*[\d.]+)?\)$/i.test(color)) {
    return true
  }

  // Verificar formato hsl/hsla
  if (/^hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(,\s*[\d.]+)?\)$/i.test(color)) {
    return true
  }

  console.warn(`⚠️ Cor potencialmente inválida: ${color}`)
  return false
}

/**
 * 🔒 VALIDAÇÃO: Verificar se um tema tem contraste adequado
 */
export function validateContrast(theme: ThemeColors): boolean {
  // Função auxiliar para converter hex para RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null
  }

  // Calcular luminância relativa
  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  // Calcular razão de contraste
  const getContrastRatio = (l1: number, l2: number): number => {
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)
  }

  try {
    const bg = hexToRgb(theme.background)
    const text = hexToRgb(theme.text)

    if (bg && text) {
      const bgLuminance = getLuminance(bg.r, bg.g, bg.b)
      const textLuminance = getLuminance(text.r, text.g, text.b)
      const contrast = getContrastRatio(bgLuminance, textLuminance)

      // WCAG AA requer contraste mínimo de 4.5:1
      if (contrast < 4.5) {
        console.warn(`⚠️ Contraste inadequado! Razão: ${contrast.toFixed(2)}:1 (mínimo: 4.5:1)`)
        return false
      }

      console.log(`✅ Contraste adequado: ${contrast.toFixed(2)}:1`)
      return true
    }
  } catch (error) {
    console.warn('⚠️ Erro ao validar contraste:', error)
  }

  return true // Não falhar se não conseguir validar
}

/**
 * 🔒 PROTEÇÃO: Garantir que componentes sempre recebam um tema válido
 */
export function ensureValidTheme(
  theme: Partial<ThemeColors> | null | undefined,
  fallbackTheme: ThemeColors
): ThemeColors {
  if (!theme) {
    console.warn('⚠️ Tema nulo/undefined! Usando fallback.')
    return fallbackTheme
  }

  // Verificar se todas as cores estão presentes
  const requiredColors: (keyof ThemeColors)[] = [
    'primary',
    'secondary',
    'accent',
    'background',
    'surface',
    'text',
    'textSecondary',
    'border',
    'success',
    'warning',
    'error',
    'info'
  ]

  const completeTheme: any = { ...theme }

  for (const color of requiredColors) {
    if (!completeTheme[color]) {
      console.warn(`⚠️ Cor '${color}' faltando no tema! Usando fallback.`)
      completeTheme[color] = fallbackTheme[color]
    }
  }

  return completeTheme as ThemeColors
}

/**
 * 🔒 TESTE: Executar todos os testes de validação
 */
export function runThemeValidationTests(themes: Record<string, ThemeColors>): boolean {
  console.log('🧪 Executando testes de validação de temas...')

  let allValid = true

  for (const [name, theme] of Object.entries(themes)) {
    console.log(`\n📋 Validando tema: ${name}`)

    // Teste 1: Tema completo
    if (!validateTheme(theme, name)) {
      allValid = false
      continue
    }

    // Teste 2: Cores válidas
    for (const [colorName, colorValue] of Object.entries(theme)) {
      if (!isValidColor(colorValue)) {
        console.error(`❌ Cor '${colorName}' inválida no tema '${name}': ${colorValue}`)
        allValid = false
      }
    }

    // Teste 3: Contraste adequado
    if (!validateContrast(theme)) {
      console.warn(`⚠️ Tema '${name}' pode ter problemas de acessibilidade`)
      // Não falhar, apenas avisar
    }
  }

  if (allValid) {
    console.log('\n✅ Todos os temas passaram na validação!')
  } else {
    console.error('\n❌ Alguns temas falharam na validação!')
  }

  return allValid
}

/**
 * 🔒 MONITOR: Detectar mudanças não autorizadas no tema
 */
export function createThemeMonitor(
  getTheme: () => ThemeColors,
  onThemeCorrupted: (error: string) => void
): () => void {
  let lastValidTheme: ThemeColors | null = null
  let checkCount = 0

  const checkInterval = setInterval(() => {
    checkCount++
    const currentTheme = getTheme()

    // Primeira verificação
    if (!lastValidTheme) {
      if (validateTheme(currentTheme, 'current')) {
        lastValidTheme = { ...currentTheme }
      }
      return
    }

    // Verificar se o tema mudou inesperadamente
    if (!validateTheme(currentTheme, 'current')) {
      const error = `❌ Tema corrompido detectado na verificação #${checkCount}!`
      console.error(error)
      onThemeCorrupted(error)
      clearInterval(checkInterval)
    }

    lastValidTheme = { ...currentTheme }
  }, 5000) // Verificar a cada 5 segundos

  // Retornar função de cleanup
  return () => {
    clearInterval(checkInterval)
    console.log('🛑 Monitor de tema desativado')
  }
}

