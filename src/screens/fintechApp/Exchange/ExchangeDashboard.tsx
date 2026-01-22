import React, { useEffect, useState, FC, useCallback, useRef } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RefreshControl, BackHandler } from "react-native";
import { useIsFocused, useFocusEffect } from "@react-navigation/native";
import { showAppToast } from "../../../newComponents/toasterMessages/ShowMessage";
import { isErrorDispaly } from "../../../utils/helpers";
import ExchangeServices from "../../../apiServices/exchange";
import TransactionService from "../../../apiServices/transaction";
import { getTabsConfigation } from "../../../../configuration";
import SafeAreaViewComponent from "../../../newComponents/safeArea/safeArea";
import ViewComponent from "../../../newComponents/view/view";
import ScrollViewComponent from "../../../newComponents/scrollView/scrollView";
import Container from "../../../newComponents/container/container";
import ExchangeBalanceCarousel from "./components/exchangeBalanceCarousel";
import CommonTouchableOpacity from "../../../newComponents/touchableComponents/touchableOpacity";
import ActionButton from "../../../newComponents/gradianttext/gradiantbg";
import SellIcon from "../../../components/svgIcons/mainmenuicons/buyexchange";
import { RootStackParamList } from "../../../navigations/navigation-types";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../../components/CommonStyles";
import SellExchangeIcon from "../../../components/svgIcons/mainmenuicons/buysell";
import FlatListComponent from "../../../newComponents/flatList/flatList";
import SvgFromUrl from "../../../components/svgIcon";
import { CurrencyText } from "../../../newComponents/textComponets/currencyText/currencyText";
import { CoinImages } from "../../../components/CommonStyles";
import { s } from "../../../newComponents/theme/scale";
import RecentTransactions from "../../commonScreens/transactions/recentTransactions";
import KycVerifyPopup from "../../commonScreens/kycVerify";
import DashboardLoader from "../../../components/loader";
import LineChartComponet from "../../../newComponents/graphs/Linchart";
import NoDataComponent from "../../../newComponents/noData/noData";
import TextMultiLanguage from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import ParagraphComponent from "../../../newComponents/textComponets/paragraphText/paragraph";
import { DaysLookup } from "../Dashboard/constant";
import { homeanalyticsGraph } from "../Dashboard/skeltons";
import Loadding from "../../commonScreens/skeltons";
import { useSelector, useDispatch } from "react-redux";
import { setExchangeDashboard, clearExchangeDashboard } from "../../../redux/actions/actions";
import { useScreenPerfLogger } from "../../../hooks/performance/performanceHook";
type ExchangeDashboardProps = NativeStackScreenProps<RootStackParamList, "Exchange">;

