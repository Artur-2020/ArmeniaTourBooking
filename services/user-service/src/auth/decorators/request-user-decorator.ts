import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUserFromHeaders } from '../interfaces/auth';

export const User = createParamDecorator(
  (data: keyof IUserFromHeaders | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    // Extract user information from headers
    const user = JSON.parse(request.headers['x-user']);
    if (!user.id || !user.email) {
      return null;
    }

    const headersUser: IUserFromHeaders = user;

    if (!headersUser) {
      return null;
    }

    return data ? headersUser[data] : headersUser;
  },
);
