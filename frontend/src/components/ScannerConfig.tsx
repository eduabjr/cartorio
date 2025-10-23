// ScannerConfig.tsx
// Componente para configuração de scanner

import React, { useState, useEffect } from 'react'
import { scannerService, ScannerDevice, ScanConfig } from '../services/ScannerService'
import { useAccessibility } from '../hooks/useAccessibility'

interface ScannerConfigProps {
  onScan: (config: ScanConfig) => void
  onClose: () => void
}

export function ScannerConfig({ onScan, onClose }: ScannerConfigProps) {
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
  const { getTheme } = useAccessibility()
  const theme = getTheme()

  useEffect(() => {
    loadScanners()
  }, [])

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
    maxWidth: '500px',
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

  if (isLoading) {
    return (
      <div style={containerStyles}>
        <div style={modalStyles}>
          <div style={loadingStyles}>
            🔍 Detectando scanners...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyles} onClick={onClose}>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyles}>Configurar Scanner</h2>
        
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
        </div>

        {selectedScannerDevice && (
          <>
            <div style={fieldStyles}>
              <label style={labelStyles}>Resolução (DPI):</label>
              <select
                style={selectStyles}
                value={config.resolution}
                onChange={(e) => setConfig({ ...config, resolution: parseInt(e.target.value) })}
              >
                {selectedScannerDevice.capabilities?.resolutions.map((res) => (
                  <option key={res} value={res}>
                    {res} DPI
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Modo de Cor:</label>
              <select
                style={selectStyles}
                value={config.colorMode}
                onChange={(e) => setConfig({ ...config, colorMode: e.target.value as any })}
              >
                {selectedScannerDevice.capabilities?.colorModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode === 'color' ? 'Colorido' : 
                     mode === 'grayscale' ? 'Escala de Cinza' : 
                     'Preto e Branco'}
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Tamanho da Página:</label>
              <select
                style={selectStyles}
                value={config.pageSize}
                onChange={(e) => setConfig({ ...config, pageSize: e.target.value })}
              >
                {selectedScannerDevice.capabilities?.pageSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Qualidade (%):</label>
              <input
                type="range"
                min="50"
                max="100"
                value={config.quality}
                onChange={(e) => setConfig({ ...config, quality: parseInt(e.target.value) })}
                style={inputStyles}
              />
              <div style={{ fontSize: '12px', color: theme.textSecondary, textAlign: 'center' }}>
                {config.quality}%
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
            Digitalizar
          </button>
        </div>
      </div>
    </div>
  )
}
