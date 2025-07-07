import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from '../../interfaces';
import axios from 'axios';

const USER_SERVICE_URL = process.env.USERS_SERVICE_URL;

export const User = createParamDecorator(
  async (data: keyof IUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return null;
    }
    // Direct HTTP request to user-service
    let fullUser = user;
    if (user.id) {
      try {
        const res = await axios.get(`${USER_SERVICE_URL}/users/${user.id}`);
        if (res.data) {
          fullUser = res.data;
          request.user = fullUser;
        }
      } catch (e) {
        throw e;
      }
    }
    return data ? fullUser?.[data] : fullUser;
  },
);
