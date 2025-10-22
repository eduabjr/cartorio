import { Injectable, Logger } from '@nestjs/common';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  timeout: number;
  resetTimeout: number;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private circuits = new Map<string, {
    state: CircuitState;
    failureCount: number;
    lastFailureTime: number;
    config: CircuitBreakerConfig;
  }>();

  private defaultConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    timeout: 10000, // 10 segundos
    resetTimeout: 30000, // 30 segundos
  };

  async execute<T>(
    serviceName: string,
    operation: () => Promise<T>,
    config?: Partial<CircuitBreakerConfig>
  ): Promise<T> {
    const circuitConfig = { ...this.defaultConfig, ...config };
    const circuit = this.getOrCreateCircuit(serviceName, circuitConfig);

    if (circuit.state === CircuitState.OPEN) {
      if (Date.now() - circuit.lastFailureTime > circuitConfig.resetTimeout) {
        circuit.state = CircuitState.HALF_OPEN;
        this.logger.log(`Circuit breaker para ${serviceName} mudou para HALF_OPEN`);
      } else {
        throw new Error(`Circuit breaker aberto para ${serviceName}`);
      }
    }

    try {
      const result = await Promise.race([
        operation(),
        this.timeoutPromise(circuitConfig.timeout)
      ]);

      if (circuit.state === CircuitState.HALF_OPEN) {
        circuit.state = CircuitState.CLOSED;
        circuit.failureCount = 0;
        this.logger.log(`Circuit breaker para ${serviceName} resetado para CLOSED`);
      }

      return result;
    } catch (error) {
      circuit.failureCount++;
      circuit.lastFailureTime = Date.now();

      if (circuit.failureCount >= circuitConfig.failureThreshold) {
        circuit.state = CircuitState.OPEN;
        this.logger.error(`Circuit breaker aberto para ${serviceName} após ${circuit.failureCount} falhas`);
      }

      throw error;
    }
  }

  private getOrCreateCircuit(serviceName: string, config: CircuitBreakerConfig) {
    if (!this.circuits.has(serviceName)) {
      this.circuits.set(serviceName, {
        state: CircuitState.CLOSED,
        failureCount: 0,
        lastFailureTime: 0,
        config,
      });
    }
    return this.circuits.get(serviceName)!;
  }

  private timeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), timeout);
    });
  }

  getCircuitState(serviceName: string): CircuitState | null {
    const circuit = this.circuits.get(serviceName);
    return circuit ? circuit.state : null;
  }

  resetCircuit(serviceName: string): void {
    const circuit = this.circuits.get(serviceName);
    if (circuit) {
      circuit.state = CircuitState.CLOSED;
      circuit.failureCount = 0;
      circuit.lastFailureTime = 0;
      this.logger.log(`Circuit breaker resetado manualmente para ${serviceName}`);
    }
  }
}
