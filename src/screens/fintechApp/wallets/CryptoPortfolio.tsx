import React, { useCallback, useMemo, useState } from 'react';
import { InteractionManager, SafeAreaView } from 'react-native';
import { s } from '../../../constants/theme/scale';
import { isErrorDispaly } from '../../../utils/helpers';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';
import { getThemedCommonStyles } from '../../../components/CommonStyles';
import {  useNavigation, useFocusEffect } from '@react-navigation/native';
import { homeServices } from '../../../apiServices/homeDashboardApis';
import TextMultiLangauge from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';

import SelectVault from '../../commonScreens/selectVaults';
import { getTabsConfigation, isDecimalSmall } from '../../../../configuration';
import { useThemeColors } from '../../../hooks/useThemeColors';
import ViewComponent from '../../../newComponents/view/view';
import { WalletsService } from '../../../apiServices/walletsApi/api';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import AddVault from '../payments/vaults/addVaults';
import ActionButton from '../../../newComponents/gradianttext/gradiantbg';
import BankDeposistIcon from '../../../components/svgIcons/mainmenuicons/bankdeposist';
import ScrollViewComponent from '../../../newComponents/scrollView/scrollView';
import { CurrencyText } from '../../../newComponents/textComponets/currencyText/currencyText';
import DashboardLoader from "../../../components/loader";
import WithdrawIcon from '../../../components/svgIcons/mainmenuicons/dashboardwithdraw';
import AssetsSection from '../Dashboard/components/AssetsSection';
import { logEvent } from '../../../hooks/loggingHook';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import KycVerifyPopup from '../../commonScreens/kycVerify';
import { AntDesign } from '@expo/vector-icons';
import { TextInput } from 'react-native-gesture-handler';
import { ms } from '../../../newComponents/theme/scale';
import { setWalletActionFilter } from '../../../redux/actions/actions';
import { getVerificationData } from '../../../apiServices/countryService';
import EnableProtectionModel from '../../commonScreens/enableProtection';
import WalletAddIcon from '../../../components/svgIcons/mainmenuicons/walletadd';

