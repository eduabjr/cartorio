/**
 * ====================================================================
 * LANÇAMENTO DE PROTOCOLOS - SISTEMA DE GESTÃO DE PROTOCOLOS
 * ====================================================================
 * 
 * DESCRIÇÃO GERAL:
 * ----------------
 * Este módulo gerencia o lançamento e controle de protocolos do cartório,
 * incluindo cadastro, serviços, histórico, digitalização e imagens.
 * 
 * ESTRUTURA DE 5 ABAS:
 * --------------------
 * 1. CADASTRO/MANUTENÇÃO:
 *    - Dados principais do protocolo (número, data, termo, livro, folhas)
 *    - Informações das partes envolvidas (Comparecente, Parte A, Parte B)
 *    - Descrição e histórico do protocolo
 *    - Atendente e previsão de entrega
 * 
 * 2. SERVIÇOS:
 *    - Cadastro de atos (natureza, tipo, quantidade)
 *    - Outros serviços (autenticação, xerox, reconhecimento de firma)
 *    - Cálculo de custas e valores
 * 
 * 3. HISTÓRICO:
 *    - Histórico de alterações e movimentações do protocolo
 * 
 * 4. DIGITALIZAÇÃO:
 *    - Interface para digitalização de documentos
 *    - Controles de scanner
 * 
 * 5. IMAGENS:
 *    - Visualização de documentos digitalizados
 *    - Lista de imagens por tipo de ato e documento
 * 
 * FUNCIONALIDADES:
 * ----------------
 * - Auto-incremento de número de protocolo
 * - Busca de clientes e partes
 * - Cálculo automático de custas
 * - Controle de pagamentos (depósito, assinatura, parcelas)
 * - Impressão de documentos
 * - Scanner e digitalização integrados
 * 
 * PERSISTÊNCIA:
 * -------------
 * - Dados salvos em localStorage
 * - Sincronização entre abas
 * 
 * ====================================================================
 */

import { useState, useEffect } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { Modal } from '../components/Modal'
import { useModal } from '../hooks/useModal'
import { naturezaService, Natureza } from '../services/NaturezaService'

/**
 * PROPS DO COMPONENTE
 */
interface ProtocoloLancamentoPageProps {
  onClose: () => void
}

/**
 * INTERFACE: Protocolo
 * --------------------
 * Define a estrutura de um protocolo
 */
interface Protocolo {
  id: string
  numero: string
  dataEntrada: string
  fichaBalcao: string
  termo: string
  livro: string
  folhas: string
  natureza: string
  complementoAto: string
  comparecente: string
  numeroDocumento: string
  telefone: string
  parteA: string
  parteB: string
  descricao: string
  atendente: string
  atendenteNome: string
  previsaoEntrega: string
  horario: string
  origemPedido: string
}

/**
 * INTERFACE: Ato
 * --------------
 * Define um ato cadastrado no protocolo
 */
interface Ato {
  id: string
  natureza: string
  tipoGratuidade: string
  quantidade: string
  analfabetos: string
  servicoExterno: boolean
  descontoTerco: boolean
  total: string
}

/**
 * INTERFACE: OutroServico
 * -----------------------
 * Define outros serviços prestados
 */
interface OutroServico {
  id: string
  quantidade: string
  descricao: string
  valor: string
}

/**
 * INTERFACE: Pagamento
 * --------------------
 * Define informações de pagamento
 */
interface Pagamento {
  deposito: { valor: string; data: string; pago: boolean }
  assinatura: { valor: string; data: string; pago: boolean }
  parcela1: { valor: string; data: string; pago: boolean }
  parcela2: { valor: string; data: string; pago: boolean }
  parcela3: { valor: string; data: string; pago: boolean }
}

/**
 * INTERFACE: ImagemDigitalizada
 * ------------------------------
 * Define uma imagem digitalizada vinculada ao protocolo
 */
interface ImagemDigitalizada {
  id: string
  sequencia: string
  tipoAto: string
  tipoDocumento: string
  arquivo: string
  dataDigitalizacao: string
}

