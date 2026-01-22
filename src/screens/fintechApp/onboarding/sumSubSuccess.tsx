import React, { useEffect, useState } from 'react';
import { SafeAreaView, BackHandler, useColorScheme } from 'react-native';
import AuthService from '../../../apiServices/auth';
import { useDispatch, useSelector } from 'react-redux';
import { getThemedCommonStyles } from '../../../components/CommonStyles';
import Container from '../../../newComponents/container/container';
import { setUserInfo } from '../../../redux/actions/actions';
import ButtonComponent from '../../../newComponents/buttons/button';
import { useThemeColors } from '../../../hooks/useThemeColors';
import ViewComponent from '../../../newComponents/view/view';
// import { useTokenRefresh } from '../../../hooks/refreshTokenHook';
import useMemberLogin from '../../../hooks/userInfoHook';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ImageUri from '../../../newComponents/imageComponents/image';
import { s } from '../../../newComponents/theme/scale';
import ScrollViewComponent from '../../../newComponents/scrollView/scrollView';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import ConfirmLogout from '../../commonScreens/confirmLogout/comfirmLogout';
import { useSumsubSDK } from '../../../hooks/useSumsubSDK';
import useLogout from '../../../hooks/useLogout';
import { SvgUri } from 'react-native-svg';

const SumsubSuccess = (props: any) => {
  const dispatch = useDispatch<any>();
  const [saveLoading, setSaveLoading] = useState<boolean>(false)
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  // const { refreshToken } = useTokenRefresh();
  const { getMemDetails } = useMemberLogin();
  const { logout } = useLogout();
  const { t } = useLngTranslation();
  const [isVisible, setIsVisible] = useState(false)
  const { launchSumsubSDK } = useSumsubSDK()
  const appThemeSetting = useSelector((state: any) => state.userReducer?.appTheme);
  const colorScheme = useColorScheme();

  const isDarkTheme =
    appThemeSetting !== 'system'
      ? appThemeSetting === 'dark'
      : colorScheme === 'dark';

  const uri = isDarkTheme ? SUCCESS_IMG.dark : SUCCESS_IMG.light;


  useEffect(() => {
    const onBackPress = () => {
      // Do nothing � just block back navigation
      return true; // prevent default behavior
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, []);

  const handleClose = () => {
    setIsVisible(false)
  }
  const handleConfirm = async () => {
    setIsVisible(false)
    handleLgout();
  }
  const handleLogoutBtn = () => {
    setIsVisible(true)
  }
  const handleLgout = async () => {
    await logout();
  };
  const updateUserInfo = () => {
    setSaveLoading(true)
    AuthService.getMemberInfo().then((userLoginInfo: any) => {
      // refreshToken()
      dispatch(setUserInfo(userLoginInfo.data));
      checkUserStatus(userLoginInfo);
    }).catch((error) => {
      setSaveLoading(false)
    })
  }

  const checkUserStatus = async (userLoginInfo: any) => {
    if (userLoginInfo.data?.metadata?.IsSumsubShowOnPending === true) {
      launchSumsubSDK()
      setSaveLoading(false)
    }

    if (userLoginInfo.data?.customerState === "Approved") {
      await getMemDetails();
      setSaveLoading(false)
    } else {
      await getMemDetails(false, "SumsubSuccess");
      setSaveLoading(false)
    }
  }
  return (
    <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
      <Container style={[commonStyles.container, commonStyles.flex1]}>
        <ScrollViewComponent
          contentContainerStyle={[commonStyles.flex1]}
          showsVerticalScrollIndicator={false}
        >
          <ViewComponent style={[commonStyles.flex1]}>
            <ViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter]}>
              <ViewComponent style={[{ width: s(110), height: s(110) }, commonStyles.mxAuto, commonStyles.sectionGap]}>
                <SvgUri height={s(120)} width={s(120)} uri={uri} />
              </ViewComponent>
              <TextMultiLanguage
                text={`${t("GLOBAL_CONSTANTS.YOUR")} ${userInfo?.accountType?.toLowerCase() == 'personal' ? "KYC" : "KYB"} ${t("GLOBAL_CONSTANTS.SUMBITED")}`}
                style={[commonStyles.nodatascreentitle]}
              />

              <TextMultiLanguage
                text={"GLOBAL_CONSTANTS.YOUR_KYC_DETAILS_HAVE_BEEN_SUBMITTED_SUCCESSFULLY_AND_ARE_CURRENTLY_UNDER_REVIEW"}
                style={[commonStyles.nodatascreenPara]}
              />
              <TextMultiLanguage
                style={[commonStyles.nodatascreenPara]}
                text={"GLOBAL_CONSTANTS.YOU_CAN_CONTINUE_BY_REFRESHING_THE_PAGE_OR_LOGGING_IN_AGAIN_THANK_YOU_FOR_YOUR_PATIENCE"}
              />
              <TextMultiLanguage
                style={[commonStyles.nodatascreenPara]}
                text={"GLOBAL_CONSTANTS.YOU_CAN_REFRESH_THE_PAGE"}
              />
            </ViewComponent>

            {/* Bottom Buttons */}
            <ViewComponent>
              <ViewComponent style={[commonStyles.sectionGap]} />
              <ButtonComponent
                title={"GLOBAL_CONSTANTS.REFRESH"}
                loading={saveLoading}
                onPress={() => updateUserInfo()}
              />
              <ViewComponent style={[commonStyles.buttongap]} />
              <ButtonComponent
                title={"GLOBAL_CONSTANTS.LOGOUT"}
                solidBackground={true}
                onPress={() => handleLogoutBtn()}
              />
              <ViewComponent style={[commonStyles.sectionGap]} />
            </ViewComponent>
          </ViewComponent>
          <ConfirmLogout
            isVisible={isVisible}
            onClose={handleClose}
            onConfirm={handleConfirm} />
        </ScrollViewComponent>
      </Container>
    </SafeAreaView>


  );
};

export default SumsubSuccess;

