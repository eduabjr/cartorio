// natureza.service.ts
// Service de naturezas de serviços

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateNaturezaDto, UpdateNaturezaDto } from './natureza.dto'

@Injectable()
export class NaturezaService {
  constructor(private prisma: PrismaService) {}

  async create(createNaturezaDto: CreateNaturezaDto) {
    try {
      // Verificar se já existe natureza com mesmo código
      const existente = await this.prisma.natureza.findUnique({
        where: { codigo: createNaturezaDto.codigo }
      })

      if (existente) {
        throw new ConflictException(`Natureza com código ${createNaturezaDto.codigo} já existe`)
      }

      return await this.prisma.natureza.create({
        data: {
          codigo: createNaturezaDto.codigo,
          descricao: createNaturezaDto.descricao,
          percentualIss: createNaturezaDto.percentualIss,
          ativo: createNaturezaDto.ativo ?? true,
          observacoes: createNaturezaDto.observacoes,
          tabelaUrl: createNaturezaDto.tabelaUrl
        }
      })
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error
      }
      throw new Error(`Erro ao criar natureza: ${error.message}`)
    }
  }

  async findAll(page: number = 1, limit: number = 100, search?: string) {
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { codigo: { contains: search } },
            { descricao: { contains: search } }
          ]
        }
      : {}

    const [naturezas, total] = await Promise.all([
      this.prisma.natureza.findMany({
        where,
        skip,
        take: limit,
        orderBy: { codigo: 'asc' }
      }),
      this.prisma.natureza.count({ where })
    ])

    return {
      data: naturezas,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async findActive() {
    return await this.prisma.natureza.findMany({
      where: { ativo: true },
      orderBy: { percentualIss: 'asc' }
    })
  }

  async findOne(id: string) {
    const natureza = await this.prisma.natureza.findUnique({
      where: { id }
    })

    if (!natureza) {
      throw new NotFoundException(`Natureza com ID ${id} não encontrada`)
    }

    return natureza
  }

  async findByCodigo(codigo: string) {
    const natureza = await this.prisma.natureza.findUnique({
      where: { codigo }
    })

    if (!natureza) {
      throw new NotFoundException(`Natureza com código ${codigo} não encontrada`)
    }

    return natureza
  }

  async update(id: string, updateNaturezaDto: UpdateNaturezaDto) {
    try {
      // Verificar se a natureza existe
      await this.findOne(id)

      // Se está atualizando o código, verificar duplicação
      if (updateNaturezaDto.codigo) {
        const existente = await this.prisma.natureza.findFirst({
          where: {
            codigo: updateNaturezaDto.codigo,
            NOT: { id }
          }
        })

        if (existente) {
          throw new ConflictException(`Natureza com código ${updateNaturezaDto.codigo} já existe`)
        }
      }

      return await this.prisma.natureza.update({
        where: { id },
        data: updateNaturezaDto
      })
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error
      }
      throw new Error(`Erro ao atualizar natureza: ${error.message}`)
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id)
      await this.prisma.natureza.delete({
        where: { id }
      })
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new Error(`Erro ao remover natureza: ${error.message}`)
    }
  }
}

