import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { services, validations } from '../../constants';
import { TwoFactorRepository, VerificationRepository } from '../repositories';
import { VerificationEntityType } from '../constants/auth';
import changeConstantValue from '../../helpers/replaceConstantValue';
import { BasicReturnType, SendVerificationData } from '../interfaces/auth';
import getTimeMinuteDifference from '../../helpers/compareDatesAndGetDiff';
import { ClientProxy } from '@nestjs/microservices';
import { SharedService } from '../shared/shared.service';

const { twoFactorIsNotActive, oneTimeSignInEmailText, codeExpiredAt } =
  services;
const { invalidItem } = validations;
@Injectable()
export class TwoFactorService {
  constructor(
    private readonly twoFactorRepository: TwoFactorRepository,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationsClient: ClientProxy,
    private readonly sharedService: SharedService,
    private readonly verificationRepository: VerificationRepository,
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

  async sendEmail(data: { email: string; code: string }) {
    const { expiredInValue } = VerificationEntityType.onetimesignin;
    const { code, email } = data;
    const minutes = this.configService.get<string>(expiredInValue);

    const text = changeConstantValue(oneTimeSignInEmailText, { code, minutes });
    const resetPasswordEmailData: SendVerificationData = {
      to: email,
      subject: 'One Time Sign In',
      text,
    };
    await this.notificationsClient
      .send({ cmd: 'send_email' }, resetPasswordEmailData)
      .toPromise();
  }

  async verifyOneTimeSignInCode(
    token?: string,
  ): Promise<BasicReturnType<null>> {
    const { value } = VerificationEntityType.onetimesignin;

    if (!token) {
      throw new BadRequestException(
        changeConstantValue(invalidItem, { item: 'Code' }),
      );
    }
    const existsToken =
      await this.sharedService.checkVerificationCodeExistsOrNot(token, value);

    if (!existsToken) {
      throw new BadRequestException(
        changeConstantValue(invalidItem, { item: 'Code' }),
      );
    }

    const timeDif = getTimeMinuteDifference(existsToken.expiredAt);

    if (timeDif < 0) {
      throw new BadRequestException(
        changeConstantValue(codeExpiredAt, { type: 'sign in' }),
      );
    }

    await this.verificationRepository.deleteEntity(existsToken.id);

    return { success: true };
  }
}
