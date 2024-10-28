import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VerificationRepository } from '../auth/repositories';
import { UserRepository } from '../users/repsitories';
import { v4 as uuidv4 } from 'uuid';
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
const { userExistsByEmail, InvalidDataForLogin } = services;
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

    const verificationData: IVerification = {
      email,
      token: uuidv4(),
    };

    await this.verificationRepository.createEntity(verificationData);

    // TODO uncomment this code for test verification email functionality
    // const verificationEmailData: SendVerificationData = {
    //   to: email,
    //   subject: 'Verification Email',
    //   text: 'Please verify your account',
    // };

    // Send Verification Email

    // await this.sendVerificationEmail(verificationEmailData);

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

  async sendVerificationEmail(data: SendVerificationData) {
    await this.notificationsClient
      .send({ cmd: 'send_email' }, data)
      .toPromise();
  }

  async verifyAccount(token?: string) {
    if (!token) {
      throw new BadRequestException(
        changeConstantValue(invalidItem, { item: 'Token' }),
      );
    }
    const existsToken = await this.verificationRepository.findOne({
      where: { token },
    });

    if (!existsToken) {
      throw new BadRequestException(
        changeConstantValue(invalidItem, { item: 'Token' }),
      );
    }

    await this.userRepository.updateEntity(
      { email: existsToken.email },
      { activatedAt: new Date() },
    );

    await this.verificationRepository.deleteEntity(existsToken.id);
  }
}
