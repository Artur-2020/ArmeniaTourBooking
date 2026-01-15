import { Controller, Post, Body, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { createPassword, commonResponses } from '../../api-responses/dtos/api-response';
import { Public } from '../decorators/public.decorator';
import {
  CreateNewPasswordDto,
  ResendVerificationDto,
  VerifyAccountDto,
} from '../dto';
import { BasicReturnType } from '../interfaces/auth';
import { ResetPasswordService } from './reset-password.service';
import { SharedService } from '../shared/shared.service';

@ApiTags('Auth')
@Controller('auth/reset-password')
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
  @Post('code')
  @Public()
  @ApiOperation({ summary: 'Send password reset code' })
  @ApiBody({ type: ResendVerificationDto })
  @ApiResponse(commonResponses.success)
  @ApiResponse(commonResponses.error)
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
  @Post('verify')
  @Public()
  @ApiOperation({ summary: 'Verify password reset code' })
  @ApiBody({ type: VerifyAccountDto })
  @ApiResponse(commonResponses.success)
  @ApiResponse(commonResponses.error)
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
  @Patch('create')
  @Public()
  @ApiOperation({ summary: 'Create new password after verification' })
  @ApiBody({ type: CreateNewPasswordDto })
  @ApiResponse(createPassword.success)
  @ApiResponse(createPassword.error)
  async createNewPassword(
    @Body() data: CreateNewPasswordDto,
  ): Promise<BasicReturnType<null>> {
    await this.resetPasswordService.createNewPassword(data);
    return { success: true };
  }
}
