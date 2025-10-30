import React from 'react'
import { FirmasPage } from '../pages/FirmasPage'
import { ConfiguracoesPage } from '../pages/ConfiguracoesPage'
import { ConfiguracaoSistemaPage } from '../pages/ConfiguracaoSistemaPage'
import { RecepcaoArquivoMaternidade } from './RecepcaoArquivoMaternidade'
import { CidadePage } from '../pages/CidadePage'
import { PaisPage } from '../pages/PaisPage'
import { HospitalCemiterioPage } from '../pages/HospitalCemiterioPage'
import { ProtocoloLancamentoPage } from '../pages/ProtocoloLancamentoPage'
import { SingleInstanceWindow } from './SingleInstanceWindow'
import { singleInstanceService } from '../services/SingleInstanceService'
import { useAccessibility } from '../hooks/useAccessibility'
import { useResponsive } from '../hooks/useResponsive'

// Componente placeholder para módulos genéricos não implementados
function PlaceholderModulePage({ onClose, moduleName, moduleIcon = '📋', moduleDescription = 'Em desenvolvimento' }: any) {
  const { getTheme } = useAccessibility()
  const theme = getTheme()
  
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
      zIndex: 10000
    }}>
      <div style={{
        background: theme.background,
        borderRadius: '8px',
        width: '500px',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: `1px solid ${theme.border}`
      }}>
        <h2 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '24px' }}>
          {moduleIcon} {moduleName}
        </h2>
        <p style={{ color: theme.textSecondary, marginBottom: '20px' }}>
          {moduleDescription}
        </p>
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Fechar
        </button>
      </div>
    </div>
  )
}

interface NavigationManagerProps {
  isDarkMode: boolean
  user: any
  currentPage: string | null
  pageProps: any
  onClosePage: () => void
}

