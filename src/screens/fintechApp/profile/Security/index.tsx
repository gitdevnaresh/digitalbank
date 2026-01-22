import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import { s } from "../../../../constants/theme/scale";
import React, { useRef, useState, useEffect } from "react";
import Container from "../../../../newComponents/container/container";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import ScrollViewComponent from "../../../../newComponents/scrollView/scrollView";
import ViewComponent from "../../../../newComponents/view/view";
import { EvilIcons, Feather, FontAwesome5, MaterialCommunityIcons, SimpleLineIcons } from "@expo/vector-icons";
import SecurityIcon from "../../../../components/svgIcons/mainmenuicons/securityicon";
import CustomRBSheet from "../../../../newComponents/models/commonBottomSheet";
import ButtonComponent from "../../../../newComponents/buttons/button";
import { showAppToast } from "../../../../newComponents/toasterMessages/ShowMessage";
import { useLngTranslation } from "../../../../hooks/useLngTranslation";
import { useSelector } from "react-redux";
import ProfileService from "../../../../apiServices/profile";
import { isErrorDispaly } from "../../../../utils/helpers";
import { Linking } from "react-native";
import useEncryptDecrypt from "../../../../hooks/encDecHook";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";
import { DeleteAccount } from "./interface";
import useMemberLogin from "../../../../hooks/userInfoHook";
import { useNavigation } from "@react-navigation/native";
import { BackHandler } from "react-native";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import ResetPasswordIcon from "../../../../components/svgIcons/mainmenuicons/resetpassword";
import MailIcon from "../../../../components/svgIcons/mainmenuicons/emailsend";
import MailRefreshIcon from "../../../../components/svgIcons/mainmenuicons/emailsend";

