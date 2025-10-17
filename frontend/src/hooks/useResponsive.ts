import { useState, useEffect } from 'react'

export interface Breakpoints {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
}

export const defaultBreakpoints: Breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
}

export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

export function useResponsive(breakpoints: Breakpoints = defaultBreakpoints) {
  const [screenSize, setScreenSize] = useState<ScreenSize>('lg')
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setWindowSize({ width, height })
      
      // Determinar tamanho da tela baseado na largura
      let newScreenSize: ScreenSize = 'xs'
      
      if (width >= breakpoints.xxl) {
        newScreenSize = 'xxl'
      } else if (width >= breakpoints.xl) {
        newScreenSize = 'xl'
      } else if (width >= breakpoints.lg) {
        newScreenSize = 'lg'
      } else if (width >= breakpoints.md) {
        newScreenSize = 'md'
      } else if (width >= breakpoints.sm) {
        newScreenSize = 'sm'
      }
      
      setScreenSize(newScreenSize)
    }

    // Definir tamanho inicial
    handleResize()

    // Adicionar listener
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [breakpoints])

  const isMobile = screenSize === 'xs' || screenSize === 'sm'
  const isTablet = screenSize === 'md'
  const isDesktop = screenSize === 'lg' || screenSize === 'xl' || screenSize === 'xxl'
  const isSmallScreen = screenSize === 'xs' || screenSize === 'sm' || screenSize === 'md'
  const isLargeScreen = screenSize === 'lg' || screenSize === 'xl' || screenSize === 'xxl'

  const getResponsiveValue = <T>(values: Partial<Record<ScreenSize, T>>, defaultValue: T): T => {
    return values[screenSize] ?? defaultValue
  }

  const getContainerStyles = () => {
    const baseStyles = {
      width: '100%',
      maxWidth: '100%',
      margin: '0 auto',
      padding: '0 16px'
    }

    const responsivePadding = {
      xs: '0 12px',
      sm: '0 16px',
      md: '0 20px',
      lg: '0 24px',
      xl: '0 32px',
      xxl: '0 40px'
    }

    const responsiveMaxWidth = {
      xs: '100%',
      sm: '100%',
      md: '100%',
      lg: '1200px',
      xl: '1400px',
      xxl: '1600px'
    }

    return {
      ...baseStyles,
      padding: responsivePadding[screenSize],
      maxWidth: responsiveMaxWidth[screenSize]
    }
  }

  const getGridColumns = (baseColumns: number) => {
    const responsiveColumns = {
      xs: Math.min(baseColumns, 1),
      sm: Math.min(baseColumns, 2),
      md: Math.min(baseColumns, 3),
      lg: baseColumns,
      xl: baseColumns,
      xxl: baseColumns
    }

    return responsiveColumns[screenSize]
  }

  const getSpacing = (baseSpacing: number) => {
    const responsiveSpacing = {
      xs: Math.max(baseSpacing * 0.5, 8),
      sm: Math.max(baseSpacing * 0.75, 12),
      md: baseSpacing,
      lg: baseSpacing,
      xl: baseSpacing * 1.25,
      xxl: baseSpacing * 1.5
    }

    return responsiveSpacing[screenSize]
  }

  const getFontSize = (baseSize: number) => {
    const responsiveFontSize = {
      xs: Math.max(baseSize * 0.875, 12),
      sm: Math.max(baseSize * 0.9, 13),
      md: baseSize,
      lg: baseSize,
      xl: baseSize * 1.1,
      xxl: baseSize * 1.2
    }

    return responsiveFontSize[screenSize]
  }

  return {
    screenSize,
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isLargeScreen,
    getResponsiveValue,
    getContainerStyles,
    getGridColumns,
    getSpacing,
    getFontSize,
    breakpoints
  }
}