export function ProtocoloLancamentoPage({ onClose }: ProtocoloLancamentoPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'

  // Hook para modais internos
  const { modalState, showAlert, showConfirm, showPrompt, closeModal } = useModal()

  // Estado para controlar aba ativa
  const [activeTab, setActiveTab] = useState<'cadastro' | 'servicos' | 'historico' | 'digitalizacao' | 'imagens'>('cadastro')
  
  // Estado para campo em foco
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Estados para Cadastro/Manutenção
  const [formData, setFormData] = useState<Protocolo>({
    id: '',
    numero: '',
    dataEntrada: new Date().toLocaleDateString('pt-BR'),
    fichaBalcao: '0',
    termo: '',
    livro: '',
    folhas: '',
    natureza: '',
    complementoAto: '',
    comparecente: '',
    numeroDocumento: '',
    telefone: '',
    parteA: '',
    parteB: '',
    descricao: '',
    atendente: '103',
    atendenteNome: 'EDUARDO ANTONIO BRAGA JUNIOR',
    previsaoEntrega: '',
    horario: ':',
    origemPedido: ''
  })

  // Estados para Serviços
  const [naturezas, setNaturezas] = useState<Natureza[]>([])
  const [atos, setAtos] = useState<Ato[]>([])
  const [atoForm, setAtoForm] = useState<Ato>({
    id: '',
    natureza: '',
    tipoGratuidade: 'Pago',
    quantidade: '1',
    analfabetos: '0',
    servicoExterno: false,
    descontoTerco: false,
    total: '0,00'
  })
  const [selectedAtoId, setSelectedAtoId] = useState<string | null>(null)
  
  // Carregar naturezas do localStorage
  useEffect(() => {
    const carregarNaturezas = async () => {
      try {
        const lista = await naturezaService.listar()
        console.log('📋 Naturezas carregadas para protocolo:', lista)
        setNaturezas(lista.filter(n => n.ativo !== false))
        
        // Se tiver naturezas, selecionar a primeira
        if (lista.length > 0 && !atoForm.natureza) {
          setAtoForm(prev => ({ ...prev, natureza: lista[0].descricao }))
        }
      } catch (error) {
        console.error('❌ Erro ao carregar naturezas:', error)
      }
    }
    
    carregarNaturezas()
    
    // Escutar mudanças nas naturezas
    const handleStorageChange = () => {
      carregarNaturezas()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('naturezas-atualizadas', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('naturezas-atualizadas', handleStorageChange)
    }
  }, [])
  

  const [outrosServicos, setOutrosServicos] = useState<OutroServico[]>([
    { id: '1', quantidade: '0', descricao: 'AUTENTICAÇÃO', valor: '0,00' },
    { id: '2', quantidade: '0', descricao: 'XEROX', valor: '0,00' },
    { id: '3', quantidade: '0', descricao: 'RECONHECIMENTO DE FIRMA COM VALOR', valor: '0,00' },
    { id: '4', quantidade: '0', descricao: 'RECONHECIMENTO DE FIRMA SEM VALOR', valor: '0,00' },
    { id: '5', quantidade: '0', descricao: 'RECONHECIMENTO DE FIRMA AUTÊNTICA', valor: '0,00' }
  ])
  const [servicoForm, setServicoForm] = useState({ quantidade: '', descricao: '', valor: '' })
  const [selectedServicoId, setSelectedServicoId] = useState<string | null>(null)

  const [custas, setCustas] = useState({
    tipo: 'Pago',
    quantidade: '0',
    analfabetos: '0',
    totalAtos: '0',
    outrosServicos: '0',
    total: '',
    totalPago: '0,00'
  })

  const [pagamento, setPagamento] = useState<Pagamento>({
    deposito: { valor: '', data: '', pago: false },
    assinatura: { valor: '', data: '', pago: false },
    parcela1: { valor: '', data: '', pago: false },
    parcela2: { valor: '', data: '', pago: false },
    parcela3: { valor: '', data: '', pago: false }
  })

  // Estados para Imagens
  const [imagens, setImagens] = useState<ImagemDigitalizada[]>([])
  const [selectedImagemId, setSelectedImagemId] = useState<string | null>(null)

  /**
   * ====================================================================
   * FUNÇÕES DA ABA CADASTRO/MANUTENÇÃO
   * ====================================================================
   */

  /**
   * FUNÇÃO: handleGravarProtocolo
   * ------------------------------
   * Grava um novo protocolo ou atualiza um existente.
   */
  const handleGravarProtocolo = async () => {
    // Validação de campos obrigatórios
    if (!formData.numero || !formData.dataEntrada) {
      await showAlert('⚠️ Preencha os campos obrigatórios: Protocolo e Data Entrada!')
      return
    }

    // Salvar protocolo (implementação futura com backend)
    console.log('💾 Protocolo salvo:', formData)
    await showAlert(`✅ Protocolo gravado com sucesso!\n\nNúmero: ${formData.numero}`)
  }

  /**
   * FUNÇÃO: handleLimpar
   * --------------------
   * Limpa o formulário de cadastro.
   */
  const handleLimpar = () => {
    setFormData({
      ...formData,
      numero: '',
      termo: '',
      livro: '',
      folhas: '',
      natureza: '',
      complementoAto: '',
      comparecente: '',
      numeroDocumento: '',
      telefone: '',
      parteA: '',
      parteB: '',
      descricao: ''
    })
  }

  /**
   * ====================================================================
   * FUNÇÕES DA ABA SERVIÇOS
   * ====================================================================
   */

  /**
   * FUNÇÃO: handleCalcularAto
   * -------------------------
   * Calcula o valor total do ato baseado na natureza e quantidade.
   */
  const handleCalcularAto = () => {
    // Lógica de cálculo (valores fictícios)
    const valor = parseFloat(atoForm.quantidade) * 67.52
    setAtoForm({ ...atoForm, total: valor.toFixed(2).replace('.', ',') })
  }

  /**
   * FUNÇÃO: handleGravarAto
   * -----------------------
   * Grava um ato no protocolo.
   */
  const handleGravarAto = async () => {
    if (!atoForm.natureza) {
      await showAlert('⚠️ Selecione a natureza do ato!')
      return
    }

    const novoAto: Ato = {
      ...atoForm,
      id: Date.now().toString()
    }

    setAtos([...atos, novoAto])
    await showAlert('✅ Ato gravado com sucesso!')
    
    // Reset formulário
    setAtoForm({
      id: '',
      natureza: naturezas.length > 0 ? naturezas[0].descricao : '',
      tipoGratuidade: 'Pago',
      quantidade: '1',
      analfabetos: '0',
      servicoExterno: false,
      descontoTerco: false,
      total: '0,00'
    })
  }

  /**
   * FUNÇÃO: handleExcluirAto
   * ------------------------
   * Exclui um ato selecionado.
   */
  const handleExcluirAto = async () => {
    if (!selectedAtoId) {
      await showAlert('⚠️ Selecione um ato para excluir!')
      return
    }

    const confirmado = await showConfirm('Tem certeza que deseja excluir este ato?')
    if (confirmado) {
      setAtos(atos.filter(a => a.id !== selectedAtoId))
      setSelectedAtoId(null)
      await showAlert('✅ Ato excluído com sucesso!')
    }
  }

  /**
   * ====================================================================
   * ESTILOS DO COMPONENTE
   * ====================================================================
   */

  const focusColor = currentTheme === 'dark' ? '#ffd4a3' : '#ffedd5'
  const focusTextColor = currentTheme === 'dark' ? '#1a1a1a' : '#000000'

  const getInputStyles = (fieldName: string) => ({
    width: '100%',
    padding: '4px 8px',
    fontSize: '11px',
    border: `1px solid ${focusedField === fieldName ? focusColor : theme.border}`,
    borderRadius: '3px',
    backgroundColor: focusedField === fieldName ? focusColor : theme.inputBackground || theme.background,
    color: focusedField === fieldName ? focusTextColor : theme.text,
    outline: 'none',
    height: '24px',
    transition: 'all 0.2s ease'
  })

  const labelStyles = {
    fontSize: '10px',
    fontWeight: '600' as const,
    marginBottom: '2px',
    color: theme.text,
    display: 'block'
  }

  const buttonStyles = {
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: '600' as const,
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '80px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }

  const tabStyles = (isActive: boolean) => ({
    flex: 1,
    padding: '10px',
    fontSize: '11px',
    fontWeight: '600' as const,
    border: 'none',
    borderBottom: isActive ? `3px solid ${headerColor}` : '3px solid transparent',
    backgroundColor: isActive ? (currentTheme === 'dark' ? '#2a2a2a' : '#f0f0f0') : 'transparent',
    color: isActive ? headerColor : theme.text,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none'
  })

  return (
    <BasePage
      title="Lançamento de Protocolos"
      onClose={onClose}
      width="1200px"
      height="700px"
      headerColor={headerColor}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Navegação por abas */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${theme.border}`,
          backgroundColor: theme.surface
        }}>
          <button
            onClick={() => setActiveTab('cadastro')}
            style={tabStyles(activeTab === 'cadastro')}
          >
            📝 Cadastro / Manutenção
          </button>
          <button
            onClick={() => setActiveTab('servicos')}
            style={tabStyles(activeTab === 'servicos')}
          >
            💼 Serviços
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            style={tabStyles(activeTab === 'historico')}
          >
            📋 Histórico
          </button>
          <button
            onClick={() => setActiveTab('digitalizacao')}
            style={tabStyles(activeTab === 'digitalizacao')}
          >
            📄 Digitalização
          </button>
          <button
            onClick={() => setActiveTab('imagens')}
            style={tabStyles(activeTab === 'imagens')}
          >
            🖼️ Imagens
          </button>
        </div>

        {/* Conteúdo da aba ativa */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
          {/* ABA 1: CADASTRO/MANUTENÇÃO */}
          {activeTab === 'cadastro' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Linha 1: Protocolo, Data Entrada, Ficha Balcão, Livro, Folha(s), Termo */}
              <div style={{ display: 'grid', gridTemplateColumns: '200px 180px 120px 120px 120px 120px', gap: '12px' }}>
                <div>
                  <label style={labelStyles}>Protocolo *</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="text"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      onFocus={() => setFocusedField('numero')}
                      onBlur={() => setFocusedField(null)}
                      style={getInputStyles('numero')}
                    />
                    <button style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>🔍</button>
                  </div>
                </div>
                <div>
                  <label style={labelStyles}>Data Entrada *</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="text"
                      value={formData.dataEntrada}
                      onChange={(e) => setFormData({ ...formData, dataEntrada: e.target.value })}
                      onFocus={() => setFocusedField('dataEntrada')}
                      onBlur={() => setFocusedField(null)}
                      style={getInputStyles('dataEntrada')}
                    />
                    <button style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>🔍</button>
                  </div>
                </div>
                <div>
                  <label style={labelStyles}>Ficha Balcão</label>
                  <input
                    type="text"
                    value={formData.fichaBalcao}
                    onChange={(e) => setFormData({ ...formData, fichaBalcao: e.target.value })}
                    onFocus={() => setFocusedField('fichaBalcao')}
                    onBlur={() => setFocusedField(null)}
                    style={getInputStyles('fichaBalcao')}
                  />
                </div>
                <div>
                  <label style={labelStyles}>Livro</label>
                  <input
                    type="text"
                    value={formData.livro}
                    onChange={(e) => setFormData({ ...formData, livro: e.target.value })}
                    onFocus={() => setFocusedField('livro')}
                    onBlur={() => setFocusedField(null)}
                    style={getInputStyles('livro')}
                  />
                </div>
                <div>
                  <label style={labelStyles}>Folha(s)</label>
                  <input
                    type="text"
                    value={formData.folhas}
                    onChange={(e) => setFormData({ ...formData, folhas: e.target.value })}
                    onFocus={() => setFocusedField('folhas')}
                    onBlur={() => setFocusedField(null)}
                    style={getInputStyles('folhas')}
                  />
                </div>
                <div>
                  <label style={labelStyles}>Termo</label>
                  <input
                    type="text"
                    value={formData.termo}
                    onChange={(e) => setFormData({ ...formData, termo: e.target.value })}
                    onFocus={() => setFocusedField('termo')}
                    onBlur={() => setFocusedField(null)}
                    style={getInputStyles('termo')}
                  />
                </div>
              </div>

              {/* Linha 2: Natureza, Complemento do Ato */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyles}>Natureza *</label>
                  <select
                    value={formData.natureza}
                    onChange={(e) => setFormData({ ...formData, natureza: e.target.value })}
                    onFocus={() => setFocusedField('natureza')}
                    onBlur={() => setFocusedField(null)}
                    style={{ 
                      ...getInputStyles('natureza'), 
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Selecione uma natureza...</option>
                    {naturezas.map(nat => (
                      <option key={nat.id} value={nat.descricao}>
                        {nat.codigo} - {nat.descricao}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyles}>Complemento do Ato</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="text"
                      value={formData.complementoAto}
                      onChange={(e) => setFormData({ ...formData, complementoAto: e.target.value })}
                      onFocus={() => setFocusedField('complementoAto')}
                      onBlur={() => setFocusedField(null)}
                      style={getInputStyles('complementoAto')}
                    />
                    <button style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>▼</button>
                  </div>
                </div>
              </div>

              {/* Linha 4: Comparecente, Número Documento, Telefone */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyles}>Comparecente</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="text"
                      value={formData.comparecente}
                      onChange={(e) => setFormData({ ...formData, comparecente: e.target.value })}
                      onFocus={() => setFocusedField('comparecente')}
                      onBlur={() => setFocusedField(null)}
                      style={getInputStyles('comparecente')}
                    />
                    <button style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>🔍</button>
                  </div>
                </div>
                <div>
                  <label style={labelStyles}>Número Documento</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="text"
                      value={formData.numeroDocumento}
                      onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                      onFocus={() => setFocusedField('numeroDocumento')}
                      onBlur={() => setFocusedField(null)}
                      style={getInputStyles('numeroDocumento')}
                    />
                    <button style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>▼</button>
                    <button style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>🔍</button>
                  </div>
                </div>
                <div>
                  <label style={labelStyles}>Telefone</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="text"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      onFocus={() => setFocusedField('telefone')}
                      onBlur={() => setFocusedField(null)}
                      style={getInputStyles('telefone')}
                    />
                    <button style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>...</button>
                  </div>
                </div>
              </div>

              {/* Linha 5: Parte A e Parte B (lado a lado) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyles}>Parte A</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <textarea
                      value={formData.parteA}
                      onChange={(e) => setFormData({ ...formData, parteA: e.target.value })}
                      onFocus={() => setFocusedField('parteA')}
                      onBlur={() => setFocusedField(null)}
                      style={{
                        ...getInputStyles('parteA'),
                        height: '80px',
                        resize: 'vertical' as const,
                        fontFamily: 'inherit'
                      }}
                    />
                    <button style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer', height: '24px' }}>🔍</button>
                  </div>
                </div>
                <div>
                  <label style={labelStyles}>Parte B</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <textarea
                      value={formData.parteB}
                      onChange={(e) => setFormData({ ...formData, parteB: e.target.value })}
                      onFocus={() => setFocusedField('parteB')}
                      onBlur={() => setFocusedField(null)}
                      style={{
                        ...getInputStyles('parteB'),
                        height: '80px',
                        resize: 'vertical' as const,
                        fontFamily: 'inherit'
                      }}
                    />
                    <button style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer', height: '24px' }}>🔍</button>
                  </div>
                </div>
              </div>

              {/* Linha 6: Descrição - Histórico */}
              <div>
                <label style={labelStyles}>Descrição - Histórico</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  onFocus={() => setFocusedField('descricao')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...getInputStyles('descricao'),
                    height: '120px',
                    resize: 'vertical' as const,
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Linha 7: Atendente, Previsão Entrega, Horário, Origem */}
              <div style={{ display: 'grid', gridTemplateColumns: '300px 150px 100px 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyles}>Atendente</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="text"
                      value={formData.atendente}
                      onChange={(e) => setFormData({ ...formData, atendente: e.target.value })}
                      style={{ ...getInputStyles('atendente'), width: '50px' }}
                    />
                    <input
                      type="text"
                      value={formData.atendenteNome}
                      onChange={(e) => setFormData({ ...formData, atendenteNome: e.target.value })}
                      onFocus={() => setFocusedField('atendenteNome')}
                      onBlur={() => setFocusedField(null)}
                      style={{ ...getInputStyles('atendenteNome'), flex: 1 }}
                    />
                    <button style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>▼</button>
                  </div>
                </div>
                <div>
                  <label style={labelStyles}>Previsão de Entrega</label>
                  <input
                    type="text"
                    value={formData.previsaoEntrega}
                    onChange={(e) => setFormData({ ...formData, previsaoEntrega: e.target.value })}
                    onFocus={() => setFocusedField('previsaoEntrega')}
                    onBlur={() => setFocusedField(null)}
                    style={getInputStyles('previsaoEntrega')}
                  />
                </div>
                <div>
                  <label style={labelStyles}>Horário</label>
                  <input
                    type="text"
                    value={formData.horario}
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                    onFocus={() => setFocusedField('horario')}
                    onBlur={() => setFocusedField(null)}
                    style={getInputStyles('horario')}
                  />
                </div>
                <div>
                  <label style={labelStyles}>Origem do Pedido</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="text"
                      value={formData.origemPedido}
                      onChange={(e) => setFormData({ ...formData, origemPedido: e.target.value })}
                      onFocus={() => setFocusedField('origemPedido')}
                      onBlur={() => setFocusedField(null)}
                      style={getInputStyles('origemPedido')}
                    />
                    <button style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>▼</button>
                  </div>
                </div>
              </div>

              {/* Linha 8: Custas e Pagamento (lado a lado) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                {/* Custas */}
                <div style={{
                  padding: '12px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '4px',
                  backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#f9f9f9'
                }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 'bold', color: theme.text }}>Custas</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={labelStyles}>Tipo</label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input
                            type="text"
                            value={custas.tipo}
                            onChange={(e) => setCustas({ ...custas, tipo: e.target.value })}
                            style={getInputStyles('custaTipo')}
                          />
                          <button style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>▼</button>
                        </div>
                      </div>
                      <div>
                        <label style={labelStyles}>Quantidade</label>
                        <input
                          type="text"
                          value={custas.quantidade}
                          onChange={(e) => setCustas({ ...custas, quantidade: e.target.value })}
                          style={getInputStyles('custaQuantidade')}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={labelStyles}>Analfabetos</label>
                        <input
                          type="text"
                          value={custas.analfabetos}
                          onChange={(e) => setCustas({ ...custas, analfabetos: e.target.value })}
                          style={getInputStyles('custaAnalfabetos')}
                        />
                      </div>
                      <div>
                        <label style={labelStyles}>Total de Atos</label>
                        <input
                          type="text"
                          value={custas.totalAtos}
                          onChange={(e) => setCustas({ ...custas, totalAtos: e.target.value })}
                          style={getInputStyles('custaTotalAtos')}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={labelStyles}>Outros Serviços</label>
                        <input
                          type="text"
                          value={custas.outrosServicos}
                          onChange={(e) => setCustas({ ...custas, outrosServicos: e.target.value })}
                          style={getInputStyles('custaOutrosServicos')}
                        />
                      </div>
                      <div>
                        <label style={labelStyles}>Total</label>
                        <input
                          type="text"
                          value={custas.total}
                          onChange={(e) => setCustas({ ...custas, total: e.target.value })}
                          style={getInputStyles('custaTotal')}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyles}>Total Pago</label>
                      <input
                        type="text"
                        value={custas.totalPago}
                        onChange={(e) => setCustas({ ...custas, totalPago: e.target.value })}
                        style={getInputStyles('custaTotalPago')}
                      />
                    </div>
                  </div>
                </div>

                {/* Pagamento */}
                <div style={{
                  padding: '12px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '4px',
                  backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#f9f9f9'
                }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 'bold', color: theme.text }}>Pagamento</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 100px 40px', gap: '8px', alignItems: 'center' }}>
                    {/* Cabeçalhos */}
                    <div></div>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: theme.text }}>Valor (R$)</div>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: theme.text }}>Data</div>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: theme.text, textAlign: 'center' }}>Pago</div>

                    {/* Depósito */}
                    <label style={{ fontSize: '10px', color: theme.text }}>Depósito</label>
                    <input type="text" value={pagamento.deposito.valor} onChange={(e) => setPagamento({ ...pagamento, deposito: { ...pagamento.deposito, valor: e.target.value } })} style={{ ...getInputStyles('depositoValor'), height: '22px' }} />
                    <input type="text" value={pagamento.deposito.data} onChange={(e) => setPagamento({ ...pagamento, deposito: { ...pagamento.deposito, data: e.target.value } })} style={{ ...getInputStyles('depositoData'), height: '22px' }} />
                    <input type="checkbox" checked={pagamento.deposito.pago} onChange={(e) => setPagamento({ ...pagamento, deposito: { ...pagamento.deposito, pago: e.target.checked } })} />

                    {/* Assinatura */}
                    <label style={{ fontSize: '10px', color: theme.text }}>Assinatura</label>
                    <input type="text" value={pagamento.assinatura.valor} onChange={(e) => setPagamento({ ...pagamento, assinatura: { ...pagamento.assinatura, valor: e.target.value } })} style={{ ...getInputStyles('assinaturaValor'), height: '22px' }} />
                    <input type="text" value={pagamento.assinatura.data} onChange={(e) => setPagamento({ ...pagamento, assinatura: { ...pagamento.assinatura, data: e.target.value } })} style={{ ...getInputStyles('assinaturaData'), height: '22px' }} />
                    <input type="checkbox" checked={pagamento.assinatura.pago} onChange={(e) => setPagamento({ ...pagamento, assinatura: { ...pagamento.assinatura, pago: e.target.checked } })} />

                    {/* 1ª Parcela */}
                    <label style={{ fontSize: '10px', color: theme.text }}>1ª Parcela</label>
                    <input type="text" value={pagamento.parcela1.valor} onChange={(e) => setPagamento({ ...pagamento, parcela1: { ...pagamento.parcela1, valor: e.target.value } })} style={{ ...getInputStyles('parcela1Valor'), height: '22px' }} />
                    <input type="text" value={pagamento.parcela1.data} onChange={(e) => setPagamento({ ...pagamento, parcela1: { ...pagamento.parcela1, data: e.target.value } })} style={{ ...getInputStyles('parcela1Data'), height: '22px' }} />
                    <input type="checkbox" checked={pagamento.parcela1.pago} onChange={(e) => setPagamento({ ...pagamento, parcela1: { ...pagamento.parcela1, pago: e.target.checked } })} />

                    {/* 2ª Parcela */}
                    <label style={{ fontSize: '10px', color: theme.text }}>2ª Parcela</label>
                    <input type="text" value={pagamento.parcela2.valor} onChange={(e) => setPagamento({ ...pagamento, parcela2: { ...pagamento.parcela2, valor: e.target.value } })} style={{ ...getInputStyles('parcela2Valor'), height: '22px' }} />
                    <input type="text" value={pagamento.parcela2.data} onChange={(e) => setPagamento({ ...pagamento, parcela2: { ...pagamento.parcela2, data: e.target.value } })} style={{ ...getInputStyles('parcela2Data'), height: '22px' }} />
                    <input type="checkbox" checked={pagamento.parcela2.pago} onChange={(e) => setPagamento({ ...pagamento, parcela2: { ...pagamento.parcela2, pago: e.target.checked } })} />

                    {/* 3ª Parcela */}
                    <label style={{ fontSize: '10px', color: theme.text }}>3ª Parcela</label>
                    <input type="text" value={pagamento.parcela3.valor} onChange={(e) => setPagamento({ ...pagamento, parcela3: { ...pagamento.parcela3, valor: e.target.value } })} style={{ ...getInputStyles('parcela3Valor'), height: '22px' }} />
                    <input type="text" value={pagamento.parcela3.data} onChange={(e) => setPagamento({ ...pagamento, parcela3: { ...pagamento.parcela3, data: e.target.value } })} style={{ ...getInputStyles('parcela3Data'), height: '22px' }} />
                    <input type="checkbox" checked={pagamento.parcela3.pago} onChange={(e) => setPagamento({ ...pagamento, parcela3: { ...pagamento.parcela3, pago: e.target.checked } })} />
                  </div>
                  <div style={{ fontSize: '9px', color: theme.text, marginTop: '8px' }}>- Processo: 0</div>
                </div>
              </div>

              {/* Botões de ação */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px', paddingTop: '12px', borderTop: `1px solid ${theme.border}` }}>
                <button
                  onClick={handleCalcularAto}
                  style={{ ...buttonStyles, backgroundColor: '#3b82f6', color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                >
                  🧮 Calcular
                </button>
                <button
                  onClick={handleGravarProtocolo}
                  style={{ ...buttonStyles, backgroundColor: '#10b981', color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                >
                  💾 Gravar
                </button>
                <button
                  onClick={handleLimpar}
                  style={{ ...buttonStyles, backgroundColor: '#f59e0b', color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
                >
                  🗑️ Limpar
                </button>
                <button
                  onClick={() => console.log('Imprimir')}
                  style={{ ...buttonStyles, backgroundColor: '#6366f1', color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
                >
                  🖨️ Imprimir
                </button>
                <button
                  onClick={onClose}
                  style={{ ...buttonStyles, backgroundColor: '#6c757d', color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#495057'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                >
                  ↩️ Retornar
                </button>
              </div>
            </div>
          )}

          {/* ABA 2: SERVIÇOS */}
          {activeTab === 'servicos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              {/* Seção ATOS */}
              <div style={{
                flex: 1,
                display: 'flex',
                gap: '16px',
                padding: '12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '4px',
                backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#f9f9f9'
              }}>
                {/* Formulário de Atos (esquerda) */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: theme.text }}>ATOS</h3>
                  
                  <div>
                    <label style={labelStyles}>Natureza *</label>
                    <select
                      value={atoForm.natureza}
                      onChange={(e) => setAtoForm({ ...atoForm, natureza: e.target.value })}
                      style={{ 
                        ...getInputStyles('natureza'), 
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">Selecione uma natureza...</option>
                      {naturezas.map(nat => (
                        <option key={nat.id} value={nat.descricao}>
                          {nat.codigo} - {nat.descricao}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyles}>Tipo Gratuidade</label>
                    <select
                      value={atoForm.tipoGratuidade}
                      onChange={(e) => setAtoForm({ ...atoForm, tipoGratuidade: e.target.value })}
                      style={{ ...getInputStyles('tipoGratuidade'), cursor: 'pointer' }}
                    >
                      <option>Pago</option>
                      <option>Gratuito</option>
                      <option>Isento</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={labelStyles}>Quantidade</label>
                      <input
                        type="text"
                        value={atoForm.quantidade}
                        onChange={(e) => setAtoForm({ ...atoForm, quantidade: e.target.value })}
                        style={getInputStyles('quantidade')}
                      />
                    </div>
                    <div>
                      <label style={labelStyles}>Analfabetos (Procuração)</label>
                      <input
                        type="text"
                        value={atoForm.analfabetos}
                        onChange={(e) => setAtoForm({ ...atoForm, analfabetos: e.target.value })}
                        style={getInputStyles('analfabetos')}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: theme.text }}>
                      <input
                        type="checkbox"
                        checked={atoForm.servicoExterno}
                        onChange={(e) => setAtoForm({ ...atoForm, servicoExterno: e.target.checked })}
                      />
                      Serviço Externo?
                    </label>
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: theme.text }}>
                      <input
                        type="checkbox"
                        checked={atoForm.descontoTerco}
                        onChange={(e) => setAtoForm({ ...atoForm, descontoTerco: e.target.checked })}
                      />
                      Desconto de 1/3?
                    </label>
                  </div>

                  <div>
                    <label style={labelStyles}>Total</label>
                    <input
                      type="text"
                      value={atoForm.total}
                      readOnly
                      style={{ ...getInputStyles('total'), backgroundColor: currentTheme === 'dark' ? '#1a1a1a' : '#e5e5e5' }}
                    />
                  </div>

                  {/* Botões de ação para atos */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <button
                      onClick={handleCalcularAto}
                      style={{ ...buttonStyles, backgroundColor: '#3b82f6', color: 'white', flex: 1 }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                    >
                      🧮 Calcular
                    </button>
                    <button
                      onClick={() => setAtoForm({ id: '', natureza: naturezas.length > 0 ? naturezas[0].descricao : '', tipoGratuidade: 'Pago', quantidade: '1', analfabetos: '0', servicoExterno: false, descontoTerco: false, total: '0,00' })}
                      style={{ ...buttonStyles, backgroundColor: '#10b981', color: 'white', flex: 1 }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                    >
                      📄 Novo
                    </button>
                    <button
                      onClick={handleGravarAto}
                      style={{ ...buttonStyles, backgroundColor: '#f59e0b', color: 'white', flex: 1 }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
                    >
                      💾 Gravar
                    </button>
                    <button
                      onClick={handleExcluirAto}
                      style={{ ...buttonStyles, backgroundColor: '#dc2626', color: 'white', flex: 1 }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                    >
                      ❌ Excluir
                    </button>
                  </div>
                </div>

                {/* Lista de Atos (direita) */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 'bold', color: theme.text }}>Atos Cadastrados</h3>
                  <div style={{
                    flex: 1,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '4px',
                    overflow: 'auto',
                    backgroundColor: theme.background
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{
                          backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                          position: 'sticky',
                          top: 0
                        }}>
                          <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', fontWeight: 'bold', color: theme.text }}>Natureza</th>
                          <th style={{ padding: '8px', textAlign: 'right', fontSize: '10px', fontWeight: 'bold', color: theme.text, width: '100px' }}>Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {atos.length === 0 ? (
                          <tr>
                            <td colSpan={2} style={{ padding: '24px', textAlign: 'center', fontSize: '11px', color: theme.text, fontStyle: 'italic' }}>
                              Nenhum ato cadastrado
                            </td>
                          </tr>
                        ) : (
                          atos.map((ato) => (
                            <tr
                              key={ato.id}
                              onClick={() => setSelectedAtoId(ato.id)}
                              style={{
                                backgroundColor: selectedAtoId === ato.id ? (currentTheme === 'dark' ? '#3b82f6' : '#60a5fa') : 'transparent',
                                cursor: 'pointer',
                                borderBottom: `1px solid ${theme.border}`
                              }}
                            >
                              <td style={{ padding: '8px', fontSize: '11px', color: selectedAtoId === ato.id ? '#fff' : theme.text }}>{ato.natureza}</td>
                              <td style={{ padding: '8px', fontSize: '11px', textAlign: 'right', color: selectedAtoId === ato.id ? '#fff' : theme.text }}>{ato.total}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Seção OUTROS SERVIÇOS */}
              <div style={{
                flex: 1,
                padding: '12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '4px',
                backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#f9f9f9'
              }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 'bold', color: theme.text }}>OUTROS SERVIÇOS</h3>
                
                {/* Formulário de novo serviço */}
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 150px auto', gap: '8px', marginBottom: '12px' }}>
                  <div>
                    <label style={labelStyles}>Quantidade</label>
                    <input
                      type="text"
                      value={servicoForm.quantidade}
                      onChange={(e) => setServicoForm({ ...servicoForm, quantidade: e.target.value })}
                      style={getInputStyles('servicoQtd')}
                    />
                  </div>
                  <div>
                    <label style={labelStyles}>Descrição (Serviço)</label>
                    <input
                      type="text"
                      value={servicoForm.descricao}
                      onChange={(e) => setServicoForm({ ...servicoForm, descricao: e.target.value })}
                      style={getInputStyles('servicoDesc')}
                    />
                  </div>
                  <div>
                    <label style={labelStyles}>Valor (R$)</label>
                    <input
                      type="text"
                      value={servicoForm.valor}
                      onChange={(e) => setServicoForm({ ...servicoForm, valor: e.target.value })}
                      style={getInputStyles('servicoValor')}
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (servicoForm.descricao && servicoForm.quantidade) {
                        const novoServico: OutroServico = {
                          id: Date.now().toString(),
                          ...servicoForm
                        }
                        setOutrosServicos([...outrosServicos, novoServico])
                        setServicoForm({ quantidade: '', descricao: '', valor: '' })
                        await showAlert('✅ Serviço incluído com sucesso!')
                      } else {
                        await showAlert('⚠️ Preencha descrição e quantidade!')
                      }
                    }}
                    style={{ ...buttonStyles, backgroundColor: '#10b981', color: 'white', marginTop: '18px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                  >
                    ➕ Incluir
                  </button>
                </div>

                {/* Lista de outros serviços */}
                <div style={{
                  border: `1px solid ${theme.border}`,
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  backgroundColor: theme.background
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{
                        backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                        position: 'sticky',
                        top: 0
                      }}>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', fontWeight: 'bold', color: theme.text, width: '80px' }}>Qtde</th>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', fontWeight: 'bold', color: theme.text }}>Descrição</th>
                        <th style={{ padding: '8px', textAlign: 'right', fontSize: '10px', fontWeight: 'bold', color: theme.text, width: '100px' }}>Valor R$</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outrosServicos.map((servico) => (
                        <tr
                          key={servico.id}
                          onClick={() => setSelectedServicoId(servico.id)}
                          style={{
                            backgroundColor: selectedServicoId === servico.id ? (currentTheme === 'dark' ? '#3b82f6' : '#60a5fa') : 'transparent',
                            cursor: 'pointer',
                            borderBottom: `1px solid ${theme.border}`
                          }}
                        >
                          <td style={{ padding: '8px', fontSize: '11px', color: selectedServicoId === servico.id ? '#fff' : theme.text }}>{servico.quantidade}</td>
                          <td style={{ padding: '8px', fontSize: '11px', color: selectedServicoId === servico.id ? '#fff' : theme.text }}>{servico.descricao}</td>
                          <td style={{ padding: '8px', fontSize: '11px', textAlign: 'right', color: selectedServicoId === servico.id ? '#fff' : theme.text }}>{servico.valor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Botões para outros serviços */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    onClick={async () => {
                      if (selectedServicoId) {
                        const servico = outrosServicos.find(s => s.id === selectedServicoId)
                        if (servico) {
                          setServicoForm(servico)
                          await showAlert('✅ Serviço carregado para edição!')
                        }
                      } else {
                        await showAlert('⚠️ Selecione um serviço para editar!')
                      }
                    }}
                    style={{ ...buttonStyles, backgroundColor: '#f59e0b', color: 'white' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={async () => {
                      if (selectedServicoId) {
                        const confirmado = await showConfirm('Tem certeza que deseja excluir este serviço?')
                        if (confirmado) {
                          setOutrosServicos(outrosServicos.filter(s => s.id !== selectedServicoId))
                          setSelectedServicoId(null)
                          await showAlert('✅ Serviço excluído com sucesso!')
                        }
                      } else {
                        await showAlert('⚠️ Selecione um serviço para excluir!')
                      }
                    }}
                    style={{ ...buttonStyles, backgroundColor: '#dc2626', color: 'white' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  >
                    ❌ Excluir
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: HISTÓRICO */}
          {activeTab === 'historico' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '16px',
              border: `1px solid ${theme.border}`,
              borderRadius: '4px',
              backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#f9f9f9',
              height: '100%'
            }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: theme.text }}>Histórico de Movimentações</h3>
              <div style={{
                flex: 1,
                padding: '12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '4px',
                backgroundColor: theme.background,
                fontSize: '11px',
                color: theme.text,
                fontStyle: 'italic'
              }}>
                Nenhuma movimentação registrada
              </div>
            </div>
          )}

          {/* ABA 4: DIGITALIZAÇÃO */}
          {activeTab === 'digitalizacao' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              height: '100%',
              padding: '32px'
            }}>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
              }}>
                ins!ght
              </div>
              <div style={{ fontSize: '16px', color: theme.text }}>
                Tecnologia da Informática
              </div>
              
              {/* Botões de controle */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button style={{ ...buttonStyles, backgroundColor: '#3b82f6', color: 'white' }}>
                  ⬅️ Anterior
                </button>
                <button style={{ ...buttonStyles, backgroundColor: '#3b82f6', color: 'white' }}>
                  ➡️ Próxima
                </button>
                <button style={{ ...buttonStyles, backgroundColor: '#10b981', color: 'white' }}>
                  📥 Adquirir
                </button>
                <button style={{ ...buttonStyles, backgroundColor: '#06b6d4', color: 'white' }}>
                  🖨️ Scanner
                </button>
                <button style={{ ...buttonStyles, backgroundColor: '#dc2626', color: 'white' }}>
                  ❌ Excluir
                </button>
                <button style={{ ...buttonStyles, backgroundColor: '#6c757d', color: 'white' }}>
                  🖨️ Imprimir
                </button>
              </div>
            </div>
          )}

          {/* ABA 5: IMAGENS */}
          {activeTab === 'imagens' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: theme.text }}>Imagens Digitalizadas</h3>
              
              {/* Tabela de imagens */}
              <div style={{
                flex: 1,
                border: `1px solid ${theme.border}`,
                borderRadius: '4px',
                overflow: 'auto',
                backgroundColor: theme.background
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{
                      backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                      position: 'sticky',
                      top: 0
                    }}>
                      <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', fontWeight: 'bold', color: theme.text, width: '100px' }}>Sequência</th>
                      <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', fontWeight: 'bold', color: theme.text }}>Tipo do Ato</th>
                      <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', fontWeight: 'bold', color: theme.text }}>Tipo do Documento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {imagens.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ padding: '24px', textAlign: 'center', fontSize: '11px', color: theme.text, fontStyle: 'italic' }}>
                          Nenhuma imagem digitalizada
                        </td>
                      </tr>
                    ) : (
                      imagens.map((imagem) => (
                        <tr
                          key={imagem.id}
                          onClick={() => setSelectedImagemId(imagem.id)}
                          style={{
                            backgroundColor: selectedImagemId === imagem.id ? (currentTheme === 'dark' ? '#3b82f6' : '#60a5fa') : 'transparent',
                            cursor: 'pointer',
                            borderBottom: `1px solid ${theme.border}`
                          }}
                        >
                          <td style={{ padding: '8px', fontSize: '11px', color: selectedImagemId === imagem.id ? '#fff' : theme.text }}>{imagem.sequencia}</td>
                          <td style={{ padding: '8px', fontSize: '11px', color: selectedImagemId === imagem.id ? '#fff' : theme.text }}>{imagem.tipoAto}</td>
                          <td style={{ padding: '8px', fontSize: '11px', color: selectedImagemId === imagem.id ? '#fff' : theme.text }}>{imagem.tipoDocumento}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal interno */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        defaultValue={modalState.defaultValue}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.onCancel}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        icon={modalState.icon}
      />
    </BasePage>
  )
}
