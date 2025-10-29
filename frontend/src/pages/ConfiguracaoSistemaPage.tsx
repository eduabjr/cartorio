import { useAccessibility } from '../hooks/useAccessibility'

interface ConfiguracaoSistemaPageProps {
  onClose: () => void
}

export function ConfiguracaoSistemaPage({ onClose }: ConfiguracaoSistemaPageProps) {
  const { getTheme } = useAccessibility()
  const theme = getTheme()

  const configuracaoItems = [
    { id: 'funcionario', label: 'Funcionário', icon: '👨‍💼', onClick: () => (window as any).navigateToPage?.('funcionario') },
    { id: 'feriados', label: 'Feriados', icon: '📅', onClick: () => (window as any).navigateToPage?.('feriados') },
    { id: 'ibge', label: 'IBGE', icon: '🏛️', onClick: () => (window as any).navigateToPage?.('ibge') },
    { id: 'pais', label: 'País', icon: '🌍', onClick: () => (window as any).navigateToPage?.('pais') },
    { id: 'cep', label: 'CEP', icon: '📮', onClick: () => (window as any).navigateToPage?.('cep') },
    { id: 'cidade', label: 'Cidade', icon: '🏙️', onClick: () => (window as any).navigateToPage?.('cidade') }
  ]

  const containerStyles = {
    padding: '20px',
    background: theme.background,
    color: theme.text,
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '15px',
    borderBottom: `2px solid ${theme.border}`
  }

  const titleStyles = {
    fontSize: '24px',
    fontWeight: '600',
    color: theme.primary,
    margin: 0
  }

  const closeButtonStyles = {
    padding: '8px 16px',
    background: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  }

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  }

  const itemStyles = {
    padding: '20px',
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  }

  const iconStyles = {
    fontSize: '24px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.primary + '20',
    borderRadius: '8px'
  }

  const labelStyles = {
    fontSize: '16px',
    fontWeight: '500',
    color: theme.text
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>Configurações do Sistema</h1>
        <button
          style={closeButtonStyles}
          onClick={onClose}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.opacity = '0.8'
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.opacity = '1'
          }}
        >
          ✕ Fechar
        </button>
      </div>

      <div style={gridStyles}>
        {configuracaoItems.map((item) => (
          <div
            key={item.id}
            style={itemStyles}
            onClick={item.onClick}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
              ;(e.currentTarget as HTMLDivElement).style.borderColor = theme.primary
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
              ;(e.currentTarget as HTMLDivElement).style.borderColor = theme.border
            }}
          >
            <div style={iconStyles}>
              {item.icon}
            </div>
            <div style={labelStyles}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
