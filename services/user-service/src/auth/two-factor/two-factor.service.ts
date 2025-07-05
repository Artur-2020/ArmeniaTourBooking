import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { services } from '../../constants';
import { TwoFactorRepository } from '../repositories';
import { UserRepository } from '../../users/repsitories';

const { twoFactorIsNotActive } = services;
@Injectable()
export class TwoFactorService {
  constructor(
    private readonly twoFactorRepository: TwoFactorRepository,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Generate secret for using in the qr code
   */
  generateSecret() {
    const appName = this.configService.get<string>('twoFactorAppName');
    return speakeasy.generateSecret({ name: appName });
  }

  /**
   * Generate qr code for the two factor auth app
   * @param secret
   */
  async generateQRCode(secret: string) {
    const dataURL = await qrcode.toDataURL(secret);
    return dataURL as string;
  }

  /**
   * Verify code from the auth app
   * @param token
   * @param secret
   */
  verifyToken(token: string, secret: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    });
  }

  /**
   * Check has the user enabled two factor or not
   * @param userId
   */
  async checkEnabledTwoFactor(userId: string) {
    return await this.authService.checkEnabledTwoFactor(userId);
  }

  /**
   * Get the qr code for the specific user
   * @param userId
   */
  async getQrCode(userId: string): Promise<string> {
    //todo do this with req.user

    const isTwoFactorEnabled = await this.checkEnabledTwoFactor(userId);

    if (!isTwoFactorEnabled)
      throw new BadRequestException(twoFactorIsNotActive);

    const secret = this.generateSecret();

    const { otpauth_url, base32 } = secret;

    // Get user email from user repository
    const user = await this.userRepository.findOneByQuery({ id: userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.updateUserTwoFactor({
      email: user.email,
      secret: base32,
    });
    return await this.generateQRCode(otpauth_url);
  }

  /**
   * Update user two factor secret
   * @param email
   * @param secret
   */
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

  /**
   * Verify user two factor otp
   * @param code
   * @param email
   */
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