const CryptoPortfolio = (props: any) => {
  const isInTab = props?.isInTab || false;
  const [errormsg, setErrormsg] = useState("");
  const [errormsgLink, setErrormsgLink] = useState("");
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = useState<string>("");
  const NEW_COLOR = useMemo(() => useThemeColors(), []);
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const currency = getTabsConfigation('CURRENCY');
  const [loaders, setLoaders] = useState<any>({
    coinDtaLoading: false,
    totalBalLoading: true,
    isLoadingAssts: false,
    addModelVisible: false,
    kycModelVisible: false,
  });
  const [withdrawLoader, setWithdrawLoader] = useState<boolean>(false);
    const commonConfiguartion=getTabsConfigation("COMMON_CONFIGURATION");
const { baseCurrency, userInfo, walletActionFilter } = useSelector(
  (state: any) => ({
    baseCurrency: state.userReducer?.userDetails?.currency,
    userInfo: state.userReducer?.userDetails,
    walletActionFilter: state.userReducer?.walletActionFilter,
  }),
  shallowEqual
);
  const { t } = useLngTranslation();
  const dispatch = useDispatch();
  const [enableProtectionModel, setEnableProtectionModel] = useState<boolean>(false)

  const [lists, setLists] = useState<any>({
    vaultsList: [],
    vaultsPrevList: [],
    coinsList: [],
    coinsPrevList: [],
    cryptoData: [],
    totalInBaseAmount: 0
  });
  const [refresh, setRefresh] = useState<boolean>(false);

  const crypto = getTabsConfigation('CRYPTO');

useFocusEffect(
  useCallback(() => {
    if (props?.screenType && walletActionFilter !== props.screenType.toLowerCase()) {
      dispatch(setWalletActionFilter(props.screenType.toLowerCase()));
    }

    if (!isInTab || props?.isActiveTab) {
      const task = InteractionManager.runAfterInteractions(() => {
        initializeData();
      });

      return () => task.cancel();
    }
  }, [isInTab, props?.isActiveTab, props?.screenType, walletActionFilter, dispatch])
);


  const initializeData = async () => {
    setErrormsg("");
    setLoaders((prev: any) => ({ ...prev, totalBalLoading: true }));

    await Promise.all([
      fetchCrypTototalBal(),
      getCryptoCoins()
    ]);

    setLoaders((prev: any) => ({ ...prev, totalBalLoading: false }));
  };

  const onRefresh = async () => {
    setRefresh(true);
    try {
      await Promise.all([
        fetchCrypTototalBal(),
        getCryptoCoins()
      ]);
    } finally {
      setRefresh(false);
    }
  };

  const handleFontSize = (amount: number | string) => {
    const totalCryptoValue = amount?.toString();
    return totalCryptoValue?.length > 9 ? commonStyles.fs20 : commonStyles.fs30;
  };

  const getCryptoCoins = async () => {
    try {
      const response: any = await WalletsService.getShowVaults();
      if (response?.ok) {
        setLists((prev: any) => ({
          ...prev,
          vaultsList: response?.data?.wallets,
          vaultsPrevList: response?.data?.wallets,
          coinsList: response?.data?.wallets[0]?.assets || [],
          coinsPrevList: response?.data?.wallets[0]?.assets || [],
          totalInBaseAmount: response?.data?.totalInBaseAmount || 0
        }));
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    }
  };

  const fetchCrypTototalBal = async () => {
    try {
      const response: any = await homeServices.getTotalBalance();
      if (response?.ok) {
        setLists((prev: any) => ({ ...prev, cryptoData: response?.data[0] }));
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    }
  };

  const totalCryptoValue = lists?.totalInBaseAmount ?? 0;
  const handleCryptoCoinDetails = (val: any, selectedVault: any) => {
    const currentScreenType = walletActionFilter || props?.screenType;
    if (currentScreenType) {
      const screenName = props?.route?.params?.screenName || "WalletsAllCoinsList";
      const originalSource = props?.route?.params?.originalSource || "Wallets";
      props.navigation.push(currentScreenType === "deposit" ? "CryptoDeposit" : "CrptoWithdraw", {
        propsData: {
          cryptoCoin: val?.code,
          coinBalance: val?.amount,
          coinValue: val?.coinValueinNativeCurrency,
          coinNa: val?.walletCode,
          oneCoinVal: val?.amountInUSD,
          percentages: val?.percent_change_1h,
          logo: val?.logo,
          coinName: val?.code,
          marchentId: selectedVault?.id,
          merchantName: selectedVault?.merchantName || selectedVault?.name,
          coinId: val?.id
        },
        screenName: screenName,
        originalSource: originalSource
      });
    } else {
      props.navigation.push("VaultDetails", {
        cryptoCoin: val?.code,
        coinBalance: val?.amount,
        coinValue: val?.coinValueinNativeCurrency,
        coinNa: val?.walletCode,
        oneCoinVal: val?.amountInUSD,
        percentages: val?.percent_change_1h,
        logo: val?.logo,
        coinName: val?.code,
        marchentId: selectedVault?.id,
        merchantName: selectedVault?.merchantName || selectedVault?.name,
        coinId: val?.id,
      });
    }
  };

  const handleChangeSearch = useCallback((val: string) => {
    let value = val.trim();
    setSearchText(value)
    if (value) {
      const filterData = lists?.coinsPrevList?.filter((item: any) =>
        item.code?.toLowerCase().includes(value.toLowerCase())
      );
      setLists((prev: any) => ({ ...prev, coinsList: filterData }));
    } else {
      setLists((prev: any) => ({ ...prev, coinsList: lists?.coinsPrevList }));
    }
  }, [lists?.coinsPrevList]);

  const handleCloseErrror = useCallback(() => {
    setErrormsg("");
  }, []);

  const setCoinsList = (data: any) => {
    setLists((prev: any) => ({
      ...prev,
      coinsList: data || [],
      coinsPrevList: data || []
    }));
  };


  const handleNavigate = useCallback(async () => {
    logEvent("Button Pressed", { action: "Crypto wallet withdraw button", currentScreen: "Crypto wallet", nextScreen: "Select Coin" })

   if ((commonConfiguartion?.IS_SKIP_KYC_VERIFICATION_STEP !== true)&&(userInfo?.kycStatus !== "Approved"&&(userInfo?.metadata?.IsInitialKycRequired==false && userInfo?.metadata?.IsInitialVaultRequired==true))) {
      setLoaders((prev: any) => ({ ...prev, kycModelVisible: true }));
    } else {
      setWithdrawLoader(true);
      const securityVerififcationData: any = await getVerificationData();
      if (securityVerififcationData?.ok) {
        setWithdrawLoader(false);
        if ((securityVerififcationData?.data?.isEmailVerification === true || securityVerififcationData?.data?.isPhoneVerified === true)) {
          navigation.navigate('SelectVaults', { screenName: "WalletsAllCoinsList", originalSource: props?.route?.params?.originalSource || "Wallets" });
        } else {
          setEnableProtectionModel(true)
        }
      } else {
      setWithdrawLoader(false);
          setEnableProtectionModel(true)

      }
    }
  }, [navigation, userInfo?.kycStatus, t]);

  const handleDepositNavigate = useCallback(() => {
    logEvent("Button Pressed", { action: "Crypto wallet deposit button", currentScreen: "Crypto wallet", nextScreen: "Select Coin" })
    //   if (userInfo?.kycStatus !== "Approved") {
    //   setLoaders((prev: any) => ({ ...prev, kycModelVisible: true }));
    // } else{
    // navigation.navigate('SelectVaults', { screenName: 'Deposit' });
    // }
    navigation.navigate('SelectVaults', { screenName: 'Deposit' });
  }, [navigation]);

  const closeVaultModel = useCallback(() => {
    setLoaders((prev: any) => ({ ...prev, addModelVisible: !loaders?.addModelVisible }))
  }, [loaders?.addModelVisible]);
  const saveVaultMethod = () => {
    getCryptoCoins();
    setLoaders((prev: any) => ({ ...prev, addModelVisible: false }))

  };
  const handleAddVault = useCallback(() => {
    logEvent("Button Pressed", { action: "Crypto wallet add vault button", currentScreen: "Crypto wallet" });
    setLoaders((prev: any) => ({ ...prev, addModelVisible: true }))
  }, [loaders?.addModelVisible])

  const closekycModel = () => {
    setLoaders((prev: any) => ({ ...prev, kycModelVisible: false }));
  };

  const handleLink = () => {
    navigation.navigate('Security');
    setErrormsg("");
    setErrormsgLink("");
  };
  const SearchBoxComponent = useMemo(() => (
  <ViewComponent style={[commonStyles.sectionGap]}>
    <ViewComponent style={[commonStyles.searchContainer]}>
      <AntDesign name="search1" color={NEW_COLOR.SEARCH_ICON} size={ms(22)} />
      <TextInput
        value={searchText}
        style={{
          flex: 1,
          color: NEW_COLOR.TEXT_WHITE,
          fontSize: s(16),
          paddingVertical: s(10),
          backgroundColor: 'transparent',
        }}
        onChangeText={handleChangeSearch}
        placeholder={t("GLOBAL_CONSTANTS.SEARCH")}
        placeholderTextColor={NEW_COLOR.PLACEHOLDER_COLOR}
      />
    </ViewComponent>
  </ViewComponent>
), [commonStyles, NEW_COLOR, searchText, handleChangeSearch, t]);

  const closeEnableProtectionModel = () => {
    setEnableProtectionModel(false)
  }
  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      {loaders?.totalBalLoading &&
        <SafeAreaView style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </SafeAreaView>
      }



      {!loaders?.totalBalLoading && (
        <ViewComponent style={[commonStyles.flex1]}>
          {
            <ScrollViewComponent 
              showsVerticalScrollIndicator={false}
              refreshing={refresh}
              onRefresh={onRefresh}
            >
              <ViewComponent style={commonStyles.sectionGap} />
              {errormsg != "" && (
                <ErrorComponent
                  message={errormsg}
                  onClose={handleCloseErrror}
                  handleLink={errormsgLink ? handleLink : undefined}
                >
                  {errormsgLink || ""}
                </ErrorComponent>
              )}
              <ViewComponent>
                <ViewComponent>
                  <TextMultiLangauge
                    text={"GLOBAL_CONSTANTS.TOTAL_CRYPTO"}
                    style={[
                      commonStyles.transactionamounttextlabel
                    ]}
                  />
                  <CurrencyText value={totalCryptoValue} smallDecimal={isDecimalSmall} prifix={currency[baseCurrency]} decimalPlaces={2} style={[handleFontSize(totalCryptoValue), commonStyles.transactionamounttext]} />
                </ViewComponent>
                <ViewComponent style={[commonStyles.sectionGap]} />
              </ViewComponent>
              {!props?.screenType && !walletActionFilter && <ViewComponent>
                <ViewComponent
                  style={[
                    commonStyles.quicklinksgap,
                    commonStyles.sectionGap
                  ]}
                >
                  {crypto?.QUCIKLINKS?.AddVault && (<ViewComponent style={[commonStyles.quicklinksflex]}>

                    <CommonTouchableOpacity>
                      <ActionButton
                        text={"GLOBAL_CONSTANTS.WALLET"}
                        onPress={handleAddVault}
                        customTextColor={NEW_COLOR.TEXT_ALWAYS_WHITE}
                        useGradient
                        customIcon={<WalletAddIcon />}
                      />
                    </CommonTouchableOpacity>
                  </ViewComponent>)}
                  <ViewComponent style={[commonStyles.quicklinksflex]}>
                    {crypto?.QUCIKLINKS?.Deposit && (
                      <CommonTouchableOpacity>
                        <ActionButton
                          text={"GLOBAL_CONSTANTS.DEPOSIT"}
                          onPress={handleDepositNavigate}
                          useGradient={true}
                          disable={withdrawLoader}
                          customTextColor={NEW_COLOR.TEXT_ALWAYS_WHITE}
                          customIcon={<BankDeposistIcon />}
                        />
                      </CommonTouchableOpacity>
                    )}
                  </ViewComponent>
                  <ViewComponent style={[commonStyles.quicklinksflex]}>
                    {crypto?.QUCIKLINKS?.Withdraw && (
                      <CommonTouchableOpacity>
                        <ActionButton
                          text={"GLOBAL_CONSTANTS.WITHDRAW"}
                          onPress={handleNavigate}
                          customTextColor={NEW_COLOR.BUTTON_TEXT}
                          customIcon={<WithdrawIcon />}
                          loading={withdrawLoader}
                          disable={withdrawLoader}
                        />
                      </CommonTouchableOpacity>
                    )}
                  </ViewComponent>
                </ViewComponent>
              </ViewComponent>}
              <ViewComponent>{SearchBoxComponent}</ViewComponent>
              <ViewComponent>
                {lists?.vaultsList?.length > 1 ? (
                  <SelectVault
                    setCoinsList={setCoinsList}
                    vaultsList={lists?.vaultsList}
                    coinsList={lists?.coinsList}
                    valutsPrevList={lists?.vaultsPrevList}
                    isLoading={loaders?.coinDtaLoading}
                    disable={true}
                    handleNavigate={handleCryptoCoinDetails}
                    handleChangeSearch={handleChangeSearch}
                    key={'selectVaultComponent'}
                  />
                ) : (
                  <AssetsSection
                    commonStyles={commonStyles}
                    GraphConfiguration={getTabsConfigation('ADDS_AND_GRAPG_CONFIGURATION')}
                    assets={lists?.coinsList}
                    vaultsLists={lists}
                    vaultCoinsLists={lists}
                    handleChangeSearch={handleChangeSearch}
                    handleNavigate={handleCryptoCoinDetails}
                    NEW_COLOR={NEW_COLOR}
                    setCoinsList={setCoinsList}
                    showHeader={false}
                  />
                )}
              </ViewComponent>
            </ScrollViewComponent>
          }
        </ViewComponent>
      )}
      <ViewComponent style={[commonStyles?.mb20]} />
      <ViewComponent style={[commonStyles?.mb20]} />

      {loaders?.addModelVisible && <AddVault addModelVisible={loaders?.addModelVisible} closeModel={closeVaultModel} saveVault={saveVaultMethod} />}
      {loaders?.kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={loaders?.kycModelVisible} />}
      <ViewComponent>
        {enableProtectionModel && <EnableProtectionModel
          navigation={props.navigation}
          closeModel={closeEnableProtectionModel}
          addModelVisible={enableProtectionModel}
        />}
      </ViewComponent>
    </ViewComponent>
  );
};

export default CryptoPortfolio;
