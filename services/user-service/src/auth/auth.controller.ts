import { Controller, UsePipes, Post, Body } from '@nestjs/common';
import { ValidationPipe } from '../users/pipes/validation.pipe';
import {
  SignInDto,
  SignUpDto,
  ResendVerificationDto,
  VerifyAccountDto,
  VerifyOneTimeSignInDto,
} from '../auth/dto';
import { signUpReturn, signInReturn, BasicReturnType } from './interfaces/auth';
import { AuthService } from './auth.service';
import { SharedService } from './shared/shared.service';
import { services } from '../constants';
import changeConstantValue from '../helpers/replaceConstantValue';
import { VerificationEntityTypeEnum } from './constants/auth';

const { operationSuccessfully } = services;

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
  async verifyAccount(
    @Body() data: VerifyAccountDto,
  ): Promise<BasicReturnType<null>> {
    const { token } = data;
    await this.authService.verifyAccount(token);
    return { success: true };
  }

  /**
   * Send one-time sign-in code
   * Sends a one-time sign-in code to the user's email for authentication.
   *
   * @param data ResendVerificationDto - Contains the user's email.
   * @returns BasicReturnType with a response indicating success or validation error.
   */
  @Post('one-time-signin-code')
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
  @Post('verify-one-time-signin-code')
  async verifyOneTimeSignIn(
    @Body() data: VerifyOneTimeSignInDto,
  ): Promise<BasicReturnType<null>> {
    await this.authService.verifyOneTimeSignInCode(data.token);
    return { success: true };
  }
}
