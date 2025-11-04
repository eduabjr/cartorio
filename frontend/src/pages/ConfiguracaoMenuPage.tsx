import React, { useState, useEffect } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { useModal } from '../hooks/useModal'

interface ConfiguracaoMenuPageProps {
  onClose: () => void
}

interface MenuConfig {
  id: string
  label: string
  visible: boolean
  submenu?: MenuConfig[]
}

interface FuncionarioPermissao {
  id: string
  nome: string
  menusPermitidos: string[]
}

// Estrutura completa dos menus do sistema
const DEFAULT_MENU_STRUCTURE: MenuConfig[] = [
  {
    id: 'cadastros',
    label: 'Cadastros',
    visible: true,
    submenu: [
      { id: 'cliente', label: 'Cliente', visible: true },
      { id: 'funcionario', label: 'Funcionário', visible: true },
      { id: 'cartorio-seade', label: 'Cartório SEADE', visible: true },
      { id: 'oficios-mandados', label: 'Ofícios e Mandados', visible: true },
      { id: 'dnv-bloqueadas', label: 'DNV/DO Bloqueadas', visible: true },
      { id: 'natureza', label: 'Natureza', visible: true },
      { id: 'hospital-cemiterio', label: 'Hospital, Cemitério e Funerária', visible: true },
      { id: 'cadastro-livros', label: 'Cadastro de Livros', visible: true },
      {
        id: 'abertura-livros',
        label: 'Abertura de Livros',
        visible: true,
        submenu: [
          { id: 'casamento-livro', label: 'Casamento', visible: true },
          { id: 'edital-proclamas-livro', label: 'Edital de Proclamas', visible: true },
          { id: 'livro-e-livro', label: 'Livro E', visible: true },
          { id: 'nascimento-livro', label: 'Nascimento', visible: true },
          { id: 'remissivo-livro', label: 'Remissivo', visible: true },
          { id: 'obito-livro', label: 'Óbito', visible: true },
          { id: 'lombada-livro', label: 'Lombada de Livro', visible: true }
        ]
      },
      {
        id: 'controle-certidoes',
        label: 'Controle de Certidões',
        visible: true,
        submenu: [
          { id: 'compra-certidoes', label: 'Compra de Certidões', visible: true },
          { id: 'consumo-certidoes', label: 'Consumo de Certidões', visible: true },
          { id: 'perda-cancelamento-certidoes', label: 'Perda/Cancelamento de Certidões', visible: true },
          { id: 'relatorio-estoque-certidoes', label: 'Relatório de Estoque de Certidões', visible: true },
          { id: 'estorno-certidao-utilizada', label: 'Estorno de Certidão Utilizada', visible: true },
          { id: 'consulta-certidoes-utilizadas', label: 'Consulta de Certidões Utilizadas', visible: true },
          { id: 'manutencao-certidoes-utilizadas', label: 'Manutenção de Certidões Utilizadas', visible: true }
        ]
      },
      {
        id: 'configuracao-sistema',
        label: 'Configurações do Sistema',
        visible: true,
        submenu: [
          { id: 'config-sistema-feriados', label: 'Feriados', visible: true },
          { id: 'config-sistema-ibge', label: 'IBGE', visible: true },
          { id: 'config-sistema-cep', label: 'CEP', visible: true },
          { id: 'cadastros-localizacao', label: 'Localização (Cidade e País)', visible: true },
          { id: 'cadastros-tipos', label: 'Digitalização (Ato e Documento)', visible: true },
          { id: 'servicos-cartorio', label: 'Serviços e Tabela de Custas', visible: true },
          { id: 'config-menus', label: 'Configuração de Menus', visible: true },
          { id: 'config-sistema-gerais', label: 'Configurações Gerais', visible: true }
        ]
      }
    ]
  },
  {
    id: 'processos',
    label: 'Processos',
    visible: true,
    submenu: [
      { id: 'recepcao-arquivos', label: 'Recepção de Arquivos', visible: true }
    ]
  },
  {
    id: 'atendimento',
    label: 'Atendimento',
    visible: true,
    submenu: [
      { id: 'novo-atendimento', label: 'Novo Atendimento', visible: true },
      { id: 'consulta-atendimento', label: 'Consulta', visible: true }
    ]
  },
  {
    id: 'livro-e-menu',
    label: 'Livro E',
    visible: true,
    submenu: [
      { id: 'certificacao-eletronica', label: 'Certificação Eletrônica', visible: true },
      { id: 'termo-uniao-estavel', label: 'Termo de União Estável', visible: true }
    ]
  },
  {
    id: 'protocolos',
    label: 'Protocolos',
    visible: true,
    submenu: [
      { id: 'protocolo-lancamento', label: 'Lançamento', visible: true },
      { id: 'protocolo-baixa', label: 'Baixa', visible: true },
      { id: 'protocolo-cancelamento', label: 'Cancelamento', visible: true }
    ]
  },
  {
    id: 'lavratura',
    label: 'Lavratura',
    visible: true,
    submenu: [
      { id: 'lavratura-casamento', label: 'Casamento', visible: true },
      { id: 'lavratura-nascimento', label: 'Nascimento', visible: true },
      { id: 'lavratura-obito', label: 'Óbito', visible: true },
      {
        id: 'livro-e',
        label: 'Livro E',
        visible: true,
        submenu: [
          { id: 'lavratura-ausencia', label: 'Ausência', visible: true },
          { id: 'lavratura-emancipacao', label: 'Emancipação', visible: true },
          { id: 'lavratura-interdicao', label: 'Interdição', visible: true },
          { id: 'lavratura-opcao-nacionalidade', label: 'Opção de Nacionalidade', visible: true },
          { id: 'lavratura-registro-sentenca', label: 'Registro de Sentença', visible: true },
          { id: 'lavratura-registro-uniao-estavel', label: 'Registro de União Estável', visible: true },
          { id: 'lavratura-traslado-casamento', label: 'Traslado de Assento de Casamento', visible: true },
          { id: 'lavratura-traslado-nascimento', label: 'Traslado de Assento de Nascimento', visible: true },
          { id: 'lavratura-traslado-obito', label: 'Traslado de Assento de Óbito', visible: true }
        ]
      }
    ]
  },
  {
    id: 'livro-comercial',
    label: 'Livro Comercial',
    visible: true,
    submenu: [
      { id: 'livro-autenticacao', label: 'Livro de Autenticação', visible: true },
      { id: 'autenticacao', label: 'Autenticação', visible: true }
    ]
  },
  {
    id: 'certidoes',
    label: 'Certidões',
    visible: true,
    submenu: [
      { id: 'certidao-nascimento', label: '2ª Via de Certidão de Nascimento', visible: true },
      { id: 'certidao-casamento', label: '2ª Via de Certidão de Casamento', visible: true },
      { id: 'certidao-obito', label: '2ª Via de Certidão de Óbito', visible: true },
      { id: 'certidao-negativa', label: 'Certidão Negativa', visible: true },
      {
        id: 'inteiro-teor',
        label: 'Inteiro Teor',
        visible: true,
        submenu: [
          { id: 'certidao-digitada', label: 'Certidão Digitada', visible: true },
          { id: 'certidao-reprografica', label: 'Certidão Reprografica', visible: true }
        ]
      },
      {
        id: 'livro-e-certidoes',
        label: 'Livro E',
        visible: true,
        submenu: [
          { id: 'certidao-2-via-ausencia', label: '2ª Via de Ausência', visible: true },
          { id: 'certidao-2-via-emancipacao', label: '2ª Via de Emancipação', visible: true },
          { id: 'certidao-2-via-uniao-estavel', label: '2ª Via de União Estável', visible: true },
          { id: 'certidao-2-via-opcao-nacionalidade', label: '2ª via Opção de Nacionalidade', visible: true },
          { id: 'certidao-2-via-interdicao', label: '2ª Via de Interdição', visible: true },
          { id: 'certidao-2-via-registro-sentenca', label: '2ª Via Registro de Sentença', visible: true }
        ]
      },
      { id: 'certidao-2-via-traslado-casamento', label: '2ª via Traslado de Assento de Casamento', visible: true },
      { id: 'certidao-2-via-traslado-nascimento', label: '2ª via Traslado de Assento de Nascimento', visible: true },
      { id: 'certidao-2-via-traslado-obito', label: '2ª via Traslado de Assento de Óbito', visible: true }
    ]
  },
  {
    id: 'indice',
    label: 'Índice',
    visible: true,
    submenu: [
      { id: 'indices-principais', label: 'Índices (Nascimento, Casamento, Óbito, Proclamas)', visible: true },
      { id: 'indice-x', label: 'Índice X', visible: true },
      { id: 'indice-livro', label: 'Livro E', visible: true },
      { id: 'indice-procuracao', label: 'Índice de Procuração', visible: true }
    ]
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    visible: true,
    submenu: [
      { id: 'justica-eleitoral', label: 'Justiça Eleitoral', visible: true },
      { id: 'exercito-brasileiro', label: 'Exército Brasileiro', visible: true },
      { id: 'ibge', label: 'IBGE', visible: true },
      { id: 'instituto-ricardo-g-daunt', label: 'Instituto Ricardo G. Daunt', visible: true },
      { id: 'ministerio-justica-estrangeiros', label: 'Ministério da Justiça - Estrangeiros', visible: true },
      { id: 'procuradoria-bens-inventariar', label: 'Procuradoria - Bens a Inventariar', visible: true },
      { id: 'sec-fazenda-bens-inventariar', label: 'Sec. Fazenda - Bens a Inventariar', visible: true },
      { id: 'secretaria-municipal-saude', label: 'Secretaria Municipal da Saúde', visible: true },
      { id: 'vigilancia-sanitaria-epidemiologica', label: 'Vigilância Sanitária / Epidemiológica', visible: true },
      { id: 'registro-nascimentos-hospitais', label: 'Registro de Nascimentos para Hospitais', visible: true },
      { id: 'funai', label: 'Fundação Nacional do Índio - FUNAI', visible: true },
      { id: 'defensoria-publica', label: 'Defensoria Pública', visible: true },
      { id: 'listagem-conferencia-indice', label: 'Listagem de Conferência de Índice', visible: true },
      { id: 'protocolos-agenda', label: 'Protocolos - Agenda', visible: true },
      { id: 'casamentos-agendados', label: 'Casamentos Agendados', visible: true },
      { id: 'publicacao-editais-proclamas', label: 'Publicação de Editais de Proclamas', visible: true }
    ]
  },
  {
    id: 'remessas',
    label: 'Remessas',
    visible: true,
    submenu: [
      { id: 'remessa-guia-seade', label: 'Guia SEADE', visible: true },
      { id: 'remessa-arquivo-seade', label: 'Arquivo SEADE', visible: true },
      { id: 'remessa-intranet', label: 'INTRANET', visible: true }
    ]
  },
  {
    id: 'digitalizacao',
    label: 'Digitalização',
    visible: true,
    submenu: [
      { id: 'digitalizacao-controle', label: 'Controle de Digitalização', visible: true },
      { id: 'digitalizacao-exclusao', label: 'Exclusão de Registros e Imagens Digitalizadas', visible: true }
    ]
  },
  {
    id: 'outros',
    label: 'Outros',
    visible: true,
    submenu: [
      { id: 'acessibilidade', label: 'Acessibilidade', visible: true }
    ]
  }
]

