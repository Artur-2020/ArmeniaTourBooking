import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Verification } from '../entities';
import { generateVerificationCode } from '../../helpers/generateVerificationCode';
import {
  VERIFICATION_ATTEMPTS_COUNTS,
  VerificationEntityType,
} from '../constants/auth';
import getTimeMinuteDifference from '../../helpers/compareDatesAndGetDiff';
import changeConstantValue from '../../helpers/replaceConstantValue';
import { UserRepository } from '../../users/repsitories';
import { VerificationRepository } from '../repositories';
import { ConfigService } from '@nestjs/config';
import { services } from '../../constants';
import { ResendCodeDTO } from '../interfaces/auth';
import { ResetPasswordService } from '../reset-password/reset-password.service';
import { AuthService } from '../auth.service';
const { maximumAttemptsCountReached, resendBlocked } = services;
const { notFound, accountIsActive } = services;
@Injectable()
export class SharedService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationRepository: VerificationRepository,
    private readonly configService: ConfigService,
  ) {}
  async checkVerificationCodeExistsOrNot(
    code: string,
    type: string,
  ): Promise<Verification | null> {
    return await this.verificationRepository.findOne({
      where: { token: code, type },
    });
  }

  async resendCode(
    data: ResendCodeDTO,
    service: AuthService | ResetPasswordService,
  ) {
    const { email, type } = data;
    const existsAccount = await this.userRepository.findOne({
      where: { email },
    });

    if (!existsAccount) {
      throw new NotFoundException(
        changeConstantValue(notFound, {
          item: 'account with this email address',
        }),
      );
    } else if (existsAccount.activatedAt) {
      throw new BadRequestException(accountIsActive);
    }

    const expiredAtType =
      type === VerificationEntityType['VERIFY_ACCOUNT']
        ? 'accountVerificationExpiredAt'
        : 'resetPasswordExpiredAt';
    const expiredAtMinutes = this.configService.get<string>(expiredAtType);
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
          token: newCode,
          blockedAt: null,
          attemptsCount: () => 'attemptsCount + 1',
        },
      );
    }

    // Send Verification Email
    await service.sendEmail({ email, code: newCode });
  }
  async generateVerificationToken(type: string): Promise<string> {
    let code: string;
    let exists: Verification | null;

    do {
      code = generateVerificationCode();
      exists = await this.checkVerificationCodeExistsOrNot(code, type);
    } while (exists);

    return code;
  }

  async checkVerificationCodeAttemptsValidity(
    existsVerificationToken: Verification,
  ) {
    const { type: verificationType, id, blockedAt } = existsVerificationToken;

    let { attemptsCount } = existsVerificationToken;

    const allowedAttemptsCount = VERIFICATION_ATTEMPTS_COUNTS[verificationType];

    let type = VerificationEntityType['VERIFY_ACCOUNT'];
    let minutes = this.configService.get<string>(
      'accountVerificationBlockMinutes',
    );

    if (verificationType === VerificationEntityType['RESETPASSWORD']) {
      minutes = this.configService.get<string>('resetPasswordBlockMinutes');

      type = VerificationEntityType['RESETPASSWORD'];
    }

    if (blockedAt) {
      const timeDif = getTimeMinuteDifference(blockedAt);
      if (timeDif > 0) {
        throw new BadRequestException(
          changeConstantValue(resendBlocked, {
            type,
            minutes: timeDif,
          }),
        );
      }
      attemptsCount = 1;
    }

    if (attemptsCount >= allowedAttemptsCount) {
      const plusBlockedAt = new Date();
      plusBlockedAt.setMinutes(plusBlockedAt.getMinutes() + +minutes);

      await this.verificationRepository.updateEntity(
        { id },
        { blockedAt: plusBlockedAt, attemptsCount: 0 },
      );
      throw new BadRequestException(
        changeConstantValue(maximumAttemptsCountReached, {
          type,
          minutes,
        }),
      );
    }
  }
}
