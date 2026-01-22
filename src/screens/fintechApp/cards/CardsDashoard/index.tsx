import React, { useState, FC, useCallback, useRef, useEffect } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect, useIsFocused, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../../../navigations/navigation-types";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";
import RecentTransactions from "../../../commonScreens/transactions/recentTransactions";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import Container from "../../../../newComponents/container/container";
import ViewComponent from "../../../../newComponents/view/view";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import CardsModuleService from "../../../../apiServices/card";
import { getTabsConfigation } from "../../../../../configuration";
import TransactionService from "../../../../apiServices/transaction";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import DashboardLoader from "../../../../components/loader";
import { homeanalyticsGraph } from "../../skeleton_views";
import CardsApplyCardSection from "./CardsApplyCardSection";
import CardsPortfolioStatus from "./CardsPortfolioStatus";
import CardsCoinSelectionModal from "./CardsCoinSelectionModal";
import CardsBalanceSection from "./CardsBalanceSection";
import ScrollViewComponent from "../../../../newComponents/scrollView/scrollView";
import { CARDS_CONST } from "./constants";
import { showAppToast } from "../../../../newComponents/toasterMessages/ShowMessage";
import { isErrorDispaly } from "../../../../utils/helpers";
import SafeAreaViewComponent from "../../../../newComponents/safeArea/safeArea";
import KycVerifyPopup from "../../../commonScreens/kycVerify";
import { useDispatch, useSelector } from "react-redux";
import useMemberLogin from "../../../../hooks/userInfoHook";
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { AntDesign } from "@expo/vector-icons";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import AddIcon from "../../../../newComponents/addCommonIcon/addCommonIcon";
import CryptoServices from "../../../../apiServices/crypto";
import { setScreenPermissions, setCardsDashboard } from "../../../../redux/actions/actions";
import { t } from "i18next";
import { Image } from "react-native";
import { s } from "../../../../constants/theme/scale";
import { useScreenPerfLogger } from "../../../../hooks/performance/performanceHook";
import { getVerificationData } from "../../../../apiServices/countryService";
import SmartCardCarousel from "../../../commonScreens/cards/smartCardCarousel";
type NewCardProps = NativeStackScreenProps<RootStackParamList, "NewCard">;
const Cards: FC<NewCardProps> = React.memo((props: any) => {

  const rbSheetRef = useRef<any>(null);
  const [refresh, setRefresh] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [graphDetailsLoading, setGraphDetailsLoading] = useState(false);
  const Configuration = getTabsConfigation('ADDS_AND_GRAPG_CONFIGURATION');
  const [graphDetails, setGraphDetails] = useState<any>([]);
  const [activeDays, setActiveDays] = useState('7');
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const navigation = useNavigation<any>();
  const cardGraphSkelton = homeanalyticsGraph();
  const userInfo = useSelector((state: any) => state.userReducer.userDetails);
  const { cardsDashboard } = useSelector((state: any) => state.userReducer);
  const [kycModelVisible, setKycModelVisible] = useState<boolean>(false);
  const { getMemDetails } = useMemberLogin();
  const isFocused = useIsFocused();
  const { stopTrace } = useScreenPerfLogger("Cards_dashboard")
  
  // Derived state from Redux - Cards Dashboard
  const cardsBalance = cardsDashboard?.balance || {};
  const cardsData = cardsDashboard?.cards || [];
  
  // Helper to determine if dashboard has any meaningful data
  const hasCardsDashboardData = () => {
    const balanceHas = Object.keys(cardsBalance).length > 0;
    const cardsHas = Array.isArray(cardsData) && cardsData.length > 0;
    return balanceHas || cardsHas;
  };
  
  const [screenLoading, setScreenLoading] = useState<boolean>(() => {
    // Show loader based on configuration and Redux data availability
    const shouldShowLoader = Configuration?.DASHBOARD_LOADER;
    const hasRedux = hasCardsDashboardData();
    if (shouldShowLoader) {
      // DASHBOARD_LOADER true: always show loader initially
      return true;
    } else {
      // DASHBOARD_LOADER false: show loader only if no Redux data
      const showLoader = !hasRedux;
      return showLoader;
    }
  });

  const dispatch = useDispatch<any>();
  const [apiCallsCompleted, setApiCallsCompleted] = useState({ balance: false, cards: false, verification: false });
  const [errormsgLink, setErrormsgLink] = useState<string>("");
  const [recentTranscationReload, setRecentTranscationReload] = useState(false);
  const [initialChartLoaded, setInitialChartLoaded] = useState(false);
  
  const [state, setState] = useState({
    errorMsg: "",
    cardBalance: {} as any,
    selectedCoin: (cardsBalance as any)?.defaultCurrency || 'USD',
    modelVisible: false,
    coins: (cardsBalance as any)?.coins || '',
    allCards: [] as any[],
    recentTransactionsData: [] as any[],
    // Graph data stored in state
    graphData7Days: null,
    graphData30Days: null
  });

  const subScreens = useSelector((state: any) => state.userReducer?.screenPermissions);
  const menuItems = useSelector((state: any) => state.userReducer?.menuItems);
  const cardsId = menuItems?.find((item: any) => item?.featureName.toLowerCase() === 'cards')?.id;

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    if (cardsId && !subScreens?.Cards) {
      CryptoServices.getScreenPermissions(cardsId).then((res: any) => {
        if (res?.data) {
          dispatch(setScreenPermissions({ Cards: res?.data }));
        }
      }).catch((error: any) => {
        showAppToast(isErrorDispaly(error), 'error');
      });
    }
  }, [isFocused, cardsId, subScreens?.Cards]);

  const cardPermissions = subScreens?.Cards?.permissions;
  const canShowApplyCards = cardPermissions?.tabs?.find((tab: any) => tab.name?.replaceAll(/\s/g, '')?.toLowerCase() === "applycards")?.isEnabled;

  const updateState = (newState: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  const hasLoadedOnce = useRef(false);
  const isInitializing = useRef(false);

  useFocusEffect(
    useCallback(() => {
      const shouldShowLoader = Configuration?.DASHBOARD_LOADER;
      const hasRedux = hasCardsDashboardData();
      
      // Initialize component state from Redux data if available
      if (hasRedux) {
        updateState({
          cardBalance: cardsBalance,
          selectedCoin: cardsBalance?.defaultCurrency || 'USD',
          coins: cardsBalance?.coins || '',
          allCards: cardsData
        });
      }
      
      // Show loader based on configuration or Redux data
      if (shouldShowLoader) {
        setScreenLoading(true);
      } else {
        setScreenLoading(!hasRedux);
      }
      
      const initializeData = async () => {
        if (isInitializing.current) {
          return;
        }
        
        isInitializing.current = true;
        setActiveDays('7');
        setInitialChartLoaded(false);
        updateState({ 
          errorMsg: "",
          graphData7Days: null,
          graphData30Days: null
        });
        setRecentTranscationReload(true);
        hasLoadedOnce.current = true;
        
        // Always make API calls to refresh data
        setApiCallsCompleted({ balance: false, cards: false, verification: false });
        try {
          await Promise.all([
            getCardBalance(),
            getMyCards(),
          ]);
        } finally {
          isInitializing.current = false;
        }
      };
      
      initializeData();
      stopTrace();
      return () => {};
    }, [hasCardsDashboardData(), Configuration?.DASHBOARD_LOADER])
  );

  // Dashboard loader control - respect DASHBOARD_LOADER configuration
  useEffect(() => {
    const shouldShowLoader = Configuration?.DASHBOARD_LOADER;
    const allCriticalCompleted = Object.values(apiCallsCompleted).every(Boolean);
    
    if (shouldShowLoader) {
      // DASHBOARD_LOADER true: hide when APIs complete
      if (allCriticalCompleted && screenLoading) {
        setScreenLoading(false);
      }
    } else {
      // DASHBOARD_LOADER false: hide when APIs complete
      if (allCriticalCompleted && screenLoading) {

        setScreenLoading(false);
      }
    }
  }, [apiCallsCompleted, screenLoading, Configuration?.DASHBOARD_LOADER]);

  const onRefresh = async () => {
    setRefresh(true);
    setScreenLoading(true);
    setRecentTranscationReload(true);
    setApiCallsCompleted({ balance: false, cards: false, verification: false });
    
    try {
      await Promise.all([
        getCardBalance(),
        getMyCards(),
      ]);
      
      getCardsSpendingChartData(activeDays);
    } finally {
      setRefresh(false);
      setScreenLoading(false);
    }
  };

  const getCardBalance = async () => {
    try {
      const response = await CardsModuleService.totalBalance();
      if (response?.ok) {
        updateState({
          cardBalance: response?.data ?? {},
          selectedCoin: response?.data?.defaultCurrency || 'USD',
          coins: response?.data?.coins ?? ''
        });
        dispatch(setCardsDashboard({ balance: response?.data }));
      } else {
        showAppToast(isErrorDispaly(response), 'error');
      }
    } catch (error) {
      showAppToast(isErrorDispaly(error), 'error');
    } finally {
      setApiCallsCompleted(prev => ({ ...prev, balance: true }));
      setScreenLoading(false);
    }
  };

  const getMyCards = async () => {
    try {
      const response = await CardsModuleService.getCards(10, 1);
      if (response?.ok) {
        updateState({ allCards: response?.data ?? [] });
        dispatch(setCardsDashboard({ cards: response?.data }));
      } else {
        showAppToast(isErrorDispaly(response), 'error');
      }
    } catch (error) {
      showAppToast(isErrorDispaly(error), 'error');
    } finally {
      setApiCallsCompleted(prev => ({ ...prev, cards: true }));
    }
  };
  const getCardsSpendingChartData = async (days: number | string) => {
    // Check if data exists in state first
    if (days === '7' && state.graphData7Days) {
      setGraphDetails(state.graphData7Days);
      return;
    }
    if (days === '30' && state.graphData30Days) {
      setGraphDetails(state.graphData30Days);
      return;
    }

    setGraphDetailsLoading(true);
    try {
      const response: any = await TransactionService.CardsSpendingChartGraphdetails(days);
      if (response?.ok) {
        const graphData = response?.data?.transactionsModels;
        setGraphDetails(graphData);
        // Store in state based on days
        if (days === '7') {
          updateState({ graphData7Days: graphData });
        } else if (days === '30') {
          updateState({ graphData30Days: graphData });
        }
      } else {
        setGraphDetails(null);
        showAppToast(isErrorDispaly(response), 'error');
      }
    } catch (error) {
      setGraphDetails(null);
      showAppToast(isErrorDispaly(error), 'error');
    } finally {
      setGraphDetailsLoading(false);
    }
  };

  // Load chart data independently (not tied to dashboard loader)
  useFocusEffect(
    useCallback(() => {
      if (!initialChartLoaded) {
        getCardsSpendingChartData(activeDays);
        setInitialChartLoaded(true);
      }
    }, [initialChartLoaded])
  );

  const handleCarouselError = () => {
    updateState({ errorMsg: "" });
  };

  const handleYears = (item: any) => {
    const newDays = item?.name;
    setActiveDays(newDays);
    
    // Use stored data if available, otherwise call API
    if (newDays === '7' && state.graphData7Days) {
      setGraphDetails(state.graphData7Days);
    } else if (newDays === '30' && state.graphData30Days) {
      setGraphDetails(state.graphData30Days);
    } else {
      getCardsSpendingChartData(newDays);
    }
  };

  useEffect(() => {
    if (initialChartLoaded && activeDays !== '7') {
      getCardsSpendingChartData(activeDays);
    }
  }, [activeDays, initialChartLoaded]);

  const handleRecentTranscationReloadDetails = (reload: boolean, error?: string | null) => {
    setRecentTranscationReload(reload);
    if (error) {
      updateState({ errorMsg: error });
    }
  };

  const coinSelection = () => {
    updateState({ modelVisible: true });
    setTimeout(() => {
      rbSheetRef.current?.open();
    }, 10);
  };

  const handleCloseModel = () => {
    rbSheetRef.current?.close();
    updateState({ modelVisible: false });
  };

  const handleCoinSelection = (item: any) => {
    rbSheetRef.current?.close();
    updateState({
      modelVisible: false,
      selectedCoin: item
    });
  };

  const handleSeeAll = () => {
    navigation.navigate('AllCardsList', { type: 'MyCards' });
  };

  const handleApplycard = async () => {
    updateState({ errorMsg: '' });
      navigation.navigate("AllCards");

      // const securityVerififcationData: any = await getVerificationData();
      // if (securityVerififcationData?.ok) {
      //   if ((securityVerififcationData?.data?.isEmailVerification === true || securityVerififcationData?.data?.isPhoneVerified === true)) {
      //     navigation.navigate("AllCards");
      //   } else {
      //     updateState({ errorMsg: t("GLOBAL_CONSTANTS.WITHOUT_SECURITY_VERIFICATION_MSG") });
      //     setErrormsgLink(t("GLOBAL_CONSTANTS.SECURITY_SECTION"));
      //   }
      // } else {
      //   updateState({ errorMsg: t("GLOBAL_CONSTANTS.WITHOUT_SECURITY_VERIFICATION_MSG") });
      //   setErrormsgLink(t("GLOBAL_CONSTANTS.SECURITY_SECTION"));
      // }
    
  };

  const handleLink = () => {
    navigation?.navigate('Security');
  };

  const closekycModel = () => {
    setKycModelVisible(!kycModelVisible);
  };

  const handleCloseError = () => {
    updateState({ errorMsg: '' });
  };

  return (
    <SafeAreaViewComponent style={[commonStyles.screenBg]}>
      {screenLoading ? (
        <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </ViewComponent>
      ) : (
        <ScrollViewComponent ref={scrollViewRef} refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} />}>
          <Container style={[commonStyles.container]}>
            {state.errorMsg !== "" && (
              <ErrorComponent
                message={state.errorMsg}
                onClose={handleCloseError}
                children={errormsgLink || ""}
                handleLink={handleLink}
              />
            )}
            <>
              <CardsBalanceSection cardBalance={cardsBalance} selectedCoin={state.selectedCoin} coins={state.coins} coinSelection={coinSelection} />
              {canShowApplyCards && <CommonTouchableOpacity style={[commonStyles.sectionGap]} onPress={handleApplycard}>
                <CardsApplyCardSection handleApplycard={handleApplycard} />
              </CommonTouchableOpacity>}
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]} >
                  <ParagraphComponent text={"GLOBAL_CONSTANTS.MY_CARDS"} style={[commonStyles.sectionTitle]} />
                 {canShowApplyCards&& <ViewComponent style={[commonStyles.actioniconbg]} >
                    <AddIcon onPress={handleApplycard} />
                  </ViewComponent>}
                </ViewComponent>
                {state?.allCards?.length > 0 && <CommonTouchableOpacity style={[commonStyles.dflex, commonStyles.alignCenter,]} onPress={handleSeeAll}>
                  <ParagraphComponent text={"GLOBAL_CONSTANTS.SEE_ALL"} style={[commonStyles.sectionLink]} />
                </CommonTouchableOpacity>}
              </ViewComponent>
              <ViewComponent>
              </ViewComponent>
              {state?.allCards?.length > 0 && (
                <SmartCardCarousel routing={'CardsInfo'} onError={handleCarouselError} initialCardsData={state.allCards} />
              ) ||
                <ViewComponent style={[commonStyles.cardbannerbg]}>
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                    <CommonTouchableOpacity onPress={handleApplycard} style={[commonStyles.flex1]}>
                      <ViewComponent style={[commonStyles.px10]} >
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.APPLY_CARDS_DESCRIPTION"} style={[commonStyles.cardbannertext]} />
                        <ViewComponent
                          style={[
                            commonStyles.dflex,
                            commonStyles.alignCenter,
                            commonStyles.gap4,
                          ]}
                        >
                          <ParagraphComponent
                            text={t('GLOBAL_CONSTANTS.APPLY_CARDS')}
                            style={[commonStyles.sectionLink]}
                          />
                          <AntDesign name="arrowright" size={s(20)} style={[commonStyles.arrowiconprimary]} />
                        </ViewComponent>
                      </ViewComponent>
                    </CommonTouchableOpacity>
                    <ViewComponent >
                      <ViewComponent style={[commonStyles.cardbannerimg]} >
                        <Image source={require("../../../../assets/images/registration/rapidzimgbanner.png")} />
                      </ViewComponent>
                    </ViewComponent>
                  </ViewComponent>
                </ViewComponent>
              }
              <ViewComponent style={[commonStyles.sectionGap]} />
              <RecentTransactions
                accountType={CARDS_CONST.CARDS_RECENT}
                initialData={state?.recentTransactionsData}
                recentTranscationReload={recentTranscationReload}
                handleRecentTranscationReloadDetails={handleRecentTranscationReloadDetails}
                dashboardLoading={screenLoading} />
              <ViewComponent style={[commonStyles.sectionGap]} />
              <CardsCoinSelectionModal
                modelVisible={state.modelVisible}
                rbSheetRef={rbSheetRef}
                handleCloseModel={handleCloseModel}
                coins={state?.coins}
                selectedCoin={state?.selectedCoin}
                handleCoinSelection={handleCoinSelection}
              />
              <CardsPortfolioStatus
                Configuration={Configuration}
                graphDetailsLoading={graphDetailsLoading}
                graphDetails={graphDetails}
                activeDays={activeDays}
                handleYears={handleYears}
                cardGraphSkelton={cardGraphSkelton}
              />
            </>
            {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={kycModelVisible} />}
          </Container>
        </ScrollViewComponent>
      )}
    </SafeAreaViewComponent>
  );
});

export default Cards;
