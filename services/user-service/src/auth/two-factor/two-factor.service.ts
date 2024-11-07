import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwoFactorService {
  constructor(private readonly configService: ConfigService) {}
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
}
