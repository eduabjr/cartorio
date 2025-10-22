import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProtocoloModule } from './protocolo/protocolo.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProtocoloModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

