import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProtocoloDto, UpdateProtocoloDto } from './protocolo.dto';

@Injectable()
export class ProtocoloService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { tipo?: string; status?: string }) {
    const where: any = {};
    
    if (filters?.tipo) {
      where.tipo = filters.tipo;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.protocolo.findMany({
      where,
      orderBy: {
        criadoEm: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const protocolo = await this.prisma.protocolo.findUnique({
      where: { id },
    });

    if (!protocolo) {
      throw new NotFoundException(`Protocolo ${id} não encontrado`);
    }

    return protocolo;
  }

  async create(data: CreateProtocoloDto) {
    const protocolo = await this.prisma.protocolo.create({
      data: {
        ...data,
        status: 'ativo',
      },
    });

    // Registrar no histórico
    await this.registrarHistorico(protocolo.id, 'criado', 'Protocolo criado');

    return protocolo;
  }

  async update(id: string, data: UpdateProtocoloDto) {
    await this.findOne(id); // Verifica se existe

    const protocolo = await this.prisma.protocolo.update({
      where: { id },
      data,
    });

    // Registrar no histórico
    await this.registrarHistorico(id, 'atualizado', 'Protocolo atualizado');

    return protocolo;
  }

  async remove(id: string) {
    await this.findOne(id); // Verifica se existe

    return this.prisma.protocolo.delete({
      where: { id },
    });
  }

  async baixar(id: string) {
    await this.findOne(id); // Verifica se existe

    const protocolo = await this.prisma.protocolo.update({
      where: { id },
      data: { status: 'baixado' },
    });

    // Registrar no histórico
    await this.registrarHistorico(id, 'baixado', 'Protocolo baixado');

    return protocolo;
  }

  async cancelar(id: string) {
    await this.findOne(id); // Verifica se existe

    const protocolo = await this.prisma.protocolo.update({
      where: { id },
      data: { status: 'cancelado' },
    });

    // Registrar no histórico
    await this.registrarHistorico(id, 'cancelado', 'Protocolo cancelado');

    return protocolo;
  }

  async getHistorico(protocoloId: string) {
    await this.findOne(protocoloId); // Verifica se existe

    return this.prisma.historicoProtocolo.findMany({
      where: { protocoloId },
      orderBy: { criadoEm: 'desc' },
    });
  }

  private async registrarHistorico(protocoloId: string, acao: string, descricao: string) {
    return this.prisma.historicoProtocolo.create({
      data: {
        protocoloId,
        acao,
        descricao,
      },
    });
  }
}

