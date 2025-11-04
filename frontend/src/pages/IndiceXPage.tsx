import { useState, useRef } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { useModal } from '../hooks/useModal'
import { useFormPersist, clearPersistedForm } from '../hooks/useFormPersist'

interface IndiceXPageProps {
  onClose: () => void
}

type SubTab = 'cadastro' | 'imagens'

export function IndiceXPage({ onClose }: IndiceXPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const modal = useModal()
  const persistKeyRef = useRef<string>('')
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
  
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('cadastro')
  const [statusMessage, setStatusMessage] = useState('Pronto')

  // Estados para Índice X
  const [formData, setFormData] = useState({
    livro: '',
    folhas: '',
    termo: '',
    dataTermo: '',
    cidade: 'SANTO ANDRÉ',
    tipo: '',
    descricao: '',
    observacoes: ''
  })
  
  // 💾 Persistir dados do formulário automaticamente
  const persistKey = 'form-indice-x-' + (formData.termo || 'novo')
  persistKeyRef.current = persistKey
  useFormPersist(persistKey, formData, setFormData, true, 500)
  
  const handleClose = () => {
    clearPersistedForm(persistKeyRef.current)
    onClose()
  }

  const subTabStyles = (isActive: boolean) => ({
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '500' as const,
    border: 'none',
    borderBottom: isActive ? `3px solid ${theme.primary}` : '3px solid transparent',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: theme.text,
    marginRight: '8px',
    transition: 'all 0.2s'
  })

  const inputStyles = {
    width: '100%',
    padding: '6px 8px',
    fontSize: '13px',
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    backgroundColor: theme.background,
    color: theme.text,
    boxSizing: 'border-box' as const
  }

  const labelStyles = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500' as const,
    marginBottom: '4px',
    color: theme.text
  }

  const buttonStyles = {
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '500' as const,
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    cursor: 'pointer',
    backgroundColor: theme.surface,
    color: theme.text,
    transition: 'all 0.2s'
  }

  const searchIconStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    marginLeft: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  }

  const renderCadastro = () => (
    <div style={{ padding: '16px' }}>
      {/* Linha 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '100px 100px 100px 150px 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyles}>Livro</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input 
              type="text" 
              style={inputStyles} 
              value={formData.livro} 
              onChange={(e) => setFormData({...formData, livro: e.target.value})} 
            />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Folha(s)</label>
          <input 
            type="text" 
            style={inputStyles} 
            value={formData.folhas} 
            onChange={(e) => setFormData({...formData, folhas: e.target.value})} 
          />
        </div>
        <div>
          <label style={labelStyles}>Termo</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input 
              type="text" 
              style={inputStyles} 
              value={formData.termo} 
              onChange={(e) => setFormData({...formData, termo: e.target.value})} 
            />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Data Termo</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input 
              type="date" 
              style={inputStyles} 
              value={formData.dataTermo} 
              onChange={(e) => setFormData({...formData, dataTermo: e.target.value})} 
            />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Cidade (Registro)</label>
          <input 
            type="text" 
            style={inputStyles} 
            value={formData.cidade} 
            onChange={(e) => setFormData({...formData, cidade: e.target.value})} 
          />
        </div>
      </div>

      {/* Linha 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyles}>Tipo</label>
          <input 
            type="text" 
            style={inputStyles} 
            value={formData.tipo} 
            onChange={(e) => setFormData({...formData, tipo: e.target.value})} 
          />
        </div>
        <div>
          <label style={labelStyles}>Descrição</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input 
              type="text" 
              style={inputStyles} 
              value={formData.descricao} 
              onChange={(e) => setFormData({...formData, descricao: e.target.value})} 
            />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
      </div>

      {/* Linha 3 */}
      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyles}>Observações</label>
        <textarea
          style={{
            ...inputStyles,
            minHeight: '80px',
            resize: 'vertical' as const,
            fontFamily: 'inherit'
          }}
          value={formData.observacoes}
          onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
        />
      </div>
    </div>
  )

  const renderContent = () => {
    if (activeSubTab === 'imagens') {
      return (
        <div style={{ 
          flex: 1, 
          backgroundColor: theme.background, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: theme.text
        }}>
          <p>Área de visualização de imagens</p>
        </div>
      )
    }

    return renderCadastro()
  }

  const handleNovo = async () => {
    setFormData({
      livro: '',
      folhas: '',
      termo: '',
      dataTermo: '',
      cidade: 'SANTO ANDRÉ',
      tipo: '',
      descricao: '',
      observacoes: ''
    })
    await modal.alert('Novo registro iniciado', 'Informação', 'ℹ️')
  }

  const handleGravar = async () => {
    if (!formData.livro || !formData.termo) {
      await modal.alert('Por favor, preencha os campos obrigatórios: Livro e Termo', 'Campos Obrigatórios', '⚠️')
      return
    }

    // Aqui você pode salvar no localStorage
    await modal.alert('Registro gravado com sucesso!', 'Sucesso', '✅')
    setStatusMessage(`Último registro salvo - Termo: ${formData.termo} Livro: ${formData.livro} Folha(s): ${formData.folhas}`)
  }

  const handleExcluir = async () => {
    const confirmado = await modal.confirm('Tem certeza que deseja excluir este registro?', 'Confirmar Exclusão', '⚠️')
    if (confirmado) {
      setFormData({
        livro: '',
        folhas: '',
        termo: '',
        dataTermo: '',
        cidade: 'SANTO ANDRÉ',
        tipo: '',
        descricao: '',
        observacoes: ''
      })
      await modal.alert('Registro excluído com sucesso!', 'Sucesso', '✅')
    }
  }

  return (
    <>
      <BasePage
        title="Índice X"
        onClose={handleClose}
        width="1000px"
        height="650px"
        minWidth="1000px"
        minHeight="650px"
        resizable={false}
        headerColor={headerColor}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0' }}>
          {/* Sub-abas */}
          <div style={{ display: 'flex', gap: '8px', padding: '8px 16px', borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
            <button onClick={() => setActiveSubTab('cadastro')} style={subTabStyles(activeSubTab === 'cadastro')}>
              Cadastro / Manutenção
            </button>
            <button onClick={() => setActiveSubTab('imagens')} style={subTabStyles(activeSubTab === 'imagens')}>
              Imagens
            </button>
          </div>

          {/* Área de Conteúdo */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Formulário */}
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: theme.background }}>
              {renderContent()}
              
              {/* Área branca central para visualização */}
              {activeSubTab === 'cadastro' && (
                <div style={{ 
                  margin: '16px', 
                  minHeight: '200px', 
                  backgroundColor: '#ffffff', 
                  border: `1px solid ${theme.border}`,
                  borderRadius: '4px'
                }}></div>
              )}
            </div>

            {/* Barra lateral de navegação */}
            <div style={{ 
              width: '120px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px', 
              padding: '16px 8px',
              backgroundColor: theme.surface,
              borderLeft: `1px solid ${theme.border}`
            }}>
              <button style={buttonStyles}>Primeira</button>
              <button style={buttonStyles}>Anterior</button>
              <button style={buttonStyles}>Próxima</button>
              <button style={buttonStyles}>Última</button>
              <button style={buttonStyles}>+ Zoom</button>
              <button style={buttonStyles}>- Zoom</button>
            </div>
          </div>

          {/* Botões de Ação */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            padding: '12px 16px', 
            borderTop: `1px solid ${theme.border}`,
            backgroundColor: theme.surface,
            justifyContent: 'center'
          }}>
            <button onClick={handleNovo} style={{ ...buttonStyles, display: 'flex', alignItems: 'center', gap: '6px' }}>
              📄 Novo
            </button>
            <button onClick={handleGravar} style={{ ...buttonStyles, display: 'flex', alignItems: 'center', gap: '6px' }}>
              ✅ Gravar
            </button>
            <button onClick={handleExcluir} style={{ ...buttonStyles, display: 'flex', alignItems: 'center', gap: '6px' }}>
              ❌ Excluir
            </button>
            <button onClick={onClose} style={{ ...buttonStyles, display: 'flex', alignItems: 'center', gap: '6px' }}>
              🔙 Retornar
            </button>
            <button style={{ ...buttonStyles, display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '20px' }}>
              🔓 Liberar CRC
            </button>
          </div>

          {/* Status Bar */}
          <div style={{ 
            padding: '6px 16px', 
            fontSize: '12px', 
            backgroundColor: theme.surface,
            borderTop: `1px solid ${theme.border}`,
            color: theme.text
          }}>
            {statusMessage}
          </div>
        </div>
        
        {/* Modal Component - DENTRO da janela */}
        <modal.ModalComponent />
      </BasePage>
    </>
  )
}

