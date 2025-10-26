import React, { useState } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'

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
    cidade: '',
    uf: 'SP',
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
      cidade: '',
      uf: 'SP',
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

  // Cor de foco (laranja)
  const focusColor = '#FF8C00'
  const focusTextColor = '#FFFFFF'

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
    WebkitBoxShadow: focusedField === fieldName ? `0 0 0 1000px ${focusColor} inset` : `0 0 0 1000px ${theme.background} inset`,
    WebkitTextFillColor: focusedField === fieldName ? focusTextColor : theme.text,
    boxShadow: focusedField === fieldName ? `0 0 0 1000px ${focusColor} inset` : 'none'
  })

  const getSelectStyles = (fieldName: string) => ({
    ...getInputStyles(fieldName),
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(focusedField === fieldName ? focusTextColor : theme.text)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    backgroundSize: '12px',
    paddingRight: '28px',
    height: '28px',
    boxSizing: 'border-box' as const,
    lineHeight: '18px'
  })

  const labelStyles = {
    fontSize: '11px',
    fontWeight: '600' as const,
    marginBottom: '2px',
    color: theme.text,
    display: 'block'
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
      height="500px"
      minWidth="700px"
      minHeight="500px"
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
        {/* Linha 1: Código, Tipo Declaração */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr',
          gap: '8px'
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
        </div>

        {/* Linha 2: Número Declaração, Data */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 150px',
          gap: '8px'
        }}>
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

        {/* Linha 3: Cidade, UF */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 150px',
          gap: '8px'
        }}>
          {/* Cidade */}
          <div>
            <label style={labelStyles}>Cidade</label>
            <input
              type="text"
              value={formData.cidade}
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              onFocus={() => setFocusedField('cidade')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyles('cidade')}
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
        </div>

        {/* Observação */}
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
              backgroundColor: '#28a745',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e7e34'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#28a745'
            }}
          >
            💾 Gravar
          </button>

          {/* Excluir */}
          <button
            onClick={handleExcluir}
            style={{
              ...buttonStyles,
              backgroundColor: '#dc3545',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#bd2130'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#dc3545'
            }}
          >
            ❌ Excluir
          </button>

          {/* Fechar */}
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
            ❌ Fechar
          </button>
        </div>
      </div>
    </BasePage>
  )
}

