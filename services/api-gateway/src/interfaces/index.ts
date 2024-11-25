export interface BasicReturnType<T> {
  success?: boolean;
  error?: boolean;
  data?: T;
  message?: string;
}
export interface signUpReturn extends signInReturn {
  user: IUser;
}

export interface signInReturn {
  accessToken: string;
  refreshToken: string;
}

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

export interface generateQrReturn {
  code: string;
}
