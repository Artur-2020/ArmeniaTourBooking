export enum VerificationEntityTypeEnum {
  RESETPASSWORD = 'resetpassword',
  VERIFY_ACCOUNT = 'verification',
  ONE_TIME_SIGN_IN = 'onetimesignin',
}

export const VerificationEntityType = {
  resetpassword: {
    blockedInValue: 'resetPasswordBlockMinutes',
    value: 'resetpassword',
    expiredInValue: 'resetPasswordExpiredIn',
    count: 5,
  },
  verification: {
    blockedInValue: 'accountVerificationBlockMinutes',
    value: 'verification',
    count: 3,
    expiredInValue: 'accountVerificationExpiredIn',
  },
  onetimesignin: {
    value: 'onetimesignin',
    count: 5,
    blockedInValue: 'oneTimeSignInBlockMinutes',
    expiredInValue: 'oneTimeSignInExpiredIn',
  },
};
