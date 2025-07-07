import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const extractedUser = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      request.user = {
        id: extractedUser.userId,
        email: extractedUser.email,
        role: extractedUser.role,
        activatedAt: extractedUser.activatedAt,
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid  token');
    }
  }
}
