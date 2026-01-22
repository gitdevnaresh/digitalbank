import { createNavigationContainerRef, NavigationContainer, NavigationState } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "../redux/reducers";
import { DynamicTabs } from "../components/dynamicTabs";
import TransactionDetails from "../screens/commonScreens/transactions/Details";
import SomethingWentWrong from "../screens/commonScreens/SomethingWentWrong";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Linking, StatusBar, useColorScheme } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Notifications from "../screens/commonScreens/notifications/notifications";
import { setReferralCode } from "../redux/actions/actions";
import CryptoDeposit from "../screens/fintechApp/wallets/deposit";
import CrptoWithdraw from "../screens/fintechApp/wallets/withdraw";
import ApplyCard from "../screens/fintechApp/cards/apply_card/applycard";
import AllCards from "../screens/fintechApp/cards/apply_card";
import SumsubNavigation from "../screens/fintechApp/cards/apply_card/SumsubNavigation";
import ComingSoon from "../screens/fintechApp/comingSoon";
import NewProfile from "../screens/fintechApp/profile";
import HelpCenter from "../screens/fintechApp/profile/HelpCenter/helpCenter";
import PersonalInfo from "../screens/fintechApp/profile/personalInfo/PersonalInfo";
import Security from "../screens/fintechApp/profile/Security/Security";
import KycProfile from "../screens/fintechApp/onboarding/kyc/kycProfile";
import KycProfileStep2 from "../screens/fintechApp/onboarding/kyc/kycProfileStep2";
import KycProfilePreview from "../screens/fintechApp/onboarding/kyc/kycProfilePriview";
import CompleteKyc from "../screens/fintechApp/onboarding/kyc/kycsuccessPage";
import ChooseAccountType from "../screens/fintechApp/onboarding/chooseAccountType";
import CustomerRigister from "../screens/fintechApp/onboarding/persionalInformation";
import SplashScreen from "../components/splashScreen";
import KybUboList from "../screens/fintechApp/onboarding/kybInformation/kybUboList";
import KybDirectorDetailsList from "../screens/fintechApp/onboarding/kybInformation/kybDirectorDetails";
import KybAddDirectorsDetailsForm from "../screens/fintechApp/onboarding/kybInformation/addDirectorsForm";
import KybInfoPreview from "../screens/fintechApp/onboarding/kybInformation/kybReview";
import AddPersonalInfo from "../screens/fintechApp/onboarding/kyc/kyckybaddress";
import KybAddUbosDetailsForm from "../screens/fintechApp/onboarding/kybInformation/addUbosForm";
import KybCompanyData from "../screens/fintechApp/onboarding/kybInformation/companyData";
import VerifyEmail from "../screens/fintechApp/onboarding/verifyEmail";
import AccountProgress from "../screens/fintechApp/onboarding/accountProgress";
import AllPersonalInfo from "../screens/fintechApp/profile/Address/allProfileAddresses";
import Addressbook from "../screens/fintechApp/profile/Addressbook/Index";
import AddressbookCrypto from "../screens/fintechApp/profile/Addressbook/crytoPayee/AddressbookCrypto";
import AddressbookCryptoList from "../screens/fintechApp/profile/Addressbook/crytoPayee/AddressbookCryptoList";
import AddressbookCryptoView from "../screens/fintechApp/profile/Addressbook/crytoPayee/AddressbookCryptoView";
import AddressViewDetails from "../screens/fintechApp/profile/Addressbook/AddressViewDetails";
import LoginHome from "../components/splashScreen/splaceScreen";
import ApplySuccess from "../screens/fintechApp/cards/apply_card/apply_card_kyc/applySuccess";
import analytics from "@react-native-firebase/analytics"
import '@react-native-firebase/app';  // Initialize Firebase App
import crashlytics from '@react-native-firebase/crashlytics';
import Settings from "../screens/fintechApp/profile/settings/settings";
import CardsInfo from "../screens/fintechApp/cards/CardsDashoard/cardsInfo";
import Auth0Signin from "../screens/fintechApp/onboarding/Signin/auth0Signin";
import Auth0Signup from "../screens/fintechApp/onboarding/Signup/Auth0Signup";
import MembersDashBoard from "../screens/fintechApp/profile/Referral";
import MemberDetails from "../screens/fintechApp/profile/Referral/memberDetails";
import MembersList from "../screens/fintechApp/profile/Referral/membersList";
import MemberAllTransactions from "../screens/fintechApp/profile/Referral/memberAllTransactions";
import ForgotPasswordScreen from "../screens/fintechApp/onboarding/ForgotPassword";
import AddContact from "../screens/fintechApp/profile/Addressbook/crytoPayee/addContact";
import AllCardsList from "../screens/fintechApp/cards/CardsDashoard/AllCardsList";
import EditPersonalInfo from "../screens/fintechApp/profile/EditPersonalInfo";
import UpgradeFees from "../screens/fintechApp/profile/Membership/upgradeFees";
import UpgradeMemberShip from "../screens/fintechApp/profile/Membership/membershipUpgrade";
import MembershipUpgradePreview from "../screens/fintechApp/profile/Membership/membershipUpgrade/privew";
import UpgradeMemberShipSuccess from "../screens/fintechApp/profile/Membership/membershipUpgrade/success";
import CoinDetailsScreen from "../screens/commonScreens/coinDetails";
import ProfileDrawer from "../screens/fintechApp/profile/ProfileDrawer";
import { getThemedCommonStyles } from "../components/CommonStyles";
import { useThemeColors } from "../hooks/useThemeColors";
import PhoneVerificationScreen from "../screens/fintechApp/onboarding/phoneVerification";
import Sumsub from "../screens/fintechApp/onboarding/sumsub";
import RegistrationSuccess from "../screens/fintechApp/onboarding/registrationSuccuss";
import PayWithFiatPreview from "../screens/fintechApp/bank/CreateAccount/paywithFiatSummary";
import PayWithCryptoWalletSummery from "../screens/fintechApp/bank/CreateAccount/payWithCryptoWalletSummary";
import PayInGrid from "../screens/fintechApp/payments/payin/payinTabs";
import InvoiceSummary from "../screens/fintechApp/payments/payin/cryptoPayin/View";
import StaticPaymentView from "../screens/fintechApp/payments/payin/cryptoPayin/View/staticPayinView";
import CreateStaticPayment from "../screens/fintechApp/payments/payin/cryptoPayin/static";
import InvoiceForm from "../screens/fintechApp/payments/payin/cryptoPayin/invoice/invoiceForm";
import InvoiceFormItemDetails from "../screens/fintechApp/payments/payin/cryptoPayin/invoice/invoiceIFormItemDetails";
import ItemDetails from "../screens/fintechApp/payments/payin/cryptoPayin/invoice/addItem";
import AllAccounts from "../screens/fintechApp/bank/allAccounts";
import SendAmount from "../screens/fintechApp/bank/withdraw/SendFiatAmount";
import Bank from "../screens/fintechApp/bank/deposit";
import Currencypop from "../screens/fintechApp/bank/Currencypop";
import SummeryDetails from "../screens/fintechApp/bank/withdraw/withDrawSummary";
import PayOutList from "../screens/fintechApp/payments/payout/PayOutList";
import FiatPayin from "../screens/fintechApp/payments/payin/fiatPayin";
import FiatPayinAdd from "../screens/fintechApp/payments/payin/fiatPayin/addFiatPayin";
import FiatPayinView from "../screens/fintechApp/payments/payin/fiatPayin/View";
import VaultList from "../screens/fintechApp/payments/payout/crypto/vaultLists";
import CryptoPayout from "../screens/fintechApp/payments/payout/crypto/cryptoPayout";
import CryptoSend from "../screens/fintechApp/payments/send";
import PayoutSummeryDetails from "../screens/fintechApp/payments/payout/crypto/summery";
import BankKycProfileStep2 from "../screens/fintechApp/bank/kyc/kycProfileStep2";
import BankKycProfilePreview from "../screens/fintechApp/bank/kyc/kycProfilePriview";
import BankAddPersonalInfo from "../screens/fintechApp/bank/kyc/kyckybaddress";
import AddressListScreen from "../screens/fintechApp/bank/kyc/AddressListScreen";
import CryptoPortfolio from "../screens/fintechApp/wallets/CryptoPortfolio";
import AllAssetsTabs from "../screens/fintechApp/wallets/AllAssetsTabs";
import SelectVaults from '../screens/fintechApp/wallets/SelectVaults';
import VaultDetails from '../screens/fintechApp/wallets/VaultDetails'
import BankKybInfoPreview from "../screens/fintechApp/bank/kybInformation/kybReview";
import BankKybAddUbosDetailsForm from "../screens/fintechApp/bank/kybInformation/addUbosForm";
import AddressbookFiatView from "../screens/fintechApp/profile/Addressbook/fiatPayee/AddressbookFiatView";
import AddRecipient from "../screens/fintechApp/profile/Addressbook/fiatPayee/addRecipient/Addrecipient";
import AccountDetails from "../screens/fintechApp/profile/Addressbook/fiatPayee/AccountDetails/AccountDetails";
import BankKybDocumentsStep from "../screens/fintechApp/bank/kybInformation/BankKybDocumentsStep";
import BankKYCScreen from "../screens/fintechApp/bank/kyc/BankKYCScreen";
import AddShareHolderDetailsForm from "../screens/fintechApp/onboarding/kybInformation/shareHolders/addShareHoldersDetails";
import KycForm from "../screens/fintechApp/cards/apply_card/apply_card_kyc/kycForm";
import Accounts from "../screens/fintechApp/bank/accounts";
import AddProfileAddress from "../screens/fintechApp/profile/Address/addProfileAddress";
import AppLockScreen from "../screens/commonScreens/appLock/appLock";
import SecurityDashboard from "../screens/fintechApp/profile/Security";
import FiatPayinsList from "../screens/fintechApp/payments/payin/fiatPayin/View/fiatPayInLIst/fiatPayInList";
import RepresentiveDetailsForm from "../screens/fintechApp/onboarding/kybInformation/representiveDetails/representiveDetailsForm";
import PayoutTransactions from "../screens/fintechApp/payments/payout/payoutTransations/payoutTransactions";
import FiatCoinLIst from "../screens/fintechApp/payments/payout/fiat/fiatCoinsLIst";
import Support from "../screens/fintechApp/profile/Support";
import SupportAllCases from "../screens/fintechApp/profile/Support/allcases";
import SupportCaseView from "../screens/fintechApp/profile/Support/view";
import CaseViewDetails from "../screens/fintechApp/profile/Support/caseViewDetails";
import FiatDeposit from "../screens/fintechApp/wallets/fiatDeposit";
import FiatWithdrawForm from "../screens/fintechApp/wallets/fiatWithdraw";
import FiatWithdrawSummary from "../screens/fintechApp/wallets/fiatWithdraw/summary";
import CryptoWithdrawSummary from "../screens/fintechApp/wallets/withdraw/CryptoWithdrawSummary";
import AssetSelector from "../screens/fintechApp/wallets/AssetSelector";
import SumsubSuccess from "../screens/fintechApp/onboarding/sumSubSuccess";
import RewaordsDashBoard from "../screens/fintechApp/profile/rewards";
import RewardsList from "../screens/fintechApp/profile/rewards/rewardsList/rewardsListTabs";
import RewardViewDetails from "../screens/fintechApp/profile/rewards/View/rewardsViewDetails";
import YourRewardsScreen from "../screens/fintechApp/profile/rewards/yourRewards";
import TransactionList from "../screens/fintechApp/transactions/transactionsList";
import RewardsTransactionList from "../screens/fintechApp/profile/rewards/RewardsTransactions";
import BindCard from "../screens/fintechApp/cards/CardsDashoard/bindCardNew";
import MfaScreen from "../screens/fintechApp/onboarding/mfa/mfsScreen";
import EnableProvider from "../screens/fintechApp/payments/payout/crypto/kycKybRequirements/enableprovider";
import KycKybRequirementsForm from "../screens/fintechApp/payments/payout/crypto/kycKybRequirements/kycKybRequirementsForm";
import KybView from "../screens/fintechApp/onboarding/kybInformation/view";
import PaymentPending from "../screens/fintechApp/payments/payout/crypto/kycKybRequirements/pendingScreen/pending";
import AppUpdate from "../newComponents/appUpdateComponent/appUpdateComponent";
import PersonalKycForm from "../screens/fintechApp/payments/payout/crypto/kycKybRequirements/PayoutCryptoKycForm/personalKycForm";
import OnboardingStepOne from "../components/splashScreen/addsStep1";
import OnboardingStepTwo from "../components/splashScreen/addsStep2";
import { CardDetailView, CardHistoryList, InviteMember, TeamCardsListView, TeamCardsView, TeamIndex, TeamList, TeamTransactionsListView } from "../screens/fintechApp/profile/teams";
import AllCoinsList from "../screens/fintechApp/wallets/walletsAllAssets/coinList";
import WalletsFiatPayinsList from "../screens/fintechApp/payments/payin/fiatPayin/View/fiatPayInLIst/walletsFiatPayinsList";
import WalletsAddFiatPayin from "../screens/fintechApp/payments/payin/fiatPayin/addFiatPayin/walletsAddFiatPayin";
import PaymentsAddFiatPayin from "../screens/fintechApp/payments/payin/fiatPayin/addFiatPayin/paymentsAddFiatPayin";
import PaymentsFiatPayinsList from "../screens/fintechApp/payments/payin/fiatPayin/View/fiatPayInLIst/paymentsFiatPayinsList";
import WalletsAssetsSelector from "../screens/fintechApp/wallets/assetsSection/walletsAssetsSelector";
import WalletsFiatCoinDetails from "../screens/fintechApp/wallets/selectFiatCoinDetails/walletsFiatCoindeatils";
import CoinDetails from "../screens/fintechApp/wallets/selectFiatCoinDetails/coinDetails";
import WalletsFiatPayoutWithdraw from "../screens/fintechApp/payments/payout/fiat/fiatPayoutWithdraw/walletsPayoutWithdraw";
import PaymentsFiatPayoutWithdraw from "../screens/fintechApp/payments/payout/fiat/fiatPayoutWithdraw/paymentsPayoutWithdraw";
import BankCreationForm from "../screens/fintechApp/bank/CreateAccount/bankCreateForm";
import WalletsBankCreation from "../screens/fintechApp/bank/CreateAccount/walletsBankCreateForm";
import BankKybReview from "../screens/fintechApp/bank/kybInformation/bankKybReview";
import WalletsBankKybReview from "../screens/fintechApp/bank/kybInformation/walletsKybReview";
import BankPaywithWalletTabs from "../screens/fintechApp/bank/CreateAccount/bankPaywithWalletTabs";
import WalletsPaywithWalletTabs from "../screens/fintechApp/bank/CreateAccount/walletsPaywithWalletTabs";
import BankKycPreview from "../screens/fintechApp/bank/kyc/bankKycPriview";
import WalletsKycPreview from "../screens/fintechApp/bank/kyc/walletsKycPreview";
import CommonWithDrawSummary from "../screens/fintechApp/bank/withdraw/commonWithdrawummary";
import WalletsWithDrawSummary from "../screens/fintechApp/bank/withdraw/walletsWithdrawSummary";
import BrlPersonalKycForm from "../screens/fintechApp/wallets/kycForm";
import CoomonAssetsSelector from "../screens/fintechApp/wallets/assetsSection/commonAssetsSelector";
import BrlDepositView from "../screens/fintechApp/wallets/kycForm/brlDeposit";
import ExchangeCryptoDetails from "../screens/fintechApp/Exchange/ExchangeCryptoDetails";
import ExchangeCryptoList from "../screens/fintechApp/Exchange/cryptoList";
import CryptoExchange from "../screens/fintechApp/Exchange/buy/buyExchange";
import CryptoSellExchange from "../screens/fintechApp/Exchange/sell/sellExchange";
import CardsKybInfoPreview from "../screens/fintechApp/cards/apply_card/apply_card_kyb/kybField";
import UboFormDetails from "../components/addUboForm/UbosFormDetails";
import BusinessLogin from "../screens/fintechApp/onboarding/businessAccountPage";
import SumsubRejected from "../screens/fintechApp/onboarding/sumSubRejectedPage";
import CreateAccountInformation from "../screens/fintechApp/bank/CreateAccount/noAccount";
import SendReply from "../screens/fintechApp/profile/Support/caseViewDetails/SendReply";
import BrlEnableProvider from "../screens/fintechApp/wallets/kycForm/brlEnablePermission";
import CloseAccount from "../screens/fintechApp/onboarding/closeAccount";
import { useTokenRefresh } from "../hooks/refreshTokenHook";
import { setGlobalNavigationRef } from "../utils/helpers";
import RelogIn from "../screens/commonScreens/ReLogin";
import MemberTransactionViewDetails from "../screens/fintechApp/profile/Referral/memberTransactionDetails";
import SetLimits from "../screens/fintechApp/cards/CardsDashoard/SetLimits";
import CardSetPin from "../screens/fintechApp/cards/CardsDashoard/CardSetPin";
import CardWithdraw from "../screens/fintechApp/cards/CardsDashoard/CardWithdraw";
const AppContainer = () => {
  const Stack = createNativeStackNavigator();
  const appThemeSetting = useSelector((state: any) => state.userReducer?.appTheme);
  const [isReady, setIsReady] = useState(false);
  const dispatch = useDispatch();
  const navigationRef = createNavigationContainerRef();
  const routeNameRef = useRef<string | null>(null);
  const navigationcontainerref = useRef<any>(null)
  const isOnboardingSteps = useSelector((state: any) => state.userReducer?.isOnboardingSteps);
  const colorScheme = useColorScheme();
  const NEW_COLOR = useThemeColors();
   const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [enableAuthenticator, setEnableAuthenticator] = useState<boolean>(false);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const {scheduleTokenRefresh}=useTokenRefresh();
  useEffect(() => {
    if (userInfo) {
      setEnableAuthenticator(true);

    }
  }, [])
  useEffect(() => {
    if (userInfo) {
      scheduleTokenRefresh();
    }
  }, [userInfo])

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (url) {
        const referralCode = extractReferralCodeFromUrl(url);
        if (referralCode) {
          dispatch(setReferralCode(referralCode));
        }
      }
      setIsReady(true);
    };

    const initialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      handleUrl(initialUrl);
    };
    const onLinkOpen = ({ url }: { url: string }) => {
      handleUrl(url);
    };
    initialUrl();
    const subscription = Linking.addEventListener('url', onLinkOpen);
    return () => subscription.remove();
  }, [dispatch]);

  const extractReferralCodeFromUrl = (url: any) => {
    try {
      const urlObj = new URL(url);
      const referralCode = urlObj.searchParams.get('referralCode') || urlObj.searchParams.get('code');
      return referralCode;
    } catch (error) {
      console.log('Error parsing URL:', error);
      return null;
    }
  };
  if (!isReady) {
    return null;
  }

  const getActiveRouteName = (state: NavigationState | undefined): string | null => {
    if (!state) return null;
    const route = state.routes[state.index];
    if (route.state) {

      return getActiveRouteName(route.state as NavigationState);
    }
    return route.name;
  };

  const handleNavigationReady = () => {
    const currentRouteName = getActiveRouteName(navigationRef.current?.getRootState());
    routeNameRef.current = currentRouteName;
    if (currentRouteName) {
      analytics().logScreenView({
        screen_name: currentRouteName,
        screen_class: currentRouteName,
      });
    }
  }

  const handleNavigationStateChange = async (state: NavigationState | undefined) => {
    const previousRouteName = routeNameRef.current;
    const currentRouteName = getActiveRouteName(state);
    if (previousRouteName !== currentRouteName && currentRouteName) {
      try {
        await analytics().logScreenView({
          screen_name: currentRouteName,
          screen_class: currentRouteName,
        });
        crashlytics().setAttribute('screen', currentRouteName);
      } catch (error) {
        console.error("Analytics: Failed to log screen_view", error);
      }
    }
    routeNameRef.current = currentRouteName;
  }
  let backgroundSource;
  // Determine if the dark theme should be used
  if (appThemeSetting !== 'system' && appThemeSetting !== undefined && appThemeSetting !== null) {
    backgroundSource = appThemeSetting === 'dark';
  } else {
    backgroundSource = colorScheme === 'dark';
  }
  const getAnimationForRoute = (route: any) => {
    const { animation } = route.params || {};
    switch (animation) {
      case 'slide_from_left':
        return { animation: 'slide_from_left' };
      case 'slide_from_right':
        return { animation: 'slide_from_right' };
      case 'slide_from_bottom':
        return { animation: 'slide_from_bottom' };
      case 'fade':
        return { animation: 'fade' };
      default:
        // Default animation
        return {};
    }
  };

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={[{ flex: 1 }, commonStyles.headerspace, commonStyles.screenBg]}>

        <StatusBar
          barStyle={backgroundSource ? "light-content" : "dark-content"}
          translucent={true}
          backgroundColor={backgroundSource ? "#000" : "#fff"}
        />
        {enableAuthenticator && <AppLockScreen onUnlock={()=>setEnableAuthenticator(false)}/>}
        {!enableAuthenticator&&<NavigationContainer  ref={(ref) => {
            navigationcontainerref.current = ref;
            setGlobalNavigationRef(ref);
          }}
          onReady={handleNavigationReady} // Pass the function reference
          onStateChange={handleNavigationStateChange}  >
          <Stack.Navigator
            initialRouteName={isOnboardingSteps ? "SplaceScreenW2" : "SplaceScreen"}
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animation: 'slide_from_right',
              animationDuration: 300,
            }}
          >
            {/* Authentication */}
            <Stack.Screen name="SplaceScreen" component={SplashScreen} />
            <Stack.Screen name="AccountProgress" component={AccountProgress} />

            {/* OnBoarding */}
            <Stack.Screen name="SplaceScreenW2" component={LoginHome} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmail} />
            <Stack.Screen name="ChooseAccountType" component={ChooseAccountType} />
            <Stack.Screen name="CustomerRigister" component={CustomerRigister} />
            <Stack.Screen name="OnboardingStepOne" component={OnboardingStepOne} />
            <Stack.Screen name="OnboardingStepTwo" component={OnboardingStepTwo} />
            <Stack.Screen name="Auth0Signin" component={Auth0Signin} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="Auth0Signup" component={Auth0Signup} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
            <Stack.Screen name="EditPersonalInfo" component={EditPersonalInfo} />
            <Stack.Screen name="PhoneVerificationScreen" component={PhoneVerificationScreen} />
            <Stack.Screen name="RegistrationSuccess" component={RegistrationSuccess} />
            <Stack.Screen name="SumsubSuccess" component={SumsubSuccess} />
            <Stack.Screen name="MfaScreen" component={MfaScreen} />
            <Stack.Screen name="BusinessLogin" component={BusinessLogin} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="SumsubRejected" component={SumsubRejected} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="CloseAccount" component={CloseAccount} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />


            {/* kyc & kyb */}
            <Stack.Screen name="Sumsub" component={Sumsub} options={{ headerShown: false }} />
            <Stack.Screen name="KycProfile" component={KycProfile} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="KycProfileStep2" component={KycProfileStep2} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="KycProfilePreview" component={KycProfilePreview} options={{ headerShown: false }} />
            <Stack.Screen name="CompleteKyc" component={CompleteKyc} options={{ headerShown: false }} />
            <Stack.Screen name="KybCompanyData" component={KybCompanyData} options={{ headerShown: false }} />
            <Stack.Screen name="KybUboList" component={KybUboList} options={{ headerShown: false }} />
            <Stack.Screen name="KybAddUbosDetailsForm" component={KybAddUbosDetailsForm} options={{ headerShown: false }} />
            <Stack.Screen name="KybDirectorDetailsList" component={KybDirectorDetailsList} options={{ headerShown: false }} />
            <Stack.Screen name="KybAddDirectorsDetailsForm" component={KybAddDirectorsDetailsForm} options={{ headerShown: false }} />
            <Stack.Screen name="KybInfoPreview" component={KybInfoPreview} options={{ headerShown: false }} />
            <Stack.Screen name="AddPersonalInfo" component={AddPersonalInfo} options={{ headerShown: false }} />
            <Stack.Screen name="AddShareHolderDetailsForm" component={AddShareHolderDetailsForm} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="KycForm" component={KycForm} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="addProfileAddress" component={AddProfileAddress} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="RepresentiveDetailsForm" component={RepresentiveDetailsForm} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="KybView" component={KybView} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />

            {/* Common Screens */}
            <Stack.Screen name="SomethingWentWrong" component={SomethingWentWrong} options={{ headerShown: false }} />
            <Stack.Screen name="ComingSoon" component={ComingSoon} options={{ headerShown: false }} />
            <Stack.Screen name="RelogIn" component={RelogIn} options={{ headerShown: false }} />

            {/* Tabs */}
            <Stack.Screen name="Dashboard" component={DynamicTabs} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="Hub" component={DynamicTabs} />
            {/* Profile */}
            <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
            <Stack.Screen name="NewProfile" component={NewProfile} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route) })} />
            <Stack.Screen name="PersonalInfo" component={PersonalInfo} options={{ headerShown: false }} />
            <Stack.Screen name="HelpCenter" component={HelpCenter} options={{ headerShown: false }} />
            <Stack.Screen name="AllCardsList" component={AllCardsList} />
            <Stack.Screen name="UpgradeFees" component={UpgradeFees} options={{ headerShown: false }} />
            <Stack.Screen name="UpgradeMemberShip" component={UpgradeMemberShip} options={{ headerShown: false }} />
            <Stack.Screen name="MembershipUpgradePreview" component={MembershipUpgradePreview} options={{ headerShown: false }} />
            <Stack.Screen name="UpgradeMemberShipSuccess" component={UpgradeMemberShipSuccess} options={{ headerShown: false }} />

            <Stack.Screen
              name="ProfileDrawer"
              component={ProfileDrawer}
              options={{
                headerShown: false,
                presentation: 'transparentModal',
                animation: 'none',
              }} />

            {/* Transactions */}
            <Stack.Screen name="CardsTransactions" component={TransactionList} options={{ headerShown: false }} />
            <Stack.Screen name="TransactionDetails" component={TransactionDetails} />

            {/* profile drawer */}
            <Stack.Screen name="Security" component={Security} options={{ headerShown: false }} />
            <Stack.Screen name="Addressbook" component={Addressbook} options={{ headerShown: false }} />
            <Stack.Screen name="AddressbookCrypto" component={AddressbookCrypto} options={{ headerShown: false }} />
            <Stack.Screen name="AddressViewDetails" component={AddressViewDetails} options={{ headerShown: false }} />
            <Stack.Screen name="AddressbookCryptoList" component={AddressbookCryptoList} options={{ headerShown: false }} />
            <Stack.Screen name="AddressbookCryptoView" component={AddressbookCryptoView} options={{ headerShown: false }} />
            <Stack.Screen name="AllPersonalInfo" component={AllPersonalInfo} options={{ headerShown: false }} />
            <Stack.Screen name="Notifications" component={Notifications} options={{ headerShown: false }} />
            <Stack.Screen name="AddContact" component={AddContact} options={{ headerShown: false }} />
            <Stack.Screen name="AddressbookFiatView" component={AddressbookFiatView} options={{ headerShown: false }} />
            <Stack.Screen name="AddRecipient" component={AddRecipient} options={{ headerShown: false }} />
            <Stack.Screen name="AccountDetails" component={AccountDetails} options={{ headerShown: false }} />
            <Stack.Screen name="SecurityDashboard" component={SecurityDashboard} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            {/* Support */}
            <Stack.Screen name="Support" component={Support} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="SupportAllCases" component={SupportAllCases} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="SupportCaseView" component={SupportCaseView} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="CaseViewDetails" component={CaseViewDetails} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="SendReply" component={SendReply} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />


            {/* Rewards */}
            <Stack.Screen name="RewaordsDashBoard" component={RewaordsDashBoard} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="RewardsList" component={RewardsList} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="RewardViewDetails" component={RewardViewDetails} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="YourRewardsScreen" component={YourRewardsScreen} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="RewardsTransactionList" component={RewardsTransactionList} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />


            {/* Members */}
            <Stack.Screen name="MembersDashBoard" component={MembersDashBoard} options={{ headerShown: false }} />
            <Stack.Screen name="MembersList" component={MembersList} options={{ headerShown: false }} />
            <Stack.Screen name="MemberDetails" component={MemberDetails} options={{ headerShown: false }} />
            <Stack.Screen name="MemberAllTransactions" component={MemberAllTransactions} options={{ headerShown: false }} />
            <Stack.Screen name="MemberTransactionViewDetails" component={MemberTransactionViewDetails} options={{ headerShown: false }} />
            {/* wallets */}
            <Stack.Screen name="CoinDetails" component={CoinDetailsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="WalletsAllCoinsList" component={AllCoinsList}  options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="WalletsFiatPayinsList" component={WalletsFiatPayinsList} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="PaymentsAddFiatPayin" component={PaymentsAddFiatPayin} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="WalletsAddFiatPayin" component={WalletsAddFiatPayin} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="WalletsAssetsSelector" component={WalletsAssetsSelector} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="WalletsFiatCoinDetails" component={WalletsFiatCoinDetails} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />


            {/* Deposit */}
            <Stack.Screen name="CryptoDeposit" component={CryptoDeposit} options={{ headerShown: false }} />

            {/* Withdraw */}
            <Stack.Screen name="CrptoWithdraw" component={CrptoWithdraw} options={{ headerShown: false }} />
            {/* {Banks} */}
            <Stack.Screen name="createAccountForm" component={BankCreationForm} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route) })} />
            <Stack.Screen name="payWithWalletTabs" component={BankPaywithWalletTabs} options={{ headerShown: false }} />
            <Stack.Screen name="payWithFiatPreview" component={PayWithFiatPreview} options={{ headerShown: false }} />
            <Stack.Screen name="payWithCryptoWalletSummery" component={PayWithCryptoWalletSummery} options={{ headerShown: false }} />
            <Stack.Screen name="AllAccounts" component={AllAccounts} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="SendAmount" component={SendAmount} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="Bank" component={Bank} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="Currencypop" component={Currencypop} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="SummeryDetails" component={CommonWithDrawSummary} options={{ headerShown: false }} />
            <Stack.Screen name="Accounts" component={Accounts} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />

            {/* apply cards  */}
            <Stack.Screen name="ApplyCard" component={ApplyCard} />
            <Stack.Screen name="AllCards" component={AllCards} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="SumsubNavigation" component={SumsubNavigation} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="ApplySuccess" component={ApplySuccess} />
            <Stack.Screen name="CardsInfo" component={CardsInfo} />
            <Stack.Screen name="bindCard" component={BindCard} />
            <Stack.Screen name="setLimits" component={SetLimits} />
            <Stack.Screen name="cardSetPin" component={CardSetPin} />
            <Stack.Screen name="cardWithdraw" component={CardWithdraw} />
            <Stack.Screen name="CardsKybInfoPreview" component={CardsKybInfoPreview}  options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })}/>
            <Stack.Screen name="uboFormDetails" component={UboFormDetails}  options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })}/>


            {/* Payments */}
            <Stack.Screen name="PayInGrid" component={PayInGrid} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="InvoiceSummary" component={InvoiceSummary} />
            <Stack.Screen name="StaticPaymentView" component={StaticPaymentView} />
            <Stack.Screen name="CreateStaticPayment" component={CreateStaticPayment} />
            <Stack.Screen name="InvoiceForm" component={InvoiceForm} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="InvoiceFormItemDetails" component={InvoiceFormItemDetails} />
            <Stack.Screen name="ItemDetails" component={ItemDetails} />
            <Stack.Screen name="FiatPayin" component={FiatPayin} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="FiatPayinView" component={FiatPayinView} />
            <Stack.Screen name="FiatPayinAdd" component={FiatPayinAdd} />
            <Stack.Screen name="PayOutList" component={PayOutList} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="CryptoPayout" component={CryptoPayout} options={{ headerShown: false }} />
            <Stack.Screen name="VaultList" component={VaultList} options={{ headerShown: false }} />
            <Stack.Screen name="CryptoSend" component={CryptoSend} options={{ headerShown: false }} />
            <Stack.Screen name="PayoutSummary" component={PayoutSummeryDetails} options={{ headerShown: false }} />
            <Stack.Screen name="FiatPayout" component={PaymentsFiatPayoutWithdraw} options={{ headerShown: false }} />
            <Stack.Screen name="FiatPayinsList" component={PaymentsFiatPayinsList} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="PayoutTransactions" component={PayoutTransactions} options={{ headerShown: false }} />
            <Stack.Screen name="FiatCoinLIst" component={FiatCoinLIst} options={{ headerShown: false }} />
            <Stack.Screen name="PaymentPending" component={PaymentPending} options={{ headerShown: false }} />
            <Stack.Screen name="PaymentsFiatPayinsList" component={PaymentsFiatPayinsList} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />

            {/* payout Provider Screens */}
            <Stack.Screen name="EnableProvider" component={EnableProvider} options={{ headerShown: false }} />
            <Stack.Screen name="KycKybRequirementsForm" component={KycKybRequirementsForm} options={{ headerShown: false }} />
            <Stack.Screen name="PersonalKycForm" component={PersonalKycForm} options={{ headerShown: false }} />




            {/* BankKyc */}
            <Stack.Screen name="BankKYCScreen" component={BankKYCScreen} options={{ headerShown: false }} />
            <Stack.Screen name="BankKycProfileStep2" component={BankKycProfileStep2} options={{ headerShown: false }} />
            <Stack.Screen name="BankKycProfilePreview" component={BankKycPreview} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="BankAddPersonalInfo" component={BankAddPersonalInfo} options={{ headerShown: false }} />
            <Stack.Screen name="AddressListScreen" component={AddressListScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreateAccountInformation" component={CreateAccountInformation} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />


            {/* BankKyb */}
            <Stack.Screen name="BankKybInfoPreview" component={BankKybReview} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="BankKybAddUbosDetailsForm" component={BankKybAddUbosDetailsForm} options={{ headerShown: false }} />
            <Stack.Screen name="BankKybDocumentsStep" component={BankKybDocumentsStep} options={{ headerShown: false }} />


            {/* <Stack.Screen name="CompleteKyc" component={CompleteKyc} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="KybCompanyData" component={KybCompanyData} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="KybUboList" component={KybUboList} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="KybAddUbosDetailsForm" component={KybAddUbosDetailsForm} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="KybDirectorDetailsList" component={KybDirectorDetailsList} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="KybAddDirectorsDetailsForm" component={KybAddDirectorsDetailsForm} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="KybInfoPreview" component={KybInfoPreview} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="AddPersonalInfo" component={AddPersonalInfo} options={{ headerShown: false }} /> */}
            {/* {WalletsFiat} */}
            <Stack.Screen name="CryptoPortfolio" component={CryptoPortfolio} options={{ headerShown: false }} />
            <Stack.Screen name="AllAssetsTabs" component={AllAssetsTabs} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="FiatCoinDetails" component={CoinDetails} options={{ headerShown: false }} />
            <Stack.Screen name="SelectVaults" component={SelectVaults} options={{ headerShown: false }} />
            <Stack.Screen name="FiatDeposit" component={FiatDeposit} options={{ headerShown: false }} />
            <Stack.Screen name="FiatWithdrawForm" component={FiatWithdrawForm} options={{ headerShown: false }} />
            <Stack.Screen name="FiatWithdrawSummary" component={FiatWithdrawSummary} options={{ headerShown: false }} />
            <Stack.Screen name="CryptoWithdrawSummary" component={CryptoWithdrawSummary} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="AssetSelector" component={CoomonAssetsSelector} options={{ headerShown: false }} />
            <Stack.Screen name="WalletsFiatPayoutWithdraw" component={WalletsFiatPayoutWithdraw} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="WalletsBankCreation" component={WalletsBankCreation} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="WalletsBankKybReview" component={WalletsBankKybReview} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })}/>
            <Stack.Screen name="WalletsPaywithWalletTabs" component={WalletsPaywithWalletTabs} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="WalletsKycPreview" component={WalletsKycPreview} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="WalletsWithDrawSummary" component={WalletsWithDrawSummary} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="BrlPersonalKycForm" component={BrlPersonalKycForm} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="BrlDepositView" component={BrlDepositView} options={{ headerShown: false }} />
            <Stack.Screen name="BrlEnableProvider" component={BrlEnableProvider} options={{ headerShown: false }} />


            <Stack.Screen name="VaultDetails" component={VaultDetails} options={{ headerShown: false }} />
            {/* {Teams} */}
            <Stack.Screen name="Teams" component={TeamIndex} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="InviteMember" component={InviteMember} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="TeamCardsView" component={TeamCardsView} options={{ headerShown: false }} />
            <Stack.Screen name="TeamTransactionsListView" component={TeamTransactionsListView} options={{ headerShown: false }} />
            <Stack.Screen name="CardDetailView" component={CardDetailView} options={{ headerShown: false }} />
            <Stack.Screen name="CardHistoryList" component={CardHistoryList} options={{ headerShown: false }} />
            <Stack.Screen name="TeamCardsListView" component={TeamCardsListView} options={{ headerShown: false }} />
            <Stack.Screen name="TeamList" component={TeamList} options={{ headerShown: false }} />
            <Stack.Screen name="AppUpdate" component={AppUpdate} options={{ headerShown: false }} />
 {/* Exchange */}
            <Stack.Screen name="ExchangeCryptoList" component={ExchangeCryptoList} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
              <Stack.Screen name="CryptoExchange" component={CryptoExchange} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
              <Stack.Screen name="CryptoSellExchange" component={CryptoSellExchange} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
                              <Stack.Screen name="ExchangeCryptoDetails" component={ExchangeCryptoDetails} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
          </Stack.Navigator>
        </NavigationContainer>}
        
      </GestureHandlerRootView>
      {/* </PersistGate> */}
    </Provider>
  );
};

export default AppContainer;
