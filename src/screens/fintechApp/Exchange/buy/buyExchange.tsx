import React, { useCallback, useEffect, useState, useRef } from "react";
import { TextInput, BackHandler, Keyboard, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ExchangeDropdownItem, ExchangeAsset } from '../interfaces/exchangeInterfaces';
import { useThemeColors } from "../../../../hooks/useThemeColors";
import { CoinImages, getThemedCommonStyles } from "../../../../components/CommonStyles";
import { useLngTranslation } from "../../../../hooks/useLngTranslation";
import { AvilableLoader, MinMAxLoader } from "../skeltons";
import { useCryptoExchange } from "./hooks/useCryptoExchange";
import { isErrorDispaly } from "../../../../utils/helpers";
import ExchangeServices from "../../../../apiServices/exchange";
import ViewComponent from "../../../../newComponents/view/view";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";
import Container from "../../../../newComponents/container/container";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import LabelComponent from "../../../../newComponents/textComponets/lableComponent/lable";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import { CurrencyText } from "../../../../newComponents/textComponets/currencyText/currencyText";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import { s } from "../../../../newComponents/theme/scale";
import SvgFromUrl from "../../../../components/svgIcon";
import Feather from "react-native-vector-icons/Feather";
import ButtonComponent from "../../../../newComponents/buttons/button";
import CustomRBSheet from "../../../../newComponents/models/commonBottomSheet";
import CommonSuccess from "../../../commonScreens/successPage/commonSucces";
import { CRYPTO_CONSTANTS } from "../../wallets/constant";
import SelectionSheetContent from "../../../commonScreens/SelectionSheetContent";
import Loadding from "../../../commonScreens/skeltons";
import { setFiatChangeText } from "./utils/textHandlers";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DashboardLoader from '../../../../components/loader';
import { getTabsConfigation } from "../../../../../configuration";

