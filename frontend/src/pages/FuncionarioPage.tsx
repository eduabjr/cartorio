// FuncionarioPage.tsx
// Tela de Cadastro/Manutenção de Funcionários conforme especificação

import React, { useState, useEffect } from 'react'
import { BasePage } from '../components/BasePage'
import { FuncionarioLookup } from '../components/FuncionarioLookup'
import { funcionarioService, Funcionario } from '../services/FuncionarioService'
import { CepService, CepData } from '../services/CepService'
import { useAccessibility } from '../hooks/useAccessibility'
import { getRelativeFontSize } from '../utils/fontUtils'

interface FuncionarioPageProps {
  onClose: () => void
  resetToOriginalPosition?: () => void
}

export function FuncionarioPage({ onClose, resetToOriginalPosition }: FuncionarioPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()

  // Estados para os dados do funcionário
  const [formData, setFormData] = useState({
    codigo: '',
    ordemSinalPublico: '99',
    emAtividade: true,
    nome: '',
    endereco: '',
    bairro: '',
    cidade: '',
    cep: '',
    telefone: '',
    uf: '',
    email: '',
    celular: '',
    nascimento: '',
    rg: '',
    mae: '',
    cpf: '',
    pai: '',
    assinante: false,
    cargoCivil: '',
    salario: '',
    comissao: '',
    admissao: '',
    demissao: '',
    login: '',
    senha: '',
    observacao: ''
  })

  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [showLookup, setShowLookup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)

  // Função para lidar com mudanças nos campos
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return value
  }

  // Função para formatar CEP
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
    }
    return value
  }

  // Função para formatar telefone
  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  // Função para formatar celular
  const formatCelular = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  // Função para lidar com mudanças em campos com formatação
  const handleInputWithFormat = (field: string, value: string, formatter?: (val: string) => string) => {
    const formattedValue = formatter ? formatter(value) : value
    handleInputChange(field, formattedValue)
  }

  // Função para buscar CEP
  const handleBuscarCep = async (cep: string) => {
    if (!CepService.validarCep(cep)) {
      return
    }

    setIsLoadingCep(true)
    try {
      const cepData = await CepService.buscarCep(cep)
      
      if (cepData) {
        setFormData(prev => ({
          ...prev,
          endereco: cepData.logradouro || '',
          bairro: cepData.bairro || '',
          cidade: cepData.localidade || '',
          uf: cepData.uf || ''
        }))
        
        // Preencher o campo de logradouro baseado no tipo retornado
        const logradouroSelect = document.querySelector('select[style*="Logradouro"]') as HTMLSelectElement
        if (logradouroSelect && cepData.logradouro) {
          const tipoLogradouro = cepData.logradouro.split(' ')[0]
          if (['Rua', 'Avenida', 'Praça', 'Alameda', 'Travessa'].includes(tipoLogradouro)) {
            logradouroSelect.value = tipoLogradouro
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      alert('Erro ao buscar informações do CEP. Verifique se o CEP está correto.')
    } finally {
      setIsLoadingCep(false)
    }
  }

  // Função para escanear documento com câmera/scanner
  const handleScanner = () => {
    // Verificar se estamos em ambiente Electron (para acesso a APIs nativas)
    if (window.electronAPI) {
      startRealScanning()
    } else {
      // Fallback para navegador - usar WebUSB API ou Image Capture API
      startWebScanning()
    }
  }

  // Função para scanner real via Electron (APIs nativas)
  const startRealScanning = async () => {
    try {
      console.log('🔍 Iniciando detecção de scanner via Electron...')
      
      if (!window.electronAPI) {
        throw new Error('APIs do Electron não disponíveis')
      }
      
      // Detectar scanners disponíveis via TWAIN (Windows) ou SANE (Linux)
      const scanners = await (window.electronAPI as any).detectScanners()
      
      if (!scanners || scanners.length === 0) {
        alert('❌ Nenhum scanner detectado!\n\nVerifique se:\n• O scanner está conectado\n• Os drivers TWAIN/SANE estão instalados\n• O dispositivo está ligado')
        return
      }

      console.log('📷 Scanners detectados:', scanners)
      alert('Scanner detectado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao acessar scanner:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`❌ Erro ao acessar scanner:\n${errorMessage}`)
    }
  }

  // Função para scanner via Web APIs (navegador)
  const startWebScanning = async () => {
    try {
      // Verificar se Image Capture API está disponível
      if ('ImageCapture' in window) {
        alert('📷 Funcionalidade de câmera disponível. Utilize seu dispositivo para capturar imagens.')
      } else {
        alert('⚠️ Camera/Scanner não disponível neste navegador.\n\nUtilize um navegador moderno como Chrome, Firefox ou Edge.')
      }
    } catch (error) {
      console.error('❌ Erro ao acessar câmera:', error)
      alert('❌ Erro ao acessar câmera/scanner')
    }
  }

  // Função para salvar funcionário
  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Validar dados obrigatórios
      if (!formData.nome.trim()) {
        alert('Nome é obrigatório!')
        return
      }

      if (!formData.cpf.trim()) {
        alert('CPF é obrigatório!')
        return
      }

      if (!funcionarioService.validateCPF(formData.cpf)) {
        alert('CPF inválido!')
        return
      }

      if (formData.email && !funcionarioService.validateEmail(formData.email)) {
        alert('Email inválido!')
        return
      }

      // Salvar funcionário
      const response = await funcionarioService.createFuncionario(formData)
      
      if (response.success) {
        alert(response.message || 'Funcionário salvo com sucesso!')
        handleClear() // Limpar formulário após salvar
      } else {
        alert(response.error || 'Erro ao salvar funcionário!')
      }
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error)
      alert('Erro ao salvar funcionário!')
    } finally {
      setIsLoading(false)
    }
  }

  // Função para limpar formulário
  const handleClear = () => {
    setFormData({
      codigo: '',
      ordemSinalPublico: '99',
      emAtividade: true,
      nome: '',
      endereco: '',
      bairro: '',
      cidade: '',
      cep: '',
      telefone: '',
      uf: '',
      email: '',
      celular: '',
      nascimento: '',
      rg: '',
      mae: '',
      cpf: '',
      pai: '',
      assinante: false,
      cargoCivil: '',
      salario: '',
      comissao: '',
      admissao: '',
      demissao: '',
      login: '',
      senha: '',
      observacao: ''
    })
  }

  // Função para imprimir
  const handlePrint = () => {
    console.log('Imprimindo dados do funcionário:', formData)
    // Aqui você implementaria a lógica de impressão
    alert('Função de impressão será implementada!')
  }

  // Função para selecionar funcionário do lookup
  const handleSelectFuncionario = (funcionario: Funcionario) => {
    setFormData({
      ...formData,
      codigo: funcionario.codigo,
      nome: funcionario.nome,
      endereco: funcionario.endereco,
      bairro: funcionario.bairro,
      cidade: funcionario.cidade,
      cep: funcionario.cep,
      telefone: funcionario.telefone,
      uf: funcionario.uf,
      email: funcionario.email,
      celular: funcionario.celular,
      nascimento: funcionario.nascimento,
      rg: funcionario.rg,
      mae: funcionario.mae,
      cpf: funcionario.cpf,
      pai: funcionario.pai,
      assinante: funcionario.assinante,
      cargoCivil: funcionario.cargoCivil,
      salario: funcionario.salario,
      comissao: funcionario.comissao,
      admissao: funcionario.admissao,
      demissao: funcionario.demissao,
      login: funcionario.login,
      senha: funcionario.senha,
      observacao: funcionario.observacao
    })
  }

  // Estilos baseados no tema
  const containerStyles: React.CSSProperties = {
    backgroundColor: theme.background,
    color: theme.text,
    padding: '10px',
    borderRadius: '8px',
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  }

  const titleStyles: React.CSSProperties = {
    fontSize: getRelativeFontSize(18),
    fontWeight: 'bold',
    marginBottom: '10px',
    color: theme.text,
    textAlign: 'center'
  }


  const formContainerStyles: React.CSSProperties = {
    backgroundColor: theme.surface,
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  }

  const formGridStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '8px',
    padding: '8px',
    flex: 1,
    overflow: 'hidden'
  }

  const fieldStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  }

  const rowStyles: React.CSSProperties = {
    display: 'flex',
    gap: '6px',
    marginBottom: '6px'
  }

  const labelStyles: React.CSSProperties = {
    fontSize: getRelativeFontSize(11),
    fontWeight: '500',
    color: theme.text,
    marginBottom: '2px'
  }

  const inputStyles: React.CSSProperties = {
    padding: '4px 8px',
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    backgroundColor: theme.background,
    color: theme.text,
    fontSize: getRelativeFontSize(12),
    outline: 'none',
    transition: 'border-color 0.3s ease',
    height: '24px',
    boxSizing: 'border-box'
  }

  const selectStyles: React.CSSProperties = {
    padding: '4px 8px',
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    backgroundColor: theme.background,
    color: theme.text,
    fontSize: getRelativeFontSize(12),
    outline: 'none',
    transition: 'border-color 0.3s ease',
    height: '24px',
    cursor: 'pointer',
    boxSizing: 'border-box',
    display: 'block',
    width: '100%',
    minHeight: '24px'
  } as React.CSSProperties

  const checkboxStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer'
  }

  const checkboxInputStyles: React.CSSProperties = {
    width: '14px',
    height: '14px',
    cursor: 'pointer'
  }

  const buttonContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    padding: '8px',
    marginTop: '16px'
  }

  const buttonStyles: React.CSSProperties = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: getRelativeFontSize(12),
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.3s ease',
    minWidth: '80px',
    justifyContent: 'center'
  }

  const primaryButtonStyles: React.CSSProperties = {
    ...buttonStyles,
    backgroundColor: theme.primary,
    color: '#ffffff'
  }

  const secondaryButtonStyles: React.CSSProperties = {
    ...buttonStyles,
    backgroundColor: theme.surface,
    color: theme.text,
    border: `1px solid ${theme.border}`
  }

  const specialLabelStyles: React.CSSProperties = {
    ...labelStyles,
    color: '#dc2626' // Vermelho para "Em atividade?"
  }

  const lookupButtonStyles: React.CSSProperties = {
    ...inputStyles,
    width: '24px',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    height: '24px'
  }

  // Estados dos UFs brasileiros
  const ufOptions = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  return (
    <BasePage
      title="Funcionário"
      onClose={onClose}
      resetToOriginalPosition={resetToOriginalPosition}
      headerColor="#6B7280"
      height="700px"
      width="900px"
    >
      <div style={containerStyles}>
        {/* Formulário */}
        <div style={formContainerStyles}>
            <div style={formGridStyles}>
              {/* Linha 1 - Código, Ordem Sinal Público, Em atividade, Assinante */}
              <div style={rowStyles}>
                <div style={{...fieldStyles, width: '25%'}}>
                  <label style={labelStyles}>Código</label>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={handleScanner}
                      style={{
                        padding: '4px 8px',
                        border: 'none',
                        borderRadius: '3px',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        fontSize: getRelativeFontSize(16),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '24px',
                        width: '24px',
                        minWidth: '24px'
                      }}
                      title="Escanear documento com scanner/câmera"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.border}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      📷
                    </button>
                    <input
                      type="text"
                      value={formData.codigo}
                      onChange={(e) => handleInputChange('codigo', e.target.value)}
                      style={{...inputStyles, flex: 1}}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div style={{...fieldStyles, width: '25%'}}>
                  <label style={labelStyles}>Ordem Sinal Público</label>
                  <input
                    type="text"
                    value={formData.ordemSinalPublico}
                    onChange={(e) => handleInputChange('ordemSinalPublico', e.target.value)}
                    style={inputStyles}
                    placeholder="99"
                  />
                </div>

                <div style={{...fieldStyles, width: '25%'}}>
                  <label style={specialLabelStyles}>Em atividade?</label>
                  <div style={checkboxStyles}>
                    <input
                      type="checkbox"
                      checked={formData.emAtividade}
                      onChange={(e) => handleInputChange('emAtividade', e.target.checked)}
                      style={checkboxInputStyles}
                    />
                    <span style={{ fontSize: getRelativeFontSize(12) }}>Sim</span>
                  </div>
                </div>

                <div style={{...fieldStyles, width: '25%'}}>
                  <label style={labelStyles}>Assinante</label>
                  <div style={checkboxStyles}>
                    <input
                      type="checkbox"
                      checked={formData.assinante}
                      onChange={(e) => handleInputChange('assinante', e.target.checked)}
                      style={checkboxInputStyles}
                    />
                    <span style={{ fontSize: getRelativeFontSize(12) }}>Sim</span>
                  </div>
                </div>
              </div>

              {/* Linha 2 - Nome, RG, CPF */}
              <div style={rowStyles}>
                <div style={{...fieldStyles, width: '40%'}}>
                  <label style={labelStyles}>Nome</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      style={{ ...inputStyles, flex: 1 }}
                      placeholder="Nome completo"
                    />
                    <button
                      style={lookupButtonStyles}
                      onClick={() => setShowLookup(true)}
                    >
                      ...
                    </button>
                  </div>
                </div>

                <div style={{...fieldStyles, width: '30%'}}>
                  <label style={labelStyles}>RG</label>
                  <input
                    type="text"
                    value={formData.rg}
                    onChange={(e) => handleInputChange('rg', e.target.value)}
                    style={inputStyles}
                    placeholder="Número do RG"
                  />
                </div>

                <div style={{...fieldStyles, width: '30%'}}>
                  <label style={labelStyles}>CPF</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleInputWithFormat('cpf', e.target.value, formatCPF)}
                    style={inputStyles}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
              </div>

              {/* Linha 3 - CEP, Logradouro, Endereço, Número */}
              <div style={rowStyles}>
                <div style={{...fieldStyles, width: '15%'}}>
                  <label style={labelStyles}>CEP</label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => handleInputWithFormat('cep', e.target.value, formatCEP)}
                    style={inputStyles}
                    placeholder="00000-000"
                    maxLength={9}
                    onBlur={(e) => {
                      if (e.target.value && CepService.validarCep(e.target.value)) {
                        handleBuscarCep(e.target.value)
                      }
                    }}
                  />
                </div>

                <div style={{...fieldStyles, width: '25%'}}>
                  <label style={labelStyles}>Logradouro</label>
                  <select style={selectStyles}>
                    <option value="">Selecione</option>
                    <option value="Rua">Rua</option>
                    <option value="Avenida">Avenida</option>
                    <option value="Praça">Praça</option>
                    <option value="Alameda">Alameda</option>
                    <option value="Travessa">Travessa</option>
                  </select>
                </div>

                <div style={{...fieldStyles, width: '40%'}}>
                  <label style={labelStyles}>Endereço</label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => handleInputChange('endereco', e.target.value)}
                    style={inputStyles}
                    placeholder="Nome da rua/avenida"
                  />
                </div>

                <div style={{...fieldStyles, width: '15%'}}>
                  <label style={labelStyles}>Número</label>
                  <input
                    type="text"
                    style={inputStyles}
                    placeholder="123"
                  />
                </div>
              </div>

              {/* Linha 4 - Complemento, Bairro, Cidade, UF */}
              <div style={rowStyles}>
                <div style={{...fieldStyles, width: '25%'}}>
                  <label style={labelStyles}>Complemento</label>
                  <input
                    type="text"
                    style={inputStyles}
                    placeholder="Apto, casa, etc."
                  />
                </div>

                <div style={{...fieldStyles, width: '25%'}}>
                  <label style={labelStyles}>Bairro</label>
                  <input
                    type="text"
                    value={formData.bairro}
                    onChange={(e) => handleInputChange('bairro', e.target.value)}
                    style={inputStyles}
                    placeholder="Bairro"
                  />
                </div>

                <div style={{...fieldStyles, width: '25%'}}>
                  <label style={labelStyles}>Cidade</label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    style={inputStyles}
                    placeholder="Cidade"
                  />
                </div>

                <div style={{...fieldStyles, width: '25%'}}>
                  <label style={labelStyles}>UF</label>
                  <select
                    value={formData.uf}
                    onChange={(e) => handleInputChange('uf', e.target.value)}
                    style={selectStyles}
                  >
                    <option value="">Selecione</option>
                    {ufOptions.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Linha 5 - Nascimento, Nome do Pai, Nome da Mãe */}
              <div style={rowStyles}>
                <div style={{...fieldStyles, width: '25%'}}>
                  <label style={labelStyles}>Nascimento</label>
                  <input
                    type="date"
                    value={formData.nascimento}
                    onChange={(e) => handleInputChange('nascimento', e.target.value)}
                    style={inputStyles}
                  />
                </div>

                <div style={{...fieldStyles, width: '37.5%'}}>
                  <label style={labelStyles}>Nome do Pai</label>
                  <input
                    type="text"
                    value={formData.pai}
                    onChange={(e) => handleInputChange('pai', e.target.value)}
                    style={inputStyles}
                    placeholder="Nome do pai"
                  />
                </div>

                <div style={{...fieldStyles, width: '37.5%'}}>
                  <label style={labelStyles}>Nome da Mãe</label>
                  <input
                    type="text"
                    value={formData.mae}
                    onChange={(e) => handleInputChange('mae', e.target.value)}
                    style={inputStyles}
                    placeholder="Nome da mãe"
                  />
                </div>
              </div>

              {/* Linha 6 - Telefone, Celular, Email */}
              <div style={rowStyles}>
                <div style={{...fieldStyles, width: '33.33%'}}>
                  <label style={labelStyles}>Telefone</label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => handleInputWithFormat('telefone', e.target.value, formatTelefone)}
                    style={inputStyles}
                    placeholder="(00) 0000-0000"
                    maxLength={14}
                  />
                </div>

                <div style={{...fieldStyles, width: '33.33%'}}>
                  <label style={labelStyles}>Celular</label>
                  <input
                    type="text"
                    value={formData.celular}
                    onChange={(e) => handleInputWithFormat('celular', e.target.value, formatCelular)}
                    style={inputStyles}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>

                <div style={{...fieldStyles, width: '33.33%'}}>
                  <label style={labelStyles}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={inputStyles}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>



              {/* Linha 13 */}


              {/* Linha 7 - Cargo Civil, Admissão, Demissão, Salário, Comissão */}
              <div style={rowStyles}>
                <div style={{...fieldStyles, width: '20%'}}>
                  <label style={labelStyles}>Cargo Civil</label>
                  <select
                    value={formData.cargoCivil}
                    onChange={(e) => handleInputChange('cargoCivil', e.target.value)}
                    style={selectStyles}
                  >
                    <option value="">Selecione o cargo</option>
                    <option value="escrevente">Escrevente</option>
                    <option value="preposto-autorizado">Preposto Autorizado</option>
                    <option value="auxiliar">Auxiliar</option>
                  </select>
                </div>

                <div style={{...fieldStyles, width: '20%'}}>
                  <label style={labelStyles}>Admissão</label>
                  <input
                    type="date"
                    value={formData.admissao}
                    onChange={(e) => handleInputChange('admissao', e.target.value)}
                    style={inputStyles}
                  />
                </div>

                <div style={{...fieldStyles, width: '20%'}}>
                  <label style={labelStyles}>Demissão</label>
                  <input
                    type="date"
                    value={formData.demissao}
                    onChange={(e) => handleInputChange('demissao', e.target.value)}
                    style={inputStyles}
                  />
                </div>

                <div style={{...fieldStyles, width: '20%'}}>
                  <label style={labelStyles}>Salário</label>
                  <input
                    type="number"
                    value={formData.salario}
                    onChange={(e) => handleInputChange('salario', e.target.value)}
                    style={inputStyles}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div style={{...fieldStyles, width: '20%'}}>
                  <label style={labelStyles}>Comissão (%)</label>
                  <input
                    type="number"
                    value={formData.comissao}
                    onChange={(e) => handleInputChange('comissao', e.target.value)}
                    style={inputStyles}
                    placeholder="0"
                    step="0.01"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Linha 9 - Login, Senha e Observação */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                {/* Coluna esquerda - Login e Senha */}
                <div style={{ display: 'flex', flexDirection: 'column', width: '40%', gap: '6px' }}>
                  <div style={fieldStyles}>
                    <label style={labelStyles}>Login</label>
                    <input
                      type="text"
                      value={formData.login}
                      onChange={(e) => handleInputChange('login', e.target.value)}
                      style={inputStyles}
                      placeholder="Login do usuário"
                    />
                  </div>
                  <div style={fieldStyles}>
                    <label style={labelStyles}>Senha</label>
                    <input
                      type="password"
                      value={formData.senha}
                      onChange={(e) => handleInputChange('senha', e.target.value)}
                      style={inputStyles}
                      placeholder="Senha do usuário"
                    />
                  </div>
                </div>

                {/* Coluna direita - Observação */}
                <div style={{ width: '60%' }}>
                  <div style={fieldStyles}>
                    <label style={labelStyles}>Observação</label>
                    <textarea
                      value={formData.observacao}
                      onChange={(e) => handleInputChange('observacao', e.target.value)}
                      style={{ 
                        ...inputStyles, 
                        height: '70px', 
                        resize: 'none',
                        paddingTop: '4px'
                      }}
                      placeholder="Observações sobre o funcionário"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div style={buttonContainerStyles}>
              <button
                style={{
                  ...primaryButtonStyles,
                  backgroundColor: hoveredButton === 'gravar' ? theme.primary + 'dd' : theme.primary
                }}
                onClick={handleSave}
                onMouseEnter={() => setHoveredButton('gravar')}
                onMouseLeave={() => setHoveredButton(null)}
                disabled={isLoading}
              >
                {isLoading ? '⏳ Salvando...' : '💾 Gravar'}
              </button>

              <button
                style={{
                  ...secondaryButtonStyles,
                  backgroundColor: hoveredButton === 'limpar' ? theme.surface + 'dd' : theme.surface
                }}
                onClick={handleClear}
                onMouseEnter={() => setHoveredButton('limpar')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                🧹 Limpar
              </button>

              <button
                style={{
                  ...secondaryButtonStyles,
                  backgroundColor: hoveredButton === 'imprimir' ? theme.surface + 'dd' : theme.surface
                }}
                onClick={handlePrint}
                onMouseEnter={() => setHoveredButton('imprimir')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                🖨️ Imprimir
              </button>

              <button
                style={{
                  ...secondaryButtonStyles,
                  backgroundColor: hoveredButton === 'retornar' ? theme.surface + 'dd' : theme.surface
                }}
                onClick={onClose}
                onMouseEnter={() => setHoveredButton('retornar')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                🚪 Retornar
              </button>
            </div>
          </div>
      </div>

      {/* Modal de Lookup de Funcionário */}
      {showLookup && (
        <FuncionarioLookup
          onSelect={handleSelectFuncionario}
          onClose={() => setShowLookup(false)}
        />
      )}
    </BasePage>
  )
}
