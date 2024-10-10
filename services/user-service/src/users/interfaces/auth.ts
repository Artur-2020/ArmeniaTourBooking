import { User } from '../entities/user.entity';

export interface jwtPayload {
  userId: string;
  role: string;
}
export interface signupReturn {
  user: User;
  accessToken: string;
  refreshToken: string;
}
