import { ApiProperty } from '@nestjs/swagger';

export class SignInDTO {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user',
  })
  email: string;
  @ApiProperty({
    example: 'password',
    description: 'The password of the user',
  })
  password: string;
}

export class SignUpDTO extends SignInDTO {
  @ApiProperty({
    example: 'admin, user, manager',
    description: 'The role of the user',
  })
  role: string;
  @ApiProperty({
    example: 'password',
    description: 'Confirmation of the password',
  })
  confirm_password: string;
}

export class CreatePasswordDTO extends SignInDTO {
  @ApiProperty({
    example: 'password',
    description: 'Confirmation of the password',
  })
  confirm_password: string;
}

export class VerifyOtpDTO {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user',
  })
  email: string;

  @ApiProperty({
    example: '513194',
    description: 'The code for qr code auth from authenticator app',
  })
  code: string;
}

export class TokenDto {
  @ApiProperty({
    description: 'The code from email',
    example: 'abc123',
  })
  token: string;
}

export class EmailDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user',
  })
  email: string;
}
