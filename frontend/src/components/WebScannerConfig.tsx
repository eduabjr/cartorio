// WebScannerConfig.tsx
// Componente específico para configuração de scanner em ambiente web

import React, { useState, useEffect } from 'react'
import { scannerService, ScannerDevice, ScanConfig } from '../services/ScannerService'
import { useAccessibility } from '../hooks/useAccessibility'

interface WebScannerConfigProps {
  onScan: (config: ScanConfig) => void
  onClose: () => void
}

export function WebScannerConfig({ onScan, onClose }: WebScannerConfigProps) {
  const [scanners, setScanners] = useState<ScannerDevice[]>([])
  const [selectedScanner, setSelectedScanner] = useState<string>('')
  const [config, setConfig] = useState<ScanConfig>({
    resolution: 300,
    colorMode: 'color',
    pageSize: 'A4',
    quality: 90,
    autoCrop: true,
    autoDeskew: true,
    autoRotate: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isWebEnvironment, setIsWebEnvironment] = useState(true)
  const { getTheme } = useAccessibility()
  const theme = getTheme()

  useEffect(() => {
    loadScanners()
    detectEnvironment()
  }, [])

  const detectEnvironment = () => {
    // Verificar se está em ambiente Electron (desktop)
    const isElectron = !!(window as any).electronAPI
    setIsWebEnvironment(!isElectron)
  }

  const getDeviceTypeLabel = (scanner: ScannerDevice): string => {
    switch (scanner.type) {
      case 'multifuncional':
        return 'MULTIFUNCIONAL'
      case 'all-in-one':
        return 'ALL-IN-ONE'
      case 'twain':
        return 'SCANNER TWAIN'
      case 'sane':
        return 'SCANNER SANE'
      case 'usb':
        return 'SCANNER USB'
      case 'camera':
        return 'CÂMERA'
      default:
        return scanner.type.toUpperCase()
    }
  }

  const loadScanners = async () => {
    setIsLoading(true)
    try {
      await scannerService.initialize()
      const availableScanners = scannerService.getAvailableScanners()
      setScanners(availableScanners)
      
      if (availableScanners.length > 0) {
        setSelectedScanner(availableScanners[0].id)
      }
    } catch (error) {
      console.error('Erro ao carregar scanners:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleScan = () => {
    if (selectedScanner) {
      onScan(config)
      onClose()
    }
  }

  const selectedScannerDevice = scanners.find(s => s.id === selectedScanner)

  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000
  }

  const modalStyles: React.CSSProperties = {
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  }

  const titleStyles: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '600',
    color: theme.text,
    margin: '0 0 20px 0',
    textAlign: 'center'
  }

  const warningStyles: React.CSSProperties = {
    backgroundColor: theme.warning + '20',
    border: `1px solid ${theme.warning}`,
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '20px',
    color: theme.text
  }

  const infoStyles: React.CSSProperties = {
    backgroundColor: theme.info + '20',
    border: `1px solid ${theme.info}`,
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '20px',
    color: theme.text
  }

  const fieldStyles: React.CSSProperties = {
    marginBottom: '16px'
  }

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: theme.text,
    marginBottom: '6px'
  }

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: `1px solid ${theme.border}`,
    borderRadius: '6px',
    backgroundColor: theme.background,
    color: theme.text,
    fontSize: '14px',
    boxSizing: 'border-box'
  }

  const selectStyles: React.CSSProperties = {
    ...inputStyles,
    cursor: 'pointer'
  }

  const buttonStyles: React.CSSProperties = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }

  const primaryButtonStyles: React.CSSProperties = {
    ...buttonStyles,
    backgroundColor: theme.primary,
    color: '#ffffff'
  }

  const secondaryButtonStyles: React.CSSProperties = {
    ...buttonStyles,
    backgroundColor: 'transparent',
    color: theme.text,
    border: `1px solid ${theme.border}`
  }

  const checkboxStyles: React.CSSProperties = {
    marginRight: '8px',
    cursor: 'pointer'
  }

  const checkboxLabelStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: theme.text,
    cursor: 'pointer'
  }

  const buttonContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px'
  }

  const loadingStyles: React.CSSProperties = {
    textAlign: 'center',
    color: theme.textSecondary,
    fontSize: '14px',
    padding: '20px'
  }

  const tipStyles: React.CSSProperties = {
    fontSize: '12px',
    color: theme.textSecondary,
    fontStyle: 'italic',
    marginTop: '8px'
  }

  if (isLoading) {
    return (
      <div style={containerStyles}>
        <div style={modalStyles}>
          <div style={loadingStyles}>
            🔍 Detectando dispositivos disponíveis...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyles} onClick={onClose}>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyles}>Configurar Digitalização</h2>
        
        {isWebEnvironment && (
          <div style={warningStyles}>
            <strong>⚠️ Ambiente Web Detectado</strong><br/>
            Em navegadores web, o sistema usa a câmera do dispositivo para "digitalizar" documentos.
            Para acesso completo a scanners e impressoras multifuncionais, use a versão desktop.
          </div>
        )}

        <div style={infoStyles}>
          <strong>💡 Dicas para Melhor Qualidade:</strong><br/>
          • Use boa iluminação ao fotografar<br/>
          • Posicione o documento plano e sem sombras<br/>
          • Mantenha a câmera estável durante a captura<br/>
          • Evite reflexos na superfície do documento
        </div>
        
        <div style={fieldStyles}>
          <label style={labelStyles}>Dispositivo:</label>
          <select
            style={selectStyles}
            value={selectedScanner}
            onChange={(e) => setSelectedScanner(e.target.value)}
          >
            {scanners.map((scanner) => (
              <option key={scanner.id} value={scanner.id}>
                {scanner.name} ({getDeviceTypeLabel(scanner)})
              </option>
            ))}
          </select>
          {isWebEnvironment && (
            <div style={tipStyles}>
              Em ambiente web, apenas a câmera está disponível para digitalização.
            </div>
          )}
        </div>

        {selectedScannerDevice && (
          <>
            <div style={fieldStyles}>
              <label style={labelStyles}>Qualidade da Captura:</label>
              <select
                style={selectStyles}
                value={config.quality}
                onChange={(e) => setConfig({ ...config, quality: parseInt(e.target.value) })}
              >
                <option value={70}>Baixa (70%) - Mais rápida</option>
                <option value={85}>Média (85%) - Balanceada</option>
                <option value={90}>Alta (90%) - Recomendada</option>
                <option value={95}>Muito Alta (95%) - Melhor qualidade</option>
              </select>
              <div style={tipStyles}>
                Qualidade mais alta = melhor OCR, mas processamento mais lento.
              </div>
            </div>

            <div style={fieldStyles}>
              <label style={checkboxLabelStyles}>
                <input
                  type="checkbox"
                  checked={config.autoCrop}
                  onChange={(e) => setConfig({ ...config, autoCrop: e.target.checked })}
                  style={checkboxStyles}
                />
                Recorte Automático
              </label>
            </div>

            <div style={fieldStyles}>
              <label style={checkboxLabelStyles}>
                <input
                  type="checkbox"
                  checked={config.autoDeskew}
                  onChange={(e) => setConfig({ ...config, autoDeskew: e.target.checked })}
                  style={checkboxStyles}
                />
                Correção de Inclinação
              </label>
            </div>

            <div style={fieldStyles}>
              <label style={checkboxLabelStyles}>
                <input
                  type="checkbox"
                  checked={config.autoRotate}
                  onChange={(e) => setConfig({ ...config, autoRotate: e.target.checked })}
                  style={checkboxStyles}
                />
                Rotação Automática
              </label>
            </div>
          </>
        )}

        <div style={buttonContainerStyles}>
          <button
            style={secondaryButtonStyles}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            style={primaryButtonStyles}
            onClick={handleScan}
            disabled={!selectedScanner}
          >
            {isWebEnvironment ? 'Usar Câmera' : 'Digitalizar'}
          </button>
        </div>
      </div>
    </div>
  )
}
