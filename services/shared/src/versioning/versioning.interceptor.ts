import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { API_VERSION_KEY } from './api-version.decorator';

export interface ApiResponse<T> {
  data: T;
  version: string;
  timestamp: string;
  status: 'success' | 'error';
}

@Injectable()
export class VersioningInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const version = this.reflector.getAllAndOverride<string>(API_VERSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    return next.handle().pipe(
      map(data => ({
        data,
        version: version || 'v1',
        timestamp: new Date().toISOString(),
        status: 'success',
      }))
    );
  }
}
