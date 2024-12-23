import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Patch,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CreatePasswordDTO,
  EmailDto,
  SignInDTO,
  SignUpDTO,
  TokenDto,
  VerifyOtpDTO,
} from '../dtos';
import {
  BasicReturnType,
  generateQrReturn,
  signInReturn,
  signUpReturn,
} from '../interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('USER_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign Up' }) // Описание эндпоинта
  @ApiResponse({ status: 200, description: 'Success or Error' })
  async signUp(
    @Body() data: SignUpDTO,
  ): Promise<BasicReturnType<signUpReturn>> {
    try {
      return await this.usersClient.send({ cmd: 'sign_up' }, data).toPromise();
    } catch (error) {
      throw new HttpException(
        {
          error: true,
          status: HttpStatus.BAD_REQUEST,
          message: error.message,
          details: error.details || [],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Post('signin')
  async signIn(
    @Body() data: SignInDTO,
  ): Promise<BasicReturnType<signInReturn>> {
    try {
      return await this.usersClient.send({ cmd: 'sign_in' }, data).toPromise();
    } catch (error) {
      throw new HttpException(
        {
          error: true,
          status: HttpStatus.BAD_REQUEST,
          message: error.message,
          details: error.details || [],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Post('verify-account')
  async verifyAccount(@Body() dto: TokenDto): Promise<BasicReturnType<null>> {
    try {
      return await this.usersClient
        .send({ cmd: 'verify_account' }, { token: dto.token })
        .toPromise();
    } catch (error) {
      throw new HttpException(
        {
          error: true,
          status: HttpStatus.BAD_REQUEST,
          message: error.message,
          details: error.details || [],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('verify-reset-password-code')
  async verifyResetPasswordCode(
    @Body() dto: TokenDto,
  ): Promise<BasicReturnType<null>> {
    try {
      return await this.usersClient
        .send({ cmd: 'verify_reset_password_code' }, { token: dto.token })
        .toPromise();
    } catch (error) {
      throw new HttpException(
        {
          error: true,
          status: HttpStatus.BAD_REQUEST,
          message: error.message,
          details: error.details || [],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Post('resend-verify-account-code')
  async resendVerificationToken(
    @Body() dto: EmailDto,
  ): Promise<BasicReturnType<null>> {
    try {
      return await this.usersClient
        .send({ cmd: 'resend_verification_code' }, { email: dto.email })
        .toPromise();
    } catch (error) {
      throw new HttpException(
        {
          error: true,
          status: HttpStatus.BAD_REQUEST,
          message: error.message,
          details: error.details || [],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('send-reset-password-code')
  async sendResetPasswordCode(
    @Body() dto: EmailDto,
  ): Promise<BasicReturnType<null>> {
    try {
      return await this.usersClient
        .send({ cmd: 'reset_password_code' }, { email: dto.email })
        .toPromise();
    } catch (error) {
      throw new HttpException(
        {
          error: true,
          status: HttpStatus.BAD_REQUEST,
          message: error.message,
          details: error.details || [],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch('create-new-password')
  async createNewPassword(
    @Body() data: CreatePasswordDTO,
  ): Promise<BasicReturnType<null>> {
    try {
      return await this.usersClient
        .send({ cmd: 'create_new_password' }, data)
        .toPromise();
    } catch (error) {
      throw new HttpException(
        {
          error: true,
          status: HttpStatus.BAD_REQUEST,
          message: error.message,
          details: error.details || [],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('two-factor/generate-qr-code')
  async generateQrCode(): Promise<BasicReturnType<generateQrReturn>> {
    try {
      return await this.usersClient
        .send({ cmd: 'generate-qr-code' }, {})
        .toPromise();
    } catch (error) {
      throw new HttpException(
        {
          error: true,
          status: HttpStatus.BAD_REQUEST,
          message: error.message,
          details: error.details || [],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Post('two-factor/verify-otp')
  async verifyOTP(
    @Body() data: VerifyOtpDTO,
  ): Promise<BasicReturnType<{ verified: boolean }>> {
    try {
      return await this.usersClient
        .send({ cmd: 'verify_otp' }, data)
        .toPromise();
    } catch (error) {
      throw new HttpException(
        {
          error: true,
          status: HttpStatus.BAD_REQUEST,
          message: error.message,
          details: error.details || [],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('two-factor/one-time-signin-code')
  async sendOneTimeSignInCode(
    @Body() dto: EmailDto,
  ): Promise<BasicReturnType<null>> {
    try {
      return await this.usersClient
        .send({ cmd: 'one-time-sign-in-code' }, { email: dto.email })
        .toPromise();
    } catch (error) {
      throw new HttpException(
        {
          error: true,
          status: HttpStatus.BAD_REQUEST,
          message: error.message,
          details: error.details || [],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('verify-one-time-signin-code')
  async verifyOneTimeSigninCode(
    @Body() dto: TokenDto,
  ): Promise<BasicReturnType<null>> {
    try {
      return await this.usersClient
        .send({ cmd: 'verify-one-time-signin-code' }, { token: dto.token })
        .toPromise();
    } catch (error) {
      throw new HttpException(
        {
          error: true,
          status: HttpStatus.BAD_REQUEST,
          message: error.message,
          details: error.details || [],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
