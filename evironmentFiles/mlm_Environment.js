
export const getAppName = () => {
    const appName = "mlm"
    return appName;
};
const ENV = {
    local: {
        oAuthConfig: {
            issuer: 'neodigitalbank.us.auth0.com',
            clientId: '7cpZsKwJutx5HU5lMvqib4eqvYCK0WtO',
            audience: 'https://ExchangaApi.net',
            scope: 'openid profile email enroll'
        },
        apiUrls: {
            uploadUrl: 'https://neocardsapi.exchangapay.com/',
            apiUrl: 'https://neocardsapi.exchangapay.com/',
            marketBaseUrl: 'https://api.coingecko.com',
        }
    },
    tst: {
        oAuthConfig: {
            issuer: 'arthapay.us.auth0.com',
            clientId: '6TIKyJlvNgxyMkabmiHr1qobRzPxvveJ',
            audience: 'https://arthapayApi.net',
            scope: 'openid profile email enroll'
        },
        apiUrls: {
            apiUrl: 'https://tstaffiliateapi.artha.work/',
            uploadUrl: 'https://tstaffiliateapi.artha.work/',
            marketBaseUrl: 'https://api.coingecko.com',
        }
    },
    dev: {
        oAuthConfig: {
            issuer: 'yellowblockllp.us.auth0.com',
            clientId: 'FupavKI3iG7WIWyOwzJkWbaajaUvqsyn',
            audience: 'https://devarthapayApi.net',
            scope: 'openid profile email enroll'
        },
        apiUrls: {
            apiUrl: 'https://devaffiliateapi.artha.work/',
            uploadUrl: 'https://devaffiliateapi.artha.work/',
            marketBaseUrl: 'https://api.coingecko.com',
        }
    },
};
export const getAllEnvData = envName => {
    return ENV['dev'];
};
export const getEnvVars = () => {
    return __DEV__ ? ENV.local : ENV.prod;
};


