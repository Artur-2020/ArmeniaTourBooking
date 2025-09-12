import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { validations } from '../../constants';
import changeConstantValue from '../../helpers/replaceConstantValue';

const { notEmpty } = validations;
export default class VerifyAccountDto {
  @ApiProperty({
    description: 'Verification token sent to user email for account verification',
    example: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
    type: 'string'
  })
  @IsNotEmpty({ message: changeConstantValue(notEmpty, { item: 'Token' }) })
  token: string;
}
