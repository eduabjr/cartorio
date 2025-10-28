import React from 'react'
import { useCidadeAutocomplete } from '../hooks/useCidadeAutocomplete'
import { useAccessibility } from '../hooks/useAccessibility'

interface CidadeAutocompleteInputProps {
  value: string
  onChange: (cidade: string) => void
  onUfChange?: (uf: string) => void
  uf: string
  focusedField?: string | null
  onFocus?: () => void
  onBlur?: () => void
  inputStyles?: React.CSSProperties
  required?: boolean
  maxLength?: number
}

export const CidadeAutocompleteInput: React.FC<CidadeAutocompleteInputProps> = ({
  value,
  onChange,
  onUfChange,
  uf,
  focusedField,
  onFocus,
  onBlur,
  inputStyles = {},
  required = false,
  maxLength
}) => {
  const { getTheme } = useAccessibility()
  const theme = getTheme()
  const autocomplete = useCidadeAutocomplete()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    autocomplete.buscarSugestoes(newValue, uf)
  }

  const handleSelect = (cidade: string, ufEncontrado?: string) => {
    onChange(cidade)
    // Se encontrou UF e tem callback, atualizar UF também
    if (ufEncontrado && onUfChange) {
      onUfChange(ufEncontrado)
    }
  }

  const handleFocus = () => {
    if (onFocus) onFocus()
    if (value.length >= 2) {
      autocomplete.buscarSugestoes(value, uf)
    }
  }

  const handleBlur = () => {
    // Delay para permitir clique na sugestão
    setTimeout(() => {
      if (onBlur) onBlur()
      autocomplete.limparSugestoes()
    }, 200)
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={(e) => autocomplete.handleKeyDown(e, handleSelect)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={inputStyles}
        autoComplete="off"
        maxLength={maxLength}
      />
      {autocomplete.showSugestoes && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          maxHeight: '200px',
          overflowY: 'auto',
          backgroundColor: theme.background,
          border: `1px solid ${theme.border}`,
          borderRadius: '3px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          zIndex: 1000,
          marginTop: '2px'
        }}>
          {autocomplete.sugestoes.length > 0 ? (
            autocomplete.sugestoes.map((cidade, index) => (
              <div
                key={index}
                onClick={() => autocomplete.selecionarSugestao(cidade, handleSelect)}
                onMouseEnter={() => autocomplete.setSugestaoSelecionada(index)}
                style={{
                  padding: '6px 8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  backgroundColor: autocomplete.sugestaoSelecionada === index ? theme.primary : 'transparent',
                  color: autocomplete.sugestaoSelecionada === index ? '#fff' : theme.text,
                  transition: 'all 0.2s ease'
                }}
              >
                {cidade}
              </div>
            ))
          ) : (
            <div style={{
              padding: '8px',
              fontSize: '11px',
              color: theme.text,
              opacity: 0.6,
              textAlign: 'center'
            }}>
              {uf 
                ? `Nenhuma cidade encontrada em ${uf}`
                : 'Nenhuma cidade encontrada. Selecione uma UF primeiro.'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

