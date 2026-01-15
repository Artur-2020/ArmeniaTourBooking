import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AppLogger } from '../utils/logger';

@Catch(HttpException)
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new AppLogger();

  catch(exception: HttpException, host: ArgumentsHost) {
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
      message = responseObj.message || responseObj.error || 'Bad Request';
      errors = responseObj.errors || [];
    } else {
      message = 'Bad Request';
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

    // Log HTTP exceptions
    this.logger.error(`HTTP Exception: ${status} - ${message}`, undefined, {
      url: request.url,
      method: request.method,
      statusCode: status,
      body: request.body,
      requestId: request.headers['x-request-id'],
    });

    response.status(status).json(errorResponse);
  }
}
