import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IUser } from '../interfaces';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly usersServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.usersServiceUrl = this.configService.get<string>('usersServiceUrl');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header provided');
    }

    try {
      // Make HTTP request to user-service to verify the token
      const response = await firstValueFrom(
        this.httpService.get(`${this.usersServiceUrl}/auth/verify-jwt`, {
          headers: {
            Authorization: authHeader,
          },
        }),
      );

      if (response.data.success && response.data.data) {
        // Attach user data to request for use in controllers
        request.user = response.data.data;
        return true;
      } else {
        throw new UnauthorizedException('Invalid token');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException('Token verification failed');
    }
  }
} 