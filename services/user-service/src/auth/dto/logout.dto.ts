import { IsNotEmpty, IsString } from 'class-validator';
import { validations } from '../../constants';
import changeConstantValue from '../../helpers/replaceConstantValue';

const { notEmpty } = validations;

export default class LogoutDto {
  @IsNotEmpty({ message: changeConstantValue(notEmpty, { item: 'Refresh token' }) })
  @IsString({ message: 'Refresh token must be a string' })
  refreshToken: string;
} 