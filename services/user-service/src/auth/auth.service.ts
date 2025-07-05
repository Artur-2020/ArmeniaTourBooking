import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UserSettingsRepository,
  VerificationRepository,
} from '../auth/repositories';
import { UserSettings } from './entities';
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
import { AppLogger } from '../utils/logger';
import { ErrorHandler } from '../utils/error-handler';

const {
  userExistsByEmail,
  InvalidDataForLogin,
  accountNotActive,
  accountIsActive,
  verificationEmailText,
  codeExpiredAt,
  oneTimeSignInEmailText,
} = services;

const { invalidItem } = validations;

@Injectable()
export class AuthService {
  private readonly logger = new AppLogger();

  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationRepository: VerificationRepository,
    private readonly userSettingsRepository: UserSettingsRepository,
    private readonly configService: ConfigService,
    private readonly sharedService: SharedService,
    private readonly tokensService: TokensService,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationsClient: ClientProxy,
  ) {
    this.logger.setContext('AuthService');
  }

  /**
   * Service for sign up, validate data, create tokens and send verification email
   * @param data
   */
  async signUp(data: SignUpDto): Promise<signUpReturn> {
    const startTime = Date.now();
    const { email, password, role } = data;

    try {
      this.logger.log('Starting user registration process', {
        email,
        role,
      });

      const existsUser = await this.userRepository.findByQuery({ email });

      if (!!existsUser.length) {
        this.logger.error('User registration failed - email already exists', undefined, {
          email,
        });
        throw new BadRequestException(
          changeConstantValue(userExistsByEmail, { email }),
        );
      }

      const { expiredInValue, value } = VerificationEntityType.verification;

      const hashedPassword = await hash(password);

      const code = await this.sharedService.generateVerificationToken(value);
      const expiredAtMinutes = this.configService.get<string>(expiredInValue);
      const expiredAt = new Date();
      expiredAt.setMinutes(expiredAt.getMinutes() + +expiredAtMinutes);

      const verificationData: IVerification = {
        email,
        token: code,
        type: value,
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

      await this.userSettingsRepository.createEntity({
        enabledTwoFactor: false,
        user: user,
      });
      await this.userRepository.updateEntity({ id: user.id }, { refreshToken });

      delete user.password;

      const duration = Date.now() - startTime;
      this.logger.log('User registration completed successfully', {
        email,
        userId: user.id,
        duration,
      });

      return {
        accessToken,
        refreshToken,
        user,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('User registration failed', error?.stack, {
        email,
        role,
        duration,
      });
      throw error;
    }
  }

  /**
   * Check email and password and send tokens for sign in
   * @param data
   */
  async signIn(data: SignInDto): Promise<signInReturn> {
    const startTime = Date.now();
    const { email, password } = data;

    try {
      this.logger.log('Starting user sign in process', {
        email,
      });

      const user = await this.userRepository.findOneByQuery({ email });

      if (!user) {
        this.logger.error('Sign in failed - user not found', undefined, {
          email,
        });
        throw new BadRequestException(InvalidDataForLogin);
      }

      const { password: up, id: userId, role, refreshToken } = user;

      if (!user.activatedAt) {
        this.logger.error('Sign in failed - account not activated', undefined, {
          email,
          userId,
        });
        throw new BadRequestException(accountNotActive);
      }

      const match = await compare(password, up);

      if (!match) {
        this.logger.error('Sign in failed - invalid password', undefined, {
          email,
          userId,
        });
        throw new BadRequestException(InvalidDataForLogin);
      }

      const accessToken = this.tokensService.generateAccessToken({
        userId,
        role,
      });

      const duration = Date.now() - startTime;
      this.logger.log('User sign in completed successfully', {
        email,
        userId,
        duration,
      });

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('User sign in failed', error?.stack, {
        email,
        duration,
      });
      throw error;
    }
  }

  /**
   * Send email for profile activation
   * @param data
   */
  async sendEmail(data: { email: string; code: string }) {
    const startTime = Date.now();
    const { expiredInValue } = VerificationEntityType.verification;
    const { code, email } = data;

    try {
      this.logger.log('Sending verification email', {
        email,
      });

      const minutes = this.configService.get<string>(expiredInValue);
      const text = changeConstantValue(verificationEmailText, { code, minutes });
      const verificationEmailData: SendVerificationData = {
        to: email,
        subject: 'Account Verification',
        text,
      };

      this.notificationsClient.emit('send_email', verificationEmailData);

      const duration = Date.now() - startTime;
      this.logger.logRpcCall('NotificationService', 'send_email', 200, duration, {
        email,
        subject: 'Account Verification',
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.logRpcCall('NotificationService', 'send_email', 500, duration, {
        email,
        error: error?.message,
      });
      throw ErrorHandler.handleRpcError(error, 'NotificationService', 'send_email');
    }
  }

  /**
   * Verify account by code from the email make validations and checkings
   * @param token
   */
  async verifyAccount(token?: string) {
    const startTime = Date.now();

    try {
      this.logger.log('Starting account verification', {
        token: token ? '[REDACTED]' : undefined,
      });

      const type = VerificationEntityType.verification.value;
      if (!token) {
        this.logger.error('Account verification failed - no token provided', undefined);
        throw new BadRequestException(
          changeConstantValue(invalidItem, { item: 'Code' }),
        );
      }

      const existsToken =
        await this.sharedService.checkVerificationCodeExistsOrNot(token, type);

      if (!existsToken) {
        this.logger.error('Account verification failed - invalid token', undefined, {
          token: '[REDACTED]',
        });
        throw new BadRequestException(
          changeConstantValue(invalidItem, { item: 'Code' }),
        );
      }

      const existsUser = await this.userRepository.findOneByQuery({
        email: existsToken.email,
      });

      if (existsUser.activatedAt) {
        this.logger.error('Account verification failed - account already activated', undefined, {
          email: existsToken.email,
        });
        throw new BadRequestException(accountIsActive);
      }

      const timeDif = getTimeMinuteDifference(existsToken.expiredAt);

      if (timeDif < 0) {
        this.logger.error('Account verification failed - code expired', undefined, {
          email: existsToken.email,
          expiredAt: existsToken.expiredAt,
        });
        throw new BadRequestException(
          changeConstantValue(codeExpiredAt, { type }),
        );
      }

      await this.userRepository.updateEntity(
        { email: existsToken.email },
        { activatedAt: new Date() },
      );

      await this.verificationRepository.deleteEntity(existsToken.id);

      const duration = Date.now() - startTime;
      this.logger.log('Account verification completed successfully', {
        email: existsToken.email,
        duration,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Account verification failed', error?.stack, {
        token: token ? '[REDACTED]' : undefined,
        duration,
      });
      throw error;
    }
  }

  /**
   * Verify one time sign in code from the email
   * @param token
   */
  async verifyOneTimeSignInCode(token?: string) {
    const startTime = Date.now();

    try {
      this.logger.log('Starting one-time sign in verification', {
        token: token ? '[REDACTED]' : undefined,
      });

      const type = VerificationEntityType.onetimesignin.value;
      if (!token) {
        this.logger.error('One-time sign in verification failed - no token provided', undefined);
        throw new BadRequestException(
          changeConstantValue(invalidItem, { item: 'Code' }),
        );
      }

      const existsToken =
        await this.sharedService.checkVerificationCodeExistsOrNot(token, type);

      if (!existsToken) {
        this.logger.error('One-time sign in verification failed - invalid token', undefined, {
          token: '[REDACTED]',
        });
        throw new BadRequestException(
          changeConstantValue(invalidItem, { item: 'Code' }),
        );
      }

      const timeDif = getTimeMinuteDifference(existsToken.expiredAt);

      if (timeDif < 0) {
        this.logger.error('One-time sign in verification failed - code expired', undefined, {
          email: existsToken.email,
          expiredAt: existsToken.expiredAt,
        });
        throw new BadRequestException(
          changeConstantValue(codeExpiredAt, { type }),
        );
      }

      await this.verificationRepository.deleteEntity(existsToken.id);

      const duration = Date.now() - startTime;
      this.logger.log('One-time sign in verification completed successfully', {
        email: existsToken.email,
        duration,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('One-time sign in verification failed', error?.stack, {
        token: token ? '[REDACTED]' : undefined,
        duration,
      });
      throw error;
    }
  }

  /**
   * Check if two factor is enabled for user
   * @param userId
   */
  async checkEnabledTwoFactor(userId: string) {
    const userSettings = await this.userSettingsRepository.findOneByQuery({
      userId,
    });
    return userSettings?.enabledTwoFactor || false;
  }

  /**
   * Function for send the one time sign in email
   * @param data
   */
  async sendOneTimeSignInEmail(data: { email: string; code: string }) {
    const startTime = Date.now();
    const { expiredInValue } = VerificationEntityType.onetimesignin;
    const { code, email } = data;

    try {
      this.logger.log('Sending one-time sign in email', {
        email,
      });

      const minutes = this.configService.get<string>(expiredInValue);
      const text = changeConstantValue(oneTimeSignInEmailText, { code, minutes });
      const oneTimeSigninData: SendVerificationData = {
        to: email,
        subject: 'One Time Sign In',
        text,
      };

      this.notificationsClient.emit('send_email', oneTimeSigninData);

      const duration = Date.now() - startTime;
      this.logger.logRpcCall('NotificationService', 'send_email', 200, duration, {
        email,
        subject: 'One Time Sign In',
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.logRpcCall('NotificationService', 'send_email', 500, duration, {
        email,
        error: error?.message,
      });
      throw ErrorHandler.handleRpcError(error, 'NotificationService', 'send_email');
    }
  }
}
