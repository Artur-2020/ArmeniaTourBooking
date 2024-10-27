import { User } from '../../users/entities/user.entity';

export interface jwtPayload {
  userId: string;
  role: string;
}
export interface signUpReturn extends signInReturn {
  user: User;
}

export interface signInReturn {
  accessToken: string;
  refreshToken: string;
}

export interface SendVerificationData {
  to: string;
  subject: string;
  text: string;
}
