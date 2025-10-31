// RecepcaoArquivosPage.tsx
// Janela unificada para Recepção de Arquivos (Funerária e Maternidade)

import React, { useState } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { RecepcaoArquivoFunerariaPage } from './RecepcaoArquivoFunerariaPage'
import { RecepcaoArquivoMaternidadePage } from './RecepcaoArquivoMaternidadePage'

interface RecepcaoArquivosPageProps {
  onClose: () => void
  resetToOriginalPosition?: boolean
}

export function RecepcaoArquivosPage({ onClose, resetToOriginalPosition }: RecepcaoArquivosPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
  const [abaAtiva, setAbaAtiva] = useState<'funeraria' | 'maternidade'>('funeraria')

  const tabStyles = (isActive: boolean) => ({
    padding: '8px 20px',
    fontSize: '13px',
    fontWeight: '600' as const,
    border: 'none',
    borderBottom: isActive ? `3px solid ${headerColor}` : '3px solid transparent',
    backgroundColor: isActive ? theme.surface : 'transparent',
    color: isActive ? theme.text : theme.textSecondary,
    cursor: 'pointer',
    transition: 'all 0.2s',
    flex: 1
  })

  return (
    <BasePage
      title="Recepção de Arquivos"
      onClose={onClose}
      width="1000px"
      height="700px"
      minWidth="1000px"
      minHeight="700px"
      headerColor={headerColor}
      resetToOriginalPosition={resetToOriginalPosition}
      draggable={true}
      resizable={false}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        {/* Abas */}
        <div style={{
          display: 'flex',
          borderBottom: `2px solid ${theme.border}`,
          backgroundColor: theme.background
        }}>
          <button
            onClick={() => setAbaAtiva('funeraria')}
            style={tabStyles(abaAtiva === 'funeraria')}
            onMouseEnter={(e) => {
              if (abaAtiva !== 'funeraria') {
                e.currentTarget.style.backgroundColor = theme.border
              }
            }}
            onMouseLeave={(e) => {
              if (abaAtiva !== 'funeraria') {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            ⚰️ Funerária
          </button>
          
          <button
            onClick={() => setAbaAtiva('maternidade')}
            style={tabStyles(abaAtiva === 'maternidade')}
            onMouseEnter={(e) => {
              if (abaAtiva !== 'maternidade') {
                e.currentTarget.style.backgroundColor = theme.border
              }
            }}
            onMouseLeave={(e) => {
              if (abaAtiva !== 'maternidade') {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            👶 Maternidade
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {abaAtiva === 'funeraria' ? (
            <RecepcaoArquivoFunerariaPage 
              onClose={onClose}
              hideHeader={true}
            />
          ) : (
            <RecepcaoArquivoMaternidadePage 
              onClose={onClose}
              hideHeader={true}
            />
          )}
        </div>
      </div>
    </BasePage>
  )
}

