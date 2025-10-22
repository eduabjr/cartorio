import { Injectable, Logger } from '@nestjs/common';

export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoffMultiplier: number;
  maxDelay: number;
}

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  private defaultConfig: RetryConfig = {
    maxAttempts: 3,
    delay: 1000, // 1 segundo
    backoffMultiplier: 2,
    maxDelay: 10000, // 10 segundos
  };

  async execute<T>(
    operation: () => Promise<T>,
    config?: Partial<RetryConfig>
  ): Promise<T> {
    const retryConfig = { ...this.defaultConfig, ...config };
    let lastError: Error;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        if (attempt > 1) {
          this.logger.log(`Operação bem-sucedida na tentativa ${attempt}`);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === retryConfig.maxAttempts) {
          this.logger.error(`Operação falhou após ${retryConfig.maxAttempts} tentativas: ${lastError.message}`);
          throw lastError;
        }

        const delay = this.calculateDelay(attempt, retryConfig);
        this.logger.warn(`Tentativa ${attempt} falhou, tentando novamente em ${delay}ms: ${lastError.message}`);
        
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    const delay = config.delay * Math.pow(config.backoffMultiplier, attempt - 1);
    return Math.min(delay, config.maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
