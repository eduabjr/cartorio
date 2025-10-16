import { useState } from 'react'

function App() {
  const [openDropdown, setOpenDropdown] = useState('')

  const handleMenuClick = (menuId: string) => {
    console.log('Menu clicado:', menuId, 'Dropdown atual:', openDropdown)
    if (menuId === 'cadastros' || menuId === 'processos') {
      const newDropdown = openDropdown === menuId ? '' : menuId
      console.log('Novo dropdown:', newDropdown)
      setOpenDropdown(newDropdown)
    } else {
      setOpenDropdown('')
    }
  }

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#1e293b'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(30, 41, 59, 0.1)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
          🏛️ Sistema de Cartório - TESTE
        </h1>
      </div>

      {/* Menu Superior */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        padding: '12px 24px',
        borderBottom: '1px solid rgba(30, 41, 59, 0.1)'
      }}>
        <div style={{ display: 'flex', gap: '0px', alignItems: 'center' }}>
          {[
            { id: 'cadastros', label: 'Cadastros' },
            { id: 'processos', label: 'Processos' },
            { id: 'protocolos', label: 'Protocolos' },
            { id: 'lavratura', label: 'Lavratura' }
          ].map((menu) => (
            <div key={menu.id} style={{ position: 'relative' }}>
              <button
                onClick={() => handleMenuClick(menu.id)}
                style={{
                  padding: '8px 12px',
                  background: openDropdown === menu.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  color: openDropdown === menu.id ? '#3b82f6' : '#1e293b',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  if (openDropdown !== menu.id) {
                    (e.target as HTMLButtonElement).style.color = '#3b82f6'
                    (e.target as HTMLButtonElement).style.background = 'rgba(59, 130, 246, 0.1)'
                  }
                }}
                onMouseOut={(e) => {
                  if (openDropdown !== menu.id) {
                    (e.target as HTMLButtonElement).style.color = '#1e293b'
                    (e.target as HTMLButtonElement).style.background = 'transparent'
                  }
                }}
              >
                {menu.label}
              </button>
              
              {/* Dropdown para Cadastros */}
              {menu.id === 'cadastros' && openDropdown === 'cadastros' && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(30, 41, 59, 0.2)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                  zIndex: 99999,
                  minWidth: '250px',
                  padding: '8px 0'
                }}>
                  {[
                    { id: 'cliente', label: 'Cliente' },
                    { id: 'cartorio-seade', label: 'Cartório (SEADE)' },
                    { id: 'cidade', label: 'Cidade' },
                    { id: 'pais', label: 'País' },
                    { id: 'hospital', label: 'Hospital' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        console.log('Item clicado:', item.id)
                        setOpenDropdown('')
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        background: 'transparent',
                        color: '#1e293b',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '400',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        display: 'block',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseOver={(e) => {
                        const target = e.target as HTMLButtonElement
                        target.style.background = 'rgba(59, 130, 246, 0.1)'
                        target.style.color = '#3b82f6'
                      }}
                      onMouseOut={(e) => {
                        const target = e.target as HTMLButtonElement
                        target.style.background = 'transparent'
                        target.style.color = '#1e293b'
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Dropdown para Processos */}
              {menu.id === 'processos' && openDropdown === 'processos' && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(30, 41, 59, 0.2)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                  zIndex: 99999,
                  minWidth: '280px',
                  padding: '8px 0'
                }}>
                  {[
                    { id: 'recepcao-funeraria', label: 'Recepção de Arquivo da Funerária' },
                    { id: 'recepcao-maternidade', label: 'Recepção de Arquivo da Maternidade' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        console.log('Item clicado:', item.id)
                        setOpenDropdown('')
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        background: 'transparent',
                        color: '#1e293b',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '400',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        display: 'block',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseOver={(e) => {
                        const target = e.target as HTMLButtonElement
                        target.style.background = 'rgba(59, 130, 246, 0.1)'
                        target.style.color = '#3b82f6'
                      }}
                      onMouseOut={(e) => {
                        const target = e.target as HTMLButtonElement
                        target.style.background = 'transparent'
                        target.style.color = '#1e293b'
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{
        flex: 1,
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h2>🎯 Teste dos Menus</h2>
          <p>Clique em <strong>Cadastros</strong> ou <strong>Processos</strong> para testar os dropdowns.</p>
          <p>Estado atual do dropdown: <strong>{openDropdown || 'nenhum'}</strong></p>
        </div>
      </div>
    </div>
  )
}

export default App
