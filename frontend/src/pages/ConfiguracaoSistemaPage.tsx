import React, { useEffect, useMemo, useState } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { useModal } from '../hooks/useModal'

const PERFIL_BASE_KEY = 'Casamento__B'
const LETRAS_COMPARTILHADAS = new Set(['B', 'C', 'E', 'A'])

const DEFAULT_SPINE_HEIGHT_MM = 105

interface ConfiguracaoSistemaPageProps {
  onClose: () => void
}

type AbaAtiva = 'gerais' | 'bloqueio-horario' | 'impressao-livros'

interface ConfiguracoesGerais {
  senhaConfiguracao: string
  permitirAlteracoes: boolean
  autoLogoutEnabled: boolean
  autoLogoutMinutes: number
  autoLogoutWarningMinutes: number // Minutos antes de avisar
  autoLogoutWarningSeconds: number // Segundos antes de avisar (alternativa)
  autoLogoutWarningUnit: 'segundos' | 'minutos' // Unidade escolhida
  nomeOficial: string
  substitutos: string[]
}

type LayoutConfig = {
  alturaLogo: number
  alturaLetra: number
  alturaNumero: number
  alturaDatas: number
  fonteLetra: number
  fonteNumero: number
  fonteDatas: number
  larguraLogoSecao: number
  larguraLetraSecao: number
  larguraNumeroSecao: number
  larguraDatasSecao: number
  logoEscala: number
  offsetLogo: number
  offsetLetra: number
  offsetNumero: number
  offsetDatas: number
}

type PerfilOverrides = Partial<LayoutConfig>

interface ConfiguracoesImpressao {
  logoCartorio: string
  alturaLombada: number // em mm
  larguraLombada: number // em mm
  alturaLogo: number // em mm
  alturaLetra: number // em mm
  alturaNumero: number // em mm
  alturaDatas: number // em mm
  fonteLetra: number // em px
  fonteNumero: number // em px
  fonteDatas: number // em px
  larguraLogoSecao: number // em mm
  larguraLetraSecao: number // em mm
  larguraNumeroSecao: number // em mm
  larguraDatasSecao: number // em mm
  logoEscala: number // porcentagem
  offsetLogo: number // em mm
  offsetLetra: number // em mm
  offsetNumero: number // em mm
  offsetDatas: number // em mm
  perfis?: Record<string, PerfilOverrides>
}

const TEXT_SECTION_COUNT = 3
const SECTION_GAP_MM = 2.5
const TARGET_FONT_PX = 20
const DEFAULT_SPINE_HEIGHT_MM = 105
const DEFAULT_SPINE_WIDTH_MM = 55
const DEFAULT_LOGO_HEIGHT_MM = 50
const DEFAULT_LOGO_WIDTH_MM = 28
const DEFAULT_TEXT_HEIGHT_MM = Number(
  ((DEFAULT_SPINE_HEIGHT_MM - DEFAULT_LOGO_HEIGHT_MM - SECTION_GAP_MM * TEXT_SECTION_COUNT) / TEXT_SECTION_COUNT).toFixed(2)
)
const DEFAULT_TEXT_WIDTH_MM = Number(
  ((DEFAULT_SPINE_WIDTH_MM - DEFAULT_LOGO_WIDTH_MM) / TEXT_SECTION_COUNT).toFixed(2)
)

const tipoParaLetras: Record<string, string[]> = {
  'Casamento': ['B', 'B-AUX'],
  'Óbito': ['C', 'C-AUX'],
  'Nascimento': ['A'],
  'Livro E': ['E'],
  'Edital de Proclamas': ['D'],
  'Remissivo': ['Livro Transporte']
}

const criarLayoutAPartirConfig = (config: ConfiguracoesImpressao): LayoutConfig => ({
  alturaLogo: config.alturaLogo,
  alturaLetra: config.alturaLetra,
  alturaNumero: config.alturaNumero,
  alturaDatas: config.alturaDatas,
  fonteLetra: config.fonteLetra,
  fonteNumero: config.fonteNumero,
  fonteDatas: config.fonteDatas,
  larguraLogoSecao: config.larguraLogoSecao,
  larguraLetraSecao: config.larguraLetraSecao,
  larguraNumeroSecao: config.larguraNumeroSecao,
  larguraDatasSecao: config.larguraDatasSecao,
  logoEscala: config.logoEscala,
  offsetLogo: config.offsetLogo,
  offsetLetra: config.offsetLetra,
  offsetNumero: config.offsetNumero,
  offsetDatas: config.offsetDatas,
  bordaAtiva: config.bordaAtiva
})

interface BloqueioHorario {
  habilitado: boolean
  horarioInicio: string
  horarioFim: string
  tempoExtraPermitido: number // em minutos
  mensagemBloqueio: string
}

interface DadosEmpresa {
  nome: string
  cnpj: string
  endereco: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
  cep: string
  telefone: string
  celular: string
  email: string
  site: string
}

