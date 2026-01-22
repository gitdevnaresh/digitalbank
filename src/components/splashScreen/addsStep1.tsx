import React from "react";
import { Dimensions } from "react-native";
import { useDispatch } from "react-redux";
import { CommonActions, useNavigation } from "@react-navigation/native";

import ViewComponent from "../../newComponents/view/view";
import TextMultiLangauge from "../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { useThemeColors } from "../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../CommonStyles";
import ButtonComponent from "../../newComponents/buttons/button";
import { OnBoardingLightWallets, OnBoardingWallets } from "../../assets/svg";
import CardLogoComponent from "../../newComponents/arthacardlogo/cardlogo";
import { s } from "../../newComponents/theme/scale";
import { useIsDarkTheme } from "../../hooks/themedHook";
import Container from "../../newComponents/container/container";

// Screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const OnboardingStepOne: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const isDarkTheme = useIsDarkTheme();

  // Responsive adjustments
  const responsiveTopSpacing = SCREEN_HEIGHT * 0.03;  // 3% of height  
  const responsiveImageWidth = SCREEN_WIDTH * 0.7;    // 70% of screen
  const responsiveImageHeight = SCREEN_HEIGHT * 0.32; // ~32% of height

  const handleSkip = () => {
    dispatch({ type: "ISONBOARDINGSTEPS", payload: true });
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: "SplaceScreenW2" }],
      })
    );
  };

  const handleNext = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: "OnboardingStepTwo" }],
      })
    );
  };

  return (
    <Container style={[commonStyles.container]}>
      <ViewComponent style={[commonStyles.flex1, commonStyles.justifyContent]}>

        {/* TOP SECTION */}
        <ViewComponent>

          {/* Logo section */}
          <ViewComponent
            style={[
              commonStyles.mxAuto,
              commonStyles.titleSectionGap,
              { marginTop: responsiveTopSpacing }
            ]}
          >
            <CardLogoComponent />
          </ViewComponent>

          {/* Wallet SVG section (responsive size) */}
          <ViewComponent
            style={[
              commonStyles.mxAuto,
              commonStyles.titleSectionGap,
              { width: responsiveImageWidth }
            ]}
          >
            {isDarkTheme ? (
              <OnBoardingWallets
                width={"100%"}
                height={responsiveImageHeight}
                preserveAspectRatio="xMidYMid meet"
              />
            ) : (
              <OnBoardingLightWallets
                width={"100%"}
                height={responsiveImageHeight}
                preserveAspectRatio="xMidYMid meet"
              />
            )}
          </ViewComponent>

          {/* Text section */}
          <ViewComponent>
            <TextMultiLangauge
              text={"GLOBAL_CONSTANTS.DEPOSITE_WITHDRAW"}
              style={[
                commonStyles.fs30,
                commonStyles.fw600,
                commonStyles.textCenter,
                commonStyles.mb8
              ]}
            />

            <TextMultiLangauge
              text={"GLOBAL_CONSTANTS.CRYPTO_CURRENCY"}
              style={[
                commonStyles.fs16,
                commonStyles.fw400,
                commonStyles.textlinkgrey,
                commonStyles.textCenter,
                commonStyles.mt6,
              ]}
            />
          </ViewComponent>

        </ViewComponent>

        {/* BOTTOM BUTTONS */}
        <ViewComponent>
          <ViewComponent style={[commonStyles.sectionGap]}>
            <ButtonComponent
              title={"GLOBAL_CONSTANTS.CONTINUE"}
              onPress={handleNext}
              multiLanguageAllows={true}
            />

            <ViewComponent style={[commonStyles.buttongap]} />

            <ButtonComponent
              title={"GLOBAL_CONSTANTS.SKIP"}
              onPress={handleSkip}
              multiLanguageAllows={true}
              solidBackground={true}
            />
          </ViewComponent>
        </ViewComponent>

      </ViewComponent>
    </Container>
  );
};

export default OnboardingStepOne;
