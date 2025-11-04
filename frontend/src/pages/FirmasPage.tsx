import { useState, useRef } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { useModal } from '../hooks/useModal'
import { useFormPersist, clearPersistedForm } from '../hooks/useFormPersist'

interface FirmasPageProps {
  onClose: () => void
}

export function FirmasPage({ onClose }: FirmasPageProps) {
  console.log('📺 FirmasPage RENDERIZADO!')
  
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const modal = useModal()
  const persistKeyRef = useRef<string>('')
  
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    cpf: '',
    rg: '',
    tipoDocumento: '',
    observacoes: ''
  })

  // 💾 Persistir dados do formulário automaticamente
  const persistKey = 'form-firmas-' + (formData.codigo || 'novo')
  persistKeyRef.current = persistKey
  useFormPersist(persistKey, formData, setFormData, true, 500)
  
  const handleClose = () => {
    clearPersistedForm(persistKeyRef.current)
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleNovo = () => {
    setFormData({
      codigo: '',
      nome: '',
      cpf: '',
      rg: '',
      tipoDocumento: '',
      observacoes: ''
    })
  }
  
  const handleGravar = async () => {
    await modal.alert('✅ Firma salva com sucesso!')
    clearPersistedForm('form-firmas-' + (formData.codigo || 'novo'))
  }
  
  const handleExcluir = async () => {
    const confirmado = await modal.confirm('⚠️ Deseja realmente excluir esta firma?')
    if (confirmado) {
      handleNovo()
      await modal.alert('✅ Firma excluída com sucesso!')
      clearPersistedForm('form-firmas-' + (formData.codigo || 'novo'))
    }
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

  const arrowColor = currentTheme === 'dark' ? '%23FFFFFF' : '%23333333'
  const selectStyles = {
    ...inputStyles,
    cursor: 'pointer',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    MozAppearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${arrowColor}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    backgroundSize: '14px',
    paddingRight: '30px'
  }

  const textareaStyles = {
    ...inputStyles,
    minHeight: '100px',
    resize: 'vertical' as const
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
    <BasePage title="Firmas" onClose={handleClose} width="800px" height="600px">
      <form style={formStyles}>
        <div style={fieldStyles}>
          <label style={labelStyles}>Código</label>
                      <input
                        type="text"
                        value={formData.codigo}
            onChange={(e) => handleInputChange('codigo', e.target.value)}
            style={inputStyles}
            placeholder="Código da firma"
          />
                  </div>

        <div style={fieldStyles}>
          <label style={labelStyles}>Nome *</label>
                    <input
                      type="text"
                      value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value.toUpperCase())}
            style={{...inputStyles, textTransform: 'uppercase'}}
            placeholder="Nome completo"
                      required
                    />
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
            placeholder="Número do RG"
                      required
                    />
                  </div>

        <div style={fieldStyles}>
          <label style={labelStyles}>Tipo de Documento</label>
                    <select
            value={formData.tipoDocumento}
            onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
            style={selectStyles}
          >
            <option value="">Selecione o tipo</option>
            <option value="CONTRATO">Contrato</option>
            <option value="PROCURACAO">Procuração</option>
            <option value="RECONHECIMENTO">Reconhecimento de Firma</option>
            <option value="AUTENTICACAO">Autenticação</option>
                    </select>
                  </div>

        <div style={{ ...fieldStyles, gridColumn: '1 / -1' }}>
          <label style={labelStyles}>Observações</label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            style={textareaStyles}
            placeholder="Observações adicionais..."
          />
              </div>
            </form>

      {/* Botões de Ação */}
      <div style={buttonsContainerStyles}>
        <button type="button" style={primaryButtonStyles} onClick={handleNovo}>
            📄 Novo
          </button>
        <button type="button" style={primaryButtonStyles} onClick={handleGravar}>
            💾 Gravar
          </button>
        <button type="button" style={secondaryButtonStyles} onClick={handleNovo}>
            🧹 Limpar
          </button>
        <button type="button" style={secondaryButtonStyles}>
          🔍 Consultar
          </button>
        <button type="button" style={dangerButtonStyles} onClick={handleExcluir}>
            ❌ Excluir
          </button>
        <button type="button" style={dangerButtonStyles} onClick={onClose}>
            🚪 Fechar
          </button>
        </div>
      {/* Modal Component */}
      <modal.ModalComponent />
    </BasePage>
  )
}
