import { ApiProperty } from '@nestjs/swagger';

export class ErrorDetailDto {
  @ApiProperty({ description: 'Field with validation error', example: 'email' })
  field: string;

  @ApiProperty({
    description: 'List of validation errors for the field',
    example: ['The Email is invalid', 'The Email should not be empty'],
  })
  errors: string[];
}

export class ErrorResponseDto {
  @ApiProperty({ description: 'Indicates if there is an error', example: true })
  error: boolean;

  @ApiProperty({ description: 'HTTP status code', example: 400 })
  status: number;

  @ApiProperty({ description: 'Error message', example: 'Validation failed' })
  message: string;

  @ApiProperty({
    description: 'Detailed error information',
    type: [ErrorDetailDto],
    required: false,
  })
  details?: ErrorDetailDto[];
}

export class SuccessResponseDto<T> {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({ description: 'HTTP status code', example: 200 })
  status: number;

  @ApiProperty({
    description: 'Success message',
    example: 'Operation successful',
  })
  message: string;

  @ApiProperty({
    description: 'Data returned by the operation',
    required: false,
  })
  data?: T;
}
