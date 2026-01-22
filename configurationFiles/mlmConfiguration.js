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
    { title: "GLOBAL_CONSTANTS.ACCOUNTS", componentName: "_packages", isDisplay: true, iconWidth: 20, iconHeight: 18,icon:ICONSURLS.PRODUCTS ,isActive:false},
    { title: "GLOBAL_CONSTANTS.SHOP", componentName: "_products", isDisplay: true, iconWidth: 20, iconHeight: 18,icon:ICONSURLS.PRODUCTS ,isActive:false},
    { title: "GLOBAL_CONSTANTS.WALLETS", componentName: "_wallets", isDisplay: true,  iconWidth: 22, iconHeight: 24,icon:ICONSURLS.WALLETS ,isActive:false},
    { title: "GLOBAL_CONSTANTS.ORDERS", componentName: "_orders", isDisplay: false,iconWidth:19,  iconHeight: 19 ,icon:ICONSURLS.ORDERS ,isActive:false} ,
    { title: "GLOBAL_CONSTANTS.CARDS", componentName: "_cards", isDisplay: true,iconWixdth:19,  iconHeight: 19 ,icon:ICONSURLS.CARDS ,isActive:false} ,
],
WALLETS: {
    QUCIKLINKS: {
        Buy: false,
        Sell: false,
        Withdraw: true,
        Swap: false,
        Deposit: true,
        AddVault: false,
        BuyCoupon: true,
    },
   totalAvilableBalnce:true
},
HOME: {
    QUCIKLINKS: {
        Crypto: false,
        Cards: false,
        Bank: false,
        Payments: false
    },
    KrishnaKpis:{
      avilableBalnceKpi:true
    },
    KrishnaSection:{
      WalletKpis:true,
      MyCardsSection:true,
      bounses:false,
      Introducer:true,
      Income:true,
      RecentActivity:true
    },
    SamartAdvertisment: {
        adertisment:false,
        storeOffer:false,
        Analytics:false
    },
    SamartCurrentBalnceKpi: {
        currentValuekpi:false,
        kpisection:false,
    },
    smartRecenActivity:{
        RecentActivity:false
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
    ASSETS:{
        Home:false
    },
    RECENT_ACTIVITY:{
   HOME:false
    }
},
MENU_DRAWER_CONGIGURATION:{
PROFILE_INFORMATION:true,
SECURITY:true,
KYC_INFORMATION:true,
ADDRESS:true,
MEMBERS:true,
GENEALOGY:true,
TRANSACTIONS:true,
PAYEES:true,
FEES:false,
SETTINGS:true,
COUPONS:true,
MY_ORDERS:true,
LOGOUT:true,
BONUSES:true,
HELP_CENTER:true
},
CURRENCY:{
    "USD":'$',
},
PRODUCTS_CONFIGURATION:{
    AMOUNTS:true,
    PV_POINTS:true,
    ADD_TO_CART:true,
    RATINGS:true,
    HOW_TO_USE:false,
    CATEGORY:false,
    ADD_ITEMS:false,
    STOCK_AVAILABLE:true
},
PAYMENT_METHODS:{
    WALLET_BALANCE:true,
    COUPONS_BALANCE:true,
    E_WALLET_BALANCE:true
},
SECURITY_SECTION:{
    RESET_PASSWORD:true,
    ENABLE_2_FA:true,
    SEND_VERICATION:true
},
ONBOARDING: {
    NETWORK_POSITION: true,
    IS_INITIAL_KYC:true,
    IS_INITIAL_SUBSCRIPTION:false
},
NETWORK_GENELOALOGY:{
    UNIL_LEVEL:true,
    BINARY_LEVEL:true
}
}
 export const getTabsConfigation=type=>{
    return CONFIGURATION[type]||[];
 }

