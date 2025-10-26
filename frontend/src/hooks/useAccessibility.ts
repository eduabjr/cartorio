import { useState, useEffect } from 'react'
import { nvdaService } from '../services/NVDAService'
import { validateTheme, runThemeValidationTests } from '../utils/themeValidator'

export interface AccessibilitySettings {
  highContrast: boolean
  contrastLevel: 'normal' | 'light' | 'dark' | 'extreme'
  blueLightFilter: boolean
  blueLightIntensity: 'low' | 'medium' | 'high'
  reducedMotion: boolean
  fontSize: 'padrao' | 'grande'
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
    background: '#E0E0E0', // Cinza claro para fundo
    surface: '#FFFFFF', // Branco para superfícies
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
    background: '#0a0a0a', // Preto muito escuro para fundo geral
    surface: '#1e1e1e', // Cinza escuro para superfícies (MenuBar, Toolbar)
    text: '#C8C8C8', // Cinza claro suave (melhor para os olhos no dark mode)
    textSecondary: '#9A9A9A', // Cinza médio suave para texto secundário
    border: '#3a3a3a', // Cinza médio para bordas (mais visível)
    success: '#10b981', // Verde mais vibrante
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
  const { contrastLevel, highContrast, blueLightFilter, blueLightIntensity, reducedMotion } = settings
  
  console.log('🔵 Aplicando configurações de filtro:', {
    blueLightFilter,
    blueLightIntensity,
    highContrast,
    contrastLevel,
    reducedMotion
  })
  
  // 🔒 PROTEÇÃO: reducedMotion NÃO deve afetar contraste ou filtros
  if (reducedMotion) {
    console.log('⏸️  Modo de movimento reduzido está ATIVO - mas NÃO afeta filtros/contraste')
  }
  
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

  // Aplicar filtros de daltonismo independentemente do alto contraste
  const daltonismPresets = {
    normal: 'none',
    light: 'sepia(0.3) hue-rotate(20deg) saturate(0.8)', // Protanopia
    dark: 'sepia(0.4) hue-rotate(40deg) saturate(0.9)', // Deuteranopia  
    extreme: 'sepia(0.5) hue-rotate(60deg) saturate(1.1)' // Tritanopia
  }
  
  const daltonismFilter = daltonismPresets[contrastLevel] || 'none'
  
  // 🔒 CORREÇÃO: Se alto contraste está desabilitado E não há filtros ativos, limpar tudo
  if (!highContrast && contrastLevel === 'normal' && !blueLightFilter) {
    document.body.style.filter = 'none'
    document.body.style.setProperty('--contrast-filter', 'none')
    document.body.style.setProperty('--blue-light-filter', 'none')
    document.body.style.setProperty('--daltonism-filter', 'none')
    console.log('✅ Filtros desabilitados - tema livre para funcionar')
    return
  }
  
