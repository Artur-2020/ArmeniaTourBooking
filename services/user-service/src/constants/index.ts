// constants.ts
export const validations = {
  invalidItem: 'The {item} is invalid',
  notEmpty: 'The {item} should not be empty',
  isAlpha: 'The {item} field should only contain a letter',
  lengthMsg:
    'The {item} field must contain at least {min} symbols and a maximum of {max}',
  passwordMsg:
    'Password must include at least one letter, one number, and one special character',
  passwordDoesNotMatch: 'The password does not match',
  incorrectObjectId: 'The {item} is incorrect Object Id',
};

export const services = {
  verificationEmailText:
    '`Please verify your account \n Here your code {code} \n The code will be expired after {minutes} minutes',
  accountNotActive: 'The user account is not active',
  accountIsActive: 'The user account is already active',
  userExistsByEmail: 'User with the email {email} already exists',
  InvalidDataForLogin: 'Email or password is incorrect',
  notFound: '{item} is not found',
  codeExpiredAt:
    'Your {type} code is no longer valid. Please generate a new code and try again.',
  maximumAttemptsCountReached:
    'Maximum {type} attempts reached. Please request a new {type} code after {minutes} minutes.',
  resendBlocked:
    'Your {type} attempts are temporarily locked due to too many failed tries. You can reset your code and try again after {minutes} minutes.',
};
