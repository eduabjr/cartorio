import { useState, useEffect } from 'react'
import { nvdaService } from '../services/NVDAService'

export interface AccessibilitySettings {
  highContrast: boolean
  contrastLevel: 'normal' | 'light' | 'dark' | 'extreme'
  blueLightFilter: boolean
  blueLightIntensity: 'low' | 'medium' | 'high'
  reducedMotion: boolean
  fontSize: 'padrao' | 'grande' | 'extra-grande'
  screenReader: boolean
  keyboardNavigation: boolean
}

export interface ThemeColors {
  // Cores profissionais e sóbrias
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  success: string
  warning: string
  error: string
  info: string
}

// Predefinições de contraste avançado
export const contrastPresets = {
  normal: {
    name: 'Normal',
    description: 'Contraste padrão do sistema',
    filter: 'contrast(110%) brightness(105%)'
  },
  light: {
    name: 'Claro',
    description: 'Contraste mais claro e suave',
    filter: 'contrast(90%) brightness(120%) saturate(80%)'
  },
  dark: {
    name: 'Escuro',
    description: 'Contraste mais escuro e intenso',
    filter: 'contrast(150%) brightness(80%) saturate(120%)'
  },
  extreme: {
    name: 'Extremo',
    description: 'Contraste máximo para máxima legibilidade',
    filter: 'contrast(200%) brightness(70%) saturate(150%)'
  }
}

// Predefinições de filtro azul
export const blueLightPresets = {
  low: {
    name: 'Baixo',
    description: 'Redução sutil da luz azul',
    filter: 'sepia(0.1) hue-rotate(10deg) saturate(0.9)'
  },
  medium: {
    name: 'Médio',
    description: 'Redução moderada da luz azul',
    filter: 'sepia(0.2) hue-rotate(20deg) saturate(0.8)'
  },
  high: {
    name: 'Alto',
    description: 'Redução significativa da luz azul',
    filter: 'sepia(0.3) hue-rotate(30deg) saturate(0.7)'
  }
}

export const professionalThemes = {
  light: {
    primary: '#FF8C00', // Laranja vibrante para links e botões
    secondary: '#00A6A1', // Verde Água Sofisticado para elementos de destaque
    accent: '#2196F3', // Azul vibrante para links e elementos interativos
    background: '#E1E1E1', // Cinza Claro Suave
    surface: '#E1E1E1', // Cinza Claro Suave
    text: '#212121', // Cinza Escuro
    textSecondary: '#2C2C2C', // Cinza Profundo
    border: '#D1D1D1', // Cinza suave para bordas de inputs/seletores
    success: '#00A6A1', // Verde Água Sofisticado
    warning: '#f59e0b', // Amarelo moderno
    error: '#ef4444', // Vermelho moderno
    info: '#2196F3' // Azul vibrante para informações/links
  } as ThemeColors,
  
  dark: {
    primary: '#FF8C00', // Laranja vibrante para links e botões
    secondary: '#A1D2D3', // Azul suave para elementos de destaque
    accent: '#A1D2D3', // Azul suave para elementos de destaque
    background: '#121212', // Preto escuro
    surface: '#121212', // Preto escuro
    text: '#B0B0B0', // Cinza claro
    textSecondary: '#B0B0B0', // Cinza claro
    border: '#2C2C2C', // Cinza escuro
    success: '#A1D2D3', // Azul suave
    warning: '#f59e0b', // Amarelo moderno
    error: '#ef4444', // Vermelho moderno
    info: '#f19830' // Laranja para informações
  } as ThemeColors,
  
  highContrast: {
    primary: '#000000',
    secondary: '#333333',
    accent: '#0066cc',
    background: '#ffffff',
    surface: '#ffffff',
    text: '#000000',
    textSecondary: '#333333',
    border: '#000000',
    success: '#006600',
    warning: '#cc6600',
    error: '#cc0000',
    info: '#0066cc'
  } as ThemeColors
}

