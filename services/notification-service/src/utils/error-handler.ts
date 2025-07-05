import { HttpException, HttpStatus } from '@nestjs/common';
import { AppLogger } from './logger';

export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: any[];
  path?: string;
  timestamp: string;
  requestId?: string;
}

export class ErrorHandler {
  private static logger = new AppLogger();

  static handleEmailError(error: any, to: string, subject: string): HttpException {
    this.logger.logEmailError(to, subject, error?.message || 'Unknown email error', {
      to,
      subject,
      error: error?.message,
    });

    return new HttpException(
      {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Email sending failed',
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

  static handleBusinessLogicError(operation: string, error: any): HttpException {
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

  static handleRpcError(error: any, service: string, method: string): HttpException {
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

  static handleConfigurationError(error: any): HttpException {
    this.logger.error('Configuration error', error?.stack, {
      error: error?.message,
    });

    return new HttpException(
      {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Service configuration error',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  static formatErrorResponse(
    error: any,
    request?: any,
  ): ErrorResponse {
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