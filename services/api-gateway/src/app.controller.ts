import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Param,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SignUpDTO, SignInDTO } from './dtos';

@Controller()
export class AppController {
  constructor(
    @Inject('USER_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  @Post('signup')
  async signUp(@Body() data: SignUpDTO) {
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
  async signIn(@Body() data: SignInDTO) {
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
  async verifyAccount(@Body('token') token: string): Promise<string> {
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

  @Post('resend-verify-account-code')
  async resendVerificationToken(@Body('code') code: string): Promise<string> {
    try {
      return await this.usersClient
        .send({ cmd: 'resend_verification_code' }, { code })
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
