import * as bcrypt from 'bcrypt';

/**
 * Hash text
 * @param text
 */
export async function hash(text: string): Promise<string> {
  const salt = +process.env.SALT;
  return bcrypt.hash(text, salt);
}

/**
 * Compare text with hashed text (sign in)
 * @param text
 * @param hash
 */
export async function compare(text: string, hash: string): Promise<boolean> {
  return bcrypt.compare(text, hash);
}
