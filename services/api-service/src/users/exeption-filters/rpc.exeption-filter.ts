import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(HttpException)
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const status = exception.getStatus();
    const response = {
      statusCode: status,
      message: exception.message,
      error: exception.getResponse(),
    };

    throw new RpcException(response); // This will propagate the error via RabbitMQ
  }
}
