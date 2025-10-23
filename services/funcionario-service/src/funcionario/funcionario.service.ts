// funcionario.service.ts
// Serviço de funcionários

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateFuncionarioDto, UpdateFuncionarioDto } from './funcionario.dto'

@Injectable()
export class FuncionarioService {
  constructor(private prisma: PrismaService) {}

  // Criar novo funcionário
  async create(createFuncionarioDto: CreateFuncionarioDto) {
    try {
      // Verificar se CPF já existe
      const existingCPF = await this.prisma.funcionario.findUnique({
        where: { cpf: createFuncionarioDto.cpf }
      })

      if (existingCPF) {
        throw new ConflictException('CPF já cadastrado')
      }

      // Verificar se código já existe
      const existingCodigo = await this.prisma.funcionario.findUnique({
        where: { codigo: createFuncionarioDto.codigo }
      })

      if (existingCodigo) {
        throw new ConflictException('Código já cadastrado')
      }

      // Verificar se login já existe (se fornecido)
      if (createFuncionarioDto.login) {
        const existingLogin = await this.prisma.funcionario.findUnique({
          where: { login: createFuncionarioDto.login }
        })

        if (existingLogin) {
          throw new ConflictException('Login já cadastrado')
        }
      }

      // Validar CPF
      if (!this.validateCPF(createFuncionarioDto.cpf)) {
        throw new BadRequestException('CPF inválido')
      }

      // Criar funcionário
      const funcionario = await this.prisma.funcionario.create({
        data: createFuncionarioDto
      })

      return funcionario
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error
      }
      throw new Error('Erro ao criar funcionário')
    }
  }

  // Buscar todos os funcionários
  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit

    const where = search ? {
      OR: [
        { nome: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { codigo: { contains: search } },
        { cargo: { contains: search, mode: 'insensitive' } }
      ]
    } : {}

    const [funcionarios, total] = await Promise.all([
      this.prisma.funcionario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' }
      }),
      this.prisma.funcionario.count({ where })
    ])

    return {
      data: funcionarios,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  // Buscar funcionário por ID
  async findOne(id: string) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id }
    })

    if (!funcionario) {
      throw new NotFoundException('Funcionário não encontrado')
    }

    return funcionario
  }

  // Buscar funcionário por CPF
  async findByCPF(cpf: string) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { cpf }
    })

    if (!funcionario) {
      throw new NotFoundException('Funcionário não encontrado')
    }

    return funcionario
  }

  // Buscar funcionários por nome
  async searchByName(name: string) {
    const funcionarios = await this.prisma.funcionario.findMany({
      where: {
        nome: { contains: name, mode: 'insensitive' }
      },
      take: 10,
      orderBy: { nome: 'asc' }
    })

    return funcionarios
  }

  // Atualizar funcionário
  async update(id: string, updateFuncionarioDto: UpdateFuncionarioDto) {
    try {
      // Verificar se funcionário existe
      const existingFuncionario = await this.prisma.funcionario.findUnique({
        where: { id }
      })

      if (!existingFuncionario) {
        throw new NotFoundException('Funcionário não encontrado')
      }

      // Verificar se CPF já existe em outro funcionário
      if (updateFuncionarioDto.cpf && updateFuncionarioDto.cpf !== existingFuncionario.cpf) {
        const existingCPF = await this.prisma.funcionario.findUnique({
          where: { cpf: updateFuncionarioDto.cpf }
        })

        if (existingCPF) {
          throw new ConflictException('CPF já cadastrado')
        }

        // Validar CPF
        if (!this.validateCPF(updateFuncionarioDto.cpf)) {
          throw new BadRequestException('CPF inválido')
        }
      }

      // Verificar se código já existe em outro funcionário
      if (updateFuncionarioDto.codigo && updateFuncionarioDto.codigo !== existingFuncionario.codigo) {
        const existingCodigo = await this.prisma.funcionario.findUnique({
          where: { codigo: updateFuncionarioDto.codigo }
        })

        if (existingCodigo) {
          throw new ConflictException('Código já cadastrado')
        }
      }

      // Verificar se login já existe em outro funcionário
      if (updateFuncionarioDto.login && updateFuncionarioDto.login !== existingFuncionario.login) {
        const existingLogin = await this.prisma.funcionario.findUnique({
          where: { login: updateFuncionarioDto.login }
        })

        if (existingLogin) {
          throw new ConflictException('Login já cadastrado')
        }
      }

      // Atualizar funcionário
      const funcionario = await this.prisma.funcionario.update({
        where: { id },
        data: updateFuncionarioDto
      })

      return funcionario
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error
      }
      throw new Error('Erro ao atualizar funcionário')
    }
  }

  // Deletar funcionário
  async remove(id: string) {
    try {
      // Verificar se funcionário existe
      const existingFuncionario = await this.prisma.funcionario.findUnique({
        where: { id }
      })

      if (!existingFuncionario) {
        throw new NotFoundException('Funcionário não encontrado')
      }

      // Deletar funcionário
      await this.prisma.funcionario.delete({
        where: { id }
      })

      return { message: 'Funcionário deletado com sucesso' }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new Error('Erro ao deletar funcionário')
    }
  }

  // Validar CPF
  private validateCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '')

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false

    // Validação do primeiro dígito verificador
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cpf.charAt(9))) return false

    // Validação do segundo dígito verificador
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cpf.charAt(10))) return false

    return true
  }

  // Estatísticas de funcionários
  async getStats() {
    const [total, ativos, inativos, porCargo] = await Promise.all([
      this.prisma.funcionario.count(),
      this.prisma.funcionario.count({ where: { emAtividade: true } }),
      this.prisma.funcionario.count({ where: { emAtividade: false } }),
      this.prisma.funcionario.groupBy({
        by: ['cargo'],
        _count: { cargo: true },
        where: { cargo: { not: null } },
        orderBy: { _count: { cargo: 'desc' } },
        take: 10
      })
    ])

    return {
      total,
      ativos,
      inativos,
      porCargo
    }
  }
}
