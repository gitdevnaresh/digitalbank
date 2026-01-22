
export const getAppName = () => {
    const appName = "arthaPay"
    return appName;
};
const TAB_ICONS = {
    ACTIVE: {
        Home: 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/nav_arthalogo.svg',
        Vaults: 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/nav_activevaults_icon.svg',
        Exchange: 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/nav_activeexchange.svg',
        Cards: 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/nav_activecards.svg',
        Bank: 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/nav_activebank.svg',
        Payments: 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/nav_activepayments.svg',
    },
    INACTIVE: {
        Home: 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/nav_arthalogo_inactive.svg',
        Vaults: 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/nav_vaults_icon.svg',
        Exchange: 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/nav_inactiveexchange.svg',
        Cards: 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/nav_inactivecards.svg',
        Bank: 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/nav_inactivebank.svg',
        Payments: 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/nav_inactivepayments.svg',
    }
}

const CONFIGURATION = {
    TABS: [
        { title: "Exchange", componentName: "_exchange", isDisplay: true, activeIcon: TAB_ICONS.ACTIVE.Exchange, inActiveTabsIcons: TAB_ICONS.INACTIVE.Exchange, iconWidth: 22, iconHeight: 20 },
        { title: "Cards", componentName: "_cards", isDisplay: true, activeIcon: TAB_ICONS.ACTIVE.Cards, inActiveTabsIcons: TAB_ICONS.INACTIVE.Cards, iconWidth: 20, iconHeight: 18 },
        { title: "Home", componentName: "_home", isDisplay: true, activeIcon: TAB_ICONS.ACTIVE.Home, inActiveTabsIcons: TAB_ICONS.INACTIVE.Home, iconWidth: 22, iconHeight: 24 },
        { title: "Payments", componentName: "_payment", isDisplay: true, activeIcon: TAB_ICONS.ACTIVE.Payments, inActiveTabsIcons: TAB_ICONS.INACTIVE.Payments, iconWidth: 20, iconHeight: 19 },
        { title: "Bank", componentName: "_bank", isDisplay: true, activeIcon: TAB_ICONS.ACTIVE.Bank, inActiveTabsIcons: TAB_ICONS.INACTIVE.Bank, iconWidth: 20, iconHeight: 17 },
        { title: "Vaults", componentName: "_crypto", isDisplay: false, activeIcon: TAB_ICONS.ACTIVE.Vaults, inActiveTabsIcons: TAB_ICONS.INACTIVE.Vaults, iconWidth: 22, iconHeight: 20 },
    ],
    CRYPTO: {
        QUCIKLINKS: {
            Buy: false,
            Sell: true,
            Withdraw: true,
            Swap: false,
            Deposit: true,
            AddVault: false,
            BuyCoupon: true,
        }
    },
    EXCHANGE: {
        QUCIKLINKS: {
            Buy: true,
            Sell: true,
            Withdraw: false,
            Swap: false,
            Deposit: false,
        }
    },
    HOME: {
        QUCIKLINKS: {
            Crypto: true,
            Cards: true,
            Bank: false,
            Payments: true
        }
    },
    CARDS: {
        QUCIKLINKS: {
            MyCards: true,
            AssignCards: true,
            ApplyCards: true,
            BindCards: true,
        }
    },
    ADDS_AND_GRAPG_CONFIGURATION: {
        ADDS: {
            Home: false,
            Bank: false,
            Cards: false,
            Crypto: false,
            Payments: false,
        },
        GRAPH: {
            Home: false,
            Bank: false,
            Cards: true,
            Crypto: true,
            Payments: true,
        },
        KPIS: {
            Home: true,
            Bank: true,
            Cards: false,
            Crypto: true,
            Payments: true,
        },
    },
    PAYMENTS: {
        QUICK_LINKS: {
            AddVault: false,
            PayIn: true,
            PayOut: true,
            Transactions: true,

        },
        TEMPLATES: {
            StaticViewTemplate: false,
            StaticPreviewTemplate: false,
            InvoiceViewTemplate: false,
            InvoicePreviewTemplate: false,
        },
    },
    BANK: {
        QUICK_LINKS: {
            Diposit: true,
            Withdraw: true,
            Exchange_transfer: false,
        }
    },
    SUPPORT: {
        SUPPORT_EMAIL: "arthapaySupport@gmail.com"
    }
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
    prod: {
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
    tst: {
        oAuthConfig: {
            issuer: 'yellowblockllp.us.auth0.com',
            clientId: 'FupavKI3iG7WIWyOwzJkWbaajaUvqsyn',
            audience: 'https://devarthapayApi.net',
            scope: 'openid profile email enroll'
        },
        apiUrls: {
            apiUrl: 'https://devarthapayapi.artha.work/',
            uploadUrl: 'https://devarthapayapi.artha.work/',
            marketBaseUrl: 'https://api.coingecko.com',
        }
    },
};
export const getAllEnvData = envName => {
    return ENV['prod'];
};
export const getAppConfig = type => {
    return CONFIGURATION[type];
};
export const getEnvVars = () => {
    return __DEV__ ? ENV.local : ENV.prod;
};


