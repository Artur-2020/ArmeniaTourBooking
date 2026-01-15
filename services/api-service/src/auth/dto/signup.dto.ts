import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { validations } from '../../constants';
import { Match } from '../decorators/match.decorator';
import changeConstantValue from '../../helpers/replaceConstantValue';

const { notEmpty, lengthMsg, invalidItem, passwordDoesNotMatch, passwordMsg } =
  validations;
export default class SignUpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email'
  })
  @IsNotEmpty({ message: changeConstantValue(notEmpty, { item: 'Email' }) })
  @IsEmail({}, { message: changeConstantValue(invalidItem, { item: 'Email' }) })
  email: string;

  @ApiProperty({
    description: 'User role',
    example: 'user',
    enum: ['user', 'admin', 'moderator']
  })
  @IsNotEmpty({ message: changeConstantValue(notEmpty, { item: 'Role' }) })
  role: string;

  @ApiProperty({
    description: 'User password (8-20 characters, must contain at least one digit, one letter, and one special character)',
    example: 'MySecure123!',
    minLength: 8,
    maxLength: 20,
    pattern: '(?=.*\\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&*])'
  })
  @IsNotEmpty({ message: changeConstantValue(notEmpty, { item: 'Password' }) })
  @Length(8, 20, {
    message: changeConstantValue(lengthMsg, {
      item: 'password',
      max: 20,
      min: 8,
    }),
  })
  @Matches(/(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&*])/, {
    message: passwordMsg,
  })
  password: string;

  @ApiProperty({
    description: 'Confirm password (must match the password field)',
    example: 'MySecure123!',
    minLength: 8,
    maxLength: 20
  })
  @IsNotEmpty({ message: changeConstantValue(notEmpty, { item: 'Password' }) })
  @Length(8, 20, {
    message: changeConstantValue(lengthMsg, {
      item: 'confirm password',
      max: 20,
      min: 8,
    }),
  })
  //@ts-ignore
  @Match('password', { message: passwordDoesNotMatch })
  confirm_password: string;
}
