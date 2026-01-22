import React, { useState, useCallback } from 'react';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import { useLngTranslation } from "../../../../hooks/useLngTranslation";
import ButtonComponent from '../../../../newComponents/buttons/button';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import FormikTextInput from '../../../../newComponents/textInputComponents/formik/textInput';
import SafeAreaViewComponent from '../../../../newComponents/safeArea/safeArea';
import ViewComponent from '../../../../newComponents/view/view';
import { ForgotPasswordSchema, ForgotPasswordFormValues } from "./schema";
import { isErrorDispaly } from '../../../../utils/helpers';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { showAppToast } from '../../../../newComponents/toasterMessages/ShowMessage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useHardwareBackHandler } from '../../../../hooks/backHandleHook';
import Container from '../../../../newComponents/container/container';
import ProfileService from '../../../../apiServices/profile';
import { getAllEnvData } from '../../../../../Environment';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import { Keyboard } from 'react-native';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useLngTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const SECRET_KEY = getAllEnvData().reduxEncryptKey;
  const { encryptAES } = useEncryptDecrypt(SECRET_KEY);

  const [initialValues, setInitialValues] = useState<ForgotPasswordFormValues>({
    email: '',
  });

  const handleForgotPasswordSubmit = async (values: ForgotPasswordFormValues, resetForm: () => void) => {
    Keyboard.dismiss();
    setLoading(true);
    setErrorMsg(null);
    try {
      const object = { email: encryptAES(values?.email) }
      const response: any = await ProfileService.forgotPassword(object);
      if (response && (response.status === 200 || response.success || typeof response === 'string')) {
        // setInitialValues({ email: '' });
        // resetForm();
        showAppToast(`${'Please check the email address'} ${values?.email} ${t("GLOBAL_CONSTANTS.PASSWORD_RESET_SUCCESS_MESSAGE")}`, 'success');
        setLoading(false);
      } else {
        setErrorMsg(isErrorDispaly(response) ?? t("GLOBAL_CONSTANTS.GENERAL_ERROR"));
        setLoading(false);
      }
    } catch (error: any) {
      setLoading(false);
      setErrorMsg(isErrorDispaly(error) ?? t("GLOBAL_CONSTANTS.GENERAL_ERROR"));
    }
  };
  useHardwareBackHandler(() => {
    handleBackToSignIn();
  })
  const handleBackToSignIn = useCallback(() => {
    navigation.navigate("Auth0Signin", { animation: "slide_from_left" });
  }, [navigation]);

  return (
    <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={[commonStyles.container, { flex: 1 }]}>
        <Formik
          initialValues={initialValues}
          validationSchema={ForgotPasswordSchema}
          onSubmit={(values, { resetForm }) => handleForgotPasswordSubmit(values, resetForm)}
          validateOnMount={false}
          validateOnChange={false}
        >
          {({ handleSubmit }) => (
            <ViewComponent style={[commonStyles.flex1]}>
              <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
              >
                <ViewComponent style={[commonStyles.flex1, commonStyles.justifyContent]}>
                  <ViewComponent>
                    {errorMsg && <ErrorComponent message={errorMsg} onClose={() => setErrorMsg(null)} />}
                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <ParagraphComponent text={t('GLOBAL_CONSTANTS.FORGOT_PASSWORD')} style={[commonStyles.signtext]} />
                    <ParagraphComponent
                      text={t("GLOBAL_CONSTANTS.INSTRUCTION")}
                      style={[commonStyles.loginpara]}
                    />
                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <FormikTextInput
                      label={t("GLOBAL_CONSTANTS.EMAIL_ADDRESS")}
                      name="email"
                      placeholder={t("GLOBAL_CONSTANTS.EMAIL_PLACEHOLDER")}
                      placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      isRequired={true}
                    />
                  </ViewComponent>
                  <ViewComponent style={[commonStyles.sectionGap]} />
                  <ViewComponent style={[commonStyles.sectionGap]}>
                    <ButtonComponent
                      title={t("GLOBAL_CONSTANTS.SUBMIT")}
                      onPress={handleSubmit}
                      loading={loading}
                      disable={loading}
                    />
                    <ViewComponent style={[commonStyles.buttongap]} />
                    <ButtonComponent
                      title={t("GLOBAL_CONSTANTS.CANCEL")}
                      onPress={handleBackToSignIn}
                      solidBackground={true}
                      disable={loading}
                    />
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

export default ForgotPasswordScreen;
