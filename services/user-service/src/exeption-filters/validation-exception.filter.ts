import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AppLogger } from '../utils/logger';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new AppLogger();

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;
    let errors: any[] = [];

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as any;
      message = responseObj.message || 'Validation failed';
      errors = responseObj.errors || [];
    } else {
      message = 'Validation failed';
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

    // Log validation errors
    this.logger.error(`Validation Error: ${status} - ${message}`, undefined, {
      url: request.url,
      method: request.method,
      statusCode: status,
      validationErrors: errors,
      requestId: request.headers['x-request-id'],
    });

    response.status(status).json(errorResponse);
  }
}
