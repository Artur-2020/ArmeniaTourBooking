import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AppLogger } from '../utils/logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new AppLogger();

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status: number;
    let message: string | object;
    let errors: any[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || 'Bad Request';
        errors = responseObj.errors || [];
      } else {
        message = 'Bad Request';
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';

      // Log unexpected errors
      this.logger.error(
        'Unexpected error occurred',
        exception instanceof Error ? exception.stack : String(exception),
        {
          url: request.url,
          method: request.method,
          body: request.body,
          requestId: request.headers['x-request-id'],
        },
      );
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

    // Log the error response
    this.logger.error(`Error response: ${status} - ${message}`, undefined, {
      url: request.url,
      method: request.method,
      statusCode: status,
      requestId: request.headers['x-request-id'],
    });

    response.status(status).json(errorResponse);
  }
}
