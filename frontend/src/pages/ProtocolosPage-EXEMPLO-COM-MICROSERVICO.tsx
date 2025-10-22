/**
 * EXEMPLO DE USO DO MICROSERVIÇO DE PROTOCOLOS
 * 
 * Este é um exemplo de como integrar a página de protocolos
 * com o microserviço, garantindo resiliência e fallback.
 * 
 * Para usar:
 * 1. Substitua o conteúdo atual de ProtocolosPage.tsx por este
 * 2. O componente automaticamente usará o microserviço
 * 3. Se o serviço estiver offline, usará dados de fallback
 */

import { useState, useEffect } from 'react'
import { FileText, Plus, Search, Filter, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { protocoloService, Protocolo } from '../services/ProtocoloService'

export function ProtocolosPage() {
  const [protocolos, setProtocolos] = useState<Protocolo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isOnline, setIsOnline] = useState(true)
  
  const [filtros, setFiltros] = useState({
    tipo: '',
    status: ''
  })
  
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Protocolo>>({
    numero: '',
    tipo: 'lancamento',
    descricao: '',
    valor: 0
  })

  // Carregar protocolos ao montar o componente
  useEffect(() => {
    carregarProtocolos()
  }, [filtros])

  /**
   * Carrega protocolos do microserviço
   * Com tratamento de erro e fallback automático
   */
  async function carregarProtocolos() {
    try {
      setLoading(true)
      setError('')
      
      const dados = await protocoloService.listar(filtros)
      setProtocolos(dados)
      setIsOnline(true)
      
      console.log('✅ Protocolos carregados do microserviço')
    } catch (err) {
      console.error('❌ Erro ao carregar protocolos:', err)
      setError('Não foi possível conectar ao servidor. Usando dados locais.')
      setIsOnline(false)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cria novo protocolo via microserviço
   */
  async function handleCriar() {
    try {
      setLoading(true)
      
      const novo = await protocoloService.criar({
        numero: formData.numero || `PROT-${Date.now()}`,
        tipo: formData.tipo!,
        descricao: formData.descricao,
        valor: formData.valor,
        status: 'ativo'
      })
      
      // Adicionar à lista local
      setProtocolos([novo, ...protocolos])
      
      // Limpar formulário
      setFormData({
        numero: '',
        tipo: 'lancamento',
        descricao: '',
        valor: 0
      })
      setShowForm(false)
      
      alert('✅ Protocolo criado com sucesso!')
    } catch (err) {
      console.error('❌ Erro ao criar protocolo:', err)
      alert('Erro ao criar protocolo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Baixa protocolo via microserviço
   */
  async function handleBaixar(id: string) {
    if (!confirm('Deseja baixar este protocolo?')) return
    
    try {
      setLoading(true)
      
      const atualizado = await protocoloService.baixar(id)
      
      // Atualizar na lista local
      setProtocolos(protocolos.map(p => 
        p.id === id ? atualizado : p
      ))
      
      alert('✅ Protocolo baixado com sucesso!')
    } catch (err) {
      console.error('❌ Erro ao baixar protocolo:', err)
      alert('Erro ao baixar protocolo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cancela protocolo via microserviço
   */
  async function handleCancelar(id: string) {
    if (!confirm('Deseja cancelar este protocolo?')) return
    
    try {
      setLoading(true)
      
      const atualizado = await protocoloService.cancelar(id)
      
      // Atualizar na lista local
      setProtocolos(protocolos.map(p => 
        p.id === id ? atualizado : p
      ))
      
      alert('✅ Protocolo cancelado com sucesso!')
    } catch (err) {
      console.error('❌ Erro ao cancelar protocolo:', err)
      alert('Erro ao cancelar protocolo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Retorna cor baseada no status
   */
  function getStatusColor(status: string) {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800'
      case 'baixado': return 'bg-blue-100 text-blue-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  /**
   * Retorna ícone baseado no status
   */
  function getStatusIcon(status: string) {
    switch (status) {
      case 'ativo': return <CheckCircle size={16} />
      case 'baixado': return <FileText size={16} />
      case 'cancelado': return <XCircle size={16} />
      default: return <AlertCircle size={16} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Protocolos</h1>
          <p className="text-gray-600 mt-1">
            Gerenciamento de protocolos via microserviço
            {!isOnline && (
              <span className="ml-2 text-amber-600 font-medium">
                (Modo Offline)
              </span>
            )}
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Novo Protocolo</span>
        </button>
      </div>

      {/* Indicador de Conexão */}
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="text-amber-600" size={20} />
          <div>
            <p className="font-medium text-amber-800">Modo Offline Ativado</p>
            <p className="text-sm text-amber-700">
              Os dados exibidos podem estar desatualizados. Reconecte-se ao servidor para sincronizar.
            </p>
          </div>
        </div>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <XCircle className="text-red-600" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Formulário de Criação */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Novo Protocolo</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número
              </label>
              <input
                type="text"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                className="input"
                placeholder="Deixe vazio para gerar automático"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                className="input"
              >
                <option value="lancamento">Lançamento</option>
                <option value="baixa">Baixa</option>
                <option value="cancelamento">Cancelamento</option>
              </select>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="input"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor
              </label>
              <input
                type="number"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                className="input"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="flex space-x-3 mt-4">
            <button
              onClick={handleCriar}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Criando...' : 'Criar Protocolo'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-gray-600" />
          
          <select
            value={filtros.tipo}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
            className="input max-w-xs"
          >
            <option value="">Todos os tipos</option>
            <option value="lancamento">Lançamento</option>
            <option value="baixa">Baixa</option>
            <option value="cancelamento">Cancelamento</option>
          </select>
          
          <select
            value={filtros.status}
            onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
            className="input max-w-xs"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="baixado">Baixado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Lista de Protocolos */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando protocolos...</p>
        </div>
      ) : protocolos.length === 0 ? (
        <div className="card text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Nenhum protocolo encontrado</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {protocolos.map((protocolo) => (
            <div key={protocolo.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold">{protocolo.numero}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(protocolo.status!)}`}>
                      {getStatusIcon(protocolo.status!)}
                      <span className="ml-1">{protocolo.status}</span>
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                      {protocolo.tipo}
                    </span>
                  </div>
                  
                  {protocolo.descricao && (
                    <p className="text-gray-600 mt-2">{protocolo.descricao}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                    {protocolo.data && (
                      <span>Data: {new Date(protocolo.data).toLocaleDateString('pt-BR')}</span>
                    )}
                    {protocolo.valor && (
                      <span>Valor: R$ {protocolo.valor.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                
                {/* Ações */}
                {protocolo.status === 'ativo' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBaixar(protocolo.id!)}
                      className="btn btn-sm btn-secondary"
                      disabled={loading}
                    >
                      Baixar
                    </button>
                    <button
                      onClick={() => handleCancelar(protocolo.id!)}
                      className="btn btn-sm btn-danger"
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

