import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  UserIcon, 
  DocumentIcon, 
  RegistryIcon, 
  CertificateIcon, 
  SearchIcon, 
  PrintIcon, 
  UploadIcon, 
  DownloadIcon, 
  ArrowDownIcon,
  MenuIcon,
  XIcon,
  NotificationsIcon,
  InfoIcon,
  LogoutIcon
} from './icons'
import { usePermissions } from '../hooks/usePermissions'
import { useAuth } from '../contexts/AuthContext'
import { useWindows } from '../contexts/WindowContext'
import { ProtocoloLancamentoWindow } from './windows/ProtocoloLancamentoWindow'
import { ProtocoloBaixaWindow } from './windows/ProtocoloBaixaWindow'
import { ClienteWindow } from './windows/ClienteWindow'

export function MenuBar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  const { hasPermission, isAdmin } = usePermissions()
  const { user, logout } = useAuth()
  const { openWindow } = useWindows()
  const navigate = useNavigate()

  const menuItems = [
    { 
      name: 'Cadastros', 
      icon: UserIcon,
      items: [
        { name: 'Cliente', permission: 'cadastros.cliente' },
        { name: 'Funcionário', permission: 'cadastros.funcionario', adminOnly: true },
        { name: 'Cartório (SEADE)', permission: 'cadastros.cartorio' },
        { name: 'Cidade', permission: 'cadastros.cidade', adminOnly: true },
        { name: 'País', permission: 'cadastros.pais', adminOnly: true },
        { name: 'DNV e DO Bloqueadas', permission: 'cadastros.dnv' },
        { name: 'Modelos e Minutas - Procuração', permission: 'cadastros.modelos', adminOnly: true },
        { name: 'Ofícios e Mandados', permission: 'cadastros.oficios' },
        { name: 'Averbação', permission: 'cadastros.averbacao' },
        { name: 'Hospital', permission: 'cadastros.hospital' },
        { name: 'Cemitério', permission: 'cadastros.cemiterio' },
        { name: 'Funerária', permission: 'cadastros.funeraria' },
        { name: 'Cadastro de Livros', permission: 'cadastros.livros' },
        { name: 'Feriados', permission: 'cadastros.feriados', adminOnly: true },
        { name: 'Configuração do Sistema', permission: 'cadastros.configuracao', adminOnly: true },
        { name: 'Sair', permission: null }
      ]
    },
        { 
          name: 'Lavratura', 
          icon: DocumentIcon, 
          items: [
            { name: 'Casamento', permission: 'lavratura.casamento' },
            { name: 'Nascimento', permission: 'lavratura.nascimento' },
            { name: 'Óbito', permission: 'lavratura.obito' }
          ]
        },
        { 
          name: 'Protocolos', 
          icon: RegistryIcon, 
          items: [
            { name: 'Lançamento', permission: 'protocolos.lancamento' },
            { name: 'Baixa', permission: 'protocolos.baixa' },
            { name: 'Cancelamento', permission: 'protocolos.cancelamento' }
          ]
        },
    { name: 'Livro Comercial', icon: DocumentIcon, items: [] },
    { name: 'Livro E', icon: DocumentIcon, items: [] },
    { name: 'Certidões', icon: CertificateIcon, items: [] },
        { name: 'Índice', icon: SearchIcon, items: [] },
        { name: 'Relatórios', icon: PrintIcon, items: [] },
        { name: 'Remessas', icon: UploadIcon, items: [] },
        { name: 'Digitalização', icon: DownloadIcon, items: [] },
        { name: 'Procuração', icon: DocumentIcon, items: [] }
  ]

  // Filtrar itens do menu baseado nas permissões
  const getFilteredMenuItems = (items: any[]) => {
    return items.filter(item => {
      if (!item.permission) return true; // Item sem permissão (como "Sair")
      if (item.adminOnly && !isAdmin()) return false;
      return hasPermission(item.permission);
    });
  };

  const handleMenuClick = (item: any, subItem: any) => {
    // Abrir janelas móveis para os submenus
    if (item.name === 'Cadastros') {
      if (subItem.name === 'Cliente') {
        openWindow({
          id: 'cliente-window',
          title: 'Cadastro de Cliente',
          component: <ClienteWindow />,
          width: 800,
          height: 700,
          initialX: 100,
          initialY: 100
        })
      }
    } else if (item.name === 'Protocolos') {
      if (subItem.name === 'Lançamento') {
        openWindow({
          id: 'protocolo-lancamento-window',
          title: 'Lançamento de Protocolo',
          component: <ProtocoloLancamentoWindow />,
          width: 900,
          height: 650,
          initialX: 150,
          initialY: 100
        })
      } else if (subItem.name === 'Baixa') {
        openWindow({
          id: 'protocolo-baixa-window',
          title: 'Baixa de Protocolo',
          component: <ProtocoloBaixaWindow />,
          width: 800,
          height: 600,
          initialX: 200,
          initialY: 150
        })
      }
    }
    setIsMobileMenuOpen(false)
  }

  const handleMouseEnter = (menuName: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    setActiveMenu(menuName)
  }

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveMenu(null)
    }, 500)
    setHoverTimeout(timeout)
  }

  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
      }
    }
  }, [hoverTimeout])

  return (
    <>
      {/* Menu Mobile Button */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-4 py-2 shadow-lg">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center space-x-2 text-white hover:text-yellow-200"
          >
            <MenuIcon size={20} />
            <span className="font-medium">Menu</span>
          </button>
          
          {/* Controles do Usuário Mobile */}
          {user && (
            <div className="flex items-center space-x-2">
              <button className="p-1 text-white hover:text-yellow-200">
                <NotificationsIcon size={18} />
              </button>
              <button className="p-1 text-white hover:text-yellow-200">
                <InfoIcon size={18} />
              </button>
              <div className="flex items-center space-x-1 text-white">
                <UserIcon size={16} className="text-yellow-200" />
                <span className="text-xs font-medium">{user.name}</span>
                <span className={`text-xs px-1 py-0.5 rounded-full ${
                  isAdmin() 
                    ? 'bg-red-200 text-red-800' 
                    : 'bg-blue-200 text-blue-800'
                }`}>
                  {isAdmin() ? 'ADMIN' : 'FUNC'}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-1 text-white hover:text-red-200"
              >
                <LogoutIcon size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Menu Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white h-full w-80 max-w-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Menu do Sistema</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon
                const filteredItems = getFilteredMenuItems(item.items)
                
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded">
                      <IconComponent size={16} className="text-primary-600" />
                      <span>{item.name}</span>
                    </div>
                    
                    {filteredItems.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {filteredItems.map((subItem, index) => (
                          <button
                            key={index}
                            onClick={() => handleMenuClick(item, subItem)}
                            className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                              subItem.adminOnly && isAdmin()
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{subItem.name}</span>
                              {subItem.adminOnly && isAdmin() && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                  ADMIN
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

             {/* Menu Desktop */}
             <div className="hidden lg:block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-4 shadow-lg">
               <div className="flex justify-between items-center">
                 <nav className="flex space-x-6">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            return (
              <div key={item.name} className="relative">
                <button
                  className={`px-3 py-2 text-sm font-medium flex items-center space-x-2 transition-colors rounded-lg ${
                    activeMenu === item.name 
                      ? 'text-white bg-white bg-opacity-20 shadow-md' 
                      : 'text-white hover:text-yellow-200 hover:bg-white hover:bg-opacity-10'
                  }`}
                  onMouseEnter={() => handleMouseEnter(item.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <IconComponent size={16} className="text-yellow-200" />
                  <span>{item.name}</span>
                  {item.items.length > 0 && <ArrowDownIcon size={14} className="text-yellow-200" />}
                </button>
                
                {activeMenu === item.name && item.items.length > 0 && (
                  <div 
                    className="absolute top-full left-0 bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-purple-200 shadow-xl z-50 min-w-72 rounded-lg py-2 mt-1"
                    onMouseEnter={() => handleMouseEnter(item.name)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {getFilteredMenuItems(item.items).map((subItem, index) => (
                      <div key={index}>
                        {subItem.name === 'Funcionário' && <div className="border-t border-gray-200 my-2"></div>}
                        {subItem.name === 'Feriados' && <div className="border-t border-gray-200 my-2"></div>}
                        <button
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            hoveredItem === `${item.name}-${subItem.name}`
                              ? subItem.adminOnly && isAdmin()
                                ? 'bg-red-100 text-red-700'
                                : 'bg-primary-50 text-primary-700'
                              : subItem.adminOnly && isAdmin() 
                                ? 'text-red-600 hover:bg-red-50' 
                                : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onMouseEnter={() => setHoveredItem(`${item.name}-${subItem.name}`)}
                          onMouseLeave={() => setHoveredItem(null)}
                          onClick={() => handleMenuClick(item, subItem)}
                        >
                          <div className="flex items-center justify-between">
                            <span>{subItem.name}</span>
                            {subItem.adminOnly && isAdmin() && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                ADMIN
                              </span>
                            )}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
        
        {/* Controles do Usuário */}
        {user && (
          <div className="flex items-center space-x-4">
            <button className="p-2 text-white hover:text-yellow-200 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors">
              <NotificationsIcon size={20} />
            </button>
            
            <button className="p-2 text-white hover:text-yellow-200 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors">
              <InfoIcon size={20} />
            </button>
            
            <div className="flex items-center space-x-2 text-white">
              <UserIcon size={20} className="text-yellow-200" />
              <span className="text-sm font-medium">{user.name}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                isAdmin() 
                  ? 'bg-red-200 text-red-800' 
                  : 'bg-blue-200 text-blue-800'
              }`}>
                {isAdmin() ? 'ADMIN' : 'FUNCIONÁRIO'}
              </span>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-1 px-3 py-2 text-white hover:text-red-200 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <LogoutIcon size={16} />
              <span className="text-sm">Sair</span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}

