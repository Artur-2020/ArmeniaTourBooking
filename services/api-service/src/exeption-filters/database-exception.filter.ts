import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';
import { AppLogger } from '../utils/logger';

@Catch(QueryFailedError, EntityNotFoundError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new AppLogger();

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status: number;
    let message: string;
    let errors: any[] = [];

    if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database query failed';
      errors = [{
        field: 'database',
        errors: [exception.message]
      }];
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Resource not found';
      errors = [{
        field: 'entity',
        errors: [exception.message]
      }];
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Database error occurred';
      errors = [{
        field: 'database',
        errors: [exception?.message || 'Unknown database error']
      }];
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
      errors,
      requestId: request.headers['x-request-id'],
    };

    // Log database errors
    this.logger.error(`Database Error: ${status} - ${message}`, exception.stack, {
      url: request.url,
      method: request.method,
      statusCode: status,
      databaseError: exception.message,
      requestId: request.headers['x-request-id'],
    });

    response.status(status).json(errorResponse);
  }
}
