import { 
  UserIcon, 
  DocumentIcon, 
  RegistryIcon, 
  CertificateIcon, 
  BuildingIcon, 
  SearchIcon, 
  PrintIcon, 
  UploadIcon,
  SettingsIcon
} from './icons'

export function Toolbar() {
  const toolbarItems = [
    { icon: UserIcon, label: 'Cadastros', onClick: () => console.log('Cadastros') },
    { icon: DocumentIcon, label: 'Documentos', onClick: () => console.log('Documentos') },
    { icon: RegistryIcon, label: 'Processos', onClick: () => console.log('Processos') },
    { icon: CertificateIcon, label: 'Certidões', onClick: () => console.log('Certidões') },
    { icon: BuildingIcon, label: 'Livro Comercial', onClick: () => console.log('Livro Comercial') },
    { icon: SearchIcon, label: 'Índice', onClick: () => console.log('Índice') },
    { icon: SearchIcon, label: 'Buscar', onClick: () => console.log('Buscar') },
    { icon: PrintIcon, label: 'Relatórios', onClick: () => console.log('Relatórios') },
    { icon: UploadIcon, label: 'Digitalização', onClick: () => console.log('Digitalização') },
    { icon: DocumentIcon, label: 'Procuração', onClick: () => console.log('Procuração') },
    { icon: SettingsIcon, label: 'Configurações', onClick: () => console.log('Configurações') }
  ]

  return (
    <div className="bg-white border-b border-gray-300 px-4 py-2">
      <div className="flex space-x-2">
        {toolbarItems.map((item, index) => {
          const IconComponent = item.icon
          return (
            <button
              key={index}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors group"
              title={item.label}
              onClick={item.onClick}
            >
              <IconComponent 
                size={20} 
                className="text-gray-600 group-hover:text-primary-600 transition-colors" 
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

