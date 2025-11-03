import { useState } from 'react'
import { CidadeAutocompleteInput } from '../components/CidadeAutocompleteInput'
import { CustomSelect } from '../components/CustomSelect'
import { UF_OPTIONS } from '../constants/selectOptions'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { cartorioSeadeService } from '../services/CartorioSeadeService'
import { cnpjService } from '../services/CNPJService'
import { viaCepService } from '../services/ViaCepService'
import { validarCPF, formatCPF } from '../utils/cpfValidator'
import { useModal } from '../hooks/useModal'

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
  const modal = useModal()
  
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
  const [cartorios, setCartorios] = useState<CartorioSeade[]>(() => {
    const saved = localStorage.getItem('cartorios-seade')
    return saved ? JSON.parse(saved) : []
  })
  
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
  const handleGravar = async () => {
    if (selectedId !== null) {
      // Editar registro existente
      const cartoriosAtualizados = cartorios.map(cart => 
        cart.id === selectedId 
          ? { ...cart, ...formData }
          : cart
      )
      setCartorios(cartoriosAtualizados)
      localStorage.setItem('cartorios-seade', JSON.stringify(cartoriosAtualizados))
      await modal.alert('Cartório atualizado com sucesso!', 'Sucesso', '✅')
    } else {
      // Criar novo registro com código sequencial
      const ultimoCodigo = localStorage.getItem('ultimoCodigoCartorio')
      const proximoCodigo = ultimoCodigo ? parseInt(ultimoCodigo) + 1 : 1
      
      localStorage.setItem('ultimoCodigoCartorio', proximoCodigo.toString())
      
      const novoCartorio: CartorioSeade = {
        id: Date.now(),
        ...formData,
        codigo: proximoCodigo.toString()
      }
      const novosCartorios = [...cartorios, novoCartorio]
      setCartorios(novosCartorios)
      localStorage.setItem('cartorios-seade', JSON.stringify(novosCartorios))
      console.log('✅ Cartório cadastrado! Código:', proximoCodigo)
    }
  }

  // Função para excluir registro
  const handleExcluir = async () => {
    if (selectedId !== null) {
      const confirmado = await modal.confirm('Deseja realmente excluir este registro?', 'Confirmar Exclusão', '⚠️')
      if (confirmado) {
        const cartoriosAtualizados = cartorios.filter(cart => cart.id !== selectedId)
        setCartorios(cartoriosAtualizados)
        localStorage.setItem('cartorios-seade', JSON.stringify(cartoriosAtualizados))
        handleNovo()
        await modal.alert('Cartório excluído com sucesso!', 'Sucesso', '✅')
      }
    }
  }

  // Função para atualizar cartórios interligados
  const handleAtualizarInterligados = async () => {
    try {
      const confirmacao = await modal.confirm('Deseja atualizar a lista de cartórios interligados?\n\nEsta ação carregará os cartórios do arquivo JSON e gerará códigos sequenciais.', 'Atualizar Interligados', '🌐')
      
      if (!confirmacao) {
        return
      }

      console.log('🌐 Iniciando atualização de cartórios interligados...')
      console.log('📁 Carregando de: extra/cartoriosInterligados.json')
      
      // Buscar cartórios do JSON local
      const response = await fetch('/extra/cartoriosInterligados.json')
      if (!response.ok) {
        throw new Error('Erro ao carregar arquivo JSON')
      }
      
      const cartoriosInterligados = await response.json()
      
      console.log('✅ Cartórios recebidos:', cartoriosInterligados.length)
      
      // Obter último código usado
      const ultimoCodigo = localStorage.getItem('ultimoCodigoCartorio')
      let proximoCodigo = ultimoCodigo ? parseInt(ultimoCodigo) + 1 : 1
      
      // Processar cartórios do JSON e gerar códigos sequenciais
      const cartoriosComCodigo = cartoriosInterligados.map((cart: any, index: number) => {
        const codigoAtual = proximoCodigo + index
        const cartorioProcessado: CartorioSeade = {
          id: Date.now() + index, // ID único baseado no timestamp
          codigo: codigoAtual.toString(),
          numeroSeade: '0',
          numeroCnj: cart.numeroCNJ || '0',
          tituloCartorio: cart.tituloCartorio || '',
          cnpj: '',
          cep: '',
          endereco: cart.endereco || '',
          numero: cart.numero || '',
          bairro: cart.bairro || '',
          cidade: '',
          uf: '',
          site: '',
          email: cart.email || '',
          responsavel: cart.responsavel || '',
          telefone: cart.telefone || '',
          cpf: ''
        }
        return cartorioProcessado
      })
      
      // Atualizar proximoCodigo após processar todos os cartórios
      proximoCodigo = proximoCodigo + cartoriosComCodigo.length
      
      // Atualizar último código no localStorage
      localStorage.setItem('ultimoCodigoCartorio', (proximoCodigo - 1).toString())
      
      // Adicionar aos cartórios existentes
      const novosCartorios = [...cartorios, ...cartoriosComCodigo]
      console.log('📊 Total de cartórios antes:', cartorios.length)
      console.log('📊 Total de cartórios importados:', cartoriosComCodigo.length)
      console.log('📊 Total de cartórios depois:', novosCartorios.length)
      
      setCartorios(novosCartorios)
      
      // Salvar no localStorage
      localStorage.setItem('cartorios-seade', JSON.stringify(novosCartorios))
      console.log('💾 Cartórios salvos no localStorage')
      console.log('💾 Último código salvo:', (proximoCodigo - 1))
      
      // Mostrar resultado
      let mensagem = `✅ Atualização concluída com sucesso!\n\n`
      mensagem += `📊 Total de cartórios importados: ${cartoriosInterligados.length}\n`
      mensagem += `🔢 Códigos gerados: ${cartoriosComCodigo[0]?.codigo} a ${cartoriosComCodigo[cartoriosComCodigo.length - 1]?.codigo}\n\n`
      
      if (cartoriosComCodigo.length > 0) {
        mensagem += `📋 Primeiros cartórios:\n`
        cartoriosComCodigo.slice(0, 5).forEach((cart: any) => {
          mensagem += `Cód ${cart.codigo} - CNJ ${cart.numeroCnj} - ${cart.tituloCartorio.substring(0, 40)}...\n`
        })
        
        if (cartoriosComCodigo.length > 5) {
          mensagem += `\n... e mais ${cartoriosComCodigo.length - 5} cartórios.`
        }
      }
      
      await modal.alert(mensagem, 'Importação Concluída', '✅')
      
    } catch (error) {
      console.error('❌ Erro ao atualizar cartórios interligados:', error)
      await modal.alert('Erro ao atualizar cartórios interligados.\n\nVerifique se o arquivo extra/cartoriosInterligados.json existe.', 'Erro', '❌')
    }
  }

  // Função para buscar por código (não utilizada - busca feita pela tabela)
  /*const handleBuscarCodigo = async () => {
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
        await modal.alert('Cartório encontrado!', 'Sucesso', '✅')
      } else {
        await modal.alert('Cartório não encontrado!', 'Não Encontrado', '❌')
      }
    } catch (error) {
      console.error('Erro ao buscar cartório:', error)
      await modal.alert('Erro ao buscar cartório!', 'Erro', '❌')
    }
  }*/

  // Função para buscar por número SEADE
  const handleBuscarSeade = async () => {
    const numeroSeade = await modal.prompt('Digite o número SEADE:', '', 'Buscar por SEADE', '🔍')
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
        await modal.alert('Cartório encontrado!', 'Sucesso', '✅')
      } else {
        await modal.alert('Cartório não encontrado!', 'Não Encontrado', '❌')
      }
    } catch (error) {
      console.error('Erro ao buscar cartório:', error)
      await modal.alert('Erro ao buscar cartório!', 'Erro', '❌')
    }
  }

  // Função para buscar por número CNJ
  const handleBuscarCnj = async () => {
    const numeroCnj = await modal.prompt('Digite o número CNJ:', '', 'Buscar por CNJ', '🔍')
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
        await modal.alert('Cartório encontrado!', 'Sucesso', '✅')
      } else {
        await modal.alert('Cartório não encontrado!', 'Não Encontrado', '❌')
      }
    } catch (error) {
      console.error('Erro ao buscar cartório:', error)
      await modal.alert('Erro ao buscar cartório!', 'Erro', '❌')
    }
  }

  // Função para buscar endereço por CEP
  const handleBuscarCEP = async () => {
    const cep = formData.cep
    
    if (!cep) {
      await modal.alert('Digite um CEP antes de buscar!', 'Atenção', '⚠️')
      return
    }

    if (!viaCepService.validarCEP(cep)) {
      await modal.alert('CEP inválido! Deve conter 8 dígitos.', 'CEP Inválido', '❌')
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
        
        await modal.alert(`CEP encontrado!\n\n📍 Endereço: ${dados.logradouro}\n🏘️ Bairro: ${dados.bairro}\n🏙️ Cidade: ${dados.localidade}/${dados.uf}\n\nOs dados foram preenchidos automaticamente!`, 'CEP Encontrado', '✅')
      } else {
        await modal.alert('CEP não encontrado.\n\nVerifique se o número está correto.', 'Não Encontrado', '❌')
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      await modal.alert('Erro ao buscar CEP.\n\nVerifique sua conexão e tente novamente.', 'Erro', '❌')
    }
  }

  // Função para consultar CNPJ
  const handleConsultarCNPJ = async () => {
    const cnpj = formData.cnpj
    
    if (!cnpj) {
      await modal.alert('Digite um CNPJ antes de consultar!', 'Atenção', '⚠️')
      return
    }

    // Validar formato
    if (!cnpjService.validarCNPJ(cnpj)) {
      await modal.alert('CNPJ inválido! Verifique o número digitado.', 'CNPJ Inválido', '❌')
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
        
        await modal.alert(`CNPJ encontrado!\n\n📋 Razão Social: ${dados.razaoSocial}\n🏢 Nome Fantasia: ${dados.nomeFantasia}\n📍 Endereço: ${dados.logradouro}, ${dados.numero} - ${dados.bairro}\n🏙️ Cidade: ${dados.municipio}/${dados.uf}\n📮 CEP: ${dados.cep}\n\nOs dados foram preenchidos automaticamente!`, 'CNPJ Encontrado', '✅')
      } else {
        await modal.alert('CNPJ não encontrado na base de dados da Receita Federal.\n\nVerifique se o número está correto.', 'Não Encontrado', '❌')
      }
    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error)
      await modal.alert('Erro ao consultar CNPJ.\n\nVerifique sua conexão e tente novamente.', 'Erro', '❌')
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

  return (
    <>
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
              <input
                type="text"
                value={formData.codigo}
                readOnly
                disabled
                onKeyDown={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                style={{
                  ...getInputWithIconStyles('codigo'),
                  backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                  color: currentTheme === 'dark' ? '#666' : '#999',
                  cursor: 'not-allowed',
                  opacity: 0.7,
                  width: '100px'
                }}
              />
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
              <CidadeAutocompleteInput
                value={formData.cidade}
                onChange={(cidade) => setFormData({ ...formData, cidade })}
                onUfChange={(uf) => setFormData({ ...formData, uf })}
                uf={formData.uf}
                focusedField={focusedField}
                onFocus={() => setFocusedField('cidade')}
                onBlur={() => setFocusedField(null)}
                inputStyles={getInputStyles('cidade')}
              />
            </div>

            {/* UF */}
            <div>
              <label style={labelStyles}>UF</label>
              <CustomSelect
                value={formData.uf}
                onChange={(value) => setFormData({ ...formData, uf: value })}
                options={UF_OPTIONS}
                maxVisibleItems={5}
              />
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
                    modal.alert('E-mail inválido!\n\nO e-mail deve conter o caractere @', 'Erro de Validação', '❌')
                    return
                  }
                  
                  // Validação mais completa
                  if (email) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    if (!emailRegex.test(email)) {
                      modal.alert('E-mail inválido!\n\nFormato esperado: exemplo@dominio.com.br', 'Erro de Validação', '❌')
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
                      modal.alert(`CPF inválido!\n\n${validacao.error}`, 'Erro de Validação', '❌')
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
            🚪 Retornar
          </button>
        </div>
      </div>
    </BasePage>
    <modal.ModalComponent />
    </>
  )
}

