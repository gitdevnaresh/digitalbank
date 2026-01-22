import { cardsGet, exchangeget, exchangepost, get, post } from '../utils/ApiService';
const ExchangeServices = {

  getCoinDetails: async (coin: any) => {
    const data = await get(`api/v1/Markets/Coins/${coin}`);
    return data;
  },
  getNetWorkLookUp: async (coin: any) => {
    return get(`/api/v1/Common/Wallets/NetWorksLu/${coin}`)
  },
  getDepositAdrress: async (customerId: any, coin: any, network: any) => {
    return get(`/api/v1/ExchangeWallet/Wallets/DepositCrypto/${customerId}/${coin}`)
  }, getAddress: async (customerId: any, coin: any) => {
    return get(`/api/v1/Common/Wallets/PayeeCryptoLU/${customerId}/${coin}`)

  }, getsendNetWorkLu: async (coin: any) => {
    return get(`api/v1/Common/Wallets/NetWorksLu/${coin}`)
  }, gotoSummeryPage: async (obj: any) => {
    return post(`api/v1/withdraw/crypto/fee`, obj)
  }, saveCryptosend: async (body: any) => {
    return post(`/api/v1/ExchangeTransaction/Withdraw/Crypto`, body)

  },
  getWalletNetwork: async (coin: any, customerId: any) => {
    return get(`api/v1/Common/Wallets/NetworkLu/${coin}/${customerId}`)
  },
  getNetworkLookup: async (coin: any, cardId: any) => {
    return cardsGet(`api/v1/cards/networks/${coin}/Card/${cardId}`)
  },
  getWalletRecieved: async (coinCode: any, actiontype:string) => {
    return get(`/api/v1/Vaults/wallets/${coinCode}/crypto/${actiontype}`)
  },
  getWalletAddress: async (customerId: any, coin: any, network: any) => {
    return get(`/api/v1/ExchangeWallet/Wallets/DepositCrypto/Exchange/${customerId}/${coin}/${network}`)
  },
  getCryptoPayees: async (network: any) => {
    return get(`api/v1/payees/crypto?netWork=${network}&search=null`)
  },
  getCoins: async ( cardId: any) => {
    return cardsGet(`api/v1/cards/walletcode/${cardId}`)
  },
  getCurrencyData:async()=>{
    return cardsGet(`api/v1/cards/balances/summary`)
  },
  gotoExchangeSummeryPage: async (screenName: string, obj: any) => {
    if (screenName === "cardsCrypto") {
      return post(`/api/v1/ExchangeWallet/Wallets/Crypto/Confirm`, obj)
    }
    return post(`/api/v1/ExchangeWallet/Crypto/Confirm`, obj);
  },
  saveWalletsend: async (screenName: string, body: any) => {
    if (screenName === "cardsCrypto") {
      return post(`/api/v1/ExchangeTransaction/CardsWithdraw/Crypto`, body)
    }
    return post(`api/v1/ExchangeTransaction/WalletsWithdraw/Crypto`, body)
  },
  getAllCryptoPayees: async (customerId: any, walletCode: any) => {
    return get(`/api/v1/Common/PayeeCryptoLU/${customerId}/${walletCode}`)
  },
  getWallets: async ( customerId: any, merchantId: any, actiontype:any) => {
    return get(`/api/v1/Merchant/M/Wallets/${customerId}/${merchantId}/${actiontype}`)
  },
  getexchangeFiatWallets: async ( customerId: any) => {
    return get(`/api/v1/assets?pageNo=1&pageSize=20`)
  },
  saveCrptoWithdraw: async (body: any) => {
    return post(`api/v1/withdraw/crypto`, body)
  },

  getexchangeCryptoList: async (pageNo:number, pageSize: number ) => {
    return exchangeget(`/api/v1/assets?pageNo=${pageNo}&pageSize=${pageSize}`)
  },
  getSelecteCryptoBalance: async () => {
    return exchangeget(`/api/v1/assets/buy/balances`)
  },
  getEnteredCryptoFiatValue: async (fromAsset: string, toAsset: string, fromAssetValue: number, type: string) => {
    return exchangeget(`/api/v1/asset/ExchangeRate/${fromAsset}/${toAsset}?fromAssetValue=${fromAssetValue}&type=${type}`)
  },
  getSelecteMinMaxValue: async (cryptoCoin: string) => {
    return exchangeget(`/api/v1/assets/buy/${cryptoCoin}`)
  },
  getsummaryDetails: async (payload: any) => {
    return exchangepost(`api/v1/asset/buy/fee`, payload)
  },
    getSelectedsellCryptoBalance: async () => {
    return exchangeget(`/api/v1/assets/sell/balances`)
  },
  getSelectesSellMinMaxValue: async (cryptoCoin: string) => {
    return exchangeget(`/api/v1/assets/sell/${cryptoCoin}`)
  },
    getsummarysellDetails: async (payload: any) => {
    return exchangepost(`api/v1/asset/sell/fee`, payload)
  },
     sellSavsucess: async (payload: any) => {
    return exchangepost(`api/v1/sell`, payload)
  },
  buysavesucess: async (payload: any) => {
    return exchangepost(`api/v1/buy`, payload)
  },
    getTotalFiatandCryptoBalances: async () => {
        return exchangeget(`api/v1/exchange/kpi`)
  },
  
     getFiatVaultsList: async () => {
      return get(`api/v1/Wallets/fiat`)
    },
       getExchangeGraph: async (days:number|string) => {
        return exchangeget(`api/v1/summary/transactions?days=${days}`)
    },
}



export default ExchangeServices;