// Função para aplicar configurações de contraste avançado e filtro azul
function applyContrastSettings(settings: AccessibilitySettings) {
  const { contrastLevel, highContrast, blueLightFilter, blueLightIntensity } = settings
  
  console.log('🔵 Aplicando configurações de filtro:', {
    blueLightFilter,
    blueLightIntensity,
    highContrast,
    contrastLevel
  })
  
  // Remover classes anteriores
  document.body.classList.remove('high-contrast-active', 'high-contrast-custom')
  
  // Aplicar filtro azul se ativado
  let blueLightFilterValue = 'none'
  if (blueLightFilter) {
    const blueLightPresets = {
      low: 'sepia(0.1) hue-rotate(10deg) saturate(0.9)',
      medium: 'sepia(0.2) hue-rotate(20deg) saturate(0.8)',
      high: 'sepia(0.3) hue-rotate(30deg) saturate(0.7)'
    }
    blueLightFilterValue = blueLightPresets[blueLightIntensity]
    console.log('🔵 Filtro azul aplicado:', blueLightFilterValue)
  }

  // Se alto contraste está desabilitado, aplicar apenas filtro azul
  if (!highContrast) {
    document.body.style.filter = blueLightFilterValue
    document.body.style.setProperty('--contrast-filter', 'none')
    document.body.style.setProperty('--blue-light-filter', blueLightFilterValue)
    console.log('🔵 Aplicado apenas filtro azul:', blueLightFilterValue)
    return
  }
  
  // Adicionar classe base de alto contraste
  document.body.classList.add('high-contrast-active')
  
  // Aplicar contraste baseado no nível selecionado
  const contrastPresets = {
    normal: 'contrast(110%) brightness(105%)',
    light: 'contrast(90%) brightness(120%) saturate(80%)',
    dark: 'contrast(150%) brightness(80%) saturate(120%)',
    extreme: 'contrast(200%) brightness(70%) saturate(150%)'
  }
  
  const contrastFilterValue = contrastPresets[contrastLevel] || 'none'
  
  // Combinar filtros de contraste e luz azul
  let combinedFilter = contrastFilterValue
  if (blueLightFilter && contrastFilterValue !== 'none') {
    combinedFilter = `${contrastFilterValue} ${blueLightFilterValue}`
    console.log('🔵 Filtros combinados (contraste + azul):', combinedFilter)
  } else if (blueLightFilter) {
    combinedFilter = blueLightFilterValue
    console.log('🔵 Apenas filtro azul (com contraste):', combinedFilter)
  } else {
    console.log('🔵 Apenas filtro de contraste:', combinedFilter)
  }
  
  // Aplicar filtros combinados
  document.body.style.filter = combinedFilter
  document.body.style.setProperty('--contrast-filter', contrastFilterValue)
  document.body.style.setProperty('--blue-light-filter', blueLightFilterValue)
  console.log('🔵 Filtros aplicados ao body:', {
    filter: document.body.style.filter,
    contrastFilter: contrastFilterValue,
    blueLightFilter: blueLightFilterValue
  })
}

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    contrastLevel: 'normal',
    blueLightFilter: false,
    blueLightIntensity: 'medium',
    reducedMotion: false,
    fontSize: 'padrao',
    screenReader: false,
    keyboardNavigation: false
  })

  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'highContrast'>('light')

  // Carregar configurações salvas
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings')
    const savedTheme = localStorage.getItem('theme')
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (e) {
        console.warn('Erro ao carregar configurações de acessibilidade')
      }
    }
    
    if (savedTheme && ['light', 'dark', 'highContrast'].includes(savedTheme)) {
      setCurrentTheme(savedTheme as 'light' | 'dark' | 'highContrast')
    }
  }, [])

  // Detectar preferências do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

    // Só aplicar preferências do sistema se não houver configurações salvas
    const savedSettings = localStorage.getItem('accessibility-settings')
    if (!savedSettings) {
      setSettings(prev => ({
        ...prev,
        reducedMotion: mediaQuery.matches,
        highContrast: prefersHighContrast.matches
      }))

      if (prefersHighContrast.matches) {
        setCurrentTheme('highContrast')
      } else if (prefersDark.matches) {
        setCurrentTheme('dark')
      }
    }

    // Listeners para mudanças
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reducedMotion: e.matches }))
    }

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, highContrast: e.matches }))
      if (e.matches) {
        setCurrentTheme('highContrast')
      }
    }

    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      if (!settings.highContrast) {
        setCurrentTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleMotionChange)
    prefersHighContrast.addEventListener('change', handleContrastChange)
    prefersDark.addEventListener('change', handleColorSchemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange)
      prefersHighContrast.removeEventListener('change', handleContrastChange)
      prefersDark.removeEventListener('change', handleColorSchemeChange)
    }
  }, [settings.highContrast])

  // Detectar leitor de tela
  useEffect(() => {
    const detectScreenReader = async () => {
      // Verificar se já existem configurações salvas
      const savedSettings = localStorage.getItem('accessibility-settings')
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings)
          if (parsedSettings.screenReader !== undefined) {
            console.log('🔍 Configuração de leitor de tela já existe, não detectando automaticamente')
            return
          }
        } catch (error) {
          console.warn('⚠️ Erro ao ler configurações salvas, continuando com detecção automática')
        }
      }
      
      console.log('🔍 Iniciando detecção automática de leitor de tela...')
      
      // Aguardar um pouco para o NVDA service inicializar
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Verificar NVDA especificamente
      const isNVDAAvailable = nvdaService.isNVDAAvailable()
      console.log('🦮 NVDA Service disponível:', isNVDAAvailable)
      
      // Verificar se window.nvda existe
      const hasWindowNVDA = typeof (window as any).nvda !== 'undefined'
      console.log('🪟 window.nvda existe:', hasWindowNVDA)
      
      // Detectar por user agent
      const userAgent = navigator.userAgent.toLowerCase()
      const hasScreenReaderUA = 
        userAgent.includes('nvda') ||
        userAgent.includes('jaws') ||
        userAgent.includes('voiceover') ||
        userAgent.includes('orca') ||
        userAgent.includes('narrator')
      console.log('🌐 User Agent contém leitor de tela:', hasScreenReaderUA, userAgent)
      
      // Detectar por APIs disponíveis
      const hasScreenReaderAPI = 
        window.speechSynthesis ||
        'speechRecognition' in window ||
        'webkitSpeechRecognition' in window
      console.log('🎤 APIs de síntese disponíveis:', hasScreenReaderAPI)
      
      // Detectar por elementos de acessibilidade
      const hasAriaElements = 
        document.querySelector('[aria-live]') ||
        document.querySelector('[role="alert"]') ||
        document.querySelector('[aria-label]')
      console.log('♿ Elementos ARIA encontrados:', hasAriaElements)
      
      // Detectar por preferências do sistema
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
      console.log('⚙️ Preferências do sistema:', { prefersReducedMotion, prefersHighContrast })
      
      // Detectar por eventos de teclado (usuários de leitor de tela usam mais teclado)
      let keyboardUsage = 0
      const trackKeyboardUsage = () => {
        keyboardUsage++
        if (keyboardUsage > 10) {
          document.removeEventListener('keydown', trackKeyboardUsage)
        }
      }
      document.addEventListener('keydown', trackKeyboardUsage)
      
      // Detectar por características específicas de leitor de tela
      const hasScreenReaderFeatures = 
        // Verificar se há elementos com características de leitor de tela
        document.querySelectorAll('[aria-live], [aria-atomic], [aria-relevant]').length > 0 ||
        // Verificar se há elementos com roles específicos
        document.querySelectorAll('[role="alert"], [role="status"], [role="log"]').length > 0 ||
        // Verificar se há elementos com labels acessíveis
        document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]').length > 0
      console.log('🔧 Características de leitor de tela:', hasScreenReaderFeatures)
      
      const hasScreenReader = 
        isNVDAAvailable ||
        hasWindowNVDA ||
        hasScreenReaderUA ||
        hasScreenReaderAPI ||
        hasAriaElements ||
        hasScreenReaderFeatures ||
        (prefersReducedMotion && prefersHighContrast) ||
        keyboardUsage > 5
      
      console.log('✅ Resultado final da detecção:', hasScreenReader)
      console.log('📊 Detalhes:', {
        isNVDAAvailable,
        hasWindowNVDA,
        hasScreenReaderUA,
        hasScreenReaderAPI,
        hasAriaElements,
        hasScreenReaderFeatures,
        keyboardUsage
      })
      
      // Só atualizar se não houver configuração salva
      setSettings(prev => ({ ...prev, screenReader: !!hasScreenReader }))
      
      // Aplicar classe CSS para otimização de leitor de tela
      if (hasScreenReader) {
        document.body.classList.add('screen-reader-optimized')
        
        // Se NVDA estiver disponível, configurar integração adicional
        if (isNVDAAvailable || hasWindowNVDA) {
          document.body.classList.add('nvda-optimized')
          console.log('🎉 NVDA detectado e otimizado!')
        } else {
          console.log('📢 Leitor de tela detectado (não é NVDA)')
        }
      } else {
        document.body.classList.remove('screen-reader-optimized', 'nvda-optimized')
        console.log('❌ Nenhum leitor de tela detectado')
      }
    }

    detectScreenReader()
    
    // Re-detectar quando as configurações mudarem
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => detectScreenReader()
    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])


  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem('accessibility-settings', JSON.stringify(updated))
      
      // Anunciar mudanças importantes para leitor de tela
      if (newSettings.highContrast !== undefined) {
        announceToScreenReader(
          newSettings.highContrast ? 'Alto contraste ativado' : 'Alto contraste desativado'
        )
      }
      
      if (newSettings.blueLightFilter !== undefined) {
        announceToScreenReader(
          newSettings.blueLightFilter ? 'Filtro de luz azul ativado' : 'Filtro de luz azul desativado'
        )
      }
      
      if (newSettings.fontSize !== undefined) {
        const sizeNames = {
          'padrao': 'tamanho padrão',
          'grande': 'tamanho grande',
          'extra-grande': 'tamanho extra grande'
        }
        announceToScreenReader(`Fonte alterada para ${sizeNames[newSettings.fontSize]}`)
      }
      
      if (newSettings.reducedMotion !== undefined) {
        announceToScreenReader(
          newSettings.reducedMotion ? 'Movimento reduzido ativado' : 'Movimento reduzido desativado'
        )
      }
      
      return updated
    })
  }

  const setTheme = (theme: 'light' | 'dark' | 'highContrast') => {
    setCurrentTheme(theme)
    localStorage.setItem('theme', theme)
    
    // Anunciar mudança de tema
    const themeNames = {
      'light': 'tema claro',
      'dark': 'tema escuro',
      'highContrast': 'tema de alto contraste'
    }
    announceToScreenReader(`Tema alterado para ${themeNames[theme]}`)
    
    if (theme === 'highContrast') {
      setSettings(prev => ({ ...prev, highContrast: true }))
    }
  }

  const getTheme = () => {
    // Se o tema for highContrast, usar o tema light como base
    const themeKey = currentTheme === 'highContrast' ? 'light' : currentTheme
    return professionalThemes[themeKey as keyof typeof professionalThemes]
  }

  const getFontSize = () => {
    const sizes = {
      'padrao': '16px',
      'grande': '18px',
      'extra-grande': '20px'
    }
    return sizes[settings.fontSize]
  }
  
  const getFontMultiplier = () => {
    const multipliers = {
      'padrao': 1,
      'grande': 1.125,
      'extra-grande': 1.25
    }
    return multipliers[settings.fontSize]
  }

  // Função para anunciar mudanças para leitor de tela
  const announceToScreenReader = async (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    console.log('🔊 Tentando anunciar:', message, 'Prioridade:', priority)
    
    if (!settings.screenReader) {
      console.log('❌ Leitor de tela não detectado, pulando anúncio')
      return
    }
    
    // Evitar anúncios duplicados
    const messageKey = `${message}-${priority}`
    if (announceToScreenReader.lastMessage === messageKey) {
      console.log('⚠️ Anúncio duplicado ignorado:', message)
      return
    }
    announceToScreenReader.lastMessage = messageKey
    
    // Tentar usar NVDA se disponível
    if (nvdaService.isNVDAAvailable()) {
      try {
        console.log('🦮 Enviando anúncio via NVDA...')
        await nvdaService.announce(message, {
          priority: priority === 'assertive' ? 'high' : 'normal',
          interrupt: priority === 'assertive',
          category: 'information'
        })
        console.log('✅ Anúncio enviado via NVDA com sucesso!')
        return
      } catch (error) {
        console.warn('⚠️ Falha ao anunciar via NVDA, usando método padrão:', error)
      }
    }
    
    // Fallback: método padrão
    console.log('📢 Usando método padrão de anúncio...')
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    console.log('✅ Anúncio criado e adicionado ao DOM')
    
    // Remover após o anúncio
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement)
        console.log('🗑️ Anúncio removido do DOM')
      }
    }, 1000)
  }
  
  // Adicionar propriedade para rastrear última mensagem
  announceToScreenReader.lastMessage = ''

  // Aplicar tema e configurações globalmente
  useEffect(() => {
    const theme = getTheme()
    const fontSize = getFontSize()
    
    // Aplicar tema ao body
    document.body.style.setProperty('--primary-color', theme.primary)
    document.body.style.setProperty('--secondary-color', theme.secondary)
    document.body.style.setProperty('--background-color', theme.background)
    document.body.style.setProperty('--surface-color', theme.surface)
    document.body.style.setProperty('--text-color', theme.text)
    document.body.style.setProperty('--text-secondary-color', theme.textSecondary)
    document.body.style.setProperty('--border-color', theme.border)
    document.body.style.setProperty('--success-color', theme.success)
    document.body.style.setProperty('--warning-color', theme.warning)
    document.body.style.setProperty('--error-color', theme.error)
    document.body.style.setProperty('--info-color', theme.info)
    
    // Aplicar tamanho da fonte globalmente
    document.body.style.fontSize = fontSize
    document.documentElement.style.setProperty('--base-font-size', fontSize)
    
    // Aplicar multiplicadores para diferentes tamanhos
    const multiplier = getFontMultiplier()
    document.documentElement.style.setProperty('--font-multiplier', multiplier.toString())
    
    // Aplicar classe de tema
    document.body.className = document.body.className.replace(/theme-\w+/g, '')
    document.body.classList.add(`theme-${currentTheme}`)
    
    // Aplicar configurações de contraste avançado
    applyContrastSettings(settings)
    
    if (settings.reducedMotion) {
      document.body.style.setProperty('--animation-duration', '0.01s')
      document.body.style.setProperty('--transition-duration', '0.01s')
    } else {
      document.body.style.removeProperty('--animation-duration')
      document.body.style.removeProperty('--transition-duration')
    }
  }, [currentTheme, settings])

  // Funções específicas para contraste
  const setContrastLevel = (level: 'normal' | 'light' | 'dark' | 'extreme') => {
    updateSettings({ contrastLevel: level })
  }

  const toggleHighContrast = () => {
    updateSettings({ highContrast: !settings.highContrast })
  }

  const toggleBlueLightFilter = () => {
    updateSettings({ blueLightFilter: !settings.blueLightFilter })
  }

  const setBlueLightIntensity = (intensity: 'low' | 'medium' | 'high') => {
    updateSettings({ blueLightIntensity: intensity })
  }

  return {
    settings,
    currentTheme,
    updateSettings,
    setTheme,
    getTheme,
    getFontSize,
    getFontMultiplier,
    setContrastLevel,
    toggleHighContrast,
    toggleBlueLightFilter,
    setBlueLightIntensity,
    announceToScreenReader,
    contrastPresets,
    blueLightPresets,
    isHighContrast: settings.highContrast,
    isBlueLightFilter: settings.blueLightFilter,
    isReducedMotion: settings.reducedMotion,
    isScreenReader: settings.screenReader
  }
}
