import { Injectable } from '@nestjs/common';
import { StructuredLoggerService } from '../logger/structured-logger.service';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
  checks: {
    database?: HealthCheck;
    externalServices?: { [key: string]: HealthCheck };
    memory?: HealthCheck;
    disk?: HealthCheck;
  };
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  message?: string;
  lastChecked: string;
}

@Injectable()
export class HealthCheckService {
  private readonly logger = new StructuredLoggerService('HealthCheck');
  private startTime = Date.now();

  async performHealthCheck(serviceName: string): Promise<HealthCheckResult> {
    const checks = {
      memory: await this.checkMemory(),
      disk: await this.checkDisk(),
    };

    const overallStatus = this.determineOverallStatus(checks);

    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      service: serviceName,
      version: process.env.SERVICE_VERSION || '1.0.0',
      uptime: Date.now() - this.startTime,
      checks,
    };

    this.logger.log('Health check performed', {
      service: serviceName,
      status: overallStatus,
      type: 'health-check',
    });

    return result;
  }

  private async checkMemory(): Promise<HealthCheck> {
    const memUsage = process.memoryUsage();
    const totalMB = memUsage.heapTotal / 1024 / 1024;
    const usedMB = memUsage.heapUsed / 1024 / 1024;
    const usagePercent = (usedMB / totalMB) * 100;

    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    let message = `Memory usage: ${usagePercent.toFixed(2)}%`;

    if (usagePercent > 90) {
      status = 'unhealthy';
      message += ' - Critical memory usage';
    } else if (usagePercent > 75) {
      status = 'degraded';
      message += ' - High memory usage';
    }

    return {
      status,
      message,
      lastChecked: new Date().toISOString(),
    };
  }

  private async checkDisk(): Promise<HealthCheck> {
    // Implementação simplificada - em produção use uma biblioteca como 'node-disk-info'
    try {
      const fs = require('fs');
      const stats = fs.statSync('.');
      
      return {
        status: 'healthy',
        message: 'Disk accessible',
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Disk check failed',
        lastChecked: new Date().toISOString(),
      };
    }
  }

  private determineOverallStatus(checks: any): 'healthy' | 'unhealthy' | 'degraded' {
    const statuses = Object.values(checks).map((check: any) => check.status);
    
    if (statuses.includes('unhealthy')) {
      return 'unhealthy';
    }
    
    if (statuses.includes('degraded')) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  // Método para verificar dependências externas
  async checkExternalService(serviceName: string, url: string): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const axios = require('axios');
      await axios.get(url, { timeout: 5000 });
      
      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        message: `${serviceName} is responding`,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: `${serviceName} is not responding: ${error.message}`,
        lastChecked: new Date().toISOString(),
      };
    }
  }
}
