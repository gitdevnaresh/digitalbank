import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Switch,
  TextInput,
} from "react-native";
import { useSelector } from "react-redux";
import { isErrorDispaly } from "../../../../utils/helpers";
import CardsModuleService from "../../../../apiServices/card";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";
import { Field, Formik, FormikErrors } from "formik";
import CustomPickerAcc from '../../../../newComponents/customPicker/CustomPicker';
import InputDefault from '../../../../newComponents/textInputComponents/DefaultFiat';
import Container from "../../../../newComponents/container/container";
import PhoneCodePicker from "../../../commonScreens/phonePicker";
import CreateAccountService from "../../../../apiServices/createAccount";
import ProfileService from "../../../../apiServices/profile";
import ProgressHeader from "../../../../newComponents/progressCircle/progressHeader";
import { useLngTranslation } from "../../../../hooks/useLngTranslation";
import ViewComponent from "../../../../newComponents/view/view";
import { 
    CountryPickerItem, 
    PhoneCodeItem, 
    TownsList, 
    BankAddressTypeItem, 
    BankAddressLuResponse, 
    AddressLookupDetailsResponse, 
    AddressFormValues, 
    AddPersonalInfoRouteParams, 
    ReduxState 
} from "./interface";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import { CreateAccSchema } from "./schema";
import useEncryptDecrypt from "../../../../hooks/encDecHook";
import ButtonComponent from "../../../../newComponents/buttons/button";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import DashboardLoader from "../../../../components/loader";
import { NavigationProp, ParamListBase, RouteProp, useIsFocused, useNavigation } from "@react-navigation/native";
import { showAppToast } from "../../../../newComponents/toasterMessages/ShowMessage";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import LabelComponent from "../../../../newComponents/textComponets/lableComponent/lable";

type AddPersonalInfoRouteProp = RouteProp<ParamListBase, 'AddPersonalInfo'> & {
  params?: AddPersonalInfoRouteParams;
};

interface AddPersonalInfoProps {
  navigation: NavigationProp<ParamListBase>;
  route: AddPersonalInfoRouteProp;
}

