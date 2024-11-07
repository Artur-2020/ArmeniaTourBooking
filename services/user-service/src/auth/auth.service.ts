import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { VerificationRepository } from '../auth/repositories';
import { VerificationEntityType } from './constants/auth';
import { UserRepository } from '../users/repsitories';
import { ConfigService } from '@nestjs/config';
import { SignUpDto, SignInDto } from '../auth/dto';
import {
  IVerification,
  SendVerificationData,
  signInReturn,
  signUpReturn,
} from './interfaces/auth';
import { services, validations } from '../constants';
import changeConstantValue from '../helpers/replaceConstantValue';
import { hash, compare } from '../helpers/hashing';
import { ClientProxy } from '@nestjs/microservices';
import getTimeMinuteDifference from '../helpers/compareDatesAndGetDiff';
import { SharedService } from './shared/shared.service';
import { TokensService } from './tokens/tokens.service';
const {
  userExistsByEmail,
  InvalidDataForLogin,
  accountNotActive,
  accountIsActive,
  verificationEmailText,
  codeExpiredAt,
} = services;
const { invalidItem } = validations;
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationRepository: VerificationRepository,
    private readonly configService: ConfigService,
    private readonly sharedService: SharedService,
    private readonly tokensService: TokensService,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationsClient: ClientProxy,
  ) {}

  async signUp(data: SignUpDto): Promise<signUpReturn> {
    const { email, password, role } = data;
    const existsUser = await this.userRepository.findByQuery({ email });

    if (!!existsUser.length) {
      throw new BadRequestException(
        changeConstantValue(userExistsByEmail, { email }),
      );
    }

    const hashedPassword = await hash(password);

    const code = await this.sharedService.generateVerificationToken(
      VerificationEntityType.VERIFY_ACCOUNT,
    );
    const expiredAtMinutes = this.configService.get<string>(
      'accountVerificationExpiredAt',
    );
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + +expiredAtMinutes);

    const verificationData: IVerification = {
      email,
      token: code,
      type: VerificationEntityType.VERIFY_ACCOUNT,
      expiredAt,
    };

    await this.verificationRepository.createEntity(verificationData);

    // Send Verification Email

    await this.sendEmail({ email, code });

    const user = await this.userRepository.createEntity({
      email,
      password: hashedPassword,
      role,
    });

    const { refreshToken, accessToken } = this.tokensService.generateTokens(
      user.id,
      role,
    );
    await this.userRepository.updateEntity({ id: user.id }, { refreshToken });

    delete user.password;
    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async signIn(data: SignInDto): Promise<signInReturn> {
    const { email, password } = data;
    const user = await this.userRepository.findOneByQuery({ email });

    if (!user) throw new BadRequestException(InvalidDataForLogin);

    const { password: up, id: userId, role, refreshToken } = user;

    if (!user.activatedAt) {
      throw new BadRequestException(accountNotActive);
    }
    const match = await compare(password, up);

    if (!match) throw new BadRequestException(InvalidDataForLogin);

    const accessToken = this.tokensService.generateAccessToken({
      userId,
      role,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async sendEmail(data: { email: string; code: string }) {
    const { code, email } = data;
    const minutes = this.configService.get<string>(
      'accountVerificationExpiredAt',
    );

    const text = changeConstantValue(verificationEmailText, { code, minutes });
    const verificationEmailData: SendVerificationData = {
      to: email,
      subject: 'Account Verification',
      text,
    };
    await this.notificationsClient
      .send({ cmd: 'send_email' }, verificationEmailData)
      .toPromise();
  }

  async verifyAccount(token?: string) {
    const type = VerificationEntityType.VERIFY_ACCOUNT;
    if (!token) {
      throw new BadRequestException(
        changeConstantValue(invalidItem, { item: 'Code' }),
      );
    }
    const existsToken =
      await this.sharedService.checkVerificationCodeExistsOrNot(token, type);

    if (!existsToken) {
      throw new BadRequestException(
        changeConstantValue(invalidItem, { item: 'Code' }),
      );
    }

    const existsUser = await this.userRepository.findOneByQuery({
      email: existsToken.email,
    });

    if (existsUser.activatedAt) {
      throw new BadRequestException(accountIsActive);
    }

    const timeDif = getTimeMinuteDifference(existsToken.expiredAt);

    if (timeDif < 0) {
      throw new BadRequestException(
        changeConstantValue(codeExpiredAt, { type }),
      );
    }
    await this.userRepository.updateEntity(
      { email: existsToken.email },
      { activatedAt: new Date() },
    );

    await this.verificationRepository.deleteEntity(existsToken.id);
  }
}
