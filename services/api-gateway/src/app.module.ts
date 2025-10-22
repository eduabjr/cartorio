import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { CircuitBreakerService } from './circuit-breaker/circuit-breaker.service';
import { RetryService } from './retry/retry.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [GatewayController],
  providers: [GatewayService, CircuitBreakerService, RetryService],
})
export class AppModule {}
