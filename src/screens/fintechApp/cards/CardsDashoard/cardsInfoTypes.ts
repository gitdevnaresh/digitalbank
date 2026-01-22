import { CardList } from "./interface";

export interface CardsInfoState {
    errorMsg: string;
    initialRouteCardId: string | null;
    componentIsLoading: boolean;
    activeCardDetailsLoading: boolean;
    CardsInfoData: any;
    bindCardData: any;
    recentTranscationReload: boolean;
    // isCardFlip: boolean; // Replaced by isFlipped in useCardsInfoState
    RbSheetTittle: string;
    isFreezeSheet: boolean;
    mangeCardSheet: boolean;
    isCardInfoSheet: boolean;
    isSetPinSheet: boolean;
    isLimitSheet: boolean;
    isTopUpSheet: boolean;
    buttonLoader: boolean;
    cardSuportedPlatForms: any[];
    rbSheetErrorMsg: string;
    networkData: any[];
    currencyCode: any[];
    selectedCurrency: string;
    selectedNetwork: string;
    topupBalanceInfo: any;
    topUpAmount: any;
    feeComissionLoading: boolean;
    feeComissionData: any;
    isBindCardSheet: boolean;
    isSheetOpen: boolean;
    cardsDetails: any;
    isSuccessSheet: boolean;
    successAmount: number;
    successCurrency: string;
    successCardName: string;
    isCardDetailsSheet: boolean;
    allMyCardsList: CardList[];
    activeCardId: string;
    carouselActiveIndex: number;
    otherAvailableCards: CardList[];
    otherAvailableCardsLoading: boolean;
}

export type SheetTitle = "Manage Card" | "Card Info" | "Freeze Card" | "Unfreeze Card" | "Set Pin" | "Limit" | "Top-Up" | "Bind Card" | "Success" | "GLOBAL_CONSTANTS.CARD_DETAILS" | "GLOBAL_CONSTANTS.SUPPORTED_PLOTFORMS" | "GLOBAL_CONSTANTS.SET_PIN" | "GLOBAL_CONSTANTS.LIMIT";