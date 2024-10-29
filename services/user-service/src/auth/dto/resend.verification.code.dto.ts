import { IsEmail, IsNotEmpty } from 'class-validator';
import { validations } from '../../constants';
import changeConstantValue from '../../helpers/replaceConstantValue';

const { notEmpty, invalidItem } = validations;
export default class SignInDto {
  @IsNotEmpty({ message: changeConstantValue(notEmpty, { item: 'Email' }) })
  @IsEmail({}, { message: changeConstantValue(invalidItem, { item: 'Email' }) })
  email: string;
}
