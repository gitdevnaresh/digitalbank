import { BackHandler } from "react-native";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import Container from "../../../../newComponents/container/container";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import ScrollViewComponent from "../../../../newComponents/scrollView/scrollView";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";
import { useEffect, useState, useCallback } from "react";
import { allTransactionList } from "../../../commonScreens/transactions/skeltonViews";
import Loadding from "../../../commonScreens/skeltons";
import RenderHTML from "react-native-render-html";
import { WINDOW_WIDTH } from "../../../../constants/theme/variables";
import { AuthService } from "../../../../apiServices/onBoardingApis/api";
import { isErrorDispaly } from "../../../../utils/helpers";
import { useFocusEffect } from "@react-navigation/native";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import ViewComponent from "../../../../newComponents/view/view";
import { useHardwareBackHandler } from "../../../../hooks/backHandleHook";
import HelpCenterService from "../../../../apiServices/api/helpCenter/helpCenter";
import DashboardLoader from "../../../../components/loader";
import SafeAreaViewComponent from "../../../../newComponents/safeArea/safeArea";

const HelpCenter = (props: any) => {
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const skeltons = allTransactionList(10);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(false);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  useHardwareBackHandler(() => {
    handleBack();
  })
  const handleBack = useCallback(() => {
    props?.navigation?.goBack();
  }, [props?.navigation]);
  
  useFocusEffect(
    useCallback(() => {
      getHtmlContent();
    }, [])
  );

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleBack();
        return true;
      }
    );
    return () => backHandler.remove();
  }, [handleBack]);

  const getHtmlContent = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await HelpCenterService.getHelpCenterContent();
      
      if (response?.status === 200) {
        setErrorMsg("");
        setHtmlContent(response?.data.templateContent);
      } else {
        setErrorMsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrorMsg(isErrorDispaly(error));
    } finally {
      setIsLoading(false);
    }
  }, []);



  const handleCloseError = useCallback(() => {
    setErrorMsg("");
  }, []);
  const onRefresh = async () => {
    setRefresh(true);
    try {
      await getHtmlContent();
    } finally {
      setRefresh(false);
    }
  };

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {isLoading ? (
        <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </SafeAreaViewComponent>
      ) : (
        <Container style={commonStyles.container}>
          <PageHeader
            title={"GLOBAL_CONSTANTS.HELP_CENTER"}
            onBackPress={handleBack}
          />
          <ScrollViewComponent refreshing={refresh} onRefresh={onRefresh}>
            {errorMsg && (
              <ErrorComponent message={errorMsg} onClose={handleCloseError} />
            )}
            {htmlContent && (
              <RenderHTML
                contentWidth={WINDOW_WIDTH}
                source={{ html: htmlContent }}
              />
            )}
          </ScrollViewComponent>
        </Container>
      )}
    </ViewComponent>
  );
};
export default HelpCenter;

