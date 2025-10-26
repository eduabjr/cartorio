import React, { useState, useRef, useEffect } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { pdfService } from '../services/PDFService'

interface OficiosMandadosPageProps {
  onClose: () => void
}

export const OficiosMandadosPage: React.FC<OficiosMandadosPageProps> = ({ onClose }) => {
  const { currentTheme, getTheme } = useAccessibility()
  const theme = getTheme()
  
  // Cor do header: teal no light, laranja no dark
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'

  // Estado para o formulário
  const [formData, setFormData] = useState({
    // Entrada
    data: new Date().toISOString().split('T')[0],
    atendente: '',
    tipo: '',
    previsaoEntrega: '',
    protocolo: '',
    // Arquivamento
    sequencia: '',
    pasta: '',
    folha: '',
    // Campos principais
    oficio: '',
    vara: '',
    processo: '',
    parte1: '',
    parte2: '',
    determinacao: '',
    // Cumprimento
    cumprimentoData: '',
    cumprimentoLivro: '',
    cumprimentoFolhas: '',
    cumprimentoTermo: ''
  })

  // Estado para campo em foco
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState<'cadastro' | 'digitalizacao'>('cadastro')

  // Estados para digitalização
  const [scannedImages, setScannedImages] = useState<File[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState<number>(100) // Zoom em porcentagem
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estados para arrastar documento
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const viewerRef = useRef<HTMLDivElement>(null)

  // Função para criar novo registro
  const handleNovo = () => {
    setFormData({
      data: new Date().toISOString().split('T')[0],
      atendente: '',
      tipo: '',
      previsaoEntrega: '',
      protocolo: '',
      sequencia: '',
      pasta: '',
      folha: '',
      oficio: '',
      vara: '',
      processo: '',
      parte1: '',
      parte2: '',
      determinacao: '',
      cumprimentoData: '',
      cumprimentoLivro: '',
      cumprimentoFolhas: '',
      cumprimentoTermo: ''
    })
  }

  // Função para gravar registro
  const handleGravar = () => {
    console.log('Salvando ofício/mandado:', formData)
    alert('✅ Ofício/Mandado salvo com sucesso!')
  }

  // Função para excluir registro
  const handleExcluir = () => {
    if (confirm('⚠️ Deseja realmente excluir este ofício/mandado?')) {
      handleNovo()
      alert('✅ Ofício/Mandado excluído com sucesso!')
    }
  }

  // Funções para Digitalização

  // Adquirir/Importar imagens
  const handleAdquirir = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const imageFiles: File[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (pdfService.isImageFile(file)) {
        imageFiles.push(file)
      } else {
        alert(`❌ Arquivo ${file.name} não é uma imagem válida`)
      }
    }

    if (imageFiles.length > 0) {
      setScannedImages(prev => [...prev, ...imageFiles])
      setCurrentImageIndex(scannedImages.length) // Ir para a primeira nova imagem
      
      // Mostrar preview da primeira imagem
      const firstImage = imageFiles[0]
      const url = URL.createObjectURL(firstImage)
      setPreviewUrl(url)
      
      alert(`✅ ${imageFiles.length} imagem(ns) importada(s) com sucesso!`)
    }
  }

  // Navegação de imagens
  const handleAnterior = () => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1
      setCurrentImageIndex(newIndex)
      updatePreview(newIndex)
      resetPosition()
    }
  }

  const handleProximo = () => {
    if (currentImageIndex < scannedImages.length - 1) {
      const newIndex = currentImageIndex + 1
      setCurrentImageIndex(newIndex)
      updatePreview(newIndex)
      resetPosition()
    }
  }

  const updatePreview = (index: number) => {
    if (scannedImages[index]) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      const url = URL.createObjectURL(scannedImages[index])
      setPreviewUrl(url)
    }
  }

  // Excluir imagem atual
  const handleExcluirImagem = () => {
    if (scannedImages.length === 0) {
      alert('⚠️ Não há imagens para excluir')
      return
    }

    if (confirm('⚠️ Deseja realmente excluir esta imagem?')) {
      const newImages = [...scannedImages]
      newImages.splice(currentImageIndex, 1)
      setScannedImages(newImages)

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }

      if (newImages.length === 0) {
        setPreviewUrl(null)
        setCurrentImageIndex(0)
      } else {
        const newIndex = currentImageIndex >= newImages.length ? newImages.length - 1 : currentImageIndex
        setCurrentImageIndex(newIndex)
        updatePreview(newIndex)
      }

      alert('✅ Imagem excluída com sucesso!')
    }
  }

  // Converter imagens para PDF (IPDF)
  const handleIPDF = async () => {
    if (scannedImages.length === 0) {
      alert('⚠️ Não há imagens para converter em PDF')
      return
    }

    try {
      console.log('🔄 Convertendo imagens para PDF...')
      
      // Converter arquivos para Base64
      const imageDataPromises = scannedImages.map(file => pdfService.fileToBase64(file))
      const imageData = await Promise.all(imageDataPromises)

      // Gerar PDF
      const pdfBlob = await pdfService.imagesToPDF({
        images: imageData,
        pageSize: 'a4',
        orientation: 'portrait',
        metadata: {
          title: `Ofício/Mandado - ${formData.oficio || 'Sem número'}`,
          author: 'Sistema de Cartório',
          subject: 'Documento Digitalizado',
          creator: 'Controle de Ofícios e Mandados'
        }
      })

      // Abrir PDF em nova aba
      pdfService.openPDFInNewTab(pdfBlob)
      
      alert(`✅ PDF gerado com sucesso!\n${scannedImages.length} página(s) convertida(s)`)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('❌ Erro ao gerar PDF. Verifique as imagens e tente novamente.')
    }
  }

  // Visualizar imagem em tamanho completo
  const handleVisualizarImagem = () => {
    if (scannedImages.length === 0 || !previewUrl) {
      alert('⚠️ Não há imagens para visualizar')
      return
    }

    // Abrir imagem em nova aba
    window.open(previewUrl, '_blank')
  }

  // Função para imprimir documento
  const handleImprimir = async () => {
    if (scannedImages.length === 0) {
      alert('⚠️ Não há imagens para imprimir')
      return
    }

    try {
      // Gerar PDF temporário para impressão
      const imageDataPromises = scannedImages.map(file => pdfService.fileToBase64(file))
      const imageData = await Promise.all(imageDataPromises)

      const pdfBlob = await pdfService.imagesToPDF({
        images: imageData,
        pageSize: 'a4',
        orientation: 'portrait',
        metadata: {
          title: `Impressão - ${formData.oficio || 'Documento'}`,
          author: 'Sistema de Cartório'
        }
      })

      // Criar URL temporária e abrir para impressão
      const url = URL.createObjectURL(pdfBlob)
      const printWindow = window.open(url, '_blank')
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
          setTimeout(() => URL.revokeObjectURL(url), 1000)
        }
      }
    } catch (error) {
      console.error('Erro ao imprimir:', error)
      alert('❌ Erro ao preparar documento para impressão')
    }
  }

  // Função para digitalizar via scanner
  const handleScanner = () => {
    // Simular abertura de múltiplos arquivos (Scanner)
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
    alert('📷 Selecione as imagens digitalizadas\n\n💡 Dica: Você pode selecionar múltiplos arquivos de uma vez (Ctrl+Click ou Shift+Click)')
  }

  // Funções de Zoom
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200)) // Máximo 200%
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50)) // Mínimo 50%
  }
  
  // Resetar posição ao mudar de imagem
  const resetPosition = () => {
    if (viewerRef.current) {
      viewerRef.current.scrollLeft = 0
      viewerRef.current.scrollTop = 0
    }
  }

  // Navegação rápida
  const handlePrimeiro = () => {
    if (scannedImages.length > 0) {
      setCurrentImageIndex(0)
      updatePreview(0)
      resetPosition()
    }
  }

  const handleUltimo = () => {
    if (scannedImages.length > 0) {
      const lastIndex = scannedImages.length - 1
      setCurrentImageIndex(lastIndex)
      updatePreview(lastIndex)
      resetPosition()
    }
  }

  // Funções para arrastar documento (Pan)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!viewerRef.current || !previewUrl) return
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX + viewerRef.current.scrollLeft,
      y: e.clientY + viewerRef.current.scrollTop
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !viewerRef.current) return
    e.preventDefault()
    
    const deltaX = dragStart.x - e.clientX
    const deltaY = dragStart.y - e.clientY
    
    viewerRef.current.scrollLeft = deltaX
    viewerRef.current.scrollTop = deltaY
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  // Resetar zoom e posição ao trocar de imagem
  useEffect(() => {
    resetPosition()
  }, [currentImageIndex])

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
    display: 'block',
    color: theme.text,
    height: '16px',
    lineHeight: '16px'
  }

  const sectionTitleStyles = {
    fontSize: '12px',
    fontWeight: '700' as const,
    marginBottom: '8px',
    marginTop: '8px',
    color: theme.text,
    borderBottom: `1px solid ${theme.border}`,
    paddingBottom: '4px'
  }

  const iconButtonStyles = {
    position: 'absolute' as const,
    right: '4px',
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

  const getInputWithIconStyles = (fieldName: string) => ({
    ...getInputStyles(fieldName),
    paddingRight: '26px'
  })

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

  // Estilos para botões da digitalização (pequenos e delicados)
  const digitalButtonStyles = (bgColor: string, isDisabled: boolean = false) => ({
    padding: '6px 10px',
    fontSize: '11px',
    fontWeight: '600' as const,
    border: 'none',
    borderRadius: '4px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: isDisabled ? '#999' : bgColor,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    opacity: isDisabled ? 0.6 : 1,
    minWidth: '75px',
    justifyContent: 'center',
    whiteSpace: 'nowrap' as const
  })

  const getTabStyles = (isActive: boolean) => ({
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600' as const,
    border: 'none',
    borderBottom: isActive ? `3px solid ${headerColor}` : '3px solid transparent',
    backgroundColor: isActive ? (currentTheme === 'dark' ? '#2a2a2a' : '#f8f9fa') : 'transparent',
    color: isActive ? headerColor : theme.text,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none'
  })

  return (
    <BasePage
      title="Controle de Ofícios e Mandados"
      onClose={onClose}
      width="900px"
      height="700px"
      minWidth="900px"
      minHeight="700px"
      resizable={false}
      headerColor={headerColor}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Abas de Navegação */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${theme.border}`,
          backgroundColor: currentTheme === 'dark' ? '#1a1a1a' : '#fff'
        }}>
          <button
            onClick={() => setActiveTab('cadastro')}
            style={getTabStyles(activeTab === 'cadastro')}
            onMouseEnter={(e) => {
              if (activeTab !== 'cadastro') {
                e.currentTarget.style.backgroundColor = currentTheme === 'dark' ? '#333' : '#e9ecef'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'cadastro') {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            Cadastro / Manutenção
          </button>
          <button
            onClick={() => setActiveTab('digitalizacao')}
            style={getTabStyles(activeTab === 'digitalizacao')}
            onMouseEnter={(e) => {
              if (activeTab !== 'digitalizacao') {
                e.currentTarget.style.backgroundColor = currentTheme === 'dark' ? '#333' : '#e9ecef'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'digitalizacao') {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            Digitalização
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div style={{
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {activeTab === 'cadastro' && (
            <>
              {/* Seção Entrada */}
              <div style={sectionTitleStyles}>Entrada</div>
        
        {/* Linha 1: Data, Atendente, Previsão Entrega */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          {/* Data */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '200px' }}>
            <label style={{ ...labelStyles, marginBottom: '0', minWidth: '50px' }}>Data</label>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                onFocus={() => setFocusedField('data')}
                onBlur={() => setFocusedField(null)}
                style={getInputWithIconStyles('data')}
              />
              <button 
                style={iconButtonStyles}
                title="Buscar data"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >🔍</button>
            </div>
          </div>

          {/* Atendente */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <label style={{ ...labelStyles, marginBottom: '0', width: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Atendente</label>
            <select
              value={formData.atendente}
              onChange={(e) => setFormData({ ...formData, atendente: e.target.value })}
              onFocus={() => setFocusedField('atendente')}
              onBlur={() => setFocusedField(null)}
              style={{ ...getSelectStyles('atendente'), flex: 1 }}
            >
              <option value="">Selecione...</option>
              <option value="Atendente 1">Atendente 1</option>
              <option value="Atendente 2">Atendente 2</option>
              <option value="Atendente 3">Atendente 3</option>
            </select>
          </div>

          {/* Previsão Entrega */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '270px' }}>
            <label style={{ ...labelStyles, marginBottom: '0', minWidth: '100px', whiteSpace: 'nowrap' }}>Previsão Entrega</label>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="date"
                value={formData.previsaoEntrega}
                onChange={(e) => setFormData({ ...formData, previsaoEntrega: e.target.value })}
                onFocus={() => setFocusedField('previsaoEntrega')}
                onBlur={() => setFocusedField(null)}
                style={getInputWithIconStyles('previsaoEntrega')}
              />
              <button 
                style={iconButtonStyles}
                title="Buscar data"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >🔍</button>
            </div>
          </div>
        </div>

        {/* Linha 2: Protocolo, Tipo */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          {/* Protocolo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '200px' }}>
            <label style={{ ...labelStyles, marginBottom: '0', minWidth: '50px' }}>Protocolo</label>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={formData.protocolo}
                onChange={(e) => setFormData({ ...formData, protocolo: e.target.value })}
                onFocus={() => setFocusedField('protocolo')}
                onBlur={() => setFocusedField(null)}
                style={getInputWithIconStyles('protocolo')}
              />
              <button 
                style={iconButtonStyles}
                title="Buscar protocolo"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >🔍</button>
            </div>
          </div>

          {/* Tipo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <label style={{ ...labelStyles, marginBottom: '0', width: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Tipo</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              onFocus={() => setFocusedField('tipo')}
              onBlur={() => setFocusedField(null)}
              style={{ ...getSelectStyles('tipo'), flex: 1 }}
            >
              <option value="">Selecione...</option>
              <option value="Ofício">Ofício</option>
              <option value="Mandado">Mandado</option>
              <option value="Intimação">Intimação</option>
            </select>
          </div>
        </div>

        {/* Seção Arquivamento */}
        <div style={sectionTitleStyles}>Arquivamento</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: '8px',
          alignItems: 'center'
        }}>
          {/* Sequência */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '200px' }}>
            <label style={{ ...labelStyles, marginBottom: '0', minWidth: '50px' }}>Sequência</label>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={formData.sequencia}
                onChange={(e) => setFormData({ ...formData, sequencia: e.target.value })}
                onFocus={() => setFocusedField('sequencia')}
                onBlur={() => setFocusedField(null)}
                style={getInputWithIconStyles('sequencia')}
              />
              <button 
                style={iconButtonStyles}
                title="Buscar sequência"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >🔍</button>
            </div>
          </div>

          {/* Pasta + Folha */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
            {/* Pasta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <label style={{ ...labelStyles, marginBottom: '0', width: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Pasta</label>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  value={formData.pasta}
                  onChange={(e) => setFormData({ ...formData, pasta: e.target.value })}
                  onFocus={() => setFocusedField('pasta')}
                  onBlur={() => setFocusedField(null)}
                  style={getInputWithIconStyles('pasta')}
                />
                <button 
                  style={iconButtonStyles}
                  title="Buscar pasta"
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >🔍</button>
              </div>
            </div>

            {/* Folha */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '150px' }}>
              <label style={{ ...labelStyles, marginBottom: '0', minWidth: '40px' }}>Folha</label>
              <input
                type="text"
                value={formData.folha}
                onChange={(e) => setFormData({ ...formData, folha: e.target.value })}
                onFocus={() => setFocusedField('folha')}
                onBlur={() => setFocusedField(null)}
                style={{ ...getInputStyles('folha'), flex: 1 }}
              />
            </div>
          </div>
        </div>

        {/* Linha Separadora */}
        <div style={{
          borderBottom: `1px solid ${theme.border}`,
          marginTop: '8px',
          marginBottom: '8px'
        }}></div>

        {/* Campos Principais */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Linha 4: Grid com Ofício, Processo (esquerda) e Vara (direita) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            gap: '8px',
            alignItems: 'start'
          }}>
            {/* Coluna Esquerda: Ofício e Processo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              {/* Ofício */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '200px' }}>
                <label style={{ ...labelStyles, marginBottom: '0', minWidth: '50px' }}>Ofício</label>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    value={formData.oficio}
                    onChange={(e) => setFormData({ ...formData, oficio: e.target.value })}
                    onFocus={() => setFocusedField('oficio')}
                    onBlur={() => setFocusedField(null)}
                    style={getInputWithIconStyles('oficio')}
                  />
                  <button 
                    style={iconButtonStyles}
                    title="Buscar ofício"
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >🔍</button>
                </div>
              </div>

              {/* Processo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '200px' }}>
                <label style={{ ...labelStyles, marginBottom: '0', minWidth: '50px' }}>Processo</label>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    value={formData.processo}
                    onChange={(e) => setFormData({ ...formData, processo: e.target.value })}
                    onFocus={() => setFocusedField('processo')}
                    onBlur={() => setFocusedField(null)}
                    style={getInputWithIconStyles('processo')}
                  />
                  <button 
                    style={iconButtonStyles}
                    title="Buscar processo"
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >🔍</button>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Vara */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '100%', paddingTop: '0', width: '100%' }}>
              <label style={{ ...labelStyles, marginBottom: '0', width: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', alignSelf: 'center' }}>Vara</label>
              <textarea
                value={formData.vara}
                onChange={(e) => setFormData({ ...formData, vara: e.target.value })}
                onFocus={() => setFocusedField('vara')}
                onBlur={() => setFocusedField(null)}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  fontSize: '12px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '3px',
                  backgroundColor: focusedField === 'vara' ? focusColor : theme.background,
                  color: focusedField === 'vara' ? focusTextColor : theme.text,
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                  transition: 'all 0.2s ease',
                  lineHeight: '20px',
                  resize: 'none' as const,
                  height: '64px',
                  fontFamily: 'inherit',
                  WebkitBoxShadow: focusedField === 'vara' ? `0 0 0 1000px ${focusColor} inset` : `0 0 0 1000px ${theme.background} inset`,
                  WebkitTextFillColor: focusedField === 'vara' ? focusTextColor : theme.text,
                  boxShadow: focusedField === 'vara' ? `0 0 0 1000px ${focusColor} inset` : 'none',
                  overflowY: 'auto' as const
                }}
              />
            </div>
          </div>

          {/* Linha 5: Parte(s) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Parte 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ ...labelStyles, marginBottom: '0', minWidth: '50px' }}>Parte(s)</label>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  value={formData.parte1}
                  onChange={(e) => setFormData({ ...formData, parte1: e.target.value })}
                  onFocus={() => setFocusedField('parte1')}
                  onBlur={() => setFocusedField(null)}
                  style={getInputWithIconStyles('parte1')}
                />
                <button 
                  style={iconButtonStyles}
                  title="Buscar parte 1"
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >🔍</button>
              </div>
            </div>

            {/* Parte 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ ...labelStyles, marginBottom: '0', minWidth: '50px', opacity: 0 }}>Parte(s)</label>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  value={formData.parte2}
                  onChange={(e) => setFormData({ ...formData, parte2: e.target.value })}
                  onFocus={() => setFocusedField('parte2')}
                  onBlur={() => setFocusedField(null)}
                  style={getInputWithIconStyles('parte2')}
                />
                <button 
                  style={iconButtonStyles}
                  title="Buscar parte 2"
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >🔍</button>
              </div>
            </div>
          </div>

          {/* Linha 6: Determinação */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <label style={{ ...labelStyles, marginBottom: '0', minWidth: '50px', paddingTop: '4px' }}>Obs</label>
            <textarea
              value={formData.determinacao}
              onChange={(e) => setFormData({ ...formData, determinacao: e.target.value })}
              onFocus={() => setFocusedField('determinacao')}
              onBlur={() => setFocusedField(null)}
              style={{
                width: '100%',
                padding: '4px 8px',
                fontSize: '12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '3px',
                backgroundColor: focusedField === 'determinacao' ? focusColor : theme.background,
                color: focusedField === 'determinacao' ? focusTextColor : theme.text,
                outline: 'none',
                boxSizing: 'border-box' as const,
                transition: 'all 0.2s ease',
                lineHeight: '20px',
                resize: 'none' as const,
                height: '64px',
                fontFamily: 'inherit',
                WebkitBoxShadow: focusedField === 'determinacao' ? `0 0 0 1000px ${focusColor} inset` : `0 0 0 1000px ${theme.background} inset`,
                WebkitTextFillColor: focusedField === 'determinacao' ? focusTextColor : theme.text,
                boxShadow: focusedField === 'determinacao' ? `0 0 0 1000px ${focusColor} inset` : 'none',
                overflowY: 'auto' as const,
                flex: 1
              }}
            />
          </div>

          {/* Seção Cumprimento */}
          <div style={sectionTitleStyles}>Cumprimento</div>
          
          {/* Linha 7: Campos Cumprimento */}
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            {/* Data */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <label style={{ ...labelStyles, marginBottom: '0', minWidth: '50px' }}>Data</label>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="date"
                  value={formData.cumprimentoData}
                  onChange={(e) => setFormData({ ...formData, cumprimentoData: e.target.value })}
                  onFocus={() => setFocusedField('cumprimentoData')}
                  onBlur={() => setFocusedField(null)}
                  style={getInputWithIconStyles('cumprimentoData')}
                />
                <button 
                  style={iconButtonStyles}
                  title="Buscar data"
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >🔍</button>
              </div>
            </div>

            {/* Livro */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <label style={{ ...labelStyles, marginBottom: '0', minWidth: '35px' }}>Livro</label>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  value={formData.cumprimentoLivro}
                  onChange={(e) => setFormData({ ...formData, cumprimentoLivro: e.target.value })}
                  onFocus={() => setFocusedField('cumprimentoLivro')}
                  onBlur={() => setFocusedField(null)}
                  style={getInputWithIconStyles('cumprimentoLivro')}
                />
                <button 
                  style={iconButtonStyles}
                  title="Buscar livro"
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >🔍</button>
              </div>
            </div>

            {/* Folha(s) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <label style={{ ...labelStyles, marginBottom: '0', minWidth: '50px' }}>Folha(s)</label>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  value={formData.cumprimentoFolhas}
                  onChange={(e) => setFormData({ ...formData, cumprimentoFolhas: e.target.value })}
                  onFocus={() => setFocusedField('cumprimentoFolhas')}
                  onBlur={() => setFocusedField(null)}
                  style={getInputWithIconStyles('cumprimentoFolhas')}
                />
                <button 
                  style={iconButtonStyles}
                  title="Buscar folhas"
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >🔍</button>
              </div>
            </div>

            {/* Termo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <label style={{ ...labelStyles, marginBottom: '0', minWidth: '40px' }}>Termo</label>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  value={formData.cumprimentoTermo}
                  onChange={(e) => setFormData({ ...formData, cumprimentoTermo: e.target.value })}
                  onFocus={() => setFocusedField('cumprimentoTermo')}
                  onBlur={() => setFocusedField(null)}
                  style={getInputWithIconStyles('cumprimentoTermo')}
                />
                <button 
                  style={iconButtonStyles}
                  title="Buscar termo"
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >🔍</button>
              </div>
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
            </>
          )}

          {activeTab === 'digitalizacao' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              height: '580px',
              gap: 0
            }}>
              {/* Área central - Visualização de documento */}
              <div 
                ref={viewerRef}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#D4D4D4',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '4px',
                  position: 'relative',
                  overflow: 'auto',
                  cursor: previewUrl ? (isDragging ? 'grabbing' : 'grab') : 'default',
                  userSelect: 'none'
                }}
                onMouseDown={previewUrl ? handleMouseDown : undefined}
                onMouseMove={previewUrl ? handleMouseMove : undefined}
                onMouseUp={previewUrl ? handleMouseUp : undefined}
                onMouseLeave={previewUrl ? handleMouseLeave : undefined}
              >
                {previewUrl ? (
                  <div style={{
                    position: 'relative',
                    width: zoomLevel > 100 ? `${100 + (zoomLevel - 100) * 2}%` : '100%',
                    height: zoomLevel > 100 ? `${100 + (zoomLevel - 100) * 2}%` : '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                  }}>
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      draggable={false}
                      style={{
                        width: `${zoomLevel}%`,
                        height: 'auto',
                        objectFit: 'contain',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        transition: isDragging ? 'none' : 'all 0.3s ease',
                        pointerEvents: 'none'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      gap: '12px'
                    }}>
                      <span>Imagem {currentImageIndex + 1} de {scannedImages.length}</span>
                      <span>|</span>
                      <span>Zoom: {zoomLevel}%</span>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '48px',
                      fontWeight: 'bold',
                      color: '#4F4F4F',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      CIVITAS
                    </div>
                  </div>
                )}
              </div>

              {/* Barra de Ferramentas Inferior */}
              <div style={{
                display: 'flex',
                gap: '6px',
                padding: '10px',
                borderTop: `1px solid ${theme.border}`,
                backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#f8f9fa',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                {/* Input file oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />

                {/* Primeiro */}
                <button
                  onClick={handlePrimeiro}
                  disabled={scannedImages.length === 0 || currentImageIndex === 0}
                  style={digitalButtonStyles('#007bff', scannedImages.length === 0 || currentImageIndex === 0)}
                  onMouseEnter={(e) => {
                    if (scannedImages.length > 0 && currentImageIndex > 0) {
                      e.currentTarget.style.backgroundColor = '#0056b3'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (scannedImages.length > 0 && currentImageIndex > 0) {
                      e.currentTarget.style.backgroundColor = '#007bff'
                    }
                  }}
                  title="Ir para primeira imagem"
                >
                  <span>⏮️</span>
                  <span>Primeiro</span>
                </button>

                {/* Anterior */}
                <button
                  onClick={handleAnterior}
                  disabled={scannedImages.length === 0 || currentImageIndex === 0}
                  style={digitalButtonStyles('#dc3545', scannedImages.length === 0 || currentImageIndex === 0)}
                  onMouseEnter={(e) => {
                    if (scannedImages.length > 0 && currentImageIndex > 0) {
                      e.currentTarget.style.backgroundColor = '#c82333'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (scannedImages.length > 0 && currentImageIndex > 0) {
                      e.currentTarget.style.backgroundColor = '#dc3545'
                    }
                  }}
                >
                  <span>◀️</span>
                  <span>Anterior</span>
                </button>

                {/* Próximo */}
                <button
                  onClick={handleProximo}
                  disabled={scannedImages.length === 0 || currentImageIndex >= scannedImages.length - 1}
                  style={digitalButtonStyles('#dc3545', scannedImages.length === 0 || currentImageIndex >= scannedImages.length - 1)}
                  onMouseEnter={(e) => {
                    if (scannedImages.length > 0 && currentImageIndex < scannedImages.length - 1) {
                      e.currentTarget.style.backgroundColor = '#c82333'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (scannedImages.length > 0 && currentImageIndex < scannedImages.length - 1) {
                      e.currentTarget.style.backgroundColor = '#dc3545'
                    }
                  }}
                >
                  <span>▶️</span>
                  <span>Próximo</span>
                </button>

                {/* Último */}
                <button
                  onClick={handleUltimo}
                  disabled={scannedImages.length === 0 || currentImageIndex === scannedImages.length - 1}
                  style={digitalButtonStyles('#007bff', scannedImages.length === 0 || currentImageIndex === scannedImages.length - 1)}
                  onMouseEnter={(e) => {
                    if (scannedImages.length > 0 && currentImageIndex < scannedImages.length - 1) {
                      e.currentTarget.style.backgroundColor = '#0056b3'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (scannedImages.length > 0 && currentImageIndex < scannedImages.length - 1) {
                      e.currentTarget.style.backgroundColor = '#007bff'
                    }
                  }}
                  title="Ir para última imagem"
                >
                  <span>⏭️</span>
                  <span>Último</span>
                </button>

                {/* Adquirir */}
                <button
                  onClick={handleAdquirir}
                  style={digitalButtonStyles('#6c757d', false)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#495057'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                  title="Importar imagens do computador"
                >
                  <span>📥</span>
                  <span>Adquirir</span>
                </button>

                {/* Excluir */}
                <button
                  onClick={handleExcluirImagem}
                  disabled={scannedImages.length === 0}
                  style={digitalButtonStyles('#6c757d', scannedImages.length === 0)}
                  onMouseEnter={(e) => {
                    if (scannedImages.length > 0) {
                      e.currentTarget.style.backgroundColor = '#495057'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (scannedImages.length > 0) {
                      e.currentTarget.style.backgroundColor = '#6c757d'
                    }
                  }}
                >
                  <span>❌</span>
                  <span>Excluir</span>
                </button>

                {/* Scanner */}
                <button
                  onClick={handleScanner}
                  style={digitalButtonStyles('#6c757d', false)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#495057'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                  title="Digitalizar um ou vários documentos"
                >
                  <span>🖨️</span>
                  <span>Scanner</span>
                </button>

                {/* Imprimir */}
                <button
                  onClick={handleImprimir}
                  disabled={scannedImages.length === 0}
                  style={digitalButtonStyles('#6c757d', scannedImages.length === 0)}
                  onMouseEnter={(e) => {
                    if (scannedImages.length > 0) {
                      e.currentTarget.style.backgroundColor = '#495057'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (scannedImages.length > 0) {
                      e.currentTarget.style.backgroundColor = '#6c757d'
                    }
                  }}
                  title="Imprimir documento digitalizado"
                >
                  <span>🖨️</span>
                  <span>Imprimir</span>
                </button>

                {/* IPDF */}
                <button
                  onClick={handleIPDF}
                  disabled={scannedImages.length === 0}
                  style={digitalButtonStyles('#dc3545', scannedImages.length === 0)}
                  onMouseEnter={(e) => {
                    if (scannedImages.length > 0) {
                      e.currentTarget.style.backgroundColor = '#c82333'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (scannedImages.length > 0) {
                      e.currentTarget.style.backgroundColor = '#dc3545'
                    }
                  }}
                  title="Gerar PDF a partir das imagens digitalizadas"
                >
                  <span>📄</span>
                  <span>IPDF</span>
                </button>

                {/* Imagem */}
                <button
                  onClick={handleVisualizarImagem}
                  disabled={scannedImages.length === 0}
                  style={digitalButtonStyles('#6c757d', scannedImages.length === 0)}
                  onMouseEnter={(e) => {
                    if (scannedImages.length > 0) {
                      e.currentTarget.style.backgroundColor = '#495057'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (scannedImages.length > 0) {
                      e.currentTarget.style.backgroundColor = '#6c757d'
                    }
                  }}
                  title="Visualizar imagem em nova aba"
                >
                  <span>🖼️</span>
                  <span>Imagem</span>
                </button>

                {/* +Zoom */}
                <button
                  onClick={handleZoomIn}
                  disabled={scannedImages.length === 0 || zoomLevel >= 200}
                  style={digitalButtonStyles('#6c757d', scannedImages.length === 0 || zoomLevel >= 200)}
                  onMouseEnter={(e) => {
                    if (scannedImages.length > 0 && zoomLevel < 200) {
                      e.currentTarget.style.backgroundColor = '#495057'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (scannedImages.length > 0 && zoomLevel < 200) {
                      e.currentTarget.style.backgroundColor = '#6c757d'
                    }
                  }}
                  title="Aumentar zoom"
                >
                  <span>🔍+</span>
                  <span>+ Zoom</span>
                </button>

                {/* -Zoom */}
                <button
                  onClick={handleZoomOut}
                  disabled={scannedImages.length === 0 || zoomLevel <= 50}
                  style={digitalButtonStyles('#6c757d', scannedImages.length === 0 || zoomLevel <= 50)}
                  onMouseEnter={(e) => {
                    if (scannedImages.length > 0 && zoomLevel > 50) {
                      e.currentTarget.style.backgroundColor = '#495057'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (scannedImages.length > 0 && zoomLevel > 50) {
                      e.currentTarget.style.backgroundColor = '#6c757d'
                    }
                  }}
                  title="Diminuir zoom"
                >
                  <span>🔍-</span>
                  <span>- Zoom</span>
                </button>

                {/* Retornar */}
                <button
                  onClick={onClose}
                  style={digitalButtonStyles('#17a2b8', false)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#138496'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#17a2b8'}
                  title="Retornar ao menu"
                >
                  <span>↩️</span>
                  <span>Retornar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BasePage>
  )
}

