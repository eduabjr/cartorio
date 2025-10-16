import React, { useState, useEffect } from 'react'

interface NascimentoData {
  id: string
  nomeCompleto: string
  dataNascimento: string
  horaNascimento: string
  peso: string
  altura: string
  sexo: 'M' | 'F'
  nomeMae: string
  cpfMae: string
  nomePai: string
  cpfPai: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  telefone: string
  email: string
  observacoes: string
  medicoResponsavel: string
  crmMedico: string
  hospital: string
  dataRegistro: string
  status: 'pendente' | 'processado' | 'exportado'
}

export function MaternidadeModule() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState('novo')
  const [registros, setRegistros] = useState<NascimentoData[]>([])
  const [formData, setFormData] = useState<Partial<NascimentoData>>({
    nomeCompleto: '',
    dataNascimento: '',
    horaNascimento: '',
    peso: '',
    altura: '',
    sexo: 'M',
    nomeMae: '',
    cpfMae: '',
    nomePai: '',
    cpfPai: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    observacoes: '',
    medicoResponsavel: '',
    crmMedico: '',
    hospital: '',
    status: 'pendente'
  })

  // Carregar dados salvos
  useEffect(() => {
    const savedRegistros = localStorage.getItem('maternidade-registros')
    const savedTheme = localStorage.getItem('maternidade-theme')
    
    if (savedRegistros) {
      setRegistros(JSON.parse(savedRegistros))
    }
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
    }
  }, [])

  // Salvar dados
  useEffect(() => {
    localStorage.setItem('maternidade-registros', JSON.stringify(registros))
  }, [registros])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('maternidade-theme', newTheme ? 'dark' : 'light')
  }

  const handleInputChange = (field: keyof NascimentoData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const novoRegistro: NascimentoData = {
      id: Date.now().toString(),
      ...formData,
      dataRegistro: new Date().toISOString(),
      status: 'pendente'
    } as NascimentoData

    setRegistros(prev => [...prev, novoRegistro])
    setFormData({
      nomeCompleto: '',
      dataNascimento: '',
      horaNascimento: '',
      peso: '',
      altura: '',
      sexo: 'M',
      nomeMae: '',
      cpfMae: '',
      nomePai: '',
      cpfPai: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      telefone: '',
      email: '',
      observacoes: '',
      medicoResponsavel: '',
      crmMedico: '',
      hospital: '',
      status: 'pendente'
    })
    
    alert('Registro de nascimento salvo com sucesso!')
  }

  const exportarRegistros = () => {
    const registrosParaExportar = registros.filter(r => r.status === 'pendente')
    
    if (registrosParaExportar.length === 0) {
      alert('Não há registros pendentes para exportar.')
      return
    }

    // Simular exportação para o sistema principal
    const dadosExportacao = {
      modulo: 'maternidade',
      timestamp: new Date().toISOString(),
      registros: registrosParaExportar,
      total: registrosParaExportar.length
    }

    // Salvar dados para integração futura
    localStorage.setItem('maternidade-exportacao', JSON.stringify(dadosExportacao))
    
    // Marcar registros como exportados
    setRegistros(prev => prev.map(r => 
      r.status === 'pendente' ? { ...r, status: 'exportado' } : r
    ))

    alert(`${registrosParaExportar.length} registro(s) exportado(s) com sucesso!`)
  }

  const theme = {
    background: isDarkMode 
      ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    cardBg: isDarkMode 
      ? 'rgba(30, 41, 59, 0.9)'
      : 'rgba(255, 255, 255, 0.95)',
    text: isDarkMode ? '#f1f5f9' : '#1e293b',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? 'rgba(148, 163, 184, 0.3)' : 'rgba(30, 41, 59, 0.2)',
    inputBg: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)',
    buttonBg: isDarkMode ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.9)',
    buttonHover: isDarkMode ? 'rgba(59, 130, 246, 1)' : 'rgba(59, 130, 246, 1)',
    successBg: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
    warningBg: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)'
  }

  return (
    <div style={{
      height: '100vh',
      background: theme.background,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: theme.text,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: theme.cardBg,
        backdropFilter: 'blur(20px)',
        padding: '16px 24px',
        borderBottom: `1px solid ${theme.border}`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 1000
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '100%',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              👶
            </div>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Módulo Maternidade
              </h1>
              <p style={{ margin: 0, fontSize: '14px', color: theme.textSecondary }}>
                Registro de Nascimentos
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={toggleTheme}
              style={{
                padding: '8px 12px',
                background: theme.buttonBg,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = theme.buttonHover}
              onMouseOut={(e) => e.target.style.background = theme.buttonBg}
            >
              {isDarkMode ? '☀️ Claro' : '🌙 Escuro'}
            </button>
            
            <div style={{
              padding: '8px 16px',
              background: theme.successBg,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#10b981'
            }}>
              📊 {registros.length} Registros
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: theme.cardBg,
        backdropFilter: 'blur(20px)',
        padding: '12px 24px',
        borderBottom: `1px solid ${theme.border}`,
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 999
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          maxWidth: '100%',
          overflowX: 'auto'
        }}>
          {[
            { id: 'novo', label: 'Novo Registro', icon: '➕' },
            { id: 'lista', label: 'Lista de Registros', icon: '📋' },
            { id: 'exportar', label: 'Exportar', icon: '📤' },
            { id: 'config', label: 'Configurações', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                background: activeTab === tab.id ? theme.buttonBg : 'transparent',
                color: activeTab === tab.id ? 'white' : theme.text,
                border: `1px solid ${activeTab === tab.id ? '#3b82f6' : theme.border}`,
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                minWidth: 'fit-content'
              }}
              onMouseOver={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.background = theme.buttonBg
                  e.target.style.color = 'white'
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.background = 'transparent'
                  e.target.style.color = theme.text
                }
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div style={{
        flex: 1,
        padding: '24px',
        overflow: 'auto'
      }}>
        {activeTab === 'novo' && (
          <div style={{
            background: theme.cardBg,
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '32px',
            border: `1px solid ${theme.border}`,
            boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h2 style={{ 
              margin: '0 0 24px 0', 
              fontSize: '24px', 
              fontWeight: '600',
              textAlign: 'center'
            }}>
              👶 Registro de Nascimento
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Dados do Recém-nascido */}
              <div style={{
                background: theme.inputBg,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${theme.border}`
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                  📝 Dados do Recém-nascido
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.nomeCompleto || ''}
                      onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Data de Nascimento *
                    </label>
                    <input
                      type="date"
                      value={formData.dataNascimento || ''}
                      onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Hora de Nascimento *
                    </label>
                    <input
                      type="time"
                      value={formData.horaNascimento || ''}
                      onChange={(e) => handleInputChange('horaNascimento', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Peso (g) *
                    </label>
                    <input
                      type="number"
                      value={formData.peso || ''}
                      onChange={(e) => handleInputChange('peso', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Altura (cm) *
                    </label>
                    <input
                      type="number"
                      value={formData.altura || ''}
                      onChange={(e) => handleInputChange('altura', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Sexo *
                    </label>
                    <select
                      value={formData.sexo || 'M'}
                      onChange={(e) => handleInputChange('sexo', e.target.value as 'M' | 'F')}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      required
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dados dos Pais */}
              <div style={{
                background: theme.inputBg,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${theme.border}`
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                  👨‍👩‍👧‍👦 Dados dos Pais
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Nome da Mãe *
                    </label>
                    <input
                      type="text"
                      value={formData.nomeMae || ''}
                      onChange={(e) => handleInputChange('nomeMae', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      CPF da Mãe *
                    </label>
                    <input
                      type="text"
                      value={formData.cpfMae || ''}
                      onChange={(e) => handleInputChange('cpfMae', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Nome do Pai
                    </label>
                    <input
                      type="text"
                      value={formData.nomePai || ''}
                      onChange={(e) => handleInputChange('nomePai', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      CPF do Pai
                    </label>
                    <input
                      type="text"
                      value={formData.cpfPai || ''}
                      onChange={(e) => handleInputChange('cpfPai', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Dados de Contato */}
              <div style={{
                background: theme.inputBg,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${theme.border}`
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                  📍 Dados de Contato
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Endereço *
                    </label>
                    <input
                      type="text"
                      value={formData.endereco || ''}
                      onChange={(e) => handleInputChange('endereco', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Cidade *
                    </label>
                    <input
                      type="text"
                      value={formData.cidade || ''}
                      onChange={(e) => handleInputChange('cidade', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Estado *
                    </label>
                    <input
                      type="text"
                      value={formData.estado || ''}
                      onChange={(e) => handleInputChange('estado', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      CEP *
                    </label>
                    <input
                      type="text"
                      value={formData.cep || ''}
                      onChange={(e) => handleInputChange('cep', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      value={formData.telefone || ''}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Dados Médicos */}
              <div style={{
                background: theme.inputBg,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${theme.border}`
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                  🏥 Dados Médicos
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Médico Responsável *
                    </label>
                    <input
                      type="text"
                      value={formData.medicoResponsavel || ''}
                      onChange={(e) => handleInputChange('medicoResponsavel', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      CRM do Médico *
                    </label>
                    <input
                      type="text"
                      value={formData.crmMedico || ''}
                      onChange={(e) => handleInputChange('crmMedico', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Hospital *
                    </label>
                    <input
                      type="text"
                      value={formData.hospital || ''}
                      onChange={(e) => handleInputChange('hospital', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div style={{
                background: theme.inputBg,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${theme.border}`
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                  📝 Observações
                </h3>
                <textarea
                  value={formData.observacoes || ''}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.inputBg,
                    color: theme.text,
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                  placeholder="Observações adicionais sobre o nascimento..."
                />
              </div>

              {/* Botão de Salvar */}
              <button
                type="submit"
                style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                💾 Salvar Registro de Nascimento
              </button>
            </form>
          </div>
        )}

        {activeTab === 'lista' && (
          <div style={{
            background: theme.cardBg,
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '32px',
            border: `1px solid ${theme.border}`,
            boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ 
              margin: '0 0 24px 0', 
              fontSize: '24px', 
              fontWeight: '600',
              textAlign: 'center'
            }}>
              📋 Lista de Registros
            </h2>
            
            {registros.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: theme.textSecondary
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <p style={{ fontSize: '18px', margin: 0 }}>Nenhum registro encontrado</p>
                <p style={{ fontSize: '14px', margin: '8px 0 0 0' }}>Comece criando um novo registro de nascimento</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {registros.map((registro) => (
                  <div
                    key={registro.id}
                    style={{
                      background: theme.inputBg,
                      padding: '20px',
                      borderRadius: '12px',
                      border: `1px solid ${theme.border}`,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px'
                    }}
                  >
                    <div>
                      <strong style={{ color: theme.text }}>Nome:</strong>
                      <p style={{ margin: '4px 0 0 0', color: theme.textSecondary }}>{registro.nomeCompleto}</p>
                    </div>
                    <div>
                      <strong style={{ color: theme.text }}>Data/Hora:</strong>
                      <p style={{ margin: '4px 0 0 0', color: theme.textSecondary }}>
                        {new Date(registro.dataNascimento).toLocaleDateString('pt-BR')} às {registro.horaNascimento}
                      </p>
                    </div>
                    <div>
                      <strong style={{ color: theme.text }}>Mãe:</strong>
                      <p style={{ margin: '4px 0 0 0', color: theme.textSecondary }}>{registro.nomeMae}</p>
                    </div>
                    <div>
                      <strong style={{ color: theme.text }}>Hospital:</strong>
                      <p style={{ margin: '4px 0 0 0', color: theme.textSecondary }}>{registro.hospital}</p>
                    </div>
                    <div>
                      <strong style={{ color: theme.text }}>Status:</strong>
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        marginTop: '4px',
                        background: registro.status === 'pendente' ? theme.warningBg : theme.successBg,
                        color: registro.status === 'pendente' ? '#f59e0b' : '#10b981'
                      }}>
                        {registro.status === 'pendente' ? '⏳ Pendente' : 
                         registro.status === 'processado' ? '✅ Processado' : '📤 Exportado'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'exportar' && (
          <div style={{
            background: theme.cardBg,
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '32px',
            border: `1px solid ${theme.border}`,
            boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              margin: '0 0 24px 0', 
              fontSize: '24px', 
              fontWeight: '600'
            }}>
              📤 Exportar Registros
            </h2>
            
            <div style={{
              background: theme.inputBg,
              padding: '24px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                Estatísticas de Exportação
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                    {registros.filter(r => r.status === 'pendente').length}
                  </div>
                  <div style={{ fontSize: '14px', color: theme.textSecondary }}>Pendentes</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                    {registros.filter(r => r.status === 'exportado').length}
                  </div>
                  <div style={{ fontSize: '14px', color: theme.textSecondary }}>Exportados</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                    {registros.length}
                  </div>
                  <div style={{ fontSize: '14px', color: theme.textSecondary }}>Total</div>
                </div>
              </div>
            </div>

            <button
              onClick={exportarRegistros}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              📤 Exportar Registros Pendentes
            </button>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: theme.inputBg,
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              fontSize: '14px',
              color: theme.textSecondary
            }}>
              <strong>💡 Informação:</strong> Os registros exportados serão preparados para integração com o sistema principal de cartório.
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div style={{
            background: theme.cardBg,
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '32px',
            border: `1px solid ${theme.border}`,
            boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h2 style={{ 
              margin: '0 0 24px 0', 
              fontSize: '24px', 
              fontWeight: '600',
              textAlign: 'center'
            }}>
              ⚙️ Configurações
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                background: theme.inputBg,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${theme.border}`
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                  🔗 Integração com Sistema Principal
                </h3>
                <p style={{ margin: '0 0 16px 0', color: theme.textSecondary }}>
                  Configure a integração com o sistema principal de cartório para exportação automática dos registros.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      URL do Sistema Principal
                    </label>
                    <input
                      type="url"
                      placeholder="http://localhost:5173"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Token de Autenticação
                    </label>
                    <input
                      type="password"
                      placeholder="Token para autenticação"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{
                background: theme.inputBg,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${theme.border}`
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                  📊 Backup e Restauração
                </h3>
                <p style={{ margin: '0 0 16px 0', color: theme.textSecondary }}>
                  Faça backup dos dados ou restaure de um backup anterior.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => {
                      const dataStr = JSON.stringify(registros, null, 2)
                      const dataBlob = new Blob([dataStr], { type: 'application/json' })
                      const url = URL.createObjectURL(dataBlob)
                      const link = document.createElement('a')
                      link.href = url
                      link.download = `backup-maternidade-${new Date().toISOString().split('T')[0]}.json`
                      link.click()
                      URL.revokeObjectURL(url)
                    }}
                    style={{
                      padding: '12px 24px',
                      background: theme.buttonBg,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.background = theme.buttonHover}
                    onMouseOut={(e) => e.target.style.background = theme.buttonBg}
                  >
                    💾 Fazer Backup
                  </button>
                  
                  <button
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = '.json'
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (e) => {
                            try {
                              const data = JSON.parse(e.target?.result as string)
                              setRegistros(data)
                              alert('Backup restaurado com sucesso!')
                            } catch (error) {
                              alert('Erro ao restaurar backup. Arquivo inválido.')
                            }
                          }
                          reader.readAsText(file)
                        }
                      }
                      input.click()
                    }}
                    style={{
                      padding: '12px 24px',
                      background: 'rgba(245, 158, 11, 0.8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(245, 158, 11, 1)'}
                    onMouseOut={(e) => e.target.style.background = 'rgba(245, 158, 11, 0.8)'}
                  >
                    📁 Restaurar Backup
                  </button>
                </div>
              </div>

              <div style={{
                background: theme.inputBg,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${theme.border}`
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                  🗑️ Limpeza de Dados
                </h3>
                <p style={{ margin: '0 0 16px 0', color: theme.textSecondary }}>
                  Remova todos os registros do sistema (ação irreversível).
                </p>
                <button
                  onClick={() => {
                    if (confirm('Tem certeza que deseja remover todos os registros? Esta ação não pode ser desfeita.')) {
                      setRegistros([])
                      alert('Todos os registros foram removidos.')
                    }
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(239, 68, 68, 0.8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 1)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.8)'}
                >
                  🗑️ Limpar Todos os Dados
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
