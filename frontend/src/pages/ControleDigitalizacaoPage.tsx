import React, { useState, useEffect } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { jsPDF } from 'jspdf'

interface ControleDigitalizacaoPageProps {
  onClose: () => void
}

interface Digitalizacao {
  id: string
  tipoAto: string
  codigo: string
  tipoDocumento: string
  processo: string
  protocolo: string
  termo: string
  livro: string
  folhaInicio: string
}

export function ControleDigitalizacaoPage({ onClose }: ControleDigitalizacaoPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
  
  // Carregar tipos de ato do localStorage (mesma chave do TiposCadastroPage)
  const [tiposAto, setTiposAto] = useState<Array<{id: string, descricao: string}>>(() => {
    const saved = localStorage.getItem('tiposAto')
    return saved ? JSON.parse(saved) : []
  })

  // Carregar tipos de documento do localStorage (mesma chave do TiposCadastroPage)
  const [tiposDocumento, setTiposDocumento] = useState<Array<{id: string, tipoAto: string, nomeDocumento: string}>>(() => {
    const saved = localStorage.getItem('tiposDocumento')
    return saved ? JSON.parse(saved) : []
  })

  // Recarregar dados quando a janela recebe foco (para pegar atualizações)
  useEffect(() => {
    const recarregarDados = () => {
      const savedAtos = localStorage.getItem('tiposAto')
      if (savedAtos) {
        setTiposAto(JSON.parse(savedAtos))
      }
      
      const savedDocs = localStorage.getItem('tiposDocumento')
      if (savedDocs) {
        setTiposDocumento(JSON.parse(savedDocs))
      }
    }

    // Escutar evento personalizado para atualizar
    window.addEventListener('tipos-atualizados', recarregarDados)
    
    return () => {
      window.removeEventListener('tipos-atualizados', recarregarDados)
    }
  }, [])

  const [formData, setFormData] = useState({
    codigo: '0',
    tipoAto: '',
    tipoDocumento: '',
    processo: '0',
    protocolo: '0',
    termo: '0',
    livro: '',
    folhaInicio: ''
  })

  const [digitalizacoes, setDigitalizacoes] = useState<Digitalizacao[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [ultimosDados, setUltimosDados] = useState<any>(null)
  const [abaAtiva, setAbaAtiva] = useState<'cadastro' | 'digitalizacao'>('cadastro')
  
  // Estados para digitalização de imagens
  const [imagens, setImagens] = useState<string[]>([])
  const [imagemAtualIndex, setImagemAtualIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null)
  
  // Estados para arrastar imagem
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 })
  const imageContainerRef = React.useRef<HTMLDivElement>(null)
  const imageRef = React.useRef<HTMLImageElement>(null)

  // Resetar zoom e dimensões ao trocar de imagem
  useEffect(() => {
    setZoomLevel(100)
    setImageDimensions(null)
  }, [imagemAtualIndex, imagens])

  const labelStyles = {
    display: 'block',
    marginBottom: '4px',
    fontSize: '11px',
    fontWeight: '600' as const,
    color: theme.text
  }

  const inputStyles = {
    width: '100%',
    padding: '6px 8px',
    fontSize: '12px',
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    backgroundColor: theme.surface,
    color: theme.text,
    boxSizing: 'border-box' as const
  }

  const buttonStyles = {
    padding: '6px 16px',
    fontSize: '11px',
    fontWeight: '600' as const,
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '90px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }

  // Filtrar documentos baseado no tipo de ato selecionado
  const documentosFiltrados = tiposDocumento.filter(
    doc => !formData.tipoAto || doc.tipoAto === formData.tipoAto
  )

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGravar = () => {
    if (!formData.tipoAto || !formData.tipoDocumento) {
      console.log('⚠️ Por favor, selecione o Tipo do Ato e o Tipo de Documento.')
      return
    }

    const novaDigitalizacao: Digitalizacao = {
      id: Date.now().toString(),
      tipoAto: formData.tipoAto,
      codigo: (digitalizacoes.length + 1).toString().padStart(3, '0'),
      tipoDocumento: formData.tipoDocumento,
      processo: formData.processo,
      protocolo: formData.protocolo,
      termo: formData.termo,
      livro: formData.livro,
      folhaInicio: formData.folhaInicio
    }

    setDigitalizacoes(prev => [...prev, novaDigitalizacao])
    setUltimosDados(formData)
    console.log('✅ Digitalização gravada com sucesso!')
    handleLimpar()
  }

  const handleLimpar = () => {
    setFormData({
      codigo: '0',
      tipoAto: '',
      tipoDocumento: '',
      processo: '0',
      protocolo: '0',
      termo: '0',
      livro: '',
      folhaInicio: ''
    })
    setSelectedId(null)
  }

  const handleExcluir = () => {
    if (selectedId) {
      setDigitalizacoes(prev => prev.filter(d => d.id !== selectedId))
      handleLimpar()
      console.log('✅ Digitalização excluída.')
    }
  }

  const handleRepetirDados = () => {
    if (ultimosDados) {
      setFormData({ ...ultimosDados, codigo: '0' })
      console.log('✅ Dados repetidos.')
    } else {
      console.log('⚠️ Nenhum dado anterior para repetir.')
    }
  }

  const handleAcessoRapido = () => {
    if (!formData.tipoAto) {
      console.log('⚠️ Selecione um Tipo de Ato primeiro.')
      return
    }

    // Carregar configurações de acesso rápido
    const stored = localStorage.getItem('acessoRapido')
    if (!stored) {
      console.log('⚠️ Nenhum documento configurado para Acesso Rápido.')
      return
    }

    const acessoRapido = JSON.parse(stored)
    
    // Filtrar documentos do tipo de ato selecionado
    const documentosParaCriar = acessoRapido.filter((item: any) => item.tipoAto === formData.tipoAto)
    
    if (documentosParaCriar.length === 0) {
      console.log(`⚠️ Nenhum documento configurado para Acesso Rápido do tipo "${formData.tipoAto}".`)
      return
    }

    // Criar containers para cada documento marcado
    const novosContainers = documentosParaCriar.map((doc: any) => ({
      id: Date.now().toString() + Math.random(),
      tipoAto: formData.tipoAto,
      codigo: (digitalizacoes.length + documentosParaCriar.indexOf(doc) + 1).toString().padStart(3, '0'),
      tipoDocumento: doc.nomeDocumento,
      processo: formData.processo || '0',
      protocolo: formData.protocolo || '0',
      termo: formData.termo || '0',
      livro: formData.livro || '',
      folhaInicio: formData.folhaInicio || ''
    }))

    setDigitalizacoes(prev => [...prev, ...novosContainers])
    
    console.log(`✅ ${novosContainers.length} container(s) criado(s) para Acesso Rápido.`)
    handleLimpar()
  }

  // Funções para navegação de imagens
  const handlePrimeiro = () => {
    if (imagens.length > 0) {
      setImagemAtualIndex(0)
    }
  }

  const handleAnterior = () => {
    if (imagemAtualIndex > 0) {
      setImagemAtualIndex(imagemAtualIndex - 1)
    }
  }

  const handleProximo = () => {
    if (imagemAtualIndex < imagens.length - 1) {
      setImagemAtualIndex(imagemAtualIndex + 1)
    }
  }

  const handleUltimo = () => {
    if (imagens.length > 0) {
      setImagemAtualIndex(imagens.length - 1)
    }
  }

  // Funções para ações de digitalização
  const handleAdquirir = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = (e: any) => {
      const files = Array.from(e.target.files) as File[]
      files.forEach(file => {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setImagens(prev => [...prev, event.target!.result as string])
          }
        }
        reader.readAsDataURL(file)
      })
      console.log(`✅ ${files.length} imagem(ns) adquirida(s).`)
    }
    input.click()
  }

  const handleExcluirImagem = () => {
    if (imagens.length === 0) {
      console.log('⚠️ Nenhuma imagem para excluir.')
      return
    }
    setImagens(prev => prev.filter((_, index) => index !== imagemAtualIndex))
    if (imagemAtualIndex >= imagens.length - 1 && imagemAtualIndex > 0) {
      setImagemAtualIndex(imagemAtualIndex - 1)
    }
    console.log('✅ Imagem excluída.')
  }

  const handleScanner = () => {
    console.log('🖨️ Função de Scanner será implementada.')
  }

  const handleImprimir = () => {
    if (imagens.length === 0) {
      console.log('⚠️ Nenhuma imagem para imprimir.')
      return
    }
    
    // Criar iframe oculto para impressão
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)
    
    const iframeDoc = iframe.contentWindow?.document
    if (iframeDoc) {
      iframeDoc.open()
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Impressão - Imagem ${imagemAtualIndex + 1}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                display: flex; 
                justify-content: center; 
                align-items: center;
                min-height: 100vh;
                padding: 10mm;
              }
              img { 
                max-width: 100%; 
                max-height: 100vh;
                height: auto;
                display: block;
              }
              @media print {
                body { padding: 0; }
                img { 
                  max-width: 100%; 
                  max-height: 100vh;
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <img src="${imagens[imagemAtualIndex]}" onload="window.print(); setTimeout(() => window.parent.document.body.removeChild(window.frameElement), 1000);" />
          </body>
        </html>
      `)
      iframeDoc.close()
    }
  }

  const handlePDF = async () => {
    if (imagens.length === 0) {
      console.log('⚠️ Nenhuma imagem para exportar.')
      return
    }
    
    try {
      // Criar um canvas com a imagem
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = imagens[imagemAtualIndex]
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })
      
      // Calcular dimensões para PDF (A4 landscape se imagem for larga)
      const imgWidth = img.width
      const imgHeight = img.height
      const ratio = imgWidth / imgHeight
      
      // Criar PDF
      const pdf = new jsPDF({
        orientation: ratio > 1 ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      // Calcular dimensões mantendo proporção
      let finalWidth = pageWidth
      let finalHeight = (imgHeight * pageWidth) / imgWidth
      
      if (finalHeight > pageHeight) {
        finalHeight = pageHeight
        finalWidth = (imgWidth * pageHeight) / imgHeight
      }
      
      // Centralizar imagem
      const x = (pageWidth - finalWidth) / 2
      const y = (pageHeight - finalHeight) / 2
      
      // Adicionar imagem ao PDF
      pdf.addImage(imagens[imagemAtualIndex], 'JPEG', x, y, finalWidth, finalHeight)
      
      // Salvar PDF
      pdf.save(`digitalizacao_${selectedId}_imagem_${imagemAtualIndex + 1}.pdf`)
      
      console.log(`✅ PDF gerado e baixado.`)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
    }
  }

  // Funções para zoom
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 400))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 100))
  }

  // Funções para arrastar a imagem
  const handleMouseDown = (e: React.MouseEvent) => {
    if (imageContainerRef.current) {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      setScrollStart({
        left: imageContainerRef.current.scrollLeft,
        top: imageContainerRef.current.scrollTop
      })
      e.preventDefault()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageContainerRef.current) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y
      imageContainerRef.current.scrollLeft = scrollStart.left - dx
      imageContainerRef.current.scrollTop = scrollStart.top - dy
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  return (
    <BasePage
      title="Controle de Digitalização de Imagens"
      onClose={onClose}
      width="900px"
      height="650px"
      minWidth="900px"
      minHeight="650px"
      resizable={false}
      headerColor={headerColor}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '12px',
        gap: '12px'
      }}>
        {/* Abas: Cadastro e Digitalização */}
        <div style={{
          display: 'flex',
          gap: '4px'
        }}>
          <div
            onClick={() => setAbaAtiva('cadastro')}
            style={{
              padding: '4px 12px',
              backgroundColor: abaAtiva === 'cadastro' ? theme.surface : 'transparent',
              border: `2px solid ${abaAtiva === 'cadastro' ? headerColor : 'transparent'}`,
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              color: abaAtiva === 'cadastro' ? theme.text : theme.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Cadastro
          </div>
          
          {selectedId && (
            <div
              onClick={() => setAbaAtiva('digitalizacao')}
              style={{
                padding: '4px 12px',
                backgroundColor: abaAtiva === 'digitalizacao' ? theme.surface : 'transparent',
                border: `2px solid ${abaAtiva === 'digitalizacao' ? headerColor : 'transparent'}`,
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                color: abaAtiva === 'digitalizacao' ? theme.text : theme.textSecondary,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Digitalização
            </div>
          )}
        </div>

        {/* Área Principal - Dividida em 2 Colunas */}
        {abaAtiva === 'cadastro' && (
        <div style={{
          flex: 1,
          display: 'flex',
          gap: '12px',
          overflow: 'hidden'
        }}>
          {/* COLUNA ESQUERDA - Lista de Containers (35%) */}
          <div style={{
            width: '35%',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            overflow: 'auto',
            border: `1px solid ${theme.border}`,
            borderRadius: '4px',
            padding: '8px',
            backgroundColor: theme.surface
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme.text,
              paddingBottom: '8px',
              borderBottom: `1px solid ${theme.border}`
            }}>
              Containers de Digitalização
            </div>

            {digitalizacoes.length === 0 ? (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.textSecondary,
                fontSize: '13px',
                fontStyle: 'italic'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px', opacity: 0.3 }}>📦</div>
                  <div>Nenhum container gravado</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {digitalizacoes.map((dig, index) => (
                   <div
                     key={dig.id}
                     onClick={() => {
                       setSelectedId(dig.id)
                     }}
                     style={{
                       padding: '8px',
                       backgroundColor: selectedId === dig.id ? '#3b82f6' : (index % 2 === 0 ? theme.surface : theme.background),
                       color: selectedId === dig.id ? 'white' : theme.text,
                       border: `1px solid ${selectedId === dig.id ? '#3b82f6' : theme.border}`,
                       borderRadius: '4px',
                       cursor: 'pointer',
                       fontSize: '12px',
                       fontWeight: '500',
                       textAlign: 'left'
                     }}
                     onMouseEnter={(e) => {
                       if (selectedId !== dig.id) {
                         e.currentTarget.style.backgroundColor = theme.border
                       }
                     }}
                     onMouseLeave={(e) => {
                       if (selectedId !== dig.id) {
                         e.currentTarget.style.backgroundColor = index % 2 === 0 ? theme.surface : theme.background
                       }
                     }}
                   >
                     {dig.tipoDocumento}
                   </div>
                ))}
              </div>
            )}
          </div>

          {/* COLUNA DIREITA - Formulário de Cadastro (65%) */}
          <div style={{
            width: '65%',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflow: 'auto'
          }}>
          {/* Linha 1: Código e Tipo do Ato */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr',
            gap: '8px',
            marginBottom: '8px'
          }}>
            {/* Código */}
            <div>
              <label style={labelStyles}>Código</label>
              <input
                type="text"
                value={formData.codigo}
                readOnly
                disabled
                onKeyDown={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                style={{
                  ...inputStyles,
                  backgroundColor: currentTheme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                  color: currentTheme === 'dark' ? '#666' : '#999',
                  cursor: 'not-allowed',
                  opacity: 0.7
                }}
              />
            </div>

            {/* Tipo do Ato */}
            <div>
              <label style={labelStyles}>Tipo do Ato</label>
              <select
                value={formData.tipoAto}
                onChange={(e) => {
                  handleInputChange('tipoAto', e.target.value)
                  handleInputChange('tipoDocumento', '') // Limpa documento ao trocar ato
                }}
                style={{
                  ...inputStyles,
                  cursor: 'pointer'
                }}
              >
                <option value="">Selecione...</option>
                {tiposAto.map(tipo => (
                  <option key={tipo.id} value={tipo.descricao}>
                    {tipo.descricao}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Linha 2: Tipo de Documento e Botão Acesso Rápido */}
          <div style={{
            display: 'flex',
            alignItems: 'end',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyles}>Tipo de Documento Digitalizado</label>
              <select
                value={formData.tipoDocumento}
                onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
                disabled={!formData.tipoAto}
                style={{
                  ...inputStyles,
                  cursor: formData.tipoAto ? 'pointer' : 'not-allowed',
                  opacity: formData.tipoAto ? 1 : 0.6
                }}
              >
                <option value="">Selecione...</option>
                {documentosFiltrados.map(doc => (
                  <option key={doc.id} value={doc.nomeDocumento}>
                    {doc.nomeDocumento}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleAcessoRapido}
              disabled={!formData.tipoAto}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '3px',
                cursor: formData.tipoAto ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                backgroundColor: formData.tipoAto ? '#f59e0b' : theme.border,
                color: formData.tipoAto ? 'white' : theme.textSecondary,
                opacity: formData.tipoAto ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                height: '28px'
              }}
              onMouseEnter={(e) => {
                if (formData.tipoAto) {
                  e.currentTarget.style.backgroundColor = '#d97706'
                }
              }}
              onMouseLeave={(e) => {
                if (formData.tipoAto) {
                  e.currentTarget.style.backgroundColor = '#f59e0b'
                }
              }}
            >
              ⚡ Acesso Rápido
            </button>
          </div>

          {/* Dados do Ato */}
          <div style={{
            border: `1px solid ${theme.border}`,
            borderRadius: '4px',
            padding: '12px',
            backgroundColor: theme.surface
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '12px'
            }}>
              Dados do Ato
            </div>

            {/* Linha 3: Processo e Protocolo */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '8px'
            }}>
              {/* Processo */}
              <div>
                <label style={labelStyles}>Processo</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={formData.processo}
                    onChange={(e) => handleInputChange('processo', e.target.value)}
                    style={{ ...inputStyles, paddingRight: '35px' }}
                  />
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      right: '5px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      fontSize: '16px',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10
                    }}
                    title="Buscar processo"
                  >
                    🔍
                  </button>
                </div>
              </div>

              {/* Protocolo */}
              <div>
                <label style={labelStyles}>Protocolo</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={formData.protocolo}
                    onChange={(e) => handleInputChange('protocolo', e.target.value)}
                    style={{ ...inputStyles, paddingRight: '35px' }}
                  />
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      right: '5px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      fontSize: '16px',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10
                    }}
                    title="Buscar protocolo"
                  >
                    🔍
                  </button>
                </div>
              </div>
            </div>

            {/* Linha 4: Termo, Livro, Folha e Lupa */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 50px',
              gap: '8px',
              alignItems: 'end'
            }}>
              {/* Termo */}
              <div>
                <label style={labelStyles}>Termo</label>
                <input
                  type="text"
                  value={formData.termo}
                  onChange={(e) => handleInputChange('termo', e.target.value)}
                  style={inputStyles}
                />
              </div>

              {/* Livro */}
              <div>
                <label style={labelStyles}>Livro</label>
                <input
                  type="text"
                  value={formData.livro}
                  onChange={(e) => handleInputChange('livro', e.target.value)}
                  style={inputStyles}
                />
              </div>

              {/* Folha */}
              <div>
                <label style={labelStyles}>Folha</label>
                <input
                  type="text"
                  value={formData.folhaInicio}
                  onChange={(e) => handleInputChange('folhaInicio', e.target.value)}
                  style={inputStyles}
                  placeholder="Folha"
                />
              </div>

              {/* Lupa para Termo, Livro e Folha */}
              <div>
                <label style={{ ...labelStyles, visibility: 'hidden' }}>-</label>
                <button
                  type="button"
                  style={{
                    ...inputStyles,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}
                  title="Buscar Termo, Livro e Folha"
                >
                  🔍
                </button>
              </div>
            </div>
          </div>
          </div>
          {/* Fim Coluna Direita */}
        </div>
        )}
        {/* Fim Área Principal Cadastro */}

        {/* Área de Digitalização */}
        {abaAtiva === 'digitalizacao' && selectedId && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          overflow: 'hidden'
        }}>
          {/* Área de visualização de imagem */}
          <div 
            ref={imageContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: zoomLevel === 100 ? 'center' : 'flex-start',
              justifyContent: zoomLevel === 100 ? 'center' : 'flex-start',
              backgroundColor: '#e5e7eb',
              position: 'relative',
              overflow: 'auto',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              padding: '20px'
            }}>
            {imagens.length > 0 ? (
              <>
                <img
                  ref={imageRef}
                  data-print-area="true"
                  src={imagens[imagemAtualIndex]}
                  alt={`Imagem ${imagemAtualIndex + 1}`}
                  draggable={false}
                  onLoad={(e) => {
                    const img = e.currentTarget
                    const container = imageContainerRef.current
                    if (container) {
                      // Calcular tamanho que cabe no container (com padding)
                      const maxWidth = container.clientWidth - 40 // 20px padding cada lado
                      const maxHeight = container.clientHeight - 40
                      
                      // Calcular fator de escala para caber
                      const scaleX = maxWidth / img.naturalWidth
                      const scaleY = maxHeight / img.naturalHeight
                      const scale = Math.min(scaleX, scaleY, 1) // não aumentar além do natural
                      
                      // Tamanho "fit" (que cabe perfeitamente)
                      const fitWidth = img.naturalWidth * scale
                      const fitHeight = img.naturalHeight * scale
                      
                      setImageDimensions({ width: fitWidth, height: fitHeight })
                    }
                  }}
                  style={{
                    display: 'block',
                    width: imageDimensions && zoomLevel !== 100 
                      ? `${(imageDimensions.width * zoomLevel / 100)}px`
                      : 'auto',
                    height: 'auto',
                    maxWidth: zoomLevel === 100 ? '100%' : 'none',
                    maxHeight: zoomLevel === 100 ? '100%' : 'none',
                    objectFit: 'contain',
                    transition: isDragging ? 'none' : 'width 0.2s ease',
                    pointerEvents: 'none'
                  }}
                />
                {/* Indicador fixo */}
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  backgroundColor: 'white',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  pointerEvents: 'none',
                  zIndex: 10
                }}>
                  Imagem {imagemAtualIndex + 1} de {imagens.length} | Zoom: {zoomLevel}%
                </div>
              </>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                color: '#9ca3af'
              }}>
                <div style={{
                  fontSize: '120px',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                  userSelect: 'none',
                  marginBottom: '16px'
                }}>
                  CIVITAS
                </div>
                <div style={{
                  fontSize: '16px',
                  opacity: 0.7
                }}>
                  Clique em "Adquirir" para carregar imagens
                </div>
              </div>
            )}
          </div>

          {/* Barra de ferramentas - Linha 1 */}
          <div style={{
            display: 'flex',
            gap: '6px',
            padding: '8px',
            backgroundColor: '#4b5563',
            borderTop: `1px solid ${theme.border}`
          }}>
            {/* Navegação */}
            <button 
              onClick={handlePrimeiro}
              disabled={imagens.length === 0 || imagemAtualIndex === 0}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                backgroundColor: '#e5e7eb',
                border: 'none',
                borderRadius: '4px',
                cursor: imagens.length === 0 || imagemAtualIndex === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#374151',
                opacity: imagens.length === 0 || imagemAtualIndex === 0 ? 0.5 : 1
              }}>
              ⏮️ Primeiro
            </button>
            <button 
              onClick={handleAnterior}
              disabled={imagens.length === 0 || imagemAtualIndex === 0}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                backgroundColor: '#e5e7eb',
                border: 'none',
                borderRadius: '4px',
                cursor: imagens.length === 0 || imagemAtualIndex === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#374151',
                opacity: imagens.length === 0 || imagemAtualIndex === 0 ? 0.5 : 1
              }}>
              ◀️ Anterior
            </button>
            <button 
              onClick={handleProximo}
              disabled={imagens.length === 0 || imagemAtualIndex === imagens.length - 1}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                backgroundColor: '#e5e7eb',
                border: 'none',
                borderRadius: '4px',
                cursor: imagens.length === 0 || imagemAtualIndex === imagens.length - 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#374151',
                opacity: imagens.length === 0 || imagemAtualIndex === imagens.length - 1 ? 0.5 : 1
              }}>
              ▶️ Próximo
            </button>
            <button 
              onClick={handleUltimo}
              disabled={imagens.length === 0 || imagemAtualIndex === imagens.length - 1}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                backgroundColor: '#e5e7eb',
                border: 'none',
                borderRadius: '4px',
                cursor: imagens.length === 0 || imagemAtualIndex === imagens.length - 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#374151',
                opacity: imagens.length === 0 || imagemAtualIndex === imagens.length - 1 ? 0.5 : 1
              }}>
              ⏭️ Último
            </button>

            <div style={{ width: '16px' }} />

            {/* Ações */}
            <button 
              onClick={handleAdquirir}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                backgroundColor: '#e5e7eb',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#374151'
              }}>
              📥 Adquirir
            </button>
            <button 
              onClick={handleExcluirImagem}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                backgroundColor: '#e5e7eb',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#374151'
              }}>
              ❌ Excluir
            </button>
            <button 
              onClick={handleScanner}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                backgroundColor: '#e5e7eb',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#374151'
              }}>
              🖨️ Scanner
            </button>
            <button 
              onClick={handleImprimir}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                backgroundColor: '#e5e7eb',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#374151'
              }}>
              🖨️ Imprimir
            </button>
            <button 
              onClick={handlePDF}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                backgroundColor: '#e5e7eb',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#374151'
              }}>
              📄 PDF
            </button>
          </div>

          {/* Barra de ferramentas - Linha 2 */}
          <div style={{
            display: 'flex',
            gap: '6px',
            padding: '8px',
            backgroundColor: '#4b5563',
            justifyContent: 'center'
          }}>
            <button 
              onClick={handleZoomIn}
              disabled={imagens.length === 0 || zoomLevel >= 400}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                backgroundColor: '#e5e7eb',
                border: 'none',
                borderRadius: '4px',
                cursor: imagens.length === 0 || zoomLevel >= 400 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#374151',
                opacity: imagens.length === 0 || zoomLevel >= 400 ? 0.5 : 1
              }}>
              🔍+ Zoom +
            </button>
            <button 
              onClick={handleZoomOut}
              disabled={imagens.length === 0 || zoomLevel <= 100}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                backgroundColor: '#e5e7eb',
                border: 'none',
                borderRadius: '4px',
                cursor: imagens.length === 0 || zoomLevel <= 100 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#374151',
                opacity: imagens.length === 0 || zoomLevel <= 100 ? 0.5 : 1
              }}>
              🔍- Zoom -
            </button>
            <button
              onClick={() => setAbaAtiva('cadastro')}
              style={{
                padding: '6px 16px',
                fontSize: '11px',
                fontWeight: '600',
                backgroundColor: '#14b8a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🚪 Retornar
            </button>
          </div>
        </div>
        )}
        {/* Fim Área de Digitalização */}

        {/* Botões de Ação - Apenas na aba Cadastro */}
        {abaAtiva === 'cadastro' && (
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          paddingTop: '8px',
          borderTop: `1px solid ${theme.border}`
        }}>
          <button
            onClick={handleGravar}
            style={{
              ...buttonStyles,
              backgroundColor: '#10b981',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#059669'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#10b981'
            }}
          >
            💾 Gravar
          </button>

          <button
            onClick={handleLimpar}
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
            📄 Limpar
          </button>

          <button
            onClick={handleExcluir}
            disabled={selectedId === null}
            style={{
              ...buttonStyles,
              backgroundColor: selectedId === null ? theme.border : '#ef4444',
              color: selectedId === null ? theme.textSecondary : 'white',
              cursor: selectedId === null ? 'not-allowed' : 'pointer',
              opacity: selectedId === null ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (selectedId !== null) {
                e.currentTarget.style.backgroundColor = '#dc2626'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedId !== null) {
                e.currentTarget.style.backgroundColor = '#ef4444'
              }
            }}
          >
            ❌ Excluir
          </button>

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

          <button
            onClick={handleRepetirDados}
            disabled={ultimosDados === null}
            style={{
              ...buttonStyles,
              backgroundColor: ultimosDados === null ? theme.border : '#3b82f6',
              color: ultimosDados === null ? theme.textSecondary : 'white',
              cursor: ultimosDados === null ? 'not-allowed' : 'pointer',
              opacity: ultimosDados === null ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (ultimosDados !== null) {
                e.currentTarget.style.backgroundColor = '#2563eb'
              }
            }}
            onMouseLeave={(e) => {
              if (ultimosDados !== null) {
                e.currentTarget.style.backgroundColor = '#3b82f6'
              }
            }}
          >
            📋 Repetir Dados
          </button>
        </div>
        )}
        {/* Fim Botões de Ação */}
      </div>
    </BasePage>
  )
}