export function ConfiguracaoSistemaPage({ onClose }: ConfiguracaoSistemaPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const modal = useModal()
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
  
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('gerais')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  
  // Estados para Configurações Gerais
  const [configGerais, setConfigGerais] = useState<ConfiguracoesGerais>(() => {
    const saved = localStorage.getItem('config-gerais-sistema')
    
    // Se há configuração salva, usa ela
    if (saved) {
      return JSON.parse(saved)
    }
    
    // Carregar auto-logout do accessibility-settings
    const accessibilitySettings = localStorage.getItem('accessibility-settings')
    let autoLogoutEnabled = false
    let autoLogoutMinutes = 15
    
    if (accessibilitySettings) {
      try {
        const settings = JSON.parse(accessibilitySettings)
        autoLogoutEnabled = settings.autoLogoutEnabled || false
        autoLogoutMinutes = settings.autoLogoutMinutes || 15
      } catch (error) {
        console.error('❌ Erro ao carregar auto-logout:', error)
      }
    }
    
    return {
      senhaConfiguracao: '',
      permitirAlteracoes: true,
      autoLogoutEnabled,
      autoLogoutMinutes,
      autoLogoutWarningMinutes: 2, // Padrão: avisar 2 minutos antes
      autoLogoutWarningSeconds: 30, // Padrão: 30 segundos
      autoLogoutWarningUnit: 'minutos', // Padrão: minutos
      nomeOficial: '',
      substitutos: ['']
    }
  })
  
  // Estados para Bloqueio por Horário
  const [configBloqueio, setConfigBloqueio] = useState<BloqueioHorario>(() => {
    const saved = localStorage.getItem('config-bloqueio-horario')
    if (saved) {
      return JSON.parse(saved)
    }
    return {
      habilitado: false,
      horarioInicio: '08:00',
      horarioFim: '18:00',
      tempoExtraPermitido: 60, // 1 hora
      mensagemBloqueio: 'Sistema bloqueado fora do horário de funcionamento.'
    }
  })

  // Estados para Dados da Empresa
  const [dadosEmpresa, setDadosEmpresa] = useState<DadosEmpresa>(() => {
    const saved = localStorage.getItem('dados-empresa')
    if (saved) {
      return JSON.parse(saved)
    }
    return {
      nome: '',
      cnpj: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: '',
      telefone: '',
      celular: '',
      email: '',
      site: ''
    }
  })
  
  // Estados para Configurações de Impressão
  const [configImpressao, setConfigImpressao] = useState<ConfiguracoesImpressao>(() => {
    const saved = localStorage.getItem('config-impressao-livros')
    if (saved) {
      const config = JSON.parse(saved)
      // Adicionar valores padrão se não existirem
      return {
        logoCartorio: config.logoCartorio || '',
        alturaLombada: config.alturaLombada ?? DEFAULT_SPINE_HEIGHT_MM,
        larguraLombada: config.larguraLombada ?? DEFAULT_SPINE_WIDTH_MM,
        alturaLogo: config.alturaLogo ?? DEFAULT_LOGO_HEIGHT_MM,
        alturaLetra: config.alturaLetra ?? DEFAULT_TEXT_HEIGHT_MM,
        alturaNumero: config.alturaNumero ?? DEFAULT_TEXT_HEIGHT_MM,
        alturaDatas: config.alturaDatas ?? DEFAULT_TEXT_HEIGHT_MM,
        fonteLetra: config.fonteLetra ?? TARGET_FONT_PX,
        fonteNumero: config.fonteNumero ?? TARGET_FONT_PX,
        fonteDatas: config.fonteDatas ?? TARGET_FONT_PX,
        larguraLogoSecao: config.larguraLogoSecao ?? DEFAULT_LOGO_WIDTH_MM,
        larguraLetraSecao: config.larguraLetraSecao ?? DEFAULT_TEXT_WIDTH_MM,
        larguraNumeroSecao: config.larguraNumeroSecao ?? DEFAULT_TEXT_WIDTH_MM,
        larguraDatasSecao: config.larguraDatasSecao ?? DEFAULT_TEXT_WIDTH_MM,
        logoEscala: config.logoEscala ?? 100,
        offsetLogo: config.offsetLogo ?? 0,
        offsetLetra: config.offsetLetra ?? 0,
        offsetNumero: config.offsetNumero ?? 0,
        offsetDatas: config.offsetDatas ?? 0,
        bordaAtiva: config.bordaAtiva ?? true,
        bordaQuadrada: config.bordaQuadrada ?? false,
        perfis: config.perfis ?? {}
      }
    }
    return {
      logoCartorio: '',
      alturaLombada: DEFAULT_SPINE_HEIGHT_MM,
      larguraLombada: DEFAULT_SPINE_WIDTH_MM,
      alturaLogo: DEFAULT_LOGO_HEIGHT_MM,
      alturaLetra: DEFAULT_TEXT_HEIGHT_MM,
      alturaNumero: DEFAULT_TEXT_HEIGHT_MM,
      alturaDatas: DEFAULT_TEXT_HEIGHT_MM,
      fonteLetra: TARGET_FONT_PX,
      fonteNumero: TARGET_FONT_PX,
      fonteDatas: TARGET_FONT_PX,
      larguraLogoSecao: DEFAULT_LOGO_WIDTH_MM,
      larguraLetraSecao: DEFAULT_TEXT_WIDTH_MM,
      larguraNumeroSecao: DEFAULT_TEXT_WIDTH_MM,
      larguraDatasSecao: DEFAULT_TEXT_WIDTH_MM,
      logoEscala: 100,
      offsetLogo: 0,
      offsetLetra: 0,
      offsetNumero: 0,
      offsetDatas: 0,
      bordaAtiva: true,
      perfis: {},
      bordaQuadrada: false
    }
  })

  const tiposLivro = Object.keys(tipoParaLetras)
  const [perfilTipo, setPerfilTipo] = useState<string>(tiposLivro[0])
  const [perfilLetra, setPerfilLetra] = useState<string>(tipoParaLetras[tiposLivro[0]][0])

  useEffect(() => {
    const letras = tipoParaLetras[perfilTipo] || []
    if (letras.length === 0) {
      setPerfilLetra('')
      return
    }
    if (!letras.includes(perfilLetra)) {
      setPerfilLetra(letras[0])
    }
  }, [perfilTipo, perfilLetra])

  const perfilKey = `${perfilTipo}__${perfilLetra}`
  const baseLayout = criarLayoutAPartirConfig(configImpressao)
  const obterOverridesPerfil = (tipo: string, letra: string): PerfilOverrides => {
    const key = `${tipo}__${letra}`
    const overridesDiretos = configImpressao.perfis?.[key]
    if (overridesDiretos) {
      return overridesDiretos
    }
    if (LETRAS_COMPARTILHADAS.has(letra)) {
      return configImpressao.perfis?.[PERFIL_BASE_KEY] ?? {}
    }
    return {}
  }
  const perfilOverrides: PerfilOverrides = obterOverridesPerfil(perfilTipo, perfilLetra)
  const letrasDisponiveisPerfil = tipoParaLetras[perfilTipo] || []
  const perfilPersonalizadoAtivo = !!configImpressao.perfis?.[perfilKey]

  const obterValorPerfil = <K extends keyof LayoutConfig>(campo: K): LayoutConfig[K] =>
    (perfilOverrides[campo] as LayoutConfig[K]) ?? baseLayout[campo]

  const atualizarPerfil = <K extends keyof LayoutConfig>(campo: K, valor: LayoutConfig[K]) => {
    setConfigImpressao((prev) => {
      const perfisAtuais = prev.perfis ?? {}
      const base = criarLayoutAPartirConfig(prev)
      const overridesAtuais: PerfilOverrides = perfisAtuais[perfilKey] ?? {}
      const novoOverrides: PerfilOverrides = { ...overridesAtuais, [campo]: valor }

      if (novoOverrides[campo] === base[campo]) {
        delete novoOverrides[campo]
      }

      const perfisAtualizados: Record<string, PerfilOverrides> = { ...perfisAtuais }
      if (Object.keys(novoOverrides).length > 0) {
        perfisAtualizados[perfilKey] = novoOverrides
      } else {
        delete perfisAtualizados[perfilKey]
      }

      return {
        ...prev,
        perfis: perfisAtualizados
      }
    })
  }

  const removerPerfil = () => {
    setConfigImpressao((prev) => {
      if (!prev.perfis || !prev.perfis[perfilKey]) {
        return prev
      }
      const { [perfilKey]: _, ...restantes } = prev.perfis
      return { ...prev, perfis: restantes }
    })
  }

  const [horarioAtual, setHorarioAtual] = useState(new Date())
  const [buscandoCep, setBuscandoCep] = useState(false)
  
  // Atualizar horário a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setHorarioAtual(new Date())
    }, 60000)
    
    return () => clearInterval(timer)
  }, [])
  
  // Helper para criar estilos consistentes dos cards de logout
  const getCardStyle = (isSelected: boolean) => ({
    padding: '10px 8px',
    border: `2px solid ${isSelected ? headerColor : theme.border}`,
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: isSelected 
      ? (currentTheme === 'dark' ? 'rgba(255, 140, 0, 0.1)' : 'rgba(0, 128, 128, 0.05)')
      : theme.surface,
    transition: 'all 0.2s ease',
    textAlign: 'center' as const,
    boxShadow: isSelected 
      ? '0 2px 4px rgba(0, 0, 0, 0.08)' 
      : '0 1px 2px rgba(0, 0, 0, 0.05)',
    transform: isSelected ? 'translateY(-1px)' : 'translateY(0)'
  })
  
  const getCardHoverHandlers = (isSelected: boolean) => ({
    onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isSelected) {
        e.currentTarget.style.borderColor = headerColor
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)'
      } else {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.12)'
      }
    },
    onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isSelected) {
        e.currentTarget.style.borderColor = theme.border
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
      } else {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.08)'
      }
    }
  })
  
  // Verificar se está no horário permitido
  const verificarHorario = () => {
    if (!configBloqueio.habilitado) return true
    
    const agora = new Date()
    const [horaInicio, minInicio] = configBloqueio.horarioInicio.split(':').map(Number)
    const [horaFim, minFim] = configBloqueio.horarioFim.split(':').map(Number)
    
    const inicioComExtra = new Date()
    inicioComExtra.setHours(horaInicio, minInicio - configBloqueio.tempoExtraPermitido, 0, 0)
    
    const fimComExtra = new Date()
    fimComExtra.setHours(horaFim, minFim + configBloqueio.tempoExtraPermitido, 0, 0)
    
    return agora >= inicioComExtra && agora <= fimComExtra
  }
  
  const buscarEnderecoPorCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '')
    
    if (cepLimpo.length !== 8) return
    
    setBuscandoCep(true)
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()
      
      if (!data.erro) {
        setDadosEmpresa({
          ...dadosEmpresa,
          cep: cep,
          endereco: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          uf: data.uf || ''
        })
        
        modal.showSuccess('CEP encontrado! Dados preenchidos automaticamente.')
      } else {
        modal.showError('CEP não encontrado.')
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      modal.showError('Erro ao buscar CEP. Verifique sua conexão.')
    } finally {
      setBuscandoCep(false)
    }
  }
  
  const salvarConfigGerais = async () => {
    console.log('🔵 FUNÇÃO salvarConfigGerais INICIADA!')
    console.log('📊 Estado atual de configGerais:', configGerais)
    console.log('👤 Oficial:', configGerais.nomeOficial)
    console.log('👥 Substitutos:', configGerais.substitutos)
    
    try {
      // Salvar configurações gerais
      localStorage.setItem('config-gerais-sistema', JSON.stringify(configGerais))
      console.log('✅ Salvo em localStorage: config-gerais-sistema')
      console.log('💾 Dados salvos:', JSON.parse(localStorage.getItem('config-gerais-sistema') || '{}'))
      
      // Salvar dados da empresa
      localStorage.setItem('dados-empresa', JSON.stringify(dadosEmpresa))
      console.log('✅ Dados da empresa salvos')
      
      // Sincronizar com configurações de acessibilidade (auto-logout)
      const accessibilitySettings = localStorage.getItem('accessibility-settings')
      if (accessibilitySettings) {
        try {
          const settings = JSON.parse(accessibilitySettings)
          settings.autoLogoutEnabled = configGerais.autoLogoutEnabled
          settings.autoLogoutMinutes = configGerais.autoLogoutMinutes
          localStorage.setItem('accessibility-settings', JSON.stringify(settings))
          
          // Disparar evento para atualizar o useAccessibility (MESMO NOME QUE O HOOK USA!)
          window.dispatchEvent(new CustomEvent('accessibility-settings-changed', {
            detail: settings
          }))
          
          console.log('✅ Configurações de auto-logout sincronizadas e evento disparado:', {
            enabled: configGerais.autoLogoutEnabled,
            minutes: configGerais.autoLogoutMinutes
          })
        } catch (error) {
          console.error('❌ Erro ao sincronizar auto-logout:', error)
        }
      } else {
        // Se não existe, criar as configurações de acessibilidade
        const newSettings = {
          highContrast: false,
          contrastLevel: 'normal',
          blueLightFilter: false,
          blueLightIntensity: 'medium',
          reducedMotion: false,
          fontSize: 'padrao',
          screenReader: false,
          keyboardNavigation: false,
          autoLogoutEnabled: configGerais.autoLogoutEnabled,
          autoLogoutMinutes: configGerais.autoLogoutMinutes,
          speechRate: 1.3,
          speechPitch: 1.1,
          hoverDelay: 300
        }
        localStorage.setItem('accessibility-settings', JSON.stringify(newSettings))
        window.dispatchEvent(new CustomEvent('accessibility-settings-changed', {
          detail: newSettings
        }))
        console.log('✅ Configurações de acessibilidade criadas!')
      }
      
      // Disparar evento global para sincronizar
      window.dispatchEvent(new CustomEvent('config-gerais-updated'))
      console.log('✅ Evento config-gerais-updated disparado')
      
      // Preparar mensagem com os dados salvos
      let mensagem = `✅ Configurações salvas com sucesso!\n\n`
      
      // Adicionar informações do oficial e substitutos
      if (configGerais.nomeOficial) {
        mensagem += `👤 Oficial: ${configGerais.nomeOficial}\n`
      }
      if (configGerais.substitutos.some(s => s.trim() !== '')) {
        const substitutosPreenchidos = configGerais.substitutos.filter(s => s.trim() !== '')
        mensagem += `👥 Substitutos: ${substitutosPreenchidos.length}\n`
        substitutosPreenchidos.forEach((sub, i) => {
          mensagem += `   ${i + 1}. ${sub}\n`
        })
        mensagem += '\n'
      }
      
      mensagem += `Auto-Logout: ${configGerais.autoLogoutEnabled ? 'ATIVADO ✅' : 'DESATIVADO ❌'}\n` +
        `Tempo: ${configGerais.autoLogoutMinutes} minutos\n` +
        `Aviso: ${configGerais.autoLogoutWarningUnit === 'segundos' ? configGerais.autoLogoutWarningSeconds + 's' : configGerais.autoLogoutWarningMinutes + 'min'}\n\n` +
        `${configGerais.autoLogoutEnabled ? '⏰ O timer começará após qualquer atividade!\n\nPara testar: Não toque no mouse/teclado e aguarde.' : 'O logout automático está desativado.'}`
      
      await modal.alert(
        mensagem,
        'Configurações Salvas', 
        '✅'
      )
      
      console.log('🟢 SALVAMENTO CONCLUÍDO COM SUCESSO!')
    } catch (error) {
      console.error('❌ ERRO AO SALVAR:', error)
      await modal.alert(
        `❌ Erro ao salvar configurações:\n\n${error}`,
        'Erro',
        '❌'
      )
    }
  }
  
  const salvarConfigBloqueio = async () => {
    localStorage.setItem('config-bloqueio-horario', JSON.stringify(configBloqueio))
    await modal.alert('✅ Configuração de bloqueio salva com sucesso!', 'Sucesso', '✅')
  }
  
  const labelStyles = {
    fontSize: '13px',
    fontWeight: '600' as const,
    marginBottom: '6px',
    color: theme.text,
    display: 'block'
  }
  
  const inputStyles = {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    backgroundColor: theme.background,
    color: theme.text,
    outline: 'none',
    boxSizing: 'border-box' as const
  }
  
  const layoutCardStyle: React.CSSProperties = {
    marginTop: '20px',
    padding: '20px',
    border: `1px solid ${theme.border}`,
    borderRadius: '10px',
    backgroundColor: theme.surface,
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    width: '100%',
    boxSizing: 'border-box'
  }

  const layoutSectionTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '15px',
    fontWeight: 600,
    color: theme.text,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }

  const layoutSubHeaderStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '13px',
    fontWeight: 600,
    color: theme.text,
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }

  const layoutSubSectionStyle: React.CSSProperties = {
    padding: '16px',
    border: `1px dashed ${theme.border}`,
    borderRadius: '8px',
    backgroundColor: theme.background,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    boxSizing: 'border-box'
  }

  const buttonStyles = {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600' as const,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }

  return (
    <>
      <BasePage
        title="Configurações do Sistema"
        onClose={onClose}
        width="900px"
        height="600px"
        minWidth="900px"
        minHeight="600px"
        resizable={false}
        headerColor={headerColor}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden'
        }}>
          {/* Abas */}
          <div style={{
            display: 'flex',
            gap: '0',
            borderBottom: `2px solid ${theme.border}`,
            backgroundColor: theme.surface
          }}>
            <button
              onClick={() => setAbaAtiva('gerais')}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                borderBottom: abaAtiva === 'gerais' ? `3px solid ${headerColor}` : '3px solid transparent',
                backgroundColor: abaAtiva === 'gerais' ? (currentTheme === 'dark' ? '#2a2a2a' : '#f0f0f0') : 'transparent',
                color: abaAtiva === 'gerais' ? headerColor : theme.text,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              ⚙️ Configurações Gerais
            </button>
            <button
              onClick={() => setAbaAtiva('bloqueio-horario')}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                borderBottom: abaAtiva === 'bloqueio-horario' ? `3px solid ${headerColor}` : '3px solid transparent',
                backgroundColor: abaAtiva === 'bloqueio-horario' ? (currentTheme === 'dark' ? '#2a2a2a' : '#f0f0f0') : 'transparent',
                color: abaAtiva === 'bloqueio-horario' ? headerColor : theme.text,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
                gap: '8px'
              }}
            >
              🕐 Bloqueio por Horário
            </button>
            <button
              onClick={() => setAbaAtiva('impressao-livros')}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                borderBottom: abaAtiva === 'impressao-livros' ? `3px solid ${headerColor}` : '3px solid transparent',
                backgroundColor: abaAtiva === 'impressao-livros' ? (currentTheme === 'dark' ? '#2a2a2a' : '#f0f0f0') : 'transparent',
                color: abaAtiva === 'impressao-livros' ? headerColor : theme.text,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
                gap: '8px'
              }}
            >
              🖨️ Impressão de Livros
            </button>
          </div>

          {/* Conteúdo das Abas */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            backgroundColor: theme.background
          }}>
            {/* ABA: Configurações Gerais */}
            {abaAtiva === 'gerais' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Seção: Oficial e Substitutos */}
                <div style={{
                  padding: '16px',
                  border: `2px solid ${theme.border}`,
                  borderRadius: '8px',
                  backgroundColor: theme.surface
                }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: theme.text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    👤 Oficial e Substitutos
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Nome do Oficial */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: theme.textSecondary,
                        marginBottom: '8px'
                      }}>
                        Nome do Oficial
                      </label>
                      <input
                        type="text"
                        value={configGerais.nomeOficial}
                        onChange={(e) => setConfigGerais({ ...configGerais, nomeOficial: e.target.value })}
                        placeholder="Digite o nome do oficial do cartório"
                        style={{
                          width: '100%',
                          padding: '10px',
                          fontSize: '14px',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '4px',
                          backgroundColor: theme.background,
                          color: theme.text,
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Substitutos */}
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <label style={{
                          fontSize: '13px',
                          fontWeight: '500',
                          color: theme.textSecondary
                        }}>
                          Substitutos
                        </label>
                        <button
                          onClick={() => {
                            const novosSubstitutos = [...configGerais.substitutos, '']
                            setConfigGerais({ ...configGerais, substitutos: novosSubstitutos })
                          }}
                          style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            fontWeight: '600',
                            backgroundColor: headerColor,
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'opacity 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          ➕ Adicionar Substituto
                        </button>
                      </div>

                      {configGerais.substitutos.map((substituto, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          <input
                            type="text"
                            value={substituto}
                            onChange={(e) => {
                              const novosSubstitutos = [...configGerais.substitutos]
                              novosSubstitutos[index] = e.target.value
                              setConfigGerais({ ...configGerais, substitutos: novosSubstitutos })
                            }}
                            placeholder={`Nome do substituto ${index + 1}`}
                            style={{
                              flex: 1,
                              padding: '10px',
                              fontSize: '14px',
                              border: `1px solid ${theme.border}`,
                              borderRadius: '4px',
                              backgroundColor: theme.background,
                              color: theme.text,
                              outline: 'none'
                            }}
                          />
                          {configGerais.substitutos.length > 1 && (
                            <button
                              onClick={() => {
                                const novosSubstitutos = configGerais.substitutos.filter((_, i) => i !== index)
                                setConfigGerais({ ...configGerais, substitutos: novosSubstitutos })
                              }}
                              style={{
                                padding: '10px 16px',
                                fontSize: '14px',
                                backgroundColor: '#ef4444',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'opacity 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Seção: Segurança de Configurações */}
                <div style={{
                  padding: '16px',
                  border: `2px solid ${theme.border}`,
                  borderRadius: '8px',
                  backgroundColor: theme.surface
                }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
    fontSize: '16px',
                    fontWeight: 'bold',
                    color: theme.text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🔒 Segurança de Configurações
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={labelStyles}>
                        Senha de Proteção de Configurações
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type={mostrarSenha ? 'text' : 'password'}
                          value={configGerais.senhaConfiguracao}
                          onChange={(e) => setConfigGerais({ ...configGerais, senhaConfiguracao: e.target.value })}
                          placeholder="Digite uma senha para proteger configurações"
                          style={inputStyles}
                        />
        <button
                          onClick={() => setMostrarSenha(!mostrarSenha)}
                          style={{
                            ...buttonStyles,
                            backgroundColor: theme.surface,
                            border: `1px solid ${theme.border}`,
                            color: theme.text,
                            minWidth: '100px'
                          }}
                        >
                          {mostrarSenha ? '🙈 Ocultar' : '👁️ Mostrar'}
                        </button>
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: theme.textSecondary,
                        marginTop: '4px'
                      }}>
                        ℹ️ Quando definida, será solicitada para acessar configurações sensíveis
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={configGerais.permitirAlteracoes}
                          onChange={(e) => setConfigGerais({ ...configGerais, permitirAlteracoes: e.target.checked })}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer'
                          }}
                        />
                        <span style={{ fontSize: '14px', color: theme.text }}>
                          Permitir alterações de configurações sem senha
                        </span>
                      </label>
                    </div>
                    
                    {/* Logout Automático - Cards Selecionáveis */}
                    <div style={{
                      marginTop: '8px',
                      paddingTop: '16px',
                      borderTop: `1px solid ${theme.border}`
                    }}>
                      {/* Header com Toggle */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px'
                      }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: theme.text, marginBottom: '4px' }}>
                            ⏱️ Logout Automático
                          </div>
                          <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                            {configGerais.autoLogoutEnabled 
                              ? `Sistema desconecta após ${configGerais.autoLogoutMinutes} minuto${configGerais.autoLogoutMinutes !== 1 ? 's' : ''} de inatividade`
                              : 'Logout automático desativado'
                            }
                          </div>
                        </div>
                        
                        {/* Toggle Switch */}
                        <label style={{
                          position: 'relative',
                          display: 'inline-block',
                          width: '56px',
                          height: '28px',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="checkbox"
                            checked={configGerais.autoLogoutEnabled}
                            onChange={(e) => {
                              const novoEstado = e.target.checked
                              setConfigGerais({ 
                                ...configGerais, 
                                autoLogoutEnabled: novoEstado,
                                autoLogoutMinutes: novoEstado ? (configGerais.autoLogoutMinutes || 30) : configGerais.autoLogoutMinutes
                              })
                            }}
                            style={{ opacity: 0, width: 0, height: 0 }}
                          />
                          <span style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: configGerais.autoLogoutEnabled ? headerColor : '#d1d5db',
                            borderRadius: '28px',
                            transition: 'all 0.2s ease'
                          }}>
                            <span style={{
                              position: 'absolute',
                              height: '22px',
                              width: '22px',
                              left: configGerais.autoLogoutEnabled ? '30px' : '3px',
                              bottom: '3px',
                              backgroundColor: 'white',
                              borderRadius: '50%',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }} />
                          </span>
                        </label>
                      </div>

                      {/* Grid de Cards - Só aparece quando ativado */}
                      {configGerais.autoLogoutEnabled && (
                        <>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '10px'
                        }}>
                        {/* Card: 15 minutos */}
                        <div
                          onClick={() => setConfigGerais({ ...configGerais, autoLogoutEnabled: true, autoLogoutMinutes: 15 })}
                          style={getCardStyle(configGerais.autoLogoutEnabled && configGerais.autoLogoutMinutes === 15)}
                          {...getCardHoverHandlers(configGerais.autoLogoutEnabled && configGerais.autoLogoutMinutes === 15)}
                        >
                          <div style={{ fontSize: '24px', marginBottom: '4px' }}>⚡</div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: theme.text, marginBottom: '2px' }}>
                            15 min
                          </div>
                          <div style={{ fontSize: '11px', color: theme.textSecondary, lineHeight: '1.2' }}>
                            Segurança alta
                          </div>
                        </div>

                        {/* Card: 30 minutos */}
                        <div
                          onClick={() => setConfigGerais({ ...configGerais, autoLogoutEnabled: true, autoLogoutMinutes: 30 })}
                          style={getCardStyle(configGerais.autoLogoutEnabled && configGerais.autoLogoutMinutes === 30)}
                          {...getCardHoverHandlers(configGerais.autoLogoutEnabled && configGerais.autoLogoutMinutes === 30)}
                        >
                          <div style={{ fontSize: '24px', marginBottom: '4px' }}>🔒</div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: theme.text, marginBottom: '2px' }}>
                            30 min
                          </div>
                          <div style={{ fontSize: '11px', color: theme.textSecondary, lineHeight: '1.2' }}>
                            Recomendado
                          </div>
                        </div>

                        {/* Card: 1 hora */}
                        <div
                          onClick={() => setConfigGerais({ ...configGerais, autoLogoutEnabled: true, autoLogoutMinutes: 60 })}
                          style={getCardStyle(configGerais.autoLogoutEnabled && configGerais.autoLogoutMinutes === 60)}
                          {...getCardHoverHandlers(configGerais.autoLogoutEnabled && configGerais.autoLogoutMinutes === 60)}
                        >
                          <div style={{ fontSize: '24px', marginBottom: '4px' }}>⏰</div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: theme.text, marginBottom: '2px' }}>
                            1 hora
                          </div>
                          <div style={{ fontSize: '11px', color: theme.textSecondary, lineHeight: '1.2' }}>
                            Balanceado
                          </div>
                        </div>

                        {/* Card: 2 horas */}
                        <div
                          onClick={() => setConfigGerais({ ...configGerais, autoLogoutEnabled: true, autoLogoutMinutes: 120 })}
                          style={getCardStyle(configGerais.autoLogoutEnabled && configGerais.autoLogoutMinutes === 120)}
                          {...getCardHoverHandlers(configGerais.autoLogoutEnabled && configGerais.autoLogoutMinutes === 120)}
                        >
                          <div style={{ fontSize: '24px', marginBottom: '4px' }}>⌛</div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: theme.text, marginBottom: '2px' }}>
                            2 horas
                          </div>
                          <div style={{ fontSize: '11px', color: theme.textSecondary, lineHeight: '1.2' }}>
                            Relaxado
                          </div>
                        </div>

                        {/* Card: Personalizado */}
                        <div
                          onClick={() => {
                            // Ativa o Personalizado mantendo o valor atual ou usando um padrão
                            const valorAtual = configGerais.autoLogoutMinutes
                            const isPersonalizado = ![15, 30, 60, 120].includes(valorAtual)
                            setConfigGerais({ 
                              ...configGerais, 
                              autoLogoutEnabled: true,
                              autoLogoutMinutes: isPersonalizado ? valorAtual : 45 // Usa 45 min como padrão
                            })
                          }}
                          style={{
                            ...getCardStyle(configGerais.autoLogoutEnabled && ![15, 30, 60, 120].includes(configGerais.autoLogoutMinutes)),
                            cursor: 'pointer'
                          }}
                          {...getCardHoverHandlers(configGerais.autoLogoutEnabled && ![15, 30, 60, 120].includes(configGerais.autoLogoutMinutes))}
                        >
                          <div style={{ fontSize: '24px', marginBottom: '4px' }}>✏️</div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: theme.text, marginBottom: '4px' }}>
                            Personalizado
                          </div>
                          <div 
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="number"
                              min="1"
                              max="1440"
                              value={configGerais.autoLogoutMinutes}
                              onChange={(e) => {
                                const valor = parseInt(e.target.value) || 1
                                setConfigGerais({ 
                                  ...configGerais, 
                                  autoLogoutEnabled: true,
                                  autoLogoutMinutes: Math.max(1, Math.min(1440, valor))
                                })
                              }}
                              style={{
                                width: '60px',
                                padding: '4px 8px',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '4px',
                                backgroundColor: theme.background,
                                color: theme.text,
                                fontSize: '13px',
                                textAlign: 'center',
                                fontWeight: 'bold'
                              }}
                            />
                            <span style={{ fontSize: '11px', color: theme.textSecondary }}>min</span>
                          </div>
                          <div style={{ fontSize: '10px', color: theme.textSecondary, marginTop: '6px' }}>
                            1 a 1440 min
                          </div>
                          </div>
                        </div>

                        {/* Configuração de Aviso - Aparece quando logout automático está ativo */}
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          backgroundColor: theme.surface,
                          border: `2px solid ${theme.border}`,
                          borderRadius: '8px'
                        }}>
                          <div style={{ marginBottom: '10px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: theme.text, marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              ⚠️ Aviso de Desconexão
                            </div>
                            <div style={{ fontSize: '10px', color: theme.textSecondary }}>
                              Escolha quanto tempo antes do logout o sistema deve avisar
                            </div>
      </div>

                          {/* Opções de aviso em cards menores */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '0.7fr 0.7fr 0.7fr 1.9fr',
                            gap: '6px',
                            marginBottom: '12px'
                          }}>
                            {/* Cards fixos: 1, 2, 3 min */}
                            {[1, 2, 3].map((minutos) => {
                              const isSelected = configGerais.autoLogoutWarningMinutes === minutos && configGerais.autoLogoutWarningUnit === 'minutos'
                              return (
                                <div
                                  key={minutos}
                                  onClick={() => setConfigGerais({ 
                                    ...configGerais, 
                                    autoLogoutWarningMinutes: minutos,
                                    autoLogoutWarningUnit: 'minutos'
                                  })}
                                  style={{
                                    padding: '8px 4px',
                                    border: `2px solid ${isSelected ? headerColor : theme.border}`,
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    backgroundColor: isSelected
                                      ? (currentTheme === 'dark' ? 'rgba(255, 140, 0, 0.12)' : 'rgba(0, 128, 128, 0.08)')
                                      : theme.surface,
                                    transition: 'all 0.2s ease',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    boxShadow: isSelected
                                      ? '0 2px 4px rgba(0, 0, 0, 0.1)'
                                      : 'none',
                                    minHeight: '60px'
                                  }}
          onMouseEnter={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.borderColor = headerColor
                                      e.currentTarget.style.backgroundColor = currentTheme === 'dark' ? 'rgba(255, 140, 0, 0.06)' : 'rgba(0, 128, 128, 0.04)'
                                      e.currentTarget.style.transform = 'translateY(-1px)'
                                    }
          }}
          onMouseLeave={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.borderColor = theme.border
                                      e.currentTarget.style.backgroundColor = theme.surface
                                      e.currentTarget.style.transform = 'translateY(0)'
                                    }
                                  }}
                                >
                                  {/* Ícone de Relógio */}
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <circle
                                      cx="12"
                                      cy="12"
                                      r="9"
                                      stroke={isSelected ? headerColor : theme.textSecondary}
                                      strokeWidth="2"
                                      fill="none"
                                    />
                                    <path
                                      d="M12 7V12L15 15"
                                      stroke={isSelected ? headerColor : theme.textSecondary}
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                  <div style={{ fontSize: '13px', fontWeight: isSelected ? '700' : '600', color: theme.text }}>
                                    {minutos} min
                                  </div>
      </div>
                              )
                            })}
                            
                            {/* Card: Personalizado com toggle segundos/minutos */}
                            {(() => {
                              const isPersonalizado = (![1, 2, 3].includes(configGerais.autoLogoutWarningMinutes) && configGerais.autoLogoutWarningUnit === 'minutos') || configGerais.autoLogoutWarningUnit === 'segundos'
                              return (
                                <div
                                  onClick={() => {
                                    // Ativa o Personalizado com valores padrão se necessário
                                    if (!isPersonalizado) {
                                      setConfigGerais({ 
                                        ...configGerais, 
                                        autoLogoutWarningUnit: 'minutos',
                                        autoLogoutWarningMinutes: 5 // Padrão: 5 min
                                      })
                                    }
                                  }}
                                  style={{
                                    padding: '8px 12px',
                                    border: `2px solid ${isPersonalizado ? headerColor : theme.border}`,
                                    borderRadius: '6px',
                                    backgroundColor: isPersonalizado
                                      ? (currentTheme === 'dark' ? 'rgba(255, 140, 0, 0.12)' : 'rgba(0, 128, 128, 0.08)')
                                      : theme.surface,
                                    transition: 'all 0.2s ease',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    boxShadow: isPersonalizado
                                      ? '0 2px 4px rgba(0, 0, 0, 0.1)'
                                      : 'none',
                                    minHeight: '60px'
                                  }}
            onMouseEnter={(e) => {
                                    if (!isPersonalizado) {
                                      e.currentTarget.style.borderColor = headerColor
                                      e.currentTarget.style.backgroundColor = currentTheme === 'dark' ? 'rgba(255, 140, 0, 0.06)' : 'rgba(0, 128, 128, 0.04)'
                                      e.currentTarget.style.transform = 'translateY(-1px)'
                                    }
            }}
            onMouseLeave={(e) => {
                                    if (!isPersonalizado) {
                                      e.currentTarget.style.borderColor = theme.border
                                      e.currentTarget.style.backgroundColor = theme.surface
                                      e.currentTarget.style.transform = 'translateY(0)'
                                    }
                                  }}
                                >
                                  {/* Seção Esquerda: Ícone e Título */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <circle
                                        cx="12"
                                        cy="12"
                                        r="3"
                                        stroke={isPersonalizado ? headerColor : theme.textSecondary}
                                        strokeWidth="1.5"
                                        fill="none"
                                      />
                                      <path
                                        d="M12 1V3M12 21V23M23 12H21M3 12H1M19.778 4.222L18.364 5.636M5.636 18.364L4.222 19.778M19.778 19.778L18.364 18.364M5.636 5.636L4.222 4.222"
                                        stroke={isPersonalizado ? headerColor : theme.textSecondary}
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: theme.text }}>
                                      Personalizado
                                    </div>
                                  </div>

                                  {/* Seção Direita: Controles */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                                    {/* Toggle Segundos/Minutos */}
                                    <div 
                                      style={{ 
                                        display: 'flex', 
                                        gap: '1px',
                                        backgroundColor: theme.background,
                                        padding: '1px',
                                        borderRadius: '2px',
                                        border: `1px solid ${theme.border}`
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setConfigGerais({ ...configGerais, autoLogoutWarningUnit: 'segundos', autoLogoutWarningSeconds: 30 })
                                  }}
                                  style={{
                                    padding: '2px 5px',
                                    fontSize: '9px',
                                    fontWeight: '700',
                                    border: 'none',
                                    borderRadius: '2px',
                                    cursor: 'pointer',
                                    backgroundColor: configGerais.autoLogoutWarningUnit === 'segundos' ? headerColor : 'transparent',
                                    color: configGerais.autoLogoutWarningUnit === 'segundos' ? '#fff' : theme.textSecondary,
                                    transition: 'all 0.15s',
                                    flex: 1
                                  }}
                                >
                                  seg
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setConfigGerais({ ...configGerais, autoLogoutWarningUnit: 'minutos', autoLogoutWarningMinutes: 2 })
                                  }}
                                  style={{
                                    padding: '2px 5px',
                                    fontSize: '9px',
                                    fontWeight: '700',
                                    border: 'none',
                                    borderRadius: '2px',
                                    cursor: 'pointer',
                                    backgroundColor: configGerais.autoLogoutWarningUnit === 'minutos' ? headerColor : 'transparent',
                                    color: configGerais.autoLogoutWarningUnit === 'minutos' ? '#fff' : theme.textSecondary,
                                    transition: 'all 0.15s',
                                    flex: 1
                                  }}
                                >
                                  min
                                </button>
                                    </div>
                              
                                    {/* Input de valor */}
                                    <div 
                                      style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                <input
                                  type="number"
                                  min={configGerais.autoLogoutWarningUnit === 'segundos' ? '10' : '1'}
                                  max={configGerais.autoLogoutWarningUnit === 'segundos' ? '59' : '30'}
                                  value={configGerais.autoLogoutWarningUnit === 'segundos' ? configGerais.autoLogoutWarningSeconds : configGerais.autoLogoutWarningMinutes}
                                  onChange={(e) => {
                                    const valor = parseInt(e.target.value) || (configGerais.autoLogoutWarningUnit === 'segundos' ? 10 : 1)
                                    if (configGerais.autoLogoutWarningUnit === 'segundos') {
                                      setConfigGerais({ 
                                        ...configGerais, 
                                        autoLogoutWarningSeconds: Math.max(10, Math.min(59, valor))
                                      })
                                    } else {
                                      setConfigGerais({ 
                                        ...configGerais, 
                                        autoLogoutWarningMinutes: Math.max(1, Math.min(30, valor))
                                      })
                                    }
                                  }}
                                  style={{
                                    width: '32px',
                                    padding: '2px 3px',
                                    border: `1px solid ${theme.border}`,
                                    borderRadius: '2px',
                                    backgroundColor: theme.surface,
                                    color: theme.text,
                                    fontSize: '12px',
                                    textAlign: 'center',
                                    fontWeight: 'bold'
                                  }}
                                />
                                      <span style={{ fontSize: '10px', color: theme.textSecondary, fontWeight: '700' }}>
                                        {configGerais.autoLogoutWarningUnit === 'segundos' ? 's' : 'min'}
                                      </span>
                                    </div>
                                    
                                    <div style={{ fontSize: '8px', color: theme.textSecondary }}>
                                      {configGerais.autoLogoutWarningUnit === 'segundos' ? '10-59s' : '1-30min'}
                                    </div>
                                  </div>
                                </div>
                              )
                            })()}
                          </div>

                          {/* Informação visual do aviso */}
                          <div style={{
                            padding: '10px',
                            backgroundColor: currentTheme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
                            border: `1px solid ${currentTheme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#3b82f6'}`,
                            borderRadius: '6px',
                            fontSize: '11px',
                            color: theme.text,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span>ℹ️</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ marginBottom: '2px' }}>
                                Logout automático em <strong>{configGerais.autoLogoutMinutes} minuto{configGerais.autoLogoutMinutes !== 1 ? 's' : ''}</strong> de inatividade
                                {configGerais.autoLogoutMinutes >= 60 && (
                                  <span style={{ color: theme.textSecondary }}>
                                    {' '}({Math.floor(configGerais.autoLogoutMinutes / 60)}h{configGerais.autoLogoutMinutes % 60 > 0 ? ` ${configGerais.autoLogoutMinutes % 60}min` : ''})
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '10px', color: theme.textSecondary }}>
                                {configGerais.autoLogoutWarningUnit === 'segundos' ? (
                                  <>
                                    Aviso aparecerá <strong>{configGerais.autoLogoutWarningSeconds} segundo{configGerais.autoLogoutWarningSeconds !== 1 ? 's' : ''}</strong> antes
                                    {' '}({configGerais.autoLogoutMinutes} min menos {configGerais.autoLogoutWarningSeconds}s de inatividade)
                                  </>
                                ) : (
                                  <>
                                    Aviso aparecerá <strong>{configGerais.autoLogoutWarningMinutes} minuto{configGerais.autoLogoutWarningMinutes !== 1 ? 's' : ''}</strong> antes
                                    {' '}({configGerais.autoLogoutMinutes - configGerais.autoLogoutWarningMinutes} min de inatividade)
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        </>
                      )}

                      {/* Aviso quando desativado */}
                      {!configGerais.autoLogoutEnabled && (
                        <div style={{
                          marginTop: '16px',
                          padding: '16px',
                          backgroundColor: currentTheme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7',
                          border: `1px solid ${currentTheme === 'dark' ? 'rgba(245, 158, 11, 0.3)' : '#f59e0b'}`,
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: theme.text,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <span style={{ fontSize: '24px' }}>⚠️</span>
                          <div>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                              Logout automático desativado
                            </div>
                            <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                              Ative o toggle acima para maior segurança do sistema
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seção: Dados da Empresa */}
                <div style={{
                  padding: '28px',
                  border: `2px solid ${theme.border}`,
                  borderRadius: '8px',
                  backgroundColor: theme.surface,
                  overflow: 'hidden'
                }}>
                  <h3 style={{
                    margin: '0 0 20px 0',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: theme.text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🏢 Dados da Empresa
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* CNPJ e Nome da Empresa */}
                    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '32px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: theme.textSecondary,
                          marginBottom: '8px'
                        }}>
                          CNPJ
                        </label>
                        <input
                          type="text"
                          value={dadosEmpresa.cnpj}
                          onChange={(e) => {
                            let valor = e.target.value.replace(/\D/g, '')
                            if (valor.length <= 14) {
                              // Formatar: 00.000.000/0000-00
                              if (valor.length > 12) {
                                valor = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
                              } else if (valor.length > 8) {
                                valor = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4')
                              } else if (valor.length > 5) {
                                valor = valor.replace(/^(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3')
                              } else if (valor.length > 2) {
                                valor = valor.replace(/^(\d{2})(\d{0,3})/, '$1.$2')
                              }
                              setDadosEmpresa({ ...dadosEmpresa, cnpj: valor })
                            }
                          }}
                          placeholder="00.000.000/0000-00"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '14px',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            backgroundColor: theme.background,
                            color: theme.text
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: theme.textSecondary,
                          marginBottom: '8px'
                        }}>
                          Nome da Empresa
                        </label>
                        <input
                          type="text"
                          value={dadosEmpresa.nome}
                          onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, nome: e.target.value })}
                          placeholder="Digite o nome da empresa"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '14px',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            backgroundColor: theme.background,
                            color: theme.text
                          }}
                        />
                      </div>
                    </div>

                    {/* CEP, Endereço e Número */}
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 2fr 120px', gap: '32px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: theme.textSecondary,
                          marginBottom: '8px'
                        }}>
                          CEP
                        </label>
                        <input
                          type="text"
                          value={dadosEmpresa.cep}
                          onChange={(e) => {
                            let valor = e.target.value.replace(/\D/g, '')
                            if (valor.length <= 8) {
                              // Formatar: 00000-000
                              if (valor.length > 5) {
                                valor = valor.replace(/^(\d{5})(\d{0,3})/, '$1-$2')
                              }
                              setDadosEmpresa({ ...dadosEmpresa, cep: valor })
                              
                              // Buscar endereço automaticamente quando tiver 8 dígitos
                              if (valor.replace(/\D/g, '').length === 8) {
                                buscarEnderecoPorCep(valor)
                              }
                            }
                          }}
                          placeholder="00000-000"
                          disabled={buscandoCep}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '14px',
                            border: `1px solid ${buscandoCep ? headerColor : theme.border}`,
                            borderRadius: '6px',
                            backgroundColor: buscandoCep ? theme.surface : theme.background,
                            color: theme.text,
                            cursor: buscandoCep ? 'wait' : 'text'
                          }}
                        />
                        {buscandoCep && (
                          <div style={{ fontSize: '10px', color: headerColor, marginTop: '4px', textAlign: 'center' }}>
                            Buscando...
                          </div>
                        )}
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: theme.textSecondary,
                          marginBottom: '8px'
                        }}>
                          Endereço
                        </label>
                        <input
                          type="text"
                          value={dadosEmpresa.endereco}
                          onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, endereco: e.target.value })}
                          placeholder="Rua, Avenida, etc."
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '14px',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            backgroundColor: theme.background,
                            color: theme.text
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: theme.textSecondary,
                          marginBottom: '8px'
                        }}>
                          Número
                        </label>
                        <input
                          type="text"
                          value={dadosEmpresa.numero}
                          onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, numero: e.target.value })}
                          placeholder="Nº"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '14px',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            backgroundColor: theme.background,
                            color: theme.text
                          }}
                        />
                      </div>
                    </div>

                    {/* Complemento, Bairro, Cidade e UF */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px', gap: '32px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: theme.textSecondary,
                          marginBottom: '8px'
                        }}>
                          Complemento
                        </label>
                        <input
                          type="text"
                          value={dadosEmpresa.complemento}
                          onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, complemento: e.target.value })}
                          placeholder="Apto, Sala, etc."
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '14px',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            backgroundColor: theme.background,
                            color: theme.text
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: theme.textSecondary,
                          marginBottom: '8px'
                        }}>
                          Bairro
                        </label>
                        <input
                          type="text"
                          value={dadosEmpresa.bairro}
                          onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, bairro: e.target.value })}
                          placeholder="Bairro"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '14px',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            backgroundColor: theme.background,
                            color: theme.text
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: theme.textSecondary,
                          marginBottom: '8px'
                        }}>
                          Cidade
                        </label>
                        <input
                          type="text"
                          value={dadosEmpresa.cidade}
                          onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, cidade: e.target.value })}
                          placeholder="Cidade"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '14px',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            backgroundColor: theme.background,
                            color: theme.text
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: theme.textSecondary,
                          marginBottom: '8px'
                        }}>
                          UF
                        </label>
                        <input
                          type="text"
                          value={dadosEmpresa.uf}
                          onChange={(e) => {
                            const valor = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2)
                            setDadosEmpresa({ ...dadosEmpresa, uf: valor })
                          }}
                          placeholder="UF"
                          maxLength={2}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '14px',
                            textAlign: 'center',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            backgroundColor: theme.background,
                            color: theme.text,
                            textTransform: 'uppercase'
                          }}
                        />
                      </div>
                    </div>

                    {/* Telefone, Celular, Email */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '32px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: theme.textSecondary,
                          marginBottom: '8px'
                        }}>
                          Telefone
                        </label>
                        <input
                          type="text"
                          value={dadosEmpresa.telefone}
                          onChange={(e) => {
                            let valor = e.target.value.replace(/\D/g, '')
                            if (valor.length <= 10) {
                              // Formatar: (00) 0000-0000
                              if (valor.length > 6) {
                                valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
                              } else if (valor.length > 2) {
                                valor = valor.replace(/^(\d{2})(\d{0,4})/, '($1) $2')
                              }
                              setDadosEmpresa({ ...dadosEmpresa, telefone: valor })
                            }
                          }}
                          placeholder="(00) 0000-0000"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '14px',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            backgroundColor: theme.background,
                            color: theme.text
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: theme.textSecondary,
                          marginBottom: '8px'
                        }}>
                          Celular
                        </label>
                        <input
                          type="text"
                          value={dadosEmpresa.celular}
                          onChange={(e) => {
                            let valor = e.target.value.replace(/\D/g, '')
                            if (valor.length <= 11) {
                              // Formatar: (00) 00000-0000
                              if (valor.length > 7) {
                                valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
                              } else if (valor.length > 2) {
                                valor = valor.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
                              }
                              setDadosEmpresa({ ...dadosEmpresa, celular: valor })
                            }
                          }}
                          placeholder="(00) 00000-0000"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '14px',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            backgroundColor: theme.background,
                            color: theme.text
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: theme.textSecondary,
                          marginBottom: '8px'
                        }}>
                          E-mail
                        </label>
                        <input
                          type="email"
                          value={dadosEmpresa.email}
                          onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, email: e.target.value })}
                          placeholder="contato@empresa.com.br"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '14px',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            backgroundColor: theme.background,
                            color: theme.text
                          }}
                        />
                      </div>
                    </div>

                    {/* Site */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: theme.textSecondary,
                        marginBottom: '6px'
                      }}>
                        Site (opcional)
                      </label>
                      <input
                        type="text"
                        value={dadosEmpresa.site}
                        onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, site: e.target.value })}
                        placeholder="www.empresa.com.br"
                        style={{
                          width: '100%',
                          padding: '10px',
                          fontSize: '14px',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '6px',
                          backgroundColor: theme.background,
                          color: theme.text
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA: Bloqueio por Horário */}
            {abaAtiva === 'bloqueio-horario' && (
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Toggle Principal - Minimalista */}
                <div style={{
                  padding: '24px',
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: theme.text,
                        marginBottom: '4px'
                      }}>
                        🔒 Bloqueio por Horário
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: theme.textSecondary
                      }}>
                        {configBloqueio.habilitado 
                          ? `Sistema acessível das ${configBloqueio.horarioInicio} às ${configBloqueio.horarioFim}`
                          : 'Sistema disponível 24 horas'
                        }
                      </div>
                    </div>
                    
                    {/* Toggle Simples */}
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '56px',
                      height: '28px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={configBloqueio.habilitado}
                        onChange={(e) => setConfigBloqueio({ ...configBloqueio, habilitado: e.target.checked })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: configBloqueio.habilitado ? headerColor : '#d1d5db',
                        borderRadius: '28px',
                        transition: 'all 0.2s ease'
                      }}>
                        <span style={{
                          position: 'absolute',
                          height: '22px',
                          width: '22px',
                          left: configBloqueio.habilitado ? '30px' : '3px',
                          bottom: '3px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                      </span>
                    </label>
                  </div>
                </div>
                    
                {configBloqueio.habilitado && (
                  <div style={{
                    padding: '28px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px'
                  }}>
                    {/* Horários em Grid Horizontal */}
                    <div style={{
                      display: 'flex',
                      gap: '24px',
                      marginBottom: '28px'
                    }}>
                      {/* Horário de Início */}
                      <div style={{ flex: 1 }}>
                        <label style={{
                          fontSize: '13px',
                          fontWeight: '500',
                          color: theme.textSecondary,
                          marginBottom: '8px',
                          display: 'block'
                        }}>
                          Início do Expediente
                        </label>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '16px',
                          backgroundColor: theme.background,
                          border: `1px solid ${theme.border}`,
                          borderRadius: '8px'
                        }}>
                          <span style={{ fontSize: '24px' }}>🌅</span>
                          <input
                            type="time"
                            value={configBloqueio.horarioInicio}
                            onChange={(e) => setConfigBloqueio({ ...configBloqueio, horarioInicio: e.target.value })}
                            style={{
                              flex: 1,
                              padding: '8px',
                              fontSize: '20px',
                              fontWeight: '600',
                              border: 'none',
                              backgroundColor: 'transparent',
                              color: theme.text,
                              outline: 'none',
                              textAlign: 'center'
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Seta */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        paddingTop: '32px',
                        fontSize: '24px',
                        color: theme.textSecondary
                      }}>
                        →
                      </div>
                      
                      {/* Horário de Fim */}
                      <div style={{ flex: 1 }}>
                        <label style={{
                          fontSize: '13px',
                          fontWeight: '500',
                          color: theme.textSecondary,
                          marginBottom: '8px',
                          display: 'block'
                        }}>
                          Fim do Expediente
                        </label>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '16px',
                          backgroundColor: theme.background,
                          border: `1px solid ${theme.border}`,
                          borderRadius: '8px'
                        }}>
                          <span style={{ fontSize: '24px' }}>🌙</span>
                          <input
                            type="time"
                            value={configBloqueio.horarioFim}
                            onChange={(e) => setConfigBloqueio({ ...configBloqueio, horarioFim: e.target.value })}
                            style={{
                              flex: 1,
                              padding: '8px',
                              fontSize: '20px',
                              fontWeight: '600',
                              border: 'none',
                              backgroundColor: 'transparent',
                              color: theme.text,
                              outline: 'none',
                              textAlign: 'center'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Tempo Extra - Minimalista */}
                    <div style={{
                      padding: '20px',
                      backgroundColor: theme.background,
                      borderRadius: '8px',
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: theme.text }}>
                          Margem de Tolerância
                        </span>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          color: headerColor,
                          backgroundColor: currentTheme === 'dark' ? 'rgba(255,140,0,0.1)' : 'rgba(0,128,128,0.1)',
                          padding: '6px 16px',
                          borderRadius: '20px'
                        }}>
                          {configBloqueio.tempoExtraPermitido} min
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="180"
                        step="15"
                        value={configBloqueio.tempoExtraPermitido}
                        onChange={(e) => setConfigBloqueio({ ...configBloqueio, tempoExtraPermitido: parseInt(e.target.value) })}
                        style={{
                          width: '100%',
                          height: '6px',
                          borderRadius: '3px',
                          outline: 'none',
                          background: `linear-gradient(to right, ${headerColor} 0%, ${headerColor} ${(configBloqueio.tempoExtraPermitido / 180) * 100}%, ${theme.border} ${(configBloqueio.tempoExtraPermitido / 180) * 100}%, ${theme.border} 100%)`,
                          cursor: 'pointer',
                          appearance: 'none',
                          WebkitAppearance: 'none'
                        }}
                      />
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        color: theme.textSecondary,
                        marginTop: '8px'
                      }}>
                        <span>0 min</span>
                        <span>180 min (3h)</span>
                      </div>
                    </div>
                    
                    {/* Preview do Horário Final */}
                    <div style={{
                      padding: '16px',
                      backgroundColor: currentTheme === 'dark' ? 'rgba(59,130,246,0.05)' : '#eff6ff',
                      border: `1px solid ${currentTheme === 'dark' ? 'rgba(59,130,246,0.2)' : '#3b82f6'}`,
                      borderRadius: '8px',
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: theme.text,
                        marginBottom: '8px'
                      }}>
                        ⏰ Horário efetivo de acesso:
                      </div>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: headerColor,
                        textAlign: 'center'
                      }}>
                        {(() => {
                          const inicio = new Date(`2000-01-01 ${configBloqueio.horarioInicio}`)
                          inicio.setMinutes(inicio.getMinutes() - configBloqueio.tempoExtraPermitido)
                          return inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                        })()}
                        <span style={{ fontSize: '16px', margin: '0 8px' }}>até</span>
                        {(() => {
                          const fim = new Date(`2000-01-01 ${configBloqueio.horarioFim}`)
                          fim.setMinutes(fim.getMinutes() + configBloqueio.tempoExtraPermitido)
                          return fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                        })()}
                      </div>
                    </div>
                    
                    {/* Mensagem de Bloqueio - Compacta */}
                    <div>
                      <label style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: theme.textSecondary,
                        marginBottom: '8px',
                        display: 'block'
                      }}>
                        Mensagem de Bloqueio
                      </label>
                      <textarea
                        value={configBloqueio.mensagemBloqueio}
                        onChange={(e) => setConfigBloqueio({ ...configBloqueio, mensagemBloqueio: e.target.value })}
                        rows={2}
                        placeholder="Mensagem exibida quando o acesso estiver bloqueado..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '13px',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '8px',
                          backgroundColor: theme.background,
                          color: theme.text,
                          outline: 'none',
                          resize: 'none',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
            </div>
                )}
            </div>
            )}

            {/* ABA: Impressão de Livros */}
            {abaAtiva === 'impressao-livros' && (
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                  padding: '16px',
                  border: `2px solid ${theme.border}`,
                  borderRadius: '8px',
                  backgroundColor: theme.surface
                }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: theme.text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🖼️ Logo do Cartório
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: theme.textSecondary,
                        marginBottom: '8px'
                      }}>
                        Faça upload do logo que será usado nas lombadas e impressões
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              const result = reader.result as string
                              setConfigImpressao({ ...configImpressao, logoCartorio: result })
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        style={{
                          padding: '10px',
                          fontSize: '14px',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '4px',
                          backgroundColor: theme.background,
                          color: theme.text,
                          width: '100%',
                          cursor: 'pointer'
                        }}
                      />
                    </div>

                    {configImpressao.logoCartorio && (
                      <div style={{
                        padding: '16px',
                        border: `2px solid ${theme.border}`,
                        borderRadius: '8px',
                        backgroundColor: theme.background,
                        textAlign: 'center'
                      }}>
                        <p style={{
                          margin: '0 0 12px 0',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: theme.textSecondary
                        }}>
                          Pré-visualização:
                        </p>
                        <img 
                          src={configImpressao.logoCartorio} 
                          alt="Logo do Cartório" 
                          style={{
                            maxWidth: '200px',
                            maxHeight: '150px',
                            objectFit: 'contain',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '4px',
                            padding: '8px',
                            backgroundColor: '#fff'
                          }}
                        />
                        <button
                          onClick={() => setConfigImpressao({ ...configImpressao, logoCartorio: '' })}
                          style={{
                            marginTop: '12px',
                            padding: '8px 16px',
                            fontSize: '13px',
                            backgroundColor: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          🗑️ Remover Logo
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dimensões da Lombada */}
                <div style={{
                  padding: '16px',
                  border: `2px solid ${theme.border}`,
                  borderRadius: '8px',
                  backgroundColor: theme.surface,
                  marginTop: '20px'
                }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: theme.text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📏 Dimensões da Lombada para Impressão
                  </h3>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '16px' 
                  }}>
                    {/* Altura */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: theme.textSecondary,
                        marginBottom: '8px'
                      }}>
                        Altura (mm)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="500"
                        step="0.1"
                        value={configImpressao.alturaLombada}
                        onChange={(e) => setConfigImpressao({ 
                          ...configImpressao, 
                          alturaLombada: parseFloat(e.target.value) || 105 
                        })}
                        style={inputStyles}
                        step="0.1"
                      />
                      <p style={{
                        margin: '4px 0 0 0',
                        fontSize: '11px',
                        color: theme.textSecondary
                      }}>
                        Padrão: 105 mm
                      </p>
                    </div>

                    {/* Largura */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: theme.textSecondary,
                        marginBottom: '8px'
                      }}>
                        Largura (mm)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="500"
                        step="0.1"
                        value={configImpressao.larguraLombada}
                        onChange={(e) => setConfigImpressao({ 
                          ...configImpressao, 
                          larguraLombada: parseFloat(e.target.value) || 55 
                        })}
                        style={inputStyles}
                        step="0.1"
                      />
                      <p style={{
                        margin: '4px 0 0 0',
                        fontSize: '11px',
                        color: theme.textSecondary
                      }}>
                        Padrão: 55 mm
                      </p>
                    </div>
                  </div>

                  {/* Preview das dimensões */}
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: theme.background,
                    borderRadius: '4px',
                    border: `1px solid ${theme.border}`
                  }}>
                    <p style={{
                      margin: '0 0 8px 0',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text
                    }}>
                      📐 Tamanho configurado:
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: theme.textSecondary
                    }}>
                      {configImpressao.alturaLombada}mm (altura) × {configImpressao.larguraLombada}mm (largura)
                    </p>
                  </div>

                  <div style={layoutCardStyle}>
                    <h4 style={layoutSectionTitleStyle}>
                      🧩 Organização das Seções
                    </h4>
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <div style={layoutSubSectionStyle}>
                        <h5 style={layoutSubHeaderStyle}>🎚️ Ajuste Vertical Global (mm)</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
                          {[
                            { label: 'Logo', key: 'offsetLogo' as const },
                            { label: 'Letra', key: 'offsetLetra' as const },
                            { label: 'Número', key: 'offsetNumero' as const },
                            { label: 'Datas', key: 'offsetDatas' as const }
                          ].map((item) => (
                            <div key={item.key}>
                              <label style={labelStyles}>{item.label}</label>
                              <input
                                type="number"
                                step="0.1"
                                value={configImpressao[item.key]}
                                onChange={(e) => {
                                  const valor = parseFloat(e.target.value);
                                  setConfigImpressao({
                                    ...configImpressao,
                                    [item.key]: Number.isNaN(valor) ? configImpressao[item.key] : valor
                                  })
                                }}
                                style={inputStyles}
                              />
                            </div>
                          ))}
                        </div>
                        <p style={{
                          margin: '4px 0 0 0',
                          fontSize: '11px',
                          color: theme.textSecondary
                        }}>
                          Ajuste padrão para todos os tipos. Valores positivos descem, negativos sobem.
                        </p>
                      </div>

                      <div style={layoutSubSectionStyle}>
                        <h5 style={layoutSubHeaderStyle}>🎯 Configuração Específica (Tipo/Letra)</h5>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '12px',
                          alignItems: 'center'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={labelStyles}>Tipo de Livro</label>
                            <select
                              value={perfilTipo}
                              onChange={(e) => setPerfilTipo(e.target.value)}
                              style={inputStyles}
                            >
                              {tiposLivro.map((tipo) => (
                                <option key={tipo} value={tipo}>{tipo}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={labelStyles}>Letra / Nomenclatura</label>
                            <select
                              value={perfilLetra}
                              onChange={(e) => setPerfilLetra(e.target.value)}
                              style={inputStyles}
                            >
                              {letrasDisponiveisPerfil.map((letra) => (
                                <option key={letra} value={letra}>{letra}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => perfilPersonalizadoAtivo && removerPerfil()}
                            style={{
                              padding: '6px 10px',
                              fontSize: '12px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: perfilPersonalizadoAtivo ? '#ef4444' : '#d1d5db',
                              color: perfilPersonalizadoAtivo ? '#fff' : theme.textSecondary,
                              cursor: perfilPersonalizadoAtivo ? 'pointer' : 'not-allowed',
                              opacity: perfilPersonalizadoAtivo ? 1 : 0.7,
                              height: '32px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              fontWeight: 600,
                              boxShadow: perfilPersonalizadoAtivo ? '0 1px 3px rgba(0,0,0,0.12)' : 'none'
                            }}
                          >
                            <span role="img" aria-label="remover">🧹</span>
                            Remover
                          </button>
                        </div>

                        <div style={{ display: 'grid', gap: '16px', marginTop: '12px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
                            {([
                              { label: 'Logo', campo: 'alturaLogo' },
                              { label: 'Letra', campo: 'alturaLetra' },
                              { label: 'Número', campo: 'alturaNumero' },
                              { label: 'Datas', campo: 'alturaDatas' }
                            ] as Array<{ label: string; campo: keyof LayoutConfig }>).map((item) => (
                              <div key={item.campo}>
                                <label style={labelStyles}>{item.label}</label>
                                <input
                                  type="number"
                                  min="1"
                                  max={configImpressao.alturaLombada}
                                  step="0.1"
                                  value={obterValorPerfil(item.campo)}
                                  onChange={(e) => {
                                    const valor = parseFloat(e.target.value);
                                    atualizarPerfil(item.campo, Number.isNaN(valor) ? obterValorPerfil(item.campo) : valor);
                                  }}
                                  style={inputStyles}
                                />
                              </div>
                            ))}
                          </div>
                          <p style={{
                            margin: '4px 0 0 0',
                            fontSize: '11px',
                            color: theme.textSecondary
                          }}>
                            Ajuste as alturas específicas. Valores vazios usam o padrão global.
                          </p>
                        </div>
                      </div>

                      <div style={layoutSubSectionStyle}>
                        <h5 style={layoutSubHeaderStyle}>🔤 Tamanho das Fontes (px)</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
                          <div>
                            <label style={labelStyles}>Logo (%)</label>
                            <input
                              type="number"
                              min="50"
                              max="300"
                              step="5"
                              value={obterValorPerfil('logoEscala')}
                              onChange={(e) => {
                                const valor = parseInt(e.target.value, 10);
                                atualizarPerfil('logoEscala', Number.isNaN(valor) ? obterValorPerfil('logoEscala') : valor);
                              }}
                              style={inputStyles}
                            />
                          </div>
                          {([
                            { label: 'Letra', campo: 'fonteLetra' },
                            { label: 'Número', campo: 'fonteNumero' },
                            { label: 'Datas', campo: 'fonteDatas' }
                          ] as Array<{ label: string; campo: keyof LayoutConfig }>).map((item) => (
                            <div key={item.campo}>
                              <label style={labelStyles}>{item.label}</label>
                              <input
                                type="number"
                                min="8"
                                max="600"
                                step="1"
                                value={obterValorPerfil(item.campo)}
                                onChange={(e) => {
                                  const valor = parseInt(e.target.value, 10);
                                  atualizarPerfil(item.campo, Number.isNaN(valor) ? obterValorPerfil(item.campo) : valor);
                                }}
                                style={inputStyles}
                              />
                            </div>
                          ))}
                        </div>
                        <p style={{
                          margin: '4px 0 0 0',
                          fontSize: '11px',
                          color: theme.textSecondary
                        }}>
                          Personalize fontes para este tipo/letra. Vazio mantém o padrão global.
                        </p>
                      </div>

                      <div style={layoutSubSectionStyle}>
                        <h5 style={layoutSubHeaderStyle}>🎚️ Ajuste Vertical (mm)</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
                          {([
                            { label: 'Logo', campo: 'offsetLogo' },
                            { label: 'Letra', campo: 'offsetLetra' },
                            { label: 'Número', campo: 'offsetNumero' },
                            { label: 'Datas', campo: 'offsetDatas' }
                          ] as Array<{ label: string; campo: keyof LayoutConfig }>).map((item) => (
                            <div key={item.campo}>
                              <label style={labelStyles}>{item.label}</label>
                              <input
                                type="number"
                                step="0.1"
                                value={obterValorPerfil(item.campo)}
                                onChange={(e) => {
                                  const valor = parseFloat(e.target.value);
                                  atualizarPerfil(item.campo, Number.isNaN(valor) ? obterValorPerfil(item.campo) : valor);
                                }}
                                style={inputStyles}
                              />
                            </div>
                          ))}
                        </div>
                        <p style={{
                          margin: '4px 0 0 0',
                          fontSize: '11px',
                          color: theme.textSecondary
                        }}>
                          Valores positivos descem e negativos sobem a seção selecionada (em mm).
                        </p>
                      </div>

                      <div style={layoutSubSectionStyle}>
                        <h5 style={layoutSubHeaderStyle}>🖨️ Borda do Perfil</h5>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: theme.text }}>
                            <input
                              type="checkbox"
                              checked={Boolean(obterValorPerfil('bordaAtiva'))}
                              onChange={(e) => atualizarPerfil('bordaAtiva', e.target.checked)}
                              style={{ width: '16px', height: '16px' }}
                            />
                            Imprimir com borda para este tipo/letra
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px', color: theme.text }}>Formato:</span>
                            <select
                              value={obterValorPerfil('bordaQuadrada') ? 'quadrada' : 'arredondada'}
                              onChange={(e) => atualizarPerfil('bordaQuadrada', e.target.value === 'quadrada')}
                              style={{ ...inputStyles, width: '150px' }}
                            >
                              <option value="arredondada">Arredondada</option>
                              <option value="quadrada">Quadrada</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div style={layoutSubSectionStyle}>
                        <h5 style={layoutSubHeaderStyle}>📏 Distribuição da Largura (mm)</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                          {([
                            { label: 'Logo', campo: 'larguraLogoSecao' },
                            { label: 'Letra', campo: 'larguraLetraSecao' },
                            { label: 'Número', campo: 'larguraNumeroSecao' },
                            { label: 'Datas', campo: 'larguraDatasSecao' }
                          ] as Array<{ label: string; campo: keyof LayoutConfig }>).map((item) => (
                            <div key={item.campo}>
                              <label style={labelStyles}>{item.label}</label>
                              <input
                                type="number"
                                min="0"
                                max={configImpressao.larguraLombada}
                                step="0.1"
                                value={obterValorPerfil(item.campo)}
                                onChange={(e) => {
                                  const valor = parseFloat(e.target.value);
                                  atualizarPerfil(item.campo, Number.isNaN(valor) ? obterValorPerfil(item.campo) : valor);
                                }}
                                style={inputStyles}
                              />
                            </div>
                          ))}
                        </div>
                        <p style={{
                          margin: '4px 0 0 0',
                          fontSize: '11px',
                          color: theme.textSecondary
                        }}>
                          Defina larguras específicas respeitando o limite total de {configImpressao.larguraLombada} mm.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rodapé com Botões */}
          <div style={{
            padding: '16px',
            borderTop: `2px solid ${theme.border}`,
            backgroundColor: theme.surface,
            display: 'flex',
            gap: '10px',
            justifyContent: 'center'
          }}>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('🔵 BOTÃO SALVAR CLICADO! Aba ativa:', abaAtiva)
                if (abaAtiva === 'gerais') {
                  console.log('🟢 Chamando salvarConfigGerais...')
                  salvarConfigGerais()
                } else if (abaAtiva === 'bloqueio-horario') {
                  console.log('🟡 Chamando salvarConfigBloqueio...')
                  salvarConfigBloqueio()
                } else if (abaAtiva === 'impressao-livros') {
                  console.log('🖨️ Salvando configurações de impressão...')
                  localStorage.setItem('config-impressao-livros', JSON.stringify(configImpressao))
                  window.dispatchEvent(new CustomEvent('config-impressao-updated'))
                  modal.alert(
                    `✅ Configurações de impressão salvas com sucesso!\n\n` +
                    `📐 Dimensões gerais:\n` +
                    `• Altura total: ${configImpressao.alturaLombada} mm\n` +
                    `• Largura total: ${configImpressao.larguraLombada} mm\n\n` +
                    `📊 Distribuição das seções:\n` +
                    `• Logo: ${configImpressao.alturaLogo} mm\n` +
                    `• Letra: ${configImpressao.alturaLetra} mm\n` +
                    `• Número: ${configImpressao.alturaNumero} mm\n` +
                    `• Datas: ${configImpressao.alturaDatas} mm\n\n` +
                    `🔤 Fontes:\n` +
                    `• Logo: ${configImpressao.logoEscala}%\n` +
                    `• Letra: ${configImpressao.fonteLetra}px\n` +
                    `• Número: ${configImpressao.fonteNumero}px\n` +
                    `• Datas: ${configImpressao.fonteDatas}px\n\n` +
                    `🎚️ Ajuste vertical (mm):\n` +
                    `• Logo: ${configImpressao.offsetLogo}\n` +
                    `• Letra: ${configImpressao.offsetLetra}\n` +
                    `• Número: ${configImpressao.offsetNumero}\n` +
                    `• Datas: ${configImpressao.offsetDatas}\n` +
                    `• Borda: ${configImpressao.bordaAtiva ? (configImpressao.bordaQuadrada ? 'Sim (Quadrada)' : 'Sim (Arredondada)') : 'Não'}` +
                    `\n\n🎯 Perfis personalizados: ${Object.keys(configImpressao.perfis ?? {}).length}`,
                    'Configurações Salvas',
                    '✅'
                  )
                }
              }}
              style={{
                ...buttonStyles,
                backgroundColor: '#10b981',
                color: '#fff',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#059669'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              💾 Salvar Configurações
            </button>
            <button
              onClick={onClose}
              style={{
                ...buttonStyles,
                backgroundColor: '#6c757d',
                color: '#fff'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#495057'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
            >
              🚪 Retornar
            </button>
      </div>
    </div>
        {/* Modal Component - DENTRO da janela */}
        <modal.ModalComponent />
      </BasePage>
    </>
  )
}