  // Se alto contraste está desabilitado MAS há filtros (daltonismo/azul), aplicar apenas esses
  if (!highContrast) {
    let combinedFilter = daltonismFilter
    if (blueLightFilter && daltonismFilter !== 'none') {
      combinedFilter = `${daltonismFilter} ${blueLightFilterValue}`
    } else if (blueLightFilter) {
      combinedFilter = blueLightFilterValue
    }
    
    document.body.style.filter = combinedFilter === 'none' ? 'none' : combinedFilter
    document.body.style.setProperty('--contrast-filter', 'none')
    document.body.style.setProperty('--blue-light-filter', blueLightFilterValue)
    document.body.style.setProperty('--daltonism-filter', daltonismFilter)
    console.log('🔵 Aplicado filtros de daltonismo/azul (sem bloquear tema):', { daltonismFilter, blueLightFilterValue, combinedFilter })
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
  
  // Combinar filtros de contraste, daltonismo e luz azul
  let combinedFilter = contrastFilterValue
  if (daltonismFilter !== 'none' && contrastFilterValue !== 'none') {
    combinedFilter = `${contrastFilterValue} ${daltonismFilter}`
  } else if (daltonismFilter !== 'none') {
    combinedFilter = daltonismFilter
  }
  
  if (blueLightFilter && combinedFilter !== 'none') {
    combinedFilter = `${combinedFilter} ${blueLightFilterValue}`
    console.log('🔵 Filtros combinados (contraste + daltonismo + azul):', combinedFilter)
  } else if (blueLightFilter) {
    combinedFilter = blueLightFilterValue
    console.log('🔵 Apenas filtro azul (com contraste):', combinedFilter)
  } else {
    console.log('🔵 Filtros de contraste e daltonismo:', combinedFilter)
  }
  
  // Aplicar filtros combinados
  document.body.style.filter = combinedFilter
  document.body.style.setProperty('--contrast-filter', contrastFilterValue)
  document.body.style.setProperty('--blue-light-filter', blueLightFilterValue)
  document.body.style.setProperty('--daltonism-filter', daltonismFilter)
  console.log('🔵 Filtros aplicados ao body:', {
    filter: document.body.style.filter,
    contrastFilter: contrastFilterValue,
    blueLightFilter: blueLightFilterValue,
    daltonismFilter: daltonismFilter
  })
  
  // 🔒 VERIFICAÇÃO FINAL: Garantir que reducedMotion não alterou nada além de animações
  console.log('✅ applyContrastSettings concluído - reducedMotion não afetou filtros ou temas')
}

export function useAccessibility() {
  // 🔒 CORREÇÃO CRÍTICA: Inicializar settings do localStorage ANTES do primeiro render
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const savedSettings = localStorage.getItem('accessibility-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        console.log('⚡ Settings carregadas ANTES do primeiro render:', parsed)
        return { ...{
          highContrast: false,
          contrastLevel: 'normal' as const,
          blueLightFilter: false,
          blueLightIntensity: 'medium' as const,
          reducedMotion: false,
          fontSize: 'padrao' as const,
          screenReader: false,
          keyboardNavigation: false
        }, ...parsed }
      } catch (e) {
        console.warn('❌ Erro ao parsear settings, usando padrão')
      }
    }
    return {
      highContrast: false,
      contrastLevel: 'normal',
      blueLightFilter: false,
      blueLightIntensity: 'medium',
      reducedMotion: false,
      fontSize: 'padrao',
      screenReader: false,
      keyboardNavigation: false
    }
  })

  // 🔒 CORREÇÃO CRÍTICA: Inicializar currentTheme do localStorage ANTES do primeiro render
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'highContrast'>(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme && ['light', 'dark', 'highContrast'].includes(savedTheme)) {
      console.log('⚡ Tema carregado ANTES do primeiro render:', savedTheme)
      
      // 🔒 SUPER CRÍTICO: Aplicar tema no DOM ANTES do React renderizar
      const immediateTheme = professionalThemes[savedTheme as keyof typeof professionalThemes]
      if (immediateTheme) {
        console.log('⚡⚡⚡ APLICANDO TEMA NO DOM ANTES DO PRIMEIRO RENDER')
        document.body.style.setProperty('--background-color', immediateTheme.background, 'important')
        document.body.style.setProperty('--surface-color', immediateTheme.surface, 'important')
        document.body.style.setProperty('--text-color', immediateTheme.text, 'important')
        document.body.style.setProperty('--border-color', immediateTheme.border, 'important')
        document.body.classList.add(`theme-${savedTheme}`)
        console.log('✅ DOM preparado com tema:', savedTheme)
      }
      
      return savedTheme as 'light' | 'dark' | 'highContrast'
    }
    console.log('⚡ Nenhum tema salvo, usando light por padrão')
    return 'light'
  })
  
  const [isThemeLoaded, setIsThemeLoaded] = useState(false)

  // 🔒 PROTEÇÃO: Validar temas na inicialização
  useEffect(() => {
    console.log('🔒 Iniciando validação de temas...')
    runThemeValidationTests(professionalThemes)
  }, [])

  // Carregar configurações salvas
  useEffect(() => {
    console.log('\n🚀🚀🚀 ═══════════════════════════════════════════════')
    console.log('🚀 INICIALIZAÇÃO DO SISTEMA DE TEMAS')
    console.log('🚀🚀🚀 ═══════════════════════════════════════════════')
    
    const savedSettings = localStorage.getItem('accessibility-settings')
    const savedTheme = localStorage.getItem('theme')
    
    console.log('🔍 Verificando localStorage:', {
      savedSettings,
      savedTheme,
      currentThemeInicial: currentTheme
    })
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
        console.log('✅ Configurações de acessibilidade carregadas:', parsed)
      } catch (e) {
        console.warn('❌ Erro ao carregar configurações de acessibilidade:', e)
      }
    }
    
    if (savedTheme && ['light', 'dark', 'highContrast'].includes(savedTheme)) {
      console.log('🎨 Tema salvo encontrado:', savedTheme)
      console.log('⚡ APLICANDO TEMA IMEDIATAMENTE (ANTES de marcar como loaded)')
      
      // 🔒 CORREÇÃO CRÍTICA: Aplicar tema ANTES de marcar como loaded
      const immediateTheme = professionalThemes[savedTheme as keyof typeof professionalThemes]
      if (immediateTheme) {
        // Aplicar variáveis CSS IMEDIATAMENTE
        document.body.style.setProperty('--primary-color', immediateTheme.primary, 'important')
        document.body.style.setProperty('--secondary-color', immediateTheme.secondary, 'important')
        document.body.style.setProperty('--background-color', immediateTheme.background, 'important')
        document.body.style.setProperty('--surface-color', immediateTheme.surface, 'important')
        document.body.style.setProperty('--text-color', immediateTheme.text, 'important')
        document.body.style.setProperty('--text-secondary-color', immediateTheme.textSecondary, 'important')
        document.body.style.setProperty('--border-color', immediateTheme.border, 'important')
        document.body.style.setProperty('--success-color', immediateTheme.success, 'important')
        document.body.style.setProperty('--warning-color', immediateTheme.warning, 'important')
        document.body.style.setProperty('--error-color', immediateTheme.error, 'important')
        document.body.style.setProperty('--info-color', immediateTheme.info, 'important')
        
        // Aplicar classe de tema
        document.body.className = document.body.className.replace(/theme-\w+/g, '')
        document.body.classList.add(`theme-${savedTheme}`)
        
        console.log('✅ Variáveis CSS aplicadas IMEDIATAMENTE na inicialização')
        console.log('📊 Cores aplicadas:', {
          background: immediateTheme.background,
          surface: immediateTheme.surface,
          text: immediateTheme.text
        })
      }
      
      setCurrentTheme(savedTheme as 'light' | 'dark' | 'highContrast')
      console.log('✅ currentTheme definido para:', savedTheme)
    } else {
      console.log('⚠️ Nenhum tema salvo encontrado, usando padrão: light')
      
      // 🔒 CORREÇÃO: Aplicar tema light imediatamente também
      const lightTheme = professionalThemes.light
      document.body.style.setProperty('--background-color', lightTheme.background, 'important')
      document.body.style.setProperty('--surface-color', lightTheme.surface, 'important')
      document.body.style.setProperty('--text-color', lightTheme.text, 'important')
      document.body.classList.add('theme-light')
      console.log('✅ Tema light aplicado por padrão')
    }
    
    console.log('🏁 Marcando tema como carregado (isThemeLoaded = true)')
    setIsThemeLoaded(true)
    
    // 🔒 GARANTIA ABSOLUTA: Disparar evento theme-changed NA INICIALIZAÇÃO
    // Isso força todos os componentes a renderizarem com o tema correto desde o início
    setTimeout(() => {
      const temaAtual = localStorage.getItem('theme') || 'light'
      console.log('📢 DISPARANDO evento theme-changed na INICIALIZAÇÃO com tema:', temaAtual)
      window.dispatchEvent(new CustomEvent('theme-changed', { 
        detail: { theme: temaAtual, timestamp: Date.now(), initialization: true } 
      }))
      console.log('✅ Evento de inicialização disparado')
    }, 50) // Pequeno delay para garantir que componentes estejam montados
    
    console.log('🚀🚀🚀 ═══════════════════════════════════════════════\n')
  }, [])

  // Detectar preferências do sistema
  useEffect(() => {
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

    console.log('🔍 useAccessibility - Detectando preferências do sistema:', {
      prefersDark: prefersDark.matches,
      prefersHighContrast: prefersHighContrast.matches
    })

    // Só aplicar preferências do sistema se não houver configurações salvas
    const savedSettings = localStorage.getItem('accessibility-settings')
    if (!savedSettings) {
      // ⚠️ NÃO ativar reducedMotion automaticamente - apenas detectar tema
      setSettings(prev => ({
        ...prev,
        // reducedMotion mantém o padrão (false) - usuário deve ativar manualmente
        highContrast: prefersHighContrast.matches
      }))

      if (prefersHighContrast.matches) {
        setCurrentTheme('highContrast')
        console.log('✅ Aplicando tema highContrast baseado nas preferências do sistema')
      } else if (prefersDark.matches) {
        setCurrentTheme('dark')
        console.log('✅ Aplicando tema dark baseado nas preferências do sistema')
      } else {
        console.log('✅ Usando tema light (padrão)')
      }
    } else {
      console.log('⚠️ Configurações salvas encontradas, não aplicando preferências do sistema')
    }

    // Listeners para mudanças (SEM listener para reducedMotion)
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

    prefersHighContrast.addEventListener('change', handleContrastChange)
    prefersDark.addEventListener('change', handleColorSchemeChange)

    return () => {
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
      // DESABILITADO: Não ativar automaticamente o leitor de tela
      // setSettings(prev => ({ ...prev, screenReader: !!hasScreenReader }))
      console.log('🔇 Detecção automática de leitor de tela desabilitada')
      
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
    console.log('🔧 updateSettings chamado com:', newSettings)
    
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem('accessibility-settings', JSON.stringify(updated))
      
      console.log('💾 Configurações atualizadas:', updated)
      
      // 🔒 PROTEÇÃO ESPECIAL: Se reducedMotion foi alterado, garantir que não afeta temas
      if (newSettings.reducedMotion !== undefined) {
        console.log('⏸️  reducedMotion alterado para:', newSettings.reducedMotion)
        console.log('🔒 GARANTIA: Temas NÃO serão afetados')
        console.log('🎨 Tema atual permanece:', currentTheme)
        
        announceToScreenReader(
          newSettings.reducedMotion ? 'Movimento reduzido ativado - temas não afetados' : 'Movimento reduzido desativado'
        )
      }
      
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
          'grande': 'tamanho grande'
        }
        announceToScreenReader(`Fonte alterada para ${sizeNames[newSettings.fontSize]}`)
      }
      
      return updated
    })
  }

  const setTheme = (theme: 'light' | 'dark' | 'highContrast') => {
    console.log('\n🔥🔥🔥 ═══════════════════════════════════════════════')
    console.log('🔥 setTheme CHAMADO')
    console.log('🔥🔥🔥 ═══════════════════════════════════════════════')
    console.log('📊 Tema SOLICITADO:', theme)
    console.log('📊 Tema ATUAL:', currentTheme)
    console.log('📊 São iguais?', theme === currentTheme)
    console.log('📊 Estado COMPLETO ANTES:', { 
      currentTheme, 
      highContrast: settings.highContrast,
      contrastLevel: settings.contrastLevel,
      blueLightFilter: settings.blueLightFilter,
      reducedMotion: settings.reducedMotion
    })
    
    // 🔒 CORREÇÃO: Se tema é o mesmo, forçar re-aplicação na primeira chamada
    if (theme === currentTheme) {
      console.log('⚠️ ATENÇÃO: Tema solicitado é igual ao atual!')
      console.log('🔧 Forçando re-aplicação para garantir que UI atualize')
    }
    
    // 🔒 CORREÇÃO CRÍTICA: Limpar filtros ao trocar tema se não for highContrast
    if (theme !== 'highContrast') {
      console.log('🧹 Limpando alto contraste ao trocar para tema normal')
      setSettings(prev => ({ ...prev, highContrast: false }))
      
      // Limpar classes de alto contraste imediatamente
      document.body.classList.remove('high-contrast-active', 'high-contrast-custom')
      console.log('✅ Classes removidas do body')
    }
    
    console.log('🔄 Alterando currentTheme de', currentTheme, 'para', theme)
    
    // 🔒 CORREÇÃO: Se tema é igual, forçar re-render através de timestamp
    if (theme === currentTheme) {
      console.log('🔧 Tema igual detectado - forçando re-aplicação via evento')
      
      // Aplicar imediatamente no DOM
      const immediateTheme = professionalThemes[theme as keyof typeof professionalThemes]
      if (immediateTheme) {
        console.log('⚡ Re-aplicando todas as variáveis CSS')
        document.body.style.setProperty('--primary-color', immediateTheme.primary, 'important')
        document.body.style.setProperty('--secondary-color', immediateTheme.secondary, 'important')
        document.body.style.setProperty('--background-color', immediateTheme.background, 'important')
        document.body.style.setProperty('--surface-color', immediateTheme.surface, 'important')
        document.body.style.setProperty('--text-color', immediateTheme.text, 'important')
        document.body.style.setProperty('--text-secondary-color', immediateTheme.textSecondary, 'important')
        document.body.style.setProperty('--border-color', immediateTheme.border, 'important')
        
        // Remover e re-adicionar classe para forçar atualização
        document.body.classList.remove(`theme-${theme}`)
        setTimeout(() => {
          document.body.classList.add(`theme-${theme}`)
        }, 10)
        
        // Disparar evento para forçar re-render dos componentes
        window.dispatchEvent(new CustomEvent('theme-changed', { 
          detail: { theme, timestamp: Date.now(), forced: true } 
        }))
        console.log('📢 Evento theme-changed FORÇADO (mesmo tema)')
      }
      
      // Mesmo assim, salvar no localStorage
      localStorage.setItem('theme', theme)
      console.log('✅ Tema re-aplicado mesmo sendo igual')
      return // ← RETORNAR AQUI para não duplicar setCurrentTheme
    }
    
    setCurrentTheme(theme)
    
    console.log('💾 Salvando no localStorage: theme =', theme)
    localStorage.setItem('theme', theme)
    
    // Verificar se salvou corretamente
    const savedTheme = localStorage.getItem('theme')
    console.log('✅ Verificação localStorage: theme =', savedTheme, savedTheme === theme ? '✓ OK' : '✗ ERRO')
    
    // Anunciar mudança de tema
    const themeNames = {
      'light': 'tema claro',
      'dark': 'tema escuro',
      'highContrast': 'tema de alto contraste'
    }
    announceToScreenReader(`Tema alterado para ${themeNames[theme]}`)
    
    if (theme === 'highContrast') {
      console.log('🎨 Ativando highContrast nas settings')
      setSettings(prev => ({ ...prev, highContrast: true }))
    }
    
    console.log('✅✅✅ setTheme CONCLUÍDO')
    console.log('📊 Novo tema:', theme)
    console.log('📊 currentTheme será:', theme)
    console.log('🔥🔥🔥 ═══════════════════════════════════════════════\n')
    
    // 🔒 GARANTIA 100%: Forçar aplicação IMEDIATA do tema no body
    const immediateTheme = professionalThemes[theme as keyof typeof professionalThemes]
    if (immediateTheme) {
      console.log('⚡ APLICAÇÃO IMEDIATA - Forçando variáveis CSS agora')
      document.body.style.setProperty('--primary-color', immediateTheme.primary, 'important')
      document.body.style.setProperty('--secondary-color', immediateTheme.secondary, 'important')
      document.body.style.setProperty('--background-color', immediateTheme.background, 'important')
      document.body.style.setProperty('--surface-color', immediateTheme.surface, 'important')
      document.body.style.setProperty('--text-color', immediateTheme.text, 'important')
      document.body.style.setProperty('--border-color', immediateTheme.border, 'important')
      console.log('✅ Variáveis CSS aplicadas IMEDIATAMENTE')
    }
    
    // 🔒 VERIFICAÇÃO EXTRA: Forçar aplicação imediata
    setTimeout(() => {
      const verificacao = localStorage.getItem('theme')
      console.log('🔍 VERIFICAÇÃO PÓS-EXECUÇÃO (100ms):', {
        temaNoLocalStorage: verificacao,
        temaEsperado: theme,
        match: verificacao === theme
      })
      
      // Verificar se as variáveis CSS foram aplicadas
      const bgColor = document.body.style.getPropertyValue('--background-color')
      const surfaceColor = document.body.style.getPropertyValue('--surface-color')
      console.log('🔍 Variáveis CSS aplicadas:', {
        backgroundColor: bgColor,
        surfaceColor: surfaceColor,
        esperadoBg: immediateTheme?.background,
        esperadoSurface: immediateTheme?.surface
      })
    }, 100)
  }

  const getTheme = (): ThemeColors => {
    // 🔒 BLOQUEIO: Garantir que o tema seja válido
    const validThemes = ['light', 'dark', 'highContrast'] as const
    const safeTheme = validThemes.includes(currentTheme as any) ? currentTheme : 'light'
    
    // 🔒 BLOQUEIO: Sempre retornar o tema correto baseado em currentTheme
    const themeColors = professionalThemes[safeTheme as keyof typeof professionalThemes]
    
    // 🔒 BLOQUEIO: Verificar se o tema existe
    if (!themeColors) {
      console.error(`❌ Tema '${safeTheme}' não encontrado! Usando 'light' como fallback`)
      return { ...professionalThemes.light }
    }
    
    // Retornar uma cópia do objeto para garantir que React detecte mudanças
    return { ...themeColors }
  }

  const getFontSize = () => {
    const sizes = {
      'padrao': '16px',
      'grande': '18px'
    }
    return sizes[settings.fontSize]
  }
  
  const getFontMultiplier = () => {
    const multipliers = {
      'padrao': 1,
      'grande': 1.125
    }
    return multipliers[settings.fontSize]
  }

  // Função para anunciar mudanças para leitor de tela
  const announceToScreenReader = async (message: string, priority: 'polite' | 'assertive' = 'polite', forceAnnounce: boolean = false) => {
    console.log('🔊 Tentando anunciar:', message, 'Prioridade:', priority, 'Forçar:', forceAnnounce)
    
    // Permitir anúncio se for forçado (para notificar desativação) ou se leitor estiver ativo
    if (!forceAnnounce && !settings.screenReader) {
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
    console.log('\n🌈🌈🌈 ═══════════════════════════════════════════════')
    console.log('🌈 useEffect [currentTheme, settings] EXECUTADO')
    console.log('🌈🌈🌈 ═══════════════════════════════════════════════')
    
    // 🔒 CORREÇÃO: Na primeira execução, NÃO aplicar debounce
    const lastApplied = (window as any).__lastThemeApplied || 0
    const now = Date.now()
    const isFirstRun = lastApplied === 0
    
    console.log('⏱️  Timestamp check:', {
      agora: now,
      ultimaAplicacao: lastApplied,
      diferenca: now - lastApplied,
      primeiraExecucao: isFirstRun,
      devePular: !isFirstRun && (now - lastApplied) < 100
    })
    
    // 🔒 PROTEÇÃO: Só pular se NÃO for primeira execução E aplicou há menos de 100ms
    if (!isFirstRun && (now - lastApplied) < 100) {
      console.log('⏭️  PULANDO aplicação (muito recente - menos de 100ms)')
      console.log('🌈🌈🌈 ═══════════════════════════════════════════════\n')
      return
    }
    
    if (isFirstRun) {
      console.log('🎬 PRIMEIRA EXECUÇÃO - aplicando tema imediatamente sem debounce')
    }
    
    (window as any).__lastThemeApplied = now
    console.log('✅ Timestamp atualizado para:', now)
    
    console.log('🔄 Aplicando configurações globais...')
    console.log('📊 currentTheme:', currentTheme)
    console.log('📊 settings:', settings)
    
    const theme = getTheme()
    const fontSize = getFontSize()
    
    console.log('🎨 Tema obtido de getTheme():', theme)
    console.log('📏 Tamanho de fonte:', fontSize)
    
    // 🔒 PROTEÇÃO: Garantir que o tema seja aplicado corretamente SEMPRE
    console.log('🎨 Aplicando tema:', currentTheme, theme)
    console.log('🔍 Estado de filtros:', { 
      highContrast: settings.highContrast, 
      contrastLevel: settings.contrastLevel,
      blueLightFilter: settings.blueLightFilter 
    })
    
    // 🔒 GARANTIA: Aplicar variáveis CSS do tema PRIMEIRO (prioridade máxima)
    document.body.style.setProperty('--primary-color', theme.primary, 'important')
    document.body.style.setProperty('--secondary-color', theme.secondary, 'important')
    document.body.style.setProperty('--background-color', theme.background, 'important')
    document.body.style.setProperty('--surface-color', theme.surface, 'important')
    document.body.style.setProperty('--text-color', theme.text, 'important')
    document.body.style.setProperty('--text-secondary-color', theme.textSecondary, 'important')
    document.body.style.setProperty('--border-color', theme.border, 'important')
    document.body.style.setProperty('--success-color', theme.success, 'important')
    document.body.style.setProperty('--warning-color', theme.warning, 'important')
    document.body.style.setProperty('--error-color', theme.error, 'important')
    document.body.style.setProperty('--info-color', theme.info, 'important')
    
    console.log('✅ Variáveis CSS do tema aplicadas com !important')
    
    // Aplicar tamanho da fonte globalmente
    document.body.style.fontSize = fontSize
    document.documentElement.style.setProperty('--base-font-size', fontSize)
    
    // Aplicar multiplicadores para diferentes tamanhos
    const multiplier = getFontMultiplier()
    document.documentElement.style.setProperty('--font-multiplier', multiplier.toString())
    
    // Aplicar classe de tema
    document.body.className = document.body.className.replace(/theme-\w+/g, '')
    document.body.classList.add(`theme-${currentTheme}`)
    
    // 🔒 SEPARAÇÃO: Aplicar reducedMotion ANTES de contraste (não pode interferir)
    if (settings.reducedMotion) {
      console.log('⏸️  Aplicando modo de movimento reduzido')
      document.body.style.setProperty('--animation-duration', '0.01s')
      document.body.style.setProperty('--transition-duration', '0.01s')
    } else {
      console.log('▶️  Removendo modo de movimento reduzido')
      document.body.style.removeProperty('--animation-duration')
      document.body.style.removeProperty('--transition-duration')
    }
    
    // 🔒 PROTEÇÃO: Aplicar configurações de contraste DEPOIS do tema
    // Isso garante que reducedMotion não afete o tema
    console.log('🔧 Aplicando configurações de contraste...')
    applyContrastSettings(settings)
    
    console.log('✅✅✅ TODAS as configurações aplicadas com SUCESSO')
    console.log('📊 Estado FINAL:', {
      currentTheme,
      temaAplicado: theme,
      classesBody: document.body.className,
      filtroBody: document.body.style.filter,
      bgColor: document.body.style.getPropertyValue('--background-color'),
      surfaceColor: document.body.style.getPropertyValue('--surface-color'),
      textColor: document.body.style.getPropertyValue('--text-color')
    })
    console.log('🌈🌈🌈 ═══════════════════════════════════════════════\n')
    
    // 🔒 GARANTIA ABSOLUTA: Disparar evento customizado para forçar atualização de componentes
    window.dispatchEvent(new CustomEvent('theme-changed', { 
      detail: { theme: currentTheme, timestamp: Date.now() } 
    }))
    console.log('📢 Evento theme-changed disparado para todos os componentes')
  }, [currentTheme, settings])

  // Funções específicas para contraste
  const setContrastLevel = (level: 'normal' | 'light' | 'dark' | 'extreme') => {
    console.log('🎚️ setContrastLevel:', level)
    updateSettings({ contrastLevel: level })
    
    // 🔒 PROTEÇÃO: Se mudando para 'normal' sem alto contraste, limpar filtros
    if (level === 'normal' && !settings.highContrast && !settings.blueLightFilter) {
      document.body.style.filter = 'none'
      console.log('✅ ContrastLevel resetado para normal - filtros removidos, tema livre')
    }
  }

  const toggleHighContrast = () => {
    const newValue = !settings.highContrast
    console.log('🎨 toggleHighContrast:', { from: settings.highContrast, to: newValue })
    
    // 🔒 PROTEÇÃO: Se desativando alto contraste, resetar contrastLevel para normal
    if (!newValue) {
      console.log('🧹 Desativando alto contraste - resetando contrastLevel para normal')
      updateSettings({ 
        highContrast: false,
        contrastLevel: 'normal'  // Resetar para normal para garantir limpeza
      })
      
      // Limpar imediatamente as classes e filtros
      document.body.classList.remove('high-contrast-active', 'high-contrast-custom')
      if (!settings.blueLightFilter) {
        document.body.style.filter = 'none'
        console.log('✅ Filtros completamente removidos - tema livre')
      }
    } else {
      updateSettings({ highContrast: true })
    }
  }

  const toggleBlueLightFilter = () => {
    const newValue = !settings.blueLightFilter
    console.log('🔵 toggleBlueLightFilter:', { from: settings.blueLightFilter, to: newValue })
    
    updateSettings({ blueLightFilter: newValue })
    
    // 🔒 PROTEÇÃO: Se desativando filtro azul E sem alto contraste, limpar filtros
    if (!newValue && !settings.highContrast && settings.contrastLevel === 'normal') {
      document.body.style.filter = 'none'
      console.log('✅ Filtro azul removido - tema livre para funcionar')
    }
  }

  const setBlueLightIntensity = (intensity: 'low' | 'medium' | 'high') => {
    updateSettings({ blueLightIntensity: intensity })
  }

  return {
    settings,
    currentTheme,
    isThemeLoaded,
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
