export interface TwoFactorStatus {
  isMfaEnabled: boolean;
  hasAuthenticator: boolean;
  recoveryCodesLeft: number;
}

export interface TwoFactorSetup {
  sharedKey: string;
  authenticatorUri: string;
}

export interface TwoFactorVerifyResult {
  message: string;
  recoveryCodes: string[];
}
