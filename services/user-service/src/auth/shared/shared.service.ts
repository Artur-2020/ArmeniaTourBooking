import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Verification } from '../entities';
import { generateVerificationCode } from '../../helpers/generateVerificationCode';
import { VerificationEntityType } from '../constants/auth';
import getTimeMinuteDifference from '../../helpers/compareDatesAndGetDiff';
import changeConstantValue from '../../helpers/replaceConstantValue';
import { UserRepository } from '../../users/repsitories';
import { VerificationRepository } from '../repositories';
import { ConfigService } from '@nestjs/config';
import { services } from '../../constants';
import { ResendCodeDTO } from '../interfaces/auth';
import { ResetPasswordService } from '../reset-password/reset-password.service';
import { AuthService } from '../auth.service';
import { TwoFactorService } from '../two-factor/two-factor.service';

const { maximumAttemptsCountReached, resendBlocked } = services;
const { notFound, accountIsActive } = services;

/**
 * SharedService provides utility methods for managing user verification codes and handling related logic.
 */
@Injectable()
export class SharedService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationRepository: VerificationRepository,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Checks if a verification code exists for the specified type.
   * @param code - The verification code to check.
   * @param type - The type of verification (e.g., email verification).
   * @returns The verification entity if found, or null otherwise.
   */
  async checkVerificationCodeExistsOrNot(
    code: string,
    type: string,
  ): Promise<Verification | null> {
    return await this.verificationRepository.findOne({
      where: { token: code, type },
    });
  }

  /**
   * Resends a verification code to the user.
   * Generates a new code if necessary and sends it via the specified service.
   * @param data - The data containing user email and verification type.
   * @param service - The service responsible for sending the verification email.
   * @param functionName - For case if there is specific function to call
   * @throws NotFoundException - If the user account does not exist.
   * @throws BadRequestException - If the user account is already active.
   */
  async resendCode(
    data: ResendCodeDTO,
    service: AuthService | ResetPasswordService | TwoFactorService,
    functionName: string | null = null,
  ) {
    const { email, type } = data;
    const { expiredInValue } = VerificationEntityType[type];
    const existsAccount = await this.userRepository.findOne({
      where: { email },
    });

    if (!existsAccount) {
      throw new NotFoundException(
        changeConstantValue(notFound, {
          item: 'account with this email address',
        }),
      );
      // If it email for verification
    } else if (service instanceof AuthService && existsAccount.activatedAt) {
      throw new BadRequestException(accountIsActive);
    }

    const expiredAtMinutes = this.configService.get<string>(expiredInValue);
    const expiredAtDate = new Date();

    expiredAtDate.setMinutes(expiredAtDate.getMinutes() + +expiredAtMinutes);

    const newCode = await this.generateVerificationToken(type);

    const existsVerificationToken =
      await this.verificationRepository.findOneByQuery({
        type,
        email,
      });

    if (!existsVerificationToken) {
      await this.verificationRepository.createEntity({
        email,
        token: newCode,
        attemptsCount: 1,
        expiredAt: expiredAtDate,
        type,
      });
    } else {
      await this.checkVerificationCodeAttemptsValidity(existsVerificationToken);

      await this.verificationRepository.update(
        { id: existsVerificationToken.id },
        {
          expiredAt: expiredAtDate,
          token: newCode,
          blockedAt: null,
          attemptsCount: () => 'attemptsCount + 1',
        },
      );
    }

    // Send Verification Email
    if (functionName) {
      await service[functionName]({ email, code: newCode });
    } else {
      if (!(service instanceof TwoFactorService)) {
        await service.sendEmail({ email, code: newCode });
      }
    }
  }

  /**
   * Generates a unique verification token for the specified type.
   * Ensures the token does not already exist.
   * @param type - The type of verification (e.g., email verification).
   * @returns The generated verification token.
   */
  async generateVerificationToken(type: string): Promise<string> {
    let code: string;
    let exists: Verification | null;

    do {
      code = generateVerificationCode();
      exists = await this.checkVerificationCodeExistsOrNot(code, type);
    } while (exists);

    return code;
  }

  /**
   * Validates the number of attempts made for a verification code.
   * Blocks further attempts if the maximum count is reached.
   * @param existsVerificationToken - The existing verification token entity.
   * @throws BadRequestException if the user is blocked or the maximum attempts are exceeded.
   */
  async checkVerificationCodeAttemptsValidity(
    existsVerificationToken: Verification,
  ) {
    const { type: verificationType, id, blockedAt } = existsVerificationToken;

    let { attemptsCount } = existsVerificationToken;
    const { value, blockedInValue, count } =
      VerificationEntityType[verificationType];

    const minutes = this.configService.get<string>(blockedInValue);

    if (blockedAt) {
      const timeDif = getTimeMinuteDifference(blockedAt);
      if (timeDif > 0) {
        throw new BadRequestException(
          changeConstantValue(resendBlocked, {
            type: value,
            minutes: timeDif,
          }),
        );
      }
      attemptsCount = 1;
    }

    if (attemptsCount >= count) {
      const plusBlockedAt = new Date();
      plusBlockedAt.setMinutes(plusBlockedAt.getMinutes() + +minutes);

      await this.verificationRepository.updateEntity(
        { id },
        { blockedAt: plusBlockedAt, attemptsCount: 0 },
      );
      throw new BadRequestException(
        changeConstantValue(maximumAttemptsCountReached, {
          type: value,
          minutes,
        }),
      );
    }
  }
}
