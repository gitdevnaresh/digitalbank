import { View, SafeAreaView } from "react-native";
import React, { useState } from "react";
import { isLogin, loginAction, setUserInfo } from "../../redux/actions/actions";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import Container from "../../newComponents/container/container";
import ConfirmLogout from "./confirmLogout/comfirmLogout";
import { useThemeColors } from "../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../components/CommonStyles";
import ButtonComponent from "../../newComponents/buttons/button";
import Keychain from 'react-native-keychain';
import { NotificationImage, NotificationLightImage, SessionImage, SessionLightImge } from "../../assets/svg";
import ViewComponent from "../../newComponents/view/view";
import { useIsDarkTheme } from "../../hooks/themedHook";
import ParagraphComponent from "../../newComponents/textComponets/paragraphText/paragraph";
const RelogIn = (props: any) => {
    const navigation = useNavigation();
    const dispatch = useDispatch<any>();
    const NEW_COLOR = useThemeColors();
     const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const isDarkTheme = useIsDarkTheme();
    const [isVisible, setIsVisible] = useState(false)
    const handleLgout = async () => {
        dispatch(setUserInfo(""));
        dispatch(isLogin(false));
        dispatch(loginAction(null));
        await Keychain.resetGenericPassword({ service: 'authTokens' });
        setTimeout(() => {
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{ name: "SplaceScreenW2" }],
                })
            );
        }, 800);
    };
    const handleClose = () => {
        setIsVisible(false)
    }
    const handleConfirm = () => {
        setIsVisible(false)
    }
    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <ViewComponent style={[commonStyles.sectionGap]} />
                <View>
                    <View style={[commonStyles.alignCenter, commonStyles.sectionGap]}>
                        {isDarkTheme ? <NotificationImage /> : <NotificationLightImage />}
                    </View>
                    <ParagraphComponent style={[commonStyles.fs24, commonStyles.fw700, commonStyles.textWhite, commonStyles.textCenter,commonStyles.mb20]} text={'No Notifications yet'} />
                    <ParagraphComponent style={[commonStyles.fs20, commonStyles.fw500, commonStyles.textlinkgrey, commonStyles.textCenter]} text={`Your Notification will appear here once you have received them.`} />
                    <ParagraphComponent style={[commonStyles.fs20, commonStyles.fw500, commonStyles.textlinkgrey, commonStyles.textCenter, commonStyles.mt8]} text={`Messing notification?`} />
                    <ParagraphComponent style={[commonStyles.fs20, commonStyles.fw500, commonStyles.textGreen, commonStyles.textCenter, commonStyles.mt8]} text={`Go to historical notifications.`} />
  </View>

                    
            </Container>
        </SafeAreaView>
    );
};

export default RelogIn;


