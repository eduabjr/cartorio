// app.module.ts
// Módulo principal do serviço de funcionários

import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { FuncionarioModule } from './funcionario/funcionario.module'
import { HealthModule } from './health/health.module'

@Module({
  imports: [
    PrismaModule,
    FuncionarioModule,
    HealthModule
  ],
})
export class AppModule {}
