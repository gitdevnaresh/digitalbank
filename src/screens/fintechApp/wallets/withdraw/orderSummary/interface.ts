export interface CryptoWithdrawSummaryProps {
    data: {
      amount: number;
      addressBookId: number;
      coin: string;
      feeCommission: number;
      networkId: string;
      network: string;
      address: string;
      customerWalletId: number;
      beforeDiscountCommission: number;
      requestedAmount: number;
      formValues?:any;
      selectedPayee?:any;
      displayAsset?:any;
    };
  }
  
  export interface VerificationFields {
    isPhoneVerified?: boolean;
    isEmailVerification?: boolean;
    isTwoFactorEnabled?: boolean;
  }
  
  export interface UserDetails {
    id: number;
    userName: string;
    phoneNumber?: string;
    phoneNo?: string;
  }
  
  export interface CryptoWithdrawSummaryState {
    otp: string;
    isOTP: string;
    emailOtp: string;
    isEmailOTP: boolean;
    isOTPVerified: boolean;
    isEmailOTPVerified: boolean;
    errormsg: string;
    btnDisabled: boolean;
    btnDtlLoading: boolean;
    showOtpError: boolean;
    showEmailOtpError: boolean;
    verficationFeild: VerificationFields;
    isAuthenticationOTP:any;
    isAuthenticationOTPVerified:any
    showAuthenticationOtpError: boolean;
  }
  export interface CryptoWithdrawalObject {
    amount: number;
    payeeId: string| number;
    cryptorWalletId: string;
  }
  