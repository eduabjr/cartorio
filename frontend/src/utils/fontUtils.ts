/**
 * Utilitários para aplicar tamanhos de fonte relativos baseados nas configurações de acessibilidade
 */

export const getRelativeFontSize = (baseSize: number): string => {
  return `calc(${baseSize}px * var(--font-multiplier, 1))`
}

export const getFontSizes = () => {
  const multiplier = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-multiplier') || '1')
  
  return {
    xs: getRelativeFontSize(12),
    sm: getRelativeFontSize(14),
    base: getRelativeFontSize(16),
    lg: getRelativeFontSize(18),
    xl: getRelativeFontSize(20),
    '2xl': getRelativeFontSize(24),
    '3xl': getRelativeFontSize(30),
    '4xl': getRelativeFontSize(36),
    '5xl': getRelativeFontSize(48),
    multiplier
  }
}

export const createFontStyle = (size: number) => ({
  fontSize: getRelativeFontSize(size)
})
