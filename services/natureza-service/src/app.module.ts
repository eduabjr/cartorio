import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { NaturezaModule } from './natureza/natureza.module'
import { ServicoCartorioModule } from './servico-cartorio/servico-cartorio.module'
import { HealthModule } from './health/health.module'
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    PrismaModule,
    NaturezaModule,
    ServicoCartorioModule,
    HealthModule
  ]
})
export class AppModule {}

