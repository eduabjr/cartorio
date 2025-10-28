import React, { useState } from 'react'
import { CidadeAutocompleteInput } from '../components/CidadeAutocompleteInput'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { viaCepService } from '../services/ViaCepService'

interface DNVDOBloqueadasPageProps {
  onClose: () => void
}

export function DNVDOBloqueadasPage({ onClose }: DNVDOBloqueadasPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  
  // Cor do header: teal no light, laranja no dark
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'

  // Estado para o formulário
  const [formData, setFormData] = useState({
    codigo: '0',
    tipoDeclaracao: 'DNV',
    numeroDeclaracao: '',
    data: '',
    localOcorrencia: 'Hospital',
    estabelecimento: '',
    logradouro: 'Rua',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: 'SP',
    cep: '',
    observacao: ''
  })

  // Estado para campo em foco
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Função para criar novo registro
  const handleNovo = () => {
    setFormData({
      codigo: '0',
      tipoDeclaracao: 'DNV',
      numeroDeclaracao: '',
      data: '',
      localOcorrencia: 'Hospital',
      estabelecimento: '',
      logradouro: 'Rua',
      endereco: '',
      numero: '',
      bairro: '',
      cidade: '',
      uf: 'SP',
      cep: '',
      observacao: ''
    })
  }

  // Função para gravar registro
  const handleGravar = () => {
    console.log('Salvando declaração bloqueada:', formData)
    alert('✅ Declaração bloqueada salva com sucesso!')
  }

  // Função para excluir registro
  const handleExcluir = () => {
    if (confirm('⚠️ Deseja realmente excluir esta declaração bloqueada?')) {
      handleNovo()
      alert('✅ Declaração bloqueada excluída com sucesso!')
    }
  }

  // Função para buscar CEP
  const handleBuscarCEP = async () => {
    const cep = formData.cep.replace(/\D/g, '')
    
    if (!cep || cep.length < 8) {
      alert('⚠️ Digite um CEP válido com 8 dígitos')
      return
    }

    try {
      console.log('🔍 Buscando CEP:', cep)
      
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
        alert(`✅ CEP encontrado!\n\n📍 ${dados.logradouro}\n🏘️ ${dados.bairro}\n🏙️ ${dados.localidade}/${dados.uf}`)
      } else {
        alert('❌ CEP não encontrado')
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      alert('❌ Erro ao buscar CEP. Verifique sua conexão.')
    }
  }

  // Cor de foco dinâmica baseada no tema (igual CartorioSeadePage)
  const focusColor = currentTheme === 'dark' ? '#ffd4a3' : '#ffedd5'
  const focusTextColor = currentTheme === 'dark' ? '#1a1a1a' : '#000000'

  const getInputStyles = (fieldName: string) => ({
    width: '100%',
    padding: '4px 8px',
    fontSize: '12px',
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    backgroundColor: focusedField === fieldName ? focusColor : theme.background,
    color: focusedField === fieldName ? focusTextColor : theme.text,
    outline: 'none',
    height: '28px',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease',
    lineHeight: '20px',
    WebkitBoxShadow: focusedField === fieldName ? `0 0 0 1000px ${focusColor} inset` : `0 0 0 1000px ${theme.background} inset`,
    WebkitTextFillColor: focusedField === fieldName ? focusTextColor : theme.text,
    boxShadow: focusedField === fieldName ? `0 0 0 1000px ${focusColor} inset` : 'none'
  })

  const getSelectStyles = (fieldName: string) => {
    // Seta sempre preta para visibilidade (não muda com foco)
    return {
      width: '100%',
      padding: '4px 8px',
      fontSize: '12px',
      border: `1px solid ${theme.border}`,
      borderRadius: '3px',
      backgroundColor: focusedField === fieldName ? focusColor : theme.background,
      color: focusedField === fieldName ? focusTextColor : theme.text,
      outline: 'none',
      height: '28px',
      minHeight: '28px',
      maxHeight: '28px',
      lineHeight: '20px',
      boxSizing: 'border-box' as const,
      transition: 'all 0.2s ease',
      WebkitBoxShadow: focusedField === fieldName ? `0 0 0 1000px ${focusColor} inset` : `0 0 0 1000px ${theme.background} inset`,
      WebkitTextFillColor: focusedField === fieldName ? focusTextColor : theme.text,
      boxShadow: focusedField === fieldName ? `0 0 0 1000px ${focusColor} inset` : 'none',
      appearance: 'none' as const,
      WebkitAppearance: 'none' as const,
      MozAppearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23666666' d='M1 1 L6 6 L11 1'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 8px center',
      backgroundSize: '12px 8px',
      paddingRight: '28px',
      verticalAlign: 'middle'
    }
  }

  const labelStyles = {
    fontSize: '11px',
    fontWeight: '600' as const,
    marginBottom: '2px',
    color: theme.text,
    display: 'block',
    height: '16px',
    lineHeight: '16px'
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

  return (
      <BasePage
        title="Cadastro de Declaração Bloqueada"
        onClose={onClose}
        width="700px"
        height="620px"
        minWidth="700px"
        minHeight="620px"
        resizable={false}
        headerColor={headerColor}
      >
      <div style={{
        padding: '16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Linha 1: Código, Tipo Declaração, Número Declaração */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '120px 180px 1fr',
          gap: '8px',
          alignItems: 'end'
        }}>
          {/* Código */}
          <div>
            <label style={labelStyles}>Código</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => {
                  const valor = e.target.value.replace(/\D/g, '')
                  setFormData({ ...formData, codigo: valor })
                }}
                onFocus={() => setFocusedField('codigo')}
                onBlur={() => setFocusedField(null)}
                style={getInputWithIconStyles('codigo')}
              />
              <button 
                style={iconButtonStyles}
                title="Buscar código"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >🔍</button>
            </div>
          </div>

          {/* Tipo Declaração */}
          <div>
            <label style={labelStyles}>Tipo Declaração</label>
            <select
              value={formData.tipoDeclaracao}
              onChange={(e) => setFormData({ ...formData, tipoDeclaracao: e.target.value })}
              onFocus={() => setFocusedField('tipoDeclaracao')}
              onBlur={() => setFocusedField(null)}
              style={getSelectStyles('tipoDeclaracao')}
            >
              <option value="DNV">DNV</option>
              <option value="DO">DO</option>
            </select>
          </div>

          {/* Número Declaração */}
          <div>
            <label style={labelStyles}>Número Declaração</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={formData.numeroDeclaracao}
                onChange={(e) => setFormData({ ...formData, numeroDeclaracao: e.target.value })}
                onFocus={() => setFocusedField('numeroDeclaracao')}
                onBlur={() => setFocusedField(null)}
                style={getInputWithIconStyles('numeroDeclaracao')}
              />
              <button 
                style={iconButtonStyles}
                title="Buscar número declaração"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >🔍</button>
            </div>
          </div>
        </div>

        {/* Linha 2: Local de Ocorrência, Estabelecimento */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '250px 1fr',
          gap: '8px',
          alignItems: 'end'
        }}>
          {/* Local de Ocorrência */}
          <div>
            <label style={labelStyles}>Local de Ocorrência</label>
            <select
              value={formData.localOcorrencia}
              onChange={(e) => setFormData({ ...formData, localOcorrencia: e.target.value })}
              onFocus={() => setFocusedField('localOcorrencia')}
              onBlur={() => setFocusedField(null)}
              style={getSelectStyles('localOcorrencia')}
            >
              <option value="Hospital">Hospital</option>
              <option value="Domicílio">Domicílio</option>
              <option value="Outros Estab. Saúde">Outros Estab. Saúde</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          {/* Estabelecimento */}
          <div>
            <label style={labelStyles}>Estabelecimento</label>
            <input
              type="text"
              value={formData.estabelecimento}
              onChange={(e) => setFormData({ ...formData, estabelecimento: e.target.value })}
              onFocus={() => setFocusedField('estabelecimento')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyles('estabelecimento')}
            />
          </div>
        </div>

        {/* Linha 3: Logradouro, Endereço, Número */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '150px 1fr 120px',
          gap: '8px',
          alignItems: 'end'
        }}>
          {/* Logradouro */}
          <div>
            <label style={labelStyles}>Logradouro</label>
            <select
              value={formData.logradouro}
              onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
              onFocus={() => setFocusedField('logradouro')}
              onBlur={() => setFocusedField(null)}
              style={getSelectStyles('logradouro')}
            >
              <option value="Rua">Rua</option>
              <option value="Avenida">Avenida</option>
              <option value="Alameda">Alameda</option>
              <option value="Travessa">Travessa</option>
              <option value="Praça">Praça</option>
              <option value="Rodovia">Rodovia</option>
              <option value="Estrada">Estrada</option>
              <option value="Viela">Viela</option>
              <option value="Outros">Outros</option>
            </select>
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
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              onFocus={() => setFocusedField('numero')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyles('numero')}
            />
          </div>
        </div>

        {/* Linha 4: Bairro, Cidade, UF, CEP */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 150px 150px',
          gap: '8px',
          alignItems: 'end'
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
            <select
              value={formData.uf}
              onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
              onFocus={() => setFocusedField('uf')}
              onBlur={() => setFocusedField(null)}
              style={getSelectStyles('uf')}
            >
              <option value="AC">AC</option>
              <option value="AL">AL</option>
              <option value="AP">AP</option>
              <option value="AM">AM</option>
              <option value="BA">BA</option>
              <option value="CE">CE</option>
              <option value="DF">DF</option>
              <option value="ES">ES</option>
              <option value="GO">GO</option>
              <option value="MA">MA</option>
              <option value="MT">MT</option>
              <option value="MS">MS</option>
              <option value="MG">MG</option>
              <option value="PA">PA</option>
              <option value="PB">PB</option>
              <option value="PR">PR</option>
              <option value="PE">PE</option>
              <option value="PI">PI</option>
              <option value="RJ">RJ</option>
              <option value="RN">RN</option>
              <option value="RS">RS</option>
              <option value="RO">RO</option>
              <option value="RR">RR</option>
              <option value="SC">SC</option>
              <option value="SP">SP</option>
              <option value="SE">SE</option>
              <option value="TO">TO</option>
            </select>
          </div>

          {/* CEP */}
          <div>
            <label style={labelStyles}>CEP</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={formData.cep}
                onChange={(e) => {
                  const valor = e.target.value.replace(/\D/g, '').slice(0, 8)
                  setFormData({ ...formData, cep: valor })
                }}
                onFocus={() => setFocusedField('cep')}
                onBlur={async (e) => {
                  setFocusedField(null)
                  const cep = e.target.value
                  
                  // Formata e busca CEP automaticamente ao sair do campo
                  if (cep && cep.length === 8) {
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
        </div>

        {/* Linha 5: Data */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '150px',
          gap: '8px'
        }}>
          {/* Data */}
          <div>
            <label style={labelStyles}>Data</label>
            <input
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              onFocus={() => setFocusedField('data')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyles('data')}
            />
          </div>
        </div>

        {/* Linha 6: Observação */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <label style={labelStyles}>Observação</label>
          <textarea
            value={formData.observacao}
            onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
            onFocus={() => setFocusedField('observacao')}
            onBlur={() => setFocusedField(null)}
            style={{
              ...getInputStyles('observacao'),
              height: '100%',
              minHeight: '120px',
              resize: 'none',
              paddingTop: '8px',
              lineHeight: '1.5'
            }}
            placeholder="Digite observações sobre a declaração bloqueada..."
          />
        </div>

        {/* Botões de Ação */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          paddingTop: '8px',
          borderTop: `1px solid ${theme.border}`
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
            ❌ Excluir
          </button>

          {/* Retornar */}
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
  )
}

