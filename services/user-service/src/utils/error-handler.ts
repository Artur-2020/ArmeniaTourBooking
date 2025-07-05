import { HttpException, HttpStatus } from '@nestjs/common';
import { AppLogger } from './logger';

export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: never[];
  path?: string;
  timestamp: string;
  requestId?: string;
}

export class ErrorHandler {
  private static logger = new AppLogger();

  static handleDatabaseError(error: any, operation: string): HttpException {
    this.logger.error(`Database error in ${operation}`, error?.stack, {
      operation,
      error: error?.message,
      code: error?.code,
    });

    return new HttpException(
      {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database operation failed',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  static handleValidationError(errors: any[]): HttpException {
    this.logger.logValidationError(errors);

    return new HttpException(
      {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        errors,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  static handleBusinessLogicError(
    operation: string,
    error: any,
  ): HttpException {
    this.logger.logBusinessLogicError(operation, error);

    return new HttpException(
      {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Business logic error',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  static handleAuthenticationError(
    message: string = 'Authentication failed',
  ): HttpException {
    this.logger.error('Authentication error', undefined, {
      message,
    });

    return new HttpException(
      {
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.UNAUTHORIZED,
    );
  }

  static handleAuthorizationError(
    message: string = 'Access denied',
  ): HttpException {
    this.logger.error('Authorization error', undefined, {
      message,
    });

    return new HttpException(
      {
        success: false,
        statusCode: HttpStatus.FORBIDDEN,
        message,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.FORBIDDEN,
    );
  }

  static handleNotFoundError(resource: string): HttpException {
    this.logger.error('Resource not found', undefined, {
      resource,
    });

    return new HttpException(
      {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: `${resource} not found`,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.NOT_FOUND,
    );
  }

  static handleRpcError(
    error: any,
    service: string,
    method: string,
  ): HttpException {
    this.logger.error(`RPC error from ${service}.${method}`, error?.stack, {
      service,
      method,
      error: error?.message,
    });

    return new HttpException(
      {
        success: false,
        statusCode: HttpStatus.BAD_GATEWAY,
        message: `Service communication error with ${service}`,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_GATEWAY,
    );
  }

  static formatErrorResponse(error: any, request?: any): ErrorResponse {
    const timestamp = new Date().toISOString();
    const requestId = request?.headers?.['x-request-id'];

    return {
      success: false,
      statusCode: error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      message: error?.message || 'Internal server error',
      errors: error?.errors || [],
      path: request?.url,
      timestamp,
      requestId,
    };
  }
}
