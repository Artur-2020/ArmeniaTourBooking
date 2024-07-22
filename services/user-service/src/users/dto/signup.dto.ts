// dto/create-user.dto.ts
export interface SignUpDto {
  email: string;
  role: string;
  password: string;
}

// interfaces/user.interface.ts
export interface User {
  id: string;
  name: string;
  email: string;
}
