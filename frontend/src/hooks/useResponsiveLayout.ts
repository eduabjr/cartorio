import { useState, useEffect } from 'react'

interface ScreenInfo {
  width: number
  height: number
  isHighDPI: boolean
  devicePixelRatio: number
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'large'
}

export function useResponsiveLayout() {
  const [screenInfo, setScreenInfo] = useState<ScreenInfo>({
    width: window.innerWidth,
    height: window.innerHeight,
    isHighDPI: window.devicePixelRatio > 1,
    devicePixelRatio: window.devicePixelRatio,
    breakpoint: getBreakpoint(window.innerWidth)
  })

  useEffect(() => {
    const handleResize = () => {
      const newScreenInfo: ScreenInfo = {
        width: window.innerWidth,
        height: window.innerHeight,
        isHighDPI: window.devicePixelRatio > 1,
        devicePixelRatio: window.devicePixelRatio,
        breakpoint: getBreakpoint(window.innerWidth)
      }
      
      setScreenInfo(newScreenInfo)
      
      // Aplicar ajustes automáticos baseados na resolução
      applyResponsiveAdjustments(newScreenInfo)
    }

    const handleOrientationChange = () => {
      // Aguardar um pouco para a orientação se estabilizar
      setTimeout(handleResize, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)
    
    // Aplicar ajustes iniciais
    applyResponsiveAdjustments(screenInfo)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return screenInfo
}

function getBreakpoint(width: number): 'mobile' | 'tablet' | 'desktop' | 'large' {
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  if (width < 1920) return 'desktop'
  return 'large'
}

function applyResponsiveAdjustments(screenInfo: ScreenInfo) {
  const root = document.documentElement
  
  // Ajustar tamanho de fonte baseado na resolução
  const baseFontSize = 16
  const scaleFactor = Math.min(screenInfo.width / 1920, screenInfo.height / 1080, 1.5)
  const adjustedFontSize = Math.max(baseFontSize * scaleFactor, 12)
  
  root.style.fontSize = `${adjustedFontSize}px`
  
  // Ajustar variáveis CSS para diferentes resoluções
  const cssVariables = {
    '--responsive-scale': scaleFactor.toString(),
    '--screen-width': `${screenInfo.width}px`,
    '--screen-height': `${screenInfo.height}px`,
    '--is-high-dpi': screenInfo.isHighDPI ? '1' : '0',
    '--device-pixel-ratio': screenInfo.devicePixelRatio.toString()
  }
  
  Object.entries(cssVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })
  
  // Ajustar elementos específicos baseado no breakpoint
  adjustElementsForBreakpoint(screenInfo.breakpoint, screenInfo)
}

function adjustElementsForBreakpoint(
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'large',
  screenInfo: ScreenInfo
) {
  // Ajustar menus baseado no breakpoint
  const menuElements = document.querySelectorAll('[data-responsive-menu]')
  menuElements.forEach(element => {
    const htmlElement = element as HTMLElement
    
    switch (breakpoint) {
      case 'mobile':
        htmlElement.style.fontSize = '14px'
        htmlElement.style.padding = '8px'
        break
      case 'tablet':
        htmlElement.style.fontSize = '15px'
        htmlElement.style.padding = '10px'
        break
      case 'desktop':
        htmlElement.style.fontSize = '16px'
        htmlElement.style.padding = '12px'
        break
      case 'large':
        htmlElement.style.fontSize = '18px'
        htmlElement.style.padding = '14px'
        break
    }
  })
  
  // Ajustar botões de controle da janela
  const windowControls = document.querySelectorAll('[data-window-controls]')
  windowControls.forEach(element => {
    const htmlElement = element as HTMLElement
    const scale = Math.min(screenInfo.width / 1920, 1.2)
    
    htmlElement.style.transform = `scale(${scale})`
    htmlElement.style.transformOrigin = 'top right'
  })
  
  // Log para debug (pode ser removido em produção)
  console.log(`Layout ajustado para: ${breakpoint} (${screenInfo.width}x${screenInfo.height})`)
}
