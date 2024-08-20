import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsNotEmpty({ message: 'Role should not be empty' })
  role: string;

  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string;
}

// interfaces/user.interface.ts
export interface User {
  id: string;
  name: string;
  email: string;
}
