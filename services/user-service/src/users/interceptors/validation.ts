import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Type } from '@nestjs/common';

@Injectable()
export class ModuleValidationInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const data = context.switchToRpc().getData();

    const handler = context.getHandler();
    const metatype = Reflect.getMetadata(
      'design:paramtypes',
      handler,
    )[0] as Type<any>;

    console.log('I am in the interceptor ----->');
    if (!metatype || !this.toValidate(metatype)) {
      return next.handle();
    }

    const object = plainToClass(metatype, data);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }

    return next.handle();
  }

  private toValidate(metatype: Type<any>): boolean {
    const types: Type<any>[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
