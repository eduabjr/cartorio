import React, { useState } from 'react'
import { DocumentIcon, SaveIcon, PrintIcon, SearchIcon } from '../icons'

export function ProtocoloBaixaWindow() {
  const [protocoloData, setProtocoloData] = useState({
    numero: '',
    dataBaixa: '',
    motivo: '',
    observacoes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Protocolo de Baixa Salvo:', protocoloData)
    alert('Protocolo de Baixa salvo com sucesso!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <DocumentIcon size={24} className="text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-800">Baixa de Protocolo</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número do Protocolo
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={protocoloData.numero}
                onChange={(e) => setProtocoloData({...protocoloData, numero: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Digite o número do protocolo"
              />
              <button
                type="button"
                className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <SearchIcon size={16} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data da Baixa
            </label>
            <input
              type="date"
              value={protocoloData.dataBaixa}
              onChange={(e) => setProtocoloData({...protocoloData, dataBaixa: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo da Baixa
          </label>
          <select
            value={protocoloData.motivo}
            onChange={(e) => setProtocoloData({...protocoloData, motivo: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Selecione o motivo</option>
            <option value="concluido">Protocolo Concluído</option>
            <option value="cancelado">Protocolo Cancelado</option>
            <option value="arquivado">Protocolo Arquivado</option>
            <option value="transferido">Protocolo Transferido</option>
          </select>
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
            placeholder="Observações sobre a baixa do protocolo"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <SaveIcon size={16} />
            <span>Salvar Baixa</span>
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
