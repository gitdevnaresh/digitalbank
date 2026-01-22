import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { TextInput, BackHandler, Keyboard, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ExchangeDropdownItem, ExchangeAsset } from '../interfaces/exchangeInterfaces';
import Feather from "react-native-vector-icons/Feather";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import { AvilableLoader, MinMAxLoader } from "../skeltons";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import { CoinImages, getThemedCommonStyles } from "../../../../components/CommonStyles";
import { useLngTranslation } from "../../../../hooks/useLngTranslation";
import { useCryptoSell } from "./hooks/useCryptoSell";
import { isErrorDispaly } from "../../../../utils/helpers";
import ExchangeServices from "../../../../apiServices/exchange";
import Container from "../../../../newComponents/container/container";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";
import ViewComponent from "../../../../newComponents/view/view";
import LabelComponent from "../../../../newComponents/textComponets/lableComponent/lable";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import { CurrencyText } from "../../../../newComponents/textComponets/currencyText/currencyText";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import SvgFromUrl from "../../../../components/svgIcon";
import Loadding from "../../../commonScreens/skeltons";
import ButtonComponent from "../../../../newComponents/buttons/button";
import CustomRBSheet from "../../../../newComponents/models/commonBottomSheet";
import CommonSuccess from "../../../commonScreens/successPage/commonSucces";
import { CRYPTO_CONSTANTS } from "../../wallets/constant";
import SelectionSheetContent from "../../../commonScreens/SelectionSheetContent";
import { s } from "../../../../newComponents/theme/scale";
import { setFiatChangeText } from "./utils/textHandlers";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DashboardLoader from '../../../../components/loader';
import { getTabsConfigation } from "../../../../../configuration";


