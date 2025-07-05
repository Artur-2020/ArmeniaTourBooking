import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServiceResponse } from '../interfaces/responses.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ServiceResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ServiceResponse<T>> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
} 