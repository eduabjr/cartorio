import { Injectable } from '@nestjs/common';
import { StructuredLoggerService } from '../logger/structured-logger.service';

export interface Metric {
  name: string;
  value: number;
  timestamp: string;
  labels?: { [key: string]: string };
}

export interface CounterMetric extends Metric {
  type: 'counter';
}

export interface GaugeMetric extends Metric {
  type: 'gauge';
}

export interface HistogramMetric extends Metric {
  type: 'histogram';
  buckets?: number[];
}

@Injectable()
export class MetricsService {
  private readonly logger = new StructuredLoggerService('Metrics');
  private counters = new Map<string, number>();
  private gauges = new Map<string, number>();
  private histograms = new Map<string, number[]>();

  // Contadores
  incrementCounter(name: string, labels?: { [key: string]: string }, value: number = 1) {
    const key = this.getMetricKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
    
    this.logMetric({
      name,
      value: current + value,
      timestamp: new Date().toISOString(),
      labels,
      type: 'counter',
    });
  }

  // Gauges
  setGauge(name: string, value: number, labels?: { [key: string]: string }) {
    const key = this.getMetricKey(name, labels);
    this.gauges.set(key, value);
    
    this.logMetric({
      name,
      value,
      timestamp: new Date().toISOString(),
      labels,
      type: 'gauge',
    });
  }

  // Histogramas
  observeHistogram(name: string, value: number, labels?: { [key: string]: string }) {
    const key = this.getMetricKey(name, labels);
    const values = this.histograms.get(key) || [];
    values.push(value);
    
    // Manter apenas os últimos 1000 valores para evitar vazamento de memória
    if (values.length > 1000) {
      values.splice(0, values.length - 1000);
    }
    
    this.histograms.set(key, values);
    
    this.logMetric({
      name,
      value,
      timestamp: new Date().toISOString(),
      labels,
      type: 'histogram',
    });
  }

  // Métricas de performance
  recordRequestDuration(endpoint: string, method: string, duration: number, statusCode: number) {
    this.observeHistogram('http_request_duration_ms', duration, {
      endpoint,
      method,
      status_code: statusCode.toString(),
    });
    
    this.incrementCounter('http_requests_total', {
      endpoint,
      method,
      status_code: statusCode.toString(),
    });
  }

  recordDatabaseQuery(query: string, duration: number, success: boolean) {
    this.observeHistogram('database_query_duration_ms', duration, {
      query: query.substring(0, 50), // Truncar query longa
      success: success.toString(),
    });
    
    this.incrementCounter('database_queries_total', {
      success: success.toString(),
    });
  }

  recordBusinessEvent(event: string, value?: number) {
    this.incrementCounter('business_events_total', { event });
    
    if (value !== undefined) {
      this.observeHistogram('business_event_value', value, { event });
    }
  }

  // Métricas de sistema
  recordSystemMetrics() {
    const memUsage = process.memoryUsage();
    
    this.setGauge('memory_heap_used_bytes', memUsage.heapUsed);
    this.setGauge('memory_heap_total_bytes', memUsage.heapTotal);
    this.setGauge('memory_external_bytes', memUsage.external);
    this.setGauge('memory_rss_bytes', memUsage.rss);
    
    // CPU usage (simplificado)
    const cpuUsage = process.cpuUsage();
    this.setGauge('cpu_user_microseconds', cpuUsage.user);
    this.setGauge('cpu_system_microseconds', cpuUsage.system);
  }

  // Obter métricas atuais
  getMetrics() {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: Object.fromEntries(
        Array.from(this.histograms.entries()).map(([key, values]) => [
          key,
          {
            count: values.length,
            sum: values.reduce((a, b) => a + b, 0),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
          },
        ])
      ),
    };
  }

  private getMetricKey(name: string, labels?: { [key: string]: string }): string {
    if (!labels) return name;
    
    const labelString = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}="${value}"`)
      .join(',');
    
    return `${name}{${labelString}}`;
  }

  private logMetric(metric: CounterMetric | GaugeMetric | HistogramMetric) {
    this.logger.log('Metric recorded', {
      ...metric,
      type: 'metric',
    });
  }
}
