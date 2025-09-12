import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { validations } from '../../constants';
import changeConstantValue from '../../helpers/replaceConstantValue';

const { notEmpty } = validations;
export default class VerifyOptDto {
  @ApiProperty({
    description: 'OTP (One-Time Password) code for verification',
    example: '123456',
    type: 'string',
    minLength: 6,
    maxLength: 6
  })
  @IsNotEmpty({ message: changeConstantValue(notEmpty, { item: 'Code' }) })
  code: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email'
  })
  @IsNotEmpty({ message: changeConstantValue(notEmpty, { item: 'Email' }) })
  email: string;
}
