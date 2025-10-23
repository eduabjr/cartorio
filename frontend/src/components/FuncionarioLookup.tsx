// FuncionarioLookup.tsx
// Componente de busca de funcionários

import React, { useState, useEffect } from 'react'
import { funcionarioService, Funcionario } from '../services/FuncionarioService'
import { useAccessibility } from '../hooks/useAccessibility'
import { getRelativeFontSize } from '../utils/fontUtils'

interface FuncionarioLookupProps {
  onSelect: (funcionario: Funcionario) => void
  onClose: () => void
  currentFuncionario?: Funcionario
}

export function FuncionarioLookup({ onSelect, onClose, currentFuncionario }: FuncionarioLookupProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null)
  const { getTheme } = useAccessibility()
  const theme = getTheme()

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchFuncionarios()
    } else {
      setFuncionarios([])
    }
  }, [searchTerm])

  const searchFuncionarios = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await funcionarioService.searchFuncionariosByName(searchTerm)
      
      if (response.success && response.data) {
        setFuncionarios(response.data)
      } else {
        setError(response.error || 'Erro ao buscar funcionários')
      }
    } catch (err) {
      setError('Erro ao buscar funcionários')
      console.error('Erro na busca:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = () => {
    if (selectedFuncionario) {
      onSelect(selectedFuncionario)
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSelect()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

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
    maxWidth: '800px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'hidden',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  }

  const titleStyles: React.CSSProperties = {
    fontSize: getRelativeFontSize(20),
    fontWeight: '600',
    color: theme.text,
    margin: '0 0 20px 0',
    textAlign: 'center'
  }

  const searchContainerStyles: React.CSSProperties = {
    marginBottom: '20px'
  }

  const searchInputStyles: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    backgroundColor: theme.background,
    color: theme.text,
    fontSize: getRelativeFontSize(14),
    outline: 'none',
    transition: 'border-color 0.3s ease'
  }

  const listContainerStyles: React.CSSProperties = {
    maxHeight: '400px',
    overflowY: 'auto',
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    backgroundColor: theme.background
  }

  const itemStyles: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: `1px solid ${theme.border}`,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }

  const selectedItemStyles: React.CSSProperties = {
    ...itemStyles,
    backgroundColor: theme.primary + '20',
    borderLeft: `4px solid ${theme.primary}`
  }

  const itemInfoStyles: React.CSSProperties = {
    flex: 1
  }

  const itemNameStyles: React.CSSProperties = {
    fontSize: getRelativeFontSize(14),
    fontWeight: '500',
    color: theme.text,
    marginBottom: '4px'
  }

  const itemDetailsStyles: React.CSSProperties = {
    fontSize: getRelativeFontSize(12),
    color: theme.textSecondary
  }

  const buttonContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: `1px solid ${theme.border}`
  }

  const buttonStyles: React.CSSProperties = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: getRelativeFontSize(14),
    fontWeight: '500',
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

  const loadingStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px',
    color: theme.textSecondary
  }

  const errorStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '20px',
    color: theme.error,
    backgroundColor: theme.error + '20',
    borderRadius: '8px',
    marginBottom: '20px'
  }

  const emptyStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px',
    color: theme.textSecondary,
    fontStyle: 'italic'
  }

  return (
    <div style={containerStyles} onClick={onClose}>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyles}>Buscar Funcionário</h2>
        
        <div style={searchContainerStyles}>
          <input
            type="text"
            placeholder="Digite o nome do funcionário para buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyles}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        {error && (
          <div style={errorStyles}>
            {error}
          </div>
        )}

        <div style={listContainerStyles}>
          {isLoading ? (
            <div style={loadingStyles}>
              🔍 Buscando funcionários...
            </div>
          ) : funcionarios.length === 0 ? (
            <div style={emptyStyles}>
              {searchTerm.length < 2 
                ? 'Digite pelo menos 2 caracteres para buscar'
                : 'Nenhum funcionário encontrado'
              }
            </div>
          ) : (
            funcionarios.map((funcionario) => (
              <div
                key={funcionario.id || funcionario.codigo}
                style={selectedFuncionario?.id === funcionario.id ? selectedItemStyles : itemStyles}
                onClick={() => setSelectedFuncionario(funcionario)}
                onDoubleClick={handleSelect}
              >
                <div style={itemInfoStyles}>
                  <div style={itemNameStyles}>
                    {funcionario.nome}
                  </div>
                  <div style={itemDetailsStyles}>
                    Código: {funcionario.codigo} | CPF: {funcionario.cpf} | Cargo: {funcionario.cargo}
                  </div>
                </div>
                {selectedFuncionario?.id === funcionario.id && (
                  <span style={{ color: theme.primary, fontSize: getRelativeFontSize(20) }}>✓</span>
                )}
              </div>
            ))
          )}
        </div>

        <div style={buttonContainerStyles}>
          <button
            style={secondaryButtonStyles}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            style={primaryButtonStyles}
            onClick={handleSelect}
            disabled={!selectedFuncionario}
          >
            Selecionar
          </button>
        </div>
      </div>
    </div>
  )
}
