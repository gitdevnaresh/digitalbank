import React, { useCallback, useEffect, useState } from 'react';
import { isErrorDispaly } from '../../../../utils/helpers';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import { useIsFocused } from '@react-navigation/native';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import ViewComponent from '../../../../newComponents/view/view';
import { WalletsService } from '../../../../apiServices/walletsApi/api';
import ScrollViewComponent from '../../../../newComponents/scrollView/scrollView';
import DashboardLoader from "../../../../components/loader";
import CommonTouchableOpacity from '../../../../newComponents/touchableComponents/touchableOpacity';
import { FiatAsset, FiatData, FiatLoaders, FiatPortfolioProps } from './vaultsInterface';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import AssetListComponent from './AssetListComponent';
import ActionButton from '../../../../newComponents/gradianttext/gradiantbg';
import WithdrawIcon from '../../../../components/svgIcons/mainmenuicons/dashboardwithdraw';
import DeposistIcon from '../../../../components/svgIcons/mainmenuicons/dashboarddeposist';
import { CurrencyText } from '../../../../newComponents/textComponets/currencyText/currencyText';
import SafeAreaViewComponent from '../../../../newComponents/safeArea/safeArea';
import { getTabsConfigation, isDecimalSmall } from '../../../../../configuration';
import { useSelector } from 'react-redux';
import { logEvent } from '../../../../hooks/loggingHook';
import TransactionService from '../../../../apiServices/transaction';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import KycVerifyPopup from '../../../commonScreens/kycVerify';
import { getVerificationData } from '../../../../apiServices/countryService';
import EnableProtectionModel from '../../../commonScreens/enableProtection';
 
