import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BackHandler, Keyboard} from 'react-native';
import { Formik, Field, FormikErrors } from 'formik';
import { useSelector } from 'react-redux';
import { getThemedCommonStyles } from '../../../../../../components/CommonStyles';
import { useThemeColors } from '../../../../../../hooks/useThemeColors';
import useEncryptDecrypt from '../../../../../../hooks/encDecHook';
import Container from '../../../../../../newComponents/container/container';
import ViewComponent from '../../../../../../newComponents/view/view';
import PageHeader from '../../../../../../newComponents/pageHeader/pageHeader';
import ErrorComponent from '../../../../../../newComponents/errorDisplay/errorDisplay';
import { isErrorDispaly } from '../../../../../../utils/helpers';
import TeamsService from '../../service';
import CustomPickerAcc from '../../../../../../newComponents/customPicker/CustomPicker';
import InputDefault from '../../../../../../newComponents/textInputComponents/DefaultFiat';
import PhoneCodePicker from '../../../../../commonScreens/phonePicker';
import { useLngTranslation } from '../../../../../../hooks/useLngTranslation';
import ButtonComponent from '../../../../../../newComponents/buttons/button';
import ScrollViewComponent from '../../../../../../newComponents/scrollView/scrollView';
import { TextInput } from 'react-native';
import ParagraphComponent from '../../../../../../newComponents/textComponets/paragraphText/paragraph';
import { KycLookupResponse, InviteMemberFormValues, GenderOption, UserInfo, InviteMemberPayload, ReduxState, StatusLookup } from '../../utils/interfaces';
import LabelComponent from '../../../../../../newComponents/textComponets/lableComponent/lable';
import { getInviteMemberSchema } from '../../utils';
import { showAppToast } from '../../../../../../newComponents/toasterMessages/ShowMessage';
import RadioButton from '../../../../../../newComponents/radiobutton/RadioButton';
import { logEvent } from '../../../../../../hooks/loggingHook';
import { FORM, UI, TOAST_TYPES_EXTENDED } from '../../constants';
import KeyboardAvoidingWrapper from '../../../../../commonScreens/keyBoardAvoidingView';
import useCountryData from '../../../../../../hooks/useCountryData';

