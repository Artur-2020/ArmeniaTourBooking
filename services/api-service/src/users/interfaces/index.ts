export interface IUser {
  id: string;
  email: string;
  role: string;
  activatedAt: Date;
  refreshToken: string;
  settings: object;
  createdAt: Date;
  updatedAt: Date;
}
