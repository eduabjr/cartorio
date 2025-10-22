import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

export interface LogContext {
  service?: string;
  userId?: string;
  requestId?: string;
  operation?: string;
  duration?: number;
  [key: string]: any;
}

@Injectable()
export class StructuredLoggerService implements LoggerService {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  log(message: string, context?: LogContext) {
    this.writeLog('log', message, context);
  }

  error(message: string, trace?: string, context?: LogContext) {
    this.writeLog('error', message, { ...context, trace });
  }

  warn(message: string, context?: LogContext) {
    this.writeLog('warn', message, context);
  }

  debug(message: string, context?: LogContext) {
    this.writeLog('debug', message, context);
  }

  verbose(message: string, context?: LogContext) {
    this.writeLog('verbose', message, context);
  }

  private writeLog(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      context: this.context,
      ...context,
    };

    // Em produção, você pode enviar para um sistema de logging centralizado
    // como ELK Stack, Splunk, ou CloudWatch
    console.log(JSON.stringify(logEntry));
  }

  // Métodos para métricas de performance
  logPerformance(operation: string, duration: number, context?: LogContext) {
    this.log(`Performance: ${operation}`, {
      ...context,
      operation,
      duration,
      type: 'performance',
    });
  }

  logBusinessEvent(event: string, data: any, context?: LogContext) {
    this.log(`Business Event: ${event}`, {
      ...context,
      event,
      data,
      type: 'business',
    });
  }

  logSecurityEvent(event: string, details: any, context?: LogContext) {
    this.warn(`Security Event: ${event}`, {
      ...context,
      event,
      details,
      type: 'security',
    });
  }
}
