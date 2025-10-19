import { useState, useEffect } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'

interface ConfiguracoesPageProps {
  onClose: () => void
  isDarkMode: boolean
  onThemeChange: (isDark: boolean) => void
}

export function ConfiguracoesPage({ onClose, isDarkMode, onThemeChange }: ConfiguracoesPageProps) {
  const { 
    settings, 
    updateSettings, 
    setTheme, 
    getTheme, 
    setContrastLevel, 
    toggleHighContrast,
    toggleBlueLightFilter,
    setBlueLightIntensity,
    contrastPresets,
    blueLightPresets 
  } = useAccessibility()
  const [modoDaltonismo, setModoDaltonismo] = useState(false)
  const [tipoDaltonismo, setTipoDaltonismo] = useState('protanopia')

  // Carregar configurações salvas
  useEffect(() => {
    const savedModoDaltonismo = localStorage.getItem('modoDaltonismo') === 'true'
    const savedTipoDaltonismo = localStorage.getItem('tipoDaltonismo') || 'protanopia'

    setModoDaltonismo(savedModoDaltonismo)
    setTipoDaltonismo(savedTipoDaltonismo)
  }, [])

  // Salvar configurações
  const salvarConfiguracao = (chave: string, valor: boolean | string) => {
    localStorage.setItem(chave, valor.toString())
  }

  const handleAltoContraste = (ativo: boolean) => {
    updateSettings({ highContrast: ativo })
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
      document.body.style.filter = 'none'
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

  const handleTamanhoFonte = (tamanho: 'padrao' | 'grande') => {
    updateSettings({ fontSize: tamanho })
  }

  const handleAnimacoesReduzidas = (ativo: boolean) => {
    updateSettings({ reducedMotion: ativo })
  }

  const theme = getTheme()

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
      <div className="config-container" style={{
        background: theme.surface,
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '20px',
        maxWidth: '800px',
        width: '95%',
        maxHeight: '85vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: `1px solid ${theme.border}`
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>
              ⚙️
            </div>
            <div>
              <h2 style={{ 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: '700',
                color: theme.text
              }}>
                Configurações
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary }}>
                Personalize sua experiência
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              fontSize: '16px',
              color: theme.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.background = '#e5e7eb'
              (e.target as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.background = '#f3f4f6'
              (e.target as HTMLButtonElement).style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Conteúdo em 2 colunas */}
        <div className="config-content" style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          maxHeight: '60vh',
          overflowY: 'auto',
          paddingRight: '8px'
        }}>
          {/* Coluna 1: Desempenho e Aparência */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Seção Desempenho */}
            <div style={{
              background: theme.background,
              borderRadius: '10px',
              padding: '16px',
              border: `1px solid ${theme.border}`,
              height: 'fit-content'
            }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '16px', 
                fontWeight: '600',
                color: theme.text,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ⚡ Desempenho
              </h3>

              {/* Navegação por Teclado */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: `1px solid ${theme.border}`
              }}>
                <div>
                  <span style={{ color: theme.text, fontSize: '14px', fontWeight: '500' }}>
                    Navegação por Teclado
                  </span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: theme.textSecondary }}>
                    Melhora a navegação usando apenas o teclado
                  </p>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '44px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    checked={settings.keyboardNavigation}
                    onChange={(e) => updateSettings({ keyboardNavigation: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: settings.keyboardNavigation ? '#10b981' : '#f3f4f6',
                    transition: '0.3s',
                    borderRadius: '24px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: '3px',
                      bottom: '3px',
                      background: 'white',
                      transition: '0.3s',
                      borderRadius: '50%',
                      transform: settings.keyboardNavigation ? 'translateX(20px)' : 'translateX(0)'
                    }} />
                  </span>
                </label>
              </div>

              {/* Comandos de Teclado */}
              {settings.keyboardNavigation && (
                <div style={{ padding: '8px 0', borderBottom: `1px solid ${theme.border}` }}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: theme.text, fontSize: '12px', fontWeight: '600' }}>
                      Comandos Disponíveis:
                    </span>
                  </div>
                  
                  {/* Tab Navigation */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    marginBottom: '4px'
                  }}>
                    <div>
                      <span style={{ color: theme.text, fontSize: '12px', fontWeight: '500' }}>
                        Tab Navigation
                      </span>
                      <p style={{ margin: '1px 0 0 0', fontSize: '10px', color: theme.textSecondary }}>
                        Tab / Shift+Tab - Navegar entre elementos
                      </p>
                    </div>
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '36px',
                      height: '20px'
                    }}>
                      <input
                        type="checkbox"
                        checked={settings.keyboardCommands?.tabNavigation !== false}
                        onChange={(e) => updateSettings({ 
                          keyboardCommands: { 
                            ...settings.keyboardCommands, 
                            tabNavigation: e.target.checked 
                          } 
                        })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: (settings.keyboardCommands?.tabNavigation !== false) ? '#10b981' : '#f3f4f6',
                        transition: '0.3s',
                        borderRadius: '20px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '""',
                          height: '14px',
                          width: '14px',
                          left: '3px',
                          bottom: '3px',
                          background: 'white',
                          transition: '0.3s',
                          borderRadius: '50%',
                          transform: (settings.keyboardCommands?.tabNavigation !== false) ? 'translateX(16px)' : 'translateX(0)'
                        }} />
                      </span>
                    </label>
                  </div>

                  {/* Arrow Keys */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    marginBottom: '4px'
                  }}>
                    <div>
                      <span style={{ color: theme.text, fontSize: '12px', fontWeight: '500' }}>
                        Setas de Navegação
                      </span>
                      <p style={{ margin: '1px 0 0 0', fontSize: '10px', color: theme.textSecondary }}>
                        ↑↓←→ - Navegar em listas e menus
                      </p>
                    </div>
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '36px',
                      height: '20px'
                    }}>
                      <input
                        type="checkbox"
                        checked={settings.keyboardCommands?.arrowKeys !== false}
                        onChange={(e) => updateSettings({ 
                          keyboardCommands: { 
                            ...settings.keyboardCommands, 
                            arrowKeys: e.target.checked 
                          } 
                        })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: (settings.keyboardCommands?.arrowKeys !== false) ? '#10b981' : '#f3f4f6',
                        transition: '0.3s',
                        borderRadius: '20px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '""',
                          height: '14px',
                          width: '14px',
                          left: '3px',
                          bottom: '3px',
                          background: 'white',
                          transition: '0.3s',
                          borderRadius: '50%',
                          transform: (settings.keyboardCommands?.arrowKeys !== false) ? 'translateX(16px)' : 'translateX(0)'
                        }} />
                      </span>
                    </label>
                  </div>

                  {/* Enter/Space */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    marginBottom: '4px'
                  }}>
                    <div>
                      <span style={{ color: theme.text, fontSize: '12px', fontWeight: '500' }}>
                        Enter/Space
                      </span>
                      <p style={{ margin: '1px 0 0 0', fontSize: '10px', color: theme.textSecondary }}>
                        Enter/Space - Ativar botões e links
                      </p>
                    </div>
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '36px',
                      height: '20px'
                    }}>
                      <input
                        type="checkbox"
                        checked={settings.keyboardCommands?.enterSpace !== false}
                        onChange={(e) => updateSettings({ 
                          keyboardCommands: { 
                            ...settings.keyboardCommands, 
                            enterSpace: e.target.checked 
                          } 
                        })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: (settings.keyboardCommands?.enterSpace !== false) ? '#10b981' : '#f3f4f6',
                        transition: '0.3s',
                        borderRadius: '20px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '""',
                          height: '14px',
                          width: '14px',
                          left: '3px',
                          bottom: '3px',
                          background: 'white',
                          transition: '0.3s',
                          borderRadius: '50%',
                          transform: (settings.keyboardCommands?.enterSpace !== false) ? 'translateX(16px)' : 'translateX(0)'
                        }} />
                      </span>
                    </label>
                  </div>

                  {/* Escape */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    marginBottom: '4px'
                  }}>
                    <div>
                      <span style={{ color: theme.text, fontSize: '12px', fontWeight: '500' }}>
                        Escape
                      </span>
                      <p style={{ margin: '1px 0 0 0', fontSize: '10px', color: theme.textSecondary }}>
                        Esc - Fechar modais e cancelar ações
                      </p>
                    </div>
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '36px',
                      height: '20px'
                    }}>
                      <input
                        type="checkbox"
                        checked={settings.keyboardCommands?.escape !== false}
                        onChange={(e) => updateSettings({ 
                          keyboardCommands: { 
                            ...settings.keyboardCommands, 
                            escape: e.target.checked 
                          } 
                        })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: (settings.keyboardCommands?.escape !== false) ? '#10b981' : '#f3f4f6',
                        transition: '0.3s',
                        borderRadius: '20px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '""',
                          height: '14px',
                          width: '14px',
                          left: '3px',
                          bottom: '3px',
                          background: 'white',
                          transition: '0.3s',
                          borderRadius: '50%',
                          transform: (settings.keyboardCommands?.escape !== false) ? 'translateX(16px)' : 'translateX(0)'
                        }} />
                      </span>
                    </label>
                  </div>

                  {/* Shortcuts */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 0'
                  }}>
                    <div>
                      <span style={{ color: theme.text, fontSize: '12px', fontWeight: '500' }}>
                        Atalhos Rápidos
                      </span>
                      <p style={{ margin: '1px 0 0 0', fontSize: '10px', color: theme.textSecondary }}>
                        Ctrl+1-9 - Acessar menus rapidamente
                      </p>
                    </div>
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '36px',
                      height: '20px'
                    }}>
                      <input
                        type="checkbox"
                        checked={settings.keyboardCommands?.shortcuts !== false}
                        onChange={(e) => updateSettings({ 
                          keyboardCommands: { 
                            ...settings.keyboardCommands, 
                            shortcuts: e.target.checked 
                          } 
                        })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: (settings.keyboardCommands?.shortcuts !== false) ? '#10b981' : '#f3f4f6',
                        transition: '0.3s',
                        borderRadius: '20px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '""',
                          height: '14px',
                          width: '14px',
                          left: '3px',
                          bottom: '3px',
                          background: 'white',
                          transition: '0.3s',
                          borderRadius: '50%',
                          transform: (settings.keyboardCommands?.shortcuts !== false) ? 'translateX(16px)' : 'translateX(0)'
                        }} />
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Seção Aparência */}
            <div style={{
              background: theme.background,
              borderRadius: '10px',
              padding: '16px',
              border: `1px solid ${theme.border}`,
              height: 'fit-content'
            }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '16px', 
                fontWeight: '600',
                color: theme.text,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🎨 Aparência
              </h3>

            {/* Modo Escuro/Claro */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: `1px solid ${theme.border}`
            }}>
              <div>
                <span style={{ color: theme.text, fontSize: '14px', fontWeight: '500' }}>
                  Modo Escuro/Claro
                </span>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: theme.textSecondary }}>
                  Alternar entre tema claro e escuro
                </p>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '44px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={() => {
                    const newTheme = isDarkMode ? 'light' : 'dark'
                    setTheme(newTheme)
                    onThemeChange(!isDarkMode)
                  }}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: isDarkMode ? '#10b981' : '#f3f4f6',
                  transition: '0.3s',
                  borderRadius: '24px'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: '3px',
                    bottom: '3px',
                    background: 'white',
                    transition: '0.3s',
                    borderRadius: '50%',
                    transform: isDarkMode ? 'translateX(20px)' : 'translateX(0)'
                  }} />
                </span>
              </label>
            </div>

            {/* Filtro de Luz Azul */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: `1px solid ${theme.border}`
            }}>
              <div>
                <span style={{ color: theme.text, fontSize: '14px', fontWeight: '500' }}>
                  Filtro de Luz Azul
                </span>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: theme.textSecondary }}>
                  Reduz a luz azul para evitar cansaço visual
                </p>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '44px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={settings.blueLightFilter}
                  onChange={toggleBlueLightFilter}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: settings.blueLightFilter ? '#10b981' : '#f3f4f6',
                  transition: '0.3s',
                  borderRadius: '24px'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: '3px',
                    bottom: '3px',
                    background: 'white',
                    transition: '0.3s',
                    borderRadius: '50%',
                    transform: settings.blueLightFilter ? 'translateX(20px)' : 'translateX(0)'
                  }} />
                </span>
              </label>
            </div>

            {/* Intensidade do Filtro Azul */}
            {settings.blueLightFilter && (
              <div style={{ padding: '8px 0', borderBottom: `1px solid ${theme.border}` }}>
                <label style={{ 
                  color: theme.text, 
                  fontSize: '12px', 
                  fontWeight: '500',
                  marginBottom: '6px',
                  display: 'block'
                }}>
                  Intensidade:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {Object.entries(blueLightPresets).map(([key, preset]) => (
                    <label key={key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: settings.blueLightIntensity === key ? theme.primary + '15' : 'transparent',
                      border: `1px solid ${settings.blueLightIntensity === key ? theme.primary : theme.border}`,
                      transition: 'all 0.2s ease'
                    }}>
                      <input
                        type="radio"
                        name="blueLightIntensity"
                        value={key}
                        checked={settings.blueLightIntensity === key}
                        onChange={() => setBlueLightIntensity(key as any)}
                        style={{ 
                          marginRight: '8px', 
                          width: '14px',
                          height: '14px',
                          accentColor: theme.primary
                        }}
                      />
                      <div>
                        <div style={{ 
                          fontSize: '11px', 
                          fontWeight: '500',
                          color: theme.text 
                        }}>
                          {preset.name}
                        </div>
                        <div style={{ 
                          fontSize: '9px', 
                          color: theme.textSecondary 
                        }}>
                          {preset.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Tamanho da Fonte */}
            <div style={{ padding: '8px 0' }}>
              <label htmlFor="fontSize" style={{ 
                color: theme.text, 
                fontSize: '14px', 
                fontWeight: '500',
                marginBottom: '6px',
                display: 'block'
              }}>
                Tamanho da Fonte
              </label>
              <select
                id="fontSize"
                value={settings.fontSize}
                onChange={(e) => handleTamanhoFonte(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '13px',
                  border: 'none',
                  borderRadius: '20px',
                  background: '#f3f4f6',
                  color: theme.text,
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '16px',
                  paddingRight: '32px'
                }}
              >
                <option value="padrao">Padrão</option>
                <option value="grande">Grande</option>
              </select>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: theme.textSecondary }}>
                Ajusta o tamanho do texto em todo o sistema
              </p>
            </div>
            </div>
          </div>

          {/* Coluna 2: Acessibilidade */}
          <div style={{
            background: theme.background,
            borderRadius: '10px',
            padding: '16px',
            border: `1px solid ${theme.border}`,
            height: 'fit-content'
          }}>
            <h3 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '16px', 
              fontWeight: '600',
              color: theme.text,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ♿ Acessibilidade
            </h3>

            {/* Alto Contraste */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: `1px solid ${theme.border}`
            }}>
              <div>
                <span style={{ color: theme.text, fontSize: '14px', fontWeight: '500' }}>
                  Alto Contraste
                </span>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: theme.textSecondary }}>
                  Aumenta o contraste das cores
                </p>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '44px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={toggleHighContrast}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: settings.highContrast ? '#10b981' : '#f3f4f6',
                  transition: '0.3s',
                  borderRadius: '24px'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: '3px',
                    bottom: '3px',
                    background: 'white',
                    transition: '0.3s',
                    borderRadius: '50%',
                    transform: settings.highContrast ? 'translateX(20px)' : 'translateX(0)'
                  }} />
                </span>
              </label>
            </div>

            {/* Níveis de Contraste */}
            {settings.highContrast && (
              <div style={{ padding: '8px 0', borderBottom: `1px solid ${theme.border}` }}>
                <label style={{ 
                  color: theme.text, 
                  fontSize: '12px', 
                  fontWeight: '500',
                  marginBottom: '6px',
                  display: 'block'
                }}>
                  Nível de Contraste:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {Object.entries(contrastPresets).map(([key, preset]) => (
                    <label key={key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: settings.contrastLevel === key ? theme.primary + '15' : 'transparent',
                      border: `1px solid ${settings.contrastLevel === key ? theme.primary : theme.border}`,
                      transition: 'all 0.2s ease'
                    }}>
                      <input
                        type="radio"
                        name="contrastLevel"
                        value={key}
                        checked={settings.contrastLevel === key}
                        onChange={() => setContrastLevel(key as any)}
                        style={{ 
                          marginRight: '8px', 
                          width: '14px',
                          height: '14px',
                          accentColor: theme.primary
                        }}
                      />
                      <div>
                        <div style={{ 
                          fontSize: '11px', 
                          fontWeight: '500',
                          color: theme.text 
                        }}>
                          {preset.name}
                        </div>
                        <div style={{ 
                          fontSize: '9px', 
                          color: theme.textSecondary 
                        }}>
                          {preset.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Redução de Movimento */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: `1px solid ${theme.border}`
            }}>
              <div>
                <span style={{ color: theme.text, fontSize: '14px', fontWeight: '500' }}>
                  Reduzir Movimento
                </span>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: theme.textSecondary }}>
                  Desativa animações para usuários sensíveis
                </p>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '44px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: settings.reducedMotion ? '#10b981' : '#f3f4f6',
                  transition: '0.3s',
                  borderRadius: '24px'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: '3px',
                    bottom: '3px',
                    background: 'white',
                    transition: '0.3s',
                    borderRadius: '50%',
                    transform: settings.reducedMotion ? 'translateX(20px)' : 'translateX(0)'
                  }} />
                </span>
              </label>
            </div>

            {/* Leitor de Tela */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: `1px solid ${theme.border}`
            }}>
              <div>
                <span style={{ color: theme.text, fontSize: '14px', fontWeight: '500' }}>
                  Leitor de Tela
                </span>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: theme.textSecondary }}>
                  Otimiza a interface para leitores de tela
                </p>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '44px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={settings.screenReader}
                  onChange={() => updateSettings({ screenReader: !settings.screenReader })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: settings.screenReader ? '#10b981' : '#f3f4f6',
                  transition: '0.3s',
                  borderRadius: '24px'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: '3px',
                    bottom: '3px',
                    background: 'white',
                    transition: '0.3s',
                    borderRadius: '50%',
                    transform: settings.screenReader ? 'translateX(20px)' : 'translateX(0)'
                  }} />
                </span>
              </label>
            </div>


            {/* Modo Daltonismo */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0'
            }}>
              <div>
                <span style={{ color: theme.text, fontSize: '14px', fontWeight: '500' }}>
                  Modo Daltonismo
                </span>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: theme.textSecondary }}>
                  Ajusta as cores para diferentes tipos de daltonismo
                </p>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '44px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={modoDaltonismo}
                  onChange={() => handleModoDaltonismo(!modoDaltonismo)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: modoDaltonismo ? '#10b981' : '#f3f4f6',
                  transition: '0.3s',
                  borderRadius: '24px'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: '3px',
                    bottom: '3px',
                    background: 'white',
                    transition: '0.3s',
                    borderRadius: '50%',
                    transform: modoDaltonismo ? 'translateX(20px)' : 'translateX(0)'
                  }} />
                </span>
              </label>
            </div>

            {modoDaltonismo && (
              <div style={{ padding: '8px 0' }}>
                <label htmlFor="tipoDaltonismo" style={{ 
                  color: theme.text, 
                  fontSize: '12px', 
                  fontWeight: '500',
                  marginBottom: '6px',
                  display: 'block'
                }}>
                  Tipo de Daltonismo
                </label>
                <select
                  id="tipoDaltonismo"
                  value={tipoDaltonismo}
                  onChange={(e) => handleTipoDaltonismo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    fontSize: '13px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    background: theme.background,
                    color: theme.text,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="protanopia">Protanopia</option>
                  <option value="deuteranopia">Deuteranopia</option>
                  <option value="tritanopia">Tritanopia</option>
                </select>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: theme.textSecondary }}>
                  Ajusta as cores para o tipo de daltonismo selecionado
                </p>
              </div>
            )}


          </div>
        </div>




        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          paddingTop: '12px',
          borderTop: `1px solid ${theme.border}`,
          marginTop: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: '#f3f4f6',
              color: theme.text,
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.background = '#e5e7eb'
              (e.target as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.background = '#f3f4f6'
              (e.target as HTMLButtonElement).style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}