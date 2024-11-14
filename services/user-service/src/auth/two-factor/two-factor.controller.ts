import { Controller } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { TwoFactorService } from './two-factor.service';

@Controller('two-factor')
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}
  @MessagePattern({ cmd: 'verify_otp' })
  async verifyOTP(): Promise<string> {
    try {
      const info = await this.twoFactorService.checkEnabledTwoFactor();
      console.log('info ------------------_>', info);
      return 'Verifying';
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
