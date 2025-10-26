import { jsPDF } from 'jspdf'

/**
 * Serviço para manipulação de PDFs
 * Responsável por criar, converter e manipular documentos PDF
 */

interface PDFDocumentData {
  title?: string
  author?: string
  subject?: string
  keywords?: string
  creator?: string
}

interface ImageToPDFOptions {
  images: string[] // URLs ou Base64 das imagens
  pageSize?: 'a4' | 'letter'
  orientation?: 'portrait' | 'landscape'
  metadata?: PDFDocumentData
}

class PDFService {
  /**
   * Converte uma ou mais imagens para PDF (IPDF - Image to PDF)
   */
  async imagesToPDF(options: ImageToPDFOptions): Promise<Blob> {
    const {
      images,
      pageSize = 'a4',
      orientation = 'portrait',
      metadata = {}
    } = options

    if (!images || images.length === 0) {
      throw new Error('Nenhuma imagem fornecida para conversão')
    }

    // Criar novo documento PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize
    })

    // Configurar metadados
    if (metadata.title) pdf.setProperties({ title: metadata.title })
    if (metadata.author) pdf.setProperties({ author: metadata.author })
    if (metadata.subject) pdf.setProperties({ subject: metadata.subject })
    if (metadata.keywords) pdf.setProperties({ keywords: metadata.keywords })
    if (metadata.creator) pdf.setProperties({ creator: metadata.creator })

    // Dimensões da página
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10 // Margem em mm

    try {
      for (let i = 0; i < images.length; i++) {
        const imageData = images[i]

        if (i > 0) {
          pdf.addPage()
        }

        // Carregar a imagem
        const img = await this.loadImage(imageData)
        
        // Calcular dimensões mantendo proporção
        const imgWidth = img.width
        const imgHeight = img.height
        const ratio = imgWidth / imgHeight

        let finalWidth = pageWidth - (margin * 2)
        let finalHeight = finalWidth / ratio

        // Se a altura exceder a página, ajustar pela altura
        if (finalHeight > pageHeight - (margin * 2)) {
          finalHeight = pageHeight - (margin * 2)
          finalWidth = finalHeight * ratio
        }

        // Centralizar a imagem
        const x = (pageWidth - finalWidth) / 2
        const y = (pageHeight - finalHeight) / 2

        // Adicionar imagem ao PDF
        pdf.addImage(imageData, 'JPEG', x, y, finalWidth, finalHeight)
      }

      // Retornar o PDF como Blob
      return pdf.output('blob')
    } catch (error) {
      console.error('Erro ao converter imagens para PDF:', error)
      throw new Error('Falha ao converter imagens para PDF')
    }
  }

  /**
   * Carrega uma imagem e retorna suas dimensões
   */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  /**
   * Baixa o PDF gerado
   */
  downloadPDF(blob: Blob, filename: string = 'documento.pdf'): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Abre o PDF em uma nova aba
   */
  openPDFInNewTab(blob: Blob): void {
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    // Nota: URL será revogado quando a aba for fechada
    setTimeout(() => URL.revokeObjectURL(url), 60000) // Limpar após 1 minuto
  }

  /**
   * Converte um arquivo de imagem selecionado pelo usuário para Base64
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Falha ao ler arquivo'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Mescla múltiplos PDFs em um único documento
   */
  async mergePDFs(pdfBlobs: Blob[]): Promise<Blob> {
    // Esta funcionalidade requer uma biblioteca adicional como pdf-lib
    // Por enquanto, retorna o primeiro PDF
    if (pdfBlobs.length === 0) {
      throw new Error('Nenhum PDF fornecido para mesclagem')
    }
    
    console.warn('Função mergePDFs ainda não implementada completamente')
    return pdfBlobs[0]
  }

  /**
   * Valida se um arquivo é uma imagem
   */
  isImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    return validTypes.includes(file.type.toLowerCase())
  }

  /**
   * Valida se um arquivo é um PDF
   */
  isPDFFile(file: File): boolean {
    return file.type === 'application/pdf'
  }

  /**
   * Obtém informações sobre um arquivo
   */
  getFileInfo(file: File): {
    name: string
    size: string
    type: string
    lastModified: string
  } {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2)
    const lastModified = new Date(file.lastModified).toLocaleString('pt-BR')

    return {
      name: file.name,
      size: `${sizeInMB} MB`,
      type: file.type,
      lastModified
    }
  }

  /**
   * Cria um PDF a partir de texto
   */
  textToPDF(text: string, options?: {
    title?: string
    fontSize?: number
    pageSize?: 'a4' | 'letter'
  }): Blob {
    const {
      title = 'Documento',
      fontSize = 12,
      pageSize = 'a4'
    } = options || {}

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: pageSize
    })

    if (title) {
      pdf.setProperties({ title })
    }

    pdf.setFontSize(fontSize)
    
    const margin = 15
    const pageWidth = pdf.internal.pageSize.getWidth()
    const maxWidth = pageWidth - (margin * 2)

    // Dividir texto em linhas que cabem na página
    const lines = pdf.splitTextToSize(text, maxWidth)
    
    pdf.text(lines, margin, margin)

    return pdf.output('blob')
  }
}

export const pdfService = new PDFService()
