import React, { useState, useCallback, useEffect } from 'react';
import { Field, Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import { useLngTranslation } from "../../../../hooks/useLngTranslation";
import { Auth0SigninSchema, Auth0SigninFormValues } from "./schema";
import { isErrorDispaly, logApiErrorToSentry } from '../../../../utils/helpers';
import { storeMfaToken, storeToken } from '../../../../apiServices/auth0Service';
import useMemberLogin from '../../../../hooks/userInfoHook';
import { getAllEnvData } from '../../../../../Environment';
import SafeAreaViewComponent from '../../../../newComponents/safeArea/safeArea';
import ViewComponent from '../../../../newComponents/view/view';
import ButtonComponent from '../../../../newComponents/buttons/button';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import InputDefault from '../../../../newComponents/textInputComponents/DefaultFiat';
import CommonTouchableOpacity from '../../../../newComponents/touchableComponents/touchableOpacity';
import TextMultiLangauge from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import FormikTextInput from '../../../../newComponents/textInputComponents/formik/textInput';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch } from 'react-redux';
import { setDeleteScreenPermissions, setMenuItems } from '../../../../redux/actions/actions';
import AuthService from '../../../../apiServices/auth';
import { useHardwareBackHandler } from '../../../../hooks/backHandleHook';
import Container from '../../../../newComponents/container/container';
import useNotifications from '../../../../hooks/useNotification';
import ProfileService from '../../../../apiServices/profile';
import { logEvent } from '../../../../hooks/loggingHook';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import { LoginBody } from '../Signup/constants';
import LabelComponent from '../../../../newComponents/textComponets/lableComponent/lable';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';

