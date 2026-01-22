import React, { useState, useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useLngTranslation } from "../../../../hooks/useLngTranslation";
import ButtonComponent from '../../../../newComponents/buttons/button';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import { storeMfaToken, storeToken } from '../../../../apiServices/auth0Service';
import InputDefault from '../../../../newComponents/textInputComponents/DefaultFiat';
import { getAllEnvData } from '../../../../../Environment';
import { Auth0SignupFormValues, Auth0SignupSchema } from './schema';
import { useDispatch } from 'react-redux';
import { isLogin, loginAction, setUserInfo } from '../../../../redux/actions/actions';
import ViewComponent from '../../../../newComponents/view/view';
import TextMultiLangauge from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import CommonTouchableOpacity from '../../../../newComponents/touchableComponents/touchableOpacity';
import { isErrorDispaly } from '../../../../utils/helpers';
import { Field, Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import SafeAreaViewComponent from '../../../../newComponents/safeArea/safeArea';
import FormikTextInput from '../../../../newComponents/textInputComponents/formik/textInput';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import { LoginBody, PasswordCriteriaDisplay, SignupBody } from './constants';
import useMemberLogin from '../../../../hooks/userInfoHook';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Container from '../../../../newComponents/container/container';
import { logEvent } from '../../../../hooks/loggingHook';
import ProfileService from '../../../../apiServices/profile';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import useNotifications from '../../../../hooks/useNotification';
import LabelComponent from '../../../../newComponents/textComponets/lableComponent/lable';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';

const Auth0Signup = () => {
  const navigation = useNavigation<any>();
  const { t } = useLngTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
  const dispatch = useDispatch<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { getMemDetails } = useMemberLogin();
  const SECRET_KEY = getAllEnvData().reduxEncryptKey;
  const { encryptAES } = useEncryptDecrypt(SECRET_KEY);
  const initialValues: Auth0SignupFormValues = {
    email: '',
    username: '',
    password: '',
  };
   const {fcmToken} = useNotifications({isAuthenticated: true});
  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.navigate("SplaceScreenW2", { animation: 'slide_from_left' });
      return true;
    }
    return false;
  }, [navigation]);
  const getNotificationPermission = async () => {
    try {
      const object = { value: fcmToken }
      await ProfileService.postPushNotification(object);
    } catch (error) {
      console.error("Error getting FCM token:", error);
    }
  };
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [handleBackPress]);
  const handleSignup = async (values: Auth0SignupFormValues, { setFieldValue }: { setFieldValue: (field: string, value: any) => void }) => {
    logEvent("Button Pressed", { action: "Signup Button",currentScreen: "Signup"})
    setLoading(true);
    setErrorMsg(null);

    try {
      const body:SignupBody = {
        email: encryptAES(values?.email),
        password: encryptAES(values?.password),
        UserName: encryptAES(values?.username),
      };
      const loginbody:LoginBody = {
        email: encryptAES(values?.email),
        password: encryptAES(values?.password),
      };
      const response: any = await ProfileService.signup(body);
      if (response.status == 200 && response.data?.userId) {
        const response2: any = await ProfileService.signin(loginbody);
        const parsedData = JSON.parse(response2.data);
        if (response2.status === 200) {
          if (parsedData.error && parsedData.error === 'mfa_required') {
            await storeMfaToken(parsedData.mfa_token);
            navigation.navigate("MfaScreen");
            return;
          }
          else if (parsedData.access_token) {
            await storeToken(parsedData.access_token, "");
            dispatch(loginAction(null));
            dispatch(setUserInfo(""));
            dispatch(isLogin(false));
            getMemDetails();
            if (fcmToken) {
              getNotificationPermission();
            }
            setLoading(false);
          }
          else if (parsedData.error) {
            setErrorMsg(isErrorDispaly(parsedData?.error_description));
            setLoading(false);
          }
        } else {
          setLoading(false);
          setErrorMsg(isErrorDispaly(response));
        }
    }else{
        setLoading(false);
        setErrorMsg(isErrorDispaly(response));
      }
    } catch (error: any) {
      setLoading(false);
      setErrorMsg(isErrorDispaly(error));
    }
  };

  return (
    <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={[commonStyles.container]}>
        <Formik
          initialValues={initialValues}
          validationSchema={Auth0SignupSchema}
          enableReinitialize
          validateOnChange={true}
          validateOnBlur={true}
          onSubmit={(values, formikActions) => handleSignup(values, formikActions)}
        >
          {({ values, touched, handleSubmit, errors }) => (
            <ViewComponent style={[commonStyles.flex1]}>
              <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                extraScrollHeight={150}
                enableAutomaticScroll={true}
              >
                <ViewComponent style={[commonStyles.flex1, commonStyles.justifyContent]}>
                  <ViewComponent>
                    <ViewComponent style={[commonStyles.mt32]} />

                    <TextMultiLangauge
                      style={[commonStyles.sectionTitle]}
                      text={"GLOBAL_CONSTANTS.SIGN_UP"}
                    />
                    <ViewComponent style={[commonStyles.sectionGap]} />
                    {errorMsg && (
                      <ErrorComponent message={errorMsg} onClose={() => setErrorMsg(null)} />
                    )}
                    <Field
                      editable={!loading}
                      touched={touched.email}
                      error={errors.email}
                      label={"GLOBAL_CONSTANTS.EMAIL_ADDRESS"}
                      name="email"
                      style={[
                        commonStyles.textInput,
                        touched.email && errors.email && commonStyles.errorBorder,
                      ]}
                      placeholder={"GLOBAL_CONSTANTS.EMAIL_PLACEHOLDER"}
                      placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      component={InputDefault}
                      maxLength={50}
                      requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    <Field
                      editable={!loading}
                      label={"GLOBAL_CONSTANTS.USER_NAME"}
                      touched={touched.username}
                      error={errors.username}
                      name="username"
                      style={[
                        commonStyles.textInput,
                        touched.username && errors.username && commonStyles.errorBorder,
                      ]}
                      placeholder={"GLOBAL_CONSTANTS.ENTER_USER_NAME"}
                      placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                      autoCapitalize="none"
                      component={InputDefault}
                      maxLength={50}
                      requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    <FormikTextInput
                      editable={!loading}
                      label={"GLOBAL_CONSTANTS.PASSWORD"}
                      name="password"
                      placeholder={"GLOBAL_CONSTANTS.PASSWORD_PLACEHOLDER"}
                      placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                      secureTextEntry
                      isRequired
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      maxLength={64}
                    />
                    <ViewComponent style={[commonStyles.py8]} />
                    {(isPasswordFocused || (touched?.password ||values.password)) && (
                      <PasswordCriteriaDisplay
                        password={values.password}
                        NEW_COLOR={NEW_COLOR}
                        commonStyles={commonStyles}
                        t={t}
                      />
                    )}
                  </ViewComponent>
                  <ViewComponent style={[commonStyles.sectionGap]}>

                    <ButtonComponent
                      title={t("GLOBAL_CONSTANTS.SIGN_UP")}
                      onPress={handleSubmit}
                      loading={loading}
                      disable={loading}
                    />
                    <ViewComponent style={[commonStyles.buttongap]} />
                    <ButtonComponent
                      title={t("GLOBAL_CONSTANTS.CANCEL")}
                      onPress={handleBackPress}
                      solidBackground
                      disable={loading}
                    />
                    {!loading && (
                      <ViewComponent
                        style={[
                          commonStyles.dflex,
                          commonStyles.alignCenter,
                          commonStyles.mt20,
                          commonStyles.justifyCenter,
                          commonStyles.gap2,
                        ]}
                      >
                        <TextMultiLangauge
                          text={"GLOBAL_CONSTANTS.ALREADY_HAVE_AN_ACCOUNT"}
                          style={[commonStyles.sectionSubTitleText]}
                        />
                        <CommonTouchableOpacity onPress={() => navigation.navigate("Auth0Signin")}>
                          <ParagraphComponent
                            text={"GLOBAL_CONSTANTS.SIGN_IN"}
                            style={[
                              commonStyles.sectionLink
                            ]}
                          />
                        </CommonTouchableOpacity>
                      </ViewComponent>
                    )}
                  </ViewComponent>
                </ViewComponent>
              </KeyboardAwareScrollView>
            </ViewComponent>
          )}
        </Formik>
      </Container>
    </SafeAreaViewComponent>

  );
};

export default Auth0Signup;
