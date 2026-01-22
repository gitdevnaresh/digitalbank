export interface FiatAsset {
  id: string;
  name?: string;
  code: string;
  coinCode?: string;
  image: string;
  amount: number;
  actionType?: string;
  accountStatus?: string;
  remarks?: string;
}

export interface FiatData {
  totalBalanceInUSD: number;
  assets: FiatAsset[];
  assetsPrev: FiatAsset[];
  actionType?: string;
}

export interface FiatLoaders {
  fiatDataLoading: boolean;
}

export interface FiatPortfolioProps {
  isInTab?: boolean;
  isActiveTab?: boolean;
  route?: any;
  screenType?: string;
  navigation?: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

export interface ApiResponse {
  ok: boolean;
  data?: {
    totalBalanceInUSD: number;
    assets: FiatAsset[];
  };
}