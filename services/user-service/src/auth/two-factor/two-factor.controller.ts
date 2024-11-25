import { Controller, UsePipes } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { TwoFactorService } from './two-factor.service';
import { BasicReturnType, GetQRCodeReturn } from '../interfaces/auth';
import { ValidationPipe } from '../../users/pipes/validation.pipe';
import { VerifyAccountDto, VerifyOptDto, ResendVerificationDto } from '../dto';
import { VerificationEntityType } from '../constants/auth';
import { SharedService } from '../shared/shared.service';

@Controller('two-factor')
@UsePipes(ValidationPipe)
export class TwoFactorController {
  constructor(
    private readonly twoFactorService: TwoFactorService,
    private readonly sharedService: SharedService,
  ) {}

  @MessagePattern({ cmd: 'generate-qr-code' })
  async generateQrCode(): Promise<BasicReturnType<GetQRCodeReturn>> {
    try {
      const userId = '36c8be2e-4603-4a96-937d-f9ed1351a44f';

      const qrCode = await this.twoFactorService.getQrCode(userId);
      return { success: true, data: { code: qrCode } };
    } catch (error) {
      console.log('error ---------------------->', error);
      throw new RpcException(error.message);
    }
  }
  @MessagePattern({ cmd: 'verify_otp' })
  async verifyOTP(
    @Payload() data: VerifyOptDto,
  ): Promise<BasicReturnType<{ verified: boolean }>> {
    try {
      const res = await this.twoFactorService.verifyOtp(data);

      return { success: true, data: { verified: res } };
    } catch (error) {
      console.log('error ---------------->', error);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern({ cmd: 'one-time-sign-in-code' })
  async oneTimeSignInCode(
    @Payload() data: ResendVerificationDto,
  ): Promise<BasicReturnType<null>> {
    try {
      const newData = {
        ...data,
        type: VerificationEntityType.onetimesignin.value,
      };
      await this.sharedService.resendCode(newData, this.twoFactorService);

      return { success: true };
    } catch (error) {
      console.log('error ---------------->', error);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern({ cmd: 'verify-one-time-signin-code' })
  async verifyResetPasswordCode(
    @Payload() data: VerifyAccountDto,
  ): Promise<BasicReturnType<null>> {
    try {
      const { token } = data;
      await this.twoFactorService.verifyOneTimeSignInCode(token);
      return { success: true };
    } catch (error) {
      console.log('error ------------>', error);
      throw new RpcException(error.message);
    }
  }
}
