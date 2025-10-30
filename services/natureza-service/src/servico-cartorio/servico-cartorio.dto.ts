// DTOs para Serviço de Cartório

export class CreateServicoCartorioDto {
  naturezaId?: string
  codigoServico: string
  descricao: string
  aoOficial: number
  iss?: number
  aSecFaz?: number
  total?: number
  tipoServico?: string
  unidadeReferencia?: string
  observacoes?: string
  ativo?: boolean
}

export class UpdateServicoCartorioDto {
  naturezaId?: string
  codigoServico?: string
  descricao?: string
  aoOficial?: number
  iss?: number
  aSecFaz?: number
  total?: number
  tipoServico?: string
  unidadeReferencia?: string
  observacoes?: string
  ativo?: boolean
}

