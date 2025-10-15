import { useState } from 'react'
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
  XIcon
} from './icons'
import { usePermissions } from '../hooks/usePermissions'
import { useWindows } from '../contexts/WindowContext'
import { ProtocoloLancamentoWindow } from './windows/ProtocoloLancamentoWindow'
import { ProtocoloBaixaWindow } from './windows/ProtocoloBaixaWindow'
import { ClienteWindow } from './windows/ClienteWindow'

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const { hasPermission, isAdmin } = usePermissions()
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
        { name: 'Configuração do Sistema', permission: 'cadastros.configuracao', adminOnly: true }
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

  const getFilteredMenuItems = (items: any[]) => {
    return items.filter(item => {
      if (!item.permission) return true
      if (item.adminOnly && !isAdmin()) return false
      return hasPermission(item.permission)
    })
  }

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    )
  }

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
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 h-full w-80 max-w-full overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-white border-opacity-20 flex items-center justify-between text-white">
          <h2 className="text-lg font-semibold">Menu do Sistema</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <XIcon size={20} />
          </button>
        </div>
        
        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            const filteredItems = getFilteredMenuItems(item.items)
            const isExpanded = expandedMenus.includes(item.name)
            
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => item.items.length > 0 ? toggleMenu(item.name) : null}
                  className={`w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    item.items.length > 0 
                      ? 'text-white hover:bg-white hover:bg-opacity-20' 
                      : 'text-white cursor-default'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent size={18} className="text-yellow-200" />
                    <span>{item.name}</span>
                  </div>
                  {item.items.length > 0 && (
                    <ArrowDownIcon 
                      size={16} 
                      className={`text-yellow-200 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>
                
                {isExpanded && filteredItems.length > 0 && (
                  <div className="ml-6 space-y-1 border-l-2 border-yellow-200 pl-4">
                    {filteredItems.map((subItem, index) => (
                      <button
                        key={index}
                        onClick={() => handleMenuClick(item, subItem)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                          subItem.adminOnly && isAdmin()
                            ? 'text-red-200 hover:bg-red-500 hover:bg-opacity-20'
                            : 'text-white hover:bg-white hover:bg-opacity-10'
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            <p>Sistema de Cartório</p>
            <p>Versão 1.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}
