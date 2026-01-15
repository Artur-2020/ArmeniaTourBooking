import { BadRequestException, Injectable } from '@nestjs/common';
import { jwtPayload, signInReturn } from '../interfaces/auth';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import changeConstantValue from '../../helpers/replaceConstantValue';
import { validations } from '../../constants';
const { invalidItem } = validations;

@Injectable()
export class TokensService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate access token based on secret from env
   * @param payload
   */
  generateAccessToken(payload: jwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('accessTokenSecret'),
      expiresIn: this.configService.get<string>('accessTokenExpiresIn'),
    });
  }

  /**
   * Generate refresh token based on secret from env
   * @param payload
   */

  generateRefreshToken(payload: jwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('refreshTokenSecret'),
      expiresIn: this.configService.get<string>('refreshTokenExpiresIn'),
    });
  }

  /**
   * Generate refresh and access tokens for user including id and role and return
   * @param payload
   */
  generateTokens(payload: jwtPayload): signInReturn {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  /**
   * Verify refresh token and extract payload
   * @param refreshToken
   */
  verifyRefreshToken(refreshToken: string): jwtPayload {
    try {
      return this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('refreshTokenSecret'),
      });
    } catch (error) {
      throw new BadRequestException(
        changeConstantValue(invalidItem, { item: 'refresh token' }),
      );
    }
  }
}