const ExchangeDashboard: FC<ExchangeDashboardProps> = React.memo((props: any) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const isFocused = useIsFocused();
  const scrollViewRef = useRef<any>(null);
  const [refresh, setRefresh] = useState<boolean>(false);
  const cardGraphSkelton = homeanalyticsGraph();
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const { exchangeDashboard } = useSelector((state: any) => state.userReducer);
  const dispatch = useDispatch<any>();
  const Configuration = getTabsConfigation('ADDS_AND_GRAPG_CONFIGURATION');

  // Derived state from Redux - Exchange Dashboard
  const exchangeBalance = exchangeDashboard?.balance || [];
  const exchangeCryptoAssets = exchangeDashboard?.cryptoAssets || { assets: [] };
  const exchangeFiatAssets = exchangeDashboard?.fiatAssets || [];

  // Helper to determine if dashboard has any meaningful data
  const hasExchangeData = () => {
    const balanceHas = Array.isArray(exchangeBalance) && exchangeBalance.length > 0;
    const cryptoHas = Array.isArray(exchangeCryptoAssets?.assets) && exchangeCryptoAssets.assets.length > 0;
    const fiatHas = Array.isArray(exchangeFiatAssets) && exchangeFiatAssets.length > 0;
    return balanceHas || cryptoHas || fiatHas;
  };
   const { stopTrace } = useScreenPerfLogger("Wallets_dashboard");

  const hasLoadedOnce = useRef(false);
  const isInitializing = useRef(false);

  const [state, setState] = useState({
    balanceData: { cryptoBalance: 0, fiatBalance: 0 },
    apiData: [],
    errormsg: "",
    isLoading: true,
    kycModelVisible: false,
    recentTranscationReload: false,
    cryptoRefresh: false,
    cryptoData: { assets: [] },
    fiatData: { assets: [] },
    grphDetails: [],
    activeYear: '7',
    graphDetailsLoading: false,
    apiCallsCompleted: { balance: false, crypto: false, fiat: false, cryptoList: false },
    initialChartLoaded: false,
    exchangeCryptoList: [],
    isRefreshing: false,
    // Graph data stored in state
    graphData7Days: null,
    graphData30Days: null
  });

  const updateState = (newState: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...newState }));
  };


  const getBalanceData = async () => {
    try {
      const response: any = await ExchangeServices.getTotalFiatandCryptoBalances();
      if (response?.ok) {
        const data = response.data as any[];
        const cryptoBalance = data?.find((item: any) => item?.name === 'Crypto Balance')?.value || 0;
        const fiatBalance = data?.find((item: any) => item?.name === 'Fiat Balance')?.value || 0;
        updateState({
          balanceData: { cryptoBalance, fiatBalance },
          apiData: data
        });
        dispatch(setExchangeDashboard({ balance: data }));
      } else {
        showAppToast(isErrorDispaly(response), 'error');
      }
    } catch (error) {
      showAppToast(isErrorDispaly(error), 'error');
    } finally {
      setState(prev => ({ ...prev, apiCallsCompleted: { ...prev.apiCallsCompleted, balance: true } }));
    }
  };


  const getExchangeCryptoList = async () => {
    try {
      const response: any = await ExchangeServices.getexchangeCryptoList(1, 10);
      if (response?.ok) {
        dispatch(setExchangeDashboard({ cryptoAssets: response.data }));
      } else {
        showAppToast(isErrorDispaly(response), 'error');
      }
    } catch (error) {
      showAppToast(isErrorDispaly(error), 'error');
    } finally {
      setState(prev => ({ ...prev, apiCallsCompleted: { ...prev.apiCallsCompleted, crypto: true, cryptoList: true } }));
    }
  };

  const getFiatData = async () => {
    try {
      const response: any = await ExchangeServices.getSelecteCryptoBalance();
      if (response?.ok) {
        updateState({ fiatData: { assets: response.data?.fiatAssets || [] } });
        dispatch(setExchangeDashboard({ fiatAssets: response.data?.fiatAssets || [] }));
      } else {
        showAppToast(isErrorDispaly(response), 'error');
      }
    } catch (error) {
      showAppToast(isErrorDispaly(error), 'error');
    } finally {
      setState(prev => ({ ...prev, apiCallsCompleted: { ...prev.apiCallsCompleted, fiat: true } }));
    }
  };



  const getExchangeGraphData = async (isDays?: any) => {
    // Check if data exists in state first
    if (isDays === '7' && state.graphData7Days) {
      updateState({ grphDetails: state.graphData7Days });
      return;
    }
    if (isDays === '30' && state.graphData30Days) {
      updateState({ grphDetails: state.graphData30Days });
      return;
    }

    try {
      updateState({ graphDetailsLoading: true });
      const response: any = await ExchangeServices.getExchangeGraph(isDays);

      if (response?.ok) {
        const graphData = response.data.transactionsModels || [];
        updateState({ 
          grphDetails: graphData,
          ...(isDays === '7' && { graphData7Days: graphData }),
          ...(isDays === '30' && { graphData30Days: graphData })
        });
      } else {
        showAppToast(isErrorDispaly(response), 'error');
      }
    } catch (error) {
      showAppToast(isErrorDispaly(error), 'error');
    } finally {
      updateState({ graphDetailsLoading: false });
    }
  };

  const fetchInitialData = async (calledFromRefresh = false) => {

    // Don't modify isLoading if called from refresh - let onRefresh handle it
    if (!calledFromRefresh) {
      const shouldShowLoader = Configuration?.DASHBOARD_LOADER;
      const hasRedux = hasExchangeData();
      const shouldSetLoading = shouldShowLoader || !hasRedux;

      updateState({
        isLoading: shouldSetLoading,
        errormsg: "",
        recentTranscationReload: false,
        cryptoRefresh: !state.cryptoRefresh,
        activeYear: '7',
        graphData7Days: null,
        graphData30Days: null,
        apiCallsCompleted: { balance: false, crypto: false, fiat: false, cryptoList: false }
      });
    } else {
      // Only update non-loading related state when called from refresh
      updateState({
        errormsg: "",
        recentTranscationReload: false,
        cryptoRefresh: !state.cryptoRefresh,
        activeYear: '7',
        graphData7Days: null,
        graphData30Days: null,
        apiCallsCompleted: { balance: false, crypto: false, fiat: false, cryptoList: false }
      });
    }

    try {
      await Promise.all([
        getBalanceData(),
        getFiatData(),
        getExchangeCryptoList()
      ]);
    } catch (error) {
      showAppToast(isErrorDispaly(error), 'error');
    } finally {
      // Only set loading to false if not called from refresh
      if (!calledFromRefresh) {
        updateState({ isLoading: false });
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Check if Redux data exists and configuration allows loader
      const shouldShowLoader = Configuration?.DASHBOARD_LOADER;
      const hasRedux = hasExchangeData();

      // Initialize component state from Redux data if available
      if (hasRedux) {
        const cryptoBalance = exchangeBalance?.find((item: any) => item?.name === 'Crypto Balance')?.value || 0;
        const fiatBalance = exchangeBalance?.find((item: any) => item?.name === 'Fiat Balance')?.value || 0;
        
        updateState({
          balanceData: { cryptoBalance, fiatBalance },
          apiData: exchangeBalance,
          cryptoData: exchangeCryptoAssets,
          exchangeCryptoList: exchangeCryptoAssets?.assets || [],
          fiatData: { assets: exchangeFiatAssets }
        });
      }
      
      // Show loader based on configuration or Redux data
      if (shouldShowLoader) {
        updateState({ isLoading: true });
      } else {
        updateState({ isLoading: !hasRedux });
      }

      const initializeData = async () => {
        if (isInitializing.current) {
          return;
        }
        
        isInitializing.current = true;
        updateState({ activeYear: '7', initialChartLoaded: false });
        updateState({
          errormsg: "",
          cryptoRefresh: !state.cryptoRefresh,
          apiCallsCompleted: { balance: false, crypto: false, fiat: false, cryptoList: false }
        });

        hasLoadedOnce.current = true;

        // Always make API calls to refresh data
        try {
          await Promise.all([
            getBalanceData(),
            getFiatData(),
            getExchangeCryptoList()
          ]);
        } catch (error) {
          showAppToast(isErrorDispaly(error), 'error');
        } finally {
          isInitializing.current = false;
        }
      };

      initializeData();
       stopTrace();
      scrollViewRef?.current?.scrollTo({ y: 0, animated: true });
      return () => {
      };
    }, [hasExchangeData(), Configuration?.DASHBOARD_LOADER])
  );

  // Dashboard loader control - show until crypto API completes
  useEffect(() => {
    // Don't interfere with loading state during refresh
    if (state.isRefreshing) return;

    const cryptoApiCompleted = state.apiCallsCompleted.crypto;
    
    // Hide loader only when crypto API call is completed
    if (cryptoApiCompleted && state.isLoading) {
      updateState({ isLoading: false });
    }
  }, [state.apiCallsCompleted.crypto, state.isRefreshing]);

  // Load chart data independently (not tied to dashboard loader)
  useFocusEffect(
    useCallback(() => {
      if (!state.initialChartLoaded) {
        getExchangeGraphData('7');
        updateState({ initialChartLoaded: true });
      }
    }, [state.initialChartLoaded])
  );

  // Load chart data when activeYear changes (but not on initial load)
  useEffect(() => {
    if (state.initialChartLoaded && state.activeYear !== '7') {
      getExchangeGraphData(state.activeYear);
    }
  }, [state.activeYear, state.initialChartLoaded]);

  useEffect(() => {
    const backAction = () => {
      return true; // Prevent default back behavior
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const onRefresh = useCallback(() => {
    setRefresh(true);
    updateState({ isLoading: true, isRefreshing: true });

    Promise.all([
      fetchInitialData(true),
      getExchangeGraphData(state.activeYear)
    ]).finally(() => {
      setRefresh(false);
      updateState({ isLoading: false, isRefreshing: false });
    });
  }, [state.activeYear]);

  const crypto = getTabsConfigation("EXCHANGE");

  const closekycModel = () => {
    updateState({ kycModelVisible: false });
  };

  const handleBuyNav = useCallback(() => {
    if (userInfo?.kycStatus?.toLowerCase() !== "approved") {
      setState(prev => ({ ...prev, kycModelVisible: true }));
    }else{
      props.navigation.navigate('ExchangeCryptoList');
    }
  }, []);
  const handleSellNav = useCallback(() => {
    if (userInfo?.kycStatus?.toLowerCase() !== "approved") {
      setState(prev => ({ ...prev, kycModelVisible: true }));
    }else{
      props.navigation.navigate('ExchangeCryptoList', { type: 'sell' });
    }
  }, []);



  const handleRecentTranscationReloadDetails = (reload: boolean, error?: string | null) => {
    updateState({ recentTranscationReload: reload });
    if (error) {
      updateState({ errormsg: '' });
    }
  };

  const handleYears = (item: any) => {
    const newYear = item?.name;
    updateState({ activeYear: newYear });
    
    // Use stored data if available, otherwise call API
    if (newYear === '7' && state.graphData7Days) {
      updateState({ grphDetails: state.graphData7Days });
    } else if (newYear === '30' && state.graphData30Days) {
      updateState({ grphDetails: state.graphData30Days });
    } else {
      getExchangeGraphData(newYear);
    }
  };

  return (
    <SafeAreaViewComponent style={[commonStyles.screenBg]}>
      {state.isLoading ? (
        <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </ViewComponent>
      ) : (
        <ScrollViewComponent ref={scrollViewRef} refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} />}>
          <Container style={[commonStyles.container]}>
            <ViewComponent>
              <ViewComponent>
                <ViewComponent style={[commonStyles.sectionGap]}>
                  <ExchangeBalanceCarousel
                    cryptoBalance={exchangeBalance?.find((item: any) => item?.name === 'Crypto Balance')?.value || state.balanceData.cryptoBalance}
                    fiatBalance={exchangeBalance?.find((item: any) => item?.name === 'Fiat Balance')?.value || state.balanceData.fiatBalance}
                    apiData={exchangeBalance.length > 0 ? exchangeBalance : state.apiData}
                    assets={{
                      crypto: exchangeCryptoAssets?.assets?.length > 0 ? exchangeCryptoAssets.assets : state.cryptoData.assets,
                      fiat: exchangeFiatAssets?.length > 0 ? exchangeFiatAssets : state.fiatData.assets
                    }}
                  />
                </ViewComponent>
                <ViewComponent>

                  <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap10, commonStyles.sectionGap]}>
                    {crypto?.QUCIKLINKS?.Buy && (
                      <ViewComponent style={[commonStyles.flex1]}>
                        <CommonTouchableOpacity>
                          <ActionButton
                            text="GLOBAL_CONSTANTS.BUY"
                            useGradient
                            onPress={handleBuyNav}
                            customIcon={<SellIcon/>}
                          />
                        </CommonTouchableOpacity>
                      </ViewComponent>
                    )}
                    {crypto?.QUCIKLINKS?.Sell && (
                      <ViewComponent style={[commonStyles.flex1]}>
                        <CommonTouchableOpacity>
                          <ActionButton
                            text="GLOBAL_CONSTANTS.SELL"
                            onPress={handleSellNav}
                            customTextColor={NEW_COLOR.BUTTON_TEXT}
                            customIcon={<SellExchangeIcon />}
                          />

                        </CommonTouchableOpacity>

                      </ViewComponent>

                    )}
                  </ViewComponent>
                </ViewComponent>
              </ViewComponent>
              <ViewComponent>
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.CRYPTO"} style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />
                <FlatListComponent
                  data={exchangeCryptoAssets?.assets || []}
                  scrollEnabled={false}
                  ListEmptyComponent={state.apiCallsCompleted.crypto ? <NoDataComponent /> : null}
                  ItemSeparatorComponent={() => <ViewComponent style={[commonStyles.transactionsListGap]} />}
                  renderItem={({ item }) => (
                    <CommonTouchableOpacity 
                      onPress={() => props.navigation.navigate('ExchangeCryptoDetails', {
                        coinName: item?.name,
                        coinCode: item?.code,
                        coinIcon: CoinImages[item?.code?.toLowerCase()],
                        balance: item?.amount || 0,
                        balanceInUSD: item?.amountInUSD || 0
                      })} 
                      style={[commonStyles.cardsbannerbg]}
                    >
                      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                        <ViewComponent style={{ width: s(32), height: s(32) }}>
                          <SvgFromUrl
                            width={s(32)} height={s(32)}
                            uri={CoinImages[item?.code?.toLowerCase()]}
                          />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                          <ViewComponent>
                            <ParagraphComponent text={item?.name} style={[commonStyles.primarytext]} />
                            <ParagraphComponent text={item?.code} style={[commonStyles.secondarytext]} />
                          </ViewComponent>
                          <ViewComponent style={[commonStyles.alignEnd]}>
                            <CurrencyText value={item?.amount || 0} decimalPlaces={4} currency={item?.code} style={[commonStyles.primarytext]} />
                          </ViewComponent>
                        </ViewComponent>
                      </ViewComponent>
                    </CommonTouchableOpacity>
                  )}
                />
              </ViewComponent>
              <ViewComponent style={[commonStyles.sectionGap]} />
              <RecentTransactions accountType={"Exchange"}  handleRecentTranscationReloadDetails={handleRecentTranscationReloadDetails} />
              <ViewComponent style={[commonStyles.sectionGap]} />
              { (
                <ViewComponent>
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
                  <TextMultiLanguage text="GLOBAL_CONSTANTS.SPENDING" style={[commonStyles.sectionTitle]} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                    {DaysLookup?.map((item: any, index: number) => (
                      <React.Fragment key={item.name}>
                        {state.activeYear === item?.name ? (
                            <ViewComponent style={[commonStyles.graphactivebuttons]}>
                              <ParagraphComponent style={[commonStyles.graphactivebuttonstext]} text={item?.code} />
                          </ViewComponent>
                        ) : (
                          <CommonTouchableOpacity
                            onPress={() => handleYears(item)}
                              style={commonStyles.graphinactivebuttons}
                              activeOpacity={0.9}
                            >
                            <ParagraphComponent
                              style={[
                                state.activeYear === item?.name ? commonStyles.textAlwaysWhite : commonStyles.textWhite,
                                commonStyles.graphinactivebuttonstext
                              ]}
                              text={item?.code}
                            />
                          </CommonTouchableOpacity>
                        )}
                        {index !== DaysLookup.length - 1 && <ViewComponent style={{ width: 8 }} />}
                      </React.Fragment>
                    ))}
                  </ViewComponent>
                  </ViewComponent>
                  <ViewComponent>
                    {state.graphDetailsLoading && <Loadding />}
                    {(!state.graphDetailsLoading && state.grphDetails?.length > 0) && <LineChartComponet data={state.grphDetails || []} />}
                    {!state.graphDetailsLoading && state.grphDetails?.length <= 0 && (<NoDataComponent />)}
                  </ViewComponent>
                  {state.kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={state.kycModelVisible} />}
                </ViewComponent>

              )}

              <ViewComponent style={[commonStyles.sectionGap]} />
            </ViewComponent>
          </Container>
        </ScrollViewComponent>
      )}
    </SafeAreaViewComponent>
  );
});

export default ExchangeDashboard;
