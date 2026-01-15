export enum VerificationEntityTypeEnum {
  RESETPASSWORD = 'resetpassword',
  VERIFY_ACCOUNT = 'verification',
  ONE_TIME_SIGN_IN = 'onetimesignin',
}

export const VerificationEntityType = {
  resetpassword: {
    blockedInValue: 'resetPasswordBlockMinutes',
    value: VerificationEntityTypeEnum.RESETPASSWORD,
    expiredInValue: 'resetPasswordExpiredIn',
    count: 3,
  },
  verification: {
    blockedInValue: 'accountVerificationBlockMinutes',
    value: VerificationEntityTypeEnum.VERIFY_ACCOUNT,
    count: 3,
    expiredInValue: 'accountVerificationExpiredIn',
  },
  onetimesignin: {
    value: VerificationEntityTypeEnum.ONE_TIME_SIGN_IN,
    count: 3,
    blockedInValue: 'oneTimeSignInBlockMinutes',
    expiredInValue: 'oneTimeSignInExpiredIn',
  },
};
