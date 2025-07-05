import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { AppLogger } from '../utils/logger';

@Catch(RpcException)
export class CustomRpcExceptionFilter implements RpcExceptionFilter<RpcException> {
  private readonly logger = new AppLogger();

  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const error = exception.getError();
    const pattern = host.switchToRpc().getData();

    this.logger.error('RPC Exception caught', exception?.stack, {
      pattern,
      error: typeof error === 'string' ? error : JSON.stringify(error),
    });

    return throwError(() => exception.getError());
  }
} 