const InviteMember: React.FC = () => {
  const ref = useRef<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const navigation = useNavigation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { t } = useLngTranslation();
  const { encryptAES } = useEncryptDecrypt();
  const userinfo = useSelector((state: ReduxState) => state.userReducer?.userDetails) as UserInfo;

  const [genderOptions, setGenderOptions] = useState<GenderOption[]>([]);
  const { countryPickerData, phoneCodePickerData, loading: countryLoading, error: countryError, clearCache } = useCountryData({
    loadCountries: true,
    loadPhoneCodes: true,
  });

  useEffect(() => {
    getKycLookupData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        backArrowButtonHandler();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription?.remove();
    }, [])
  );

  const getKycLookupData = async () => {
    try {
      const response = await TeamsService.getKycLookup() as KycLookupResponse;

      if (response?.ok) {
        const data = response.data;
        // Map gender data to match RadioButton component expectations
        const mappedGenders = (data?.Gender || []).map((gender: StatusLookup): GenderOption => ({
          label: gender.name || '',
          value: gender.name || '',
        }));
        
        setGenderOptions(mappedGenders);
      } else {
        setErrorMsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrorMsg(isErrorDispaly(error));
    }
  };

  const handleSubmit = async (values: InviteMemberFormValues) => {
    logEvent("Button Pressed", { action: "Invite Member Submit", currentScreen: "Invite Member", nextScreen: "Team Members" });
    setLoading(true);
    setErrorMsg('');
    try {
      const encryptedPayload: InviteMemberPayload = {
        firstName: values.firstName?.trim(),
        lastName: values.lastName?.trim(),
        email: encryptAES(values.email?.trim()),
        phoneCode: encryptAES(values.phoneCode),
        phoneNo: encryptAES(values.phoneNumber),
        membershipType: null,
        referrerId: userinfo?.id,
        status: UI.ACTIVE_STATUS,
        gender: values.gender,
        country: values.country,
        userName: encryptAES(values.userName?.trim()),
        memberId: values.memberId?.trim(),
      };
      const response = await TeamsService.inviteMember(encryptedPayload);
      if (response?.ok) {
        showAppToast(t('GLOBAL_CONSTANTS.MEMBER_INVITED_SUCCESSFULLY'), TOAST_TYPES_EXTENDED.SUCCESS as 'success');
        navigation.goBack();
      } else {
        setErrorMsg(isErrorDispaly(response));
        ref?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
      }
    } catch (error) {
      setErrorMsg(isErrorDispaly(error));
      ref?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
    } finally {
      setLoading(false);
    }
  };

  const backArrowButtonHandler = () => {
    logEvent("Button Pressed", { action: "Back Button", currentScreen: "Invite Member", nextScreen: "Previous Screen" });
    navigation.goBack();
  };

  const handleValidationSave = (validateForm: () => Promise<FormikErrors<InviteMemberFormValues>>, setTouched: (touched:any) => void, values: InviteMemberFormValues) => {
    validateForm().then(async (a: FormikErrors<InviteMemberFormValues>) => {
      if (Object.keys(a).length > 0) {
        const touchedFields = Object.keys(values).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {} as Record<string, boolean>);
        setTouched(touchedFields);
        ref?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
        setErrorMsg(t('GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD'));
      } else {
        setErrorMsg(UI.EMPTY_STRING);
      }
    })
  }

  const handlePhoneCode = (item: any, setFieldValue: (field: string, value: string) => void) => {
    Keyboard.dismiss();
    setFieldValue(FORM.FIELD_NAMES.PHONE_CODE, item?.code || UI.EMPTY_STRING);
  };

  const handleError = useCallback(() => {
    setErrorMsg(UI.EMPTY_STRING);
    if (countryError) {
      clearCache();
    }
  }, [countryError, clearCache]);

  const handlePickerOpen = () => {
    Keyboard.dismiss();
  };

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={commonStyles.container}>
        <PageHeader
          title="GLOBAL_CONSTANTS.INVITE_MEMBER"
          onBackPress={backArrowButtonHandler}
        />
        <Formik
          initialValues={{
            userName: UI.EMPTY_STRING,
            firstName: UI.EMPTY_STRING,
            lastName: UI.EMPTY_STRING,
            gender: UI.EMPTY_STRING,
            country: UI.EMPTY_STRING,
            phoneCode: UI.EMPTY_STRING,
            phoneNumber: UI.EMPTY_STRING,
            email: UI.EMPTY_STRING,
            memberId: UI.EMPTY_STRING,
          }}
          validationSchema={getInviteMemberSchema(t)}
          onSubmit={handleSubmit}
          validateOnChange={true}
          validateOnBlur={false}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, validateForm, setTouched }) => (
            <KeyboardAvoidingWrapper 

            >
              <ScrollViewComponent
                ref={ref}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <ViewComponent>
                  {(errorMsg !== UI.EMPTY_STRING || countryError) && (
                    <ErrorComponent message={errorMsg || countryError || ''} onClose={handleError} />
                  )}
                  <Field
                    touched={touched.memberId}
                    name={FORM.FIELD_NAMES.MEMBER_ID}
                    label={"GLOBAL_CONSTANTS.MEMBER_ID"}
                    error={errors.memberId}
                    handleBlur={handleBlur}
                    placeholder={"GLOBAL_CONSTANTS.MEMBER_ID_PLACEHOLDER"}
                    component={InputDefault}
                    editable={true}
                    maxLength={FORM.MAX_LENGTH.MEMBER_ID}
                    requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                  />
                  <ViewComponent style={[commonStyles.formItemSpace]} />
                  <Field
                    touched={touched.userName}
                    name={FORM.FIELD_NAMES.USERNAME}
                    label={"GLOBAL_CONSTANTS.USER_NAME"}
                    error={errors.userName}
                    handleBlur={handleBlur}
                    placeholder={"GLOBAL_CONSTANTS.ENTER_USER_NAME"}
                    component={InputDefault}
                    editable={true}
                    maxLength={FORM.MAX_LENGTH.USERNAME}
                    requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                  />
                  <ViewComponent style={[commonStyles.formItemSpace]} />

                  <Field
                    touched={touched.firstName}
                    name={FORM.FIELD_NAMES.FIRST_NAME}
                    label={"GLOBAL_CONSTANTS.FIRST_NAME"}
                    error={errors.firstName}
                    handleBlur={handleBlur}
                    placeholder={"GLOBAL_CONSTANTS.FIRST_NAME_PLACEHOLDER"}
                    component={InputDefault}
                    editable={true}
                    maxLength={FORM.MAX_LENGTH.FIRST_NAME}
                    requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                  />
                  <ViewComponent style={[commonStyles.formItemSpace]} />

                  <Field
                    touched={touched.lastName}
                    name={FORM.FIELD_NAMES.LAST_NAME}
                    label={"GLOBAL_CONSTANTS.LAST_NAME"}
                    error={errors.lastName}
                    handleBlur={handleBlur}
                    placeholder={"GLOBAL_CONSTANTS.LAST_NAME_PLACEHOLDER"}
                    component={InputDefault}
                    editable={true}
                    maxLength={FORM.MAX_LENGTH.LAST_NAME}
                    requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                  />
                  <ViewComponent style={[commonStyles.formItemSpace]} />

                  <LabelComponent text={"GLOBAL_CONSTANTS.GENDER"} style={[commonStyles.mb10]}>
                    <LabelComponent text={" *"} style={commonStyles.textError} />
                  </LabelComponent>
                  <RadioButton
                    options={genderOptions}
                    selectedOption={values?.gender}
                    onSelect={(val: string) => setFieldValue(FORM.FIELD_NAMES.GENDER, val)}
                    nameField='label' valueField='value'
                  />
                  {touched?.gender && errors?.gender && (<ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textError, { marginLeft: 0 }]} text={errors?.gender} />)}
                  <ViewComponent style={[commonStyles.formItemSpace]} />

                  <LabelComponent text={"GLOBAL_CONSTANTS.COUNTRY_OF_RECIDENCY"} style={[commonStyles.inputLabel]} >
                    <LabelComponent text={"*"} style={commonStyles.textError} />
                  </LabelComponent>
                  <Field
                    touched={touched.country}
                    name={FORM.FIELD_NAMES.COUNTRY}
                    error={errors.country}
                    handleBlur={handleBlur}
                    modalTitle={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                    data={countryPickerData || []}
                    placeholder={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                    component={CustomPickerAcc}
                    onChange={(item: string) => setFieldValue(FORM.FIELD_NAMES.COUNTRY, item)}
                    onPress={handlePickerOpen}
                  />
                  <ViewComponent style={[commonStyles.formItemSpace]} />

                  <LabelComponent text={"GLOBAL_CONSTANTS.PHONE_NUMBER"} style={[commonStyles.inputLabel]} >
                    <LabelComponent text={"*"} style={commonStyles.textError} />
                  </LabelComponent>
                  <ViewComponent style={[commonStyles.relative, commonStyles.dflex, commonStyles.pr2]}>
                    <PhoneCodePicker
                      inputStyle={{ borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderColor: touched?.phoneCode && errors?.phoneCode ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER }}
                      modalTitle={"GLOBAL_CONSTANTS.SELECT_COUNTRY_CODE"}
                      customBind={["name", "(", "code", ")"]}
                      data={phoneCodePickerData || []}
                      value={values?.phoneCode}
                      placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_SELECT")}
                      onChange={(item: any) => handlePhoneCode(item, setFieldValue)}
                    />
                    <TextInput
                      style={[commonStyles.flex1, commonStyles.textInput, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderColor: touched?.phoneNumber && errors?.phoneNumber ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER }]}
                      placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_PLACEHOLDER")}
                      onChangeText={(text) => {
                        const formattedText = text.replace(/\D/g, UI.EMPTY_STRING).slice(0, FORM.MAX_LENGTH.PHONE_NUMBER);
                        handleChange(FORM.FIELD_NAMES.PHONE_NUMBER)(formattedText);
                      }}
                      onBlur={handleBlur(FORM.FIELD_NAMES.PHONE_NUMBER)}
                      value={values.phoneNumber}
                      keyboardType="phone-pad"
                      placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                    />
                  </ViewComponent>
                  {(touched.phoneCode || touched.phoneNumber) && (errors.phoneNumber || errors.phoneCode) && (
                    <ParagraphComponent multiLanguageAllows={true} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textError, commonStyles.mt4]} text={errors.phoneNumber || errors.phoneCode} />
                  )}
                  <ViewComponent style={[commonStyles.formItemSpace]} />

                  <Field
                    touched={touched.email}
                    name={FORM.FIELD_NAMES.EMAIL}
                    label={"GLOBAL_CONSTANTS.EMAIL"}
                    error={errors.email}
                    handleBlur={handleBlur}
                    placeholder={"GLOBAL_CONSTANTS.EMAIL_PLACEHOLDER"}
                    component={InputDefault}
                    maxLength={FORM.MAX_LENGTH.EMAIL}
                    requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                  />
                  <ViewComponent style={[commonStyles.sectionGap]} />

                  <ButtonComponent
                    multiLanguageAllows={true}
                    title="GLOBAL_CONSTANTS.INVITE_MEMBER"
                    onPress={() => {
                      handleValidationSave(validateForm, setTouched, values);
                      handleSubmit();
                    }}
                    loading={loading}
                  />

                  <ViewComponent style={[commonStyles.buttongap]} />
                  <ButtonComponent
                    multiLanguageAllows={true}
                    title="GLOBAL_CONSTANTS.CANCEL"
                    onPress={() => {
                      logEvent("Button Pressed", { action: "Cancel Button", currentScreen: "Invite Member", nextScreen: "Previous Screen" });
                      backArrowButtonHandler();
                    }}
                    solidBackground={true}
                  />

                  <ViewComponent style={[commonStyles.sectionGap]} />
                </ViewComponent>
              </ScrollViewComponent>
            </KeyboardAvoidingWrapper>
          )}
        </Formik>
      </Container>
    </ViewComponent>
  );
};

export default InviteMember;
