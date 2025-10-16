import { useState, useEffect } from 'react'
import { offlineService, NascimentoData } from '../services/OfflineService'

export function MaternidadePage() {
  const [formData, setFormData] = useState({
    // Dados da mãe
    nomeMae: '',
    cpfMae: '',
    rgMae: '',
    dataNascimentoMae: '',
    estadoCivilMae: '',
    profissaoMae: '',
    enderecoMae: '',
    cidadeMae: '',
    ufMae: '',
    cepMae: '',
    
    // Dados do pai
    nomePai: '',
    cpfPai: '',
    rgPai: '',
    dataNascimentoPai: '',
    estadoCivilPai: '',
    profissaoPai: '',
    enderecoPai: '',
    cidadePai: '',
    ufPai: '',
    cepPai: '',
    
    // Dados do nascimento
    dataNascimento: '',
    horaNascimento: '',
    hospital: '',
    medico: '',
    peso: '',
    altura: '',
    sexo: 'M' as 'M' | 'F',
    
    // Dados do cartório
    cartorio: 'Cartório de Registro Civil',
    funcionario: '',
    observacoes: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [syncStatus, setSyncStatus] = useState<{ sucesso: number, erro: number } | null>(null)
  const [nascimentos, setNascimentos] = useState<NascimentoData[]>([])

  useEffect(() => {
    // Inicializar serviço offline
    offlineService.init().then(() => {
      carregarNascimentos()
      verificarConexao()
    })
  }, [])

  const carregarNascimentos = async () => {
    try {
      const data = await offlineService.listarNascimentos()
      setNascimentos(data)
    } catch (error) {
      console.error('Erro ao carregar nascimentos:', error)
    }
  }

  const verificarConexao = async () => {
    const online = await offlineService.verificarConexao()
    setIsOnline(online)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await offlineService.salvarNascimento(formData)
      alert('✅ Dados salvos com sucesso! (Modo Offline)')
      setFormData({
        nomeMae: '', cpfMae: '', rgMae: '', dataNascimentoMae: '', estadoCivilMae: '', profissaoMae: '',
        enderecoMae: '', cidadeMae: '', ufMae: '', cepMae: '',
        nomePai: '', cpfPai: '', rgPai: '', dataNascimentoPai: '', estadoCivilPai: '', profissaoPai: '',
        enderecoPai: '', cidadePai: '', ufPai: '', cepPai: '',
        dataNascimento: '', horaNascimento: '', hospital: '', medico: '', peso: '', altura: '', sexo: 'M',
        cartorio: 'Cartório de Registro Civil', funcionario: '', observacoes: ''
      })
      await carregarNascimentos()
    } catch (error) {
      alert('❌ Erro ao salvar dados: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    setIsLoading(true)
    try {
      const resultado = await offlineService.sincronizar()
      setSyncStatus(resultado)
      await carregarNascimentos()
      await verificarConexao()
      alert(`🔄 Sincronização concluída!\n✅ Sucessos: ${resultado.sucesso}\n❌ Erros: ${resultado.erro}`)
    } catch (error) {
      alert('❌ Erro na sincronização: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const data = await offlineService.exportarDados()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `maternidade_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      alert('📁 Dados exportados com sucesso!')
    } catch (error) {
      alert('❌ Erro ao exportar: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '24px'
      }}>
        {/* Formulário Principal */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 8px 0',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              👶 Módulo Maternidade
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              margin: 0
            }}>
              Sistema Offline-First para coleta de dados
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isOnline ? '#10b981' : '#ef4444'
              }}></div>
              <span style={{
                fontSize: '14px',
                color: isOnline ? '#10b981' : '#ef4444',
                fontWeight: '500'
              }}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{
            display: 'grid',
            gap: '24px'
          }}>
            {/* Dados da Mãe */}
            <div style={{
              background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.2)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1e293b',
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                👩 Dados da Mãe
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="nomeMae"
                    value={formData.nomeMae}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    CPF *
                  </label>
                  <input
                    type="text"
                    name="cpfMae"
                    value={formData.cpfMae}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    RG
                  </label>
                  <input
                    type="text"
                    name="rgMae"
                    value={formData.rgMae}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    name="dataNascimentoMae"
                    value={formData.dataNascimentoMae}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Dados do Pai */}
            <div style={{
              background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.2)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1e293b',
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                👨 Dados do Pai
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="nomePai"
                    value={formData.nomePai}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    CPF *
                  </label>
                  <input
                    type="text"
                    name="cpfPai"
                    value={formData.cpfPai}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Dados do Nascimento */}
            <div style={{
              background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.2)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1e293b',
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🍼 Dados do Nascimento
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Data do Nascimento *
                  </label>
                  <input
                    type="date"
                    name="dataNascimento"
                    value={formData.dataNascimento}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Hora do Nascimento
                  </label>
                  <input
                    type="time"
                    name="horaNascimento"
                    value={formData.horaNascimento}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Hospital *
                  </label>
                  <input
                    type="text"
                    name="hospital"
                    value={formData.hospital}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Médico *
                  </label>
                  <input
                    type="text"
                    name="medico"
                    value={formData.medico}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Peso (g) *
                  </label>
                  <input
                    type="number"
                    name="peso"
                    value={formData.peso}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Altura (cm) *
                  </label>
                  <input
                    type="number"
                    name="altura"
                    value={formData.altura}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Sexo *
                  </label>
                  <select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      background: 'white'
                    }}
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              marginTop: '24px'
            }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '16px 32px',
                  background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                {isLoading ? '⏳ Salvando...' : '💾 Salvar Dados'}
              </button>
            </div>
          </form>
        </div>

        {/* Painel Lateral */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Status */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              margin: '0 0 16px 0'
            }}>
              📊 Status
            </h3>
            
            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Total de Registros:</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                  {nascimentos.length}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Sincronizados:</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
                  {nascimentos.filter(n => n.sincronizado).length}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Pendentes:</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b' }}>
                  {nascimentos.filter(n => !n.sincronizado).length}
                </span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              margin: '0 0 16px 0'
            }}>
              🔧 Ações
            </h3>
            
            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              <button
                onClick={handleSync}
                disabled={isLoading || !isOnline}
                style={{
                  padding: '12px 16px',
                  background: isLoading || !isOnline ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isLoading || !isOnline ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                🔄 Sincronizar
              </button>
              
              <button
                onClick={handleExport}
                style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                📁 Exportar JSON
              </button>
            </div>
          </div>

          {/* Últimos Registros */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              margin: '0 0 16px 0'
            }}>
              📋 Últimos Registros
            </h3>
            
            <div style={{
              display: 'grid',
              gap: '8px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {nascimentos.slice(0, 5).map((nascimento) => (
                <div
                  key={nascimento.id}
                  style={{
                    padding: '8px 12px',
                    background: nascimento.sincronizado ? '#f0fdf4' : '#fef3c7',
                    borderRadius: '6px',
                    border: `1px solid ${nascimento.sincronizado ? '#bbf7d0' : '#fde68a'}`,
                    fontSize: '12px'
                  }}
                >
                  <div style={{
                    fontWeight: '500',
                    color: '#1e293b',
                    marginBottom: '2px'
                  }}>
                    {nascimento.nomeMae}
                  </div>
                  <div style={{
                    color: '#64748b',
                    fontSize: '11px'
                  }}>
                    {new Date(nascimento.timestamp).toLocaleDateString('pt-BR')}
                    {nascimento.sincronizado ? ' ✅' : ' ⏳'}
                  </div>
                </div>
              ))}
              
              {nascimentos.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontSize: '14px',
                  padding: '20px'
                }}>
                  Nenhum registro ainda
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}