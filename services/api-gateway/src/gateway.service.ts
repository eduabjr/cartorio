import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { CircuitBreakerService } from './circuit-breaker/circuit-breaker.service';
import { RetryService } from './retry/retry.service';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  private readonly authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
  private readonly userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3002';
  private readonly protocoloServiceUrl = process.env.PROTOCOLO_SERVICE_URL || 'http://protocolo-service:3003';
  private readonly clienteServiceUrl = process.env.CLIENTE_SERVICE_URL || 'http://cliente-service:3004';
  private readonly funcionarioServiceUrl = process.env.FUNCIONARIO_SERVICE_URL || 'http://funcionario-service:3005';

  constructor(
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retryService: RetryService,
  ) {}

  async proxyToAuthService(path: string, data?: any) {
    return this.circuitBreaker.execute(
      'auth-service',
      () => this.retryService.execute(async () => {
        this.logger.log(`Proxying to auth-service: ${path}`);
        const response = await axios({
          method: 'POST',
          url: `${this.authServiceUrl}${path}`,
          data,
          timeout: 5000, // 5 segundos timeout
        });
        return response.data;
      }),
      {
        failureThreshold: 3,
        timeout: 8000,
        resetTimeout: 30000,
      }
    );
  }

  async proxyToUserService(path: string, method: string = 'GET', data?: any) {
    return this.circuitBreaker.execute(
      'user-service',
      () => this.retryService.execute(async () => {
        this.logger.log(`Proxying to user-service: ${path}`);
        const response = await axios({
          method,
          url: `${this.userServiceUrl}${path}`,
          data,
          timeout: 5000, // 5 segundos timeout
        });
        return response.data;
      }),
      {
        failureThreshold: 3,
        timeout: 8000,
        resetTimeout: 30000,
      }
    );
  }

  async proxyToProtocoloService(path: string, method: string = 'GET', data?: any) {
    return this.circuitBreaker.execute(
      'protocolo-service',
      () => this.retryService.execute(async () => {
        this.logger.log(`Proxying to protocolo-service: ${path}`);
        const response = await axios({
          method,
          url: `${this.protocoloServiceUrl}${path}`,
          data,
          timeout: 5000,
        });
        return response.data;
      }),
      {
        failureThreshold: 3,
        timeout: 8000,
        resetTimeout: 30000,
      }
    );
  }

  async proxyToClienteService(path: string, method: string = 'GET', data?: any) {
    return this.circuitBreaker.execute(
      'cliente-service',
      () => this.retryService.execute(async () => {
        this.logger.log(`Proxying to cliente-service: ${path}`);
        const response = await axios({
          method,
          url: `${this.clienteServiceUrl}${path}`,
          data,
          timeout: 5000,
        });
        return response.data;
      }),
      {
        failureThreshold: 3,
        timeout: 8000,
        resetTimeout: 30000,
      }
    );
  }

  async proxyToFuncionarioService(path: string, method: string = 'GET', data?: any) {
    return this.circuitBreaker.execute(
      'funcionario-service',
      () => this.retryService.execute(async () => {
        this.logger.log(`Proxying to funcionario-service: ${path}`);
        const response = await axios({
          method,
          url: `${this.funcionarioServiceUrl}${path}`,
          data,
          timeout: 5000,
        });
        return response.data;
      }),
      {
        failureThreshold: 3,
        timeout: 8000,
        resetTimeout: 30000,
      }
    );
  }

  getServiceHealth() {
    return {
      'auth-service': this.circuitBreaker.getCircuitState('auth-service'),
      'user-service': this.circuitBreaker.getCircuitState('user-service'),
      'protocolo-service': this.circuitBreaker.getCircuitState('protocolo-service'),
      'cliente-service': this.circuitBreaker.getCircuitState('cliente-service'),
      'funcionario-service': this.circuitBreaker.getCircuitState('funcionario-service'),
    };
  }

  resetServiceCircuit(serviceName: string) {
    this.circuitBreaker.resetCircuit(serviceName);
    this.logger.log(`Circuit breaker resetado para ${serviceName}`);
  }
}
