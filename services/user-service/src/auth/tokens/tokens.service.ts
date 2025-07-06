import { Injectable } from '@nestjs/common';
import { jwtPayload } from '../interfaces/auth';
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
   * Generate access token based on secret from env
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
   * @param userId
   * @param role
   */
  generateTokens(
    userId: string,
    role: string,
  ): { accessToken: string; refreshToken: string } {
    const accessToken = this.generateAccessToken({
      userId,
      role,
    });
    const refreshToken = this.generateRefreshToken({
      userId,
      role,
    });

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
      throw new Error(
        changeConstantValue(invalidItem, { item: 'refresh token' }),
      );
    }
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken
   * @param userId
   * @param role
   */
  refreshAccessToken(
    refreshToken: string,
    userId: string,
    role: string,
  ): { accessToken: string; refreshToken: string } {
    // Verify the refresh token
    this.verifyRefreshToken(refreshToken);

    // Generate new tokens
    const newAccessToken = this.generateAccessToken({
      userId,
      role,
    });
    const newRefreshToken = this.generateRefreshToken({
      userId,
      role,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
