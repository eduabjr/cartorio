import React from 'react'
import { FirmasPage } from '../pages/FirmasPage'
import { FirmasPageSimple } from '../pages/FirmasPageSimple'
import { FirmasPageTest } from '../pages/FirmasPageTest'
import { ConfiguracoesPage } from '../pages/ConfiguracoesPage'
import { ConfiguracaoSistemaPage } from '../pages/ConfiguracaoSistemaPage'
import { RecepcaoArquivoMaternidade } from './RecepcaoArquivoMaternidade'
import { GenericModulePage } from '../pages/GenericModulePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { useResponsive } from '../hooks/useResponsive'

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
    'firmas-simple': { component: FirmasPageSimple },
    'firmas-test': { component: FirmasPageTest },
    'configuracoes': { component: ConfiguracoesPage },
    'configuracao-sistema': { component: ConfiguracaoSistemaPage },
    'recepcao-maternidade': { component: RecepcaoArquivoMaternidade },
    
    // Módulos genéricos - Cadastros
    'funcionario': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'Funcionário', 
        moduleIcon: '👤', 
        moduleDescription: 'Cadastro de funcionários do cartório' 
      } 
    },
    'cartorio-seade': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'Cartório (SEADE)', 
        moduleIcon: '🏛️', 
        moduleDescription: 'Configurações do cartório para SEADE' 
      } 
    },
    'cidade': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'Cidade', 
        moduleIcon: '🏙️', 
        moduleDescription: 'Cadastro de cidades' 
      } 
    },
    'pais': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'País', 
        moduleIcon: '🌍', 
        moduleDescription: 'Cadastro de países' 
      } 
    },
    'cep': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'CEP', 
        moduleIcon: '📮', 
        moduleDescription: 'Consulta e cadastro de CEPs' 
      } 
    },
    'ibge': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'IBGE', 
        moduleIcon: '📊', 
        moduleDescription: 'Dados do Instituto Brasileiro de Geografia e Estatística' 
      } 
    },
    'dnv-do-bloqueadas': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'DNV e DO Bloqueadas', 
        moduleIcon: '🚫', 
        moduleDescription: 'Controle de DNV e DO bloqueadas' 
      } 
    },
    'oficios-mandados': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'Ofícios e Mandados', 
        moduleIcon: '📜', 
        moduleDescription: 'Gestão de ofícios e mandados' 
      } 
    },
    'hospital': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'Hospital', 
        moduleIcon: '🏥', 
        moduleDescription: 'Cadastro de hospitais' 
      } 
    },
    'cemiterio': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'Cemitério', 
        moduleIcon: '⛪', 
        moduleDescription: 'Cadastro de cemitérios' 
      } 
    },
    'funeraria': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'Funerária', 
        moduleIcon: '⚰️', 
        moduleDescription: 'Cadastro de funerárias' 
      } 
    },
    'cadastro-livros': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'Cadastro de Livros', 
        moduleIcon: '📚', 
        moduleDescription: 'Gestão de livros do cartório' 
      } 
    },
    'registro-tipos-digitalizacao': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'Registro de Tipos para Digitalização', 
        moduleIcon: '💾', 
        moduleDescription: 'Configuração de tipos para digitalização' 
      } 
    },
    'feriados': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'Feriados', 
        moduleIcon: '🎉', 
        moduleDescription: 'Cadastro de feriados' 
      } 
    },
    
    // Protocolos
    'protocolo-lancamento': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'Lançamento de Protocolo', 
        moduleIcon: '📝', 
        moduleDescription: 'Lançamento de novos protocolos' 
      } 
    },
    'protocolo-baixa': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'Baixa de Protocolo', 
        moduleIcon: '✅', 
        moduleDescription: 'Baixa de protocolos existentes' 
      } 
    },
    'protocolo-cancelamento': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'Cancelamento de Protocolo', 
        moduleIcon: '❌', 
        moduleDescription: 'Cancelamento de protocolos' 
      } 
    },
    
    // Lavratura
    'lavratura-casamento': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'Lavratura de Casamento', 
        moduleIcon: '💍', 
        moduleDescription: 'Sistema de lavratura de casamentos' 
      } 
    },
    'lavratura-nascimento': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'Lavratura de Nascimento', 
        moduleIcon: '👶', 
        moduleDescription: 'Sistema de lavratura de nascimentos' 
      } 
    },
    'lavratura-obito': { 
      component: GenericModulePage, 
      props: { 
        moduleName: 'Lavratura de Óbito', 
        moduleIcon: '⚰️', 
        moduleDescription: 'Sistema de lavratura de óbitos' 
      } 
    },
    
    // Outros módulos
    'documentos': { 
      component: GenericModulePage, 
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

    return <Component {...commonProps} />
  }

  return (
    <>
      {renderCurrentPage()}
    </>
  )
}
