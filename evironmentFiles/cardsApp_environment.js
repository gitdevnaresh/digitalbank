
export const getAppName = () => {
    const appName = "rapidz"
    return appName;
};
const ENV = {
    local: {
        reduxEncryptKey: 'devsecretkey12345678901234567890',
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
        reduxEncryptKey: 'devsecretkey12345678901234567890',
        oAuthConfig: {
            issuer: 'arthapay.us.auth0.com',
            clientId: '6TIKyJlvNgxyMkabmiHr1qobRzPxvveJ',
            audience: 'https://arthapayApi.net',
            scope: 'openid profile email enroll'
        },
        apiUrls: {
            apiUrl: 'https://arthapayapi.artha.work/',
            uploadUrl: 'https://arthapayapi.artha.work/',
            marketBaseUrl: 'https://api.coingecko.com',
        }
    },
    dev: {
        reduxEncryptKey: 'devsecretkey12345678901234567890',
        oAuthConfig: {
            issuer: 'yellowblockllp.us.auth0.com',
            clientId: 'FupavKI3iG7WIWyOwzJkWbaajaUvqsyn',
            audience: 'https://devarthapayApi.net',
            scope: 'openid profile email enroll'
        },
        apiUrls: {
            apiUrl: 'https://arthadevcore.artha.work/',
            uploadUrl: 'https://arthadevcore.artha.work/',
            marketBaseUrl: 'https://api.coingecko.com',
            cardsUrl: 'https://arthadevcards.artha.work/',
        },
    },
};
export const getAllEnvData = envName => {
    return ENV['dev'];
};
export const getEnvVars = () => {
    return __DEV__ ? ENV.local : ENV.prod;
};


