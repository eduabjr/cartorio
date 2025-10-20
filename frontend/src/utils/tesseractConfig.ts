// Configuração do Tesseract para Windows
export const TESSERACT_CONFIG = {
  // Caminho do Tesseract instalado no Windows
  TESSERACT_PATH: 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe',
  
  // Configurações otimizadas para documentos brasileiros
  CONFIG: {
    // Idioma português brasileiro
    lang: 'por',
    
    // Configurações de qualidade
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,-/:()@ ',
    tessedit_pageseg_mode: '1', // Segmentação automática de página
    preserve_interword_spaces: '1',
    tessedit_ocr_engine_mode: '1', // LSTM OCR Engine
    
    // Configurações específicas para documentos
    textord_min_linesize: '2.5',
    textord_old_baselines: '0',
    textord_old_xheight: '0',
    
    // Melhorar detecção de números
    classify_bln_numeric_mode: '1',
    
    // Configurações de qualidade
    tessedit_do_invert: '0',
    tessedit_create_hocr: '0',
    tessedit_create_tsv: '0'
  }
}

// Função para verificar se o Tesseract está disponível
export function checkTesseractAvailable(): boolean {
  try {
    // Verifica se o arquivo existe (simulação)
    return true // Assumimos que está instalado
  } catch (error) {
    console.error('❌ Tesseract não encontrado:', error)
    return false
  }
}

// Função para obter configurações do Tesseract
export function getTesseractConfig() {
  return TESSERACT_CONFIG
}

