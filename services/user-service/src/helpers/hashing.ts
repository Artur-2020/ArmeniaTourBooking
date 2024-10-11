import * as bcrypt from 'bcrypt';
export async function hash(text: string): Promise<string> {
  const salt = +process.env.SALT;
  return bcrypt.hash(text, salt);
}

export async function compare(text: string, hash: string): Promise<boolean> {
  return bcrypt.compare(text, hash);
}
