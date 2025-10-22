import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ClienteService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    if (search) {
      return this.prisma.cliente.findMany({
        where: {
          OR: [
            { nome: { contains: search } },
            { cpf: { contains: search } },
            { email: { contains: search } },
          ],
        },
        orderBy: { criadoEm: 'desc' },
      });
    }
    return this.prisma.cliente.findMany({ orderBy: { criadoEm: 'desc' } });
  }

  async findOne(id: string) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });
    if (!cliente) throw new NotFoundException(`Cliente ${id} não encontrado`);
    return cliente;
  }

  async create(data: any) {
    return this.prisma.cliente.create({ data });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.cliente.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.cliente.delete({ where: { id } });
  }
}

