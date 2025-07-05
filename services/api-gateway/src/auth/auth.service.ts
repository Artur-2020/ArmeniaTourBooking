import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  SignInDTO,
  SignUpDTO,
  EmailDto,
  TokenDto,
  CreatePasswordDTO,
  VerifyOtpDTO,
} from '../dtos';
import {
  BasicReturnType,
  generateQrReturn,
  signInReturn,
  signUpReturn,
} from '../interfaces';
import { AppLogger } from '../utils/logger';
import { ServiceException } from '../exceptions/service-exception';
import { AxiosResponse } from 'axios';

@Injectable()
export class AuthService {
  private readonly usersServiceUrl: string;
  private readonly logger = new AppLogger();

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.usersServiceUrl = this.configService.get<string>('usersServiceUrl');
    this.logger.setContext('AuthService');
  }

  private async makeServiceCall<T>(
    method: string,
    endpoint: string,
    data?: any,
  ): Promise<T> {
    const startTime = Date.now();
    const url = `${this.usersServiceUrl}${endpoint}`;

    try {
      this.logger.log(`Making ${method} request to ${url}`, {
        method,
        url,
        data: this.sanitizeData(data),
      });

      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService[method.toLowerCase()](url, data),
      );

      const duration = Date.now() - startTime;
      this.logger.logServiceCall('UserService', method, response.status, duration, {
        endpoint,
        responseSize: JSON.stringify(response.data).length,
      });

      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      const statusCode = error?.response?.status || 500;

      this.logger.logServiceCall('UserService', method, statusCode, duration, {
        endpoint,
        error: error?.response?.data?.message || error?.message,
        originalError: error?.response?.data,
      });

      // Throw a proper service exception
      throw ServiceException.fromAxiosError('UserService', error);
    }
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    
    const sanitized = { ...data };
    
    // Remove sensitive fields for logging
    if (sanitized.password) {
      sanitized.password = '[REDACTED]';
    }
    if (sanitized.confirm_password) {
      sanitized.confirm_password = '[REDACTED]';
    }
    if (sanitized.token) {
      sanitized.token = '[REDACTED]';
    }
    
    return sanitized;
  }

  async signUp(data: SignUpDTO): Promise<BasicReturnType<signUpReturn>> {
    try {
      return await this.makeServiceCall<BasicReturnType<signUpReturn>>(
        'POST',
        '/auth/signup',
        data,
      );
    } catch (error) {
      this.logger.error('SignUp failed', error?.stack, {
        email: data.email,
        role: data.role,
      });
      throw error;
    }
  }

  async signIn(data: SignInDTO): Promise<BasicReturnType<signInReturn>> {
    try {
      return await this.makeServiceCall<BasicReturnType<signInReturn>>(
        'POST',
        '/auth/signin',
        data,
      );
    } catch (error) {
      this.logger.error('SignIn failed', error?.stack, {
        email: data.email,
      });
      throw error;
    }
  }

  async verifyAccount(dto: TokenDto): Promise<BasicReturnType<null>> {
    try {
      return await this.makeServiceCall<BasicReturnType<null>>(
        'POST',
        '/auth/verify-account',
        dto,
      );
    } catch (error) {
      this.logger.error('VerifyAccount failed', error?.stack, {
        token: '[REDACTED]',
      });
      throw error;
    }
  }

  async verifyResetPasswordCode(dto: TokenDto): Promise<BasicReturnType<null>> {
    try {
      return await this.makeServiceCall<BasicReturnType<null>>(
        'POST',
        '/auth/verify-reset-password-code',
        dto,
      );
    } catch (error) {
      this.logger.error('VerifyResetPasswordCode failed', error?.stack, {
        token: '[REDACTED]',
      });
      throw error;
    }
  }

  async resendVerificationToken(dto: EmailDto): Promise<BasicReturnType<null>> {
    try {
      return await this.makeServiceCall<BasicReturnType<null>>(
        'POST',
        '/auth/resend-verify-account-code',
        dto,
      );
    } catch (error) {
      this.logger.error('ResendVerificationToken failed', error?.stack, {
        email: dto.email,
      });
      throw error;
    }
  }

  async sendResetPasswordCode(dto: EmailDto): Promise<BasicReturnType<null>> {
    try {
      return await this.makeServiceCall<BasicReturnType<null>>(
        'POST',
        '/auth/send-reset-password-code',
        dto,
      );
    } catch (error) {
      this.logger.error('SendResetPasswordCode failed', error?.stack, {
        email: dto.email,
      });
      throw error;
    }
  }

  async createNewPassword(
    data: CreatePasswordDTO,
  ): Promise<BasicReturnType<null>> {
    try {
      return await this.makeServiceCall<BasicReturnType<null>>(
        'PATCH',
        '/auth/create-new-password',
        data,
      );
    } catch (error) {
      this.logger.error('CreateNewPassword failed', error?.stack, {
        email: data.email,
      });
      throw error;
    }
  }

  async generateQrCode(): Promise<BasicReturnType<generateQrReturn>> {
    try {
      return await this.makeServiceCall<BasicReturnType<generateQrReturn>>(
        'POST',
        '/auth/two-factor/generate-qr-code',
      );
    } catch (error) {
      this.logger.error('GenerateQrCode failed', error?.stack);
      throw error;
    }
  }

  async verifyOTP(
    data: VerifyOtpDTO,
  ): Promise<BasicReturnType<{ verified: boolean }>> {
    try {
      return await this.makeServiceCall<BasicReturnType<{ verified: boolean }>>(
        'POST',
        '/auth/two-factor/verify-otp',
        data,
      );
    } catch (error) {
      this.logger.error('VerifyOTP failed', error?.stack, {
        email: data.email,
      });
      throw error;
    }
  }

  async sendOneTimeSignInCode(dto: EmailDto): Promise<BasicReturnType<null>> {
    try {
      return await this.makeServiceCall<BasicReturnType<null>>(
        'POST',
        '/auth/one-time-signin-code',
        dto,
      );
    } catch (error) {
      this.logger.error('SendOneTimeSignInCode failed', error?.stack, {
        email: dto.email,
      });
      throw error;
    }
  }

  async verifyOneTimeSignInCode(dto: TokenDto): Promise<BasicReturnType<null>> {
    try {
      return await this.makeServiceCall<BasicReturnType<null>>(
        'POST',
        '/auth/one-time-signin-code',
        dto,
      );
    } catch (error) {
      this.logger.error('VerifyOneTimeSignInCode failed', error?.stack, {
        token: '[REDACTED]',
      });
      throw error;
    }
  }
}