const SecurityDashboard = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { t } = useLngTranslation();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const { decryptAES } = useEncryptDecrypt();
    const [deleteBtnLoader, setDeleteBtnLoader] = useState<boolean>(false);
    const [btnDtlLoading, setBtnDtlLoading] = useState(false);
    const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
    const [errormsg, setErrormsg] = useState("");
    const { getMemDetails } = useMemberLogin();
    const changePasswordSheetRef = useRef<any>(null);
    const deleteAccountSheetRef = useRef<any>(null);
    const navigation = useNavigation<any>();
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                backArrowButtonHandler();
                return true;
            });

            return () => {
                backHandler.remove();
            };
        }, 100);

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);
    const backArrowButtonHandler = () => {
        navigation.navigate("NewProfile", { animation: 'slide_from_left' });
    }

    const handleOpenChangePassword = () => {
        setErrormsg("");
        setResetPasswordSuccess(false);
        changePasswordSheetRef.current?.open();
    }
    const handleOpenDeleteAccountPopup = () => {
        deleteAccountSheetRef.current?.open();
    }
    const handleSecuritityNav = () => {
        props.navigation.navigate("Security")
    }
    const handleErrorMsg = () => {
        setErrormsg("");
    };

    const resetPassWord = async () => {
        setErrormsg("");
        setBtnDtlLoading(true);
        setResetPasswordSuccess(false);
        try {
            let response = await ProfileService.resetPassword();
            if (response?.ok) {
                setErrormsg("");
                setBtnDtlLoading(false);
                setResetPasswordSuccess(true);
            } else {
                setErrormsg(isErrorDispaly(response));
                setBtnDtlLoading(false);
                setResetPasswordSuccess(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setBtnDtlLoading(false);
            setResetPasswordSuccess(false);
        }
    }

    const handleClickMail = () => {
        const url = `mailto:${decryptAES(userInfo?.email)}`;
        Linking.openURL(url);
    }

    const deleteMessage = async () => {
        setDeleteBtnLoader(true);
        const Obj: DeleteAccount = { customerId: userInfo?.id, state: "close" }
        try {
            const response = await ProfileService.deleteAccount(Obj);
            if (response?.ok) {
                showAppToast(t("GLOBAL_CONSTANTS.DELETE_ACCOUNT_SUCCESS_MESSAGE"), 'success');
                setDeleteBtnLoader(false);
                deleteAccountSheetRef.current?.close();
                navigation.navigate("CloseAccount");
            } else {
                showAppToast(isErrorDispaly(response), 'error');
                setDeleteBtnLoader(false);
                deleteAccountSheetRef.current?.close();
            }
        } catch (error) {
            setDeleteBtnLoader(false);
            showAppToast(isErrorDispaly(error), 'error');
        }

    }

    const closeDeleteAccountSheet = () => {
        deleteAccountSheetRef.current?.close();
    }
    const closeResetPwd = () => {
        changePasswordSheetRef.current?.close();
    }
    const ChangePasswordSheetContent = (
        <ViewComponent>
            {errormsg && <ErrorComponent message={errormsg} onClose={handleErrorMsg} />}
            {!resetPasswordSuccess ? (
                <>
                    <ViewComponent style={[commonStyles.mxAuto, commonStyles.titleSectionGap]}>
                        <ResetPasswordIcon />
                    </ViewComponent>
                    <ParagraphComponent text={"GLOBAL_CONSTANTS.ARE_YOU_SURE_YOU_WANT_RESET_PASSWORD"} style={[commonStyles.bottomsheetprimarytexttitle, commonStyles.mb6, commonStyles.textCenter]} />
                    <ParagraphComponent style={[commonStyles.bottomsheetsecondarytexttitlepara, commonStyles.textCenter]} text={"GLOBAL_CONSTANTS.CHOOSE_UNIQUE_PASSWORD"} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.mb20, commonStyles.mt44]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title={"GLOBAL_CONSTANTS.CANCEL"}
                                onPress={closeResetPwd}
                                solidBackground={true}
                                disable={deleteBtnLoader}
                            />
                        </ViewComponent>
                         <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title={"GLOBAL_CONSTANTS.RESET_PASSWORD"}
                                onPress={resetPassWord}
                                loading={btnDtlLoading}
                                disable={btnDtlLoading}
                            />
                        </ViewComponent>
                    </ViewComponent>
                </>
            ) : (
                <ViewComponent>

                    <ViewComponent style={[commonStyles.mxAuto,]}>
                        <MailRefreshIcon />
                    </ViewComponent>
                    <ParagraphComponent text={"GLOBAL_CONSTANTS.EMAIL_SEND_SUCCESSFULLY"}
                        style={[commonStyles.bottomsheetsecondarytexttitlepara, commonStyles.textCenter, commonStyles.mb2]} />
                    <ParagraphComponent onPress={handleClickMail} style={[commonStyles.sectionLink, commonStyles.textCenter]}> {decryptAES(userInfo?.email)}{" "}
                    </ParagraphComponent>
                    <ParagraphComponent style={[commonStyles.bottomsheetsecondarytexttitlepara, commonStyles.textCenter]} text={"GLOBAL_CONSTANTS.PLEASE_CHECK_AND_RESET"}></ParagraphComponent>

                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <ViewComponent style={[commonStyles.sectionGap]} />

                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.CLOSE"}
                        onPress={closeResetPwd}
                        solidBackground={true}
                        disable={deleteBtnLoader}
                    />
                </ViewComponent>
            )}
        </ViewComponent>
    );

    const DeleteAccountSheetContent = (
        <ViewComponent>
            <ViewComponent style={[commonStyles.mxAuto,commonStyles.titleSectionGap]}>
                <EvilIcons name="close-o" size={s(76)} color={NEW_COLOR.TEXT_WHITE} />

            </ViewComponent>

            <ParagraphComponent text={"GLOBAL_CONSTANTS.CLOSE_ACCOUNT_CONFIRMATION_MESSAGE"} style={[commonStyles.bottomsheetprimarytexttitle,commonStyles.textCenter, commonStyles.mb6]} />
            <ParagraphComponent text={"GLOBAL_CONSTANTS.DELETE_ACCOUNT_FINTECH_CONFIRMATION_MESSAGE"} style={[commonStyles.bottomsheetsecondarytexttitlepara, commonStyles.sectionGap,commonStyles.textCenter,]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.gap10,]}>
                <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.CANCEL"}
                        onPress={closeDeleteAccountSheet}
                        solidBackground={true}
                        disable={deleteBtnLoader}
                    />
                </ViewComponent>
                <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.OK"}
                        onPress={deleteMessage}
                        customButtonStyle={[{ backgroundColor: NEW_COLOR.TEXT_RED }]}
                        loading={deleteBtnLoader}
                        disable={deleteBtnLoader}
                    />
                </ViewComponent>
            </ViewComponent>
        </ViewComponent>
    );

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <PageHeader title={"GLOBAL_CONSTANTS.ACCOUNT_SECURITY"} onBackPress={backArrowButtonHandler} />
                <ScrollViewComponent>
                    <CommonTouchableOpacity onPress={handleOpenChangePassword} >
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                            <ViewComponent style={[commonStyles.quicklinks, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.roundediconbg]} >
                                <Feather name="lock" size={s(16)} color={NEW_COLOR.TEXT_WHITE} />
                            </ViewComponent>
                            <ParagraphComponent text={"GLOBAL_CONSTANTS.CHANGE_PASSWORD"} style={[commonStyles.profilemenutext, commonStyles.flex1, { flexWrap: 'wrap' }]} />
                            <SimpleLineIcons name="arrow-right" size={s(14)} color={NEW_COLOR.TEXT_WHITE} />
                        </ViewComponent>
                    </CommonTouchableOpacity>
                    <ViewComponent style={commonStyles.listGap} />
                    <CommonTouchableOpacity onPress={handleSecuritityNav}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                            <ViewComponent style={[commonStyles.quicklinks, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.roundediconbg]} >
                                <SecurityIcon width={s(16)} height={s(16)} />
                            </ViewComponent>
                            <ParagraphComponent text={"GLOBAL_CONSTANTS.SECURITY_SETTINGS"} style={[commonStyles.profilemenutext, commonStyles.flex1, { flexWrap: 'wrap' }]} />
                            <SimpleLineIcons name="arrow-right" size={s(14)} color={NEW_COLOR.TEXT_WHITE} />
                        </ViewComponent>
                    </CommonTouchableOpacity>
                    <ViewComponent style={commonStyles.listGap} />
                    <CommonTouchableOpacity onPress={handleOpenDeleteAccountPopup}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                            <ViewComponent style={[commonStyles.quicklinks, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.roundediconbg]} >
                                <EvilIcons name="close-o" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                            </ViewComponent>
                            <ParagraphComponent text={"GLOBAL_CONSTANTS.DELETE_ACCOUNT"} style={[commonStyles.profilemenutext, commonStyles.flex1, { flexWrap: 'wrap' }]} />
                            <SimpleLineIcons name="arrow-right" size={s(14)} color={NEW_COLOR.TEXT_WHITE} />
                        </ViewComponent>
                    </CommonTouchableOpacity>
                </ScrollViewComponent>
            </Container>

            <CustomRBSheet
                refRBSheet={changePasswordSheetRef}
                title={"GLOBAL_CONSTANTS.CHANGE_PASSWORD"}
                height={s(340)}
            >
                {ChangePasswordSheetContent}
            </CustomRBSheet>

            <CustomRBSheet
                refRBSheet={deleteAccountSheetRef}
                title={"GLOBAL_CONSTANTS.DELETE_ACCOUNT"}
                height={s(340)}
            >
                {DeleteAccountSheetContent}
            </CustomRBSheet>

        </ViewComponent>
    );
};

export default SecurityDashboard;
