import { HttpException, HttpStatus } from '@nestjs/common';

export interface ServiceErrorResponse {
  success: boolean;
  statusCode: number;
  path: string;
  timestamp: string;
  message: string;
  errors: any[];
}

export class ServiceException extends HttpException {
  constructor(
    public readonly serviceName: string,
    public readonly originalError: any,
    public readonly serviceResponse?: ServiceErrorResponse,
  ) {
    const status = serviceResponse?.statusCode || originalError?.response?.status || HttpStatus.BAD_GATEWAY;
    const message = serviceResponse?.message || originalError?.message || 'Service communication error';
    
    super(
      {
        success: false,
        statusCode: status,
        message,
        errors: serviceResponse?.errors || [],
        service: serviceName,
        originalError: originalError?.response?.data || originalError?.message,
      },
      status,
    );
  }

  static fromAxiosError(serviceName: string, error: any): ServiceException {
    const serviceResponse = error?.response?.data;
    return new ServiceException(serviceName, error, serviceResponse);
  }
}
