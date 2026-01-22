
import axios from 'axios';
import { getAllEnvData } from '../../Environment';
import { get,post } from '../utils/ApiService';

const OnBoardingService = {
    resendVerifyMail: async () => {
        const data = await get(`api/v1/Customer/VerifyEmail`)
        return data;
    },
    saveUserInfo: async (info:any,accType?:string) => {
        const data = await post(`api/v1/customers/register/${accType}`,info)
        return data;
    },
    verifyMobileCode: async (otp:any,CustomerId:string) => {
        const data = await get(`api/v1/Security/PhoneVerification/${CustomerId}/${otp}`,)
        return data;
    },
    sendMobileCode: async () => {
        const data = await post(`api/v1/confirmations/phone/send`,null)

        return data;
    },
    neoMobileVersioncheck: async () => {
        const data = await get(`api/v1/Common/AppVersions/NeoMobileBank`)
        return data;
    },
    sumsubToken: async (userid:string) => {
        const data = await get(`api/v1/Sumsub/AccessToken1?applicantId=${userid}&levelName=basic-kyc`)
        return data;
    },
    getOTP: async (CustomerId:any, type:any) => {
        const  data  = await get(`api/v1/Security/SendOTP/${CustomerId}/${type}`);
        return data;
      },
      getOTPVerification: async (info:any) => {
        const data=await post(`api/v1/confirmations/phone/verify`,info);
        return data;
      },
    getEmailOTP: async (type:any) => {
        const  data  = await get(`api/v1/ExchangeWallet/SendEmailOTP/${type}`);
        return data;
      },
      sendEmailOTP: async () => {
        const data = await post(`api/v1/confirmations/email/send`, null);
        return data;
      },

      getEmailOTPVerification: async (code:any) => {
        const  data  = await post(`api/v1/confirmations/email/verify`, code);
        return data;
      },
      v3resendVerifyMail: async (body:any) => {
        const data = await post(`api/v1/verifications/email/resend`,body)
        return data;
    },
  getMfaEnrollmentData: async (mfaToken: string) => {
    const { oAuthConfig } = getAllEnvData();
    const body = { "authenticator_types": ["otp"] };
    try {
      const response = await axios.post(
        `https://${oAuthConfig?.issuer}/mfa/associate`,
        body,
        {
          headers: {
            Authorization: `Bearer ${mfaToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return {
        success: true,
        barcodeUri: response.data // Extract barcode_uri from the API response
      };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error_description || error.message || 'Failed to get MFA enrollment data' };
    }
  },
   getMfaEnrollmentApiCall: async (bady:any) => {
        const data = await post(`api/v1/mfa/associate`, bady);
        return data;
      },
  loginWithMFA: async (
    mfaToken: string,
    otpCode: string
  ) => {
    return await post(`api/v1/mfa/Token`, {
      mfa_token: mfaToken,
      otp: otpCode,
    });
  },
    sumsubAccessToken: async (userid:string,levelName:string) => {
const  data=await get(`api/AccessToken1?applicantId=${userid}&levelName=${levelName}`);
return data;
    },
}
export default OnBoardingService;




















