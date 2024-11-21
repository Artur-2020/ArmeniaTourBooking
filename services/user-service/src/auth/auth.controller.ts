import { Controller, UsePipes } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import {
  SignInDto,
  SignUpDto,
  ResendVerificationDto,
  VerifyAccountDto,
} from '../auth/dto';
import { signUpReturn, signInReturn, BasicReturnType } from './interfaces/auth';
import { AuthService } from './auth.service';
import { ValidationPipe } from '../users/pipes/validation.pipe';
import { VerificationEntityType } from './constants/auth';
import { SharedService } from './shared/shared.service';
import { services } from '../constants';
import changeConstantValue from '../helpers/replaceConstantValue';

const { operationSuccessfully } = services;

@Controller('auth')
@UsePipes(ValidationPipe)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sharedService: SharedService,
  ) {}
  @MessagePattern({ cmd: 'sign_up' })
  async signUp(
    @Payload() data: SignUpDto,
  ): Promise<BasicReturnType<signUpReturn>> {
    try {
      const returnData = await this.authService.signUp(data);

      return {
        success: true,
        data: returnData,
        message: changeConstantValue(operationSuccessfully, {
          operation: 'User was registered',
        }),
      };
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
  @MessagePattern({ cmd: 'sign_in' })
  async signIn(
    @Payload() data: SignInDto,
  ): Promise<BasicReturnType<signInReturn>> {
    try {
      const returnData = await this.authService.signIn(data);

      return { success: true, data: returnData };
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern({ cmd: 'resend_verification_code' })
  async resendVerificationCode(
    @Payload() data: ResendVerificationDto,
  ): Promise<BasicReturnType<null>> {
    try {
      const newData = { ...data, type: VerificationEntityType.VERIFY_ACCOUNT };
      await this.sharedService.resendCode(newData, this.authService);
      return { success: true };
    } catch (error) {
      console.log('error ------------>', error);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern({ cmd: 'verify_account' })
  async verifyAccount(
    @Payload() data: VerifyAccountDto,
  ): Promise<BasicReturnType<null>> {
    try {
      const { token } = data;
      await this.authService.verifyAccount(token);
      return { success: true };
    } catch (error) {
      console.log('error ------------>', error);
      throw new RpcException(error.message);
    }
  }
}
