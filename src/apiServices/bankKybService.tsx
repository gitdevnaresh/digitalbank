import { bankget, get, post, put,bankpost } from '../utils/ApiService';
import { transactionBankApi } from '../utils/api';
const BankKybService = {
//   getAccountCreation: async (currency: any) => {
//     const data = await transactionBankApi.get(`api/v1/Bank/AccountCreation/${currency}`);

//     return data
//   },
//   getCustomerData: async (customerId: any, cardId: any) => {
//     const data = await get(`api/v1/Customer/Bank/customer/${customerId}/${cardId}`);

//     return data
//   },
//   confirmPayWithFiat: async (currecncyId:string,body: any) => {
//     return bankpost(`/api/v1/banks/payments/${currecncyId}/fiat/fee`, body)
    
//   },
//     getAddressList: async () => {
//     return bankget(`/api/v1/bank/addresses`)
//   },
//   getVaultList: async () => {
//     return bankget(`/api/v1/banks/payments/crypto`)
//   },
//   summaryAccountCreation: async (bankId: any, body: any) => {
//     return bankpost(`/api/v1/banks/${bankId}/account`, body)
//   },
//   confirmPayWithWalleteCrypto: async (bankId:string,body: any) => {
//     return bankpost(`/api/v1/banks/payments/${bankId}/crypto/fee`, body)
//   },
//   getVaultFiatCurrencies: async () => {
//     return bankget(`/api/v1/banks/payments/fiat`)
//   },
//     getAccountDetailsOfMobileBank: async () => {
//     const data = await bankget(`/api/v1/accounts`)
//     return data
//   },
//   getSendListDetails: async ( currency: any) => {
//     const data = await bankget(`api/v1/banks/${currency}/payees`);
//     return data;
//   },
//   getBankLookUp: async (customerId: any, currency: any) => {
//     return get(`/api/v1/Customer/Bank/BanksLu/${customerId}/${currency}`)
//   },
//   getAllCurrencies: async () => {
//     return bankget(`/api/v1/banks`)
//   },
//   getListOfCountries: async () => {
//     return get('api/v1/registration/lookup');
//   },
//   getAddressLooupDetails: async () => {
//     return get('api/v1/addresses/lookup');
 
//   },
//     getAddressLookUpDetails: async () => {
//     return get('api/v1/kyc/lookup');
 
//   },
//     getBanksAddressLu: async () => {
//     return get('api/v1/addresstypes');
 
//   },
//   getStateByCountryName: async (countryName: any) => {
//     const data = get(`api/v1/Common/States/${countryName}`);
//     return data
//   },
//   getStateByCountry: async (countryName: any) => {
//     const { data } = await get('api/v1/Master/States?countryName=' + countryName);
//     const formattedData = data.map((state: any) => ({
//       name: state?.code,
//     }));

//     return formattedData;
//   },

//   getStatesAndCountry: async (countryName: any) => {
//     const data = get(`api/v1/Common/States`);
//     return data
//   },
//   getListOfCountryCodes: async () => {
//     const data: any = await get('api/v1/Common/AddressLu');

//     return data;
//   },
//   saveAccount: async (body: any) => {
//     const data = await post('api/v1/Customer/Bank/AccountCreation', body);

//     return data;
//   },
//   getAccountDetailsOfFiatLu: async (customerId: any, type: any) => {
//     const data = await get(`api/v1/Customer/Bank/FiatLU/${customerId}/${type}`);

//     return data
//   },
//   getAccEntityTypeLU: async () => {
//     const data = await get(`api/v1/Customer/Bank/EntityTypeLU`);

//     return data
//   },
//   getAllNotifications: async (pageSize:any, pageNo:any,search: any) => {
//     return get(`/api/v1/notifications?pageSize=${pageSize}&pageNo=${pageNo}&search=${search}`);


//   }, getAllNotificationCount: async (customerId: any, type: any) => {
//     return get(`/api/v1/Notification/UnReadCount/${customerId}/${type}`);

//   }, putNotificationCount: async (customerId: any, type: any, obj: any) => {
//     return put(`api/v1/Notification/UpdateReadCount/${customerId}/${type}`, obj)
//   },
// getPhoneVerify: async (body: any) => {
//         return post(`/api/v1/confirmations/phone/resend`,body);

//   },
//   getVerifyPhoneCode: async (body: any) => {
//     return post(`/api/v1/confirmations/phone/verify`,body);
//   },
//   getCommonPayee: async (id: any) => {
//     const data = await get(`pi/v1/Common/Payee/fiat/${id}`);
//     return data;
//   }, getWalletNetworkLu: async (currency: any, customerId: any) => {
//     return get(`api/v1/Common/Wallets/NetworkLu/${currency}/${customerId}`)
//   }, getBank_Details: async (customerId: any, currency: any, appName: any, type: any) => {
//     return get(`/api/v1/Customer/Bank/BanksLu/${customerId}/${currency}/${appName}/${type}`);
//   },
//   getDocumentTypes: async () => {
//     const data = get(`api/v1/DashBoard/PayeesLu/documentTypes`);
//     return data
//   },
//   getPayeeLu: async () => {
//     const data = get(`api/v1/DashBoard/PayeesLu/paymentTypes`);
//     return data
//   },
//   getPaymentFieds: async (paymentType: any) => {
//     return get(`/api/v1/payees/payments?name=Payee_${paymentType}`)
//   },
//   getPayeesLookups:async()=>{
//     return get(`api/v1/payees/lookup`)
//   },

//   updatePaymentFiat: async (body: any) => {
//     return put('api/v1/payees/fiat', body);
//   },
//   savePaymentFiat: async (body: any) => {
//     return post('api/v1/payees/fiat', body);
 
//   },
//   getBusinessTypes: async () => {
//     return get(`api/v1/DashBoard/PayeesLu/businessTypes`);
//   },
//   getReferralCode: async (body: any) => {
//     return post(`/api/v1/referrals/verify`,body);
//   },
//   getUserDetails: async (appKey: any) => {
//     return get(`/api/v1/Registration/App/${appKey}`);
//   },
//   getServiceProvider: async () => {
//     return get(`/api/v1//Common/BankProvidersLu`);
//   },

//   getAllBanks: async (customerId: any, currency: any, type: any) => {
//     return get(`/api/v1/Customer/Bank/BanksWithCurrency/${customerId}/${currency}/${type}`)
//   },
//   getCryptoNetworks: async (coinCode: any, customerId: any, merchantId: any, actiontype: any) => {
//     return get(`/api/v1/Common/Vaults/NetWorkLU/${coinCode}/${customerId}/${merchantId}/${actiontype}`)

//   },
//   iBanVerification: async (number: any) => {
//     return get(`api/v1/iban/${number}/validate`)
//   },
//   getPayeeAccountTypeLu: async () => {
//     return get(`api/v1/Common/PayeeAccountTypeLu`);
//   },
kybInfoDetails: async (programId:string) => {
    return bankget(`api/v1/banks/${programId}/kycrequirements`);
  },
  getSelectedUboDetails: async (programId:string) => {
    return bankget(`api/v1/uboDetails?id=${programId}`);
  },
      getLookupData: async () => {
    return get('api/v1/kyc/lookup');
 
  },
     getSectorsLu: async () => {
    return bankget('api/v1/sectors');
 
  },
       gettypesLu: async () => {
    return bankget('api/v1/types');
  },
        getbeneficiaryTypeDetails: async (type:string) => {
    return bankget(`api/v1/beneficiaries?beneficiaryType=${type}`);
 
  },
};
export default BankKybService;
