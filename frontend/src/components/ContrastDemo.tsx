import React from 'react'
import { useAccessibility } from '../hooks/useAccessibility'

export function ContrastDemo() {
  const { settings, contrastPresets, blueLightPresets } = useAccessibility()

  return (
    <div style={{
      padding: '20px',
      background: '#f5f5f5',
      borderRadius: '8px',
      margin: '20px 0'
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
        🎨 Demonstração de Contraste
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {Object.entries(contrastPresets).map(([key, preset]) => (
          <div key={key} style={{
            padding: '16px',
            background: 'white',
            borderRadius: '8px',
            border: '2px solid #e0e0e0',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
              {preset.name}
            </h4>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#666' }}>
              {preset.description}
            </p>
            <div style={{
              padding: '8px',
              background: '#f0f0f0',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#333'
            }}>
              Multiplicador: {preset.multiplier}x
            </div>
          </div>
        ))}
      </div>

      <div style={{
        padding: '16px',
        background: 'white',
        borderRadius: '8px',
        border: '2px solid #e0e0e0'
      }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
          Configuração Atual
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
          <div>
            <strong>Alto Contraste:</strong> {settings.highContrast ? 'Ativado' : 'Desativado'}
          </div>
          <div>
            <strong>Nível:</strong> {contrastPresets[settings.contrastLevel as keyof typeof contrastPresets]?.name || 'Normal'}
          </div>
          <div>
            <strong>Filtro Azul:</strong> {settings.blueLightFilter ? 'Ativado' : 'Desativado'}
          </div>
          <div>
            <strong>Intensidade:</strong> {blueLightPresets[settings.blueLightIntensity]?.name || 'Médio'}
          </div>
        </div>
      </div>
    </div>
  )
}