type ActiveTab = 'geral' | 'funcionario'

export function ConfiguracaoMenuPage({ onClose }: ConfiguracaoMenuPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const modal = useModal()
  const [isModalReady, setIsModalReady] = useState(false)
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('geral')
  const [menuConfig, setMenuConfig] = useState<MenuConfig[]>(DEFAULT_MENU_STRUCTURE)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())
  
  // Garantir que o modal está pronto antes de usar
  React.useEffect(() => {
    setIsModalReady(true)
  }, [])
  
  // Estados para configuração por funcionário
  const [funcionarios, setFuncionarios] = useState<FuncionarioPermissao[]>([])
  const [selectedFuncionario, setSelectedFuncionario] = useState<string>('')
  const [searchFuncionario, setSearchFuncionario] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  
  // Verificar se há alterações em relação ao padrão
  const hasChanges = JSON.stringify(menuConfig) !== JSON.stringify(DEFAULT_MENU_STRUCTURE)
  console.log('🔍 hasChanges:', hasChanges, 'menuConfig:', menuConfig.length, 'DEFAULT:', DEFAULT_MENU_STRUCTURE.length)

  // Carregar configurações
  useEffect(() => {
    const savedConfig = localStorage.getItem('menu-config')
    if (savedConfig) {
      try {
        setMenuConfig(JSON.parse(savedConfig))
      } catch (error) {
        console.error('Erro ao carregar configuração:', error)
      }
    }

    const savedFuncionarios = localStorage.getItem('funcionarios-cadastrados')
    if (savedFuncionarios) {
      try {
        const parsed = JSON.parse(savedFuncionarios)
        const funcionariosComPermissoes: FuncionarioPermissao[] = parsed.map((func: any) => ({
          id: func.codigo || func.id?.toString() || Math.random().toString(),
          nome: func.nome || 'Sem nome',
          menusPermitidos: func.menusPermitidos || []
        }))
        setFuncionarios(funcionariosComPermissoes)
        console.log('✅ Funcionários carregados:', funcionariosComPermissoes.length)
        console.log('📋 Funcionários:', funcionariosComPermissoes.map(f => `${f.id} - ${f.nome}`).join(', '))
      } catch (error) {
        console.error('Erro ao carregar funcionários:', error)
      }
    } else {
      console.log('⚠️ Nenhum funcionário cadastrado encontrado')
    }

    const savedPermissoes = localStorage.getItem('menu-permissoes-funcionarios')
    if (savedPermissoes) {
      try {
        const parsed = JSON.parse(savedPermissoes)
        setFuncionarios(prev => prev.map(func => ({
          ...func,
          menusPermitidos: parsed[func.id] || []
        })))
      } catch (error) {
        console.error('Erro ao carregar permissões:', error)
      }
    }
  }, [])

  const handleSaveGeral = async () => {
    if (!isModalReady) {
      console.warn('⚠️ Modal não está pronto ainda')
      return
    }
    
    console.log('🔵 handleSaveGeral CLICADO!')
    setIsSaving(true)
    
    try {
      const configString = JSON.stringify(menuConfig)
      console.log('💾 Salvando no localStorage:', configString.substring(0, 100) + '...')
      
      localStorage.setItem('menu-config', configString)
      console.log('✅ Salvo no localStorage com sucesso!')
      
      // Disparar evento customizado para atualizar menus em tempo real
      window.dispatchEvent(new CustomEvent('menu-config-updated'))
      console.log('📢 Evento menu-config-updated disparado!')
      
      console.log('🔔 Chamando modal.alert...')
      await modal.alert('✅ Configuração salva e aplicada!\n\nAs alterações já estão ativas.', 'Sucesso', '✅')
      console.log('✅ Modal exibido com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao salvar configuração:', error)
      await modal.alert('Erro ao salvar configuração.', 'Erro', '❌')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveFuncionario = async () => {
    if (!isModalReady) {
      console.warn('⚠️ Modal não está pronto ainda')
      return
    }
    
    setIsSaving(true)
    try {
      const permissoes: { [key: string]: string[] } = {}
      funcionarios.forEach(func => {
        permissoes[func.id] = func.menusPermitidos
      })
      localStorage.setItem('menu-permissoes-funcionarios', JSON.stringify(permissoes))
      await modal.alert('Permissões salvas com sucesso!', 'Sucesso', '✅')
    } catch (error) {
      await modal.alert('Erro ao salvar permissões.', 'Erro', '❌')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (!isModalReady) {
      console.warn('⚠️ Modal não está pronto ainda')
      return
    }
    
    const confirmed = await modal.confirm('Restaurar configuração padrão?\n\nTodos os menus serão exibidos.', 'Confirmar', '⚠️')
    if (confirmed) {
      setMenuConfig(DEFAULT_MENU_STRUCTURE)
      localStorage.removeItem('menu-config')
      
      // Disparar evento customizado para atualizar menus em tempo real
      window.dispatchEvent(new CustomEvent('menu-config-updated'))
      
      await modal.alert('✅ Configuração restaurada e aplicada!', 'Sucesso', '✅')
    }
  }

  const toggleMenuVisibility = (menuId: string, parentId?: string, grandParentId?: string) => {
    console.log('🔵 toggleMenuVisibility chamado:', { menuId, parentId, grandParentId })
    setMenuConfig(prev => {
      const newConfig = JSON.parse(JSON.stringify(prev))
      
      if (grandParentId) {
        const parent = newConfig.find((m: MenuConfig) => m.id === grandParentId)
        if (parent?.submenu) {
          const subParent = parent.submenu.find((s: MenuConfig) => s.id === parentId)
          if (subParent?.submenu) {
            const item = subParent.submenu.find((i: MenuConfig) => i.id === menuId)
            if (item) {
              console.log(`   Encontrado sub-submenu: ${menuId}, visível: ${item.visible} -> ${!item.visible}`)
              item.visible = !item.visible
            }
          }
        }
      } else if (parentId) {
        const parent = newConfig.find((m: MenuConfig) => m.id === parentId)
        if (parent?.submenu) {
          const item = parent.submenu.find((s: MenuConfig) => s.id === menuId)
          if (item) {
            console.log(`   Encontrado submenu: ${menuId}, visível: ${item.visible} -> ${!item.visible}`)
            item.visible = !item.visible
          }
        }
      } else {
        const menu = newConfig.find((m: MenuConfig) => m.id === menuId)
        if (menu) {
          console.log(`   Encontrado menu: ${menuId}, visível: ${menu.visible} -> ${!menu.visible}`)
          menu.visible = !menu.visible
        }
      }
      
      console.log('✅ Novo estado menuConfig:', newConfig.find(m => m.id === menuId)?.visible)
      return newConfig
    })
  }

  const toggleFuncionarioPermissao = (menuId: string) => {
    if (!selectedFuncionario) return
    
    setFuncionarios(prev => prev.map(func => {
      if (func.id === selectedFuncionario) {
        const hasPermissao = func.menusPermitidos.includes(menuId)
        return {
          ...func,
          menusPermitidos: hasPermissao
            ? func.menusPermitidos.filter(id => id !== menuId)
            : [...func.menusPermitidos, menuId]
        }
      }
      return func
    }))
  }

  const toggleExpanded = (menuId: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev)
      if (newSet.has(menuId)) {
        newSet.delete(menuId)
      } else {
        newSet.add(menuId)
      }
      return newSet
    })
  }

  // Filtrar menus e criar mapa de itens encontrados
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set())
  
  const filteredMenus = menuConfig.filter(menu => {
    const search = searchTerm.toLowerCase()
    if (!search) {
      // Se não há busca, limpa os destaques
      if (matchedItems.size > 0) setMatchedItems(new Set())
      return true
    }
    
    // Verifica se o menu pai corresponde
    const menuMatches = menu.label.toLowerCase().includes(search)
    
    // Verifica se algum subitem corresponde
    const hasMatchingSubmenu = menu.submenu?.some(sub => {
      const subMatches = sub.label.toLowerCase().includes(search)
      const hasMatchingSubSubmenu = sub.submenu?.some(item => 
        item.label.toLowerCase().includes(search)
      )
      return subMatches || hasMatchingSubSubmenu
    })
    
    return menuMatches || hasMatchingSubmenu
  })
  
  // Atualizar itens correspondentes para destaque e expandir menus
  useEffect(() => {
    const search = searchTerm.toLowerCase()
    if (!search) {
      setMatchedItems(new Set())
      return
    }
    
    const matches = new Set<string>()
    const menusToExpand = new Set<string>()
    
    filteredMenus.forEach(menu => {
      if (menu.label.toLowerCase().includes(search)) {
        matches.add(menu.id)
      }
      
      menu.submenu?.forEach(sub => {
        if (sub.label.toLowerCase().includes(search)) {
          matches.add(sub.id)
          menusToExpand.add(menu.id) // Expandir menu pai
        }
        
        sub.submenu?.forEach(item => {
          if (item.label.toLowerCase().includes(search)) {
            matches.add(item.id)
            menusToExpand.add(menu.id) // Expandir menu pai
            menusToExpand.add(sub.id) // Expandir submenu pai
          }
        })
      })
    })
    
    setMatchedItems(matches)
    setExpandedMenus(menusToExpand)
  }, [searchTerm, menuConfig])

  const funcionarioTemPermissao = (menuId: string): boolean => {
    const func = funcionarios.find(f => f.id === selectedFuncionario)
    return func?.menusPermitidos.includes(menuId) || false
  }

  // Função auxiliar para verificar se um item ou seus filhos correspondem à busca
  const itemMatchesSearch = (item: MenuConfig, search: string): boolean => {
    if (!search) return true // Sem busca, mostra tudo
    
    // Verifica se o próprio item corresponde
    if (item.label.toLowerCase().includes(search)) return true
    
    // Verifica se algum subitem corresponde (recursivo)
    if (item.submenu) {
      return item.submenu.some(sub => itemMatchesSearch(sub, search))
    }
    
    return false
  }

  const renderMenuItem = (menu: MenuConfig, parentId?: string, grandParentId?: string) => {
    const isMatched = matchedItems.has(menu.id)
    const search = searchTerm.toLowerCase()
    
    // Se há busca ativa e o item não corresponde, não renderiza
    if (search && !itemMatchesSearch(menu, search)) {
      return null
    }
    
    return (
    <div key={menu.id} style={{ marginBottom: '10px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px',
          backgroundColor: isMatched ? (currentTheme === 'dark' ? '#3a3a3a' : '#d3d3d3') : theme.surface,
          border: `1px solid ${isMatched ? '#4CAF50' : theme.border}`,
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <input
          type="checkbox"
          checked={menu.visible}
          onChange={(e) => {
            e.stopPropagation()
            toggleMenuVisibility(menu.id, parentId, grandParentId)
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '18px',
            height: '18px',
            cursor: 'pointer',
            flexShrink: 0
          }}
        />
        <span
          onClick={() => menu.submenu && toggleExpanded(menu.id)}
          style={{
            flex: 1,
            fontSize: parentId ? '14px' : '16px',
            fontWeight: parentId ? 'normal' : 'bold',
            color: theme.text,
            textDecoration: menu.visible ? 'none' : 'line-through',
            opacity: menu.visible ? 1 : 0.5
          }}
        >
          {menu.submenu && (expandedMenus.has(menu.id) ? '▼' : '▶')} {menu.label}
        </span>
      </div>

      {menu.submenu && expandedMenus.has(menu.id) && (
        <div style={{ marginLeft: '30px', marginTop: '5px' }}>
          {menu.submenu
            .filter(subItem => !search || itemMatchesSearch(subItem, search))
            .map(subItem => renderMenuItem(subItem, menu.id, parentId))}
        </div>
      )}
    </div>
  )
  }

  const renderMenuItemFuncionario = (menu: MenuConfig, parentId?: string, grandParentId?: string) => (
    <div key={menu.id} style={{ marginBottom: '10px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px',
          backgroundColor: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        <input
          type="checkbox"
          checked={funcionarioTemPermissao(menu.id)}
          onChange={(e) => {
            e.stopPropagation()
            toggleFuncionarioPermissao(menu.id)
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '18px',
            height: '18px',
            cursor: 'pointer',
            flexShrink: 0
          }}
        />
        <span
          onClick={() => menu.submenu && toggleExpanded(menu.id)}
          style={{
            flex: 1,
            fontSize: parentId ? '14px' : '16px',
            fontWeight: parentId ? 'normal' : 'bold',
            color: theme.text,
            textDecoration: funcionarioTemPermissao(menu.id) ? 'none' : 'line-through',
            opacity: funcionarioTemPermissao(menu.id) ? 1 : 0.5
          }}
        >
          {menu.submenu && (expandedMenus.has(menu.id) ? '▼' : '▶')} {menu.label}
        </span>
      </div>

      {menu.submenu && expandedMenus.has(menu.id) && (
        <div style={{ marginLeft: '30px', marginTop: '5px' }}>
          {menu.submenu.map(subItem => renderMenuItemFuncionario(subItem, menu.id, parentId))}
        </div>
      )}
    </div>
  )

  return (
    <>
      <BasePage
        title="Configuração de Menus"
        onClose={onClose}
        width="900px"
        height="580px"
        minWidth="900px"
        minHeight="580px"
        resizable={false}
        headerColor={headerColor}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0' }}>
          {/* Header com Título e Abas */}
          <div style={{
            padding: '15px',
            borderBottom: `2px solid ${theme.border}`,
            backgroundColor: theme.surface
          }}>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              marginBottom: '15px',
              color: theme.text
            }}>
              ⚙️ Configuração de Menus e Permissões
            </div>

            {/* Abas */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button
                onClick={() => setActiveTab('geral')}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: activeTab === 'geral' ? 'bold' : 'normal',
                  backgroundColor: activeTab === 'geral' ? '#4CAF50' : '#999',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                📋 Configuração Geral
              </button>
              <button
                onClick={() => setActiveTab('funcionario')}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: activeTab === 'funcionario' ? 'bold' : 'normal',
                  backgroundColor: activeTab === 'funcionario' ? '#4CAF50' : '#999',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                👤 Por Funcionário
              </button>
            </div>

            {/* Área de busca ou seleção */}
            {activeTab === 'geral' && (
              <>
                <div style={{ fontSize: '14px', marginBottom: '10px', color: theme.textSecondary }}>
                  Selecione quais menus e itens deseja exibir no sistema
                </div>
                <input
                  type="text"
                  placeholder="🔍 Buscar menu ou item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '4px',
                    backgroundColor: theme.background,
                    color: theme.text,
                    outline: 'none'
                  }}
                />
              </>
            )}

            {activeTab === 'funcionario' && (
              <>
                <div style={{ fontSize: '14px', marginBottom: '10px', color: theme.textSecondary }}>
                  Configure quais telas cada funcionário pode acessar
                </div>
                <input
                  type="text"
                  placeholder="🔍 Buscar por nome, código ou ordem sinal público..."
                  value={searchFuncionario}
                  onChange={(e) => setSearchFuncionario(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '4px',
                    backgroundColor: theme.background,
                    color: theme.text,
                    outline: 'none',
                    marginBottom: '10px'
                  }}
                />
              </>
            )}
          </div>

          {/* Lista de Menus ou Funcionários */}
          <div style={{
            flex: 1,
            padding: '15px',
            overflowY: 'auto',
            backgroundColor: theme.background
          }}>
            {/* Aba Geral - Lista de Menus */}
            {activeTab === 'geral' && (
              <>
                {filteredMenus.length > 0 ? (
                  filteredMenus.map(menu => renderMenuItem(menu))
                ) : (
                  searchTerm && (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      fontSize: '16px',
                      color: theme.textSecondary
                    }}>
                      🔍 Nenhum menu encontrado com "{searchTerm}"
                    </div>
                  )
                )}
              </>
            )}
            
            {/* Aba Funcionário - Configuração de Menus do Funcionário Selecionado */}
            {activeTab === 'funcionario' && selectedFuncionario && (
              <div>
                <div style={{
                  marginBottom: '15px',
                  padding: '10px',
                  backgroundColor: theme.surface,
                  borderRadius: '6px',
                  borderLeft: `4px solid #4CAF50`
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: theme.text }}>
                    Configurando permissões para:
                  </div>
                  <div style={{ fontSize: '16px', color: theme.primary, marginTop: '5px' }}>
                    {funcionarios.find(f => f.id === selectedFuncionario)?.nome}
                  </div>
                  <button
                    onClick={() => setSelectedFuncionario('')}
                    style={{
                      marginTop: '10px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: '#999',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ← Voltar à lista
                  </button>
                </div>
                {menuConfig.map(menu => renderMenuItemFuncionario(menu))}
              </div>
            )}
            
            {/* Aba Funcionário - Lista de Cards de Funcionários */}
            {activeTab === 'funcionario' && !selectedFuncionario && (
              <>
                {funcionarios.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    fontSize: '16px',
                    color: theme.textSecondary
                  }}>
                    ℹ️ Nenhum funcionário cadastrado
                    <div style={{ fontSize: '14px', marginTop: '10px' }}>
                      Cadastre funcionários em: <strong>Cadastros → Funcionário</strong>
                    </div>
                  </div>
                ) : (
                  <>
                    {funcionarios
                      .filter(func => {
                        const search = searchFuncionario.toUpperCase()
                        const funcionarioCompleto = JSON.parse(localStorage.getItem('funcionarios-cadastrados') || '[]')
                          .find((f: any) => f.codigo === func.id || f.id === func.id)
                        
                        return func.nome.toUpperCase().includes(search) ||
                               func.id.toUpperCase().includes(search) ||
                               (funcionarioCompleto?.ordemSinalPublico && funcionarioCompleto.ordemSinalPublico.toString().includes(search))
                      })
                      .map(func => {
                        const funcionarioCompleto = JSON.parse(localStorage.getItem('funcionarios-cadastrados') || '[]')
                          .find((f: any) => f.codigo === func.id || f.id === func.id)
                        
                        return (
                          <div
                            key={func.id}
                            onClick={() => setSelectedFuncionario(func.id)}
                            style={{
                              padding: '15px',
                              marginBottom: '10px',
                              backgroundColor: theme.surface,
                              border: `2px solid ${theme.border}`,
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '15px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#4CAF50'
                              e.currentTarget.style.backgroundColor = currentTheme === 'dark' ? '#2a4a2a' : '#e8f5e9'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = theme.border
                              e.currentTarget.style.backgroundColor = theme.surface
                            }}
                          >
                            <div style={{
                              fontSize: '32px',
                              width: '50px',
                              height: '50px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#4CAF50',
                              borderRadius: '50%',
                              flexShrink: 0
                            }}>
                              👤
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '16px', fontWeight: 'bold', color: theme.text, marginBottom: '5px' }}>
                                {func.id} - {func.nome}
                              </div>
                              <div style={{ fontSize: '12px', color: theme.textSecondary, display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                {funcionarioCompleto?.ordemSinalPublico && <span>Ordem: {funcionarioCompleto.ordemSinalPublico}</span>}
                                {funcionarioCompleto?.cargo && <span>Cargo: {funcionarioCompleto.cargo}</span>}
                                {funcionarioCompleto?.cpf && <span>CPF: {funcionarioCompleto.cpf}</span>}
                                {funcionarioCompleto?.email && <span>Email: {funcionarioCompleto.email}</span>}
                              </div>
                            </div>
                            <div style={{
                              fontSize: '24px',
                              color: '#4CAF50',
                              flexShrink: 0
                            }}>
                              →
                            </div>
                          </div>
                        )
                      })}
                    
                    {funcionarios.filter(func => {
                      const search = searchFuncionario.toUpperCase()
                      const funcionarioCompleto = JSON.parse(localStorage.getItem('funcionarios-cadastrados') || '[]')
                        .find((f: any) => f.codigo === func.id || f.id === func.id)
                      
                      return func.nome.toUpperCase().includes(search) ||
                             func.id.toUpperCase().includes(search) ||
                             (funcionarioCompleto?.ordemSinalPublico && funcionarioCompleto.ordemSinalPublico.toString().includes(search))
                    }).length === 0 && (
                      <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        fontSize: '16px',
                        color: theme.textSecondary
                      }}>
                        🔍 Nenhum funcionário encontrado com "{searchFuncionario}"
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Rodapé com Botões */}
          <div style={{
            padding: '15px',
            borderTop: `2px solid ${theme.border}`,
            backgroundColor: theme.surface,
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 10
          }}
          >
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                backgroundColor: hasChanges ? '#ff9800' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: hasChanges ? 'pointer' : 'not-allowed',
                minWidth: '140px',
                opacity: hasChanges ? 1 : 0.6
              }}
              title={hasChanges ? 'Restaurar configuração padrão' : 'Nenhuma alteração para restaurar'}
            >
              🔄 Restaurar Padrão
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                console.log('🟢🟢🟢 BOTÃO SALVAR CLICADO! 🟢🟢🟢')
                if (activeTab === 'geral') {
                  handleSaveGeral()
                } else {
                  handleSaveFuncionario()
                }
              }}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                backgroundColor: isSaving ? '#45a049' : '#4CAF50',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: isSaving ? 'wait' : 'pointer',
                minWidth: '140px',
                transform: isSaving ? 'scale(0.98)' : 'scale(1)',
                transition: 'all 0.2s ease',
                opacity: isSaving ? 0.8 : 1
              }}
              onMouseEnter={(e) => {
                if (!isSaving) e.currentTarget.style.backgroundColor = '#45a049'
              }}
              onMouseLeave={(e) => {
                if (!isSaving) e.currentTarget.style.backgroundColor = '#4CAF50'
              }}
              onMouseDown={(e) => {
                if (!isSaving) e.currentTarget.style.transform = 'scale(0.95)'
              }}
              onMouseUp={(e) => {
                if (!isSaving) e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {isSaving ? '⏳ Salvando...' : '💾 Salvar Configuração'}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                backgroundColor: '#777',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                minWidth: '140px'
              }}
            >
              🚪 Retornar
            </button>
          </div>
        </div>
        
        {/* Modal Component - DENTRO da janela */}
        {isModalReady && <modal.ModalComponent />}
      </BasePage>
    </>
  )
}

