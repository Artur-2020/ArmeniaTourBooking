import { Body, Controller, Inject, Patch, Post } from '@nestjs/common';
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
import CatchError from '../utils/catch-error';
import {
  verifyAccount,
  signIn,
  signUp,
  verifyOtp,
  createPassword,
  twoFactorResponses,
  commonResponses,
} from '../api-responses/auth';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('USER_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  /**
   * User Registration Endpoint
   * Allows a new user to create an account by providing email, password, and other necessary details.
   *
   * @param data SignUpDTO - Contains user email, password, role, and password confirmation.
   * @returns BasicReturnType with a response indicating success or validation error.
   */
  @Post('signup')
  @ApiOperation({ summary: 'Sign Up' })
  @ApiResponse(signUp.success)
  @ApiResponse(signUp.error)
  async signUp(
    @Body() data: SignUpDTO,
  ): Promise<BasicReturnType<signUpReturn>> {
    try {
      return await this.usersClient.send({ cmd: 'sign_up' }, data).toPromise();
    } catch (error) {
      CatchError(error);
    }
  }

  /**
   * User Login Endpoint
   * Allows an existing user to log in by providing their email and password.
   *
   * @param data SignInDTO - Contains user email and password.
   * @returns BasicReturnType with a response indicating success or validation error.
   */
  @Post('signin')
  @ApiOperation({ summary: 'Sign In' })
  @ApiResponse(signIn.success)
  @ApiResponse(signIn.error)
  async signIn(
    @Body() data: SignInDTO,
  ): Promise<BasicReturnType<signInReturn>> {
    try {
      return await this.usersClient.send({ cmd: 'sign_in' }, data).toPromise();
    } catch (error) {
      CatchError(error);
    }
  }

  /**
   * Account Verification Endpoint
   * Verifies a user's account using a token sent via email.
   *
   * @param dto TokenDto - Contains the token for verification.
   * @returns BasicReturnType with a response indicating success or validation error.
   */
  @Post('verify-account')
  @ApiOperation({ summary: 'Verify Account' })
  @ApiResponse(verifyAccount.success)
  @ApiResponse(verifyAccount.error)
  async verifyAccount(@Body() dto: TokenDto): Promise<BasicReturnType<null>> {
    try {
      return await this.usersClient
        .send({ cmd: 'verify_account' }, { token: dto.token })
        .toPromise();
    } catch (error) {
      CatchError(error);
    }
  }

  /**
   * Password Reset Code Verification
   * Verifies a reset password code sent to the user's email.
   *
   * @param dto TokenDto - Contains the reset password token.
   * @returns BasicReturnType with a response indicating success or validation error.
   */
  @Post('verify-reset-password-code')
  @ApiOperation({ summary: 'Verify Reset Password Code' })
  @ApiResponse(commonResponses.success)
  @ApiResponse(commonResponses.error)
  async verifyResetPasswordCode(
    @Body() dto: TokenDto,
  ): Promise<BasicReturnType<null>> {
    try {
      return await this.usersClient
        .send({ cmd: 'verify_reset_password_code' }, { token: dto.token })
        .toPromise();
    } catch (error) {
      CatchError(error);
    }
  }

  /**
   * Resend Verification Token Endpoint
   * Sends a new account verification token to the user's email.
   *
   * @param dto EmailDto - Contains the user's email address.
   * @returns BasicReturnType with a response indicating success or validation error.
   */
  @Post('resend-verify-account-code')
  @ApiOperation({ summary: 'Resend Verification Token' })
  @ApiResponse(commonResponses.success)
  @ApiResponse(commonResponses.error)
  async resendVerificationToken(
    @Body() dto: EmailDto,
  ): Promise<BasicReturnType<null>> {
    try {
      return await this.usersClient
        .send({ cmd: 'resend_verification_code' }, { email: dto.email })
        .toPromise();
    } catch (error) {
      CatchError(error);
    }
  }

  /**
   * Send Reset Password Code Endpoint
   * Sends a password reset code to the user's email.
   *
   * @param dto EmailDto - Contains the user's email address.
   * @returns BasicReturnType with a response indicating success or validation error.
   */
  @Post('send-reset-password-code')
  @ApiOperation({ summary: 'Send Reset Password Code' })
  @ApiResponse(commonResponses.success)
  @ApiResponse(commonResponses.error)
  async sendResetPasswordCode(
    @Body() dto: EmailDto,
  ): Promise<BasicReturnType<null>> {
    try {
      return await this.usersClient
        .send({ cmd: 'reset_password_code' }, { email: dto.email })
        .toPromise();
    } catch (error) {
      CatchError(error);
    }
  }

  /**
   * Create New Password Endpoint
   * Allows a user to create a new password after verifying the reset code.
   *
   * @param data CreatePasswordDTO - Contains the new password and confirmation.
   * @returns BasicReturnType with a response indicating success or validation error.
   */
  @Patch('create-new-password')
  @ApiOperation({ summary: 'Create New Password' })
  @ApiResponse(createPassword.success)
  @ApiResponse(createPassword.error)
  async createNewPassword(
    @Body() data: CreatePasswordDTO,
  ): Promise<BasicReturnType<null>> {
    try {
      return await this.usersClient
        .send({ cmd: 'create_new_password' }, data)
        .toPromise();
    } catch (error) {
      CatchError(error);
    }
  }

  /**
   * Generate QR Code for Two-Factor Authentication
   * Generates a QR code for the user to set up two-factor authentication.
   *
   * @returns BasicReturnType with the generated QR code data.
   */
  @Post('two-factor/generate-qr-code')
  @ApiOperation({ summary: 'Generate QR Code for Two-Factor Authentication' })
  @ApiResponse(twoFactorResponses.generateQr.success)
  @ApiResponse(twoFactorResponses.generateQr.error)
  async generateQrCode(): Promise<BasicReturnType<generateQrReturn>> {
    try {
      return await this.usersClient
        .send({ cmd: 'generate-qr-code' }, {})
        .toPromise();
    } catch (error) {
      CatchError(error);
    }
  }

  /**
   * Verify OTP for Two-Factor Authentication
   * Verifies the OTP code generated by the user's authenticator app.
   *
   * @param data VerifyOtpDTO - Contains the user's email and OTP code.
   * @returns BasicReturnType with a response indicating whether the OTP was verified.
   */
  @Post('two-factor/verify-otp')
  @ApiOperation({ summary: 'Verify OTP for Two-Factor Authentication' })
  @ApiResponse(verifyOtp.success)
  @ApiResponse(verifyOtp.error)
  async verifyOTP(
    @Body() data: VerifyOtpDTO,
  ): Promise<BasicReturnType<{ verified: boolean }>> {
    try {
      return await this.usersClient
        .send({ cmd: 'verify_otp' }, data)
        .toPromise();
    } catch (error) {
      CatchError(error);
    }
  }

  /**
   * Send One-Time Sign-In Code Endpoint
   * Sends a one-time sign-in code to the user's email for authentication.
   *
   * @param dto EmailDto - Contains the user's email address.
   * @returns BasicReturnType with a response indicating success or validation error.
   */
  @Post('two-factor/one-time-signin-code')
  @ApiOperation({ summary: 'Send One-Time Sign-In Code' })
  @ApiResponse(commonResponses.success)
  @ApiResponse(commonResponses.error)
  async sendOneTimeSignInCode(
    @Body() dto: EmailDto,
  ): Promise<BasicReturnType<null>> {
    try {
      return await this.usersClient
        .send({ cmd: 'one-time-sign-in-code' }, { email: dto.email })
        .toPromise();
    } catch (error) {
      CatchError(error);
    }
  }
}
