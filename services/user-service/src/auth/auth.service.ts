import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../users/repsitories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignUpDto, SignInDto } from '../auth/dto';
import {
  jwtPayload,
  SendVerificationData,
  signInReturn,
  signUpReturn,
} from './interfaces/auth';
import { services } from '../constants';
import changeConstantValue from '../helpers/replaceConstantValue';
import { hash, compare } from '../helpers/hashing';
import { ClientProxy } from '@nestjs/microservices';
const { userExistsByEmail, InvalidDataForLogin } = services;

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
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

    // TODO uncomment this code for test verification email functionality
    // const verificationData: SendVerificationData = {
    //   to: email,
    //   subject: 'Verification Email',
    //   text: 'Please verify your account',
    // };
    // await this.notificationsClient
    //   .send({ cmd: 'send_email' }, verificationData)
    //   .toPromise();

    const user = await this.userRepository.createEntity({
      email,
      password: hashedPassword,
      role,
    });

    const { refreshToken, accessToken } = this.generateTokens(user.id, role);
    await this.userRepository.updateEntity(user.id, { refreshToken });

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
}
