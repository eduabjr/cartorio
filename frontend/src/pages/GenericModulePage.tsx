import { useState } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'
import { useResponsive } from '../hooks/useResponsive'
import { AccessibleButton } from '../components/AccessibleButton'
import { useFeedback } from '../components/FeedbackSystem'

interface GenericModulePageProps {
  onClose: () => void
  isDarkMode: boolean
  moduleName: string
  moduleIcon?: string
  moduleDescription?: string
}

export function GenericModulePage({ 
  onClose, 
  isDarkMode, 
  moduleName, 
  moduleIcon = '📋',
  moduleDescription = 'Módulo do sistema de cartório'
}: GenericModulePageProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  // Hooks de acessibilidade e responsividade
  const accessibility = useAccessibility()
  const responsive = useResponsive()
  const feedback = useFeedback()

  const accessibilityTheme = accessibility.getTheme()
  const theme = {
    background: accessibilityTheme.background,
    cardBg: accessibilityTheme.surface,
    text: accessibilityTheme.text,
    textSecondary: accessibilityTheme.textSecondary,
    border: accessibilityTheme.border,
    buttonBg: accessibilityTheme.primary,
    buttonHover: accessibilityTheme.accent,
    success: accessibilityTheme.success,
    warning: accessibilityTheme.warning,
    error: accessibilityTheme.error
  }

  const handleAction = (action: string) => {
    setIsLoading(true)
    console.log(`Ação executada: ${action}`)
    
    // Simular delay
    setTimeout(() => {
      setIsLoading(false)
      
      // Mostrar feedback
      feedback.showSuccess(
        'Ação Executada',
        `A operação "${action}" foi realizada com sucesso.`,
        { duration: 3000 }
      )
    }, 1000)
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
        borderRadius: '8px',
        width: '90%',
        height: '80%',
        maxWidth: '1000px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: `1px solid ${theme.border}`
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              fontSize: '24px',
              width: '40px',
              height: '40px',
              background: theme.buttonBg,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {moduleIcon}
            </div>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '600',
                color: theme.text
              }}>
                {moduleName}
              </h2>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: theme.textSecondary
              }}>
                {moduleDescription}
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
              borderRadius: '6px',
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

        {/* Content */}
        <div style={{
          flex: 1,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '16px'
          }}>
            {moduleIcon}
          </div>
          
          <h3 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: theme.text,
            margin: 0,
            textAlign: 'center'
          }}>
            {moduleName}
          </h3>
          
          <p style={{
            fontSize: '16px',
            color: theme.textSecondary,
            textAlign: 'center',
            margin: 0,
            maxWidth: '500px',
            lineHeight: '1.6'
          }}>
            {moduleDescription}
          </p>

          <div style={{
            display: 'flex',
            gap: '16px',
            marginTop: '24px'
          }}>
            <button
              onClick={() => handleAction('Novo')}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                background: isLoading ? theme.textSecondary : theme.buttonBg,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                if (!isLoading) (e.target as HTMLButtonElement).style.background = theme.buttonHover
              }}
              onMouseOut={(e) => {
                if (!isLoading) (e.target as HTMLButtonElement).style.background = theme.buttonBg
              }}
            >
              📄 Novo
            </button>
            
            <button
              onClick={() => handleAction('Consultar')}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                background: isLoading ? theme.textSecondary : theme.success,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                if (!isLoading) (e.target as HTMLButtonElement).style.background = '#059669'
              }}
              onMouseOut={(e) => {
                if (!isLoading) (e.target as HTMLButtonElement).style.background = theme.success
              }}
            >
              🔍 Consultar
            </button>
            
            <button
              onClick={() => handleAction('Relatório')}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                background: isLoading ? theme.textSecondary : theme.warning,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                if (!isLoading) (e.target as HTMLButtonElement).style.background = '#d97706'
              }}
              onMouseOut={(e) => {
                if (!isLoading) (e.target as HTMLButtonElement).style.background = theme.warning
              }}
            >
              📊 Relatório
            </button>
          </div>

          {isLoading && (
            <div style={{
              marginTop: '16px',
              padding: '12px 24px',
              background: theme.buttonBg,
              color: 'white',
              borderRadius: '6px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⏳ Processando...
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'center',
          background: theme.cardBg
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: theme.error,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#dc2626'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = theme.error}
          >
            🚪 Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
