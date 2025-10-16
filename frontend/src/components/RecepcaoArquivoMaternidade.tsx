import { useState, useRef } from 'react'
import { offlineService } from '../services/OfflineService'

interface RecepcaoArquivoMaternidadeProps {
  onClose: () => void
  isDarkMode: boolean
}

export function RecepcaoArquivoMaternidade({ onClose, isDarkMode }: RecepcaoArquivoMaternidadeProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [resultado, setResultado] = useState<{ importados: number, erros: number } | null>(null)
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setArquivoSelecionado(file)
      setResultado(null)
    }
  }

  const handleImport = async () => {
    if (!arquivoSelecionado) return

    setIsLoading(true)
    try {
      const text = await arquivoSelecionado.text()
      const resultado = await offlineService.importarDados(text)
      setResultado(resultado)
      
      if (resultado.importados > 0) {
        alert(`✅ Importação concluída!\n📥 Registros importados: ${resultado.importados}\n❌ Erros: ${resultado.erros}`)
      } else {
        alert(`❌ Nenhum registro foi importado.\nErros: ${resultado.erros}`)
      }
    } catch (error) {
      alert('❌ Erro ao importar arquivo: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setArquivoSelecionado(file)
        setResultado(null)
      } else {
        alert('❌ Por favor, selecione apenas arquivos JSON (.json)')
      }
    }
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
              📥
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
                Recepção de Arquivo da Maternidade
              </h2>
              <p style={{ margin: 0, fontSize: '14px', color: theme.textSecondary }}>
                Importar dados de nascimento coletados na maternidade
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

        {/* Instruções */}
        <div style={{
          background: theme.background,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          border: `1px solid ${theme.border}`
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: theme.text,
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📋 Instruções
          </h3>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            color: theme.textSecondary,
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <li>Selecione um arquivo JSON exportado do módulo Maternidade</li>
            <li>O arquivo deve conter dados de nascimento coletados offline</li>
            <li>Os dados serão importados para o sistema principal</li>
            <li>Após importação, os dados estarão disponíveis para Lavratura de Nascimento</li>
          </ul>
        </div>

        {/* Área de Upload */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${theme.border}`,
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
            marginBottom: '24px',
            background: theme.background,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={() => fileInputRef.current?.click()}
          onMouseOver={(e) => {
            (e.target as HTMLDivElement).style.borderColor = theme.buttonBg
            (e.target as HTMLDivElement).style.background = theme.cardBg
          }}
          onMouseOut={(e) => {
            (e.target as HTMLDivElement).style.borderColor = theme.border
            (e.target as HTMLDivElement).style.background = theme.background
          }}
        >
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            📁
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: theme.text,
            margin: '0 0 8px 0'
          }}>
            {arquivoSelecionado ? 'Arquivo Selecionado' : 'Arraste o arquivo aqui ou clique para selecionar'}
          </h3>
          <p style={{
            fontSize: '14px',
            color: theme.textSecondary,
            margin: '0 0 16px 0'
          }}>
            {arquivoSelecionado ? arquivoSelecionado.name : 'Formatos aceitos: .json'}
          </p>
          {arquivoSelecionado && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: theme.success,
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              margin: '0 auto',
              width: 'fit-content'
            }}>
              ✅ {arquivoSelecionado.size} bytes
            </div>
          )}
        </div>

        {/* Input de arquivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Resultado da importação */}
        {resultado && (
          <div style={{
            background: resultado.importados > 0 ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${resultado.importados > 0 ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: resultado.importados > 0 ? '#059669' : '#dc2626',
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {resultado.importados > 0 ? '✅ Importação Concluída' : '❌ Erro na Importação'}
            </h4>
            <div style={{
              fontSize: '14px',
              color: '#374151'
            }}>
              <p style={{ margin: '4px 0' }}>
                <strong>Registros importados:</strong> {resultado.importados}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Erros:</strong> {resultado.erros}
              </p>
            </div>
          </div>
        )}

        {/* Botões */}
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
            Cancelar
          </button>
          
          <button
            onClick={handleImport}
            disabled={!arquivoSelecionado || isLoading}
            style={{
              padding: '10px 20px',
              background: !arquivoSelecionado || isLoading ? '#9ca3af' : theme.buttonBg,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: !arquivoSelecionado || isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (arquivoSelecionado && !isLoading) {
                (e.target as HTMLButtonElement).style.background = theme.buttonHover
              }
            }}
            onMouseOut={(e) => {
              if (arquivoSelecionado && !isLoading) {
                (e.target as HTMLButtonElement).style.background = theme.buttonBg
              }
            }}
          >
            {isLoading ? '⏳ Importando...' : '📥 Importar Arquivo'}
          </button>
        </div>
      </div>
    </div>
  )
}
