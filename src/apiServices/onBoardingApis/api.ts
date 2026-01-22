import { get } from "../api/apiServices";



export const AuthService = {
    getMemberInfo: async () => {
        return await get(`api/v1/Registration/App/Exchange`);
      },
      getAccountInfo: async () => {
        return await get("/connect/userinfo");
      },
    }