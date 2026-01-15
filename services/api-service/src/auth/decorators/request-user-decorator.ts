import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface RequestUser {
  id: string;
  role: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export const User = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext): RequestUser | any => {
    const request = ctx.switchToHttp().getRequest();
    const user: RequestUser = request.user;
    
    if (!user) {
      return null;
    }
    
    return data ? user?.[data] : user;
  },
);
