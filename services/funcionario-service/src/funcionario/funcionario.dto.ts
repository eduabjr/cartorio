// funcionario.dto.ts
// DTOs para funcionários

import { IsString, IsBoolean, IsOptional, IsEmail, IsDecimal, IsDateString, IsNotEmpty, MinLength, MaxLength } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateFuncionarioDto {
  @IsString()
  @IsNotEmpty()
  codigo: string

  @IsString()
  @IsOptional()
  ordemSinalPublico?: string = '99'

  @IsBoolean()
  @IsOptional()
  emAtividade?: boolean = true

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  nome: string

  @IsString()
  @IsOptional()
  @MaxLength(50)
  nomeMin?: string

  @IsString()
  @IsOptional()
  @MaxLength(50)
  prenome?: string

  @IsString()
  @IsOptional()
  @MaxLength(200)
  endereco?: string

  @IsString()
  @IsOptional()
  @MaxLength(100)
  bairro?: string

  @IsString()
  @IsOptional()
  @MaxLength(100)
  cidade?: string

  @IsString()
  @IsOptional()
  @MaxLength(10)
  cep?: string

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefone?: string

  @IsString()
  @IsOptional()
  @MaxLength(2)
  uf?: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  @MaxLength(20)
  celular?: string

  @IsDateString()
  @IsOptional()
  nascimento?: string

  @IsString()
  @IsOptional()
  @MaxLength(20)
  rg?: string

  @IsString()
  @IsOptional()
  @MaxLength(100)
  mae?: string

  @IsString()
  @IsNotEmpty()
  @MinLength(11)
  @MaxLength(14)
  cpf: string

  @IsString()
  @IsOptional()
  @MaxLength(100)
  pai?: string

  @IsString()
  @IsOptional()
  @MaxLength(100)
  cargo?: string

  @IsBoolean()
  @IsOptional()
  assinante?: boolean = false

  @IsString()
  @IsOptional()
  @MaxLength(100)
  cargoMin?: string

  @IsString()
  @IsOptional()
  @MaxLength(100)
  cargoCivil?: string

  @IsString()
  @IsOptional()
  @MaxLength(100)
  cargoMin2?: string

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  salario?: number

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  comissao?: number

  @IsDateString()
  @IsOptional()
  admissao?: string

  @IsDateString()
  @IsOptional()
  demissao?: string

  @IsString()
  @IsOptional()
  @MaxLength(50)
  login?: string

  @IsString()
  @IsOptional()
  @MaxLength(100)
  senha?: string

  @IsString()
  @IsOptional()
  @MaxLength(500)
  observacao?: string
}

export class UpdateFuncionarioDto {
  @IsString()
  @IsOptional()
  codigo?: string

  @IsString()
  @IsOptional()
  ordemSinalPublico?: string

  @IsBoolean()
  @IsOptional()
  emAtividade?: boolean

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  nome?: string

  @IsString()
  @IsOptional()
  @MaxLength(50)
  nomeMin?: string

  @IsString()
  @IsOptional()
  @MaxLength(50)
  prenome?: string

  @IsString()
  @IsOptional()
  @MaxLength(200)
  endereco?: string

  @IsString()
  @IsOptional()
  @MaxLength(100)
  bairro?: string

  @IsString()
  @IsOptional()
  @MaxLength(100)
  cidade?: string

  @IsString()
  @IsOptional()
  @MaxLength(10)
  cep?: string

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefone?: string

  @IsString()
  @IsOptional()
  @MaxLength(2)
  uf?: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  @MaxLength(20)
  celular?: string

  @IsDateString()
  @IsOptional()
  nascimento?: string

  @IsString()
  @IsOptional()
  @MaxLength(20)
  rg?: string

  @IsString()
  @IsOptional()
  @MaxLength(100)
  mae?: string

  @IsString()
  @IsOptional()
  @MinLength(11)
  @MaxLength(14)
  cpf?: string

  @IsString()
  @IsOptional()
  @MaxLength(100)
  pai?: string

  @IsString()
  @IsOptional()
  @MaxLength(100)
  cargo?: string

  @IsBoolean()
  @IsOptional()
  assinante?: boolean

  @IsString()
  @IsOptional()
  @MaxLength(100)
  cargoMin?: string

  @IsString()
  @IsOptional()
  @MaxLength(100)
  cargoCivil?: string

  @IsString()
  @IsOptional()
  @MaxLength(100)
  cargoMin2?: string

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  salario?: number

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  comissao?: number

  @IsDateString()
  @IsOptional()
  admissao?: string

  @IsDateString()
  @IsOptional()
  demissao?: string

  @IsString()
  @IsOptional()
  @MaxLength(50)
  login?: string

  @IsString()
  @IsOptional()
  @MaxLength(100)
  senha?: string

  @IsString()
  @IsOptional()
  @MaxLength(500)
  observacao?: string
}
