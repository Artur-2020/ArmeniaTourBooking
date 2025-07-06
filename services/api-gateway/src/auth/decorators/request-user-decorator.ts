import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from '../../interfaces';

export const User = createParamDecorator(
  (data: keyof IUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    return user;
  },
);
