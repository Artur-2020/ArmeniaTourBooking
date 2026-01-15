import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { validations } from '../../constants';
import changeConstantValue from '../../helpers/replaceConstantValue';

const { notEmpty } = validations;
export default class VerifyOneTimeSignInDto {
  @ApiProperty({
    description: 'One-time sign-in token for passwordless authentication',
    example: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
    type: 'string'
  })
  @IsNotEmpty({ message: changeConstantValue(notEmpty, { item: 'Token' }) })
  token: string;
}
