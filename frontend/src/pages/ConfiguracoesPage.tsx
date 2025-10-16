import { useState, useEffect } from 'react'

interface ConfiguracoesPageProps {
  onClose: () => void
  isDarkMode: boolean
  onThemeChange: (isDark: boolean) => void
}

export function ConfiguracoesPage({ onClose, isDarkMode, onThemeChange }: ConfiguracoesPageProps) {
  const [altoContraste, setAltoContraste] = useState(false)
  const [modoDaltonismo, setModoDaltonismo] = useState(false)
  const [tipoDaltonismo, setTipoDaltonismo] = useState('protanopia')
  const [fonteMaior, setFonteMaior] = useState(false)
  const [animacoesReduzidas, setAnimacoesReduzidas] = useState(false)

  // Carregar configurações salvas
  useEffect(() => {
    const savedAltoContraste = localStorage.getItem('altoContraste') === 'true'
    const savedModoDaltonismo = localStorage.getItem('modoDaltonismo') === 'true'
    const savedTipoDaltonismo = localStorage.getItem('tipoDaltonismo') || 'protanopia'
    const savedFonteMaior = localStorage.getItem('fonteMaior') === 'true'
    const savedAnimacoesReduzidas = localStorage.getItem('animacoesReduzidas') === 'true'

    setAltoContraste(savedAltoContraste)
    setModoDaltonismo(savedModoDaltonismo)
    setTipoDaltonismo(savedTipoDaltonismo)
    setFonteMaior(savedFonteMaior)
    setAnimacoesReduzidas(savedAnimacoesReduzidas)
  }, [])

  // Salvar configurações
  const salvarConfiguracao = (chave: string, valor: boolean | string) => {
    localStorage.setItem(chave, valor.toString())
  }

  const handleAltoContraste = (ativo: boolean) => {
    setAltoContraste(ativo)
    salvarConfiguracao('altoContraste', ativo)
    // Aplicar estilos de alto contraste
    if (ativo) {
      document.body.style.filter = 'contrast(150%) brightness(120%)'
    } else {
      document.body.style.filter = 'none'
    }
  }

  const handleModoDaltonismo = (ativo: boolean) => {
    setModoDaltonismo(ativo)
    salvarConfiguracao('modoDaltonismo', ativo)
    // Aplicar filtros para daltonismo
    if (ativo) {
      const filtros = {
        protanopia: 'sepia(1) hue-rotate(90deg) saturate(2)',
        deuteranopia: 'sepia(1) hue-rotate(180deg) saturate(2)',
        tritanopia: 'sepia(1) hue-rotate(270deg) saturate(2)'
      }
      document.body.style.filter = filtros[tipoDaltonismo as keyof typeof filtros]
    } else {
      document.body.style.filter = altoContraste ? 'contrast(150%) brightness(120%)' : 'none'
    }
  }

  const handleTipoDaltonismo = (tipo: string) => {
    setTipoDaltonismo(tipo)
    salvarConfiguracao('tipoDaltonismo', tipo)
    if (modoDaltonismo) {
      const filtros = {
        protanopia: 'sepia(1) hue-rotate(90deg) saturate(2)',
        deuteranopia: 'sepia(1) hue-rotate(180deg) saturate(2)',
        tritanopia: 'sepia(1) hue-rotate(270deg) saturate(2)'
      }
      document.body.style.filter = filtros[tipo as keyof typeof filtros]
    }
  }

  const handleFonteMaior = (ativo: boolean) => {
    setFonteMaior(ativo)
    salvarConfiguracao('fonteMaior', ativo)
    if (ativo) {
      document.body.style.fontSize = '18px'
    } else {
      document.body.style.fontSize = '16px'
    }
  }

  const handleAnimacoesReduzidas = (ativo: boolean) => {
    setAnimacoesReduzidas(ativo)
    salvarConfiguracao('animacoesReduzidas', ativo)
    if (ativo) {
      document.body.style.setProperty('--animation-duration', '0.01s')
    } else {
      document.body.style.removeProperty('--animation-duration')
    }
  }

  const handleAjuda = () => {
    window.open('/ajuda', '_blank')
  }

  const handleAtualizacao = () => {
    window.location.reload()
  }

  const theme = {
    background: isDarkMode 
      ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    cardBg: isDarkMode 
      ? 'rgba(30, 41, 59, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    text: isDarkMode ? '#f1f5f9' : '#1e293b',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? 'rgba(148, 163, 184, 0.3)' : 'rgba(30, 41, 59, 0.2)',
    buttonBg: isDarkMode ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.9)',
    buttonHover: isDarkMode ? 'rgba(59, 130, 246, 1)' : 'rgba(59, 130, 246, 1)',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: theme.cardBg,
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: `1px solid ${theme.border}`
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: `1px solid ${theme.border}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              ⚙️
            </div>
            <div>
              <h2 style={{ 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: '700',
                color: theme.text,
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Configurações
              </h2>
              <p style={{ margin: 0, fontSize: '14px', color: theme.textSecondary }}>
                Personalize sua experiência
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px',
              color: theme.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.background = theme.border
              (e.target as HTMLButtonElement).style.color = theme.text
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.background = 'transparent'
              (e.target as HTMLButtonElement).style.color = theme.textSecondary
            }}
          >
            ✕
          </button>
        </div>

        {/* Seção Tema */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            color: theme.text
          }}>
            🎨 Aparência
          </h3>
          <div style={{
            background: theme.background,
            borderRadius: '12px',
            padding: '16px',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <span style={{ color: theme.text, fontSize: '14px', fontWeight: '500' }}>
                Modo Escuro
              </span>
              <button
                onClick={() => onThemeChange(!isDarkMode)}
                style={{
                  width: '48px',
                  height: '24px',
                  background: isDarkMode ? theme.success : '#e5e7eb',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: isDarkMode ? '26px' : '2px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }} />
              </button>
            </div>
          </div>
        </div>

        {/* Seção Acessibilidade */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            color: theme.text
          }}>
            ♿ Acessibilidade
          </h3>
          
          <div style={{
            background: theme.background,
            borderRadius: '12px',
            padding: '16px',
            border: `1px solid ${theme.border}`
          }}>
            {/* Alto Contraste */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div>
                <span style={{ color: theme.text, fontSize: '14px', fontWeight: '500' }}>
                  Alto Contraste
                </span>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: theme.textSecondary }}>
                  Aumenta o contraste das cores
                </p>
              </div>
              <button
                onClick={() => handleAltoContraste(!altoContraste)}
                style={{
                  width: '48px',
                  height: '24px',
                  background: altoContraste ? theme.success : '#e5e7eb',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: altoContraste ? '26px' : '2px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }} />
              </button>
            </div>

            {/* Fonte Maior */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div>
                <span style={{ color: theme.text, fontSize: '14px', fontWeight: '500' }}>
                  Fonte Maior
                </span>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: theme.textSecondary }}>
                  Aumenta o tamanho da fonte
                </p>
              </div>
              <button
                onClick={() => handleFonteMaior(!fonteMaior)}
                style={{
                  width: '48px',
                  height: '24px',
                  background: fonteMaior ? theme.success : '#e5e7eb',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: fonteMaior ? '26px' : '2px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }} />
              </button>
            </div>

            {/* Animações Reduzidas */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div>
                <span style={{ color: theme.text, fontSize: '14px', fontWeight: '500' }}>
                  Animações Reduzidas
                </span>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: theme.textSecondary }}>
                  Reduz movimentos e animações
                </p>
              </div>
              <button
                onClick={() => handleAnimacoesReduzidas(!animacoesReduzidas)}
                style={{
                  width: '48px',
                  height: '24px',
                  background: animacoesReduzidas ? theme.success : '#e5e7eb',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: animacoesReduzidas ? '26px' : '2px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }} />
              </button>
            </div>

            {/* Modo Daltonismo */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div>
                <span style={{ color: theme.text, fontSize: '14px', fontWeight: '500' }}>
                  Modo Daltonismo
                </span>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: theme.textSecondary }}>
                  Ajusta cores para daltonismo
                </p>
              </div>
              <button
                onClick={() => handleModoDaltonismo(!modoDaltonismo)}
                style={{
                  width: '48px',
                  height: '24px',
                  background: modoDaltonismo ? theme.success : '#e5e7eb',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: modoDaltonismo ? '26px' : '2px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }} />
              </button>
            </div>

            {/* Tipo de Daltonismo */}
            {modoDaltonismo && (
              <div style={{ marginTop: '12px' }}>
                <label style={{ 
                  color: theme.text, 
                  fontSize: '12px', 
                  fontWeight: '500',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Tipo de Daltonismo:
                </label>
                <select
                  value={tipoDaltonismo}
                  onChange={(e) => handleTipoDaltonismo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: theme.cardBg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    color: theme.text,
                    fontSize: '14px'
                  }}
                >
                  <option value="protanopia">Protanopia (Vermelho-verde)</option>
                  <option value="deuteranopia">Deuteranopia (Verde-vermelho)</option>
                  <option value="tritanopia">Tritanopia (Azul-amarelo)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Seção Sistema */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            color: theme.text
          }}>
            🔧 Sistema
          </h3>
          
          <div style={{
            background: theme.background,
            borderRadius: '12px',
            padding: '16px',
            border: `1px solid ${theme.border}`
          }}>
            <button
              onClick={handleAjuda}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: theme.buttonBg,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = theme.buttonHover}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = theme.buttonBg}
            >
              ❓ Ajuda
            </button>
            
            <button
              onClick={handleAtualizacao}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: theme.warning,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#d97706'}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = theme.warning}
            >
              🔄 Atualização
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          paddingTop: '16px',
          borderTop: `1px solid ${theme.border}`
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.background = theme.border
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.background = 'transparent'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
