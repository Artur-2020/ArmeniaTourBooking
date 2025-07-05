import { Controller, Post, Body } from '@nestjs/common';
import {
  CreateNewPasswordDto,
  ResendVerificationDto,
  VerifyAccountDto,
} from '../dto';
import { BasicReturnType } from '../interfaces/auth';
import { ResetPasswordService } from './reset-password.service';
import { SharedService } from '../shared/shared.service';

@Controller('auth')
export class ResetPasswordController {
  constructor(
    private readonly sharedService: SharedService,
    private readonly resetPasswordService: ResetPasswordService,
  ) {}

  /**
   * Send reset password code via email to the user
   * Sends a password reset code to the user's email.
   *
   * @param data ResendVerificationDto - Contains the user's email address.
   * @returns BasicReturnType with a response indicating success or validation error.
   */
  @Post('send-reset-password-code')
  async sendForgetPasswordCode(
    @Body() data: ResendVerificationDto,
  ): Promise<BasicReturnType<null>> {
    const newData = {
      ...data,
      type: 'resetpassword',
    };
    await this.sharedService.resendCode(newData, this.resetPasswordService);
    return { success: true };
  }

  /**
   * Verify code from email for allow to go to the new password page
   * Verifies a reset password code sent to the user's email.
   *
   * @param data VerifyAccountDto - Contains the reset password token.
   * @returns BasicReturnType with a response indicating success or validation error.
   */
  @Post('verify-reset-password-code')
  async verifyResetPasswordCode(
    @Body() data: VerifyAccountDto,
  ): Promise<BasicReturnType<null>> {
    const { token } = data;
    await this.resetPasswordService.verifyResetPasswordCode(token);
    return { success: true };
  }

  /**
   * Create new password after verification
   * Allows a user to create a new password after verifying the reset code.
   *
   * @param data CreateNewPasswordDto - Contains the new password and confirmation.
   * @returns BasicReturnType with a response indicating success or validation error.
   */
  @Post('create-new-password')
  async createNewPassword(
    @Body() data: CreateNewPasswordDto,
  ): Promise<BasicReturnType<null>> {
    await this.resetPasswordService.createNewPassword(data);
    return { success: true };
  }
}
