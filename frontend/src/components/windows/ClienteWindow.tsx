import React, { useState } from 'react'
import { UserIcon, SaveIcon, PrintIcon } from '../icons'

export function ClienteWindow() {
  const [clienteData, setClienteData] = useState({
    nome: '',
    cpf: '',
    rg: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    cep: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Cliente Salvo:', clienteData)
    alert('Cliente salvo com sucesso!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <UserIcon size={24} className="text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-800">Cadastro de Cliente</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              value={clienteData.nome}
              onChange={(e) => setClienteData({...clienteData, nome: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Digite o nome completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPF
            </label>
            <input
              type="text"
              value={clienteData.cpf}
              onChange={(e) => setClienteData({...clienteData, cpf: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="000.000.000-00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RG
            </label>
            <input
              type="text"
              value={clienteData.rg}
              onChange={(e) => setClienteData({...clienteData, rg: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="00.000.000-0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={clienteData.email}
              onChange={(e) => setClienteData({...clienteData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="email@exemplo.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <input
              type="text"
              value={clienteData.telefone}
              onChange={(e) => setClienteData({...clienteData, telefone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CEP
            </label>
            <input
              type="text"
              value={clienteData.cep}
              onChange={(e) => setClienteData({...clienteData, cep: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="00000-000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Endereço
          </label>
          <input
            type="text"
            value={clienteData.endereco}
            onChange={(e) => setClienteData({...clienteData, endereco: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Rua, número, bairro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cidade
          </label>
          <input
            type="text"
            value={clienteData.cidade}
            onChange={(e) => setClienteData({...clienteData, cidade: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Nome da cidade"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <SaveIcon size={16} />
            <span>Salvar Cliente</span>
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
