import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, TouchableOpacity, Modal, Linking } from 'react-native';
import { getThemedCommonStyles } from '../../../components/CommonStyles';
import Container from '../../../newComponents/container/container';
import { s } from '../../../constants/theme/scale';
import { useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import ViewComponent from '../../../newComponents/view/view';
import ButtonComponent from '../../../newComponents/buttons/button';
import { useThemeColors } from '../../../hooks/useThemeColors';
import DashboardLoader from '../../../components/loader';
import { useSumsubSDK } from '../../../hooks/useSumsubSDK';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import CardLogoComponent from '../../../newComponents/arthacardlogo/cardlogo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import useMemberLogin from '../../../hooks/userInfoHook';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import AuthService from '../../../apiServices/auth';
import WebView from 'react-native-webview';
import ConfirmLogout from '../../commonScreens/confirmLogout/comfirmLogout';
import useLogout from '../../../hooks/useLogout';

const Sumsub = React.memo(() => {
    const [loading, setLoading] = useState(false);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { launchSumsubSDK } = useSumsubSDK()
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const { getMemDetails } = useMemberLogin();
    const [webUrl, setWebUrl] = useState<string | null>(null);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const isFocused = useIsFocused();
    const [isVisible, setIsVisible] = useState(false);
    const { logout } = useLogout();

    const handleContinue = () => {
        // launchSumsubSDK();
        if ((userInfo?.accountType !== "Personal" && (userInfo?.kycStatus === 'Approved' || userInfo?.kycStatus === 'success'))) {
            getMemDetails();
        } else {
            if (userInfo?.accountType?.toLowerCase() === 'business') {
                getWebUrl();
            } else {
                launchSumsubSDK();

            }
        }

        // Navigate to the next KYC/KYB step (replace 'KycProfile' with your actual route)
    };

    useEffect(() => {
        if (userInfo?.accountType?.toLowerCase() === 'business') {
            getWebUrl();
        }
    }, [isFocused]);

    const handleClose = () => {
        setIsVisible(false)
    }
    const handleConfirm = async () => {
        setIsVisible(false)
        handleLogout();
    }
    const handleLogoutBtn = () => {
        setIsVisible(true)
    }

    const handleLogout = async () => {
        setLoading(true);
        await logout();
        setLoading(false);
    };
    const onRefresh = () => {
        getMemDetails(true);
    };
    const getWebUrl = async () => {
        try {
            const response: any = await AuthService.getBusinessWebUrl(userInfo?.id);
            if (response.ok) {
                Linking.openURL(response?.data?.url);
            }
        } catch (error) {

        }
    }
    const handleCloseWebView = () => {
        setIsModelOpen(false);
    };
    return (
        <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
            {loading && (
                <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                    <DashboardLoader />
                </ViewComponent>
            )}
            {!loading && (
                <Container style={[commonStyles.container]}>
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter,]}>
                            <ViewComponent style={[commonStyles.mxAuto]}>
                                <CardLogoComponent />
                            </ViewComponent>
                            <TouchableOpacity activeOpacity={0.6} onPress={onRefresh}>
                                <MaterialIcons
                                    name="refresh"
                                    size={s(24)}
                                    color={NEW_COLOR.TEXT_WHITE}
                                    style={[commonStyles.mt4]}
                                />
                            </TouchableOpacity>
                        </ViewComponent>

                        <ViewComponent style={[commonStyles.sectionGap]} />

                        <ViewComponent style={[commonStyles.flex1]}>

                            <ViewComponent style={[commonStyles.sectionGap]} />

                            <ViewComponent style={[commonStyles.myAuto]}>
                                <ViewComponent style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                    <ParagraphComponent
                                        text={userInfo?.accountType == "Business" ? "KYB" : "KYC"}
                                        style={[commonStyles.sectionTitle, commonStyles.textCenter, commonStyles.mb6, { marginHorizontal: 4 }]}
                                    />
                                    <TextMultiLanguage
                                        text={"GLOBAL_CONSTANTS.VERIFICATION"}
                                        style={[commonStyles.sectionTitle, commonStyles.textCenter, commonStyles.mb6]}
                                    />
                                </ViewComponent>


                                <TextMultiLanguage
                                    text={"GLOBAL_CONSTANTS.YOUR_ARE_ABOUT_TO_SUBMIT_SENSITIVE_DATA"}
                                    style={[
                                        commonStyles.sectionsubtitlepara,
                                        commonStyles.textCenter,
                                        commonStyles.sectionGap,
                                    ]}
                                />
                                {/* {userInfo?.accountType == "Business" && (
                                    <ViewComponent style={[commonStyles.bgnote, commonStyles.sectionGap]}>
                                        <ViewComponent
                                            style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap8]}
                                        >
                                            <MaterialIcons
                                                name="info-outline"
                                                size={s(20)}
                                                color={NEW_COLOR.NOTE_ICON}
                                            />
                                            <ViewComponent style={[commonStyles.flex1]}>
                                                <TextMultiLanguage
                                                    style={[commonStyles.bgNoteText]}
                                                    text={"GLOBAL_CONSTANTS.KYB_NOTE"}
                                                />
                                            </ViewComponent>
                                        </ViewComponent>
                                    </ViewComponent>
                                )} */}

                            </ViewComponent>

                        </ViewComponent>
                        <ViewComponent style={[]}>
                            {(userInfo?.accountType !== "Personal" && (userInfo?.kycStatus === 'Approved' || userInfo?.kycStatus === 'success')) && (
                                <ViewComponent>
                                    <ButtonComponent title={"GLOBAL_CONSTANTS.REFRESH"} onPress={handleContinue} />
                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                </ViewComponent>
                            )

                            }
                            <ButtonComponent title={"GLOBAL_CONSTANTS.CONTINUE"} onPress={handleContinue} />
                            <ViewComponent style={[commonStyles.buttongap]} />
                            <ButtonComponent
                                title={"GLOBAL_CONSTANTS.LOGOUT"}
                                onPress={handleLogoutBtn}
                                solidBackground={true}
                            />
                            <ViewComponent style={[commonStyles.sectionGap]} />
                        </ViewComponent>

                        <ConfirmLogout
                            isVisible={isVisible}
                            onClose={handleClose}
                            onConfirm={handleConfirm} />
                    </ScrollView>
                </Container>

            )}
            {isModelOpen && (
                <Modal
                    visible={isModelOpen}
                    onRequestClose={handleCloseWebView}
                    animationType="slide"
                >
                    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>

                        <WebView
                            source={{ uri: webUrl || '' }}
                            style={[commonStyles.flex1, commonStyles.screenBg]}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                        />

                    </SafeAreaView>
                </Modal>
            )
            }
        </SafeAreaView>
    );
});

export default Sumsub;


