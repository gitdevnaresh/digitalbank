import { bankpost, get, paymentGet, paymentPost, paymentPut, post, put } from '../utils/ApiService';

const PaymentService = {
  paymentDashBoadGraph: async (type: string | number) => {
    return paymentGet(`api/v1/payments/summary?type=${type}`)
  },
  paymentCoins: async () => {
    return paymentGet(`api/v1/payments/merchants`);
  },
  paymentKpiDetails: async () => {
    return paymentGet(`api/v1/payments/kpi`)
  },
  paymentAvailabeBalance: async () => {
    return paymentGet(`api/v1/payments/balance?type=payin`);
  },
  paymentPayoutBalance: async () => {
    return paymentGet(`api/v1/payments/balance?type=payout`);
  },
  getAllPaymentLinks: async (type: any, search: any, page: any, pageSize: any) => {
    let url = `api/v1/payments/${type}`;
    url += `?page=${page}&pageSize=${pageSize}&search=${search}`;
    return paymentGet(url);
  },
  getPayOutList: async (page: any, pageSize: any, search: any) => {
    return paymentGet(`/api/v1/payments/payout?page=${page}&pageSize=${pageSize}&search=${search}`)
  },
  getMerchantLu: async () => {
    return paymentGet(`api/v1/payments/merchants`);
  },
  getCurrencyLu: async (id:any,type:string) => {
    return get(`api/v1/currencies/${id}?type=${type}`);
  },
  stateChange: async (type: any, status: any) => {
    return get(`api/v1/features/${type}/status/${status}/next`)
  },
  downloadInvoiceTemplete: async (txid: any, type: string) => {
    return paymentGet(`api/v1/invoices/${txid}/download?type=${type}`)
  },
  downloadStatictemplete: async (txid: any, type: string) => {
    return paymentGet(`api/v1/invoices/${txid}/download?type=${type}`)
  },
  invoiceStatusUpdate: async (id: any, body: any) => {
    return paymentPut(`/api/v1/payments/payins/${id}/state`, body)
  },
  updateInvoice: async (body: any) => {
    return paymentPut(`api/v1/payments/payin/invoice`, body)
  },
  createInvoiceForm: async (body: any) => {
    return await paymentPost('api/v1/payments/payin/invoice', body);
  },
    saveKycDetails: async (body: any) => {
    return await paymentPost('api/v1/payouts/kycrequirements', body);
  },
  payInPreviewTemplates: async (type: any, body: any) => {
    return post(`/api/v1/Merchant/${type}`, body)
  },
  getGenerateInvoiceDetails: async (id: any) => {
    return paymentGet(`api/v1/payins/invoice/${id}`);
  },
  getListOfCountries: async () => {
    return get('api/v1/payments/lookup');
  },
  paymentsLookups: async () => {
    return get(`api/v1/payments/lookup`);
  },  
 getStaicPayinCoins: async () => {
    return paymentGet(`api/v1/payments/fiatwallets/lookup`);
  },
 getStaicPayinView: async (Coin:string) => {
    return paymentGet(`api/v1/payments/${Coin}/fiat/deposit`);
  },
getCryptoPayee: async (toCurrency: any,feature:any) => {
    return get(`/api/v1/payees/fiat?currency=${toCurrency}&feature=${feature}`)
  },
  cryptoPayoutSave: async (body: any) => {
    return paymentPost(`/api/v1/payments/payout/fiat?type=payoutcrypto`, body)
  },
  fiatPayoutSave: async (body: any) => {
    return paymentPost(`/api/v1/payments/payout/fiat?type=payoutfiat`, body)
  },
  fiatpayinIdrList:async(page: any, pageSize: any)=>{
    return paymentGet(`/api/v1/payments/payin/fiat?page=${page}&pageSize=${pageSize}&search=null`)
  },
   fiatPayinLists: async (coin: any) => {
    return paymentGet(`/api/v1/payments/payin/fiat/${coin}`)
  },
  walletsfiatpayinIdrList: async (search: any) => {
    return get(`/api/v1/wallets/${search}/fiat/paymentlinks`)
  },






  payoutCoins: async (type: any) => {
    return paymentGet(`api/v1/payouts/merchant?type=${type}`);
  },
  getCoinsLookup: async () => {
    return get(`/api/v1/Merchant/coinslookup`)
  },
  getDaysLookUp: async () => {
    return get(`/api/v1/DashBoard/DaysLu/DashBoardGraph`)
  },
  getPaymentDashBoardGraph: async (customerId: any, days: any) => {
    return get(`/api/v1/DashBoard/PaymentDashBoardGraph/${customerId}/${days}`)
  },
  createMarchent: async (body: any) => {
    const data = await post('api/v1/vault', body);
    return data;
  },
  getStateByCountryName: async (countryName: any) => {
    return get(`api/v1/Common/States/${countryName}`);
  },

  getInvoiceFormVault: async (customerId: any) => {
    return get(`/api/v1/Merchant/VaultAccounts/${customerId}`);
  },
  paymentLinkDetails: async (type: string, id: any) => {
    return paymentGet(`api/v1/payins/${type}/${id}`)
  },
  getMarchentsList: async (customerId: any) => {
    return get(`/api/v1/Merchant/GetMerchantDetails/${customerId}`)
  },
  getFiatCurrency: async (customerId: any, appName: any) => {
    return get(`/api/v1/ExchangeWallet/Exchange/FiatWallets/${customerId}/${appName}`)
  },
  postCryptoWithdraw: async (body: any) => {
    return paymentPost(`/api/v1/payout/crypto/fee`, body)
  },
  postFiatWithdraw: async (body: any) => {
    return paymentPost(`api/v1/payouts/fiat/fee`, body)
  },
  postBanksFiatWithdraw: async (body: any) => {
    return bankpost(`api/v1/accounts/withdraw/fee`, body)
  },
  banksWithdrawSave: async (body: any) => {
    return bankpost(`/api/v1/accounts/withdraw`, body)
  },
  payOutCryptoSummery: async (body: any) => {
    return paymentPost(`/api/v1/payouts/fiat/fee`, body);
  },
  payOutFiatSummery: async (body: any) => {
    return paymentPost(`api/v1/payouts/fiat/fee`, body);
  },
  payOutTransactions: async (type: any, search: any, page: any, pageSize: any) => {
    let url = `api/v1/payments/${type}`;
    url += `?page=${page}&pageSize=${pageSize}&search=${search}`;
    return paymentGet(url);
  },
  payOutPayeelu: async (customerId: any, type: any, currency: any, network: any, search: any, appName: any) => {
    return get(`/api/v1/ExchangeWallet/Payments/Payees/${customerId}/${type}/${currency}/${network}/${search}/${appName}`);
  },
  updatepaymentLinkDetails: async (body: any) => {
    return put(`/api/v1/Merchant/updatepaymentlinks`, body)
  },
  createPaymentSave: async (body: any) => {
    const data = await paymentPost('api/v1/payments/payin/staticInvoice', body);
    return data;
  },
  createFiatPayinInvoice: async (body: any) => {
    return paymentPost('api/v1/payments/payin/standardInvoice', body);
  },
  getSendFiatPayees: async (customerId: string, currency: string) => {
    return get(`/api/v1/ExchangeWallet/Exchange/PayeeLu/${customerId}/${currency}`)
  },
  confirmFiatToCrypto: async (body: any) => {
    return post(`/api/v1/ExchangeWallet/PaymentCryptoToFiat/Confirm`, body);
  },

  payOutList: async (customerId: any, type: any, date: any, page: any, pageSize: any) => {
    return get(`/api/v1/Merchant/PayOutTransactions/${customerId}/${type}/${date}?page=${page}&pageSize=${pageSize}`)
  },

  
  getFiatPayee: async (coin: any) => {
    return get(`/api/v1/payees/fiat?currency=${coin}`)
  },
  getVerificationCode: async (customerId: any, type: any) => {
    return get(`/api/v1/Security/SendOTP/${customerId}/${type}`)
  },
  getFiatCurrencyDetails: async (coin: any, network: any) => {
    return paymentGet(`/api/v1/payout/fiat/${coin}/${network}`)
  },
    getKycFormDetails: async () => {
    return paymentGet(`/api/v1/payments/kycKybdetails`)
  },
  getPayoutLimit: async () => {
    return get(`/api/v1/Common/PayOutLimit`)
  },
  fiatPayeeDetails: async (customerId: any, coin: any) => {
    return get(`/api/v1/ExchangeWallet/Exchange/PayeeLu/${customerId}/${coin}`)
  },
  teamCount: async () => {
    return get('/api/v1/Affiliate/m/referralKpi')
  },
  withdrawAmount: async () => {
    return get('/api/v1/Affiliate/m/withdrawamountkpi')
  },
  totalAmount: async (id: string) => {
    return get(`/api/v1/Affiliate/CashWallet/${id}`)
  },
  fiatView: async (id:any)=>{
    return paymentGet(`api/v1/m/payments/payin/fiat/${id}/view`)
  },
fiatTransactions:async(type:any,currency:any,page:any,pageSize:any)=>{
  return paymentGet(`/api/v1/payments/deposit/fiat/transactions?type=${type}&currency=${currency}&page=${page}&pageSize=${pageSize}`)
},
fiatDetails:async(currency:any,type:any)=>{
  return paymentGet(`/api/v1/payments/payin/fiat/view?currency=${currency}&type=${type}`)
},
payOutCurrencies:async(type:any)=>{
  return paymentGet(`/api/v1/payouts/${type}/merchant`)
},
getPurpose:async(id:any)=>{
  return paymentGet(`/api/v1/purpose?id=${id}`)
},
getSourceFunds:async(id:any)=>{
  return paymentGet(`/api/v1/sourceoffunds?id=${id}`)
},
kycRequirements:async(id:any)=>{
  return paymentGet(`/api/v1/payouts/${id}/kycrequirements`)

},
    kycAddresses: async () => {
    return get(`api/v1/addresses`);
  },
  kycBenificiariesList:async()=>{
    return get(`api/v1/beneficiaries?beneficiaryType=Ubo`)

  },
  uboDetails:async(id:any)=>{
    return get(`api/v1/uboDetails?id=${id}`)
  },
   saveKybDetails:async(body:any)=>{
    return paymentPost(`api/v1/payouts/kycrequirements`,body)
  },
    selectedPayoutCryptokycrequirements:async(programId:string)=>{
    return paymentGet(`api/v1/payouts/${programId}/kycrequirements`)
  },
  getDynamicLookup: async (url: string) => {
    return get(`api/v1/${url}`);
  },

}
export default PaymentService;