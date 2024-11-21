import { IsNotEmpty } from 'class-validator';
import { validations } from '../../constants';
import changeConstantValue from '../../helpers/replaceConstantValue';

const { notEmpty } = validations;
export default class VerifyOptDto {
  @IsNotEmpty({ message: changeConstantValue(notEmpty, { item: 'Code' }) })
  code: string;
  @IsNotEmpty({ message: changeConstantValue(notEmpty, { item: 'Email' }) })
  email: string;
}
