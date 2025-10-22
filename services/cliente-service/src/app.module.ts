import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClienteModule } from './cliente/cliente.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClienteModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

