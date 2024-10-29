import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VerificationRepository } from '../auth/repositories';
import { UserRepository } from '../users/repsitories';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignUpDto, SignInDto } from '../auth/dto';
import {
  IVerification,
  jwtPayload,
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
const { userExistsByEmail, InvalidDataForLogin, accountNotActive, notFound } =
  services;
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

    const code = await this.generateVerificationToken();

    const verificationData: IVerification = {
      email,
      token: code,
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
    const verificationEmailData: SendVerificationData = {
      to: email,
      subject: 'Verification Email',
      text: `Please verify your account \n Here your code ${code}`,
    };
    await this.notificationsClient
      .send({ cmd: 'send_email' }, verificationEmailData)
      .toPromise();
  }

  async verifyAccount(token?: string) {
    if (!token) {
      throw new BadRequestException(
        changeConstantValue(invalidItem, { item: 'Code' }),
      );
    }
    const existsToken = await this.checkVerificationCodeExistsOrNot(
      token,
      this.verificationRepository,
    );

    if (!existsToken) {
      throw new BadRequestException(
        changeConstantValue(invalidItem, { item: 'Code' }),
      );
    }

    await this.userRepository.updateEntity(
      { email: existsToken.email },
      { activatedAt: new Date() },
    );

    await this.verificationRepository.deleteEntity(existsToken.id);
  }

  async resendVerificationCode(email: string) {
    const existsAccount = await this.userRepository.findOne({
      where: { email },
    });

    if (!existsAccount) {
      throw new NotFoundException(
        changeConstantValue(notFound, {
          item: 'account with this email address',
        }),
      );
    }

    const newCode = await this.generateVerificationToken();

    await this.verificationRepository.updateEntity(
      { email },
      { token: newCode },
    );

    // Send Verification Email

    await this.sendVerificationEmail({ email, code: newCode });
  }

  async checkVerificationCodeExistsOrNot(
    code: string,
    repository: VerificationRepository,
  ): Promise<Verification | null> {
    return await repository.findOne({
      where: { token: code },
    });
  }

  async generateVerificationToken(): Promise<string> {
    let code: string;
    let exists: Verification | null;

    do {
      code = generateVerificationCode();
      exists = await this.checkVerificationCodeExistsOrNot(
        code,
        this.verificationRepository,
      );
    } while (exists);

    return code;
  }
}
