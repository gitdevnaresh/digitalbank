import { get, post, put } from '../utils/ApiService';
const AddressbookService = {

  getAddressbookFiatList: async (customerId: any) => {

    const data = await get(`api/v1/ExchangeWallet/Exchange/FiatWallets/${customerId}`);

    return data
  },

  getAddressbookGridData: async (customerId: any, page: any, pageSize: any) => {

    const data = await get(`api/v1/Common/payees/${customerId}/fiat/${pageSize}/${page}/all`);

    return data
  },

  getAddressbookCryptoGridData: async (page: any, pageSize: any, currecy: any) => {
    return await get(`api/v1/payees/wallets/crypto?page=${page}&pageSize=${pageSize}&currency=${currecy}`)
  },
  getAddressbookFiatgrid: async (page: any, pageSize: any, currecy: any) => {
    return await get(`api/v1/payees/wallets/fiat?page=${page}&pageSize=${pageSize}&currency=${currecy}`);
  },
  Useractiveinactive: async (id: any, statusType: any, actinact: any) => {
    const data: any = await put(`api/v1/payees/${id}/${statusType}`, actinact);
    return data;

  },
  getAddressbookWithdrawDetails: async (id: any) => {
    const data = await get(`/api/v1/Common/Payee/fiat/${id}`);

    return data
  },

  getAddressbookCryptoViewDetails: async (id: any) => {
    const data = await get(`/api/v1/payees/crypto/${id}`);

    return data
  },
  getAddressbookFiatPayeeDetails: async (id: any) => {
    return await get(`/api/v1/Payees/fiat/${id}`);
  },
  getAddressbookFiatPayeeDetailsView: async (id: any) => {
    return await get(`/api/v1/Payees/fiat/${id}/view`);
  },
  getAddressbookBankFiatWallets: async (id: any, appName: any) => {
    return await get(`/api/v1/ExchangeWallet/bank/accountslu/${id}/${appName}`);
  },
  getAddressbookExchangeFiatWallets: async (id: any, appName: any) => {
    return await get(`/api/v1/ExchangeWallet/Exchange/FiatWallets/${id}/${appName}`);
  },
  getPayeeFiatCurrency: async () => {
    return await get(`/api/v1/Common/FiatCurrencyLu`);
  },
  banksLookup: async () => {
    return await get(`/api/v1/Affiliate/m/bankslu`);
  }, getProviderList: async (payeeId: any) => {
    return await get(`/api/v1/payeestatusinfo/${payeeId}`);
  }, getsathosiTestDetails: async ( network: any, address: any) => {
    return get(`api/v1/payees/deposit/sathositest/${network}/${address}`)
  },saveSathoshiTest:async(body:any)=>{
    return post(`api/v1/payees/deposit/sathositest`,body)
  }
};

export default AddressbookService;