import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';
import { validations } from '../../constants';
import changeConstantValue from '../../helpers/replaceConstantValue';

const { notEmpty, lengthMsg, invalidItem, passwordMsg } = validations;
export default class SignInDto {
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
}
