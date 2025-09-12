import { Controller, UsePipes, Post, Body, Get, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ValidationPipe } from '../users/pipes/validation.pipe';
import { signUp, signIn, refreshToken, logout, verifyAccount, commonResponses, createPassword, verifyOtp } from '../api-responses/dtos/api-response';
import { Public } from './decorators/public.decorator';
import {
  SignInDto,
  SignUpDto,
  ResendVerificationDto,
  VerifyAccountDto,
  VerifyOneTimeSignInDto,
  RefreshTokenDto,
  LogoutDto,
} from '../auth/dto';
import { signUpReturn, signInReturn, BasicReturnType } from './interfaces/auth';
import { AuthService } from './auth.service';
import { SharedService } from './shared/shared.service';
import { services } from '../constants';
import changeConstantValue from '../helpers/replaceConstantValue';
import { VerificationEntityTypeEnum } from './constants/auth';

const { operationSuccessfully } = services;

@ApiTags('Auth')
@Controller('auth')
@UsePipes(ValidationPipe)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sharedService: SharedService,
  ) {}

  /**
   * Signup action handler
   * Allows a new user to create an account by providing email, password, and other necessary details.
   *
   * @param data SignUpDto - Contains user email, password, role, and password confirmation.
   * @returns BasicReturnType with a response indicating success or validation error.
   */
  @Post('signup')
  @Public()
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse(signUp.success)
  @ApiResponse(signUp.error)
  async signUp(
    @Body() data: SignUpDto,
  ): Promise<BasicReturnType<signUpReturn>> {
    const returnData = await this.authService.signUp(data);

    return {
      success: true,
      data: returnData,
      message: changeConstantValue(operationSuccessfully, {
        operation: 'User was registered',
      }),
    };
  }

  /**
   * Sign In action handler
   * Allows an existing user to log in by providing their email and password.
   *
   * @param data SignInDto - Contains user email and password.
   * @returns BasicReturnType with a response indicating success or validation error.
   */
  @Post('signin')
  @Public()
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({ type: SignInDto })
  @ApiResponse(signIn.success)
  @ApiResponse(signIn.error)
  async signIn(
    @Body() data: SignInDto,
  ): Promise<BasicReturnType<signInReturn>> {
    const returnData = await this.authService.signIn(data);
    return { success: true, data: returnData };
  }

  /**
   * Send user profile activated email
   * Sends a new account verification token to the user's email.
   *
   * @param data ResendVerificationDto - Contains the user's email address.
   * @returns BasicReturnType with a response indicating success or validation error.
   */
  @Post('resend-verify-account-code')
  @Public()
  @ApiOperation({ summary: 'Resend account verification code' })
  @ApiBody({ type: ResendVerificationDto })
  @ApiResponse(commonResponses.success)
  @ApiResponse(commonResponses.error)
  async resendVerificationCode(
    @Body() data: ResendVerificationDto,
  ): Promise<BasicReturnType<null>> {
    const newData = {
      ...data,
      type: 'verification',
    };
    await this.sharedService.resendCode(newData, this.authService);
    return { success: true };
  }

  /**
   * Verify user account
   * Verifies a user's account using a token sent via email.
   *
   * @param data VerifyAccountDto - Contains the token for verification.
   * @returns BasicReturnType with a response indicating success or validation error.
   */
  @Post('verify-account')
  @Public()
  @ApiOperation({ summary: 'Verify user account with token' })
  @ApiBody({ type: VerifyAccountDto })
  @ApiResponse(verifyAccount.success)
  @ApiResponse(verifyAccount.error)
  async verifyAccount(
    @Body() data: VerifyAccountDto,
  ): Promise<BasicReturnType<signInReturn>> {
    const { token } = data;
    const returnData = await this.authService.verifyAccount(token);
    return { success: true, data: returnData };
  }
  /**
   * Send one-time sign-in code
   * Sends a one-time sign-in code to the user's email for authentication.
   *
   * @param data ResendVerificationDto - Contains the user's email.
   * @returns BasicReturnType with a response indicating success or validation error.
   */
  @Post('one-time-sign-in/code')
  @Public()
  @ApiOperation({ summary: 'Send one-time sign-in code' })
  @ApiBody({ type: ResendVerificationDto })
  @ApiResponse(commonResponses.success)
  @ApiResponse(commonResponses.error)
  async sendOneTimeSignInCode(
    @Body() data: ResendVerificationDto,
  ): Promise<BasicReturnType<null>> {
    const newData = {
      ...data,
      type: VerificationEntityTypeEnum.ONE_TIME_SIGN_IN,
    };
    await this.sharedService.resendCode(
      newData,
      this.authService,
      'sendOneTimeSignInEmail',
    );
    return { success: true };
  }

  /**
   * Verify one time signin code
   *
   * @param data VerifyOptDto - Contains the user's email and OTP code.
   * @returns BasicReturnType with a response indicating whether the OTP was verified.
   */
  @Post('one-time-sign-in/verify')
  @Public()
  @ApiOperation({ summary: 'Verify one-time sign-in code' })
  @ApiBody({ type: VerifyOneTimeSignInDto })
  @ApiResponse(signIn.success)
  @ApiResponse(signIn.error)
  async verifyOneTimeSignIn(
    @Body() data: VerifyOneTimeSignInDto,
  ): Promise<BasicReturnType<signInReturn>> {
    const returnData = await this.authService.verifyOneTimeSignInCode(
      data.token,
    );
    return { success: true, data: returnData };
  }

  /**
   * Refresh access token
   * Refreshes the access token using a valid refresh token.
   *
   * @param data RefreshTokenDto - Contains the refresh token.
   * @returns BasicReturnType with new access and refresh tokens.
   */
  @Post('refresh-token')
  @Public()
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse(refreshToken.success)
  @ApiResponse(refreshToken.error)
  async refreshToken(
    @Body() data: RefreshTokenDto,
  ): Promise<BasicReturnType<signInReturn>> {
    const returnData = await this.authService.refreshToken(data.refreshToken);
    return { success: true, data: returnData };
  }

  /**
   * Logout user
   * Invalidates the refresh token to log out the user.
   *
   * @param data LogoutDto - Contains the refresh token to invalidate.
   * @returns BasicReturnType with a response indicating success.
   */
  @Post('logout')
  @ApiOperation({ summary: 'Logout user and invalidate refresh token' })
  @ApiBody({ type: LogoutDto })
  @ApiResponse(logout.success)
  @ApiResponse(logout.error)
  @ApiBearerAuth()
  async logout(@Body() data: LogoutDto): Promise<BasicReturnType<null>> {
    await this.authService.logout(data.refreshToken);
    return { success: true };
  }
}
