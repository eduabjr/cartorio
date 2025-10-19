import React, { useState, useEffect } from 'react'

interface CivitasLogoProps {
  size?: number
  color?: string
  theme?: 'light' | 'dark'
  showText?: boolean
  textColor?: string
}

export function CivitasLogo({ size = 64, color = '#2D5A5A', theme = 'light', showText = false, textColor = '#ffffff' }: CivitasLogoProps) {
  const [logoExists, setLogoExists] = useState(false)
  const [logoPath, setLogoPath] = useState('')

  useEffect(() => {
    // Verificar se existe um logo personalizado para o tema atual
    const checkLogo = async () => {
      // Prioridade: logo-header, depois logo específico do tema, depois logo genérico
      const possiblePaths = [
        // Logo específico para header
        '/logo-header.png',
        '/logo-header.svg',
        '/assets/logo/logo-header.png',
        '/assets/logo/logo-header.svg',
        // Logos específicos do tema
        `/logo-${theme}.png`,
        `/logo-${theme}.svg`,
        `/assets/logo/civitas-logo-${theme}.png`,
        `/assets/logo/civitas-logo-${theme}.svg`,
        `/assets/logo/logo-${theme}.png`,
        `/assets/logo/logo-${theme}.svg`,
        // Logos genéricos (fallback)
        '/logo.png',
        '/logo.svg',
        '/assets/logo/civitas-logo.png',
        '/assets/logo/civitas-logo.svg',
        '/assets/logo/logo.png',
        '/assets/logo/logo.svg'
      ]

      for (const path of possiblePaths) {
        try {
          const response = await fetch(path, { method: 'HEAD' })
          if (response.ok) {
            setLogoExists(true)
            setLogoPath(path)
            return
          }
        } catch (error) {
          // Continuar para o próximo caminho
        }
      }
    }

    checkLogo()
  }, [theme])

  // Se houver logo personalizado, usar ele
  if (logoExists) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img 
          src={logoPath}
          alt="Logo CIVITAS"
          width={size}
          height={size}
          style={{
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }}
        />
        {showText && (
          <span 
            style={{
              color: textColor,
              fontSize: `${size * 0.6}px`,
              fontWeight: 'bold',
              fontFamily: 'Arial, sans-serif',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              letterSpacing: '1px'
            }}
          >
            CIVITAS
          </span>
        )}
      </div>
    )
  }

  // Se não houver logo personalizado, usar o SVG padrão melhorado
  // Definir cores baseadas no tema
  const themeColors = {
    light: {
      primary: '#2D5A5A',
      secondary: '#4A9B9B',
      window: '#E8F4F8',
      shadow: 'rgba(0,0,0,0.2)'
    },
    dark: {
      primary: '#A1D2D3',
      secondary: '#7FB3B5',
      window: '#2A4A4A',
      shadow: 'rgba(0,0,0,0.4)'
    }
  }

  const currentTheme = themeColors[theme]
  const logoColor = color || currentTheme.primary

  const svgContent = (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradiente sutil para profundidade */}
        <linearGradient id={`buildingGradient-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={logoColor} stopOpacity="1" />
          <stop offset="100%" stopColor={logoColor} stopOpacity="0.8" />
        </linearGradient>
        
        {/* Gradiente para a balança */}
        <linearGradient id={`scaleGradient-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={logoColor} stopOpacity="1" />
          <stop offset="50%" stopColor={logoColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={logoColor} stopOpacity="0.7" />
        </linearGradient>
        
        {/* Sombra sutil baseada no tema */}
        <filter id={`shadow-${theme}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor={currentTheme.shadow}/>
        </filter>
      </defs>
      
      {/* Silhueta da cidade (fundo) */}
      <g transform="translate(60, 85)">
        {/* Base da cidade com gradiente */}
        <rect x="-45" y="0" width="90" height="10" fill={`url(#buildingGradient-${theme})`} rx="2" />
        
        {/* Edifícios com alturas variadas e gradiente */}
        <rect x="-40" y="-25" width="9" height="25" fill={`url(#buildingGradient-${theme})`} rx="1" />
        <rect x="-29" y="-20" width="7" height="20" fill={`url(#buildingGradient-${theme})`} rx="1" />
        <rect x="-20" y="-30" width="8" height="30" fill={`url(#buildingGradient-${theme})`} rx="1" />
        <rect x="-10" y="-35" width="9" height="35" fill={`url(#buildingGradient-${theme})`} rx="1" />
        <rect x="1" y="-25" width="7" height="25" fill={`url(#buildingGradient-${theme})`} rx="1" />
        <rect x="10" y="-22" width="8" height="22" fill={`url(#buildingGradient-${theme})`} rx="1" />
        <rect x="20" y="-28" width="9" height="28" fill={`url(#buildingGradient-${theme})`} rx="1" />
        <rect x="31" y="-20" width="7" height="20" fill={`url(#buildingGradient-${theme})`} rx="1" />
        
        {/* Janelas iluminadas com cor baseada no tema */}
        <rect x="-37" y="-20" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="-34" y="-20" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="-37" y="-17" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="-34" y="-17" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        
        <rect x="-26" y="-15" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="-23" y="-15" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="-26" y="-12" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="-23" y="-12" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        
        <rect x="-17" y="-25" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="-14" y="-25" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="-11" y="-25" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="-17" y="-22" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="-14" y="-22" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="-11" y="-22" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        
        <rect x="-7" y="-30" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="-4" y="-30" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="-1" y="-30" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="-7" y="-27" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="-4" y="-27" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="-1" y="-27" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        
        <rect x="3" y="-20" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="3" y="-17" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="3" y="-14" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        
        <rect x="12" y="-17" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="15" y="-17" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="12" y="-14" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="15" y="-14" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        
        <rect x="22" y="-23" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="25" y="-23" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="22" y="-20" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="25" y="-20" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        
        <rect x="33" y="-15" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="33" y="-12" width="2" height="2" fill={currentTheme.window} rx="0.5" />
        <rect x="33" y="-9" width="2" height="2" fill={currentTheme.window} rx="0.5" />
      </g>
      
      {/* Balança de Justiça (centro) com sombra */}
      <g transform="translate(60, 60)" filter={`url(#shadow-${theme})`}>
        {/* Pilar central com gradiente */}
        <rect x="-5" y="-35" width="10" height="55" fill={`url(#scaleGradient-${theme})`} rx="2" />
        
        {/* Barra horizontal com gradiente */}
        <rect x="-30" y="-35" width="60" height="5" fill={`url(#scaleGradient-${theme})`} rx="2" />
        
        {/* Pratos da balança (trapezoidais melhorados) */}
        <path d="M-25 -30 L-18 -22 L-18 -15 L-25 -23 Z" fill={`url(#scaleGradient-${theme})`} />
        <path d="M25 -30 L18 -22 L18 -15 L25 -23 Z" fill={`url(#scaleGradient-${theme})`} />
        
        {/* Cordas dos pratos mais elegantes */}
        <line x1="-25" y1="-35" x2="-25" y2="-30" stroke={logoColor} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="25" y1="-35" x2="25" y2="-30" stroke={logoColor} strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Documento no pilar central mais detalhado */}
        <rect x="-4" y="-18" width="8" height="10" fill="white" stroke={logoColor} strokeWidth="0.5" rx="1" />
        {/* Aba dobrada mais realista */}
        <path d="M4 -18 L7 -15 L4 -15 Z" fill={logoColor} />
        {/* Linhas de texto mais elegantes */}
        <rect x="-3" y="-16" width="6" height="0.8" fill={logoColor} rx="0.2" />
        <rect x="-3" y="-14.5" width="4.5" height="0.8" fill={logoColor} rx="0.2" />
        <rect x="-3" y="-13" width="5" height="0.8" fill={logoColor} rx="0.2" />
        <rect x="-3" y="-11.5" width="3.5" height="0.8" fill={logoColor} rx="0.2" />
        <rect x="-3" y="-10" width="4" height="0.8" fill={logoColor} rx="0.2" />
      </g>
    </svg>
  )

  // Se showText for true, retornar com texto
  if (showText) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {svgContent}
        <span 
          style={{
            color: textColor,
            fontSize: `${size * 0.6}px`,
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            letterSpacing: '1px'
          }}
        >
          CIVITAS
        </span>
      </div>
    )
  }

  // Retornar apenas o SVG
  return svgContent
}