import { authApi } from "../utils/api";
import { get, post, put } from "../utils/ApiService";
const AuthService = {
  getAccountInfo: async () => {
    const { data } = await authApi.get("/connect/userinfo");
    return data;
  },
  getMemberInfo: async () => {
    return await get(`api/v1/customer`);
  },
  getWeb3MemberInfo: async (address: any) => {
    return await get(`api/v1/Customer/customerCreation/${address}`);

  },
  loginLog: async (info: any) => {
    return post(`api/v1/Common/Login`, info);
  },
  logOutLog: async (info: any) => {
    return post(`api/v1/Common/Logout`, info);
  },
  getCustomerProfile: async (accountType: any) => {
    return await get(`api/v1/customers/profile/${accountType}`);
  },
  getMenuItems: async () => {
    return await get(`api/v1/security/menu`);
  },
  updateBusinessLogo: async (info: any) => {
    return put(`api/business/logo`, info);
  },
  getBusinessWebUrl: async (application: any) => {
    return get(`api/v1/m/business/sdklinks?applicantId=${application}`);
  }
};

export default AuthService;
