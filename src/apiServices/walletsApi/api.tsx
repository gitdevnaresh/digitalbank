import { get, post } from "../../utils/ApiService"
export const WalletsService = {
  getWalletsAmount: async (packageId: any) => {
    return await get(`/api/v1/Merchant//availablebalance/BTC/${packageId}`)
  },
  getShowAssets: async (customerId: any) => {
    return get(`api/v1/Merchant/Wallets/${customerId}/depositcrypto`)
  },
  getCouponBalance: async () => {
    return await get(`/api/v1/Affiliate/couponbalance`)
  },
  getWalletKpis: async () => {
    return await get(`/api/v1/Affiliate/customerwalletskpi`)
  },
  getBonusKpis: async () => {
    return await get(`api/v1/Affiliate/m/bonuskpi`)
  },
  getRefferalKpis: async () => {
    return await get(`api/v1/Affiliate/m/referralKpi`)
  },
  getwithdrawKpis: async () => {
    return await get(`api/v1/Affiliate/m/withdrawamountkpi`)
  },
  getBonusLevels: async () => {
    return await get(`api/v1/Affiliate/m/ReferralBonusData`)
  },
  getCashwalletBalance: async (customerId:any) => {
    return await get(`api/v1/Affiliate/CashWallet/${customerId}`)
  },
   getShowVaults: async () => {
      return get(`api/v1/vaults/crypto`)
    },
     getFiatVaultsList: async () => {
      return get(`api/v1/Wallets/fiat`)
    },
       getSelectedFiatDeposteDetails: async (currency:string) => {
      return get(`api/v1/wallets/${currency}/fiat/deposit`)
    },
      withdrawFiatSummaryDetails: async (obj: {}) => {
    return post(`api/v1/withdraw/fiat/fee`, obj)
  },

  withdrawFiatSucess: async (obj: {}) => {
    return post(`api/v1/withdraw/fiat`, obj)
  },
  withdrawFiatSelectCoinDetails: async (selectedCoinId:string) => {
    return get(`api/v1/withdraw/wallets/${selectedCoinId}/fiat`)
  },
    withdrawFiatSelectCoinPayees: async (selectedCoin:string) => {
    return get(`api/v1/payees/fiat?currency=${selectedCoin}&feature=`)
  },
  getFiatCoinDetails: async (id:string) => {
    return get(`api/v1/wallets/${id}/details`)
  },
  getFiatCoinListsList: async (action:any) => {
      return get(`api/v1/Wallets/${action}/fiat`)
    },

}