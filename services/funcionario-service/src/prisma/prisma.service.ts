// prisma.service.ts
// Serviço do Prisma para funcionários

import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect()
    console.log('✅ Prisma conectado ao banco de dados')
  }

  async onModuleDestroy() {
    await this.$disconnect()
    console.log('🔌 Prisma desconectado do banco de dados')
  }
}