const Auth0Signin = () => {
  const navigation = useNavigation<any>();
  const { t } = useLngTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { getMemDetails } = useMemberLogin();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const SECRET_KEY = getAllEnvData().reduxEncryptKey;
  const { encryptAES } = useEncryptDecrypt(SECRET_KEY);
  const initialValues: Auth0SigninFormValues = {
    email: '',
    password: '',
  };
  const {
    fcmToken,
  } = useNotifications({
    isAuthenticated: true, // Pass your auth state
    onNotificationPress: (data) => {
      // Handle when user taps notification
      // console.log('Notification data:', data);
    }
  });
  const dispatch = useDispatch<any>();
  useEffect(() => {
    if (fcmToken) {
      getToken();
    }
  }, [fcmToken]);
  const getNotificationPermission = async () => {
    try {
      const object = { value: fcmToken }
      await ProfileService.postPushNotification(object);
    } catch (error) {
      console.error("Error getting FCM token:", error);
    }
  };

  const handleSignin = async (
    values: Auth0SigninFormValues,
    { setFieldValue }: { setFieldValue: (field: string, value: any) => void }
  ) => {
    if (loading) return; // ✅ prevent double submit
    setLoading(true);
    setErrorMsg(null);
    try {
      const body: LoginBody = {
        email: encryptAES(values?.email),
        password: encryptAES(values?.password),
      };
      const response: any = await ProfileService.signin(body);
      const parsedData = JSON.parse(response?.data);
      if (response?.status === 200) {
        if (parsedData.error && parsedData.error === 'mfa_required') {
          await storeMfaToken(parsedData.mfa_token);
          navigation.navigate("MfaScreen");
          return;
        } else if (parsedData?.access_token) {
          await storeToken(parsedData?.access_token, parsedData?.refresh_token);
          getMemDetails(false, undefined, true);
          MenuPermission();
        }
        else if (parsedData.error) {
          setErrorMsg(isErrorDispaly(parsedData?.error_description));
          logApiErrorToSentry({
            url: `/api/v1/Token`,
            method: "POST",
            statusCode: 422,
            requestBody: body,
            responseData: errorMsg,
            userId: "",
            errorMessage: `Invalid Grant Error: ${errorMsg || 'Unknown error'}`,
          });
        }
        setLoading(false);
        if (fcmToken&&parsedData?.access_token) {
          logEvent("FCM Token", { action: "Get FCM Token", fcm: fcmToken });
          getNotificationPermission();
        }
        logEvent("Button Pressed", { action: "Login", nextScreen: "Dashboard", currentScreen: "Signin" })
      } else {
        setLoading(false);
        setErrorMsg(isErrorDispaly(parsedData?.error_description));
      }
    } catch (error: any) {
      setLoading(false);
      const auth0ErrorDetails = error.parsedData;
      if (auth0ErrorDetails && (auth0ErrorDetails.error === "access_denied" || auth0ErrorDetails.error === "invalid_grant")) {
        setErrorMsg(t("GLOBAL_CONSTANTS.INCORRECT_CREDENTIALS") || t("GLOBAL_CONSTANTS.INCORRECT_EMAIL_ADDRESS_USERNAME_OR_PASSWORD"));
        setFieldValue('password', '');
      } else {
        setErrorMsg(isErrorDispaly(auth0ErrorDetails ?? error));
      }
    }
  };

  const getToken = () => {
    // console.log(fcmToken, 'fcmToken');
  };

  const MenuPermission = () => {
    AuthService.getMenuItems().then((res: any) => {
        if (res?.data?.length > 0) {
          dispatch(setMenuItems(res?.data));
          dispatch(setDeleteScreenPermissions({}));
        }
    }).catch((error: any) => {
        console.error("Error fetching menu items:", error);
      });
  };
  useHardwareBackHandler(() => {
    handleBackPress();
  })
  const handleBackPress = useCallback(() => {
    if (loading) return; // ✅ block during loading without style change
    if (navigation.canGoBack()) {
      navigation.navigate("SplaceScreenW2", { animation: 'slide_from_left' });
    }
  }, [navigation, loading]);

  const goToSignup = useCallback(() => {
    if (loading) return; // ✅ block during loading without style change
    navigation.navigate("Auth0Signup");
  }, [navigation, loading]);

  return (
    <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={[commonStyles.container]}>
        <Formik
          initialValues={initialValues}
          validationSchema={Auth0SigninSchema}
          onSubmit={(values, formikActions) => handleSignin(values, formikActions)}
          enableReinitialize
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ touched, handleSubmit, errors }) => (
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
                      text={"GLOBAL_CONSTANTS.SIGN_IN"}
                    />
                    <ViewComponent style={[commonStyles.sectionGap]} />

                    {errorMsg && <ErrorComponent message={errorMsg} onClose={() => setErrorMsg(null)} />}

                    <Field
                      editable={!loading}
                      label={"GLOBAL_CONSTANTS.USER_NAME_OR_EMAIl"}
                      name="email"
                      touched={touched.email}
                      error={errors.email}
                      placeholder={t("GLOBAL_CONSTANTS.ENTER_USER_NAME_OR_EMAIL")}
                      placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                      autoCapitalize="none"
                      component={InputDefault}
                      requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    <FormikTextInput
                      label={"GLOBAL_CONSTANTS.PASSWORD"}
                      name="password"
                      placeholder={"GLOBAL_CONSTANTS.PASSWORD_PLACEHOLDER"}
                      placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                      secureTextEntry={true}
                      isRequired={true}
                      maxLength={64}
                      editable={!loading}
                    />

                    <ViewComponent
                      style={[
                        commonStyles.mt8,
                        commonStyles.dflex,
                        commonStyles.alignCenter,
                        commonStyles.alignStart
                      ]}
                      // ✅ block click without changing any color/opacity
                    >
                      <ParagraphComponent
                        text={"GLOBAL_CONSTANTS.FORGOT_PASSWORD"}
                        style={[commonStyles.inputbottomtextlink]}
                        onPress={() => navigation.navigate("ForgotPasswordScreen")}
                      />
                    </ViewComponent>
                  </ViewComponent>

                  {/* ✅ Block only bottom actions via pointerEvents */}
                  <ViewComponent style={[commonStyles.mt32]} >
                    <ButtonComponent
                      title={t("GLOBAL_CONSTANTS.SIGN_IN")}
                      onPress={handleSubmit}
                      loading={loading}
                      disable={loading}
                    />
                    <ViewComponent style={[commonStyles.buttongap]} />
                    <ButtonComponent
                      title={t("GLOBAL_CONSTANTS.CANCEL")}
                      onPress={handleBackPress}
                      solidBackground={true}
                      disable={false}
                    />

                    <ViewComponent
                      style={[
                        commonStyles.dflex,
                        commonStyles.alignCenter,
                        commonStyles.mt20,
                        commonStyles.justifyCenter,
                        commonStyles.gap2,
                        commonStyles.sectionGap
                      ]}
                    >
                      <TextMultiLangauge
                        text={"GLOBAL_CONSTANTS.DIDT_HAVE_AN_ACCOUNT"}
                        style={[commonStyles.sectionSubTitleText]}
                      />

                      {/* ✅ do NOT use disabled={loading} (it fades). Just block via pointerEvents above */}
                      <CommonTouchableOpacity
                        onPress={goToSignup}
                        activeOpacity={1}
                        style={{ opacity: 1 }} // ✅ keep same color during loading
                      >
                        <ParagraphComponent
                          text={"GLOBAL_CONSTANTS.SIGN_UP"}
                          style={[commonStyles.sectionLink]}
                        />
                      </CommonTouchableOpacity>
                    </ViewComponent>
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

export default Auth0Signin;
