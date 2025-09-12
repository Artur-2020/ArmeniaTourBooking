import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { validations } from '../../constants';
import changeConstantValue from '../../helpers/replaceConstantValue';

const { notEmpty, invalidItem } = validations;
export default class ResendCodeDto {
  @ApiProperty({
    description: 'User email address to resend verification code',
    example: 'user@example.com',
    format: 'email'
  })
  @IsNotEmpty({ message: changeConstantValue(notEmpty, { item: 'Email' }) })
  @IsEmail({}, { message: changeConstantValue(invalidItem, { item: 'Email' }) })
  email: string;
}
