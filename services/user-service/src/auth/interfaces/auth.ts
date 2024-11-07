import { User } from '../../users/entities';

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

export interface IVerification {
  email: string;
  token: string;
  type: string;
  expiredAt: Date;
}

export interface BasicReturnType<T> {
  success?: boolean;
  error?: boolean;
  data?: T;
  message?: string;
}

export interface ResendCodeDTO {
  email: string;
  type: string;
}