const FiatPortfolio = (props: FiatPortfolioProps) => {
  const isInTab = props?.isInTab || false;
  const [errormsg, setErrormsg] = useState<string>("");
  const [errormsgLink, setErrormsgLink] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [kycModelVisible, setKycModelVisible] = useState(false);
  const isFocused = useIsFocused();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const currency = getTabsConfigation('CURRENCY');
  const baseCurrency = useSelector((state: any) => state.userReducer?.userDetails?.currency);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const { t } = useLngTranslation();
  const [loaders, setLoaders] = useState<FiatLoaders>({
    fiatDataLoading: false,
  });
  const [withdrawLoader, setWithdrawLoader] = useState<boolean>(false);
 
  const [fiatData, setFiatData] = useState<FiatData>({
    totalBalanceInUSD: 0,
    assets: [],
    assetsPrev: []
  });
  const [enableProtectionModel, setEnableProtectionModel] = useState<boolean>(false)
 

 
  useEffect(() => {
    if (!isInTab || props?.isActiveTab) {
      initializeData();
    }
  }, [isFocused, isInTab, props?.isActiveTab]);

  const initializeData = async () => {
    setErrormsg("");
    setLoaders((prev: FiatLoaders) => ({ ...prev, fiatDataLoading: true }));
    
    await Promise.all([
      getFiatAssets(),
    ]);
    
    setLoaders((prev: FiatLoaders) => ({ ...prev, fiatDataLoading: false }));
  };
 
  const getFiatAssets = async (): Promise<void> => {
    try {
      const response = await WalletsService.getFiatVaultsList();
      if (response?.ok) {
        const responseData = response?.data as { totalBalanceInUSD?: number; assets?: FiatAsset[] };
        setFiatData({
          totalBalanceInUSD: responseData?.totalBalanceInUSD || 0,
          assets: responseData?.assets || [],
          assetsPrev: responseData?.assets || []
        });
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
              setErrormsg(isErrorDispaly(error));
    }
  };
 
  const handleChangeSearch = useCallback((val: string): void => {
    const value = val.trim();
    setSearchText(value);
    if (value) {
      const filterData = fiatData?.assetsPrev?.filter((item: FiatAsset) =>
        item.code?.toLowerCase().includes(value.toLowerCase())
      ) || [];
      setFiatData((prev: FiatData) => ({ ...prev, assets: filterData }));
    } else {
      setFiatData((prev: FiatData) => ({ ...prev, assets: fiatData?.assetsPrev }));
    }
  }, [fiatData?.assetsPrev]);
 
  const handleItemPress = (item: FiatAsset): void => {
    const currentScreenType = props?.screenType?.toLowerCase();
    
    if (currentScreenType === "deposit") {
      props.navigation?.navigate('FiatDeposit', {
        currency: item?.code
      });
    } else if (currentScreenType === "withdraw") {
      props.navigation?.navigate('FiatWithdrawForm', {
        currency: item?.code,
        screenName: props?.route?.params?.screenName
      });
    } else {
      props.navigation?.navigate('FiatCoinDetails', item);
    }
  };
 
  const handleCloseError = useCallback(() => {
    setErrormsg("");
  }, []);

  const closekycModel = () => {
    setKycModelVisible(false);
  };

  const handleLink = () => {
    props.navigation?.navigate('Security');
    setErrormsg("");
    setErrormsgLink("");
  };
 
  const handleDeposit = (): void => {
    logEvent("Button Pressed", { action: "Fiat Deposit",nextScreen: "Fiat Coin Selection" ,currentScreen: "Fiat tab"})
    props.navigation?.navigate('AssetSelector', {
      screenType: 'deposit',
      title: 'GLOBAL_CONSTANTS.SELECT_ASSET_FOR_DEPOSIT'
    });
  };
  const handleWithdraw = async (): Promise<void> => {
    logEvent("Button Pressed", { action: "Fiat Withdraw", nextScreen: "Fiat Coin Selection", currentScreen: "Fiat tab" });
    setErrormsg('');
    setErrormsgLink('');
    if (userInfo?.kycStatus !== "Approved") {
      setKycModelVisible(true);
    } else {
      setWithdrawLoader(true);
      const securityVerififcationData: any = await getVerificationData();
      if (securityVerififcationData?.ok) {
      setWithdrawLoader(false);
        if ((securityVerififcationData?.data?.isEmailVerification === true || securityVerififcationData?.data?.isPhoneVerified === true)) {
          props.navigation?.navigate('AssetSelector', {
            screenType: 'withdraw',
            title: 'GLOBAL_CONSTANTS.SELECT_ASSET_FOR_WITHDRAW'
          });
        } else {
          setEnableProtectionModel(true)
        }
      } else {
      setWithdrawLoader(false);
      setEnableProtectionModel(true)
      }
    }
  };
 
   const closeEnableProtectionModel = () => {
        setEnableProtectionModel(false)
    }
 
  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      {loaders?.fiatDataLoading && (
        <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </SafeAreaViewComponent>
      )}
 
      {!loaders?.fiatDataLoading && (
        <ViewComponent style={[commonStyles.flex1]}>
          {
            <ScrollViewComponent showsVerticalScrollIndicator={false}>
              <ViewComponent style={commonStyles.sectionGap} />
              {errormsg!="" && (
                <ErrorComponent
                  message={errormsg}
                  onClose={handleCloseError}
                  handleLink={errormsgLink ? handleLink : undefined}
                >
                  {errormsgLink || ""}
                </ErrorComponent>
              )}
              {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={kycModelVisible} />}
              <ViewComponent>
                {enableProtectionModel && <EnableProtectionModel
                  navigation={props.navigation}
                  closeModel={closeEnableProtectionModel}
                  addModelVisible={enableProtectionModel}
                />}
              </ViewComponent>
             
              {/* Total Fiat Value Section */}
              <ViewComponent>
                   <TextMultiLanguage
                  text='GLOBAL_CONSTANTS.TOTAL_FIAT'
                  style={[
                    commonStyles.transactionamounttextlabel
                  ]}
                />
                <CurrencyText
                  value={fiatData?.totalBalanceInUSD || 0}
                   prifix={currency[baseCurrency]}
                  smallDecimal={isDecimalSmall}
                  style={[
                    commonStyles.transactionamounttext
                  ]}
                />
             
              </ViewComponent>
             
              <ViewComponent style={[commonStyles.sectionGap]} />
             
              {/* Action Buttons */}
              {!props?.screenType && <ViewComponent style={[
                commonStyles.dflex,
                commonStyles.alignStart,
                commonStyles.justifyContent,
                commonStyles.gap10
              ]}>
                <ViewComponent style={[commonStyles.flex1]}>
                  <CommonTouchableOpacity>
                    <ActionButton
                      text="GLOBAL_CONSTANTS.DEPOSIT"
                      onPress={handleDeposit}
                      useGradient={true}
                      customTextColor={NEW_COLOR.TEXT_ALWAYS_WHITE}
                      customIcon={<DeposistIcon />}
                      disable={withdrawLoader}
                    />
                  </CommonTouchableOpacity>
                </ViewComponent>
               
                <ViewComponent style={[commonStyles.flex1]}>
                  <CommonTouchableOpacity>
                    <ActionButton
                      text="GLOBAL_CONSTANTS.WITHDRAW"
                      onPress={handleWithdraw}
                      customTextColor={NEW_COLOR.BUTTON_TEXT}
                      customIcon={<WithdrawIcon />}
                      loading={withdrawLoader}
                      disable={withdrawLoader}
                    />
                  </CommonTouchableOpacity>
                </ViewComponent>
              </ViewComponent>}
             
              <ViewComponent style={[commonStyles.sectionGap]} />
              <AssetListComponent
                assets={fiatData?.assets}
                selectedItem={null}
                searchText={searchText}
                onSearchChange={handleChangeSearch}
                onItemSelect={() => {}}
                onItemPress={handleItemPress}
              />
            </ScrollViewComponent>
           }
        </ViewComponent>
      )}

    </ViewComponent>
  );
};
 
export default FiatPortfolio;
