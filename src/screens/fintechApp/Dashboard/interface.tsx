import { CardItem } from "../../commonScreens/cards/smartCardCarousel";

export interface HomeProps {
  navigation: any; // Replace 'any' with specific navigation prop type if available from @react-navigation
  // Add other props if Home component receives any
}
export interface UserInfo {
  kycStatus?: string | null;
  currency: string; // Changed to required string
  // Add other properties from userDetails
  [key: string]: any; // Keep this for now if userDetails structure is complex or varies
}

 export interface MyCardsState {
  myCards: CardItem[]; // Use CardItem here
  myCradsLoader: boolean;
}

export interface Asset {
  code: string;
  amount: number;
  // Add other properties of an asset item
}

export interface VerificationField {
  isEmailVerification?: boolean | null;
  isPhoneVerified?: boolean | null;
  // Add other verification fields
}

export interface ApiCallsCompletedState {
  balance: boolean;
  cards: boolean;
  verification: boolean;
  assets: boolean;
  accounts: boolean;
  transactions: boolean;
}