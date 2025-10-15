import { useState } from 'react'
import { DocumentIcon, CheckIcon, PlusIcon, PrintIcon, SaveIcon, ArrowLeftIcon, CalculatorIcon, TrashIcon } from '../components/icons'

interface ProtocoloData {
  protocolo: string
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
  previsaoEntrega: string
  horario: string
  origemPedido: string
  tipo: string
  quantidade: number
  analfabetos: number
  totalAtos: number
  outrosServicos: number
  total: number
  totalPago: number
}

interface PagamentoData {
  deposito: { valor: number; data: string }
  assinatura: { valor: number; data: string }
  parcela1: { valor: number; data: string }
  parcela2: { valor: number; data: string }
  parcela3: { valor: number; data: string }
}

export function ProtocoloLancamentoPage() {
  const [activeTab, setActiveTab] = useState<'cadastro' | 'servicos' | 'historico' | 'digitalizacao'>('cadastro')
  
  const [protocoloData, setProtocoloData] = useState<ProtocoloData>({
    protocolo: '876260',
    dataEntrada: '06/09/2025',
    fichaBalcao: '2626',
    termo: '26223',
    livro: '38',
    folhas: '255',
    natureza: 'CERTIDÃO EM BREVE RELATÓRIO',
    complementoAto: 'Nascimento',
    comparecente: '',
    numeroDocumento: '',
    telefone: '',
    parteA: 'CIBELE SALLES DE OLIVEIRA',
    parteB: '',
    descricao: 'Certidão de Nascimento registrado no Livro: 38, Folha(s): 255, sob nº: 26223, em 09/02/1978',
    atendente: '185',
    previsaoEntrega: '11/09/2025',
    horario: '15:00',
    origemPedido: 'Pessoal',
    tipo: 'Pago',
    quantidade: 1,
    analfabetos: 0,
    totalAtos: 67.52,
    outrosServicos: 0.00,
    total: 67.52,
    totalPago: 0.00
  })

  const [pagamentoData, setPagamentoData] = useState<PagamentoData>({
    deposito: { valor: 67.52, data: '06/09/2025' },
    assinatura: { valor: 0.00, data: '' },
    parcela1: { valor: 0.00, data: '' },
    parcela2: { valor: 0.00, data: '' },
    parcela3: { valor: 0.00, data: '' }
  })

  const [servicosData, setServicosData] = useState({
    natureza: 'CERTIDÃO EM BREVE RELATÓRIO',
    tipoGratuidade: 'Pago',
    quantidade: 1,
    analfabetos: 0,
    total: 67.52
  })

  const [outrosServicos, setOutrosServicos] = useState({
    quantidade: '',
    descricao: '',
    valor: ''
  })

  const servicosLista = [
    { nome: 'AUTENTICAÇÃO', quantidade: 0, valor: 0.00 },
    { nome: 'XEROX', quantidade: 0, valor: 0.00 },
    { nome: 'RECONHECIMENTO DE FIRMA COM VALOR', quantidade: 0, valor: 0.00 },
    { nome: 'RECONHECIMENTO DE FIRMA SEM VALOR', quantidade: 0, valor: 0.00 },
    { nome: 'RECONHECIMENTO DE FIRMA AUTÊNTICA', quantidade: 0, valor: 0.00 }
  ]

  const handleInputChange = (field: keyof ProtocoloData, value: string | number) => {
    setProtocoloData(prev => ({ ...prev, [field]: value }))
  }

  const handleServicosChange = (field: keyof typeof servicosData, value: string | number) => {
    setServicosData(prev => ({ ...prev, [field]: value }))
  }

  const handleOutrosServicosChange = (field: keyof typeof outrosServicos, value: string) => {
    setOutrosServicos(prev => ({ ...prev, [field]: value }))
  }

  const handleCalcular = () => {
    // Lógica para calcular valores
    console.log('Calculando...')
  }

  const handleGravar = () => {
    // Lógica para salvar
    console.log('Salvando...')
  }

  const handleLimpar = () => {
    // Lógica para limpar formulário
    console.log('Limpando...')
  }

  const handleImprimir = () => {
    // Lógica para imprimir
    console.log('Imprimindo...')
  }

  const handleRetornar = () => {
    // Lógica para retornar
    console.log('Retornando...')
  }

  const renderCadastroManutencao = () => (
    <div className="space-y-6">
      {/* Identificação do Protocolo */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Identificação do Protocolo</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Protocolo</label>
            <div className="flex">
              <input
                type="text"
                value={protocoloData.protocolo}
                onChange={(e) => handleInputChange('protocolo', e.target.value)}
                className="input flex-1"
              />
              <button className="ml-2 p-2 text-gray-500 hover:text-primary-600">
                <DocumentIcon size={16} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Entrada</label>
            <div className="flex">
              <input
                type="text"
                value={protocoloData.dataEntrada}
                onChange={(e) => handleInputChange('dataEntrada', e.target.value)}
                className="input flex-1"
              />
              <button className="ml-2 p-2 text-gray-500 hover:text-primary-600">
                <DocumentIcon size={16} />
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Termo</label>
            <input
              type="text"
              value={protocoloData.termo}
              onChange={(e) => handleInputChange('termo', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Livro</label>
            <input
              type="text"
              value={protocoloData.livro}
              onChange={(e) => handleInputChange('livro', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Folha(s)</label>
            <input
              type="text"
              value={protocoloData.folhas}
              onChange={(e) => handleInputChange('folhas', e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Natureza e Informações Complementares */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Natureza e Informações Complementares</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Natureza</label>
            <input
              type="text"
              value={protocoloData.natureza}
              onChange={(e) => handleInputChange('natureza', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Complemento do Ato</label>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comparecente</label>
            <div className="flex">
              <input
                type="text"
                value={protocoloData.comparecente}
                onChange={(e) => handleInputChange('comparecente', e.target.value)}
                className="input flex-1"
              />
              <button className="ml-2 p-2 text-gray-500 hover:text-primary-600">
                <DocumentIcon size={16} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número Documento</label>
            <select
              value={protocoloData.numeroDocumento}
              onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
              className="input"
            >
              <option value="">Selecione...</option>
              <option value="CPF">CPF</option>
              <option value="RG">RG</option>
              <option value="CNH">CNH</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="text"
              value={protocoloData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Parte A e Parte B */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Partes Envolvidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parte A</label>
            <input
              type="text"
              value={protocoloData.parteA}
              onChange={(e) => handleInputChange('parteA', e.target.value)}
              className="input"
            />
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
              <button className="ml-2 p-2 text-gray-500 hover:text-primary-600">
                <DocumentIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Descrição - Histórico */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Descrição - Histórico</h3>
        <textarea
          value={protocoloData.descricao}
          onChange={(e) => handleInputChange('descricao', e.target.value)}
          className="input"
          rows={4}
        />
      </div>

      {/* Atendente e Informações de Entrega */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Atendente e Informações de Entrega</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Atendente</label>
            <div className="flex">
              <input
                type="text"
                value={protocoloData.atendente}
                onChange={(e) => handleInputChange('atendente', e.target.value)}
                className="input flex-1"
              />
              <select
                value="LAURA MARSI MARTINS"
                className="input ml-2"
              >
                <option value="LAURA MARSI MARTINS">LAURA MARSI MARTINS</option>
              </select>
            </div>
          </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
            <input
              type="text"
              value={protocoloData.horario}
              onChange={(e) => handleInputChange('horario', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origem do Pedido</label>
            <select
              value={protocoloData.origemPedido}
              onChange={(e) => handleInputChange('origemPedido', e.target.value)}
              className="input"
            >
              <option value="Pessoal">Pessoal</option>
              <option value="Online">Online</option>
              <option value="Telefone">Telefone</option>
            </select>
          </div>
        </div>
      </div>

      {/* Custas e Pagamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custas */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Custas</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={protocoloData.tipo}
                onChange={(e) => handleInputChange('tipo', e.target.value)}
                className="input"
              >
                <option value="Pago">Pago</option>
                <option value="Gratuito">Gratuito</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Analfabetos</label>
                <input
                  type="number"
                  value={protocoloData.analfabetos}
                  onChange={(e) => handleInputChange('analfabetos', parseInt(e.target.value) || 0)}
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total de Atos</label>
              <input
                type="number"
                step="0.01"
                value={protocoloData.totalAtos}
                onChange={(e) => handleInputChange('totalAtos', parseFloat(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Outros Serviços</label>
              <input
                type="number"
                step="0.01"
                value={protocoloData.outrosServicos}
                onChange={(e) => handleInputChange('outrosServicos', parseFloat(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
              <input
                type="number"
                step="0.01"
                value={protocoloData.total}
                onChange={(e) => handleInputChange('total', parseFloat(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Pago</label>
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

        {/* Pagamento */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pagamento</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-sm font-medium text-gray-700">
              <div>Pagamento</div>
              <div>Valor (R$)</div>
              <div>Data</div>
            </div>
            <div className="grid grid-cols-3 gap-2 items-center">
              <div className="text-sm">Depósito</div>
              <input
                type="number"
                step="0.01"
                value={pagamentoData.deposito.valor}
                onChange={(e) => setPagamentoData(prev => ({
                  ...prev,
                  deposito: { ...prev.deposito, valor: parseFloat(e.target.value) || 0 }
                }))}
                className="input text-sm"
              />
              <input
                type="text"
                value={pagamentoData.deposito.data}
                onChange={(e) => setPagamentoData(prev => ({
                  ...prev,
                  deposito: { ...prev.deposito, data: e.target.value }
                }))}
                className="input text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 items-center opacity-50">
              <div className="text-sm line-through">Assinatura</div>
              <input
                type="number"
                step="0.01"
                value={pagamentoData.assinatura.valor}
                disabled
                className="input text-sm"
              />
              <input
                type="text"
                value={pagamentoData.assinatura.data}
                disabled
                className="input text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 items-center opacity-50">
              <div className="text-sm line-through">1ª Parcela</div>
              <input
                type="number"
                step="0.01"
                value={pagamentoData.parcela1.valor}
                disabled
                className="input text-sm"
              />
              <input
                type="text"
                value={pagamentoData.parcela1.data}
                disabled
                className="input text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 items-center opacity-50">
              <div className="text-sm line-through">2ª Parcela</div>
              <input
                type="number"
                step="0.01"
                value={pagamentoData.parcela2.valor}
                disabled
                className="input text-sm"
              />
              <input
                type="text"
                value={pagamentoData.parcela2.data}
                disabled
                className="input text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 items-center opacity-50">
              <div className="text-sm line-through">3ª Parcela</div>
              <input
                type="number"
                step="0.01"
                value={pagamentoData.parcela3.valor}
                disabled
                className="input text-sm"
              />
              <input
                type="text"
                value={pagamentoData.parcela3.data}
                disabled
                className="input text-sm"
              />
            </div>
            <div className="mt-4 p-2 bg-gray-50 rounded text-sm">
              Certidão de Nascimento - Processo: 570542
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex space-x-3">
          <button
            onClick={handleCalcular}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <CalculatorIcon size={16} />
            <span>Calcular</span>
          </button>
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
            onClick={handleRetornar}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <ArrowLeftIcon size={16} />
            <span>Retornar</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderServicos = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ATOS */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">ATOS</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Natureza</label>
              <select
                value={servicosData.natureza}
                onChange={(e) => handleServicosChange('natureza', e.target.value)}
                className="input"
              >
                <option value="CERTIDÃO EM BREVE RELATÓRIO">CERTIDÃO EM BREVE RELATÓRIO</option>
                <option value="CERTIDÃO DE NASCIMENTO">CERTIDÃO DE NASCIMENTO</option>
                <option value="CERTIDÃO DE CASAMENTO">CERTIDÃO DE CASAMENTO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Gratuidade</label>
              <select
                value={servicosData.tipoGratuidade}
                onChange={(e) => handleServicosChange('tipoGratuidade', e.target.value)}
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
                value={servicosData.quantidade}
                onChange={(e) => handleServicosChange('quantidade', parseInt(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Analfabetos (Procuração)</label>
              <input
                type="number"
                value={servicosData.analfabetos}
                onChange={(e) => handleServicosChange('analfabetos', parseInt(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
              <input
                type="number"
                step="0.01"
                value={servicosData.total}
                onChange={(e) => handleServicosChange('total', parseFloat(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCalcular}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <CalculatorIcon size={16} />
                <span>Calcular</span>
              </button>
              <button className="btn btn-primary flex items-center space-x-2">
                <PlusIcon size={16} />
                <span>Novo</span>
              </button>
              <button
                onClick={handleGravar}
                className="btn btn-primary flex items-center space-x-2"
              >
                <SaveIcon size={16} />
                <span>Gravar</span>
              </button>
              <button className="btn btn-red-600 text-white hover:bg-red-700 flex items-center space-x-2">
                <TrashIcon size={16} />
                <span>Excluir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm font-medium text-gray-700 border-b pb-2">
              <div>Natureza</div>
              <div>Valor</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>{servicosData.natureza}</div>
              <div>R$ {servicosData.total.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* OUTROS SERVIÇOS */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">OUTROS SERVIÇOS</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
              <input
                type="text"
                value={outrosServicos.quantidade}
                onChange={(e) => handleOutrosServicosChange('quantidade', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (Serviço)</label>
              <input
                type="text"
                value={outrosServicos.descricao}
                onChange={(e) => handleOutrosServicosChange('descricao', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
              <input
                type="text"
                value={outrosServicos.valor}
                onChange={(e) => handleOutrosServicosChange('valor', e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qtde</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor R$</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {servicosLista.map((servico, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 text-sm text-gray-900">{servico.quantidade}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{servico.nome}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{servico.valor.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex space-x-2 mt-3">
              <button className="btn btn-secondary flex items-center space-x-2">
                <CheckIcon size={16} />
                <span>Editar</span>
              </button>
              <button className="btn btn-primary flex items-center space-x-2">
                <PlusIcon size={16} />
                <span>Incluir</span>
              </button>
              <button className="btn btn-red-600 text-white hover:bg-red-700 flex items-center space-x-2">
                <TrashIcon size={16} />
                <span>Excluir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderHistorico = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Histórico do Protocolo</h3>
      <p className="text-gray-600">Funcionalidade de histórico será implementada em breve.</p>
    </div>
  )

  const renderDigitalizacao = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Digitalização</h3>
      <p className="text-gray-600">Funcionalidade de digitalização será implementada em breve.</p>
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
                Lançamento de Protocolos
              </h2>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('cadastro')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cadastro'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cadastro / Manutenção
            </button>
            <button
              onClick={() => setActiveTab('servicos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'servicos'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Serviços
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
              onClick={() => setActiveTab('digitalizacao')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'digitalizacao'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Digitalização
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'cadastro' && renderCadastroManutencao()}
          {activeTab === 'servicos' && renderServicos()}
          {activeTab === 'historico' && renderHistorico()}
          {activeTab === 'digitalizacao' && renderDigitalizacao()}
        </div>
      </div>
    </div>
  )
}
