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
  userExistsByEmail: 'User with the email {email} already exists',
  InvalidDataForLogin: 'Email or password is incorrect',
  notFound: '{item} is not found',
};

// You can export other parts (like permissionDenied, etc.) similarly.