const CryptoSellExchange = React.memo((props: any) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(()=>getThemedCommonStyles(NEW_COLOR),[NEW_COLOR]);
 const getCurrencyType = getTabsConfigation("CURRENCY_DECIMAL_PLACES");
  const [changeAmt, setChangeAmt] = useState<string>("");
  const [disableBtn, setDisableBtn] = useState<boolean>(false);
  const coinSheetRef = useRef<any>(null);
  const currencySheetRef = useRef<any>(null);
  const successSheetRef = useRef<any>(null);
  const [preViewDataLoading, setPreViewDataLoading] = useState<boolean>(false);
  const [cryptoConvertVal, setCryptoConvertVal] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [fiatSelectedVal, setFiatSelectedVal] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [coinName, setCoinName] = useState(props?.route?.params?.coinFullName);
  const [selectedValue, setSelectedValue] = useState(props?.route?.params?.cryptoCoin);
  const { t } = useLngTranslation();
  const navigation = useNavigation();
  const [refreshing, setRefreshing]=useState<boolean>(false);
  const isDropdownChanging = useRef<boolean>(false);
  const configDecimals = getCurrencyType?.[selectedValue||'USDT'];

  // skeletons
  const loader = MinMAxLoader(1);
  const receiveLoader = AvilableLoader();

  const {
    cryptoCoinData,
    dropDownList,
    coinDataLoading,
    getDropDownObj,
    oneCoinValLoader,
    changeAmountLoader,
    summaryData,
    showSummary,
    error: hookError,
    getMinAxDetails,
    getCryptoCoins,
    getFiatAssetsData,
    getFromAssetValue,
    getSummaryDetails,
    clearSummary,
    clearError,
  } = useCryptoSell();

  const typedDropDownList: ExchangeDropdownItem[] = dropDownList || [];
  const typedCryptoCoinData: ExchangeAsset[] = cryptoCoinData || [];

  useEffect(() => {
    const initializeData = async () => {
      try {
        setRefreshing(true);
        await getCryptoCoins();
        const fiatAssets = await getFiatAssetsData();
         setRefreshing(false);
        if (fiatAssets?.length > 0) {
          setFiatSelectedVal(fiatAssets[0]?.code || "");
        }
        await getMinAxDetails(props?.route?.params?.cryptoCoin);
        setErrorMsg("");
      } catch (error) {
        setErrorMsg(isErrorDispaly(error));
      }
    };
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props?.route?.params?.cryptoCoin) {
      setErrorMsg("");
      setSelectedValue(props?.route?.params?.cryptoCoin);
    }
    if (props?.route?.params?.toCoin) {
      setErrorMsg("");
      setFiatSelectedVal(props?.route?.params?.toCoin);
    }
  }, [props?.route?.params?.cryptoCoin, props?.route?.params?.toCoin, props?.route?.params?.fromAmount]);

  useEffect(() => {
    // Skip if dropdown is changing to prevent duplicate API calls
    if (isDropdownChanging.current) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      if (inputValue && inputValue !== "" && fiatSelectedVal && selectedValue) {
        const numValue = parseFloat(inputValue);
        const sellMin = getDropDownObj?.min;
        
        // Only call API if amount is within min/max range
        if (!isNaN(numValue) && (numValue > 0 || inputValue.endsWith('.'))) {
          const sellMax = getDropDownObj?.max;
          if ((sellMin === null || sellMin === undefined || numValue >= sellMin) &&
              (sellMax === null || sellMax === undefined || numValue <= sellMax)) {
            getFromAssetValue(inputValue, selectedValue, fiatSelectedVal, setCryptoConvertVal);
          } else {
            setCryptoConvertVal("");
          }
        } else {
          setCryptoConvertVal("");
        }
      } else {
        setCryptoConvertVal("");
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [inputValue, fiatSelectedVal, selectedValue, getDropDownObj?.min, getDropDownObj?.max]);

  useEffect(() => {
    const backAction = () => {
      if (props?.route?.params?.fromScreen === 'ExchangeCryptoList') {
        (navigation as any).goBack();
      } else {
        (navigation as any).navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.EXCHANGE", animation: "slide_from_left" });
      }
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation, props?.route?.params]);

  const resetLoadingState = () => {
    setPreViewDataLoading(false);
    setDisableBtn(false);
  };

  const validateAmount = () => {
    if (changeAmt === "" || changeAmt === null || changeAmt === undefined) {
      return `${t("GLOBAL_CONSTANTS.ENTER_VALID_AMOUNT")} ${selectedValue}.`;
    }
    
    const amount = parseFloat(changeAmt);
    const availableCryptoBalance = typedCryptoCoinData.find((item: ExchangeAsset) => item.code === selectedValue)?.amount || 0;
    const sellMin = getDropDownObj?.min;
    const sellMax = getDropDownObj?.max;
    
    if (amount <= 0) {
      return t("GLOBAL_CONSTANTS.AMOUNT_MUST_BE_GREATER_THAN_ZERO");
    }
    
    // Scenario 3 & 4: Check minimum if sellMin is not null
    if (sellMin !== null && sellMin !== undefined && amount < sellMin) {
      return `${t("GLOBAL_CONSTANTS.MINIMUM_LIMIT_NOT_MET")} ${sellMin.toLocaleString(undefined, { maximumFractionDigits: 5 })} ${selectedValue}`;
    }
    
    // Scenario 2 & 4: Check maximum if sellMax is not null (BEFORE available balance)
    if (sellMax !== null && sellMax !== undefined && amount > sellMax) {
      return `${t("GLOBAL_CONSTANTS.MAXIMUM_LIMIT_EXCEEDED")} ${sellMax.toLocaleString(undefined, { maximumFractionDigits: 5 })} ${selectedValue}.`;
    }
    
    // Check available balance last
    if (amount > availableCryptoBalance) {
      return `${t("GLOBAL_CONSTANTS.INSUFFICIENT_BALANCE_TO_SELL")} ${selectedValue} ${t("GLOBAL_CONSTANTS.TO_SELL")}.`;
    }
    
    if (Number(cryptoConvertVal) <= 0) {
      return `${t("GLOBAL_CONSTANTS.CONVERTED_AMOUNT_MUST_BE_GREATER_THAN_ZERO")} ${selectedValue}.`;
    }
    
    return null;
  };

  const handlePreviewValidation = async () => {
    const validationError = validateAmount();
    if (validationError) {
      resetLoadingState();
      setErrorMsg(validationError);
      return;
    }
    try {
      await getSummaryDetails(changeAmt, selectedValue, fiatSelectedVal);
      resetLoadingState();
    } catch (error) {
      resetLoadingState();
      setErrorMsg(isErrorDispaly(error));
    }
  };

  const handleConfirmSell = async () => {
    setPreViewDataLoading(true);
    setDisableBtn(true);
    try {
      const cryptoAsset = (cryptoCoinData as any[])?.find((item: any) => item.code === selectedValue);
      const fiatAsset = (dropDownList as any[])?.find((item: any) => item.code === fiatSelectedVal);
      const payload = {
        fromAssetId: getDropDownObj?.id||cryptoAsset?.id,
        fromAsset: selectedValue,
        fromValue: parseFloat(changeAmt),
        toAssetId: fiatAsset?.id,
        toAsset: fiatSelectedVal,
        toValue: parseFloat(cryptoConvertVal || '0'),
      };
      const response = await ExchangeServices.sellSavsucess(payload); // NOTE: confirm method name
      if ((response as any)?.ok) {
        resetLoadingState();
        successSheetRef?.current?.open();
      } else {
        resetLoadingState();
        setErrorMsg(isErrorDispaly(response));
      }
    } catch (error) {
      resetLoadingState();
      setErrorMsg(isErrorDispaly(error));
    }
  };

  const getPreviewData = async () => {
    Keyboard.dismiss();
    if (!showSummary) {
      setPreViewDataLoading(true);
      setErrorMsg("");
      setDisableBtn(true);
      await handlePreviewValidation();
    } else {
      await handleConfirmSell();
    }
  };

  const handleDropDownChange = (val: any) => {
    Keyboard.dismiss();
    getMinAxDetails(val?.code);
    setSelectedValue(val?.code);
    setCoinName(val?.name);
    setChangeAmt("");
    setInputValue("");
    setCryptoConvertVal("");
    clearSummary();
    coinSheetRef?.current?.close();
  };

  const handleDropDownFiatChange = (val: any) => {
    Keyboard.dismiss();
    isDropdownChanging.current = true;
    setFiatSelectedVal(val?.code);
    clearSummary();
    currencySheetRef?.current?.close();
    setErrorMsg("");
    
    if (changeAmt && changeAmt !== "") {
      getFromAssetValue(changeAmt, selectedValue, val?.code, setCryptoConvertVal);
    }
    
    // Reset flag after state update
    setTimeout(() => {
      isDropdownChanging.current = false;
    }, 1000);
  };

  const handleGoBack = useCallback(() => {
    if (props?.route?.params?.fromScreen === 'ExchangeCryptoList') {
      (navigation as any).goBack();
    } else {
      (navigation as any).navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.EXCHANGE", animation: "slide_from_left" });
    }
  }, [navigation, props?.route?.params]);

  const handleMinValue = useCallback(() => {
    const sellMin = getDropDownObj?.min;
    
    // Only set min value if sellMin is not null
    if (sellMin !== null && sellMin !== undefined) {
      const fixedResult = parseFloat(sellMin).toFixed(configDecimals);
      setChangeAmt(fixedResult);
      getFromAssetValue(fixedResult, selectedValue, fiatSelectedVal, setCryptoConvertVal);
      setErrorMsg("");
      clearSummary();
    }
  }, [getDropDownObj, selectedValue, fiatSelectedVal]);

  const handleMaxValue = useCallback(() => {
    const availableCryptoBalance = typedCryptoCoinData.find((item: ExchangeAsset) => item.code === selectedValue)?.amount || 0;
    const sellMax = getDropDownObj?.max;
    
    // Determine max value based on scenarios
    let maxValue = availableCryptoBalance;
    
    // If sellMax exists (not null), use the smaller of sellMax or available balance
    if (sellMax !== null && sellMax !== undefined) {
      maxValue = Math.min(availableCryptoBalance, sellMax);
    }
    
    const fixedResult = maxValue.toFixed(configDecimals);
    setChangeAmt(fixedResult);
    getFromAssetValue(fixedResult, selectedValue, fiatSelectedVal, setCryptoConvertVal);
    setErrorMsg("");
    clearSummary();
  }, [getDropDownObj, selectedValue, fiatSelectedVal, cryptoCoinData]);

  const handleSuccessClose = useCallback(() => {
    successSheetRef?.current?.close();
    (navigation as any).navigate('ExchangeCryptoList', { type: 'sell', animation: "slide_from_left" });
  }, [navigation]);

  const handleBackToExchangeDashboard = useCallback(() => {
    successSheetRef?.current?.close();
    (navigation as any).navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.EXCHANGE", animation: "slide_from_left" });
  }, [navigation]);
 
  const handleRefresh = async() => {
    setRefreshing(true);
    await getCryptoCoins();
    await getFiatAssetsData();
    setRefreshing(false);
  };


  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={commonStyles.container}>
        <PageHeader title={`${t("GLOBAL_CONSTANTS.SELL")} ${coinName || ''}`} onBackPress={handleGoBack} />

        {/* unified error component usage */}
        {(errorMsg !== "" || hookError !== "") && (
          <ErrorComponent message={errorMsg || hookError} onClose={() => { setErrorMsg(""); clearError(); }} />
        )}
  {refreshing&& (<ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                        <DashboardLoader />
                    </ViewComponent>)}
       {!refreshing&&<ViewComponent style={[commonStyles.flex1]}>
          <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            style={[commonStyles.flex1]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                />}
          >
            <ViewComponent style={[commonStyles.gap6, commonStyles.relative, commonStyles.flexCol]}>
              <ViewComponent style={[{ height: s(121) }, commonStyles.bgnote, commonStyles.flexCol, commonStyles.justifyContent]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                  <LabelComponent text={`${t("GLOBAL_CONSTANTS.YOU_SELL")}`} style={[commonStyles.availbleamountbuylabel, commonStyles.mt6]} />
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                    <ParagraphComponent style={[commonStyles.availblelabel]} text={`${t("GLOBAL_CONSTANTS.AVAILABLE")} : `} />
                    <CurrencyText
                      value={typedCryptoCoinData.find((item: ExchangeAsset) => item.code === selectedValue)?.amount || 0}
                      decimalPlaces={4}
                      currency={selectedValue || ""}
                      style={[commonStyles.availbleamount]}
                    />
                  </ViewComponent>
                </ViewComponent>

                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4, commonStyles.justifyContent]}>
                  <CommonTouchableOpacity onPress={() => { Keyboard.dismiss(); coinSheetRef?.current?.open(); }} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap2]}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
                      <ViewComponent style={{ width: s(24), height: s(24) }}>

                        <SvgFromUrl uri={CoinImages[selectedValue?.toLowerCase?.() || ""] || ''} width={s(24)} height={s(24)} />
                      </ViewComponent>

                      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6, commonStyles.mt4]} >
                        <ParagraphComponent style={[commonStyles.primarytext]} text={selectedValue || ''} />
                        <Feather name="chevron-down" size={s(22)} color={NEW_COLOR.TEXT_WHITE} />

                      </ViewComponent>

                    </ViewComponent>
                  </CommonTouchableOpacity>





                  <TextInput
                    style={[{ backgroundColor: "transparent", flex: 1, textAlign: "right", paddingLeft: s(16) }, commonStyles.fw400, commonStyles.fs30, commonStyles.textWhite]}
                    placeholder="0.00"
                    onChangeText={(text) => {
                      clearSummary();
                      setErrorMsg("");

                      if (!text || text.trim() === "") {
                        setChangeAmt('');
                        setInputValue('');
                        setCryptoConvertVal("");
                        return;
                      }

                      // Remove commas and other non-numeric characters except decimal point
                      let cleanText = text.replace(/[^0-9.]/g, "");

                      // Limit to 10 characters
                      if (cleanText.length > 10) {
                        cleanText = cleanText.slice(0, 10);
                      }

                      // Add leading zero if starts with decimal point
                      if (cleanText.startsWith('.')) {
                        cleanText = '0' + cleanText;
                      }

                      // Handle multiple dots - keep only the first one
                      const dotCount = (cleanText.match(/\./g) || []).length;
                      if (dotCount > 1) {
                        const firstDotIndex = cleanText.indexOf('.');
                        cleanText = cleanText.slice(0, firstDotIndex + 1) + cleanText.slice(firstDotIndex + 1).replace(/\./g, '');
                      }

                      // Handle decimal formatting - limit to 4 decimal places
                      const decimalIndex = cleanText.indexOf('.');
                      if (decimalIndex !== -1) {
                        const integerPart = cleanText.slice(0, decimalIndex);
                        const fractionalPart = cleanText.slice(decimalIndex + 1);
                        cleanText = integerPart + '.' + fractionalPart.slice(0, configDecimals);
                      }

                      setChangeAmt(cleanText);
                      setInputValue(cleanText);
                    }}
                    value={(() => {
                      if (!changeAmt || changeAmt === "") return "";

                      // Preserve trailing decimal point and incomplete decimals
                      if (changeAmt.endsWith('.') || changeAmt.includes('.')) {
                        const parts = changeAmt.split('.');
                        const integerPart = parseFloat(parts[0]) || 0;
                        const formattedInteger = integerPart.toLocaleString('en-US');

                        if (parts.length === 2) {
                          return formattedInteger + '.' + parts[1];
                        } else if (changeAmt.endsWith('.')) {
                          return formattedInteger + '.';
                        }
                      }

                      const numValue = parseFloat(changeAmt);
                      if (isNaN(numValue)) return changeAmt;
                      return numValue.toLocaleString('en-US', { maximumFractionDigits: 4 });
                    })()}
                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_COLOR}
                    keyboardType="numeric"
                    editable={!coinDataLoading && !oneCoinValLoader}
                  />
                </ViewComponent>

                <ViewComponent>
                  {oneCoinValLoader ? (
                    <Loadding contenthtml={loader} />
                  ) : (
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mb4,
                      // If only MAX exists (MIN is null), align to right
                      (getDropDownObj?.min === null || getDropDownObj?.min === undefined) && 
                      (getDropDownObj?.max !== null && getDropDownObj?.max !== undefined) 
                        ? commonStyles.justifyend 
                        : commonStyles.justifyContent
                    ]}>
                      {/* Show MIN only if sellMin is not null */}
                      {getDropDownObj?.min !== null && getDropDownObj?.min !== undefined && (
                        <CommonTouchableOpacity onPress={handleMinValue}>
                          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                            <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textprimary]} text={`${t("GLOBAL_CONSTANTS.MIN")}  `} />
                            <CurrencyText
                              value={getDropDownObj?.min || 0}
                              decimalPlaces={4}
                              currency={selectedValue || ''}
                              style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textprimary]}
                            />
                          </ViewComponent>
                        </CommonTouchableOpacity>
                      )}
                      
                      {/* Show MAX only if sellMax is not null */}
                      {getDropDownObj?.max !== null && getDropDownObj?.max !== undefined && (
                        <CommonTouchableOpacity onPress={handleMaxValue} style={[commonStyles.minmaxbg]}>
                          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                            <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textprimary]} text={`${t("GLOBAL_CONSTANTS.MAX")}  `} />
                            <CurrencyText
                              value={Math.min(
                                typedCryptoCoinData.find((item: ExchangeAsset) => item.code === selectedValue)?.amount || 0,
                                getDropDownObj?.max || 0
                              )}
                              decimalPlaces={4}
                              currency={selectedValue || ''}
                              style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textprimary]}
                            />
                          </ViewComponent>
                        </CommonTouchableOpacity>
                      )}
                    </ViewComponent>
                  )}
                </ViewComponent>
              </ViewComponent>

              <ViewComponent style={[commonStyles.bgnote, commonStyles.p14, commonStyles.justifyContent]}>
                <ViewComponent style={[commonStyles.mb10, commonStyles.mt10, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                  <LabelComponent text={`${t("GLOBAL_CONSTANTS.YOU_RECEIVE")}`} style={[commonStyles.availbleamountbuylabel, commonStyles.mt6]} />
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                    <ParagraphComponent style={[commonStyles.availblelabel]} text={`${t("GLOBAL_CONSTANTS.AVAILABLE")} : `} />
                    <CurrencyText
                      value={typedDropDownList.find((item: ExchangeDropdownItem) => item.code === fiatSelectedVal)?.amount || 0}
                      decimalPlaces={2}
                      currency={fiatSelectedVal || ""}
                      style={[commonStyles.availbleamount]}
                    />
                  </ViewComponent>
                </ViewComponent>

                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4, commonStyles.justifyContent]}>
                  <CommonTouchableOpacity onPress={() => { Keyboard.dismiss(); currencySheetRef?.current?.open(); }} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap2]}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
                      <ViewComponent style={{ width: s(24), height: s(24) }}>
                        <SvgFromUrl uri={CoinImages[fiatSelectedVal?.toLowerCase?.() || ""] || ''} width={s(24)} height={s(24)} />
                      </ViewComponent>
                      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6, commonStyles.mt4]} >
                        <ParagraphComponent style={[commonStyles.primarytext]} text={fiatSelectedVal || ''} />
                        <Feather name="chevron-down" size={s(22)} color={NEW_COLOR.TEXT_WHITE} />
                      </ViewComponent>
                    </ViewComponent>
                  </CommonTouchableOpacity>







                  <ViewComponent style={[commonStyles.justifyAround]}>
                    {changeAmountLoader ? (
                      <Loadding contenthtml={receiveLoader} />
                    ) : (
                      <TextInput
                        style={[commonStyles.secondryamountInputLabel]}
                        placeholder="0.00"
                        onChangeText={(text) => {
                          clearSummary();
                          setErrorMsg("");
                          
                          if (!text || text.trim() === "") {
                            setCryptoConvertVal('');
                            setChangeAmt('');
                            setInputValue('');
                            return;
                          }
                          
                          let cleanText = text.replace(/[^0-9.]/g, "");
                          if (cleanText.length > 10) {
                            cleanText = cleanText.slice(0, 10);
                          }
                          
                          if (cleanText.startsWith('.')) {
                            cleanText = '0' + cleanText;
                          }
                          
                          const dotCount = (cleanText.match(/\./g) || []).length;
                          if (dotCount > 1) {
                            const firstDotIndex = cleanText.indexOf('.');
                            cleanText = cleanText.slice(0, firstDotIndex + 1) + cleanText.slice(firstDotIndex + 1).replace(/\./g, '');
                          }
                          
                          const decimalIndex = cleanText.indexOf('.');
                          if (decimalIndex !== -1) {
                            const integerPart = cleanText.slice(0, decimalIndex);
                            const fractionalPart = cleanText.slice(decimalIndex + 1);
                            cleanText = integerPart + '.' + fractionalPart.slice(0, 2);
                          }
                          
                          setCryptoConvertVal(cleanText);
                        }}
                        value={(() => {
                          if (!cryptoConvertVal || cryptoConvertVal === "") return "";
                          const numValue = parseFloat(cryptoConvertVal);
                          if (isNaN(numValue)) return String(cryptoConvertVal);
                          return numValue.toLocaleString('en-US', { maximumFractionDigits: 2 });
                        })()}
                        placeholderTextColor={NEW_COLOR.PLACEHOLDER_COLOR}
                        keyboardType="numeric"
                        editable={!coinDataLoading && !changeAmountLoader}
                      />
                    )}
                  </ViewComponent>
                </ViewComponent>
              </ViewComponent>

              <ViewComponent style={[commonStyles.relative, { position: "absolute", left: "50%", top: s(125), transform: [{ translateX: -s(18) }, { translateY: -s(18) }], minHeight: s(37), minWidth: s(37) }]}>
                <ViewComponent style={[commonStyles.buyiconbg]}>
                  <FontAwesome6Icon name="arrow-down-long" size={s(16)} color={NEW_COLOR.TEXT_WHITE} />
                </ViewComponent>
              </ViewComponent>
            </ViewComponent>

            {showSummary && summaryData && (
              <ViewComponent style={[commonStyles.sectionGap]}>
                <ViewComponent style={[commonStyles.sectionGap]} />
                <LabelComponent text={t("GLOBAL_CONSTANTS.SUMMARY")} style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />
                <ViewComponent style={[]}>
                  {/* <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap10,commonStyles.flexWrap]}>
                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={t("GLOBAL_CONSTANTS.EXCHANGE_RATE")} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                      <ParagraphComponent style={[commonStyles.listprimarytext]} text={`1 ${selectedValue} = `} />
                      <CurrencyText
                        value={summaryData.oneCoinValue || 0}
                        decimalPlaces={2}
                        currency={fiatSelectedVal}
                        style={[commonStyles.listprimarytext]}
                      />
                    </ViewComponent>
                  </ViewComponent>
                  <ViewComponent style={[commonStyles.listitemGap]} /> */}

                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap10, commonStyles.flexWrap]}>
                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={t("GLOBAL_CONSTANTS.AMOUNT")} />
                    <CurrencyText
                      value={summaryData.assetValue || 0}
                      decimalPlaces={4}
                      currency={selectedValue}
                      style={[commonStyles.listprimarytext]}
                    />
                  </ViewComponent>
                  <ViewComponent style={[commonStyles.listitemGap]} />

                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap10, commonStyles.flexWrap]}>
                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={t("GLOBAL_CONSTANTS.FEE")} />
                    <CurrencyText
                      value={summaryData.fee || 0}
                      decimalPlaces={2}
                      currency={fiatSelectedVal}
                      style={[commonStyles.listprimarytext]}
                    />
                  </ViewComponent>
                  <ViewComponent style={[commonStyles.listitemGap]} />

                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap10, commonStyles.flexWrap]}>
                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={t("GLOBAL_CONSTANTS.YOU_RECEIVE")} />
                    <CurrencyText
                      value={summaryData.totalAmount || 0}
                      decimalPlaces={2}
                      currency={fiatSelectedVal}
                      style={[commonStyles.listprimarytext]}
                    />
                  </ViewComponent>
                </ViewComponent>
              </ViewComponent>
            )}

          </KeyboardAwareScrollView>

          <ViewComponent style={[commonStyles.sectionGap]}>
            <ButtonComponent
              title={showSummary ? `${t("GLOBAL_CONSTANTS.CONFIRM")}` : t("GLOBAL_CONSTANTS.SELL")}
              suffix={showSummary ? `${(selectedValue || '')?.toUpperCase()}` : ""}
              multiLanguageAllows={false}
              disable={disableBtn}
              loading={preViewDataLoading}
              onPress={getPreviewData}
            />
          </ViewComponent>
        </ViewComponent>}

        {/* Coin Selection Sheet */}
        <CustomRBSheet
          refRBSheet={coinSheetRef}
          title={CRYPTO_CONSTANTS?.SELECT_COIN}
          height={s(450)}
        >
          <SelectionSheetContent
            dataLoading={coinDataLoading}
            itemsList={typedCryptoCoinData}
            selectedItem={typedCryptoCoinData.find((item: ExchangeAsset) => item.code === selectedValue) || null}
            handleActiveItem={handleDropDownChange}
            transactionCardContent={null}
            commonStyles={commonStyles}
            s={s}
            searchPlaceholder={CRYPTO_CONSTANTS?.SEARCH_COIN}
            searchBindKey="code"
            showAmount={true}
            showChangePercent={true}
            iconSize={s(34)}
            isCrypto={true}
          />
        </CustomRBSheet>

        {/* Currency Selection Sheet */}
        <CustomRBSheet
          refRBSheet={currencySheetRef}
          title={CRYPTO_CONSTANTS?.SELECT_CURRENCY}
          height={s(450)}
        >
          <SelectionSheetContent
            dataLoading={false}
            itemsList={typedDropDownList}
            selectedItem={typedDropDownList.find((item: ExchangeDropdownItem) => item.code === fiatSelectedVal) || null}
            handleActiveItem={handleDropDownFiatChange}
            transactionCardContent={null}
            commonStyles={commonStyles}
            s={s}
            searchPlaceholder={CRYPTO_CONSTANTS?.SEARCH_CURRENCY}
            searchBindKey="code"
            showAmount={true}
            showChangePercent={false}
            iconSize={s(24)}
            isCrypto={false}

          />
        </CustomRBSheet>

        {/* Success Sheet */}
        <CustomRBSheet
          refRBSheet={successSheetRef}
          height={s(550)}
          draggable={false}
          closeOnPressMask={false}
        >
          <ViewComponent>
            <CommonSuccess
              navigation={navigation}
              successMessage={t("GLOBAL_CONSTANTS.SUCCESS!")}
              subtitle={`${t("GLOBAL_CONSTANTS.YOUR_SELL_ORDER_FOR")} ${parseFloat(cryptoConvertVal || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${fiatSelectedVal} ${t("GLOBAL_CONSTANTS.HAS_BEEN_ADDED_FOR_SELL_AND_BUY")}`}
              buttonText={t("GLOBAL_CONSTANTS.SELL_AGAIN")}
              buttonAction={handleSuccessClose}
              secondaryButtonText={t("GLOBAL_CONSTANTS.BACK_TO_EXCHANGE_DASHBOARD")}
              secondaryButtonAction={handleBackToExchangeDashboard}
              amount={cryptoConvertVal}
              prifix={fiatSelectedVal}
              amountIsDisplay={false}
            />
          </ViewComponent>
        </CustomRBSheet>
      </Container>
    </ViewComponent>
  );
});

export default CryptoSellExchange;
