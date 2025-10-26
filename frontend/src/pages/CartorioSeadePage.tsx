import React, { useState } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { cartorioSeadeService, CartorioSeadeAPI } from '../services/CartorioSeadeService'
import { cnpjService } from '../services/CNPJService'
import { viaCepService } from '../services/ViaCepService'
import { validarCPF, formatCPF } from '../utils/cpfValidator'

interface CartorioSeade {
  id: number
  codigo: string
  numeroSeade: string
  numeroCnj: string
  tituloCartorio: string
  cnpj: string
  cep: string
  endereco: string
  numero: string
  bairro: string
  cidade: string
  uf: string
  site: string
  email: string
  responsavel: string
  telefone: string
  cpf: string
}

interface CartorioSeadePageProps {
  onClose: () => void
}

export function CartorioSeadePage({ onClose }: CartorioSeadePageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  
  // Cor do header: teal no light, laranja no dark
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'

  // Estado para o formulário
  const [formData, setFormData] = useState({
    codigo: '0',
    numeroSeade: '0',
    numeroCnj: '0',
    tituloCartorio: '',
    cnpj: '',
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: 'SP',
    site: '',
    email: '',
    responsavel: '',
    telefone: '',
    cpf: ''
  })
  
  // Estado para os dados cadastrados
  const [cartorios, setCartorios] = useState<CartorioSeade[]>([])
  
  // Estado para o item selecionado
  const [selectedId, setSelectedId] = useState<number | null>(null)
  
  // Estado para campo em foco
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Função para criar novo registro
  const handleNovo = () => {
    setFormData({
      codigo: '0',
      numeroSeade: '0',
      numeroCnj: '0',
      tituloCartorio: '',
      cnpj: '',
      cep: '',
      endereco: '',
      numero: '',
      bairro: '',
      cidade: '',
      uf: 'SP',
      site: '',
      email: '',
      responsavel: '',
      telefone: '',
      cpf: ''
    })
    setSelectedId(null)
  }

  // Função para gravar registro
  const handleGravar = () => {
    if (selectedId !== null) {
      // Editar registro existente
      setCartorios(cartorios.map(cart => 
        cart.id === selectedId 
          ? { ...cart, ...formData }
          : cart
      ))
      alert('✅ Cartório atualizado com sucesso!')
    } else {
      // Criar novo registro
      const novoCodigo = cartorios.length > 0 ? String(Math.max(...cartorios.map(c => parseInt(c.codigo) || 0)) + 1) : '1'
      const novoCartorio: CartorioSeade = {
        id: Date.now(),
        codigo: formData.codigo || novoCodigo,
        ...formData
      }
      setCartorios([...cartorios, novoCartorio])
      alert('✅ Cartório cadastrado com sucesso!')
    }
  }

  // Função para excluir registro
  const handleExcluir = () => {
    if (selectedId !== null) {
      if (confirm('Deseja realmente excluir este registro?')) {
        setCartorios(cartorios.filter(cart => cart.id !== selectedId))
        handleNovo()
        alert('✅ Cartório excluído com sucesso!')
      }
    }
  }

  // Função para atualizar cartórios interligados
  const handleAtualizarInterligados = async () => {
    try {
      const confirmacao = confirm('🌐 Deseja atualizar a lista de cartórios interligados?\n\nEsta ação buscará todos os cartórios cadastrados no sistema SEADE.')
      
      if (!confirmacao) {
        return
      }

      console.log('🌐 Iniciando atualização de cartórios interligados...')
      
      // Mostrar loading
      const loadingMessage = 'Carregando cartórios...'
      console.log(loadingMessage)
      
      // Buscar cartórios interligados da API
      const cartoriosInterligados = await cartorioSeadeService.atualizarCartoriosInterligados()
      
      console.log('✅ Cartórios recebidos:', cartoriosInterligados.length)
      
      // Mostrar resultado
      let mensagem = `✅ Atualização concluída com sucesso!\n\n`
      mensagem += `📊 Total de cartórios interligados: ${cartoriosInterligados.length}\n\n`
      
      if (cartoriosInterligados.length > 0) {
        mensagem += `📋 Primeiros cartórios:\n`
        cartoriosInterligados.slice(0, 5).forEach((cart, index) => {
          mensagem += `${index + 1}. ${cart.codigo} - ${cart.tituloCartorio}\n`
        })
        
        if (cartoriosInterligados.length > 5) {
          mensagem += `\n... e mais ${cartoriosInterligados.length - 5} cartórios.`
        }
      }
      
      alert(mensagem)
      
      // Opcional: atualizar a lista local de cartórios
      // setCartorios(cartoriosInterligados.map((cart, index) => ({
      //   id: index + 1,
      //   ...cart
      // })))
      
    } catch (error) {
      console.error('❌ Erro ao atualizar cartórios interligados:', error)
      alert('❌ Erro ao atualizar cartórios interligados.\n\nVerifique sua conexão e tente novamente.')
    }
  }

  // Função para buscar por código
  const handleBuscarCodigo = async () => {
    const codigo = prompt('Digite o código do cartório:')
    if (!codigo) return
    
    try {
      const cartorio = await cartorioSeadeService.buscarPorCodigo(codigo)
      if (cartorio) {
        setFormData({
          codigo: cartorio.codigo,
          numeroSeade: cartorio.numeroSeade,
          numeroCnj: cartorio.numeroCnj,
          tituloCartorio: cartorio.tituloCartorio,
          cnpj: cartorio.cnpj,
          cep: cartorio.cep,
          endereco: cartorio.endereco,
          numero: '',
          bairro: cartorio.bairro,
          cidade: cartorio.cidade,
          uf: cartorio.uf,
          site: cartorio.site,
          email: cartorio.email,
          responsavel: cartorio.responsavel,
          telefone: cartorio.telefone,
          cpf: cartorio.cpf
        })
        alert('✅ Cartório encontrado!')
      } else {
        alert('❌ Cartório não encontrado!')
      }
    } catch (error) {
      console.error('Erro ao buscar cartório:', error)
      alert('❌ Erro ao buscar cartório!')
    }
  }

  // Função para buscar por número SEADE
  const handleBuscarSeade = async () => {
    const numeroSeade = prompt('Digite o número SEADE:')
    if (!numeroSeade) return
    
    try {
      const cartorio = await cartorioSeadeService.buscarPorNumeroSeade(numeroSeade)
      if (cartorio) {
        setFormData({
          codigo: cartorio.codigo,
          numeroSeade: cartorio.numeroSeade,
          numeroCnj: cartorio.numeroCnj,
          tituloCartorio: cartorio.tituloCartorio,
          cnpj: cartorio.cnpj,
          cep: cartorio.cep,
          endereco: cartorio.endereco,
          numero: '',
          bairro: cartorio.bairro,
          cidade: cartorio.cidade,
          uf: cartorio.uf,
          site: cartorio.site,
          email: cartorio.email,
          responsavel: cartorio.responsavel,
          telefone: cartorio.telefone,
          cpf: cartorio.cpf
        })
        alert('✅ Cartório encontrado!')
      } else {
        alert('❌ Cartório não encontrado!')
      }
    } catch (error) {
      console.error('Erro ao buscar cartório:', error)
      alert('❌ Erro ao buscar cartório!')
    }
  }

  // Função para buscar por número CNJ
  const handleBuscarCnj = async () => {
    const numeroCnj = prompt('Digite o número CNJ:')
    if (!numeroCnj) return
    
    try {
      const cartorio = await cartorioSeadeService.buscarPorNumeroCnj(numeroCnj)
      if (cartorio) {
        setFormData({
          codigo: cartorio.codigo,
          numeroSeade: cartorio.numeroSeade,
          numeroCnj: cartorio.numeroCnj,
          tituloCartorio: cartorio.tituloCartorio,
          cnpj: cartorio.cnpj,
          cep: cartorio.cep,
          endereco: cartorio.endereco,
          numero: '',
          bairro: cartorio.bairro,
          cidade: cartorio.cidade,
          uf: cartorio.uf,
          site: cartorio.site,
          email: cartorio.email,
          responsavel: cartorio.responsavel,
          telefone: cartorio.telefone,
          cpf: cartorio.cpf
        })
        alert('✅ Cartório encontrado!')
      } else {
        alert('❌ Cartório não encontrado!')
      }
    } catch (error) {
      console.error('Erro ao buscar cartório:', error)
      alert('❌ Erro ao buscar cartório!')
    }
  }

  // Função para buscar endereço por CEP
  const handleBuscarCEP = async () => {
    const cep = formData.cep
    
    if (!cep) {
      alert('⚠️ Digite um CEP antes de buscar!')
      return
    }

    if (!viaCepService.validarCEP(cep)) {
      alert('❌ CEP inválido! Deve conter 8 dígitos.')
      return
    }

    try {
      console.log('🔍 Buscando endereço por CEP:', cep)
      
      const dados = await viaCepService.buscarCEP(cep)
      
      if (dados) {
        setFormData({
          ...formData,
          cep: viaCepService.formatarCEP(dados.cep),
          endereco: dados.logradouro,
          bairro: dados.bairro,
          cidade: dados.localidade,
          uf: dados.uf
        })
        
        alert(`✅ CEP encontrado!\n\n📍 Endereço: ${dados.logradouro}\n🏘️ Bairro: ${dados.bairro}\n🏙️ Cidade: ${dados.localidade}/${dados.uf}\n\nOs dados foram preenchidos automaticamente!`)
      } else {
        alert('❌ CEP não encontrado.\n\nVerifique se o número está correto.')
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      alert('❌ Erro ao buscar CEP.\n\nVerifique sua conexão e tente novamente.')
    }
  }

  // Função para consultar CNPJ
  const handleConsultarCNPJ = async () => {
    const cnpj = formData.cnpj
    
    if (!cnpj) {
      alert('⚠️ Digite um CNPJ antes de consultar!')
      return
    }

    // Validar formato
    if (!cnpjService.validarCNPJ(cnpj)) {
      alert('❌ CNPJ inválido! Verifique o número digitado.')
      return
    }

    try {
      console.log('🔍 Consultando CNPJ:', cnpj)
      
      const dados = await cnpjService.consultarCNPJ(cnpj)
      
      if (dados) {
        // Preencher campos automaticamente com os dados da Receita Federal
        setFormData({
          ...formData,
          cnpj: cnpjService.formatarCNPJ(dados.cnpj),
          tituloCartorio: formData.tituloCartorio || dados.razaoSocial,
          cep: dados.cep,
          endereco: dados.logradouro,
          numero: dados.numero || '',
          bairro: dados.bairro,
          cidade: dados.municipio,
          uf: dados.uf,
          email: dados.email || formData.email,
          responsavel: formData.responsavel || dados.razaoSocial,
          telefone: dados.telefone || formData.telefone
        })
        
        alert(`✅ CNPJ encontrado!\n\n📋 Razão Social: ${dados.razaoSocial}\n🏢 Nome Fantasia: ${dados.nomeFantasia}\n📍 Endereço: ${dados.logradouro}, ${dados.numero} - ${dados.bairro}\n🏙️ Cidade: ${dados.municipio}/${dados.uf}\n📮 CEP: ${dados.cep}\n\nOs dados foram preenchidos automaticamente!`)
      } else {
        alert('❌ CNPJ não encontrado na base de dados da Receita Federal.\n\nVerifique se o número está correto.')
      }
    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error)
      alert('❌ Erro ao consultar CNPJ.\n\nVerifique sua conexão e tente novamente.')
    }
  }

  // Cores de foco (mesmas da ClientePage)
  const focusColor = currentTheme === 'dark' ? '#ffd4a3' : '#ffedd5'
  const focusTextColor = currentTheme === 'dark' ? '#1a1a1a' : '#000000'

  // Estilos dos inputs
  const getInputStyles = (fieldName: string) => ({
    width: '100%',
    padding: '4px 6px',
    fontSize: '12px',
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    backgroundColor: focusedField === fieldName ? focusColor : theme.background,
    color: focusedField === fieldName ? focusTextColor : theme.text,
    outline: 'none',
    height: '28px',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease',
    WebkitBoxShadow: focusedField === fieldName ? `0 0 0 1000px ${focusColor} inset` : `0 0 0 1000px ${theme.background} inset`,
    WebkitTextFillColor: focusedField === fieldName ? focusTextColor : theme.text,
    boxShadow: focusedField === fieldName ? `0 0 0 1000px ${focusColor} inset` : 'none'
  })

  const inputStyles = getInputStyles('')

  const labelStyles = {
    fontSize: '11px',
    fontWeight: '600' as const,
    marginBottom: '2px',
    color: theme.text,
    display: 'block'
  }

  const buttonStyles = {
    padding: '6px 16px',
    fontSize: '11px',
    fontWeight: '600' as const,
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '90px'
  }

  const iconButtonStyles = {
    position: 'absolute' as const,
    right: '6px',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '0px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '0px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: theme.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s ease',
    zIndex: 1,
    width: '20px',
    height: '20px',
    outline: 'none',
    boxShadow: 'none'
  }
  
  const getInputWithIconStyles = (fieldName: string) => ({
    ...getInputStyles(fieldName),
    paddingRight: '30px' // Espaço para o ícone
  })

  const getSelectStyles = (fieldName: string) => ({
    ...getInputStyles(fieldName),
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(focusedField === fieldName ? focusTextColor : theme.text)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    backgroundSize: '12px',
    paddingRight: '28px',
    paddingTop: '4px',
    paddingBottom: '4px',
    height: '28px',
    boxSizing: 'border-box' as const,
    lineHeight: '18px'
  })

  const inputWithIconStyles = getInputWithIconStyles('')
  const selectStyles = getSelectStyles('')

  return (
    <BasePage
      title="Cadastro de Cartório (SEADE)"
      onClose={onClose}
      width="900px"
      height="520px"
      minWidth="900px"
      minHeight="520px"
      resizable={false}
      headerColor={headerColor}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* Subtítulo */}
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          color: theme.text,
          padding: '4px 0',
          borderBottom: `2px solid ${headerColor}`
        }}>
          Cadastro / Manutenção
        </div>

        {/* Formulário de Entrada */}
        <div style={{
          border: `1px solid ${theme.border}`,
          borderRadius: '4px',
          padding: '12px',
          backgroundColor: theme.surface
        }}>
          {/* Linha 1: Código, Número SEADE, Número CNJ, Botão Atualizar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '180px 180px 180px 1fr',
            gap: '8px',
            marginBottom: '12px'
          }}>
            {/* Código */}
            <div>
              <label style={labelStyles}>Código</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => {
                    // Permite apenas números
                    const valor = e.target.value.replace(/\D/g, '')
                    setFormData({ ...formData, codigo: valor })
                  }}
                  onFocus={() => setFocusedField('codigo')}
                  onBlur={() => setFocusedField(null)}
                  style={getInputWithIconStyles('codigo')}
                />
                <button 
                  onClick={handleBuscarCodigo} 
                  style={iconButtonStyles}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >🔍</button>
              </div>
            </div>

            {/* Número SEADE */}
            <div>
              <label style={labelStyles}>Número SEADE</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formData.numeroSeade}
                  onChange={(e) => {
                    // Permite apenas números
                    const valor = e.target.value.replace(/\D/g, '')
                    setFormData({ ...formData, numeroSeade: valor })
                  }}
                  onFocus={() => setFocusedField('numeroSeade')}
                  onBlur={() => setFocusedField(null)}
                  style={getInputWithIconStyles('numeroSeade')}
                />
                <button 
                  onClick={handleBuscarSeade} 
                  style={iconButtonStyles}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >🔍</button>
              </div>
            </div>

            {/* Número CNJ */}
            <div>
              <label style={labelStyles}>Número CNJ</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formData.numeroCnj}
                  onChange={(e) => {
                    // Permite apenas números
                    const valor = e.target.value.replace(/\D/g, '')
                    setFormData({ ...formData, numeroCnj: valor })
                  }}
                  onFocus={() => setFocusedField('numeroCnj')}
                  onBlur={() => setFocusedField(null)}
                  style={getInputWithIconStyles('numeroCnj')}
                />
                <button 
                  onClick={handleBuscarCnj} 
                  style={iconButtonStyles}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >🔍</button>
              </div>
            </div>

            {/* Botão Atualizar Cartórios Interligados */}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={handleAtualizarInterligados}
                style={{
                  padding: '4px 8px',
                  fontSize: '10px',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: headerColor,
                  color: 'white',
                  width: '100%',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
                title="Atualizar Cartórios Interligados"
              >
                🌐 Atualizar Interligados
              </button>
            </div>
          </div>

          {/* Linha 2: CNPJ, Título Cartório */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '250px 1fr',
            gap: '8px',
            marginBottom: '12px'
          }}>
            {/* CNPJ */}
            <div>
              <label style={labelStyles}>CNPJ</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  onFocus={() => setFocusedField('cnpj')}
                  onBlur={(e) => {
                    setFocusedField(null)
                    // Formata CNPJ ao sair do campo
                    if (e.target.value && cnpjService.validarCNPJ(e.target.value)) {
                      setFormData({ ...formData, cnpj: cnpjService.formatarCNPJ(e.target.value) })
                    }
                  }}
                  style={getInputWithIconStyles('cnpj')}
                  placeholder="00.000.000/0000-00"
                />
                <button 
                  onClick={handleConsultarCNPJ} 
                  style={iconButtonStyles} 
                  title="Consultar CNPJ na Receita Federal"
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >🔍</button>
              </div>
            </div>

            {/* Título Cartório */}
            <div>
              <label style={labelStyles}>Título Cartório</label>
              <input
                type="text"
                value={formData.tituloCartorio}
                onChange={(e) => setFormData({ ...formData, tituloCartorio: e.target.value })}
                onFocus={() => setFocusedField('tituloCartorio')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyles('tituloCartorio')}
              />
            </div>
          </div>

          {/* Linha 3: CEP, Endereço, Número */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '150px 1fr 120px',
            gap: '8px',
            marginBottom: '12px'
          }}>
            {/* CEP */}
            <div>
              <label style={labelStyles}>CEP</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formData.cep}
                  onChange={(e) => {
                    // Permite apenas números, máximo 8 dígitos
                    const valor = e.target.value.replace(/\D/g, '').slice(0, 8)
                    setFormData({ ...formData, cep: valor })
                  }}
                  onFocus={() => setFocusedField('cep')}
                  onBlur={async (e) => {
                    setFocusedField(null)
                    const cep = e.target.value
                    
                    // Formata CEP
                    if (cep && viaCepService.validarCEP(cep)) {
                      setFormData({ ...formData, cep: viaCepService.formatarCEP(cep) })
                      
                      // Busca endereço automaticamente ao pressionar Tab
                      try {
                        const dados = await viaCepService.buscarCEP(cep)
                        
                        if (dados) {
                          setFormData(prev => ({
                            ...prev,
                            cep: viaCepService.formatarCEP(dados.cep),
                            endereco: dados.logradouro,
                            bairro: dados.bairro,
                            cidade: dados.localidade,
                            uf: dados.uf
                          }))
                          
                          console.log('✅ Endereço preenchido automaticamente pelo CEP')
                        }
                      } catch (error) {
                        console.error('Erro ao buscar CEP automaticamente:', error)
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    // Busca ao pressionar Enter
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleBuscarCEP()
                    }
                  }}
                  style={getInputWithIconStyles('cep')}
                  placeholder="00000-000"
                  maxLength={9}
                />
                <button 
                  onClick={handleBuscarCEP} 
                  style={iconButtonStyles}
                  title="Buscar endereço por CEP"
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >🔍</button>
              </div>
            </div>

            {/* Endereço */}
            <div>
              <label style={labelStyles}>Endereço</label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                onFocus={() => setFocusedField('endereco')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyles('endereco')}
              />
            </div>

            {/* Número */}
            <div>
              <label style={labelStyles}>Número</label>
              <input
                type="text"
                value={formData.numero}
                onChange={(e) => {
                  // Permite apenas números e letras (ex: 123, 123A)
                  const valor = e.target.value.slice(0, 10)
                  setFormData({ ...formData, numero: valor })
                }}
                onFocus={() => setFocusedField('numero')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyles('numero')}
                maxLength={10}
              />
            </div>
          </div>

          {/* Linha 4: Bairro, Cidade, UF */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 150px',
            gap: '8px',
            marginBottom: '12px'
          }}>
            {/* Bairro */}
            <div>
              <label style={labelStyles}>Bairro</label>
              <input
                type="text"
                value={formData.bairro}
                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                onFocus={() => setFocusedField('bairro')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyles('bairro')}
              />
            </div>

            {/* Cidade */}
            <div>
              <label style={labelStyles}>Cidade</label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                onFocus={() => setFocusedField('cidade')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyles('cidade')}
              />
            </div>

            {/* UF */}
            <div>
              <label style={labelStyles}>UF</label>
              <select
                value={formData.uf}
                onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                onFocus={() => setFocusedField('uf')}
                onBlur={() => setFocusedField(null)}
                style={getSelectStyles('uf')}
              >
                <option value="AC">AC</option>
                <option value="AL">AL</option>
                <option value="AP">AP</option>
                <option value="AM">AM</option>
                <option value="BA">BA</option>
                <option value="CE">CE</option>
                <option value="DF">DF</option>
                <option value="ES">ES</option>
                <option value="GO">GO</option>
                <option value="MA">MA</option>
                <option value="MT">MT</option>
                <option value="MS">MS</option>
                <option value="MG">MG</option>
                <option value="PA">PA</option>
                <option value="PB">PB</option>
                <option value="PR">PR</option>
                <option value="PE">PE</option>
                <option value="PI">PI</option>
                <option value="RJ">RJ</option>
                <option value="RN">RN</option>
                <option value="RS">RS</option>
                <option value="RO">RO</option>
                <option value="RR">RR</option>
                <option value="SC">SC</option>
                <option value="SP">SP</option>
                <option value="SE">SE</option>
                <option value="TO">TO</option>
              </select>
            </div>
          </div>

          {/* Linha 5: Site, E-Mail */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '12px'
          }}>
            {/* Site */}
            <div>
              <label style={labelStyles}>Site</label>
              <input
                type="text"
                value={formData.site}
                onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                onFocus={() => setFocusedField('site')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyles('site')}
                placeholder="https://"
              />
            </div>

            {/* E-Mail */}
            <div>
              <label style={labelStyles}>E-Mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onFocus={() => setFocusedField('email')}
                onBlur={(e) => {
                  setFocusedField(null)
                  const email = e.target.value.trim()
                  
                  // Valida se tem @ e formato básico
                  if (email && !email.includes('@')) {
                    alert('❌ E-mail inválido!\n\nO e-mail deve conter o caractere @')
                    return
                  }
                  
                  // Validação mais completa
                  if (email) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    if (!emailRegex.test(email)) {
                      alert('❌ E-mail inválido!\n\nFormato esperado: exemplo@dominio.com.br')
                    }
                  }
                }}
                style={getInputStyles('email')}
                placeholder="exemplo@cartorio.com.br"
              />
            </div>
          </div>

          {/* Linha 6: Responsável, CPF, Telefone */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 180px 180px',
            gap: '8px'
          }}>
            {/* Responsável */}
            <div>
              <label style={labelStyles}>Responsável</label>
              <input
                type="text"
                value={formData.responsavel}
                onChange={(e) => {
                  // Permite apenas letras e espaços
                  const valor = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
                  setFormData({ ...formData, responsavel: valor })
                }}
                onFocus={() => setFocusedField('responsavel')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyles('responsavel')}
              />
            </div>

            {/* CPF */}
            <div>
              <label style={labelStyles}>CPF</label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => {
                  // Permite apenas números, máximo 11 dígitos
                  const valor = e.target.value.replace(/\D/g, '').slice(0, 11)
                  setFormData({ ...formData, cpf: valor })
                }}
                onFocus={() => setFocusedField('cpf')}
                onBlur={(e) => {
                  setFocusedField(null)
                  const valor = e.target.value
                  if (valor) {
                    // Formata CPF
                    const cpfFormatado = formatCPF(valor)
                    setFormData({ ...formData, cpf: cpfFormatado })
                    
                    // Valida CPF
                    const validacao = validarCPF(valor)
                    if (!validacao.isValid) {
                      alert(`❌ CPF inválido!\n\n${validacao.error}`)
                    }
                  }
                }}
                style={getInputStyles('cpf')}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>

            {/* Telefone */}
            <div>
              <label style={labelStyles}>Telefone</label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => {
                  // Permite apenas números, máximo 11 dígitos
                  const valor = e.target.value.replace(/\D/g, '').slice(0, 11)
                  setFormData({ ...formData, telefone: valor })
                }}
                onFocus={() => setFocusedField('telefone')}
                onBlur={(e) => {
                  setFocusedField(null)
                  // Formata telefone ao sair do campo
                  const valor = e.target.value.replace(/\D/g, '')
                  if (valor.length === 11) {
                    // Formato: (XX) XXXXX-XXXX
                    const formatado = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`
                    setFormData({ ...formData, telefone: formatado })
                  } else if (valor.length === 10) {
                    // Formato: (XX) XXXX-XXXX
                    const formatado = `(${valor.slice(0, 2)}) ${valor.slice(2, 6)}-${valor.slice(6)}`
                    setFormData({ ...formData, telefone: formatado })
                  }
                }}
                style={getInputStyles('telefone')}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          paddingTop: '4px',
          paddingBottom: '0px'
        }}>
          {/* Novo */}
          <button
            onClick={handleNovo}
            style={{
              ...buttonStyles,
              backgroundColor: '#6c757d',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#495057'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6c757d'
            }}
          >
            📄 Novo
          </button>

          {/* Gravar */}
          <button
            onClick={handleGravar}
            style={{
              ...buttonStyles,
              backgroundColor: '#6c757d',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#495057'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6c757d'
            }}
          >
            💾 Gravar
          </button>

          {/* Excluir */}
          <button
            onClick={handleExcluir}
            disabled={selectedId === null}
            style={{
              ...buttonStyles,
              backgroundColor: selectedId === null ? theme.border : '#6c757d',
              color: selectedId === null ? theme.textSecondary : 'white',
              cursor: selectedId === null ? 'not-allowed' : 'pointer',
              opacity: selectedId === null ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (selectedId !== null) {
                e.currentTarget.style.backgroundColor = '#495057'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedId !== null) {
                e.currentTarget.style.backgroundColor = '#6c757d'
              }
            }}
          >
            ❌ Excluir
          </button>

          {/* Fechar */}
          <button
            onClick={onClose}
            style={{
              ...buttonStyles,
              backgroundColor: '#6c757d',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#495057'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6c757d'
            }}
          >
            ❌ Fechar
          </button>
        </div>
      </div>
    </BasePage>
  )
}