const BankAddPersonalInfo = (props: any) => {
  const ref = useRef<KeyboardAwareScrollView>(null);
  const navigation = useNavigation();
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isTradingAddress, setIsTradingAddress] = useState<boolean>(false);
  const [errormsg, setErrormsg] = useState<string>("");
  const { encryptAES, decryptAES } = useEncryptDecrypt();
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [countries, setCountries] = useState<CountryPickerItem[]>([]);
  const [countryCodelist, setCountryCodelist] = useState<PhoneCodeItem[]>([]);
  const [townsList, setTownsList] = useState<TownsList[]>([]);
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const userInfo = useSelector((state: ReduxState) => state.userReducer?.userDetails);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const toggleTradingSwitch = () => setIsTradingAddress((previousState) => !previousState);
  const isFocused = useIsFocused()
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const [bankAddressLuData, setBankAddressLuData] = useState<BankAddressLuResponse | null>(null);
  const [addressTypeOptions, setAddressTypeOptions] = useState<BankAddressTypeItem[]>([]);

  const [initValues, setInitValues] = useState<AddressFormValues>({
    firstName: (props?.route?.params?.KycInformation ? props.route.params.kycInfoData?.firstName : undefined) ?? "",
    lastName: (props?.route?.params?.KycInformation ? props.route.params.kycInfoData?.lastName : undefined) ?? "",
    country: (props?.route?.params?.KycInformation || props?.route?.params?.KybInformation ? userInfo?.country : undefined) ?? "",
    state: "",
    city: "",
    phoneNumber: (props?.route?.params?.KycInformation || props?.route?.params?.KybInformation ? userInfo?.phoneNo : undefined) ?? "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    email: (props?.route?.params?.KycInformation || props?.route?.params?.KybInformation ? (decryptAES(userInfo?.email) ?? undefined) : undefined) ?? "",
    phoneCode: (props?.route?.params?.KycInformation || props?.route?.params?.KybInformation ? userInfo?.phonecode : undefined) ?? "",
    town: "",
    addressType: "",
    isDefault: true,
    favoriteName: "",
  });

  useEffect(() => {
    getAddressLookup();
    fetchBankAddressTypes();
    if (!props?.route?.params?.screenName && (props?.route?.params?.id || props?.route?.params?.isKycEdit || props?.route?.params?.isKybEdit)) {
      getDatailsForUpdateTheRecords();
    }
    if (props?.route?.params?.screenName && props?.route?.params?.id) {
      setEditLoading(true);
      const initialVal = {
        firstName: props?.route?.params?.addressDetails?.firstName ?? "",
        lastName: props?.route?.params?.addressDetails?.lastName ?? "",
        country: props?.route?.params?.addressDetails?.country ?? "",
        state: props?.route?.params?.addressDetails?.state ?? "",
        city: props?.route?.params?.addressDetails?.city ?? "",
        phoneNumber: props?.route?.params?.addressDetails?.phoneNumber ?? "",
        phoneCode: props?.route?.params?.addressDetails?.phoneCode ?? "",
        addressLine1: props?.route?.params?.addressDetails?.addressLine1 ?? "",
        addressLine2: props?.route?.params?.addressDetails?.addressLine2 ?? "",
        postalCode: props?.route?.params?.addressDetails?.postalCode ?? "",
        town: props?.route?.params?.addressDetails?.town ?? "",
        email: props?.route?.params?.addressDetails?.email ?? "",
        addressType: props?.route?.params?.addressDetails?.addressType ?? "",
        isDefault: props?.route?.params?.addressDetails?.isDefault ?? false,
        favoriteName: props?.route?.params?.addressDetails?.favoriteName ?? "",
      };
      setInitValues(initialVal);
      setIsEnabled(props?.route?.params?.addressDetails?.isDefault ?? false);
      setIsTradingAddress(props?.route?.params?.addressDetails?.isTradingAddress ?? false);
      setEditLoading(false);
    }
  }, [isFocused, props?.route?.params?.cardId]);

  useEffect(() => {
    if (bankAddressLuData && userInfo?.accountType) {
      if (userInfo.accountType === "Personal") {
        setAddressTypeOptions(bankAddressLuData.KYC || []);
      } else {
        setAddressTypeOptions(bankAddressLuData.KYB || []);
      }
    }
  }, [bankAddressLuData, userInfo]);

  const fetchBankAddressTypes = async () => {
    const response = await CreateAccountService.getBanksAddressLu();
    if (response.ok && response.data) {
      setBankAddressLuData(response.data as BankAddressLuResponse);
    } else {
      console.error("Failed to fetch bank address types:", isErrorDispaly(response));
    }
  };

  const getAddressLookup = async () => {
    setErrormsg("");
    const response = await CreateAccountService.getAddressLookUpDetails();

    if (response.ok && response.data) {
      const data = response.data as AddressLookupDetailsResponse;
      setCountries(data.countryWithTowns);
      setCountryCodelist(data.PhoneCodes);
      setErrormsg("");
    } else {
      ref?.current?.scrollToPosition(0, 0, true);
      setErrormsg(isErrorDispaly(response));
    }
  };

  const getDatailsForUpdateTheRecords = async () => {
    setEditLoading(true);
    setErrormsg("");
    const addressId = props?.route?.params?.id;
    try {
      let response: any;
      if (props?.route?.params?.isKycEdit) {
        response = await ProfileService.identityPersionalDetails();
      } else if (props?.route?.params?.isKybEdit) {
        response = await ProfileService.KybCompanyDetails();
      } else {
        response = await CardsModuleService?.getAddressDetails(addressId);
      }

      if (response?.ok && response.data) {
        const responseData = response.data;
        const initialVal = {
          firstName: responseData?.firstname ?? responseData?.addressDetails?.firstName ?? "",
          lastName: (responseData?.lastname ?? responseData?.addressDetails?.lastName) ?? "",
          country: responseData?.country ?? responseData?.addressDetails?.country ?? "",
          state: responseData?.state ?? responseData?.addressDetails?.state ?? "",
          city: responseData?.city ?? responseData?.addressDetails?.city ?? "",
          phoneNumber: decryptAES(responseData?.phoneNumber ?? responseData?.addressDetails?.phoneNumber ?? ""),
          phoneCode: decryptAES(responseData?.phoneCode ?? responseData?.addressDetails?.phoneCode ?? ""),
          addressLine1: responseData?.addressLine1 ?? responseData?.addressDetails?.addressLine1 ?? "",
          addressLine2: responseData?.addressLine2 ?? responseData?.addressDetails?.addressLine2 ?? "",
          postalCode: decryptAES(responseData?.postalCode ?? responseData?.addressDetails?.postalCode ?? ""),
          town: responseData?.town ?? responseData?.addressDetails?.town ?? "",
          email: decryptAES(responseData?.email ?? responseData?.addressDetails?.email ?? ""),
          addressType: responseData?.addressType ?? responseData?.addressDetails?.addressType ?? "",
          isDefault: responseData?.isDefault ?? false,
          favoriteName: responseData?.favoriteName ?? responseData?.addressDetails?.favoriteName ?? "",
        };
        setInitValues(initialVal);
        setIsEnabled(responseData?.isDefault ?? false);
        setIsTradingAddress(responseData?.isTradingAddress ?? false);
        setErrormsg("");
        setEditLoading(false);
      } else if (response && !response.ok) {
        setErrormsg(isErrorDispaly(response));
        setEditLoading(false);
        ref?.current?.scrollToPosition(0, 0, true);
      } else {
        setErrormsg("Failed to fetch details or no data returned.");
        setEditLoading(false);
        ref?.current?.scrollToPosition(0, 0, true);
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
      setEditLoading(false);
    }
  };

  const handleSave = async (values: AddressFormValues) => {
    setBtnLoading(true);
    setErrormsg('');

    const addressPayload = {
      id: props?.route?.params?.cardId,
      customerId: userInfo?.id,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      country: values.country,
      state: values.state.trim(),
      city: values.city.trim(),
      addressLine1: values.addressLine1.trim(),
      addressLine2: values.addressLine2.trim(),
      postalCode: encryptAES(values.postalCode),
      phoneNumber: encryptAES(values.phoneNumber),
      phoneCode: encryptAES(values.phoneCode),
      email: encryptAES(values.email),
      isDefault: isEnabled,
      createdBy: userInfo.userName,
      town: values.town,
      addressType: values.addressType,
      createdDate: new Date(),
      ...(userInfo?.accountType !== "Personal" && { isTradingAddress: isTradingAddress })
    };

    try {
      const res = await CardsModuleService.cardsAddressPost(addressPayload);

      if (res?.ok) {
        showAppToast(t("GLOBAL_CONSTANTS.YOUR_ADDRESS_HAS_BEEN_ADDED"), 'success');
        navigation.goBack();
      } else {
        const errorMessage = isErrorDispaly(res);
        setErrormsg(errorMessage);
        ref?.current?.scrollToPosition(0, 0, true);
      }
    } catch (error) {
      const errorMessage = isErrorDispaly(error);
      setErrormsg(errorMessage);
      ref?.current?.scrollToPosition(0, 0, true);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleUpdate = async (values: AddressFormValues) => {
    setBtnLoading(true);

    const updateObj = {
      "id": props?.route?.params?.id,
      "firstName": values.firstName.trim(),
      "lastName": values.lastName.trim(),
      "fullName": values.firstName.trim() + " " + values.lastName.trim(),
      "email": encryptAES(values.email),
      "country": values.country,
      "state": values.state.trim(),
      "phoneNumber": encryptAES(values.phoneNumber),
      "phoneCode": encryptAES(values.phoneCode),
      "isDefault": isEnabled,
      "addressLine1": values.addressLine1.trim(),
      "addressLine2": values.addressLine2.trim(),
      "city": values.city.trim(),
      "postalCode": encryptAES(values.postalCode),
      "createdBy": userInfo.userName,
      "modifiedBy": userInfo.userName,
      "createdDate": new Date(),
      "town": values?.town,
      "addressType": values.addressType,
      "modifiedDate": new Date(),
      ...(userInfo?.accountType !== "Personal" && { "isTradingAddress": isTradingAddress }),
      "metadata": null
    }
    try {
      const res = await CardsModuleService.cardsAddressPut(updateObj);
      if (res.ok) {
        showAppToast(t("GLOBAL_CONSTANTS.YOUR_ADDRESS_HAS_BEEN_UPDATED"), 'success');
        props.navigation.goBack();
      } else {
        ref?.current?.scrollToPosition(0, 0, true);
        setErrormsg(isErrorDispaly(res));
      }
    } catch (error) {
      ref?.current?.scrollToPosition(0, 0, true);
      setErrormsg(isErrorDispaly(error));
    } finally {
      setBtnLoading(false);
    }
  };

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, []);

  const handleValidationSave = (validateForm: () => Promise<FormikErrors<AddressFormValues>>) => {
    validateForm().then(async (a: FormikErrors<AddressFormValues>) => {
      if (Object.keys(a).length > 0) {
        ref?.current?.scrollToPosition(0, 0, true);
        setErrormsg(t('GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD'));
      }
    })
  }

  const handleCloseError = useCallback(() => {
    setErrormsg("")
  }, []);

  const handleCountryChange = (country: string, setFieldValue: (field: string, value: string, shouldValidate?: boolean) => Promise<void | FormikErrors<AddressFormValues>>) => {
    setFieldValue('country', country)
    setFieldValue("town", "");
    const selectedCountry = countries?.find(c => c.name === country);
    setTownsList(selectedCountry?.details ?? []);
  };

  const handlePhoneCode = (item: PhoneCodeItem, setFieldValue: (field: string, value: string, shouldValidate?: boolean) => Promise<void | FormikErrors<AddressFormValues>>) => {
    setFieldValue("phoneCode", item?.code)
  }

  const { t } = useLngTranslation();

  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      {editLoading && (
        <ViewComponent style={[commonStyles.flex1]}>
          <DashboardLoader />
        </ViewComponent>
      )}
      <KeyboardAwareScrollView
        contentContainerStyle={[{ flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ref={ref}
      >
        {!editLoading && <Container style={commonStyles.container}>
          {((!props?.route?.params?.id && !props?.route?.params?.isKybEdit) && !props?.route?.params?.isKycEdit) && <PageHeader title={props?.route?.params?.KycInformation && "GLOBAL_CONSTANTS.KYC" || props?.route?.params?.KybInformation && "GLOBAL_CONSTANTS.KYB_INFORMATION" || "GLOBAL_CONSTANTS.ADD_ADDRESS"} onBackPress={handleGoBack} />}
          {((props?.route?.params?.id || props?.route?.params?.isKybEdit) || props?.route?.params?.isKycEdit) && <PageHeader title={props?.route?.params?.KycInformation && "GLOBAL_CONSTANTS.EDIT_KYC" || props?.route?.params?.KybInformation && "GLOBAL_CONSTANTS.EDIT_KYB_INFORMATION" || "GLOBAL_CONSTANTS.EDIT_ADDRESS"} onBackPress={handleGoBack} />}

          {!editLoading && (
            <>
              {errormsg !== "" && (<ErrorComponent message={errormsg} onClose={handleCloseError} />)}
              {props?.route?.params?.KycInformation && <ViewComponent>
                <ViewComponent >
                  <ProgressHeader title={"GLOBAL_CONSTANTS.PERSONAL_ADDRESS"} NextTitle={"GLOBAL_CONSTANTS.IDENTIFICATION_DOCUMNETS"} progress={2} total={4} />
                </ViewComponent>
              </ViewComponent>}
              {props?.route?.params?.KybInformation &&
                <ViewComponent >
                  <ProgressHeader title={"GLOBAL_CONSTANTS.PERSONAL_ADDRESS"} NextTitle={"GLOBAL_CONSTANTS.UBO_DETAILS_TITLE"} progress={2} total={5} />
                </ViewComponent>
              }
              <ViewComponent>
                <Formik
                  initialValues={initValues}
                  onSubmit={props?.route?.params?.id ? handleUpdate : handleSave}
                  validationSchema={CreateAccSchema}
                  enableReinitialize
                  validateOnChange={true}
                  validateOnBlur={true}
                >
                  {(formik) => {
                    const {
                      touched,
                      handleSubmit,
                      errors,
                      handleChange,
                      handleBlur,
                      values,
                      setFieldValue,
                      validateForm
                    } = formik;
                    return (
                      <ViewComponent>
                        <>
                          <Field
                            touched={touched.firstName}
                            name="firstName"
                            label={"GLOBAL_CONSTANTS.FIRST_NAME"}
                            error={errors.firstName}
                            handleBlur={handleBlur}
                            placeholder={"GLOBAL_CONSTANTS.FIRST_NAME_PLACEHOLDER"}
                            component={InputDefault}
                            editable={true}
                            requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                          />
                          <ViewComponent style={[commonStyles.formItemSpace]} />
                          <Field
                            touched={touched.lastName}
                            name="lastName"
                            label={"GLOBAL_CONSTANTS.LAST_NAME"}
                            error={errors.lastName}
                            handleBlur={handleBlur}
                            placeholder={"GLOBAL_CONSTANTS.LAST_NAME_PLACEHOLDER"}
                            component={InputDefault}
                            editable={true}
                            requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                          />
                          <ViewComponent style={[commonStyles.formItemSpace]} />
                          <Field
                            touched={touched.email}
                            name="email"
                            label={"GLOBAL_CONSTANTS.EMAIL"}
                            error={errors.email}
                            handleBlur={handleBlur}
                            placeholder={"GLOBAL_CONSTANTS.EMAIL_PLACEHOLDER"}
                            component={InputDefault}
                            requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                          />
                          <ViewComponent style={[commonStyles.formItemSpace]} />
                          <LabelComponent text={"GLOBAL_CONSTANTS.COUNTRY"} style={[commonStyles.inputLabel]} >
                            <LabelComponent text={"*"} style={commonStyles.textError} />
                          </LabelComponent>

                          <Field
                            touched={touched?.country}
                            name="country"
                            error={errors?.country}
                            handleBlur={handleBlur}
                            modalTitle={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                            data={countries}
                            placeholder={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                            component={CustomPickerAcc}
                            onChange={(item: string) => handleCountryChange(item, setFieldValue)}
                          />
                          <ViewComponent style={[commonStyles.formItemSpace]} />
                          <Field
                            touched={touched.state}
                            name="state"
                            label={"GLOBAL_CONSTANTS.STATE"}
                            error={errors.state}
                            handleBlur={handleBlur}
                            placeholder={"GLOBAL_CONSTANTS.STATE_PLACEHOLDER"}
                            component={InputDefault}
                            requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                          />
                          <ViewComponent style={[commonStyles.formItemSpace]} />
                          <LabelComponent text={"GLOBAL_CONSTANTS.TOWN"} style={[commonStyles.inputLabel]} >
                            <LabelComponent text={"*"} style={commonStyles.textError} />
                          </LabelComponent>

                          <Field
                            touched={touched?.town}
                            name="town"
                            error={errors?.town}
                            handleBlur={handleBlur}
                            modalTitle={"GLOBAL_CONSTANTS.SELECT_TOWN"}
                            data={townsList}
                            placeholder={"GLOBAL_CONSTANTS.SELECT_TOWN"}
                            component={CustomPickerAcc}
                            onChange={(item: string) => setFieldValue("town", item)}
                          />
                          <ViewComponent style={[commonStyles.formItemSpace]} />
                          <Field
                            touched={touched.city}
                            name="city"
                            label={"GLOBAL_CONSTANTS.CITY"}
                            error={errors.city}
                            handleBlur={handleBlur}
                            placeholder={"GLOBAL_CONSTANTS.CITY_PLACEHOLDER"}
                            component={InputDefault}
                            requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                          />
                          <ViewComponent style={[commonStyles.formItemSpace]} />
                          <Field
                            touched={touched.addressLine1}
                            name="addressLine1"
                            label={"GLOBAL_CONSTANTS.ADDRESS_LINE1"}
                            error={errors.addressLine1}
                            handleBlur={handleBlur}
                            placeholder={"GLOBAL_CONSTANTS.ADDRESS_LINE1_PLACEHOLDER"}
                            component={InputDefault}
                            requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                          />
                          <ViewComponent style={[commonStyles.formItemSpace]} />
                          <Field
                            touched={touched.addressLine2}
                            name="addressLine2"
                            label={"GLOBAL_CONSTANTS.ADDRESS_LINE2"}
                            error={errors.addressLine2}
                            handleBlur={handleBlur}
                            placeholder={"GLOBAL_CONSTANTS.ADDRESS_LINE2_PLACEHOLDER"}
                            component={InputDefault}
                          />
                          <ViewComponent style={[commonStyles.formItemSpace]} />
                          <Field
                            touched={touched.postalCode}
                            name="postalCode"
                            label={"GLOBAL_CONSTANTS.POSTAL_CODE"}
                            error={errors.postalCode}
                            handleBlur={handleBlur}
                            placeholder={"GLOBAL_CONSTANTS.POSTAL_CODE_PLACEHOLDER"}
                            component={InputDefault}
                            requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
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
                              data={countryCodelist}
                              value={values?.phoneCode}
                              placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_SELECT")}
                              onChange={(index: number) => handlePhoneCode(countryCodelist[index], setFieldValue)}
                            />
                            <TextInput
                              style={[commonStyles.flex1, commonStyles.textInput, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderColor: touched?.phoneNumber && errors?.phoneNumber ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER }]}
                              placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_PLACEHOLDER")}
                              onChangeText={(text) => {
                                const formattedText = text.replace(/\D/g, "").slice(0, 13);
                                handleChange('phoneNumber')(formattedText);
                              }}
                              onBlur={handleBlur("phoneNumber")}
                              value={values.phoneNumber}
                              keyboardType="phone-pad"
                              placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                            />
                          </ViewComponent>
                          {(touched.phoneCode || touched.phoneNumber) && (errors.phoneNumber || errors.phoneCode) && (
                            <ParagraphComponent multiLanguageAllows={true} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textError, commonStyles.mt4]} text={errors.phoneNumber || errors.phoneCode} />
                          )}

                          <ViewComponent style={[commonStyles.formItemSpace]} />
                          <LabelComponent text={"GLOBAL_CONSTANTS.ADDRESS_TYPE"} style={[commonStyles.inputLabel]} >
                            <LabelComponent text={"*"} style={commonStyles.textError} />
                          </LabelComponent>
                          <Field
                            touched={touched.addressType}
                            name="addressType"
                            error={errors.addressType}
                            handleBlur={handleBlur}
                            modalTitle={t("GLOBAL_CONSTANTS.SELECT_ADDRESS_TYPE")}
                            data={addressTypeOptions}
                            placeholder={t("GLOBAL_CONSTANTS.SELECT_ADDRESS_TYPE")}
                            component={CustomPickerAcc}
                            value={values.addressType}
                            onChange={(item: string) => setFieldValue("addressType", item)}
                          />

                          {!(props?.route?.params?.KycInformation || props?.route?.params?.KybInformation) && (
                            <>
                              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justify, commonStyles.gap10, commonStyles.mt10]}>
                                <ParagraphComponent text={"GLOBAL_CONSTANTS.SET_AS_DEFAULT"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} multiLanguageAllows={true} />
                                <Switch
                                  trackColor={{ false: NEW_COLOR.TEXT_GREY, true: NEW_COLOR.TEXT_PRIMARY }}
                                  thumbColor={NEW_COLOR.WHITE}
                                  onValueChange={toggleSwitch}
                                  value={isEnabled}
                                />
                              </ViewComponent>

                              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justify, commonStyles.gap10, commonStyles.mt10]}>
                                <ParagraphComponent text={"GLOBAL_CONSTANTS.TRADING_ADDRESS"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} multiLanguageAllows={true} />
                                <Switch
                                  trackColor={{ false: NEW_COLOR.TEXT_GREY, true: NEW_COLOR.TEXT_PRIMARY }}
                                  thumbColor={NEW_COLOR.WHITE}
                                  onValueChange={toggleTradingSwitch}
                                  value={isTradingAddress}
                                />
                              </ViewComponent>
                            </>
                          )}
                        </>
                        <ViewComponent style={[commonStyles.sectionGap]} />
                        <ButtonComponent
                          title="GLOBAL_CONSTANTS.SAVE"
                          loading={btnLoading}
                          onPress={() => {
                            handleValidationSave(validateForm);
                            handleSubmit();
                          }}
                        />
                        <ViewComponent style={[commonStyles.sectionGap]} />
                      </ViewComponent>
                    );
                  }}
                </Formik>
              </ViewComponent>
            </>
          )}
        </Container>}
      </KeyboardAwareScrollView>
    </ViewComponent>
  );
};

export default BankAddPersonalInfo;
