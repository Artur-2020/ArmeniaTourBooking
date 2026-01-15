import { HttpException, HttpStatus } from '@nestjs/common';
import { AppLogger } from './logger';

export class BusinessLogicError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = HttpStatus.BAD_REQUEST,
    public readonly errors?: any[],
  ) {
    super(message);
    this.name = 'BusinessLogicError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly errors: string[],
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string, public readonly resource: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends Error {
  constructor(message: string, public readonly resource: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export function handleBusinessError(error: any, logger: AppLogger, context?: any): never {
  if (error instanceof BusinessLogicError) {
    logger.logBusinessLogicError('Business logic error', error, context);
    throw new HttpException(
      {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors || [],
      },
      error.statusCode,
    );
  }

  if (error instanceof ValidationError) {
    logger.logValidationError([{ field: error.field, errors: error.errors }], context);
    throw new HttpException(
      {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
        errors: [{ field: error.field, errors: error.errors }],
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  if (error instanceof NotFoundError) {
    logger.logError(error, { ...context, resource: error.resource });
    throw new HttpException(
      {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: error.message,
        errors: [],
      },
      HttpStatus.NOT_FOUND,
    );
  }

  if (error instanceof UnauthorizedError) {
    logger.logError(error, context);
    throw new HttpException(
      {
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: error.message,
        errors: [],
      },
      HttpStatus.UNAUTHORIZED,
    );
  }

  if (error instanceof ConflictError) {
    logger.logError(error, { ...context, resource: error.resource });
    throw new HttpException(
      {
        success: false,
        statusCode: HttpStatus.CONFLICT,
        message: error.message,
        errors: [],
      },
      HttpStatus.CONFLICT,
    );
  }

  // Handle unexpected errors
  logger.logError(error, context);
  throw new HttpException(
    {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      errors: [],
    },
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}