const CryptoExchange = React.memo((props: any) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [changeAmt, setChangeAmt] = useState<any>("");
  const [disableBtn, setDisableBtn] = useState<boolean>(false);
  const coinSheetRef = useRef<any>(null);
  const currencySheetRef = useRef<any>(null);
  const successSheetRef = useRef<any>(null);
  const [preViewDataLoading, setPreViewDataLoading] = useState<boolean>(false);
  const [cryptoConvertVal, setCryptoConvertVal] = useState<any>("");
  const [inputValue, setInputValue] = useState<string>("");
  const getCurrencyType = getTabsConfigation("CURRENCY_DECIMAL_PLACES");
  const [fiatSelectedVal, setFiatSelectedVal] = useState<any>("");
  const [errormsg, setErrormsg] = useState<string>("");
  const [coinName, setCoinName] = useState(props?.route?.params?.coinFullName);
  const [selectedValue, setSelectedValue] = useState(props?.route?.params?.cryptoCoin);
  const { t } = useLngTranslation();
  const navigation = useNavigation();
  const loader = MinMAxLoader(1);
  const payLoader = AvilableLoader();
  const currentAmountRef = useRef<string>("");
  const isDropdownChanging = useRef<boolean>(false);
  const configDecimals = getCurrencyType?.[selectedValue||'USDT'];

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
  } = useCryptoExchange();

  const typedDropDownList: ExchangeDropdownItem[] = dropDownList || [];
  const typedCryptoCoinData: ExchangeAsset[] = cryptoCoinData || [];

  useEffect(() => {
    const initializeData = async () => {
      setRefreshing(true);
      await getCryptoCoins();
      const fiatAssets = await getFiatAssetsData();
      setRefreshing(false);
      if (fiatAssets?.length > 0) {
        setFiatSelectedVal(fiatAssets[0]?.code || "");
      }
      await getMinAxDetails(props?.route?.params?.cryptoCoin);
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (props?.route?.params?.cryptoCoin) {
      setErrormsg("");
      setSelectedValue(props?.route?.params?.cryptoCoin);
    }
    if (props?.route?.params?.toCoin) {
      setErrormsg("");
      setFiatSelectedVal(props?.route?.params?.toCoin);
    }
  }, [props?.route?.params?.cryptoCoin, props?.route?.params?.toCoin, props?.route?.params?.fromAmount]);

  useEffect(() => {
    // Skip if dropdown is changing to prevent duplicate API calls
    if (isDropdownChanging.current) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      if (changeAmt && changeAmt !== "" && fiatSelectedVal && selectedValue) {
        const numValue = parseFloat(changeAmt);
        const buyMin = getDropDownObj?.buyMin;
        
        // Only call API if amount is within min/max range
        if (!isNaN(numValue) && (numValue > 0 || changeAmt.endsWith('.'))) {
          const buyMax = getDropDownObj?.buyMax;
          if ((buyMin === null || buyMin === undefined || numValue >= buyMin) &&
              (buyMax === null || buyMax === undefined || numValue <= buyMax)) {
            getFromAssetValue(changeAmt, selectedValue, fiatSelectedVal, setCryptoConvertVal);
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
  }, [changeAmt, fiatSelectedVal, selectedValue, getDropDownObj?.buyMin, getDropDownObj?.buyMax]);

  useEffect(() => {
    const backAction = () => {
      if (props?.route?.params?.fromScreen === 'ExchangeCryptoList') {
        navigation.goBack();
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

  const validateAmounts = () => {
    if (changeAmt === "" || changeAmt === null || changeAmt === undefined) {
      return `${t("GLOBAL_CONSTANTS.ENTER_VALID_AMOUNT")} ${selectedValue}.`;
    }
    
    const amount = parseFloat(changeAmt);
    const buyMin = getDropDownObj?.buyMin;
    const buyMax = getDropDownObj?.buyMax;
    
    if (amount <= 0) {
      return t("GLOBAL_CONSTANTS.AMOUNT_MUST_BE_GREATER_THAN_ZERO");
    }
    
    // Check minimum if buyMin is not null
    if (buyMin !== null && buyMin !== undefined && amount < buyMin) {
      return `${t("GLOBAL_CONSTANTS.MINIMUM_LIMIT_NOT_MET")} ${buyMin.toLocaleString(undefined, { maximumFractionDigits: 5 })} ${selectedValue}`;
    }
    
    // Check maximum if buyMax is not null
    if (buyMax !== null && buyMax !== undefined && amount > buyMax) {
      return `${t("GLOBAL_CONSTANTS.MAXIMUM_LIMIT_EXCEEDED")} ${buyMax.toLocaleString(undefined, { maximumFractionDigits: 5 })} ${selectedValue}.`;
    }
    
    return null;
  };

  const validateBalance = () => {
    const availableFiatBalance = typedDropDownList.find((item: ExchangeDropdownItem) => item.code === fiatSelectedVal)?.amount || 0;
    if (cryptoConvertVal > availableFiatBalance) {
      return `${t("GLOBAL_CONSTANTS.INSUFFICIENT_BALANCE_TO_BUY")} ${fiatSelectedVal} ${t("GLOBAL_CONSTANTS.TO_BUY")} ${selectedValue}.`;
    }
    if (cryptoConvertVal <= 0) {
      return `${t("GLOBAL_CONSTANTS.CONVERTED_AMOUNT_MUST_BE_GREATER_THAN_ZERO")} ${selectedValue}.`;
    }
    return null;
  };

  const handlePreviewValidation = async () => {
    const amountError = validateAmounts();
    if (amountError) {
      resetLoadingState();
      return setErrormsg(amountError);
    }

    const balanceError = validateBalance();
    if (balanceError) {
      resetLoadingState();
      return setErrormsg(balanceError);
    }

    try {
      await getSummaryDetails(changeAmt, selectedValue, fiatSelectedVal);
      resetLoadingState();
    } catch (error) {
      resetLoadingState();
      setErrormsg(isErrorDispaly(error));
    }
  };

  const handleConfirmTransaction = async () => {
    setPreViewDataLoading(true);
    setDisableBtn(true);
    try {
      const fiatAsset = typedDropDownList.find((item: ExchangeDropdownItem) => item.code === fiatSelectedVal);
      const cryptoAsset = typedCryptoCoinData.find((item: ExchangeAsset) => item.code === selectedValue);
      const payload = {
        fromAssetId: fiatAsset?.id,
        fromAsset: fiatSelectedVal,
        fromValue: parseFloat(cryptoConvertVal),
        toAssetId: getDropDownObj?.id||cryptoAsset?.id ,
        toAsset: selectedValue,
        toValue: parseFloat(changeAmt)
      };
      await ExchangeServices.buysavesucess(payload);
      resetLoadingState();
      successSheetRef?.current?.open();
    } catch (error) {
      resetLoadingState();
      setErrormsg(isErrorDispaly(error));
    }
  };

  const getPreviewData = async () => {
    Keyboard.dismiss();
    
    // Full validation before any API calls
    const amountError = validateAmounts();
    if (amountError) {
      setErrormsg(amountError);
      return;
    }
    
    const balanceError = validateBalance();
    if (balanceError) {
      setErrormsg(balanceError);
      return;
    }
    
    if (!showSummary) {
      setPreViewDataLoading(true);
      setErrormsg("");
      setDisableBtn(true);
      await handlePreviewValidation();
    } else {
      await handleConfirmTransaction();
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
    setErrormsg("");
    
    // Trigger conversion if there's an existing amount
    if (changeAmt && changeAmt !== "" && selectedValue) {
      getFromAssetValue(changeAmt, selectedValue, val?.code, setCryptoConvertVal);
    }
    
    // Reset flag after state update
    setTimeout(() => {
      isDropdownChanging.current = false;
    }, 1000);
  };

  const handleGoBack = useCallback(() => {
    if (props?.route?.params?.fromScreen === 'ExchangeCryptoList') {
      navigation.goBack();
    } else {
      (navigation as any).navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.EXCHANGE", animation: "slide_from_left" });
    }
  }, [navigation, props?.route?.params]);

  const handleMaxValue = useCallback(() => {
    const availableBalance = parseFloat(getDropDownObj?.amount || 0);
    const buyMax = getDropDownObj?.buyMax;
    
    // Determine max value based on scenarios
    let maxValue = availableBalance;
    
    // If buyMax exists (not null), use the smaller of buyMax or available balance
    if (buyMax !== null && buyMax !== undefined) {
      maxValue = buyMax
    }
    
    const fixedResult = maxValue.toFixed(configDecimals);
    setChangeAmt(fixedResult);
    getFromAssetValue(fixedResult, selectedValue, fiatSelectedVal, setCryptoConvertVal);
    setErrormsg("");
    clearSummary();
  }, [getDropDownObj, selectedValue, fiatSelectedVal]);
  const handleMinValue = useCallback(() => {
    const buyMin = getDropDownObj?.buyMin;
    
    // Only set min value if buyMin is not null
    if (buyMin !== null && buyMin !== undefined) {
      const fixedResult = parseFloat(buyMin).toFixed(configDecimals);
      setChangeAmt(fixedResult);
      getFromAssetValue(fixedResult, selectedValue, fiatSelectedVal, setCryptoConvertVal);
      setErrormsg("");
      clearSummary();
    }
  }, [getDropDownObj, selectedValue, fiatSelectedVal]);

  const handleSuccessClose = useCallback(() => {
    successSheetRef?.current?.close();
    (navigation as any).navigate('ExchangeCryptoList', { animation: "slide_from_left" });
  }, [navigation]);

  const handleBackToExchangeDashboard = useCallback(() => {
    successSheetRef?.current?.close();
    (navigation as any).navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.EXCHANGE", animation: "slide_from_left" });
  }, [navigation]);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async() => {
    setRefreshing(true);
    await getCryptoCoins();
    await getFiatAssetsData();
    setRefreshing(false);
  };

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={commonStyles.container}>
        <PageHeader title={`${t("GLOBAL_CONSTANTS.BUY")} ${coinName || ''}`} onBackPress={handleGoBack} />
        {(errormsg !== "" || hookError !== "") && (
          <ErrorComponent
            message={errormsg || hookError}
            onClose={() => { setErrormsg(""); clearError(); }}
          />
        )}

       {refreshing&& (<ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                        <DashboardLoader />
                    </ViewComponent>)}
       { !refreshing&&  <ViewComponent style={[commonStyles.flex1]}>
          <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            extraScrollHeight={20}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>}
            style={[commonStyles.flex1]}
          >

            <ViewComponent style={[commonStyles.gap6, commonStyles.relative, commonStyles.flexCol]}>
              <ViewComponent style={[{ height: s(130) }, commonStyles.bgnote, commonStyles.flexCol, commonStyles.justifyContent]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                  <LabelComponent text={`${t("GLOBAL_CONSTANTS.YOU_BUY")}`} style={[commonStyles.availbleamountbuylabel, commonStyles.mt6]} />
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                    <ParagraphComponent style={[commonStyles.availblelabel]} text={`${t("GLOBAL_CONSTANTS.AVAILABLE")} : `} />
                    <CurrencyText
                      value={getDropDownObj?.amount || 0}
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
                      setErrormsg("");

                      if (!text || text.trim() === "") {
                        setChangeAmt('');
                        setInputValue('');
                        setCryptoConvertVal("");
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
                        cleanText = integerPart + '.' + fractionalPart.slice(0, configDecimals);
                      }

                      setChangeAmt(cleanText);
                      setInputValue(cleanText);
                    }}
                    value={(() => {
                      if (!changeAmt || changeAmt === "") return "";

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
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mb10, 
                      // If only MAX exists (MIN is null), align to right
                      (getDropDownObj?.buyMin === null || getDropDownObj?.buyMin === undefined) && 
                      (getDropDownObj?.buyMax !== null && getDropDownObj?.buyMax !== undefined) 
                        ? commonStyles.justifyend 
                        : commonStyles.justifyContent
                    ]}>

                      
                      {/* Show MIN only if buyMin is not null */}
                      {getDropDownObj?.buyMin !== null && getDropDownObj?.buyMin !== undefined && (
                        <CommonTouchableOpacity onPress={handleMinValue}>
                          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                            <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textprimary]} text={`${t("GLOBAL_CONSTANTS.MIN")}  `} />
                            <CurrencyText
                              value={getDropDownObj?.buyMin || 0}
                              decimalPlaces={4}
                              currency={selectedValue || ''}
                              style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textprimary]}
                            />
                          </ViewComponent>
                        </CommonTouchableOpacity>
                      )}
                      
                      {/* Show MAX only if buyMax is not null */}
                      {getDropDownObj?.buyMax !== null && getDropDownObj?.buyMax !== undefined && (
                        <CommonTouchableOpacity onPress={handleMaxValue}>
                          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                            <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textprimary]} text={`${t("GLOBAL_CONSTANTS.MAX")}  `} />
                            <CurrencyText
                              value={parseFloat(getDropDownObj?.buyMax)}
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

              <ViewComponent style={[commonStyles.bgnote, commonStyles.justifyContent, { minHeight: s(60) }]}>
                <ViewComponent style={[commonStyles.mb10, commonStyles.mt10, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent,]}>
                  <LabelComponent text={`${t("GLOBAL_CONSTANTS.YOU_PAY")}`} style={[commonStyles.availbleamountbuylabel,]} />
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








                  <ViewComponent style={[commonStyles.justifyAround,]}>
                    {changeAmountLoader ? (
                      <Loadding contenthtml={payLoader} />
                    ) : (
                      <TextInput
                        style={[commonStyles.secondryamountInputLabel]}
                        placeholder="0.00"
                        onChangeText={(text) => {
                          clearSummary();
                          setErrormsg("");
                          
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

              <ViewComponent style={[commonStyles.relative, { position: "absolute", left: "50%", top: s(134), transform: [{ translateX: -s(18) }, { translateY: -s(18) }], minHeight: s(37), minWidth: s(37) }]}>
                <ViewComponent style={[commonStyles.buyiconbg]}>
                  <FontAwesome6Icon name="arrow-up-long" size={s(16)} color={NEW_COLOR.TEXT_WHITE} />
                </ViewComponent>
              </ViewComponent>
            </ViewComponent>

            {showSummary && summaryData && (
              <ViewComponent style={[]}>
                <ViewComponent style={[commonStyles.sectionGap]} />
                <ParagraphComponent text={t("GLOBAL_CONSTANTS.SUMMARY")} style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />
                <ViewComponent >
                  {/* <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent,commonStyles.flexWrap,commonStyles.gap8]}>
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

                  <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={t("GLOBAL_CONSTANTS.AMOUNT")} />
                    <CurrencyText
                      value={summaryData.assetValue || 0}
                      decimalPlaces={4}
                      currency={selectedValue}
                      style={[commonStyles.listprimarytext]}
                    />
                  </ViewComponent>
                  <ViewComponent style={[commonStyles.listitemGap]} />

                  <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={t("GLOBAL_CONSTANTS.FEE")} />
                    <CurrencyText
                      value={summaryData.fee || 0}
                      decimalPlaces={2}
                      currency={fiatSelectedVal}
                      style={[commonStyles.listprimarytext]}
                    />
                  </ViewComponent>
                  <ViewComponent style={[commonStyles.listitemGap]} />

                  <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={t("GLOBAL_CONSTANTS.YOU_PAY")} />
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
              title={showSummary ? t("GLOBAL_CONSTANTS.CONFIRM") : t("GLOBAL_CONSTANTS.BUY")}
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
            iconSize={24}
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
              subtitle={`${t("GLOBAL_CONSTANTS.YOUR_BUY_ORDER_FOR")} ${parseFloat(changeAmt || '0').toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} ${selectedValue} ${t("GLOBAL_CONSTANTS.HAS_BEEN_ADDED_FOR_SELL_AND_BUY")}`}
              buttonText={t("GLOBAL_CONSTANTS.BUY_AGAIN")}
              buttonAction={handleSuccessClose}
              secondaryButtonText={t("GLOBAL_CONSTANTS.BACK_TO_EXCHANGE_DASHBOARD")}
              secondaryButtonAction={handleBackToExchangeDashboard}
              amount={changeAmt}
              prifix={selectedValue}
              amountIsDisplay={false}
            />
          </ViewComponent>
        </CustomRBSheet>
      </Container>
    </ViewComponent>
  );
});

export default CryptoExchange;