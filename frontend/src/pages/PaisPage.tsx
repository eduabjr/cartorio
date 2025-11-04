import React, { useState, useEffect, useRef } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { useModal } from '../hooks/useModal'
import { useFormPersist, clearPersistedForm } from '../hooks/useFormPersist'

interface PaisPageProps {
  onClose: () => void
}

export const PaisPage: React.FC<PaisPageProps> = ({ onClose }) => {
  const { currentTheme, getTheme } = useAccessibility()
  const persistKeyRef = useRef<string>('')
  const modal = useModal()
  const [updateCount, setUpdateCount] = useState(0)
  
  // 🔒 GARANTIA 100%: Re-renderizar quando currentTheme muda
  useEffect(() => {
    console.log('🎨 PaisPage - Tema mudou para:', currentTheme)
    setUpdateCount(prev => prev + 1)
  }, [currentTheme])
  
  // 🔒 GARANTIA DUPLA: Escutar evento customizado theme-changed
  useEffect(() => {
    const handleThemeChange = (e: any) => {
      console.log('📢 PaisPage - Recebeu evento theme-changed:', e.detail)
      setUpdateCount(prev => prev + 1)
    }
    
    window.addEventListener('theme-changed', handleThemeChange)
    console.log('👂 PaisPage - Escutando evento theme-changed')
    
    return () => {
      window.removeEventListener('theme-changed', handleThemeChange)
    }
  }, [])
  
  const theme = getTheme()
  
  console.log('🔄 PaisPage render #', updateCount, 'Tema:', currentTheme)
  
  // Cor do header: teal no light, laranja no dark
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'

  // Estado para o formulário
  const [formData, setFormData] = useState({
    codigo: '',
    nomePais: '',
    sigla: '',
    numeroIBGE: '',
    nacionalidadeMasculino: '',
    nacionalidadeFeminino: ''
  })

  // Estado para campo em foco
  const [focusedField, setFocusedField] = useState<string | null>(null)
  
  // 💾 Persistir dados do formulário automaticamente
  const persistKey = 'form-pais-' + (formData.codigo || 'novo')
  persistKeyRef.current = persistKey
  useFormPersist(persistKey, formData, setFormData, true, 500)
  
  const handleClose = () => {
    clearPersistedForm(persistKeyRef.current)
    onClose()
  }

  // Função para criar novo registro
  const handleNovo = () => {
    setFormData({
      codigo: '',
      nomePais: '',
      sigla: '',
      numeroIBGE: '',
      nacionalidadeMasculino: '',
      nacionalidadeFeminino: ''
    })
  }

  // Função para gravar registro
  const handleGravar = async () => {
    console.log('Salvando país:', formData)
    await modal.alert('✅ País salvo com sucesso!')
    clearPersistedForm('form-pais-' + (formData.codigo || 'novo'))
  }

  // Função para excluir registro
  const handleExcluir = async () => {
    const confirmado = await modal.confirm('⚠️ Deseja realmente excluir este país?')
    if (confirmado) {
      handleNovo()
      await modal.alert('✅ País excluído com sucesso!')
      clearPersistedForm('form-pais-' + (formData.codigo || 'novo'))
    }
  }

  // Cor de foco dinâmica baseada no tema
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

  const getInputWithIconStylesEdge = (fieldName: string) => ({
    ...getInputStyles(fieldName),
    paddingRight: '21px'
  })

  const labelStyles = {
    fontSize: '11px',
    fontWeight: '600' as const,
    marginBottom: '0',
    display: 'block',
    color: theme.text,
    height: '16px',
    lineHeight: '16px'
  }

  const iconButtonStylesEdge = {
    position: 'absolute' as const,
    right: '1px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0px',
    width: '16px',
    height: '16px',
    borderRadius: '0px',
    color: theme.primary,
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
    boxShadow: 'none'
  }

  const buttonStyles = {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600' as const,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: '#6c757d',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  }

  return (
    <BasePage
      title="Cadastro de Pais"
      onClose={handleClose}
      width="700px"
      height="380px"
      minWidth="700px"
      minHeight="380px"
      resizable={false}
      headerColor={headerColor}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px'
      }}>
        {/* Linha 1: Código */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          {/* Código */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '220px' }}>
            <label style={{ ...labelStyles, minWidth: '50px' }}>Código</label>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                onFocus={() => setFocusedField('codigo')}
                onBlur={() => setFocusedField(null)}
                style={getInputWithIconStylesEdge('codigo')}
                placeholder="Código"
              />
              <button 
                style={iconButtonStylesEdge}
                title="Buscar código"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >🔍</button>
            </div>
          </div>
        </div>

        {/* Linha 2: Nome País e Sigla */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          {/* Nome País */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <label style={{ ...labelStyles, minWidth: '60px' }}>Nome País</label>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={formData.nomePais}
                onChange={(e) => setFormData({ ...formData, nomePais: e.target.value })}
                onFocus={() => setFocusedField('nomePais')}
                onBlur={() => setFocusedField(null)}
                style={getInputWithIconStylesEdge('nomePais')}
                placeholder="Digite o nome do país"
              />
              <button 
                style={iconButtonStylesEdge}
                title="Buscar país"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >🔍</button>
            </div>
          </div>

          {/* Sigla */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
            <label style={{ ...labelStyles, minWidth: '35px' }}>Sigla</label>
            <input
              type="text"
              value={formData.sigla}
              onChange={(e) => setFormData({ ...formData, sigla: e.target.value.toUpperCase() })}
              onFocus={() => setFocusedField('sigla')}
              onBlur={() => setFocusedField(null)}
              style={{ ...getInputStyles('sigla'), flex: 1 }}
              placeholder="BR"
              maxLength={3}
            />
          </div>
        </div>

        {/* Linha 3: Número IBGE */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          {/* Número IBGE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '220px' }}>
            <label style={{ ...labelStyles, minWidth: '50px' }}>Nº IBGE</label>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={formData.numeroIBGE}
                onChange={(e) => setFormData({ ...formData, numeroIBGE: e.target.value })}
                onFocus={() => setFocusedField('numeroIBGE')}
                onBlur={() => setFocusedField(null)}
                style={getInputWithIconStylesEdge('numeroIBGE')}
                placeholder="Código IBGE"
              />
              <button 
                style={iconButtonStylesEdge}
                title="Buscar número IBGE"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >🔍</button>
            </div>
          </div>
        </div>

        {/* Linha 4: Nacionalidade (Masculino) */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <label style={{ ...labelStyles, minWidth: '140px' }}>Nacionalidade (Masculino)</label>
            <input
              type="text"
              value={formData.nacionalidadeMasculino}
              onChange={(e) => setFormData({ ...formData, nacionalidadeMasculino: e.target.value })}
              onFocus={() => setFocusedField('nacionalidadeMasculino')}
              onBlur={() => setFocusedField(null)}
              style={{ ...getInputStyles('nacionalidadeMasculino'), flex: 1 }}
              placeholder="Ex: Brasileiro"
            />
          </div>
        </div>

        {/* Linha 5: Nacionalidade (Feminino) */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <label style={{ ...labelStyles, minWidth: '140px' }}>Nacionalidade (Feminino)</label>
            <input
              type="text"
              value={formData.nacionalidadeFeminino}
              onChange={(e) => setFormData({ ...formData, nacionalidadeFeminino: e.target.value })}
              onFocus={() => setFocusedField('nacionalidadeFeminino')}
              onBlur={() => setFocusedField(null)}
              style={{ ...getInputStyles('nacionalidadeFeminino'), flex: 1 }}
              placeholder="Ex: Brasileira"
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          paddingTop: '8px',
          marginTop: '8px',
          borderTop: `1px solid ${theme.border}`
        }}>
          <button
            onClick={handleNovo}
            style={buttonStyles}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#495057'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
          >
            <span>📄</span>
            <span>Novo</span>
          </button>
          <button
            onClick={handleGravar}
            style={buttonStyles}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#495057'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
          >
            <span>💾</span>
            <span>Gravar</span>
          </button>
          <button
            onClick={handleExcluir}
            style={buttonStyles}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#495057'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
          >
            <span>❌</span>
            <span>Excluir</span>
          </button>
          <button
            onClick={onClose}
            style={buttonStyles}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#495057'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
          >
            <span>🚪</span>
            <span>Retornar</span>
          </button>
        </div>
      </div>
      {/* Modal Component */}
      <modal.ModalComponent />
    </BasePage>
  )
}

