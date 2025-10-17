import { useState } from 'react'

interface FirmasPageProps {
  onClose: () => void
  isDarkMode: boolean
}

export function FirmasPage({ onClose, isDarkMode }: FirmasPageProps) {
  const [activeTab, setActiveTab] = useState('cadastro')
  const [formData, setFormData] = useState({
    // Dados básicos
    codigo: '0',
    nome: '',
    cartao: true,
    numeroCartao: '',
    sexo: 'IGNORADO',
    cpf: '',
    rg: '',
    docExterior: '',
    orgaoRG: '',
    emissaoRG: '',
    oab: '',
    ufOAB: '',
    cnh: '',
    nascimento: '',
    naturalidade: '',
    uf: '',
    pais: '',
    nacionalidade: '',
    estadoCivil: 'IGNORADO',
    pai: '',
    mae: '',
    
    // Endereço
    cep: '',
    logradouro: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    ufEndereco: '',
    paisEndereco: '',
    codigoIBGE: '',
    
    // Contato
    telefone: '',
    celular: '',
    telefone2: '',
    email: '',
    
    // Profissional
    profissao: '',
    localTrabalho: '',
    
    // Cônjuge
    conjugeCartao: '',
    nomeConjuge: '',
    cpfConjuge: '',
    rgConjuge: '',
    regimeCasamento: '',
    
    // Outros
    nomeSocial: '',
    atendente: '',
    assinanteCartao: '',
    dataCadastro: '',
    cartaoCorrege: ''
  })

  const theme = {
    background: isDarkMode 
      ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    cardBg: isDarkMode 
      ? 'rgba(30, 41, 59, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    text: isDarkMode ? '#f1f5f9' : '#1e293b',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? 'rgba(148, 163, 184, 0.3)' : 'rgba(30, 41, 59, 0.2)',
    buttonBg: isDarkMode ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.9)',
    buttonHover: isDarkMode ? 'rgba(59, 130, 246, 1)' : 'rgba(59, 130, 246, 1)',
    inputBg: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',
    orangeAccent: '#f97316',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Dados do cliente:', formData)
    alert('Cliente salvo com sucesso!')
  }

  const handleNovo = () => {
    setFormData({
      codigo: '0',
      nome: '',
      cartao: true,
      numeroCartao: '',
      sexo: 'IGNORADO',
      cpf: '',
      rg: '',
      docExterior: '',
      orgaoRG: '',
      emissaoRG: '',
      oab: '',
      ufOAB: '',
      cnh: '',
      nascimento: '',
      naturalidade: '',
      uf: '',
      pais: '',
      nacionalidade: '',
      estadoCivil: 'IGNORADO',
      pai: '',
      mae: '',
      cep: '',
      logradouro: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      ufEndereco: '',
      paisEndereco: '',
      codigoIBGE: '',
      telefone: '',
      celular: '',
      telefone2: '',
      email: '',
      profissao: '',
      localTrabalho: '',
      conjugeCartao: '',
      nomeConjuge: '',
      cpfConjuge: '',
      rgConjuge: '',
      regimeCasamento: '',
      nomeSocial: '',
      atendente: '',
      assinanteCartao: '',
      dataCadastro: '',
      cartaoCorrege: ''
    })
  }

  const tabs = [
    { id: 'cadastro', label: 'Cadastro' },
    { id: 'digitalizacao', label: 'Digitalização' },
    { id: 'escritura', label: 'Escritura' },
    { id: 'procuracao', label: 'Procuração' },
    { id: 'consulta-cep', label: 'Consulta de CEP' },
    { id: 'selo-digital', label: 'Selo Digital' }
  ]

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
      zIndex: 10000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: theme.cardBg,
        backdropFilter: 'blur(20px)',
        borderRadius: '8px',
        width: '95%',
        height: '90%',
        maxWidth: '1400px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: `1px solid ${theme.border}`
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '600',
            color: theme.text
          }}>
            Cliente
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '18px',
              color: theme.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.background = theme.border
              (e.target as HTMLButtonElement).style.color = theme.text
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.background = 'transparent'
              (e.target as HTMLButtonElement).style.color = theme.textSecondary
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${theme.border}`,
          background: theme.inputBg
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                background: activeTab === tab.id ? theme.orangeAccent : 'transparent',
                color: activeTab === tab.id ? 'white' : theme.text,
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                borderBottom: activeTab === tab.id ? `2px solid ${theme.orangeAccent}` : '2px solid transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          gap: '24px'
        }}>
          {/* Form Area */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* Dados Básicos */}
              <div style={{
                background: theme.inputBg,
                padding: '20px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.text,
                  margin: '0 0 16px 0'
                }}>
                  Dados Pessoais
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  {/* Código */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Código
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="text"
                        name="codigo"
                        value={formData.codigo}
                        onChange={handleChange}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: theme.orangeAccent,
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      <button type="button" style={{
                        padding: '8px 12px',
                        background: theme.border,
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}>
                        ...
                      </button>
                    </div>
                  </div>

                  {/* Nome */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Nome*
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Cartão */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Número Cartão
                    </label>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        name="cartao"
                        checked={formData.cartao}
                        onChange={handleChange}
                        style={{ marginRight: '4px' }}
                      />
                      <span style={{ fontSize: '12px', color: theme.text }}>Cartão</span>
                      <input
                        type="text"
                        name="numeroCartao"
                        value={formData.numeroCartao}
                        onChange={handleChange}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: theme.orangeAccent,
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      <button type="button" style={{
                        padding: '8px 12px',
                        background: theme.border,
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}>
                        ...
                      </button>
                    </div>
                  </div>

                  {/* Sexo */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Sexo
                    </label>
                    <select
                      name="sexo"
                      value={formData.sexo}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="IGNORADO">IGNORADO</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                    </select>
                  </div>

                  {/* CPF */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      CPF*
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="text"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleChange}
                        placeholder="...-...-...-.."
                        required
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: theme.orangeAccent,
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      <button type="button" style={{
                        padding: '8px 12px',
                        background: theme.border,
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}>
                        ...
                      </button>
                    </div>
                  </div>

                  {/* RG */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      RG*
                    </label>
                    <input
                      type="text"
                      name="rg"
                      value={formData.rg}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Doc. Exterior */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Doc. Exterior
                    </label>
                    <input
                      type="text"
                      name="docExterior"
                      value={formData.docExterior}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Órgão RG */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Órgão RG
                    </label>
                    <input
                      type="text"
                      name="orgaoRG"
                      value={formData.orgaoRG}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Emissão RG */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Emissão RG
                    </label>
                    <input
                      type="date"
                      name="emissaoRG"
                      value={formData.emissaoRG}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* OAB */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      OAB
                    </label>
                    <input
                      type="text"
                      name="oab"
                      value={formData.oab}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* UF OAB */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      UF OAB
                    </label>
                    <select
                      name="ufOAB"
                      value={formData.ufOAB}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Selecione</option>
                      <option value="SP">SP</option>
                      <option value="RJ">RJ</option>
                      <option value="MG">MG</option>
                    </select>
                  </div>

                  {/* CNH */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      CNH
                    </label>
                    <input
                      type="text"
                      name="cnh"
                      value={formData.cnh}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Nascimento */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Nascimento*
                    </label>
                    <input
                      type="date"
                      name="nascimento"
                      value={formData.nascimento}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Naturalidade */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Naturalidade
                    </label>
                    <input
                      type="text"
                      name="naturalidade"
                      value={formData.naturalidade}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* UF */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      UF
                    </label>
                    <select
                      name="uf"
                      value={formData.uf}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Selecione</option>
                      <option value="SP">SP</option>
                      <option value="RJ">RJ</option>
                      <option value="MG">MG</option>
                    </select>
                  </div>

                  {/* País */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      País
                    </label>
                    <input
                      type="text"
                      name="pais"
                      value={formData.pais}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Nacionalidade */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Nacionalidade
                    </label>
                    <input
                      type="text"
                      name="nacionalidade"
                      value={formData.nacionalidade}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Estado Civil */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Estado Civil*
                    </label>
                    <select
                      name="estadoCivil"
                      value={formData.estadoCivil}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="IGNORADO">IGNORADO</option>
                      <option value="SOLTEIRO">Solteiro</option>
                      <option value="CASADO">Casado</option>
                      <option value="DIVORCIADO">Divorciado</option>
                      <option value="VIUVO">Viúvo</option>
                    </select>
                  </div>

                  {/* Pai */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Pai
                    </label>
                    <input
                      type="text"
                      name="pai"
                      value={formData.pai}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Mãe */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Mãe
                    </label>
                    <input
                      type="text"
                      name="mae"
                      value={formData.mae}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div style={{
                background: theme.inputBg,
                padding: '20px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.text,
                  margin: '0 0 16px 0'
                }}>
                  Endereço
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  {/* CEP */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      CEP
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="text"
                        name="cep"
                        value={formData.cep}
                        onChange={handleChange}
                        placeholder=".....-..."
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: theme.orangeAccent,
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      <button type="button" style={{
                        padding: '8px 12px',
                        background: theme.border,
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}>
                        ...
                      </button>
                    </div>
                  </div>

                  {/* Logradouro */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Logradouro
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="text"
                        name="logradouro"
                        value={formData.logradouro}
                        onChange={handleChange}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: theme.orangeAccent,
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      <select style={{
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}>
                        <option value="">Tipo</option>
                        <option value="RUA">Rua</option>
                        <option value="AV">Avenida</option>
                        <option value="AL">Alameda</option>
                      </select>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Endereço
                    </label>
                    <input
                      type="text"
                      name="endereco"
                      value={formData.endereco}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Número */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Número
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="text"
                        name="numero"
                        value={formData.numero}
                        onChange={handleChange}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: theme.orangeAccent,
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      <div style={{
                        width: '24px',
                        height: '32px',
                        background: theme.border,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        🏢
                      </div>
                    </div>
                  </div>

                  {/* Complemento */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Complemento
                    </label>
                    <input
                      type="text"
                      name="complemento"
                      value={formData.complemento}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Bairro */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Bairro
                    </label>
                    <input
                      type="text"
                      name="bairro"
                      value={formData.bairro}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Cidade */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Cidade
                    </label>
                    <input
                      type="text"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* UF Endereço */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      UF
                    </label>
                    <select
                      name="ufEndereco"
                      value={formData.ufEndereco}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Selecione</option>
                      <option value="SP">SP</option>
                      <option value="RJ">RJ</option>
                      <option value="MG">MG</option>
                    </select>
                  </div>

                  {/* País Endereço */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      País
                    </label>
                    <select
                      name="paisEndereco"
                      value={formData.paisEndereco}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Selecione</option>
                      <option value="BR">Brasil</option>
                      <option value="US">Estados Unidos</option>
                    </select>
                  </div>

                  {/* Código IBGE */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Código IBGE
                    </label>
                    <input
                      type="text"
                      name="codigoIBGE"
                      value={formData.codigoIBGE}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div style={{
                background: theme.inputBg,
                padding: '20px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.text,
                  margin: '0 0 16px 0'
                }}>
                  Contato
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  {/* Telefone */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Telefone
                    </label>
                    <input
                      type="text"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      placeholder="( ) -"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Celular */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Celular
                    </label>
                    <input
                      type="text"
                      name="celular"
                      value={formData.celular}
                      onChange={handleChange}
                      placeholder="( ) -"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Telefone 2 */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Telefone 2
                    </label>
                    <input
                      type="text"
                      name="telefone2"
                      value={formData.telefone2}
                      onChange={handleChange}
                      placeholder="( ) -"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* E-mail */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      E-mail
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Profissional */}
              <div style={{
                background: theme.inputBg,
                padding: '20px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.text,
                  margin: '0 0 16px 0'
                }}>
                  Informações Profissionais
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px'
                }}>
                  {/* Profissão */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Profissão
                    </label>
                    <input
                      type="text"
                      name="profissao"
                      value={formData.profissao}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Local de Trabalho */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Local de Trabalho
                    </label>
                    <input
                      type="text"
                      name="localTrabalho"
                      value={formData.localTrabalho}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Cônjuge */}
              <div style={{
                background: theme.inputBg,
                padding: '20px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.text,
                  margin: '0 0 16px 0'
                }}>
                  Cônjuge
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  {/* Cônjuge Cartão */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Cônjuge (Cartão)
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="text"
                        name="conjugeCartao"
                        value={formData.conjugeCartao}
                        onChange={handleChange}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: theme.orangeAccent,
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      <button type="button" style={{
                        padding: '8px 12px',
                        background: theme.border,
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}>
                        ...
                      </button>
                      <div style={{
                        width: '24px',
                        height: '32px',
                        background: theme.border,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        👤
                      </div>
                    </div>
                  </div>

                  {/* Nome Cônjuge */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Nome
                    </label>
                    <input
                      type="text"
                      name="nomeConjuge"
                      value={formData.nomeConjuge}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* CPF Cônjuge */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      CPF
                    </label>
                    <input
                      type="text"
                      name="cpfConjuge"
                      value={formData.cpfConjuge}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* RG Cônjuge */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      RG
                    </label>
                    <input
                      type="text"
                      name="rgConjuge"
                      value={formData.rgConjuge}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Regime de Casamento */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Regime de Casamento
                    </label>
                    <input
                      type="text"
                      name="regimeCasamento"
                      value={formData.regimeCasamento}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Outros */}
              <div style={{
                background: theme.inputBg,
                padding: '20px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.text,
                  margin: '0 0 16px 0'
                }}>
                  Outros
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  {/* Nome Social */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Nome Social
                    </label>
                    <input
                      type="text"
                      name="nomeSocial"
                      value={formData.nomeSocial}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Atendente */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Atendente
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="text"
                        name="atendente"
                        value={formData.atendente}
                        onChange={handleChange}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: theme.orangeAccent,
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      <select style={{
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}>
                        <option value="">Selecione</option>
                        <option value="FUNC1">Funcionário 1</option>
                        <option value="FUNC2">Funcionário 2</option>
                      </select>
                    </div>
                  </div>

                  {/* Assinante do Cartão */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Assinante do Cartão
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="text"
                        name="assinanteCartao"
                        value={formData.assinanteCartao}
                        onChange={handleChange}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: theme.orangeAccent,
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      <select style={{
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}>
                        <option value="">Selecione</option>
                        <option value="SIM">Sim</option>
                        <option value="NAO">Não</option>
                      </select>
                    </div>
                  </div>

                  {/* Data de Cadastro */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: theme.text,
                      marginBottom: '4px'
                    }}>
                      Data de Cadastro
                    </label>
                    <input
                      type="date"
                      name="dataCadastro"
                      value={formData.dataCadastro}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: theme.orangeAccent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div style={{
            width: '200px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Ícones */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: theme.border,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '16px'
              }}>
                🔍
              </div>
              <div style={{
                width: '32px',
                height: '32px',
                background: theme.border,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '16px'
              }}>
                📦
              </div>
            </div>

            {/* Cartão Correge */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                color: theme.text,
                marginBottom: '4px'
              }}>
                Cartão Correge
              </label>
              <input
                type="text"
                name="cartaoCorrege"
                value={formData.cartaoCorrege}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: theme.orangeAccent,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div style={{
          padding: '16px 24px',
          borderTop: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          background: theme.inputBg
        }}>
          <button
            type="button"
            onClick={handleNovo}
            style={{
              padding: '12px 24px',
              background: theme.buttonBg,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = theme.buttonHover}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = theme.buttonBg}
          >
            📄 Novo
          </button>
          
          <button
            type="submit"
            onClick={handleSubmit}
            style={{
              padding: '12px 24px',
              background: theme.success,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#059669'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = theme.success}
          >
            💾 Gravar
          </button>
          
          <button
            type="button"
            onClick={handleNovo}
            style={{
              padding: '12px 24px',
              background: theme.warning,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#d97706'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = theme.warning}
          >
            🧹 Limpar
          </button>
          
          <button
            type="button"
            style={{
              padding: '12px 24px',
              background: theme.orangeAccent,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#ea580c'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = theme.orangeAccent}
          >
            💳 Cartão
          </button>
          
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: theme.error,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#dc2626'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = theme.error}
          >
            🚪 Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
