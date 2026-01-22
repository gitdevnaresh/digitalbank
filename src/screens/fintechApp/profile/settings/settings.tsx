import { ActivityIndicator, View } from "react-native";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import { s } from "../../../../constants/theme/scale";
import CustomRBSheet from "../../../../newComponents/models/commonDrawer";
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useLngTranslation } from "../../../../hooks/useLngTranslation";
import { LanguageArabicIcon, LanguageEngIcon, LanguageGerIcon, LanguageTeluguTcon, SettingsAppearanceIcon, SettingsLanguageIcon, WithdrawImage } from "../../../../assets/svg";
import { useDispatch, useSelector } from "react-redux";
import { setAppTheme } from "../../../../redux/actions/actions";
import { getLanguageConfiguration } from "../../../../../configuration";
import TextMultiLangauge from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import Container from "../../../../newComponents/container/container";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import ScrollViewComponent from "../../../../newComponents/scrollView/scrollView";
import ViewComponent from "../../../../newComponents/view/view";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Feather, SimpleLineIcons } from "@expo/vector-icons";
import LanguageIcon from "../../../../components/svgIcons/mainmenuicons/language";
import AppreanceIcon from "../../../../components/svgIcons/mainmenuicons/appreance";
import { showAppToast } from "../../../../newComponents/toasterMessages/ShowMessage";
import { useHardwareBackHandler } from "../../../../hooks/backHandleHook";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";

