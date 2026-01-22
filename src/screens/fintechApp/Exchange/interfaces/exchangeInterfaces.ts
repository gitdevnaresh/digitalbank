export interface ExchangeAsset {
  id: string;
  code: string;
  name: string;
  amount: number;
  logo?: string;
  image?: string;
  currency?: string;
  amountInUSD?: number;
  minLimit?: number;
  maxLimit?: number;
}

export interface ExchangeDropdownItem {
  id: string;
  code: string;
  name: string;
  amount: number;
  logo?: string;
  image?: string;
  currency?: string;
}

export interface ExchangeState {
  fromAssets: ExchangeAsset[];
  toAssets: ExchangeAsset[];
  dropDownList: ExchangeDropdownItem[];
  loading: boolean;
  error: string | null;
}

export interface ExchangeFormValues {
  fromAmount: string;
  toAmount: string;
  fromCurrency: string;
  toCurrency: string;
}

export interface ExchangeRateResponse {
  rate: number;
  fromAmount: number;
  toAmount: number;
  fee?: number;
  feeType?: string;
}