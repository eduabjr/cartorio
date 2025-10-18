import React, { useState } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'

interface ClienteCadastroWindowProps {
  onClose: () => void
}

export function ClienteCadastroWindow({ onClose }: ClienteCadastroWindowProps) {
  const { getTheme } = useAccessibility()
  const theme = getTheme()
  
  const [activeTab, setActiveTab] = useState('cadastro')
  const [formData, setFormData] = useState({
    codigo: '0',
    nome: '',
    sexo: 'IGNORADO',
    cpf: '',
    rg: '',
    docExterior: '',
    orgaoRg: '',
    emissaoRg: '',
    oab: '',
    ufOab: '',
    cnh: '',
    nascimento: '',
    naturalidade: '',
    uf: '',
    pais: '',
    nacionalidade: '',
    estadoCivil: 'IGNORADO',
    pai: '',
    mae: '',
    cep: '',
    logradouro: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    ufEndereco: '',
    paisEndereco: '',
    codigoIbge: '',
    telefone: '',
    celular: '',
    email: '',
    profissao: '',
    conjugeCartao: '',
    nomeConjuge: '',
    cpfConjuge: '',
    rgConjuge: '',
    nomeSocial: '',
    atendente: '',
    assinanteCartao: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const windowStyles = {
    width: '900px',
    height: '700px',
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden'
  }

  const headerStyles = {
    backgroundColor: theme.primary,
    color: 'white',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'move'
  }

  const tabStyles = {
    display: 'flex',
    backgroundColor: theme.background,
    borderBottom: `1px solid ${theme.border}`
  }

  const tabButtonStyles = (isActive: boolean) => ({
    padding: '12px 24px',
    border: 'none',
    backgroundColor: isActive ? theme.surface : 'transparent',
    color: isActive ? theme.primary : theme.text,
    cursor: 'pointer',
    borderBottom: isActive ? `2px solid ${theme.primary}` : '2px solid transparent',
    transition: 'all 0.2s ease'
  })

  const contentStyles = {
    flex: 1,
    padding: '20px',
    overflow: 'auto',
    backgroundColor: theme.surface
  }

  const formStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px'
  }

  const fieldStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px'
  }

  const labelStyles = {
    fontSize: '14px',
    fontWeight: '500',
    color: theme.text
  }

  const inputStyles = {
    padding: '8px 12px',
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: theme.background,
    color: theme.text,
    outline: 'none'
  }

  const selectStyles = {
    ...inputStyles,
    cursor: 'pointer'
  }

  const buttonStyles = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  }

  const primaryButtonStyles = {
    ...buttonStyles,
    backgroundColor: theme.primary,
    color: 'white'
  }

  const secondaryButtonStyles = {
    ...buttonStyles,
    backgroundColor: theme.border,
    color: theme.text
  }

  const dangerButtonStyles = {
    ...buttonStyles,
    backgroundColor: '#ef4444',
    color: 'white'
  }

  const buttonsContainerStyles = {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: `1px solid ${theme.border}`
  }

  return (
    <div style={windowStyles}>
      {/* Header */}
      <div style={headerStyles} data-draggable-header>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Cliente</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div style={tabStyles}>
        <button
          style={tabButtonStyles(activeTab === 'cadastro')}
          onClick={() => setActiveTab('cadastro')}
        >
          Cadastro
        </button>
        <button
          style={tabButtonStyles(activeTab === 'digitalizacao')}
          onClick={() => setActiveTab('digitalizacao')}
        >
          Digitalização
        </button>
        <button
          style={tabButtonStyles(activeTab === 'selo-digital')}
          onClick={() => setActiveTab('selo-digital')}
        >
          Selo Digital
        </button>
      </div>

      {/* Content */}
      <div style={contentStyles}>
        {activeTab === 'cadastro' && (
          <form style={formStyles}>
            {/* Seção de Identificação */}
            <div style={fieldStyles}>
              <label style={labelStyles}>Código</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange('codigo', e.target.value)}
                  style={inputStyles}
                />
                <button type="button" style={secondaryButtonStyles}>...</button>
              </div>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Nome *</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                style={inputStyles}
                required
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Sexo</label>
              <select
                value={formData.sexo}
                onChange={(e) => handleInputChange('sexo', e.target.value)}
                style={selectStyles}
              >
                <option value="IGNORADO">IGNORADO</option>
                <option value="MASCULINO">MASCULINO</option>
                <option value="FEMININO">FEMININO</option>
              </select>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>CPF *</label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                style={inputStyles}
                placeholder="000.000.000-00"
                required
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>RG *</label>
              <input
                type="text"
                value={formData.rg}
                onChange={(e) => handleInputChange('rg', e.target.value)}
                style={inputStyles}
                required
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Doc. Exterior</label>
              <input
                type="text"
                value={formData.docExterior}
                onChange={(e) => handleInputChange('docExterior', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Órgão RG</label>
              <input
                type="text"
                value={formData.orgaoRg}
                onChange={(e) => handleInputChange('orgaoRg', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Emissão RG</label>
              <input
                type="date"
                value={formData.emissaoRg}
                onChange={(e) => handleInputChange('emissaoRg', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>OAB</label>
              <input
                type="text"
                value={formData.oab}
                onChange={(e) => handleInputChange('oab', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>UF OAB</label>
              <select
                value={formData.ufOab}
                onChange={(e) => handleInputChange('ufOab', e.target.value)}
                style={selectStyles}
              >
                <option value="">Selecione</option>
                <option value="SP">SP</option>
                <option value="RJ">RJ</option>
                <option value="MG">MG</option>
                {/* Adicionar outros estados */}
              </select>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>CNH</label>
              <input
                type="text"
                value={formData.cnh}
                onChange={(e) => handleInputChange('cnh', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Nascimento *</label>
              <input
                type="date"
                value={formData.nascimento}
                onChange={(e) => handleInputChange('nascimento', e.target.value)}
                style={inputStyles}
                required
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Naturalidade</label>
              <input
                type="text"
                value={formData.naturalidade}
                onChange={(e) => handleInputChange('naturalidade', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>UF</label>
              <select
                value={formData.uf}
                onChange={(e) => handleInputChange('uf', e.target.value)}
                style={selectStyles}
              >
                <option value="">Selecione</option>
                <option value="SP">SP</option>
                <option value="RJ">RJ</option>
                <option value="MG">MG</option>
                {/* Adicionar outros estados */}
              </select>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>País</label>
              <select
                value={formData.pais}
                onChange={(e) => handleInputChange('pais', e.target.value)}
                style={selectStyles}
              >
                <option value="">Selecione</option>
                <option value="BRASIL">BRASIL</option>
                <option value="ARGENTINA">ARGENTINA</option>
                <option value="URUGUAI">URUGUAI</option>
                {/* Adicionar outros países */}
              </select>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Nacionalidade</label>
              <input
                type="text"
                value={formData.nacionalidade}
                onChange={(e) => handleInputChange('nacionalidade', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Estado Civil *</label>
              <select
                value={formData.estadoCivil}
                onChange={(e) => handleInputChange('estadoCivil', e.target.value)}
                style={selectStyles}
                required
              >
                <option value="IGNORADO">IGNORADO</option>
                <option value="SOLTEIRO">SOLTEIRO</option>
                <option value="CASADO">CASADO</option>
                <option value="DIVORCIADO">DIVORCIADO</option>
                <option value="VIUVO">VIUVO</option>
              </select>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Pai</label>
              <input
                type="text"
                value={formData.pai}
                onChange={(e) => handleInputChange('pai', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Mãe</label>
              <input
                type="text"
                value={formData.mae}
                onChange={(e) => handleInputChange('mae', e.target.value)}
                style={inputStyles}
              />
            </div>

            {/* Seção de Endereço */}
            <div style={fieldStyles}>
              <label style={labelStyles}>CEP</label>
              <input
                type="text"
                value={formData.cep}
                onChange={(e) => handleInputChange('cep', e.target.value)}
                style={inputStyles}
                placeholder="00000-000"
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Logradouro</label>
              <select
                value={formData.logradouro}
                onChange={(e) => handleInputChange('logradouro', e.target.value)}
                style={selectStyles}
              >
                <option value="">Selecione</option>
                <option value="RUA">RUA</option>
                <option value="AVENIDA">AVENIDA</option>
                <option value="TRAVESSA">TRAVESSA</option>
                <option value="ALAMEDA">ALAMEDA</option>
                {/* Adicionar outros tipos */}
              </select>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Endereço</label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Número</label>
              <input
                type="text"
                value={formData.numero}
                onChange={(e) => handleInputChange('numero', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Complemento</label>
              <input
                type="text"
                value={formData.complemento}
                onChange={(e) => handleInputChange('complemento', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Bairro</label>
              <input
                type="text"
                value={formData.bairro}
                onChange={(e) => handleInputChange('bairro', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Cidade</label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => handleInputChange('cidade', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>UF</label>
              <select
                value={formData.ufEndereco}
                onChange={(e) => handleInputChange('ufEndereco', e.target.value)}
                style={selectStyles}
              >
                <option value="">Selecione</option>
                <option value="SP">SP</option>
                <option value="RJ">RJ</option>
                <option value="MG">MG</option>
                {/* Adicionar outros estados */}
              </select>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>País</label>
              <select
                value={formData.paisEndereco}
                onChange={(e) => handleInputChange('paisEndereco', e.target.value)}
                style={selectStyles}
              >
                <option value="">Selecione</option>
                <option value="BRASIL">BRASIL</option>
                <option value="ARGENTINA">ARGENTINA</option>
                <option value="URUGUAI">URUGUAI</option>
                {/* Adicionar outros países */}
              </select>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Código IBGE</label>
              <input
                type="text"
                value={formData.codigoIbge}
                onChange={(e) => handleInputChange('codigoIbge', e.target.value)}
                style={inputStyles}
              />
            </div>

            {/* Seção de Contato */}
            <div style={fieldStyles}>
              <label style={labelStyles}>Telefone</label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                style={inputStyles}
                placeholder="(00) 0000-0000"
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Celular</label>
              <input
                type="text"
                value={formData.celular}
                onChange={(e) => handleInputChange('celular', e.target.value)}
                style={inputStyles}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={inputStyles}
              />
            </div>

            {/* Seção Profissional */}
            <div style={fieldStyles}>
              <label style={labelStyles}>Profissão</label>
              <input
                type="text"
                value={formData.profissao}
                onChange={(e) => handleInputChange('profissao', e.target.value)}
                style={inputStyles}
              />
            </div>

            {/* Seção Cônjuge */}
            <div style={fieldStyles}>
              <label style={labelStyles}>Cônjuge (Cartão)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={formData.conjugeCartao}
                  onChange={(e) => handleInputChange('conjugeCartao', e.target.value)}
                  style={inputStyles}
                />
                <button type="button" style={secondaryButtonStyles}>...</button>
                <button type="button" style={secondaryButtonStyles}>✏️</button>
              </div>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Nome</label>
              <input
                type="text"
                value={formData.nomeConjuge}
                onChange={(e) => handleInputChange('nomeConjuge', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>CPF</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={formData.cpfConjuge}
                  onChange={(e) => handleInputChange('cpfConjuge', e.target.value)}
                  style={inputStyles}
                  placeholder="000.000.000-00"
                />
                <button type="button" style={secondaryButtonStyles}>...</button>
              </div>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>RG</label>
              <input
                type="text"
                value={formData.rgConjuge}
                onChange={(e) => handleInputChange('rgConjuge', e.target.value)}
                style={inputStyles}
              />
            </div>

            {/* Outros Detalhes */}
            <div style={fieldStyles}>
              <label style={labelStyles}>Nome Social</label>
              <input
                type="text"
                value={formData.nomeSocial}
                onChange={(e) => handleInputChange('nomeSocial', e.target.value)}
                style={inputStyles}
              />
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Atendente</label>
              <select
                value={formData.atendente}
                onChange={(e) => handleInputChange('atendente', e.target.value)}
                style={selectStyles}
              >
                <option value="">Selecione</option>
                <option value="ATENDENTE1">Atendente 1</option>
                <option value="ATENDENTE2">Atendente 2</option>
                {/* Adicionar outros atendentes */}
              </select>
            </div>

            <div style={fieldStyles}>
              <label style={labelStyles}>Assinante do Cartão</label>
              <input
                type="text"
                value={formData.assinanteCartao}
                onChange={(e) => handleInputChange('assinanteCartao', e.target.value)}
                style={inputStyles}
              />
            </div>
          </form>
        )}

        {activeTab === 'digitalizacao' && (
          <div style={{ padding: '20px', textAlign: 'center', color: theme.text }}>
            <h3>Digitalização</h3>
            <p>Funcionalidade de digitalização será implementada aqui.</p>
          </div>
        )}

        {activeTab === 'selo-digital' && (
          <div style={{ padding: '20px', textAlign: 'center', color: theme.text }}>
            <h3>Selo Digital</h3>
            <p>Funcionalidade de selo digital será implementada aqui.</p>
          </div>
        )}

        {/* Botões de Ação */}
        <div style={buttonsContainerStyles}>
          <button type="button" style={primaryButtonStyles}>
            📄 Novo
          </button>
          <button type="button" style={primaryButtonStyles}>
            💾 Gravar
          </button>
          <button type="button" style={secondaryButtonStyles}>
            🧹 Limpar
          </button>
          <button type="button" style={secondaryButtonStyles}>
            💳 Cartão
          </button>
          <button type="button" style={dangerButtonStyles} onClick={onClose}>
            🚪 Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