const Settings = (props: any) => {
  const refRBSheet = useRef<any>(null);
  const refThemeRBSheet = useRef<any>(null);
  const { changeLanguage, currentLanguage } = useLngTranslation();
  const [activeLanguage, setActiveLanguage] = useState<string>()
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const appThemeSetting = useSelector((state: any) => state.userReducer?.appTheme)
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const languageConfig = getLanguageConfiguration();
  const { t } = useLngTranslation();
  useEffect(() => {
    getLabelByKey(currentLanguage);
  })
  useHardwareBackHandler(() => {
    backArrowButtonHandler();
  })
  const backArrowButtonHandler = () => {
    props.navigation.goBack();
  }
  const handleNavigateLanguage = () => {
    refRBSheet.current.open();
  }

  const getLabelByKey = (key: string) => {
    const language = languages.find(lang => lang.key === key);
    const languageLable = language?.label;
    setActiveLanguage(languageLable)
  };

  const languages = [
    { key: 'en', label: "GLOBAL_CONSTANTS.ENGLISH", icon: <LanguageEngIcon height={s(40)} width={s(40)} style={[commonStyles.mxAuto]} /> },
    { key: 'te', label: "GLOBAL_CONSTANTS.TELUGU", icon: <LanguageTeluguTcon height={s(40)} width={s(40)} style={[commonStyles.mxAuto]} /> },
    // { key: 'ar', label: '????', icon: <LanguageArabicIcon height={s(40)} width={s(40)} style={[commonStyles.mxAuto]} /> },
    // { key: 'ms', label: 'Melayu', icon: <LanguageTeluguTcon height={s(40)} width={s(40)} style={[commonStyles.mxAuto]} /> },
    // { key: 'de', label: 'German', icon: <LanguageGerIcon height={s(40)} width={s(40)} style={[commonStyles.mxAuto]} /> },
  ];
  const setSelectedLanguage = async (lang: string) => {
    setIsLoading(true);
    await changeLanguage(lang);
    setIsLoading(false);
  };
  const filteredLanguages = useMemo(() => {
    return languages.filter(lang => languageConfig.includes(lang.key));
  }, [languages, languageConfig]);

  const languageswitchLoader = (
    <ViewComponent style={[commonStyles.mx14]}>
      {/* <ActivityIndicator size="large" color={NEW_COLOR.TEXT_GREY} /> */}
      {/* <TextMultiLangauge text={"GLOBAL_CONSTANTS.PLEASE_WAIT"} style={[commonStyles.textAlwaysWhite, commonStyles.fs16, commonStyles.fw600, commonStyles.textCenter, commonStyles.mt10]} /> */}
    </ViewComponent>
  )
  const themes = [
    { key: 'light', label: 'Light', icon: 'sunny' },
    { key: 'dark', label: 'Dark', icon: 'moon-sharp' },
    { key: 'system', label: 'System', icon: 'settings' },
  ];
  const handleChangeTheme = async (selectedThemeOption: any) => {
    const themeKey = selectedThemeOption?.key;
    if (themeKey) {
      dispatch(setAppTheme(themeKey));
    }
    showAppToast(t("GLOBAL_CONSTANTS.YOUR_THEME_HAS_BEEN_CHANGED"), 'success');
    refThemeRBSheet.current?.close();
  };
  const selectedThemeObject = themes.find(theme => theme.key === appThemeSetting);
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={commonStyles.container}>
        <PageHeader title={"GLOBAL_CONSTANTS.SETTINGS"} onBackPress={backArrowButtonHandler} />
        <ScrollViewComponent>
          <CommonTouchableOpacity
            onPress={handleNavigateLanguage}
          >
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
              <ViewComponent style={[commonStyles.roundediconbg]} >
                <LanguageIcon height={s(18)} width={s(18)} />

              </ViewComponent>
              <ParagraphComponent text={"GLOBAL_CONSTANTS.LANGUAGE"} style={[commonStyles.profilemenutext, commonStyles.flex1, { flexWrap: 'wrap' }]} />
              <ParagraphComponent text={activeLanguage} style={[commonStyles.profilemenutext]} />
              <SimpleLineIcons name="arrow-right" size={s(14)} color={NEW_COLOR.TEXT_WHITE} />
            </ViewComponent>
          </CommonTouchableOpacity>
          <ViewComponent style={commonStyles.sectionGap} />
          <CommonTouchableOpacity
            onPress={() => refThemeRBSheet.current?.open()}
          >
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
              <ViewComponent style={[commonStyles.roundediconbg]} >

                <AppreanceIcon height={s(18)} width={s(18)} />
              </ViewComponent>
              <ParagraphComponent text={"GLOBAL_CONSTANTS.APPEARANCE"} style={[commonStyles.profilemenutext, commonStyles.flex1, { flexWrap: 'wrap' }]} />
              {selectedThemeObject && <Ionicons name={selectedThemeObject.icon as any} size={s(18)} color={NEW_COLOR.TEXT_WHITE} />}
              <SimpleLineIcons name="arrow-right" size={s(14)} color={NEW_COLOR.TEXT_WHITE} />
            </ViewComponent>
          </CommonTouchableOpacity>
          <CustomRBSheet
            refRBSheet={refThemeRBSheet}
            title={"GLOBAL_CONSTANTS.APPEARANCE"}
            height={s(280)}
          >
            <ViewComponent>
              {themes.map((theme, index) => (
                <React.Fragment key={theme.key}>
                  <CommonTouchableOpacity
                    style={[
                      commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.justify, commonStyles.borderTransparent,
                      appThemeSetting === theme.key && commonStyles.tabactivebg, commonStyles.p10, commonStyles.rounded5
                    ]}
                    onPress={() =>
                      handleChangeTheme(theme)
                    }
                  >
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                      <ViewComponent style={[commonStyles.bottomsheetroundediconbg,appThemeSetting === theme.key && commonStyles.bottomsheetroundedactiveiconbg,]}>
                        <Ionicons name={theme.icon as any} size={s(18)} color={NEW_COLOR.TEXT_WHITE} />

                      </ViewComponent>
                      <TextMultiLangauge style={[commonStyles.bottomsheetprimarytext]} text={theme.label}/>
                      
                    </ViewComponent>
                  </CommonTouchableOpacity>
                  {index !== themes.length - 1 && (
                    <View style={[commonStyles.listGap]} />
                  )}
                </React.Fragment>
              ))}
            </ViewComponent>
          </CustomRBSheet>
        </ScrollViewComponent>
      </Container>
      <CustomRBSheet
        refRBSheet={refRBSheet}
        title="GLOBAL_CONSTANTS.CHANGE_LANGUAGE"
        height={s(240)}
      >
        <ViewComponent>
          {filteredLanguages.map((lang, index) =>
            <React.Fragment key={lang.key}>
              <CommonTouchableOpacity
                style={[
                  commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.justify, currentLanguage === lang.key && commonStyles.tabactivebg, commonStyles.p10, commonStyles.rounded5
                ]}
                onPress={() => {
                  setSelectedLanguage(lang.key);
                  showAppToast(t("GLOBAL_CONSTANTS.YOUR_LANGUAGE_HAS_BEEN_CHANGED"), 'success');
                  refRBSheet.current?.close();
                }}
              >
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                  <ViewComponent>
                    {lang?.icon}
                  </ViewComponent>
                  <ParagraphComponent style={[commonStyles.bottomsheeticonprimarytext]}>
                    {lang.label}
                  </ParagraphComponent>
                </ViewComponent>
                {/* {currentLanguage === lang.key && (
                  <Feather name="check" size={18} color={NEW_COLOR.TEXT_GREEN} />
                )} */}
              </CommonTouchableOpacity>
              {index !== filteredLanguages.length - 1 && (
                <View style={[commonStyles.listGap]} />
              )}
            </React.Fragment>
          )}
        </ViewComponent>
      </CustomRBSheet>
      {/* <CustomOverlay
        showHeader={false}
        isVisible={isLoading}
        children={languageswitchLoader}
        crossIcon={false}
      /> */}
    </ViewComponent>
  );
};

export default Settings;


