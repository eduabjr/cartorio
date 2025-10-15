import { useState } from 'react'
import { DocumentIcon, CheckIcon, PrintIcon, SaveIcon, ArrowLeftIcon, SearchIcon, TrashIcon } from '../components/icons'

interface ProtocoloBaixaData {
  protocolo: string
  natureza: string
  dataEntrada: string
  complementoAto: string
  comparecente: string
  numeroDocumento: string
  telefone: string
  parteA: string
  parteB: string
  descricao: string
  responsavel: string
  previsaoEntrega: string
  horario: string
  tipo: string
  quantidade: number
  totalAtos: number
  outrosServicos: number
  total: number
  totalPago: number
  reciboNome: string
  contaReceber: string
  reciboNumero: string
  fichaBalcao: string
}

interface PagamentoData {
  deposito: { valor: number; vencimento: string }
}

export function ProtocoloBaixaPage() {
  const [activeTab, setActiveTab] = useState<'protocolo' | 'outros-servicos' | 'historico' | 'selo-digital' | 'imagens'>('protocolo')
  
  const [protocoloData, setProtocoloData] = useState<ProtocoloBaixaData>({
    protocolo: '876260',
    natureza: 'CERTIDÃO EM BREVE RELATÓRIO',
    dataEntrada: '06/09/2025',
    complementoAto: 'Nascimento',
    comparecente: '',
    numeroDocumento: '',
    telefone: '',
    parteA: 'CIBELE SALLES DE OLIVEIRA',
    parteB: '',
    descricao: 'Certidão de Nascimento registrado no Livro: 36, Folha(s): 255, sob n°: 26223, em 09/02/1970',
    responsavel: '185 LAURA MARSI MARTINS',
    previsaoEntrega: '11/09/2025',
    horario: '15:00',
    tipo: 'Pago',
    quantidade: 1,
    totalAtos: 67.52,
    outrosServicos: 0.00,
    total: 67.52,
    totalPago: 0.00,
    reciboNome: 'CIBELE SALLES DE OLIVEIRA',
    contaReceber: '',
    reciboNumero: '679703',
    fichaBalcao: '2626'
  })

  const [pagamentoData, setPagamentoData] = useState<PagamentoData>({
    deposito: { valor: 67.52, vencimento: '06/09/2025' }
  })

  const handleInputChange = (field: keyof ProtocoloBaixaData, value: string | number) => {
    setProtocoloData(prev => ({ ...prev, [field]: value }))
  }

  const handlePagamentoChange = (field: keyof PagamentoData, subField: 'valor' | 'vencimento', value: string | number) => {
    setPagamentoData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subField]: subField === 'valor' ? (typeof value === 'number' ? value : parseFloat(value.toString()) || 0) : value
      }
    }))
  }


  const handleGravar = () => {
    console.log('Gravando protocolo de baixa...')
    alert('Protocolo de Baixa gravado com sucesso!')
  }

  const handleLimpar = () => {
    setProtocoloData({
      protocolo: '',
      natureza: '',
      dataEntrada: '',
      complementoAto: '',
      comparecente: '',
      numeroDocumento: '',
      telefone: '',
      parteA: '',
      parteB: '',
      descricao: '',
      responsavel: '',
      previsaoEntrega: '',
      horario: '',
      tipo: 'Pago',
      quantidade: 1,
      totalAtos: 0,
      outrosServicos: 0,
      total: 0,
      totalPago: 0,
      reciboNome: '',
      contaReceber: '',
      reciboNumero: '',
      fichaBalcao: ''
    })
    setPagamentoData({
      deposito: { valor: 0, vencimento: '' }
    })
  }

  const handleImprimir = () => {
    console.log('Imprimindo protocolo de baixa...')
    window.print()
  }

  const handleRecibo = () => {
    console.log('Gerando recibo...')
    alert('Recibo gerado com sucesso!')
  }

  const handleFechar = () => {
    console.log('Fechando protocolo de baixa...')
    window.history.back()
  }

  const handleMudarStatus = () => {
    console.log('Mudando status do protocolo...')
    alert('Status do protocolo alterado!')
  }

  const renderProtocoloTab = () => (
    <div className="space-y-6">
      {/* Detalhes do Protocolo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número do Protocolo</label>
          <div className="flex">
            <input
              type="text"
              value={protocoloData.protocolo}
              onChange={(e) => handleInputChange('protocolo', e.target.value)}
              className="input flex-1"
            />
            <button type="button" className="ml-2 p-2 text-gray-500 hover:text-primary-600">
              <SearchIcon size={16} />
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo - Natureza do Ato</label>
          <select
            value={protocoloData.natureza}
            onChange={(e) => handleInputChange('natureza', e.target.value)}
            className="input"
          >
            <option value="CERTIDÃO EM BREVE RELATÓRIO">CERTIDÃO EM BREVE RELATÓRIO</option>
            <option value="CERTIDÃO DE NASCIMENTO">CERTIDÃO DE NASCIMENTO</option>
            <option value="CERTIDÃO DE CASAMENTO">CERTIDÃO DE CASAMENTO</option>
            <option value="CERTIDÃO DE ÓBITO">CERTIDÃO DE ÓBITO</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entrada</label>
            <input
              type="text"
              value={protocoloData.dataEntrada}
              onChange={(e) => handleInputChange('dataEntrada', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Compl.</label>
            <select
              value={protocoloData.complementoAto}
              onChange={(e) => handleInputChange('complementoAto', e.target.value)}
              className="input"
            >
              <option value="Nascimento">Nascimento</option>
              <option value="Casamento">Casamento</option>
              <option value="Óbito">Óbito</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comparecente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Comparecente / Doc / Fone</label>
        <div className="flex">
          <input
            type="text"
            value={protocoloData.comparecente}
            onChange={(e) => handleInputChange('comparecente', e.target.value)}
            className="input flex-1"
          />
          <button type="button" className="ml-2 p-2 text-gray-500 hover:text-primary-600">
            <SearchIcon size={16} />
          </button>
          <select
            value={protocoloData.numeroDocumento}
            onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
            className="ml-2 input"
          >
            <option value="">Selecione...</option>
            <option value="CPF">CPF</option>
            <option value="RG">RG</option>
            <option value="CNH">CNH</option>
          </select>
        </div>
      </div>

      {/* Parte A e Parte B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parte A</label>
          <div className="flex">
            <input
              type="text"
              value={protocoloData.parteA}
              onChange={(e) => handleInputChange('parteA', e.target.value)}
              className="input flex-1"
            />
            <button type="button" className="ml-2 p-2 text-gray-500 hover:text-primary-600">
              <SearchIcon size={16} />
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parte B</label>
          <div className="flex">
            <input
              type="text"
              value={protocoloData.parteB}
              onChange={(e) => handleInputChange('parteB', e.target.value)}
              className="input flex-1"
            />
            <button type="button" className="ml-2 p-2 text-gray-500 hover:text-primary-600">
              <SearchIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Descrição - Histórico */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição - Histórico</label>
        <textarea
          value={protocoloData.descricao}
          onChange={(e) => handleInputChange('descricao', e.target.value)}
          className="input"
          rows={4}
        />
      </div>

      {/* Responsável e Previsão */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsável (Funcionário)</label>
          <div className="flex">
            <input
              type="text"
              value={protocoloData.responsavel}
              onChange={(e) => handleInputChange('responsavel', e.target.value)}
              className="input flex-1"
            />
            <button type="button" className="ml-2 p-2 text-gray-500 hover:text-primary-600">
              <SearchIcon size={16} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Previsão de Entrega</label>
            <input
              type="text"
              value={protocoloData.previsaoEntrega}
              onChange={(e) => handleInputChange('previsaoEntrega', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">às</label>
            <input
              type="text"
              value={protocoloData.horario}
              onChange={(e) => handleInputChange('horario', e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Quantidades e Valores & Forma de Pagamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quantidades e Valores */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quantidades e Valores</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo (gratuidade)</label>
              <select
                value={protocoloData.tipo}
                onChange={(e) => handleInputChange('tipo', e.target.value)}
                className="input"
              >
                <option value="Pago">Pago</option>
                <option value="Gratuito">Gratuito</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
              <input
                type="number"
                value={protocoloData.quantidade}
                onChange={(e) => handleInputChange('quantidade', parseInt(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total de Atos (R$)</label>
              <input
                type="number"
                step="0.01"
                value={protocoloData.totalAtos}
                onChange={(e) => handleInputChange('totalAtos', parseFloat(e.target.value) || 0)}
                className="input bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Outros Serviços (R$)</label>
              <input
                type="number"
                step="0.01"
                value={protocoloData.outrosServicos}
                onChange={(e) => handleInputChange('outrosServicos', parseFloat(e.target.value) || 0)}
                className="input bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TOTAL (R$)</label>
              <input
                type="number"
                step="0.01"
                value={protocoloData.total}
                onChange={(e) => handleInputChange('total', parseFloat(e.target.value) || 0)}
                className="input bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Pago (R$)</label>
              <input
                type="number"
                step="0.01"
                value={protocoloData.totalPago}
                onChange={(e) => handleInputChange('totalPago', parseFloat(e.target.value) || 0)}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Forma de Pagamento */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Forma de Pagamento</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm font-medium text-gray-700">
              <div>Valor</div>
              <div>Vencimento</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.01"
                value={pagamentoData.deposito.valor}
                onChange={(e) => handlePagamentoChange('deposito', 'valor', e.target.value)}
                className="input"
              />
              <input
                type="text"
                value={pagamentoData.deposito.vencimento}
                onChange={(e) => handlePagamentoChange('deposito', 'vencimento', e.target.value)}
                className="input"
              />
            </div>
            {/* Elementos marcados em vermelho foram removidos: Assinatura, 1ª Parcela, 2ª Parcela, 3ª Parcela */}
          </div>
        </div>
      </div>

      {/* Recibo */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recibo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recibo - Em nome de:</label>
            <input
              type="text"
              value={protocoloData.reciboNome}
              onChange={(e) => handleInputChange('reciboNome', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conta a Receber - Marcar para:</label>
            <input
              type="text"
              value={protocoloData.contaReceber}
              onChange={(e) => handleInputChange('contaReceber', e.target.value)}
              className="input"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <div className="flex">
              <input
                type="text"
                value={protocoloData.reciboNumero}
                onChange={(e) => handleInputChange('reciboNumero', e.target.value)}
                className="input flex-1"
              />
              <button type="button" className="ml-2 p-2 text-gray-500 hover:text-primary-600">
                <SearchIcon size={16} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ficha Balcão</label>
            <input
              type="text"
              value={protocoloData.fichaBalcao}
              onChange={(e) => handleInputChange('fichaBalcao', e.target.value)}
              className="input"
            />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">Certidão de Nascimento - Processo: 570542</p>
      </div>
    </div>
  )

  const renderOutrosServicosTab = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Outros Serviços</h3>
      <p className="text-gray-600">Funcionalidade de outros serviços será implementada em breve.</p>
    </div>
  )

  const renderHistoricoTab = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Histórico</h3>
      <p className="text-gray-600">Funcionalidade de histórico será implementada em breve.</p>
    </div>
  )

  const renderSeloDigitalTab = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Selo Digital</h3>
      <p className="text-gray-600">Funcionalidade de selo digital será implementada em breve.</p>
    </div>
  )

  const renderImagensTab = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Imagens</h3>
      <p className="text-gray-600">Funcionalidade de imagens será implementada em breve.</p>
    </div>
  )

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <DocumentIcon size={24} className="text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                Controle de Protocolo de Serviços - Baixa
              </h2>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('protocolo')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'protocolo'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Protocolo
            </button>
            <button
              onClick={() => setActiveTab('outros-servicos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'outros-servicos'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Outros Serviços
            </button>
            <button
              onClick={() => setActiveTab('historico')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'historico'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Histórico
            </button>
            <button
              onClick={() => setActiveTab('selo-digital')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'selo-digital'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Selo Digital
            </button>
            <button
              onClick={() => setActiveTab('imagens')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'imagens'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Imagens
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'protocolo' && renderProtocoloTab()}
          {activeTab === 'outros-servicos' && renderOutrosServicosTab()}
          {activeTab === 'historico' && renderHistoricoTab()}
          {activeTab === 'selo-digital' && renderSeloDigitalTab()}
          {activeTab === 'imagens' && renderImagensTab()}
        </div>

        {/* Bottom Action Bar */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          {/* Botão marcado em vermelho foi removido */}
          <button
            onClick={handleGravar}
            className="btn btn-primary flex items-center space-x-2"
          >
            <SaveIcon size={16} />
            <span>Gravar</span>
          </button>
          <button
            onClick={handleLimpar}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <TrashIcon size={16} />
            <span>Limpar</span>
          </button>
          <button
            onClick={handleImprimir}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <PrintIcon size={16} />
            <span>Imprimir</span>
          </button>
          <button
            onClick={handleRecibo}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <DocumentIcon size={16} />
            <span>Recibo</span>
          </button>
          <button
            onClick={handleFechar}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <ArrowLeftIcon size={16} />
            <span>Fechar</span>
          </button>
          <button
            onClick={handleMudarStatus}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <CheckIcon size={16} />
            <span>Mudar status</span>
          </button>
        </div>
      </div>
    </div>
  )
}