export function NavigationManager({ isDarkMode, user, currentPage, pageProps, onClosePage }: NavigationManagerProps) {
  // Hooks de acessibilidade e responsividade
  const accessibility = useAccessibility()
  const responsive = useResponsive()

  // Mapeamento de módulos para páginas
  const moduleConfig = {
    // Páginas específicas
    'firmas': { component: FirmasPage },
    'configuracoes': { component: ConfiguracoesPage },
    'configuracao-sistema': { component: ConfiguracaoSistemaPage },
    'recepcao-maternidade': { component: RecepcaoArquivoMaternidade },
    
    // Módulos genéricos - Cadastros
    'funcionario': { 
      component: PlaceholderModulePage, 
      props: { 
        moduleName: 'Funcionário', 
        moduleIcon: '👤', 
        moduleDescription: 'Cadastro de funcionários do cartório' 
      } 
    },
    'cartorio-seade': { 
      component: PlaceholderModulePage, 
      props: { 
        moduleName: 'Cartório (SEADE)', 
        moduleIcon: '🏛️', 
        moduleDescription: 'Configurações do cartório para SEADE' 
      } 
    },
    'cidade': { 
      component: CidadePage
    },
    'pais': { 
      component: PaisPage
    },
    'cep': { 
      component: PlaceholderModulePage, 
      props: { 
        moduleName: 'CEP', 
        moduleIcon: '📮', 
        moduleDescription: 'Consulta e cadastro de CEPs' 
      } 
    },
    'ibge': { 
      component: PlaceholderModulePage, 
      props: { 
        moduleName: 'IBGE', 
        moduleIcon: '📊', 
        moduleDescription: 'Dados do Instituto Brasileiro de Geografia e Estatística' 
      } 
    },
    'dnv-do-bloqueadas': { 
      component: PlaceholderModulePage, 
      props: { 
        moduleName: 'DNV e DO Bloqueadas', 
        moduleIcon: '🚫', 
        moduleDescription: 'Controle de DNV e DO bloqueadas' 
      } 
    },
    'oficios-mandados': { 
      component: PlaceholderModulePage, 
      props: { 
        moduleName: 'Ofícios e Mandados', 
        moduleIcon: '📜', 
        moduleDescription: 'Gestão de ofícios e mandados' 
      } 
    },
    'hospital-cemiterio': { 
      component: HospitalCemiterioPage
    },
    'cemiterio': { 
      component: PlaceholderModulePage, 
      props: { 
        moduleName: 'Cemitério', 
        moduleIcon: '⛪', 
        moduleDescription: 'Cadastro de cemitérios' 
      } 
    },
    'funeraria': { 
      component: PlaceholderModulePage, 
      props: { 
        moduleName: 'Funerária', 
        moduleIcon: '⚰️', 
        moduleDescription: 'Cadastro de funerárias' 
      } 
    },
    'cadastro-livros': { 
      component: PlaceholderModulePage, 
      props: { 
        moduleName: 'Cadastro de Livros', 
        moduleIcon: '📚', 
        moduleDescription: 'Gestão de livros do cartório' 
      } 
    },
    'registro-tipos-digitalizacao': { 
      component: PlaceholderModulePage, 
      props: { 
        moduleName: 'Registro de Tipos para Digitalização', 
        moduleIcon: '💾', 
        moduleDescription: 'Configuração de tipos para digitalização' 
      } 
    },
    'feriados': { 
      component: PlaceholderModulePage, 
      props: { 
        moduleName: 'Feriados', 
        moduleIcon: '🎉', 
        moduleDescription: 'Cadastro de feriados' 
      } 
    },
    
    // Protocolos
    'protocolo-lancamento': { 
      component: ProtocoloLancamentoPage
    },
    'protocolo-baixa': { 
      component: PlaceholderModulePage, 
      props: { 
        moduleName: 'Baixa de Protocolo', 
        moduleIcon: '✅', 
        moduleDescription: 'Baixa de protocolos existentes' 
      } 
    },
    'protocolo-cancelamento': { 
      component: PlaceholderModulePage, 
      props: { 
        moduleName: 'Cancelamento de Protocolo', 
        moduleIcon: '❌', 
        moduleDescription: 'Cancelamento de protocolos' 
      } 
    },
    
    // Lavratura
    'lavratura-casamento': { 
      component: PlaceholderModulePage, 
      props: { 
        moduleName: 'Lavratura de Casamento', 
        moduleIcon: '💍', 
        moduleDescription: 'Sistema de lavratura de casamentos' 
      } 
    },
    'lavratura-nascimento': { 
      component: PlaceholderModulePage, 
      props: { 
        moduleName: 'Lavratura de Nascimento', 
        moduleIcon: '👶', 
        moduleDescription: 'Sistema de lavratura de nascimentos' 
      } 
    },
    'lavratura-obito': { 
      component: PlaceholderModulePage, 
      props: { 
        moduleName: 'Lavratura de Óbito', 
        moduleIcon: '⚰️', 
        moduleDescription: 'Sistema de lavratura de óbitos' 
      } 
    },
    
    // Outros módulos
    'documentos': { 
      component: PlaceholderModulePage, 
      props: { 
        moduleName: 'Documentos', 
        moduleIcon: '📄', 
        moduleDescription: 'Gestão de documentos' 
      } 
    }
  }

  // Renderizar a página atual
  const renderCurrentPage = () => {
    if (!currentPage) return null

    const config = moduleConfig[currentPage as keyof typeof moduleConfig]
    if (!config) {
      console.warn('Página não encontrada:', currentPage)
      return null
    }

    const Component = config.component
    const commonProps = {
      onClose: onClosePage,
      isDarkMode,
      ...pageProps,
      ...config.props
    }

    // Usar sistema de instância única
    return (
      <SingleInstanceWindow
        type={currentPage}
        component={Component}
        props={commonProps}
        onClose={onClosePage}
        onRefresh={() => {
          console.log(`🔄 Página ${currentPage} foi atualizada`)
        }}
      />
    )
  }

  return (
    <>
      {renderCurrentPage()}
    </>
  )
}
