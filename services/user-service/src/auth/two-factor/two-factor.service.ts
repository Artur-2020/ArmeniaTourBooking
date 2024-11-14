import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class TwoFactorService {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}
  generateSecret() {
    const appName = this.configService.get<string>('twoFactorAppName');
    return speakeasy.generateSecret({ name: appName });
  }

  async generateQRCode(secret: string) {
    return await qrcode.toDataURL(secret);
  }

  verifyToken(token: string, secret: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    });
  }

  async checkEnabledTwoFactor() {
    const userId = '36c8be2e-4603-4a96-937d-f9ed1351a44f';
    const exists = await this.authService.checkEnabledTwoFactor(userId);
    console.log('exists', exists);
  }
}
