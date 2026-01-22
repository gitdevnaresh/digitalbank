import { bankget, get, post, put, bankpost, bankput } from '../utils/ApiService';
import { transactionBankApi } from '../utils/api';
const CreateAccountService = {
  getAccountCreation: async (currency: any) => {
    const data = await transactionBankApi.get(`api/v1/Bank/AccountCreation/${currency}`);

    return data
  },
  getCustomerData: async (customerId: any, cardId: any) => {
    const data = await get(`api/v1/Customer/Bank/customer/${customerId}/${cardId}`);

    return data
  },
  confirmPayWithFiat: async (currecncyId: string, body: any) => {
    return bankpost(`/api/v1/banks/payments/${currecncyId}/fiat/fee`, body)

  },
  getAddressList: async () => {
    return get(`/api/v1/addresses`)
  },
  getVaultList: async () => {
    return bankget(`/api/v1/banks/payments/crypto`)
  },
  summaryAccountCreation: async (bankId: any, body: any) => {
    return bankpost(`/api/v1/banks/${bankId}/account`, body)
  },
  confirmPayWithWalleteCrypto: async (bankId: string, body: any) => {
    return bankpost(`/api/v1/banks/payments/${bankId}/crypto/fee`, body)
  },
  getVaultFiatCurrencies: async () => {
    return bankget(`/api/v1/banks/payments/fiat`)
  },
  getAccountDetailsOfMobileBank: async () => {
    const data = await bankget(`/api/v1/accounts`)
    return data
  },
  bankKpis: async () => {
    return bankget(`/api/v1/banks/kpi`)
  },
  postBanksFiatWithdraw: async (body: any) => {
    return bankpost(`api/v1/accounts/withdraw/fee`, body)
  },
  getSendListDetails: async (currency: any) => {
    const data = await get(`api/v1/payees/fiat?currency=${currency}&feature=Banks`);
    return data;
  },
  getBankLookUp: async (customerId: any, currency: any) => {
    return get(`/api/v1/Customer/Bank/BanksLu/${customerId}/${currency}`)
  },
  getBakWithDrawDetails: async (selectCurrency: any) => {
    return bankget(`/api/v1/accounts/${selectCurrency}?type=withdraw`)
  },
  getAllCurrencies: async () => {
    return bankget(`/api/v1/banks`)
  },
  getListOfCountries: async () => {
    return get('api/v1/registration/lookup');
  },
  getAddressLooupDetails: async () => {
    return get('api/v1/addresses/lookup');

  }, getAllAdressTypes: async () => {
    return get('api/v1/addresstypes');

  },

  getAddressLookUpDetails: async () => {
    return get('api/v1/kyc/lookup');

  },
  getBanksAddressLu: async () => {
    return get('api/v1/addresstypes');

  },
  getStateByCountryName: async (countryName: any) => {
    const data = get(`api/v1/Common/States/${countryName}`);
    return data
  },
  getStateByCountry: async (countryName: any) => {
    const { data } = await get('api/v1/Master/States?countryName=' + countryName);
    const formattedData = data.map((state: any) => ({
      name: state?.code,
    }));

    return formattedData;
  },

  getStatesAndCountry: async (countryName: any) => {
    const data = get(`api/v1/Common/States`);
    return data
  },
  getListOfCountryCodes: async () => {
    const data: any = await get('api/v1/Common/AddressLu');

    return data;
  },
  saveAccount: async (body: any) => {
    const data = await post('api/v1/Customer/Bank/AccountCreation', body);

    return data;
  },
  getAccountDetailsOfFiatLu: async (customerId: any, type: any) => {
    const data = await get(`api/v1/Customer/Bank/FiatLU/${customerId}/${type}`);

    return data
  },
  getAccEntityTypeLU: async () => {
    const data = await get(`api/v1/Customer/Bank/EntityTypeLU`);

    return data
  },
  getAllNotifications: async (pageSize: any, pageNo: any, search: any) => {
    return get(`/api/v1/notifications?pageSize=${pageSize}&pageNo=${pageNo}&search=${search}`);


  }, getAllNotificationCount: async () => {
    return get(`/api/v1/UnReadCount`);

  }, putNotificationCount: async () => {
    return put(`api/v1/read`, {})
  },
  getPhoneCode: async (body: any) => {
    return post(`/api/v1/confirmations/phone/send`, body);
  },
  getPhoneVerify: async (body: any) => {
    return post(`/api/v1/confirmations/phone/resend`, body);

  },
  getVerifyPhoneCode: async (body: any) => {
    return post(`/api/v1/confirmations/phone/verify`, body);
  },
  getCommonPayee: async (id: any) => {
    const data = await get(`pi/v1/Common/Payee/fiat/${id}`);
    return data;
  }, getWalletNetworkLu: async (currency: any, customerId: any) => {
    return get(`api/v1/Common/Wallets/NetworkLu/${currency}/${customerId}`)
  }, getBank_Details: async (customerId: any, currency: any, appName: any, type: any) => {
    return get(`/api/v1/Customer/Bank/BanksLu/${customerId}/${currency}/${appName}/${type}`);
  },
  getDocumentTypes: async () => {
    const data = get(`api/v1/DashBoard/PayeesLu/documentTypes`);
    return data
  },
  getPayeeLu: async () => {
    const data = get(`api/v1/DashBoard/PayeesLu/paymentTypes`);
    return data
  },
  getPaymentFieds: async (paymentType: any) => {
    return get(`/api/v1/paymenttypes?currency=${paymentType}`)
  },
  getbranches: async (bank: any) => {
    return get(`/api/v1/payees/branches?bankname=${bank}`)
  },

  getPayeesLookups: async () => {
    return get(`api/v1/payees/lookup`)
  },
  getPaymentTypeFieds: async (value: any) => {
    const paymentType = typeof value === 'string' ? value : value?.paymentType;
    return get(`/api/v1/payees/payments?name=${paymentType}`)
  },
  updatePaymentFiat: async (body: any) => {
    return put('api/v1/payees/fiat', body);
  },
  savePaymentFiat: async (body: any) => {
    return post('api/v1/Payees/Fiat', body);
  },
  getBusinessTypes: async () => {
    return get(`api/v1/DashBoard/PayeesLu/businessTypes`);
  },
  getReferralCode: async (body: any) => {
    return post(`/api/v1/referrals/verify`, body);
  },
  getUserDetails: async (appKey: any) => {
    return get(`/api/v1/Registration/App/${appKey}`);
  },
  getServiceProvider: async () => {
    return get(`/api/v1//Common/BankProvidersLu`);
  },

  getAllBanks: async (customerId: any, currency: any, type: any) => {
    return get(`/api/v1/Customer/Bank/BanksWithCurrency/${customerId}/${currency}/${type}`)
  },
  getCryptoNetworks: async (coinCode: any, customerId: any, merchantId: any, actiontype: any) => {
    return get(`/api/v1/Common/Vaults/NetWorkLU/${coinCode}/${customerId}/${merchantId}/${actiontype}`)

  },
  iBanVerification: async (number: any) => {
    return get(`api/v1/iban/${number}/validate`)
  },
  getPayeeAccountTypeLu: async () => {
    return get(`api/v1/Common/PayeeAccountTypeLu`);
  },
  getCurrenicesLookup: async () => {
    return get(`api/v1/payee/currencywithcountries`)
  },
  getproviderbanksLookup: async (country: any) => {
    return get(`api/v1/payees/providerbanks?country=${country}`)
  },
  getBankLu: async (currency: any) => {
    return get(`/api/v1/banks/lookup?countryCode=${currency}`)

  },
  getDynamicLookup: async (url: string) => {
    return get(`/api/v1/${url}`);
  }, getProfileInfo: async (type: any) => {
    if (type?.toLowerCase() === "personal") {
      return get(`/api/v1/customers/profile/personal`);
    } else {
      return get(`/api/v1/customers/profile/business`);
    }
  },
  getPrivatePolicyTemplate: async (type: any, accountType: any) => {
    return get(`/api/v1/${type}?Type=${accountType}`)
  },
  sumsubAccessToken: async (applicantId: string, levelName: string) => {
    return get(`/api/v1/Tiers/AccessToken?applicantId=${applicantId}&levelName=${levelName}`);
  },
  poacreation: async (payload: any) => {
    return bankpost(`/api/v1/bank/poacreation`, payload);
  },
 getRecipientDynamicFeildsFiat:async()=>{
    return get(`api/v1/payees/recipient/PayeeFiat`)
  },
   getRecipientDynamicFeildsCrypto:async()=>{
    return get(`api/v1/payees/recipient/PayeeCrypto`)
  },
  onboardingVerifyPhoneCode: async (body: any) => {
    return post(`/api/v1/phone/verify`, body);
  },

};
export default CreateAccountService;
