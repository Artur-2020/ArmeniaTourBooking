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
    await this.notificationsClient
      .send({ cmd: 'send_email' }, resetPasswordEmailData)
      .toPromise();
  }

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
