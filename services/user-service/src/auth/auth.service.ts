import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VerificationRepository } from '../auth/repositories';
import {
  VerificationEntityType,
  VERIFICATION_ATTEMPTS_COUNTS,
} from './constants/auth';
import { UserRepository } from '../users/repsitories';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignUpDto, SignInDto } from '../auth/dto';
import {
  BasicReturnType,
  IVerification,
  jwtPayload,
  ResendCodeDTO,
  SendVerificationData,
  signInReturn,
  signUpReturn,
} from './interfaces/auth';
import { services, validations } from '../constants';
import changeConstantValue from '../helpers/replaceConstantValue';
import { hash, compare } from '../helpers/hashing';
import { ClientProxy } from '@nestjs/microservices';
import { Verification } from './entities';
import { generateVerificationCode } from '../helpers/generateVerificationCode';
import getTimeMinuteDifference from '../helpers/compareDatesAndGetDiff';
const {
  userExistsByEmail,
  InvalidDataForLogin,
  accountNotActive,
  notFound,
  accountIsActive,
  maximumAttemptsCountReached,
  resendBlocked,
  verificationEmailText,
  codeExpiredAt,
} = services;
const { invalidItem } = validations;
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationRepository: VerificationRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

    const code = await this.generateVerificationToken(
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

    await this.sendVerificationEmail({ email, code });

    const user = await this.userRepository.createEntity({
      email,
      password: hashedPassword,
      role,
    });

    const { refreshToken, accessToken } = this.generateTokens(user.id, role);
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

    const accessToken = this.generateAccessToken({
      userId,
      role,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  generateAccessToken(payload: jwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('accessTokenSecret'),
      expiresIn: this.configService.get<string>('accessTokenExpiresIn'),
    });
  }

  generateRefreshToken(payload: jwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('refreshTokenSecret'),
      expiresIn: this.configService.get<string>('refreshTokenExpiresIn'),
    });
  }

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

  async sendVerificationEmail(data: { email: string; code: string }) {
    const { code, email } = data;
    const minutes = this.configService.get<string>(
      'accountVerificationExpiredAt',
    );

    const text = changeConstantValue(verificationEmailText, { code, minutes });
    const verificationEmailData: SendVerificationData = {
      to: email,
      subject: 'Verification Email',
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
    const existsToken = await this.checkVerificationCodeExistsOrNot(
      token,
      type,
    );

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

  async verifyResetPasswordCode(
    token?: string,
  ): Promise<BasicReturnType<null>> {
    if (!token) {
      throw new BadRequestException(
        changeConstantValue(invalidItem, { item: 'Code' }),
      );
    }
    const existsToken = await this.checkVerificationCodeExistsOrNot(
      token,
      VerificationEntityType.RESETPASSWORD,
    );

    if (!existsToken) {
      throw new BadRequestException(
        changeConstantValue(invalidItem, { item: 'Code' }),
      );
    }

    await this.verificationRepository.deleteEntity(existsToken.id);

    return { success: true };
  }

  async resendCode(data: ResendCodeDTO) {
    const { email, type } = data;
    const existsAccount = await this.userRepository.findOne({
      where: { email },
    });

    if (!existsAccount) {
      throw new NotFoundException(
        changeConstantValue(notFound, {
          item: 'account with this email address',
        }),
      );
    } else if (existsAccount.activatedAt) {
      throw new BadRequestException(accountIsActive);
    }

    const expiredAtType =
      type === VerificationEntityType['VERIFY_ACCOUNT']
        ? 'accountVerificationExpiredAt'
        : 'resetPasswordExpiredAt';
    const expiredAtMinutes = this.configService.get<string>(expiredAtType);
    const expiredAtDate = new Date();

    console.log('expiredAt minutes ----------->', expiredAtType);
    expiredAtDate.setMinutes(expiredAtDate.getMinutes() + +expiredAtMinutes);

    const newCode = await this.generateVerificationToken(type);

    const existsVerificationToken =
      await this.verificationRepository.findOneByQuery({
        type,
        email,
      });

    if (!existsVerificationToken) {
      await this.verificationRepository.createEntity({
        email,
        token: newCode,
        attemptsCount: 1,
        expiredAt: expiredAtDate,
        type,
      });
    } else {
      await this.checkVerificationCodeAttemptsValidity(existsVerificationToken);

      await this.verificationRepository.update(
        { id: existsVerificationToken.id },
        {
          token: newCode,
          blockedAt: null,
          attemptsCount: () => 'attemptsCount + 1',
        },
      );
    }

    // Send Verification Email

    await this.sendVerificationEmail({ email, code: newCode });
  }

  async checkVerificationCodeExistsOrNot(
    code: string,
    type: string,
  ): Promise<Verification | null> {
    return await this.verificationRepository.findOne({
      where: { token: code, type },
    });
  }

  async generateVerificationToken(type: string): Promise<string> {
    let code: string;
    let exists: Verification | null;

    do {
      code = generateVerificationCode();
      exists = await this.checkVerificationCodeExistsOrNot(code, type);
    } while (exists);

    return code;
  }

  async checkVerificationCodeAttemptsValidity(
    existsVerificationToken: Verification,
  ) {
    const { type: verificationType, id, blockedAt } = existsVerificationToken;

    let { attemptsCount } = existsVerificationToken;

    const allowedAttemptsCount = VERIFICATION_ATTEMPTS_COUNTS[verificationType];

    let type = VerificationEntityType['VERIFY_ACCOUNT'];
    let minutes = this.configService.get<string>(
      'accountVerificationBlockMinutes',
    );

    if (verificationType === VerificationEntityType['RESETPASSWORD']) {
      minutes = this.configService.get<string>('resetPasswordBlockMinutes');

      type = VerificationEntityType['RESETPASSWORD'];
    }

    if (blockedAt) {
      const timeDif = getTimeMinuteDifference(blockedAt);
      if (timeDif > 0) {
        throw new BadRequestException(
          changeConstantValue(resendBlocked, {
            type,
            minutes: timeDif,
          }),
        );
      }
      attemptsCount = 1;
    }

    if (attemptsCount >= allowedAttemptsCount) {
      const plusBlockedAt = new Date();
      plusBlockedAt.setMinutes(plusBlockedAt.getMinutes() + +minutes);

      await this.verificationRepository.updateEntity(
        { id },
        { blockedAt: plusBlockedAt, attemptsCount: 0 },
      );
      throw new BadRequestException(
        changeConstantValue(maximumAttemptsCountReached, {
          type,
          minutes,
        }),
      );
    }
  }
}
