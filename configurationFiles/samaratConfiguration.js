const ICONSURLS = {
    HOME: 'https://storageaccountdott.blob.core.windows.net/mlmimages/Home.svg',
    ORDERS: 'https://storageaccountdott.blob.core.windows.net/mlmimages/cart.svg',
    PRODUCTS: 'https://storageaccountdott.blob.core.windows.net/mlmimages/product.svg',
    WALLETS: 'https://storageaccountdott.blob.core.windows.net/mlmimages/Wallets.svg',
    CARDS: 'https://storageaccountdott.blob.core.windows.net/mlmimages/Wallets.svg'
}




const CONFIGURATION = {
TABS: [
    { title: "GLOBAL_CONSTANTS.HOME", componentName: "_home", isDisplay: true,  iconWidth: 22, iconHeight: 20,icon:ICONSURLS.HOME ,isActive:true},
    { title: "GLOBAL_CONSTANTS.PACKAGES", componentName: "_packages", isDisplay: false, iconWidth: 20, iconHeight: 18,icon:ICONSURLS.PRODUCTS ,isActive:false},
    { title: "GLOBAL_CONSTANTS.SHOP", componentName: "_products", isDisplay: true, iconWidth: 20, iconHeight: 18,icon:ICONSURLS.PRODUCTS ,isActive:false},
    { title: "GLOBAL_CONSTANTS.WALLETS", componentName: "_wallets", isDisplay: false,  iconWidth: 22, iconHeight: 24,icon:ICONSURLS.WALLETS ,isActive:false},
    { title: "GLOBAL_CONSTANTS.WALLETS", componentName: "_samratWallets", isDisplay: true,  iconWidth: 22, iconHeight: 24,icon:ICONSURLS.WALLETS ,isActive:false},
    { title: "GLOBAL_CONSTANTS.ORDERS", componentName: "_orders", isDisplay: false,iconWidth:19,  iconHeight: 19 ,icon:ICONSURLS.ORDERS ,isActive:false} ,
    { title: "GLOBAL_CONSTANTS.CARDS", componentName: "_cards", isDisplay: false,iconWixdth:19,  iconHeight: 19 ,icon:ICONSURLS.CARDS ,isActive:false} ,
],
WALLETS: {
    QUCIKLINKS: {
        Buy: false,
        Sell: false,
        Withdraw: false,
        Swap: false,
        Deposit: false,
        AddVault: false,
        BuyCoupon: false,
        Samrat_withdraw:true
    },

},
HOME: {
    QUCIKLINKS: {
        Crypto: false,
        Cards: false,
        Bank: false,
        Payments: false
    },
    KrishnaKpis:{
      avilableBalnceKpi:false,
    },
    KrishnaSection:{
      WalletKpis:false,
      MyCardsSection:false,
      bounses:false,
      Introducer:false,
      Income:false,
      RecentActivity:false
    },
    SamartAdvertisment: {
        adertisment:true,
        storeOffer:true,
        Analytics:true
    },
    SamartCurrentBalnceKpi: {
        currentValuekpi:true,
        kpisection:true,
    },
    smartRecenActivity:{
        RecentActivity:true
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
PAYEES:{
    QUCIKLINKS:{
        BankFields:false
    }
},
ADDS_AND_GRAPG_CONFIGURATION: {
    ADDS: {
        Home: false,
        Bank: false,
        Cards: false,
        Crypto: false,
        Payments: false,
        SamratWallet:false,
    },
    GRAPH: {
        Home: false,
        Bank: false,
        Cards: true,
        Crypto: true,
        Payments: true,
        SamratWallet:true,     
    },
    KPIS: {
        Home: true,
        Bank: true,
        Cards: false,
        Crypto: true,
        Payments: true,
        SamratWallet:true,
    },
    ASSETS:{
        Home:false,
        SamratWallet:false,
    },
    RECENT_ACTIVITY:{
        HOME:false
    }
},
MENU_DRAWER_CONGIGURATION:{
PROFILE_INFORMATION:true,
SECURITY:true,
KYC_INFORMATION:false,
ADDRESS:true,
MEMBERS:true,
GENEALOGY:true,
TRANSACTIONS:true,
PAYEES:false,
FEES:false,
SETTINGS:true,
COUPONS:false,
MY_ORDERS:true,
LOGOUT:true,
BONUSES:true,
BANKDETAILS:true,
HELP_CENTER:true
},
CURRENCY:{
    "USD":'$',
    "INR":"₹"
},
PRODUCTS_CONFIGURATION:{
    AMOUNTS:false,
    PV_POINTS:true,
    ADD_TO_CART:true,
    RATINGS:false,
    HOW_TO_USE:false,
    CATEGORY:true,
    ADD_ITEMS:true,
    STOCK_AVAILABLE:true
},
PAYMENT_METHODS:{
    WALLET_BALANCE:false,
    COUPONS_BALANCE:false,
    E_WALLET_BALANCE:false
},
SECURITY_SECTION:{
    RESET_PASSWORD:true,
    ENABLE_2_FA:false,
    SEND_VERICATION:false
},
ONBOARDING: {
    NETWORK_POSITION: false,
    IS_INITIAL_KYC:false,
    IS_INITIAL_SUBSCRIPTION:false
},
NETWORK_GENELOALOGY:{
    UNIL_LEVEL:true,
    BINARY_LEVEL:false
},
REFERRALS:{
    ADVERTISEMENT:true
},
LANGUAGES:{
    "en":true,
    "te":true,
    "ar":false,
    "ms":false
    
}
}
 export const getTabsConfigation=type=>{
    return CONFIGURATION[type]||[];
 }
 export const getLanguageConfiguration = () => {
    const languages = Object.entries(CONFIGURATION.LANGUAGES)
        .filter(([key, value]) => value === true)
        .map(([key]) => key);
    return languages;
};


