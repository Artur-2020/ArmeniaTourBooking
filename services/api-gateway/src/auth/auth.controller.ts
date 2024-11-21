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
import { CreatePasswordDTO, SignInDTO, SignUpDTO, VerifyOtpDTO } from '../dtos';
import {
  BasicReturnType,
  generateQrReturn,
  signInReturn,
  signUpReturn,
} from '../interfaces';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('USER_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  @Post('signup')
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
  async verifyAccount(
    @Body('token') token: string,
  ): Promise<BasicReturnType<null>> {
    try {
      return await this.usersClient
        .send({ cmd: 'verify_account' }, { token })
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
    @Body('token') token: string,
  ): Promise<BasicReturnType<null>> {
    try {
      return await this.usersClient
        .send({ cmd: 'verify_reset_password_code' }, { token })
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
    @Body('email') email: string,
  ): Promise<BasicReturnType<null>> {
    try {
      return await this.usersClient
        .send({ cmd: 'resend_verification_code' }, { email })
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
    @Body('email') email: string,
  ): Promise<BasicReturnType<null>> {
    try {
      return await this.usersClient
        .send({ cmd: 'reset_password_code' }, { email })
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
}
