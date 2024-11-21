import { BadRequestException, Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { services } from '../../constants';
import { TwoFactorRepository } from '../repositories';

const { twoFactorIsNotActive } = services;
@Injectable()
export class TwoFactorService {
  constructor(
    private readonly twoFactorRepository: TwoFactorRepository,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}
  generateSecret() {
    const appName = this.configService.get<string>('twoFactorAppName');
    return speakeasy.generateSecret({ name: appName });
  }

  async generateQRCode(secret: string) {
    const dataURL = await qrcode.toDataURL(secret);
    return dataURL as string;
  }

  verifyToken(token: string, secret: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    });
  }

  async checkEnabledTwoFactor(userId: string) {
    return await this.authService.checkEnabledTwoFactor(userId);
  }

  async getQrCode(userId: string): Promise<string> {
    //todo do this with req.user

    const isTwoFactorEnabled = await this.checkEnabledTwoFactor(userId);

    if (!isTwoFactorEnabled)
      throw new BadRequestException(twoFactorIsNotActive);

    const secret = this.generateSecret();

    console.log('secret', secret);

    const { otpauth_url, base32 } = secret;

    await this.updateUserTwoFactor({
      email: isTwoFactorEnabled.user.email,
      secret: base32,
    });
    return await this.generateQRCode(otpauth_url);
  }

  async updateUserTwoFactor({
    email,
    secret,
  }: {
    email: string;
    secret: string;
  }) {
    const existsTwoFactor = await this.twoFactorRepository.findOneByQuery({
      email,
    });

    if (existsTwoFactor) {
      await this.twoFactorRepository.updateEntity(
        { id: existsTwoFactor.id },
        { st: secret },
      );
    } else {
      await this.twoFactorRepository.createEntity({
        st: secret,
        email,
      });
    }
  }

  async verifyOtp({
    code,
    email,
  }: {
    code: string;
    email: string;
  }): Promise<boolean> {
    const userTwoFactor = await this.twoFactorRepository.findOneByQuery({
      email,
    });

    if (!userTwoFactor) return false;

    const { st } = userTwoFactor;

    return this.verifyToken(code, st);
  }
}
