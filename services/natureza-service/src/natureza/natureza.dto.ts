// DTOs para Natureza

export class CreateNaturezaDto {
  codigo: string
  descricao: string
  percentualIss: number
  ativo?: boolean
  observacoes?: string
  tabelaUrl?: string
}

export class UpdateNaturezaDto {
  codigo?: string
  descricao?: string
  percentualIss?: number
  ativo?: boolean
  observacoes?: string
  tabelaUrl?: string
}

