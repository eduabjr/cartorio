import React, { useState, useEffect } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onLogout: () => void
  onOpenConfigurations: () => void
  onOpenMaternidade: () => void
  onOpenControladorSenha: () => void
  onOpenConfiguracaoSenha?: () => void
  onOpenPainelSenhas?: () => void
  onOpenGerenciamentoGuiches?: () => void
}

export function SideMenu({ isOpen, onClose, user, onLogout, onOpenConfigurations, onOpenMaternidade, onOpenControladorSenha, onOpenConfiguracaoSenha, onOpenPainelSenhas, onOpenGerenciamentoGuiches }: SideMenuProps) {
  const { getTheme } = useAccessibility()
  const theme = getTheme()
  
  // Estado para data e hora em tempo real
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  // Atualizar data e hora a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Formatar data
  const formatDate = (date: Date) => {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    
    const diaSemana = dias[date.getDay()]
    const dia = date.getDate().toString().padStart(2, '0')
    const mes = meses[date.getMonth()]
    const ano = date.getFullYear()
    
    return `${diaSemana}, ${dia} de ${mes} de ${ano}`
  }

  // Formatar hora
  const formatTime = (date: Date) => {
    const horas = date.getHours().toString().padStart(2, '0')
    const minutos = date.getMinutes().toString().padStart(2, '0')
    const segundos = date.getSeconds().toString().padStart(2, '0')
    
    return `${horas}:${minutos}:${segundos}`
  }

  if (!isOpen) return null

  const overlayStyles = {
    position: 'fixed' as const,
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2000,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingTop: '140px' // Abaixo dos menus com mais espaço
  }

  const menuStyles = {
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    padding: '20px',
    minWidth: '250px',
    marginRight: '20px'
  }

  const userInfoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: theme.primary + '10',
    borderRadius: '6px',
    marginBottom: '16px'
  }

  const buttonStyles = {
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    background: 'transparent',
    color: theme.text,
    cursor: 'pointer',
    borderRadius: '6px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.2s ease',
    marginBottom: '8px'
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div style={overlayStyles} onClick={handleOverlayClick}>
      <div style={menuStyles}>
        {/* Data e Hora em Tempo Real */}
        <div style={{
          textAlign: 'center',
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: theme.background,
          borderRadius: '6px',
          border: `1px solid ${theme.border}`
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: theme.textSecondary,
            marginBottom: '6px',
            letterSpacing: '0.5px'
          }}>
            {formatDate(currentDateTime)}
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: theme.primary,
            fontFamily: 'monospace',
            letterSpacing: '2px'
          }}>
            {formatTime(currentDateTime)}
          </div>
        </div>

        {/* Informações do usuário */}
        <div style={userInfoStyles}>
          <span style={{ fontSize: '24px' }}>👤</span>
          <div>
            <div style={{ fontWeight: '600', color: theme.text }}>
              {user?.name || 'Usuário'}
            </div>
            <div style={{ fontSize: '12px', color: theme.textSecondary }}>
              {user?.email || 'usuario@cartorio.com'}
            </div>
          </div>
        </div>

        {/* Botões do menu */}
        <button
          style={buttonStyles}
          onClick={() => {
            onOpenMaternidade()
            onClose()
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = theme.primary + '20'
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
          }}
        >
          Maternidade
        </button>

        {/* Seção de Senhas */}
        <div style={{
          marginTop: '16px',
          marginBottom: '8px',
          paddingTop: '12px',
          borderTop: `1px solid ${theme.border}`
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '700',
            color: theme.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '0 16px 8px 16px'
          }}>
            Sistema de Senhas
          </div>
        </div>

        <button
          style={buttonStyles}
          onClick={() => {
            onOpenControladorSenha()
            onClose()
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = theme.primary + '20'
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
          }}
        >
          🎫 Controlador de Senhas
        </button>

        {/* APENAS ADMINISTRADOR */}
        {user?.role === 'admin' && onOpenPainelSenhas && (
          <button
            style={buttonStyles}
            onClick={() => {
              onOpenPainelSenhas()
              onClose()
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = theme.primary + '20'
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
            }}
          >
            📊 Painel Administrativo
          </button>
        )}

        {user?.role === 'admin' && onOpenConfiguracaoSenha && (
          <button
            style={buttonStyles}
            onClick={() => {
              onOpenConfiguracaoSenha()
              onClose()
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = theme.primary + '20'
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
            }}
          >
            ⚙️ Configurar Senhas
          </button>
        )}

        {user?.role === 'admin' && onOpenGerenciamentoGuiches && (
          <button
            style={buttonStyles}
            onClick={() => {
              onOpenGerenciamentoGuiches()
              onClose()
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = theme.primary + '20'
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
            }}
          >
            🏢 Gerenciar Guichês
          </button>
        )}

        <button
          style={buttonStyles}
          onClick={() => {
            window.open('/senha-terminal', '_blank', 'width=1024,height=768')
            onClose()
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = theme.primary + '20'
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
          }}
        >
          🖥️ Terminal de Senhas
        </button>

        <button
          style={buttonStyles}
          onClick={() => {
            window.open('/senha-publica', '_blank', 'fullscreen=yes')
            onClose()
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = theme.primary + '20'
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
          }}
        >
          📺 Painel Público
        </button>

        {/* APENAS ADMINISTRADOR */}
        {user?.role === 'admin' && (
          <button
            style={buttonStyles}
            onClick={() => {
              onOpenConfigurations()
              onClose()
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = theme.primary + '20'
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
            }}
          >
            ⚙️ Configurações do Sistema
          </button>
        )}

        <button
          style={buttonStyles}
          onClick={() => {
            onLogout()
            onClose()
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = theme.error + '20'
            ;(e.target as HTMLButtonElement).style.color = theme.error
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
            ;(e.target as HTMLButtonElement).style.color = theme.text
          }}
        >
          Sair
        </button>
      </div>
    </div>
  )
}