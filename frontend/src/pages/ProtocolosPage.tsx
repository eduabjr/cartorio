import { useState } from 'react'
import { DocumentIcon, CheckIcon, PlusIcon, XIcon } from '../components/icons'

interface Protocolo {
  id: string
  numero: string
  data: string
  tipo: 'lancamento' | 'baixa' | 'cancelamento'
  status: 'ativo' | 'baixado' | 'cancelado'
  descricao: string
  valor?: number
}

export function ProtocolosPage() {
  const [protocolos, setProtocolos] = useState<Protocolo[]>([
    {
      id: '1',
      numero: 'PROT-2024-001',
      data: '2024-01-15',
      tipo: 'lancamento',
      status: 'ativo',
      descricao: 'Protocolo de lançamento de documento',
      valor: 150.00
    },
    {
      id: '2',
      numero: 'PROT-2024-002',
      data: '2024-01-16',
      tipo: 'baixa',
      status: 'baixado',
      descricao: 'Protocolo de baixa de documento',
      valor: 200.00
    }
  ])

  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<'lancamento' | 'baixa' | 'cancelamento'>('lancamento')
  const [formData, setFormData] = useState({
    numero: '',
    descricao: '',
    valor: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const novoProtocolo: Protocolo = {
      id: Date.now().toString(),
      numero: formData.numero || `PROT-2024-${String(protocolos.length + 1).padStart(3, '0')}`,
      data: new Date().toISOString().split('T')[0],
      tipo: formType,
      status: formType === 'lancamento' ? 'ativo' : formType === 'baixa' ? 'baixado' : 'cancelado',
      descricao: formData.descricao,
      valor: formData.valor ? parseFloat(formData.valor) : undefined
    }

    setProtocolos([...protocolos, novoProtocolo])
    setShowForm(false)
    setFormData({ numero: '', descricao: '', valor: '' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800'
      case 'baixado': return 'bg-blue-100 text-blue-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'lancamento': return 'Lançamento'
      case 'baixa': return 'Baixa'
      case 'cancelamento': return 'Cancelamento'
      default: return tipo
    }
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <DocumentIcon size={24} className="text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                Sistema de Protocolos
              </h2>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setFormType('lancamento')
                  setShowForm(true)
                }}
                className="btn btn-primary flex items-center space-x-2"
              >
                <PlusIcon size={16} />
                <span>Novo Lançamento</span>
              </button>
              <button
                onClick={() => {
                  setFormType('baixa')
                  setShowForm(true)
                }}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <CheckIcon size={16} />
                <span>Nova Baixa</span>
              </button>
              <button
                onClick={() => {
                  setFormType('cancelamento')
                  setShowForm(true)
                }}
                className="btn bg-red-600 text-white hover:bg-red-700 flex items-center space-x-2"
              >
                <XIcon size={16} />
                <span>Novo Cancelamento</span>
              </button>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              {formType === 'lancamento' && 'Novo Lançamento de Protocolo'}
              {formType === 'baixa' && 'Nova Baixa de Protocolo'}
              {formType === 'cancelamento' && 'Novo Cancelamento de Protocolo'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número do Protocolo
                  </label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className="input"
                    placeholder="Deixe vazio para auto-geração"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="input"
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Descrição do protocolo..."
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn btn-primary">
                  Salvar Protocolo
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Lista de Protocolos ({protocolos.length})
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {protocolos.map((protocolo) => (
                  <tr key={protocolo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {protocolo.numero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(protocolo.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getTipoLabel(protocolo.tipo)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(protocolo.status)}`}>
                        {protocolo.status.charAt(0).toUpperCase() + protocolo.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {protocolo.valor ? `R$ ${protocolo.valor.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {protocolo.descricao}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {protocolos.length === 0 && (
            <div className="text-center py-8">
              <DocumentIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhum protocolo encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
