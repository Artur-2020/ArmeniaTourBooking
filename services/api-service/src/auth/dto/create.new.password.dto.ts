import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';
import { validations } from '../../constants';
import { Match } from '../decorators/match.decorator';
import changeConstantValue from '../../helpers/replaceConstantValue';

const { notEmpty, lengthMsg, invalidItem, passwordDoesNotMatch, passwordMsg } =
  validations;
export default class SignUpDto {
  @IsNotEmpty({ message: changeConstantValue(notEmpty, { item: 'Email' }) })
  @IsEmail({}, { message: changeConstantValue(invalidItem, { item: 'Email' }) })
  email: string;

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

  @IsNotEmpty({
    message: changeConstantValue(notEmpty, { item: 'Confirm Password' }),
  })
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
