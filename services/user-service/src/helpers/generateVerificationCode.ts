/**
 * Get random code for using in the verification operations (activate account)
 * Reset password, one time sign in
 */
export function generateVerificationCode(): string {
  const code = Math.floor(10000000 + Math.random() * 90000000);
  return code.toString();
}
