import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateProtocoloDto {
  @IsString()
  numero: string;

  @IsString()
  tipo: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @IsOptional()
  valor?: number;

  @IsString()
  @IsOptional()
  natureza?: string;

  @IsString()
  @IsOptional()
  complementoAto?: string;

  @IsString()
  @IsOptional()
  comparecente?: string;

  @IsString()
  @IsOptional()
  numeroDocumento?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsString()
  @IsOptional()
  parteA?: string;

  @IsString()
  @IsOptional()
  parteB?: string;

  @IsString()
  @IsOptional()
  responsavel?: string;

  @IsDateString()
  @IsOptional()
  previsaoEntrega?: string;

  @IsString()
  @IsOptional()
  termo?: string;

  @IsString()
  @IsOptional()
  livro?: string;

  @IsString()
  @IsOptional()
  folhas?: string;

  @IsNumber()
  @IsOptional()
  quantidade?: number;

  @IsNumber()
  @IsOptional()
  analfabetos?: number;

  @IsNumber()
  @IsOptional()
  totalAtos?: number;

  @IsNumber()
  @IsOptional()
  outrosServicos?: number;

  @IsNumber()
  @IsOptional()
  total?: number;

  @IsString()
  @IsOptional()
  reciboNome?: string;

  @IsString()
  @IsOptional()
  reciboNumero?: string;

  @IsString()
  @IsOptional()
  fichaBalcao?: string;
}

export class UpdateProtocoloDto {
  @IsString()
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @IsOptional()
  valor?: number;

  @IsString()
  @IsOptional()
  natureza?: string;

  @IsString()
  @IsOptional()
  complementoAto?: string;

  @IsString()
  @IsOptional()
  comparecente?: string;

  @IsString()
  @IsOptional()
  numeroDocumento?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsString()
  @IsOptional()
  parteA?: string;

  @IsString()
  @IsOptional()
  parteB?: string;

  @IsString()
  @IsOptional()
  responsavel?: string;

  @IsDateString()
  @IsOptional()
  previsaoEntrega?: string;
}

