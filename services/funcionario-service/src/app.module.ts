// app.module.ts
// Módulo principal do serviço de funcionários

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { FuncionarioModule } from './funcionario/funcionario.module'
import { HealthModule } from './health/health.module'
import { CacheModule } from '../../shared/src/cache/cache.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule, // ⚡ OTIMIZAÇÃO: Cache Redis global
    PrismaModule,
    FuncionarioModule,
    HealthModule
  ],
})
export class AppModule {}
