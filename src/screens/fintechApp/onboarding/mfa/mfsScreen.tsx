import React, { useState, useEffect } from 'react';
import QRCode from 'react-native-qrcode-svg';
import Keychain from 'react-native-keychain';
import { storeToken } from '../../../../apiServices/auth0Service';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { s } from '../../../../constants/theme/scale';
import SafeAreaViewComponent from '../../../../newComponents/safeArea/safeArea';
import ViewComponent from '../../../../newComponents/view/view';
import ButtonComponent from '../../../../newComponents/buttons/button';
import useMemberLogin from '../../../../hooks/userInfoHook';
import { useNavigation } from '@react-navigation/native';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { isErrorDispaly } from '../../../../utils/helpers';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import { t } from 'i18next';
import ScrollViewComponent from '../../../../newComponents/scrollView/scrollView';
import Container from '../../../../newComponents/container/container';
import { copyToClipboard } from '../../../../newComponents/copyToClipBoard/copy ToClopBoard';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { getAllEnvData } from '../../../../../Environment';
import * as Sentry from '@sentry/react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import { Keyboard, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { showAppToast } from '../../../../newComponents/toasterMessages/ShowMessage';
import OnBoardingService from '../../../../apiServices/onBoardingservice';
import DashboardLoader from '../../../../components/loader'
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import CopyCard from '../../../../newComponents/copyIcon/CopyCard';
import AuthService from '../../../../apiServices/auth';
import { setMenuItems, setScreenPermissions } from '../../../../redux/actions/actions';
import { useDispatch } from 'react-redux';
import useNotifications from '../../../../hooks/useNotification';
import ProfileService from '../../../../apiServices/profile';
import { logEvent } from '../../../../hooks/loggingHook';
 
