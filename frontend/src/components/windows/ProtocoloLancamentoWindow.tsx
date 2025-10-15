import React, { useState } from 'react'
import { DocumentIcon, SaveIcon, PrintIcon } from '../icons'

export function ProtocoloLancamentoWindow() {
  const [protocoloData, setProtocoloData] = useState({
    numero: '',
    data: '',
    tipo: '',
    interessado: '',
    observacoes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Protocolo de Lançamento Salvo:', protocoloData)
    alert('Protocolo de Lançamento salvo com sucesso!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <DocumentIcon size={24} className="text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-800">Lançamento de Protocolo</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número do Protocolo
            </label>
            <input
              type="text"
              value={protocoloData.numero}
              onChange={(e) => setProtocoloData({...protocoloData, numero: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Digite o número do protocolo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data
            </label>
            <input
              type="date"
              value={protocoloData.data}
              onChange={(e) => setProtocoloData({...protocoloData, data: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Protocolo
          </label>
          <select
            value={protocoloData.tipo}
            onChange={(e) => setProtocoloData({...protocoloData, tipo: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Selecione o tipo</option>
            <option value="nascimento">Nascimento</option>
            <option value="casamento">Casamento</option>
            <option value="obito">Óbito</option>
            <option value="imovel">Imóvel</option>
            <option value="veiculo">Veículo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interessado
          </label>
          <input
            type="text"
            value={protocoloData.interessado}
            onChange={(e) => setProtocoloData({...protocoloData, interessado: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Nome do interessado"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações
          </label>
          <textarea
            value={protocoloData.observacoes}
            onChange={(e) => setProtocoloData({...protocoloData, observacoes: e.target.value})}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Observações adicionais"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <SaveIcon size={16} />
            <span>Salvar Protocolo</span>
          </button>

          <button
            type="button"
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <PrintIcon size={16} />
            <span>Imprimir</span>
          </button>
        </div>
      </form>
    </div>
  )
}
