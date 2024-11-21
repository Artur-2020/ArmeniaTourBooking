import { Controller, UsePipes } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { TwoFactorService } from './two-factor.service';
import { BasicReturnType, GetQRCodeReturn } from '../interfaces/auth';
import { ValidationPipe } from '../../users/pipes/validation.pipe';
import { VerifyOptDto } from '../dto';

@Controller('two-factor')
@UsePipes(ValidationPipe)
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

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
}