const MfaScreen: React.FC = () => {
    const [otpCode, setOtpCode] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [mfaToken, setMfaToken] = useState<string | null>(null);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [verifyLoading, setVerifyLoading] = useState<boolean>(false);
    const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
    const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { getMemDetails } = useMemberLogin();
    const [secretKey, setSecretKey] = useState<string>('');
    const SECRET_KEY = getAllEnvData().reduxEncryptKey;
    const { encryptAES } = useEncryptDecrypt(SECRET_KEY);
    const navigation = useNavigation<any>();
    const [otpStatus, setOtpStatus] = useState<boolean>(false);
    const dispatch = useDispatch<any>();
    const MenuPermission = () => {
    AuthService.getMenuItems().then((res: any) => {
      if (res?.data?.length > 0) {
        dispatch(setMenuItems(res?.data));
        dispatch(setScreenPermissions([]));
      }
    }).catch((error: any) => {
      console.error("Error fetching menu items:", error);
    });
  };
   const {
      fcmToken,
    } = useNotifications({
      isAuthenticated: true, // Pass your auth state
      onNotificationPress: () => {}
    });
    const getNotificationPermission = async () => {
    try {
      const object = { value: fcmToken }
      await ProfileService.postPushNotification(object);
    } catch (error) {
      console.error("Error getting FCM token:", error);
    }
  };
    useEffect(() => {
        const initializeMfaFlow = async () => {
            setInitialLoading(true);
            try {
                const secureData = await Keychain.getGenericPassword({ service: "mfaToken" });
                if (!secureData) {
                    // showAppToast(t("GLOBAL_CONSTANTS.MFA_TOKEN_MISSING"), 'error'); setInitialLoading(false);
                    return;
                }
                const mfaTokenPayload = JSON.parse(secureData.password);
                const token = mfaTokenPayload?.mfaToken;
                setMfaToken(token);
 
                if (!token) {
                    // showAppToast(t("GLOBAL_CONSTANTS.MFA_TOKEN_INVALID"), 'error');
                    setInitialLoading(false);
                    return;
                }
                const result: any = await OnBoardingService.getMfaEnrollmentApiCall({mfaToken:token});
                if (result.success && result.barcodeUri) {
                    setQrCodeUri(result.barcodeUri.barcode_uri);
                    const url = result.barcodeUri.barcode_uri;
                    const secretCode = new URLSearchParams(url.split('?')[1]).get('secret');
                    setSecretKey(result.secret || secretCode);
                    setIsEnrolled(false);
                } else {
                    if (result.error?.includes('already') || result.error?.includes('User is already enrolled.')) {
                        setIsEnrolled(true);
                        const getConfig = getAllEnvData();
                        Sentry.withScope(scope => {
                            scope.setUser({ id: "user123" });
                            scope.setTag('api_endpoint', "mfa/associate");
                            scope.setTag('api_method', 'POST');
                            scope.setTag('api_status_code', result.status);
                            scope.setTag('app_name', t("GLOBAL_CONSTANTS.ARTHA_TECHNOLOGIES"));
                            scope.setTag('environment', "development");
                            scope.setExtra('Request Body', token);
                            Sentry.addBreadcrumb({
                                category: 'http.error',
                                message: `API call to  ${getConfig.oAuthConfig.issuer}/mfa/associate failed with status ${result.status}`,
                                level: 'error',
                            });
 
                            Sentry.captureException(
                                new Error(` Error: 'User is already enrolled.''}`)
                            );
                        });
                        crashlytics().setAttributes({
                            endpoint: "mfa/associate",
                            method: "POST",
                            status: result.status,
                            appName:t("GLOBAL_CONSTANTS.ARTHA_TECHNOLOGIES"),
                            request: token,
                        });
                        crashlytics().recordError(new Error(`Invalid Grant Error: ${getConfig.oAuthConfig.issuer}/mfa/associate failed with status ${result.status}`));
 
                    } else {
                        // showAppToast(result.error || t("GLOBAL_CONSTANTS.MFA_PROCESS_ERROR"), 'error');
                    }
                }
            } catch (error) {
                // showAppToast(isErrorDispaly(error), 'error');
                const getConfig = getAllEnvData();
                Sentry.withScope(scope => {
                    scope.setUser({ id: "user123" });
                    scope.setTag('api_endpoint', "mfa/associate");
                    scope.setTag('api_method', 'POST');
                    scope.setTag('api_status_code', "500");
                    scope.setTag('app_name', t("GLOBAL_CONSTANTS.ARTHA_TECHNOLOGIES"));
                    scope.setExtra('Request Body', error);
                    Sentry.addBreadcrumb({
                        category: 'http.error',
                        message: `API call to  ${getConfig.oAuthConfig.issuer}/mfa/associate failed with status ${error}`,
                        level: 'error',
                    });
 
                    Sentry.captureException(
                        new Error(` Error: 'User is already enrolled.''}`)
                    );
                });
                crashlytics().setAttributes({
                    endpoint: "mfa/associate",
                    method: "POST",
                    status: "500",
                    appName: t("GLOBAL_CONSTANTS.ARTHA_TECHNOLOGIES"),
                });
                crashlytics().recordError(new Error(`Invalid Grant Error: ${getConfig.oAuthConfig.issuer}/mfa/associate failed with status ${error}`));
            } finally {
                setInitialLoading(false);
            }
        };
 
        initializeMfaFlow();
    }, []);
  const handleVerify = async () => {
    setVerifyLoading(true);
    Keyboard.dismiss();
    if (!mfaToken || otpCode.length !== 6 || verifyLoading) return;
    const body = {
        mfaToken: mfaToken,
        otpCode: encryptAES(otpCode)
    }
    try {
        const result: any = await OnBoardingService.loginWithMFA(mfaToken, encryptAES(otpCode));
        if (typeof result.data === 'string') {
            const parsedData: any = JSON.parse(result.data);
            if (parsedData?.access_token) {
                await storeToken(parsedData.access_token, "");
                // showAppToast(t("GLOBAL_CONSTANTS.MFA_CODE_VERIFIED"), 'success');
                setOtpStatus(true);
                Keyboard.dismiss();
                 setVerifyLoading(true);
                getMemDetails();
                MenuPermission();
                if (fcmToken) {
                    logEvent("FCM Token",{action:"Get FCM Token",fcm:fcmToken});
                    getNotificationPermission();
                }
                setVerifyLoading(false);
            } else {
                setOtpStatus(false);
                Keyboard.dismiss();
 
                Sentry.withScope(scope => {
                    scope.setUser({ id: "User1232" });
                    scope.setTag('api_endpoint', "api/v1/Customer/mfa/Token");
                    scope.setTag('api_method', 'POST');
                    scope.setTag('api_status_code', "422");
                    scope.setTag('app_name', t("GLOBAL_CONSTANTS.ARTHA_TECHNOLOGIES"));
                    scope.setTag('environment', "development");
                    scope.setExtra('Request Body', body);
                    Sentry.addBreadcrumb({
                        category: 'http.error',
                        message: `API call to api/v1/Customer/mfa/Token ${parsedData?.error_description} `,
                        level: 'error',
                    });
 
                    Sentry.captureException(
                        new Error(`Invalid Code Error: ${parsedData?.error_description == "Invalid otp_code." ? "Invalid otp code" : parsedData?.error_description == "mfa_token is expired" ? "Your mfa token expired please goback and relogin to continue." : "Unknown error"}`)
                    );
                });
 
                crashlytics().setAttributes({
                    endpoint: "api/v1/Customer/mfa/Token",
                    method: "POST",
                    status: "422",
                    appName:t("GLOBAL_CONSTANTS.ARTHA_TECHNOLOGIES"),
                    response: JSON.stringify(parsedData.error),
                    request: JSON.stringify(body ?? {}),
                });
                crashlytics().recordError(new Error(`Invalid Grant Error: ${parsedData?.error_description || 'Unknown error'}`));
 
                // ? Don�t reset otpCode
                setError(parsedData.error_description == "Invalid otp_code."
                    ? "Invalid otp code"
                    : parsedData?.error_description == "mfa_token is expired" ? "Your mfa token expired please goback and relogin to continue."  : t("GLOBAL_CONSTANTS.MFA_VERIFICATION_FAILED"));
            }
        }
    } catch (error) {
        showAppToast(isErrorDispaly(error), 'error');
        setOtpStatus(false);
        setVerifyLoading(false);
    } finally {
        setVerifyLoading(false);
    }
};
    const isLoading = initialLoading || verifyLoading;
    const handleGoBack = () => {
        navigation.navigate("Auth0Signin",{animation:'slide_from_left'})
    };
    const renderContent = () => {
        const handleCodeChange = (newCode: string) => {
            setError("");
            setOtpCode(newCode);
            if (newCode.length !== 6 && otpStatus) {
                setOtpStatus(false);
            }
           
        };
        return (
            <ViewComponent>
                <ViewComponent style={[commonStyles.bgnote,commonStyles.dflex, commonStyles.alignStart, commonStyles.gap8,commonStyles.sectionGap]}>
                    <MaterialIcons name="info-outline" size={s(22)} color={NEW_COLOR.TEXT_WHITE} />
                    <TextMultiLanguage
                        text={"GLOBAL_CONSTANTS.MFA_INFO"}
                        style={[commonStyles.fs12, commonStyles.textWhite, commonStyles.flex1]}
                    />
                </ViewComponent>
                {(!isEnrolled && qrCodeUri) && <ViewComponent >
                    <ViewComponent style={[commonStyles.sectionGap]}>
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.BACKUP_KEY"} style={[commonStyles.fs16, commonStyles.fw700, commonStyles.mb8, commonStyles.textWhite, commonStyles.textCenter]} />
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.BACKUP_KEY_INFO"} style={[commonStyles.textCenter, commonStyles.textWhite, commonStyles.fs12, commonStyles.fw400]} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.alignCenter]}>
                        <ViewComponent style={[commonStyles.bgAlwaysWhite, commonStyles.p10, commonStyles.rounded16]}>
                            <QRCode value={qrCodeUri} size={s(220)} />
                        </ViewComponent>
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <ViewComponent style={[commonStyles.rounded12, commonStyles.applycardbg, commonStyles.py16, commonStyles.px8, commonStyles.gap8, commonStyles.dflex, commonStyles.justifyContent, commonStyles.p12]}>
                        <ParagraphComponent text={secretKey} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} numberOfLines={1} />
                        <CopyCard onPress={() => copyToClipboard(secretKey)} copyIconColor={NEW_COLOR.TEXT_GREEN} size={s(24)} />
                    </ViewComponent>
 
                </ViewComponent>}
                <ViewComponent style={[commonStyles.sectionGap]} />
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.MFA_CODE_LABEL"} style={[commonStyles.mb10]} />
                <ViewComponent style={[commonStyles.pr2, commonStyles.mb8]}>
                    <TextInput
                        style={[commonStyles.textInput, commonStyles.fs16, commonStyles.fw400, commonStyles.mb6]}
                        placeholder={t("GLOBAL_CONSTANTS.ENTER_VERIFICATION_CODE")}
                        onChangeText={handleCodeChange}
                        value={otpCode}
                        maxLength={6}
                        placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                        keyboardType="number-pad"
                        editable={!otpStatus}
                    />
                    {error ? <ParagraphComponent style={[commonStyles.textRed]} text={error} /> : null}
                </ViewComponent>
            </ViewComponent>
 
        );
    };
    const handleContinue = () => {
        setVerifyLoading(true);
        getMemDetails();
        setVerifyLoading(false);
    }
    return (
        <SafeAreaViewComponent style={[commonStyles.screenBg]}>
            <KeyboardAwareScrollView
                contentContainerStyle={[{ flexGrow: 1 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true} // Good practice to enable explicitly
            >
                <Container style={[commonStyles.container]}>
                    <PageHeader onBackPress={handleGoBack} title={"GLOBAL_CONSTANTS.MULTI_FACTOR_AUTHENTICATION"} />
                    {initialLoading && <DashboardLoader />}
                    {!initialLoading && <ViewComponent style={[commonStyles.flex1]}>
                        <ScrollViewComponent>
                            {renderContent()}
                        </ScrollViewComponent>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.CONTINUE"}
                            onPress={handleVerify}   // <-- call verify only here
                            loading={verifyLoading}
                            disable={isLoading || otpCode.length !== 6 || otpStatus}
                        />
 
                        <ViewComponent style={[commonStyles.sectionGap]} />
                    </ViewComponent>}
                </Container>
            </KeyboardAwareScrollView>
        </SafeAreaViewComponent>
    );
};
 
 
export default MfaScreen;
