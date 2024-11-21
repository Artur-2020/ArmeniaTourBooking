export interface SignUpDTO extends SignInDTO {
  role: string;
  confirm_password: string;
}

export interface SignInDTO {
  email: string;
  password: string;
}

export interface CreatePasswordDTO extends SignInDTO {
  confirm_password: string;
}

export interface VerifyOtpDTO {
  email: string;
  code: string;
}
