import * as bcrypt from 'bcrypt';
export default async function hash(text: string): Promise<string> {
  const salt = +process.env.SALT;
  return bcrypt.hash(text, salt);
}
