// servico-cartorio.service.ts
// Service de serviços de cartório

import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateServicoCartorioDto, UpdateServicoCartorioDto } from './servico-cartorio.dto'
import { Decimal } from '@prisma/client/runtime/library'

@Injectable()
export class ServicoCartorioService {
  constructor(private prisma: PrismaService) {}

  private calcularValores(aoOficial: number | Decimal) {
    const ao = Number(aoOficial)
    
    // Conforme tabela de custas:
    // ISS = 2% do AO OFICIAL
    // A SEC. FAZ. = 16,6667% do AO OFICIAL
    // TOTAL = soma de todos
    const iss = ao * 0.02
    const aSecFaz = ao * 0.166667
    const total = ao + iss + aSecFaz

    return {
      iss: Number(iss.toFixed(2)),
      aSecFaz: Number(aSecFaz.toFixed(2)),
      total: Number(total.toFixed(2))
    }
  }

  async create(createServicoDto: CreateServicoCartorioDto) {
    try {
      // Calcular valores baseados no AO OFICIAL
      const valores = this.calcularValores(createServicoDto.aoOficial)

      return await this.prisma.servicoCartorio.create({
        data: {
          naturezaId: createServicoDto.naturezaId,
          codigoServico: createServicoDto.codigoServico,
          descricao: createServicoDto.descricao,
          aoOficial: createServicoDto.aoOficial,
          iss: valores.iss,
          aSecFaz: valores.aSecFaz,
          total: valores.total,
          tipoServico: createServicoDto.tipoServico || 'OUTROS',
          unidadeReferencia: createServicoDto.unidadeReferencia,
          observacoes: createServicoDto.observacoes,
          ativo: createServicoDto.ativo ?? true
        },
        include: {
          natureza: true
        }
      })
    } catch (error) {
      throw new Error(`Erro ao criar serviço: ${error.message}`)
    }
  }

  async findAll(page: number = 1, limit: number = 100, search?: string, naturezaId?: string) {
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { codigoServico: { contains: search } },
        { descricao: { contains: search } }
      ]
    }

    if (naturezaId) {
      where.naturezaId = naturezaId
    }

    const [servicos, total] = await Promise.all([
      this.prisma.servicoCartorio.findMany({
        where,
        skip,
        take: limit,
        orderBy: { codigoServico: 'asc' },
        include: {
          natureza: true
        }
      }),
      this.prisma.servicoCartorio.count({ where })
    ])

    return {
      data: servicos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async findActive() {
    return await this.prisma.servicoCartorio.findMany({
      where: { ativo: true },
      orderBy: { codigoServico: 'asc' },
      include: {
        natureza: true
      }
    })
  }

  async findOne(id: string) {
    const servico = await this.prisma.servicoCartorio.findUnique({
      where: { id },
      include: {
        natureza: true
      }
    })

    if (!servico) {
      throw new NotFoundException(`Serviço com ID ${id} não encontrado`)
    }

    return servico
  }

  async findByCodigo(codigo: string) {
    const servico = await this.prisma.servicoCartorio.findFirst({
      where: { codigoServico: codigo },
      include: {
        natureza: true
      }
    })

    if (!servico) {
      throw new NotFoundException(`Serviço com código ${codigo} não encontrado`)
    }

    return servico
  }

  async findByNatureza(naturezaId: string) {
    return await this.prisma.servicoCartorio.findMany({
      where: { naturezaId },
      orderBy: { codigoServico: 'asc' },
      include: {
        natureza: true
      }
    })
  }

  async update(id: string, updateServicoDto: UpdateServicoCartorioDto) {
    try {
      // Verificar se o serviço existe
      const servicoExistente = await this.findOne(id)

      // Valor AO OFICIAL para cálculo (usar existente se não fornecido)
      const aoOficial = updateServicoDto.aoOficial ?? Number(servicoExistente.aoOficial)

      // Recalcular valores baseados no AO OFICIAL
      const valores = this.calcularValores(aoOficial)

      return await this.prisma.servicoCartorio.update({
        where: { id },
        data: {
          ...updateServicoDto,
          iss: valores.iss,
          aSecFaz: valores.aSecFaz,
          total: valores.total
        },
        include: {
          natureza: true
        }
      })
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new Error(`Erro ao atualizar serviço: ${error.message}`)
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id)
      await this.prisma.servicoCartorio.delete({
        where: { id }
      })
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new Error(`Erro ao remover serviço: ${error.message}`)
    }
  }
}

