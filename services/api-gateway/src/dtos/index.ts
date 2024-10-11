export interface SignUpDTO extends SignInDTO {
  role: string;
  confirm_password: string;
}

export interface SignInDTO {
  email: string;
  password: string;
}
