import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClienteModule } from './cliente/cliente.module';
import { HealthController } from './health.controller';
import { CacheModule } from '../../shared/src/cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule, // ⚡ OTIMIZAÇÃO: Cache Redis global
    ClienteModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

