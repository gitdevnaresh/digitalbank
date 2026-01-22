import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { View, Clipboard, ActivityIndicator, RefreshControl } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/core";
import ProfileService from "../../../../apiServices/profile";
import { isErrorDispaly } from "../../../../utils/helpers";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import { s } from "../../../../constants/theme/scale";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";
import Container from "../../../../newComponents/container/container";
import { Switch } from "react-native-gesture-handler";
import QRCode from "react-native-qrcode-svg";
import CopyCard from "../../../../newComponents/copyIcon/CopyCard";
import { SvgUri } from "react-native-svg";
import { getTabsConfigation } from "../../../../../configuration";
import CustomRBSheet from '../../../../newComponents/models/commonBottomSheet';
import ButtonComponent from "../../../../newComponents/buttons/button";
import ViewComponent from "../../../../newComponents/view/view";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import DashboardLoader from "../../../../components/loader";
import { useHardwareBackHandler } from "../../../../hooks/backHandleHook";
import { showAppToast } from "../../../../newComponents/toasterMessages/ShowMessage";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { useLngTranslation } from "../../../../hooks/useLngTranslation";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import { SaveObjectInterface } from "./interface";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import ScrollViewComponent from "../../../../newComponents/scrollView/scrollView";
import ShieldIcon from "../../../../components/svgIcons/security/shield";
import Toggle from "../../../../newComponents/toggle/toggle";
import Foundation from '@expo/vector-icons/Foundation';
import SendVerification from "../../../../components/svgIcons/security/sendverification";
import VerificationPhoneIcon from "../../../../components/svgIcons/security/phone";
import EmailIcon from "../../../../components/svgIcons/security/email";
import { clearVerificationCache, getVerificationData } from "../../../../apiServices/countryService";
const Security = () => {
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [isPhoneActive, setIsPhoneActive] = useState(false);
    const [isEmailActive, setIsEmailActive] = useState(false);
    const [verificationFieldLoading, setVerificationFieldLoading] = useState<boolean>(true);
    const [securityLoading, setSecurityLoading] = useState(false);
    const [btnDisabled, setBtnDisabled] = useState(false);
    const [errormsg, setErrormsg] = useState<string>("");
    const [sendVerificationErrormsg, setSendVerificationErrormsg] = useState("");
    const [refresh, setRefresh] = useState<boolean>(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [qrCodeDisplay, setQrCodeDisplay] = useState(true);
    const [btnLoader, setBtnLoader] = useState<boolean>(false);
    const [qrCode, setQrCode] = useState<any>('');
    const [walletAddress, setWalletAddress] = useState('');
    const SecuritySection = getTabsConfigation('SECURITY_SECTION');
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [twoFaSubmitLoader, setTwoFaSubmitLoader] = useState(false)
    const [twoVerifyErrorMsg, setTwoVerifyErrorMsg] = useState("");
    const [authenticatorState, setAuthenticatorState] = useState({
        code: "",
        loader: false,
        error: "",
        enableHandle: false,
        verifyPopupVisable: false,
        enableTwoFaRbSheetHeight: false,
        verifiedPhoneOtp: false,
        verfiedOtpErrorMsg: false,
        verificationTwoFaDisbaleSubmitLoader: false,
    });
    const rbSheetRef = useRef<any>(null);
    const enableTwoFaAuthanticatorCodeRbSheetRef = useRef<any>(null);
    const successMessageRef = useRef<any>(null);
    const { t } = useLngTranslation();
    useEffect(() => {
        fetchVerificationData();
    }, [isFocused]);
     const fetchVerificationData = async () => {
        setVerificationFieldLoading(true);
            clearVerificationCache();
            try {
                const verifedRes: any = await getVerificationData();
                if (verifedRes?.ok) {
                    setIsPhoneActive(verifedRes?.data?.isPhoneVerified);
                    setIsEmailActive(verifedRes?.data?.isEmailVerification);
                    setIsEnabled(verifedRes?.data?.isMfaEnabled);
                    setVerificationFieldLoading(false);
                } else {
                    setVerificationFieldLoading(false);
                }
            } catch (error) {
                setVerificationFieldLoading(false);
            }
        };
 

    const handlePhonePress = (isActive: any) => {
        setIsPhoneActive(isActive);
    };
    const handleEmailPress = (isActive: any) => {
        setIsEmailActive(isActive);
    };
   

    const handleRefresh = async () => {
        fetchVerificationData();
    };

    const onRefresh = async () => {
        setRefresh(true);
        try {
            fetchVerificationData();
        } finally {
            setRefresh(false);
        }
    };

    const onSubmit = async (twofaLoader?: boolean) => {
        if (!twofaLoader) {
            setSecurityLoading(true);
            setBtnDisabled(true);
        } else {
            setTwoFaSubmitLoader(true)
            setTwoFaSubmitLoader(true)
        }

        setErrormsg("");
        setSendVerificationErrormsg("");
        if (!isEmailActive && !isPhoneActive) {
            setSecurityLoading(false);
            setBtnDisabled(false);
            return setSendVerificationErrormsg("Please select at least one of the verification options from below.")
        }
        let obj = {
            customerId: userInfo?.id,
            isEmailVerification: isEmailActive,
            isPhoneVerified: isPhoneActive,
            isMfaEnabled: isEnabled,
            isLiveVerification: true,
            securityType: userInfo?.securityLevel,
        }
        const res = await ProfileService.updateSecurity(obj);
        if (res?.ok) {
        clearVerificationCache();
            setSecurityLoading(false);
            setBtnDisabled(false);
            setErrormsg("");
            enableTwoFaAuthanticatorCodeRbSheetRef?.current?.close();
            successMessageRef?.current?.open();
            setSendVerificationErrormsg("");
            setTwoFaSubmitLoader(false);
            setTwoFaSubmitLoader(false);
        }
        else {
            setSecurityLoading(false);
            setBtnDisabled(false);
            setErrormsg(isErrorDispaly(res));
            setSendVerificationErrormsg("");
            enableTwoFaAuthanticatorCodeRbSheetRef?.current?.close();
            setTwoFaSubmitLoader(false);
            setTwoFaSubmitLoader(false);
            successMessageRef?.current?.close();
        }
    };
    useHardwareBackHandler(() => {
        handleGobackNavigation();
        return true;
    })
    const handleGobackNavigation = () => {
        navigation.goBack();
    }
    const handleErrorMsg = () => {
        setErrormsg("");
    }
    const handleSendVerificationErrorMsg = () => {
        setSendVerificationErrormsg("");
    }
    const toggleSwitch = () => {
        rbSheetRef.current?.open();
    };


    const copyToClipboard = async (text: any) => {
        Clipboard.setString(text)
    };
    const handleCloseSucces = () => {
        successMessageRef?.current?.close();
        navigation.goBack();
    }
    const Succuspopup =
        (
            <View style={[]}>
                <SvgUri height={s(120)} width={s(120)} uri='https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/applysuccessimg.svg' style={[commonStyles.mxAuto, commonStyles.mb20]} />
                <ParagraphComponent text={"GLOBAL_CONSTANTS.SUCCESS!"} style={[commonStyles.fs20, commonStyles.fw500, commonStyles.textWhite, commonStyles.textCenter]} />
                <ParagraphComponent text={"GLOBAL_CONSTANTS.SECURITY_VERIFICATION_UPDATED"} style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textlinkgrey, commonStyles.sectionGap, commonStyles.textCenter, commonStyles.mt24]} />
                <ButtonComponent
                    onPress={handleCloseSucces}
                    title={"GLOBAL_CONSTANTS.DONE"} />

            </View>
        )
    const handleGoogleAuthenticator = async () => {
        setAuthenticatorState(prev => ({ ...prev, verificationTwoFaDisbaleSubmitLoader: true }));
        let obj: SaveObjectInterface = {
            customerId: userInfo?.id,
            isEmailVerification: isEmailActive,
            isPhoneVerified: isPhoneActive,
            isMfaEnabled: !isEnabled,
            isLiveVerification: null,
            securityType: userInfo?.securityLevel,
        }
        try {

            const response = await ProfileService.update2faSecurity(obj);
            if (response?.data) {
                rbSheetRef.current?.close();
                showAppToast(isEnabled ? `${t("GLOBAL_CONSTANTS.TWO_FACTOR_AUTHENTICATION_DISABLED")}` : `${t("GLOBAL_CONSTANTS.PLEASE_CHECK_YOUR_REGISTERED_EMAIL_TO_ENABLE_TWO_FACTOR_AUTHENTICATION")}`, 'success', 6000);
                setTimeout(() => {
                    enableTwoFaAuthanticatorCodeRbSheetRef.current?.close();
                }, 300)
                setAuthenticatorState(prev => ({ ...prev, verificationTwoFaDisbaleSubmitLoader: false }));
               onRefresh();
            }
            else {
                setAuthenticatorState(prev => ({ ...prev, verificationTwoFaDisbaleSubmitLoader: false }));
                showAppToast(isErrorDispaly(response), 'error');
            }
        } catch (error) {
            setAuthenticatorState(prev => ({ ...prev, verificationTwoFaDisbaleSubmitLoader: false }));
            showAppToast(isErrorDispaly(error), 'error');
        } finally {
            setAuthenticatorState(prev => ({ ...prev, verificationTwoFaDisbaleSubmitLoader: false }));
        }


    }
    const handleTwoFaDisableCancel = () => {
        rbSheetRef.current.close();
    }
    const handleTwoFaEnableCancel = () => {
        enableTwoFaAuthanticatorCodeRbSheetRef.current?.close();
        setIsEnabled(false);

    }
    const verifyPopup = (
        <View>
            {twoVerifyErrorMsg !== "" && (
                <ParagraphComponent
                    text={twoVerifyErrorMsg}
                    style={[commonStyles.fs12, commonStyles.textRed, commonStyles.mt8]}
                />
            )}
            {isEnabled && <TextMultiLanguage text={"GLOBAL_CONSTANTS.ARE_YOU_SURE_YOU_WANT_MULTI_FACTOR_AUTHENTICATION"} style={[commonStyles.bgNoteText]} />}
            {!isEnabled && <TextMultiLanguage text={"GLOBAL_CONSTANTS.TO_ENABLE_TWO_FACTOR_AUTHENTICATION_2FA"} style={[commonStyles.bgNoteText]} />}
            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mt16]}>
                <View style={[commonStyles.flex1]}>
                    <ButtonComponent disable={authenticatorState?.verificationTwoFaDisbaleSubmitLoader} title={"GLOBAL_CONSTANTS.CANCEL"} onPress={handleTwoFaDisableCancel} solidBackground={true} />
                </View>
                <View style={[commonStyles.mb16, commonStyles.mt24, commonStyles.flex1]}>
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.PROCEED"}
                        loading={authenticatorState?.verificationTwoFaDisbaleSubmitLoader}
                        onPress={handleGoogleAuthenticator}
                    />
                </View>
            </View>
        </View>
    );
    const [isOn, setIsOn] = useState(true);

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {verificationFieldLoading && SecuritySection.SEND_VERICATION && <DashboardLoader />}
            {!verificationFieldLoading && SecuritySection.SEND_VERICATION && (
                <Container style={commonStyles.container}>
                    <PageHeader title={"GLOBAL_CONSTANTS.SECURITY_SETTINGS"} onBackPress={handleGobackNavigation} isrefresh={true}  />
                    <ScrollViewComponent showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} />}>
                        <View >
                            {errormsg && <ErrorComponent message={errormsg} onClose={handleErrorMsg} />}
                            <ViewComponent style={[commonStyles.cardslistbg, commonStyles.sectionGap]}>
                                <ViewComponent style={[commonStyles.titleSectionGap]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignStart]}>
                                        <ViewComponent style={[commonStyles.securityiconbg, commonStyles.dflex, commonStyles.justifyCenter,]}>
                                            <ShieldIcon style={[commonStyles.mt6]} width={s(22)} height={s(22)} />
                                        </ViewComponent>
                                        <ParagraphComponent text={"GLOBAL_CONSTANTS.TWO_FACTOR_AUTHENTICATION"} style={[commonStyles.securitytitle, commonStyles.flex1, commonStyles.mb6]} />
                                    </ViewComponent>
                                    <ParagraphComponent text={"GLOBAL_CONSTANTS.ADD_EXTRA_LAYER"} style={[commonStyles.secondaryparasecurity]} />

                                </ViewComponent>
                                <View style={[commonStyles.sectionGap]}>
                                    {SecuritySection.ENABLE_2_FA && <View>
                                        <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignStart]}>
                                            <ParagraphComponent text={"GLOBAL_CONSTANTS.ENABLE_2FA"} style={[commonStyles.securitysecondTitle]} />
                                            {/* <CommonTouchableOpacity onPress={toggleSwitch} activeOpacity={1}>
                                                <View pointerEvents="none">
                                                    <Switch trackColor={{ true: NEW_COLOR.TEXT_PRIMARY, false: NEW_COLOR.TEXT_RED }} thumbColor={NEW_COLOR.THUMBTOGGLE_BG} ios_backgroundColor="" value={isEnabled} />

                                                </View>
                                            </CommonTouchableOpacity> */}
                                            <Toggle
                                                value={isEnabled}
                                                onValueChange={toggleSwitch}
                                            />
                                        </View>
                                        <View style={[commonStyles.mb10]} />
                                        <ParagraphComponent text={"GLOBAL_CONSTANTS.ENABLE_2FA_TO_ADD_AN_EXTRA_LAYER"} style={[commonStyles.secondaryparasecurity]} />
                                        <ViewComponent style={[commonStyles.titleSectionGap]} />
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                                            <Foundation name="info" size={24} color={NEW_COLOR.TEXT_PRIMARY} />
                                            <ParagraphComponent text={"GLOBAL_CONSTANTS.THIS_PROTECT_YOUR_ACCOUNT"} style={[commonStyles.secondaryparasecurity]} />


                                        </ViewComponent>
                                    </View>}
                                </View>
                            </ViewComponent>

                            <View style={[]}>
                                {sendVerificationErrormsg && <ErrorComponent message={sendVerificationErrormsg} onClose={handleSendVerificationErrorMsg} />}
                                {SecuritySection.SEND_VERICATION && <View style={[commonStyles.securitybg]}>
                                    <View style={[commonStyles.dflex, commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16

                                        ]}>
                                            <ViewComponent style={[commonStyles.verificationsecurityiconbg,]}>
                                                <SendVerification width={s(24)} height={s(24)}  style={[commonStyles.mt4,commonStyles.ml2]}/>
                                            </ViewComponent>
                                            <ViewComponent >

                                                <ParagraphComponent style={[commonStyles.sectionTitle,]} text={"GLOBAL_CONSTANTS.SEND_VERIFICATION"} />
                                            </ViewComponent>
                                        </ViewComponent>
                                        {!securityLoading && <CommonTouchableOpacity activeOpacity={0.9}>
                                        </CommonTouchableOpacity>}
                                    </View>
                                    <View style={[commonStyles.mb8]} />
                                    <ParagraphComponent style={[commonStyles.secondaryparasecurity]} text={"GLOBAL_CONSTANTS.CLICK_TO_SEND_THE_VERIFICATION"} />
                                    <View style={[commonStyles.titleSectionGap]} />
                                    <ViewComponent style={[commonStyles.phoneverification,commonStyles.titleSectionGap]}>
                                       
                                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb20]}>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}  >
                                                <EmailIcon width={s(26)} height={s(26)} />
                                                <ViewComponent>
                                                    <ParagraphComponent text={"GLOBAL_CONSTANTS.EMAIL_VERIFICATION"} style={[commonStyles.phoneverificationtext]} />
                                                    <ParagraphComponent text={"GLOBAL_CONSTANTS.GET_OTP_CODES_VIA_EMAIL"} style={[commonStyles.secondaryparasecurity]} />
                                                </ViewComponent>
                                            </ViewComponent>
                                            <Toggle
                                                onValueChange={() => handleEmailPress(!isEmailActive)} value={isEmailActive} />

                                        </View>
                                        <ViewComponent style={[commonStyles.hLine, commonStyles.mb10]} />
                                         <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]} >
                                                <VerificationPhoneIcon width={s(26)} height={s(26)} />
                                               <ViewComponent>
                                                <ParagraphComponent text={"GLOBAL_CONSTANTS.PHONE_VERIFICATION"} style={[commonStyles.phoneverificationtext]} />
                                                <ParagraphComponent text={"GLOBAL_CONSTANTS.GET_OTP_CODES_VIA_SMS"} style={[commonStyles.secondaryparasecurity]} />
                                            </ViewComponent>
                                            </ViewComponent>
                                            {/* <Switch trackColor={{ true: NEW_COLOR.TEXT_PRIMARY, false: NEW_COLOR.TEXT_link }} thumbColor={NEW_COLOR.THUMBTOGGLE_BG} ios_backgroundColor="" onValueChange={() => handlePhonePress(!isPhoneActive)} value={isPhoneActive} /> */}
                                            <Toggle
                                                onValueChange={() => handlePhonePress(!isPhoneActive)} value={isPhoneActive}
                                            />

                                        </View>
                                    </ViewComponent>
                                    {/* <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                                        <Foundation name="info" size={24} color={NEW_COLOR.TEXT_PRIMARY} />
                                        <ParagraphComponent text={"GLOBAL_CONSTANTS.THIS_PROTECT_YOUR_ACCOUNT"} style={[commonStyles.secondaryparasecurity]} />


                                    </ViewComponent> */}


                                </View>}
                            </View>
                        </View>
                    </ScrollViewComponent>
                    <View style={[commonStyles.sectionGap]}>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.SAVE_TRANSACTION_SECURITY"}
                            onPress={() => onSubmit(false)}
                            disable={btnDisabled}
                            loading={securityLoading}
                        />
                    </View>
                    <CustomRBSheet
                        refRBSheet={enableTwoFaAuthanticatorCodeRbSheetRef}
                        title={"GLOBAL_CONSTANTS.ENABLE_2FA"}
                        height={s(600)}
                        customStyles={{
                            wrapper: {
                                backgroundColor: "rgba(0, 0, 0, 0.49)"
                            }
                        }}
                        closeOnPressMask={false}
                        draggable={false}
                    >
                        {btnLoader ? (
                            <ActivityIndicator size="small" color={NEW_COLOR.TEXT_PRIMARY} />
                        ) : (!qrCodeDisplay && isOpen && isEnabled) && (
                            <View>
                                <View style={[commonStyles.bgAlwaysWhite, commonStyles.mxAuto, commonStyles.p2, commonStyles.rounded16]}>
                                    <QRCode value={qrCode} size={s(160)} />
                                </View>

                                <View
                                    style={[
                                        commonStyles.dflex,
                                        commonStyles.justifyCenter,
                                        commonStyles.gap10,
                                        commonStyles.alignCenter,
                                        commonStyles.mt12,
                                    ]}
                                >
                                    <ParagraphComponent
                                        text={walletAddress}
                                        style={[
                                            commonStyles.textCenter,
                                            commonStyles.textWhite,
                                            commonStyles.fs16,
                                            commonStyles.fw500,
                                        ]}
                                    />
                                    {qrCode && (
                                        <CopyCard
                                            onPress={() => copyToClipboard(walletAddress)}
                                            copyIconColor={NEW_COLOR.TEXT_PRIMARY}
                                        />
                                    )}
                                </View>
                                <ViewComponent style={[commonStyles.listGap]} />
                                {/* ?? Only this section scrolls */}
                                <ScrollViewComponent
                                    showsVerticalScrollIndicator={false}
                                    style={{ maxHeight: s(220) }} // set max height
                                    contentContainerStyle={{ paddingBottom: s(12) }}
                                >
                                    <View style={[commonStyles.mt16]}>
                                        <TextMultiLanguage
                                            text="GLOBAL_CONSTANTS.TWO_FA_INSTRUCTIONS_TITLE"
                                            style={[
                                                commonStyles.bottomsheetprimarytexttitle,
                                                commonStyles.titleSectionGap
                                            ]}
                                        />

                                        {[
                                            "GLOBAL_CONSTANTS.TWO_FA_STEP_1",
                                            "GLOBAL_CONSTANTS.TWO_FA_STEP_2",
                                            "GLOBAL_CONSTANTS.TWO_FA_STEP_3",
                                            "GLOBAL_CONSTANTS.TWO_FA_STEP_4",
                                            "GLOBAL_CONSTANTS.TWO_FA_STEP_5",
                                            "GLOBAL_CONSTANTS.TWO_FA_STEP_6",
                                            "GLOBAL_CONSTANTS.TWO_FA_STEP_7",
                                        ].map((step, index) => (
                                            <ParagraphComponent
                                                key={index}
                                                text={`${index + 1}. ${t(step)}`}
                                                style={[
                                                    commonStyles.textGrey,
                                                    commonStyles.fs14,
                                                    commonStyles.fw400,
                                                    { marginBottom: s(8) },
                                                ]}
                                            />
                                        ))}

                                        <TextMultiLanguage
                                            text="GLOBAL_CONSTANTS.TWO_FA_MANUAL_ENTRY_NOTE"
                                            style={[
                                                commonStyles.bottomsheetprimarytexttitle,
                                                commonStyles.titleSectionGap
                                            ]}
                                        />
                                    </View>
                                </ScrollViewComponent>

                                <ViewComponent style={[commonStyles.sectionGap]} />

                                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                    <View style={[commonStyles.flex1]}>
                                        <ButtonComponent disable={twoFaSubmitLoader} title={"GLOBAL_CONSTANTS.CANCEL"} onPress={handleTwoFaEnableCancel} solidBackground={true} />
                                    </View>
                                    <View style={[commonStyles.mb16, commonStyles.mt24, commonStyles.flex1]}>
                                        <ButtonComponent
                                            title={"GLOBAL_CONSTANTS.OK"}
                                            loading={twoFaSubmitLoader}
                                            onPress={() => onSubmit(true)}
                                        />                                    </View>

                                </View>
                            </View>
                        )}

                        <View style={[commonStyles.mb20]} />
                    </CustomRBSheet>


                    <CustomRBSheet
                        refRBSheet={successMessageRef}
                        title={"GLOBAL_CONSTANTS.SUCCESS"}
                        height={s(400)}
                    >
                        {Succuspopup}
                    </CustomRBSheet>
                    <CustomRBSheet
                        refRBSheet={rbSheetRef}
                        title={!isEnabled ? "GLOBAL_CONSTANTS.ENABLE_MULTI_FACTOR_AUTHENTICATION" : "GLOBAL_CONSTANTS.DISABLE_MULTI_FACTOR_AUTHENTICATION"}
                        height={s(250)}
                        closeOnPressMask={false}
                        draggable={false}
                        modeltitle={true}
                    >
                        {verifyPopup}
                    </CustomRBSheet>
                </Container>
            )}
        </ViewComponent>
    );
};

export default Security;
