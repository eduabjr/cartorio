import { useState } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'
import { useResponsive } from '../hooks/useResponsive'
import { AccessibleButton } from '../components/AccessibleButton'
import { useFeedback } from '../components/FeedbackSystem'

interface AccessibilitySettingsPageProps {
  onClose: () => void
  isDarkMode: boolean
}

export function AccessibilitySettingsPage({ onClose, isDarkMode }: AccessibilitySettingsPageProps) {
  const accessibility = useAccessibility()
  const responsive = useResponsive()
  const feedback = useFeedback()
  
  const [localSettings, setLocalSettings] = useState(accessibility.settings)

  const theme = accessibility.getTheme()

  const handleSettingChange = (setting: keyof typeof localSettings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }

  const handleSaveSettings = () => {
    accessibility.updateSettings(localSettings)
    feedback.showSuccess(
      'Configurações Salvas',
      'Suas configurações de acessibilidade foram salvas com sucesso.',
      { duration: 3000 }
    )
  }

  const handleResetSettings = () => {
    const defaultSettings = {
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium' as const,
      screenReader: false,
      keyboardNavigation: false
    }
    setLocalSettings(defaultSettings)
    accessibility.updateSettings(defaultSettings)
    feedback.showInfo(
      'Configurações Restauradas',
      'As configurações foram restauradas para os valores padrão.',
      { duration: 3000 }
    )
  }

  const containerStyles = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.background,
    display: 'flex',
    flexDirection: 'column' as const,
    zIndex: 1
  }

  const headerStyles = {
    padding: '20px',
    borderBottom: `1px solid ${theme.border}`,
    backgroundColor: theme.surface,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }

  const contentStyles = {
    flex: 1,
    padding: '20px',
    overflow: 'auto' as const,
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%'
  }

  const sectionStyles = {
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px'
  }

  const settingRowStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: `1px solid ${theme.border}`,
    gap: '20px'
  }

  const labelStyles = {
    fontSize: '16px',
    fontWeight: '500',
    color: theme.text,
    minWidth: '200px'
  }

  const descriptionStyles = {
    fontSize: '14px',
    color: theme.textSecondary,
    marginTop: '4px'
  }

  const checkboxStyles = {
    width: '20px',
    height: '20px',
    accentColor: theme.primary
  }

  const selectStyles = {
    padding: '8px 12px',
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    backgroundColor: theme.surface,
    color: theme.text,
    fontSize: '14px',
    minWidth: '120px'
  }

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '24px', 
          color: theme.text,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span aria-hidden="true">♿</span>
          Configurações de Acessibilidade
        </h1>
        <AccessibleButton
          onClick={onClose}
          variant="secondary"
          ariaLabel="Fechar configurações"
        >
          ✕ Fechar
        </AccessibleButton>
      </div>

      {/* Content */}
      <div style={contentStyles}>
        {/* Seção de Visão */}
        <div style={sectionStyles}>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '20px', 
            color: theme.text 
          }}>
            👁️ Configurações de Visão
          </h2>
          
          <div style={settingRowStyles}>
            <div>
              <div style={labelStyles}>Alto Contraste</div>
              <div style={descriptionStyles}>
                Aumenta o contraste entre texto e fundo para melhor legibilidade
              </div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.highContrast}
              onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
              style={checkboxStyles}
              aria-describedby="high-contrast-description"
            />
          </div>

          <div style={settingRowStyles}>
            <div>
              <div style={labelStyles}>Tamanho da Fonte</div>
              <div style={descriptionStyles}>
                Ajusta o tamanho do texto em todo o sistema
              </div>
            </div>
            <select
              value={localSettings.fontSize}
              onChange={(e) => handleSettingChange('fontSize', e.target.value)}
              style={selectStyles}
              aria-describedby="font-size-description"
            >
              <option value="small">Pequeno</option>
              <option value="medium">Médio</option>
              <option value="large">Grande</option>
              <option value="extra-large">Extra Grande</option>
            </select>
          </div>
        </div>

        {/* Seção de Movimento */}
        <div style={sectionStyles}>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '20px', 
            color: theme.text 
          }}>
            🎭 Configurações de Movimento
          </h2>
          
          <div style={settingRowStyles}>
            <div>
              <div style={labelStyles}>Movimento Reduzido</div>
              <div style={descriptionStyles}>
                Reduz animações e transições para usuários sensíveis ao movimento
              </div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.reducedMotion}
              onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
              style={checkboxStyles}
              aria-describedby="reduced-motion-description"
            />
          </div>
        </div>

        {/* Seção de Navegação */}
        <div style={sectionStyles}>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '20px', 
            color: theme.text 
          }}>
            ⌨️ Configurações de Navegação
          </h2>
          
          <div style={settingRowStyles}>
            <div>
              <div style={labelStyles}>Navegação por Teclado</div>
              <div style={descriptionStyles}>
                Melhora o suporte para navegação usando apenas o teclado
              </div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.keyboardNavigation}
              onChange={(e) => handleSettingChange('keyboardNavigation', e.target.checked)}
              style={checkboxStyles}
              aria-describedby="keyboard-nav-description"
            />
          </div>

          <div style={settingRowStyles}>
            <div>
              <div style={labelStyles}>Leitor de Tela</div>
              <div style={descriptionStyles}>
                Otimiza a interface para leitores de tela (detectado automaticamente)
              </div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.screenReader}
              onChange={(e) => handleSettingChange('screenReader', e.target.checked)}
              style={checkboxStyles}
              disabled
              aria-describedby="screen-reader-description"
            />
          </div>
        </div>

        {/* Seção de Tema */}
        <div style={sectionStyles}>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '20px', 
            color: theme.text 
          }}>
            🎨 Configurações de Tema
          </h2>
          
          <div style={settingRowStyles}>
            <div>
              <div style={labelStyles}>Tema do Sistema</div>
              <div style={descriptionStyles}>
                Escolha entre tema claro, escuro ou alto contraste
              </div>
            </div>
            <select
              value={accessibility.currentTheme}
              onChange={(e) => accessibility.setTheme(e.target.value as any)}
              style={selectStyles}
              aria-describedby="theme-description"
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
              <option value="highContrast">Alto Contraste</option>
            </select>
          </div>
        </div>

        {/* Botões de Ação */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginTop: '20px'
        }}>
          <AccessibleButton
            onClick={handleSaveSettings}
            variant="primary"
            icon="💾"
          >
            Salvar Configurações
          </AccessibleButton>
          
          <AccessibleButton
            onClick={handleResetSettings}
            variant="secondary"
            icon="🔄"
          >
            Restaurar Padrão
          </AccessibleButton>
        </div>
      </div>
    </div>
  )
}
