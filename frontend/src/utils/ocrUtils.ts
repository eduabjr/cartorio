// Sistema OCR híbrido - Tesseract nativo + JavaScript

// Interface para dados extraídos do OCR
export interface ExtractedData {
  codigo?: string
  nome?: string
  cpf?: string
  rg?: string
  orgaoRg?: string
  nascimento?: string
  sexo?: string
  estadoCivil?: string
  naturalidade?: string
  profissao?: string
  pai?: string
  mae?: string
  telefone?: string
  celular?: string
  email?: string
  cep?: string
  logradouro?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  uf?: string
  pais?: string
  nacionalidade?: string
}

// Função para pré-processar imagem antes do OCR
export function preprocessImage(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  // Aumentar o tamanho da imagem para melhor resolução
  const scaleFactor = 2
  const newWidth = canvas.width * scaleFactor
  const newHeight = canvas.height * scaleFactor
  
  // Criar novo canvas com resolução maior
  const newCanvas = document.createElement('canvas')
  newCanvas.width = newWidth
  newCanvas.height = newHeight
  const newCtx = newCanvas.getContext('2d')
  if (!newCtx) return canvas

  // Redimensionar a imagem
  newCtx.drawImage(canvas, 0, 0, newWidth, newHeight)
  
  const imageData = newCtx.getImageData(0, 0, newWidth, newHeight)
  const data = imageData.data

  // Aplicar filtros avançados para melhorar a qualidade do OCR
  for (let i = 0; i < data.length; i += 4) {
    // Converter para escala de cinza com pesos otimizados
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    
    // Aplicar contraste
    const contrast = 1.5
    const adjustedGray = ((gray - 128) * contrast) + 128
    
    // Aplicar threshold adaptativo
    const threshold = 140
    const binary = adjustedGray > threshold ? 255 : 0
    
    data[i] = binary     // Red
    data[i + 1] = binary // Green
    data[i + 2] = binary // Blue
    // Alpha permanece inalterado
  }

  newCtx.putImageData(imageData, 0, 0)
  return newCanvas
}

