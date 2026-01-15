import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AppLogger } from '../../utils/logger';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new AppLogger();

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('Missing or invalid authorization header', {
        url: request.url,
        method: request.method,
        requestId: request.headers['x-request-id'],
      });
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      this.logger.warn('Missing JWT token', {
        url: request.url,
        method: request.method,
        requestId: request.headers['x-request-id'],
      });
      throw new UnauthorizedException('Missing JWT token');
    }

    try {
      const extractedUser = this.jwtService.verify(token, {
        secret: this.configService.get<string>('accessTokenSecret'),
      });

      if (!extractedUser || !extractedUser.userId) {
        this.logger.warn('Invalid JWT payload', {
          url: request.url,
          method: request.method,
          requestId: request.headers['x-request-id'],
        });
        throw new UnauthorizedException('Invalid JWT payload');
      }

      request.user = {
        id: extractedUser.userId,
        role: extractedUser.role,
        email: extractedUser.email,
        iat: extractedUser.iat,
        exp: extractedUser.exp,
      };

      this.logger.log('User authenticated successfully', {
        userId: extractedUser.userId,
        role: extractedUser.role,
        url: request.url,
        method: request.method,
        requestId: request.headers['x-request-id'],
      });

      return true;
    } catch (error) {
      this.logger.error('JWT verification failed', error.stack, {
        url: request.url,
        method: request.method,
        requestId: request.headers['x-request-id'],
        error: error.message,
      });
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
