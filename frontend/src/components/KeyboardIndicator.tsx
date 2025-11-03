import React, { useState, useEffect } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'
import { GLOBAL_SHORTCUTS, formatShortcut, groupShortcutsByCategory } from '../utils/globalShortcuts'

/**
 * Indicador visual de navegação por teclado ativa
 * Mostra badge azul "⌨️ Navegação Ativa [F1]" quando ativo
 */
export function KeyboardIndicator() {
  const { settings, getTheme } = useAccessibility()
  const theme = getTheme()
  const [showHelp, setShowHelp] = useState(false)

  // Log a cada render para debug
  console.log('🔵 KeyboardIndicator RENDERIZADO')
  console.log('   settings.keyboardNavigation:', settings.keyboardNavigation)
  
  // Atualizar visibilidade quando settings mudar
  useEffect(() => {
    console.log('🔄 KeyboardIndicator - useEffect disparado!')
    console.log('   Novo valor keyboardNavigation:', settings.keyboardNavigation)
  }, [settings.keyboardNavigation])

  // Só renderizar se estiver ativo
  if (!settings.keyboardNavigation) {
    console.log('   ❌ Badge OCULTO (return null)')
    return null
  }
  
  console.log('   ✅ Badge VISÍVEL (renderizando...)')

  const grouped = groupShortcutsByCategory(GLOBAL_SHORTCUTS)

  return (
    <>
      {/* Badge indicador */}
      <div
        onClick={() => setShowHelp(!showHelp)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#3b82f6',
          color: '#fff',
          padding: '10px 16px',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          cursor: 'pointer',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: '600',
          transition: 'all 0.3s ease',
          border: '2px solid rgba(255, 255, 255, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)'
        }}
        title="Clique para ver atalhos disponíveis (ou pressione F1)"
      >
        <span style={{ fontSize: '16px' }}>⌨️</span>
        <span>Navegação Ativa</span>
        <span style={{ 
          fontSize: '10px', 
          backgroundColor: 'rgba(255, 255, 255, 0.3)', 
          padding: '2px 6px', 
          borderRadius: '4px' 
        }}>
          F1
        </span>
      </div>

      {/* Painel de ajuda */}
      {showHelp && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowHelp(false)}
        >
          <div
            style={{
              backgroundColor: theme.surface,
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: `2px solid ${theme.border}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: `2px solid ${theme.border}`
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 'bold',
                color: theme.text,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '28px' }}>⌨️</span>
                Atalhos de Teclado
              </h2>
              <button
                onClick={() => setShowHelp(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: theme.textSecondary,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.border
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                ✕
              </button>
            </div>

            {/* Categorias */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {Object.entries(grouped).map(([category, shortcuts]) => {
                if (shortcuts.length === 0) return null

                const categoryIcons = {
                  navegacao: '🧭',
                  edicao: '✏️',
                  sistema: '⚙️'
                }

                const categoryNames = {
                  navegacao: 'Navegação',
                  edicao: 'Edição',
                  sistema: 'Sistema'
                }

                return (
                  <div key={category}>
                    <h3 style={{
                      margin: '0 0 12px 0',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: theme.text,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
                      {categoryNames[category as keyof typeof categoryNames]}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {shortcuts.map((shortcut) => (
                        <div
                          key={shortcut.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            backgroundColor: theme.background,
                            borderRadius: '6px',
                            border: `1px solid ${theme.border}`
                          }}
                        >
                          <span style={{
                            fontSize: '14px',
                            color: theme.text
                          }}>
                            {shortcut.description}
                          </span>
                          <kbd style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            padding: '4px 8px',
                            backgroundColor: theme.surface,
                            border: `2px solid ${theme.border}`,
                            borderRadius: '4px',
                            color: theme.primary,
                            fontFamily: 'monospace',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}>
                            {formatShortcut(shortcut)}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: theme.background,
              borderRadius: '8px',
              border: `1px solid ${theme.border}`
            }}>
              <p style={{
                margin: 0,
                fontSize: '12px',
                color: theme.textSecondary,
                lineHeight: '1.5'
              }}>
                💡 <strong>Dica:</strong> Pressione <kbd style={{
                  padding: '2px 6px',
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '3px',
                  fontFamily: 'monospace'
                }}>F1</kbd> a qualquer momento para ver esta ajuda.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

