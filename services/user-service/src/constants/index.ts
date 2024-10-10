export const constants = {
  permissionDenied: 'Permission Denied',
  notAuthorized: 'Not Authorized',
  somethingWrong: 'Something went wrong',
  validations: {
    invalidItem: 'The {item} is invalid',
    notEmpty: 'The {item} should not be empty',
    isAlpha: 'The {item} field should only contain a letter',
    lengthMsg:
      'The  {item} field  must contain at least {min} symbols and a maximum of {max}',
    passwordMsg:
      'Password must include at least one letter, one number, and one special character',
    passwordDoesNotMatch: 'The password does not match',
    incorrectObjectId: 'The {item} is incorrect Object Id',
  },
  services: {
    userExistsByEmail: 'User with the email {email} already exists',
    incorrectDataForLogin: 'The data is incorrectly filled in',
    notFound: '{item} is not found',
  },
};
