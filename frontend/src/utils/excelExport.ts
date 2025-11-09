/**
 * Utilitário para exportação de dados para Excel usando a biblioteca xlsx
 * Gera arquivos .xlsx verdadeiros
 */

import * as XLSX from 'xlsx'

interface ExcelExportOptions {
  fileName: string
  sheetName?: string
  data: string[][]
  headers: string[]
  author?: string
}

/**
 * Exporta dados para Excel no formato .xlsx verdadeiro
 * @param options - Opções de exportação
 */
export function exportToExcel(options: ExcelExportOptions): void {
  const {
    fileName,
    sheetName = 'Dados',
    data,
    headers
  } = options

  // Criar workbook
  const wb = XLSX.utils.book_new()

  // Combinar headers e dados
  const wsData = [headers, ...data]

  // Criar worksheet a partir dos dados
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Obter range da planilha
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  
  // Configurar largura das colunas (auto-ajuste)
  const colWidths = headers.map((header, i) => {
    const maxLength = Math.max(
      header.length,
      ...data.map(row => String(row[i] || '').length)
    )
    return { wch: Math.min(Math.max(maxLength + 2, 10), 50) } // Mínimo 10, máximo 50
  })
  ws['!cols'] = colWidths

  // Configurar auto-filtro
  ws['!autofilter'] = { ref: XLSX.utils.encode_range(range) }

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // Configurar propriedades do workbook
  wb.Props = {
    Title: sheetName,
    Subject: 'Relatório exportado',
    Author: 'Sistema CIVITAS',
    CreatedDate: new Date()
  }

  // Garantir que o nome do arquivo termine com .xlsx
  let finalFileName = fileName
  if (fileName.endsWith('.xls') || fileName.endsWith('.xml') || fileName.endsWith('.csv')) {
    finalFileName = fileName.substring(0, fileName.lastIndexOf('.'))
  }
  if (!finalFileName.endsWith('.xlsx')) {
    finalFileName = `${finalFileName}.xlsx`
  }

  // Gerar arquivo e fazer download
  XLSX.writeFile(wb, finalFileName, {
    bookType: 'xlsx',
    type: 'binary',
    compression: true
  })
}

