import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import {
  CreateNewPasswordDto,
  ResendVerificationDto,
  VerifyAccountDto,
} from '../dto';
import { BasicReturnType } from '../interfaces/auth';
import { ResetPasswordService } from './reset-password.service';
import { VerificationEntityType } from '../constants/auth';
import { SharedService } from '../shared/shared.service';

@Controller('reset-password')
export class ResetPasswordController {
  constructor(
    private readonly sharedService: SharedService,
    private readonly resetPasswordService: ResetPasswordService,
  ) {}

  @MessagePattern({ cmd: 'reset_password_code' })
  async sendForgetPasswordCode(
    @Payload() data: ResendVerificationDto,
  ): Promise<BasicReturnType<null>> {
    try {
      const newData = { ...data, type: VerificationEntityType.RESETPASSWORD };
      await this.sharedService.resendCode(newData, this.resetPasswordService);
      return { success: true };
    } catch (error) {
      console.log('error ------------>', error);
      throw new RpcException(error.message);
    }
  }
  @MessagePattern({ cmd: 'verify_reset_password_code' })
  async verifyResetPasswordCode(
    @Payload() data: VerifyAccountDto,
  ): Promise<BasicReturnType<null>> {
    try {
      const { token } = data;
      await this.resetPasswordService.verifyResetPasswordCode(token);
      return { success: true };
    } catch (error) {
      console.log('error ------------>', error);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern({ cmd: 'create_new_password' })
  async createNewPassword(
    @Payload() data: CreateNewPasswordDto,
  ): Promise<BasicReturnType<null>> {
    try {
      return await this.resetPasswordService.createNewPassword(data);
    } catch (error) {
      console.log('error ------------>', error);
      throw new RpcException(error.message);
    }
  }
}
