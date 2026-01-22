

import { get, put, filepost, fileput, post, bankget, cardsGet, rewardsget, rewardspost } from "../utils/ApiService";
const ProfileService = {

  uploadProfile: async (imgdata: any) => {
    return await filepost(`api/v1/uploadprofile`, imgdata);
  },
  profileAvathar: async (imgdata: any) => {
    try {
      const data: any = await fileput(`api/v1/Customer/Avatar`, imgdata);
      return data;
    } catch (error: any) {
      // crashlytics().recordError(error);
    }
  },
  partnerRefferel: async (id: any) => {
    try {
      const data: any = await get(`/api/v1/Security/getReferralDetails/customer/${id}`);
      return data;
    } catch (error: any) {
      // crashlytics().recordError(error);
    }
  },
  updateSecurity: async (security: any) => {
    try {
      const data: any = await put(`/api/v1/security/verifications`, security);

      return data;
    } catch (error: any) {
      // crashlytics().recordError(error);
    }
  },
  update2faSecurity: async (security: any) => {
    try {
      const data: any = await put(`/api/v1/security/2fa`, security);

      return data;
    } catch (error: any) {
      // crashlytics().recordError(error);
    }
  },
  verificationFields: async () => {
    try {
      const data: any = await get(`/api/v1/security/settings`);
      return data;
    } catch (error: any) {
      // crashlytics().recordError(error);
    }
  },
  ResetPassword: async (customerId: any) => {
    try {
      const data: any = await get(`/api/v1/Security/ResetPWD/${customerId}`);
      return data;
    } catch (error: any) {
      // crashlytics().recordError(error);
    }
  },
  kycInfo: async (id: any) => {
    try {
      const data: any = await get(`/api/v1/Common/ProfileView/${id}`);
      return data;
    } catch (error: any) {
      // crashlytics().recordError(error);
    }
  },
  changePassword: async (pass: any) => {
    try {
      const data: any = await put(`api/v1/Customer/ChangePWD`, pass);
      return data;
    } catch (error: any) {
      // crashlytics().recordError(error);
    }
  },
  uploadFile: async (imgdata: any) => {
    return filepost(`api/v1/uploadfile`, imgdata);
  }, 
  getprofileEditLookups: async () => {
    return get(`api/v1/kyc/lookup`);
  },
  getKybDocuments: async () => {
    return get(`api/v1/Common/KybDocumentTypesLu`);
  },
  postKycPersonalInfo: async (obj: any) => {
    return post(`api/v1/kyc`, obj);
  },
  putKycPersonalInfo: async (obj: any) => {
    return post(`api/v1/kyc`, obj);
  },
  postKycProfile: async (obj: any) => {
    return post(`api/v1/kyc`, obj);
  },
    postBankKycProfile: async (obj: any) => {
    return post(`api/v1/Customer/Address`, obj);
  },
  updateKycProfile: async (obj: any) => {
    return put(`api/v1/kyc`, obj);
  },
  identityDocumentsProfile: async (obj: any) => {
    return post(`api/v1/kyc/documents`, obj);
  },
  updateIdentityDocumentsProfile: async (obj: any) => {
    return put(`api/v1/kyc/documents`, obj);
  },
  identityDocumentsDetails: async () => {
    return get(`api/v1/kyc/documents`);
  },
  identityPersionalDetails: async () => {
    return get(`api/v1/kyc`);
  },
  uploadSingnitureFile: async (body: any) => {
    return post(`BytesToImageConveter`, body);
  },
  postKybComnyData: async (obj: any) => {
    return post(`api/v1/kyb`, obj);
  },
  updateKybComnyData: async (obj: any) => {
    return put(`api/v1/kyb/company`, obj);
  },
  kybUbosList: async () => {
    return get(`api/v1/kyb/ubos`);
  },
  kybDirectorsList: async () => {
    return get(`api/v1/kyb/directors`);
  },
  postUbosDetails: async (obj: any) => {
    return post(`api/v1/kyb/ubos`, obj);
  },
  postDirectorsDetails: async (obj: any) => {
    return post(`api/v1/kyb/directors`, obj);
  },
  postShareHoldersDetails: async (obj: any) => {
    return post(`api/v1/kyb/shareholder`, obj);
  },
  updateShareHoldersDetails: async (obj: any) => {
    return put(`api/v1/kyb/shareholder`, obj);
  },
postRepresentiveDetails: async (obj: any) => {
    return post(`api/v1/kyb/representative`, obj);
  },
  updateRepresentiveDetails: async (obj: any) => {
    return put(`api/v1/kyb/representative`, obj);
  },
    kybkycInfoDetails: async () => {
    return get(`api/v1/kyc/details`);
    },
  kycInfoDetails: async (programId:string) => {
    return bankget(`api/v1/banks/${programId}/kycrequirements`);
  },
    kycAddresses: async () => {
    return cardsGet(`api/v1/addresses`);
  },
  kybInfoDetails: async () => {
    return get(`api/v1/kyb/company`);
  },
  KybCompanyDetails: async () => {
    return get(`api/v1/kyb`);
  },
  updateKybUbos: async (obj: any) => {
    return put(`api/v1/kyb/ubos`, obj);
  },
  updateKybDirectrs: async (obj: any) => {
    return put(`api/v1/kyb/directors`, obj);
  },
  updateKycStatus: async (obj: any) => {
    return put(`api/v1/kyc/state`, obj);
  },
  getDocumentTypes: async () => {
    return get(`api/v1/kyc/lookup`);
  },
  getReferralKPis: async () => {
    return get(`api/v1/referrals/kpi`);
  },
  getDetailReferralKPis: async (id: string) => {
    return get(`api/v1/referrers/${id}/kpi`);
  },
  getCasesKPis: async () => {
    return get(`api/v1/Cases/kpi`);
  },
  getReferralsList: async (type: any, search: any,  page: any, pageSize: any) => {
    let url = `api/v1/referrals?status=${type}&search=${search}&startDate=${""}&endDate=${""}&page=${page}&pageSize=${pageSize}`;
    return get(url);
  },
  getStatusLu: async () => {
    return get(`api/v1/referrals/lookup`);
  },
  referralDetails: async (refID: any) => {
    return get(`api/v1/referrals/${refID}`);
  },
  referralTransactions: async (refID: any, page: any, pageSize: any) => {
    return get(`api/v1/referral/customer/${refID}/transactions/?page=${page}&pageSize=${pageSize}`);
  },
  getCasesList: async (page: any, pageSize: any) => {
    return get(`api/v1/cases/?page=${page}&pageSize=${pageSize}`);
  },
  EnableGoogleAuth: async (body:any) => {
    return put(`api/v1/settings/2fa/google/enable`,body)

  },
  kycKybStatus: async (custamerId: any) => {
    return get(`api/v1/Common/M/KycState/${custamerId}`);
  },
  resetPassword: async () => {
    return post(`api/v1/security/password/reset`);

  },
  verifyAuthenticatorCode:async (body:any)=>{
    return put(`/api/v1/VerifyGoogleAuthenticator`,body);
  },
   deleteAccount:async (body:any)=>{
    return put(`/api/v1/customers/accounts/close`,body);
  },
  getCaseDetails:async(id:any)=>{
    return get(`api/v1/cases/${id}`);
  },
  getCaseDetailsMessages:async(id:any)=>{
    return get(`api/v1/cases/${id}/messages`);
  },
   getCasesUploadFiles:async(id:any)=>{
    return get(`api/v1/filePreview/${id}`);
  },
   sendCaseReply: async (id:any,body:any) => {
    return post(`api/v1/case/${id}/message`,body);
  },
postCasesUploadFiles:async(body:any)=>{
    return filepost(`api/v1/casesuploadfile`,body);
  },
  getAlertCasess:async()=>{
    return get(`api/v1/cases/alerts`);
  },
   getRewardsData:async(id:any)=>{
    return rewardsget(`loyalty/dashboard/${id}`);
  },
  getAvailableComplteRewardsData:async(id:any)=>{
    return rewardsget(`loyalty/quests/${id}`);
  },
  getActiveRewardsData:async(action:string,id:string)=>{
    return rewardsget(`loyalty/quests/${action}/${id}`);
  },
 getMysteryBoxData:async(id:string)=>{
    return rewardsget(`loyalty/mystery-boxes/${id}`);
  },
  postQuestAction:async(qyuestId:string,id:string)=>{
    return rewardspost(`loyalty/quests/${qyuestId}/join/${id}`,{});
  },
  postOpenBoxAction:async(qyuestId:string,id:string)=>{
    return rewardspost(`loyalty/mystery-boxes/${qyuestId}/open/${id}`,{});
  },
  getYourRewardsData:async(id:string)=>{
    return rewardsget(`loyalty/reward-rules/${id}`);
  },
  getRedeemData:async()=>{
    return rewardsget(`loyalty/redemption/config`);
  },
  postReddemWallet: async (body: any) => {
    return rewardspost(`loyalty/mystery-boxes/open/`, body);
  },
  rewardsTransactions: async (Id: any, sorceType: any, page: any, pageSize: any) => {
    return rewardsget(`loyalty/ledger/${Id}?sourceType=${sorceType}&limit=${pageSize}&offset=${page}`);
  },
  postPushNotification: async (body: any) => {
    return post(`api/v1/M/token`, body);
  },
  deletePushNotifications: async (body: any) => {
    return post(`api/v1/M/deletetoken`,body);
  },
   signin: async (body: any) => {
    return post(`api/v1/Token`, body);
  },
  forgotPassword: async (body: any) => {
    return post(`api/v1/Forgotpassword`, body);
  },
  signup: async (body: any) => {
    return post(`api/v1/Register`, body);
  },

}

export default ProfileService;