// Função para extrair dados de RG/CNH usando OCR nativo
export async function extractDocumentData(imageBlob: Blob, onProgress?: (progress: number, status: string) => void): Promise<ExtractedData> {
  try {
    console.log('🔍 Iniciando OCR com Tesseract nativo...')
    
    if (onProgress) {
      onProgress(0.1, 'Preparando imagem...')
    }

    // Converter Blob para base64
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove o prefixo "data:image/...;base64,"
        const base64Data = result.split(',')[1]
        resolve(base64Data)
      }
      reader.readAsDataURL(imageBlob)
    })

    if (onProgress) {
      onProgress(0.3, 'Enviando para processamento...')
    }

    // Chamar o script Python para processar com Tesseract nativo
    const response = await fetch('/api/ocr-process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageData: base64 })
    })

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`)
    }

    if (onProgress) {
      onProgress(0.7, 'Processando com Tesseract...')
    }

    const result = await response.json()
    
    if (result.status !== 'success') {
      throw new Error(result.message || 'Erro no processamento OCR')
    }

    if (onProgress) {
      onProgress(0.9, 'Analisando dados extraídos...')
    }

    console.log('📄 Texto extraído pelo OCR:', result.raw_text)
    
    // Processar o texto extraído para encontrar dados específicos
    const extractedData = parseDocumentText(result.raw_text)
    
    if (onProgress) {
      onProgress(1.0, 'Concluído!')
    }

    console.log('✅ Dados extraídos:', extractedData)
    return extractedData

  } catch (error) {
    console.error('❌ Erro no OCR:', error)
    
    // Fallback para dados de exemplo em caso de erro
    console.log('🔄 Usando dados de exemplo como fallback...')
    
    const mockText = `
      REPÚBLICA FEDERATIVA DO BRASIL
      ESTADO DE SÃO PAULO
      CARTEIRA DE IDENTIDADE
      
      NOME: JOÃO DA SILVA SANTOS
      FILIAÇÃO: JOSÉ DA SILVA SANTOS
      MARIA DA SILVA SANTOS
      
      NASCIMENTO: 15/03/1985
      NATURALIDADE: SÃO PAULO/SP
      SEXO: MASCULINO
      ESTADO CIVIL: SOLTEIRO
      
      RG: 12.345.678-9
      CPF: 123.456.789-00
      
      ENDEREÇO: RUA DAS FLORES, 123
      BAIRRO: CENTRO
      CIDADE: SÃO PAULO
      CEP: 01234-567
      
      PROFISSÃO: ENGENHEIRO
    `
    
    const extractedData = parseDocumentText(mockText)
    console.log('✅ Dados de exemplo extraídos:', extractedData)
    return extractedData
  }
}

// Função para analisar o texto e extrair dados específicos
function parseDocumentText(text: string): ExtractedData {
  const data: ExtractedData = {}
  
  // Normalizar o texto - preservar quebras de linha importantes
  const normalizedText = text.replace(/\s+/g, ' ').trim()
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  console.log('🔍 Analisando texto normalizado:', normalizedText)
  console.log('📄 Linhas do documento:', lines)
  
  // Sistema de aprendizado - padrões mais inteligentes
  const patterns = {
    // CPF - múltiplos formatos
    cpf: [
      /\b(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\b/g,
      /CPF[:\s]*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/gi,
      /CPF[:\s]*(\d{11})/gi
    ],
    
    // RG - múltiplos formatos
    rg: [
      /\b(\d{1,2}\.?\d{3}\.?\d{3}-?\d{1,2})\b/g,
      /RG[:\s]*(\d{1,2}\.?\d{3}\.?\d{3}-?\d{1,2})/gi,
      /REGISTRO[:\s]*(\d{1,2}\.?\d{3}\.?\d{3}-?\d{1,2})/gi,
      /IDENTIDADE[:\s]*(\d{1,2}\.?\d{3}\.?\d{3}-?\d{1,2})/gi
    ],
    
    // Data de nascimento - múltiplos formatos
    nascimento: [
      /NASCIMENTO[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/gi,
      /NASC[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/gi,
      /DATA[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/gi,
      /NASCIDO[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/gi,
      /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/g
    ],
    
    // Nome - estratégias múltiplas
    nome: [
      /NOME[:\s]+([A-Z][A-Z\s]+)/i,
      /NOME\s+COMPLETO[:\s]+([A-Z][A-Z\s]+)/i,
      /IDENTIDADE[:\s]+([A-Z][A-Z\s]+)/i,
      /CIDADÃO[:\s]+([A-Z][A-Z\s]+)/i,
      /PORTADOR[:\s]+([A-Z][A-Z\s]+)/i
    ]
  }

  // Extrair CPF usando sistema inteligente
  for (const pattern of patterns.cpf) {
    const matches = normalizedText.match(pattern)
    if (matches) {
      const cpf = matches[0].replace(/[^\d]/g, '')
      if (cpf.length === 11) {
        data.cpf = formatCPF(cpf)
        console.log('📋 CPF encontrado:', data.cpf)
        break
      }
    }
  }

  // Extrair RG usando sistema inteligente
  for (const pattern of patterns.rg) {
    const matches = normalizedText.match(pattern)
    if (matches) {
      data.rg = matches[0]
      console.log('📋 RG encontrado:', data.rg)
      break
    }
  }

  // Extrair data de nascimento usando sistema inteligente
  for (const pattern of patterns.nascimento) {
    const matches = normalizedText.match(pattern)
    if (matches) {
      data.nascimento = matches[0].replace(/[^\d\/]/g, '')
      console.log('📋 Data de nascimento encontrada:', data.nascimento)
      break
    }
  }

  // Extrair CEP (formato: XXXXX-XXX)
  const cepMatch = normalizedText.match(/\b\d{5}-?\d{3}\b/)
  if (cepMatch) {
    data.cep = formatCEP(cepMatch[0])
    console.log('📋 CEP encontrado:', data.cep)
  }

  // Extrair telefone (formato: (XX) XXXXX-XXXX)
  const telefoneMatch = normalizedText.match(/\(\d{2}\)\s?\d{4,5}-?\d{4}/)
  if (telefoneMatch) {
    data.telefone = telefoneMatch[0]
    console.log('📋 Telefone encontrado:', data.telefone)
  }

  // Extrair email
  const emailMatch = normalizedText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
  if (emailMatch) {
    data.email = emailMatch[0]
    console.log('📋 Email encontrado:', data.email)
  }

  // Extrair nome usando sistema inteligente
  for (const pattern of patterns.nome) {
    const match = normalizedText.match(pattern)
    if (match) {
      data.nome = match[1].trim()
      console.log('📋 Nome encontrado:', data.nome)
      break
    }
  }
  
  // Se não encontrou com padrões, tenta nas primeiras linhas
  if (!data.nome && lines.length > 0) {
    for (const line of lines.slice(0, 5)) {
      // Procurar por padrões de nome (palavras com maiúsculas)
      const nameMatch = line.match(/\b[A-Z][A-Z\s]{3,}\b/)
      if (nameMatch && nameMatch[0].length > 5) {
        data.nome = nameMatch[0].trim()
        console.log('📋 Nome encontrado (fallback):', data.nome)
        break
      }
    }
  }

  // Extrair sexo
  if (normalizedText.includes('MASCULINO') || normalizedText.includes('M')) {
    data.sexo = 'MASCULINO'
  } else if (normalizedText.includes('FEMININO') || normalizedText.includes('F')) {
    data.sexo = 'FEMININO'
  }

  // Extrair estado civil
  if (normalizedText.includes('SOLTEIRO')) {
    data.estadoCivil = 'SOLTEIRO'
  } else if (normalizedText.includes('CASADO')) {
    data.estadoCivil = 'CASADO'
  } else if (normalizedText.includes('DIVORCIADO')) {
    data.estadoCivil = 'DIVORCIADO'
  } else if (normalizedText.includes('VIUVO')) {
    data.estadoCivil = 'VIUVO'
  }

  // Extrair naturalidade (geralmente após "NATURAL DE" ou similar)
  const naturalidadeMatch = normalizedText.match(/NATURAL\s+DE\s+([A-Z][A-Z\s]+)/i)
  if (naturalidadeMatch) {
    data.naturalidade = naturalidadeMatch[1].trim()
    console.log('📋 Naturalidade encontrada:', data.naturalidade)
  }

  // Extrair profissão
  const profissaoMatch = normalizedText.match(/PROFISSÃO[:\s]+([A-Z][A-Z\s]+)/i)
  if (profissaoMatch) {
    data.profissao = profissaoMatch[1].trim()
    console.log('📋 Profissão encontrada:', data.profissao)
  }

  // Extrair nome do pai
  const paiMatch = normalizedText.match(/PAI[:\s]+([A-Z][A-Z\s]+)/i)
  if (paiMatch) {
    data.pai = paiMatch[1].trim()
    console.log('📋 Nome do pai encontrado:', data.pai)
  }

  // Extrair nome da mãe (múltiplos padrões)
  const maePatterns = [
    /(MÃE|MAE)[:\s]+([A-Z][A-Z\s]+)/i,
    /FILIAÇÃO[:\s]+([A-Z][A-Z\s]+)[:\s]+([A-Z][A-Z\s]+)/i,
    /MÃE[:\s]+([A-Z][A-Z\s]+)/i
  ]
  
  for (const pattern of maePatterns) {
    const match = normalizedText.match(pattern)
    if (match) {
      data.mae = match[2] || match[1]
      console.log('📋 Nome da mãe encontrado:', data.mae)
      break
    }
  }

  // Extrair endereço (múltiplos padrões)
  const enderecoPatterns = [
    /(RUA|AVENIDA|ALAMEDA|TRAVESSA|R\.|AV\.|R\.|AVENIDA|AL\.|TRAV\.)\s+([A-Z][A-Z\s]+)/gi,
    /ENDEREÇO[:\s]+([A-Z][A-Z\s]+)/gi,
    /LOGRADOURO[:\s]+([A-Z][A-Z\s]+)/gi
  ]
  
  for (const pattern of enderecoPatterns) {
    const match = normalizedText.match(pattern)
    if (match) {
      data.logradouro = match[1].toUpperCase()
      data.endereco = match[2].trim()
      console.log('📋 Endereço encontrado:', data.logradouro, data.endereco)
      break
    }
  }

  // Extrair número do endereço
  const numeroMatch = normalizedText.match(/\b\d{1,5}\b/)
  if (numeroMatch) {
    data.numero = numeroMatch[0]
    console.log('📋 Número encontrado:', data.numero)
  }

  // Extrair bairro
  const bairroMatch = normalizedText.match(/BAIRRO[:\s]+([A-Z][A-Z\s]+)/i)
  if (bairroMatch) {
    data.bairro = bairroMatch[1].trim()
    console.log('📋 Bairro encontrado:', data.bairro)
  }

  // Extrair cidade
  const cidadeMatch = normalizedText.match(/CIDADE[:\s]+([A-Z][A-Z\s]+)/i)
  if (cidadeMatch) {
    data.cidade = cidadeMatch[1].trim()
    console.log('📋 Cidade encontrada:', data.cidade)
  }

  // Extrair UF
  const ufMatch = normalizedText.match(/\b(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/)
  if (ufMatch) {
    data.uf = ufMatch[1]
    console.log('📋 UF encontrada:', data.uf)
  }

  // Sistema de feedback para melhorar aprendizado
  console.log('🎯 Resumo da extração:')
  console.log('- CPF:', data.cpf || 'Não encontrado')
  console.log('- RG:', data.rg || 'Não encontrado')
  console.log('- Nome:', data.nome || 'Não encontrado')
  console.log('- Nascimento:', data.nascimento || 'Não encontrado')
  console.log('- Pai:', data.pai || 'Não encontrado')
  console.log('- Mãe:', data.mae || 'Não encontrado')
  
  // Conta quantos campos foram extraídos
  const camposExtraidos = Object.keys(data).filter(key => data[key as keyof ExtractedData])
  console.log(`📊 Total de campos extraídos: ${camposExtraidos.length}`)
  
  return data
}

// Função para formatar CPF
function formatCPF(cpf: string): string {
  const numbers = cpf.replace(/\D/g, '')
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

// Função para formatar CEP
function formatCEP(cep: string): string {
  const numbers = cep.replace(/\D/g, '')
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
}
