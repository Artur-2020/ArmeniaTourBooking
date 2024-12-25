import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import changeConstantValue from '../../helpers/replaceConstantValue';
import { BasicReturnType, SendVerificationData } from '../interfaces/auth';
import { VerificationEntityType } from '../constants/auth';
import getTimeMinuteDifference from '../../helpers/compareDatesAndGetDiff';
import { CreateNewPasswordDto } from '../dto';
import { hash } from '../../helpers/hashing';
import { UserRepository } from '../../users/repsitories';
import { VerificationRepository } from '../repositories';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { services, validations } from '../../constants';
import { SharedService } from '../shared/shared.service';

const { resetPasswordEmailText, codeExpiredAt } = services;
const { invalidItem } = validations;

/**
 * Service responsible for handling password reset functionality.
 */
@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationRepository: VerificationRepository,
    private readonly configService: ConfigService,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationsClient: ClientProxy,
    private readonly sharedService: SharedService,
  ) {}

  /**
   * Sends a reset password email containing a verification code.
   * @param data Object containing the recipient's email and the verification code.
   */
  async sendEmail(data: { email: string; code: string }) {
    const { expiredInValue } = VerificationEntityType.resetpassword;
    const { code, email } = data;
    const minutes = this.configService.get<string>(expiredInValue);

    const text = changeConstantValue(resetPasswordEmailText, { code, minutes });
    const resetPasswordEmailData: SendVerificationData = {
      to: email,
      subject: 'Reset Password',
      text,
    };
    this.notificationsClient.emit('send_email', resetPasswordEmailData);
  }

  /**
   * Verifies the validity of a reset password code.
   * Deletes the code upon successful verification.
   * @param token The reset password code to verify.
   * @returns A success response if the code is valid.
   * @throws {BadRequestException} If the code is invalid or expired.
   */
  async verifyResetPasswordCode(
    token?: string,
  ): Promise<BasicReturnType<null>> {
    const { value } = VerificationEntityType.resetpassword;

    if (!token) {
      throw new BadRequestException(
        changeConstantValue(invalidItem, { item: 'Code' }),
      );
    }
    const existsToken =
      await this.sharedService.checkVerificationCodeExistsOrNot(token, value);

    if (!existsToken) {
      throw new BadRequestException(
        changeConstantValue(invalidItem, { item: 'Code' }),
      );
    }

    const timeDif = getTimeMinuteDifference(existsToken.expiredAt);

    if (timeDif < 0) {
      throw new BadRequestException(
        changeConstantValue(codeExpiredAt, { type: value }),
      );
    }

    await this.verificationRepository.deleteEntity(existsToken.id);

    return { success: true };
  }

  /**
   * Creates a new password for a user account.
   * @param data Object containing the new password and the user's email.
   * @returns A success response if the password is successfully updated.
   * @throws {NotFoundException} If the email does not exist.
   */
  async createNewPassword(
    data: CreateNewPasswordDto,
  ): Promise<BasicReturnType<null>> {
    const { password, email } = data;

    const existsAccount = await this.userRepository.findOne({
      where: { email },
    });

    if (!existsAccount) {
      throw new NotFoundException(
        changeConstantValue(invalidItem, {
          item: 'Email',
        }),
      );
    }
    const hashedPassword = await hash(password);

    await this.userRepository.updateEntity(
      {
        id: existsAccount.id,
      },
      { password: hashedPassword },
    );

    return { success: true };
  }
}
