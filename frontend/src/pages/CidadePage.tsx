import React, { useState, useEffect, useRef } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { CustomSelect } from '../components/CustomSelect'
import { UF_OPTIONS } from '../constants/selectOptions'
import { useModal } from '../hooks/useModal'
import { useFormPersist, clearPersistedForm } from '../hooks/useFormPersist'

interface CidadePageProps {
  onClose: () => void
}

export const CidadePage: React.FC<CidadePageProps> = ({ onClose }) => {
  const { currentTheme, getTheme } = useAccessibility()
  const modal = useModal()
  const [updateCount, setUpdateCount] = useState(0)
  
  // 🔒 Criar uma ref para armazenar a chave de persistência
  const persistKeyRef = useRef<string>('')
  
  // 🔒 GARANTIA 100%: Re-renderizar quando currentTheme muda
  useEffect(() => {
    console.log('🎨 CidadePage - Tema mudou para:', currentTheme)
    setUpdateCount(prev => prev + 1)
  }, [currentTheme])
  
  // 🔒 GARANTIA DUPLA: Escutar evento customizado theme-changed
  useEffect(() => {
    const handleThemeChange = (e: any) => {
      console.log('📢 CidadePage - Recebeu evento theme-changed:', e.detail)
      setUpdateCount(prev => prev + 1)
    }
    
    window.addEventListener('theme-changed', handleThemeChange)
    console.log('👂 CidadePage - Escutando evento theme-changed')
    
    return () => {
      window.removeEventListener('theme-changed', handleThemeChange)
    }
  }, [])
  
  const theme = getTheme()
  
  console.log('🔄 CidadePage render #', updateCount, 'Tema:', currentTheme)
  
  // Cor do header: teal no light, laranja no dark
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'

  // Estado para o formulário
  const [formData, setFormData] = useState({
    nomeCidade: '',
    uf: '',
    numeroIBGE: ''
  })

  // Estado para campo em foco
  const [focusedField, setFocusedField] = useState<string | null>(null)
  
  // 💾 Persistir dados do formulário automaticamente
  const persistKey = 'form-cidade-' + (formData.numeroIBGE || 'novo')
  persistKeyRef.current = persistKey
  useFormPersist(persistKey, formData, setFormData, true, 500)
  
  // 🔒 Limpar dados persistidos ao fechar a janela
  const handleClose = () => {
    clearPersistedForm(persistKeyRef.current)
    console.log(`🗑️ Janela fechada - Limpando dados temporários: "${persistKeyRef.current}"`)
    onClose()
  }

  // Função para criar novo registro
  const handleNovo = () => {
    setFormData({
      nomeCidade: '',
      uf: '',
      numeroIBGE: ''
    })
  }

  // Função para gravar registro
  const handleGravar = async () => {
    console.log('Salvando cidade:', formData)
    await modal.alert('✅ Cidade salva com sucesso!')
    
    // Limpar dados persistidos após salvar
    clearPersistedForm('form-cidade-' + (formData.numeroIBGE || 'novo'))
  }

  // Função para excluir registro
  const handleExcluir = async () => {
    const confirmado = await modal.confirm('⚠️ Deseja realmente excluir esta cidade?')
    if (confirmado) {
      handleNovo()
      await modal.alert('✅ Cidade excluída com sucesso!')
      
      // Limpar dados persistidos após excluir
      clearPersistedForm('form-cidade-' + (formData.numeroIBGE || 'novo'))
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

  const arrowColor = currentTheme === 'dark' ? '%23FFFFFF' : '%23333333'
  const getSelectStyles = (fieldName: string) => {
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
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='${arrowColor}' d='M1 1 L6 6 L11 1'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 8px center',
      backgroundSize: '14px 10px',
      paddingRight: '30px',
      verticalAlign: 'middle'
    }
  }

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
      title="Cadastro de Cidade (IBGE)"
      onClose={handleClose}
      width="600px"
      height="300px"
      minWidth="600px"
      minHeight="300px"
      resizable={false}
      headerColor={headerColor}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px'
      }}>
        {/* Linha 1: Nome da Cidade e UF */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          {/* Nome da Cidade */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <label style={{ ...labelStyles, minWidth: '90px' }}>Nome da Cidade</label>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={formData.nomeCidade}
                onChange={(e) => setFormData({ ...formData, nomeCidade: e.target.value })}
                onFocus={() => setFocusedField('nomeCidade')}
                onBlur={() => setFocusedField(null)}
                style={getInputWithIconStylesEdge('nomeCidade')}
                placeholder="Digite o nome da cidade"
              />
              <button 
                style={iconButtonStylesEdge}
                title="Buscar cidade"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >🔍</button>
            </div>
          </div>

          {/* UF */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
            <label style={{ ...labelStyles, minWidth: '20px' }}>UF</label>
            <CustomSelect
              value={formData.uf}
              onChange={(value) => setFormData({ ...formData, uf: value })}
              options={UF_OPTIONS}
              maxVisibleItems={5}
            />
          </div>
        </div>

        {/* Linha 2: Número IBGE */}
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

