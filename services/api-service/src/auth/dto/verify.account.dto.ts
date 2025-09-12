import { IsNotEmpty } from 'class-validator';
import { validations } from '../../constants';
import changeConstantValue from '../../helpers/replaceConstantValue';

const { notEmpty } = validations;
export default class VerifyAccountDto {
  @IsNotEmpty({ message: changeConstantValue(notEmpty, { item: 'Token' }) })
  token: string;
}
