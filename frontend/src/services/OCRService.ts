// OCRService.ts
// Serviço para processamento OCR de documentos RG/CNH

import { extractDocumentData, ExtractedData } from '../utils/ocrUtils'

export interface OCRProgress {
  isVisible: boolean
  progress: number
  status: string
}

export interface OCRResult {
  success: boolean
  data: ExtractedData
  rawText: string
  confidence: number
  error?: string
}

export class OCRService {
  private static instance: OCRService

  static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService()
    }
    return OCRService.instance
  }

  async processDocument(
    imageBlob: Blob, 
    onProgress?: (progress: number, status: string) => void
  ): Promise<OCRResult> {
    try {
      console.log('🔍 Iniciando processamento OCR...')
      
      if (onProgress) {
        onProgress(0.1, 'Preparando imagem...')
      }

      // Usar o utilitário OCR existente
      const extractedData = await extractDocumentData(imageBlob, onProgress)
      
      if (onProgress) {
        onProgress(1.0, 'Processamento concluído!')
      }

      // Calcular confiança baseada nos campos extraídos
      const confidence = this.calculateConfidence(extractedData)

      console.log('✅ OCR processado com sucesso:', extractedData)
      
      return {
        success: true,
        data: extractedData,
        rawText: '', // Será preenchido pelo extractDocumentData
        confidence
      }
    } catch (error) {
      console.error('❌ Erro no processamento OCR:', error)
      
      return {
        success: false,
        data: {},
        rawText: '',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  private calculateConfidence(data: ExtractedData): number {
    const fields = [
      'nome', 'cpf', 'rg', 'nascimento', 'pai', 'mae', 
      'naturalidade', 'sexo', 'estadoCivil'
    ]
    
    let extractedFields = 0
    fields.forEach(field => {
      if (data[field as keyof ExtractedData]) {
        extractedFields++
      }
    })

    // Calcular confiança baseada na quantidade de campos extraídos
    const confidence = (extractedFields / fields.length) * 100
    return Math.round(confidence)
  }

  async validateExtractedData(data: ExtractedData): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    // Validar CPF
    if (data.cpf && !this.isValidCPF(data.cpf)) {
      errors.push('CPF inválido')
    }

    // Validar RG
    if (data.rg && !this.isValidRG(data.rg)) {
      warnings.push('RG pode estar inválido')
    }

    // Validar data de nascimento
    if (data.nascimento && !this.isValidDate(data.nascimento)) {
      errors.push('Data de nascimento inválida')
    }

    // Validar nome
    if (data.nome && data.nome.length < 3) {
      errors.push('Nome muito curto')
    }

    // Verificar campos obrigatórios
    if (!data.nome) {
      errors.push('Nome é obrigatório')
    }

    if (!data.cpf && !data.rg) {
      warnings.push('CPF ou RG é recomendado')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  private isValidCPF(cpf: string): boolean {
    const numbers = cpf.replace(/\D/g, '')
    if (numbers.length !== 11) return false

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numbers)) return false

    // Validar dígitos verificadores
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i)
    }
    let remainder = sum % 11
    let digit1 = remainder < 2 ? 0 : 11 - remainder

    if (parseInt(numbers[9]) !== digit1) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i)
    }
    remainder = sum % 11
    let digit2 = remainder < 2 ? 0 : 11 - remainder

    return parseInt(numbers[10]) === digit2
  }

  private isValidRG(rg: string): boolean {
    const numbers = rg.replace(/\D/g, '')
    return numbers.length >= 7 && numbers.length <= 9
  }

  private isValidDate(dateString: string): boolean {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
    if (!dateRegex.test(dateString)) return false

    const [day, month, year] = dateString.split('/').map(Number)
    const date = new Date(year, month - 1, day)
    
    return date.getDate() === day && 
           date.getMonth() === month - 1 && 
           date.getFullYear() === year
  }

  formatExtractedData(data: ExtractedData): ExtractedData {
    const formatted: ExtractedData = { ...data }

    // Formatar CPF
    if (formatted.cpf) {
      formatted.cpf = this.formatCPF(formatted.cpf)
    }

    // Formatar RG
    if (formatted.rg) {
      formatted.rg = this.formatRG(formatted.rg)
    }

    // Formatar data de nascimento
    if (formatted.nascimento) {
      formatted.nascimento = this.formatDate(formatted.nascimento)
    }

    // Formatar nome (capitalizar)
    if (formatted.nome) {
      formatted.nome = this.capitalizeName(formatted.nome)
    }

    // Formatar nome do pai
    if (formatted.pai) {
      formatted.pai = this.capitalizeName(formatted.pai)
    }

    // Formatar nome da mãe
    if (formatted.mae) {
      formatted.mae = this.capitalizeName(formatted.mae)
    }

    return formatted
  }

  private formatCPF(cpf: string): string {
    const numbers = cpf.replace(/\D/g, '')
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  private formatRG(rg: string): string {
    const numbers = rg.replace(/\D/g, '')
    if (numbers.length <= 7) {
      return numbers.replace(/(\d{1,2})(\d{3})(\d{3})/, '$1.$2.$3')
    } else {
      return numbers.replace(/(\d{1,2})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
    }
  }

  private formatDate(dateString: string): string {
    const numbers = dateString.replace(/\D/g, '')
    if (numbers.length === 8) {
      return numbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3')
    }
    return dateString
  }

  private capitalizeName(name: string): string {
    return name.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
  }
}

// Instância singleton
export const ocrService = OCRService.getInstance()
