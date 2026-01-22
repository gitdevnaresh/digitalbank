
export const getAppName = () => {
    const appName = "mlm"
    return appName;
};
const ENV = {
    dev: {
        oAuthConfig: {
            issuer: "https://devidentity.samratsgroup.com",
            clientId: "SamratMobile",
            audience:"",
            redirect_uri:'com.samrat.shop:/oauthredirect',
            scope:  ["openid", "profile",'email', 'offline_access']
        },
        apiUrls: {
            apiUrl: 'https://devapi.samratsgroup.com/',
            uploadUrl: 'https://devapi.samratsgroup.com/',
        }
    },
    prod: {
        oAuthConfig: {
            issuer: "https://identity.samratsgroup.com",
            clientId: "SamratMobile",
            audience:"",
            redirect_uri:'com.samrat.shop:/oauthredirect',
            scope:  ["openid", "profile",'email', 'offline_access']
        },
        apiUrls: {
            apiUrl: 'https://api.samratsgroup.com/',
            uploadUrl: 'https://api.samratsgroup.com/',
        }
    },
};
export const getAllEnvData = envName => {
    return ENV['dev'];
};
export const getEnvVars = () => {
    return __DEV__ ? ENV.local : ENV.prod;
};


